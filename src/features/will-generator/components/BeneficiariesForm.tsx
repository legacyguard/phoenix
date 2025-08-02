import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Beneficiary } from '@/types/will';

interface BeneficiariesFormProps {
  beneficiaries: Beneficiary[];
  onUpdate: (beneficiaries: Beneficiary[]) => void;
  errors: Record<string, string>;
}

export function BeneficiariesForm({
  beneficiaries,
  onUpdate,
  errors
}: BeneficiariesFormProps) {
  const { t } = useTranslation();

  const handleBeneficiaryUpdate = (id: string, updates: Partial<Beneficiary>) => {
    onUpdate(beneficiaries.map(b => 
      b.id === id ? { ...b, ...updates } : b
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('will.beneficiaries.title')}
          </CardTitle>
          <CardDescription>
            {t('will.beneficiaries.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {beneficiaries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p>{t('will.beneficiaries.noBeneficiaries')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {beneficiaries.map((beneficiary, index) => (
                <Card key={beneficiary.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">
                        {t('will.beneficiaries.beneficiaryNumber', { number: index + 1 })}
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`id-${beneficiary.id}`}>
                            {t('will.beneficiaries.identification')}
                          </Label>
                          <Input
                            id={`id-${beneficiary.id}`}
                            value={beneficiary.identification || ''}
                            onChange={(e) => handleBeneficiaryUpdate(
                              beneficiary.id,
                              { identification: e.target.value }
                            )}
                            placeholder={t('will.beneficiaries.identificationPlaceholder')}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`alt-${beneficiary.id}`}>
                            {t('will.beneficiaries.alternativeBeneficiary')}
                          </Label>
                          <Input
                            id={`alt-${beneficiary.id}`}
                            value={beneficiary.alternativeBeneficiary || ''}
                            onChange={(e) => handleBeneficiaryUpdate(
                              beneficiary.id,
                              { alternativeBeneficiary: e.target.value }
                            )}
                            placeholder={t('will.beneficiaries.alternativePlaceholder')}
                          />
                        </div>
                      </div>

                      {/* Display current allocation */}
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm font-medium mb-2">
                          {t('will.beneficiaries.currentAllocation')}
                        </p>
                        {beneficiary.allocation.map((alloc, allocIndex) => (
                          <div key={allocIndex} className="text-sm text-muted-foreground">
                            {alloc.assetType === 'percentage' ? (
                              <span>{alloc.value}% {t('will.beneficiaries.ofEstate')}</span>
                            ) : (
                              <span>{alloc.description}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Show validation errors */}
                      {errors[`beneficiary_${index}_name`] && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors[`beneficiary_${index}_name`]}
                        </p>
                      )}
                      {errors[`beneficiary_${index}_relationship`] && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors[`beneficiary_${index}_relationship`]}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional instructions */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">{t('will.beneficiaries.importantNotes')}</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {t('will.beneficiaries.note1')}</li>
            <li>• {t('will.beneficiaries.note2')}</li>
            <li>• {t('will.beneficiaries.note3')}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
