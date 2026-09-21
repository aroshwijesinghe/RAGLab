import { TextChunk, ChunkStatistics } from '../models/types';

export function calculateChunkStatistics(chunks: TextChunk[]): ChunkStatistics {
    if (!chunks || chunks.length === 0) {
        return {
            totalChunks: 0,
            averageCharacters: 0,
            minCharacters: 0,
            maxCharacters: 0,
            averageEstimatedTokens: 0,
            minEstimatedTokens: 0,
            maxEstimatedTokens: 0,
            averageWords: 0,
            minWords: 0,
            maxWords: 0
        };
    }

    let sumChars = 0;
    let sumTokens = 0;
    let sumWords = 0;

    let minChars = Number.MAX_VALUE;
    let maxChars = 0;
    let minTokens = Number.MAX_VALUE;
    let maxTokens = 0;
    let minWords = Number.MAX_VALUE;
    let maxWords = 0;

    for (const chunk of chunks) {
        sumChars += chunk.characterCount;
        sumTokens += chunk.estimatedTokenCount;
        sumWords += chunk.wordCount;

        if (chunk.characterCount < minChars) minChars = chunk.characterCount;
        if (chunk.characterCount > maxChars) maxChars = chunk.characterCount;

        if (chunk.estimatedTokenCount < minTokens) minTokens = chunk.estimatedTokenCount;
        if (chunk.estimatedTokenCount > maxTokens) maxTokens = chunk.estimatedTokenCount;

        if (chunk.wordCount < minWords) minWords = chunk.wordCount;
        if (chunk.wordCount > maxWords) maxWords = chunk.wordCount;
    }

    return {
        totalChunks: chunks.length,
        averageCharacters: Math.round(sumChars / chunks.length),
        minCharacters: minChars,
        maxCharacters: maxChars,
        averageEstimatedTokens: Math.round(sumTokens / chunks.length),
        minEstimatedTokens: minTokens,
        maxEstimatedTokens: maxTokens,
        averageWords: Math.round(sumWords / chunks.length),
        minWords: minWords,
        maxWords: maxWords
    };
}
