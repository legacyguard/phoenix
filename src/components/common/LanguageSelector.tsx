import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCountry } from '@/hooks/useCountry';
import { getCurrentCountryConfig, COUNTRY_CONFIGS } from '@/config/countries';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Languages, Loader2 } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation('ui');
  const { selectedCountryCode, isDetecting } = useCountry();
  
  const currentCountry = getCurrentCountryConfig();
  const selectedCountryConfig = Object.values(COUNTRY_CONFIGS).find(
    config => config.code === selectedCountryCode
  ) || currentCountry;

  const handleLanguageSelect = (languageCode: string) => {
    try {
      i18n.changeLanguage(languageCode);
    } catch (error: Record<string, unknown>) {
      console.error('[LanguageSelector] Error changing language:', error);
    }
  };

  const getLanguageName = (code: string): string => {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'de': 'Deutsch',
      'fr': 'Français',
      'es': 'Español',
      'it': 'Italiano',
      'nl': 'Nederlands',
      'pl': 'Polski',
      'cs': 'Čeština',
      'sk': 'Slovenčina',
      'da': 'Dansk',
      'sv': 'Svenska',
      'fi': 'Suomi',
      'no': 'Norsk',
      'is': 'Íslenska',
      'ga': 'Gaeilge',
      'pt': 'Português',
      'el': 'Ελληνικά',
      'hu': 'Magyar',
      'ro': 'Română',
      'bg': 'Български',
      'hr': 'Hrvatski',
      'sl': 'Slovenščina',
      'et': 'Eesti',
      'lv': 'Latviešu',
      'lt': 'Lietuvių',
      'mt': 'Malti',
      'tr': 'Türkçe',
      'uk': 'Українська',
      'me': 'Crnogorski',
      'mk': 'Македонски',
      'sq': 'Shqip',
      'sr': 'Српски',
      'ru': 'Русский',
      'bs': 'Bosanski',
      'cy': 'Cymraeg (Welsh)',
    };
    return languageNames[code] || code;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 px-3">
          {isDetecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
          <span className="hidden sm:inline text-sm font-medium">
            {isDetecting ? 'Detecting...' : getLanguageName(i18n.language)}
          </span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-48 max-h-96 overflow-y-auto">
        {selectedCountryConfig.supportedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageSelect(lang)}
            className={`flex items-center space-x-2 cursor-pointer ${
              i18n.language === lang 
                ? 'bg-primary/10 text-primary' 
                : ''
            }`}
          >
            <Languages className="h-4 w-4" />
            <span className="text-sm">{getLanguageName(lang)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};