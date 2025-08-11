import { createWorker, Worker, RecognizeResult } from "tesseract.js";

export interface OCROptions {
  language?: string;
  preprocessImage?: boolean;
  enableConfidence?: boolean;
  minConfidence?: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
  lines: Array<{
    text: string;
    confidence: number;
    words: number[];
  }>;
  paragraphs: Array<{
    text: string;
    confidence: number;
    lines: number[];
  }>;
  processingTime: number;
  language: string;
}

export interface ProcessingProgress {
  status: string;
  progress: number;
  message: string;
}

export class LocalProcessingService {
  private worker: Worker | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private progressCallback?: (progress: ProcessingProgress) => void;

  constructor() {
    // Initialize on construction to preload the worker
    this.initializationPromise = this.initialize();
  }

  /**
   * Initialize the Tesseract worker
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized && this.worker) {
      return;
    }

    try {
      this.updateProgress("Initializing OCR engine...", 0);

      this.worker = await createWorker({
        logger: (m) => {
          // Convert Tesseract progress to our progress format
          if (m.status && typeof m.progress === "number") {
            this.updateProgress(m.status, m.progress);
          }
        },
        errorHandler: (error) => {
          console.error("Tesseract error:", error);
        },
      });

      // Load default languages (English, Czech, Slovak)
      await this.worker.loadLanguage("eng+ces+slk");
      await this.worker.initialize("eng+ces+slk");

      this.isInitialized = true;
      this.updateProgress("OCR engine ready", 100);
    } catch (error) {
      console.error("Failed to initialize OCR worker:", error);
      throw new Error("Failed to initialize OCR processing");
    }
  }

  /**
   * Ensure the worker is initialized before use
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    } else {
      await this.initialize();
    }
  }

  /**
   * Set progress callback for OCR operations
   */
  public setProgressCallback(
    callback: (progress: ProcessingProgress) => void,
  ): void {
    this.progressCallback = callback;
  }

  /**
   * Update progress and notify callback
   */
  private updateProgress(message: string, progress: number): void {
    const status = this.getStatusFromMessage(message);
    if (this.progressCallback) {
      this.progressCallback({
        status,
        progress,
        message: this.getHumanReadableMessage(message),
      });
    }
  }

  /**
   * Convert Tesseract status messages to user-friendly messages
   */
  private getHumanReadableMessage(message: string): string {
    const messageMap: Record<string, string> = {
      "loading tesseract core": "Preparing text recognition...",
      "initializing tesseract": "Setting up recognition engine...",
      "loading language traineddata": "Loading language models...",
      "initializing api": "Finalizing setup...",
      "recognizing text": "Reading your document...",
      "OCR engine ready": "Ready to process your document",
    };

    return messageMap[message.toLowerCase()] || message;
  }

  /**
   * Get status type from message
   */
  private getStatusFromMessage(message: string): string {
    if (message.includes("loading") || message.includes("initializing")) {
      return "preparing";
    }
    if (message.includes("recognizing")) {
      return "processing";
    }
    if (message.includes("ready")) {
      return "ready";
    }
    return "working";
  }

  /**
   * Process an image file and extract text
   */
  public async processImage(
    imageFile: File | Blob | string,
    options: OCROptions = {},
  ): Promise<OCRResult> {
    await this.ensureInitialized();

    if (!this.worker) {
      throw new Error("OCR worker not initialized");
    }

    const startTime = Date.now();

    try {
      this.updateProgress("Processing your document...", 10);

      // Preprocess image if requested
      let processedImage = imageFile;
      if (options.preprocessImage && imageFile instanceof File) {
        processedImage = await this.preprocessImage(imageFile);
      }

      // Set language if specified
      if (options.language && options.language !== "eng+ces+slk") {
        await this.worker.loadLanguage(options.language);
        await this.worker.initialize(options.language);
      }

      // Perform OCR
      const result = await this.worker.recognize(processedImage);

      // Process and structure the results
      const ocrResult = this.processOCRResult(
        result,
        options,
        Date.now() - startTime,
      );

      this.updateProgress("Document processed successfully", 100);

      return ocrResult;
    } catch (error) {
      console.error("OCR processing error:", error);
      throw new Error("Failed to process document");
    }
  }

