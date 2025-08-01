import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

// Types
type PreparednessLevel = 'high' | 'medium' | 'low';
type FamilyFocus = 'spouse' | 'children' | 'parents' | 'business';
type UrgencyLevel = 'immediate' | 'moderate' | 'planning';
type ComplexityLevel = 'basic' | 'intermediate' | 'advanced';

export interface UserContext {
  preparednessLevel: PreparednessLevel;
  familyFocus: FamilyFocus;
  urgencyLevel: UrgencyLevel;
  complexityLevel: ComplexityLevel;
}

export interface QuestionOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface Question {
  id: string;
  text: string;
  subtext?: string;
  options: QuestionOption[];
  type: 'primary' | 'followup' | 'contextual';
  category?: string;
}

export interface QuestionFlow {
  questionId: string;
  nextQuestions: {
    [answerValue: string]: string | null;
  };
  contextModifiers: {
    [answerValue: string]: Partial<UserContext>;
  };
  completionTriggers?: {
    [answerValue: string]: boolean;
  };
}

export interface ProgressiveQuestionLogicProps {
  onComplete: (answers: Record<string, string>, context: UserContext) => void;
  onProgress?: (progress: number) => void;
  initialContext?: Partial<UserContext>;
}

// Question definitions
const QUESTIONS: Record<string, Question> = {
  // Primary questions
  'family-reliance': {
    id: 'family-reliance',
    text: "Who depends on you the most?",
    subtext: "Understanding your responsibilities helps us prioritize what matters",
    type: 'primary',
    options: [
      { value: 'spouse-children', label: 'My spouse and children rely on me for everything' },
      { value: 'business-partners', label: 'My business partners and employees count on me' },
      { value: 'aging-parents', label: 'I help care for aging parents or relatives' },
      { value: 'self-focused', label: "It's mainly just me I need to plan for" }
    ]
  },
  
  // Follow-up questions for spouse-children path
  'spouse-challenge': {
    id: 'spouse-challenge',
    text: "What would be most challenging for your spouse to handle alone?",
    subtext: "We'll focus on making this easier for them",
    type: 'followup',
    category: 'family',
    options: [
      { value: 'finances', label: 'Managing our finances and investments' },
      { value: 'legal-insurance', label: 'Dealing with insurance and legal matters' },
      { value: 'children-decisions', label: 'Making major decisions about the children' },
      { value: 'business-work', label: 'Handling business or work responsibilities' }
    ]
  },
  
  // Follow-up questions for organization path
  'organization-status': {
    id: 'organization-status',
    text: "How organized are your important documents right now?",
    subtext: "Be honest - we're here to help, not judge",
    type: 'primary',
    options: [
      { value: 'very-organized', label: 'Everything is documented and easy to find' },
      { value: 'somewhat-organized', label: 'Most things are in place, but some gaps exist' },
      { value: 'not-organized', label: "I'm not sure where everything is" },
      { value: 'no-system', label: "There's no real system - it's all in my head" }
    ]
  },
  
  'organization-priority': {
    id: 'organization-priority',
    text: "What's the most important thing you need to get organized first?",
    subtext: "Let's start with what would make the biggest difference",
    type: 'followup',
    category: 'organization',
    options: [
      { value: 'documents', label: 'Important documents (insurance, legal papers)' },
      { value: 'accounts', label: 'Financial account information and passwords' },
      { value: 'contacts', label: 'Contact information for advisors and professionals' },
      { value: 'instructions', label: 'Instructions for handling emergencies' }
    ]
  },
  
  'document-timeline': {
    id: 'document-timeline',
    text: "How much time do you think your family would need to find everything?",
    subtext: "This helps us understand the urgency",
    type: 'followup',
    category: 'organization',
    options: [
      { value: 'hours', label: 'A few hours if they knew where to look' },
      { value: 'days', label: 'Several days of searching through everything' },
      { value: 'weeks', label: 'Weeks or months to piece it all together' },
      { value: 'never', label: 'They might never find some important things' }
    ]
  },
  
  // Business-focused follow-ups
  'business-structure': {
    id: 'business-structure',
    text: "What's your role in the business?",
    subtext: "This helps us understand succession planning needs",
    type: 'followup',
    category: 'business',
    options: [
      { value: 'sole-owner', label: "I'm the sole owner and decision maker" },
      { value: 'majority-owner', label: "I'm the majority owner with partners" },
      { value: 'equal-partner', label: "I'm an equal partner in the business" },
      { value: 'key-employee', label: "I'm a key employee but not an owner" }
    ]
  },
  
  // Advanced preparedness questions
  'optimization-focus': {
    id: 'optimization-focus',
    text: "What aspect of your planning would you like to strengthen?",
    subtext: "Even good plans can be better",
    type: 'contextual',
    category: 'advanced',
    options: [
      { value: 'tax-efficiency', label: 'Tax efficiency and wealth preservation' },
      { value: 'business-continuity', label: 'Business continuity planning' },
      { value: 'family-communication', label: 'Family preparation and communication' },
      { value: 'scenario-planning', label: 'Planning for unexpected scenarios' }
    ]
  },
  
  // Low preparedness questions
  'first-step': {
    id: 'first-step',
    text: "What feels like the most manageable first step?",
    subtext: "Small steps lead to big progress",
    type: 'contextual',
    category: 'basic',
    options: [
      { value: 'list-accounts', label: 'Make a list of all my accounts' },
      { value: 'gather-documents', label: 'Gather important documents in one place' },
      { value: 'talk-spouse', label: 'Have a conversation with my spouse' },
      { value: 'find-advisor', label: 'Find a trusted advisor to help' }
    ]
  }
};

