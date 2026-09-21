import {
    ChunkConfig,
    TextChunk,
    ChunkResult,
    ChunkWarning,
} from '../models/types';
import {
    countWords,
    estimateTokenCount,
    countEmptyLines,
    countLines
} from '../utils/textUtils';

export function validateChunkConfig(config: ChunkConfig): ChunkWarning[] {
    const warnings: ChunkWarning[] = [];

    if (config.chunkSize <= 0) {
        warnings.push({ severity: 'error', message: 'Chunk size must be greater than 0.' });
    }
    if (config.overlap < 0) {
        warnings.push({ severity: 'error', message: 'Overlap cannot be negative.' });
    }
    if (config.overlap >= config.chunkSize) {
        warnings.push({ severity: 'error', message: 'Overlap must be less than chunk size.' });
    }
    if (config.chunkSize > 0 && config.chunkSize < 10) {
        warnings.push({ severity: 'warning', message: 'Very small chunk size may produce poor results.' });
    }
    if (config.chunkSize > 5000) {
        warnings.push({ severity: 'warning', message: 'Very large chunk size may reduce retrieval quality.' });
    }
    if (config.strategy === 'parent_document') {
        const parentSize = config.parentChunkSize || 1200;
        if (parentSize <= config.chunkSize) {
            warnings.push({ severity: 'error', message: 'Parent chunk size must be greater than child chunk size.' });
        }
    }

    return warnings;
}

/**
 * Standard hierarchical boundary-aware chunking (Paragraphs -> Sentences -> Words).
 */
export function chunkText(text: string, config: ChunkConfig): TextChunk[] {
    if (!text || config.chunkSize <= 0 || config.overlap >= config.chunkSize) {
        return [];
    }

    const chunks: TextChunk[] = [];
    const paragraphs = text.split(/\n\s*\n/);
    let currentChunkText = '';
    let currentStartIndex = 0;

    for (let i = 0; i < paragraphs.length; i++) {
        let paragraph = paragraphs[i];
        if (i < paragraphs.length - 1) {
            paragraph += '\n\n';
        }

        if (currentChunkText.length + paragraph.length <= config.chunkSize) {
            currentChunkText += paragraph;
        } else {
            // Paragraph alone might be larger than chunk size
            if (paragraph.length > config.chunkSize) {
                // Split by sentences
                const sentences = paragraph.split(/(?<=[.!?])(?=\s+|\n)/);
                for (const sentence of sentences) {
                    if (currentChunkText.length + sentence.length <= config.chunkSize) {
                        currentChunkText += sentence;
                    } else {
                        if (currentChunkText) {
                            addChunk(chunks, currentChunkText, currentStartIndex, { strategy: 'boundary' });
                            currentStartIndex += currentChunkText.length - getOverlapLength(currentChunkText, config.overlap);
                            currentChunkText = currentChunkText.substring(currentChunkText.length - getOverlapLength(currentChunkText, config.overlap));
                        }
                        
                        // If sentence itself is too large, split by words
                        if (sentence.length > config.chunkSize) {
                            const words = sentence.split(/(\s+)/);
                            for (const word of words) {
                                if (currentChunkText.length + word.length <= config.chunkSize) {
                                    currentChunkText += word;
                                } else {
                                    if (currentChunkText) {
                                        addChunk(chunks, currentChunkText, currentStartIndex, { strategy: 'boundary' });
                                        currentStartIndex += currentChunkText.length - getOverlapLength(currentChunkText, config.overlap);
                                        currentChunkText = currentChunkText.substring(currentChunkText.length - getOverlapLength(currentChunkText, config.overlap));
                                    }
                                    currentChunkText += word;
                                }
                            }
                        } else {
                            currentChunkText += sentence;
                        }
                    }
                }
            } else {
                if (currentChunkText) {
                    addChunk(chunks, currentChunkText, currentStartIndex, { strategy: 'boundary' });
                    currentStartIndex += currentChunkText.length - getOverlapLength(currentChunkText, config.overlap);
                    currentChunkText = currentChunkText.substring(currentChunkText.length - getOverlapLength(currentChunkText, config.overlap));
                }
                currentChunkText += paragraph;
            }
        }
    }

    if (currentChunkText.trim()) {
        addChunk(chunks, currentChunkText, currentStartIndex, { strategy: 'boundary' });
    }

    return chunks;
}

