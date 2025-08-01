import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, AlertCircle, CheckCircle, TrendingUp, Users, Clock } from 'lucide-react';
import { 
  UserContext, 
  QuestionOption, 
  Question, 
  QuestionFlow,
  ProgressiveQuestionLogicProps 
} from './ProgressiveQuestionLogic';
import { flowAnalytics, flowOptimizer } from './progressiveQuestionAnalytics';

// Extended props to include analytics
interface ProgressiveQuestionLogicWithAnalyticsProps extends ProgressiveQuestionLogicProps {
  enableAnalytics?: boolean;
  onAnalyticsEvent?: (eventType: string, data: any) => void;
  showDebugInfo?: boolean;
}

// Question definitions with enhanced metadata
const ENHANCED_QUESTIONS: Record<string, Question> = {
  // Primary questions with emotional hooks
  'family-reliance': {
    id: 'family-reliance',
    text: "When you think about your family's future, who depends on you the most?",
    subtext: "This helps us understand what matters most to you",
    type: 'primary',
    options: [
      { 
        value: 'spouse-children', 
        label: 'My spouse and children rely on me for everything',
        icon: <Users className="w-5 h-5 text-blue-600" />
      },
      { 
        value: 'business-partners', 
        label: 'My business partners and employees count on me',
        icon: <TrendingUp className="w-5 h-5 text-green-600" />
      },
      { 
        value: 'aging-parents', 
        label: 'I help care for aging parents or relatives',
        icon: <AlertCircle className="w-5 h-5 text-amber-600" />
      },
      { 
        value: 'self-focused', 
        label: "It's mainly just me I need to plan for",
        icon: <CheckCircle className="w-5 h-5 text-gray-600" />
      }
    ]
  },
  
  // Enhanced follow-up questions
  'spouse-challenge': {
    id: 'spouse-challenge',
    text: "If something happened to you tomorrow, what would be the hardest thing for your spouse to handle?",
    subtext: "We'll create a plan to make this easier",
    type: 'followup',
    category: 'family',
    options: [
      { 
        value: 'finances', 
        label: 'Understanding our finances and paying the bills' 
      },
      { 
        value: 'legal-insurance', 
        label: 'Dealing with insurance claims and legal paperwork' 
      },
      { 
        value: 'children-decisions', 
        label: 'Making important decisions about our children\'s future' 
      },
      { 
        value: 'business-work', 
        label: 'Managing my business or work responsibilities' 
      }
    ]
  },
  
  // Time-sensitive follow-ups
  'urgency-assessment': {
    id: 'urgency-assessment',
    text: "When do you want to have everything organized and protected?",
    subtext: "There's no wrong answer - we'll work with your timeline",
    type: 'contextual',
    category: 'planning',
    options: [
      { 
        value: 'asap', 
        label: 'As soon as possible - I\'ve been putting this off',
        icon: <Clock className="w-5 h-5 text-red-600" />
      },
      { 
        value: 'months', 
        label: 'In the next few months - I want to do this right' 
      },
      { 
        value: 'year', 
        label: 'Within the year - I\'m planning ahead' 
      },
      { 
        value: 'eventually', 
        label: 'Eventually - I\'m just exploring options' 
      }
    ]
  },
  
  // Emotional reassurance questions
  'confidence-builder': {
    id: 'confidence-builder',
    text: "What would give you the most peace of mind?",
    subtext: "Let's focus on what will help you sleep better at night",
    type: 'contextual',
    category: 'emotional',
    options: [
      { 
        value: 'family-prepared', 
        label: 'Knowing my family won\'t struggle if something happens' 
      },
      { 
        value: 'everything-documented', 
        label: 'Having everything documented and easy to find' 
      },
      { 
        value: 'professional-help', 
        label: 'Having professionals ready to help my family' 
      },
      { 
        value: 'control-maintained', 
        label: 'Maintaining control over important decisions' 
      }
    ]
  }
};

// Dynamic question generator based on context
class DynamicQuestionGenerator {
  generateContextualQuestion(context: UserContext, previousAnswers: Record<string, string>): Question | null {
    // Generate questions based on detected patterns
    if (context.preparednessLevel === 'low' && context.urgencyLevel === 'immediate') {
      return {
        id: 'quick-win',
        text: "Let's start small. What can you do this week?",
        subtext: "Small steps lead to big results",
        type: 'contextual',
        category: 'action',
        options: [
          { value: 'list-passwords', label: 'Write down my important passwords' },
          { value: 'find-documents', label: 'Gather my important documents' },
          { value: 'talk-family', label: 'Talk to my family about my wishes' },
          { value: 'call-advisor', label: 'Schedule a call with an advisor' }
        ]
      };
    }
    
    if (context.familyFocus === 'children' && !previousAnswers['children-age']) {
      return {
        id: 'children-age',
        text: "How old are your children?",
        subtext: "This helps us tailor our recommendations",
        type: 'contextual',
        category: 'family',
        options: [
          { value: 'young', label: 'Under 10 - they still need everything' },
          { value: 'teens', label: 'Teenagers - planning for college soon' },
          { value: 'adults', label: 'Adults - but I still worry about them' },
          { value: 'mixed', label: 'Different ages - each with different needs' }
        ]
      };
    }
    
    return null;
  }
}

