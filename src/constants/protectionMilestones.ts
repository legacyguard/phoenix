export interface Milestone {
  id: string;
  title: string;
  accomplishment: string;
  protectionImprovement: string;
  nextResponsibility: string;
  familyImpact: string;
  icon?: React.ReactNode;
}

// Predefined milestones for family protection journey
export const PROTECTION_MILESTONES: Milestone[] = [
  {
    id: 'first-asset-documented',
    title: 'Essential Information Documented',
    accomplishment: 'You have documented your first important asset',
    protectionImprovement: 'better informed about your primary financial resources',
    nextResponsibility: 'Continue documenting other essential assets and accounts',
    familyImpact: 'In an emergency, your family will know about this critical asset and how to access it'
  },
  {
    id: 'foundation-complete',
    title: 'Foundation Protection Established',
    accomplishment: 'You have completed the essential steps for basic family protection',
    protectionImprovement: 'protected with fundamental information and documentation',
    nextResponsibility: 'Consider establishing a trusted circle to support your family',
    familyImpact: 'Your family has access to critical information about assets, important contacts, and your basic wishes'
  },
  {
    id: 'will-created',
    title: 'Will Completed',
    accomplishment: 'You have created a will to protect your family\'s future',
    protectionImprovement: 'legally protected with clear instructions for asset distribution',
    nextResponsibility: 'Document your healthcare preferences and directives',
    familyImpact: 'Your wishes are now legally documented, reducing potential confusion and conflict during difficult times'
  },
  {
    id: 'trusted-circle-established',
    title: 'Support System Created',
    accomplishment: 'You have designated trusted individuals to help your family',
    protectionImprovement: 'supported by a network of trusted people who can provide guidance',
    nextResponsibility: 'Plan how your trusted circle will access necessary information',
    familyImpact: 'Your family will have designated support from people you trust during challenging times'
  },
  {
    id: 'comprehensive-protection',
    title: 'Comprehensive Protection Achieved',
    accomplishment: 'You have created a comprehensive protection plan for your family',
    protectionImprovement: 'thoroughly prepared with detailed guidance for most situations',
    nextResponsibility: 'Schedule annual reviews to keep your plan current',
    familyImpact: 'Your family has clear, comprehensive guidance covering financial, legal, and personal matters'
  }
];

// Confidence acknowledgment messages based on protection level
export const getConfidenceAcknowledgment = (protectionLevel: string): string => {
  const acknowledgments: Record<string, string> = {
    foundation: "You have taken important first steps. Your family now has essential information they would need.",
    comprehensive: "You have built a strong foundation of protection. Your family has comprehensive guidance for most situations.",
    complete: "You have fulfilled your responsibility comprehensively. Your family is well-prepared for the future."
  };
  
  return acknowledgments[protectionLevel] || "You are making important progress in protecting your family.";
};
