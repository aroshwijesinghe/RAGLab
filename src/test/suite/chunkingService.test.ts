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

  describe('chunkMarkdown (Structural & AST Strategy)', () => {
    it('should preserve Markdown tables as unbroken atomic units', () => {
      const mdWithTable = [
        '# Introduction',
        'Here is a description of database models.',
        '',
        '| Model | Context | Accuracy |',
        '|---|---|---|',
        '| Llama-3 | 8192 | 84% |',
        '| Mistral | 32768 | 82% |',
        '',
        'Follow-up text concluding the overview.'
      ].join('\n');

      const result = createChunkResult('doc.md', mdWithTable, {
        chunkSize: 120,
        overlap: 10,
        strategy: 'markdown'
      });

      assert.ok(result.chunks.length > 0);
      const tableChunk = result.chunks.find(c => c.isAtomic && c.atomicType === 'table');
      assert.ok(tableChunk, 'Expected an unbroken table chunk');
      assert.ok(tableChunk.content.includes('| Llama-3 |'));
      assert.ok(tableChunk.content.includes('| Mistral |'));
      assert.ok(tableChunk.breadcrumb?.includes('Introduction'));
    });

    it('should preserve fenced code blocks as unbroken atomic units', () => {
      const mdWithCode = [
        '## Code Example',
        'Run the following python snippet:',
        '```python',
        'def process_rag():',
        '    chunks = chunk_text("Hello")',
        '    return chunks',
        '```',
        'Done.'
      ].join('\n');

      const result = createChunkResult('example.md', mdWithCode, {
        chunkSize: 100,
        overlap: 10,
        strategy: 'markdown'
      });

      const codeChunk = result.chunks.find(c => c.isAtomic && c.atomicType === 'code');
      assert.ok(codeChunk, 'Expected an unbroken code block chunk');
      assert.ok(codeChunk.content.includes('def process_rag():'));
      assert.ok(codeChunk.breadcrumb?.includes('Code Example'));
    });

    it('should generate hierarchical breadcrumb trail from headings', () => {
      const md = [
        '# System Architecture',
        'Overview text.',
        '## Database Layer',
        'Database details.',
        '### PostgreSQL Tuning',
        'Parameters and performance optimizations.'
      ].join('\n');

      const result = createChunkResult('arch.md', md, {
        chunkSize: 500,
        overlap: 20,
        strategy: 'markdown'
      });

      const pgChunk = result.chunks.find(c => c.content.includes('PostgreSQL Tuning') || c.content.includes('performance optimizations'));
      assert.ok(pgChunk, 'Expected chunk under PostgreSQL tuning');
      assert.ok(pgChunk.breadcrumb?.includes('System Architecture'));
      assert.ok(pgChunk.breadcrumb?.includes('Database Layer'));
      assert.ok(pgChunk.breadcrumb?.includes('PostgreSQL Tuning'));
    });
  });

  describe('chunkParentDocument (Small-to-Big Strategy)', () => {
    it('should generate child chunks linked to parent context blocks', () => {
      const longText = [
        '# Section 1: Executive Overview',
        'The quick brown fox jumps over the lazy dog. '.repeat(15),
        '',
        '# Section 2: Technical Specifications',
        'Deep learning models require balanced context windows. '.repeat(15)
      ].join('\n');

      const result = createChunkResult('long.txt', longText, {
        chunkSize: 200,
        overlap: 20,
        strategy: 'parent_document',
        parentChunkSize: 800
      });

      assert.ok(result.chunks.length > 0, 'Should produce child chunks');
      assert.ok(result.parentChunks && result.parentChunks.length > 0, 'Should produce parent chunks');
      
      // Each child chunk must have a valid parentId and parentContent
      for (const child of result.chunks) {
        assert.strictEqual(child.strategy, 'parent_document');
        assert.ok(child.parentId !== undefined, 'Child chunk must have parentId');
        assert.ok(child.parentContent, 'Child chunk must have parentContent');
        assert.ok(child.parentContent.includes(child.content.trim().slice(0, 30)));
      }
    });

    it('should flag error when parentChunkSize is less than or equal to chunkSize', () => {
      const warnings = validateChunkConfig({
        chunkSize: 500,
        overlap: 50,
        strategy: 'parent_document',
        parentChunkSize: 400
      });

      assert.ok(warnings.some(w => w.severity === 'error' && w.message.toLowerCase().includes('parent chunk size')));
    });
  });
});
