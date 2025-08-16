import React from 'react';
import { cn } from '@/lib/utils';

interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {}

interface MenubarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface MenubarItemProps extends React.HTMLAttributes<HTMLDivElement> {}

interface MenubarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

interface MenubarMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface MenubarSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

interface MenubarShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

interface MenubarSubProps extends React.HTMLAttributes<HTMLDivElement> {}

interface MenubarSubContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface MenubarSubTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Menubar: React.FC<MenubarProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn('flex h-10 items-center space-x-1 rounded-md border bg-background p-1', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const MenubarContent: React.FC<MenubarContentProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const MenubarItem: React.FC<MenubarItemProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const MenubarMenu: React.FC<MenubarMenuProps> = ({ 
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

export const MenubarMenuTrigger: React.FC<MenubarMenuTriggerProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const MenubarSeparator: React.FC<MenubarSeparatorProps> = ({ 
  className, 
  ...props 
}) => {
  return (
    <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
  );
};

export const MenubarShortcut: React.FC<MenubarShortcutProps> = ({ 
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

export const MenubarSub: React.FC<MenubarSubProps> = ({ 
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

export const MenubarSubContent: React.FC<MenubarSubContentProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const MenubarSubTrigger: React.FC<MenubarSubTriggerProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
