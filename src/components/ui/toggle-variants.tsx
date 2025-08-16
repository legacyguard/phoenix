import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleVariantsProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

export const ToggleVariants: React.FC<ToggleVariantsProps> = ({ 
  className, 
  variant = 'default',
  size = 'default',
  pressed,
  onPressedChange,
  children, 
  ...props 
}) => {
  const variantClasses = {
    default: 'bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
    outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground'
  };

  const sizeClasses = {
    default: 'h-10 px-3',
    sm: 'h-9 px-2.5',
    lg: 'h-11 px-8'
  };

  return (
    <button
      type="button"
      role="switch"
      aria-pressed={pressed}
      data-state={pressed ? 'on' : 'off'}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onClick={() => onPressedChange?.(!pressed)}
      {...props}
    >
      {children}
    </button>
  );
};
