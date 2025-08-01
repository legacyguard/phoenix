import React from 'react';
import { useTranslation } from 'react-i18next';

export const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
      <div className="space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">{t('privacyPolicy.title')}</h1>
          <p className="text-lg text-muted-foreground">
            {t('privacyPolicy.subtitle')}
          </p>
        </header>

        <div className="prose prose-lg max-w-none">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">{t('privacyPolicy.comingSoon.title')}</h2>
            <p className="text-muted-foreground">
              {t('privacyPolicy.comingSoon.description')}
            </p>
            <p className="text-muted-foreground mt-4">
              {t('privacyPolicy.comingSoon.commitment')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;