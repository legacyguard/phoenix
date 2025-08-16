import React from 'react';
import { cn } from '@/lib/utils';

interface NavigationMenuProps extends React.HTMLAttributes<HTMLElement> {}

interface NavigationMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface NavigationMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {}

interface NavigationMenuLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

interface NavigationMenuListProps extends React.HTMLAttributes<HTMLUListElement> {}

interface NavigationMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface NavigationMenuViewportProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <nav
      className={cn('relative z-10 flex max-w-max flex-1 items-center justify-center', className)}
      {...props}
    >
      {children}
    </nav>
  );
};

export const NavigationMenuContent: React.FC<NavigationMenuContentProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'absolute left-0 top-full flex w-screen justify-center',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <li className={cn('', className)} {...props}>
      {children}
    </li>
  );
};

export const NavigationMenuLink: React.FC<NavigationMenuLinkProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <a
      className={cn(
        'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
};

export const NavigationMenuList: React.FC<NavigationMenuListProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <ul className={cn('group flex flex-1 list-none items-center justify-center space-x-1', className)} {...props}>
      {children}
    </ul>
  );
};

export const NavigationMenuTrigger: React.FC<NavigationMenuTriggerProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const NavigationMenuViewport: React.FC<NavigationMenuViewportProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
