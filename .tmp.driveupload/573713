// Document AI type definitions for the LegacyGuard system

export type DocumentCategory = 
  | 'insurance_policy'
  | 'property_deed'
  | 'vehicle_title'
  | 'bank_statement'
  | 'investment_statement'
  | 'will_or_trust'
  | 'business_document'
  | 'personal_id'
  | 'tax_document'
  | 'medical_document'
  | 'other';

export type PossessionAreaId = 'home' | 'savings' | 'business' | 'valuables' | 'personal';

export interface ClassificationResult {
  category: DocumentCategory;
  confidence: number; // A score from 0 to 1
  reasoning: string; // The AI's brief explanation for its choice
  suggestedTitle?: string; // AI-suggested human-friendly title
}

export interface DocumentMetadata {
  // Core fields that apply to all documents
  documentId: string;
  category: DocumentCategory;
  uploadDate: Date;
  lastModified: Date;
  
  // AI-extracted information
  extractedText?: string;
  summary?: string;
  keyDates?: {
    effectiveDate?: Date;
    expirationDate?: Date;
    issueDate?: Date;
  };
  
  // Relationships
  relatedPossessionIds?: string[];
  relatedPersonIds?: string[];
  relatedScenarios?: Array<'hospitalized' | 'incapacitated' | 'sudden_passing'>;
  
  // Document-specific metadata (varies by category)
  specificMetadata?: InsuranceMetadata | PropertyMetadata | VehicleMetadata | FinancialMetadata;
}

// Specific metadata interfaces for different document types
export interface InsuranceMetadata {
  policyNumber?: string;
  insuranceCompany?: string;
  coverageAmount?: number;
  beneficiaries?: string[];
  premiumAmount?: number;
  policyType?: 'life' | 'health' | 'home' | 'auto' | 'disability' | 'other';
}

export interface PropertyMetadata {
  propertyAddress?: string;
  parcelNumber?: string;
  owners?: string[];
  purchasePrice?: number;
  currentValue?: number;
  mortgageInfo?: {
    lender?: string;
    accountNumber?: string;
    balance?: number;
  };
}

export interface VehicleMetadata {
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  owners?: string[];
  lienHolder?: string;
}

export interface FinancialMetadata {
  accountNumber?: string;
  institutionName?: string;
  accountType?: 'checking' | 'savings' | 'investment' | 'retirement' | 'other';
  balance?: number;
  accountHolders?: string[];
}

// OCR-specific types
export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  blocks?: TextBlock[];
}

export interface TextBlock {
  text: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

// Processing pipeline types
export interface DocumentProcessingResult {
  classification: ClassificationResult;
  ocr?: OCRResult;
  extractedMetadata?: Partial<DocumentMetadata>;
  suggestions?: {
    relatedPossessions?: Array<{
      possessionId: string;
      possessionName: string;
      confidence: number;
      reasoning: string;
    }>;
    relatedPeople?: Array<{
      personId: string;
      personName: string;
      relationship: string;
      confidence: number;
      reasoning: string;
    }>;
    relevantScenarios?: Array<{
      scenario: 'hospitalized' | 'incapacitated' | 'sudden_passing';
      importance: 'critical' | 'high' | 'medium' | 'low';
      reasoning: string;
    }>;
  };
}

// Error handling
export interface DocumentProcessingError {
  code: 'INVALID_IMAGE' | 'OCR_FAILED' | 'CLASSIFICATION_FAILED' | 'EXTRACTION_FAILED' | 'UNKNOWN';
  message: string;
  details?: Record<string, unknown>;
}

// Extracted metadata types
export interface ExtractedMetadata {
  [key: string]: string | number | string[] | undefined;
  
  // Common fields
  documentTitle?: string;
  issueDate?: string; // ISO 8601 format
  expirationDate?: string; // ISO 8601 format
  referenceNumber?: string;
  
  // Insurance specific
  policyNumber?: string;
  insurerName?: string;
  insuredName?: string;
  coverageAmount?: number;
  premiumAmount?: number;
  beneficiaries?: string[];
  policyType?: string;
  
  // Property specific
  propertyAddress?: string;
  parcelNumber?: string;
  ownerNames?: string[];
  propertyType?: string;
  assessedValue?: number;
  legalDescription?: string;
  
  // Vehicle specific
  vinNumber?: string;
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  vehicleOwners?: string[];
  
  // Financial specific
  accountNumber?: string;
  institutionName?: string;
  accountHolders?: string[];
  balance?: number;
  accountType?: string;
  routingNumber?: string;
  
  // Business specific
  businessName?: string;
  einNumber?: string;
  registrationNumber?: string;
  businessType?: string;
  registeredAgent?: string;
  
  // Personal ID specific
  fullName?: string;
  dateOfBirth?: string;
  idNumber?: string;
  address?: string;
  
  // Medical specific
  patientName?: string;
  medicalRecordNumber?: string;
  physician?: string;
  diagnosis?: string;
  
  // Will/Trust specific
  testatorName?: string;
  executorName?: string;
  trustName?: string;
  trusteeName?: string;
}

// Relationship detection interfaces
export interface RelationshipResult {
  linkedPossessionId?: string; // ID of an existing possession, e.g., the car for a car insurance policy
  linkedPersonId?: string; // ID of a person named in the document
  missingDocumentSuggestion?: string; // e.g., "We see a mortgage but no property insurance. You should add it."
  relatedDocumentIds?: string[]; // IDs of other related documents
  relationshipDetails?: {
    type: 'covers' | 'references' | 'supersedes' | 'supplements' | 'related';
    description: string;
  }[];
}

// User inventory interfaces for relationship detection
export interface Possession {
  id: string;
  name: string;
  description: string;
  familyImpact: string;
  lifeArea: 'home' | 'savings' | 'business' | 'valuables';
  relatedDocumentIds: string[];
  details?: {
    // Property details
    address?: string;
    parcelNumber?: string;
    
    // Vehicle details
    vin?: string;
    make?: string;
    model?: string;
    year?: number;
    
    // Financial details
    accountNumber?: string;
    institutionName?: string;
    
    // Business details
    einNumber?: string;
    businessName?: string;
    
    // General
    value?: number;
    [key: string]: Record<string, unknown>;
  };
  type?: string; // e.g., 'mortgage', 'property_insurance', 'vehicle', 'investment_account'
}

export interface TrustedPerson {
  id: string;
  name: string;
  relationship: string;
  avatarUrl?: string;
  responsibilities: Array<{
    id: string;
    description: string;
    relevantScenario: 'hospitalized' | 'incapacitated' | 'sudden_passing';
    relatedAssetIds?: string[];
    type: 'financial' | 'caregiving' | 'legal' | 'inheritance';
  }>;
  preparednessScore: number;
}

export interface UserInventory {
  possessions: Possession[];
  people: TrustedPerson[];
  documents?: Array<{
    id: string;
    category: DocumentCategory;
    metadata: ExtractedMetadata;
    uploadDate: Date;
  }>;
}
