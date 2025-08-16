import React from 'react';
import { cn } from '@/lib/utils';

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {}

interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {}

interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

interface BreadcrumbListProps extends React.HTMLAttributes<HTMLOListElement> {}

interface BreadcrumbPageProps extends React.HTMLAttributes<HTMLSpanElement> {}

interface BreadcrumbSeparatorProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn('', className)}
      {...props}
    >
      {children}
    </nav>
  );
};

export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <li className={cn('inline-flex items-center gap-1', className)} {...props}>
      {children}
    </li>
  );
};

export const BreadcrumbLink: React.FC<BreadcrumbLinkProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <a
      className={cn(
        'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
};

export const BreadcrumbList: React.FC<BreadcrumbListProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <ol className={cn('flex flex-wrap items-center gap-1 break-words text-sm text-muted-foreground', className)} {...props}>
      {children}
    </ol>
  );
};

export const BreadcrumbPage: React.FC<BreadcrumbPageProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <span
      aria-current="page"
      className={cn('text-sm font-normal text-foreground', className)}
      {...props}
    >
      {children}
    </span>
  );
};

export const BreadcrumbSeparator: React.FC<BreadcrumbSeparatorProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <span
      aria-hidden
      className={cn('text-muted-foreground', className)}
      {...props}
    >
      {children || (
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9,18 15,12 9,6" />
        </svg>
      )}
    </span>
  );
};
