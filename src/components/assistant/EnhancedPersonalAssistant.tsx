import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Sparkles, Clock, CheckCircle, AlertCircle, Coffee, Users, Shield, FileCheck, TrendingUp, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAssistant } from '@/hooks/useAssistant';
import { AssistantAvatar } from './AssistantAvatar';
import { AssistantMessage } from './AssistantMessage';
import { AssistantActions } from './AssistantActions';
import { TaskItem } from '@/components/onboarding/OnboardingWizard';

export interface EnhancedMessage {
  type: 'welcome' | 'guidance' | 'encouragement' | 'celebration' | 'support';
  content: string;
  icon?: React.ElementType;
  personalizedContent?: string;
  actionSuggestion?: {
    text: string;
    action: () => void;
    priority: 'low' | 'medium' | 'high';
  };
}

export interface PersonalizedRecommendation {
  id: string;
  title: string;
  description: string;
  timeEstimate: string;
  priority: 'high' | 'medium' | 'low';
  familyBenefit: string;
  action: () => void;
  icon?: React.ElementType;
  personalContext?: string;
}

// Types for next objective and onboarding answers
interface NextObjective {
  type?: string;
  title?: string;
  description?: string;
  actionUrl?: string;
  estimatedTime?: string;
}

interface OnboardingAnswers {
  familyDependency?: 'spouse_children' | 'family_would_struggle' | string;
  preparednessLevel?: 'not_sure' | 'know_but_scattered' | string;
  familyVulnerability?: 'documents_passwords' | 'financial_situation' | string;
  primaryResponsibility?: 'aging_parents' | 'business_family' | 'family_security' | string;
  [key: string]: unknown; // Allow for additional fields
}

interface EnhancedPersonalAssistantProps {
  currentPage: string;
  contextData: {
    completionScore?: number;
    currentStage?: string;
    nextObjective?: NextObjective;
    criticalGaps?: string[];
    onboardingAnswers?: OnboardingAnswers;
    tasks?: TaskItem[];
  };
  className?: string;
  compact?: boolean;
}

