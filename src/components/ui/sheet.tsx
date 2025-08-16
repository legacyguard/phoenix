import React from 'react';
import { cn } from '@/lib/utils';

interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'right' | 'bottom' | 'left';
}

interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

interface SheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SheetTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const Sheet: React.FC<SheetProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <div className={cn('relative', className)} {...props}>
      {children}
    </div>
  );
};

export const SheetContent: React.FC<SheetContentProps> = ({ 
  className, 
  side = 'right',
  children, 
  ...props 
}) => {
  const sideClasses = {
    top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
    right: 'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
    bottom: 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm'
  };

  return (
    <div
      className={cn(
        'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
        sideClasses[side],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const SheetHeader: React.FC<SheetHeaderProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props}>
      {children}
    </div>
  );
};

export const SheetTitle: React.FC<SheetTitleProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <h2 className={cn('text-lg font-semibold text-foreground', className)} {...props}>
      {children}
    </h2>
  );
};

export const SheetDescription: React.FC<SheetDescriptionProps> = ({ 
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

export const SheetFooter: React.FC<SheetFooterProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props}>
      {children}
    </div>
  );
};

export const SheetTrigger: React.FC<SheetTriggerProps> = ({ 
  className, 
  children, 
  asChild = false,
  ...props 
}) => {
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      ...props,
      className: cn(className, (children as React.ReactElement).props.className)
    });
  }

  return (
    <button
      className={cn('inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', className)}
      {...props}
    >
      {children}
    </button>
  );
};
