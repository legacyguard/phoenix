import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCountry } from '@/hooks/useCountry';
import { getCurrentCountryConfig, COUNTRY_CONFIGS } from '@/config/countries';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, Loader2 } from 'lucide-react';

export const CountrySelector: React.FC = () => {
  const { i18n, t } = useTranslation('ui-common');
  const { selectedCountryCode, setSelectedCountryCode, isDetecting } = useCountry();
  const [searchTerm, setSearchTerm] = useState('');

  const currentCountry = getCurrentCountryConfig();
  const selectedCountryConfig = Object.values(COUNTRY_CONFIGS).find(
    (config) => config.code === selectedCountryCode
  ) || currentCountry;

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    const config = Object.values(COUNTRY_CONFIGS).find((c) => c.code === countryCode);

    // Update language if current language is not supported in new country
    if (config && !config.supportedLanguages.includes(i18n.language)) {
      i18n.changeLanguage(config.primaryLanguage);
    }
    setSearchTerm('');
  };

  const filteredCountries = Object.values(COUNTRY_CONFIGS).
  filter((config) =>
  config.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).
  sort((a, b) => a.name.localeCompare(b.name));

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
      
      <DropdownMenuContent align="start" className="w-80 max-h-96 overflow-y-auto bg-background border">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("ui.countrySelector.search_countries")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8" />

          </div>
        </div>
        
        <div className="max-h-60 overflow-y-auto">
          {filteredCountries.map((config) =>
          <DropdownMenuItem
            key={config.code}
            onClick={() => handleCountrySelect(config.code)}
            className={`flex items-center space-x-2 cursor-pointer ${
            selectedCountryCode === config.code ?
            'bg-primary/10 text-primary' :
            ''}`
            }>

              <span className="text-sm">{config.flag}</span>
              <span className="text-sm">{config.name}</span>
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>);

};