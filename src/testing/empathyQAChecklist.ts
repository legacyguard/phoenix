export interface QACheckItem {
  id: string;
  description: string;
  checked: boolean;
  priority: "critical" | "high" | "medium" | "low";
  verificationMethod: string;
}

export interface QACategory {
  category: string;
  description: string;
  checks: QACheckItem[];
}

export interface QAChecklistResult {
  timestamp: Date;
  overallScore: number;
  categoriesCompleted: number;
  criticalIssues: string[];
  recommendations: string[];
}

export const empathyQAChecklist: QACategory[] = [
  {
    category: "Language and Tone",
    description: "Verify all text uses empathetic, family-focused language",
    checks: [
      {
        id: "lang-1",
        description:
          "All user-facing text uses empathetic, family-focused language",
        checked: false,
        priority: "critical",
        verificationMethod: "Run language empathy audit and verify score > 8.5",
      },
      {
        id: "lang-2",
        description: "No technical jargon remains in user interface",
        checked: false,
        priority: "critical",
        verificationMethod:
          "Search for technical terms list and ensure zero matches",
      },
      {
        id: "lang-3",
        description: "All CTAs focus on family benefit rather than features",
        checked: false,
        priority: "high",
        verificationMethod:
          "Review all buttons and verify family-focused language",
      },
      {
        id: "lang-4",
        description: "Error messages provide emotional support and reassurance",
        checked: false,
        priority: "high",
        verificationMethod:
          "Trigger all error states and verify supportive messaging",
      },
      {
        id: "lang-5",
        description: "Loading states maintain caring assistant personality",
        checked: false,
        priority: "medium",
        verificationMethod:
          "Check all loading states for consistent personality",
      },
      {
        id: "lang-6",
        description: "Empty states provide gentle encouragement",
        checked: false,
        priority: "medium",
        verificationMethod: "Verify all empty states have encouraging messages",
      },
      {
        id: "lang-7",
        description: "Tooltips and help text use conversational tone",
        checked: false,
        priority: "low",
        verificationMethod: "Review all tooltips for conversational language",
      },
    ],
  },
  {
    category: "Personal Assistant Experience",
    description: "Ensure consistent caring assistant personality throughout",
    checks: [
      {
        id: "assistant-1",
        description: "Assistant appears contextually on all major pages",
        checked: false,
        priority: "critical",
        verificationMethod: "Navigate all pages and verify assistant presence",
      },
      {
        id: "assistant-2",
        description:
          "Assistant messages adapt to user progress and emotional state",
        checked: false,
        priority: "high",
        verificationMethod: "Test assistant with different user states",
      },
      {
        id: "assistant-3",
        description:
          "Assistant provides personalized suggestions based on user situation",
        checked: false,
        priority: "high",
        verificationMethod: "Verify suggestions change with family situation",
      },
      {
        id: "assistant-4",
        description: "Assistant celebrates progress and provides encouragement",
        checked: false,
        priority: "medium",
        verificationMethod: "Complete tasks and verify celebrations",
      },
      {
        id: "assistant-5",
        description:
          "Assistant offers appropriate support during difficult moments",
        checked: false,
        priority: "critical",
        verificationMethod: "Test difficult flows and verify support messages",
      },
      {
        id: "assistant-6",
        description: "Assistant maintains consistent first-person voice",
        checked: false,
        priority: "medium",
        verificationMethod:
          "Review all assistant messages for voice consistency",
      },
      {
        id: "assistant-7",
        description: "Assistant remembers context between interactions",
        checked: false,
        priority: "low",
        verificationMethod: "Test multi-step flows for context retention",
      },
    ],
  },
  {
    category: "Family-Focused Features",
    description: "Verify all features clearly communicate family benefit",
    checks: [
      {
        id: "family-1",
        description: "All features clearly explain family benefit",
        checked: false,
        priority: "critical",
        verificationMethod:
          "Review each feature for family benefit explanation",
      },
      {
        id: "family-2",
        description: "Family impact is visualized for user actions",
        checked: false,
        priority: "high",
        verificationMethod: "Check family impact visualization components",
      },
      {
        id: "family-3",
        description:
          "Family situation awareness adapts interface appropriately",
        checked: false,
        priority: "high",
        verificationMethod: "Test with different family situations",
      },
      {
        id: "family-4",
        description: "Life event triggers provide relevant updates",
        checked: false,
        priority: "medium",
        verificationMethod: "Simulate life events and verify responses",
      },
      {
        id: "family-5",
        description: "Progressive disclosure prevents overwhelming users",
        checked: false,
        priority: "high",
        verificationMethod: "Test complex forms for progressive disclosure",
      },
      {
        id: "family-6",
        description: "Family member profiles show relationships clearly",
        checked: false,
        priority: "medium",
        verificationMethod: "Review family member displays",
      },
      {
        id: "family-7",
        description: "Cultural sensitivity in family representations",
        checked: false,
        priority: "low",
        verificationMethod: "Verify inclusive family representations",
      },
    ],
  },
  {
    category: "Emotional Intelligence",
    description: "Ensure system recognizes and responds to emotional states",
    checks: [
      {
        id: "emotion-1",
        description: "System recognizes and responds to emotional states",
        checked: false,
        priority: "critical",
        verificationMethod: "Test emotional state detection and responses",
      },
      {
        id: "emotion-2",
        description:
          "Emotional checkpoints provide support during difficult tasks",
        checked: false,
        priority: "high",
        verificationMethod: "Verify checkpoints in difficult flows",
      },
      {
        id: "emotion-3",
        description: "Celebration moments acknowledge meaningful progress",
        checked: false,
        priority: "medium",
        verificationMethod: "Complete milestones and verify celebrations",
      },
      {
        id: "emotion-4",
        description:
          "Error handling provides emotional comfort and practical solutions",
        checked: false,
        priority: "high",
        verificationMethod: "Test error scenarios for emotional support",
      },
      {
        id: "emotion-5",
        description:
          "Overall experience feels supportive rather than transactional",
        checked: false,
        priority: "critical",
        verificationMethod: "Complete full user journey and assess feeling",
      },
      {
        id: "emotion-6",
        description: "Provides emotional off-ramps when users need breaks",
        checked: false,
        priority: "medium",
        verificationMethod: "Verify pause/continue options in long flows",
      },
      {
        id: "emotion-7",
        description: "Acknowledges difficulty of estate planning topics",
        checked: false,
        priority: "low",
        verificationMethod: "Review content for emotional acknowledgment",
      },
    ],
  },
  {
    category: "User Journey Flow",
    description: "Verify smooth, supportive progression through tasks",
    checks: [
      {
        id: "flow-1",
        description: "Onboarding feels welcoming and non-overwhelming",
        checked: false,
        priority: "critical",
        verificationMethod: "Complete onboarding as new user",
      },
      {
        id: "flow-2",
        description: "Dashboard provides clear, personalized next steps",
        checked: false,
        priority: "high",
        verificationMethod: "Review dashboard for clarity and personalization",
      },
      {
        id: "flow-3",
        description: "Complex tasks broken into manageable steps",
        checked: false,
        priority: "high",
        verificationMethod: "Test all complex workflows",
      },
      {
        id: "flow-4",
        description: "Progress is saved and communicated clearly",
        checked: false,
        priority: "medium",
        verificationMethod: "Test save functionality and messaging",
      },
      {
        id: "flow-5",
        description: "Users can pause and resume without losing context",
        checked: false,
        priority: "medium",
        verificationMethod: "Test pause/resume in all major flows",
      },
      {
        id: "flow-6",
        description: "Help is available contextually when needed",
        checked: false,
        priority: "low",
        verificationMethod: "Verify help availability throughout",
      },
    ],
  },
  {
    category: "Accessibility and Inclusivity",
    description: "Ensure empathetic experience for all users",
    checks: [
      {
        id: "access-1",
        description:
          "Interface works for users with different emotional states",
        checked: false,
        priority: "high",
        verificationMethod: "Test with simulated emotional states",
      },
      {
        id: "access-2",
        description: "Language is clear for non-native speakers",
        checked: false,
        priority: "medium",
        verificationMethod: "Review for simple, clear language",
      },
      {
        id: "access-3",
        description: "Visual design supports emotional comfort",
        checked: false,
        priority: "medium",
        verificationMethod: "Verify calming colors and spacing",
      },
      {
        id: "access-4",
        description: "Screen reader experience maintains empathy",
        checked: false,
        priority: "low",
        verificationMethod: "Test with screen reader",
      },
      {
        id: "access-5",
        description: "Mobile experience maintains caring personality",
        checked: false,
        priority: "medium",
        verificationMethod: "Test on mobile devices",
      },
    ],
  },
  {
    category: "Performance and Reliability",
    description: "Ensure technical performance supports emotional experience",
    checks: [
      {
        id: "perf-1",
        description: "Page loads are fast to reduce anxiety",
        checked: false,
        priority: "medium",
        verificationMethod: "Measure load times < 3 seconds",
      },
      {
        id: "perf-2",
        description: "Auto-save prevents data loss frustration",
        checked: false,
        priority: "critical",
        verificationMethod: "Verify auto-save in all forms",
      },
      {
        id: "perf-3",
        description: "Error recovery maintains user confidence",
        checked: false,
        priority: "high",
        verificationMethod: "Test error recovery scenarios",
      },
      {
        id: "perf-4",
        description: "Offline capabilities prevent progress loss",
        checked: false,
        priority: "low",
        verificationMethod: "Test offline scenarios",
      },
    ],
  },
];

