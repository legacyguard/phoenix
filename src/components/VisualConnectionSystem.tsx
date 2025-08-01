import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VisualConnectionSystemProps {
  userAssets?: any[];
  userDocuments?: any[];
  userGuardians?: any[];
  userBeneficiaries?: any[];
}

const VisualConnectionSystem: React.FC<VisualConnectionSystemProps> = ({
  userAssets = [],
  userDocuments = [],
  userGuardians = [],
  userBeneficiaries = []
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            {t('visualConnectionSystem.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">Visual Connection System</p>
              <p className="text-sm">Flowchart component will be implemented here</p>
              <div className="mt-4 space-y-2 text-xs">
                <p>• Home to Finances: Medium connection strength</p>
                <p>• Finances to Family: Strong connection strength</p>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline">
              {t('visualConnectionSystem.exploreConnections')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualConnectionSystem;
