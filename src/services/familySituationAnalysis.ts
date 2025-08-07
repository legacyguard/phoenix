import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  isDependent?: boolean;
  hasSpecialNeeds?: boolean;
  specialNeedsDetails?: string;
  livingArrangement?: 'together' | 'separate' | 'assisted_living';
  culturalRole?: string;
}

export interface FamilyData {
  userId: string;
  members: FamilyMember[];
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'partnered';
  hasChildren: boolean;
  childrenAges?: number[];
  hasDependentParents?: boolean;
  hasSpecialNeedsMembers?: boolean;
  isPreviouslyMarried?: boolean;
  hasStepChildren?: boolean;
  militaryService?: boolean;
  businessOwner?: boolean;
  geographicSpread?: 'local' | 'national' | 'international';
  familyHarmony?: 'high' | 'moderate' | 'low';
}

export interface UserPreferences {
  communicationPreference: 'email' | 'phone' | 'in_app';
  languagePreference: string;
  planningApproach: 'detailed' | 'simplified' | 'guided';
  privacyLevel: 'open' | 'moderate' | 'private';
  decisionMaking: 'individual' | 'collaborative' | 'traditional';
}

export interface CulturalContext {
  primaryCulture?: string;
  religiousConsiderations?: string[];
  inheritanceCustoms?: string[];
  familyHierarchy?: 'egalitarian' | 'patriarchal' | 'matriarchal' | 'elder_led';
  collectivism?: 'individualistic' | 'collectivistic' | 'mixed';
  traditions?: string[];
}

export interface FamilySituation {
  structure: 'nuclear' | 'single_parent' | 'blended' | 'multigenerational' | 'childless' | 'empty_nest' | 'non_traditional';
  complexity: 'simple' | 'moderate' | 'complex';
  specialNeeds: string[];
  culturalConsiderations: string[];
  communicationStyle: 'direct' | 'gentle' | 'detailed' | 'simplified';
  keyConsiderations: string[];
  recommendedFeatures: string[];
  sensitivities: string[];
}

export interface FamilyInsight {
  type: 'structure' | 'need' | 'opportunity' | 'risk';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedActions?: string[];
}

export class FamilySituationAnalysisService {
  /**
   * Main analysis function that determines family situation and provides insights
   */
  static analyzeFamilySituation(
    familyData: FamilyData,
    userPreferences: UserPreferences,
    culturalContext: CulturalContext
  ): FamilySituation {
    const structure = this.determineStructure(familyData);
    const complexity = this.assessComplexity(familyData, structure);
    const specialNeeds = this.identifySpecialNeeds(familyData, culturalContext);
    const culturalConsiderations = this.identifyCulturalConsiderations(culturalContext, familyData);
    const communicationStyle = this.determineCommunicationStyle(
      userPreferences, 
      complexity, 
      familyData.familyHarmony
    );
    const keyConsiderations = this.generateKeyConsiderations(structure, familyData, specialNeeds);
    const recommendedFeatures = this.recommendFeatures(structure, specialNeeds, familyData);
    const sensitivities = this.identifySensitivities(familyData, structure, culturalContext);

    return {
      structure,
      complexity,
      specialNeeds,
      culturalConsiderations,
      communicationStyle,
      keyConsiderations,
      recommendedFeatures,
      sensitivities
    };
  }

  /**
   * Determine the primary family structure
   */
  private static determineStructure(familyData: FamilyData): FamilySituation['structure'] {
    const { maritalStatus, hasChildren, hasDependentParents, hasStepChildren, members } = familyData;

    // Single parent family
    if ((maritalStatus === 'single' || maritalStatus === 'divorced' || maritalStatus === 'widowed') && hasChildren) {
      return 'single_parent';
    }

    // Blended family
    if (hasStepChildren || (familyData.isPreviouslyMarried && hasChildren)) {
      return 'blended';
    }

    // Multigenerational family
    if (hasDependentParents || this.hasMultipleGenerations(members)) {
      return 'multigenerational';
    }

    // Childless couple
    if ((maritalStatus === 'married' || maritalStatus === 'partnered') && !hasChildren) {
      const averageAge = this.calculateAverageAge(members.filter(m => m.relationship === 'self' || m.relationship === 'spouse'));
      if (averageAge > 50) {
        return 'empty_nest';
      }
      return 'childless';
    }

    // Nuclear family
    if ((maritalStatus === 'married' || maritalStatus === 'partnered') && hasChildren) {
      return 'nuclear';
    }

    // Non-traditional arrangements
    return 'non_traditional';
  }

