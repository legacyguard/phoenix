import React from "react";
import { useTranslation } from "react-i18next";

export const TranslationTest: React.FC = () => {
  const { t, i18n } = useTranslation("ui-common");

  const statsKeys = [
    "dashboard.stats.totalAssets",
    "dashboard.stats.activeAssetsManaged",
    "dashboard.stats.activeGuardians",
    "dashboard.stats.trustedGuardians",
    "dashboard.stats.beneficiaries",
    "dashboard.stats.legacyRecipients",
    "dashboard.stats.securityScore",
    "dashboard.stats.securityScoreValue",
    "dashboard.stats.excellent",
    "dashboard.stats.good",
    "dashboard.stats.needsImprovement",
  ];

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">
        {t("help.translationTest.translation_debug_test_1")}
      </h2>
      <p className="mb-2">
        {t("help.translationTest.current_language_2")}
        {i18n.language}
      </p>
      <p className="mb-4">
        {t("help.translationTest.available_languages_3")}
        {Object.keys(i18n.store.data).join(", ")}
      </p>

      <h3 className="text-lg font-semibold mb-2">
        {t("help.translationTest.dashboard_stats_translations_4")}
      </h3>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Key</th>
            <th className="text-left p-2">Translation</th>
            <th className="text-left p-2">
              {t("help.translationTest.exists_5")}
            </th>
          </tr>
        </thead>
        <tbody>
          {statsKeys.map((key) => (
            <tr key={key} className="border-b">
              <td className="p-2 font-mono text-sm">{key}</td>
              <td className="p-2">{t(key)}</td>
              <td className="p-2">{t(key) !== key ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-lg font-semibold mt-4 mb-2">
        {t("help.translationTest.raw_resource_check_6")}
      </h3>
      <pre className="bg-white p-2 rounded text-xs overflow-auto">
        {JSON.stringify(
          i18n.store.data[i18n.language]?.common?.dashboard?.stats,
          null,
          2,
        )}
      </pre>
    </div>
  );
};
