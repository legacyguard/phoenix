import React from 'react';
import { cn } from '@/lib/utils';

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CommandDialogProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

interface CommandItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CommandShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const Command: React.FC<CommandProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CommandDialog: React.FC<CommandDialogProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-start justify-center p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CommandEmpty: React.FC<CommandEmptyProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'py-6 text-center text-sm',
        className
      )}
      {...props}
    >
      {children || 'No results found.'}
    </div>
  );
};

export const CommandGroup: React.FC<CommandGroupProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CommandInput: React.FC<CommandInputProps> = ({ 
  className, 
  ...props 
}) => {
  return (
    <div className="flex items-center border-b px-3">
      <input
        className={cn(
          'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    </div>
  );
};

export const CommandItem: React.FC<CommandItemProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const CommandList: React.FC<CommandListProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'max-h-[300px] overflow-y-auto overflow-x-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CommandSeparator: React.FC<CommandSeparatorProps> = ({ 
  className, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        '-mx-1 h-px bg-border',
        className
      )}
      {...props}
    />
  );
};

export const CommandShortcut: React.FC<CommandShortcutProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
