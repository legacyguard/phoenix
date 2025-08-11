export interface UXIssue {
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  location: string;
  impact: "usability" | "emotional" | "family_focus" | "trust";
  suggestion?: string;
}

export interface UXAuditResult {
  category: string;
  score: number; // 1-10 scale
  issues: UXIssue[];
  recommendations: string[];
  emotionalTone: "technical" | "neutral" | "warm" | "empathetic";
  familyFocusScore: number;
  assistantPersonalityScore: number;
}

export interface AuditMetrics {
  empathyScore: number;
  familyFocusRatio: number;
  emotionalSupportCoverage: number;
  assistantConsistency: number;
  trustScore: number;
  overwhelmScore: number;
}

// Technical terms to avoid
const TECHNICAL_TERMS = [
  "asset",
  "configure",
  "manage",
  "optimize",
  "process",
  "system",
  "database",
  "user",
  "interface",
  "functionality",
  "feature",
  "workflow",
  "module",
  "component",
  "integration",
  "implementation",
];

// Family-focused terms to encourage
const FAMILY_TERMS = [
  "family",
  "loved ones",
  "children",
  "spouse",
  "parents",
  "protect",
  "care",
  "help",
  "support",
  "prepare",
  "peace of mind",
  "legacy",
  "wishes",
  "important to you",
  "your story",
];

// Empathetic phrases
const EMPATHETIC_PHRASES = [
  "I understand",
  "I'm here to help",
  "don't worry",
  "take your time",
  "this is important",
  "your family",
  "when you're ready",
  "let me help",
];

export const auditEmpatheticUX = async (): Promise<UXAuditResult[]> => {
  const results = await Promise.all([
    auditLanguageEmpathy(),
    auditFamilyFocus(),
    auditEmotionalSupport(),
    auditProgressiveDisclosure(),
    auditPersonalAssistantPersonality(),
    auditErrorHandling(),
    auditCelebrationMoments(),
    auditOverallFlow(),
  ]);

  return results;
};

// Language Empathy Audit
export const auditLanguageEmpathy = async (): Promise<UXAuditResult> => {
  const content = await getAllUserFacingText();
  const technicalTermsFound: UXIssue[] = [];
  let empathyScore = 10;

  // Scan for technical language
  TECHNICAL_TERMS.forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi");
    const matches = content.match(regex);

    if (matches) {
      empathyScore -= 0.5 * matches.length;
      technicalTermsFound.push({
        severity: "medium",
        description: `Technical term "${term}" found ${matches.length} times`,
        location: "Various UI elements",
        impact: "emotional",
        suggestion: `Replace with family-focused language`,
      });
    }
  });

  // Check for empathetic phrases
  let empathyPhraseCount = 0;
  EMPATHETIC_PHRASES.forEach((phrase) => {
    const regex = new RegExp(phrase, "gi");
    const matches = content.match(regex);
    if (matches) {
      empathyPhraseCount += matches.length;
    }
  });

  // Adjust score based on empathetic phrases
  empathyScore = Math.min(10, empathyScore + empathyPhraseCount * 0.1);

  return {
    category: "Language Empathy",
    score: Math.max(1, empathyScore),
    issues: technicalTermsFound,
    recommendations: [
      "Replace all technical jargon with family-focused language",
      "Ensure all CTAs focus on family benefit rather than features",
      'Use "your family" instead of "users" or "beneficiaries"',
      "Add more empathetic phrases throughout the interface",
    ],
    emotionalTone:
      empathyScore > 7 ? "empathetic" : empathyScore > 5 ? "warm" : "technical",
    familyFocusScore: 0,
    assistantPersonalityScore: 0,
  };
};

// Family Focus Audit
export const auditFamilyFocus = async (): Promise<UXAuditResult> => {
  const content = await getAllUserFacingText();
  const issues: UXIssue[] = [];

  // Count family vs feature references
  let familyReferences = 0;
  let featureReferences = 0;

  FAMILY_TERMS.forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi");
    const matches = content.match(regex);
    if (matches) familyReferences += matches.length;
  });

  // Look for feature-focused language
  const featureTerms = ["feature", "tool", "function", "capability", "option"];
  featureTerms.forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi");
    const matches = content.match(regex);
    if (matches) {
      featureReferences += matches.length;
      issues.push({
        severity: "low",
        description: `Feature-focused term "${term}" found`,
        location: "UI content",
        impact: "family_focus",
        suggestion: "Reframe in terms of family benefit",
      });
    }
  });

  const familyFocusRatio =
    familyReferences / (familyReferences + featureReferences + 1);
  const score = familyFocusRatio * 10;

  return {
    category: "Family Focus",
    score: Math.min(10, score),
    issues,
    recommendations: [
      "Emphasize family benefits over product features",
      "Show family impact for every action",
      "Use family scenarios in explanations",
      "Replace feature descriptions with family outcome descriptions",
    ],
    emotionalTone: familyFocusRatio > 0.7 ? "empathetic" : "neutral",
    familyFocusScore: familyFocusRatio,
    assistantPersonalityScore: 0,
  };
};

