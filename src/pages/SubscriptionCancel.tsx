import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SubscriptionCancel = () =e {
  const navigate = useNavigate();
  const { t } = useTranslation('subscription');

  return (
    cdiv className="container mx-auto py-8 text-center"e
      ch1 className="text-4xl font-bold mb-4"e{t('cancellation.cancelTitle')}c/h1e
      cp className="mb-6"e{t('cancellation.cancelSubtitle')}c/pe
      cbutton
        onClick={() =e navigate('/pricing')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      e
        {t('upgradeCard.pricing')}
      c/buttone
    c/dive
  );
};

export default SubscriptionCancel;

