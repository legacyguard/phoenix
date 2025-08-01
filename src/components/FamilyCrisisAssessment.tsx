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
  Heart,
  Home,
  Wallet,
  Phone,
  Briefcase,
  CreditCard,
  Building,
  UserCheck } from
'lucide-react';

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

interface FamilyCrisisAssessmentProps {
  userAssets?: any[];
  userDocuments?: any[];
  userGuardians?: any[];
  userBeneficiaries?: any[];
}

export const FamilyCrisisAssessment: React.FC<FamilyCrisisAssessmentProps> = ({
  userAssets = [],
  userDocuments = [],
  userGuardians = [],
  userBeneficiaries = []
}) => {
  const { t } = useTranslation('common');

  // Define family capabilities based on concrete abilities
  const capabilities = useMemo<FamilyCapability[]>(() => {
    const hasBankAccess = userAssets.some((a) =>
    a.type?.toLowerCase().includes('bank') ||
    a.type?.toLowerCase().includes('account')
    );

    const hasInsurance = userDocuments.some((d) =>
    d.type?.toLowerCase().includes('insurance')
    );

    const hasLegalContacts = userGuardians.some((g) =>
    g.roles?.includes('lawyer') || g.roles?.includes('attorney')
    );

    const hasDigitalAccess = userDocuments.some((d) =>
    d.type?.toLowerCase().includes('password') ||
    d.type?.toLowerCase().includes('digital')
    );

    const hasMedicalDocs = userDocuments.some((d) =>
    d.type?.toLowerCase().includes('medical') ||
    d.type?.toLowerCase().includes('health')
    );

    const hasBusinessInfo = userAssets.some((a) =>
    a.type?.toLowerCase().includes('business')
    );

    const hasWillOrTrust = userDocuments.some((d) =>
    d.type?.toLowerCase().includes('will') ||
    d.type?.toLowerCase().includes('trust')
    );

    return [
    {
      id: 'pay_bills',
      capability: t('familyCapabilities.payBills'),
      status: hasBankAccess ? 'capable' : 'vulnerable',
      icon: hasBankAccess ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />,
      details: hasBankAccess ?
      t('familyCapabilities.canAccessBankAccounts') :
      t('familyCapabilities.cannotAccessBankAccounts')
    },
    {
      id: 'insurance_claims',
      capability: t('familyCapabilities.insuranceClaims'),
      status: hasInsurance ? 'capable' : 'vulnerable',
      icon: hasInsurance ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />,
      details: hasInsurance ?
      t('familyCapabilities.canFileInsuranceClaims') :
      t('familyCapabilities.cannotFileInsuranceClaims')
    },
    {
      id: 'legal_matters',
      capability: t('familyCapabilities.legalMatters'),
      status: hasLegalContacts ? 'capable' : 'vulnerable',
      icon: hasLegalContacts ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />,
      details: hasLegalContacts ?
      t('familyCapabilities.knowsLegalContacts') :
      t('familyCapabilities.noLegalContacts')
    },
    {
      id: 'digital_accounts',
      capability: t('familyCapabilities.digitalAccounts'),
      status: hasDigitalAccess ? 'capable' : 'vulnerable',
      icon: hasDigitalAccess ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />,
      details: hasDigitalAccess ?
      t('familyCapabilities.canAccessDigitalAccounts') :
      t('familyCapabilities.cannotAccessDigitalAccounts')
    },
    {
      id: 'medical_decisions',
      capability: t('familyCapabilities.medicalDecisions'),
      status: hasMedicalDocs ? 'capable' : userGuardians.length > 0 ? 'partial' : 'vulnerable',
      icon: hasMedicalDocs ?
      <CheckCircle2 className="h-5 w-5 text-green-600" /> :
      userGuardians.length > 0 ?
      <AlertTriangle className="h-5 w-5 text-yellow-600" /> :
      <XCircle className="h-5 w-5 text-red-600" />,
      details: hasMedicalDocs ?
      t('familyCapabilities.knowsMedicalWishes') :
      userGuardians.length > 0 ?
      t('familyCapabilities.partialMedicalInfo') :
      t('familyCapabilities.noMedicalInfo')
    },
    {
      id: 'business_operations',
      capability: t('familyCapabilities.businessOperations'),
      status: hasBusinessInfo && userAssets.length > 0 ? 'capable' : hasBusinessInfo ? 'partial' : 'vulnerable',
      icon: hasBusinessInfo && userAssets.length > 0 ?
      <CheckCircle2 className="h-5 w-5 text-green-600" /> :
      hasBusinessInfo ?
      <AlertTriangle className="h-5 w-5 text-yellow-600" /> :
      <XCircle className="h-5 w-5 text-red-600" />,
      details: hasBusinessInfo && userAssets.length > 0 ?
      t('familyCapabilities.canManageBusiness') :
      hasBusinessInfo ?
      t('familyCapabilities.partialBusinessInfo') :
      t('familyCapabilities.noBusinessInfo')
    },
    {
      id: 'inheritance',
      capability: t('familyCapabilities.inheritance'),
      status: hasWillOrTrust && userBeneficiaries.length > 0 ? 'capable' : userBeneficiaries.length > 0 ? 'partial' : 'vulnerable',
      icon: hasWillOrTrust && userBeneficiaries.length > 0 ?
      <CheckCircle2 className="h-5 w-5 text-green-600" /> :
      userBeneficiaries.length > 0 ?
      <AlertTriangle className="h-5 w-5 text-yellow-600" /> :
      <XCircle className="h-5 w-5 text-red-600" />,
      details: hasWillOrTrust && userBeneficiaries.length > 0 ?
      t('familyCapabilities.clearInheritancePlan') :
      userBeneficiaries.length > 0 ?
      t('familyCapabilities.partialInheritancePlan') :
      t('familyCapabilities.noInheritancePlan')
    }];

  }, [userAssets, userDocuments, userGuardians, userBeneficiaries]);

  // Define crisis situations and check preparedness
  const crisisSituations = useMemo<CrisisSituation[]>(() => {
    const capabilityMap = Object.fromEntries(capabilities.map((c) => [c.id, c.status]));

    return [
    {
      id: 'emergency_hospital',
      title: t('crisisSituations.emergencyHospital.title'),
      description: t('crisisSituations.emergencyHospital.description'),
      icon: <Heart className="h-5 w-5" />,
      requiredCapabilities: ['pay_bills', 'insurance_claims', 'medical_decisions'],
      isPrepared: ['pay_bills', 'insurance_claims', 'medical_decisions'].every(
        (cap) => capabilityMap[cap] === 'capable' || capabilityMap[cap] === 'partial'
      ),
      missingCapabilities: ['pay_bills', 'insurance_claims', 'medical_decisions'].filter(
        (cap) => capabilityMap[cap] === 'vulnerable'
      )
    },
    {
      id: 'sudden_death',
      title: t('crisisSituations.suddenDeath.title'),
      description: t('crisisSituations.suddenDeath.description'),
      icon: <AlertCircle className="h-5 w-5" />,
      requiredCapabilities: ['pay_bills', 'insurance_claims', 'legal_matters', 'digital_accounts', 'inheritance'],
      isPrepared: ['pay_bills', 'insurance_claims', 'legal_matters', 'digital_accounts', 'inheritance'].every(
        (cap) => capabilityMap[cap] === 'capable'
      ),
      missingCapabilities: ['pay_bills', 'insurance_claims', 'legal_matters', 'digital_accounts', 'inheritance'].filter(
        (cap) => capabilityMap[cap] !== 'capable'
      )
    },
    {
      id: 'extended_travel',
      title: t('crisisSituations.extendedTravel.title'),
      description: t('crisisSituations.extendedTravel.description'),
      icon: <Clock className="h-5 w-5" />,
      requiredCapabilities: ['pay_bills', 'digital_accounts'],
      isPrepared: ['pay_bills', 'digital_accounts'].every(
        (cap) => capabilityMap[cap] === 'capable' || capabilityMap[cap] === 'partial'
      ),
      missingCapabilities: ['pay_bills', 'digital_accounts'].filter(
        (cap) => capabilityMap[cap] === 'vulnerable'
      )
    },
    {
      id: 'business_emergency',
      title: t('crisisSituations.businessEmergency.title'),
      description: t('crisisSituations.businessEmergency.description'),
      icon: <Briefcase className="h-5 w-5" />,
      requiredCapabilities: ['business_operations', 'pay_bills', 'legal_matters'],
      isPrepared: ['business_operations', 'pay_bills', 'legal_matters'].every(
        (cap) => capabilityMap[cap] === 'capable' || capabilityMap[cap] === 'partial'
      ),
      missingCapabilities: ['business_operations', 'pay_bills', 'legal_matters'].filter(
        (cap) => capabilityMap[cap] === 'vulnerable'
      )
    }];

  }, [capabilities, t]);

  // Calculate summary statistics
  const preparedSituationsCount = crisisSituations.filter((s) => s.isPrepared).length;
  const criticalVulnerabilities = capabilities.filter((c) => c.status === 'vulnerable').length;
  const partialCapabilities = capabilities.filter((c) => c.status === 'partial').length;

  // Get most critical missing capability
  const getMostCriticalGap = () => {
    const vulnerableCapabilities = capabilities.filter((c) => c.status === 'vulnerable');
    if (vulnerableCapabilities.length === 0) return null;

    // Prioritize based on impact
    const priorityOrder = ['pay_bills', 'medical_decisions', 'insurance_claims', 'legal_matters', 'digital_accounts', 'inheritance', 'business_operations'];

    return vulnerableCapabilities.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.id);
      const bIndex = priorityOrder.indexOf(b.id);
      return aIndex - bIndex;
    })[0];
  };

  const mostCriticalGap = getMostCriticalGap();

  return (
    <div className="space-y-6">
      {/* Main Crisis Assessment Card */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">
            {t('crisisAssessment.title')}
          </CardTitle>
          <CardDescription className="mt-2 text-base">
            {t('crisisAssessment.subtitle', {
              prepared: preparedSituationsCount,
              total: crisisSituations.length
            })}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Critical Vulnerabilities Alert */}
          {criticalVulnerabilities > 0 &&
          <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">
                <span className="font-medium">
                  {t('crisisAssessment.criticalVulnerabilities', { count: criticalVulnerabilities })}
                </span>
                {mostCriticalGap &&
              <span className="block mt-1">
                    {t('crisisAssessment.mostUrgent')}: {mostCriticalGap.capability}
                  </span>
              }
              </AlertDescription>
            </Alert>
          }

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600">{capabilities.filter((c) => c.status === 'capable').length}</p>
              <p className="text-sm text-muted-foreground">{t('crisisAssessment.protected')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-yellow-600">{partialCapabilities}</p>
              <p className="text-sm text-muted-foreground">{t('crisisAssessment.partial')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-red-600">{criticalVulnerabilities}</p>
              <p className="text-sm text-muted-foreground">{t('crisisAssessment.vulnerable')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Capabilities List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('crisisAssessment.familyCapabilities')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {capabilities.map((capability) =>
          <div key={capability.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
              {capability.icon}
              <div className="flex-1">
                <p className="font-medium text-sm">{capability.capability}</p>
                {capability.details &&
              <p className="text-sm text-muted-foreground mt-1">{capability.details}</p>
              }
              </div>
              {capability.status === 'vulnerable' &&
            <Button size="sm" variant="outline">
                  {t('common.fix')}
                </Button>
            }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Crisis Situations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {t('crisisAssessment.situationReadiness')}
        </h3>
        
        {crisisSituations.map((situation) =>
        <Card key={situation.id} className={situation.isPrepared ? 'border-green-200' : 'border-red-200'}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${situation.isPrepared ? 'bg-green-100' : 'bg-red-100'}`}>
                  {situation.icon}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{situation.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {situation.description}
                      </p>
                    </div>
                    
                    <Badge
                    variant={situation.isPrepared ? 'default' : 'destructive'}
                    className="ml-2">

                      {situation.isPrepared ?
                    <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t('crisisAssessment.prepared')}
                        </> :

                    <>
                          <XCircle className="h-3 w-3 mr-1" />
                          {t('crisisAssessment.notPrepared')}
                        </>
                    }
                    </Badge>
                  </div>
                  
                  {situation.missingCapabilities.length > 0 &&
                <div className="text-sm">
                      <span className="text-muted-foreground">{t('crisisAssessment.missing')}: </span>
                      <span className="text-red-600 font-medium">
                        {situation.missingCapabilities.map((capId) =>
                    capabilities.find((c) => c.id === capId)?.capability
                    ).filter(Boolean).join(', ')}
                      </span>
                    </div>
                }
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Next Critical Action */}
      {mostCriticalGap &&
      <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm text-red-900">
                  {t('crisisAssessment.nextCriticalAction')}
                </p>
                <p className="text-sm text-red-700 mt-1">
                  {t('crisisAssessment.fixCapability', { capability: mostCriticalGap.capability })}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {t('crisisAssessment.timeEstimate')}{t("familyCrisisAssessment.15_1")}{t('common.minutes')}
                </p>
              </div>
              <Button size="sm" variant="destructive">
                {t('crisisAssessment.fixNow')}
              </Button>
            </div>
          </CardContent>
        </Card>
      }

      {/* Family Communication */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>{t('crisisAssessment.familyDiscussion')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t('crisisAssessment.familyDiscussionDescription')}
          </p>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              {t('crisisAssessment.printReport')}
            </Button>
            <Button variant="outline" size="sm">
              {t('crisisAssessment.scheduleReview')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default FamilyCrisisAssessment;