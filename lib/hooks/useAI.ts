import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { openAIService } from '../services/openai.service';
import type {
  DocumentAnalysis,
  UserProfile,
  LifeQuestion,
  UserContext,
  ActionSuggestion,
  DocumentMetadata,
  OpenAIError,
  OpenAIRequestOptions,
} from '../services/openai.types';

// Hook return type
interface UseAIReturn {
  // Document Analysis
  analyzeDocument: (file: File, options?: OpenAIRequestOptions) => Promise<DocumentAnalysis | null>;
  isAnalyzing: boolean;
  analysisError: OpenAIError | null;

  // Life Questions
  generateQuestion: (profile: UserProfile, options?: OpenAIRequestOptions) => Promise<LifeQuestion | null>;
  isGeneratingQuestion: boolean;
  questionError: OpenAIError | null;

  // Action Suggestions
  suggestAction: (context: UserContext, options?: OpenAIRequestOptions) => Promise<ActionSuggestion | null>;
  isSuggestingAction: boolean;
  suggestionError: OpenAIError | null;

  // Document Metadata
  extractMetadata: (text: string, docType: string, options?: OpenAIRequestOptions) => Promise<DocumentMetadata | null>;
  isExtractingMetadata: boolean;
  metadataError: OpenAIError | null;

  // Empathetic Messages
  generateMessage: (scenario: string, tone?: 'supportive' | 'encouraging' | 'gentle' | 'celebratory') => Promise<string | null>;
  isGeneratingMessage: boolean;
  messageError: OpenAIError | null;

  // Utilities
  clearCache: () => void;
  resetErrors: () => void;
}

// Convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });
}

