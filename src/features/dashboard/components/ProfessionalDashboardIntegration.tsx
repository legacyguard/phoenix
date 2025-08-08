import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { ProgressService } from '@/services/ProgressService';
import { ProfessionalDashboard } from '@/components/dashboard';
import ProfessionalFlowManager from '@/components/auth/ProfessionalFlowManager';
import { RespectfulOnboarding, OnboardingData } from '@/components/onboarding/RespectfulOnboarding';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAssistant } from '@/hooks/useAssistant';
import { EnhancedPersonalAssistant } from '@/components/assistant/EnhancedPersonalAssistant';
import AnnualReview from '@/components/AnnualReview';
import LegalConsultationModal from '@/components/LegalConsultationModal';
import { 
  Shield, 
  Info, 
  RefreshCw,
  FileText,
  Users,
  Heart,
  Building
} from 'lucide-react';

interface DashboardProps {
  // Optional props for testing or specific configurations
  forceOnboarding?: boolean;
  initialView?: 'dashboard' | 'onboarding' | 'review';
}

const ProfessionalDashboardIntegration: React.FC<DashboardProps> = ({ 
  forceOnboarding = false,
  initialView = 'dashboard' 
}) => {
  const { t } = useTranslation(['dashboard', 'onboarding']);
  const { user } = useAuth();
  const { updateProgress, updateEmotionalState } = useAssistant();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  type ProgressStatus = {
    completionScore?: number;
    completedItems?: Array<{ id?: string; title?: string; name?: string; description?: string; type?: string; estimatedTime?: number }>;
    pendingItems?: Array<{ id?: string; title?: string; name?: string; description?: string; type?: string; estimatedTime?: number; priority?: string; isCritical?: boolean; isFoundational?: boolean }>;
    criticalGaps?: Array<{ id?: string; title?: string; name?: string; description?: string; type?: string; estimatedTime?: number }>;
  } | null;

  type Task = {
    id: string;
    title: string;
    description?: string;
    category: string;
    priority: 'immediate' | 'high' | 'medium' | 'low' | 'completed';
    completed: boolean;
    estimatedTime: number;
    pillar: string;
  };

  const [progressStatus, setProgressStatus] = useState<ProgressStatus>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [showAnnualReview, setShowAnnualReview] = useState(false);
  const [showLegalConsultation, setShowLegalConsultation] = useState(false);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [completionScore, setCompletionScore] = useState(0);

  // Initialize dashboard based on user state
  useEffect(() => {
    const initializeDashboard = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check for stored onboarding data
        const storedOnboardingKey = `onboarding_data_${user.id}`;
        const storedData = localStorage.getItem(storedOnboardingKey);
        
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            setOnboardingData(parsed);
          } catch (e) {
            console.error('Failed to parse onboarding data:', e);
          }
        }

        // Check for force onboarding in URL params (development/testing)
        const urlParams = new URLSearchParams(window.location.search);
        const urlForceOnboarding = urlParams.get('onboarding') === 'true';
        
        if (forceOnboarding || urlForceOnboarding) {
          // Force onboarding flow for testing
          setLoading(false);
          return;
        }

        // Fetch user's progress status
        const status = await ProgressService.getProgressStatus(user.id);
        
        if (status) {
          setProgressStatus(status);
          setCompletionScore(status.completionScore || 0);
          
          // Convert progress items to tasks format
          const tasks = convertProgressToTasks(status);
          setUserTasks(tasks);
          
          // Update assistant context with professional terminology
          updateProgress({
            completionPercentage: status.completionScore,
            currentStage: getProfessionalStage(status.completionScore),
            tasksCompleted: status.completedItems?.length || 0,
            totalTasks: (status.completedItems?.length || 0) + (status.pendingItems?.length || 0)
          });
          
          // Set emotional state using supportive approach
          updateEmotionalState(getSupportiveEmotionalState(status.completionScore));
        }
        
        // Check if annual review is needed
        checkAnnualReviewStatus();
        
      } catch (err) {
        console.error('Dashboard initialization error:', err);
        setError(t('dashboard:errors.initializationFailed'));
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [user, forceOnboarding, convertProgressToTasks, updateProgress, updateEmotionalState, checkAnnualReviewStatus, t]);

  // Convert progress status to task format for ProfessionalDashboard
  const convertProgressToTasks = useCallback((status: NonNullable<ProgressStatus>) => {
    const tasks: Task[] = [];
    
    // Add completed items as completed tasks
    if (status.completedItems) {
      status.completedItems.forEach((item) => {
        tasks.push({
          id: item.id || `completed-${tasks.length}`,
          title: item.title || item.name,
          description: item.description,
          category: mapToCategory(item.type),
          priority: 'completed',
          completed: true,
          estimatedTime: item.estimatedTime || 5,
          pillar: mapToPillar(item.type)
        });
      });
    }
    
    // Add pending items as tasks
    if (status.pendingItems) {
      status.pendingItems.forEach((item) => {
        tasks.push({
          id: item.id || `pending-${tasks.length}`,
          title: item.title || item.name,
          description: item.description,
          category: mapToCategory(item.type),
          priority: determinePriority(item, status.completionScore),
          completed: false,
          estimatedTime: item.estimatedTime || 10,
          pillar: mapToPillar(item.type)
        });
      });
    }
    
    // Add critical gaps as high priority tasks
    if (status.criticalGaps) {
      status.criticalGaps.forEach((gap) => {
        tasks.push({
          id: gap.id || `gap-${tasks.length}`,
          title: gap.title || gap.name,
          description: gap.description || t('dashboard:tasks.criticalGap'),
          category: mapToCategory(gap.type),
          priority: 'immediate',
          completed: false,
          estimatedTime: gap.estimatedTime || 15,
          pillar: 'secure'
        });
      });
    }
    
    return tasks;
  }, [t, mapToCategory, mapToPillar, determinePriority]);

  // Map item types to professional categories
  const mapToCategory = useCallback((type: string): string => {
    const categoryMap: Record<string, string> = {
      'document': 'documents',
      'guardian': 'family',
      'asset': 'financial',
      'beneficiary': 'legal',
      'will': 'legal',
      'insurance': 'financial',
      'medical': 'documents',
      'security': 'security'
    };
    return categoryMap[type?.toLowerCase()] || 'other';
  }, []);

  // Map item types to pillars
  const mapToPillar = useCallback((type: string): string => {
    const pillarMap: Record<string, string> = {
      'document': 'organize',
      'guardian': 'secure',
      'asset': 'transfer',
      'beneficiary': 'transfer',
      'will': 'secure',
      'insurance': 'secure',
      'medical': 'organize',
      'security': 'secure'
    };
    return pillarMap[type?.toLowerCase()] || 'organize';
  }, []);

  // Determine task priority based on completion score and item type
  const determinePriority = useCallback((item: { isCritical?: boolean; priority?: string; isFoundational?: boolean }, completionScore: number): Task['priority'] => {
    if (item.isCritical || item.priority === 'critical') return 'immediate';
    if (completionScore < 25 && item.isFoundational) return 'high';
    if (completionScore < 50) return 'high';
    if (completionScore < 75) return 'medium';
    return 'low';
  }, []);

  // Get professional stage name based on completion
  const getProfessionalStage = (score: number): string => {
    if (score < 25) return 'Foundation';
    if (score < 50) return 'Building';
    if (score < 75) return 'Strengthening';
    if (score < 90) return 'Comprehensive';
    return 'Maintained';
  };

  // Get supportive emotional state (no gamification)
  const getSupportiveEmotionalState = (score: number): string => {
    if (score < 25) return 'starting';
    if (score < 50) return 'progressing';
    if (score < 75) return 'confident';
    return 'secure';
  };

  // Check if annual review is needed
  const checkAnnualReviewStatus = useCallback(() => {
    const lastReviewKey = `last_annual_review_${user?.id}`;
    const lastReview = localStorage.getItem(lastReviewKey);
    
    if (lastReview) {
      const lastReviewDate = new Date(lastReview);
      const monthsSinceReview = (Date.now() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      // Suggest annual review if it's been more than 11 months
      if (monthsSinceReview > 11) {
        // We'll show a gentle reminder in the dashboard
        console.log('Annual review recommended');
      }
    }
  }, [user]);

  // Handle onboarding completion
  const handleOnboardingComplete = (data: OnboardingData) => {
    setOnboardingData(data);
    
    // Convert onboarding data to tasks
    const tasks = generateTasksFromOnboarding(data);
    setUserTasks(tasks);
    
    // Store onboarding completion
    const onboardingKey = `onboarding_data_${user?.id}`;
    localStorage.setItem(onboardingKey, JSON.stringify(data));
    
    // Update progress
    updateProgress({
      completionPercentage: 0,
      currentStage: 'Foundation',
      tasksCompleted: 0,
      totalTasks: tasks.length
    });
  };

  // Generate tasks from onboarding data
  const generateTasksFromOnboarding = (data: OnboardingData): Task[] => {
    const tasks: Task[] = [];
    
    // Add document-related tasks
    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((doc, index) => {
        tasks.push({
          id: `doc-${index}`,
          title: t('dashboard:tasks.reviewDocument', { name: doc.name }),
          description: t('dashboard:tasks.documentReviewDesc'),
          category: 'documents',
          priority: 'high',
          completed: false,
          estimatedTime: 5,
          pillar: 'organize'
        });
      });
    }
    
    // Add recommendation-based tasks
    if (data.recommendations) {
      data.recommendations.forEach((rec) => {
        tasks.push({
          id: rec.id,
          title: rec.title,
          description: rec.description,
          category: rec.category,
          priority: rec.priority === 'critical' ? 'immediate' : rec.priority,
          completed: false,
          estimatedTime: parseInt(rec.estimatedTime) || 10,
          pillar: mapToPillar(rec.category)
        });
      });
    }
    
    return tasks;
  };

  // Handle annual review
  const handleStartAnnualReview = () => {
    setShowAnnualReview(true);
    const lastReviewKey = `last_annual_review_${user?.id}`;
    localStorage.setItem(lastReviewKey, new Date().toISOString());
  };

  // Development reset function
  const handleResetOnboarding = () => {
    if (!user) return;
    
    // Clear all user-specific localStorage items
    const keysToRemove = [
      `onboarding_status_${user.id}`,
      `onboarding_data_${user.id}`,
      `progress_${user.id}`,
      `last_visit_${user.id}`,
      `last_annual_review_${user.id}`
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Reload the page to restart
    window.location.reload();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <Shield className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <p className="text-gray-600">{t('dashboard:common.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Annual Review View
  if (showAnnualReview) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="outline"
          onClick={() => setShowAnnualReview(false)}
          className="mb-4"
        >
          ← {t('dashboard:common.backToDashboard')}
        </Button>
        <AnnualReview />
      </div>
    );
  }

  // Main Dashboard with Professional Flow Manager
  return (
    <ProfessionalFlowManager>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Development Tools */}
        {import.meta.env.DEV && user && (
          <div className="fixed bottom-4 right-4 z-50 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetOnboarding}
              className="bg-yellow-500 text-black hover:bg-yellow-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('dashboard:development.resetOnboarding')}
            </Button>
          </div>
        )}

        {/* Professional Dashboard Component */}
        <ProfessionalDashboard
          onboardingData={onboardingData}
          tasks={userTasks}
          completionScore={completionScore}
        />

        {/* Annual Review Reminder */}
        {completionScore > 75 && !showAnnualReview && (
          <Card className="mt-6 border-green-200 bg-green-50/50">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t('dashboard:annualReview.reminderTitle')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('dashboard:annualReview.reminderDescription')}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleStartAnnualReview}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {t('dashboard:annualReview.startReview')}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Legal Consultation for Complex Profiles */}
        {progressStatus?.hasComplexProfile && (
          <Card className="mt-6 border-purple-200 bg-purple-50/50">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t('dashboard:complexProfile.title')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('dashboard:complexProfile.description')}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowLegalConsultation(true)}
                  size="sm"
                  variant="outline"
                  className="border-purple-300 hover:bg-purple-100"
                >
                  {t('dashboard:complexProfile.getHelp')}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Legal Consultation Modal */}
      {showLegalConsultation && (
        <LegalConsultationModal
          isOpen={showLegalConsultation}
          onClose={() => setShowLegalConsultation(false)}
          preselectedType="comprehensive_review"
          contextData={{
            completionScore: completionScore,
            hasComplexProfile: progressStatus?.hasComplexProfile
          }}
        />
      )}

      {/* Enhanced Personal Assistant (Professional) */}
      {!loading && user && (
        <EnhancedPersonalAssistant
          currentPage="dashboard"
          contextData={{
            completionScore: completionScore,
            currentStage: getProfessionalStage(completionScore),
            tasks: userTasks,
            onboardingData: onboardingData,
            professionalMode: true // Enable professional mode
          }}
        />
      )}
    </ProfessionalFlowManager>
  );
};

export default ProfessionalDashboardIntegration;