// Question flow definitions
const QUESTION_FLOWS: QuestionFlow[] = [
  {
    questionId: 'family-reliance',
    nextQuestions: {
      'spouse-children': 'spouse-challenge',
      'business-partners': 'business-structure',
      'aging-parents': 'organization-status',
      'self-focused': 'organization-status'
    },
    contextModifiers: {
      'spouse-children': { familyFocus: 'spouse', urgencyLevel: 'immediate' },
      'business-partners': { familyFocus: 'business', complexityLevel: 'advanced' },
      'aging-parents': { familyFocus: 'parents', urgencyLevel: 'moderate' },
      'self-focused': { urgencyLevel: 'planning' }
    }
  },
  {
    questionId: 'spouse-challenge',
    nextQuestions: {
      'finances': 'organization-status',
      'legal-insurance': 'organization-status',
      'children-decisions': 'organization-status',
      'business-work': 'business-structure'
    },
    contextModifiers: {
      'finances': { complexityLevel: 'intermediate' },
      'legal-insurance': { complexityLevel: 'intermediate' },
      'children-decisions': { familyFocus: 'children' },
      'business-work': { familyFocus: 'business', complexityLevel: 'advanced' }
    }
  },
  {
    questionId: 'organization-status',
    nextQuestions: {
      'very-organized': 'optimization-focus',
      'somewhat-organized': 'organization-priority',
      'not-organized': 'organization-priority',
      'no-system': 'first-step'
    },
    contextModifiers: {
      'very-organized': { preparednessLevel: 'high' },
      'somewhat-organized': { preparednessLevel: 'medium' },
      'not-organized': { preparednessLevel: 'low' },
      'no-system': { preparednessLevel: 'low', urgencyLevel: 'immediate' }
    }
  },
  {
    questionId: 'organization-priority',
    nextQuestions: {
      'documents': 'document-timeline',
      'accounts': 'document-timeline',
      'contacts': 'document-timeline',
      'instructions': 'document-timeline'
    },
    contextModifiers: {
      'documents': { complexityLevel: 'basic' },
      'accounts': { complexityLevel: 'intermediate' },
      'contacts': { complexityLevel: 'basic' },
      'instructions': { urgencyLevel: 'immediate' }
    }
  },
  {
    questionId: 'document-timeline',
    nextQuestions: {
      'hours': null,
      'days': null,
      'weeks': null,
      'never': null
    },
    contextModifiers: {
      'hours': { preparednessLevel: 'medium' },
      'days': { preparednessLevel: 'low' },
      'weeks': { preparednessLevel: 'low', urgencyLevel: 'immediate' },
      'never': { preparednessLevel: 'low', urgencyLevel: 'immediate' }
    },
    completionTriggers: {
      'hours': true,
      'days': true,
      'weeks': true,
      'never': true
    }
  },
  {
    questionId: 'business-structure',
    nextQuestions: {
      'sole-owner': 'organization-status',
      'majority-owner': 'organization-status',
      'equal-partner': 'organization-status',
      'key-employee': 'organization-status'
    },
    contextModifiers: {
      'sole-owner': { complexityLevel: 'advanced', urgencyLevel: 'immediate' },
      'majority-owner': { complexityLevel: 'advanced' },
      'equal-partner': { complexityLevel: 'intermediate' },
      'key-employee': { complexityLevel: 'basic' }
    }
  },
  {
    questionId: 'optimization-focus',
    nextQuestions: {
      'tax-efficiency': null,
      'business-continuity': null,
      'family-communication': null,
      'scenario-planning': null
    },
    contextModifiers: {
      'tax-efficiency': { complexityLevel: 'advanced' },
      'business-continuity': { complexityLevel: 'advanced', familyFocus: 'business' },
      'family-communication': { familyFocus: 'spouse' },
      'scenario-planning': { complexityLevel: 'advanced' }
    },
    completionTriggers: {
      'tax-efficiency': true,
      'business-continuity': true,
      'family-communication': true,
      'scenario-planning': true
    }
  },
  {
    questionId: 'first-step',
    nextQuestions: {
      'list-accounts': null,
      'gather-documents': null,
      'talk-spouse': null,
      'find-advisor': null
    },
    contextModifiers: {
      'list-accounts': { complexityLevel: 'basic' },
      'gather-documents': { complexityLevel: 'basic' },
      'talk-spouse': { familyFocus: 'spouse' },
      'find-advisor': { complexityLevel: 'intermediate' }
    },
    completionTriggers: {
      'list-accounts': true,
      'gather-documents': true,
      'talk-spouse': true,
      'find-advisor': true
    }
  }
];

