/**
 * Document types for the Important Papers feature
 * Following WARP.md principles: privacy-first, respectful UX
 */

export type DocumentCategory = 
  | 'personal'     // Birth certificates, passports, licenses
  | 'financial'    // Bank statements, tax returns, insurance policies
  | 'legal'        // Wills, contracts, power of attorney
  | 'medical'      // Medical records, prescriptions, insurance cards
  | 'property'     // Deeds, titles, warranties
  | 'education'    // Diplomas, certificates, transcripts
  | 'other';       // Miscellaneous important documents

export type DocumentStatus = 
  | 'active'       // Current and valid
  | 'expired'      // Needs renewal or update
  | 'archived';    // Historical reference

export interface DocumentFile {
  name: string;
  type: string;         // MIME type
  size: number;         // Size in bytes
  uploadedAt: string;   // ISO date string
  url?: string;         // Optional URL if stored remotely
}

export interface Document {
  id: string;
  userId: string;
  
  // Basic Information
  name: string;
  category: DocumentCategory;
  status: DocumentStatus;
  
  // File Information
  file?: DocumentFile;
  
  // Metadata
  issueDate?: string;       // When the document was issued
  expiryDate?: string;      // When it expires (if applicable)
  documentNumber?: string;  // Reference number (passport #, policy #, etc.)
  issuingAuthority?: string; // Who issued the document
  
  // Access Control
  assignedPeople?: string[]; // Person IDs who can access this document
  tags?: string[];          // Custom tags for organization
  
  // Additional Information
  notes?: string;
  reminderDate?: string;    // Date to remind about renewal/action
  
  // System Metadata
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
}

export interface DocumentFormData {
  name: string;
  category: DocumentCategory;
  status?: DocumentStatus;
  issueDate?: string;
  expiryDate?: string;
  documentNumber?: string;
  issuingAuthority?: string;
  notes?: string;
  tags?: string[];
  reminderDate?: string;
}
