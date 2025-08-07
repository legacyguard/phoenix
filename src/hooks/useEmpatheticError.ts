import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { logEmpatheticError, incrementRecoveryAttempts } from '@/utils/error-logging';

interface EmpatheticErrorOptions {
  context?: string;
  showToast?: boolean;
  autoRetry?: boolean;
  retryDelay?: number;
  fallbackMessage?: string;
}

export const useEmpatheticError = (options: EmpatheticErrorOptions = {}) => {
  const { t } = useTranslation('empathetic-errors');
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = useCallback(async (
    error: Error,
    operation?: () => Promise<any>
  ) => {
    // Log the error with context
    logEmpatheticError(error, undefined, options.context || 'general');

    // Determine the error type and get appropriate message
    const errorMessage = getEmpatheticMessage(error, options.context);
    
    // Show toast if enabled
    if (options.showToast !== false) {
      toast.error(errorMessage, {
        duration: 5000,
        action: operation ? {
          label: "Try Again",
          onClick: () => retryOperation(operation)
        } : undefined
      });
    }

    // Auto-retry if enabled
    if (options.autoRetry && operation && retryCount < 3) {
      setTimeout(() => {
        retryOperation(operation);
      }, options.retryDelay || 2000);
    }

    return {
      message: errorMessage,
      retry: operation ? () => retryOperation(operation) : undefined
    };
  }, [retryCount, options]);

  const retryOperation = useCallback(async (operation: () => Promise<any>) => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    incrementRecoveryAttempts(new Date());

    try {
      const result = await operation();
      toast.success(t('general.try_again') + " - Success! 🎉");
      setRetryCount(0);
      return result;
    } catch (error) {
      handleError(error as Error, operation);
    } finally {
      setIsRetrying(false);
    }
  }, [handleError, t]);

  const getEmpatheticMessage = (error: Error, context?: string): string => {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      return t('network.connection_lost');
    }
    
    // Timeout errors
    if (error.message.includes('timeout')) {
      return t('network.timeout');
    }
    
    // Validation errors
    if (error.message.includes('validation')) {
      return t('validation.required_field');
    }
    
    // Context-specific errors
    if (context) {
      const contextKey = `contextual.${context}.${error.name || 'general'}`;
      const contextMessage = t(contextKey, { defaultValue: '' });
      if (contextMessage) return contextMessage;
    }
    
    // Fallback
    return options.fallbackMessage || t('general.something_wrong');
  };

  return {
    handleError,
    isRetrying,
    retryCount
  };
};

// Specific error handlers for common scenarios
export const useNetworkError = () => {
  return useEmpatheticError({
    context: 'network',
    autoRetry: true,
    retryDelay: 3000
  });
};

export const useFormError = () => {
  return useEmpatheticError({
    context: 'form',
    showToast: true,
    autoRetry: false
  });
};

export const useSaveError = () => {
  return useEmpatheticError({
    context: 'save',
    autoRetry: true,
    retryDelay: 1000,
    fallbackMessage: "I'll keep trying to save your work - don't worry, nothing is lost."
  });
};
