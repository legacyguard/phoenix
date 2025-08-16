import React from 'react';
import { cn } from '@/lib/utils';

interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DrawerCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DrawerDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DrawerTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

interface DrawerTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {}

export const Drawer: React.FC<DrawerProps> = ({ 
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

export const DrawerClose: React.FC<DrawerCloseProps> = ({ 
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

export const DrawerContent: React.FC<DrawerContentProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const DrawerDescription: React.FC<DrawerDescriptionProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
};

export const DrawerFooter: React.FC<DrawerFooterProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('mt-auto flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props}>
      {children}
    </div>
  );
};

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)} {...props}>
      {children}
    </div>
  );
};

export const DrawerTitle: React.FC<DrawerTitleProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props}>
      {children}
    </h2>
  );
};

export const DrawerTrigger: React.FC<DrawerTriggerProps> = ({ 
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
