import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, CheckCircle2, FileText, Globe } from 'lucide-react';
import { WillTemplateService, WillTemplate } from '@/features/will-generator/api/WillTemplateService';
import { useGenderAwareTranslation } from '@/i18n/useGenderAwareTranslation';
import { cn } from '@/lib/utils';

interface WillGeneratorProps {
  preselectedCountry?: string;
  onComplete?: (willData: Record<string, unknown>) => void;
}

const WillGenerator: React.FC<WillGeneratorProps> = ({
  preselectedCountry = 'GB',
  onComplete
  }) => {
    const { t } = useGenderAwareTranslation('common');
  const [currentStep, setCurrentStep] = useState(1);
  const [countryCode, setCountryCode] = useState(preselectedCountry);
  const [languageCode, setLanguageCode] = useState('en');
  const [template, setTemplate] = useState<WillTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jurisdictionConfirmed, setJurisdictionConfirmed] = useState(false);
  const [changeCountry, setChangeCountry] = useState(false);
  const [signedConfirmation, setSignedConfirmation] = useState(false);

  // User data for will generation
  const [userData, setUserData] = useState({
    full_name: '',
    date_of_birth: '',
    place_of_birth: '',
    current_address: '',
    executor_name: '',
    executor_address: '',
    spouse_name: '',
    has_spouse: false,
    spouse_inheritance: '',
    beneficiaries: [],
    has_executor: true,
    location: '',
    date: new Date().toLocaleDateString(),
    funeral_wishes: '',
    residuary_beneficiary: ''
  });

  // Available countries from templates - European countries only
  const availableCountries = [
  { code: 'GB', name: t("willGenerator.countries.GB") },
  { code: 'DE', name: t("willGenerator.countries.DE") },
  { code: 'FR', name: t("willGenerator.countries.FR") },
  { code: 'ES', name: t("willGenerator.countries.ES") },
  { code: 'IT', name: t("willGenerator.countries.IT") },
  { code: 'CZ', name: t("willGenerator.countries.CZ") },
  { code: 'SK', name: t("willGenerator.countries.SK") },
  { code: 'PL', name: t("willGenerator.countries.PL") },
  { code: 'AT', name: t("willGenerator.countries.AT") },
  { code: 'CH', name: t("willGenerator.countries.CH") },
  { code: 'NL', name: t("willGenerator.countries.NL") },
  { code: 'BE', name: t("willGenerator.countries.BE") },
  { code: 'LU', name: t("willGenerator.countries.LU") },
  { code: 'LI', name: t("willGenerator.countries.LI") },
  { code: 'DK', name: t("willGenerator.countries.DK") },
  { code: 'SE', name: t("willGenerator.countries.SE") },
  { code: 'FI', name: t("willGenerator.countries.FI") },
  { code: 'NO', name: t("willGenerator.countries.NO") },
  { code: 'IS', name: t("willGenerator.countries.IS") },
  { code: 'IE', name: t("willGenerator.countries.IE") },
  { code: 'PT', name: t("willGenerator.countries.PT") },
  { code: 'GR', name: t("willGenerator.countries.GR") },
  { code: 'HU', name: t("willGenerator.countries.HU") },
  { code: 'RO', name: t("willGenerator.countries.RO") },
  { code: 'BG', name: t("willGenerator.countries.BG") },
  { code: 'HR', name: t("willGenerator.countries.HR") },
  { code: 'SI', name: t("willGenerator.countries.SI") },
  { code: 'EE', name: t("willGenerator.countries.EE") },
  { code: 'LV', name: t("willGenerator.countries.LV") },
  { code: 'LT', name: t("willGenerator.countries.LT") },
  { code: 'MT', name: t("willGenerator.countries.MT") },
  { code: 'CY', name: t("willGenerator.countries.CY") },
  { code: 'MD', name: t("willGenerator.countries.MD") },
  { code: 'UA', name: t("willGenerator.countries.UA") },
  { code: 'RS', name: t("willGenerator.countries.RS") },
  { code: 'AL', name: t("willGenerator.countries.AL") },
  { code: 'MK', name: t("willGenerator.countries.MK") },
  { code: 'ME', name: t("willGenerator.countries.ME") },
  { code: 'BA', name: t("willGenerator.countries.BA") }];


  const steps = [
  { id: 1, title: t("willGenerator.steps.confirmJurisdiction"), icon: Globe },
  { id: 2, title: t("willGenerator.steps.personalInformation"), icon: FileText },
  { id: 3, title: t("willGenerator.steps.executorBeneficiaries"), icon: FileText },
  { id: 4, title: t("willGenerator.steps.reviewGenerate"), icon: CheckCircle2 },
  { id: 5, title: t("willGenerator.steps.signConfirm"), icon: AlertTriangle }];


  const fetchTemplate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTemplate = await WillTemplateService.getTemplate(countryCode, languageCode);
      if (!fetchedTemplate) {
        setError(t("willGenerator.no_template_found_for_this_jur_1"));
      } else {
        setTemplate(fetchedTemplate);
      }
    } catch (err) {
      setError(t("willGenerator.failed_to_load_will_template_2"));
    } finally {
      setLoading(false);
    }
  }, [countryCode, languageCode, t]);

  useEffect(() => {
     
    if (jurisdictionConfirmed && currentStep === 2) {
      fetchTemplate();
    }
  }, [jurisdictionConfirmed, currentStep, fetchTemplate]);

  const handleJurisdictionConfirm = (confirmed: boolean) => {
    if (confirmed) {
      setJurisdictionConfirmed(true);
      setCurrentStep(2);
    } else {
      setChangeCountry(true);
    }
  };

  const handleCountryChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode);
    // Update language based on country - using primary languages from config
    if (newCountryCode === 'GB' || newCountryCode === 'IE') {
      setLanguageCode('en');
    } else if (newCountryCode === 'DE' || newCountryCode === 'AT' || newCountryCode === 'LI') {
      setLanguageCode('de');
    } else if (newCountryCode === 'FR' || newCountryCode === 'LU') {
      setLanguageCode('fr');
    } else if (newCountryCode === 'ES') {
      setLanguageCode('es');
    } else if (newCountryCode === 'IT') {
      setLanguageCode('it');
    } else if (newCountryCode === 'CZ') {
      setLanguageCode('cs');
    } else if (newCountryCode === 'SK') {
      setLanguageCode('sk');
    } else if (newCountryCode === 'PL') {
      setLanguageCode('pl');
    } else if (newCountryCode === 'CH') {
      setLanguageCode('de'); // Default to German for Switzerland
    } else if (newCountryCode === 'NL' || newCountryCode === 'BE') {
      setLanguageCode('nl');
    } else if (newCountryCode === 'DK') {
      setLanguageCode('da');
    } else if (newCountryCode === 'SE') {
      setLanguageCode('sv');
    } else if (newCountryCode === 'FI') {
      setLanguageCode('fi');
    } else if (newCountryCode === 'NO') {
      setLanguageCode('no');
    } else if (newCountryCode === 'IS') {
      setLanguageCode('is');
    } else if (newCountryCode === 'PT') {
      setLanguageCode('pt');
    } else if (newCountryCode === 'GR' || newCountryCode === 'CY') {
      setLanguageCode('el');
    } else if (newCountryCode === 'HU') {
      setLanguageCode('hu');
    } else if (newCountryCode === 'RO' || newCountryCode === 'MD') {
      setLanguageCode('ro');
    } else if (newCountryCode === 'BG') {
      setLanguageCode('bg');
    } else if (newCountryCode === 'HR') {
      setLanguageCode('hr');
    } else if (newCountryCode === 'SI') {
      setLanguageCode('sl');
    } else if (newCountryCode === 'EE') {
      setLanguageCode('et');
    } else if (newCountryCode === 'LV') {
      setLanguageCode('lv');
    } else if (newCountryCode === 'LT') {
      setLanguageCode('lt');
    } else if (newCountryCode === 'MT') {
      setLanguageCode('mt');
    } else if (newCountryCode === 'UA') {
      setLanguageCode('uk');
    } else if (newCountryCode === 'RS' || newCountryCode === 'ME') {
      setLanguageCode('sr');
    } else if (newCountryCode === 'AL') {
      setLanguageCode('sq');
    } else if (newCountryCode === 'MK') {
      setLanguageCode('mk');
    } else if (newCountryCode === 'BA') {
      setLanguageCode('bs');
    } else {
      setLanguageCode('en'); // Default fallback
    }
    setChangeCountry(false);
  };

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handleExecutorBeneficiariesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(4);
  };

  const generateWill = () => {
    if (!template) return '';
    return WillTemplateService.fillTemplate(template, userData);
  };

  const handleFinalConfirmation = () => {
    if (!signedConfirmation) {
      alert(t("willGenerator.please_confirm_that_you_have_s_3"));
      return;
    }

    if (onComplete) {
      onComplete({
        countryCode,
        template,
        userData,
        generatedWill: generateWill(),
        signedAt: new Date().toISOString()
      });
    }

    // Navigate to upload or complete
    console.log(t("willGenerator.console.willGenerationCompleted"));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {currentStep === 1 && (
        <div>
          <h2>{t('willGenerator.steps.confirmJurisdiction')}</h2>
          <p>{t('willGenerator.confirmCountry', { country: availableCountries.find(c => c.code === countryCode)?.name || countryCode })}</p>
          <div className="mt-4">
            <Button onClick={() => handleJurisdictionConfirm(true)}>{t('common.confirm')}</Button>
            <Button variant="outline" onClick={() => setChangeCountry(true)}>{t('willGenerator.changeCountry')}</Button>
            {changeCountry && (
              <Select value={countryCode} onValueChange={handleCountryChange} className="mt-4">
                <SelectTrigger>
                  <SelectValue placeholder={t("willGenerator.select_a_country_4")} />
                </SelectTrigger>
                <SelectContent>
                  {availableCountries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}
      {currentStep === 2 && template && (
        <div>
          <h2>{t('willGenerator.steps.personalInformation')}</h2>
          {/* Implement forms for capturing user data for placeholders */}
          <form onSubmit={handlePersonalInfoSubmit}>
            <Label>{t('willGenerator.fullName')}</Label>
            <Input 
              type="text" 
              value={userData.full_name}
              onChange={(e) => setUserData(prev => ({ ...prev, full_name: e.target.value }))} 
              className="mt-2" 
              required 
            />
            <Button type="submit" className="mt-4">{t('common.next')}</Button>
          </form>
        </div>
      )}
      {currentStep === 3 && template && (
        <div>
          <h2>{t('willGenerator.steps.reviewGenerate')}</h2>
          <div className="border p-4 mb-8">
            {/* Replace placeholders with user data */}
            <p>{WillTemplateService.fillTemplate(template, userData)}</p>
          </div>
          <div className="border border-red-500 p-4 mb-8">
            <h3 className="text-red-500">{t('willGenerator.executionInstructions')}</h3>
            <p>{template.execution_instructions}</p>
          </div>
          <div>
            <Checkbox 
              id="signedConfirmation" 
              checked={signedConfirmation}
              onCheckedChange={(checked) => setSignedConfirmation(checked as boolean)}
            />
            <Label htmlFor="signedConfirmation" className="ml-2">{t('willGenerator.confirmSigned')}</Label>
            <Button onClick={handleFinalConfirmation} className="mt-4">{t('willGenerator.finalizeUpload')}</Button>
          </div>
        </div>
      )}
    </div>
  );

};

export default WillGenerator;