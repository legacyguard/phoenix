import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';import { useTranslation } from "react-i18next";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, actualTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative transition-all duration-300 ease-in-out",
            "hover:bg-accent hover:text-accent-foreground"
          )}>

          <Sun className={cn(
            "h-5 w-5 transition-all duration-300 ease-in-out",
            actualTheme === 'dark' ? 'scale-0 rotate-90' : 'scale-100 rotate-0'
          )} />
          <Moon className={cn(
            "absolute h-5 w-5 transition-all duration-300 ease-in-out",
            actualTheme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'
          )} />
          <span className="sr-only">{t("common.themeToggle.toggle_theme_1")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            "flex items-center cursor-pointer",
            theme === 'light' && "bg-accent text-accent-foreground"
          )}>

          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            "flex items-center cursor-pointer",
            theme === 'dark' && "bg-accent text-accent-foreground"
          )}>

          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn(
            "flex items-center cursor-pointer",
            theme === 'system' && "bg-accent text-accent-foreground"
          )}>

          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>);

};