  /**
   * Process multiple images in batch
   */
  public async processMultipleImages(
    images: Array<File | Blob | string>,
    options: OCROptions = {},
  ): Promise<OCRResult[]> {
    const results: OCRResult[] = [];

    for (let i = 0; i < images.length; i++) {
      const progressBase = (i / images.length) * 100;
      this.updateProgress(
        `Processing document ${i + 1} of ${images.length}...`,
        progressBase,
      );

      const result = await this.processImage(images[i], options);
      results.push(result);
    }

    return results;
  }

  /**
   * Preprocess image for better OCR results
   */
  private async preprocessImage(imageFile: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to create canvas context"));
            return;
          }

          // Set canvas size (resize if too large)
          const maxWidth = 2000;
          const maxHeight = 2000;
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;

          // Apply preprocessing
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to grayscale and increase contrast
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            // Convert to grayscale
            const gray =
              0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

            // Increase contrast
            const contrast = 1.5;
            const adjusted = (gray - 128) * contrast + 128;

            // Apply threshold for better text clarity
            const final = adjusted > 128 ? 255 : 0;

            data[i] = final;
            data[i + 1] = final;
            data[i + 2] = final;
          }

          ctx.putImageData(imageData, 0, 0);

          // Convert to blob
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          }, "image/png");
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(imageFile);
    });
  }

  /**
   * Process and structure OCR results
   */
  private processOCRResult(
    result: RecognizeResult,
    options: OCROptions,
    processingTime: number,
  ): OCRResult {
    const minConfidence = options.minConfidence ?? 0;

    // Filter words by confidence if enabled
    const words = result.data.words
      .filter(
        (word) => !options.enableConfidence || word.confidence >= minConfidence,
      )
      .map((word) => ({
        text: word.text,
        confidence: word.confidence,
        bbox: word.bbox,
      }));

    // Structure lines
    const lines = result.data.lines.map((line) => ({
      text: line.text,
      confidence: line.confidence,
      words: line.words.map((w) => result.data.words.indexOf(w)),
    }));

    // Structure paragraphs
    const paragraphs = result.data.paragraphs.map((para) => ({
      text: para.text,
      confidence: para.confidence,
      lines: para.lines.map((l) => result.data.lines.indexOf(l)),
    }));

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words,
      lines,
      paragraphs,
      processingTime,
      language: result.data.language || "unknown",
    };
  }

  /**
   * Clean up resources
   */
  public async destroy(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  /**
   * Check if service is ready
   */
  public isReady(): boolean {
    return this.isInitialized && this.worker !== null;
  }

  /**
   * Get supported languages
   */
  public getSupportedLanguages(): string[] {
    return ["eng", "ces", "slk", "deu", "fra", "spa", "ita"];
  }

  /**
   * Extract text from specific region of image
   */
  public async extractRegion(
    imageFile: File | Blob | string,
    region: { x: number; y: number; width: number; height: number },
    options: OCROptions = {},
  ): Promise<OCRResult> {
    await this.ensureInitialized();

    if (!this.worker) {
      throw new Error("OCR worker not initialized");
    }

    try {
      // Set the rectangle for recognition
      await this.worker.setParameters({
        tessedit_pageseg_mode: "6", // Uniform block of text
        rectangle: region,
      });

      const result = await this.processImage(imageFile, options);

      // Reset parameters
      await this.worker.setParameters({
        rectangle: undefined,
      });

      return result;
    } catch (error) {
      console.error("Region extraction error:", error);
      throw new Error("Failed to extract text from region");
    }
  }
}

// Export singleton instance
export const localProcessingService = new LocalProcessingService();
