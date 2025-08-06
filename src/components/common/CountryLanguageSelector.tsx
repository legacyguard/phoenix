import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCountry } from '@/hooks/useCountry';
import { getCurrentCountryConfig, COUNTRY_CONFIGS } from '@/config/countries';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel } from
'@/components/ui/dropdown-menu';
import { ChevronDown, Globe, Loader2 } from 'lucide-react';

export const CountryLanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation('ui');
  const { selectedCountryCode, setSelectedCountryCode, isDetecting } = useCountry();

  const currentCountry = getCurrentCountryConfig();
  const selectedCountryConfig = Object.values(COUNTRY_CONFIGS).find(
    (config) => config.code === selectedCountryCode
  ) || currentCountry;

  // Force re-render when language changes
  useEffect(() => {
     


    // This effect ensures the component re-renders when the language changes
    // The i18n.language dependency will trigger a re-render
  }, [i18n.language]);const handleCountrySelect = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    const config = Object.values(COUNTRY_CONFIGS).find((c) => c.code === countryCode);

    // Update language if current language is not supported in new country
    if (config && !config.supportedLanguages.includes(i18n.language)) {
      i18n.changeLanguage(config.primaryLanguage);
    }
  };

  const handleLanguageSelect = (languageCode: string) => {
    try {
      i18n.changeLanguage(languageCode);
    } catch (error: Record<string, unknown>) {
      const timestamp = new Date().toISOString();
      const errorMessage = error?.message || 'Neznáma chyba';
      const errorCode = error?.code || 'UNKNOWN_ERROR';

      // Detailné logovanie pre debugging
      console.error('[Aplikácia] Chyba pri operácia:', {
        timestamp,
        operation: 'handleLanguageSelect',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });

      // Používateľsky prívetivá správa
      let userMessage = 'Nastala chyba pri operácia.';

      // Špecifické správy podľa typu chyby
      if (error?.code === 'PGRST116') {
        userMessage = 'Požadované dáta neboli nájdené.';
      } else if (error?.message?.includes('network')) {
        userMessage = 'Chyba pripojenia. Skontrolujte internetové pripojenie.';
      } else if (error?.message?.includes('permission')) {
        userMessage = 'Nemáte oprávnenie na túto akciu.';
      } else if (error?.message?.includes('duplicate')) {
        userMessage = 'Takýto záznam už existuje.';
      }

      toast.error(userMessage);
    }
  };

  const getLanguageName = (code: string): string => {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'de': 'Deutsch',
      'fr': 'Français',
      'es': 'Español',
      'it': 'Italiano',
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
      'cy': 'Cymraeg (Welsh)'
    };
    return languageNames[code] || code;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 px-3">
          {isDetecting ?
          <Loader2 className="h-4 w-4 animate-spin" /> :

          <span className="text-lg">{selectedCountryConfig.flag}</span>
          }
          <span className="hidden sm:inline text-sm font-medium">
            {isDetecting ? 'Detecting...' : selectedCountryConfig.name}
          </span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span>{t('ui.countryLanguageSelector.country_language_1')}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Country Selection */}
        <div className="px-2 py-1">
          <div className="text-xs font-medium text-muted-foreground mb-2">{t('ui.countryLanguageSelector.select_country_2')}</div>
          <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
            {Object.values(COUNTRY_CONFIGS).
            sort((a, b) => a.name.localeCompare(b.name)).
            map((config) =>
            <DropdownMenuItem
              key={config.code}
              onClick={() => handleCountrySelect(config.code)}
              className={`flex items-center space-x-2 cursor-pointer ${
              selectedCountryCode === config.code ?
              'bg-primary/10 text-primary' :
              ''}`
              }>

                  <span className="text-sm">{config.flag}</span>
                  <span className="text-xs">{config.name}</span>
                </DropdownMenuItem>
            )}
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Language Selection */}
        <div className="px-2 py-1">
          <div className="text-xs font-medium text-muted-foreground mb-2">{t('ui.countryLanguageSelector.select_language_3')}</div>
          <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
            {selectedCountryConfig.supportedLanguages.map((lang) =>
            <DropdownMenuItem
              key={lang}
              onClick={() => handleLanguageSelect(lang)}
              className={`flex items-center space-x-2 cursor-pointer ${
              i18n.language === lang ?
              'bg-primary/10 text-primary' :
              ''}`
              }>

                <span className="text-xs">{getLanguageName(lang)}</span>
              </DropdownMenuItem>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>);

};