// Quality assurance execution functions
export const executeQAChecklist = async (): Promise<QAChecklistResult> => {
  const results: QACategory[] = JSON.parse(JSON.stringify(empathyQAChecklist));
  let totalChecks = 0;
  let completedChecks = 0;
  const criticalIssues: string[] = [];

  for (const category of results) {
    for (const check of category.checks) {
      totalChecks++;

      // Execute verification method (in real implementation)
      const passed = await executeVerification(check);
      check.checked = passed;

      if (passed) {
        completedChecks++;
      } else if (check.priority === "critical") {
        criticalIssues.push(`${category.category}: ${check.description}`);
      }
    }
  }

  const overallScore = (completedChecks / totalChecks) * 100;
  const categoriesCompleted = results.filter((cat) =>
    cat.checks.every((check) => check.checked),
  ).length;

  return {
    timestamp: new Date(),
    overallScore,
    categoriesCompleted,
    criticalIssues,
    recommendations: generateQARecommendations(results),
  };
};

const executeVerification = async (check: QACheckItem): Promise<boolean> => {
  // In real implementation, this would execute the verification method
  // For now, return mock results
  return Math.random() > 0.2; // 80% pass rate for testing
};

const generateQARecommendations = (results: QACategory[]): string[] => {
  const recommendations: string[] = [];

  for (const category of results) {
    const failedChecks = category.checks.filter((check) => !check.checked);

    if (failedChecks.length > 0) {
      const criticalCount = failedChecks.filter(
        (c) => c.priority === "critical",
      ).length;
      const highCount = failedChecks.filter(
        (c) => c.priority === "high",
      ).length;

      if (criticalCount > 0) {
        recommendations.push(
          `CRITICAL - ${category.category}: ${criticalCount} critical issues must be resolved`,
        );
      }
      if (highCount > 0) {
        recommendations.push(
          `HIGH - ${category.category}: ${highCount} high priority issues need attention`,
        );
      }
    }
  }

  return recommendations;
};

// Export checklist for use in testing
export const getChecklistByCategory = (categoryName: string): QACheckItem[] => {
  const category = empathyQAChecklist.find(
    (cat) => cat.category === categoryName,
  );
  return category ? category.checks : [];
};

export const getFailedCriticalChecks = (
  results: QACategory[],
): QACheckItem[] => {
  const failedCritical: QACheckItem[] = [];

  for (const category of results) {
    const failed = category.checks.filter(
      (check) => !check.checked && check.priority === "critical",
    );
    failedCritical.push(...failed);
  }

  return failedCritical;
};
