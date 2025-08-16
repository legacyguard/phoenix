import React from 'react';
import { cn } from '@/lib/utils';

interface InputOTPProps extends React.HTMLAttributes<HTMLDivElement> {
  maxLength?: number;
  value?: string;
  onChange?: (value: string) => void;
}

interface InputOTPGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

interface InputOTPInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  index: number;
}

interface InputOTPSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

interface InputOTPSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  char?: string;
  hasFakeCaret?: boolean;
}

export const InputOTP: React.FC<InputOTPProps> = ({ 
  className, 
  maxLength = 6,
  value = '',
  onChange,
  children, 
  ...props 
}) => {
  return (
    <div className={cn('flex items-center justify-center', className)} {...props}>
      {children}
    </div>
  );
};

export const InputOTPGroup: React.FC<InputOTPGroupProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {children}
    </div>
  );
};

export const InputOTPInput: React.FC<InputOTPInputProps> = ({ 
  className, 
  index,
  ...props 
}) => {
  return (
    <input
      type="text"
      inputMode="numeric"
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background text-center text-sm font-medium ring-offset-background transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      maxLength={1}
      {...props}
    />
  );
};

export const InputOTPSeparator: React.FC<InputOTPSeparatorProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('flex items-center justify-center', className)} {...props}>
      {children || '-'}
    </div>
  );
};

export const InputOTPSlot: React.FC<InputOTPSlotProps> = ({ 
  className, 
  char,
  hasFakeCaret,
  ...props 
}) => {
  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background text-center text-sm font-medium ring-offset-background transition-all',
        hasFakeCaret && 'animate-pulse',
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-caret-blink">
          <div className="h-4 w-px bg-foreground duration-150" />
        </div>
      )}
    </div>
  );
};
