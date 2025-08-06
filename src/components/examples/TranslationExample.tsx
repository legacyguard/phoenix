import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Example component demonstrating the usage of new translation keys
 * for assets, documents, and wills features
 */
export const TranslationExample: React.FC = () => {
  // Import translations for different features
  const { t: tAssets } = useTranslation('assets');
  const { t: tDocuments } = useTranslation('assets');
  const { t: tWills } = useTranslation('wills');
  const { t: tCommon } = useTranslation('ui');

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Translation Examples</h1>
      
      {/* Assets Vault Example */}
      <Card>
        <CardHeader>
          <CardTitle>{tAssets('vault.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{tAssets('vault.description')}</p>
          
          <div className="flex gap-2">
            <Badge variant="outline">{tAssets('categories.realEstate')}</Badge>
            <Badge variant="outline">{tAssets('categories.financial')}</Badge>
            <Badge variant="outline">{tAssets('categories.vehicles')}</Badge>
          </div>
          
          <div className="space-y-2">
            <Button>{tAssets('actions.addAsset')}</Button>
            <Button variant="outline">{tAssets('actions.viewDetails')}</Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>{tAssets('form.name')}: {tAssets('form.namePlaceholder')}</p>
            <p>{tAssets('form.type')}: {tAssets('form.selectType')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Document Management Example */}
      <Card>
        <CardHeader>
          <CardTitle>{tDocuments('management.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{tDocuments('management.description')}</p>
          
          <div className="flex gap-2">
            <Badge variant="outline">{tDocuments('categories.legal')}</Badge>
            <Badge variant="outline">{tDocuments('categories.financial')}</Badge>
            <Badge variant="outline">{tDocuments('categories.insurance')}</Badge>
          </div>
          
          <div className="space-y-2">
            <Button>{tDocuments('actions.upload')}</Button>
            <Button variant="outline">{tDocuments('actions.view')}</Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>{tDocuments('upload.dragDrop')}</p>
            <p>{tDocuments('upload.supportedFormats')}</p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm font-medium">{tDocuments('ai.analyzing')}</p>
            <p className="text-xs text-muted-foreground">{tDocuments('ai.extractedData')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Will Generator Example */}
      <Card>
        <CardHeader>
          <CardTitle>{tWills('generator.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{tWills('generator.description')}</p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">1</Badge>
              <span>{tWills('steps.personal.title')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">2</Badge>
              <span>{tWills('steps.assets.title')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">3</Badge>
              <span>{tWills('steps.beneficiaries.title')}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button>{tWills('actions.generateWill')}</Button>
            <Button variant="outline">{tWills('actions.saveProgress')}</Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>{tWills('form.personalInfo.fullName')}: {tWills('validation.nameRequired')}</p>
            <p>{tWills('form.personalInfo.dateOfBirth')}: {tWills('validation.dobRequired')}</p>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded">
            <p className="text-sm font-medium">{tWills('legal.disclaimer')}</p>
            <p className="text-xs text-muted-foreground">{tWills('legal.notLegalAdvice')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Common UI Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Common UI Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button>{tCommon('common.buttons.save')}</Button>
            <Button variant="outline">{tCommon('common.buttons.cancel')}</Button>
            <Button variant="destructive">{tCommon('common.buttons.delete')}</Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>{tCommon('common.loading')}</p>
            <p>{tCommon('common.error')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 