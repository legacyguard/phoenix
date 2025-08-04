import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  Lightbulb,
  Target,
  Shield,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FirstTimeUserGuideProps {
  onComplete: () => void;
}

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
  targetElement?: string;
}

export const FirstTimeUserGuide: React.FC<FirstTimeUserGuideProps> = ({ onComplete }) => {
  const { t } = useTranslation('common');
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps: GuideStep[] = [
    {
      id: 'welcome',
      title: t('dashboard.firstTimeGuide.welcome.title'),
      description: t('dashboard.firstTimeGuide.welcome.description'),
      icon: <Shield className="h-8 w-8 text-primary" />,
      tips: [
        t('dashboard.firstTimeGuide.welcome.tip1'),
        t('dashboard.firstTimeGuide.welcome.tip2'),
        t('dashboard.firstTimeGuide.welcome.tip3')
      ]
    },
    {
      id: 'progress',
      title: t('dashboard.firstTimeGuide.progress.title'),
      description: t('dashboard.firstTimeGuide.progress.description'),
      icon: <Target className="h-8 w-8 text-primary" />,
      tips: [
        t('dashboard.firstTimeGuide.progress.tip1'),
        t('dashboard.firstTimeGuide.progress.tip2')
      ],
      targetElement: '.progress-tracking-section'
    },
    {
      id: 'stages',
      title: t('dashboard.firstTimeGuide.stages.title'),
      description: t('dashboard.firstTimeGuide.stages.description'),
      icon: <ClipboardCheck className="h-8 w-8 text-primary" />,
      tips: [
        t('dashboard.firstTimeGuide.stages.tip1'),
        t('dashboard.firstTimeGuide.stages.tip2'),
        t('dashboard.firstTimeGuide.stages.tip3')
      ],
      targetElement: '.stages-timeline-section'
    },
    {
      id: 'recommendations',
      title: t('dashboard.firstTimeGuide.recommendations.title'),
      description: t('dashboard.firstTimeGuide.recommendations.description'),
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      tips: [
        t('dashboard.firstTimeGuide.recommendations.tip1'),
        t('dashboard.firstTimeGuide.recommendations.tip2')
      ],
      targetElement: '.recommendations-section'
    }
  ];

  useEffect(() => {
    // Check if user has already seen the guide
    const hasSeenGuide = localStorage.getItem('legacyguard-dashboard-guide-completed');
    if (hasSeenGuide) {
      setIsVisible(false);
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollToTarget(steps[currentStep + 1].targetElement);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollToTarget(steps[currentStep - 1].targetElement);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('legacyguard-dashboard-guide-completed', 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const scrollToTarget = (selector?: string) => {
    if (selector) {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  if (!isVisible) {
    return null;
  }

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-4 mb-4">
            {currentStepData.icon}
            <div>
              <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t('dashboard.firstTimeGuide.stepProgress', { 
                  current: currentStep + 1, 
                  total: steps.length 
                })}
              </p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto max-h-[60vh]">
          <CardDescription className="text-base">
            {currentStepData.description}
          </CardDescription>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              {t('dashboard.firstTimeGuide.helpfulTips')}
            </h4>
            <div className="space-y-2">
              {currentStepData.tips.map((tip, index) => (
                <Alert key={index} className="border-l-4 border-l-primary">
                  <AlertDescription className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>

          <Alert className="bg-muted/50 border-muted">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('dashboard.firstTimeGuide.importantNote')}
            </AlertDescription>
          </Alert>

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('dashboard.firstTimeGuide.previous')}
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              {t('dashboard.firstTimeGuide.skipTour')}
            </Button>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 
                ? t('dashboard.firstTimeGuide.finish') 
                : t('dashboard.firstTimeGuide.next')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
