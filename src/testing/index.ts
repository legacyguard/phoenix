// Main audit functions
export * from "./uxAudit";

// Test utilities
export * from "./empathyTests";

// Metrics tracking
export * from "@/hooks/useUXMetrics";

// Components
export { default as UXMetricsDashboard } from "@/components/admin/UXMetricsDashboard";
export { default as EmpathyFeedback } from "@/components/feedback/EmpathyFeedback";

// Test helpers
export const runFullEmpathyAudit = async () => {
  const { auditEmpatheticUX } = await import("./uxAudit");
  const results = await auditEmpatheticUX();

  // Generate comprehensive report
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      overallScore:
        results.reduce((sum, r) => sum + r.score, 0) / results.length,
      criticalIssues: results.flatMap((r) =>
        r.issues.filter((i) => i.severity === "critical"),
      ),
      highIssues: results.flatMap((r) =>
        r.issues.filter((i) => i.severity === "high"),
      ),
      recommendations: results.flatMap((r) => r.recommendations),
    },
  };

  return report;
};

// Empathy checklist for manual testing
export const empathyChecklist = {
  language: [
    "No technical jargon visible to users",
    "All CTAs focus on family benefit",
    "Personal assistant voice is consistent",
    "Empathetic phrases used throughout",
  ],
  emotionalSupport: [
    "Difficult moments acknowledge emotions",
    "Error messages provide comfort",
    "Progress is celebrated warmly",
    "No pressure or urgency created",
  ],
  familyFocus: [
    "Every feature explained in family terms",
    "Benefits to family are clear",
    "Family stories and scenarios used",
    "Technical details hidden by default",
  ],
  assistantPersonality: [
    "First-person voice maintained",
    "Caring tone throughout",
    "Specific guidance provided",
    "Feels like a helpful friend",
  ],
};

// Quick validation functions
export const validateEmpatheticLanguage = (text: string): boolean => {
  const technicalTerms = ["asset", "configure", "manage", "user", "system"];
  const hasTechnicalTerms = technicalTerms.some((term) =>
    text.toLowerCase().includes(term),
  );

  const empathyTerms = ["family", "loved ones", "help", "support"];
  const hasEmpathyTerms = empathyTerms.some((term) =>
    text.toLowerCase().includes(term),
  );

  return !hasTechnicalTerms && hasEmpathyTerms;
};

export const validateCTA = (buttonText: string): boolean => {
  const technicalActions = ["add", "create", "manage", "configure", "edit"];
  const familyActions = ["protect", "help", "prepare", "share"];

  const hasTechnical = technicalActions.some((action) =>
    buttonText.toLowerCase().includes(action),
  );
  const hasFamily = familyActions.some((action) =>
    buttonText.toLowerCase().includes(action),
  );

  return !hasTechnical && hasFamily;
};
