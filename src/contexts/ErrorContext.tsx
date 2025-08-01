import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

interface ErrorRecord {
  id: string;
  timestamp: Date;
  error: Error;
  errorInfo?: React.ErrorInfo;
  context?: string;
  userId?: string;
  resolved: boolean;
}

interface ErrorContextType {
  errors: ErrorRecord[];
  addError: (error: Error, errorInfo?: React.ErrorInfo, context?: string) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
  getErrorCount: () => number;
  getUnresolvedErrors: () => ErrorRecord[];
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
  maxErrors?: number;
  persistErrors?: boolean;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ 
  children, 
  maxErrors = 50,
  persistErrors = true 
}) => {
  const [errors, setErrors] = useState<ErrorRecord[]>(() => {
    if (persistErrors && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('app_error_records');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const saveErrors = useCallback((errorList: ErrorRecord[]) => {
    if (persistErrors && typeof window !== 'undefined') {
      try {
        localStorage.setItem('app_error_records', JSON.stringify(errorList));
      } catch (e) {
        console.error('Failed to persist errors:', e);
      }
    }
  }, [persistErrors]);

  const addError = useCallback((
    error: Error, 
    errorInfo?: React.ErrorInfo, 
    context?: string
  ) => {
    const newError: ErrorRecord = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      error,
      errorInfo,
      context,
      userId: undefined, // Tu môžete pridať aktuálneho používateľa
      resolved: false
    };

    setErrors(prev => {
      const updated = [newError, ...prev].slice(0, maxErrors);
      saveErrors(updated);
      return updated;
    });

    // Log do konzoly
    console.error('[ErrorProvider] Nová chyba zachytená:', {
      id: newError.id,
      context,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      errorInfo
    });

    // Zobraz toast v development
    if (process.env.NODE_ENV === 'development') {
      toast.error(`Chyba: ${error.message}`, {
        description: context || 'Neznámy kontext',
        action: {
          label: 'Zobraziť',
          onClick: () => {
            // Tu môžete otvoriť debug panel alebo zobrazit detaily
            console.log('Error details:', newError);
          }
        }
      });
    }
  }, [maxErrors, saveErrors]);

  const clearError = useCallback((id: string) => {
    setErrors(prev => {
      const updated = prev.map(err => 
        err.id === id ? { ...err, resolved: true } : err
      );
      saveErrors(updated);
      return updated;
    });
  }, [saveErrors]);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
    if (persistErrors && typeof window !== 'undefined') {
      localStorage.removeItem('app_error_records');
    }
  }, [persistErrors]);

  const getErrorCount = useCallback(() => {
    return errors.filter(err => !err.resolved).length;
  }, [errors]);

  const getUnresolvedErrors = useCallback(() => {
    return errors.filter(err => !err.resolved);
  }, [errors]);

  const value: ErrorContextType = {
    errors,
    addError,
    clearError,
    clearAllErrors,
    getErrorCount,
    getUnresolvedErrors
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};
