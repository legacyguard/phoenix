// Document Analysis Types
export interface DocumentAnalysis {
  type: "insurance" | "will" | "medical" | "financial" | "property" | "other";
  confidence: number;
  extractedData: {
    title?: string;
    date?: string;
    expirationDate?: string;
    parties?: string[];
    amount?: number;
    currency?: string;
    summary?: string;
    keyTerms?: string[];
  };
  suggestions: string[];
  relatedDocuments: string[];
  metadata: {
    language: string;
    pageCount?: number;
    quality: "high" | "medium" | "low";
  };
}

// User Profile for context
export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  familyMembers?: number;
  documentsCount: number;
  lastActivity?: Date;
  preferences?: {
    language?: string;
    communicationStyle?: "formal" | "casual" | "empathetic";
  };
}

// Life Question Generation
export interface LifeQuestion {
  id: string;
  question: string;
  category:
    | "family"
    | "legacy"
    | "values"
    | "memories"
    | "wishes"
    | "practical";
  priority: "high" | "medium" | "low";
  context?: string;
  followUpQuestions?: string[];
  estimatedTimeMinutes?: number;
}

// User Context for suggestions
export interface UserContext {
  currentPage: string;
  recentActions: string[];
  documentsUploaded: number;
  completionPercentage: number;
  lastInteraction?: Date;
  mood?: "motivated" | "overwhelmed" | "neutral" | "curious";
}

// Action Suggestions
export interface ActionSuggestion {
  id: string;
  action: string;
  reason: string;
  priority: "immediate" | "soon" | "eventual";
  estimatedTime: string;
  relatedTo?: string[];
  encouragement?: string;
}

// Document Metadata Extraction
export interface DocumentMetadata {
  title: string;
  type: string;
  date?: Date;
  expiration?: Date;
  parties: string[];
  tags: string[];
  summary: string;
  importance: "critical" | "important" | "reference";
  actionItems?: string[];
}

// Empathetic Message Generation
export interface EmpatheticMessage {
  message: string;
  tone: "supportive" | "encouraging" | "gentle" | "celebratory";
  includesPersonalization: boolean;
}

// API Error Types
export interface OpenAIError {
  code:
    | "rate_limit"
    | "invalid_request"
    | "authentication"
    | "server_error"
    | "unknown";
  message: string;
  userMessage: string;
  retryable: boolean;
  retryAfter?: number;
}

// Request Options
export interface OpenAIRequestOptions {
  priority?: "high" | "normal" | "low";
  maxRetries?: number;
  timeout?: number;
  userId?: string;
}

// Token Usage Tracking
export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
  estimatedCost: number;
}

// API Response Wrapper
export interface OpenAIResponse<T> {
  success: boolean;
  data?: T;
  error?: OpenAIError;
  usage?: TokenUsage;
  cached?: boolean;
  timestamp: Date;
}
