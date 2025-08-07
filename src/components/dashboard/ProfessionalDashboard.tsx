import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Heart,
  FileText,
  Users,
  Home,
  Briefcase,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Target,
  Calendar,
  Info,
  BookOpen,
  Building,
  Wallet,
  ArrowRight,
  Sparkles,
  FolderOpen,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfessionalProgress from './ProfessionalProgress';
import { cn } from '@/lib/utils';

interface ProfessionalDashboardProps {
  onboardingData?: any;
  tasks?: any[];
  completionScore?: number;
}

interface SecurityStatus {
  level: 'getting-started' | 'building' | 'organized' | 'comprehensive';
  description: string;
  nextMilestone: string;
  color: string;
}

interface FocusArea {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  tasks: number;
  completedTasks: number;
  priority: 'critical' | 'important' | 'recommended';
  estimatedTime: string;
  actionUrl: string;
}

const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({
  onboardingData,
  tasks = [],
  completionScore = 0
}) => {
  const { user } = useUser();
  const { t } = useTranslation(['dashboard', 'ui']);
  const [activeTab, setActiveTab] = useState('overview');
  const [showGuidance, setShowGuidance] = useState(true);
  const [userProgress, setUserProgress] = useState<any>(null);

  // Load user progress
  useEffect(() => {
    if (user) {
      const savedProgress = localStorage.getItem(`progress_${user.id}`);
      if (savedProgress) {
        try {
          setUserProgress(JSON.parse(savedProgress));
        } catch (error) {
          console.error('Failed to load progress:', error);
        }
      }
    }
  }, [user]);

  // Calculate security status based on completion
  const getSecurityStatus = (): SecurityStatus => {
    if (completionScore < 25) {
      return {
        level: 'getting-started',
        description: t('dashboard.status.gettingStarted'),
        nextMilestone: t('dashboard.status.milestone.foundation'),
        color: 'text-blue-600 bg-blue-50'
      };
    } else if (completionScore < 50) {
      return {
        level: 'building',
        description: t('dashboard.status.building'),
        nextMilestone: t('dashboard.status.milestone.core'),
        color: 'text-purple-600 bg-purple-50'
      };
    } else if (completionScore < 75) {
      return {
        level: 'organized',
        description: t('dashboard.status.organized'),
        nextMilestone: t('dashboard.status.milestone.comprehensive'),
        color: 'text-green-600 bg-green-50'
      };
    } else {
      return {
        level: 'comprehensive',
        description: t('dashboard.status.comprehensive'),
        nextMilestone: t('dashboard.status.milestone.maintain'),
        color: 'text-emerald-600 bg-emerald-50'
      };
    }
  };

  const securityStatus = getSecurityStatus();

  // Generate focus areas based on user data
  const focusAreas: FocusArea[] = useMemo(() => {
    const areas: FocusArea[] = [
      {
        id: 'documents',
        title: t('dashboard.areas.documents.title'),
        description: t('dashboard.areas.documents.description'),
        icon: <FileText className="w-5 h-5" />,
        progress: 35,
        tasks: 8,
        completedTasks: 3,
        priority: 'critical',
        estimatedTime: '30 minutes',
        actionUrl: '/vault'
      },
      {
        id: 'guardians',
        title: t('dashboard.areas.guardians.title'),
        description: t('dashboard.areas.guardians.description'),
        icon: <Users className="w-5 h-5" />,
        progress: 50,
        tasks: 4,
        completedTasks: 2,
        priority: 'critical',
        estimatedTime: '15 minutes',
        actionUrl: '/manual'
      },
      {
        id: 'assets',
        title: t('dashboard.areas.assets.title'),
        description: t('dashboard.areas.assets.description'),
        icon: <Building className="w-5 h-5" />,
        progress: 20,
        tasks: 6,
        completedTasks: 1,
        priority: 'important',
        estimatedTime: '20 minutes',
        actionUrl: '/assets'
      },
      {
        id: 'beneficiaries',
        title: t('dashboard.areas.beneficiaries.title'),
        description: t('dashboard.areas.beneficiaries.description'),
        icon: <Heart className="w-5 h-5" />,
        progress: 75,
        tasks: 4,
        completedTasks: 3,
        priority: 'important',
        estimatedTime: '10 minutes',
        actionUrl: '/beneficiaries'
      }
    ];

    return areas.sort((a, b) => {
      // Sort by priority, then by progress (lowest first)
      const priorityOrder = { critical: 0, important: 1, recommended: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.progress - b.progress;
    });
  }, [t]);

  // Get time-appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.firstName || 'there';
    
    if (hour < 12) return t('dashboard.greeting.morning', { name });
    if (hour < 17) return t('dashboard.greeting.afternoon', { name });
    return t('dashboard.greeting.evening', { name });
  };

  // Get priority badge styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">{t('dashboard.priority.critical')}</Badge>;
      case 'important':
        return <Badge className="text-xs bg-orange-100 text-orange-800">{t('dashboard.priority.important')}</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{t('dashboard.priority.recommended')}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Professional Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {getGreeting()}
            </h1>
            <p className="text-gray-600">
              {t('dashboard.subtitle.professional')}
            </p>
          </div>
          <div className={cn("px-4 py-2 rounded-lg", securityStatus.color)}>
            <p className="text-sm font-medium">{t('dashboard.securityLevel')}</p>
            <p className="text-xs mt-1">{securityStatus.description}</p>
          </div>
        </div>
      </div>

      {/* Guidance Message */}
      {showGuidance && (
        <Alert className="border-blue-200 bg-blue-50/50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-gray-700">
              {t('dashboard.guidance.professional')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGuidance(false)}
              className="ml-4"
            >
              {t('ui:common.dismiss')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <Target className="w-4 h-4 mr-2" />
            {t('dashboard.tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="progress">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {t('dashboard.tabs.progress')}
          </TabsTrigger>
          <TabsTrigger value="resources">
            <BookOpen className="w-4 h-4 mr-2" />
            {t('dashboard.tabs.resources')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Priority Focus Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                {t('dashboard.focusAreas.title')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.focusAreas.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {focusAreas.slice(0, 3).map((area) => (
                <div
                  key={area.id}
                  className="p-4 border rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {area.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{area.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{area.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {area.estimatedTime}
                          </span>
                          <span className="text-xs text-gray-500">
                            {area.completedTasks} of {area.tasks} tasks complete
                          </span>
                        </div>
                      </div>
                    </div>
                    {getPriorityBadge(area.priority)}
                  </div>
                  <div className="space-y-2">
                    <Progress value={area.progress} className="h-2" />
                    <Button asChild size="sm" className="w-full">
                      <Link to={area.actionUrl}>
                        {t('dashboard.continue')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                {t('dashboard.nextSteps.title')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.nextSteps.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <NextStepCard
                  title={t('dashboard.nextSteps.uploadDocuments')}
                  description={t('dashboard.nextSteps.uploadDocumentsDesc')}
                  icon={<FileText className="w-4 h-4" />}
                  time="5 min"
                  url="/vault"
                />
                <NextStepCard
                  title={t('dashboard.nextSteps.addGuardian')}
                  description={t('dashboard.nextSteps.addGuardianDesc')}
                  icon={<UserCheck className="w-4 h-4" />}
                  time="3 min"
                  url="/manual"
                />
                <NextStepCard
                  title={t('dashboard.nextSteps.reviewAssets')}
                  description={t('dashboard.nextSteps.reviewAssetsDesc')}
                  icon={<Wallet className="w-4 h-4" />}
                  time="10 min"
                  url="/assets"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <ProfessionalProgress
            tasks={tasks}
            userName={user?.firstName}
            compactMode={false}
          />
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                {t('dashboard.resources.title')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.resources.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <ResourceCard
                  title={t('dashboard.resources.gettingStarted')}
                  description={t('dashboard.resources.gettingStartedDesc')}
                  icon={<Info className="w-5 h-5 text-blue-600" />}
                  url="/guide/getting-started"
                />
                <ResourceCard
                  title={t('dashboard.resources.familyGuide')}
                  description={t('dashboard.resources.familyGuideDesc')}
                  icon={<Users className="w-5 h-5 text-purple-600" />}
                  url="/guide/family"
                />
                <ResourceCard
                  title={t('dashboard.resources.documentChecklist')}
                  description={t('dashboard.resources.documentChecklistDesc')}
                  icon={<FolderOpen className="w-5 h-5 text-green-600" />}
                  url="/guide/documents"
                />
                <ResourceCard
                  title={t('dashboard.resources.support')}
                  description={t('dashboard.resources.supportDesc')}
                  icon={<Heart className="w-5 h-5 text-pink-600" />}
                  url="/support"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Milestone Celebration (Professional) */}
      {completionScore > 0 && completionScore % 25 === 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>{t('dashboard.milestone.reached')}</strong>
            <p className="mt-1">{securityStatus.nextMilestone}</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Next Step Card Component
const NextStepCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  time: string;
  url: string;
}> = ({ title, description, icon, time, url }) => {
  const { t } = useTranslation('ui');
  
  return (
    <Link
      to={url}
      className="flex items-center gap-3 p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all"
    >
      <div className="p-2 bg-gray-100 rounded">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="flex items-center gap-2 text-gray-500">
        <Clock className="w-3 h-3" />
        <span className="text-xs">{time}</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
};

// Resource Card Component
const ResourceCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  url: string;
}> = ({ title, description, icon, url }) => {
  return (
    <Link
      to={url}
      className="flex items-start gap-3 p-4 border rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
    >
      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
    </Link>
  );
};

export default ProfessionalDashboard;
