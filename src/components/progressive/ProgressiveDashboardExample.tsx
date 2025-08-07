import React, { useState, useEffect } from 'react';
import { ProgressiveDashboard } from '@/components/progressive/ProgressiveDashboard';
import { UserProgress } from '@/services/progressiveDisclosure';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Check } from 'lucide-react';

/**
 * Example component demonstrating the Progressive Disclosure Dashboard
 * This shows how to integrate the dashboard with user progress tracking
 */
export const ProgressiveDashboardExample: React.FC = () => {
  // Load user progress from localStorage or initialize default
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      return JSON.parse(savedProgress);
    }
    
    // Default progress for new users
    return {
      completedItems: 0,
      unlockedFeatures: [],
      currentEmotionalState: 'neutral',
      familyStructure: {
        hasSpouse: true,
        hasChildren: true,
        childrenAges: ['school-age']
      },
      introducedFeatures: [],
      acknowledgedMilestones: []
    };
  });

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
  }, [userProgress]);

  // Simulate completing a task
  const completeTask = () => {
    setUserProgress(prev => ({
      ...prev,
      completedItems: prev.completedItems + 1
    }));
  };

  // Handle feature access
  const handleFeatureAccess = (featureId: string) => {
    setUserProgress(prev => ({
      ...prev,
      introducedFeatures: [...(prev.introducedFeatures || []), featureId],
      unlockedFeatures: prev.unlockedFeatures.includes(featureId) 
        ? prev.unlockedFeatures 
        : [...prev.unlockedFeatures, featureId]
    }));
    console.log(`User accessed feature: ${featureId}`);
    // Here you would typically navigate to the feature or open it
  };

  // Handle milestone acknowledgment
  const handleMilestoneAcknowledged = (milestoneId: string) => {
    setUserProgress(prev => ({
      ...prev,
      acknowledgedMilestones: [...(prev.acknowledgedMilestones || []), milestoneId]
    }));
    console.log(`User acknowledged milestone: ${milestoneId}`);
  };

  // Update emotional state (example)
  const updateEmotionalState = (state: 'anxious' | 'neutral' | 'confident') => {
    setUserProgress(prev => ({
      ...prev,
      currentEmotionalState: state
    }));
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Demo controls */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
          <CardDescription>
            Simulate user actions to see how the progressive disclosure system responds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={completeTask} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Complete Task
            </Button>
            <span className="text-sm text-muted-foreground">
              Tasks completed: {userProgress.completedItems}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Emotional State:</span>
            <Button
              variant={userProgress.currentEmotionalState === 'anxious' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateEmotionalState('anxious')}
            >
              Anxious
            </Button>
            <Button
              variant={userProgress.currentEmotionalState === 'neutral' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateEmotionalState('neutral')}
            >
              Neutral
            </Button>
            <Button
              variant={userProgress.currentEmotionalState === 'confident' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateEmotionalState('confident')}
            >
              Confident
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setUserProgress({
                completedItems: 0,
                unlockedFeatures: [],
                currentEmotionalState: 'neutral',
                familyStructure: {
                  hasSpouse: true,
                  hasChildren: true,
                  childrenAges: ['school-age']
                },
                introducedFeatures: [],
                acknowledgedMilestones: []
              });
            }}
          >
            Reset Progress
          </Button>
        </CardContent>
      </Card>

      {/* Progressive Disclosure Dashboard */}
      <ProgressiveDashboard
        userProgress={userProgress}
        onFeatureAccess={handleFeatureAccess}
        onMilestoneAcknowledged={handleMilestoneAcknowledged}
      />

      {/* Feature status display */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Access Log</CardTitle>
          <CardDescription>
            Features that have been introduced to the user
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userProgress.introducedFeatures && userProgress.introducedFeatures.length > 0 ? (
            <div className="space-y-2">
              {userProgress.introducedFeatures.map(featureId => (
                <div key={featureId} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{featureId}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No features accessed yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
