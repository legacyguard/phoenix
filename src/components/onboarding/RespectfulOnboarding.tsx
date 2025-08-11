import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Shield, 
  Heart, 
  FileText, 
  Users, 
  ChevronRight, 
  ChevronLeft,
  X,
  Info,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import type EssentialQuestions, { EssentialAnswers } from './EssentialQuestions';
import ImmediateValueUpload from './ImmediateValueUpload';
import { generatePersonalizedPlan, getTaskEstimate } from './essentialRecommendations';

interface RespectfulOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
  skipToUpload?: boolean;
  userName?: string;
}

export interface OnboardingData {
  answers?: EssentialAnswers;
  documents?: UploadedDoc[];
  recommendations?: PlanRecommendation[];
  completedSteps: string[];
}

// Types for uploaded documents and plan recommendations used here
export interface UploadedDoc {
  id?: string;
  name?: string;
  type?: string;
  url?: string;
}

export interface PlanRecommendation {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  link?: string;
}

type OnboardingStep = 'welcome' | 'questions' | 'upload' | 'recommendations';

const RespectfulOnboarding: React.FC<RespectfulOnboardingProps> = ({
  isOpen,
  onClose,
  onComplete,
  skipToUpload = false,
  userName
}) => {
  const { t } = useTranslation('onboarding');
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [answers, setAnswers] = useState<EssentialAnswers | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDoc[]>([]);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Initialize step based on props
  // This component intentionally avoids gamification; see migration guide in docs/migration-guide-respectful-onboarding.md
  useEffect(() => {
    if (skipToUpload && isOpen) {
      setCurrentStep('upload');
    } else if (isOpen) {
      setCurrentStep('welcome');
    }
  }, [isOpen, skipToUpload]);

  // Save progress to localStorage
  useEffect(() => {
    if (answers || uploadedDocuments.length > 0) {
      localStorage.setItem('respectfulOnboardingProgress', JSON.stringify({
        answers,
        uploadedDocuments,
        completedSteps,
        timestamp: new Date().toISOString()
      }));
    }
  }, [answers, uploadedDocuments, completedSteps]);

  // Restore progress on mount
  useEffect(() => {
    const saved = localStorage.getItem('respectfulOnboardingProgress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        if (progress.answers) setAnswers(progress.answers);
        if (progress.uploadedDocuments) setUploadedDocuments(progress.uploadedDocuments);
        if (progress.completedSteps) setCompletedSteps(progress.completedSteps);
      } catch (error) {
        console.error('Failed to restore progress:', error);
      }
    }
  }, []);

  const handleQuestionsComplete = (questionsAnswers: EssentialAnswers) => {
    setAnswers(questionsAnswers);
    setCompletedSteps(prev => [...prev, 'questions']);
    setCurrentStep('upload');
  };

  const handleUploadComplete = (documents: UploadedDoc[]) => {
    setUploadedDocuments(documents);
    setCompletedSteps(prev => [...prev, 'upload']);
    
    if (answers) {
      setCurrentStep('recommendations');
    } else {
      // If no questions answered, go straight to completion
      handleFinalComplete();
    }
  };

  const handleSkipQuestions = () => {
    setCompletedSteps(prev => [...prev, 'questions-skipped']);
    setCurrentStep('upload');
  };

  const handleSkipUpload = () => {
    setCompletedSteps(prev => [...prev, 'upload-skipped']);
    if (answers) {
      setCurrentStep('recommendations');
    } else {
      handleFinalComplete();
    }
  };

  const handleFinalComplete = () => {
    const plan = answers ? generatePersonalizedPlan(answers) : null;
    
    onComplete({
      answers: answers || undefined,
      documents: uploadedDocuments,
      recommendations: plan?.recommendations,
      completedSteps
    });

    // Clear progress after completion
    localStorage.removeItem('respectfulOnboardingProgress');
  };

  const handleClose = () => {
    if (answers || uploadedDocuments.length > 0) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t('respectful.title')}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto">
          {currentStep === 'welcome' && (
            <WelcomeStep 
              userName={userName}
              onContinue={() => setCurrentStep('questions')}
              onSkipToUpload={() => setCurrentStep('upload')}
            />
          )}

          {currentStep === 'questions' && (
            <div className="p-6">
              <EssentialQuestions
                onComplete={handleQuestionsComplete}
                onSkip={handleSkipQuestions}
                showProgress={false}
              />
            </div>
          )}

          {currentStep === 'upload' && (
            <div className="p-6">
              <ImmediateValueUpload
                onComplete={handleUploadComplete}
                onSkip={handleSkipUpload}
                maxDocuments={3}
                showOnboarding={true}
              />
            </div>
          )}

          {currentStep === 'recommendations' && answers && (
            <RecommendationsStep
              answers={answers}
              documents={uploadedDocuments}
              onComplete={handleFinalComplete}
            />
          )}
        </div>

        {/* Footer - Non-gamified progress indicator */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StepIndicator 
                label={t('respectful.steps.understand')}
                completed={completedSteps.includes('questions')}
                active={currentStep === 'questions'}
              />
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <StepIndicator 
                label={t('respectful.steps.secure')}
                completed={completedSteps.includes('upload')}
                active={currentStep === 'upload'}
              />
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <StepIndicator 
                label={t('respectful.steps.plan')}
                completed={completedSteps.includes('recommendations')}
                active={currentStep === 'recommendations'}
              />
            </div>
            
            {(answers || uploadedDocuments.length > 0) && (
              <p className="text-sm text-gray-500">
                {t('respectful.progressSaved')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Close Confirmation Dialog */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('respectful.closeConfirm.title')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('respectful.closeConfirm.message')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('respectful.closeConfirm.continue')}
              </button>
              <button
                onClick={confirmClose}
                className="flex-grow px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('respectful.closeConfirm.saveAndClose')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Welcome Step Component
const WelcomeStep: React.FC<{
  userName?: string;
  onContinue: () => void;
  onSkipToUpload: () => void;
}> = ({ userName, onContinue, onSkipToUpload }) => {
  const { t } = useTranslation('onboarding');
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Heart className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {userName 
            ? t('respectful.welcome.titlePersonal', { name: userName })
            : t('respectful.welcome.title')
          }
        </h2>
        <p className="text-xl text-gray-600 mb-3">
          {t('respectful.welcome.subtitle')}
        </p>
        <p className="text-gray-500">
          {t('respectful.welcome.description')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            {t('respectful.welcome.benefit1.title')}
          </h3>
          <p className="text-sm text-gray-600">
            {t('respectful.welcome.benefit1.description')}
          </p>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            {t('respectful.welcome.benefit2.title')}
          </h3>
          <p className="text-sm text-gray-600">
            {t('respectful.welcome.benefit2.description')}
          </p>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-3">
            <Sparkles className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            {t('respectful.welcome.benefit3.title')}
          </h3>
          <p className="text-sm text-gray-600">
            {t('respectful.welcome.benefit3.description')}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onContinue}
          className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {t('respectful.welcome.startButton')}
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={onSkipToUpload}
          className="flex-grow border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
        >
          {t('respectful.welcome.uploadFirst')}
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        <Info className="w-4 h-4 inline mr-1" />
        {t('respectful.welcome.timeEstimate')}
      </p>
    </div>
  );
};

// Recommendations Step Component
const RecommendationsStep: React.FC<{
  answers: EssentialAnswers;
  documents: UploadedDoc[];
  onComplete: () => void;
}> = ({ answers, documents, onComplete }) => {
  const { t } = useTranslation('onboarding');
  const plan = generatePersonalizedPlan(answers);
  const estimate = getTaskEstimate(answers);
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t('respectful.recommendations.title')}
        </h2>
        <p className="text-xl text-gray-600 mb-3">
          {plan.reassurance}
        </p>
        <p className="text-gray-500">
          {plan.timeline}
        </p>
      </div>

      {/* Focus Areas */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">
          {t('respectful.recommendations.focusAreas')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {plan.focusAreas.map((area, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-white rounded-full text-sm font-medium text-blue-700"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Top Recommendations */}
      <div className="space-y-4 mb-8">
        <h3 className="font-semibold text-gray-900">
          {t('respectful.recommendations.nextSteps')}
        </h3>
        {plan.recommendations.slice(0, 3).map((rec, index) => (
          <div 
            key={rec.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${rec.priority === 'immediate' ? 'bg-red-100 text-red-600' :
                    rec.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'}
                `}>
                  {index + 1}
                </div>
              </div>
              <div className="flex-grow">
                <h4 className="font-medium text-gray-900 mb-1">
                  {rec.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {rec.description}
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">
                    {rec.estimatedTime}
                  </span>
                  {rec.link && (
                    <a 
                      href={rec.link}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {t('respectful.recommendations.startThis')} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {plan.recommendations.length}
          </p>
          <p className="text-sm text-gray-500">
            {t('respectful.recommendations.tasksIdentified')}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {documents.length}
          </p>
          <p className="text-sm text-gray-500">
            {t('respectful.recommendations.documentsSecured')}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            {estimate.totalTime}
          </p>
          <p className="text-sm text-gray-500">
            {t('respectful.recommendations.estimatedTime')}
          </p>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {t('respectful.recommendations.completeButton')}
        <CheckCircle className="w-5 h-5" />
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        {t('respectful.recommendations.accessAnytime')}
      </p>
    </div>
  );
};

// Step Indicator Component (Non-gamified)
const StepIndicator: React.FC<{
  label: string;
  completed: boolean;
  active: boolean;
}> = ({ label, completed, active }) => {
  return (
    <div className="flex items-center gap-2">
      {completed ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <div className={`
          w-5 h-5 rounded-full border-2
          ${active ? 'border-blue-600 bg-blue-100' : 'border-gray-300'}
        `} />
      )}
      <span className={`
        text-sm font-medium
        ${completed ? 'text-green-600' : active ? 'text-gray-900' : 'text-gray-500'}
      `}>
        {label}
      </span>
    </div>
  );
};

export default RespectfulOnboarding;
