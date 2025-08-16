import React from 'react';
import { cn } from '@/lib/utils';

interface HoverCardProps extends React.HTMLAttributes<HTMLDivElement> {}

interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const HoverCard: React.FC<HoverCardProps> = ({ 
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

export const HoverCardContent: React.FC<HoverCardContentProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const HoverCardTrigger: React.FC<HoverCardTriggerProps> = ({ 
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
