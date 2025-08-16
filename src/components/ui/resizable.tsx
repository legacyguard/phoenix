import React from 'react';
import { cn } from '@/lib/utils';

interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
}

interface ResizablePanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
}

export const ResizableHandle: React.FC<ResizableHandleProps> = ({ 
  className, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'relative w-px bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-4 after:-translate-x-1/2 after:bg-transparent hover:after:bg-accent',
        className
      )}
      {...props}
    />
  );
};

export const ResizablePanel: React.FC<ResizablePanelProps> = ({ 
  className, 
  children, 
  defaultSize = 100,
  minSize = 0,
  maxSize = 100,
  ...props 
}) => {
  return (
    <div
      className={cn('relative', className)}
      style={{
        flex: defaultSize,
        minWidth: `${minSize}%`,
        maxWidth: `${maxSize}%`,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const ResizablePanelGroup: React.FC<ResizablePanelGroupProps> = ({ 
  className, 
  children, 
  direction = 'horizontal',
  ...props 
}) => {
  return (
    <div
      className={cn(
        'flex',
        direction === 'horizontal' ? 'flex-row' : 'flex-col',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
