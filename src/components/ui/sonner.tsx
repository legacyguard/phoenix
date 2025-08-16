import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

interface SonnerProps {
  className?: string;
}

export const Sonner: React.FC<SonnerProps> = ({ className }) => {
  return (
    <SonnerToaster
      className={className}
      toastOptions={{
        classNames: {
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
          description: 'text-muted-foreground',
          error: 'border-destructive bg-destructive text-destructive-foreground',
          success: 'border-green-500 bg-green-500 text-white',
          toast: 'border bg-background text-foreground',
        },
      }}
    />
  );
};
