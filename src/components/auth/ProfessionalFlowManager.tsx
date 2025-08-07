import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import RespectfulOnboarding, { OnboardingData } from '@/components/onboarding/RespectfulOnboarding';
import ProfessionalProgress from '@/components/dashboard/ProfessionalProgress';
import { 
  Shield, 
  Heart, 
  FileText, 
  Users, 
  CheckCircle,
  Info,
  ArrowRight,
  Sparkles,
  Home
} from 'lucide-react';

interface ProfessionalFlowManagerProps {
  children: React.ReactNode;
}

type FlowState = 'loading' | 'welcome' | 'onboarding' | 'dashboard';

interface UserProgress {
  documentsSecured: number;
  tasksCompleted: number;
  lastActiveDate: Date;
  securityStatus: 'getting-started' | 'building' | 'organized' | 'comprehensive';
  focusAreas: string[];
}

const ProfessionalFlowManager: React.FC<ProfessionalFlowManagerProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation(['ui', 'onboarding', 'dashboard']);
  const [flowState, setFlowState] = useState<FlowState>('loading');
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

  // Load user progress from localStorage
  useEffect(() => {
    if (user) {
      const savedProgress = localStorage.getItem(`progress_${user.id}`);
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          setUserProgress(progress);
        } catch (error) {
          console.error('Failed to load progress:', error);
        }
      }
    }
  }, [user]);

  // Determine flow state based on user status
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      // Not signed in - show landing page
      setFlowState('dashboard');
      return;
    }

    // Check user's onboarding status
    const onboardingStatus = localStorage.getItem(`onboarding_status_${user.id}`);
    const lastVisit = localStorage.getItem(`last_visit_${user.id}`);
    
    // Calculate if user is new (account created within 24 hours)
    const userCreatedAt = new Date(user.createdAt);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60);
    const isNewUser = hoursSinceCreation < 24;

    // Check if returning user (last visit more than 7 days ago)
    if (lastVisit) {
      const daysSinceLastVisit = (now.getTime() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastVisit > 7) {
        setShowWelcomeBack(true);
      }
    }

    // Update last visit
    localStorage.setItem(`last_visit_${user.id}`, now.toISOString());

    // Determine appropriate flow
    if (isNewUser && !onboardingStatus) {
      // New user - show welcome flow
      setFlowState('welcome');
    } else if (onboardingStatus === 'in-progress') {
      // User has started but not completed onboarding
      setFlowState('onboarding');
    } else if (onboardingStatus === 'completed' && userProgress?.tasksCompleted === 0) {
      // Completed onboarding but no tasks done - show guidance
      setShowGuidance(true);
      setFlowState('dashboard');
    } else {
      // Regular dashboard view
      setFlowState('dashboard');
    }
  }, [user, isLoaded, userProgress]);

  const handleOnboardingComplete = (data: OnboardingData) => {
    setOnboardingData(data);
    
    // Save progress
    const newProgress: UserProgress = {
      documentsSecured: data.documents?.length || 0,
      tasksCompleted: 0,
      lastActiveDate: new Date(),
      securityStatus: 'getting-started',
      focusAreas: data.recommendations?.slice(0, 3).map(r => r.category) || []
    };
    
    setUserProgress(newProgress);
    localStorage.setItem(`progress_${user?.id}`, JSON.stringify(newProgress));
    localStorage.setItem(`onboarding_status_${user?.id}`, 'completed');
    localStorage.setItem(`onboarding_data_${user?.id}`, JSON.stringify(data));
    
    // Show guidance overlay on dashboard
    setShowGuidance(true);
    setFlowState('dashboard');
  };

  const handleOnboardingClose = () => {
    // Save progress as in-progress
    localStorage.setItem(`onboarding_status_${user?.id}`, 'in-progress');
    setFlowState('dashboard');
  };

  const handleWelcomeContinue = () => {
    setFlowState('onboarding');
  };

  const handleWelcomeSkip = () => {
    localStorage.setItem(`onboarding_status_${user?.id}`, 'skipped');
    setFlowState('dashboard');
  };

  // Loading state
  if (flowState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <Shield className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <p className="text-gray-600">{t('ui:common.loading')}</p>
        </div>
      </div>
    );
  }

  // Welcome screen for new users
  if (flowState === 'welcome') {
    return (
      <WelcomeScreen
        userName={user?.firstName || undefined}
        onContinue={handleWelcomeContinue}
        onSkip={handleWelcomeSkip}
      />
    );
  }

  // Onboarding flow
  if (flowState === 'onboarding') {
    return (
      <RespectfulOnboarding
        isOpen={true}
        onComplete={handleOnboardingComplete}
        onClose={handleOnboardingClose}
        userName={user?.firstName || undefined}
      />
    );
  }

  // Main dashboard with optional guidance
  return (
    <>
      {children}
      
      {/* Welcome back message for returning users */}
      {showWelcomeBack && (
        <WelcomeBackBanner
          userName={user?.firstName || undefined}
          lastActiveDate={userProgress?.lastActiveDate}
          onDismiss={() => setShowWelcomeBack(false)}
        />
      )}
      
      {/* Guidance overlay for users who completed onboarding */}
      {showGuidance && onboardingData && (
        <GuidanceOverlay
          data={onboardingData}
          progress={userProgress}
          onDismiss={() => setShowGuidance(false)}
        />
      )}
    </>
  );
};

