import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { logger } from '@/utils/logger';

interface TextExtractionResult {
  textContent: string;
  sourceType: 'pdf' | 'image';
  pages: number;
}

export async function extractTextFromFile(
  file: Buffer,
  mimeType: 'application/pdf' | 'image/jpeg' | 'image/png'
): Promise<TextExtractionResult> {
  if (mimeType === 'application/pdf') {
    try {
      const data = await pdfParse(file);
      if (data.text.trim().length > 50) { // Check if text was successfully extracted
        return { textContent: data.text, sourceType: 'pdf', pages: data.numpages };
      }
    } catch (error) {
      logger.warn('PDF parsing failed, attempting OCR:', error);
    }
  }

  // Fallback to OCR for image files or scanned PDFs
  const ocrResult = await Tesseract.recognize(file, 'eng', {
    logger: info => logger.info(info) // Log OCR progress
  });

  const pageCount = (ocrResult.data && ocrResult.data.lines) ? Math.ceil(ocrResult.data.lines.length / 40) : 1; // Rough page estimate

  return { textContent: ocrResult.data.text, sourceType: 'image', pages: pageCount };
}