/**
 * Structural & Markdown AST-aware chunking.
 * Preserves tables and code blocks as unbroken atomic units and attaches header breadcrumbs.
 */
export function chunkMarkdown(text: string, config: ChunkConfig): TextChunk[] {
    if (!text || config.chunkSize <= 0 || config.overlap >= config.chunkSize) {
        return [];
    }

    const lines = text.split('\n');
    const chunks: TextChunk[] = [];
    const headingStack: string[] = [];
    
    let currentBuffer: string[] = [];
    let currentBufferStart = 0;
    let inCodeFence = false;
    let codeFenceLines: string[] = [];
    let inTable = false;
    let tableLines: string[] = [];

    const getBreadcrumb = () => headingStack.length > 0 ? headingStack.join(' > ') : 'Document Root';

    const flushBuffer = (endOffsetHint?: number) => {
        if (currentBuffer.length === 0) return;
        const bufferText = currentBuffer.join('\n');
        if (bufferText.trim().length > 0) {
            // Partition buffer text using boundary-aware chunking under this breadcrumb
            const subChunks = chunkText(bufferText, config);
            for (const sc of subChunks) {
                addChunk(chunks, sc.content, currentBufferStart + sc.startOffset, {
                    strategy: 'markdown',
                    breadcrumb: getBreadcrumb(),
                    isAtomic: false,
                    atomicType: 'none',
                });
            }
        }
        currentBuffer = [];
    };

    let charOffset = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineStartOffset = charOffset;
        charOffset += line.length + 1; // +1 for \n

        // Handle fenced code blocks
        if (line.trim().startsWith('```') || line.trim().startsWith('~~~')) {
            if (!inCodeFence) {
                // Code fence begins: flush previous buffer
                flushBuffer();
                inCodeFence = true;
                codeFenceLines = [line];
                currentBufferStart = lineStartOffset;
                continue;
            } else {
                // Code fence ends: capture as atomic code unit
                codeFenceLines.push(line);
                const codeBlock = codeFenceLines.join('\n');
                addChunk(chunks, codeBlock, currentBufferStart, {
                    strategy: 'markdown',
                    breadcrumb: getBreadcrumb(),
                    isAtomic: true,
                    atomicType: 'code',
                });
                inCodeFence = false;
                codeFenceLines = [];
                currentBufferStart = charOffset;
                continue;
            }
        }

        if (inCodeFence) {
            codeFenceLines.push(line);
            continue;
        }

        // Handle markdown tables
        const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|');
        if (isTableRow) {
            if (!inTable) {
                flushBuffer();
                inTable = true;
                tableLines = [line];
                currentBufferStart = lineStartOffset;
                continue;
            } else {
                tableLines.push(line);
                continue;
            }
        } else if (inTable) {
            // Table just ended: save as atomic table unit
            const tableBlock = tableLines.join('\n');
            addChunk(chunks, tableBlock, currentBufferStart, {
                strategy: 'markdown',
                breadcrumb: getBreadcrumb(),
                isAtomic: true,
                atomicType: 'table',
            });
            inTable = false;
            tableLines = [];
            currentBufferStart = lineStartOffset;
        }

        // Handle headings (# Title, ## Section)
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            flushBuffer();
            const level = headingMatch[1].length;
            const headingText = headingMatch[2].trim();
            headingStack.splice(level - 1);
            headingStack[level - 1] = headingText;
            currentBuffer = [line];
            currentBufferStart = lineStartOffset;
            continue;
        }

        // Regular line
        if (currentBuffer.length === 0) {
            currentBufferStart = lineStartOffset;
        }
        currentBuffer.push(line);
    }

    // Flush any pending trailing table or buffer
    if (inTable && tableLines.length > 0) {
        addChunk(chunks, tableLines.join('\n'), currentBufferStart, {
            strategy: 'markdown',
            breadcrumb: getBreadcrumb(),
            isAtomic: true,
            atomicType: 'table',
        });
    } else if (inCodeFence && codeFenceLines.length > 0) {
        addChunk(chunks, codeFenceLines.join('\n'), currentBufferStart, {
            strategy: 'markdown',
            breadcrumb: getBreadcrumb(),
            isAtomic: true,
            atomicType: 'code',
        });
    } else {
        flushBuffer();
    }

    return chunks;
}

/**
 * Parent-Document (Small-to-Big) chunking.
 * Produces small child chunks for vector search mapped to large parent chunks for LLM context.
 */
