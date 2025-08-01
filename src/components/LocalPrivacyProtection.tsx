import React from 'react';
import { useTranslation } from 'react-i18next';

const LocalPrivacyProtection = () => {
  const { t } = useTranslation();

  const privacyData = [
    {
      title: t('bankAccountInfo'),
      storage: t('storedLocally'),
      encryption: t('encryptedMasterPassword'),
      access: t('emergencyAccessSpouse'),
      trigger: t('trigger30DaysInactivity')
    }
  ];

  return (
    <div>
      <h1>{t('privacyProtectionTitle')}</h1>
      <div>
        {privacyData.map((item, index) => (
          <div key={index}>
            <h2>{item.title}</h2>
            <p>{item.storage}</p>
            <p>{item.encryption}</p>
            <p>{item.access}</p>
            <p>{item.trigger}</p>
            {/* Action Buttons */}
            <button>{t('changeStorage')}</button>
            <button>{t('modifyAccess')}</button>
            <button>{t('viewFamilyAccess')}</button>
          </div>
        ))}
      </div>
      <p>{t('privacyStatus')}</p>
      <p>{t('familyAccessConfigured')}</p>
    </div>
  );
};

export default LocalPrivacyProtection;

