import React from 'react';
import { XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CancelPage = () => {
  const { t } = useTranslation('subscription');
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[400px]">
      <XCircle className="h-16 w-16 text-red-400 mb-4" />
      <h1 className="text-3xl font-bold mb-2">{t('cancellation.cancelTitle')}</h1>
      <p className="text-lg text-center">{t('cancellation.cancelSubtitle')}</p>
    </div>
  );
};

export default CancelPage;

