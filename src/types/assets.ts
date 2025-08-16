/**
 * Asset types for the My Possessions feature
 * Following WARP.md principles: privacy-first, respectful UX
 */

export type AssetCategory = 
  | 'financial'
  | 'real-estate'
  | 'business'
  | 'vehicles'
  | 'valuables'
  | 'digital'
  | 'other';

export type AssetStatus = 
  | 'secured'        // All information complete, access granted to trusted people
  | 'needs-attention' // Missing important information
  | 'at-risk';       // No one has access or critical info missing

export interface Asset {
  id: string;
  userId: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  
  // Financial assets
  institution?: string;
  accountNumber?: string;
  accountType?: string;
  
  // Real estate
  address?: string;
  propertyType?: string;
  
  // General
  location?: string;
  estimatedValue?: number;
  purchaseDate?: string;
  
  // Access information
  accessInfo?: string[]; // List of trusted people who have access (legacy - for display)
  assignedPeople?: string[]; // Array of person IDs who have access to this asset
  accessInstructions?: string;
  
  // Additional details
  notes?: string;
  documents?: string[]; // IDs of related documents
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastReviewedAt?: string;
}

export interface AssetFormData {
  name: string;
  category: AssetCategory;
  institution?: string;
  accountNumber?: string;
  accountType?: string;
  address?: string;
  propertyType?: string;
  location?: string;
  estimatedValue?: number;
  purchaseDate?: string;
  accessInfo?: string[];
  accessInstructions?: string;
  notes?: string;
}
