import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SignIn } from '@clerk/clerk-react';
import { Shield } from 'lucide-react';

export const Login: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">{t('app.name')}</span>
          </div>
        </div>

        <div className="flex justify-center">
          <SignIn
            fallbackRedirectUrl="/dashboard"
            appearance={{
              variables: {
                colorPrimary: 'hsl(var(--primary))',
                colorBackground: 'hsl(var(--background))',
                colorInputBackground: 'hsl(var(--background))',
                colorInputText: 'hsl(var(--foreground))',
                colorText: 'hsl(var(--foreground))',
                colorTextSecondary: 'hsl(var(--muted-foreground))',
                borderRadius: '0.5rem',
              },
            }}
          />
        </div>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            {t('auth.noAccount')}{' '}
          </span>
          <Link 
            to="/register" 
            className="text-primary hover:text-primary/80 font-medium"
          >
            {t('auth.signUpLink')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;