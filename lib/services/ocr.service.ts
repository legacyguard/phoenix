import { createWorker, Worker as TesseractWorker } from 'tesseract.js';
import { DocumentPreprocessor } from './document-preprocessor';
import { documentPatterns, detectLanguageFromText } from './ocr.patterns';
import type {
  OCRResult,
  OCRRegionResult,
  OCROptions,
  OCRProgress,
  OCRError,
  DetectedDocumentType,
  ExtractedData,
  DocumentType,
  AnonymizedText,
  AnonymizationOptions,
} from './ocr.types';

// OCR Service Class
export class OCRService {
  private worker: TesseractWorker | null = null;
  private preprocessor: DocumentPreprocessor;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.preprocessor = new DocumentPreprocessor();
  }

  // Initialize Tesseract worker
  private async initialize(language: string = 'eng'): Promise<void> {
    if (this.isInitialized && this.worker) return;
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.doInitialize(language);
    return this.initializationPromise;
  }

  private async doInitialize(language: string): Promise<void> {
    try {
      this.worker = await createWorker({
        logger: (progress) => {
          // Log progress internally
          console.log('OCR Progress:', progress);
        },
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        cachePath: './tesseract-cache',
        cacheMethod: 'write',
      });

      // Map language codes
      const langMap: Record<string, string> = {
        cs: 'ces', // Czech
        sk: 'slk', // Slovak
        en: 'eng', // English
      };

      const tesseractLang = langMap[language] || language;
      
      await this.worker.loadLanguage(tesseractLang);
      await this.worker.initialize(tesseractLang);
      
      // Set parameters for better accuracy
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,;:!?()[]{}/-_@#$%&*+="\'"',
        preserve_interword_spaces: '1',
      });

      this.isInitialized = true;
    } catch (error) {
      this.initializationPromise = null;
      throw this.createError('initialization_failed', error);
    }
  }

  // Main OCR function
  async extractTextFromImage(
    file: File,
    options: OCROptions = {}
  ): Promise<OCRResult> {
    const startTime = Date.now();
    
    try {
      // Update progress
      options.onProgress?.({
        status: 'initializing',
        progress: 0,
        message: 'Preparing to read your document...',
      });

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw this.createError('unsupported_format', 'Please upload an image file');
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        throw this.createError('file_too_large', 'File is too large. Please upload a smaller image');
      }

      // Preprocess image if requested
      let processedFile = file;
      if (options.preprocessImage) {
        options.onProgress?.({
          status: 'preprocessing',
          progress: 10,
          message: 'Enhancing document quality...',
        });

        processedFile = await this.preprocessor.preprocessImage(file);
      }

      // Initialize worker with detected or specified language
      const detectedLang = await this.detectDocumentLanguage(processedFile);
      const language = options.language || detectedLang;
      await this.initialize(language);

      options.onProgress?.({
        status: 'recognizing',
        progress: 20,
        message: 'Reading your document...',
      });

      // Perform OCR
      const imageData = await this.fileToImageData(processedFile);
      const result = await this.worker!.recognize(imageData);

      // Extract text and confidence
      const text = result.data.text;
      const confidence = result.data.confidence;

      options.onProgress?.({
        status: 'postprocessing',
        progress: 80,
        message: 'Analyzing document content...',
      });

      // Detect document type
      const documentType = this.detectDocumentType(text);

      // Extract structured data if type is known
      let structuredData: ExtractedData | undefined;
      if (documentType.type !== 'unknown') {
        structuredData = await this.extractStructuredData(text, documentType.type);
      }

      options.onProgress?.({
        status: 'complete',
        progress: 100,
        message: 'Document processed successfully!',
      });

      const processingTime = Date.now() - startTime;

      return {
        text,
        confidence,
        language,
        processingTime,
        documentType,
        structuredData,
        isLocalOnly: options.localOnly || true,
        timestamp: new Date(),
      };
    } catch (error) {
      throw this.createError('processing_failed', error);
    }
  }

  // Detect document language
  async detectDocumentLanguage(file: File): Promise<string> {
    try {
      // Quick language detection using a small sample
      const sampleWorker = await createWorker();
      await sampleWorker.loadLanguage('eng+ces+slk');
      await sampleWorker.initialize('eng+ces+slk');

      const imageData = await this.fileToImageData(file);
      const result = await sampleWorker.recognize(imageData);
      await sampleWorker.terminate();

      const text = result.data.text.substring(0, 500); // Sample first 500 chars
      return detectLanguageFromText(text);
    } catch (error) {
      console.warn('Language detection failed, defaulting to English', error);
      return 'en';
    }
  }

  // Detect document type using pattern matching
  private detectDocumentType(text: string): DetectedDocumentType {
    let bestMatch: DetectedDocumentType = {
      type: 'unknown',
      confidence: 0,
      matchedPatterns: [],
      language: detectLanguageFromText(text),
    };

    // Check each document type
    for (const [type, pattern] of Object.entries(documentPatterns)) {
      if (type === 'unknown') continue;

      const matches: string[] = [];
      let totalWeight = 0;
      let matchCount = 0;

      // Check patterns
      for (const p of pattern.patterns) {
        if (p.regex.test(text)) {
          matches.push(p.regex.source);
          totalWeight += p.weight;
          matchCount++;
        }
      }

      // Calculate confidence
      if (matchCount >= pattern.requiredMatches) {
        const maxPossibleWeight = pattern.patterns.reduce((sum, p) => sum + p.weight, 0);
        const confidence = totalWeight / maxPossibleWeight;

        if (confidence > bestMatch.confidence && confidence >= pattern.confidenceThreshold) {
          bestMatch = {
            type: type as DocumentType,
            confidence,
            matchedPatterns: matches,
            language: detectLanguageFromText(text),
          };
        }
      }
    }

    return bestMatch;
  }

  // Extract structured data based on document type
  async extractStructuredData(text: string, documentType: DocumentType): Promise<ExtractedData> {
    const data: ExtractedData = {};

    // Common patterns
    const patterns = {
      date: /\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/g,
      amount: /\d+[,.\s]?\d*\s*(K|CZK|EUR|USD|\$)/g,
      idNumber: /\d{6}\/\d{3,4}/g,
      email: /[\w.-]+@[\w.-]+\.\w+/g,
      phone: /\+?\d{3}\s?\d{3}\s?\d{3}\s?\d{3}/g,
    };

    // Extract dates
    const dates = text.match(patterns.date);
    if (dates && dates.length > 0) {
      data.issueDate = this.parseDate(dates[0]);
      if (dates.length > 1) {
        data.expiryDate = this.parseDate(dates[1]);
      }
    }

    // Extract amounts
    const amounts = text.match(patterns.amount);
    if (amounts) {
      data.amounts = amounts.map(amount => {
        const match = amount.match(/(\d+[,.\s]?\d*)\s*(K|CZK||EUR|USD|\$)/);
        if (match) {
          return {
            value: parseFloat(match[1].replace(/[,\s]/g, '').replace(',', '.')),
            currency: match[2],
          };
        }
        return { value: 0, currency: 'CZK' };
      });
    }

    // Document-specific extraction
    switch (documentType) {
      case 'insurance_policy':
        data.policyNumber = this.extractPattern(text, /\d{10,15}/);
        data.insuredPerson = this.extractPattern(text, /pojitn:?\s*([^\n]+)/i);
        break;

      case 'bank_statement':
        data.customFields = {
          accountNumber: this.extractPattern(text, /\d{4,6}\/\d{4}/),
          iban: this.extractPattern(text, /[A-Z]{2}\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}/),
        };
        break;

      case 'property_deed':
        data.cadastralNumber = this.extractPattern(text, /\d+\/\d+/);
        data.propertyAddress = this.extractPattern(text, /(?:adresa|address):?\s*([^\n]+)/i);
        break;

      case 'identity_card':
        data.documentNumber = this.extractPattern(text, /[A-Z]{2}\d{6}/);
        data.identificationNumbers = text.match(patterns.idNumber) || [];
        break;
    }

    return data;
  }

  // Extract text with regions (for forms)
  async extractTextWithRegions(file: File): Promise<OCRRegionResult[]> {
    await this.initialize();

    const imageData = await this.fileToImageData(file);
    const result = await this.worker!.recognize(imageData);

    return result.data.words.map(word => ({
      text: word.text,
      confidence: word.confidence,
      bbox: word.bbox,
      pageNumber: 1,
      isHandwritten: word.confidence < 70, // Simple heuristic
    }));
  }

  // Anonymize text for privacy
  anonymizeText(text: string, options: AnonymizationOptions = {}): AnonymizedText {
    const { text: anonymized, removedCount } = DocumentPreprocessor.anonymizeText(text, options);
    
    const documentType = this.detectDocumentType(text);
    
    return {
      text: anonymized,
      removedEntities: [
        { type: 'name', count: removedCount }, // Simplified for now
      ],
      documentStructure: {
        type: documentType.type,
        hasFinancialData: /\d+[,.\s]?\d*\s*(K|CZK||EUR|USD|\$)/.test(text),
        hasDates: /\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(text),
        hasSignatures: /podpis|signature/i.test(text),
      },
    };
  }

  // Helper methods
  private async fileToImageData(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private parseDate(dateStr: string): Date {
    // Handle common Czech/Slovak date formats
    const parts = dateStr.split(/[./-]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parts[2].length === 2 ? 2000 + parseInt(parts[2]) : parseInt(parts[2]);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  }

  private extractPattern(text: string, pattern: RegExp): string {
    const match = text.match(pattern);
    return match ? match[1] || match[0] : '';
  }

  private createError(code: OCRError['code'], error: Record<string, unknown>): OCRError {
    const userMessages: Record<OCRError['code'], string> = {
      initialization_failed: 'Having trouble starting the document reader. Please try again.',
      processing_failed: 'Could not read your document. Please ensure the image is clear.',
      unsupported_format: 'This file type is not supported. Please upload an image.',
      file_too_large: 'This file is too large. Please upload a smaller image.',
      worker_error: 'Something went wrong. Please refresh and try again.',
    };

    return {
      code,
      message: error instanceof Error ? error.message : String(error),
      userMessage: userMessages[code],
      details: error,
    };
  }

  // Cleanup
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      this.initializationPromise = null;
    }
  }
}

// Singleton instance
export const ocrService = new OCRService();
