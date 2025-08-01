import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Shield,
  XCircle,
  AlertTriangle,
  Users,
  FileText,
  Heart
} from 'lucide-react';

interface FamilyCapability {
  id: string;
  capability: string;
  status: 'capable' | 'partial' | 'vulnerable';
  icon: React.ReactNode;
  details?: string;
}

interface CrisisSituation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isPrepared: boolean;
  requiredCapabilities: string[];
  missingCapabilities: string[];
}

interface FamilyPreparednessIndexProps {
  userAssets?: any[];
  userDocuments?: any[];
  userGuardians?: any[];
  userBeneficiaries?: any[];
}

export const FamilyPreparednessIndex: React.FC<FamilyPreparednessIndexProps> = ({
  userAssets = [],
  userDocuments = [],
  userGuardians = [],
  userBeneficiaries = []
}) => {
  const { t } = useTranslation('common');

  const capabilities = useMemo<FamilyCapability[]>(() => [
    {
      id: 'immediate_financial_needs',
      capability: t('familyCapabilities.immediateFinancialNeeds'),
      status: userAssets.some(a => a.type?.toLowerCase().includes('bank')) ? 'capable' : 'vulnerable',
      icon: userAssets.some(a => a.type?.toLowerCase().includes('bank')) ? <CheckCircle2 /> : <AlertTriangle />
    },
    {
      id: 'digital_access',
      capability: t('familyCapabilities.digitalAccess'),
      status: userDocuments.some(d => d.type?.toLowerCase().includes('digital')) ? 'capable' : 'vulnerable',
      icon: userDocuments.some(d => d.type?.toLowerCase().includes('digital')) ? <CheckCircle2 /> : <AlertTriangle />
    },
    // Additional capabilities go here
  ], [userAssets, userDocuments, userGuardians, userBeneficiaries]);

  const crises = useMemo<CrisisSituation[]>(() => [
    {
      id: 'emergency_hospital',
      title: t('preparedness.scenarios.emergencyHospital.title'),
      description: t('preparedness.scenarios.emergencyHospital.description'),
      icon: <Heart />,
      isPrepared: true, // Example: conditionally calculate
      requiredCapabilities: [],
      missingCapabilities: []
    },
    {
      id: 'sudden_death',
      title: t('preparedness.scenarios.suddenDeath.title'),
      description: t('preparedness.scenarios.suddenDeath.description'),
      icon: <AlertCircle />,
      isPrepared: false, // Example: conditionally calculate
      requiredCapabilities: ['immediate_financial_needs', 'digital_access'],
      missingCapabilities: []
    }
  ], [capabilities]);

  // Determine preparedness level and message
  const getPreparednessLevel = (score: number) => {
    if (score >= 90) return { level: t('preparedness.levels.fullyPrepared'), color: 'text-green-600' };
    if (score >= 75) return { level: t('preparedness.levels.wellPrepared'), color: 'text-green-500' };
    if (score >= 60) return { level: t('preparedness.levels.goodBasic'), color: 'text-yellow-600' };
    if (score >= 45) return { level: t('preparedness.levels.somePreparation'), color: 'text-orange-600' };
    if (score >= 30) return { level: t('preparedness.levels.minimalPreparation'), color: 'text-orange-700' };
    return { level: t('preparedness.levels.needsImmediate'), color: 'text-red-600' };
  };

  const preparednessLevel = getPreparednessLevel(overallIndex);

  // Define preparedness scenarios
  const scenarios: PreparednessScenario[] = [
    {
      id: 'emergency_hospital',
      title: t('preparedness.scenarios.emergencyHospital.title'),
      description: t('preparedness.scenarios.emergencyHospital.description'),
      icon: <Heart className="h-5 w-5" />,
      requiredPreparedness: {
        immediateAccess: 80,
        decisionMaking: 60,
        longTermSecurity: 40
      },
      familyReadiness: 
        immediateAccessScore >= 80 && decisionMakingScore >= 60 ? 'ready' :
        immediateAccessScore >= 60 && decisionMakingScore >= 45 ? 'mostly_ready' :
        immediateAccessScore >= 40 ? 'partially_ready' : 'not_ready',
      gapsToAddress: [
        ...(immediateAccessScore < 80 ? [t('preparedness.gaps.improveImmediateAccess')] : []),
        ...(decisionMakingScore < 60 ? [t('preparedness.gaps.addMedicalPreferences')] : [])
      ]
    },
    {
      id: 'sudden_death',
      title: t('preparedness.scenarios.suddenDeath.title'),
      description: t('preparedness.scenarios.suddenDeath.description'),
      icon: <AlertCircle className="h-5 w-5" />,
      requiredPreparedness: {
        immediateAccess: 90,
        decisionMaking: 85,
        longTermSecurity: 90
      },
      familyReadiness: 
        immediateAccessScore >= 85 && decisionMakingScore >= 80 && longTermSecurityScore >= 85 ? 'ready' :
        immediateAccessScore >= 70 && decisionMakingScore >= 65 && longTermSecurityScore >= 70 ? 'mostly_ready' :
        immediateAccessScore >= 50 && decisionMakingScore >= 50 && longTermSecurityScore >= 50 ? 'partially_ready' : 
        'not_ready',
      gapsToAddress: [
        ...(immediateAccessScore < 85 ? [t('preparedness.gaps.completeFinancialAccess')] : []),
        ...(decisionMakingScore < 80 ? [t('preparedness.gaps.documentBusinessOperations')] : []),
        ...(longTermSecurityScore < 85 ? [t('preparedness.gaps.updateWillAndTrust')] : [])
      ]
    },
    {
      id: 'extended_travel',
      title: t('preparedness.scenarios.extendedTravel.title'),
      description: t('preparedness.scenarios.extendedTravel.description'),
      icon: <Clock className="h-5 w-5" />,
      requiredPreparedness: {
        immediateAccess: 60,
        decisionMaking: 40,
        longTermSecurity: 30
      },
      familyReadiness: 
        immediateAccessScore >= 60 ? 'ready' :
        immediateAccessScore >= 45 ? 'mostly_ready' :
        immediateAccessScore >= 30 ? 'partially_ready' : 'not_ready',
      gapsToAddress: immediateAccessScore < 60 ? [t('preparedness.gaps.basicAccessInfo')] : []
    }
  ];

  // Get next improvement recommendation
  const getNextImprovement = () => {
    const improvements = [];
    
    if (preparednessData.immediateAccess.bankAccess < 80) {
      improvements.push({
        action: t('preparedness.improvements.addBankAccounts'),
        timeEstimate: '10 minutes',
        impact: 15,
        area: 'immediate_access'
      });
    }
    
    if (preparednessData.decisionMaking.medicalPreferences < 70) {
      improvements.push({
        action: t('preparedness.improvements.documentMedicalWishes'),
        timeEstimate: '20 minutes',
        impact: 20,
        area: 'decision_making'
      });
    }
    
    if (preparednessData.longTermSecurity.legalDocuments < 80) {
      improvements.push({
        action: t('preparedness.improvements.uploadLegalDocuments'),
        timeEstimate: '15 minutes',
        impact: 25,
        area: 'long_term_security'
      });
    }

    return improvements.sort((a, b) => b.impact - a.impact)[0];
  };

  const nextImprovement = getNextImprovement();

  return (
    <div className="space-y-6">
      {/* Main Preparedness Index Card */}
      <Card className="border-2">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold">
            {t('preparedness.title')}
          </CardTitle>
          <div className="mt-4">
            <div className="text-6xl font-bold text-primary mb-2">
              {overallIndex}%
            </div>
            <p className={`text-xl font-medium ${preparednessLevel.color}`}>
              {preparednessLevel.level}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Dimension Breakdowns */}
          <div className="space-y-4">
            {/* Immediate Access */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {t('preparedness.dimensions.immediateAccess')}
                </span>
                <span className="text-sm font-medium">
                  {immediateAccessScore}%
                </span>
              </div>
              <Progress value={immediateAccessScore} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {immediateAccessScore >= 75 
                  ? t('preparedness.assessments.immediateAccess.good')
                  : t('preparedness.assessments.immediateAccess.needsWork')}
              </p>
            </div>

            {/* Decision Making */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {t('preparedness.dimensions.decisionMaking')}
                </span>
                <span className="text-sm font-medium">
                  {decisionMakingScore}%
                </span>
              </div>
              <Progress value={decisionMakingScore} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {decisionMakingScore >= 70 
                  ? t('preparedness.assessments.decisionMaking.good')
                  : t('preparedness.assessments.decisionMaking.needsWork')}
              </p>
            </div>

            {/* Long-term Security */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {t('preparedness.dimensions.longTermSecurity')}
                </span>
                <span className="text-sm font-medium">
                  {longTermSecurityScore}%
                </span>
              </div>
              <Progress value={longTermSecurityScore} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {longTermSecurityScore >= 75 
                  ? t('preparedness.assessments.longTermSecurity.good')
                  : t('preparedness.assessments.longTermSecurity.needsWork')}
              </p>
            </div>
          </div>

          {/* Next Improvement */}
          {nextImprovement && overallIndex < 90 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {t('preparedness.nextStep', { score: overallIndex + 5 })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {nextImprovement.action} ({nextImprovement.timeEstimate})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('preparedness.impact')}: {t('preparedness.familyBenefit')}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    {t('common.start')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Scenario Readiness Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {t('preparedness.scenarioReadiness')}
        </h3>
        
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="p-4">
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-lg bg-muted">
                {scenario.icon}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{scenario.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {scenario.description}
                    </p>
                  </div>
                  
                  <Badge 
                    variant={
                      scenario.familyReadiness === 'ready' ? 'default' :
                      scenario.familyReadiness === 'mostly_ready' ? 'secondary' :
                      scenario.familyReadiness === 'partially_ready' ? 'outline' :
                      'destructive'
                    }
                  >
                    {scenario.familyReadiness === 'ready' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {t(`preparedness.readiness.${scenario.familyReadiness}`)}
                  </Badge>
                </div>
                
                {scenario.gapsToAddress.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {t('preparedness.toImprove')}: {scenario.gapsToAddress.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Family Communication */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>{t('preparedness.familyCommunication.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t('preparedness.familyCommunication.description')}
          </p>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              {t('preparedness.familyCommunication.shareReport')}
            </Button>
            <Button variant="outline" size="sm">
              {t('preparedness.familyCommunication.scheduleReview')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyPreparednessIndex;