  /**
   * Assess the complexity of the family situation
   */
  private static assessComplexity(
    familyData: FamilyData, 
    structure: FamilySituation['structure']
  ): FamilySituation['complexity'] {
    let complexityScore = 0;

    // Structure complexity
    if (structure === 'blended' || structure === 'multigenerational') {
      complexityScore += 2;
    }

    // Special needs
    if (familyData.hasSpecialNeedsMembers) {
      complexityScore += 3;
    }

    // Previous marriages
    if (familyData.isPreviouslyMarried) {
      complexityScore += 1;
    }

    // Geographic spread
    if (familyData.geographicSpread === 'international') {
      complexityScore += 2;
    } else if (familyData.geographicSpread === 'national') {
      complexityScore += 1;
    }

    // Family harmony
    if (familyData.familyHarmony === 'low') {
      complexityScore += 2;
    }

    // Business ownership
    if (familyData.businessOwner) {
      complexityScore += 2;
    }

    // Number of dependents
    const dependentCount = familyData.members.filter(m => m.isDependent).length;
    if (dependentCount > 3) {
      complexityScore += 1;
    }

    if (complexityScore >= 5) return 'complex';
    if (complexityScore >= 2) return 'moderate';
    return 'simple';
  }

  /**
   * Identify special needs within the family
   */
  private static identifySpecialNeeds(
    familyData: FamilyData,
    culturalContext: CulturalContext
  ): string[] {
    const specialNeeds: string[] = [];

    // Special needs family members
    if (familyData.hasSpecialNeedsMembers) {
      specialNeeds.push('special_needs_planning');
      specialNeeds.push('long_term_care_planning');
      specialNeeds.push('special_needs_trust');
    }

    // Elder care
    if (familyData.hasDependentParents) {
      specialNeeds.push('elder_care_planning');
      specialNeeds.push('multi_generational_wealth_transfer');
    }

    // Military considerations
    if (familyData.militaryService) {
      specialNeeds.push('military_benefit_planning');
      specialNeeds.push('deployment_planning');
    }

    // Business succession
    if (familyData.businessOwner) {
      specialNeeds.push('business_succession');
      specialNeeds.push('key_person_planning');
    }

    // Young children
    if (familyData.childrenAges?.some(age => age < 5)) {
      specialNeeds.push('young_child_guardianship');
      specialNeeds.push('education_planning');
    }

    // Cultural specific needs
    if (culturalContext.inheritanceCustoms?.includes('islamic')) {
      specialNeeds.push('sharia_compliant_planning');
    }

    return specialNeeds;
  }

  /**
   * Identify cultural considerations
   */
  private static identifyCulturalConsiderations(
    culturalContext: CulturalContext,
    familyData: FamilyData
  ): string[] {
    const considerations: string[] = [];

    // Religious considerations
    if (culturalContext.religiousConsiderations?.length) {
      considerations.push(...culturalContext.religiousConsiderations);
    }

    // Family hierarchy
    if (culturalContext.familyHierarchy !== 'egalitarian') {
      considerations.push(`${culturalContext.familyHierarchy}_hierarchy`);
    }

    // Collectivism
    if (culturalContext.collectivism === 'collectivistic') {
      considerations.push('collective_decision_making');
      considerations.push('extended_family_obligations');
    }

    // Specific cultural customs
    if (culturalContext.traditions?.includes('filial_piety')) {
      considerations.push('elder_respect_obligations');
    }

    // Language considerations
    if (familyData.members.some(m => m.culturalRole === 'elder' && culturalContext.primaryCulture)) {
      considerations.push('multilingual_documentation');
    }

    return considerations;
  }