// Emotional Support Audit
export const auditEmotionalSupport = async (): Promise<UXAuditResult> => {
  const difficultMoments = await identifyDifficultMoments();
  const supportCoverage = await checkEmotionalSupportCoverage(difficultMoments);
  const issues: UXIssue[] = [];

  difficultMoments.forEach((moment) => {
    if (!moment.hasEmotionalSupport) {
      issues.push({
        severity: "high",
        description: `No emotional support at ${moment.location}`,
        location: moment.location,
        impact: "emotional",
        suggestion: "Add reassuring message or supportive guidance",
      });
    }
  });

  const score = supportCoverage * 10;

  return {
    category: "Emotional Support",
    score,
    issues,
    recommendations: [
      "Add emotional support at all difficult decision points",
      "Include reassurance messages during complex tasks",
      "Acknowledge the emotional weight of estate planning",
      "Provide encouragement after completing difficult sections",
    ],
    emotionalTone: score > 8 ? "empathetic" : score > 6 ? "warm" : "neutral",
    familyFocusScore: 0,
    assistantPersonalityScore: 0,
  };
};

// Progressive Disclosure Audit
export const auditProgressiveDisclosure = async (): Promise<UXAuditResult> => {
  const complexityPoints = await identifyComplexityPoints();
  const issues: UXIssue[] = [];
  let score = 10;

  complexityPoints.forEach((point) => {
    if (point.complexity > 5) {
      score -= 1;
      issues.push({
        severity: point.complexity > 7 ? "high" : "medium",
        description: `High complexity at ${point.location}`,
        location: point.location,
        impact: "usability",
        suggestion: "Break down into smaller, guided steps",
      });
    }
  });

  return {
    category: "Progressive Disclosure",
    score: Math.max(1, score),
    issues,
    recommendations: [
      "Break complex tasks into bite-sized steps",
      "Show only essential information initially",
      "Use expandable sections for additional details",
      "Guide users through one decision at a time",
    ],
    emotionalTone: "neutral",
    familyFocusScore: 0,
    assistantPersonalityScore: 0,
  };
};

// Personal Assistant Personality Audit
export const auditPersonalAssistantPersonality =
  async (): Promise<UXAuditResult> => {
    const messages = await getAllAssistantMessages();
    const issues: UXIssue[] = [];
    let consistencyScore = 10;
    let personalityScore = 0;

    messages.forEach((message) => {
      // Check for personal guidance tone
      if (!message.content.includes("I") && !message.content.includes("me")) {
        consistencyScore -= 0.5;
        issues.push({
          severity: "medium",
          description: "Message lacks personal assistant voice",
          location: message.location,
          impact: "trust",
          suggestion: "Use first-person language to create personal connection",
        });
      }

      // Check for caring personality
      const caringIndicators = [
        "help",
        "support",
        "understand",
        "care",
        "important",
      ];
      const hasCaringTone = caringIndicators.some((indicator) =>
        message.content.toLowerCase().includes(indicator),
      );

      if (hasCaringTone) personalityScore += 1;
    });

    const score =
      (consistencyScore + (personalityScore / messages.length) * 10) / 2;

    return {
      category: "Personal Assistant Personality",
      score: Math.min(10, score),
      issues,
      recommendations: [
        "Use consistent first-person voice throughout",
        "Maintain warm, caring tone in all interactions",
        "Show understanding of user's emotional state",
        "Provide personal guidance rather than instructions",
      ],
      emotionalTone: score > 7 ? "empathetic" : "warm",
      familyFocusScore: 0,
      assistantPersonalityScore: score / 10,
    };
  };

// Error Handling Audit
export const auditErrorHandling = async (): Promise<UXAuditResult> => {
  const errorMessages = await getAllErrorMessages();
  const issues: UXIssue[] = [];
  let score = 10;

  errorMessages.forEach((error) => {
    // Check for technical error language
    const technicalErrorTerms = [
      "error",
      "failed",
      "invalid",
      "incorrect",
      "wrong",
    ];
    technicalErrorTerms.forEach((term) => {
      if (error.content.toLowerCase().includes(term)) {
        score -= 1;
        issues.push({
          severity: "high",
          description: `Technical error term "${term}" in error message`,
          location: error.location,
          impact: "emotional",
          suggestion: "Replace with supportive, solution-focused language",
        });
      }
    });

    // Check for emotional support
    const supportTerms = ["help", "try again", "don't worry", "safe"];
    const hasSupport = supportTerms.some((term) =>
      error.content.toLowerCase().includes(term),
    );

    if (!hasSupport) {
      score -= 0.5;
      issues.push({
        severity: "medium",
        description: "Error message lacks emotional support",
        location: error.location,
        impact: "emotional",
      });
    }
  });

  return {
    category: "Error Handling",
    score: Math.max(1, score),
    issues,
    recommendations: [
      "Replace all technical error terms with supportive language",
      "Always provide reassurance in error messages",
      "Focus on solutions rather than problems",
      "Maintain caring tone even during errors",
    ],
    emotionalTone: score > 8 ? "empathetic" : "warm",
    familyFocusScore: 0,
    assistantPersonalityScore: 0,
  };
};

