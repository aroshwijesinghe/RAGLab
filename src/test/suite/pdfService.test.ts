import * as assert from 'assert';
import { extractTextFromPdf } from '../../services/pdfService';

describe('PDF Service', () => {
  const singlePagePdf = Buffer.from(
    '%PDF-1.4\n' +
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n' +
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n' +
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n' +
    '5 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n72 712 Td\n(Hello RAGLaB PDF Test) Tj\nET\nendstream\nendobj\n' +
    'xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000227 00000 n \n0000000300 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n395\n%%EOF'
  );

  const multiPagePdf = Buffer.from(
    '%PDF-1.4\n' +
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R 6 0 R] /Count 2 >>\nendobj\n' +
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n' +
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n' +
    '5 0 obj\n<< /Length 31 >>\nstream\nBT /F1 12 Tf 72 712 Td (Page One Content) Tj ET\nendstream\nendobj\n' +
    '6 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 7 0 R >>\nendobj\n' +
    '7 0 obj\n<< /Length 31 >>\nstream\nBT /F1 12 Tf 72 712 Td (Page Two Content) Tj ET\nendstream\nendobj\n' +
    'xref\n0 8\n0000000000 65535 f \n' +
    'trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n0\n%%EOF'
  );

  it('should handle empty buffer gracefully', async () => {
    const result = await extractTextFromPdf(Buffer.alloc(0));
    assert.strictEqual(result.text, '');
    assert.strictEqual(result.totalPages, 0);
    assert.deepStrictEqual(result.pages, []);
  });

  it('should extract text from a single-page PDF buffer', async () => {
    const result = await extractTextFromPdf(singlePagePdf);
    assert.ok(result.text.includes('Hello RAGLaB PDF Test'));
    assert.strictEqual(result.totalPages, 1);
    assert.strictEqual(result.pages.length, 1);
    assert.strictEqual(result.pages[0].pageNumber, 1);
    assert.ok(result.pages[0].text.includes('Hello RAGLaB PDF Test'));
  });

  it('should extract text and insert page anchors for multi-page PDF', async () => {
    const result = await extractTextFromPdf(multiPagePdf);
    assert.strictEqual(result.totalPages, 2);
    assert.strictEqual(result.pages.length, 2);
    assert.strictEqual(result.pages[0].pageNumber, 1);
    assert.ok(result.pages[0].text.includes('Page One Content'));
    assert.strictEqual(result.pages[1].pageNumber, 2);
    assert.ok(result.pages[1].text.includes('Page Two Content'));
    // Formatted text includes markdown page headers for breadcrumb / parent chunk lineage
    assert.ok(result.text.includes('### Page 1'));
    assert.ok(result.text.includes('### Page 2'));
    assert.ok(result.text.includes('Page One Content'));
    assert.ok(result.text.includes('Page Two Content'));
  });

  it('should throw an error for corrupt PDF data', async () => {
    const corruptBuffer = Buffer.from('not a valid pdf binary data stream');
    await assert.rejects(async () => {
      await extractTextFromPdf(corruptBuffer);
    });
  });
});
