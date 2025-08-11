import type { LifeAnswers } from "@/components/onboarding/BasicLifeQuestions";
import type { ProjectOrderAnswers } from "@/components/onboarding/OnboardingWizard";

export interface UserProfile {
  familyType:
    | "young_family"
    | "empty_nesters"
    | "single_parent"
    | "retirees"
    | "blended_family"
    | "single_professional";
  assetComplexity: "simple" | "moderate" | "complex";
  emotionalState: "anxious" | "procrastinating" | "motivated" | "overwhelmed";
  primaryConcerns: string[];
  timeAvailability: "limited" | "moderate" | "flexible";
  urgencyLevel: "low" | "medium" | "high";
  specificNeeds: string[];
}

export interface DashboardConfig {
  priorityTasks: PriorityTask[];
  relevantSections: DashboardSection[];
  assistantMessages: AssistantMessage[];
  quickWins: QuickWin[];
  personalizedInsights: PersonalizedInsight[];
}

export interface PriorityTask {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  impact: "high" | "medium" | "low";
  category: string;
  link: string;
  personalizedReason: string;
}

export interface DashboardSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  priority: number;
  prefilledData?: Record<string, unknown>;
}

export interface AssistantMessage {
  type: "welcome" | "guidance" | "encouragement" | "warning";
  content: string;
  contextual: boolean;
}

export interface QuickWin {
  id: string;
  title: string;
  timeEstimate: string;
  link: string;
  description: string;
}

export interface PersonalizedInsight {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  actionLink?: string;
}

export const analyzeOnboardingResponses = (
  lifeAnswers: LifeAnswers,
  projectAnswers?: ProjectOrderAnswers,
): UserProfile => {
  let familyType: UserProfile["familyType"] = "single_professional";
  let assetComplexity: UserProfile["assetComplexity"] = "simple";
  let emotionalState: UserProfile["emotionalState"] = "motivated";
  let urgencyLevel: UserProfile["urgencyLevel"] = "medium";
  let timeAvailability: UserProfile["timeAvailability"] = "moderate";

  const primaryConcerns: string[] = [];
  const specificNeeds: string[] = [];

  // Determine family type
  if (lifeAnswers.familyStructure) {
    switch (lifeAnswers.familyStructure) {
      case "young_children":
        familyType = "young_family";
        specificNeeds.push(
          "guardianship",
          "education_planning",
          "life_insurance",
        );
        break;
      case "adult_children":
        familyType = "empty_nesters";
        specificNeeds.push(
          "inheritance_planning",
          "healthcare_directives",
          "legacy_planning",
        );
        break;
      case "blended_family":
        familyType = "blended_family";
        specificNeeds.push(
          "clear_inheritance",
          "conflict_prevention",
          "explicit_documentation",
        );
        break;
      case "extended_care":
        familyType =
          lifeAnswers.primaryResponsibility === "aging_parents"
            ? "empty_nesters"
            : "young_family";
        specificNeeds.push(
          "care_instructions",
          "special_needs_planning",
          "medical_documentation",
        );
        break;
    }
  }

  // Determine asset complexity
  if (lifeAnswers.financialComplexity) {
    switch (lifeAnswers.financialComplexity) {
      case "straightforward":
        assetComplexity = "simple";
        break;
      case "multiple_assets":
        assetComplexity = "moderate";
        specificNeeds.push("asset_inventory", "property_documentation");
        break;
      case "business_owner":
        assetComplexity = "complex";
        specificNeeds.push(
          "business_succession",
          "key_employee_planning",
          "buy_sell_agreements",
        );
        break;
      case "complex_estate":
        assetComplexity = "complex";
        specificNeeds.push(
          "trust_planning",
          "tax_optimization",
          "professional_advisors",
        );
        break;
    }
  }

  // Determine emotional state
  if (lifeAnswers.emotionalConcern) {
    switch (lifeAnswers.emotionalConcern) {
      case "family_confusion":
        emotionalState = "anxious";
        primaryConcerns.push("family_confusion", "clear_instructions");
        break;
      case "financial_burden":
        emotionalState = "anxious";
        primaryConcerns.push("financial_surprises", "debt_documentation");
        break;
      case "family_conflict":
        emotionalState = "anxious";
        primaryConcerns.push("prevent_conflicts", "fair_distribution");
        break;
      case "lost_opportunities":
        emotionalState = "overwhelmed";
        primaryConcerns.push("complete_inventory", "nothing_forgotten");
        break;
    }
  }

  // Determine preparedness level impact on emotional state
  if (lifeAnswers.preparednessLevel === "not_sure") {
    emotionalState = "overwhelmed";
  } else if (lifeAnswers.preparednessLevel === "fully_organized") {
    emotionalState = "motivated";
  }

  // Determine urgency and time availability
  if (lifeAnswers.timelineUrgency) {
    switch (lifeAnswers.timelineUrgency) {
      case "immediate":
        urgencyLevel = "high";
        timeAvailability = "limited";
        break;
      case "soon":
        urgencyLevel = "medium";
        timeAvailability = "moderate";
        break;
      case "eventually":
        urgencyLevel = "low";
        timeAvailability = "flexible";
        break;
      case "exploring":
        urgencyLevel = "low";
        timeAvailability = "flexible";
        emotionalState = "procrastinating";
        break;
    }
  }

  // Add primary responsibility concerns
  if (lifeAnswers.primaryResponsibility) {
    switch (lifeAnswers.primaryResponsibility) {
      case "family_security":
        primaryConcerns.push("financial_protection", "family_future");
        break;
      case "financial_affairs":
        primaryConcerns.push("wealth_management", "investment_protection");
        break;
      case "aging_parents":
        primaryConcerns.push("parent_care", "healthcare_decisions");
        specificNeeds.push("healthcare_proxy", "care_coordination");
        break;
      case "business_family":
        primaryConcerns.push("business_continuity", "family_income");
        break;
    }
  }

  return {
    familyType,
    assetComplexity,
    emotionalState,
    primaryConcerns,
    timeAvailability,
    urgencyLevel,
    specificNeeds,
  };
};

