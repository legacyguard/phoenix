import React from 'react';
import { cn } from '@/lib/utils';

interface ThemeSwitcherProps extends React.HTMLAttributes<HTMLDivElement> {
  currentTheme?: 'light' | 'dark' | 'system';
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  className, 
  currentTheme = 'system',
  onThemeChange,
  children, 
  ...props 
}) => {
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    onThemeChange?.(theme);
  };

  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {children || (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleThemeChange('light')}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              currentTheme === 'light' 
                ? 'bg-accent text-accent-foreground' 
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
          >
            Light
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              currentTheme === 'dark' 
                ? 'bg-accent text-accent-foreground' 
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
          >
            Dark
          </button>
          <button
            onClick={() => handleThemeChange('system')}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              currentTheme === 'system' 
                ? 'bg-accent text-accent-foreground' 
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
          >
            System
          </button>
        </div>
      )}
    </div>
  );
};
