import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Users,
  FileCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  Briefcase,
  Heart,
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface LifeQuestion {
  id: string;
  question: string;
  subtitle: string;
  explanation: string;
  options: {
    value: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    followUpQuestions?: string[];
  }[];
  theme: "responsibility" | "preparedness" | "protection" | "control";
}

export interface LifeAnswers {
  familyDependency: string;
  preparednessLevel: string;
  familyVulnerability: string;
  primaryResponsibility: string;
  emotionalConcern?: string;
  timelineUrgency?: string;
  familyStructure?: string;
  financialComplexity?: string;
}

interface BasicLifeQuestionsProps {
  onComplete: (answers: LifeAnswers) => void;
  onBack: () => void;
  initialAnswers?: Partial<LifeAnswers>;
}

const questions: LifeQuestion[] = [
  {
    id: "familyDependency",
    question: "Who depends on you to keep things running?",
    subtitle: "Understanding your role as the family anchor",
    explanation:
      "Most men in your position are the go-to person for important decisions. We want to make sure your family stays protected even when you can't be there to guide them.",
    theme: "responsibility",
    options: [
      {
        value: "spouse_children",
        label: "My spouse and children rely on me for everything",
        icon: <Users className="h-5 w-5" />,
        description:
          "I handle the major decisions and keep our household running",
      },
      {
        value: "family_turns_to_me",
        label: "I'm the one my family turns to when things go wrong",
        icon: <Shield className="h-5 w-5" />,
        description:
          "From emergencies to big decisions, they count on my judgment",
      },
      {
        value: "handle_decisions",
        label: "I handle most of the important family decisions",
        icon: <FileCheck className="h-5 w-5" />,
        description:
          "Financial planning, major purchases, future planning - it's on me",
      },
      {
        value: "family_would_struggle",
        label: "My family would struggle without my guidance",
        icon: <AlertCircle className="h-5 w-5" />,
        description:
          "They depend on my experience and knowledge to navigate life",
      },
    ],
  },
  {
    id: "preparednessLevel",
    question: "How prepared are you if something unexpected happens?",
    subtitle: "Assessing your current level of preparedness",
    explanation:
      "Being prepared isn't just about having things—it's about having them organized so your family can find what they need when they need it.",
    theme: "preparedness",
    options: [
      {
        value: "fully_organized",
        label: "I've got everything organized and under control",
        icon: <FileCheck className="h-5 w-5" />,
        description: "Documents filed, accounts listed, everything documented",
      },
      {
        value: "know_but_scattered",
        label: "I know what I have, but it's not all in one place",
        icon: <TrendingUp className="h-5 w-5" />,
        description:
          "Information exists but it's spread across different locations",
      },
      {
        value: "need_time",
        label: "I'd need time to gather everything together",
        icon: <AlertCircle className="h-5 w-5" />,
        description:
          "I could find what's needed, but it would take significant effort",
      },
      {
        value: "not_sure",
        label: "Honestly, I'm not sure where everything is",
        icon: <Users className="h-5 w-5" />,
        description:
          "Things have accumulated over the years without much organization",
      },
    ],
  },
  {
    id: "familyVulnerability",
    question: "What would be hardest for your family to handle without you?",
    subtitle: "Identifying your family's biggest vulnerability",
    explanation:
      "Every family has that one area where they'd struggle most. Knowing this helps us focus on what matters most to your family's security.",
    theme: "protection",
    options: [
      {
        value: "documents_passwords",
        label: "Finding important documents and passwords",
        icon: <FileCheck className="h-5 w-5" />,
        description:
          "They wouldn't know where to look or how to access critical accounts",
      },
      {
        value: "contacts_actions",
        label: "Knowing who to contact and what to do",
        icon: <Users className="h-5 w-5" />,
        description:
          "The network of professionals and steps to take in various situations",
      },
      {
        value: "financial_situation",
        label: "Understanding our financial situation",
        icon: <TrendingUp className="h-5 w-5" />,
        description:
          "Accounts, investments, debts, and ongoing financial obligations",
      },
      {
        value: "decisions_i_handle",
        label: "Making decisions I usually handle",
        icon: <Shield className="h-5 w-5" />,
        description:
          "From daily operations to major life choices I typically manage",
      },
    ],
  },
  {
    id: "primaryResponsibility",
    question: "What's your biggest responsibility right now?",
    subtitle: "Understanding what drives your planning",
    explanation:
      "Your responsibilities shape what kind of preparation you need. A business owner has different needs than someone caring for elderly parents.",
    theme: "control",
    options: [
      {
        value: "family_security",
        label: "Providing for my family's future security",
        icon: <Shield className="h-5 w-5" />,
        description:
          "Ensuring they're financially protected and prepared for the future",
      },
      {
        value: "financial_affairs",
        label: "Managing our family's financial affairs",
        icon: <TrendingUp className="h-5 w-5" />,
        description: "Investments, retirement planning, and building wealth",
      },
      {
        value: "aging_parents",
        label: "Taking care of aging parents",
        icon: <Heart className="h-5 w-5" />,
        description: "Managing their care, finances, and end-of-life planning",
      },
      {
        value: "business_family",
        label: "Running a business that supports my family",
        icon: <Briefcase className="h-5 w-5" />,
        description:
          "Ensuring business continuity and protecting family income",
      },
    ],
  },
  {
    id: "emotionalConcern",
    question: "What keeps you up at night about your family's future?",
    subtitle: "Understanding your deepest concerns",
    explanation:
      "Your worries are valid. By understanding what concerns you most, we can address these fears directly and give you peace of mind.",
    theme: "protection",
    options: [
      {
        value: "family_confusion",
        label: "My family being confused and not knowing what to do",
        icon: <AlertCircle className="h-5 w-5" />,
        description:
          "They might make costly mistakes or miss important deadlines",
      },
      {
        value: "financial_burden",
        label: "Leaving them with financial burdens or complications",
        icon: <TrendingUp className="h-5 w-5" />,
        description: "Unexpected costs, taxes, or debts they didn't know about",
      },
      {
        value: "family_conflict",
        label: "Family conflicts over assets or decisions",
        icon: <Users className="h-5 w-5" />,
        description: "Disagreements that could damage family relationships",
      },
      {
        value: "lost_opportunities",
        label: "Important things being forgotten or lost",
        icon: <Shield className="h-5 w-5" />,
        description:
          "Benefits, accounts, or opportunities they don't know exist",
      },
    ],
  },
  {
    id: "timelineUrgency",
    question: "When do you feel this needs to be done?",
    subtitle: "Setting a realistic timeline",
    explanation:
      "Life moves fast. Understanding your timeline helps us create a plan that fits your schedule and priorities.",
    theme: "control",
    options: [
      {
        value: "immediate",
        label: "I need to get this done right away",
        icon: <Clock className="h-5 w-5" />,
        description: "There's an urgent reason or upcoming event",
      },
      {
        value: "soon",
        label: "Within the next few months",
        icon: <Calendar className="h-5 w-5" />,
        description: "It's important but not immediately urgent",
      },
      {
        value: "eventually",
        label: "Sometime this year",
        icon: <CheckCircle className="h-5 w-5" />,
        description: "I want to check this off my list",
      },
      {
        value: "exploring",
        label: "Just exploring what I need to do",
        icon: <FileCheck className="h-5 w-5" />,
        description: "Learning about the process before committing",
      },
    ],
  },
  {
    id: "familyStructure",
    question: "Tell us about your family situation",
    subtitle: "Tailoring our guidance to your family",
    explanation:
      "Every family is unique. Understanding yours helps us provide the most relevant advice and tools.",
    theme: "responsibility",
    options: [
      {
        value: "young_children",
        label: "I have young children who depend on me",
        icon: <Heart className="h-5 w-5" />,
        description: "Minor children who need guardianship planning",
      },
      {
        value: "adult_children",
        label: "My children are grown but I still guide them",
        icon: <Users className="h-5 w-5" />,
        description: "Adult children who may need help managing inheritance",
      },
      {
        value: "blended_family",
        label: "We're a blended family with multiple considerations",
        icon: <Home className="h-5 w-5" />,
        description:
          "Step-children, multiple marriages, or complex relationships",
      },
      {
        value: "extended_care",
        label: "I care for extended family or have unique circumstances",
        icon: <Shield className="h-5 w-5" />,
        description:
          "Elderly parents, special needs family members, or other dependents",
      },
    ],
  },
  {
    id: "financialComplexity",
    question: "How would you describe your financial situation?",
    subtitle: "Ensuring appropriate planning depth",
    explanation:
      "This helps us recommend the right level of planning and identify areas that might need professional guidance.",
    theme: "control",
    options: [
      {
        value: "straightforward",
        label: "Pretty straightforward - job, home, some savings",
        icon: <Home className="h-5 w-5" />,
        description: "Standard assets without major complications",
      },
      {
        value: "multiple_assets",
        label: "Multiple properties or significant investments",
        icon: <TrendingUp className="h-5 w-5" />,
        description: "Real estate, stocks, retirement accounts",
      },
      {
        value: "business_owner",
        label: "I own a business or have partnership interests",
        icon: <Briefcase className="h-5 w-5" />,
        description: "Business succession planning needed",
      },
      {
        value: "complex_estate",
        label: "Complex with trusts, international assets, or tax concerns",
        icon: <Shield className="h-5 w-5" />,
        description: "Requires sophisticated estate planning",
      },
    ],
  },
];

