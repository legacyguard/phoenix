import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  ChevronLeft,
  Shield,
  Heart,
  FileText,
  Users,
  Home,
  Clock,
  HelpCircle,
  CheckCircle,
  Info,
} from "lucide-react";

export interface EssentialAnswers {
  // Family Structure
  familyStructure:
    | "single"
    | "couple"
    | "young_children"
    | "adult_children"
    | "multi_generation"
    | "blended";

  // Current Preparation
  documentStatus:
    | "organized"
    | "scattered"
    | "partially_organized"
    | "not_started";

  // Primary Concern
  primaryConcern:
    | "family_clarity"
    | "document_security"
    | "legal_validity"
    | "emergency_access"
    | "privacy_control";

  // Support Network
  supportNetwork:
    | "strong_network"
    | "few_trusted"
    | "family_only"
    | "building_network";

  // Timeline Preference
  timelinePreference:
    | "ready_now"
    | "next_month"
    | "this_year"
    | "just_exploring";

  // Comfort Level
  comfortLevel:
    | "very_comfortable"
    | "somewhat_comfortable"
    | "need_guidance"
    | "prefer_professional";
}

interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  supportText?: string;
}

interface Question {
  id: keyof EssentialAnswers;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  helpText?: string;
  options: QuestionOption[];
  multiSelect?: boolean;
}

interface EssentialQuestionsProps {
  onComplete: (answers: EssentialAnswers) => void;
  onSkip?: () => void;
  initialAnswers?: Partial<EssentialAnswers>;
  showProgress?: boolean;
}

