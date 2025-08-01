import OpenAI from 'openai';
import { OPENAI_CONFIG, validateConfig } from './openai.config';
import type {
  DocumentAnalysis,
  UserProfile,
  LifeQuestion,
  UserContext,
  ActionSuggestion,
  DocumentMetadata,
  EmpatheticMessage,
  OpenAIError,
  OpenAIRequestOptions,
  TokenUsage,
  OpenAIResponse,
} from './openai.types';

// Custom error class for OpenAI errors
export class OpenAIServiceError extends Error {
  code: OpenAIError['code'];
  userMessage: string;
  retryable: boolean;
  retryAfter?: number;

  constructor(error: OpenAIError) {
    super(error.message);
    this.name = 'OpenAIServiceError';
    this.code = error.code;
    this.userMessage = error.userMessage;
    this.retryable = error.retryable;
    this.retryAfter = error.retryAfter;
  }
}

// Rate limiter implementation
class RateLimiter {
  private requests: number[] = [];
  private tokens: number[] = [];

  canMakeRequest(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;

    // Clean old requests
    this.requests = this.requests.filter(time => time > oneHourAgo);
    
    // Check rate limits
    const requestsLastMinute = this.requests.filter(time => time > oneMinuteAgo).length;
    const requestsLastHour = this.requests.length;

    return (
      requestsLastMinute < OPENAI_CONFIG.rateLimits.requestsPerMinute &&
      requestsLastHour < OPENAI_CONFIG.rateLimits.requestsPerHour
    );
  }

  recordRequest(tokens: number): void {
    const now = Date.now();
    this.requests.push(now);
    this.tokens.push(tokens);
  }

  getRetryAfter(): number {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const requestsLastMinute = this.requests.filter(time => time > oneMinuteAgo).length;

    if (requestsLastMinute >= OPENAI_CONFIG.rateLimits.requestsPerMinute) {
      const oldestRequest = Math.min(...this.requests.filter(time => time > oneMinuteAgo));
      return 60000 - (now - oldestRequest);
    }

    return 1000; // Default 1 second
  }
}

