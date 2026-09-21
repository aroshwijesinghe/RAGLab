import './pdfPolyfill';
import * as path from 'path';
import * as fs from 'fs';
import { pathToFileURL } from 'url';
import { PDFParse } from 'pdf-parse';

export interface ExtractedPdfPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedPdfResult {
  text: string;
  totalPages: number;
  pages: ExtractedPdfPage[];
}

/**
 * Resolves the absolute file URL to pdf.worker.mjs for pdfjs-dist.
 * Ensures the worker can be dynamically imported regardless of process.cwd().
 */
export function resolvePdfWorkerUrl(): string {
  const candidatePaths = [
    path.join(__dirname, 'pdf.worker.mjs'),
    path.join(__dirname, '..', 'pdf.worker.mjs'),
    path.join(__dirname, 'dist', 'pdf.worker.mjs'),
    path.join(__dirname, '..', '..', 'dist', 'pdf.worker.mjs'),
    path.join(__dirname, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs'),
    path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs'),
    path.join(__dirname, '..', '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return pathToFileURL(p).href;
    }
  }

  return pathToFileURL(path.join(__dirname, 'pdf.worker.mjs')).href;
}

/**
 * Extracts text and pagination structure from a PDF binary buffer.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<ExtractedPdfResult> {
  if (!buffer || buffer.length === 0) {
    return { text: '', totalPages: 0, pages: [] };
  }

  const workerUrl = resolvePdfWorkerUrl();
  PDFParse.setWorker(workerUrl);

  const parser = new PDFParse({ data: buffer });
  try {
    await parser.load();
    const result = await parser.getText();
    const rawPages: any[] = result.pages || [];
    
    const pages: ExtractedPdfPage[] = rawPages.map((p: any, idx: number) => ({
      pageNumber: p.num || idx + 1,
      text: (p.text || '').trim(),
    })).filter((p) => p.text.length > 0);

    const totalPages = result.total || rawPages.length || (pages.length > 0 ? pages.length : 1);

    // Format text with heading page anchors so structural chunking retains page lineage
    let formattedText = '';
    if (pages.length > 1) {
      formattedText = pages
        .map((p) => `### Page ${p.pageNumber}\n\n${p.text}`)
        .join('\n\n');
    } else if (pages.length === 1) {
      formattedText = pages[0].text;
    } else {
      formattedText = (result.text || '').trim();
    }

    return {
      text: formattedText,
      totalPages,
      pages,
    };
  } finally {
    await parser.destroy();
  }
}
