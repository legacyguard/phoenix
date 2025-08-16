import { useState, useCallback } from 'react';
import { z } from 'zod';

/**
 * Simple validation hook for forms that don't use react-hook-form yet
 * Provides field-level validation and error messages
 */
export function useFormValidation<T extends z.ZodSchema>(
  schema: T,
  initialData: z.infer<T>
) {
  const [formData, setFormData] = useState<z.infer<T>>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof z.infer<T>, string>>>({});

  const validateField = useCallback((field: keyof z.infer<T>, value: any) => {
    try {
      // Create a partial schema for just this field
      const fieldSchema = schema.shape[field as string];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        return true;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [field]: error.errors[0]?.message || 'Invalid value'
        }));
        return false;
      }
    }
    return true;
  }, [schema]);

  const updateField = useCallback((field: keyof z.infer<T>, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Validate on change for better UX
    validateField(field, value);
  }, [validateField]);

  const validateForm = useCallback((): boolean => {
    try {
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof z.infer<T>, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof z.infer<T>] = err.message;
          }
        });
        setErrors(newErrors);
        return false;
      }
    }
    return false;
  }, [formData, schema]);

  const reset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  return {
    formData,
    setFormData,
    errors,
    updateField,
    validateField,
    validateForm,
    reset,
    hasErrors: Object.keys(errors).length > 0
  };
}

export default useFormValidation;