const ProgressiveQuestionLogic: React.FC<ProgressiveQuestionLogicProps> = ({
  onComplete,
  onProgress,
  initialContext = {}
}) => {
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('family-reliance');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionHistory, setQuestionHistory] = useState<string[]>(['family-reliance']);
  const [isComplete, setIsComplete] = useState(false);
  const [userContext, setUserContext] = useState<UserContext>({
    preparednessLevel: 'medium',
    familyFocus: 'spouse',
    urgencyLevel: 'moderate',
    complexityLevel: 'basic',
    ...initialContext
  });

  const currentQuestion = QUESTIONS[currentQuestionId];
  const currentFlow = QUESTION_FLOWS.find(flow => flow.questionId === currentQuestionId);
  const maxQuestions = 8; // Maximum questions to maintain engagement
  const progress = Math.min((questionHistory.length / maxQuestions) * 100, 100);

  useEffect(() => {
    if (onProgress) {
      onProgress(progress);
    }
  }, [progress, onProgress]);

  const handleAnswer = useCallback((answerValue: string) => {
    // Record the answer
    const newAnswers = { ...answers, [currentQuestionId]: answerValue };
    setAnswers(newAnswers);

    if (!currentFlow) {
      console.error('No flow found for question:', currentQuestionId);
      return;
    }

    // Update context if needed
    const contextUpdate = currentFlow.contextModifiers[answerValue];
    if (contextUpdate) {
      setUserContext(prev => ({ ...prev, ...contextUpdate }));
    }

    // Check for completion
    const shouldComplete = currentFlow.completionTriggers?.[answerValue] || 
                          questionHistory.length >= maxQuestions;
    
    if (shouldComplete) {
      setIsComplete(true);
      onComplete(newAnswers, { ...userContext, ...contextUpdate });
      return;
    }

    // Get next question
    const nextQuestionId = currentFlow.nextQuestions[answerValue];
    if (nextQuestionId) {
      setCurrentQuestionId(nextQuestionId);
      setQuestionHistory([...questionHistory, nextQuestionId]);
    } else {
      // No more questions - complete the flow
      setIsComplete(true);
      onComplete(newAnswers, { ...userContext, ...contextUpdate });
    }
  }, [currentQuestionId, currentFlow, answers, questionHistory, userContext, onComplete]);

  const getProgressMessage = () => {
    const count = questionHistory.length;
    if (count <= 2) return "We're learning about your situation...";
    if (count <= 4) return "This helps us understand your priorities...";
    if (count <= 6) return "Based on what you've told us...";
    return "One more question to get this right...";
  };

  const getContextualIcon = (option: QuestionOption) => {
    // Add contextual icons based on answer implications
    if (option.value.includes('organized') || option.value.includes('hours')) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (option.value.includes('never') || option.value.includes('no-system')) {
      return <AlertCircle className="w-5 h-5 text-amber-600" />;
    }
    return <ChevronRight className="w-5 h-5 text-gray-400" />;
  };

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thank you for your responses
        </h2>
        <p className="text-gray-600">
          We're creating your personalized action plan...
        </p>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {getProgressMessage()}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current question */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {currentQuestion.text}
        </h3>
        {currentQuestion.subtext && (
          <p className="text-gray-600">
            {currentQuestion.subtext}
          </p>
        )}
      </div>

      {/* Answer options */}
      <div className="space-y-3">
        {currentQuestion.options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAnswer(option.value)}
            className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-800 group-hover:text-blue-700">
                {option.label}
              </span>
              {option.icon || getContextualIcon(option)}
            </div>
          </button>
        ))}
      </div>

      {/* Question type indicator */}
      <div className="mt-6 text-center">
        <span className="text-sm text-gray-500">
          {currentQuestion.type === 'primary' && 'Core Question'}
          {currentQuestion.type === 'followup' && 'Follow-up Question'}
          {currentQuestion.type === 'contextual' && 'Contextual Question'}
        </span>
      </div>
    </div>
  );
};

export default ProgressiveQuestionLogic;

