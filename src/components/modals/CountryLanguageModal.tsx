import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, MapPin, Languages, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  SUPPORTED_COUNTRIES,
  COUNTRY_LANGUAGES,
  COUNTRY_CONFIGS,
  type CountryCode,
  type LanguageCode,
} from '@/config/countries';
import { languageDetectionService } from '@/services/languageDetection';

interface CountryLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedCountry?: CountryCode | null;
  detectedLanguage?: LanguageCode | null;
  onConfirm: (country: CountryCode, language: LanguageCode, redirectToDomain: boolean) => void;
}

export const CountryLanguageModal: React.FC<CountryLanguageModalProps> = ({
  isOpen,
  onClose,
  detectedCountry,
  detectedLanguage,
  onConfirm,
}) => {
  const { t, i18n } = useTranslation('ui-common');
  // Use detected country or let user choose from the list
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | ''>(
    detectedCountry || 'CZ'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | ''>(
    detectedLanguage || 'cs'
  );
  const [showDomainSuggestion, setShowDomainSuggestion] = useState(false);

  // Update selected country when detected country changes
  useEffect(() => {
     
    if (detectedCountry) {
      setSelectedCountry(detectedCountry);
    }
  }, [detectedCountry]);

  // Update language options when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryLanguages = COUNTRY_LANGUAGES[selectedCountry] || [];
      
      // If detected language is available for selected country, use it
      if (detectedLanguage && countryLanguages.includes(detectedLanguage)) {
        setSelectedLanguage(detectedLanguage);
      } else {
        // Otherwise use the first available language
        setSelectedLanguage(countryLanguages[0] || '');
      }
      
      // Check if domain redirect is suggested
      const suggestedDomain = languageDetectionService.getSuggestedDomain(selectedCountry);
      const isCorrectDomain = languageDetectionService.isCorrectDomain(selectedCountry);
      setShowDomainSuggestion(!isCorrectDomain && suggestedDomain !== window.location.hostname);
    }
  }, [selectedCountry, detectedLanguage]);

  const handleConfirm = () => {
    if (selectedCountry && selectedLanguage) {
      onConfirm(selectedCountry, selectedLanguage, showDomainSuggestion);
    }
  };

  const getCountryName = (code: CountryCode): string => {
    const config = Object.values(COUNTRY_CONFIGS).find(c => c.code === code);
    return config?.name || code;
  };

  const getCountryFlag = (code: CountryCode): string => {
    const config = Object.values(COUNTRY_CONFIGS).find(c => c.code === code);
    return config?.flag || '🌍';
  };

  const getLanguageName = (code: LanguageCode): string => {
    const languageNames: Record<LanguageCode, string> = {
      en: 'English',
      de: 'Deutsch',
      fr: 'Français',
      es: 'Español',
      it: 'Italiano',
      pl: 'Polski',
      cs: 'Čeština',
      sk: 'Slovenčina',
      hu: 'Magyar',
      ro: 'Română',
      bg: 'Български',
      hr: 'Hrvatski',
      sl: 'Slovenščina',
      et: 'Eesti',
      lv: 'Latviešu',
      lt: 'Lietuvių',
      el: 'Ελληνικά',
      nl: 'Nederlands',
      da: 'Dansk',
      sv: 'Svenska',
      fi: 'Suomi',
      no: 'Norsk',
      is: 'Íslenska',
      pt: 'Português',
      mt: 'Malti',
      sq: 'Shqip',
      mk: 'Македонски',
      me: 'Crnogorski',
      sr: 'Српски',
      uk: 'Українська',
      ru: 'Русский',
      tr: 'Türkçe',
      ga: 'Gaeilge',
      bs: 'Bosanski',
    };
    return languageNames[code] || code;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('countryLanguage.title', 'Welcome to LegacyGuard')}
          </DialogTitle>
          <DialogDescription>
            {t('countryLanguage.description', 'Please confirm your location and language preferences')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Detected Location Info */}
          {detectedCountry && (
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                {t('countryLanguage.detectedLocation', 'We detected you are in {{country}}', {
                  country: getCountryName(detectedCountry),
                })}
              </AlertDescription>
            </Alert>
          )}

          {/* Country Selection */}
          <div className="space-y-2">
            <Label htmlFor="country">
              {t('countryLanguage.selectCountry', 'Select your country')}
            </Label>
            <Select
              value={selectedCountry}
              onValueChange={(value) => setSelectedCountry(value as CountryCode)}
            >
              <SelectTrigger id="country" className="w-full">
                <SelectValue>
                  {selectedCountry ? (
                    <span className="flex items-center gap-2">
                      <span>{getCountryFlag(selectedCountry)}</span>
                      <span>{getCountryName(selectedCountry)}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {t('countryLanguage.selectCountry', 'Select your country')}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_COUNTRIES.map((code) => (
                  <SelectItem key={code} value={code}>
                    <span className="flex items-center gap-2">
                      <span>{getCountryFlag(code)}</span>
                      <span>{getCountryName(code)}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="language">
              {t('countryLanguage.selectLanguage', 'Select your language')}
            </Label>
            <Select
              value={selectedLanguage}
              onValueChange={(value) => setSelectedLanguage(value as LanguageCode)}
            >
              <SelectTrigger id="language" className="w-full">
                <SelectValue>
                  {selectedLanguage ? (
                    <span className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      <span>{getLanguageName(selectedLanguage)}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {t('countryLanguage.chooseLang', 'Choose a language')}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {selectedCountry &&
                  COUNTRY_LANGUAGES[selectedCountry]?.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      <span className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        <span>{getLanguageName(lang)}</span>
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Domain Suggestion */}
          {showDomainSuggestion && selectedCountry && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {t('countryLanguage.domainSuggestion', 'Better experience available')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        'countryLanguage.domainSuggestionText',
                        'We recommend using {{domain}} for the best experience in your region',
                        {
                          domain: languageDetectionService.getSuggestedDomain(selectedCountry),
                        }
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Note */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {t(
                'countryLanguage.privacyNote',
                'Your location data is only used to provide you with the best local experience and is never shared with third parties.'
              )}
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {t('ui.common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedCountry || !selectedLanguage}>
            {showDomainSuggestion && selectedCountry
              ? t('countryLanguage.confirmAndRedirect', 'Continue to {{domain}}', {
                  domain: languageDetectionService.getSuggestedDomain(selectedCountry),
                })
              : t('countryLanguage.confirm', 'Confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
