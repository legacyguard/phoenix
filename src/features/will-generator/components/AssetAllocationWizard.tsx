import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Beneficiary, AssetAllocation } from '@/types/will';

interface AssetAllocationWizardProps {
  beneficiaries: Beneficiary[];
  onUpdate: (beneficiaries: Beneficiary[]) => void;
  errors: Record<string, string>;
}

export function AssetAllocationWizard({
  beneficiaries,
  onUpdate,
  errors
}: AssetAllocationWizardProps) {
  const { t } = useTranslation();
  const [allocationType, setAllocationType] = useState<'percentage' | 'specific'>('percentage');

  const getTotalAllocation = () => {
    return beneficiaries.reduce((sum, b) => {
      const percentageAllocation = b.allocation
        .filter(a => a.assetType === 'percentage')
        .reduce((s, a) => s + (a.value || 0), 0);
      return sum + percentageAllocation;
    }, 0);
  };

  const handleAddBeneficiary = () => {
    const newBeneficiary: Beneficiary = {
      id: Date.now().toString(),
      name: '',
      relationship: '',
      allocation: [{
        assetType: 'percentage',
        description: t('will.allocation.generalEstate'),
        value: 0
      }]
    };
    onUpdate([...beneficiaries, newBeneficiary]);
  };

  const handleRemoveBeneficiary = (id: string) => {
    onUpdate(beneficiaries.filter(b => b.id !== id));
  };

  const handleBeneficiaryUpdate = (id: string, updates: Partial<Beneficiary>) => {
    onUpdate(beneficiaries.map(b => 
      b.id === id ? { ...b, ...updates } : b
    ));
  };

  const handleAllocationUpdate = (beneficiaryId: string, value: number) => {
    onUpdate(beneficiaries.map(b => {
      if (b.id === beneficiaryId) {
        const updatedAllocation = b.allocation.map(a => 
          a.assetType === 'percentage' 
            ? { ...a, value } 
            : a
        );
        return { ...b, allocation: updatedAllocation };
      }
      return b;
    }));
  };

  const totalAllocation = getTotalAllocation();
  const isValid = totalAllocation === 100 || beneficiaries.length === 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('will.allocation.title')}</CardTitle>
          <CardDescription>
            {t('will.allocation.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Allocation progress */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{t('will.allocation.total')}</span>
              <span className={`font-medium ${isValid ? 'text-green-600' : 'text-destructive'}`}>
                {totalAllocation}%
              </span>
            </div>
            <Progress 
              value={Math.min(totalAllocation, 100)} 
              className={`h-2 ${totalAllocation > 100 ? '[&>div]:bg-destructive' : ''}`}
            />
            {!isValid && totalAllocation > 0 && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.allocation || t('will.validation.allocation100')}
              </p>
            )}
          </div>

          {/* Beneficiaries list */}
          <div className="space-y-4">
            {beneficiaries.map((beneficiary, index) => (
              <Card key={beneficiary.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`name-${beneficiary.id}`}>
                              {t('will.beneficiary.name')}
                            </Label>
                            <Input
                              id={`name-${beneficiary.id}`}
                              value={beneficiary.name}
                              onChange={(e) => handleBeneficiaryUpdate(
                                beneficiary.id, 
                                { name: e.target.value }
                              )}
                              placeholder={t('will.beneficiary.namePlaceholder')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`relationship-${beneficiary.id}`}>
                              {t('will.beneficiary.relationship')}
                            </Label>
                            <Input
                              id={`relationship-${beneficiary.id}`}
                              value={beneficiary.relationship}
                              onChange={(e) => handleBeneficiaryUpdate(
                                beneficiary.id, 
                                { relationship: e.target.value }
                              )}
                              placeholder={t('will.beneficiary.relationshipPlaceholder')}
                            />
                          </div>
                        </div>

                        {allocationType === 'percentage' && (
                          <div className="space-y-2">
                            <Label htmlFor={`allocation-${beneficiary.id}`}>
                              {t('will.allocation.percentage')}
                            </Label>
                            <div className="flex items-center gap-4">
                              <Slider
                                id={`allocation-${beneficiary.id}`}
                                value={[beneficiary.allocation[0]?.value || 0]}
                                onValueChange={([value]) => handleAllocationUpdate(beneficiary.id, value)}
                                min={0}
                                max={100}
                                step={1}
                                className="flex-1"
                              />
                              <div className="w-16">
                                <Input
                                  type="number"
                                  value={beneficiary.allocation[0]?.value || 0}
                                  onChange={(e) => handleAllocationUpdate(
                                    beneficiary.id, 
                                    parseInt(e.target.value) || 0
                                  )}
                                  min={0}
                                  max={100}
                                  className="text-center"
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">%</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveBeneficiary(beneficiary.id)}
                        className="ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add beneficiary button */}
          <Button
            variant="outline"
            onClick={handleAddBeneficiary}
            className="w-full mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('will.allocation.addBeneficiary')}
          </Button>

          {errors.beneficiaries && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.beneficiaries}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Allocation tips */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">{t('will.allocation.tips.title')}</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {t('will.allocation.tips.tip1')}</li>
            <li>• {t('will.allocation.tips.tip2')}</li>
            <li>• {t('will.allocation.tips.tip3')}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
