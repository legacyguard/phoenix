import React from 'react';
import { cn } from '@/lib/utils';

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: any[];
  type?: 'line' | 'bar' | 'pie' | 'area';
  width?: number;
  height?: number;
}

export const Chart: React.FC<ChartProps> = ({ 
  className, 
  data = [],
  type = 'line',
  width = 400,
  height = 200,
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn('relative', className)}
      style={{ width, height }}
      {...props}
    >
      {children || (
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          Chart placeholder for {type} type
        </div>
      )}
    </div>
  );
};
