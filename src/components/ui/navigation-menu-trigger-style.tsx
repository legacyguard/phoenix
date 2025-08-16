import React from 'react';
import { cn } from '@/lib/utils';

interface NavigationMenuTriggerStyleProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
  isOpen?: boolean;
}

export const NavigationMenuTriggerStyle: React.FC<NavigationMenuTriggerStyleProps> = ({ 
  className, 
  isActive = false,
  isOpen = false,
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
        isActive && 'bg-accent/50',
        isOpen && 'bg-accent/50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