// Celebration Moments Audit
export const auditCelebrationMoments = async (): Promise<UXAuditResult> => {
  const milestones = await identifyMilestones();
  const issues: UXIssue[] = [];
  let celebrationScore = 0;

  milestones.forEach((milestone) => {
    if (milestone.hasCelebration) {
      celebrationScore += 1;
    } else {
      issues.push({
        severity: "low",
        description: `No celebration for ${milestone.name}`,
        location: milestone.location,
        impact: "emotional",
        suggestion: "Add positive reinforcement and acknowledgment",
      });
    }
  });

  const score = (celebrationScore / milestones.length) * 10;

  return {
    category: "Celebration Moments",
    score,
    issues,
    recommendations: [
      "Celebrate every meaningful step completed",
      "Acknowledge the importance of user's actions",
      "Show progress in terms of family protection achieved",
      "Use warm, encouraging language for accomplishments",
    ],
    emotionalTone: score > 7 ? "empathetic" : "warm",
    familyFocusScore: 0,
    assistantPersonalityScore: 0,
  };
};

// Overall Flow Audit
export const auditOverallFlow = async (): Promise<UXAuditResult> => {
  const flowMetrics = await analyzeUserFlow();
  const issues: UXIssue[] = [];

  if (flowMetrics.averageStepsToCompletion > 5) {
    issues.push({
      severity: "medium",
      description: "User journey requires too many steps",
      location: "Overall flow",
      impact: "usability",
      suggestion: "Simplify and consolidate steps",
    });
  }

  if (flowMetrics.confusionPoints.length > 0) {
    flowMetrics.confusionPoints.forEach((point) => {
      issues.push({
        severity: "high",
        description: `Confusion point at ${point}`,
        location: point,
        impact: "usability",
        suggestion: "Add clearer guidance or simplify",
      });
    });
  }

  const score = 10 - issues.length * 0.5;

  return {
    category: "Overall Flow",
    score: Math.max(1, score),
    issues,
    recommendations: [
      "Ensure smooth, guided progression through tasks",
      "Minimize cognitive load at each step",
      "Provide clear next steps throughout",
      "Maintain emotional support during entire journey",
    ],
    emotionalTone: "neutral",
    familyFocusScore: 0,
    assistantPersonalityScore: 0,
  };
};

// Helper domain types for audits
interface DifficultMoment {
  location: string;
  hasEmotionalSupport: boolean;
}

interface ComplexityPoint {
  location: string;
  complexity: number; // 1-10 scale
}

interface AssistantMessage {
  location: string;
  content: string;
}

interface ErrorMessage {
  location: string;
  content: string;
}

interface Milestone {
  name: string;
  location: string;
  hasCelebration: boolean;
}

interface FlowMetrics {
  averageStepsToCompletion: number;
  confusionPoints: string[];
}

// Helper functions (these would need actual implementation)
async function getAllUserFacingText(): Promise<string> {
  // Mock implementation - would scan all UI text
  return "";
}

async function identifyDifficultMoments(): Promise<DifficultMoment[]> {
  // Mock implementation - would identify emotionally difficult points
  return [];
}

async function checkEmotionalSupportCoverage(
  moments: DifficultMoment[],
): Promise<number> {
  // Mock implementation
  // Calculate percentage of moments that have emotional support
  if (moments.length === 0) return 0.8;
  const withSupport = moments.filter((m) => m.hasEmotionalSupport).length;
  return withSupport / moments.length;
}

async function identifyComplexityPoints(): Promise<ComplexityPoint[]> {
  // Mock implementation
  return [];
}

async function getAllAssistantMessages(): Promise<AssistantMessage[]> {
  // Mock implementation
  return [];
}

async function getAllErrorMessages(): Promise<ErrorMessage[]> {
  // Mock implementation
  return [];
}

async function identifyMilestones(): Promise<Milestone[]> {
  // Mock implementation
  return [];
}

async function analyzeUserFlow(): Promise<FlowMetrics> {
  // Mock implementation
  return {
    averageStepsToCompletion: 4,
    confusionPoints: [],
  };
}
