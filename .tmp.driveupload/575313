import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Dynamically import all translation files
const translations = import.meta.glob('./locales/*/common.json', { eager: true });

// Build resources object dynamically from imported translations
const resources = Object.entries(translations).reduce((acc, [path, content]) => {
  try {
    // Extract language code from path (e.g., './locales/en/common.json' -> 'en')
    const pathParts = path.split('/');
    const langCode = pathParts[pathParts.length - 2]; // Get the language folder name
    
    // Validate that we have valid content
    const translationContent = (content as Record<string, unknown>).default || content;
    if (!translationContent || typeof translationContent !== 'object') {
      return acc;
    }
    
    // Add the language resource to the accumulator
    acc[langCode] = { 
      common: translationContent as Record<string, unknown>
    };
    
  } catch (error) {
    // Error loading translation
  }
  
  return acc;
}, {} as Record<string, Record<string, unknown>>);

// Validation and debugging
const loadedLanguages = Object.keys(resources).sort();

// Ensure English is available as fallback
if (!resources.en) {
  // CRITICAL - English fallback language not found!
}

// Get language preference from localStorage or use fallback logic
const getInitialLanguage = (): string => {
  try {
    const savedLanguage = localStorage.getItem('legacyguard-language');
    
    // Clean up old Russian language references
    if (savedLanguage === 'ru') {
      localStorage.removeItem('legacyguard-language');
    }
    
    // In development, accept any saved language that we have resources for
    if (savedLanguage && savedLanguage !== 'ru' && resources[savedLanguage]) {
      return savedLanguage;
    }
    
    // Check browser language
    const browserLanguage = navigator.language.split('-')[0];
    if (resources[browserLanguage]) {
      return browserLanguage;
    }
    
    // Ultimate fallback to English
    return 'en';
  } catch (error) {
    // Ultimate fallback to English
    return 'en';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    },
    
    // Support all loaded languages
    supportedLngs: Object.keys(resources),
    
    // Namespace configuration
    defaultNS: 'common',
    ns: ['common'],
    
    // Debug options - remove in production
    debug: false,
    
    // Force immediate loading
    initImmediate: false,
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('legacyguard-language', lng);
});

export default i18n;