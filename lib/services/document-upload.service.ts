import { v4 as uuidv4 } from 'uuid';
import { ocrService } from './ocr.service';
import { openAIService } from './openai.service';
import { documentStorage } from './document-storage.service';
import { validateDocument, validateImageDimensions } from '../utils/file-validators';
import { compressImage, generateThumbnail } from '../utils/image-compression';
import { calculateChecksum } from '../utils/encryption-utils';
import type {
  UploadOptions,
  UploadResult,
  ProcessedDocument,
  UploadProgress,
  DocumentCategory,
  FamilySummary,
  UploadError,
  DocumentMetadata,
} from './document-upload.types';

// Document upload service
export class DocumentUploadService {
  // Main upload function
  async uploadDocument(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const documentId = uuidv4();
    const startTime = Date.now();

    try {
      // Step 1: Validate document
      options.onProgress?.({
        stage: 'validating',
        progress: 10,
        message: 'Checking your document...',
        emoji: '🔍',
      });

      const validation = await this.validateDocument(file);
      if (!validation.valid) {
        throw this.createError(
          'validation_failed',
          validation.errors[0].message,
          validation.errors[0].userMessage,
          'validating',
          validation.errors[0].recoverable
        );
      }

      // Step 2: Process document through pipeline
      const processed = await this.processDocumentPipeline(file, options);

      // Step 3: Create processed document object
      const document: ProcessedDocument = {
        id: documentId,
        originalName: file.name,
        displayName: this.generateDisplayName(file.name, processed.documentType),
        type: processed.documentType,
        category: this.categorizeDocument(processed.documentType),
        size: processed.compressedFile.size,
        uploadedAt: new Date(),
        storageLocation: options.privacy || 'cloud',
        encryptionStatus: options.encrypt !== false ? 'encrypted' : 'unencrypted',
        thumbnail: processed.thumbnail,
        ocrText: processed.ocrText,
        extractedData: processed.extractedData,
        aiAnalysis: processed.aiAnalysis,
        metadata: {
          mimeType: processed.compressedFile.type,
          lastModified: new Date(file.lastModified),
          dimensions: processed.dimensions,
          checksum: await this.calculateFileChecksum(processed.compressedFile),
          processingTime: Date.now() - startTime,
          ocrConfidence: processed.ocrConfidence,
          documentDate: processed.extractedData?.issueDate,
          expiryDate: processed.extractedData?.expiryDate,
          importantDates: this.extractImportantDates(processed.extractedData),
        },
      };

      // Step 4: Store document
      options.onProgress?.({
        stage: 'storing',
        progress: 80,
        message: 'Keeping your document safe...',
        emoji: '🔒',
      });

      const storageResult = await documentStorage.storeDocument(
        processed.compressedFile,
        document,
        {
          location: options.privacy || 'cloud',
          encrypt: options.encrypt !== false,
          generateBackup: true,
          familyVault: options.familySharing,
        }
      );

      if (!storageResult.success) {
        throw this.createError(
          'storage_failed',
          'Failed to store document',
          'I couldn\'t save your document. Please try again.',
          'storing',
          true
        );
      }

      // Step 5: Generate family summary
      const summary = await this.generateFamilySummary(document);

      options.onProgress?.({
        stage: 'complete',
        progress: 100,
        message: `Your ${this.getDocumentTypeDisplay(document.type)} is secure!`,
        emoji: '✅',
      });

      return {
        id: documentId,
        status: 'success',
        document,
        summary,
      };
    } catch (error) {
      const uploadError = error as UploadError;
      return {
        id: documentId,
        status: 'failed',
        error: uploadError,
      };
    }
  }

  // Process document through intelligent pipeline
  async processDocumentPipeline(
    file: File,
    options: UploadOptions
  ): Promise<any> {
    const result: any = {};

    // Step 1: Compress if needed
    if (options.compress !== false && file.type.startsWith('image/')) {
      options.onProgress?.({
        stage: 'compressing',
        progress: 20,
        message: 'Optimizing your document...',
        emoji: '📦',
      });

      result.compressedFile = await compressImage(file);
    } else {
      result.compressedFile = file;
    }

    // Step 2: Generate thumbnail
    if (options.generateThumbnail !== false) {
      result.thumbnail = await generateThumbnail(result.compressedFile);
    }

    // Step 3: Get image dimensions
    if (file.type.startsWith('image/')) {
      const dimensionCheck = await validateImageDimensions(result.compressedFile);
      result.dimensions = dimensionCheck.width && dimensionCheck.height
        ? { width: dimensionCheck.width, height: dimensionCheck.height }
        : undefined;
    }

    // Step 4: Run OCR if enabled
    if (options.processOCR !== false) {
      options.onProgress?.({
        stage: 'reading',
        progress: 40,
        message: 'Reading your document...',
        emoji: '📖',
      });

      const ocrResult = await ocrService.extractTextFromImage(result.compressedFile, {
        localOnly: options.privacy === 'local',
        preprocessImage: true,
      });

      result.ocrText = ocrResult.text;
      result.ocrConfidence = ocrResult.confidence;
      result.documentType = ocrResult.documentType?.type || 'unknown';
      result.extractedData = ocrResult.structuredData;
    }

    // Step 5: AI analysis if enabled and confidence is low
    if (
      options.analyzeWithAI !== false &&
      options.privacy !== 'local' &&
      result.ocrConfidence < 80
    ) {
      options.onProgress?.({
        stage: 'analyzing',
        progress: 60,
        message: 'Understanding your document better...',
        emoji: '🤖',
      });

      const aiResult = await openAIService.analyzeDocument(
        await this.fileToBase64(result.compressedFile)
      );

      if (aiResult.success) {
        result.aiAnalysis = aiResult.data;
        // Override document type if AI is more confident
        if (aiResult.data?.confidence > result.ocrConfidence / 100) {
          result.documentType = aiResult.data.type;
        }
      }
    }

    return result;
  }

