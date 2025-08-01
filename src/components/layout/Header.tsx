import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { CountrySelector } from '@/components/common/CountrySelector';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { NotificationsBell } from '@/components/NotificationsBell';
import { useTranslation } from 'react-i18next';

export const Header: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
          <Shield className="h-8 w-8 text-accent-primary" />
            <span className="text-xl font-bold text-text-heading">
              {t('app.name')}
            </span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Country & Language Selector */}
            <CountrySelector />
            <LanguageSwitcher />
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications - Only show when signed in */}
            <SignedIn>
              <NotificationsBell />
            </SignedIn>

            {/* User Authentication */}
            <SignedIn>
              <UserButton
                appearance={{
                  variables: {
                    colorPrimary: 'hsl(var(--primary))',
                    colorBackground: 'hsl(var(--background))',
                    colorText: 'hsl(var(--foreground))',
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <div className="flex items-center space-x-2">
                <SignInButton>
                  <Button variant="ghost" size="sm">
                    {t('auth.loginButton')}
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button variant="cta" size="sm">
                    {t('auth.signUpLink')}
                  </Button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
};