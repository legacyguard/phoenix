import React from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface TooltipProviderProps extends React.HTMLAttributes<HTMLDivElement> {}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Tooltip: React.FC<TooltipProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('relative', className)} {...props}>
      {children}
    </div>
  );
};

export const TooltipContent: React.FC<TooltipContentProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ 
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

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('inline-block', className)} {...props}>
      {children}
    </div>
  );
};
