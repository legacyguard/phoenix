/**
 * Will types for the Will Generator feature
 * Following WARP.md principles: privacy-first, respectful UX
 */

import { Person } from './people';
import { Asset } from './assets';

export interface WillPersonalInfo {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth?: string;
}

export interface WillExecutor {
  primary: string; // Person ID
  alternate?: string; // Person ID
}

export interface WillGuardian {
  primary: string; // Person ID
  alternate?: string; // Person ID
  forChildren: string[]; // Names of children
}

export interface SpecificGift {
  id: string;
  assetId: string;
  assetName: string; // Denormalized for display
  beneficiaryId: string;
  beneficiaryName: string; // Denormalized for display
  notes?: string;
}

export interface ResidualBeneficiary {
  personId: string;
  personName: string; // Denormalized for display
  percentage: number; // 0-100
}

export interface Will {
  id: string;
  userId: string;
  
  // Personal Information
  personalInfo: WillPersonalInfo;
  
  // Executor
  executor: WillExecutor;
  
  // Guardians (optional - only if user has minor children)
  guardians?: WillGuardian;
  
  // Specific Gifts/Bequests
  specificGifts: SpecificGift[];
  
  // Residual Estate Distribution
  residualBeneficiaries: ResidualBeneficiary[];
  
  // Final Wishes
  finalWishes?: string;
  specialInstructions?: string;
  
  // Metadata
  status: 'draft' | 'completed' | 'signed';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface WillWizardState {
  currentStep: number;
  totalSteps: number;
  hasMinorChildren: boolean;
  
  // Data for each step
  personalInfo: WillPersonalInfo;
  executor: WillExecutor;
  guardians?: WillGuardian;
  specificGifts: SpecificGift[];
  residualBeneficiaries: ResidualBeneficiary[];
  finalWishes: string;
  
  // Validation
  completedSteps: Set<number>;
  isValid: boolean;
}

export interface WillStepProps {
  data: WillWizardState;
  onUpdate: (updates: Partial<WillWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}
