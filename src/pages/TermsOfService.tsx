import React from 'react';
import LegalLayout from '@/components/layouts/LegalLayout';
import { useTranslation } from 'react-i18next';

const TermsOfService: React.FC = () => {
  const { t } = useTranslation('legal');
  return (
    <LegalLayout title={t('tos.title')}>
      <p className="text-lg mb-4">{t('tos.effectiveDate', { date: new Date().toLocaleDateString() })}</p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-3">{t('tos.sections.acceptance.title')}</h2>
      <p className="mb-4">
        {t('tos.sections.acceptance.body')}
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-3">{t('tos.sections.service.title')}</h2>
      <p className="mb-4">
        {t('tos.sections.service.body')}
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-3">{t('tos.sections.responsibilities.title')}</h2>
      <p className="mb-4">
        {t('tos.sections.responsibilities.body')}
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-3">{t('tos.sections.privacy.title')}</h2>
      <p className="mb-4">
        {t('tos.sections.privacy.body')}
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-3">{t('tos.sections.liability.title')}</h2>
      <p className="mb-4">
        {t('tos.sections.liability.body')}
      </p>
      
      <p className="mt-8 text-sm text-muted-foreground">
        {t('tos.disclaimer')}
      </p>
    </LegalLayout>
  );
};

export default TermsOfService;
