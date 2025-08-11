import type { EssentialAnswers } from './EssentialQuestions';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  category: 'document' | 'legal' | 'family' | 'security' | 'planning';
  estimatedTime: string;
  link?: string;
  reason: string;
}

export interface PersonalizedPlan {
  recommendations: Recommendation[];
  supportLevel: 'minimal' | 'moderate' | 'comprehensive' | 'professional';
  timeline: string;
  focusAreas: string[];
  reassurance: string;
}

export function generatePersonalizedPlan(answers: EssentialAnswers): PersonalizedPlan {
  const recommendations: Recommendation[] = [];
  let supportLevel: PersonalizedPlan['supportLevel'] = 'minimal';
  const focusAreas: string[] = [];
  
  // Determine support level based on comfort and timeline
  if (answers.comfortLevel === 'prefer_professional') {
    supportLevel = 'professional';
  } else if (answers.comfortLevel === 'need_guidance') {
    supportLevel = 'comprehensive';
  } else if (answers.comfortLevel === 'somewhat_comfortable') {
    supportLevel = 'moderate';
  } else {
    supportLevel = 'minimal';
  }

  // Document Organization Recommendations
  if (answers.documentStatus === 'not_started' || answers.documentStatus === 'scattered') {
    recommendations.push({
      id: 'organize-documents',
      title: 'Start Your Document Organization',
      description: answers.documentStatus === 'not_started' 
        ? 'Let\'s begin by creating a simple, secure system for your important documents. We\'ll start with the essentials.'
        : 'Let\'s bring your scattered documents together in one secure, organized place where your family can find them.',
      priority: 'immediate',
      category: 'document',
      estimatedTime: '30-45 minutes',
      link: '/vault',
      reason: 'Creating a central, secure location for documents is the foundation of family preparedness.'
    });
    focusAreas.push('Document Organization');
  } else if (answers.documentStatus === 'partially_organized') {
    recommendations.push({
      id: 'complete-organization',
      title: 'Complete Your Document System',
      description: 'You\'ve made a great start. Let\'s fill in the gaps and ensure nothing important is missing.',
      priority: 'high',
      category: 'document',
      estimatedTime: '20-30 minutes',
      link: '/vault',
      reason: 'Completing your document organization ensures your family has everything they need.'
    });
    focusAreas.push('Document Completion');
  }

  // Family Structure Specific Recommendations
  if (answers.familyStructure === 'young_children') {
    recommendations.push({
      id: 'guardian-designation',
      title: 'Designate Guardians for Your Children',
      description: 'Ensure your children will be cared for by people you trust. This is one of the most important decisions you can make.',
      priority: 'immediate',
      category: 'family',
      estimatedTime: '15-20 minutes',
      link: '/guardians',
      reason: 'Young children need designated guardians who can step in immediately if needed.'
    });
    focusAreas.push('Child Guardianship');
  } else if (answers.familyStructure === 'blended') {
    recommendations.push({
      id: 'family-instructions',
      title: 'Create Clear Family Instructions',
      description: 'With a blended family, clear instructions prevent confusion and ensure everyone is treated according to your wishes.',
      priority: 'high',
      category: 'family',
      estimatedTime: '30-40 minutes',
      link: '/instructions',
      reason: 'Blended families benefit from extra clarity to prevent misunderstandings.'
    });
    focusAreas.push('Family Clarity');
  } else if (answers.familyStructure === 'multi_generation') {
    recommendations.push({
      id: 'multi-gen-planning',
      title: 'Coordinate Multi-Generation Planning',
      description: 'Ensure care and support flows smoothly between generations, with clear roles and responsibilities.',
      priority: 'high',
      category: 'planning',
      estimatedTime: '45-60 minutes',
      link: '/planning',
      reason: 'Multi-generation families need coordinated planning to support everyone effectively.'
    });
    focusAreas.push('Multi-Generation Coordination');
  }

  // Primary Concern Specific Recommendations
  switch (answers.primaryConcern) {
    case 'family_clarity':
      recommendations.push({
        id: 'family-playbook',
        title: 'Create Your Family Playbook',
        description: 'Give your family a clear roadmap with step-by-step instructions for any situation.',
        priority: 'high',
        category: 'family',
        estimatedTime: '25-35 minutes',
        link: '/playbook',
        reason: 'Your family needs clear guidance to act confidently during difficult times.'
      });
      focusAreas.push('Family Guidance');
      break;
      
    case 'document_security':
      recommendations.push({
        id: 'secure-storage',
        title: 'Set Up Secure Document Storage',
        description: 'Protect your sensitive information with bank-level security while keeping it accessible to the right people.',
        priority: 'immediate',
        category: 'security',
        estimatedTime: '15-20 minutes',
        link: '/security',
        reason: 'Securing your documents protects your family from identity theft and fraud.'
      });
      focusAreas.push('Security Setup');
      break;
      
    case 'legal_validity':
      recommendations.push({
        id: 'legal-documents',
        title: 'Create Legally Valid Documents',
        description: 'Ensure your wishes are legally binding with properly executed documents.',
        priority: 'immediate',
        category: 'legal',
        estimatedTime: '45-60 minutes',
        link: '/legal',
        reason: 'Legal validity ensures your wishes will be honored and reduces family conflicts.'
      });
      focusAreas.push('Legal Documentation');
      break;
      
    case 'emergency_access':
      recommendations.push({
        id: 'emergency-system',
        title: 'Set Up Emergency Access',
        description: 'Create a system that gives trusted people immediate access when truly needed.',
        priority: 'immediate',
        category: 'security',
        estimatedTime: '20-25 minutes',
        link: '/emergency',
        reason: 'Emergency access ensures help is available when time is critical.'
      });
      focusAreas.push('Emergency Preparedness');
      break;
      
    case 'privacy_control':
      recommendations.push({
        id: 'privacy-settings',
        title: 'Configure Privacy Controls',
        description: 'You decide who sees what and when. Set up granular privacy controls for complete peace of mind.',
        priority: 'high',
        category: 'security',
        estimatedTime: '15-20 minutes',
        link: '/privacy',
        reason: 'Privacy controls ensure sensitive information is only shared appropriately.'
      });
      focusAreas.push('Privacy Management');
      break;
  }

  // Support Network Recommendations
  if (answers.supportNetwork === 'building_network' || answers.supportNetwork === 'family_only') {
    recommendations.push({
      id: 'trusted-contacts',
      title: 'Build Your Trusted Network',
      description: answers.supportNetwork === 'building_network'
        ? 'Let\'s identify and add trusted people who can support your family when needed.'
        : 'Consider adding a few trusted non-family members for additional support and perspective.',
      priority: 'medium',
      category: 'family',
      estimatedTime: '10-15 minutes',
      link: '/contacts',
      reason: 'A strong support network provides multiple layers of help for your family.'
    });
  }

  // Timeline-based priority adjustments
  if (answers.timelinePreference === 'ready_now') {
    recommendations.forEach(rec => {
      if (rec.priority === 'medium') rec.priority = 'high';
      if (rec.priority === 'high') rec.priority = 'immediate';
    });
  } else if (answers.timelinePreference === 'just_exploring') {
    recommendations.forEach(rec => {
      if (rec.priority === 'immediate') rec.priority = 'high';
      if (rec.priority === 'high') rec.priority = 'medium';
    });
  }

  // Sort recommendations by priority
  const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Generate timeline message
  let timeline = '';
  switch (answers.timelinePreference) {
    case 'ready_now':
      timeline = 'Let\'s get started right away with your most important tasks.';
      break;
    case 'next_month':
      timeline = 'We\'ll help you prepare everything over the next few weeks.';
      break;
    case 'this_year':
      timeline = 'Take your time - we\'ll guide you through everything at your own pace.';
      break;
    case 'just_exploring':
      timeline = 'Explore at your leisure - we\'re here whenever you\'re ready.';
      break;
  }

  // Generate reassurance message based on answers
  let reassurance = '';
  if (answers.documentStatus === 'not_started') {
    reassurance = 'Starting is often the hardest part, but you\'ve already taken that step. We\'ll guide you through everything.';
  } else if (answers.comfortLevel === 'need_guidance' || answers.comfortLevel === 'prefer_professional') {
    reassurance = 'You don\'t have to figure this out alone. We\'ll provide all the guidance and support you need.';
  } else if (answers.familyStructure === 'young_children') {
    reassurance = 'You\'re taking important steps to protect your children\'s future. That\'s what great parents do.';
  } else {
    reassurance = 'You\'re on the right path to giving your family security and peace of mind.';
  }

  return {
    recommendations: recommendations.slice(0, 5), // Limit to top 5 to avoid overwhelming
    supportLevel,
    timeline,
    focusAreas: focusAreas.slice(0, 3), // Top 3 focus areas
    reassurance
  };
}

export function getTaskEstimate(answers: EssentialAnswers): { 
  totalTime: string; 
  tasksCount: number; 
  complexity: 'simple' | 'moderate' | 'complex' 
} {
  const plan = generatePersonalizedPlan(answers);
  
  // Calculate total time
  let totalMinutes = 0;
  plan.recommendations.forEach(rec => {
    const match = rec.estimatedTime.match(/(\d+)-(\d+)/);
    if (match) {
      totalMinutes += (parseInt(match[1]) + parseInt(match[2])) / 2;
    }
  });
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalTime = hours > 0 
    ? `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`
    : `${totalMinutes} minutes`;
    
  // Determine complexity
  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
  if (answers.familyStructure === 'blended' || answers.familyStructure === 'multi_generation') {
    complexity = 'complex';
  } else if (answers.documentStatus === 'not_started' || answers.comfortLevel === 'need_guidance') {
    complexity = 'moderate';
  }
  
  return {
    totalTime,
    tasksCount: plan.recommendations.length,
    complexity
  };
}
