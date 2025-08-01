export interface WillRequirements {
  id: number;
  country_code: string;
  country_name: string;
  witness_count: number;
  requires_handwriting: boolean;
  requires_notarization: boolean;
  required_clauses: string[];
  forbidden_content: string[];
  legal_language: {
    title: string;
    identity: string;
    revocation: string;
    beneficiaries: string;
    signature: string;
    witness: string;
    date: string;
    soundMind?: string;
    [key: string]: string | undefined;
  };
  signature_requirements: string;
}

export interface GeneratedWill {
  id: string;
  user_id: string;
  country_code: string;
  will_content: WillContent;
  status: 'draft' | 'pending_signatures' | 'completed' | 'revoked';
  version: number;
  pdf_url?: string;
  handwriting_template_url?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface WillContent {
  testator: {
    name: string;
    birthDate: string;
    address: string;
    identification?: string;
  };
  beneficiaries: Beneficiary[];
  executor?: Executor;
  guardians?: Guardian[];
  specialBequests?: SpecialBequest[];
  finalWishes?: string;
  createdDate: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  identification?: string;
  allocation: AssetAllocation[];
  alternativeBeneficiary?: string;
}

export interface AssetAllocation {
  assetType: 'percentage' | 'specific';
  description: string;
  value?: number; // For percentage allocations
  specificAssets?: string[]; // For specific asset allocations
}

export interface Executor {
  name: string;
  relationship: string;
  address: string;
  phone?: string;
  alternativeExecutor?: {
    name: string;
    relationship: string;
    address: string;
    phone?: string;
  };
}

export interface Guardian {
  name: string;
  relationship: string;
  address: string;
  forChildren: string[]; // Names of children
}

export interface SpecialBequest {
  item: string;
  beneficiary: string;
  condition?: string;
}

export interface WillSignature {
  id: string;
  will_id: string;
  signatory_type: 'testator' | 'witness' | 'notary';
  signatory_name: string;
  signed_at?: string;
  signature_data?: string;
}

export interface WillGenerationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}
