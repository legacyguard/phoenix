// Document upload types
import type { DocumentType } from './ocr.types';
export interface UploadOptions {
  privacy?: 'local' | 'cloud' | 'hybrid';
  compress?: boolean;
  encrypt?: boolean;
  processOCR?: boolean;
  analyzeWithAI?: boolean;
  generateThumbnail?: boolean;
  autoCategotize?: boolean;
  familySharing?: boolean;
  onProgress?: (progress: UploadProgress) => void;
}

export interface UploadProgress {
  stage: 'validating' | 'compressing' | 'reading' | 'analyzing' | 'encrypting' | 'storing' | 'complete';
  progress: number; // 0-100
  message: string;
  emoji: string;
  details?: string;
}

export interface UploadResult {
  id: string;
  status: 'success' | 'failed' | 'partial';
  document?: ProcessedDocument;
  error?: UploadError;
  summary?: FamilySummary;
  warnings?: string[];
}

export interface ProcessedDocument {
  id: string;
  originalName: string;
  displayName: string;
  type: DocumentType;
  category: DocumentCategory;
  size: number;
  uploadedAt: Date;
  
  // Storage info
  storageLocation: 'local' | 'cloud' | 'both';
  encryptionStatus: 'encrypted' | 'unencrypted';
  
  // Extracted data
  thumbnail?: string;
  ocrText?: string;
  extractedData?: Record<string, unknown>;
  aiAnalysis?: Record<string, unknown>;
  
  // Metadata
  metadata: DocumentMetadata;
  
  // Sharing
  sharingStatus?: SharingStatus;
  accessLog?: AccessLogEntry[];
}

export interface DocumentMetadata {
  mimeType: string;
  lastModified: Date;
  dimensions?: { width: number; height: number };
  pages?: number;
  
  // Extracted metadata
  documentDate?: Date;
  expiryDate?: Date;
  importantDates?: Date[];
  relatedPeople?: string[];
  monetaryAmounts?: Array<{ amount: number; currency: string }>;
  
  // System metadata
  checksum: string;
  processingTime: number;
  ocrConfidence?: number;
  aiConfidence?: number;
}

export type DocumentCategory = 
  | 'home'      // Property, utilities, maintenance
  | 'family'    // Birth certificates, photos, memories
  | 'finance'   // Bank, investments, taxes
  | 'health'    // Medical records, insurance
  | 'legal'     // Wills, contracts, power of attorney
  | 'identity'  // Passports, IDs, licenses
  | 'other';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions?: string[];
}

export interface ValidationError {
  code: 'file_too_large' | 'invalid_type' | 'corrupted' | 'virus_detected' | 'unsupported_format';
  message: string;
  userMessage: string;
  recoverable: boolean;
}

export interface ValidationWarning {
  code: 'large_file' | 'low_quality' | 'duplicate_detected' | 'missing_pages';
  message: string;
  suggestion: string;
}

export interface EncryptedFile {
  encryptedData: ArrayBuffer;
  encryptionMethod: 'AES-GCM' | 'AES-CBC';
  iv: Uint8Array;
  salt?: Uint8Array;
  metadata: {
    originalName: string;
    mimeType: string;
    size: number;
    checksum: string;
  };
}

export interface UploadError {
  code: string;
  message: string;
  userMessage: string;
  stage: UploadProgress['stage'];
  recoverable: boolean;
  retryCount?: number;
}

export interface FamilySummary {
  title: string;
  description: string;
  keyPoints: string[];
  relatedDocuments: string[];
  suggestedActions: string[];
  familyMessage?: string; // Warm message for family members
}

export interface UploadQueueItem {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStage?: UploadProgress['stage'];
  result?: UploadResult;
  error?: UploadError;
  retryCount: number;
  addedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  options?: UploadOptions;
}

export interface SharingStatus {
  isShared: boolean;
  shareLink?: string;
  shareExpiry?: Date;
  accessLevel: 'view' | 'download' | 'full';
  sharedWith: Array<{
    name: string;
    email?: string;
    relationship?: string;
    accessLevel: 'view' | 'download' | 'full';
  }>;
}

export interface AccessLogEntry {
  timestamp: Date;
  action: 'viewed' | 'downloaded' | 'shared' | 'modified';
  userInfo: {
    name?: string;
    email?: string;
    ipAddress?: string;
  };
}

// Compression options
export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

// Storage options
export interface StorageOptions {
  location: 'local' | 'cloud' | 'both';
  encrypt: boolean;
  generateBackup: boolean;
  familyVault?: boolean;
}
