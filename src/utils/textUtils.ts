/**
 * Text processing utilities for RAGLaB.
 * All text analysis is performed locally without external dependencies.
 */

/**
 * Count words in text.
 * Words are sequences of non-whitespace characters.
 */
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Count lines in text.
 */
export function countLines(text: string): number {
  if (text.length === 0) return 0;
  return text.split('\n').length;
}

/**
 * Count empty lines in text.
 * An empty line contains only whitespace or nothing.
 */
export function countEmptyLines(text: string): number {
  if (text.length === 0) return 0;
  return text.split('\n').filter((line) => line.trim().length === 0).length;
}

/**
 * Estimate token count from text.
 * Uses a simple word-based approximation: tokens ≈ words × 1.3
 *
 * This is a rough estimate. Actual token counts vary by tokenizer
 * (GPT, Claude, Llama, etc.). For precise counts, use the specific
 * tokenizer for your model.
 *
 * @returns Estimated token count (rounded to nearest integer)
 */
export function estimateTokenCount(text: string): number {
  const words = countWords(text);
  return Math.round(words * 1.3);
}

/**
 * Calculate average words per line.
 */
export function averageWordsPerLine(text: string): number {
  const lines = countLines(text);
  if (lines === 0) return 0;
  const words = countWords(text);
  return Math.round((words / lines) * 100) / 100;
}

/**
 * Format a number with commas for display.
 * Example: 12540 → "12,540"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format file size in human-readable form.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Escape HTML special characters to prevent XSS in webviews.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