export function chunkParentDocument(
    text: string, 
    config: ChunkConfig
): { chunks: TextChunk[]; parentChunks: TextChunk[] } {
    if (!text || config.chunkSize <= 0 || config.overlap >= config.chunkSize) {
        return { chunks: [], parentChunks: [] };
    }

    const parentSize = config.parentChunkSize || 1200;
    const parentOverlap = Math.min(100, Math.floor(parentSize * 0.1));

    // Generate large Parent context chunks
    const parentChunks = chunkText(text, {
        chunkSize: parentSize,
        overlap: parentOverlap,
        strategy: 'parent_document',
    });

    const childChunks: TextChunk[] = [];

    // For each parent chunk, generate focused child search chunks
    for (let p = 0; p < parentChunks.length; p++) {
        const parent = parentChunks[p];
        const subChunks = chunkText(parent.content, {
            chunkSize: config.chunkSize,
            overlap: config.overlap,
            strategy: 'parent_document',
        });

        for (const child of subChunks) {
            const globalIndex = childChunks.length;
            childChunks.push({
                index: globalIndex,
                content: child.content,
                characterCount: child.characterCount,
                wordCount: child.wordCount,
                estimatedTokenCount: child.estimatedTokenCount,
                startOffset: parent.startOffset + child.startOffset,
                endOffset: parent.startOffset + child.endOffset,
                strategy: 'parent_document',
                parentId: parent.index,
                parentContent: parent.content,
                breadcrumb: `Parent Context #${parent.index + 1}`,
            });
        }
    }

    return { chunks: childChunks, parentChunks };
}

function getOverlapLength(text: string, overlap: number): number {
    if (overlap <= 0) return 0;
    if (overlap >= text.length) return text.length;
    
    const searchArea = text.substring(text.length - overlap);
    const firstSpace = searchArea.indexOf(' ');
    
    if (firstSpace !== -1) {
        return overlap - firstSpace;
    }
    return overlap;
}

function addChunk(
    chunks: TextChunk[], 
    content: string, 
    startOffset: number,
    extra?: Partial<TextChunk>
) {
    const trimmed = content.trim();
    if (!trimmed) return;
    
    chunks.push({
        index: chunks.length,
        content,
        characterCount: content.length,
        wordCount: countWords(content),
        estimatedTokenCount: estimateTokenCount(content),
        startOffset,
        endOffset: startOffset + content.length,
        ...extra
    });
}

export function createChunkResult(fileName: string, text: string, config: ChunkConfig): ChunkResult {
    const warnings = validateChunkConfig(config);
    const hasError = warnings.some(w => w.severity === 'error');
    
    if (hasError) {
        return {
            fileName,
            config,
            chunks: [],
            warnings
        };
    }

    if (!text || !text.trim()) {
        warnings.push({ severity: 'error', message: 'Document contains no usable text.' });
        return { fileName, config, chunks: [], warnings };
    }

    const totalLines = countLines(text);
    const emptyLines = countEmptyLines(text);
    
    if (totalLines > 0 && emptyLines / totalLines > 0.3) {
        warnings.push({ 
            severity: 'warning', 
            message: `Document contains many empty lines (${Math.round((emptyLines / totalLines) * 100)}%).` 
        });
    }

    let chunks: TextChunk[] = [];
    let parentChunks: TextChunk[] | undefined;

    const strategy = config.strategy || 'boundary';

    if (strategy === 'parent_document') {
        const pdResult = chunkParentDocument(text, config);
        chunks = pdResult.chunks;
        parentChunks = pdResult.parentChunks;
    } else if (strategy === 'markdown') {
        chunks = chunkMarkdown(text, config);
    } else {
        chunks = chunkText(text, config);
    }

    chunks.forEach(chunk => {
        if (chunk.characterCount < 50 && !chunk.isAtomic) {
            warnings.push({ 
                severity: 'warning', 
                message: `Very small chunk detected (Chunk #${chunk.index + 1}).`, 
                chunkIndex: chunk.index 
            });
        }
        if (chunk.characterCount > config.chunkSize * 2 && !chunk.isAtomic) {
            warnings.push({ 
                severity: 'warning', 
                message: `Large chunk detected (Chunk #${chunk.index + 1}).`, 
                chunkIndex: chunk.index 
            });
        }
    });

    return {
        fileName,
        config,
        chunks,
        parentChunks,
        warnings
    };
}
