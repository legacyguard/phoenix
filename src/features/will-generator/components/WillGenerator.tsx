import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, FileText, Users, Briefcase, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CountrySelector } from './CountrySelector';
import { AssetAllocationWizard } from './AssetAllocationWizard';
import { BeneficiariesForm } from './BeneficiariesForm';
import { ExecutorSelector } from './ExecutorSelector';
import { WillPreview } from './WillPreview';
import type { WillContent, WillRequirements, Beneficiary, Executor } from '@/types/will';

interface WillGeneratorProps {
  onComplete?: (willId: string) => void;
}

export function WillGenerator({ onComplete }: WillGeneratorProps) {
  const { t } = useTranslation('wills');
  const [currentStep, setCurrentStep] = useState(0);
  const [countryCode, setCountryCode] = useState<string>('');
  const [languageCode, setLanguageCode] = useState<string>('en');
  const [requirements, setRequirements] = useState<WillRequirements | null>(null);
  const [willContent, setWillContent] = useState<Partial<WillContent>>({
    testator: {
      name: '',
      birthDate: '',
      address: ''
    },
    beneficiaries: [],
    createdDate: new Date().toISOString()
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const steps = [
    {
      id: 'personal',
      title: t('ui.personal.title'),
      icon: FileText,
      description: t('ui.personal.description')
    },
    {
      id: 'assets',
      title: t('ui.assets.title'),
      icon: Users,
      description: t('ui.assets.description')
    },
    {
      id: 'beneficiaries',
      title: t('ui.beneficiaries.title'),
      icon: Users,
      description: t('ui.beneficiaries.description')
    },
    {
      id: 'guardians',
      title: t('ui.guardians.title'),
      icon: Briefcase,
      description: t('ui.guardians.description')
    },
    {
      id: 'executor',
      title: t('ui.executor.title'),
      icon: Briefcase,
      description: t('ui.executor.description')
    },
    {
      id: 'preferences',
      title: t('ui.preferences.title'),
      icon: Eye,
      description: t('ui.preferences.description')
    },
    {
      id: 'review',
      title: t('ui.review.title'),
      icon: Eye,
      description: t('ui.review.description')
    }
  ];

  const calculateProgress = () => {
    return ((currentStep + 1) / steps.length) * 100;
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Country selection
        if (!countryCode) {
          errors.country = t('validation.jurisdictionRequired');
        }
        // Add UK jurisdiction validation
        if (countryCode === 'GB' && !countryCode.includes('-')) {
          errors.ukJurisdiction = t('validation.jurisdictionRequired');
        }
        if (!willContent.testator?.name) {
          errors.name = t('validation.nameRequired');
        }
        if (!willContent.testator?.birthDate) {
          errors.birthDate = t('validation.dobRequired');
        }
        if (!willContent.testator?.address) {
          errors.address = t('validation.addressRequired');
        }
        break;

      case 1: { // Asset allocation
        const totalAllocation = willContent.beneficiaries?.reduce((sum, b) => {
          const percentageAllocation = b.allocation
            .filter(a => a.assetType === 'percentage')
            .reduce((s, a) => s + (a.value || 0), 0);
          return sum + percentageAllocation;
        }, 0) || 0;

        if (totalAllocation !== 100 && totalAllocation > 0) {
          errors.allocation = t('validation.allocationError');
        }
        if (!willContent.beneficiaries || willContent.beneficiaries.length === 0) {
          errors.beneficiaries = t('validation.beneficiaryRequired');
        }
        break;
      }

      case 2: { // Beneficiaries
        willContent.beneficiaries?.forEach((b, index) => {
          if (!b.name) {
            errors[`beneficiary_${index}_name`] = t('validation.nameRequired');
          }
          if (!b.relationship) {
            errors[`beneficiary_${index}_relationship`] = t('validation.requiredField');
          }
        });
        break;
      }

      case 3: { // Executors
        if (!willContent.executor?.name) {
          errors.executor = t('validation.executorRequired');
        }
        break;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error(t('errors.validationFailed'));
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCountrySelect = (code: string, reqs: WillRequirements & { language_code?: string }) => {
    setCountryCode(code);
    setRequirements(reqs);
    if (reqs.language_code) {
      setLanguageCode(reqs.language_code);
    }
  };

  const handleBeneficiariesUpdate = (beneficiaries: Beneficiary[]) => {
    setWillContent(prev => ({ ...prev, beneficiaries }));
  };

  const handleExecutorUpdate = (executor: Executor) => {
    setWillContent(prev => ({ ...prev, executor }));
  };

  const handleTestatorUpdate = (testator: WillContent['testator']) => {
    setWillContent(prev => ({ ...prev, testator }));
  };

  const handleGenerateWill = async () => {
    if (!validateCurrentStep()) {
      toast.error(t('errors.validationFailed'));
      return;
    }

    try {
      // TODO: Call API to generate will with country code and language code
      // The API call should include both countryCode and languageCode
      // fetch(`/api/will/get-template?country=${countryCode}&language=${languageCode}`)
      toast.success(t('ui.willGenerated'));
      onComplete?.('generated-will-id');
    } catch (error) {
      toast.error(t('errors.generationFailed'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('generator.title')}</h1>
        <p className="text-muted-foreground">{t('generator.subtitle')}</p>
        <p className="text-sm text-muted-foreground">{t('generator.description')}</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{t('generator.step')} {currentStep + 1} {t('generator.of')} {steps.length}</span>
          <span>{Math.round(calculateProgress())}%</span>
        </div>
        <Progress value={calculateProgress()} className="w-full" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep].icon, { className: 'h-5 w-5' })}
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <div className="space-y-4">
              <CountrySelector
                onCountrySelect={handleCountrySelect}
                selectedCountry={countryCode}
              />
              {Object.keys(validationErrors).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(validationErrors).map(([key, error]) => (
                    <div key={key} className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <AssetAllocationWizard
              beneficiaries={willContent.beneficiaries || []}
              onUpdate={handleBeneficiariesUpdate}
              errors={validationErrors}
            />
          )}

          {currentStep === 2 && (
            <BeneficiariesForm
              beneficiaries={willContent.beneficiaries || []}
              onUpdate={handleBeneficiariesUpdate}
              errors={validationErrors}
            />
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('form.guardianship.minorChildren')}</h3>
              <p className="text-muted-foreground">{t('form.guardianship.guardianInstructions')}</p>
              {/* Guardian selection component would go here */}
            </div>
          )}

          {currentStep === 4 && (
            <ExecutorSelector
              executor={willContent.executor}
              onUpdate={handleExecutorUpdate}
              errors={validationErrors}
            />
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('form.provisions.funeralWishes')}</h3>
              <p className="text-muted-foreground">{t('form.provisions.specialInstructions')}</p>
              {/* Special provisions form would go here */}
            </div>
          )}

          {currentStep === 6 && (
            <WillPreview
              willContent={willContent}
              requirements={requirements}
              countryCode={countryCode}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          {t('actions.previous')}
        </Button>

        <div className="flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              {t('actions.next')}
            </Button>
          ) : (
            <Button onClick={handleGenerateWill}>
              {t('actions.generateWill')}
            </Button>
          )}
        </div>
      </div>

      {/* Legal Disclaimer */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t('wills.disclaimer')} {t('wills.notLegalAdvice')} {t('wills.professionalGuidance')}
        </AlertDescription>
      </Alert>
    </div>
  );
}
