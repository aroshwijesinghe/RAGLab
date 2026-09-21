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

    return warnings;
}

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
                            addChunk(chunks, currentChunkText, currentStartIndex);
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
                                        addChunk(chunks, currentChunkText, currentStartIndex);
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
                    addChunk(chunks, currentChunkText, currentStartIndex);
                    currentStartIndex += currentChunkText.length - getOverlapLength(currentChunkText, config.overlap);
                    currentChunkText = currentChunkText.substring(currentChunkText.length - getOverlapLength(currentChunkText, config.overlap));
                }
                currentChunkText += paragraph;
            }
        }
    }

    if (currentChunkText.trim()) {
        addChunk(chunks, currentChunkText, currentStartIndex);
    }

    return chunks;
}

function getOverlapLength(text: string, overlap: number): number {
    if (overlap <= 0) return 0;
    if (overlap >= text.length) return text.length;
    
    // Try to find a space boundary near the overlap length
    const searchArea = text.substring(text.length - overlap);
    const firstSpace = searchArea.indexOf(' ');
    
    if (firstSpace !== -1) {
        return overlap - firstSpace;
    }
    return overlap;
}

function addChunk(chunks: TextChunk[], content: string, startOffset: number) {
    const trimmed = content.trim();
    if (!trimmed) return;
    
    chunks.push({
        index: chunks.length,
        content,
        characterCount: content.length,
        wordCount: countWords(content),
        estimatedTokenCount: estimateTokenCount(content),
        startOffset,
        endOffset: startOffset + content.length
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

    const chunks = chunkText(text, config);

    chunks.forEach(chunk => {
        if (chunk.characterCount < 50) {
            warnings.push({ severity: 'warning', message: `Very small chunk detected (Chunk #${chunk.index}).`, chunkIndex: chunk.index });
        }
        if (chunk.characterCount > config.chunkSize * 1.5) {
            warnings.push({ severity: 'warning', message: `Large chunk detected (Chunk #${chunk.index}).`, chunkIndex: chunk.index });
        }
    });

    return {
        fileName,
        config,
        chunks,
        warnings
    };
}
