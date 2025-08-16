import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuSubProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuSubButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface SidebarMenuSubItemProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuSubLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuSubSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuSubTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface SidebarMenuItemIconProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuItemTextProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuItemBadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuItemButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface SidebarMenuItemLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

interface SidebarMenuItemToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface SidebarMenuItemCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

interface SidebarMenuItemRadioProps extends React.InputHTMLAttributes<HTMLInputElement> {}

interface SidebarMenuItemSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

interface SidebarMenuItemTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

interface SidebarMenuItemInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

interface SidebarMenuItemLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

interface SidebarMenuItemDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuItemHintProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuItemErrorProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuItemSuccessProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuItemWarningProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarMenuItemInfoProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Sidebar: React.FC<SidebarProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('flex h-full w-full flex-col', className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarContent: React.FC<SidebarContentProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('flex-1 overflow-auto', className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('flex flex-col gap-2 p-4', className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('flex flex-col gap-2 p-4', className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('flex flex-col gap-1 p-2', className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarMenuButton: React.FC<SidebarMenuButtonProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ 
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

export const SidebarMenuLabel: React.FC<SidebarMenuLabelProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('px-3 py-2 text-xs font-semibold text-muted-foreground', className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarMenuSeparator: React.FC<SidebarMenuSeparatorProps> = ({ 
  className, 
  ...props 
}) => {
  return (
    <div className={cn('my-2 h-px bg-border', className)} {...props} />
  );
};

export const SidebarMenuSub: React.FC<SidebarMenuSubProps> = ({ 
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

export const SidebarMenuSubButton: React.FC<SidebarMenuSubButtonProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const SidebarMenuSubItem: React.FC<SidebarMenuSubItemProps> = ({ 
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

export const SidebarMenuSubLabel: React.FC<SidebarMenuSubLabelProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('px-3 py-2 text-xs font-semibold text-muted-foreground', className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarMenuSubSeparator: React.FC<SidebarMenuSubSeparatorProps> = ({ 
  className, 
  ...props 
}) => {
  return (
    <div className={cn('my-2 h-px bg-border', className)} {...props} />
  );
};

export const SidebarMenuSubTrigger: React.FC<SidebarMenuSubTriggerProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const SidebarMenuItemIcon: React.FC<SidebarMenuItemIconProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('flex h-4 w-4 items-center justify-center', className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarMenuItemText: React.FC<SidebarMenuItemTextProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('flex-1', className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarMenuItemBadge: React.FC<SidebarMenuItemBadgeProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('ml-auto', className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarMenuItemButton: React.FC<SidebarMenuItemButtonProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const SidebarMenuItemLink: React.FC<SidebarMenuItemLinkProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <a
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
};

export const SidebarMenuItemToggle: React.FC<SidebarMenuItemToggleProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const SidebarMenuItemCheckbox: React.FC<SidebarMenuItemCheckboxProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <input
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-2',
        className
      )}
      {...props}
    />
  );
};

export const SidebarMenuItemRadio: React.FC<SidebarMenuItemRadioProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <input
      type="radio"
      className={cn(
        'h-4 w-4 border-gray-300 text-primary focus:ring-primary focus:ring-offset-2',
        className
      )}
      {...props}
    />
  );
};

export const SidebarMenuItemSelect: React.FC<SidebarMenuItemSelectProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <select
      className={cn(
        'h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
};

export const SidebarMenuItemTextarea: React.FC<SidebarMenuItemTextareaProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </textarea>
  );
};

export const SidebarMenuItemInput: React.FC<SidebarMenuItemInputProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <input
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
};

export const SidebarMenuItemLabel: React.FC<SidebarMenuItemLabelProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
};

export const SidebarMenuItemDescription: React.FC<SidebarMenuItemDescriptionProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarMenuItemHint: React.FC<SidebarMenuItemHintProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('text-xs text-muted-foreground', className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarMenuItemError: React.FC<SidebarMenuItemErrorProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('text-sm text-destructive', className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarMenuItemSuccess: React.FC<SidebarMenuItemSuccessProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('text-sm text-green-600', className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarMenuItemWarning: React.FC<SidebarMenuItemWarningProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('text-sm text-amber-600', className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarMenuItemInfo: React.FC<SidebarMenuItemInfoProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('text-sm text-blue-600', className)} {...props}>
      {children}
    </div>
  );
};
