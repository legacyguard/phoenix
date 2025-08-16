import React from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn('relative overflow-auto', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const ScrollBar: React.FC<ScrollBarProps> = ({ 
  className, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'flex touch-none select-none transition-colors',
        'h-full w-2.5 border-l border-l-transparent p-[1px]',
        className
      )}
      {...props}
    >
      <div className="relative flex-1 rounded-full bg-border" />
    </div>
  );
};
