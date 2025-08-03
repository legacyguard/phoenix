import { useState } from 'react';

export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<string | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setLoadingError = (message: string) => {
    setIsLoading(false);
    setError(message);
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    reset,
  };
}
