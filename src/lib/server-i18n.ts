import { NextRequest } from 'next/server';
import enTranslations from '@/i18n/locales/en/common.json';
import csTranslations from '@/i18n/locales/cs/common.json';
import skTranslations from '@/i18n/locales/sk/common.json';

type Translations = typeof enTranslations;

const translations: Record<string, Translations> = {
  en: enTranslations,
  cs: csTranslations,
  sk: skTranslations,
};

export function getServerTranslation(locale: string = 'en') {
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale] || translations.en;
    
    for (const k of keys) {
      value = value?.[k];
      if (!value) break;
    }
    
    return value || key;
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
