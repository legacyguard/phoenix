import { useState, useCallback } from 'react';

/**
 * Custom hook for managing dialog state and form data
 * Reduces duplication across Add/Edit dialogs
 */
export function useDialogState<T>(
  initialState: T,
  onClose?: () => void
) {
  const [formData, setFormData] = useState<T>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setFormData(initialState);
    setIsSubmitting(false);
    onClose?.();
  }, [initialState, onClose]);

  const handleClose = useCallback(() => {
    // Reset form data when closing
    setFormData(initialState);
    setIsSubmitting(false);
    onClose?.();
  }, [initialState, onClose]);

  return {
    formData,
    setFormData,
    updateFormData,
    isSubmitting,
    setIsSubmitting,
    reset,
    handleClose
  };
}

/**
 * Extended version with field update helper
 */
export function useDialogStateWithFields<T extends Record<string, any>>(
  initialState: T,
  onClose?: () => void
) {
  const dialogState = useDialogState(initialState, onClose);

  const updateField = useCallback((field: keyof T, value: any) => {
    dialogState.updateFormData({ [field]: value } as Partial<T>);
  }, [dialogState]);

  const handleInputChange = useCallback((field: keyof T) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateField(field, e.target.value);
    };
  }, [updateField]);

  return {
    ...dialogState,
    updateField,
    handleInputChange
  };
}

export default useDialogState;