// Simple in-memory cache
class ResponseCache {
  private cache = new Map<string, { data: any; timestamp: number }>();

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > OPENAI_CONFIG.cache.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(key: string, data: any): void {
    if (this.cache.size >= OPENAI_CONFIG.cache.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Main OpenAI Service Class
class OpenAIService {
  private client: OpenAI | null = null;
  private rateLimiter = new RateLimiter();
  private cache = new ResponseCache();
  private requestQueue: Array<() => Promise<any>> = [];
  private processing = false;

  constructor() {
    if (validateConfig()) {
      this.client = new OpenAI({
        apiKey: OPENAI_CONFIG.apiKey,
        organization: OPENAI_CONFIG.organizationId || undefined,
        dangerouslyAllowBrowser: true, // Note: In production, use API routes
      });
    }
  }

  // Utility function to count tokens (approximate)
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  // Calculate cost based on token usage
  private calculateCost(tokens: TokenUsage, model: string): number {
    const pricing = OPENAI_CONFIG.pricing[model as keyof typeof OPENAI_CONFIG.pricing];
    if (!pricing) return 0;

    const promptCost = (tokens.prompt / 1000) * pricing.prompt;
    const completionCost = (tokens.completion / 1000) * pricing.completion;
    
    return Number((promptCost + completionCost).toFixed(4));
  }

  // Retry logic with exponential backoff
  private async withRetry<T>(
    fn: () => Promise<T>,
    options: OpenAIRequestOptions = {}
  ): Promise<T> {
    const maxAttempts = options.maxRetries || OPENAI_CONFIG.retry.maxAttempts;
    let attempt = 0;
    let delay = OPENAI_CONFIG.retry.initialDelay;

    while (attempt < maxAttempts) {
      try {
        if (!this.rateLimiter.canMakeRequest()) {
          const retryAfter = this.rateLimiter.getRetryAfter();
          throw new OpenAIServiceError({
            code: 'rate_limit',
            message: 'Rate limit exceeded',
            userMessage: 'We\'re processing many requests. Please wait a moment.',
            retryable: true,
            retryAfter,
          });
        }

        return await fn();
      } catch (error) {
        attempt++;
        
        if (error instanceof OpenAIServiceError) {
          if (!error.retryable || attempt >= maxAttempts) {
            throw error;
          }
          
          if (error.retryAfter) {
            delay = error.retryAfter;
          }
        } else if (error instanceof OpenAI.APIError) {
          const openAIError = this.handleOpenAIError(error);
          
          if (!openAIError.retryable || attempt >= maxAttempts) {
            throw new OpenAIServiceError(openAIError);
          }
          
          if (openAIError.retryAfter) {
            delay = openAIError.retryAfter;
          }
        } else {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * OPENAI_CONFIG.retry.backoffMultiplier, OPENAI_CONFIG.retry.maxDelay);
      }
    }

    throw new Error('Max retry attempts reached');
  }

  // Handle OpenAI API errors
  private handleOpenAIError(error: OpenAI.APIError): OpenAIError {
    if (error.status === 429) {
      return {
        code: 'rate_limit',
        message: error.message,
        userMessage: 'We\'re experiencing high demand. Please try again in a moment.',
        retryable: true,
        retryAfter: 60000,
      };
    }

    if (error.status === 401) {
      return {
        code: 'authentication',
        message: error.message,
        userMessage: 'There\'s an issue with our service. Please contact support.',
        retryable: false,
      };
    }

    if (error.status === 400) {
      return {
        code: 'invalid_request',
        message: error.message,
        userMessage: 'There was an issue processing your request. Please try again.',
        retryable: false,
      };
    }

    if (error.status && error.status >= 500) {
      return {
        code: 'server_error',
        message: error.message,
        userMessage: 'Our AI service is temporarily unavailable. Please try again later.',
        retryable: true,
        retryAfter: 5000,
      };
    }

    return {
      code: 'unknown',
      message: error.message,
      userMessage: 'An unexpected error occurred. Please try again.',
      retryable: true,
    };
  }

  // Main API method wrapper
  private async makeRequest<T>(
    cacheKey: string,
    requestFn: () => Promise<{ data: T; usage: TokenUsage }>,
    options: OpenAIRequestOptions = {}
  ): Promise<OpenAIResponse<T>> {
    try {
      // Check cache first
      if (OPENAI_CONFIG.cache.enabled) {
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return {
            success: true,
            data: cached,
            cached: true,
            timestamp: new Date(),
          };
        }
      }

      // Make the request with retry logic
      const result = await this.withRetry(requestFn, options);
      
      // Record rate limit usage
      this.rateLimiter.recordRequest(result.usage.total);

      // Cache the result
      if (OPENAI_CONFIG.cache.enabled) {
        this.cache.set(cacheKey, result.data);
      }

      return {
        success: true,
        data: result.data,
        usage: result.usage,
        cached: false,
        timestamp: new Date(),
      };
    } catch (error) {
      if (error instanceof OpenAIServiceError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            userMessage: error.userMessage,
            retryable: error.retryable,
            retryAfter: error.retryAfter,
          },
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        error: {
          code: 'unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
          userMessage: 'An unexpected error occurred. Please try again.',
          retryable: false,
        },
        timestamp: new Date(),
      };
    }
  }

  // Document Analysis Function
  async analyzeDocument(
    imageBase64: string,
    options: OpenAIRequestOptions = {}
  ): Promise<OpenAIResponse<DocumentAnalysis>> {
    if (!this.client) {
      return {
        success: false,
        error: {
          code: 'authentication',
          message: 'OpenAI client not initialized',
          userMessage: 'AI service is not configured properly.',
          retryable: false,
        },
        timestamp: new Date(),
      };
    }

    const cacheKey = `analyze_${imageBase64.substring(0, 50)}`;

    return this.makeRequest<DocumentAnalysis>(
      cacheKey,
      async () => {
        const completion = await this.client!.chat.completions.create({
          model: OPENAI_CONFIG.models.vision,
          messages: [
            {
              role: 'system',
              content: OPENAI_CONFIG.systemPrompts.documentAnalysis,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please analyze this document and extract key information. Identify the document type, extract relevant data, and suggest related documents that might be helpful.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: OPENAI_CONFIG.tokenLimits.maxCompletionTokens,
          temperature: 0.3,
          response_format: { type: 'json_object' },
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        
        const usage: TokenUsage = {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0,
          estimatedCost: 0,
        };
        
        usage.estimatedCost = this.calculateCost(usage, OPENAI_CONFIG.models.vision);

        return { data: result as DocumentAnalysis, usage };
      },
      options
    );
  }

  // Generate Life Question Function
  async generateLifeQuestion(
    userProfile: UserProfile,
    options: OpenAIRequestOptions = {}
  ): Promise<OpenAIResponse<LifeQuestion>> {
    if (!this.client) {
      return {
        success: false,
        error: {
          code: 'authentication',
          message: 'OpenAI client not initialized',
          userMessage: 'AI service is not configured properly.',
          retryable: false,
        },
        timestamp: new Date(),
      };
    }

    const cacheKey = `question_${userProfile.id}_${userProfile.documentsCount}`;

    return this.makeRequest<LifeQuestion>(
      cacheKey,
      async () => {
        const completion = await this.client!.chat.completions.create({
          model: OPENAI_CONFIG.models.simple,
          messages: [
            {
              role: 'system',
              content: OPENAI_CONFIG.systemPrompts.lifeQuestions,
            },
            {
              role: 'user',
              content: `Generate a thoughtful life question for a user with the following profile:
              Name: ${userProfile.name}
              Age: ${userProfile.age || 'Not specified'}
              Family Members: ${userProfile.familyMembers || 'Not specified'}
              Documents Uploaded: ${userProfile.documentsCount}
              Communication Style: ${userProfile.preferences?.communicationStyle || 'empathetic'}
              
              Create a question that encourages reflection on life, legacy, or family values.`,
            },
          ],
          max_tokens: 500,
          temperature: 0.8,
          response_format: { type: 'json_object' },
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        
        const usage: TokenUsage = {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0,
          estimatedCost: 0,
        };
        
        usage.estimatedCost = this.calculateCost(usage, OPENAI_CONFIG.models.simple);

        return { data: result as LifeQuestion, usage };
      },
      options
    );
  }

  // Suggest Next Action Function
  async suggestNextAction(
    context: UserContext,
    options: OpenAIRequestOptions = {}
  ): Promise<OpenAIResponse<ActionSuggestion>> {
    if (!this.client) {
      return {
        success: false,
        error: {
          code: 'authentication',
          message: 'OpenAI client not initialized',
          userMessage: 'AI service is not configured properly.',
          retryable: false,
        },
        timestamp: new Date(),
      };
    }

    const cacheKey = `action_${context.currentPage}_${context.completionPercentage}`;

    return this.makeRequest<ActionSuggestion>(
      cacheKey,
      async () => {
        const completion = await this.client!.chat.completions.create({
          model: OPENAI_CONFIG.models.simple,
          messages: [
            {
              role: 'system',
              content: OPENAI_CONFIG.systemPrompts.suggestions,
            },
            {
              role: 'user',
              content: `Suggest a helpful next action for a user with this context:
              Current Page: ${context.currentPage}
              Recent Actions: ${context.recentActions.join(', ')}
              Documents Uploaded: ${context.documentsUploaded}
              Completion: ${context.completionPercentage}%
              Mood: ${context.mood || 'neutral'}
              
              Provide an encouraging, actionable suggestion that feels manageable.`,
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
          response_format: { type: 'json_object' },
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        
        const usage: TokenUsage = {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0,
          estimatedCost: 0,
        };
        
        usage.estimatedCost = this.calculateCost(usage, OPENAI_CONFIG.models.simple);

        return { data: result as ActionSuggestion, usage };
      },
      options
    );
  }

  // Extract Document Metadata Function
  async extractDocumentMetadata(
    text: string,
    docType: string,
    options: OpenAIRequestOptions = {}
  ): Promise<OpenAIResponse<DocumentMetadata>> {
    if (!this.client) {
      return {
        success: false,
        error: {
          code: 'authentication',
          message: 'OpenAI client not initialized',
          userMessage: 'AI service is not configured properly.',
          retryable: false,
        },
        timestamp: new Date(),
      };
    }

    const cacheKey = `metadata_${docType}_${text.substring(0, 50)}`;

    return this.makeRequest<DocumentMetadata>(
      cacheKey,
      async () => {
        const completion = await this.client!.chat.completions.create({
          model: OPENAI_CONFIG.models.simple,
          messages: [
            {
              role: 'system',
              content: 'Extract structured metadata from the document text. Focus on dates, parties involved, and key information.',
            },
            {
              role: 'user',
              content: `Extract metadata from this ${docType} document:\n\n${text}`,
            },
          ],
          max_tokens: 500,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        
        const usage: TokenUsage = {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0,
          estimatedCost: 0,
        };
        
        usage.estimatedCost = this.calculateCost(usage, OPENAI_CONFIG.models.simple);

        return { data: result as DocumentMetadata, usage };
      },
      options
    );
  }

  // Generate Empathetic Message Function
  async generateEmpatheticMessage(
    scenario: string,
    tone: EmpatheticMessage['tone'] = 'supportive',
    options: OpenAIRequestOptions = {}
  ): Promise<OpenAIResponse<string>> {
    if (!this.client) {
      return {
        success: false,
        error: {
          code: 'authentication',
          message: 'OpenAI client not initialized',
          userMessage: 'AI service is not configured properly.',
          retryable: false,
        },
        timestamp: new Date(),
      };
    }

    const cacheKey = `message_${scenario}_${tone}`;

    return this.makeRequest<string>(
      cacheKey,
      async () => {
        const completion = await this.client!.chat.completions.create({
          model: OPENAI_CONFIG.models.simple,
          messages: [
            {
              role: 'system',
              content: OPENAI_CONFIG.systemPrompts.empathetic,
            },
            {
              role: 'user',
              content: `Generate a ${tone} message for this scenario: ${scenario}
              
              Keep it brief (2-3 sentences), warm, and encouraging.`,
            },
          ],
          max_tokens: 150,
          temperature: 0.8,
        });

        const message = completion.choices[0].message.content || '';
        
        const usage: TokenUsage = {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0,
          estimatedCost: 0,
        };
        
        usage.estimatedCost = this.calculateCost(usage, OPENAI_CONFIG.models.simple);

        return { data: message, usage };
      },
      options
    );
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get usage statistics
  getUsageStats(): {
    cacheSize: number;
    queueLength: number;
  } {
    return {
      cacheSize: this.cache['cache'].size,
      queueLength: this.requestQueue.length,
    };
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();
