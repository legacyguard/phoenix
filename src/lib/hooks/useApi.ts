import { useState, useCallback, useRef } from 'react';
import { apiClient, ApiClientError } from '@/lib/api/client';

export interface UseApiOptions<T> {
  manual?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiClientError) => void;
  retryCount?: number;
  retryDelay?: number;
}

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiClientError | null;
}

export interface UseApiActions<T> {
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
}

export function useApi<T = unknown>(
  apiCall: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiState<T> & UseApiActions<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (...args: unknown[]) => {
    try {
      setLoading(true);
      setError(null);
      
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const result = await apiCall(...args);
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const apiError = err instanceof ApiClientError ? err : new ApiClientError('Unknown error');
      setError(apiError);
      options.onError?.(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [apiCall, options]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

export function useGet<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options: Omit<UseApiOptions<T>, 'manual'> = {}
) {
  return useApi<T>(
    () => apiClient.get<T>(url, { params }).then(res => res.data),
    options
  );
}

export function usePost<T = unknown>(
  url: string,
  options: Omit<UseApiOptions<T>, 'manual'> = {}
) {
  return useApi<T>(
    (data: unknown) => apiClient.post<T>(url, data).then(res => res.data),
    options
  );
}

export function usePut<T = unknown>(
  url: string,
  options: Omit<UseApiOptions<T>, 'manual'> = {}
) {
  return useApi<T>(
    (data: unknown) => apiClient.put<T>(url, data).then(res => res.data),
    options
  );
}

export function useDelete<T = unknown>(
  url: string,
  options: Omit<UseApiOptions<T>, 'manual'> = {}
) {
  return useApi<T>(
    () => apiClient.delete<T>(url).then(res => res.data),
    options
  );
}
