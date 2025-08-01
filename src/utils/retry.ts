/**
 * Retry utility s podporou exponenciálneho backoff a rôznych stratégií
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number) => void;
  signal?: AbortSignal;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'retryCondition' | 'onRetry' | 'signal'>> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Vykoná funkciu s retry logikou
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      // Kontrola či nebola operácia zrušená
      if (options.signal?.aborted) {
        throw new Error('Operácia bola zrušená');
      }

      // Pokus o vykonanie funkcie
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;

      // Ak je to posledný pokus, vyhoď chybu
      if (attempt === opts.maxAttempts) {
        throw error;
      }

      // Skontroluj či má zmysel opakovať
      if (opts.retryCondition && !opts.retryCondition(error)) {
        throw error;
      }

      // Callback pre retry
      if (opts.onRetry) {
        opts.onRetry(error, attempt);
      }

      // Vypočítaj delay s exponenciálnym backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      );

      // Počkaj pred ďalším pokusom
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Helper funkcia pre čakanie
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Predefinované retry podmienky
 */
export const RetryConditions = {
  // Opakuj len pre sieťové chyby
  networkErrors: (error: any): boolean => {
    const networkErrorMessages = [
      'network',
      'fetch',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNRESET',
      'ECONNABORTED',
      'EHOSTUNREACH',
      'EPIPE',
      'EAI_AGAIN'
    ];
    
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code?.toUpperCase() || '';
    
    return networkErrorMessages.some(msg => 
      errorMessage.includes(msg.toLowerCase()) || 
      errorCode.includes(msg.toUpperCase())
    );
  },

  // Opakuj pre HTTP chyby, ktoré môžu byť dočasné
  httpRetryableErrors: (error: any): boolean => {
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(error?.status || error?.response?.status);
  },

  // Opakuj pre Supabase chyby
  supabaseErrors: (error: any): boolean => {
    const retryableCodes = [
      'PGRST301', // Moved Permanently
      '57P01', // admin_shutdown
      '57P02', // crash_shutdown
      '57P03', // cannot_connect_now
      '08001', // sqlclient_unable_to_establish_sqlconnection
      '08003', // connection_does_not_exist
      '08006', // connection_failure
    ];
    
    return retryableCodes.includes(error?.code) || 
           RetryConditions.networkErrors(error) ||
           RetryConditions.httpRetryableErrors(error);
  },

  // Kombinovaná podmienka pre bežné prípady
  default: (error: any): boolean => {
    return RetryConditions.networkErrors(error) || 
           RetryConditions.httpRetryableErrors(error);
  }
};

/**
 * Retry wrapper pre async funkcie
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    return retry(() => fn(...args), options);
  }) as T;
}

/**
 * Dekorátor pre retry (pre použitie s TypeScript dekorátormi)
 */
export function Retry(options: RetryOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return retry(() => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}

/**
 * Hook pre retry v React komponentoch
 */
export function useRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): {
  execute: () => Promise<T>;
  reset: () => void;
  isRetrying: boolean;
  attemptCount: number;
  lastError: Error | null;
} {
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [attemptCount, setAttemptCount] = React.useState(0);
  const [lastError, setLastError] = React.useState<Error | null>(null);

  const execute = React.useCallback(async () => {
    setIsRetrying(true);
    setAttemptCount(0);
    setLastError(null);

    try {
      const result = await retry(fn, {
        ...options,
        onRetry: (error, attempt) => {
          setAttemptCount(attempt);
          setLastError(error);
          options.onRetry?.(error, attempt);
        }
      });
      return result;
    } catch (error) {
      setLastError(error as Error);
      throw error;
    } finally {
      setIsRetrying(false);
    }
  }, [fn, options]);

  const reset = React.useCallback(() => {
    setIsRetrying(false);
    setAttemptCount(0);
    setLastError(null);
  }, []);

  return {
    execute,
    reset,
    isRetrying,
    attemptCount,
    lastError
  };
}

// Import React len ak je potrebný
import * as React from 'react';
