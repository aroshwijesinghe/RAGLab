import * as assert from 'assert';
import { calculateChunkStatistics } from '../../services/statisticsService';
import { TextChunk } from '../../models/types';

function makeChunk(index: number, content: string): TextChunk {
  const words = content.trim().split(/\s+/).length;
  return {
    index,
    content,
    characterCount: content.length,
    wordCount: words,
    estimatedTokenCount: Math.round(words * 1.3),
    startOffset: 0,
    endOffset: content.length,
  };
}

describe('Statistics Service', () => {
  describe('calculateChunkStatistics', () => {
    it('should return all zeros for empty array', () => {
      const stats = calculateChunkStatistics([]);
      assert.strictEqual(stats.totalChunks, 0);
      assert.strictEqual(stats.averageCharacters, 0);
      assert.strictEqual(stats.minCharacters, 0);
      assert.strictEqual(stats.maxCharacters, 0);
      assert.strictEqual(stats.averageEstimatedTokens, 0);
      assert.strictEqual(stats.minEstimatedTokens, 0);
      assert.strictEqual(stats.maxEstimatedTokens, 0);
      assert.strictEqual(stats.averageWords, 0);
      assert.strictEqual(stats.minWords, 0);
      assert.strictEqual(stats.maxWords, 0);
    });

    it('should return correct stats for single chunk', () => {
      const chunk = makeChunk(0, 'hello world');
      const stats = calculateChunkStatistics([chunk]);
      
      assert.strictEqual(stats.totalChunks, 1);
      assert.strictEqual(stats.minCharacters, chunk.characterCount);
      assert.strictEqual(stats.maxCharacters, chunk.characterCount);
      assert.strictEqual(stats.averageCharacters, chunk.characterCount);
      
      assert.strictEqual(stats.minWords, chunk.wordCount);
      assert.strictEqual(stats.maxWords, chunk.wordCount);
      assert.strictEqual(stats.averageWords, chunk.wordCount);
      
      assert.strictEqual(stats.minEstimatedTokens, chunk.estimatedTokenCount);
      assert.strictEqual(stats.maxEstimatedTokens, chunk.estimatedTokenCount);
      assert.strictEqual(stats.averageEstimatedTokens, chunk.estimatedTokenCount);
    });

    it('should return correct stats for multiple chunks', () => {
      const chunks = [
        makeChunk(0, 'short'), // 5 chars, 1 word
        makeChunk(1, 'this is longer'), // 14 chars, 3 words
        makeChunk(2, 'medium chunk'), // 12 chars, 2 words
      ];
      const stats = calculateChunkStatistics(chunks);
      
      assert.strictEqual(stats.totalChunks, 3);
      assert.strictEqual(stats.minCharacters, 5);
      assert.strictEqual(stats.maxCharacters, 14);
      assert.strictEqual(stats.averageCharacters, Math.round((5 + 14 + 12) / 3));
      
      assert.strictEqual(stats.minWords, 1);
      assert.strictEqual(stats.maxWords, 3);
      assert.strictEqual(stats.averageWords, Math.round((1 + 3 + 2) / 3));
    });

    it('should handle chunks with varying token counts correctly', () => {
      const chunks = [
        makeChunk(0, 'one'), // 1 word -> ~1 token
        makeChunk(1, 'one two three four five'), // 5 words -> ~7 tokens
      ];
      const stats = calculateChunkStatistics(chunks);
      
      const t1 = chunks[0].estimatedTokenCount;
      const t2 = chunks[1].estimatedTokenCount;
      
      assert.strictEqual(stats.minEstimatedTokens, t1);
      assert.strictEqual(stats.maxEstimatedTokens, t2);
      assert.strictEqual(stats.averageEstimatedTokens, Math.round((t1 + t2) / 2));
    });
    
    it('should round averages to integers', () => {
      const chunks = [
        makeChunk(0, 'a b'), // 2 words
        makeChunk(1, 'c'),   // 1 word
      ]; // average = 1.5 -> rounded to 2
      const stats = calculateChunkStatistics(chunks);
      assert.strictEqual(stats.averageWords, Math.round(1.5));
    });
  });
});
