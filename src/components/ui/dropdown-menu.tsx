import React from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuPortalProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

interface DropdownMenuSubProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuSubTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
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

export const DropdownMenuCheckboxItem: React.FC<DropdownMenuCheckboxItemProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const DropdownMenuGroup: React.FC<DropdownMenuGroupProps> = ({ 
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

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({ 
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

export const DropdownMenuPortal: React.FC<DropdownMenuPortalProps> = ({ 
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

export const DropdownMenuRadioGroup: React.FC<DropdownMenuRadioGroupProps> = ({ 
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

export const DropdownMenuRadioItem: React.FC<DropdownMenuRadioItemProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({ 
  className, 
  ...props 
}) => {
  return (
    <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
  );
};

export const DropdownMenuShortcut: React.FC<DropdownMenuShortcutProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <span className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...props}>
      {children}
    </span>
  );
};

export const DropdownMenuSub: React.FC<DropdownMenuSubProps> = ({ 
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

export const DropdownMenuSubContent: React.FC<DropdownMenuSubContentProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const DropdownMenuSubTrigger: React.FC<DropdownMenuSubTriggerProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
    );
};

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
