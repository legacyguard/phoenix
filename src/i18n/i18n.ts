import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files
import enTranslations from './locales/en/common.json';
import skTranslations from './locales/sk/common.json';
import cyTranslations from './locales/cy/common.json';

const resources = {
  en: {
    translation: enTranslations
  },
  sk: {
    translation: skTranslations
  },
  cy: {
    translation: cyTranslations
  }
};

i18n
  // Load translation using http backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    
    // Support for nested keys
    keySeparator: '.',
    
    // Default namespace
    defaultNS: 'translation',
    
    // React options
    react: {
      useSuspense: false // Disable suspense to prevent loading flashes
    }
  });

export default i18n;
