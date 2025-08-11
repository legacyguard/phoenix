import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProgressService } from "@/services/ProgressService";
import type { LifeEventService } from "@/services/LifeEventService";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { FirstTimeUserGuide } from "@/components/dashboard/FirstTimeUserGuide";
import { EnhancedProgressTracking } from "@/components/dashboard/EnhancedProgressTracking";
import { NextStepRecommendations } from "@/components/dashboard/NextStepRecommendations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  ClipboardCheck,
  Target,
  Shield,
  CheckCircle2,
  Lock,
  Clock,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Info,
  Book,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { cn } from "@/lib/utils";
import AnnualReview from "@/components/AnnualReview";
import LegalConsultationModal from "@/components/LegalConsultationModal";
import { EnhancedPersonalAssistant } from "@/components/assistant/EnhancedPersonalAssistant";
import { PersonalizedDashboardContent } from "@/components/dashboard/PersonalizedDashboardContent";
import { useAssistant } from "@/hooks/useAssistant";
import { FamilyPreparednessCalculator } from "@/components/landing/FamilyPreparednessCalculator";

// Import Professional Dashboard Integration
import ProfessionalDashboardIntegration from "./ProfessionalDashboardIntegration";

const Dashboard = () => {
  const { t } = useTranslation("dashboard-main");
  const { user } = useAuth();
  const { updateProgress, updateEmotionalState } = useAssistant();

  // Feature flag to enable professional dashboard
  // Can be controlled via environment variable, user preference, or A/B testing
  const useProfessionalDashboard =
    localStorage.getItem("useProfessionalDashboard") === "true" ||
    import.meta.env.VITE_USE_PROFESSIONAL_DASHBOARD === "true" ||
    new URLSearchParams(window.location.search).get("professional") === "true";

  // Otherwise, continue with legacy dashboard
  const [progressStatus, setProgressStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnnualReview, setShowAnnualReview] = useState(false);
  const [showLegalConsultation, setShowLegalConsultation] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFirstTimeGuide, setShowFirstTimeGuide] = useState(false);
  const [onboardingTasks, setOnboardingTasks] = useState([]);
  const [onboardingAnswers, setOnboardingAnswers] = useState(null);

  const handleAnnualReview = () => {
    setShowAnnualReview(true);
  };

  useEffect(() => {
    if (useProfessionalDashboard) {
      // Skip legacy dashboard initialization when using professional dashboard
      return;
    }
    const initializeDashboard = async () => {
      try {
        // Wait for user data to be loaded
        if (!user) {
          return;
        }

        // Create a unique key for this user's onboarding status
        const userOnboardingKey = `legacyguard-onboarding-completed-${user.id}`;
        const userGuideKey = `legacyguard-dashboard-guide-completed-${user.id}`;

        // Check if user has completed onboarding
        const onboardingDataStr = localStorage.getItem(userOnboardingKey);
        let hasCompletedOnboarding = false;

        if (onboardingDataStr) {
          try {
            const onboardingData = JSON.parse(onboardingDataStr);
            if (onboardingData.tasks) {
              setOnboardingTasks(onboardingData.tasks);
              setOnboardingAnswers(onboardingData.answers);
              hasCompletedOnboarding = true;
            }
          } catch (e) {
            // Handle legacy format
            hasCompletedOnboarding = onboardingDataStr === "true";
          }
        }
        const hasSeenGuide = localStorage.getItem(userGuideKey);

        // Check if user was created recently (within last 5 minutes)
        const userCreatedAt = user.createdAt
          ? new Date(user.createdAt).getTime()
          : 0;
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const isRecentlyCreated = userCreatedAt > fiveMinutesAgo;

        // Check for force onboarding parameter (for testing)
        const urlParams = new URLSearchParams(window.location.search);
        const forceOnboarding = urlParams.get("onboarding") === "true";

        // Determine if this is a new user
        const isNewUser =
          forceOnboarding ||
          (!hasCompletedOnboarding &&
            (isRecentlyCreated || !user.publicMetadata?.onboardingCompleted));

        if (isNewUser) {
          // New user: show onboarding wizard
          setShowOnboarding(true);
          setLoading(false);
          return; // Don't fetch progress status yet
        } else if (!hasSeenGuide && hasCompletedOnboarding) {
          // User completed onboarding but hasn't seen the guide
          setShowFirstTimeGuide(true);
        }

        // Fetch progress status only for users who have completed onboarding
        const status = await ProgressService.getProgressStatus(user.id);
        setProgressStatus(status);

        // Update assistant context with progress
        if (status) {
          updateProgress({
            completionPercentage: status.completionScore,
            currentStage: status.currentStage,
            tasksCompleted: status.completedItems?.length || 0,
            totalTasks:
              (status.completedItems?.length || 0) +
              (status.pendingItems?.length || 0),
          });

          // Set emotional state based on progress
          if (status.completionScore < 25) {
            updateEmotionalState("overwhelmed");
          } else if (status.completionScore < 50) {
            updateEmotionalState("anxious");
          } else if (status.completionScore < 75) {
            updateEmotionalState("hopeful");
          } else {
            updateEmotionalState("confident");
          }
        }
      } catch (err) {
        setError(t("errors.failedToFetchStatus"));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initializeDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getStageIcon = (stage) => {
    switch (stage) {
      case "Foundation":
        return <Shield className="h-5 w-5" />;
      case "Buildout":
        return <Target className="h-5 w-5" />;
      case "Reinforcement":
        return <Lock className="h-5 w-5" />;
      case "Advanced Planning":
        return <ClipboardCheck className="h-5 w-5" />;
      case "Legacy":
        return <CheckCircle2 className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getOperationIcon = (iconName) => {
    switch (iconName) {
      case "Mail":
        return <Mail className="h-8 w-8" />;
      case "ClipboardCheck":
        return <ClipboardCheck className="h-8 w-8" />;
      default:
        return <Target className="h-8 w-8" />;
    }
  };

  const stages = [
    {
      name: t("dashboard-main:dashboard.stages.foundation"),
      range: "0-25%",
      stage: "Foundation",
    },
    {
      name: t("dashboard-main:dashboard.stages.building"),
      range: "25-60%",
      stage: "Buildout",
    },
    {
      name: t("dashboard-main:dashboard.stages.strengthening"),
      range: "60-75%",
      stage: "Reinforcement",
    },
    {
      name: t("dashboard.stages.advancedPlanning"),
      range: "75-90%",
      stage: "Advanced Planning",
    },
    {
      name: t("dashboard-main:dashboard.stages.legacy"),
      range: "90-100%",
      stage: "Legacy",
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleOnboardingComplete = (tasks, answers) => {
    // Store the generated tasks and answers
    setOnboardingTasks(tasks);
    setOnboardingAnswers(answers);
    const userOnboardingKey = `legacyguard-onboarding-completed-${user?.id}`;
    const userOnboardingData = {
      tasks,
      answers,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem(userOnboardingKey, JSON.stringify(userOnboardingData));
    setShowOnboarding(false);
    // Show the first time guide after onboarding
    setShowFirstTimeGuide(true);

    // Update assistant context with initial progress
    updateProgress({
      completionPercentage: 0,
      currentStage: "Foundation",
      tasksCompleted: 0,
      totalTasks: tasks.length,
    });
  };

  const handleFirstTimeGuideComplete = async () => {
    const userGuideKey = `legacyguard-dashboard-guide-completed-${user?.id}`;
    localStorage.setItem(userGuideKey, "true");
    setShowFirstTimeGuide(false);

    // Apply the onboarding tasks to the user's progress
    // TODO: Update backend with onboarding tasks

    // Fetch the initial progress status after onboarding is complete
    try {
      const status = await ProgressService.getProgressStatus(
        user?.id || "user-id",
      );
      setProgressStatus(status);
    } catch (err) {
      setError(t("errors.failedToFetchStatus"));
    }
  };

  return (
    <>
      {useProfessionalDashboard ? (
        <ProfessionalDashboardIntegration />
      ) : (
        <>
          {/* Onboarding Wizard - 5 minute questions */}
          {showOnboarding && (
            <OnboardingWizard
              isOpen={showOnboarding}
              onComplete={handleOnboardingComplete}
              onClose={() => setShowOnboarding(false)}
            />
          )}

          {/* First Time User Guide - shown after onboarding */}
          {showFirstTimeGuide && (
            <FirstTimeUserGuide onComplete={handleFirstTimeGuideComplete} />
          )}

          <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
            {/* Development only: Reset onboarding button */}
            {import.meta.env.DEV && user && (
              <div className="fixed bottom-4 right-4 z-50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const userOnboardingKey = `legacyguard-onboarding-completed-${user.id}`;
                    const userGuideKey = `legacyguard-dashboard-guide-completed-${user.id}`;
                    localStorage.removeItem(userOnboardingKey);
                    localStorage.removeItem(userGuideKey);
                    window.location.reload();
                  }}
                  className="bg-yellow-500 text-black hover:bg-yellow-600"
                >
                  {t("development.resetOnboarding")}
                </Button>
              </div>
            )}

            {showAnnualReview ? (
              <AnnualReview />
            ) : (
              <>
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight">
                    {t("title")}
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    {t("subtitle")}
                  </p>
                </div>

                {/* Show personalized content for new users with onboarding data */}
                {onboardingTasks.length > 0 &&
                  onboardingAnswers &&
                  !progressStatus && (
                    <PersonalizedDashboardContent
                      tasks={onboardingTasks}
                      onboardingAnswers={onboardingAnswers}
                      completionScore={0}
                    />
                  )}

                {progressStatus && (
                  <>
                    {/* Enhanced Progress Tracking */}
                    <EnhancedProgressTracking
                      progressStatus={{
                        completionScore: progressStatus.completionScore,
                        currentStage: progressStatus.currentStage,
                        completedItems: progressStatus.completedItems || [],
                        pendingItems: progressStatus.pendingItems || [],
                        criticalGaps: progressStatus.criticalGaps || [],
                      }}
                    />

                    {/* Next Objective - Regular Task, Deep Dive, or Preservation Mode */}
                    {progressStatus.nextObjective.type === "task" ? (
                      <Card className="border-primary/20">
                        <CardHeader>
                          <CardTitle className="text-2xl flex items-center gap-2">
                            <Target className="h-6 w-6" />
                            {t("nextStep.title")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold">
                              {progressStatus.nextObjective.title}
                            </h3>
                            <p className="text-muted-foreground">
                              {progressStatus.nextObjective.description}
                            </p>
                            {progressStatus.nextObjective.estimatedTime && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {t("nextStep.estimatedTime", {
                                    time: progressStatus.nextObjective
                                      .estimatedTime,
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                          <Button
                            asChild
                            size="lg"
                            className="w-full md:w-auto"
                          >
                            <Link to={progressStatus.nextObjective.actionUrl}>
                              {progressStatus.nextObjective.actionLabel}
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ) : progressStatus.nextObjective.type === "deepDive" ? (
                      /* Advanced Planning Deep Dive */
                      <Card className="border-2 border-primary bg-primary/5">
                        <CardHeader className="text-center space-y-4 pb-8">
                          <Badge
                            variant="default"
                            className="mx-auto text-sm px-4 py-1"
                          >
                            {t("deepDive.milestoneAchieved")}
                          </Badge>
                          <CardTitle className="text-3xl font-bold">
                            {progressStatus.nextObjective.title}
                          </CardTitle>
                          <CardDescription className="text-base max-w-3xl mx-auto">
                            {progressStatus.nextObjective.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {progressStatus.nextObjective.features.map(
                              (operation) => (
                                <Card
                                  key={operation.id}
                                  className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                                >
                                  <Link
                                    to={operation.actionUrl}
                                    className="block h-full"
                                  >
                                    <CardHeader className="space-y-4">
                                      <div className="mx-auto p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                        {getOperationIcon(operation.icon)}
                                      </div>
                                      <CardTitle className="text-xl text-center">
                                        {operation.title}
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <p className="text-muted-foreground text-center">
                                        {operation.description}
                                      </p>
                                    </CardContent>
                                  </Link>
                                </Card>
                              ),
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      /* Preservation Mode */
                      <Card className="border-2 border-success bg-success/5">
                        <CardHeader className="text-center space-y-4 pb-8">
                          <ShieldCheck className="text-success h-16 w-16 mx-auto" />
                          <CardTitle className="text-3xl font-bold">
                            {progressStatus.nextObjective.title}
                          </CardTitle>
                          <CardDescription className="text-base max-w-3xl mx-auto">
                            {progressStatus.nextObjective.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-8">
                          <div className="text-center mt-4">
                            <Calendar className="inline-block h-5 w-5" />{" "}
                            <span>
                              {t("preservationMode.lastReviewDate", {
                                date: progressStatus.nextObjective
                                  .lastReviewDate,
                              })}
                            </span>
                          </div>
                          <Button
                            asChild
                            size="lg"
                            className="w-full md:w-auto mt-8"
                          >
                            <Link to="/annual-review">
                              {t("preservationMode.startAnnualCheck")}
                            </Link>
                          </Button>

                          <div className="text-left mt-8">
                            <Badge
                              variant="secondary"
                              className="text-sm px-4 py-1"
                            >
                              {t("preservationMode.latestUpdates")}
                            </Badge>
                            <ul className="space-y-2 mt-4">
                              {progressStatus.nextObjective.notifications.map(
                                (notification) => (
                                  <li
                                    key={notification.id}
                                    className="flex items-start gap-2"
                                  >
                                    {notification.type === "warning" ? (
                                      <AlertTriangle className="text-warning" />
                                    ) : (
                                      <Info className="text-info" />
                                    )}
                                    <div>
                                      <Link
                                        to={notification.actionUrl}
                                        className="text-link"
                                      >
                                        {notification.text}
                                      </Link>
                                    </div>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Next Step Recommendations */}
                    <NextStepRecommendations
                      completionScore={progressStatus.completionScore}
                      currentStage={progressStatus.currentStage}
                      completedItems={progressStatus.completedItems || []}
                    />

                    {/* Family Preparedness Calculator - Secure, authenticated access only */}
                    <Card className="mb-8">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          {t("calculator.title")}
                        </CardTitle>
                        <CardDescription>
                          {t("calculator.subtitle")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FamilyPreparednessCalculator />
                      </CardContent>
                    </Card>

                    {/* Special Offer for Complex Profiles */}
                    {progressStatus.completionScore > 80 &&
                      user?.has_business && (
                        <Card className="mb-8 border-earth-primary/20 bg-earth-primary/5">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-earth-primary/10 rounded-lg">
                                  <Book className="h-6 w-6 text-earth-primary" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                                    {t("complexProfile.detected")}
                                    <Badge variant="secondary">
                                      {t("complexProfile.personalizedGuidance")}
                                    </Badge>
                                  </h3>
                                  <p className="text-muted-foreground">
                                    {t("complexProfile.businessSuccessionNote")}
                                  </p>
                                </div>
                              </div>
                              <Button
                                onClick={() => setShowLegalConsultation(true)}
                                className="bg-earth-primary hover:bg-earth-primary/90"
                              >
                                <Book className="mr-2 h-4 w-4" />
                                {t("complexProfile.discussWithExpert")}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Legal Consultation Modal */}
          {showLegalConsultation && (
            <LegalConsultationModal
              isOpen={showLegalConsultation}
              onClose={() => setShowLegalConsultation(false)}
              preselectedType="business_review"
              contextData={{
                completionScore: progressStatus?.completionScore,
                hasBusiness: user?.has_business,
              }}
            />
          )}

          {/* Enhanced Personal Assistant */}
          {!showOnboarding && !loading && (
            <EnhancedPersonalAssistant
              currentPage="dashboard"
              contextData={{
                completionScore: progressStatus?.completionScore || 0,
                currentStage: progressStatus?.currentStage || "Foundation",
                nextObjective: progressStatus?.nextObjective,
                criticalGaps: progressStatus?.criticalGaps || [],
                tasks: onboardingTasks,
                onboardingAnswers: onboardingAnswers,
              }}
            />
          )}
        </>
      )}
    </>
  );
};

export default Dashboard;
