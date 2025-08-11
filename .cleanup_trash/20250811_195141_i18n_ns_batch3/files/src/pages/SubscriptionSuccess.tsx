import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("subscription");

  return (
    <div className="container mx-auto py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">
        {t("notifications.subscriptionUpdated")}
      </h1>
      <p className="mb-6">{t("notifications.subscriptionUpdated")}</p>
      <button
        onClick={() => navigate("/dashboard")}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {t("management.manageSubscription")}
      </button>
    </div>
  );
};

export default SubscriptionSuccess;
