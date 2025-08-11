import React from "react";
import { useTranslation } from "react-i18next";

const LocalPrivacyProtection = () => {
  const { t } = useTranslation("ui-common");

  const privacyData = [
    {
      title: t("settings:localPrivacyProtection.bankAccountInfo"),
      storage: t("settings:localPrivacyProtection.storedLocally"),
      encryption: t("settings:localPrivacyProtection.encryptedMasterPassword"),
      access: t("settings:localPrivacyProtection.emergencyAccessSpouse"),
      trigger: t("settings:localPrivacyProtection.trigger30DaysInactivity"),
    },
  ];

  return (
    <div>
      <h1>{t("localPrivacyProtection.title")}</h1>
      <div>
        {privacyData.map((item, index) => (
          <div key={index}>
            <h2>{item.title}</h2>
            <p>{item.storage}</p>
            <p>{item.encryption}</p>
            <p>{item.access}</p>
            <p>{item.trigger}</p>
            {/* Action Buttons */}
            <button>{t("localPrivacyProtection.changeStorage")}</button>
            <button>{t("localPrivacyProtection.modifyAccess")}</button>
            <button>{t("localPrivacyProtection.viewFamilyAccess")}</button>
          </div>
        ))}
      </div>
      <p>{t("localPrivacyProtection.privacyStatus")}</p>
      <p>{t("localPrivacyProtection.familyAccessConfigured")}</p>
    </div>
  );
};

export default LocalPrivacyProtection;
