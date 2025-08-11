import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Shield, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  FileText,
  Users,
  Heart,
  Building,
  Car,
  Wallet
} from 'lucide-react';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';

interface StrategicArea {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  nextAction: string;
  estimatedTime: number;
  impact: string;
  whyImportant: string;
  whatHappensIfNot: string;
  priority: 'critical' | 'high' | 'medium';
}

export const StrategicSummary: React.FC = () => {
    const { t } = useTranslation('dashboard-main');
  const [strategicAreas, setStrategicAreas] = useState<StrategicArea[]>([]);

  const [nextCriticalAction, setNextCriticalAction] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
     
    loadUserData();
  }, [loadUserData]);

  const loadUserData = useCallback(async () => {
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      // Load user's data
      const [guardiansResult, documentsResult, assetsResult, beneficiariesResult] = await Promise.all([
        supabaseWithRetry.from('guardians').select('*').eq('user_id', user.id),
        supabaseWithRetry.from('documents').select('*').eq('user_id', user.id),
        supabaseWithRetry.from('assets').select('*').eq('user_id', user.id),
        supabaseWithRetry.from('beneficiaries').select('*').eq('user_id', user.id)
      ]);

      generateStrategicAreas(
        guardiansResult.data || [],
        documentsResult.data || [],
        assetsResult.data || [],
        beneficiariesResult.data || []
      );
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateStrategicAreas]);

  const generateStrategicAreas = useCallback((
    guardians: Array<Record<string, unknown>>,
    documents: Array<Record<string, unknown>>,
    assets: Array<Record<string, unknown>>,
    beneficiaries: Array<Record<string, unknown>>
  ) => {
    const areas: StrategicArea[] = [
      {
        id: 'critical-documents',
        title: t('dashboard.strategicSummary.criticalDocuments'),
        description: t('dashboard.strategicSummary.criticalDocumentsDesc'),
        icon: <FileText className="h-5 w-5" />,
        completed: documents.filter(d => d.importance_level === 'critical').length >= 3,
        nextAction: getNextDocumentAction(documents),
        estimatedTime: 5,
        impact: t('dashboard.strategicSummary.impact.familyProtection'),
        whyImportant: t('dashboard.strategicSummary.whyImportant'),
        whatHappensIfNot: t('dashboard.strategicSummary.ifNotDone'),
        priority: 'critical'
      },
      {
        id: 'guardian-network',
        title: t('dashboard.strategicSummary.guardianNetwork'),
        description: t('dashboard.strategicSummary.guardianNetworkDesc'),
        icon: <Users className="h-5 w-5" />,
        completed: guardians.length >= 2,
        nextAction: guardians.length === 0 ? t('dashboard.strategicSummary.addPrimaryGuardian') : t('dashboard.strategicSummary.addBackupGuardian'),
        estimatedTime: 8,
        impact: t('dashboard.strategicSummary.impact.immediateDecision'),
        whyImportant: t('dashboard.strategicSummary.whyImportant'),
        whatHappensIfNot: t('dashboard.strategicSummary.ifNotDone'),
        priority: 'critical'
      },
      {
        id: 'asset-inventory',
        title: t('dashboard.strategicSummary.assetInventory'),
        description: t('dashboard.strategicSummary.assetInventoryDesc'),
        icon: <Building className="h-5 w-5" />,
        completed: assets.length >= 3,
        nextAction: assets.length === 0 ? t('dashboard.strategicSummary.addHomeProperty') : t('dashboard.strategicSummary.addFinancialAccounts'),
        estimatedTime: 10,
        impact: t('dashboard.strategicSummary.impact.preventsAssetLoss'),
        whyImportant: t('dashboard.strategicSummary.whyImportant'),
        whatHappensIfNot: t('dashboard.strategicSummary.ifNotDone'),
        priority: 'high'
      },
      {
        id: 'inheritance-plan',
        title: t('dashboard.strategicSummary.inheritancePlan'),
        description: t('dashboard.strategicSummary.inheritancePlanDesc'),
        icon: <Heart className="h-5 w-5" />,
        completed: beneficiaries.length >= 1,
        nextAction: beneficiaries.length === 0 ? t('dashboard.strategicSummary.addPrimaryBeneficiary') : t('dashboard.strategicSummary.addContingentBeneficiaries'),
        estimatedTime: 6,
        impact: t('dashboard.strategicSummary.impact.preventsConflicts'),
        whyImportant: t('dashboard.strategicSummary.whyImportant'),
        whatHappensIfNot: t('dashboard.strategicSummary.ifNotDone'),
        priority: 'high'
      }
    ];

    setStrategicAreas(areas);
    


    // Find next critical action
    const criticalIncomplete = areas.filter(area => !area.completed && area.priority === 'critical');
    if (criticalIncomplete.length > 0) {
      setNextCriticalAction(criticalIncomplete[0].nextAction);
    }
  }, [t]);

  const getNextDocumentAction = (documents: Array<Record<string, unknown>>): string => {
    const criticalDocs = documents.filter(d => d.importance_level === 'critical');
    
    if (!documents.some(d => d.title?.toLowerCase().includes('birth'))) {
      return 'Add birth certificate';
    }
    if (!documents.some(d => d.title?.toLowerCase().includes('insurance'))) {
      return 'Add life insurance policy';
    }
    if (!documents.some(d => d.title?.toLowerCase().includes('will'))) {
      return 'Add will or testament';
    }
    
    return 'Add any missing critical documents';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };



  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-10 bg-muted rounded w-40"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Target className="h-6 w-6 text-primary" />
          {t('dashboard.strategicSummary.title')}
        </CardTitle>
        <p className="text-muted-foreground">
          {t('dashboard.strategicSummary.subtitle', { 
            count: strategicAreas.filter(a => !a.completed).length 
          })}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Next Critical Action */}
        <div className="text-center space-y-4">
          
          {nextCriticalAction && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">{t('dashboard.strategicSummary.nextCriticalStep')}</span>
              </div>
              <p className="text-blue-700 mb-2">{nextCriticalAction}</p>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Clock className="h-4 w-4" />
                <span>{t('dashboard.strategicSummary.minutes', { count: 3 })}</span>
              </div>
            </div>
          )}
        </div>

        {/* Strategic Areas */}
        <div className="space-y-4">
          {strategicAreas.map((area) => (
            <div
              key={area.id}
              className={`p-4 border rounded-lg transition-colors ${
                area.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    area.completed 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {area.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${
                        area.completed ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {area.title}
                      </h4>
                      {area.completed && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(area.priority)}`}
                      >
                        {area.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {area.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {area.estimatedTime} minutes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {!area.completed && (
                <div className="space-y-3 pt-3 border-t border-dashed">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-800 mb-1">{t('dashboard.strategicSummary.whyImportant')}</div>
                        <p className="text-blue-700 text-xs">{area.whyImportant}</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="font-medium text-orange-800 mb-1">{t('dashboard.strategicSummary.ifNotDone')}</div>
                        <p className="text-orange-700 text-xs">{area.whatHappensIfNot}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-800 mb-1">{t('dashboard.strategicSummary.nextAction')}</div>
                        <p className="text-green-700 text-xs">{area.nextAction}</p>
                      </div>
                    </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        {strategicAreas.some(area => !area.completed) && (
          <div className="text-center pt-4">
            <Button size="lg" className="w-full">
              <ArrowRight className="mr-2 h-4 w-4" />
              {t('dashboard.strategicSummary.startWithNext')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
