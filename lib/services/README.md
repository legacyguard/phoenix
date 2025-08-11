# OpenAI Integration for LegacyGuard

This directory contains the OpenAI integration that powers intelligent document analysis, life questions, and empathetic messaging throughout the LegacyGuard application.

## Overview

The OpenAI integration transforms LegacyGuard from a technical estate planning tool into an empathetic "life inventory assistant" by providing:

- 📄 **Document Analysis**: Automatic extraction of key information from uploaded documents
- 💭 **Life Questions**: Thoughtful prompts to help users capture their stories and wishes
- 🎯 **Smart Suggestions**: Context-aware recommendations for next steps
- 💝 **Empathetic Messaging**: Warm, supportive language throughout the user journey

## Setup

### 1. Environment Configuration

Add your OpenAI API key to `.env.local`:

```env
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
VITE_OPENAI_ORG_ID=org-your-org-id-here-optional  # Optional
```

### 2. Installation

The OpenAI SDK is already included in package.json. If you need to reinstall:

```bash
npm install openai
```

## Architecture

### Core Files

- **`openai.types.ts`**: TypeScript interfaces for all AI interactions
- **`openai.config.ts`**: Configuration for models, rate limits, and prompts
- **`openai.service.ts`**: Main service class with all API functions
- **`useAI.ts`**: React hook for easy component integration

### Key Features

#### 🔄 Automatic Retry Logic

- Exponential backoff for failed requests
- Handles rate limits gracefully
- User-friendly error messages

#### 💾 Intelligent Caching

- Reduces API calls and costs
- 1-hour cache TTL by default
- Automatic cache management

#### 📊 Usage Tracking

- Token counting and cost estimation
- Per-user usage limits
- Daily/monthly quotas

#### 🔒 Security

- API key never exposed to client
- Request validation and sanitization
- User authentication checks (when implemented)

## Usage Examples

### Basic Document Analysis

```typescript
import { useAI } from "@/lib/hooks/useAI";

function DocumentUpload() {
  const { analyzeDocument, isAnalyzing } = useAI();

  const handleUpload = async (file: File) => {
    const result = await analyzeDocument(file);

    if (result) {
      console.log("Document type:", result.type);
      console.log("Suggestions:", result.suggestions);

      // Show empathetic message based on document type
      if (result.type === "insurance") {
        // "Great job protecting your family's future!"
      }
    }
  };
}
```

### Life Questions with Context

```typescript
import { useLifeQuestions } from '@/lib/hooks/useAI';

function LifeStoryCapture() {
  const userProfile = {
    id: 'user-123',
    name: 'John',
    age: 45,
    documentsCount: 5,
    preferences: { communicationStyle: 'empathetic' }
  };

  const { data: question, refetch } = useLifeQuestions(userProfile);

  if (question) {
    return (
      <div>
        <h3>{question.question}</h3>
        <p>Estimated time: {question.estimatedTimeMinutes} minutes</p>
        <button onClick={() => refetch()}>Next Question</button>
      </div>
    );
  }
}
```

### Smart Action Suggestions

```typescript
import { useActionSuggestions } from '@/lib/hooks/useAI';

function Dashboard() {
  const context = {
    currentPage: 'dashboard',
    recentActions: ['uploaded_will', 'added_beneficiary'],
    documentsUploaded: 3,
    completionPercentage: 45,
    mood: 'motivated'
  };

  const { data: suggestion } = useActionSuggestions(context);

  if (suggestion) {
    return (
      <Alert>
        <h4>{suggestion.action}</h4>
        <p>{suggestion.reason}</p>
        <p>{suggestion.encouragement}</p>
      </Alert>
    );
  }
}
```

## API Functions

### `analyzeDocument(imageBase64: string)`

Analyzes document images to extract type, metadata, and provide suggestions.

**Returns**: `DocumentAnalysis` with extracted data, suggestions, and related documents.

### `generateLifeQuestion(userProfile: UserProfile)`

Creates personalized questions to help users capture their life stories.

**Returns**: `LifeQuestion` with follow-ups and time estimates.

### `suggestNextAction(context: UserContext)`

Provides context-aware suggestions for the user's next step.

**Returns**: `ActionSuggestion` with priority and encouragement.

### `extractDocumentMetadata(text: string, docType: string)`

Extracts structured data from document text.

**Returns**: `DocumentMetadata` with dates, parties, and key information.

### `generateEmpatheticMessage(scenario: string, tone: string)`

Creates supportive messages for various user scenarios.

**Returns**: Empathetic message string.

## Configuration

### Model Selection

```typescript
models: {
  simple: 'gpt-3.5-turbo',      // Cost-effective for simple tasks
  complex: 'gpt-4-turbo-preview', // Advanced analysis
  vision: 'gpt-4-vision-preview'  // Document image analysis
}
```

### Rate Limits

```typescript
rateLimits: {
  requestsPerMinute: 20,
  requestsPerHour: 100,
  requestsPerDay: 1000,
}
```

### User Limits

```typescript
userLimits: {
  daily: { free: 50, basic: 500, premium: 5000 },
  monthly: { free: 1000, basic: 10000, premium: 100000 }
}
```

## Testing

Run the test suite:

```bash
npm run test lib/services/__tests__/openai.service.test.ts
```

Tests include:

- ✅ Document analysis with fixtures
- ✅ Life question generation
- ✅ Error handling and retries
- ✅ Rate limiting
- ✅ Cost calculations
- ✅ Caching behavior

## Cost Optimization

1. **Use Appropriate Models**: Simple tasks use GPT-3.5 Turbo
2. **Enable Caching**: Reduces duplicate API calls
3. **Batch Requests**: Group similar operations when possible
4. **Monitor Usage**: Track tokens and costs per user

## Error Handling

All errors are transformed into user-friendly messages:

- **Rate Limits**: "We're processing many requests. Please wait a moment."
- **Server Errors**: "Our AI service is temporarily unavailable."
- **Invalid Requests**: "There was an issue processing your request."

## Future Enhancements

- [ ] Streaming responses for real-time feedback
- [ ] Multi-language support
- [ ] Voice transcription for life stories
- [ ] Advanced document OCR
- [ ] Sentiment analysis for emotional support
- [ ] Integration with external services (legal databases, etc.)

## Support

For issues or questions about the OpenAI integration:

1. Check the error messages in the console
2. Verify your API key is correctly set
3. Review the test files for usage examples
4. Contact the development team

Remember: The goal is to make LegacyGuard feel like a caring assistant, not a technical tool. Every AI interaction should be warm, supportive, and encouraging.
