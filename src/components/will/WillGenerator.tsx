import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  const { t } = useTranslation();
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
      id: 'country',
      title: t('will.steps.country'),
      icon: FileText,
      description: t('will.steps.countryDesc')
    },
    {
      id: 'allocation',
      title: t('will.steps.allocation'),
      icon: Users,
      description: t('will.steps.allocationDesc')
    },
    {
      id: 'beneficiaries',
      title: t('will.steps.beneficiaries'),
      icon: Users,
      description: t('will.steps.beneficiariesDesc')
    },
    {
      id: 'executors',
      title: t('will.steps.executors'),
      icon: Briefcase,
      description: t('will.steps.executorsDesc')
    },
    {
      id: 'review',
      title: t('will.steps.review'),
      icon: Eye,
      description: t('will.steps.reviewDesc')
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
          errors.country = t('will.validation.selectCountry');
        }
        // Add UK jurisdiction validation
        if (countryCode === 'GB' && !countryCode.includes('-')) {
          errors.ukJurisdiction = t('will_generator.error_uk_jurisdiction_required');
        }
        if (!willContent.testator?.name) {
          errors.name = t('will.validation.requiredField');
        }
        if (!willContent.testator?.birthDate) {
          errors.birthDate = t('will.validation.requiredField');
        }
        if (!willContent.testator?.address) {
          errors.address = t('will.validation.requiredField');
        }
        break;

      case 1: // Asset allocation
        const totalAllocation = willContent.beneficiaries?.reduce((sum, b) => {
          const percentageAllocation = b.allocation
            .filter(a => a.assetType === 'percentage')
            .reduce((s, a) => s + (a.value || 0), 0);
          return sum + percentageAllocation;
        }, 0) || 0;

        if (totalAllocation !== 100 && totalAllocation > 0) {
          errors.allocation = t('will.validation.allocation100');
        }
        if (!willContent.beneficiaries || willContent.beneficiaries.length === 0) {
          errors.beneficiaries = t('will.validation.atLeastOneBeneficiary');
        }
        break;

      case 2: // Beneficiaries
        willContent.beneficiaries?.forEach((b, index) => {
          if (!b.name) {
            errors[`beneficiary_${index}_name`] = t('will.validation.requiredField');
          }
          if (!b.relationship) {
            errors[`beneficiary_${index}_relationship`] = t('will.validation.requiredField');
          }
        });
        break;

      case 3: // Executors
        if (!willContent.executor?.name) {
          errors.executor = t('will.validation.executorRequired');
        }
        break;
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
      toast.error(t('will.validation.fixErrors'));
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
      toast.error(t('will.validation.fixErrors'));
      return;
    }

    try {
      // TODO: Call API to generate will with country code and language code
      // The API call should include both countryCode and languageCode
      // fetch(`/api/will/get-template?country=${countryCode}&language=${languageCode}`)
      toast.success(t('will.generation.success'));
      onComplete?.('generated-will-id');
    } catch (error) {
      toast.error(t('will.generation.error'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t('will.progress', { current: currentStep + 1, total: steps.length })}
          </span>
          <span className="font-medium">{calculateProgress().toFixed(0)}%</span>
        </div>
        <Progress value={calculateProgress()} className="h-2" />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${isActive ? 'bg-primary text-primary-foreground' : ''}
                    ${isCompleted ? 'bg-primary/20 text-primary' : ''}
                    ${!isActive && !isCompleted ? 'bg-muted text-muted-foreground' : ''}
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`
                  text-xs mt-1 text-center max-w-[80px]
                  ${isActive ? 'font-medium' : 'text-muted-foreground'}
                `}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-[2px] mx-2 transition-colors
                  ${isCompleted ? 'bg-primary/20' : 'bg-muted'}
                `} />
              )}
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={steps[currentStep].id} className="w-full">
            <TabsContent value="country" className="mt-0">
              <CountrySelector
                selectedCountry={countryCode}
                onSelect={handleCountrySelect}
                testator={willContent.testator!}
                onTestatorUpdate={handleTestatorUpdate}
                errors={validationErrors}
              />
            </TabsContent>

            <TabsContent value="allocation" className="mt-0">
              <AssetAllocationWizard
                beneficiaries={willContent.beneficiaries || []}
                onUpdate={handleBeneficiariesUpdate}
                errors={validationErrors}
              />
            </TabsContent>

            <TabsContent value="beneficiaries" className="mt-0">
              <BeneficiariesForm
                beneficiaries={willContent.beneficiaries || []}
                onUpdate={handleBeneficiariesUpdate}
                errors={validationErrors}
              />
            </TabsContent>

            <TabsContent value="executors" className="mt-0">
              <ExecutorSelector
                executor={willContent.executor}
                onUpdate={handleExecutorUpdate}
                errors={validationErrors}
              />
            </TabsContent>

            <TabsContent value="review" className="mt-0">
              <WillPreview
                willContent={willContent as WillContent}
                requirements={requirements!}
                countryCode={countryCode}
                onGenerate={handleGenerateWill}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          {t('common.previous')}
        </Button>
        
        {currentStep === steps.length - 1 ? (
          <Button onClick={handleGenerateWill}>
            <FileText className="mr-2 h-4 w-4" />
            {t('will.generate')}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {t('common.next')}
          </Button>
        )}
      </div>

      {/* Validation errors */}
      {Object.keys(validationErrors).length > 0 && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">
                  {t('will.validation.errorsFound')}
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {Object.values(validationErrors).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
