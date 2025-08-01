import { createWorker, Worker as TesseractWorker } from 'tesseract.js';
import type { OCRProgress } from '../services/ocr.types';

let worker: TesseractWorker | null = null;

// Message types for worker communication
interface WorkerMessage {
  type: 'INIT' | 'RECOGNIZE' | 'TERMINATE';
  payload?: any;
  id: string;
}

interface WorkerResponse {
  type: 'SUCCESS' | 'ERROR' | 'PROGRESS';
  data?: any;
  error?: string;
  id: string;
}

// Initialize Tesseract worker
async function initializeWorker(languages: string[] = ['eng']) {
  if (worker) {
    await worker.terminate();
  }

  worker = await createWorker({
    logger: (progress) => {
      // Send progress updates to main thread
      const progressData: OCRProgress = {
        status: progress.status as any,
        progress: Math.round(progress.progress * 100),
        message: getProgressMessage(progress.status, progress.progress),
      };

      self.postMessage({
        type: 'PROGRESS',
        data: progressData,
        id: 'progress',
      } as WorkerResponse);
    },
    langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    cachePath: './tesseract-cache',
  });

  await worker.loadLanguage(languages.join('+'));
  await worker.initialize(languages.join('+'));
  
  // Set parameters for better accuracy
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽäöüÄÖÜ .,;:!?()[]{}/-_@#$%&*+=€"\'',
    preserve_interword_spaces: '1',
    tessjs_create_hocr: '0',
    tessjs_create_tsv: '0',
  });
}

// Perform OCR on image
async function recognize(imageData: string | ArrayBuffer, options: any = {}) {
  if (!worker) {
    throw new Error('Worker not initialized');
  }

  const result = await worker.recognize(imageData, {
    rotateAuto: options.detectOrientation,
  });

  return {
    text: result.data.text,
    confidence: result.data.confidence,
    words: result.data.words,
    lines: result.data.lines,
    paragraphs: result.data.paragraphs,
  };
}

// Get user-friendly progress messages
function getProgressMessage(status: string, progress: number): string {
  const messages: Record<string, string> = {
    'loading tesseract.js': 'Preparing to read your document...',
    'initializing tesseract': 'Getting ready to help you...',
    'loading language traineddata': 'Learning how to read your document...',
    'initializing api': 'Almost ready to start...',
    'recognizing text': `Reading your document... ${Math.round(progress * 100)}%`,
  };

  return messages[status] || 'Processing your document...';
}

// Handle messages from main thread
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload, id } = event.data;

  try {
    switch (type) {
      case 'INIT':
        await initializeWorker(payload.languages || ['eng']);
        self.postMessage({
          type: 'SUCCESS',
          data: { initialized: true },
          id,
        } as WorkerResponse);
        break;

      case 'RECOGNIZE':
        const result = await recognize(payload.imageData, payload.options);
        self.postMessage({
          type: 'SUCCESS',
          data: result,
          id,
        } as WorkerResponse);
        break;

      case 'TERMINATE':
        if (worker) {
          await worker.terminate();
          worker = null;
        }
        self.postMessage({
          type: 'SUCCESS',
          data: { terminated: true },
          id,
        } as WorkerResponse);
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      id,
    } as WorkerResponse);
  }
});

// Export type definitions for TypeScript
export type { WorkerMessage, WorkerResponse };
