// OCR Result Types
export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  processingTime: number;
  documentType?: DetectedDocumentType;
  structuredData?: ExtractedData;
  isLocalOnly: boolean;
  timestamp: Date;
}

// Region-based OCR for forms
export interface OCRRegionResult {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  pageNumber: number;
  isHandwritten?: boolean;
}

// Document type detection
export interface DetectedDocumentType {
  type: DocumentType;
  confidence: number;
  matchedPatterns: string[];
  language: "cs" | "sk" | "en" | "other";
}

export type DocumentType =
  | "insurance_policy" // pojistná smlouva
  | "bank_statement" // výpis z účtu
  | "property_deed" // list vlastnictví
  | "identity_card" // občanský průkaz
  | "passport" // pas
  | "will" // závěť
  | "medical_record" // zdravotní záznam
  | "contract" // smlouva
  | "invoice" // faktura
  | "receipt" // účtenka
  | "unknown";

// Structured data extraction
export interface ExtractedData {
  // Common fields
  documentNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  issuer?: string;

  // Person/Entity fields
  names?: string[];
  addresses?: string[];
  identificationNumbers?: string[];

  // Financial fields
  amounts?: Array<{
    value: number;
    currency: string;
    description?: string;
  }>;

  // Insurance specific
  policyNumber?: string;
  insuredPerson?: string;
  beneficiaries?: string[];
  coverageType?: string;
  premium?: number;

  // Property specific
  propertyAddress?: string;
  cadastralNumber?: string;
  ownership?: string[];

  // Custom key-value pairs
  customFields?: Record<string, string>;
}

// OCR Options
export interface OCROptions {
  localOnly?: boolean;
  language?: string;
  preprocessImage?: boolean;
  detectOrientation?: boolean;
  extractRegions?: boolean;
  documentType?: DocumentType;
  onProgress?: (progress: OCRProgress) => void;
}

// Progress tracking
export interface OCRProgress {
  status:
    | "initializing"
    | "preprocessing"
    | "recognizing"
    | "postprocessing"
    | "complete";
  progress: number; // 0-100
  message: string;
  eta?: number; // Estimated time remaining in seconds
}

// Anonymization options
export interface AnonymizationOptions {
  preserveStructure?: boolean;
  preserveDates?: boolean;
  preserveAmounts?: boolean;
  customPatterns?: RegExp[];
}

// Anonymized result
export interface AnonymizedText {
  text: string;
  removedEntities: Array<{
    type: "name" | "address" | "id_number" | "phone" | "email" | "custom";
    count: number;
  }>;
  documentStructure: {
    type: DocumentType;
    hasFinancialData: boolean;
    hasDates: boolean;
    hasSignatures: boolean;
  };
}

// Image preprocessing options
export interface PreprocessingOptions {
  resize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  enhanceContrast?: boolean;
  removeNoise?: boolean;
  deskew?: boolean;
  binarize?: boolean;
}

// OCR Error types
export interface OCRError {
  code:
    | "initialization_failed"
    | "processing_failed"
    | "unsupported_format"
    | "file_too_large"
    | "worker_error";
  message: string;
  userMessage: string;
  details?: Record<string, unknown>;
}

// Worker configuration
export interface OCRWorkerConfig {
  workerPath?: string;
  langPath?: string;
  corePath?: string;
  cacheMethod?: "write" | "refresh" | "none";
  gzip?: boolean;
  logging?: boolean;
}

// Document patterns for detection
export interface DocumentPattern {
  type: DocumentType;
  patterns: Array<{
    regex: RegExp;
    weight: number;
    language?: string;
  }>;
  requiredMatches: number;
  confidenceThreshold: number;
}
