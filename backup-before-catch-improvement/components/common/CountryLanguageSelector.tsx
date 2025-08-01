import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCountry } from '@/contexts/CountryContext';
import { getCurrentCountryConfig, COUNTRY_CONFIGS } from '@/config/countries';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Globe } from 'lucide-react';

export const CountryLanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { selectedCountryCode, setSelectedCountryCode } = useCountry();
  
  const currentCountry = getCurrentCountryConfig();
  const selectedCountryConfig = Object.values(COUNTRY_CONFIGS).find(
    config => config.code === selectedCountryCode
  ) || currentCountry;

  // Force re-render when language changes
  useEffect(() => {
    // This effect ensures the component re-renders when the language changes
    // The i18n.language dependency will trigger a re-render
  }, [i18n.language]);

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    const config = Object.values(COUNTRY_CONFIGS).find(c => c.code === countryCode);
    
    // Update language if current language is not supported in new country
    if (config && !config.supportedLanguages.includes(i18n.language)) {
      i18n.changeLanguage(config.primaryLanguage);
    }
  };

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
          <span className="text-lg">{selectedCountryConfig.flag}</span>
          <span className="hidden sm:inline text-sm font-medium">
            {selectedCountryConfig.name}
          </span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span>Country & Language</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Country Selection */}
        <div className="px-2 py-1">
          <div className="text-xs font-medium text-muted-foreground mb-2">Select Country</div>
          <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
            {Object.values(COUNTRY_CONFIGS)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((config) => (
                <DropdownMenuItem
                  key={config.code}
                  onClick={() => handleCountrySelect(config.code)}
                  className={`flex items-center space-x-2 cursor-pointer ${
                    selectedCountryCode === config.code 
                      ? 'bg-primary/10 text-primary' 
                      : ''
                  }`}
                >
                  <span className="text-sm">{config.flag}</span>
                  <span className="text-xs">{config.name}</span>
                </DropdownMenuItem>
              ))}
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Language Selection */}
        <div className="px-2 py-1">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            {import.meta.env.DEV ? 'All Available Languages' : `Languages for ${selectedCountryConfig.name}`}
          </div>
          {(import.meta.env.DEV ? Object.keys(i18n.options.resources || {}).sort() : selectedCountryConfig.supportedLanguages).map((langCode) => (
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
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};