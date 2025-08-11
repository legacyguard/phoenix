interface AcknowledgmentMoment {
  trigger: string;
  type:
    | "foundation"
    | "documentation"
    | "completion"
    | "responsibility_fulfilled";
  familyImpact: string;
  acknowledgmentMessage: string;
  confidenceBuilder: string;
}

interface UserProgress {
  documentsCount: number;
  hasFirstAsset: boolean;
  hasFirstTrustedPerson: boolean;
  hasCompletedWill: boolean;
  protectionAreas: {
    financial: boolean;
    medical: boolean;
    childCare: boolean;
    assets: boolean;
    trustedCircle: boolean;
  };
}

export const detectAcknowledgmentMoments = (
  userProgress: UserProgress,
): AcknowledgmentMoment[] => {
  const moments: AcknowledgmentMoment[] = [];

  // First critical asset documented
  if (userProgress.hasFirstAsset && userProgress.documentsCount === 1) {
    moments.push({
      trigger: "first_asset_documented",
      type: "foundation",
      familyImpact:
        "Your family now knows how to access your most important account",
      acknowledgmentMessage:
        "You have documented essential financial information",
      confidenceBuilder:
        "This is a crucial step in protecting your family's financial security",
    });
  }

  // First trusted person designated
  if (userProgress.hasFirstTrustedPerson) {
    moments.push({
      trigger: "first_trusted_person",
      type: "foundation",
      familyImpact: "Your family now has someone they can turn to for help",
      acknowledgmentMessage:
        "You have established a support person for your family",
      confidenceBuilder: "Your family will not have to handle everything alone",
    });
  }

  // Will completed
  if (userProgress.hasCompletedWill) {
    moments.push({
      trigger: "will_completed",
      type: "responsibility_fulfilled",
      familyImpact:
        "Your family will know exactly what you wanted and intended",
      acknowledgmentMessage: "You have documented your wishes for your family",
      confidenceBuilder:
        "You have fulfilled one of the most important responsibilities to your family",
    });
  }

  // Major protection areas addressed
  const protectedAreas = Object.values(userProgress.protectionAreas).filter(
    Boolean,
  ).length;

  if (protectedAreas === 3) {
    moments.push({
      trigger: "multiple_areas_protected",
      type: "documentation",
      familyImpact: "Your family has guidance for most critical situations",
      acknowledgmentMessage:
        "You have documented information across multiple important areas",
      confidenceBuilder:
        "Your family is now better prepared for various circumstances",
    });
  }

  if (protectedAreas === 5) {
    moments.push({
      trigger: "comprehensive_protection",
      type: "completion",
      familyImpact:
        "Your family has comprehensive information to handle your affairs",
      acknowledgmentMessage:
        "You have provided your family with complete documentation",
      confidenceBuilder:
        "You have demonstrated exceptional care and responsibility for your family's future",
    });
  }

  return moments;
};

// Helper function to determine next recommended areas
export const getNextProtectionAreas = (
  userProgress: UserProgress,
): string[] => {
  const recommendations: string[] = [];

  if (!userProgress.protectionAreas.financial) {
    recommendations.push(
      "When you're ready, documenting your financial accounts would further protect your family",
    );
  }

  if (!userProgress.protectionAreas.medical) {
    recommendations.push(
      "Another important area to consider is your medical preferences and healthcare contacts",
    );
  }

  if (
    !userProgress.protectionAreas.childCare &&
    userProgress.protectionAreas.trustedCircle
  ) {
    recommendations.push(
      "Your family would also benefit from having clear childcare arrangements documented",
    );
  }

  if (!userProgress.protectionAreas.trustedCircle) {
    recommendations.push(
      "Establishing a trusted circle of support would provide additional security for your family",
    );
  }

  return recommendations;
};
