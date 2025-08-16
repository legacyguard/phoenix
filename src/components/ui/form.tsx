import React from 'react';
import { cn } from '@/lib/utils';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {}

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const Form: React.FC<FormProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <form className={cn('space-y-6', className)} {...props}>
      {children}
    </form>
  );
};

export const FormControl: React.FC<FormControlProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};

export const FormDescription: React.FC<FormDescriptionProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
};

export const FormField: React.FC<FormFieldProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};

export const FormItem: React.FC<FormItemProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  );
};

export const FormLabel: React.FC<FormLabelProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
};

export const FormMessage: React.FC<FormMessageProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <p className={cn('text-sm font-medium text-destructive', className)} {...props}>
      {children}
    </p>
  );
};

export const useFormField = () => {
  return {
    id: '',
    name: '',
    formItemId: '',
    formDescriptionId: '',
    formMessageId: '',
  };
};
