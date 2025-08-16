import React from 'react';
import { cn } from '@/lib/utils';

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CarouselNextProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface CarouselPreviousProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Carousel: React.FC<CarouselProps> = ({ 
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

export const CarouselContent: React.FC<CarouselContentProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'flex overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CarouselItem: React.FC<CarouselItemProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'min-w-0 flex-shrink-0 flex-grow-0 basis-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CarouselNext: React.FC<CarouselNextProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md border bg-background p-2 text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
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
    </button>
  );
};

export const CarouselPrevious: React.FC<CarouselPreviousProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md border bg-background p-2 text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
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
    </button>
  );
};
