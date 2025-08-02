export interface DigitalAsset {
  id: string;
  type: string;
  name: string;
  description?: string;
  value: number;
  currency: string;
  metadata?: Record<string, any>;
  ownership: {
    owner_id: string;
    backup_contacts?: string[];
    legal_status?: string;
  };
  transfer_conditions?: any[];
  encryption?: {
    algorithm: string;
    key_id: string;
    encrypted_fields: string[];
    rotation_schedule: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AssetTransfer {
  id: string;
  asset_id: string;
  from_owner: string;
  to_beneficiary: string;
  transfer_date: string;
  status: TransferStatus;
  conditions: any[];
  metadata?: Record<string, any>;
}

export interface ValueMaximization {
  assetId: string;
  strategies: ValueStrategy[];
  currentValue: number;
  projectedValue: number;
  lastOptimization: Date;
  nextReview: Date;
  riskLevel: RiskLevel;
}

export interface ValueStrategy {
  type: StrategyType;
  description: string;
  implementation: string;
  expectedReturn: number;
  risk: RiskLevel;
  timeline: string;
}

export interface CreateAssetRequest {
  type: string;
  name: string;
  description?: string;
  value: number;
  currency: string;
  metadata?: Record<string, any>;
  userId: string;
  transferConditions?: any[];
}

export interface UpdateAssetRequest {
  name?: string;
  description?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export enum TransferStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum StrategyType {
  STAKING = 'staking',
  YIELD_FARMING = 'yield_farming',
  LIQUIDITY_PROVISION = 'liquidity_provision',
  REBALANCING = 'rebalancing',
  TAX_OPTIMIZATION = 'tax_optimization'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export interface AssetMetadata {
  lastValuationDate?: string;
  valuationMethod?: string;
  marketData?: any;
  privateKey?: string;
  recoveryPhrase?: string;
  accessInstructions?: string;
  [key: string]: any;
}

export interface Beneficiary {
  id: string;
  name: string;
  email: string;
  relationship: string;
  percentage: number;
  conditions?: any[];
}

export interface ConditionType {
  type: string;
  parameters: any[];
  description: string;
}