import React from 'react';
import { cn } from '@/lib/utils';

interface ContextMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ContextMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ContextMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ContextMenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ContextMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ContextMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ContextMenuPortalProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ContextMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ContextMenuRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ContextMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ContextMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

interface ContextMenuSubProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ContextMenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ContextMenuSubTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ContextMenu: React.FC<ContextMenuProps> = ({ 
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

export const ContextMenuCheckboxItem: React.FC<ContextMenuCheckboxItemProps> = ({ 
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

export const ContextMenuContent: React.FC<ContextMenuContentProps> = ({ 
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

export const ContextMenuGroup: React.FC<ContextMenuGroupProps> = ({ 
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

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({ 
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

export const ContextMenuLabel: React.FC<ContextMenuLabelProps> = ({ 
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

export const ContextMenuPortal: React.FC<ContextMenuPortalProps> = ({ 
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

export const ContextMenuRadioGroup: React.FC<ContextMenuRadioGroupProps> = ({ 
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

export const ContextMenuRadioItem: React.FC<ContextMenuRadioItemProps> = ({ 
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

export const ContextMenuSeparator: React.FC<ContextMenuSeparatorProps> = ({ 
  className, 
  ...props 
}) => {
  return (
    <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
  );
};

export const ContextMenuShortcut: React.FC<ContextMenuShortcutProps> = ({ 
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

export const ContextMenuSub: React.FC<ContextMenuSubProps> = ({ 
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

export const ContextMenuSubContent: React.FC<ContextMenuSubContentProps> = ({ 
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

export const ContextMenuSubTrigger: React.FC<ContextMenuSubTriggerProps> = ({ 
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

export const ContextMenuTrigger: React.FC<ContextMenuTriggerProps> = ({ 
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