const ProgressiveQuestionLogicWithAnalytics: React.FC<ProgressiveQuestionLogicWithAnalyticsProps> = ({
  onComplete,
  onProgress,
  initialContext = {},
  enableAnalytics = true,
  onAnalyticsEvent,
  showDebugInfo = false
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
  const [showInsight, setShowInsight] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<string>('');

  const questionGenerator = new DynamicQuestionGenerator();
  const questions = { ...ENHANCED_QUESTIONS };
  
  // Add dynamically generated questions
  const dynamicQuestion = questionGenerator.generateContextualQuestion(userContext, answers);
  if (dynamicQuestion) {
    questions[dynamicQuestion.id] = dynamicQuestion;
  }

  const currentQuestion = questions[currentQuestionId];
  const maxQuestions = 8;
  const progress = Math.min((questionHistory.length / maxQuestions) * 100, 100);

  // Track question view
  useEffect(() => {
    if (enableAnalytics && currentQuestionId) {
      flowAnalytics.trackQuestionView(currentQuestionId);
      if (onAnalyticsEvent) {
        onAnalyticsEvent('question_viewed', { questionId: currentQuestionId });
      }
    }
  }, [currentQuestionId, enableAnalytics, onAnalyticsEvent]);

  // Update progress
  useEffect(() => {
    if (onProgress) {
      onProgress(progress);
    }
  }, [progress, onProgress]);

  // Generate contextual insights
  const generateInsight = useCallback((answer: string, questionId: string) => {
    const insights: Record<string, Record<string, string>> = {
      'spouse-challenge': {
        'finances': "You're not alone - 60% of spouses struggle with financial decisions after loss.",
        'legal-insurance': "Smart thinking - having clear documentation saves months of stress.",
        'children-decisions': "Protecting your children's future is what great parents do.",
        'business-work': "Your business legacy deserves protection too."
      },
      'organization-status': {
        'very-organized': "Excellent! Let's make your good system even better.",
        'somewhat-organized': "You're ahead of most people - let's fill those gaps.",
        'not-organized': "Recognizing this is the first step to peace of mind.",
        'no-system': "Many successful people are in the same boat - we'll fix this together."
      }
    };
    
    return insights[questionId]?.[answer] || '';
  }, []);

  const handleAnswer = useCallback((answerValue: string) => {
    // Track analytics
    if (enableAnalytics) {
      flowAnalytics.trackAnswer(currentQuestionId, answerValue, userContext);
      if (onAnalyticsEvent) {
        onAnalyticsEvent('answer_selected', {
          questionId: currentQuestionId,
          answer: answerValue,
          context: userContext
        });
      }
    }

    // Show insight for certain questions
    const insight = generateInsight(answerValue, currentQuestionId);
    if (insight) {
      setCurrentInsight(insight);
      setShowInsight(true);
      setTimeout(() => setShowInsight(false), 3000);
    }

    // Record the answer
    const newAnswers = { ...answers, [currentQuestionId]: answerValue };
    setAnswers(newAnswers);

    // Get flow definition (simplified for this example)
    const shouldComplete = questionHistory.length >= maxQuestions;
    
    if (shouldComplete) {
      setIsComplete(true);
      if (enableAnalytics) {
        flowAnalytics.trackCompletion(questionHistory, userContext);
      }
      onComplete(newAnswers, userContext);
      return;
    }

    // Determine next question using optimizer if available
    let nextQuestionId: string | null = null;
    
    if (enableAnalytics) {
      nextQuestionId = flowOptimizer.getOptimalNextQuestion(userContext, questionHistory);
    }
    
    // Fall back to dynamic generation if no optimized path
    if (!nextQuestionId) {
      const dynamicQ = questionGenerator.generateContextualQuestion(userContext, newAnswers);
      if (dynamicQ && !questionHistory.includes(dynamicQ.id)) {
        nextQuestionId = dynamicQ.id;
      }
    }
    
    // Default to a simple flow if nothing else works
    if (!nextQuestionId) {
      const defaultFlow: Record<string, string> = {
        'family-reliance': 'spouse-challenge',
        'spouse-challenge': 'organization-status',
        'organization-status': 'urgency-assessment',
        'urgency-assessment': 'confidence-builder'
      };
      nextQuestionId = defaultFlow[currentQuestionId] || null;
    }

    if (nextQuestionId && !questionHistory.includes(nextQuestionId)) {
      setCurrentQuestionId(nextQuestionId);
      setQuestionHistory([...questionHistory, nextQuestionId]);
    } else {
      // Complete if no valid next question
      setIsComplete(true);
      if (enableAnalytics) {
        flowAnalytics.trackCompletion(questionHistory, userContext);
      }
      onComplete(newAnswers, userContext);
    }
  }, [
    currentQuestionId, 
    answers, 
    questionHistory, 
    userContext, 
    onComplete, 
    enableAnalytics, 
    onAnalyticsEvent,
    generateInsight,
    questionGenerator
  ]);

  const getProgressMessage = () => {
    const count = questionHistory.length;
    if (count <= 2) return "Getting to know your situation...";
    if (count <= 4) return "Understanding your priorities...";
    if (count <= 6) return "Almost there...";
    return "Final details...";
  };

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Great job! We have what we need.
        </h2>
        <p className="text-gray-600">
          Creating your personalized action plan...
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

      {/* Insight message */}
      {showInsight && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
          <p className="text-blue-800">{currentInsight}</p>
        </div>
      )}

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
              {option.icon || <ChevronRight className="w-5 h-5 text-gray-400" />}
            </div>
          </button>
        ))}
      </div>

      {/* Debug info */}
      {showDebugInfo && (
        <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <p>Current Question: {currentQuestionId}</p>
          <p>Questions Asked: {questionHistory.length}</p>
          <p>Context: {JSON.stringify(userContext, null, 2)}</p>
          <p>Answers: {JSON.stringify(answers, null, 2)}</p>
        </div>
      )}
    </div>
  );
};

export default ProgressiveQuestionLogicWithAnalytics;
