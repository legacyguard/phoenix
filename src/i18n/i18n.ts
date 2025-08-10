import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Define available namespaces
export const namespaces = [
  'ai-assistant',
  'assets',
  'auth',
  'dashboard-main',
  'dashboard-review',
  'emails',
  'errors',
  'family-communication',
  'family-core',
  'family-emergency',
  'help',
  'landing',
  'legal',
  'lifeEvents',
  'loading-states',
  'micro-copy',
  'onboarding',
  'pricing',
  'settings',
  'sharing',
  'subscription',
  'time-capsule',
  'ui-common',
  "ui-components", "ui-elements",
  'wills'
] as const;

export type Namespace = typeof namespaces[number];

// Define supported languages
const supportedLanguages = [
  'en', 'bg', 'cs', 'cy', 'da', 'de', 'el', 'es', 'et', 'fi',
  'fr', 'ga', 'hr', 'hu', 'is', 'it', 'lt', 'lv', 'me', 'mk',
  'mt', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sq',
  'sr', 'sv', 'tr', 'uk'
];

// Initial namespaces to load (essential for app startup)
const initialNamespaces: Namespace[] = ['ui-common', 'errors'];

i18n
  // Load translation using http backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    fallbackLng: 'en',
    debug: false,
    
    // Configure namespaces
    ns: initialNamespaces,
    defaultNS: 'ui',
    fallbackNS: 'ui',
    
    // Configure backend to load from new structure
    backend: {
      loadPath: '/src/i18n/locales/{{lng}}/{{ns}}.json',
      // Allow cross-domain requests
      crossDomain: false,
      // Parse JSON responses
      parse: (data: string) => {
        try {
          // Check if the response is HTML (404 page)
          if (data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html')) {
            console.warn('Received HTML instead of JSON for translation file, returning empty object');
            return {};
          }
          const parsed = JSON.parse(data);
          // Remove _comment field if it exists
          delete parsed._comment;
          return parsed;
        } catch (e) {
          console.error('Failed to parse translation file:', e);
          return {};
        }
      }
    },
    
    interpolation: {
      escapeValue: false // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    
    // Support for nested keys
    keySeparator: '.',
    
    // React options
    react: {
      useSuspense: false, // Disable suspense to prevent loading flashes
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '', // Allow empty translations
    },
    
    // Load translation files dynamically
    partialBundledLanguages: true,
    
    // Clean empty values
    cleanCode: true,
    
    // Supported languages
    supportedLngs: supportedLanguages,
    
    // Load only language without region code
    load: 'languageOnly',
  });

// Helper function to load namespaces on demand
export const loadNamespaces = async (namespaces: Namespace | Namespace[]) => {
  const ns = Array.isArray(namespaces) ? namespaces : [namespaces];
  
  try {
    await i18n.loadNamespaces(ns);
    return true;
  } catch (error) {
    console.error('Failed to load namespaces:', ns, error);
    return false;
  }
};

// Helper hook for components to ensure namespaces are loaded
export const useNamespaces = (namespaces: Namespace | Namespace[]) => {
  const ns = Array.isArray(namespaces) ? namespaces : [namespaces];
  
  // This will trigger loading if not already loaded
  i18n.loadNamespaces(ns);
  
  return i18n.hasLoadedNamespace(ns);
};

export default i18n;
