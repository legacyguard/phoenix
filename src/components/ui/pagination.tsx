import React from 'react';
import { cn } from '@/lib/utils';

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {}

interface PaginationContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface PaginationEllipsisProps extends React.HTMLAttributes<HTMLSpanElement> {}

interface PaginationItemProps extends React.HTMLAttributes<HTMLLIElement> {}

interface PaginationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean;
}

interface PaginationNextProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

interface PaginationPreviousProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export const Pagination: React.FC<PaginationProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    >
      {children}
    </nav>
  );
};

export const PaginationContent: React.FC<PaginationContentProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <ul className={cn('flex flex-row items-center gap-1', className)} {...props}>
      {children}
    </ul>
  );
};

export const PaginationEllipsis: React.FC<PaginationEllipsisProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <span
      aria-hidden
      className={cn('flex h-9 w-9 items-center justify-center', className)}
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
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      )}
    </span>
  );
};

export const PaginationItem: React.FC<PaginationItemProps> = ({ 
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

export const PaginationLink: React.FC<PaginationLinkProps> = ({ 
  className, 
  isActive,
  children, 
  ...props 
}) => {
  return (
    <a
      className={cn(
        'flex h-9 min-w-[2rem] items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive && 'bg-accent text-accent-foreground',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
};

export const PaginationNext: React.FC<PaginationNextProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <a
      className={cn(
        'flex h-9 min-w-[2rem] items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
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
    </a>
  );
};

export const PaginationPrevious: React.FC<PaginationPreviousProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <a
      className={cn(
        'flex h-9 min-w-[2rem] items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
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
          <polyline points="15,18 9,12 15,6" />
        </svg>
      )}
    </a>
  );
};
