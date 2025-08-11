import type { NextRequest } from 'next/server';

// Import translations from the modular structure
import enUI from '@/i18n/locales/en/ui.json';
import enErrors from '@/i18n/locales/en/errors.json';
import csUI from '@/i18n/locales/cs/ui.json';
import csErrors from '@/i18n/locales/cs/errors.json';
import skUI from '@/i18n/locales/sk/ui.json';
import skErrors from '@/i18n/locales/sk/errors.json';

type Translations = {
  ui: typeof enUI;
  errors: typeof enErrors;
};

const translations: Record<string, Translations> = {
  en: { ui: enUI, errors: enErrors },
  cs: { ui: csUI, errors: csErrors },
  sk: { ui: skUI, errors: skErrors },
};

export function getServerTranslation(locale: string = 'en') {
  const t = (key: string): string => {
    const keys = key.split('.');
    const namespace = keys[0] as keyof Translations;
    const translationKeys = keys.slice(1);
    
    const translation = translations[locale]?.[namespace] || translations.en[namespace];
    if (!translation) return key;
    
    let value: unknown = translation;
    
    for (const k of translationKeys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        value = undefined;
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };
  
  return { t };
}

export function getLocaleFromRequest(request: NextRequest): string {
  // Check for locale in cookies
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && translations[cookieLocale]) {
    return cookieLocale;
  }
  
  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',');
    for (const lang of languages) {
      const locale = lang.split('-')[0].trim();
      if (translations[locale]) {
        return locale;
      }
    }
  }
  
  return 'en';
}
