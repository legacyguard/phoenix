import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  Shield,
  Users,
  FileText,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

interface FirstTimeUserGuideProps {
  onComplete: () => void;
}

export const FirstTimeUserGuide: React.FC<FirstTimeUserGuideProps> = ({
  onComplete,
}) => {
  const { t } = useTranslation("ui-common");
  const { trackAction } = useAnalytics({
    componentName: "FirstTimeUserGuide",
    userJourneyStage: "onboarding",
  });
  const [currentStep, setCurrentStep] = useState(0);

  const guideSteps = [
    {
      icon: <Shield className="h-8 w-8 text-primary" data-testid="firsttimeuserguide-shield" />,
      title: t("firstTimeGuide.step1.title", "Welcome to Your Heritage Vault"),
      description: t(
        "firstTimeGuide.step1.description",
        "LegacyGuard is your secure, private space to organize everything important for your family. Think of it as a digital vault that only you control.",
      ),
      details: [
        t(
          "firstTimeGuide.step1.detail1",
          "Your data stays private - we never sell or share your information",
        ),
        t(
          "firstTimeGuide.step1.detail2",
          "Everything is encrypted and stored securely",
        ),
        t(
          "firstTimeGuide.step1.detail3",
          "You decide who gets access and when",
        ),
      ],
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" data-testid="firsttimeuserguide-filetext" />,
      title: t("firstTimeGuide.step2.title", "Your Three Main Areas"),
      description: t(
        "firstTimeGuide.step2.description",
        "LegacyGuard is organized around three simple areas that cover everything your family needs to know.",
      ),
      details: [
        t(
          "firstTimeGuide.step2.detail1",
          "Vault: Store your important documents and asset information",
        ),
        t(
          "firstTimeGuide.step2.detail2",
          "Trusted Circle: Designate people who will help your family",
        ),
        t(
          "firstTimeGuide.step2.detail3",
          "Legacy Letters: Leave personal messages for your loved ones",
        ),
      ],
    },
    {
      icon: <Users className="h-8 w-8 text-primary" data-testid="firsttimeuserguide-users" />,
      title: t("firstTimeGuide.step3.title", "Start Small, Build Over Time"),
      description: t(
        "firstTimeGuide.step3.description",
        "You don't need to do everything at once. Start with the most important items and add more as you go.",
      ),
      details: [
        t(
          "firstTimeGuide.step3.detail1",
          "Begin with your most critical documents and accounts",
        ),
        t(
          "firstTimeGuide.step3.detail2",
          "Add one trusted person who can help in emergencies",
        ),
        t(
          "firstTimeGuide.step3.detail3",
          "Set aside 15 minutes each month to add more details",
        ),
      ],
    },
  ];

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      trackAction("first_time_guide_step_completed", { step: currentStep + 1 });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    trackAction("first_time_guide_completed", {
      total_steps: guideSteps.length,
    });
    // Mark onboarding as completed in localStorage
    localStorage.setItem("onboardingCompleted", "true");
    localStorage.setItem("firstTimeGuideCompleted", "true");
    onComplete();
  };

  const currentGuideStep = guideSteps[currentStep];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl" data-testid="firsttimeuserguide-card">
        <CardHeader className="text-center" data-testid="firsttimeuserguide-cardheader">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              {currentGuideStep.icon}
            </div>
          </div>
          <CardTitle className="text-2xl" data-testid="firsttimeuserguide-currentguidestep-title">{currentGuideStep.title}</CardTitle>
          <CardDescription className="text-lg" data-testid="firsttimeuserguide-currentguidestep-description">
            {currentGuideStep.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6" data-testid="firsttimeuserguide-progress-indicator">
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {guideSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full ${
                  index <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step details */}
          <div className="space-y-4">
            {currentGuideStep.details.map((detail, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" data-testid="firsttimeuserguide-checkcircle" />
                <p className="text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>

          {/* Tip box for the last step */}
          {currentStep === guideSteps.length - 1 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" data-testid="firsttimeuserguide-lightbulb" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    {t("firstTimeGuide.tip.title", "Pro Tip")}
                  </h4>
                  <p className="text-blue-800 text-sm">
                    {t(
                      "firstTimeGuide.tip.description",
                      "Your dashboard will show you the most important next steps based on your answers. Focus on completing the high-priority items first.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0} data-testid="firsttimeuserguide-t-common-previous-previous"
            >
              {t("common.previous", "Previous")}
            </Button>

            {currentStep === guideSteps.length - 1 ? (
              <Button
                onClick={handleComplete}
                className="flex items-center space-x-2" data-testid="firsttimeuserguide-t-firsttimeguide-getstarted-get-started"
              >
                <span>{t("firstTimeGuide.getStarted", "Get Started")}</span>
                <ArrowRight className="h-4 w-4" data-testid="firsttimeuserguide-arrowright" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex items-center space-x-2" data-testid="firsttimeuserguide-t-common-next-next"
              >
                <span>{t("common.next", "Next")}</span>
                <ArrowRight className="h-4 w-4" data-testid="firsttimeuserguide-arrowright" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirstTimeUserGuide;
