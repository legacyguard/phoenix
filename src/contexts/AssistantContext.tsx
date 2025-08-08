import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Home, FileText, Users, Briefcase, Heart, 
  FileCheck, Coffee
} from 'lucide-react';
import type { AssistantMessage, Recommendation } from '@/components/assistant/PersonalAssistant';
import { 
  AssistantContext, 
  type EmotionalState, 
  type UserProgress, 
  type AssistantContextType 
} from './AssistantContextType';

// Re-export types and context for convenience
export { AssistantContext, type EmotionalState, type UserProgress } from './AssistantContextType';

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation('assistant');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentContext, setCurrentContext] = useState('dashboard');
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalActions: 0,
    completedAreas: [],
    currentStreak: 0,
    lastActivity: null,
    assetsCount: 0,
    documentsCount: 0,
    trustedPeopleCount: 0,
    willCompleted: false
  });
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('starting');

  // Load user progress from localStorage or API
  useEffect(() => {
    if (user) {
      const savedProgress = localStorage.getItem(`userProgress_${user.id}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setUserProgress({
          ...progress,
          lastActivity: progress.lastActivity ? new Date(progress.lastActivity) : null
        });
      }
    }
  }, [user]);

  // Analyze emotional state based on progress and activity
  useEffect(() => {
    const analyzeEmotionalState = () => {
      const { totalActions, lastActivity, completedAreas } = userProgress;
      
      // Check if user hasn't been active recently
      if (lastActivity) {
        const daysSinceLastActivity = Math.floor(
          (new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastActivity > 7) {
          setEmotionalState('starting');
          return;
        }
      }
      
      // Check progress level
      if (totalActions === 0) {
        setEmotionalState('starting');
      } else if (totalActions < 5 && completedAreas.length === 0) {
        setEmotionalState('overwhelmed');
      } else if (completedAreas.length >= 3) {
        setEmotionalState('accomplished');
      } else {
        setEmotionalState('progressing');
      }
    };

    analyzeEmotionalState();
  }, [userProgress]);

  const updateContext = useCallback((context: string) => {
    setCurrentContext(context);
  }, []);

  const trackProgress = useCallback((action: string, area?: string) => {
    setUserProgress(prev => {
      const updated = {
        ...prev,
        totalActions: prev.totalActions + 1,
        lastActivity: new Date(),
        completedAreas: area && !prev.completedAreas.includes(area) 
          ? [...prev.completedAreas, area]
          : prev.completedAreas
      };
      
      // Save to localStorage
      if (user) {
        localStorage.setItem(`userProgress_${user.id}`, JSON.stringify(updated));
      }
      
      return updated;
    });
  }, [user]);

  const getPersonalizedMessage = useCallback((): AssistantMessage => {
    const { totalActions, lastActivity, assetsCount, documentsCount, trustedPeopleCount } = userProgress;
    
    // Welcome messages
    if (totalActions === 0) {
      return {
        type: 'welcome',
        content: t('welcome.firstTime'),
        icon: Heart
      };
    }
    
    // Check if returning after break
    if (lastActivity) {
      const daysSince = Math.floor(
        (new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSince > 14) {
        return {
          type: 'welcome',
          content: t('welcome.afterBreak'),
          icon: Heart
        };
      }
    }
    
    // Context-specific messages
    switch (currentContext) {
      case 'dashboard':
        if (totalActions < 3) {
          return {
            type: 'guidance',
            content: t('contextual.dashboard.empty'),
            icon: Home
          };
        } else if (userProgress.completedAreas.length >= 2) {
          return {
            type: 'encouragement',
            content: t('contextual.dashboard.progress'),
            icon: Heart
          };
        }
        break;
        
      case 'assets':
        if (assetsCount === 0) {
          return {
            type: 'guidance',
            content: t('contextual.assets.firstAsset'),
            icon: Briefcase
          };
        } else if (assetsCount < 3) {
          return {
            type: 'encouragement',
            content: t('contextual.assets.addingMore'),
            icon: Briefcase
          };
        }
        break;
        
      case 'family':
        if (trustedPeopleCount === 0) {
          return {
            type: 'guidance',
            content: t('contextual.family.noTrustedPeople'),
            icon: Users
          };
        } else {
          return {
            type: 'encouragement',
            content: t('contextual.family.addingPeople'),
            icon: Heart
          };
        }
        break;
        
      case 'documents':
        if (documentsCount === 0) {
          return {
            type: 'guidance',
            content: t('contextual.documents.firstUpload'),
            icon: FileText
          };
        }
        break;
    }
    
    // Emotional state messages
    if (emotionalState === 'overwhelmed') {
      return {
        type: 'support',
        content: t('emotional.overwhelmed.message'),
        icon: Coffee,
        actionSuggestion: {
          text: t('actions.supportive.takeBreak'),
          action: () => {},
          priority: 'high'
        }
      };
    }
    
    // Default encouraging message
    return {
      type: 'encouragement',
      content: t('welcome.returning'),
      icon: Heart
    };
  }, [currentContext, userProgress, emotionalState, t]);

  const getSuggestions = useCallback((): Recommendation[] => {
    const suggestions: Recommendation[] = [];
    const { assetsCount, documentsCount, trustedPeopleCount, willCompleted } = userProgress;
    
    // Priority 1: Emergency contacts
    if (trustedPeopleCount === 0) {
      suggestions.push({
        id: 'add-trusted-person',
        title: 'Add Your First Helper',
        description: t('suggestions.smart.basedOnAnswers'),
        timeEstimate: t('guidance.timeEstimates.quick'),
        priority: 'high',
        familyBenefit: t('guidance.familyBenefit.immediate'),
        action: () => navigate('/family'),
        icon: Users
      });
    }
    
    // Priority 2: Critical documents
    if (documentsCount === 0) {
      suggestions.push({
        id: 'upload-documents',
        title: 'Upload Important Documents',
        description: 'Your family needs to know where to find important papers',
        timeEstimate: t('guidance.timeEstimates.moderate'),
        priority: 'high',
        familyBenefit: t('guidance.familyBenefit.immediate'),
        action: () => navigate('/documents'),
        icon: FileText
      });
    }
    
    // Priority 3: Assets
    if (assetsCount < 3) {
      suggestions.push({
        id: 'add-assets',
        title: assetsCount === 0 ? 'Add Your First Asset' : 'Add More Assets',
        description: 'Help your family understand what you own and where it is',
        timeEstimate: t('guidance.timeEstimates.quick'),
        priority: assetsCount === 0 ? 'high' : 'medium',
        familyBenefit: t('guidance.familyBenefit.planning'),
        action: () => navigate('/assets'),
        icon: Briefcase
      });
    }
    
    // Priority 4: Will
    if (!willCompleted && userProgress.totalActions > 5) {
      suggestions.push({
        id: 'create-will',
        title: 'Create Your Will',
        description: 'Make your wishes clear and legally binding',
        timeEstimate: t('guidance.timeEstimates.involved'),
        priority: 'medium',
        familyBenefit: t('guidance.familyBenefit.peace'),
        action: () => navigate('/will'),
        icon: FileCheck
      });
    }
    
    // Limit suggestions based on emotional state
    if (emotionalState === 'overwhelmed') {
      return suggestions.slice(0, 1); // Just one suggestion when overwhelmed
    } else if (emotionalState === 'starting') {
      return suggestions.slice(0, 2); // Two suggestions for beginners
    }
    
    return suggestions.slice(0, 3); // Max 3 suggestions
  }, [userProgress, emotionalState, t, navigate]);

  const contextValue = {
    currentContext,
    userProgress,
    emotionalState,
    updateContext,
    trackProgress,
    getPersonalizedMessage,
    getSuggestions
  };

  return (
    <AssistantContext.Provider value={contextValue}>
      {children}
    </AssistantContext.Provider>
  );
};
