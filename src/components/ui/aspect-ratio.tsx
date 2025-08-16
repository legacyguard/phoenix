import React from 'react';
import { cn } from '@/lib/utils';

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number;
}

export const AspectRatio: React.FC<AspectRatioProps> = ({ 
  className, 
  ratio = 16 / 9,
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn('relative w-full', className)}
      style={{
        aspectRatio: ratio,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