  /**
   * Determine appropriate communication style
   */
  private static determineCommunicationStyle(
    preferences: UserPreferences,
    complexity: FamilySituation['complexity'],
    familyHarmony?: string
  ): FamilySituation['communicationStyle'] {
    // User preference takes precedence
    if (preferences.planningApproach === 'simplified') {
      return 'simplified';
    }

    if (preferences.planningApproach === 'detailed') {
      return 'detailed';
    }

    // Adjust based on complexity and harmony
    if (complexity === 'complex' && familyHarmony === 'low') {
      return 'gentle'; // More careful communication for sensitive situations
    }

    if (complexity === 'simple') {
      return 'direct';
    }

    return 'detailed'; // Default for moderate complexity
  }

  /**
   * Generate key considerations for the family
   */
  private static generateKeyConsiderations(
    structure: FamilySituation['structure'],
    familyData: FamilyData,
    specialNeeds: string[]
  ): string[] {
    const considerations: string[] = [];

    // Structure-specific considerations
    switch (structure) {
      case 'single_parent':
        considerations.push('Robust guardian selection crucial');
        considerations.push('Build strong support network');
        considerations.push('Consider backup guardians');
        break;
      case 'blended':
        considerations.push('Clear beneficiary designations needed');
        considerations.push('Address step-relationships explicitly');
        considerations.push('Consider separate property agreements');
        break;
      case 'multigenerational':
        considerations.push('Balance needs across generations');
        considerations.push('Consider cultural expectations');
        considerations.push('Plan for elder care costs');
        break;
      case 'childless':
        considerations.push('Focus on spouse/partner protection');
        considerations.push('Consider charitable giving');
        considerations.push('Plan for pet care');
        break;
    }

    // Add special needs considerations
    if (specialNeeds.includes('special_needs_planning')) {
      considerations.push('Special needs trust essential');
      considerations.push('Detailed care instructions needed');
    }

    // Harmony considerations
    if (familyData.familyHarmony === 'low') {
      considerations.push('Extra clarity in documentation');
      considerations.push('Consider mediation clauses');
    }

    return considerations;
  }

  /**
   * Recommend features based on family situation
   */
  private static recommendFeatures(
    structure: FamilySituation['structure'],
    specialNeeds: string[],
    familyData: FamilyData
  ): string[] {
    const features: string[] = [];

    // Universal features
    features.push('family_communication_center');
    features.push('document_vault');

    // Structure-specific features
    switch (structure) {
      case 'single_parent':
        features.push('guardian_network_builder');
        features.push('emergency_contact_system');
        features.push('single_parent_resources');
        break;
      case 'blended':
        features.push('complex_beneficiary_manager');
        features.push('family_tree_visualizer');
        features.push('step_family_guidance');
        break;
      case 'multigenerational':
        features.push('multi_generation_planner');
        features.push('elder_care_resources');
        features.push('family_meeting_tools');
        break;
    }

    // Special needs features
    if (specialNeeds.includes('special_needs_planning')) {
      features.push('special_needs_trust_wizard');
      features.push('care_instruction_builder');
      features.push('government_benefit_tracker');
    }

    if (specialNeeds.includes('business_succession')) {
      features.push('business_succession_planner');
      features.push('buy_sell_agreement_tracker');
    }

    // Geographic features
    if (familyData.geographicSpread !== 'local') {
      features.push('remote_collaboration_tools');
      features.push('multi_jurisdiction_guidance');
    }

    return features;
  }

  /**
   * Identify potential sensitivities
   */
  private static identifySensitivities(
    familyData: FamilyData,
    structure: FamilySituation['structure'],
    culturalContext: CulturalContext
  ): string[] {
    const sensitivities: string[] = [];

    // Structure sensitivities
    if (structure === 'blended') {
      sensitivities.push('step_family_dynamics');
      sensitivities.push('previous_marriage_obligations');
    }

    if (structure === 'single_parent') {
      sensitivities.push('absent_parent_considerations');
      sensitivities.push('solo_responsibility_pressure');
    }

    // Harmony sensitivities
    if (familyData.familyHarmony === 'low') {
      sensitivities.push('family_conflict');
      sensitivities.push('inheritance_disputes');
    }

    // Cultural sensitivities
    if (culturalContext.familyHierarchy && culturalContext.familyHierarchy !== 'egalitarian') {
      sensitivities.push('traditional_role_expectations');
    }

    // Special circumstances
    if (familyData.hasSpecialNeedsMembers) {
      sensitivities.push('disability_planning_stress');
      sensitivities.push('long_term_care_concerns');
    }

    return sensitivities;
  }

