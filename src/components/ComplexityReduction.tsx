import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const ComplexityReduction = () => {
  const { t } = useTranslation('ui');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps = [
    {
      key: 'identifyBankAccount',
      title: t('complexityReduction.steps.identifyBankAccount.title'),
      why: t('complexityReduction.steps.identifyBankAccount.why'),
      whatYouDo: t('complexityReduction.steps.identifyBankAccount.whatYouDo'),
      whatWeDo: t('complexityReduction.steps.identifyBankAccount.whatWeDo'),
      timeRequired: t('complexityReduction.steps.identifyBankAccount.timeRequired'),
      complexity: t('complexityReduction.steps.identifyBankAccount.complexity'),
    },
    {
      key: 'emergencyContacts',
      title: t('complexityReduction.steps.emergencyContacts.title'),
      why: t('complexityReduction.steps.emergencyContacts.why'),
      whatYouDo: t('complexityReduction.steps.emergencyContacts.whatYouDo'),
      whatWeDo: t('complexityReduction.steps.emergencyContacts.whatWeDo'),
      timeRequired: t('complexityReduction.steps.emergencyContacts.timeRequired'),
      complexity: t('complexityReduction.steps.emergencyContacts.complexity'),
    },
    {
      key: 'insurancePolicies',
      title: t('complexityReduction.steps.insurancePolicies.title'),
      why: t('complexityReduction.steps.insurancePolicies.why'),
      whatYouDo: t('complexityReduction.steps.insurancePolicies.whatYouDo'),
      whatWeDo: t('complexityReduction.steps.insurancePolicies.whatWeDo'),
      timeRequired: t('complexityReduction.steps.insurancePolicies.timeRequired'),
      complexity: t('complexityReduction.steps.insurancePolicies.complexity'),
    },
    {
      key: 'digitalAssets',
      title: t('complexityReduction.steps.digitalAssets.title'),
      why: t('complexityReduction.steps.digitalAssets.why'),
      whatYouDo: t('complexityReduction.steps.digitalAssets.whatYouDo'),
      whatWeDo: t('complexityReduction.steps.digitalAssets.whatWeDo'),
      timeRequired: t('complexityReduction.steps.digitalAssets.timeRequired'),
      complexity: t('complexityReduction.steps.digitalAssets.complexity'),
    },
    {
      key: 'legalDocuments',
      title: t('complexityReduction.steps.legalDocuments.title'),
      why: t('complexityReduction.steps.legalDocuments.why'),
      whatYouDo: t('complexityReduction.steps.legalDocuments.whatYouDo'),
      whatWeDo: t('complexityReduction.steps.legalDocuments.whatWeDo'),
      timeRequired: t('complexityReduction.steps.legalDocuments.timeRequired'),
      complexity: t('complexityReduction.steps.legalDocuments.complexity'),
    },
    {
      key: 'familyInstructions',
      title: t('complexityReduction.steps.familyInstructions.title'),
      why: t('complexityReduction.steps.familyInstructions.why'),
      whatYouDo: t('complexityReduction.steps.familyInstructions.whatYouDo'),
      whatWeDo: t('complexityReduction.steps.familyInstructions.whatWeDo'),
      timeRequired: t('complexityReduction.steps.familyInstructions.timeRequired'),
      complexity: t('complexityReduction.steps.familyInstructions.complexity'),
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeStep = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
  };

  const progressPercentage = (completedSteps.size / steps.length) * 100;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('complexityReduction.title')}
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          {t('complexityReduction.subtitle')}
        </p>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('complexityReduction.description')}
        </p>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            {t('complexityReduction.progress.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercentage} className="w-full" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('complexityReduction.progress.completed')}: {completedSteps.size}</span>
              <span>{t('complexityReduction.progress.totalSteps')}: {steps.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('complexityReduction.benefits.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-700">
                {t('complexityReduction.benefits.overwhelm.title')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('complexityReduction.benefits.overwhelm.description')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700">
                {t('complexityReduction.benefits.progress.title')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('complexityReduction.benefits.progress.description')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700">
                {t('complexityReduction.benefits.confidence.title')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('complexityReduction.benefits.confidence.description')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-red-700">
                {t('complexityReduction.benefits.family.title')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('complexityReduction.benefits.family.description')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('complexityReduction.features.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800">
                {t('complexityReduction.features.stepByStep.title')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('complexityReduction.features.stepByStep.description')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">
                {t('complexityReduction.features.timeEstimation.title')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('complexityReduction.features.timeEstimation.description')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">
                {t('complexityReduction.features.difficultyLevels.title')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('complexityReduction.features.difficultyLevels.description')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">
                {t('complexityReduction.features.progressTracking.title')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('complexityReduction.features.progressTracking.description')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">
                {t('complexityReduction.features.helpAvailable.title')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('complexityReduction.features.helpAvailable.description')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            {steps[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-green-700">Why This Matters</h4>
                <p className="text-sm text-gray-600">{steps[currentStep].why}</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700">What You Do</h4>
                <p className="text-sm text-gray-600">{steps[currentStep].whatYouDo}</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-700">What We Do</h4>
                <p className="text-sm text-gray-600">{steps[currentStep].whatWeDo}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{steps[currentStep].timeRequired}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">{steps[currentStep].complexity}</span>
              </div>
              {completedSteps.has(currentStep) && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button onClick={completeStep} variant="default">
              {t('complexityReduction.actions.completeStep')}
            </Button>
            <Button onClick={() => {}} variant="outline">
              {t('complexityReduction.actions.showMeHow')}
            </Button>
            <Button onClick={() => {}} variant="outline">
              <HelpCircle className="w-4 h-4 mr-2" />
              {t('complexityReduction.actions.iNeedHelp')}
            </Button>
            <Button onClick={() => {}} variant="ghost">
              {t('complexityReduction.actions.skipStep')}
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button 
              onClick={previousStep} 
              disabled={currentStep === 0}
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('complexityReduction.actions.previousStep')}
            </Button>
            <Button 
              onClick={nextStep} 
              disabled={currentStep === steps.length - 1}
              variant="outline"
            >
              {t('complexityReduction.actions.nextStep')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplexityReduction;