export function useAI(): UseAIReturn {
  const [analysisError, setAnalysisError] = useState<OpenAIError | null>(null);
  const [questionError, setQuestionError] = useState<OpenAIError | null>(null);
  const [suggestionError, setSuggestionError] = useState<OpenAIError | null>(null);
  const [metadataError, setMetadataError] = useState<OpenAIError | null>(null);
  const [messageError, setMessageError] = useState<OpenAIError | null>(null);

  // Document Analysis Mutation
  const analyzeDocumentMutation = useMutation({
    mutationFn: async ({ file, options }: { file: File; options?: OpenAIRequestOptions }) => {
      const base64 = await fileToBase64(file);
      const response = await openAIService.analyzeDocument(base64, options);
      
      if (!response.success) {
        throw response.error;
      }
      
      return response.data;
    },
    onError: (error: OpenAIError) => {
      setAnalysisError(error);
    },
  });

  // Life Question Generation Mutation
  const generateQuestionMutation = useMutation({
    mutationFn: async ({ profile, options }: { profile: UserProfile; options?: OpenAIRequestOptions }) => {
      const response = await openAIService.generateLifeQuestion(profile, options);
      
      if (!response.success) {
        throw response.error;
      }
      
      return response.data;
    },
    onError: (error: OpenAIError) => {
      setQuestionError(error);
    },
  });

  // Action Suggestion Mutation
  const suggestActionMutation = useMutation({
    mutationFn: async ({ context, options }: { context: UserContext; options?: OpenAIRequestOptions }) => {
      const response = await openAIService.suggestNextAction(context, options);
      
      if (!response.success) {
        throw response.error;
      }
      
      return response.data;
    },
    onError: (error: OpenAIError) => {
      setSuggestionError(error);
    },
  });

  // Metadata Extraction Mutation
  const extractMetadataMutation = useMutation({
    mutationFn: async ({ text, docType, options }: { text: string; docType: string; options?: OpenAIRequestOptions }) => {
      const response = await openAIService.extractDocumentMetadata(text, docType, options);
      
      if (!response.success) {
        throw response.error;
      }
      
      return response.data;
    },
    onError: (error: OpenAIError) => {
      setMetadataError(error);
    },
  });

  // Empathetic Message Generation Mutation
  const generateMessageMutation = useMutation({
    mutationFn: async ({ scenario, tone }: { scenario: string; tone?: 'supportive' | 'encouraging' | 'gentle' | 'celebratory' }) => {
      const response = await openAIService.generateEmpatheticMessage(scenario, tone);
      
      if (!response.success) {
        throw response.error;
      }
      
      return response.data;
    },
    onError: (error: OpenAIError) => {
      setMessageError(error);
    },
  });

  // Wrapper functions with error handling
  const analyzeDocument = useCallback(async (file: File, options?: OpenAIRequestOptions): Promise<DocumentAnalysis | null> => {
     
    try {
      setAnalysisError(null);
      const result = await analyzeDocumentMutation.mutateAsync({ file, options });
      return result || null;
    } catch (error) {
      console.error('Document analysis failed:', error);
      return null;
    }
  }, [analyzeDocumentMutation]);

  const generateQuestion = useCallback(async (profile: UserProfile, options?: OpenAIRequestOptions): Promise<LifeQuestion | null> => {
     
    try {
      setQuestionError(null);
      const result = await generateQuestionMutation.mutateAsync({ profile, options });
      return result || null;
    } catch (error) {
      console.error('Question generation failed:', error);
      return null;
    }
  }, [generateQuestionMutation]);

  const suggestAction = useCallback(async (context: UserContext, options?: OpenAIRequestOptions): Promise<ActionSuggestion | null> => {
     
    try {
      setSuggestionError(null);
      const result = await suggestActionMutation.mutateAsync({ context, options });
      return result || null;
    } catch (error) {
      console.error('Action suggestion failed:', error);
      return null;
    }
  }, [suggestActionMutation]);

  const extractMetadata = useCallback(async (text: string, docType: string, options?: OpenAIRequestOptions): Promise<DocumentMetadata | null> => {
     
    try {
      setMetadataError(null);
      const result = await extractMetadataMutation.mutateAsync({ text, docType, options });
      return result || null;
    } catch (error) {
      console.error('Metadata extraction failed:', error);
      return null;
    }
  }, [extractMetadataMutation]);

  const generateMessage = useCallback(async (
    scenario: string, 
    tone: 'supportive' | 'encouraging' | 'gentle' | 'celebratory' = 'supportive'
  ): Promise<string | null> => {
    try {
      setMessageError(null);
      const result = await generateMessageMutation.mutateAsync({ scenario, tone });
      return result || null;
    } catch (error) {
      console.error('Message generation failed:', error);
      return null;
    }
  }, [generateMessageMutation]);

  const clearCache = useCallback(() => {
     
    openAIService.clearCache();
  }, []);

  const resetErrors = useCallback(() => {
     
    setAnalysisError(null);
    setQuestionError(null);
    setSuggestionError(null);
    setMetadataError(null);
    setMessageError(null);
  }, []);

  return {
    // Document Analysis
    analyzeDocument,
    isAnalyzing: analyzeDocumentMutation.isPending,
    analysisError,

    // Life Questions
    generateQuestion,
    isGeneratingQuestion: generateQuestionMutation.isPending,
    questionError,

    // Action Suggestions
    suggestAction,
    isSuggestingAction: suggestActionMutation.isPending,
    suggestionError,

    // Document Metadata
    extractMetadata,
    isExtractingMetadata: extractMetadataMutation.isPending,
    metadataError,

    // Empathetic Messages
    generateMessage,
    isGeneratingMessage: generateMessageMutation.isPending,
    messageError,

    // Utilities
    clearCache,
    resetErrors,
  };
}

// Hook for cached life questions with automatic refresh
export function useLifeQuestions(userProfile: UserProfile | null, enabled = true) {
  return useQuery({
    queryKey: ['life-questions', userProfile?.id],
    queryFn: async () => {
      if (!userProfile) return null;
      
      const response = await openAIService.generateLifeQuestion(userProfile);
      if (!response.success) {
        throw response.error;
      }
      
      return response.data;
    },
    enabled: enabled && !!userProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for context-aware suggestions
export function useActionSuggestions(context: UserContext | null, enabled = true) {
  return useQuery({
    queryKey: ['action-suggestions', context?.currentPage, context?.completionPercentage],
    queryFn: async () => {
      if (!context) return null;
      
      const response = await openAIService.suggestNextAction(context);
      if (!response.success) {
        throw response.error;
      }
      
      return response.data;
    },
    enabled: enabled && !!context,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
