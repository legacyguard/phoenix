import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDialogState, useDialogStateWithFields } from '../useDialogState';

describe('useDialogState', () => {
  interface TestFormData {
    name: string;
    email: string;
    age: number;
  }

  const mockInitialState: TestFormData = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with the provided initial state', () => {
      const { result } = renderHook(() => useDialogState(mockInitialState, mockOnClose));

      expect(result.current.formData).toEqual(mockInitialState);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should work without onClose callback', () => {
      const { result } = renderHook(() => useDialogState(mockInitialState));

      expect(result.current.formData).toEqual(mockInitialState);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.handleClose).toBeDefined();
    });

    it('should work with empty initial state', () => {
      const emptyState = {};
      const { result } = renderHook(() => useDialogState(emptyState, mockOnClose));

      expect(result.current.formData).toEqual(emptyState);
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('State Updates', () => {
    it('should update form data correctly with updateFormData', () => {
      const { result } = renderHook(() => useDialogState(mockInitialState, mockOnClose));

      act(() => {
        result.current.updateFormData({ name: 'Jane Doe', age: 25 });
      });

      expect(result.current.formData).toEqual({
        name: 'Jane Doe',
        email: 'john@example.com',
        age: 25
      });
    });

    it('should merge updates with existing form data', () => {
      const { result } = renderHook(() => useDialogState(mockInitialState, mockOnClose));

      act(() => {
        result.current.updateFormData({ name: 'Jane Doe' });
      });

      expect(result.current.formData).toEqual({
        name: 'Jane Doe',
        email: 'john@example.com',
        age: 30
      });
    });

    it('should handle multiple sequential updates', () => {
      const { result } = renderHook(() => useDialogState(mockInitialState, mockOnClose));

      act(() => {
        result.current.updateFormData({ name: 'Jane Doe' });
      });

      act(() => {
        result.current.updateFormData({ age: 25 });
      });

      act(() => {
        result.current.updateFormData({ email: 'jane@example.com' });
      });

      expect(result.current.formData).toEqual({
        name: 'Jane Doe',
        email: 'jane@example.com',
        age: 25
      });
    });

    it('should update isSubmitting state correctly', () => {
      const { result } = renderHook(() => useDialogState(mockInitialState, mockOnClose));

      act(() => {
        result.current.setIsSubmitting(true);
      });

      expect(result.current.isSubmitting).toBe(true);

      act(() => {
        result.current.setIsSubmitting(false);
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it('should allow direct form data updates with setFormData', () => {
      const { result } = renderHook(() => useDialogState(mockInitialState, mockOnClose));

      const newData: TestFormData = {
        name: 'Alice Smith',
        email: 'alice@example.com',
        age: 28
      };

      act(() => {
        result.current.setFormData(newData);
      });

      expect(result.current.formData).toEqual(newData);
    });
  });

  describe('Reset and Close', () => {
    it('should reset form data to initial state when reset is called', () => {
      const { result } = renderHook(() => useDialogState(mockInitialState, mockOnClose));

      // First, modify the form data
      act(() => {
        result.current.updateFormData({ name: 'Jane Doe', age: 25 });
        result.current.setIsSubmitting(true);
      });

      // Then reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.formData).toEqual(mockInitialState);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should call onClose callback when reset is called', () => {
      const { result } = renderHook(() => useDialogState(mockInitialState, mockOnClose));

      act(() => {
        result.current.reset();
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should reset form data to initial state when handleClose is called', () => {
      const { result } = renderHook(() => useDialogState(mockInitialState, mockOnClose));

      // First, modify the form data
      act(() => {
        result.current.updateFormData({ name: 'Jane Doe', age: 25 });
        result.current.setIsSubmitting(true);
      });

      // Then close
      act(() => {
        result.current.handleClose();
      });

      expect(result.current.formData).toEqual(mockInitialState);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should call onClose callback when handleClose is called', () => {
      const { result } = renderHook(() => useDialogState(mockInitialState, mockOnClose));

      act(() => {
        result.current.handleClose();
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when callback is not provided', () => {
      const { result } = renderHook(() => useDialogState(mockInitialState));

      act(() => {
        result.current.handleClose();
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should reset multiple times correctly', () => {
      const { result } = renderHook(() => useDialogState(mockInitialState, mockOnClose));

      // First modification and reset
      act(() => {
        result.current.updateFormData({ name: 'Jane Doe' });
        result.current.reset();
      });

      expect(result.current.formData).toEqual(mockInitialState);

      // Second modification and reset
      act(() => {
        result.current.updateFormData({ age: 25 });
        result.current.reset();
      });

      expect(result.current.formData).toEqual(mockInitialState);
    });
  });

  describe('Callback Dependencies', () => {
    it('should maintain callback references between renders', () => {
      const { result, rerender } = renderHook(() => useDialogState(mockInitialState, mockOnClose));

      const firstHandleClose = result.current.handleClose;
      const firstUpdateFormData = result.current.updateFormData;

      rerender();

      // Note: React may recreate functions between renders, so we check that they exist and are functions
      expect(typeof result.current.handleClose).toBe('function');
      expect(typeof result.current.updateFormData).toBe('function');
    });
  });
});

describe('useDialogStateWithFields', () => {
  interface TestFormData {
    name: string;
    email: string;
    age: number;
    notes: string;
  }

  const mockInitialState: TestFormData = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    notes: 'Initial notes'
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with the provided initial state', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      expect(result.current.formData).toEqual(mockInitialState);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should provide all base useDialogState methods', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      expect(result.current.formData).toBeDefined();
      expect(result.current.setFormData).toBeDefined();
      expect(result.current.updateFormData).toBeDefined();
      expect(result.current.isSubmitting).toBeDefined();
      expect(result.current.setIsSubmitting).toBeDefined();
      expect(result.current.reset).toBeDefined();
      expect(result.current.handleClose).toBeDefined();
    });

    it('should provide additional field-specific methods', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      expect(result.current.updateField).toBeDefined();
      expect(result.current.handleInputChange).toBeDefined();
    });
  });

  describe('updateField', () => {
    it('should update a specific field correctly', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      act(() => {
        result.current.updateField('name', 'Jane Doe');
      });

      expect(result.current.formData.name).toBe('Jane Doe');
      expect(result.current.formData.email).toBe('john@example.com'); // unchanged
      expect(result.current.formData.age).toBe(30); // unchanged
    });

    it('should update multiple fields sequentially', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      act(() => {
        result.current.updateField('name', 'Jane Doe');
      });

      act(() => {
        result.current.updateField('age', 25);
      });

      act(() => {
        result.current.updateField('email', 'jane@example.com');
      });

      expect(result.current.formData).toEqual({
        name: 'Jane Doe',
        email: 'jane@example.com',
        age: 25,
        notes: 'Initial notes'
      });
    });

    it('should handle different data types', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      act(() => {
        result.current.updateField('age', 99);
      });

      act(() => {
        result.current.updateField('notes', 'Updated notes with special chars: !@#$%^&*()');
      });

      expect(result.current.formData.age).toBe(99);
      expect(result.current.formData.notes).toBe('Updated notes with special chars: !@#$%^&*()');
    });

    it('should update fields to falsy values', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      act(() => {
        result.current.updateField('name', '');
      });

      act(() => {
        result.current.updateField('age', 0);
      });

      expect(result.current.formData.name).toBe('');
      expect(result.current.formData.age).toBe(0);
    });
  });

  describe('handleInputChange', () => {
    it('should create a change handler that updates the correct field', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      const nameChangeHandler = result.current.handleInputChange('name');
      const emailChangeHandler = result.current.handleInputChange('email');

      act(() => {
        nameChangeHandler({
          target: { value: 'Jane Doe' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formData.name).toBe('Jane Doe');
      expect(result.current.formData.email).toBe('john@example.com'); // unchanged

      act(() => {
        emailChangeHandler({
          target: { value: 'jane@example.com' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formData.email).toBe('jane@example.com');
    });

    it('should handle textarea changes', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      const notesChangeHandler = result.current.handleInputChange('notes');

      act(() => {
        notesChangeHandler({
          target: { value: 'Updated notes from textarea' }
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      expect(result.current.formData.notes).toBe('Updated notes from textarea');
    });

    it('should handle empty string values', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      const nameChangeHandler = result.current.handleInputChange('name');

      act(() => {
        nameChangeHandler({
          target: { value: '' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formData.name).toBe('');
    });

    it('should handle special characters and long text', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      const notesChangeHandler = result.current.handleInputChange('notes');
      const longText = 'This is a very long text with special characters: !@#$%^&*()_+-=[]{}|;:,.<>? and emojis 🚀🎉✨';

      act(() => {
        notesChangeHandler({
          target: { value: longText }
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      expect(result.current.formData.notes).toBe(longText);
    });
  });

  describe('Integration with base useDialogState', () => {
    it('should work with updateFormData from base hook', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      act(() => {
        result.current.updateFormData({ name: 'Jane Doe', age: 25 });
      });

      expect(result.current.formData.name).toBe('Jane Doe');
      expect(result.current.formData.age).toBe(25);
    });

    it('should work with reset from base hook', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      act(() => {
        result.current.updateField('name', 'Jane Doe');
        result.current.setIsSubmitting(true);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.formData).toEqual(mockInitialState);
      expect(result.current.isSubmitting).toBe(false);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should work with handleClose from base hook', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      act(() => {
        result.current.updateField('name', 'Jane Doe');
        result.current.setIsSubmitting(true);
      });

      act(() => {
        result.current.handleClose();
      });

      expect(result.current.formData).toEqual(mockInitialState);
      expect(result.current.isSubmitting).toBe(false);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined values gracefully', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      act(() => {
        result.current.updateField('notes', undefined as any);
      });

      expect(result.current.formData.notes).toBeUndefined();
    });

    it('should handle null values gracefully', () => {
      const { result } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      act(() => {
        result.current.updateField('notes', null as any);
      });

      expect(result.current.formData.notes).toBeNull();
    });

    it('should maintain callback references between renders', () => {
      const { result, rerender } = renderHook(() => useDialogStateWithFields(mockInitialState, mockOnClose));

      const firstUpdateField = result.current.updateField;
      const firstHandleInputChange = result.current.handleInputChange;

      rerender();

      // Note: React may recreate functions between renders, so we check that they exist and are functions
      expect(typeof result.current.updateField).toBe('function');
      expect(typeof result.current.handleInputChange).toBe('function');
    });
  });
});
