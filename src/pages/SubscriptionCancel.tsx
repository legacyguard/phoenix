import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SubscriptionCancel = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("subscription");

  return (
    <div className="container mx-auto py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">
        {t("cancellation.cancelTitle")}
      </h1>
      <p className="mb-6">{t("cancellation.cancelSubtitle")}</p>
      <button
        onClick={() => navigate("/pricing")}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {t("upgradeCard.pricing")}
      </button>
    </div>
  );
};

export default SubscriptionCancel;
