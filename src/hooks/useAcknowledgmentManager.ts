import { useState, useEffect } from 'react';
import { detectAcknowledgmentMoments, getNextProtectionAreas } from '@/services/acknowledgmentTriggers';

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

interface AcknowledgmentMoment {
  trigger: string;
  type: 'foundation' | 'documentation' | 'completion' | 'responsibility_fulfilled';
  familyImpact: string;
  acknowledgmentMessage: string;
  confidenceBuilder: string;
}

export const useAcknowledgmentManager = (userProgress: UserProgress) => {
  const [currentAcknowledgment, setCurrentAcknowledgment] = useState<AcknowledgmentMoment | null>(null);
  const [acknowledgedTriggers, setAcknowledgedTriggers] = useState<Set<string>>(new Set());
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);
  
  useEffect(() => {
    // Detect new acknowledgment moments
    const moments = detectAcknowledgmentMoments(userProgress);
    
    // Find first unacknowledged moment
    const newMoment = moments.find(moment => !acknowledgedTriggers.has(moment.trigger));
    
    if (newMoment) {
      setCurrentAcknowledgment(newMoment);
      setShowAcknowledgment(true);
    }
  }, [userProgress, acknowledgedTriggers]);
  
  const acknowledgeCurrentMoment = () => {
    if (currentAcknowledgment) {
      setAcknowledgedTriggers(prev => new Set([...prev, currentAcknowledgment.trigger]));
      setShowAcknowledgment(false);
      setCurrentAcknowledgment(null);
    }
  };
  
  const getProtectionAreas = () => {
    return [
      {
        name: 'Financial Accounts',
        description: 'Bank accounts, investments, and financial contacts',
        isDocumented: userProgress.protectionAreas.financial,
        benefit: 'Your family can manage finances without searching for information'
      },
      {
        name: 'Medical Preferences',
        description: 'Healthcare wishes and medical contacts',
        isDocumented: userProgress.protectionAreas.medical,
        benefit: 'Healthcare providers will respect your documented wishes'
      },
      {
        name: 'Trusted Support Network',
        description: 'People who can help your family',
        isDocumented: userProgress.protectionAreas.trustedCircle,
        benefit: 'Your family has immediate access to knowledgeable helpers'
      },
      {
        name: 'Child Care Arrangements',
        description: 'Guardian designations and care instructions',
        isDocumented: userProgress.protectionAreas.childCare,
        benefit: 'Your children\'s care continues seamlessly with chosen guardians'
      },
      {
        name: 'Asset Distribution',
        description: 'Clear wishes for your possessions and assets',
        isDocumented: userProgress.protectionAreas.assets,
        benefit: 'No family conflicts about who receives what'
      }
    ];
  };
  
  const getRecommendedNextSteps = () => {
    return getNextProtectionAreas(userProgress);
  };
  
  return {
    currentAcknowledgment,
    showAcknowledgment,
    acknowledgeCurrentMoment,
    protectionAreas: getProtectionAreas(),
    recommendedNextSteps: getRecommendedNextSteps()
  };
};
