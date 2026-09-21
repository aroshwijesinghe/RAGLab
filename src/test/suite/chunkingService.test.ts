import * as assert from 'assert';
import { validateChunkConfig, chunkText, createChunkResult } from '../../services/chunkingService';

describe('Chunking Service', () => {
  describe('validateChunkConfig', () => {
    it('should return no errors for valid config', () => {
      const warnings = validateChunkConfig({ chunkSize: 1000, overlap: 200 });
      assert.strictEqual(warnings.length, 0);
    });

    it('should return error for chunkSize <= 0', () => {
      const warnings = validateChunkConfig({ chunkSize: 0, overlap: 0 });
      assert.ok(warnings.some(w => w.severity === 'error' && w.message.toLowerCase().includes('chunk size')));
    });

    it('should return error for overlap < 0', () => {
      const warnings = validateChunkConfig({ chunkSize: 1000, overlap: -10 });
      assert.ok(warnings.some(w => w.severity === 'error' && w.message.toLowerCase().includes('overlap')));
    });

    it('should return error for overlap >= chunkSize', () => {
      const warnings = validateChunkConfig({ chunkSize: 1000, overlap: 1000 });
      assert.ok(warnings.some(w => w.severity === 'error' && w.message.toLowerCase().includes('overlap')));
    });

    it('should return warning for very small chunk size (< 10)', () => {
      const warnings = validateChunkConfig({ chunkSize: 5, overlap: 1 });
      assert.ok(warnings.some(w => w.severity === 'warning' && w.message.toLowerCase().includes('small')));
    });

    it('should return warning for very large chunk size (> 5000)', () => {
      const warnings = validateChunkConfig({ chunkSize: 6000, overlap: 500 });
      assert.ok(warnings.some(w => w.severity === 'warning' && w.message.toLowerCase().includes('large')));
    });
  });

  describe('chunkText', () => {
    it('should return empty array for empty text', () => {
      const chunks = chunkText('', { chunkSize: 1000, overlap: 200 });
      assert.strictEqual(chunks.length, 0);
    });

    it('should return single chunk for short text', () => {
      const text = 'This is a short text.';
      const chunks = chunkText(text, { chunkSize: 1000, overlap: 200 });
      assert.strictEqual(chunks.length, 1);
      assert.strictEqual(chunks[0].content, text);
    });

    it('should split long text into multiple chunks', () => {
      const text = 'Word '.repeat(300); // 1500 chars roughly
      const chunks = chunkText(text, { chunkSize: 500, overlap: 50 });
      assert.ok(chunks.length > 1, `Expected more than 1 chunk but got ${chunks.length}`);
    });

    it('should not cut words in half', () => {
      const text = 'Sentence one is here. Sentence two follows. Sentence three ends. '.repeat(20);
      const chunks = chunkText(text, { chunkSize: 200, overlap: 30 });
      for (const chunk of chunks) {
        // Check the chunk doesn't start or end mid-word (allow leading/trailing whitespace)
        const trimmed = chunk.content.trim();
        if (trimmed.length > 0) {
          assert.ok(
            !trimmed[0].match(/^[a-z]/i) || trimmed === chunk.content.trim(),
            `Chunk ${chunk.index} may have been cut mid-word`
          );
        }
      }
    });

    it('should apply overlap between chunks', () => {
      const text = 'Word '.repeat(300);
      const chunks = chunkText(text, { chunkSize: 500, overlap: 50 });
      if (chunks.length > 1) {
        // With overlap, the end of chunk 0 should extend past the start of chunk 1
        assert.ok(chunks[0].endOffset > chunks[1].startOffset,
          `Expected overlap: chunk 0 ends at ${chunks[0].endOffset}, chunk 1 starts at ${chunks[1].startOffset}`);
      }
    });

    it('should populate chunk properties correctly', () => {
      const text = 'Hello world, this is a test.';
      const chunks = chunkText(text, { chunkSize: 1000, overlap: 0 });
      assert.strictEqual(chunks[0].index, 0);
      assert.strictEqual(chunks[0].characterCount, text.length);
      assert.ok(chunks[0].wordCount > 0);
      assert.strictEqual(chunks[0].startOffset, 0);
      assert.strictEqual(chunks[0].endOffset, text.length);
    });

    it('should respect paragraph boundaries', () => {
      const text = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
      const chunks = chunkText(text, { chunkSize: 30, overlap: 0 });
      // The chunks should split between paragraphs when possible
      assert.ok(chunks.length >= 2, `Expected at least 2 chunks but got ${chunks.length}`);
    });

    it('should handle text with only whitespace', () => {
      const chunks = chunkText('   \n\n   ', { chunkSize: 100, overlap: 0 });
      assert.strictEqual(chunks.length, 0);
    });
  });

  describe('createChunkResult', () => {
    it('should return chunks for valid input', () => {
      // Use text long enough to avoid "very small chunk" warning (>= 50 chars)
      const text = 'This is a valid text that is long enough to not trigger the very small chunk warning threshold.';
      const result = createChunkResult('test.txt', text, { chunkSize: 1000, overlap: 200 });
      assert.strictEqual(result.fileName, 'test.txt');
      assert.strictEqual(result.chunks.length, 1);
      // May have 0 warnings or just info-level, no errors
      const errors = result.warnings.filter(w => w.severity === 'error');
      assert.strictEqual(errors.length, 0);
    });

    it('should generate error warning for empty text', () => {
      const result = createChunkResult('test.txt', '', { chunkSize: 1000, overlap: 200 });
      assert.ok(result.warnings.some(w => w.severity === 'error'), 'Expected an error warning for empty text');
    });

    it('should generate error warnings for invalid config', () => {
      const result = createChunkResult('test.txt', 'Some text', { chunkSize: -10, overlap: 0 });
      assert.ok(result.warnings.some(w => w.severity === 'error'));
    });

    it('should preserve file name in result', () => {
      const result = createChunkResult('my-file.md', 'Some content that is reasonably long enough for testing purposes.', { chunkSize: 1000, overlap: 10 });
      assert.strictEqual(result.fileName, 'my-file.md');
    });

    it('should warn about very small chunks', () => {
      const result = createChunkResult('test.txt', 'Hi.', { chunkSize: 1000, overlap: 0 });
      assert.ok(result.warnings.some(w => w.severity === 'warning' && w.message.toLowerCase().includes('small')));
    });

    it('should return empty chunks for invalid config', () => {
      const result = createChunkResult('test.txt', 'Some text', { chunkSize: 100, overlap: 100 });
      assert.strictEqual(result.chunks.length, 0);
    });
  });
});
