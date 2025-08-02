import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProgressService } from '@/services/ProgressService';
import { LifeEventService } from '@/services/LifeEventService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ClipboardCheck, Target, Shield, CheckCircle2, Lock, Clock, ShieldCheck, Calendar, AlertTriangle, Info, Book } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import AnnualReview from '@/components/AnnualReview';
import LegalConsultationModal from '@/components/LegalConsultationModal';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [progressStatus, setProgressStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnnualReview, setShowAnnualReview] = useState(false);
  const [showLegalConsultation, setShowLegalConsultation] = useState(false);

  const handleAnnualReview = () => {
    setShowAnnualReview(true);
  };

  useEffect(() => {
    const fetchProgressStatus = async () => {
      try {
        const status = await ProgressService.getProgressStatus('user-id');
        setProgressStatus(status);
      } catch (err) {
        setError(t('dashboard.errors.failedToFetchStatus'));
      } finally {
        setLoading(false);
      }
    };
    fetchProgressStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'Foundation':
        return <Shield className="h-5 w-5" />;
      case 'Buildout':
        return <Target className="h-5 w-5" />;
      case 'Reinforcement':
        return <Lock className="h-5 w-5" />;
      case 'Advanced Planning':
        return <ClipboardCheck className="h-5 w-5" />;
      case 'Legacy':
        return <CheckCircle2 className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getOperationIcon = (iconName) => {
    switch (iconName) {
      case 'Mail':
        return <Mail className="h-8 w-8" />;
      case 'ClipboardCheck':
        return <ClipboardCheck className="h-8 w-8" />;
      default:
        return <Target className="h-8 w-8" />;
    }
  };

  const stages = [
    { name: t('dashboard.stages.foundation'), range: '0-25%', stage: 'Foundation' },
    { name: t('dashboard.stages.building'), range: '25-60%', stage: 'Buildout' },
    { name: t('dashboard.stages.strengthening'), range: '60-75%', stage: 'Reinforcement' },
    { name: t('dashboard.stages.advancedPlanning'), range: '75-90%', stage: 'Advanced Planning' },
    { name: t('dashboard.stages.legacy'), range: '90-100%', stage: 'Legacy' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {showAnnualReview ? (
        <AnnualReview />
      ) : (
        <>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground text-lg">
              {t('dashboard.subtitle')}
            </p>
          </div>

      {progressStatus && (
        <>
          {/* Completion Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('dashboard.planStrength.title')}</CardTitle>
              <CardDescription>
                {t('dashboard.planStrength.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('dashboard.planStrength.currentStage', { stage: progressStatus.currentStage })}</span>
                  <span className="text-3xl font-bold text-primary">
                    {progressStatus.completionScore}%
                  </span>
                </div>
                <Progress value={progressStatus.completionScore} className="h-4" />
              </div>
            </CardContent>
          </Card>

          {/* Next Objective - Regular Task, Deep Dive, or Preservation Mode */}
          {progressStatus.nextObjective.type === 'task' ? (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  {t('dashboard.nextStep.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    {progressStatus.nextObjective.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {progressStatus.nextObjective.description}
                  </p>
                  {progressStatus.nextObjective.estimatedTime && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{t('dashboard.nextStep.estimatedTime', { time: progressStatus.nextObjective.estimatedTime })}</span>
                    </div>
                  )}
                </div>
                <Button asChild size="lg" className="w-full md:w-auto">
                  <Link to={progressStatus.nextObjective.actionUrl}>
                    {progressStatus.nextObjective.actionLabel}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : progressStatus.nextObjective.type === 'deepDive' ? (
            /* Advanced Planning Deep Dive */
            <Card className="border-2 border-primary bg-primary/5">
              <CardHeader className="text-center space-y-4 pb-8">
                <Badge variant="default" className="mx-auto text-sm px-4 py-1">
                  {t('dashboard.deepDive.milestoneAchieved')}
                </Badge>
                <CardTitle className="text-3xl font-bold">
                  {progressStatus.nextObjective.title}
                </CardTitle>
                <CardDescription className="text-base max-w-3xl mx-auto">
                  {progressStatus.nextObjective.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {progressStatus.nextObjective.features.map((operation) => (
                    <Card 
                      key={operation.id} 
                      className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    >
                      <Link to={operation.actionUrl} className="block h-full">
                        <CardHeader className="space-y-4">
                          <div className="mx-auto p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            {getOperationIcon(operation.icon)}
                          </div>
                          <CardTitle className="text-xl text-center">
                            {operation.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-center">
                            {operation.description}
                          </p>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Preservation Mode */
            <Card className="border-2 border-success bg-success/5">
              <CardHeader className="text-center space-y-4 pb-8">
                <ShieldCheck className="text-success h-16 w-16 mx-auto" />
                <CardTitle className="text-3xl font-bold">
                  {progressStatus.nextObjective.title}
                </CardTitle>
                <CardDescription className="text-base max-w-3xl mx-auto">
                  {progressStatus.nextObjective.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="text-center mt-4">
                  <Calendar className="inline-block h-5 w-5" /> <span>{t('dashboard.preservationMode.lastReviewDate', { date: progressStatus.nextObjective.lastReviewDate })}</span>
                </div>
                <Button asChild size="lg" className="w-full md:w-auto mt-8">
                  <Link to="/annual-review">
                    {t('dashboard.preservationMode.startAnnualCheck')}
                  </Link>
                </Button>

                <div className="text-left mt-8">
                  <Badge variant="secondary" className="text-sm px-4 py-1">
                    {t('dashboard.preservationMode.latestUpdates')}
                  </Badge>
                  <ul className="space-y-2 mt-4">
                    {progressStatus.nextObjective.notifications.map(notification => (
                      <li key={notification.id} className="flex items-start gap-2">
                        {notification.type === 'warning' ? 
                          <AlertTriangle className="text-warning" /> : 
                          <Info className="text-info" />
                        }
                        <div>
                          <Link to={notification.actionUrl} className="text-link">
                            {notification.text}
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Special Offer for Complex Profiles */}
          {progressStatus.completionScore > 80 && user?.has_business && (
            <Card className="mb-8 border-earth-primary/20 bg-earth-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-earth-primary/10 rounded-lg">
                      <Book className="h-6 w-6 text-earth-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                        {t('dashboard.complexProfile.detected')}
                        <Badge variant="secondary">{t('dashboard.complexProfile.personalizedGuidance')}</Badge>
                      </h3>
                      <p className="text-muted-foreground">
                        {t('dashboard.complexProfile.businessSuccessionNote')}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowLegalConsultation(true)}
                    className="bg-earth-primary hover:bg-earth-primary/90"
                  >
                    <Book className="mr-2 h-4 w-4" />
                    {t('dashboard.complexProfile.discussWithExpert')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Stages Timeline */}
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('dashboard.protectionJourney.title')}</CardTitle>
              <CardDescription>
                {t('dashboard.protectionJourney.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stages.map((stage, index) => {
                  const isComplete = progressStatus.completionScore > parseInt(stage.range.split('-')[1]);
                  const isCurrent = progressStatus.currentStage === stage.stage;
                  const isLocked = !isComplete && !isCurrent;

                  return (
                    <div
                      key={stage.name}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg transition-all",
                        isComplete && "bg-green-50 dark:bg-green-950/20",
                        isCurrent && "bg-primary/10 border-2 border-primary",
                        isLocked && "opacity-50"
                      )}
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                          isComplete && "bg-green-600 text-white",
                          isCurrent && "bg-primary text-primary-foreground",
                          isLocked && "bg-gray-200 dark:bg-gray-800"
                        )}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : isCurrent ? (
                          getStageIcon(stage.stage)
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {t('dashboard.protectionJourney.stage', { number: index + 1, name: stage.name })}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t('dashboard.protectionJourney.planStrengthRange', { range: stage.range })}
                        </p>
                      </div>
                      {isComplete && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
        </>
      )}

      {/* Legal Consultation Modal */}
      {showLegalConsultation && (
        <LegalConsultationModal
          isOpen={showLegalConsultation}
          onClose={() => setShowLegalConsultation(false)}
          preselectedType="business_review"
          contextData={{
            completionScore: progressStatus?.completionScore,
            hasBusiness: user?.has_business
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;

