import React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SelectSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const Select: React.FC<SelectProps> = ({ 
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

export const SelectContent: React.FC<SelectContentProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const SelectGroup: React.FC<SelectGroupProps> = ({ 
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

export const SelectItem: React.FC<SelectItemProps> = ({ 
  className, 
  children, 
  value,
  ...props 
}) => {
  return (
    <div
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      data-value={value}
      {...props}
    >
      {children}
    </div>
  );
};

export const SelectLabel: React.FC<SelectLabelProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('px-2 py-1.5 text-sm font-semibold', className)} {...props}>
      {children}
    </div>
  );
};

export const SelectSeparator: React.FC<SelectSeparatorProps> = ({ 
  className, 
  ...props 
}) => {
  return (
    <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <span className={cn('', className)} {...props}>
      {children}
    </span>
  );
};