  /**
   * Helper functions
   */
  private static hasMultipleGenerations(members: FamilyMember[]): boolean {
    const relationships = members.map(m => m.relationship);
    const hasParents = relationships.some(r => r.includes('parent'));
    const hasChildren = relationships.some(r => r.includes('child'));
    const hasGrandparents = relationships.some(r => r.includes('grandparent'));
    
    return (hasParents && hasChildren) || hasGrandparents;
  }

  private static calculateAverageAge(members: FamilyMember[]): number {
    const ages = members.filter(m => m.age).map(m => m.age!);
    if (ages.length === 0) return 40; // Default assumption
    return ages.reduce((sum, age) => sum + age, 0) / ages.length;
  }

  /**
   * Generate insights based on family situation
   */
  static generateFamilyInsights(situation: FamilySituation, familyData: FamilyData): FamilyInsight[] {
    const insights: FamilyInsight[] = [];

    // Structure insights
    insights.push({
      type: 'structure',
      title: this.getStructureInsightTitle(situation.structure),
      description: this.getStructureInsightDescription(situation.structure),
      priority: 'high',
      actionable: true,
      suggestedActions: this.getStructureActions(situation.structure)
    });

    // Special needs insights
    situation.specialNeeds.forEach(need => {
      insights.push({
        type: 'need',
        title: this.getSpecialNeedTitle(need),
        description: this.getSpecialNeedDescription(need),
        priority: 'high',
        actionable: true,
        suggestedActions: this.getSpecialNeedActions(need)
      });
    });

    // Opportunity insights
    if (situation.complexity === 'simple') {
      insights.push({
        type: 'opportunity',
        title: 'Streamlined Planning Available',
        description: 'Your family situation allows for straightforward planning. We can help you protect your family efficiently.',
        priority: 'medium',
        actionable: true,
        suggestedActions: ['Use quick setup wizard', 'Complete basic protection plan']
      });
    }

    // Risk insights
    situation.sensitivities.forEach(sensitivity => {
      insights.push({
        type: 'risk',
        title: this.getSensitivityTitle(sensitivity),
        description: this.getSensitivityDescription(sensitivity),
        priority: 'medium',
        actionable: true,
        suggestedActions: this.getSensitivityActions(sensitivity)
      });
    });

    return insights;
  }

  /**
   * Save family situation analysis
   */
  static async saveFamilySituation(
    userId: string,
    situation: FamilySituation,
    insights: FamilyInsight[]
  ): Promise<void> {
    try {
      await setDoc(doc(db, 'familySituations', userId), {
        ...situation,
        insights,
        analyzedAt: Timestamp.now(),
        version: '1.0'
      });
    } catch (error) {
      console.error('Error saving family situation:', error);
      throw error;
    }
  }

  /**
   * Helper methods for generating human-readable content
   */
  private static getStructureInsightTitle(structure: FamilySituation['structure']): string {
    const titles = {
      nuclear: 'Traditional Family Structure',
      single_parent: 'Single Parent Family',
      blended: 'Blended Family Dynamics',
      multigenerational: 'Multi-Generational Family',
      childless: 'Couple-Focused Planning',
      empty_nest: 'Empty Nest Planning',
      non_traditional: 'Unique Family Structure'
    };
    return titles[structure];
  }

  private static getStructureInsightDescription(structure: FamilySituation['structure']): string {
    const descriptions = {
      nuclear: 'Your traditional family structure benefits from standard protection planning with focus on children and spouse.',
      single_parent: 'As a single parent, creating a strong support network and detailed guardian plans is essential.',
      blended: 'Blended families need extra care in beneficiary designations and clear communication about intentions.',
      multigenerational: 'Planning across generations requires balancing different needs and cultural expectations.',
      childless: 'Focus on protecting each other and considering legacy beyond immediate family.',
      empty_nest: 'With children grown, it\'s time to update plans for this new life phase.',
      non_traditional: 'Your unique family structure deserves customized planning that fits your specific needs.'
    };
    return descriptions[structure];
  }

