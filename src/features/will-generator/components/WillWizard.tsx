import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AnimatedProgress } from '@/components/ui';
import { WillWizardState } from '@/types/will';
import { loadDraft, saveDraft } from '@/services/willService';
import { Step1_PersonalInfo } from './steps/Step1_PersonalInfo';
import { Step2_Executor } from './steps/Step2_Executor';
import { Step3_Guardians } from './steps/Step3_Guardians';
import { Step4_SpecificGifts } from './steps/Step4_SpecificGifts';
import { Step5_Residue } from './steps/Step5_Residue';
import { Step6_FinalWishes } from './steps/Step6_FinalWishes';
import { Step7_Review } from './steps/Step7_Review';

const STEP_TITLES = [
  'Personal Information',
  'Appoint Executor',
  'Guardians',
  'Specific Gifts',
  'Residual Estate',
  'Final Wishes',
  'Review & Generate'
];

export function WillWizard() {
  const [state, setState] = useState<WillWizardState>(() => {
    // Try to load draft on initial mount
    const draft = loadDraft();
    if (draft) {
      return draft;
    }
    
    // Default initial state
    return {
      currentStep: 1,
      totalSteps: 7,
      hasMinorChildren: false,
      personalInfo: {
        fullName: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
      },
      executor: {
        primary: '',
        alternate: undefined
      },
      guardians: undefined,
      specificGifts: [],
      residualBeneficiaries: [],
      finalWishes: '',
      completedSteps: new Set(),
      isValid: false
    };
  });

  // Auto-save draft on state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(state);
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timer);
  }, [state]);

  const handleUpdate = (updates: Partial<WillWizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    setState(prev => {
      let nextStep = prev.currentStep + 1;
      
      // Skip guardians step if no minor children
      if (nextStep === 3 && !prev.hasMinorChildren && !prev.guardians) {
        nextStep = 4;
      }
      
      return { ...prev, currentStep: Math.min(nextStep, prev.totalSteps) };
    });
  };

  const handleBack = () => {
    setState(prev => {
      let prevStep = prev.currentStep - 1;
      
      // Skip guardians step if no minor children when going back
      if (prevStep === 3 && !prev.hasMinorChildren && !prev.guardians) {
        prevStep = 2;
      }
      
      return { ...prev, currentStep: Math.max(prevStep, 1) };
    });
  };

  const renderStep = () => {
    const stepProps = {
      data: state,
      onUpdate: handleUpdate,
      onNext: handleNext,
      onBack: handleBack,
      isFirstStep: state.currentStep === 1,
      isLastStep: state.currentStep === state.totalSteps
    };

    switch (state.currentStep) {
      case 1:
        return <Step1_PersonalInfo {...stepProps} />;
      case 2:
        return <Step2_Executor {...stepProps} />;
      case 3:
        return <Step3_Guardians {...stepProps} />;
      case 4:
        return <Step4_SpecificGifts {...stepProps} />;
      case 5:
        return <Step5_Residue {...stepProps} />;
      case 6:
        return <Step6_FinalWishes {...stepProps} />;
      case 7:
        return <Step7_Review {...stepProps} />;
      default:
        return null;
    }
  };

  // Calculate actual progress considering skipped steps
  const calculateProgress = () => {
    const actualSteps = state.hasMinorChildren || state.guardians ? 7 : 6;
    const adjustedStep = state.currentStep > 3 && !state.hasMinorChildren && !state.guardians 
      ? state.currentStep - 1 
      : state.currentStep;
    return (adjustedStep / actualSteps) * 100;
  };

  const getCurrentStepTitle = () => {
    return STEP_TITLES[state.currentStep - 1];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {state.currentStep} of {state.totalSteps}</span>
          <span>{getCurrentStepTitle()}</span>
        </div>
        <AnimatedProgress value={calculateProgress()} className="h-2" />
      </div>

      {/* Step Content */}
      <Card className="p-6">
        {renderStep()}
      </Card>

      {/* Draft Saved Indicator */}
      <div className="text-center text-sm text-muted-foreground">
        Your progress is automatically saved
      </div>
    </div>
  );
}
