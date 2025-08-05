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
          title: t('recommendations.emergencyContacts.title'),
          description: t('recommendations.emergencyContacts.description'),
          category: 'critical',
          estimatedTime: '5 minutes',
          icon: <Users className="h-5 w-5" />,
          actionUrl: '/manual',
          actionLabel: t('recommendations.emergencyContacts.action'),
          impact: t('recommendations.emergencyContacts.impact')
        });
      }

      if (!completedItems.includes('key-documents')) {
        recommendations.push({
          id: 'upload-key-documents',
          title: t('recommendations.keyDocuments.title'),
          description: t('recommendations.keyDocuments.description'),
          category: 'critical',
          estimatedTime: '10 minutes',
          icon: <FileText className="h-5 w-5" />,
          actionUrl: '/vault',
          actionLabel: t('recommendations.keyDocuments.action'),
          impact: t('recommendations.keyDocuments.impact')
        });
      }
    }

    // Buildout stage recommendations
    if (completionScore >= 25 && completionScore < 60) {
      if (!completedItems.includes('asset-inventory')) {
        recommendations.push({
          id: 'create-asset-inventory',
          title: t('recommendations.assetInventory.title'),
          description: t('recommendations.assetInventory.description'),
          category: 'important',
          estimatedTime: '15 minutes',
          icon: <Wallet className="h-5 w-5" />,
          actionUrl: '/assets',
          actionLabel: t('recommendations.assetInventory.action'),
          impact: t('recommendations.assetInventory.impact')
        });
      }

      if (!completedItems.includes('beneficiaries')) {
        recommendations.push({
          id: 'designate-beneficiaries',
          title: t('recommendations.beneficiaries.title'),
          description: t('recommendations.beneficiaries.description'),
          category: 'critical',
          estimatedTime: '10 minutes',
          icon: <Users className="h-5 w-5" />,
          actionUrl: '/beneficiaries',
          actionLabel: t('recommendations.beneficiaries.action'),
          impact: t('recommendations.beneficiaries.impact'),
          prerequisites: completedItems.includes('asset-inventory') 
            ? undefined 
            : [t('recommendations.beneficiaries.prerequisite')]
        });
      }
    }

    // Reinforcement stage recommendations
    if (completionScore >= 60 && completionScore < 75) {
      if (!completedItems.includes('will-creation')) {
        recommendations.push({
          id: 'create-will',
          title: t('recommendations.will.title'),
          description: t('recommendations.will.description'),
          category: 'critical',
          estimatedTime: '30 minutes',
          icon: <Shield className="h-5 w-5" />,
          actionUrl: '/will',
          actionLabel: t('recommendations.will.action'),
          impact: t('recommendations.will.impact')
        });
      }

      if (!completedItems.includes('access-verification')) {
        recommendations.push({
          id: 'verify-access',
          title: t('recommendations.accessVerification.title'),
          description: t('recommendations.accessVerification.description'),
          category: 'suggested',
          estimatedTime: '15 minutes',
          icon: <CheckCircle className="h-5 w-5" />,
          actionUrl: '/settings/security',
          actionLabel: t('recommendations.accessVerification.action'),
          impact: t('recommendations.accessVerification.impact')
        });
      }
    }

    // Advanced recommendations
    if (completionScore >= 75) {
      recommendations.push({
        id: 'annual-review',
                  title: t('recommendations.annualReview.title'),
          description: t('recommendations.annualReview.description'),
        category: 'important',
        estimatedTime: '20 minutes',
        icon: <Target className="h-5 w-5" />,
        actionUrl: '/annual-review',
                  actionLabel: t('recommendations.annualReview.action'),
          impact: t('recommendations.annualReview.impact')
      });
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  };

  const recommendations = getRecommendations();

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">{t('recommendations.priority.critical')}</Badge>;
      case 'important':
        return <Badge variant="default" className="text-xs">{t('recommendations.priority.important')}</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{t('recommendations.priority.suggested')}</Badge>;
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
            {t('recommendations.title')}
          </CardTitle>
          <CardDescription>
            {t('recommendations.subtitle')}
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
                      <span className="font-medium">{t('recommendations.impact.label')}: </span>
                      {recommendation.impact}
                    </AlertDescription>
                  </Alert>

                  {/* Prerequisites if any */}
                  {recommendation.prerequisites && recommendation.prerequisites.length > 0 && (
                    <Alert className="border-0 bg-yellow-50 dark:bg-yellow-950/20">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-sm">
                        <span className="font-medium">{t('recommendations.prerequisites.label')}: </span>
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
              {t('recommendations.moreHelp.text')}
              <Link to="/help" className="font-medium underline ml-1">
                {t('recommendations.moreHelp.link')}
              </Link>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