const getThemeColors = (theme: LifeQuestion["theme"]) => {
  switch (theme) {
    case "responsibility":
      return "from-blue-900 to-blue-700";
    case "preparedness":
      return "from-green-900 to-green-700";
    case "protection":
      return "from-indigo-900 to-indigo-700";
    case "control":
      return "from-gray-900 to-gray-700";
    default:
      return "from-blue-900 to-blue-700";
  }
};

export const BasicLifeQuestions: React.FC<BasicLifeQuestionsProps> = ({
  onComplete,
  onBack,
  initialAnswers = {},
}) => {
  const { t } = useTranslation("help");
  const { t: tCommon } = useTranslation("ui-common");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<LifeAnswers>>(initialAnswers);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now(),
  );

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    // Reset selected option when question changes
    const currentAnswer = answers[currentQuestion.id as keyof LifeAnswers];
    setSelectedOption(currentAnswer || null);
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex, answers, currentQuestion.id]);

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (selectedOption) {
      const timeSpent = Date.now() - questionStartTime;
      console.log(`Time spent on ${currentQuestion.id}: ${timeSpent}ms`);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // Complete the questionnaire
        const totalTime = Date.now() - startTime;
        console.log(`Total time spent: ${totalTime}ms`);
        onComplete(answers as LifeAnswers);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-medium">
            {t("progress.step", {
              current: currentQuestionIndex + 1,
              total: questions.length,
            })}
          </span>
          <span className="text-xs">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <div className="transition-all duration-300 ease-in-out">
        <Card
          className={cn(
            "border-0 shadow-xl overflow-hidden transition-all duration-300",
            "bg-gradient-to-br",
            getThemeColors(currentQuestion.theme),
          )}
        >
          <CardHeader className="text-white pb-4">
            <CardDescription className="text-white/80 text-base">
              {currentQuestion.subtitle}
            </CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-background/95 backdrop-blur pt-6">
            <p className="text-muted-foreground mb-6">
              {currentQuestion.explanation}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition-all duration-200",
                    "hover:border-primary/50 hover:bg-muted/50",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    selectedOption === option.value
                      ? "border-primary bg-primary/10"
                      : "border-muted-foreground/20",
                  )}
                >
                  <div className="flex items-start gap-3">
                    {option.icon && (
                      <div
                        className={cn(
                          "mt-0.5 p-2 rounded-md transition-colors duration-200",
                          selectedOption === option.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {option.icon}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-base mb-1">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground">
                          {option.description}
                        </div>
                      )}
                    </div>
                    {selectedOption === option.value && (
                      <div className="mt-1">
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrevious}
          className="min-w-[120px]"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {currentQuestionIndex === 0
            ? tCommon("common.back")
            : tCommon("common.previous")}
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={handleNext}
          disabled={!selectedOption}
          className={cn("min-w-[120px]", selectedOption && "animate-pulse")}
        >
          {currentQuestionIndex === questions.length - 1
            ? t("completion.viewPlan")
            : tCommon("common.next")}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BasicLifeQuestions;
