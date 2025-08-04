import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCountry } from '@/contexts/CountryContext';
import { getCurrentCountryConfig, COUNTRY_CONFIGS } from '@/config/countries';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Languages } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const { selectedCountryCode } = useCountry();
  
  const currentCountry = getCurrentCountryConfig();
  const selectedCountryConfig = Object.values(COUNTRY_CONFIGS).find(
    config => config.code === selectedCountryCode
  ) || currentCountry;

  const handleLanguageSelect = (languageCode: string) => {
    try {
      i18n.changeLanguage(languageCode);
    } catch (error) {
      // Error changing language
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
      'uk': 'Українська'
    };
    return languageNames[code] || code.toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 px-3">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline text-sm font-medium">
            {getLanguageName(i18n.language)}
          </span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-48 bg-background border">
        {selectedCountryConfig.supportedLanguages.map((langCode) => (
          <DropdownMenuItem
            key={langCode}
            onClick={() => handleLanguageSelect(langCode)}
            className={`cursor-pointer ${
              i18n.language === langCode 
                ? 'bg-primary/10 text-primary font-medium' 
                : ''
            }`}
          >
            <span className="text-sm">
              {getLanguageName(langCode)}
              {langCode === selectedCountryConfig.primaryLanguage && (
                <span className="text-xs text-muted-foreground ml-1">(Primary)</span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};