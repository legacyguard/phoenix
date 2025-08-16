import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  'aria-pressed'?: boolean;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({ 
  className, 
  children, 
  type = 'single',
  value,
  onValueChange,
  ...props 
}) => {
  return (
    <div
      className={cn('inline-flex items-center justify-center rounded-md bg-muted p-1', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const ToggleGroupItem: React.FC<ToggleGroupItemProps> = ({ 
  className, 
  children, 
  value,
  'aria-pressed': ariaPressed,
  ...props 
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm',
        className
      )}
      data-state={ariaPressed ? 'on' : 'off'}
      aria-pressed={ariaPressed}
      {...props}
    >
      {children}
    </button>
  );
};