  private static getStructureActions(structure: FamilySituation['structure']): string[] {
    const actions = {
      nuclear: ['Create will', 'Name guardians', 'Set up life insurance'],
      single_parent: ['Build guardian network', 'Create detailed care instructions', 'Establish emergency fund'],
      blended: ['Clarify beneficiaries', 'Address step-relationships', 'Create family communication plan'],
      multigenerational: ['Balance generation needs', 'Plan elder care', 'Set up family meetings'],
      childless: ['Focus on spouse protection', 'Consider charitable giving', 'Plan for incapacity'],
      empty_nest: ['Update beneficiaries', 'Review retirement plans', 'Consider grandchildren'],
      non_traditional: ['Get customized advice', 'Create clear documentation', 'Build legal protections']
    };
    return actions[structure];
  }

  private static getSpecialNeedTitle(need: string): string {
    const titles: Record<string, string> = {
      special_needs_planning: 'Special Needs Family Member',
      elder_care_planning: 'Elder Care Considerations',
      military_benefit_planning: 'Military Family Benefits',
      business_succession: 'Business Succession Planning',
      young_child_guardianship: 'Young Children Protection'
    };
    return titles[need] || 'Special Consideration';
  }

  private static getSpecialNeedDescription(need: string): string {
    const descriptions: Record<string, string> = {
      special_needs_planning: 'Protecting a family member with special needs requires specialized trusts and detailed care planning.',
      elder_care_planning: 'Caring for aging parents involves financial planning and healthcare directives.',
      military_benefit_planning: 'Military families have unique benefits and planning considerations during service.',
      business_succession: 'Your business needs succession planning to protect your family and employees.',
      young_child_guardianship: 'Young children need carefully chosen guardians and detailed care instructions.'
    };
    return descriptions[need] || 'This situation requires specialized planning.';
  }

  private static getSpecialNeedActions(need: string): string[] {
    const actions: Record<string, string[]> = {
      special_needs_planning: ['Set up special needs trust', 'Document care requirements', 'Plan for government benefits'],
      elder_care_planning: ['Create elder care fund', 'Set up healthcare proxies', 'Discuss wishes with parents'],
      military_benefit_planning: ['Review military benefits', 'Plan for deployment', 'Update regularly'],
      business_succession: ['Create succession plan', 'Value business', 'Set up buy-sell agreement'],
      young_child_guardianship: ['Choose guardians', 'Create care instructions', 'Set up education fund']
    };
    return actions[need] || ['Get specialized advice'];
  }

  private static getSensitivityTitle(sensitivity: string): string {
    const titles: Record<string, string> = {
      step_family_dynamics: 'Blended Family Considerations',
      family_conflict: 'Family Harmony Challenges',
      disability_planning_stress: 'Special Needs Planning Complexity',
      traditional_role_expectations: 'Cultural Sensitivity Needed'
    };
    return titles[sensitivity] || 'Sensitive Consideration';
  }

  private static getSensitivityDescription(sensitivity: string): string {
    const descriptions: Record<string, string> = {
      step_family_dynamics: 'Navigate step-family relationships with clear communication and fair planning.',
      family_conflict: 'Low family harmony requires extra clarity and potentially neutral third parties.',
      disability_planning_stress: 'Planning for disabilities can be emotionally challenging but is critically important.',
      traditional_role_expectations: 'Balance cultural traditions with legal requirements and personal wishes.'
    };
    return descriptions[sensitivity] || 'This area requires careful consideration.';
  }

  private static getSensitivityActions(sensitivity: string): string[] {
    const actions: Record<string, string[]> = {
      step_family_dynamics: ['Communicate openly', 'Document clearly', 'Consider mediation'],
      family_conflict: ['Use clear language', 'Consider trustees', 'Get legal advice'],
      disability_planning_stress: ['Take it step by step', 'Get support', 'Focus on protection'],
      traditional_role_expectations: ['Honor traditions', 'Explain legal needs', 'Find balance']
    };
    return actions[sensitivity] || ['Proceed thoughtfully'];
  }
}
