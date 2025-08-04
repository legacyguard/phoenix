import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WillRequirements, WillContent } from '@/types/will';

interface CountrySelectorProps {
  selectedCountry: string;
  onSelect: (country: string, requirements: WillRequirements) => void;
  testator: WillContent['testator'];
  onTestatorUpdate: (testator: WillContent['testator']) => void;
  errors: Record<string, string>;
}

export function CountrySelector({
  selectedCountry,
  onSelect,
  testator,
  onTestatorUpdate,
  errors
}: CountrySelectorProps) {
  const { t } = useTranslation();
  const [countries, setCountries] = useState<WillRequirements[]>([]);
  const [ukJurisdiction, setUkJurisdiction] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  
  // UK jurisdiction language mapping
  const ukJurisdictionLanguages: Record<string, Array<{ code: string; name: string }>> = {
    'GB-ENG': [{ code: 'en', name: 'English' }],
    'GB-WLS': [{ code: 'en', name: 'English' }, { code: 'cy', name: 'Cymraeg (Welsh)' }],
    'GB-SCT': [{ code: 'en', name: 'English' }],
    'GB-NIR': [{ code: 'en', name: 'English' }],
  };

  useEffect(() => {
    // Fetch country requirements
    async function fetchRequirements() {
      // TODO: Replace with real API call when available
      // For now, using hardcoded data that matches our database templates
      const response: WillRequirements[] = [
        {
          id: 1,
          country_code: 'SK',
          country_name: t('willGenerator.countries.SK'),
          witness_count: 2,
          requires_handwriting: false,
          requires_notarization: false,
          required_clauses: ['identity', 'revocation', 'beneficiaries', 'date', 'signature'],
          forbidden_content: [],
          legal_language: {
            title: 'Závet',
            identity: 'Ja, dolupodpísaný/á {name}, narodený/á {birthDate}, bytom {address}',
            revocation: 'Týmto odvolávam všetky svoje predchádzajúce závety a dodatkové doložky.',
            beneficiaries: 'Odkazujem',
            signature: 'Podpis závetcu',
            witness: 'Svedok',
            date: 'Dátum'
          },
          signature_requirements: 'Requires either handwriting by testator OR typed with 2 witnesses present at signing'
        },
        {
          id: 2,
          country_code: 'CZ',
          country_name: t('willGenerator.countries.CZ'),
          witness_count: 2,
          requires_handwriting: false,
          requires_notarization: false,
          required_clauses: ['identity', 'revocation', 'beneficiaries', 'date', 'signature', 'soundMind'],
          forbidden_content: [],
          legal_language: {
            title: 'Závěť',
            identity: 'Já, níže podepsaný/á {name}, narozen/a {birthDate}, bytem {address}',
            revocation: 'Tímto odvolávám všechny své předchozí závěti a kodexy.',
            beneficiaries: 'Odkazuji',
            signature: 'Podpis zůstavitele',
            witness: 'Svědek',
            date: 'Datum',
            soundMind: 'prohlašuji, že jsem svéprávný, že jsem způsobilý samostatně právně jednat'
          },
          signature_requirements: 'Requires either handwriting by testator OR typed with 2 witnesses present at signing'
        },
        {
          id: 3,
          country_code: 'GB',
          country_name: t('willGenerator.countries.GB'),
          witness_count: 2,
          requires_handwriting: false,
          requires_notarization: false,
          required_clauses: ['identity', 'revocation', 'beneficiaries', 'date', 'signature'],
          forbidden_content: [],
          legal_language: {
            title: 'Will',
            identity: 'I {name} of {address}',
            revocation: 'I hereby revoke all former wills and codicils.',
            beneficiaries: 'I give and bequeath',
            signature: 'Testator signature',
            witness: 'Witness',
            date: 'Date'
          },
          signature_requirements: 'Must be signed in presence of 2 witnesses'
        }
      ];

      setCountries(response);
    }

    fetchRequirements();
  }, [t]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('will.countryRequirements')}</CardTitle>
          <CardDescription>
            {selectedCountry ? t('will.selectedCountryDetails', { country: selectedCountry }) : t('will.selectCountry')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('will.selectCountry')}</Label>
            <Select value={selectedCountry} onValueChange={(value) => {
              const countryReqs = countries.find(c => c.country_code === value);
              if (countryReqs) {
                if (value === 'GB') {
                  // Reset UK jurisdiction when GB is selected
                  setUkJurisdiction('');
                  setSelectedLanguage('en');
                } else {
                  onSelect(value, countryReqs);
                }
              }
            }}>
              <SelectTrigger id="country">
                <SelectValue placeholder={t('willGenerator.select_a_country_4')} />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.country_code}>
                    {country.country_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-destructive mt-1">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                {errors.country}
              </p>
            )}
          </div>

          {/* UK Jurisdiction Selection */}
          {selectedCountry === 'GB' && (
            <div className="space-y-2 mt-4">
              <Label>{t('will_generator.uk_jurisdiction_title')}</Label>
              <RadioGroup value={ukJurisdiction} onValueChange={(value) => {
                setUkJurisdiction(value);
                // Reset language when jurisdiction changes
                setSelectedLanguage('en');
                // Find the GB requirements and pass them with the specific jurisdiction
                const countryReqs = countries.find(c => c.country_code === 'GB');
                if (countryReqs) {
                  onSelect(value, countryReqs);
                }
              }}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="GB-ENG" id="england" />
                  <Label htmlFor="england">{t('will_generator.jurisdiction_england')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="GB-WLS" id="wales" />
                  <Label htmlFor="wales">{t('will_generator.jurisdiction_wales')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="GB-SCT" id="scotland" />
                  <Label htmlFor="scotland">{t('will_generator.jurisdiction_scotland')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="GB-NIR" id="northern-ireland" />
                  <Label htmlFor="northern-ireland">{t('will_generator.jurisdiction_northern_ireland')}</Label>
                </div>
              </RadioGroup>
              {errors.ukJurisdiction && (
                <p className="text-sm text-destructive mt-1">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  {t('will_generator.error_uk_jurisdiction_required')}
                </p>
              )}
            </div>
          )}

          {/* Language Selection for Wales */}
          {ukJurisdiction && ukJurisdictionLanguages[ukJurisdiction]?.length > 1 && (
            <div className="space-y-2 mt-4">
              <Label>{t('will_generator.select_will_language_title')}</Label>
              <Select value={selectedLanguage} onValueChange={(value) => {
                setSelectedLanguage(value);
                // Update the selection with the language
                const countryReqs = countries.find(c => c.country_code === 'GB');
                if (countryReqs) {
                  onSelect(ukJurisdiction, { ...countryReqs, language_code: value });
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ukJurisdictionLanguages[ukJurisdiction].map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-4">
            <Label>{t('will.testatorInfo')}</Label>
            <div className="space-y-2">
              <Label htmlFor="name">{t('will.name')}</Label>
              <Input
                id="name"
                value={testator.name}
                onChange={(e) => onTestatorUpdate({ ...testator, name: e.target.value })}
                placeholder={t('will.namePlaceholder')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">{t('will.birthDate')}</Label>
              <Input
                id="birthDate"
                type="date"
                value={testator.birthDate}
                onChange={(e) => onTestatorUpdate({ ...testator, birthDate: e.target.value })}
                placeholder={t('will.birthDatePlaceholder')}
              />
              {errors.birthDate && (
                <p className="text-sm text-destructive">{errors.birthDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t('will.address')}</Label>
              <Input
                id="address"
                value={testator.address}
                onChange={(e) => onTestatorUpdate({ ...testator, address: e.target.value })}
                placeholder={t('will.addressPlaceholder')}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
