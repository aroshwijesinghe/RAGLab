import * as path from 'path';
import { DocumentAnalysis } from '../models/types';
import {
    countWords,
    countLines,
    countEmptyLines,
    estimateTokenCount,
    averageWordsPerLine,
    formatFileSize
} from '../utils/textUtils';
import {
    getFileType,
    getFileSize,
    readDocumentContent
} from '../utils/fileUtils';

export async function analyzeDocument(filePath: string, maxFileSize: number): Promise<DocumentAnalysis> {
    try {
        const fileSizeBytes = await getFileSize(filePath);
        const fileType = getFileType(filePath);
        const fileName = path.basename(filePath);
        const { content } = await readDocumentContent(filePath, maxFileSize);

        const characterCount = content.length;
        const wordCount = countWords(content);
        const lineCount = countLines(content);
        const emptyLineCount = countEmptyLines(content);
        const estimatedTokens = estimateTokenCount(content);
        const avgWords = averageWordsPerLine(content);
        const fileSizeFormatted = formatFileSize(fileSizeBytes);

        return {
            fileName,
            filePath,
            fileType,
            fileSizeBytes,
            fileSizeFormatted,
            characterCount,
            wordCount,
            lineCount,
            emptyLineCount,
            estimatedTokenCount: estimatedTokens,
            averageWordsPerLine: avgWords,
            content
        };
    } catch (error: any) {
        throw new Error(error.message || String(error));
    }
}
