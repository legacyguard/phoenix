interface UserDocumentation {
  financialAccounts: DocumentedItem[];
  medicalPreferences: DocumentedItem[];
  childCareArrangements: DocumentedItem[];
  assetDistribution: DocumentedItem[];
  trustedCircle: DocumentedItem[];
  willDocuments: DocumentedItem[];
}

interface DocumentedItem {
  id: string;
  type: string;
  description: string;
  dateDocumented: Date;
  details?: Record<string, unknown>;
}

interface ProtectionArea {
  area: string;
  isDocumented: boolean;
  specificBenefits: string[];
}

interface ImpactStatement {
  area: string;
  currentProtection: string;
  specificBenefit: string;
  realWorldExample: string;
}

export const hasDocumentedFinancialAccess = (
  documentation: UserDocumentation,
): boolean => {
  return (
    documentation.financialAccounts &&
    documentation.financialAccounts.length > 0
  );
};

export const hasDocumentedMedicalPreferences = (
  documentation: UserDocumentation,
): boolean => {
  return (
    documentation.medicalPreferences &&
    documentation.medicalPreferences.length > 0
  );
};

export const hasDocumentedChildCareArrangements = (
  documentation: UserDocumentation,
): boolean => {
  return (
    documentation.childCareArrangements &&
    documentation.childCareArrangements.length > 0
  );
};

export const hasDocumentedAssetWishes = (
  documentation: UserDocumentation,
): boolean => {
  return (
    documentation.assetDistribution &&
    documentation.assetDistribution.length > 0
  );
};

export const hasDocumentedTrustedCircle = (
  documentation: UserDocumentation,
): boolean => {
  return documentation.trustedCircle && documentation.trustedCircle.length > 0;
};

export const assessActualProtection = (
  userDocumentation: UserDocumentation,
) => {
  const protectionAreas = {
    financialAccess: hasDocumentedFinancialAccess(userDocumentation),
    medicalWishes: hasDocumentedMedicalPreferences(userDocumentation),
    childCare: hasDocumentedChildCareArrangements(userDocumentation),
    assetDistribution: hasDocumentedAssetWishes(userDocumentation),
    supportNetwork: hasDocumentedTrustedCircle(userDocumentation),
  };

  return generateSpecificImpactStatements(protectionAreas);
};

export const generateSpecificImpactStatements = (
  protectionAreas: Record<string, boolean>,
): ImpactStatement[] => {
  const statements: ImpactStatement[] = [];

  if (protectionAreas.financialAccess) {
    statements.push({
      area: "Financial Access",
      currentProtection:
        "Your family has access to your financial account information",
      specificBenefit:
        "Bills can be paid immediately without searching for account numbers",
      realWorldExample:
        "When the mortgage payment is due, your family knows exactly which account to use and how to access it",
    });
  }

  if (protectionAreas.medicalWishes) {
    statements.push({
      area: "Medical Decisions",
      currentProtection:
        "Your medical preferences are documented and accessible",
      specificBenefit:
        "Healthcare providers and family have clear guidance for medical decisions",
      realWorldExample:
        "If you cannot speak for yourself, doctors will know your specific treatment preferences",
    });
  }

  if (protectionAreas.childCare) {
    statements.push({
      area: "Child Care",
      currentProtection:
        "Your children's care arrangements are clearly documented",
      specificBenefit: "No uncertainty about who will care for your children",
      realWorldExample:
        "Your chosen guardians can immediately step in to provide continuity and stability for your children",
    });
  }

  if (protectionAreas.assetDistribution) {
    statements.push({
      area: "Asset Distribution",
      currentProtection: "Your wishes for asset distribution are documented",
      specificBenefit: "No family disputes about who receives what",
      realWorldExample:
        "Each family member knows exactly what you intended for them to receive",
    });
  }

  if (protectionAreas.supportNetwork) {
    statements.push({
      area: "Support Network",
      currentProtection:
        "Your trusted circle is documented with roles and contact information",
      specificBenefit:
        "Your family has immediate access to helpful, knowledgeable people",
      realWorldExample:
        "When legal questions arise, your family knows to call your designated attorney who already understands your situation",
    });
  }

  return statements;
};

// Function to generate protection summary without percentages
export const generateProtectionSummary = (
  userDocumentation: UserDocumentation,
): string[] => {
  const summary: string[] = [];
  const impactStatements = assessActualProtection(userDocumentation);

  if (impactStatements.length === 0) {
    summary.push("Begin documenting to provide protection for your family");
  } else if (impactStatements.length < 3) {
    summary.push("Your family has essential information documented");
    summary.push(
      "Additional documentation would provide more comprehensive protection",
    );
  } else if (impactStatements.length < 5) {
    summary.push("Your family has access to comprehensive information");
    summary.push("Most critical areas are documented");
  } else {
    summary.push(
      "Your family has everything they need to handle your affairs confidently",
    );
    summary.push("Your wishes are documented and clear");
    summary.push("A complete support framework is in place");
  }

  return summary;
};
