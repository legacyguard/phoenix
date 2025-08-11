export const OPENAI_CONFIG = {
  // API Configuration
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  organizationId: import.meta.env.VITE_OPENAI_ORG_ID,

  // Model Selection
  models: {
    simple: "gpt-3.5-turbo", // For simple tasks and cost optimization
    complex: "gpt-4-turbo-preview", // For document analysis and complex reasoning
    vision: "gpt-4-vision-preview", // For image analysis
  },

  // Rate Limiting Configuration
  rateLimits: {
    requestsPerMinute: 20,
    requestsPerHour: 100,
    requestsPerDay: 1000,
    tokensPerMinute: 40000,
    tokensPerHour: 200000,
    tokensPerDay: 1000000,
  },

  // Retry Configuration
  retry: {
    maxAttempts: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2,
  },

  // Request Timeouts (in milliseconds)
  timeouts: {
    simple: 10000, // 10 seconds
    complex: 30000, // 30 seconds
    vision: 60000, // 60 seconds
  },

  // Token Limits per Request
  tokenLimits: {
    maxPromptTokens: 3000,
    maxCompletionTokens: 1000,
    maxTotalTokens: 4000,
  },

  // Cost Tracking (prices per 1K tokens in USD)
  pricing: {
    "gpt-3.5-turbo": {
      prompt: 0.0005,
      completion: 0.0015,
    },
    "gpt-4-turbo-preview": {
      prompt: 0.01,
      completion: 0.03,
    },
    "gpt-4-vision-preview": {
      prompt: 0.01,
      completion: 0.03,
    },
  },

  // Cache Configuration
  cache: {
    enabled: true,
    ttl: 3600000, // 1 hour in milliseconds
    maxSize: 100, // Maximum number of cached responses
  },

  // User Limits
  userLimits: {
    daily: {
      free: 50,
      basic: 500,
      premium: 5000,
    },
    monthly: {
      free: 1000,
      basic: 10000,
      premium: 100000,
    },
  },

  // System Prompts
  systemPrompts: {
    documentAnalysis: `You are an empathetic AI assistant helping people organize their important life documents. 
    Analyze documents with care and understanding, focusing on what matters most to families. 
    Be thorough but gentle, and always consider the emotional weight of estate planning.`,

    lifeQuestions: `You are a caring companion helping people capture their life stories and wishes. 
    Ask thoughtful, open-ended questions that encourage reflection without being intrusive. 
    Focus on preserving memories, values, and guidance for loved ones.`,

    suggestions: `You are a supportive guide helping people complete their digital legacy planning. 
    Provide gentle, encouraging suggestions that make the process feel manageable and meaningful. 
    Always acknowledge the emotional difficulty of this task.`,

    empathetic: `You are a compassionate assistant providing emotional support during estate planning. 
    Use warm, understanding language that validates feelings while encouraging progress. 
    Never be pushy or clinical - this is about people, not paperwork.`,
  },
};

// Validation function
export function validateConfig(): boolean {
  if (
    !OPENAI_CONFIG.apiKey ||
    OPENAI_CONFIG.apiKey === "sk-your-openai-api-key-here"
  ) {
    console.error(
      "OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env.local file.",
    );
    return false;
  }
  return true;
}
