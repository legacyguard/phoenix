import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

export const I18nDebug: React.FC = () => {
  const { t, i18n: hookI18n } = useTranslation();

  // Get current state
  const currentLanguage = hookI18n.language;
  const resolvedLanguage = hookI18n.resolvedLanguage;
  const resources = hookI18n.options.resources;
  const availableLanguages = Object.keys(resources || {});

  // Test translation
  const testKey = 'hero.title';
  const translatedValue = t(testKey);

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">{t("debug.i18nDebug.i18n_debug_info_1")}</h3>
      <div className="space-y-1">
        <div>{t("debug.translationTest.current_language_2")}<span className="text-green-400">{currentLanguage}</span></div>
        <div>{t("debug.i18nDebug.resolved_language_3")}<span className="text-green-400">{resolvedLanguage}</span></div>
        <div>{t("debug.translationTest.available_languages_3")}<span className="text-blue-400">{availableLanguages.join(', ')}</span></div>
        <div>{t("debug.i18nDebug.test_translation_5")}{testKey}): <span className="text-yellow-400">{translatedValue}</span></div>
        <div>{t("debug.i18nDebug.has_resources_6")}<span className="text-purple-400">{resources ? 'Yes' : 'No'}</span></div>
        {resources && currentLanguage && resources[currentLanguage] &&
        <div>{t("debug.i18nDebug.current_lang_resources_7")}<span className="text-orange-400">{Object.keys(resources[currentLanguage]).join(', ')}</span></div>
        }
      </div>
    </div>);

};