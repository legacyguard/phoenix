import React from 'react';
import { cn } from '@/lib/utils';

interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: 'single' | 'multiple' | 'range';
  selected?: Date | Date[] | { from: Date; to: Date };
  onSelect?: (date: Date | Date[] | { from: Date; to: Date } | undefined) => void;
  disabled?: (date: Date) => boolean;
}

export const Calendar: React.FC<CalendarProps> = ({ 
  className, 
  mode = 'single',
  selected,
  onSelect,
  disabled,
  children, 
  ...props 
}) => {
  return (
    <div className={cn('p-3', className)} {...props}>
      {children || (
        <div className="flex h-[280px] w-full items-center justify-center text-sm text-muted-foreground">
          Calendar placeholder
        </div>
      )}
    </div>
  );
};
