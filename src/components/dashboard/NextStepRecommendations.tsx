import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowRight,
  Clock,
  AlertCircle,
  Info,
  FileText,
  Users,
  Shield,
  Wallet,
  CheckCircle,
  Target,
  Lightbulb
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'critical' | 'important' | 'suggested';
  estimatedTime: string;
  icon: React.ReactNode;
  actionUrl: string;
  actionLabel: string;
  impact: string;
  prerequisites?: string[];
}

interface NextStepRecommendationsProps {
  completionScore: number;
  currentStage: string;
  completedItems: string[];
  className?: string;
}

export const NextStepRecommendations: React.FC<NextStepRecommendationsProps> = ({
  completionScore,
  currentStage,
  completedItems,
  className
}) => {
  const { t } = useTranslation('dashboard');

  // Generate recommendations based on current progress
  const getRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // Critical recommendations for early stages
    if (completionScore < 25) {
      if (!completedItems.includes('emergency-contacts')) {
        recommendations.push({
          id: 'add-emergency-contacts',
          title: t('dashboard.emergencyContacts.title'),
          description: t('dashboard.emergencyContacts.description'),
          category: 'critical',
          estimatedTime: '5 minutes',
          icon: <Users className="h-5 w-5" />,
          actionUrl: '/manual',
          actionLabel: t('dashboard.emergencyContacts.action'),
          impact: t('dashboard.emergencyContacts.impact')
        });
      }

      if (!completedItems.includes('key-documents')) {
        recommendations.push({
          id: 'upload-key-documents',
          title: t('dashboard.keyDocuments.title'),
          description: t('dashboard.keyDocuments.description'),
          category: 'critical',
          estimatedTime: '10 minutes',
          icon: <FileText className="h-5 w-5" />,
          actionUrl: '/vault',
          actionLabel: t('dashboard.keyDocuments.action'),
          impact: t('dashboard.keyDocuments.impact')
        });
      }
    }

    // Buildout stage recommendations
    if (completionScore >= 25 && completionScore < 60) {
      if (!completedItems.includes('asset-inventory')) {
        recommendations.push({
          id: 'create-asset-inventory',
          title: t('dashboard.assetInventory.title'),
          description: t('dashboard.assetInventory.description'),
          category: 'important',
          estimatedTime: '15 minutes',
          icon: <Wallet className="h-5 w-5" />,
          actionUrl: '/assets',
          actionLabel: t('dashboard.assetInventory.action'),
          impact: t('dashboard.assetInventory.impact')
        });
      }

      if (!completedItems.includes('beneficiaries')) {
        recommendations.push({
          id: 'designate-beneficiaries',
          title: t('dashboard.beneficiaries.title'),
          description: t('dashboard.beneficiaries.description'),
          category: 'critical',
          estimatedTime: '10 minutes',
          icon: <Users className="h-5 w-5" />,
          actionUrl: '/beneficiaries',
          actionLabel: t('dashboard.beneficiaries.action'),
          impact: t('dashboard.beneficiaries.impact'),
          prerequisites: completedItems.includes('asset-inventory') 
            ? undefined 
            : [t('dashboard.beneficiaries.prerequisite')]
        });
      }
    }

    // Reinforcement stage recommendations
    if (completionScore >= 60 && completionScore < 75) {
      if (!completedItems.includes('will-creation')) {
        recommendations.push({
          id: 'create-will',
          title: t('dashboard.will.title'),
          description: t('dashboard.will.description'),
          category: 'critical',
          estimatedTime: '30 minutes',
          icon: <Shield className="h-5 w-5" />,
          actionUrl: '/will',
          actionLabel: t('dashboard.will.action'),
          impact: t('dashboard.will.impact')
        });
      }

      if (!completedItems.includes('access-verification')) {
        recommendations.push({
          id: 'verify-access',
          title: t('dashboard.accessVerification.title'),
          description: t('dashboard.accessVerification.description'),
          category: 'suggested',
          estimatedTime: '15 minutes',
          icon: <CheckCircle className="h-5 w-5" />,
          actionUrl: '/settings/security',
          actionLabel: t('dashboard.accessVerification.action'),
          impact: t('dashboard.accessVerification.impact')
        });
      }
    }

    // Advanced recommendations
    if (completionScore >= 75) {
      recommendations.push({
        id: 'annual-review',
                  title: t('dashboard.annualReview.title'),
          description: t('dashboard.annualReview.description'),
        category: 'important',
        estimatedTime: '20 minutes',
        icon: <Target className="h-5 w-5" />,
        actionUrl: '/annual-review',
                  actionLabel: t('dashboard.annualReview.action'),
          impact: t('dashboard.annualReview.impact')
      });
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  };

  const recommendations = getRecommendations();

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">{t('dashboard.priority.critical')}</Badge>;
      case 'important':
        return <Badge variant="default" className="text-xs">{t('dashboard.priority.important')}</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{t('dashboard.priority.suggested')}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'important':
        return <Info className="h-4 w-4 text-orange-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-6 recommendations-section", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Target className="h-6 w-6" />
            {t('dashboard.title')}
          </CardTitle>
          <CardDescription>
            {t('dashboard.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <Card 
              key={recommendation.id}
              className={cn(
                "relative overflow-hidden transition-all hover:shadow-md",
                recommendation.category === 'critical' && "border-red-200",
                recommendation.category === 'important' && "border-orange-200"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      recommendation.category === 'critical' && "bg-red-50",
                      recommendation.category === 'important' && "bg-orange-50",
                      recommendation.category === 'suggested' && "bg-blue-50"
                    )}>
                      {recommendation.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                        {getCategoryBadge(recommendation.category)}
                      </div>
                      <CardDescription>{recommendation.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Impact Statement */}
                  <Alert className="border-0 bg-muted/50">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <span className="font-medium">{t('dashboard.impact.label')}: </span>
                      {recommendation.impact}
                    </AlertDescription>
                  </Alert>

                  {/* Prerequisites if any */}
                  {recommendation.prerequisites && recommendation.prerequisites.length > 0 && (
                    <Alert className="border-0 bg-yellow-50 dark:bg-yellow-950/20">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-sm">
                        <span className="font-medium">{t('dashboard.prerequisites.label')}: </span>
                        {recommendation.prerequisites.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Action Area */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{recommendation.estimatedTime}</span>
                    </div>
                    <Button asChild size="sm" className={cn(
                      recommendation.category === 'critical' && "bg-red-600 hover:bg-red-700"
                    )}>
                      <Link to={recommendation.actionUrl} className="flex items-center gap-1">
                        {recommendation.actionLabel}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Additional Help */}
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {t('dashboard.moreHelp.text')}
              <Link to="/help" className="font-medium underline ml-1">
                {t('dashboard.moreHelp.link')}
              </Link>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
