import React from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {}

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
