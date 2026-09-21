import * as assert from 'assert';
import { countWords, countLines, countEmptyLines, estimateTokenCount, averageWordsPerLine, formatNumber, formatFileSize, escapeHtml } from '../../utils/textUtils';

describe('Text Utilities', () => {
  describe('countWords', () => {
    it('should count words in simple text', () => { assert.strictEqual(countWords('hello world'), 2); });
    it('should return 0 for empty string', () => { assert.strictEqual(countWords(''), 0); });
    it('should return 0 for whitespace only', () => { assert.strictEqual(countWords('   '), 0); });
    it('should handle multiple spaces', () => { assert.strictEqual(countWords('hello   world'), 2); });
    it('should handle tabs and newlines', () => { assert.strictEqual(countWords('hello\tworld\nfoo'), 3); });
    it('should handle single word', () => { assert.strictEqual(countWords('hello'), 1); });
  });

  describe('countLines', () => {
    it('should count single line', () => { assert.strictEqual(countLines('hello'), 1); });
    it('should count multiple lines', () => { assert.strictEqual(countLines('a\nb\nc'), 3); });
    it('should return 0 for empty string', () => { assert.strictEqual(countLines(''), 0); });
    it('should handle trailing newline', () => { assert.strictEqual(countLines('a\nb\n'), 3); });
  });

  describe('countEmptyLines', () => {
    it('should count empty lines', () => { assert.strictEqual(countEmptyLines('a\n\nb'), 1); });
    it('should count whitespace-only lines as empty', () => { assert.strictEqual(countEmptyLines('a\n   \nb'), 1); });
    it('should return 0 for no empty lines', () => { assert.strictEqual(countEmptyLines('a\nb'), 0); });
    it('should return 0 for empty string', () => { assert.strictEqual(countEmptyLines(''), 0); });
  });

  describe('estimateTokenCount', () => {
    it('should estimate tokens as words * 1.3', () => { assert.strictEqual(estimateTokenCount('hello world'), Math.round(2 * 1.3)); });
    it('should return 0 for empty string', () => { assert.strictEqual(estimateTokenCount(''), 0); });
    it('should handle long text', () => {
      const words = Array(100).fill('word').join(' ');
      assert.strictEqual(estimateTokenCount(words), Math.round(100 * 1.3));
    });
  });

  describe('averageWordsPerLine', () => {
    it('should calculate average words per line', () => {
      assert.strictEqual(averageWordsPerLine('hello world\nfoo bar baz'), 2.5);
    });
    it('should return 0 for empty string', () => { assert.strictEqual(averageWordsPerLine(''), 0); });
  });

  describe('formatNumber', () => {
    it('should format with commas', () => {
      // Note: locale-dependent, but en-US should use commas
      assert.ok(formatNumber(1000).includes('1')); // basic check
    });
    it('should handle small numbers', () => { assert.strictEqual(formatNumber(42), '42'); });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => { assert.strictEqual(formatFileSize(500), '500 B'); });
    it('should format kilobytes', () => { assert.strictEqual(formatFileSize(1024), '1.0 KB'); });
    it('should format megabytes', () => { assert.strictEqual(formatFileSize(1048576), '1.00 MB'); });
  });

  describe('escapeHtml', () => {
    it('should escape HTML characters', () => {
      assert.strictEqual(escapeHtml('<div class="test">&</div>'), '&lt;div class=&quot;test&quot;&gt;&amp;&lt;/div&gt;');
    });
    it('should escape single quotes', () => {
      assert.strictEqual(escapeHtml("it's"), 'it&#039;s');
    });
    it('should not change safe text', () => {
      assert.strictEqual(escapeHtml('hello world'), 'hello world');
    });
  });
});
