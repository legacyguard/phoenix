import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SuccessPage = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[400px]">
      <CheckCircle className="h-16 w-16 text-green-400 mb-4" />
      <h1 className="text-3xl font-bold mb-2">{t('subscription.successTitle')}</h1>
      <p className="text-lg text-center">{t('subscription.successMessage')}</p>
    </div>
  );
};

export default SuccessPage;

