import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  AlertCircle,
  Briefcase
} from 'lucide-react';

interface WhatIfScenariosProps {
  userAssets?: Array<Record<string, unknown>>;
  userDocuments?: Array<Record<string, unknown>>;
  userGuardians?: Array<Record<string, unknown>>;
  userBeneficiaries?: Array<Record<string, unknown>>;
}

interface Scenario {
  id: string;
  title: string;
  duration: string;
  needs: string[];
  requirements: string[];
  impact: string;
  readiness: number;
  gaps: string[];
  icon: React.ReactNode;
}

export const WhatIfScenarios: React.FC<WhatIfScenariosProps> = ({
  userAssets = [],
  userDocuments = [],
  userGuardians = [],
  userBeneficiaries = []
}) => {
  const { t } = useTranslation('ui-common');

  // Define scenarios
  const scenarios: Scenario[] = useMemo(() => [
    {
      id: 'hospital_stay',
      title: t('whatIfScenarios.hospitalStay.title'),
      duration: '2-4 weeks',
      needs: ['Bill paying', 'Medical decisions', 'Work communication'],
      requirements: ['Bank access', 'Medical preferences', 'Emergency contacts'],
      impact: t('whatIfScenarios.hospitalStay.impact'),
      readiness: 82,
      gaps: ['Power of attorney documents'],
      icon: <Heart />
    },
    {
      id: 'business_travel',
      title: t('whatIfScenarios.businessTravel.title'),
      duration: '2-3 months',
      needs: ['Household management', 'Financial decisions', 'Emergency handling'],
      requirements: ['Account access', 'Family communication protocols', 'Emergency procedures'],
      impact: t('whatIfScenarios.businessTravel.impact'),
      readiness: 75,
      gaps: ['Emergency contact list'],
      icon: <Briefcase />
    },
    {
      id: 'sudden_death',
      title: t('whatIfScenarios.suddenDeath.title'),
      duration: 'Immediate and long-term',
      needs: ['Immediate access', 'Legal procedures', 'Long-term financial security'],
      requirements: ['Complete preparation across all life areas'],
      impact: t('whatIfScenarios.suddenDeath.impact'),
      readiness: 60,
      gaps: ['Legal documents', 'Inheritance planning'],
      icon: <AlertCircle />
    },
    {
      id: 'disability_incapacity',
      title: t('whatIfScenarios.disabilityIncapacity.title'),
      duration: '6 months to permanent',
      needs: ['Medical decisions', 'Financial management', 'Care coordination'],
      requirements: ['Power of attorney', 'Medical directives', 'Financial access'],
      impact: t('whatIfScenarios.disabilityIncapacity.impact'),
      readiness: 68,
      gaps: ['Medical directives'],
      icon: <AlertTriangle />
    }
  ], [t]);

  return (
    <div className="space-y-6">
      {scenarios.map((scenario) => (
        <Card key={scenario.id} className="border">
          <CardHeader className="pb-4 flex items-center space-x-3">
            <div className="p-2 bg-muted rounded-lg">
              {scenario.icon}
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-medium">
                {scenario.title}
              </CardTitle>
              <CardDescription>
                {scenario.impact}
              </CardDescription>
              <div className="text-sm text-muted mt-2">
                {t('whatIfScenarios.readiness', { readiness: scenario.readiness })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>{t('whatIfScenarios.duration', { duration: scenario.duration })}</p>
              <p>{t('whatIfScenarios.needs', { needs: scenario.needs.join(', ') })}</p>
              <p>{t('whatIfScenarios.requirements', { requirements: scenario.requirements.join(', ') })}</p>
              <p className="text-orange-600">
                {t('whatIfScenarios.missing', { gaps: scenario.gaps.join(', ') })}
              </p>
            </div>
            <div className="mt-4 flex space-x-3">
              <Button variant="outline">{t('ui.improveReadiness')}</Button>
              <Button variant="outline">{t('ui.viewDetails')}</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WhatIfScenarios;
