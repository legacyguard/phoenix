import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { CountrySelector } from '@/components/common/CountrySelector';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useTranslation } from 'react-i18next';

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
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-primary">
                {t('app.name')}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">{t("layout.marketingLayout.2025_legacyguard_by_codemoravi_3")}

            </div>
          </div>
        </div>
      </footer>
    </div>);

};