const EssentialQuestions: React.FC<EssentialQuestionsProps> = ({
  onComplete,
  onSkip,
  initialAnswers = {},
  showProgress = true,
}) => {
  const { t } = useTranslation("onboarding");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] =
    useState<Partial<EssentialAnswers>>(initialAnswers);
  const [showHelp, setShowHelp] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Define questions with respectful, supportive tone
  const questions: Question[] = [
    {
      id: "familyStructure",
      icon: <Heart className="w-6 h-6 text-blue-600" />,
      title: t("onboarding:respectful.questions.familyStructure.title"),
      subtitle: t("onboarding:respectful.questions.familyStructure.subtitle"),
      helpText: t("onboarding:respectful.questions.familyStructure.helpText"),
      options: [
        {
          value: "single",
          label: t(
            "onboarding:respectful.questions.familyStructure.options.single",
          ),
          description: t(
            "onboarding:respectful.questions.familyStructure.descriptions.single",
          ),
          icon: <Users className="w-5 h-5" />,
        },
        {
          value: "couple",
          label: t(
            "onboarding:respectful.questions.familyStructure.options.couple",
          ),
          description: t(
            "onboarding:respectful.questions.familyStructure.descriptions.couple",
          ),
          icon: <Heart className="w-5 h-5" />,
        },
        {
          value: "young_children",
          label: t(
            "onboarding:respectful.questions.familyStructure.options.youngChildren",
          ),
          description: t(
            "onboarding:respectful.questions.familyStructure.descriptions.youngChildren",
          ),
          icon: <Home className="w-5 h-5" />,
        },
        {
          value: "adult_children",
          label: t(
            "onboarding:respectful.questions.familyStructure.options.adultChildren",
          ),
          description: t(
            "onboarding:respectful.questions.familyStructure.descriptions.adultChildren",
          ),
          icon: <Users className="w-5 h-5" />,
        },
        {
          value: "multi_generation",
          label: t(
            "onboarding:respectful.questions.familyStructure.options.multiGeneration",
          ),
          description: t(
            "onboarding:respectful.questions.familyStructure.descriptions.multiGeneration",
          ),
          icon: <Home className="w-5 h-5" />,
        },
        {
          value: "blended",
          label: t(
            "onboarding:respectful.questions.familyStructure.options.blended",
          ),
          description: t(
            "onboarding:respectful.questions.familyStructure.descriptions.blended",
          ),
          icon: <Heart className="w-5 h-5" />,
        },
      ],
    },
    {
      id: "documentStatus",
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: t("onboarding:respectful.questions.documentStatus.title"),
      subtitle: t("onboarding:respectful.questions.documentStatus.subtitle"),
      helpText: t("onboarding:respectful.questions.documentStatus.helpText"),
      options: [
        {
          value: "organized",
          label: t(
            "onboarding:respectful.questions.documentStatus.options.organized",
          ),
          description: t(
            "onboarding:respectful.questions.documentStatus.descriptions.organized",
          ),
          supportText: t(
            "onboarding:respectful.questions.documentStatus.support.organized",
          ),
        },
        {
          value: "partially_organized",
          label: t(
            "onboarding:respectful.questions.documentStatus.options.partiallyOrganized",
          ),
          description: t(
            "onboarding:respectful.questions.documentStatus.descriptions.partiallyOrganized",
          ),
          supportText: t(
            "onboarding:respectful.questions.documentStatus.support.partiallyOrganized",
          ),
        },
        {
          value: "scattered",
          label: t(
            "onboarding:respectful.questions.documentStatus.options.scattered",
          ),
          description: t(
            "onboarding:respectful.questions.documentStatus.descriptions.scattered",
          ),
          supportText: t(
            "onboarding:respectful.questions.documentStatus.support.scattered",
          ),
        },
        {
          value: "not_started",
          label: t(
            "onboarding:respectful.questions.documentStatus.options.notStarted",
          ),
          description: t(
            "onboarding:respectful.questions.documentStatus.descriptions.notStarted",
          ),
          supportText: t(
            "onboarding:respectful.questions.documentStatus.support.notStarted",
          ),
        },
      ],
    },
    {
      id: "primaryConcern",
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: t("onboarding:respectful.questions.primaryConcern.title"),
      subtitle: t("onboarding:respectful.questions.primaryConcern.subtitle"),
      helpText: t("onboarding:respectful.questions.primaryConcern.helpText"),
      options: [
        {
          value: "family_clarity",
          label: t(
            "onboarding:respectful.questions.primaryConcern.options.familyClarity",
          ),
          description: t(
            "onboarding:respectful.questions.primaryConcern.descriptions.familyClarity",
          ),
        },
        {
          value: "document_security",
          label: t(
            "onboarding:respectful.questions.primaryConcern.options.documentSecurity",
          ),
          description: t(
            "onboarding:respectful.questions.primaryConcern.descriptions.documentSecurity",
          ),
        },
        {
          value: "legal_validity",
          label: t(
            "onboarding:respectful.questions.primaryConcern.options.legalValidity",
          ),
          description: t(
            "onboarding:respectful.questions.primaryConcern.descriptions.legalValidity",
          ),
        },
        {
          value: "emergency_access",
          label: t(
            "onboarding:respectful.questions.primaryConcern.options.emergencyAccess",
          ),
          description: t(
            "onboarding:respectful.questions.primaryConcern.descriptions.emergencyAccess",
          ),
        },
        {
          value: "privacy_control",
          label: t(
            "onboarding:respectful.questions.primaryConcern.options.privacyControl",
          ),
          description: t(
            "onboarding:respectful.questions.primaryConcern.descriptions.privacyControl",
          ),
        },
      ],
    },
    {
      id: "supportNetwork",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: t("onboarding:respectful.questions.supportNetwork.title"),
      subtitle: t("onboarding:respectful.questions.supportNetwork.subtitle"),
      helpText: t("onboarding:respectful.questions.supportNetwork.helpText"),
      options: [
        {
          value: "strong_network",
          label: t(
            "onboarding:respectful.questions.supportNetwork.options.strongNetwork",
          ),
          description: t(
            "onboarding:respectful.questions.supportNetwork.descriptions.strongNetwork",
          ),
        },
        {
          value: "few_trusted",
          label: t(
            "onboarding:respectful.questions.supportNetwork.options.fewTrusted",
          ),
          description: t(
            "onboarding:respectful.questions.supportNetwork.descriptions.fewTrusted",
          ),
        },
        {
          value: "family_only",
          label: t(
            "onboarding:respectful.questions.supportNetwork.options.familyOnly",
          ),
          description: t(
            "onboarding:respectful.questions.supportNetwork.descriptions.familyOnly",
          ),
        },
        {
          value: "building_network",
          label: t(
            "onboarding:respectful.questions.supportNetwork.options.buildingNetwork",
          ),
          description: t(
            "onboarding:respectful.questions.supportNetwork.descriptions.buildingNetwork",
          ),
        },
      ],
    },
    {
      id: "timelinePreference",
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: t("onboarding:respectful.questions.timelinePreference.title"),
      subtitle: t(
        "onboarding:respectful.questions.timelinePreference.subtitle",
      ),
      helpText: t(
        "onboarding:respectful.questions.timelinePreference.helpText",
      ),
      options: [
        {
          value: "ready_now",
          label: t(
            "onboarding:respectful.questions.timelinePreference.options.readyNow",
          ),
          description: t(
            "onboarding:respectful.questions.timelinePreference.descriptions.readyNow",
          ),
        },
        {
          value: "next_month",
          label: t(
            "onboarding:respectful.questions.timelinePreference.options.nextMonth",
          ),
          description: t(
            "onboarding:respectful.questions.timelinePreference.descriptions.nextMonth",
          ),
        },
        {
          value: "this_year",
          label: t(
            "onboarding:respectful.questions.timelinePreference.options.thisYear",
          ),
          description: t(
            "onboarding:respectful.questions.timelinePreference.descriptions.thisYear",
          ),
        },
        {
          value: "just_exploring",
          label: t(
            "onboarding:respectful.questions.timelinePreference.options.justExploring",
          ),
          description: t(
            "onboarding:respectful.questions.timelinePreference.descriptions.justExploring",
          ),
        },
      ],
    },
    {
      id: "comfortLevel",
      icon: <HelpCircle className="w-6 h-6 text-blue-600" />,
      title: t("onboarding:respectful.questions.comfortLevel.title"),
      subtitle: t("onboarding:respectful.questions.comfortLevel.subtitle"),
      helpText: t("onboarding:respectful.questions.comfortLevel.helpText"),
      options: [
        {
          value: "very_comfortable",
          label: t(
            "onboarding:respectful.questions.comfortLevel.options.veryComfortable",
          ),
          description: t(
            "onboarding:respectful.questions.comfortLevel.descriptions.veryComfortable",
          ),
        },
        {
          value: "somewhat_comfortable",
          label: t(
            "onboarding:respectful.questions.comfortLevel.options.somewhatComfortable",
          ),
          description: t(
            "onboarding:respectful.questions.comfortLevel.descriptions.somewhatComfortable",
          ),
        },
        {
          value: "need_guidance",
          label: t(
            "onboarding:respectful.questions.comfortLevel.options.needGuidance",
          ),
          description: t(
            "onboarding:respectful.questions.comfortLevel.descriptions.needGuidance",
          ),
        },
        {
          value: "prefer_professional",
          label: t(
            "onboarding:respectful.questions.comfortLevel.options.preferProfessional",
          ),
          description: t(
            "onboarding:respectful.questions.comfortLevel.descriptions.preferProfessional",
          ),
        },
      ],
    },
  ];

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: value,
    }));

    // Auto-advance after a short delay for better UX
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        handleNext();
      }
    }, 300);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
        setIsTransitioning(false);
      }, 200);
    } else if (isComplete()) {
      onComplete(answers as EssentialAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion((prev) => prev - 1);
        setIsTransitioning(false);
      }, 200);
    }
  };

  const isComplete = () => {
    return questions.every((q) => answers[q.id] !== undefined);
  };

  const canProceed = () => {
    return answers[currentQ.id] !== undefined;
  };

  // Save progress to localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(
        "essentialQuestionsProgress",
        JSON.stringify({
          answers,
          currentQuestion,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }, [answers, currentQuestion]);

  // Restore progress on mount
  useEffect(() => {
    const saved = localStorage.getItem("essentialQuestionsProgress");
    if (saved && Object.keys(initialAnswers).length === 0) {
      try {
        const { answers: savedAnswers, currentQuestion: savedQuestion } =
          JSON.parse(saved);
        setAnswers(savedAnswers);
        setCurrentQuestion(savedQuestion);
      } catch (error) {
        console.error("Failed to restore progress:", error);
      }
    }
  }, [initialAnswers]);

  return (
    <div className="essential-questions max-w-4xl mx-auto p-6">
      {/* Header with Progress */}
      <div className="mb-8">
        {showProgress && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                {t("respectful.questions.progress", {
                  current: currentQuestion + 1,
                  total: questions.length,
                })}
              </span>
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  {t("respectful.questions.skipForNow")}
                </button>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Question Header */}
        <div
          className={`transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
        >
          <div className="flex items-center gap-4 mb-4">
            {currentQ.icon}
            <div className="flex-grow">
              <h2 className="text-2xl font-semibold text-gray-900">
                {currentQ.title}
              </h2>
              <p className="text-gray-600 mt-1">{currentQ.subtitle}</p>
            </div>
            {currentQ.helpText && (
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Show help"
              >
                <Info className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Help Text */}
          {showHelp && currentQ.helpText && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">{currentQ.helpText}</p>
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <div
        className={`space-y-3 transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
      >
        {currentQ.options.map((option) => {
          const isSelected = answers[currentQ.id] === option.value;

          return (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"
                }
              `}
            >
              <div className="flex items-start gap-4">
                {option.icon && (
                  <div
                    className={`mt-1 ${isSelected ? "text-blue-600" : "text-gray-400"}`}
                  >
                    {option.icon}
                  </div>
                )}
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}
                    >
                      {option.label}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  {option.description && (
                    <p
                      className={`text-sm mt-1 ${isSelected ? "text-blue-700" : "text-gray-600"}`}
                    >
                      {option.description}
                    </p>
                  )}
                  {option.supportText && isSelected && (
                    <p className="text-sm mt-2 text-blue-600 font-medium">
                      {option.supportText}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${
              currentQuestion === 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }
          `}
        >
          <ChevronLeft className="w-5 h-5" />
          {t("respectful.questions.previous")}
        </button>

        <div className="flex items-center gap-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${
                  index === currentQuestion
                    ? "w-8 bg-blue-600"
                    : index < currentQuestion
                      ? "bg-blue-400"
                      : "bg-gray-300"
                }
              `}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`
            flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all
            ${
              canProceed()
                ? currentQuestion === questions.length - 1
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {currentQuestion === questions.length - 1
            ? t("onboarding:respectful.questions.complete")
            : t("onboarding:respectful.questions.next")}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Reassurance Text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          {t("respectful.questions.reassurance")}
        </p>
      </div>
    </div>
  );
};

export default EssentialQuestions;
