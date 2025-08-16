/**
 * People types for the My Loved Ones feature
 * Following WARP.md principles: privacy-first, respectful UX
 */

export type PersonRelationship = 
  | 'spouse'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'grandchild'
  | 'friend'
  | 'professional'
  | 'other';

export type PersonRole = 
  | 'guardian'      // Legal guardian for minor children
  | 'executor'      // Executor of estate
  | 'beneficiary'   // Beneficiary of assets
  | 'power-of-attorney' // Power of attorney
  | 'healthcare-proxy'  // Healthcare decision maker
  | 'trustee'       // Trustee of trusts
  | 'emergency-contact'; // Emergency contact

export interface Person {
  id: string;
  userId: string;
  
  // Basic Information
  fullName: string;
  relationship: PersonRelationship;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  
  // Roles & Responsibilities
  roles: PersonRole[];
  
  // Additional Context
  notes?: string;
  lastContactedAt?: string;
  
  // Trust & Access
  hasAccessToAssets?: string[]; // Asset IDs they have access to
  documentsShared?: string[];   // Document IDs shared with them
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface PersonFormData {
  fullName: string;
  relationship: PersonRelationship;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  roles: PersonRole[];
  notes?: string;
}