export const generatePersonalizedDashboard = (
  profile: UserProfile,
): DashboardConfig => {
  const priorityTasks: PriorityTask[] = [];
  const assistantMessages: AssistantMessage[] = [];
  const quickWins: QuickWin[] = [];
  const personalizedInsights: PersonalizedInsight[] = [];

  // Generate welcome message based on profile
  if (profile.familyType === "young_family") {
    assistantMessages.push({
      type: "welcome",
      content:
        "Since you have young children, let's start with the most important protections for them. We'll focus on guardianship and making sure they're taken care of no matter what.",
      contextual: true,
    });
  } else if (profile.familyType === "empty_nesters") {
    assistantMessages.push({
      type: "welcome",
      content:
        "Let's focus on organizing your accumulated assets and healthcare wishes. You've built a lot over the years - now let's make sure it's protected.",
      contextual: true,
    });
  } else if (profile.familyType === "blended_family") {
    assistantMessages.push({
      type: "welcome",
      content:
        "With a blended family, clear documentation is essential. We'll help you create explicit plans that protect everyone and prevent misunderstandings.",
      contextual: true,
    });
  }

  // Generate priority tasks based on profile
  if (
    profile.familyType === "young_family" ||
    profile.specificNeeds.includes("guardianship")
  ) {
    priorityTasks.push({
      id: "guardian-selection",
      title: "Choose and Document Guardians",
      description:
        "Select trusted people to care for your children and document your wishes clearly.",
      estimatedTime: "30 minutes",
      impact: "high",
      category: "Family Protection",
      link: "/guardians",
      personalizedReason:
        "Critical for protecting your young children if something happens to you.",
    });
  }

  if (
    profile.assetComplexity === "complex" ||
    profile.specificNeeds.includes("business_succession")
  ) {
    priorityTasks.push({
      id: "business-succession",
      title: "Create Business Succession Plan",
      description:
        "Document how your business should be managed or transferred to protect your family's income.",
      estimatedTime: "2 hours",
      impact: "high",
      category: "Business Protection",
      link: "/business-planning",
      personalizedReason:
        "Your business is a major family asset that needs proper succession planning.",
    });
  }

  // Add emotional state-based guidance
  if (profile.emotionalState === "overwhelmed") {
    assistantMessages.push({
      type: "encouragement",
      content:
        "I know this feels like a lot. Let's take it one small step at a time. You don't have to do everything today.",
      contextual: true,
    });

    // Simplify tasks for overwhelmed users
    quickWins.push({
      id: "add-one-contact",
      title: "Add Just One Emergency Contact",
      timeEstimate: "2 minutes",
      link: "/contacts/add",
      description:
        "Start small - add just one person your family should contact.",
    });
  }

  if (profile.emotionalState === "anxious") {
    assistantMessages.push({
      type: "guidance",
      content:
        "We'll address your concerns step by step. Every task we've created directly addresses what's worrying you.",
      contextual: true,
    });
  }

  // Add urgency-based recommendations
  if (profile.urgencyLevel === "high") {
    assistantMessages.push({
      type: "warning",
      content:
        "Since time is critical, we've prioritized the most important tasks that will have immediate impact.",
      contextual: true,
    });

    // Adjust all task priorities for urgent situations
    priorityTasks.forEach((task) => {
      task.impact = "high";
    });
  }

  // Generate quick wins based on time availability
  if (profile.timeAvailability === "limited") {
    quickWins.push(
      {
        id: "profile-basics",
        title: "Complete Basic Profile",
        timeEstimate: "5 minutes",
        link: "/profile",
        description: "Quick setup of essential information.",
      },
      {
        id: "first-document",
        title: "Upload One Important Document",
        timeEstimate: "3 minutes",
        link: "/vault/upload",
        description: "Start with just one - like your driver's license.",
      },
    );
  }

  // Add personalized insights
  if (profile.primaryConcerns.includes("family_confusion")) {
    personalizedInsights.push({
      id: "clarity-focus",
      title: "Creating Clarity for Your Family",
      description:
        "Every step we take will include clear instructions your family can follow easily.",
      icon: "Users",
      color: "blue",
    });
  }

  if (profile.primaryConcerns.includes("business_continuity")) {
    personalizedInsights.push({
      id: "business-protection",
      title: "Protecting Your Business Legacy",
      description:
        "We'll ensure your business continues to support your family.",
      icon: "Briefcase",
      color: "purple",
    });
  }

  // Generate relevant dashboard sections
  const relevantSections: DashboardSection[] = [
    {
      id: "priority-actions",
      title: "Your Priority Actions",
      icon: "Target",
      content: "Tasks specifically chosen for your situation",
      priority: 1,
    },
  ];

  if (profile.familyType === "young_family") {
    relevantSections.push({
      id: "family-protection",
      title: "Protecting Your Children",
      icon: "Heart",
      content: "Guardianship, education funding, and care instructions",
      priority: 2,
      prefilledData: {
        suggestedGuardians: [
          "Consider siblings",
          "Close family friends",
          "Grandparents",
        ],
        educationGoals: ["College funding", "Private school considerations"],
      },
    });
  }

  if (profile.assetComplexity !== "simple") {
    relevantSections.push({
      id: "asset-organization",
      title: "Organize Your Assets",
      icon: "FileCheck",
      content: "Document and organize all your important assets",
      priority: 3,
      prefilledData: {
        assetCategories:
          profile.assetComplexity === "complex"
            ? [
                "Real Estate",
                "Business Interests",
                "Investments",
                "Retirement Accounts",
              ]
            : ["Home", "Bank Accounts", "Retirement"],
      },
    });
  }

  return {
    priorityTasks,
    relevantSections,
    assistantMessages,
    quickWins,
    personalizedInsights,
  };
};

