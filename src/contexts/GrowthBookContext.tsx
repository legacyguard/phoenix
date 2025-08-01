// src/contexts/GrowthBookContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GrowthBook } from '@growthbook/growthbook-react';
import { useAuth } from './AuthContext';
import { analytics } from '../services/analytics';
import { FEATURE_FLAGS } from '../config/featureFlags';

interface GrowthBookContextType {
  growthbook: GrowthBook | null;
  experiments: Record<string, {
    variation: number;
    value: unknown;
  }>;
}

const GrowthBookContext = createContext<GrowthBookContextType>({
  growthbook: null,
  experiments: {}
});

interface GrowthBookProviderProps {
  children: ReactNode;
  growthbook: GrowthBook;
}

export const EnhancedGrowthBookProvider: React.FC<GrowthBookProviderProps> = ({ 
  children, 
  growthbook 
}) => {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<Record<string, {
    variation: number;
    value: unknown;
  }>>({});

  useEffect(() => {
    // Update GrowthBook attributes when user changes
    if (user) {
      growthbook.setAttributes({
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        plan: user.user_metadata?.plan || 'free',
        onboardingCompleted: user.user_metadata?.onboarding_completed || false,
        // Add more attributes for better targeting
      });
    }
  }, [user, growthbook]);

  useEffect(() => {
     
    // Load feature flags from configuration
    const features: Record<string, unknown> = {};
    Object.entries(FEATURE_FLAGS).forEach(([key, config]) => {
      features[key] = config.defaultValue;
    });
    
    growthbook.setFeatures(features);
  }, [growthbook]);

  useEffect(() => {
    // Track experiment views and conversions
    growthbook.setTrackingCallback((experiment, result) => {
      console.log('Experiment tracked:', experiment, result);
      
      // Send to analytics
      analytics.track('experiment_viewed', {
        experiment_id: experiment.key,
        variation_id: result.variationId,
        value: result.value,
      });

      // Update local experiments state
      setExperiments(prev => ({
        ...prev,
        [experiment.key]: {
          variation: result.variationId,
          value: result.value,
        }
      }));
    });
  }, [growthbook]);

  return (
    <GrowthBookContext.Provider value={{ growthbook, experiments }}>
      {children}
    </GrowthBookContext.Provider>
  );
};
