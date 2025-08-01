import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types';
import { documentCategories } from '@/utils/documentCategories';

interface DocumentEditModalProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentEditModal: React.FC<DocumentEditModalProps> = ({
  document,
  isOpen,
  onClose
}) => {const { t: t } = useTranslation("common");
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState(document.title);
  const [description, setDescription] = useState(document.description || '');
  const [category, setCategory] = useState(document.category);
  const [tags, setTags] = useState(document.tags?.join(', ') || '');
  const [file, setFile] = useState<File | null>(null);

  // Metadata fields
  const [contractNumber, setContractNumber] = useState(document.metadata?.contractNumber || '');
  const [contactPerson, setContactPerson] = useState(document.metadata?.contactPerson || '');
  const [contactPhone, setContactPhone] = useState(document.metadata?.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(document.metadata?.contactEmail || '');
  const [renewalDate, setRenewalDate] = useState(document.metadata?.renewalDate || '');
  const [renewalAction, setRenewalAction] = useState(document.metadata?.renewalAction || '');
  const [importanceLevel, setImportanceLevel] = useState(document.metadata?.importanceLevel || 'medium');
  const [relatedAssets, setRelatedAssets] = useState(document.metadata?.relatedAssets?.join(', ') || '');

  // Subscription fields
  const [subscriptionType, setSubscriptionType] = useState(document.subscription_type || '');
  const [renewalCost, setRenewalCost] = useState(document.renewal_cost?.toString() || '');
  const [autoRenewal, setAutoRenewal] = useState(document.auto_renewal || false);
  const [providerPhone, setProviderPhone] = useState(document.provider_contact_info?.phone || '');
  const [providerEmail, setProviderEmail] = useState(document.provider_contact_info?.email || '');
  const [providerWebsite, setProviderWebsite] = useState(document.provider_contact_info?.website || '');
  const [cancellationNoticePeriod, setCancellationNoticePeriod] = useState(
    document.cancellation_notice_period?.toString() || ''
  );

  // Reset form when document changes
  useEffect(() => {
    setTitle(document.title);
    setDescription(document.description || '');
    setCategory(document.category);
    setTags(document.tags?.join(', ') || '');
    setContractNumber(document.metadata?.contractNumber || '');
    setContactPerson(document.metadata?.contactPerson || '');
    setContactPhone(document.metadata?.contactPhone || '');
    setContactEmail(document.metadata?.contactEmail || '');
    setRenewalDate(document.metadata?.renewalDate || '');
    setRenewalAction(document.metadata?.renewalAction || '');
    setImportanceLevel(document.metadata?.importanceLevel || 'medium');
    setRelatedAssets(document.metadata?.relatedAssets?.join(', ') || '');
    setSubscriptionType(document.subscription_type || '');
    setRenewalCost(document.renewal_cost?.toString() || '');
    setAutoRenewal(document.auto_renewal || false);
    setProviderPhone(document.provider_contact_info?.phone || '');
    setProviderEmail(document.provider_contact_info?.email || '');
    setProviderWebsite(document.provider_contact_info?.website || '');
    setCancellationNoticePeriod(document.cancellation_notice_period?.toString() || '');
    setFile(null);
  }, [document]);

  const updateDocumentMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);

      try {
        let fileUrl = document.file_url;
        let fileName = document.file_name;

        // Upload new file if provided
        if (file) {
          const fileExt = file.name.split('.').pop();
          const filePath = `${document.user_id}/${Date.now()}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase.storage.
          from('documents').
          upload(filePath, file);

          if (uploadError) throw uploadError;

          // Get public URL for the new file
          const { data: urlData } = supabase.storage.
          from('documents').
          getPublicUrl(filePath);

          fileUrl = urlData.publicUrl;
          fileName = file.name;

          // Delete old file
          const oldFilePath = document.file_url.split('/documents/')[1];
          if (oldFilePath) {
            await supabase.storage.from('documents').remove([oldFilePath]);
          }
        }

        // Prepare metadata
        const metadata: any = {};
        if (contractNumber) metadata.contractNumber = contractNumber;
        if (contactPerson) metadata.contactPerson = contactPerson;
        if (contactPhone) metadata.contactPhone = contactPhone;
        if (contactEmail) metadata.contactEmail = contactEmail;
        if (renewalDate) metadata.renewalDate = renewalDate;
        if (renewalAction) metadata.renewalAction = renewalAction;
        if (importanceLevel) metadata.importanceLevel = importanceLevel;
        if (relatedAssets) {
          metadata.relatedAssets = relatedAssets.split(',').map((asset) => asset.trim()).filter(Boolean);
        }

        // Prepare provider contact info
        const providerContactInfo: any = {};
        if (providerPhone) providerContactInfo.phone = providerPhone;
        if (providerEmail) providerContactInfo.email = providerEmail;
        if (providerWebsite) providerContactInfo.website = providerWebsite;

        // Update document in database
        const { error: updateError } = await supabase.
        from('documents').
        update({
          title,
          description,
          category,
          tags: tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
          file_url: fileUrl,
          file_name: fileName,
          metadata: Object.keys(metadata).length > 0 ? metadata : null,
          subscription_type: subscriptionType || null,
          renewal_cost: renewalCost ? parseFloat(renewalCost) : null,
          auto_renewal: autoRenewal,
          provider_contact_info: Object.keys(providerContactInfo).length > 0 ? providerContactInfo : null,
          cancellation_notice_period: cancellationNoticePeriod ? parseInt(cancellationNoticePeriod) : null,
          updated_at: new Date().toISOString()
        }).
        eq('id', document.id);

        if (updateError) throw updateError;

        toast.success(t('documents.updateSuccess'));
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        onClose();
      } catch (error) {
        console.error('Error updating document:', error);
        toast.error(t('documents.updateError'));
      } finally {
        setIsLoading(false);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category) {
      toast.error(t('documents.validation.requiredFields'));
      return;
    }
    updateDocumentMutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const showSubscriptionFields = ['insurance', 'subscription', 'contract'].includes(category);
  const showMetadataFields = true; // Always show metadata fields for editing

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('documents.edit.title')}</DialogTitle>
          <DialogDescription>
            {t('documents.edit.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">{t('documents.fields.title')}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('documents.placeholders.title')}
                required />

            </div>

            <div>
              <Label htmlFor="description">{t('documents.fields.description')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('documents.placeholders.description')}
                rows={3} />

            </div>

            <div>
              <Label htmlFor="category">{t('documents.fields.category')}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('documents.placeholders.category')} />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map((cat) =>
                  <SelectItem key={cat.value} value={cat.value}>
                      {t(`documents.categories.${cat.value}`)}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">{t('documents.fields.tags')}</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t('documents.placeholders.tags')} />

            </div>

            <div>
              <Label htmlFor="file">{t('documents.edit.replaceFile')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="flex-1" />

                {file &&
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}>

                    <X className="h-4 w-4" />
                  </Button>
                }
              </div>
              {file &&
              <p className="text-sm text-muted-foreground mt-1">
                  {t('documents.edit.newFile')}: {file.name}
                </p>
              }
              {!file &&
              <p className="text-sm text-muted-foreground mt-1">
                  {t('documents.edit.currentFile')}: {document.file_name}
                </p>
              }
            </div>
          </div>

          {/* Metadata Fields */}
          {showMetadataFields &&
          <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">{t('documents.metadata.title')}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractNumber">{t('documents.metadata.contractNumber')}</Label>
                  <Input
                  id="contractNumber"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  placeholder={t('documents.metadata.contractNumberPlaceholder')} />

                </div>

                <div>
                  <Label htmlFor="importanceLevel">{t('documents.metadata.importanceLevel')}</Label>
                  <Select value={importanceLevel} onValueChange={setImportanceLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('documents.metadata.importance.low')}</SelectItem>
                      <SelectItem value="medium">{t('documents.metadata.importance.medium')}</SelectItem>
                      <SelectItem value="high">{t('documents.metadata.importance.high')}</SelectItem>
                      <SelectItem value="critical">{t('documents.metadata.importance.critical')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contactPerson">{t('documents.metadata.contactPerson')}</Label>
                  <Input
                  id="contactPerson"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder={t('documents.metadata.contactPersonPlaceholder')} />

                </div>

                <div>
                  <Label htmlFor="contactPhone">{t('documents.metadata.contactPhone')}</Label>
                  <Input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder={t('documents.metadata.contactPhonePlaceholder')} />

                </div>

                <div>
                  <Label htmlFor="contactEmail">{t('documents.metadata.contactEmail')}</Label>
                  <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder={t('documents.metadata.contactEmailPlaceholder')} />

                </div>

                <div>
                  <Label htmlFor="renewalDate">{t('documents.metadata.renewalDate')}</Label>
                  <Input
                  id="renewalDate"
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)} />

                </div>

                <div className="col-span-2">
                  <Label htmlFor="renewalAction">{t('documents.metadata.renewalAction')}</Label>
                  <Input
                  id="renewalAction"
                  value={renewalAction}
                  onChange={(e) => setRenewalAction(e.target.value)}
                  placeholder={t('documents.metadata.renewalActionPlaceholder')} />

                </div>

                <div className="col-span-2">
                  <Label htmlFor="relatedAssets">{t('documents.metadata.relatedAssets')}</Label>
                  <Input
                  id="relatedAssets"
                  value={relatedAssets}
                  onChange={(e) => setRelatedAssets(e.target.value)}
                  placeholder={t('documents.metadata.relatedAssetsPlaceholder')} />

                </div>
              </div>
            </div>
          }

          {/* Subscription Fields */}
          {showSubscriptionFields &&
          <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">{t('documents.subscription.title')}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subscriptionType">{t('documents.subscription.type')}</Label>
                  <Select value={subscriptionType} onValueChange={setSubscriptionType}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('documents.subscription.typePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{t('documents.subscription.types.monthly')}</SelectItem>
                      <SelectItem value="yearly">{t('documents.subscription.types.yearly')}</SelectItem>
                      <SelectItem value="lifetime">{t('documents.subscription.types.lifetime')}</SelectItem>
                      <SelectItem value="payPerUse">{t('documents.subscription.types.payPerUse')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="renewalCost">{t('documents.subscription.renewalCost')}</Label>
                  <Input
                  id="renewalCost"
                  type="number"
                  step={t("documents.documentEditModal.0_01_1")}
                  value={renewalCost}
                  onChange={(e) => setRenewalCost(e.target.value)}
                  placeholder={t('documents.subscription.renewalCostPlaceholder')} />

                </div>

                <div className="col-span-2 flex items-center space-x-2">
                  <Switch
                  id="autoRenewal"
                  checked={autoRenewal}
                  onCheckedChange={setAutoRenewal} />

                  <Label htmlFor="autoRenewal">{t('documents.subscription.autoRenewal')}</Label>
                </div>

                <div>
                  <Label htmlFor="providerPhone">{t('documents.subscription.providerPhone')}</Label>
                  <Input
                  id="providerPhone"
                  type="tel"
                  value={providerPhone}
                  onChange={(e) => setProviderPhone(e.target.value)}
                  placeholder={t('documents.subscription.providerPhonePlaceholder')} />

                </div>

                <div>
                  <Label htmlFor="providerEmail">{t('documents.subscription.providerEmail')}</Label>
                  <Input
                  id="providerEmail"
                  type="email"
                  value={providerEmail}
                  onChange={(e) => setProviderEmail(e.target.value)}
                  placeholder={t('documents.subscription.providerEmailPlaceholder')} />

                </div>

                <div>
                  <Label htmlFor="providerWebsite">{t('documents.subscription.providerWebsite')}</Label>
                  <Input
                  id="providerWebsite"
                  type="url"
                  value={providerWebsite}
                  onChange={(e) => setProviderWebsite(e.target.value)}
                  placeholder={t('documents.subscription.providerWebsitePlaceholder')} />

                </div>

                <div>
                  <Label htmlFor="cancellationNoticePeriod">
                    {t('documents.subscription.cancellationNoticePeriod')}
                  </Label>
                  <Input
                  id="cancellationNoticePeriod"
                  type="number"
                  value={cancellationNoticePeriod}
                  onChange={(e) => setCancellationNoticePeriod(e.target.value)}
                  placeholder={t('documents.subscription.cancellationNoticePlaceholder')} />

                </div>
              </div>
            </div>
          }

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ?
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.saving')}
                </> :

              <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('documents.edit.save')}
                </>
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>);

};