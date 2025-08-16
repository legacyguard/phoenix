import React from 'react';
import { cn } from '@/lib/utils';

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export const Separator: React.FC<SeparatorProps> = ({ 
  className, 
  orientation = 'horizontal',
  decorative = true,
  ...props 
}) => {
  const orientationClasses = {
    horizontal: 'h-px w-full',
    vertical: 'h-full w-px'
  };

  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientationClasses[orientation],
        className
      )}
      {...props}
    />
  );
};
