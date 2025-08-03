import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { CountrySelector } from '@/components/common/CountrySelector';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useTranslation } from 'react-i18next';
import PublicFooter from '@/components/common/PublicFooter';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children }) => {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity">

              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">
                {t('app.name')}
              </span>
            </Link>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Country & Language Selector */}
              <CountrySelector />
              <LanguageSelector />
              
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Auth Buttons */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to={t("layout.marketingLayout.login_1")}>{t('auth.loginButton')}</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to={t("layout.marketingLayout.register_2")}>{t('auth.signupButton')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>);

};