// Welcome Screen Component
const WelcomeScreen: React.FC<{
  userName?: string;
  onContinue: () => void;
  onSkip: () => void;
}> = ({ userName, onContinue, onSkip }) => {
  const { t } = useTranslation('onboarding');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
              <Heart className="w-10 h-10 text-blue-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {userName 
                ? t('respectful.welcome.greeting', { name: userName })
                : t('respectful.welcome.defaultGreeting')
              }
            </h1>
            
            <p className="text-xl text-gray-600 mb-3">
              {t('respectful.welcome.mainMessage')}
            </p>
            
            <p className="text-gray-500">
              {t('respectful.welcome.supportMessage')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-blue-600" />}
              title={t('respectful.welcome.features.security.title')}
              description={t('respectful.welcome.features.security.description')}
              color="blue"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-purple-600" />}
              title={t('respectful.welcome.features.family.title')}
              description={t('respectful.welcome.features.family.description')}
              color="purple"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-green-600" />}
              title={t('respectful.welcome.features.guidance.title')}
              description={t('respectful.welcome.features.guidance.description')}
              color="green"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onContinue}
              className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {t('respectful.welcome.getStarted')}
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={onSkip}
              className="flex-grow border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-4 px-8 rounded-xl transition-all duration-200"
            >
              {t('respectful.welcome.explorFirst')}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            <Info className="w-4 h-4 inline mr-1" />
            {t('respectful.welcome.privacyNote')}
          </p>
        </div>
      </div>
    </div>
  );
};

// Welcome Back Banner for returning users
const WelcomeBackBanner: React.FC<{
  userName?: string;
  lastActiveDate?: Date;
  onDismiss: () => void;
}> = ({ userName, lastActiveDate, onDismiss }) => {
  const { t } = useTranslation('dashboard');
  
  return (
    <div className="fixed top-4 right-4 max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-6 z-50">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Home className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="flex-grow">
          <h3 className="font-semibold text-gray-900 mb-1">
            {t('respectful.welcomeBack.title', { name: userName || 'there' })}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {t('respectful.welcomeBack.message')}
          </p>
          <button
            onClick={onDismiss}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('respectful.welcomeBack.continue')} →
          </button>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Guidance Overlay for post-onboarding
const GuidanceOverlay: React.FC<{
  data: OnboardingData;
  progress: UserProgress | null;
  onDismiss: () => void;
}> = ({ data, progress, onDismiss }) => {
  const { t } = useTranslation('dashboard');
  const [currentTip, setCurrentTip] = useState(0);
  
  const tips = [
    {
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      title: t('respectful.guidance.tips.documents.title'),
      description: t('respectful.guidance.tips.documents.description'),
      action: t('respectful.guidance.tips.documents.action')
    },
    {
      icon: <Users className="w-5 h-5 text-purple-600" />,
      title: t('respectful.guidance.tips.family.title'),
      description: t('respectful.guidance.tips.family.description'),
      action: t('respectful.guidance.tips.family.action')
    },
    {
      icon: <Shield className="w-5 h-5 text-green-600" />,
      title: t('respectful.guidance.tips.security.title'),
      description: t('respectful.guidance.tips.security.description'),
      action: t('respectful.guidance.tips.security.action')
    }
  ];
  
  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 p-5 z-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <h4 className="font-semibold text-gray-900">
            {t('respectful.guidance.title')}
          </h4>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex items-start gap-3">
          {tips[currentTip].icon}
          <div>
            <p className="font-medium text-gray-900 text-sm mb-1">
              {tips[currentTip].title}
            </p>
            <p className="text-xs text-gray-600 mb-2">
              {tips[currentTip].description}
            </p>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              {tips[currentTip].action} →
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {tips.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTip(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentTip ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label={`Tip ${index + 1}`}
            />
          ))}
        </div>
        
        <button
          onClick={() => setCurrentTip((prev) => (prev + 1) % tips.length)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {t('respectful.guidance.next')} →
        </button>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'green';
}> = ({ icon, title, description, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    green: 'bg-green-50 border-green-200'
  };
  
  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-sm mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600">
        {description}
      </p>
    </div>
  );
};

export default ProfessionalFlowManager;
