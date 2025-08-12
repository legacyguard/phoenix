import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ChevronRight, Loader2, SkipForward } from "lucide-react";
import type { Checkbox } from "@/components/ui/checkbox";
import { useAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BasicLifeQuestions, { LifeAnswers } from "./BasicLifeQuestions";
import {
  mapLifeAnswersToProjectOrder,
  mapProjectOrderToLifeAnswers,
} from "./lifeAnswersMapper";
import type { ProjectOrderAnswers } from "./types";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  pillar: "secure" | "organize" | "transfer";
  completed: boolean;
  link?: string;
}

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (tasks: TaskItem[], answers?: ProjectOrderAnswers) => void;
  useLifeQuestions?: boolean; // Optional prop to enable/disable life questions
  useRespectfulFlow?: boolean; // Optional prop to use respectful onboarding flow
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  useLifeQuestions = true,
  useRespectfulFlow = false,
}) => {
  const { t } = useTranslation("help");
  const { t: tCommon } = useTranslation("ui-common");
  const { trackAction, trackFormInteraction, startTimer, endTimer } =
    useAnalytics({
      componentName: "OnboardingWizard",
      userJourneyStage: "onboarding",
    });
  const [currentStep, setCurrentStep] = useState(0); // 0 for BasicLifeQuestions
  const [isLoading, setIsLoading] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [sessionTimerId, setSessionTimerId] = useState<string | null>(null);
  const [showLifeQuestions, setShowLifeQuestions] = useState(useLifeQuestions);

  // Project Order answers
  const [answers, setAnswers] = useState<ProjectOrderAnswers>({
    documentAccess: "no",
    caretaker: "not_thought",
    familyClarity: "never_discussed",
    biggestWorry: "financial",
  });

  const totalSteps = 4; // Not including BasicLifeQuestions

  // Check for existing progress on mount
  useEffect(() => {
    if (isOpen) {
      const timerId = startTimer("onboarding_session");
      setSessionTimerId(timerId);
      trackAction("onboarding_started");

      const progressData = localStorage.getItem("onboardingProgress");
      if (progressData) {
        try {
          const { currentStep: savedStep, answers: savedAnswers } =
            JSON.parse(progressData);
          if (savedStep && savedAnswers) {
            setCurrentStep(savedStep);
            setAnswers(savedAnswers);
            trackAction("onboarding_resumed", { resumed_at_step: savedStep });
          }
        } catch (error) {
          console.error("Failed to restore onboarding progress:", error);
        }
      }
    }

    return () => {
      if (sessionTimerId) {
        endTimer(sessionTimerId, true);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      trackAction(
        `onboarding_step_${currentStep}_completed`,
        {
          question: `q${currentStep}`,
          answer: Object.entries(answers)[currentStep - 1],
        },
        "satisfied",
      );
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    // All questions have default values, so we can always proceed
    return true;
  };

  const generateTasks = (answers: ProjectOrderAnswers): TaskItem[] => {
    const tasks: TaskItem[] = [];
    const lifeAnswers = answers.lifeAnswers;

    // Priority 1: Document organization based on Q1 and emotional concerns
    if (
      answers.documentAccess === "no" ||
      answers.documentAccess === "partially"
    ) {
      const docTitle = t("dashboard.tasks.documentCentralization.title");
      let docDescription = t(
        "dashboard.tasks.documentCentralization.description",
      );

      // Personalize based on emotional concern
      if (lifeAnswers?.emotionalConcern === "family_confusion") {
        docDescription =
          "Create a clear roadmap so your family knows exactly where to find everything, preventing confusion and costly mistakes.";
      } else if (lifeAnswers?.emotionalConcern === "lost_opportunities") {
        docDescription =
          "Organize all important documents and accounts so nothing valuable gets forgotten or lost.";
      }

      tasks.push({
        id: "document-centralization",
        title: docTitle,
        description: docDescription,
        priority:
          lifeAnswers?.timelineUrgency === "immediate" ? "high" : "high",
        pillar: "organize",
        completed: false,
        link: "/vault",
      });

      // If they have no idea where documents are, also add asset inventory
      if (answers.documentAccess === "no") {
        tasks.push({
          id: "asset-inventory",
          title: t("dashboard.tasks.assetInventory.title"),
          description: t("dashboard.tasks.assetInventory.description"),
          priority: "high",
          pillar: "organize",
          completed: false,
          link: "/assets/new?type=RealEstate",
        });
      }
    }

    // Priority 2: Guardian designation based on Q2 and family structure
    if (
      answers.caretaker === "not_thought" ||
      answers.caretaker === "family_figure_out"
    ) {
      let guardianDescription = t(
        "dashboard.tasks.guardianInstructions.description",
      );

      // Personalize based on family structure
      if (lifeAnswers?.familyStructure === "young_children") {
        guardianDescription =
          "Your young children need trusted guardians who can step in immediately. Let's ensure they're properly designated and prepared.";
      } else if (lifeAnswers?.familyStructure === "blended_family") {
        guardianDescription =
          "With a blended family, clear guardian designations prevent conflicts and ensure everyone is cared for according to your wishes.";
      }

      tasks.push({
        id: "guardian-instructions",
        title: t("dashboard.tasks.guardianInstructions.title"),
        description: guardianDescription,
        priority: "high",
        pillar: "secure",
        completed: false,
        link: "/guardians",
      });

      // Also add emergency contacts if they haven't thought about it
      if (answers.caretaker === "not_thought") {
        tasks.push({
          id: "emergency-contacts",
          title: t("dashboard.tasks.emergencyContacts.title"),
          description: t("dashboard.tasks.emergencyContacts.description"),
          priority: "high",
          pillar: "secure",
          completed: false,
          link: "/manual",
        });
      }
    }

    // Priority 3: Will preparation based on Q3
    if (
      answers.familyClarity === "never_discussed" ||
      answers.familyClarity === "somewhat"
    ) {
      tasks.push({
        id: "will-preparation",
        title: t("dashboard.tasks.willPreparation.title"),
        description: t("dashboard.tasks.willPreparation.description"),
        priority: "high",
        pillar: "transfer",
        completed: false,
        link: "/will",
      });
    }

    // Priority 4: Address specific worries from Q4
    switch (answers.biggestWorry) {
      case "financial":
        tasks.push({
          id: "bank-account",
          title: t("dashboard.tasks.bankAccount.title"),
          description: t("dashboard.tasks.bankAccount.description"),
          priority: "high",
          pillar: "organize",
          completed: false,
          link: "/assets/new?type=FinancialAccount",
        });
        break;

      case "legal":
        tasks.push({
          id: "inheritance-education",
          title: t("dashboard.tasks.inheritanceEducation.title"),
          description: t("dashboard.tasks.inheritanceEducation.description"),
          priority: "high",
          pillar: "transfer",
          completed: false,
          link: "/help",
        });
        break;

      case "memories":
        tasks.push({
          id: "personal-messages",
          title: t("dashboard.tasks.personalMessages.title"),
          description: t("dashboard.tasks.personalMessages.description"),
          priority: "high",
          pillar: "transfer",
          completed: false,
          link: "/manual#instructions",
        });
        break;

      case "conflicts":
        tasks.push({
          id: "family-meeting",
          title: t("dashboard.tasks.familyMeeting.title"),
          description: t("dashboard.tasks.familyMeeting.description"),
          priority: "high",
          pillar: "transfer",
          completed: false,
          link: "/manual",
        });
        break;
    }

    // Add digital asset planning if they haven't designated anyone
    if (answers.caretaker === "not_thought") {
      tasks.push({
        id: "digital-asset-plan",
        title: t("dashboard.tasks.digitalAssetPlan.title"),
        description: t("dashboard.tasks.digitalAssetPlan.description"),
        priority: "medium",
        pillar: "secure",
        completed: false,
        link: "/manual",
      });
    }

    // Add specialized tasks based on life answers
    if (
      lifeAnswers?.familyStructure === "young_children" &&
      !tasks.find((t) => t.id === "education-planning")
    ) {
      tasks.push({
        id: "education-planning",
        title: "Plan for Children's Education",
        description:
          "Since you have young children, let's ensure their education is secured no matter what happens.",
        priority: "medium",
        pillar: "transfer",
        completed: false,
        link: "/education-planning",
      });
    }

    if (
      lifeAnswers?.familyStructure === "extended_care" &&
      !tasks.find((t) => t.id === "care-instructions")
    ) {
      tasks.push({
        id: "care-instructions",
        title: "Document Special Care Instructions",
        description:
          "Create detailed care instructions for family members with special needs to ensure continuity of care.",
        priority: "high",
        pillar: "secure",
        completed: false,
        link: "/care-planning",
      });
    }

    if (
      lifeAnswers?.financialComplexity === "business_owner" &&
      !tasks.find((t) => t.id === "business-succession")
    ) {
      tasks.push({
        id: "business-succession",
        title: "Create Business Succession Plan",
        description:
          "Protect your family's income by ensuring your business can continue or be sold according to your wishes.",
        priority: "high",
        pillar: "transfer",
        completed: false,
        link: "/business-succession",
      });
    }

    if (
      lifeAnswers?.financialComplexity === "complex_estate" &&
      !tasks.find((t) => t.id === "estate-planning")
    ) {
      tasks.push({
        id: "estate-planning",
        title: "Advanced Estate Planning Review",
        description:
          "Your complex financial situation requires sophisticated planning. Let's ensure everything is properly structured.",
        priority: "high",
        pillar: "transfer",
        completed: false,
        link: "/estate-planning",
      });
    }

    // Adjust priorities based on timeline urgency
    if (lifeAnswers?.timelineUrgency === "immediate") {
      tasks.forEach((task) => {
        if (task.priority === "medium") {
          task.priority = "high";
        }
      });
    }

    // Remove duplicates and sort by priority
    const uniqueTasks = Array.from(
      new Map(tasks.map((task) => [task.id, task])).values(),
    );

    return uniqueTasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const handleComplete = async () => {
    setIsLoading(true);
    trackAction("onboarding_analysis_started", { answers });

    // Simulate analysis time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const tasks = generateTasks(answers);

    // Clear onboarding data from localStorage
    localStorage.removeItem("onboardingSkipped");
    localStorage.removeItem("onboardingProgress");

    trackAction(
      "onboarding_completed",
      {
        total_tasks_generated: tasks.length,
        answers,
        task_priorities: tasks.map((t) => t.priority),
      },
      "accomplished",
    );

    if (sessionTimerId) {
      endTimer(sessionTimerId, true);
    }

    onComplete(tasks, answers);
    setIsLoading(false);
  };

  const handleSkip = () => {
    setShowSkipConfirm(true);
  };

  const handleSkipConfirm = () => {
    // Store skip status and current progress in localStorage
    localStorage.setItem("onboardingSkipped", "true");
    localStorage.setItem(
      "onboardingProgress",
      JSON.stringify({
        currentStep,
        answers,
        timestamp: new Date().toISOString(),
      }),
    );

    trackAction(
      "onboarding_skipped",
      {
        skipped_at_step: currentStep,
        completed_steps: currentStep - 1,
      },
      "frustrated",
    );

    if (sessionTimerId) {
      endTimer(sessionTimerId, false);
    }

    setShowSkipConfirm(false);
    onClose();
  };

  const handleLifeQuestionsComplete = (lifeAnswers: LifeAnswers) => {
    const projectOrderAnswers = mapLifeAnswersToProjectOrder(lifeAnswers);
    // Store the original life answers for enhanced personalization
    setAnswers({ ...projectOrderAnswers, lifeAnswers });
    setShowLifeQuestions(false);
    setCurrentStep(1);
    trackAction("life_questions_completed", { lifeAnswers });
  };

  const handleLifeQuestionsBack = () => {
    handleSkip();
  };

  const renderStep = () => {
    if (isLoading) {
      return (
        <div className="space-y-8 text-center">
          <div className="space-y-6">
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold">{t("analysis.title")}</h3>
              <p className="text-muted-foreground">{t("analysis.subtitle")}</p>
            </div>
          </div>
        </div>
      );
    }

    if (showLifeQuestions) {
      return (
        <BasicLifeQuestions
          initialAnswers={mapProjectOrderToLifeAnswers(answers)}
          onComplete={handleLifeQuestionsComplete}
          onBack={handleLifeQuestionsBack}
        />
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold">{t("help:help.q1.title")}</h3>
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <Button
                  variant={
                    answers.documentAccess === "yes" ? "default" : "outline"
                  }
                  onClick={() => {
                    setAnswers((prev) => ({ ...prev, documentAccess: "yes" }));
                    trackFormInteraction(
                      "onboarding_q1",
                      "field_changed",
                      "documentAccess",
                    );
                  }}
                  size="lg"
                  className="w-full text-left justify-start"
                >
                  {t("help:help.q1.option1")}
                </Button>
                <Button
                  variant={
                    answers.documentAccess === "no" ? "default" : "outline"
                  }
                  onClick={() => {
                    setAnswers((prev) => ({ ...prev, documentAccess: "no" }));
                    trackFormInteraction(
                      "onboarding_q1",
                      "field_changed",
                      "documentAccess",
                    );
                  }}
                  size="lg"
                  className="w-full text-left justify-start"
                >
                  {t("help:help.q1.option2")}
                </Button>
                <Button
                  variant={
                    answers.documentAccess === "partially"
                      ? "default"
                      : "outline"
                  }
                  onClick={() => {
                    setAnswers((prev) => ({
                      ...prev,
                      documentAccess: "partially",
                    }));
                    trackFormInteraction(
                      "onboarding_q1",
                      "field_changed",
                      "documentAccess",
                    );
                  }}
                  size="lg"
                  className="w-full text-left justify-start"
                >
                  {t("help:help.q1.option3")}
                </Button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold">{t("help:help.q2.title")}</h3>
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <Button
                  variant={
                    answers.caretaker === "designated" ? "default" : "outline"
                  }
                  onClick={() => {
                    setAnswers((prev) => ({
                      ...prev,
                      caretaker: "designated",
                    }));
                    trackFormInteraction(
                      "onboarding_q2",
                      "field_changed",
                      "caretaker",
                    );
                  }}
                  size="lg"
                  className="w-full text-left justify-start"
                >
                  {t("help:help.q2.option1")}
                </Button>
                <Button
                  variant={
                    answers.caretaker === "family_figure_out"
                      ? "default"
                      : "outline"
                  }
                  onClick={() => {
                    setAnswers((prev) => ({
                      ...prev,
                      caretaker: "family_figure_out",
                    }));
                    trackFormInteraction(
                      "onboarding_q2",
                      "field_changed",
                      "caretaker",
                    );
                  }}
                  size="lg"
                  className="w-full text-left justify-start"
                >
                  {t("help:help.q2.option2")}
                </Button>
                <Button
                  variant={
                    answers.caretaker === "not_thought" ? "default" : "outline"
                  }
                  onClick={() => {
                    setAnswers((prev) => ({
                      ...prev,
                      caretaker: "not_thought",
                    }));
                    trackFormInteraction(
                      "onboarding_q2",
                      "field_changed",
                      "caretaker",
                    );
                  }}
                  size="lg"
                  className="w-full text-left justify-start"
                >
                  {t("help:help.q2.option3")}
                </Button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold">{t("help:help.q3.title")}</h3>
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <Button
                  variant={
                    answers.familyClarity === "yes_clear"
                      ? "default"
                      : "outline"
                  }
                  onClick={() => {
                    setAnswers((prev) => ({
                      ...prev,
                      familyClarity: "yes_clear",
                    }));
                    trackFormInteraction(
                      "onboarding_q3",
                      "field_changed",
                      "familyClarity",
                    );
                  }}
                  size="lg"
                  className="w-full text-left justify-start"
                >
                  {t("help:help.q3.option1")}
                </Button>
                <Button
                  variant={
                    answers.familyClarity === "somewhat" ? "default" : "outline"
                  }
                  onClick={() => {
                    setAnswers((prev) => ({
                      ...prev,
                      familyClarity: "somewhat",
                    }));
                    trackFormInteraction(
                      "onboarding_q3",
                      "field_changed",
                      "familyClarity",
                    );
                  }}
                  size="lg"
                  className="w-full text-left justify-start"
                >
                  {t("help:help.q3.option2")}
                </Button>
                <Button
                  variant={
                    answers.familyClarity === "never_discussed"
                      ? "default"
                      : "outline"
                  }
                  onClick={() => {
                    setAnswers((prev) => ({
                      ...prev,
                      familyClarity: "never_discussed",
                    }));
                    trackFormInteraction(
                      "onboarding_q3",
                      "field_changed",
                      "familyClarity",
                    );
                  }}
                  size="lg"
                  className="w-full text-left justify-start"
                >
                  {t("help:help.q3.option3")}
                </Button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold">{t("help:help.q4.title")}</h3>
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <Button
                  variant={
                    answers.biggestWorry === "financial" ? "default" : "outline"
                  }
                  onClick={() => {
                    setAnswers((prev) => ({
                      ...prev,
                      biggestWorry: "financial",
                    }));
                    trackFormInteraction(
                      "onboarding_q4",
                      "field_changed",
                      "biggestWorry",
                    );
                  }}
                  size="lg"
                  className="w-full text-left justify-start"
                >
                  {t("help:help.q4.option1")}
                </Button>
                <Button
                  variant={
                    answers.biggestWorry === "legal" ? "default" : "outline"
                  }
                  onClick={() => {
                    setAnswers((prev) => ({ ...prev, biggestWorry: "legal" }));
                    trackFormInteraction(
                      "onboarding_q4",
                      "field_changed",
                      "biggestWorry",
                    );
                  }}
                  size="lg"
                  className="w-full text-left justify-start"
                >
                  {t("help:help.q4.option2")}
                </Button>
                <Button
                  variant={
                    answers.biggestWorry === "memories" ? "default" : "outline"
                  }
                  onClick={() => {
                    setAnswers((prev) => ({
                      ...prev,
                      biggestWorry: "memories",
                    }));
                    trackFormInteraction(
                      "onboarding_q4",
                      "field_changed",
                      "biggestWorry",
                    );
                  }}
                  size="lg"
                  className="w-full text-left justify-start"
                >
                  {t("help:help.q4.option3")}
                </Button>
                <Button
                  variant={
                    answers.biggestWorry === "conflicts" ? "default" : "outline"
                  }
                  onClick={() => {
                    setAnswers((prev) => ({
                      ...prev,
                      biggestWorry: "conflicts",
                    }));
                    trackFormInteraction(
                      "onboarding_q4",
                      "field_changed",
                      "biggestWorry",
                    );
                  }}
                  size="lg"
                  className="w-full text-left justify-start"
                >
                  {t("help:help.q4.option4")}
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={cn(
            "max-h-[90vh] overflow-y-auto",
            showLifeQuestions ? "sm:max-w-[900px]" : "sm:max-w-[700px]",
          )}
        >
          {!showLifeQuestions && (
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-center text-3xl font-bold">
                    {t("welcome.title")}
                  </DialogTitle>
                  <p className="text-center text-muted-foreground mt-2 text-lg">
                    {t("welcome.subtitle")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="ml-4"
                >
                  <SkipForward className="mr-2 h-4 w-4" />
                  {t("welcome.skipForNow")}
                </Button>
              </div>
            </DialogHeader>
          )}

          <div className="space-y-8 py-4">
            {/* Progress bar - only show for technical questions */}
            {!showLifeQuestions && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {t("progress.step", {
                      current: currentStep,
                      total: totalSteps,
                    })}
                  </span>
                  <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
                </div>
                <Progress
                  value={(currentStep / totalSteps) * 100}
                  className="w-full h-2"
                />
              </div>
            )}

            {/* Step content */}
            <div
              className={cn(
                "flex items-start justify-center",
                !showLifeQuestions && "min-h-[400px]",
              )}
            >
              {renderStep()}
            </div>

            {/* Navigation buttons - only show for technical questions */}
            {!isLoading && !showLifeQuestions && (
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  size="lg"
                >
                  {tCommon("common.back")}
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    size="lg"
                  >
                    {tCommon("common.next")}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("analysis.title")}
                      </>
                    ) : (
                      <>
                        {t("completion.viewPlan")}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Skip Confirmation Dialog */}
      <AlertDialog open={showSkipConfirm} onOpenChange={setShowSkipConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("skip.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("skip.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSkipConfirm(false)}>
              {t("skip.continueSetup")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSkipConfirm}>
              {t("skip.skipConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