  // Validate document
  async validateDocument(file: File): Promise<any> {
    const validation = validateDocument(file);
    
    // Additional dimension check for images
    if (file.type.startsWith('image/')) {
      const dimensionCheck = await validateImageDimensions(file);
      if (!dimensionCheck.valid) {
        validation.errors.push({
          code: 'invalid_type',
          message: dimensionCheck.error || 'Invalid image dimensions',
          userMessage: dimensionCheck.error || 'This image might be too small.',
          recoverable: false,
        });
        validation.valid = false;
      }
    }

    return validation;
  }

  // Generate display name for document
  private generateDisplayName(originalName: string, documentType: string): string {
    const date = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const typeDisplay = this.getDocumentTypeDisplay(documentType);
    
    // Remove extension from original name
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    
    // Create a friendly display name
    if (documentType !== 'unknown') {
      return `${typeDisplay} - ${date}`;
    } else {
      // Use original name if type is unknown
      return `${nameWithoutExt} - ${date}`;
    }
  }

  // Get user-friendly document type display
  private getDocumentTypeDisplay(type: string): string {
    const displayMap: Record<string, string> = {
      insurance_policy: 'Insurance Policy',
      bank_statement: 'Bank Statement',
      property_deed: 'Property Deed',
      identity_card: 'ID Card',
      passport: 'Passport',
      will: 'Will',
      medical_record: 'Medical Record',
      contract: 'Contract',
      invoice: 'Invoice',
      receipt: 'Receipt',
      unknown: 'Document',
    };
    return displayMap[type] || 'Document';
  }

  // Categorize document
  private categorizeDocument(documentType: string): DocumentCategory {
    const categoryMap: Record<string, DocumentCategory> = {
      insurance_policy: 'finance',
      bank_statement: 'finance',
      property_deed: 'home',
      identity_card: 'identity',
      passport: 'identity',
      will: 'legal',
      medical_record: 'health',
      contract: 'legal',
      invoice: 'finance',
      receipt: 'finance',
    };
    return categoryMap[documentType] || 'other';
  }

  // Extract important dates
  private extractImportantDates(extractedData: any): Date[] {
    const dates: Date[] = [];
    
    if (extractedData?.issueDate) {
      dates.push(new Date(extractedData.issueDate));
    }
    
    if (extractedData?.expiryDate) {
      dates.push(new Date(extractedData.expiryDate));
    }
    
    // Add more date extraction logic based on document type
    
    return dates;
  }

  // Generate family-friendly summary
  async generateFamilySummary(document: ProcessedDocument): Promise<FamilySummary> {
    const typeDisplay = this.getDocumentTypeDisplay(document.type);
    
    // Create base summary
    const summary: FamilySummary = {
      title: `${typeDisplay} Added`,
      description: `A ${typeDisplay.toLowerCase()} has been securely stored in your family vault.`,
      keyPoints: [],
      relatedDocuments: [],
      suggestedActions: [],
    };

    // Add key points based on document type
    if (document.metadata.expiryDate) {
      const daysUntilExpiry = Math.floor(
        (document.metadata.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilExpiry < 90) {
        summary.keyPoints.push(`⚠️ Expires in ${daysUntilExpiry} days`);
        summary.suggestedActions.push('Set a reminder to renew this document');
      }
    }

    // Add type-specific suggestions
    switch (document.type) {
      case 'insurance_policy':
        summary.relatedDocuments = ['Medical Records', 'Bank Statements'];
        summary.suggestedActions.push('Review beneficiaries annually');
        summary.familyMessage = 'This insurance policy helps protect our family\'s future.';
        break;
      
      case 'will':
        summary.relatedDocuments = ['Power of Attorney', 'Insurance Policies'];
        summary.suggestedActions.push('Inform your executor about this update');
        summary.familyMessage = 'Your wishes have been safely recorded for your loved ones.';
        break;
      
      case 'property_deed':
        summary.relatedDocuments = ['Insurance Policy', 'Tax Documents'];
        summary.suggestedActions.push('Update home insurance if needed');
        summary.familyMessage = 'Your property documents are organized and secure.';
        break;
    }

    // Add extraction highlights
    if (document.extractedData) {
      if (document.extractedData.parties?.length > 0) {
        summary.keyPoints.push(`Involves: ${document.extractedData.parties.join(', ')}`);
      }
      
      if (document.extractedData.amount) {
        summary.keyPoints.push(
          `Amount: ${document.extractedData.currency || '$'}${document.extractedData.amount.toLocaleString()}`
        );
      }
    }

    return summary;
  }

  // Utility functions
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async calculateFileChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    return calculateChecksum(buffer);
  }

  private createError(
    code: string,
    message: string,
    userMessage: string,
    stage: UploadProgress['stage'],
    recoverable: boolean
  ): UploadError {
    return {
      code,
      message,
      userMessage,
      stage,
      recoverable,
    };
  }
}

// Export singleton instance
export const documentUploadService = new DocumentUploadService();