interface ExistingTask {
  id: string;
  [key: string]: unknown;
}

// Helper function to generate specific task recommendations
export const generateTaskRecommendations = (
  profile: UserProfile,
  existingTasks: ExistingTask[],
): PriorityTask[] => {
  const recommendations: PriorityTask[] = [];

  // Family-specific recommendations
  if (
    profile.familyType === "young_family" &&
    !existingTasks.find((t) => t.id === "life-insurance")
  ) {
    recommendations.push({
      id: "life-insurance",
      title: "Review Life Insurance Needs",
      description: "Ensure you have adequate coverage for your young family.",
      estimatedTime: "45 minutes",
      impact: "high",
      category: "Financial Protection",
      link: "/insurance-calculator",
      personalizedReason:
        "Young children need financial protection until they can support themselves.",
    });
  }

  // Complexity-specific recommendations
  if (
    profile.assetComplexity === "complex" &&
    !existingTasks.find((t) => t.id === "advisor-team")
  ) {
    recommendations.push({
      id: "advisor-team",
      title: "Document Your Professional Advisors",
      description:
        "List all attorneys, accountants, and advisors your family should contact.",
      estimatedTime: "20 minutes",
      impact: "medium",
      category: "Professional Network",
      link: "/advisors",
      personalizedReason:
        "Complex estates need professional guidance - make sure your family knows who to call.",
    });
  }

  return recommendations;
};

interface TaskForScoring {
  category: string;
  estimatedTime: number;
  [key: string]: unknown;
}

// Score tasks based on user profile for intelligent prioritization
export const scoreTaskPriority = (
  task: TaskForScoring,
  profile: UserProfile,
): number => {
  let score = 0;

  // Base scoring by task category
  if (
    task.category === "guardianship" &&
    profile.familyType === "young_family"
  ) {
    score += 100;
  }

  if (task.category === "business" && profile.assetComplexity === "complex") {
    score += 90;
  }

  // Urgency multiplier
  if (profile.urgencyLevel === "high") {
    score *= 1.5;
  }

  // Emotional state adjustments
  if (profile.emotionalState === "overwhelmed" && task.estimatedTime > 30) {
    score *= 0.7; // Deprioritize long tasks for overwhelmed users
  }

  // Time availability adjustments
  if (profile.timeAvailability === "limited" && task.estimatedTime < 15) {
    score *= 1.2; // Prioritize quick tasks for time-limited users
  }

  return score;
};
