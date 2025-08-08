import React from 'react';
import LegalLayout from '@/components/layouts/LegalLayout';
import { useTranslation } from 'react-i18next';

const RefundPolicy: React.FC = () => {
  const { t } = useTranslation('legal');
  return (
    <LegalLayout title={t('refund.title')}>
      <p className="text-lg mb-4">{t('refund.effectiveDate', { date: new Date().toLocaleDateString() })}</p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-3">{t('refund.sections.overview.title')}</h2>
      <p className="mb-4">
        {t('refund.sections.overview.body')}
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-3">{t('refund.sections.eligibility.title')}</h2>
      <p className="mb-4">
        {t('refund.sections.eligibility.body')}
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-3">{t('refund.sections.process.title')}</h2>
      <p className="mb-4">
        {t('refund.sections.process.body')}
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-3">{t('refund.sections.nonRefundable.title')}</h2>
      <p className="mb-4">
        {t('refund.sections.nonRefundable.intro')}
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>{t('refund.sections.nonRefundable.items.item1')}</li>
        <li>{t('refund.sections.nonRefundable.items.item2')}</li>
        <li>{t('refund.sections.nonRefundable.items.item3')}</li>
      </ul>
      
      <h2 className="text-2xl font-semibold mt-6 mb-3">{t('refund.sections.processingTime.title')}</h2>
      <p className="mb-4">
        {t('refund.sections.processingTime.body')}
      </p>
      
      <p className="mt-8 text-sm text-muted-foreground">
        {t('refund.disclaimer')}
      </p>
    </LegalLayout>
  );
};

export default RefundPolicy;