export const EnhancedPersonalAssistant: React.FC<EnhancedPersonalAssistantProps> = ({ 
  currentPage, 
  contextData,
  className,
  compact = false 
}) => {
  const { t } = useTranslation('assistant');
  const { 
    userProgress, 
    emotionalState, 
    updateEmotionalState,
    updateContext 
  } = useAssistant();
  
  const [currentMessage, setCurrentMessage] = useState<EnhancedMessage | null>(null);
  const [suggestions, setSuggestions] = useState<PersonalizedRecommendation[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const generatePersonalizedMessage = useCallback((): EnhancedMessage => {
    const { completionScore = 0, tasks = [], onboardingAnswers } = contextData;
    
    // Default message
    let message: EnhancedMessage = {
      type: 'guidance',
      content: t('messages.default.welcome'),
      icon: Heart
    };

    // Personalize based on onboarding answers
    if (onboardingAnswers) {
      const { familyDependency, preparednessLevel, familyVulnerability, primaryResponsibility } = onboardingAnswers;
      
      // Family dependency based messages
      if (familyDependency === 'spouse_children') {
        message.personalizedContent = "I see your spouse and children rely on you for everything. Let's make sure they're protected even when you can't be there.";
      } else if (familyDependency === 'family_would_struggle') {
        message.personalizedContent = "Since your family would struggle without your guidance, let's create a clear roadmap they can follow.";
      }

      // Preparedness level based messages
      if (preparednessLevel === 'not_sure' && completionScore < 25) {
        message = {
          type: 'support',
          content: "I understand things feel scattered right now. Let's start with one simple step to get you organized.",
          icon: Coffee,
          personalizedContent: "Don't worry about not knowing where everything is - we'll tackle it together, one item at a time."
        };
      } else if (preparednessLevel === 'know_but_scattered' && completionScore < 50) {
        message = {
          type: 'guidance',
          content: "You know what you have, which is great! Now let's bring it all together in one secure place.",
          icon: FileCheck,
          personalizedContent: "Since your information is spread across different locations, our priority is centralizing everything for easy family access."
        };
      }

      // Vulnerability based messages
      if (familyVulnerability === 'documents_passwords') {
        message.personalizedContent = "Since finding documents and passwords would be hardest for your family, let's start by organizing those first.";
      } else if (familyVulnerability === 'financial_situation') {
        message.personalizedContent = "I noticed you're concerned about your family understanding your finances. Let's create a clear financial overview they can easily follow.";
      }

      // Primary responsibility based messages
      if (primaryResponsibility === 'aging_parents') {
        message.personalizedContent = "Taking care of aging parents is a big responsibility. Let's ensure both their needs and your family's future are well-documented.";
      } else if (primaryResponsibility === 'business_family') {
        message.personalizedContent = "Running a business that supports your family requires special planning. Let's protect both your business and family interests.";
      }
    }

    // Task-specific messages
    if (tasks && tasks.length > 0) {
      const priorityTasks = tasks.filter(t => t.priority === 'high' && !t.completed);
      if (priorityTasks.length > 0) {
        const task = priorityTasks[0];
        if (task.id === 'document-centralization') {
          message.actionSuggestion = {
            text: "Start organizing documents",
            action: () => window.location.href = task.link || '/vault',
            priority: 'high'
          };
        } else if (task.id === 'guardian-instructions') {
          message.actionSuggestion = {
            text: "Add your first guardian",
            action: () => window.location.href = task.link || '/guardians',
            priority: 'high'
          };
        }
      }
    }

    // Progress-based emotional messages
    if (completionScore >= 75) {
      message = {
        type: 'celebration',
        content: "You're doing amazing! Your family's protection plan is nearly complete.",
        icon: Sparkles,
        personalizedContent: message.personalizedContent
      };
      updateEmotionalState('confident');
    } else if (completionScore >= 50) {
      message = {
        type: 'encouragement',
        content: "Great progress! You're over halfway to complete peace of mind.",
        icon: CheckCircle,
        personalizedContent: message.personalizedContent
      };
      updateEmotionalState('hopeful');
    } else if (completionScore >= 25) {
      updateEmotionalState('progressing');
    } else {
      updateEmotionalState('overwhelmed');
    }

    return message;
  }, [contextData, t, updateEmotionalState]);

  const generatePersonalizedSuggestions = useCallback((): PersonalizedRecommendation[] => {
    const { tasks = [], onboardingAnswers } = contextData;
    const suggestions: PersonalizedRecommendation[] = [];

    // Add task-based suggestions
    tasks.forEach(task => {
      if (!task.completed) {
        let personalContext = '';
        let icon: React.ElementType = FileCheck;
        let familyBenefit = task.description;

        // Personalize based on task type and onboarding answers
        if (task.id === 'document-centralization') {
          icon = FileCheck;
          if (onboardingAnswers?.familyVulnerability === 'documents_passwords') {
            personalContext = "This directly addresses your concern about your family finding important documents.";
            familyBenefit = "Your family will know exactly where to find everything they need, reducing stress during difficult times.";
          }
        } else if (task.id === 'guardian-instructions') {
          icon = Shield;
          if (onboardingAnswers?.familyDependency === 'spouse_children') {
            personalContext = "Essential since your spouse and children rely on you for everything.";
            familyBenefit = "Ensures someone trustworthy can step in to help your family when needed.";
          }
        } else if (task.id === 'bank-account' || task.id === 'education-fund') {
          icon = TrendingUp;
          if (onboardingAnswers?.primaryResponsibility === 'family_security') {
            personalContext = "Aligns with your goal of providing for your family's future security.";
            familyBenefit = "Secures your family's financial future and ensures they can maintain their lifestyle.";
          }
        } else if (task.id === 'will-preparation') {
          icon = FileCheck;
          if (onboardingAnswers?.familyClarity === 'never_discussed') {
            personalContext = "Since this hasn't been discussed with your family, documenting it is crucial.";
            familyBenefit = "Prevents family conflicts and ensures your wishes are clearly understood.";
          }
        } else if (task.id === 'personal-messages') {
          icon = Heart;
          personalContext = "Leave meaningful messages that your family will treasure forever.";
          familyBenefit = "Provides comfort and guidance to your loved ones when they need it most.";
        }

        suggestions.push({
          id: task.id,
          title: task.title,
          description: task.description,
          timeEstimate: task.priority === 'high' ? '15-30 min' : '30-60 min',
          priority: task.priority,
          familyBenefit,
          personalContext,
          icon,
          action: () => window.location.href = task.link || '/'
        });
      }
    });

    // Add additional personalized suggestions based on onboarding answers
    if (onboardingAnswers?.primaryResponsibility === 'business_family' && !tasks.find(t => t.id === 'business-succession')) {
      suggestions.push({
        id: 'business-succession',
        title: 'Create Business Succession Plan',
        description: 'Ensure your business continues to support your family',
        timeEstimate: '1-2 hours',
        priority: 'medium',
        familyBenefit: 'Protects your family\'s income source and preserves your legacy',
        personalContext: 'Critical for business owners to ensure continuity',
        icon: Briefcase,
        action: () => window.location.href = '/business-planning'
      });
    }

    if (onboardingAnswers?.familyDependency === 'aging_parents' && !tasks.find(t => t.id === 'parent-care')) {
      suggestions.push({
        id: 'parent-care',
        title: 'Document Parent Care Plans',
        description: 'Organize your parents\' care instructions and preferences',
        timeEstimate: '45 min',
        priority: 'medium',
        familyBenefit: 'Ensures consistent care for your parents if you\'re unavailable',
        personalContext: 'You mentioned caring for aging parents is a key responsibility',
        icon: Heart,
        action: () => window.location.href = '/family-care'
      });
    }

    // Sort by priority
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, 3); // Show top 3 suggestions
  }, [contextData]);

  useEffect(() => {
    updateContext(currentPage);
    
    // Simulate typing delay for more human feel
    setIsTyping(true);
    const timer = setTimeout(() => {
      setCurrentMessage(generatePersonalizedMessage());
      setSuggestions(generatePersonalizedSuggestions());
      setIsTyping(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [currentPage, contextData, updateContext, generatePersonalizedMessage, generatePersonalizedSuggestions]);

  const getEmotionalIcon = () => {
    switch (emotionalState) {
      case 'overwhelmed':
        return Coffee;
      case 'confident':
        return CheckCircle;
      case 'hopeful':
        return Sparkles;
      case 'anxious':
        return AlertCircle;
      default:
        return Heart;
    }
  };

  return (
    <Card className={cn(
      "enhanced-personal-assistant",
      "bg-gradient-to-br from-warm-sage/10 via-background to-warm-cream/10",
      "border-warm-sage/20",
      "shadow-xl",
      compact && "p-4",
      !compact && "p-6",
      className
    )}>
      <div className="flex items-start gap-4">
        <AssistantAvatar 
          emotion={emotionalState} 
          icon={getEmotionalIcon()}
          compact={compact}
        />
        
        <div className="flex-1 space-y-4">
          {currentMessage && (
            <div className="space-y-2">
              <AssistantMessage 
                message={{
                  type: currentMessage.type,
                  content: currentMessage.content,
                  icon: currentMessage.icon
                }} 
                isTyping={isTyping}
                compact={compact}
              />
              {currentMessage.personalizedContent && !isTyping && (
                <p className="text-sm text-muted-foreground italic pl-4 border-l-2 border-warm-sage/30">
                  {currentMessage.personalizedContent}
                </p>
              )}
              {currentMessage.actionSuggestion && !isTyping && (
                <div className="mt-3">
                  <Button
                    onClick={currentMessage.actionSuggestion.action}
                    size="sm"
                    className={cn(
                      "bg-warm-sage hover:bg-warm-sage/90",
                      currentMessage.actionSuggestion.priority === 'high' && "animate-pulse"
                    )}
                  >
                    {currentMessage.actionSuggestion.text}
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {!compact && suggestions.length > 0 && !isTyping && (
            <div className="space-y-3 mt-6">
              <h4 className="text-sm font-medium text-muted-foreground">
                {emotionalState === 'overwhelmed' 
                  ? "Let's start with just one thing:"
                  : "Here's what would help your family most:"}
              </h4>
              {suggestions.map((suggestion) => (
                <Card 
                  key={suggestion.id} 
                  className="p-4 hover:shadow-md transition-all cursor-pointer border-warm-sage/10 hover:border-warm-sage/30"
                  onClick={suggestion.action}
                >
                  <div className="flex items-start gap-3">
                    {suggestion.icon && (
                      <div className="p-2 rounded-lg bg-warm-sage/10 text-warm-sage">
                        <suggestion.icon className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm">{suggestion.title}</h5>
                        <span className="text-xs text-muted-foreground">{suggestion.timeEstimate}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      {suggestion.personalContext && (
                        <p className="text-xs text-warm-sage italic">{suggestion.personalContext}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="font-medium">Family benefit:</span> {suggestion.familyBenefit}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {/* Quick emotional support actions */}
          {emotionalState === 'overwhelmed' && !compact && (
            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-warm-sage"
                onClick={() => {/* Handle break */}}
              >
                <Coffee className="mr-2 h-4 w-4" />
                {t('actions.supportive.takeBreak')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-warm-sage"
                onClick={() => {/* Handle help */}}
              >
                <Heart className="mr-2 h-4 w-4" />
                {t('actions.supportive.getHelp')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
