import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Upload, FileText, AlertCircle, Phone, Mail, User, DollarSign, Globe, RotateCw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { COUNTRY_CONFIGS } from '@/config/countries';
import { useCountry } from '@/hooks/useCountry';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { useRetry } from '@/utils/retry';
import { RetryStatus } from '@/components/common/RetryStatus';
import { toast } from 'sonner';
import { MAX_FILE_SIZES } from '@/utils/constants';
import { useUserPlan } from '@/hooks/useUserPlan';
import { AsyncErrorBoundary } from '@/components/common/AsyncErrorBoundary';
import { documentFormSchema, type DocumentFormData } from '@/schemas/documentSchema';
import { FormField } from '@/components/ui/form-field';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { useStorageUsage } from '@/hooks/useStorageUsage';
import { canAddFile, formatBytes } from '@/utils/planLimits';

interface DocumentUploadProps {
  onDocumentUploaded: (document: Record<string, unknown>) => void;
  onCancel: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentUploaded, onCancel }) => {
  // Translation hook for internationalization
  const { t } = useTranslation('common');
  const { selectedCountryCode } = useCountry();

  const { plan } = useUserPlan();
  const { storageUsage } = useStorageUsage();

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);

  // Form state
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [countryCode, setCountryCode] = useState(selectedCountryCode);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);

  // New metadata fields
  const [contractNumber, setContractNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [renewalDate, setRenewalDate] = useState<Date | null>(null);
  const [renewalAction, setRenewalAction] = useState('');
  const [importanceLevel, setImportanceLevel] = useState<'critical' | 'important' | 'reference'>('reference');
  const [relatedAssets, setRelatedAssets] = useState<string[]>([]);

  // Subscription tracking fields
  const [subscriptionType, setSubscriptionType] = useState<'monthly' | 'yearly' | 'one-time' | 'none'>('none');
  const [renewalCost, setRenewalCost] = useState('');
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [providerContactInfo, setProviderContactInfo] = useState({
    phone: '',
    email: '',
    website: ''
  });
  const [cancellationNoticePeriod, setCancellationNoticePeriod] = useState<0 | 30 | 60 | 90>(0);

  const [showForm, setShowForm] = useState(false);

  // Validation state
  const [nameError, setNameError] = useState('');

  // Debounced validation for document name
  const validateDocumentName = useDebouncedCallback((name: string) => {
    if (!name.trim()) {
      setNameError(t('validation.errors.fieldRequired', { field: t('dashboard.documentName') }));
    } else if (name.trim().length < 2) {
      setNameError(t('validation.errors.nameMinLength'));
    } else if (name.trim().length > 255) {
      setNameError(t('validation.errors.nameMaxLength', { max: 255 }));
    } else {
      setNameError('');
    }
  }, 300);

  // Cleanup on unmount
  useEffect(() => {
     
    return () => {
      // Reset states if component unmounts during upload
      if (isUploading) {
        setIsUploading(false);
        setUploadProgress(0);
      }
    };
  }, [isUploading]);

  const documentTypes = [
  { key: 'realEstateDeed', value: t('documentTypes.realEstateDeed'), suggestContact: true },
  { key: 'birthCertificate', value: t('documentTypes.birthCertificate') },
  { key: 'insurancePolicy', value: t('documentTypes.insurancePolicy'), suggestContact: true, suggestRenewal: true, suggestSubscription: true },
  { key: 'lastWill', value: t('documentTypes.lastWill'), suggestContact: true },
  { key: 'employmentContract', value: t('documentTypes.employmentContract'), suggestContact: true },
  { key: 'passport', value: t('documentTypes.passport'), suggestRenewal: true },
  { key: 'drivingLicense', value: t('documentTypes.drivingLicense'), suggestRenewal: true },
  { key: 'bankStatement', value: t('documentTypes.bankStatement'), suggestContact: true, suggestSubscription: true },
  { key: 'investmentCertificate', value: t('documentTypes.investmentCertificate'), suggestContact: true },
  { key: 'energyContract', value: t('documentTypes.energyContract'), suggestContact: true, suggestRenewal: true, suggestSubscription: true },
  { key: 'softwareLicense', value: t('documentTypes.softwareLicense'), suggestRenewal: true, suggestSubscription: true },
  { key: 'subscriptionService', value: t('documentTypes.subscriptionService'), suggestContact: true, suggestRenewal: true, suggestSubscription: true },
  { key: 'other', value: t('documentTypes.other') }];


  // Get metadata suggestions based on document type
  const getMetadataSuggestions = (type: string) => {
    const docType = documentTypes.find((dt) => dt.value === type);
    return {
      showContact: docType?.suggestContact || false,
      showRenewal: docType?.suggestRenewal || false,
      showSubscription: docType?.suggestSubscription || false
    };
  };

  const supportedCountries = Object.values(COUNTRY_CONFIGS);

  const handleFileSelect = useCallback((selectedFile: File) => {
    const maxFileSize = MAX_FILE_SIZES[plan];

    // Check file size
    if (selectedFile.size > maxFileSize) {
      const maxSizeMB = maxFileSize / (1024 * 1024);
      toast.error(t('documentUpload.fileTooLarge', { maxSize: maxSizeMB }));
      return;
    }

    // Check if adding this file would exceed storage limit
    if (storageUsage && !canAddFile(storageUsage.used, selectedFile.size, plan)) {
      toast.error(t('documentUpload.storageLimitReached', {
        remaining: formatBytes(storageUsage.remaining),
        fileSize: formatBytes(selectedFile.size)
      }));
      return;
    }

    setFile(selectedFile);
    if (!documentName) {
      // Auto-set document name from filename
      const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, '');
      setDocumentName(nameWithoutExtension);
    }
  }, [documentName, plan, storageUsage, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
     
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
     
    e.preventDefault();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
     
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const uploadFile = async () => {
    if (!file) return null;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Simulate progress updates for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          // Increment by 10% every 200ms, slowing down as it progresses
          const increment = Math.max(1, Math.floor((90 - prev) / 10));
          return Math.min(90, prev + increment);
        });
      }, 200);

      // Upload file to Supabase storage
      const { data, error } = await supabaseWithRetry.storage.
      from('documents').
      upload(filePath, file);

      if (error) {
        clearInterval(progressInterval);
        throw error;
      }

      // Clear interval and set to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadedFilePath(data.path);

      // Small delay to show 100% before transitioning
      await new Promise((resolve) => setTimeout(resolve, 300));

      setShowForm(true);
      toast.success(t('documentUpload.fileUploadedSuccess'));

      return data.path;
    } catch (error: Record<string, unknown>) {
      const timestamp = new Date().toISOString();
      const errorDetails = error?.message || 'Unknown error';
      const errorCode = error?.code || 'UNKNOWN_ERROR';

      // Detailed logging for debugging
      console.error('[DocumentUpload] Error during file upload:', {
        timestamp,
        operation: 'uploadFile',
        errorCode,
        errorMessage: errorDetails,
        errorDetails: error,
        stack: error?.stack
      });

      let errorMessage = t('documentUpload.fileUploadFailed');
      if (error instanceof Error) {
        if (error.message.includes('storage')) {
          errorMessage = t('documentUpload.fileUploadFailed');
        } else if (error.message.includes('network')) {
          errorMessage = t('documentUpload.fileUploadFailed');
        }
      }

      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!uploadedFilePath || !documentName.trim() || !documentType) {
      toast.error(t('documentUpload.fillRequiredFields'));
      return;
    }

    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) {
        toast.error(t('documentUpload.loginToSave'));
        return;
      }

      const { data, error } = await supabaseWithRetry.
      from('documents').
      insert({
        user_id: user.id,
        name: documentName.trim(),
        type: documentType,
        country_code: countryCode,
        file_path: uploadedFilePath,
        file_size: file?.size || 0,
        mime_type: file?.type || '',
        expiration_date: expirationDate ? format(expirationDate, 'yyyy-MM-dd') : null,
        contract_number: contractNumber || null,
        contact_person: contactPerson || null,
        contact_phone: contactPhone || null,
        contact_email: contactEmail || null,
        renewal_date: renewalDate ? format(renewalDate, 'yyyy-MM-dd') : null,
        renewal_action: renewalAction || null,
        importance_level: importanceLevel,
        related_assets: relatedAssets.length > 0 ? relatedAssets : null,
        // Subscription tracking fields
        subscription_type: subscriptionType,
        renewal_cost: renewalCost ? parseFloat(renewalCost) : null,
        auto_renewal: autoRenewal,
        provider_contact_info: providerContactInfo.phone || providerContactInfo.email || providerContactInfo.website ?
        providerContactInfo :
        null,
        cancellation_notice_period: cancellationNoticePeriod || null
      }).
      select().
      single();

      if (error) {
        throw error;
      }

      toast.success(t('documentUpload.saved'));
      onDocumentUploaded(data);
    } catch (error: Record<string, unknown>) {
      const timestamp = new Date().toISOString();
      const errorMessage = error?.message || 'Unknown error';
      const errorCode = error?.code || 'UNKNOWN_ERROR';

      // Detailed logging for debugging
      console.error('[DocumentUpload] Error saving document:', {
        timestamp,
        operation: 'handleSaveDocument',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });

      toast.error(t('documentUpload.failedSave'));
    }
  };

  if (showForm) {
    return (
      <AsyncErrorBoundary>
      <div className="space-y-6">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-primary mb-4" />
          <h3 className="text-lg font-semibold">{t('documentUpload.detailsTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('documentUpload.detailsSubtitle')}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentName">{t('dashboard.documentName')}</Label>
            <Input
                id="documentName"
                placeholder={t('documentUpload.namePlaceholder')}
                value={documentName}
                onChange={(e) => {
                  const value = e.target.value;
                  setDocumentName(value);
                  validateDocumentName(value);
                }}
                className={nameError ? 'border-red-500' : ''} />

            {nameError &&
              <p className="text-sm text-red-500">{nameError}</p>
              }
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentType">{t('dashboard.documentType')}</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder={t('documentUpload.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) =>
                  <SelectItem key={type.key} value={type.value}>
                    {type.value}
                  </SelectItem>
                  )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Importance Level */}
          <div className="space-y-2">
            <Label>{t('dashboard.metadata.importanceLevel')}</Label>
            <RadioGroup value={importanceLevel} onValueChange={(value) => setImportanceLevel(value as 'critical' | 'important' | 'reference')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="critical" id="critical" />
                <Label htmlFor="critical" className="font-normal cursor-pointer">
                  {t('dashboard.metadata.importance.critical')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="important" id="important" />
                <Label htmlFor="important" className="font-normal cursor-pointer">
                  {t('dashboard.metadata.importance.important')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reference" id="reference" />
                <Label htmlFor="reference" className="font-normal cursor-pointer">
                  {t('dashboard.metadata.importance.reference')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryCode">{t('dashboard.countryOfRelevance')}</Label>
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger>
                <SelectValue placeholder={t('documentUpload.countryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {supportedCountries.map((country) =>
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                  )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('dashboard.expirationDate')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expirationDate && "text-muted-foreground"
                    )}>

                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expirationDate ? format(expirationDate, "PPP") : <span>{t('documentUpload.pickDate')}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={expirationDate}
                    onSelect={setExpirationDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")} />

              </PopoverContent>
            </Popover>
          </div>
          
          {/* Contract Number */}
          <div className="space-y-2">
            <Label htmlFor="contractNumber">{t('dashboard.metadata.contractNumber')}</Label>
            <Input
                id="contractNumber"
                placeholder={t('dashboard.metadata.contractNumberPlaceholder')}
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)} />

          </div>
          
          {/* Contact Information Section */}
          {getMetadataSuggestions(documentType).showContact &&
            <>
              <Alert className="border-primary/20 bg-primary/5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('dashboard.metadata.contactSuggestion')}
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">
                    <User className="inline h-3 w-3 mr-1" />
                    {t('dashboard.metadata.contactPerson')}
                  </Label>
                  <Input
                    id="contactPerson"
                    placeholder={t('dashboard.metadata.contactPersonPlaceholder')}
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)} />

                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">
                    <Phone className="inline h-3 w-3 mr-1" />
                    {t('dashboard.metadata.contactPhone')}
                  </Label>
                  <Input
                    id="contactPhone"
                    placeholder={t('dashboard.metadata.contactPhonePlaceholder')}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)} />

                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">
                  <Mail className="inline h-3 w-3 mr-1" />
                  {t('dashboard.metadata.contactEmail')}
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder={t('dashboard.metadata.contactEmailPlaceholder')}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)} />

              </div>
            </>
            }
          
          {/* Renewal Section */}
          {getMetadataSuggestions(documentType).showRenewal &&
            <>
              <Alert className="border-primary/20 bg-primary/5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('dashboard.metadata.renewalSuggestion')}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label>{t('dashboard.metadata.renewalDate')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !renewalDate && "text-muted-foreground"
                      )}>

                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {renewalDate ? format(renewalDate, "PPP") : <span>{t('dashboard.metadata.pickRenewalDate')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={renewalDate}
                      onSelect={setRenewalDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className={cn("p-3 pointer-events-auto")} />

                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="renewalAction">{t('dashboard.metadata.renewalAction')}</Label>
                <Textarea
                  id="renewalAction"
                  placeholder={t('dashboard.metadata.renewalActionPlaceholder')}
                  value={renewalAction}
                  onChange={(e) => setRenewalAction(e.target.value)}
                  rows={2} />

              </div>
            </>
            }
          
          {/* Subscription Tracking Section */}
          {getMetadataSuggestions(documentType).showSubscription &&
            <>
              <Alert className="border-primary/20 bg-primary/5">
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  {t('dashboard.subscription.trackingSuggestion')}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('dashboard.subscription.type')}</Label>
                  <Select value={subscriptionType} onValueChange={(value) => setSubscriptionType(value as 'none' | 'monthly' | 'yearly' | 'one-time')}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('dashboard.subscription.typePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('dashboard.subscription.types.none')}</SelectItem>
                      <SelectItem value="monthly">{t('dashboard.subscription.types.monthly')}</SelectItem>
                      <SelectItem value="yearly">{t('dashboard.subscription.types.yearly')}</SelectItem>
                      <SelectItem value="one-time">{t('dashboard.subscription.types.oneTime')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {subscriptionType !== 'none' && subscriptionType !== 'one-time' &&
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="renewalCost">
                          <DollarSign className="inline h-3 w-3 mr-1" />
                          {t('dashboard.subscription.renewalCost')}
                        </Label>
                        <Input
                        id="renewalCost"
                        type="number"
                        step={t("documents.documentEditModal.0_01_1")}
                        placeholder={t('dashboard.subscription.renewalCostPlaceholder')}
                        value={renewalCost}
                        onChange={(e) => setRenewalCost(e.target.value)} />

                      </div>
                      
                      <div className="space-y-2">
                        <Label>{t('dashboard.subscription.cancellationNotice')}</Label>
                        <Select value={cancellationNoticePeriod.toString()} onValueChange={(value) => setCancellationNoticePeriod(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">{t('dashboard.subscription.noNoticeRequired')}</SelectItem>
                            <SelectItem value="30">{t('dashboard.subscription.days', { count: 30 })}</SelectItem>
                            <SelectItem value="60">{t('dashboard.subscription.days', { count: 60 })}</SelectItem>
                            <SelectItem value="90">{t('dashboard.subscription.days', { count: 90 })}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                      id="auto-renewal"
                      checked={autoRenewal}
                      onCheckedChange={setAutoRenewal} />

                      <Label htmlFor="auto-renewal" className="font-normal cursor-pointer">
                        <RotateCw className="inline h-3 w-3 mr-1" />
                        {t('dashboard.subscription.autoRenewal')}
                      </Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {t('dashboard.subscription.providerContact')}
                      </Label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input
                        placeholder={t('dashboard.subscription.providerPhone')}
                        value={providerContactInfo.phone}
                        onChange={(e) => setProviderContactInfo({ ...providerContactInfo, phone: e.target.value })} />

                        <Input
                        type="email"
                        placeholder={t('dashboard.subscription.providerEmail')}
                        value={providerContactInfo.email}
                        onChange={(e) => setProviderContactInfo({ ...providerContactInfo, email: e.target.value })} />

                        <Input
                        type="url"
                        placeholder={t('dashboard.subscription.providerWebsite')}
                        value={providerContactInfo.website}
                        onChange={(e) => setProviderContactInfo({ ...providerContactInfo, website: e.target.value })} />

                      </div>
                    </div>
                  </>
                }
              </div>
            </>
            }
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSaveDocument} className="flex-1">
            {t('dashboard.saveDocument')}
          </Button>
        </div>
      </div>
    </AsyncErrorBoundary>);

  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-primary mb-4" />
        <h3 className="text-lg font-semibold">{t('documentUpload.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('documentUpload.subtitle')}</p>
      </div>

      {!file &&
      <div
        className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('file-input')?.click()}>

          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            {t('dashboard.dragDropZone')}
          </p>
          <Button variant="outline" size="sm">
            {t('documentUpload.browseFiles')}
          </Button>
          <input
          id="file-input"
          type="file"
          className="hidden"
          onChange={handleFileInputChange}
          accept={t("dashboard.documentUpload.pdf_doc_docx_jpg_jpeg_png_txt_2")} />

        </div>
      }

      {file && !isUploading && !uploadedFilePath &&
      <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setFile(null)} className="flex-1">
              {t('documentUpload.chooseDifferent')}
            </Button>
            <Button onClick={uploadFile} className="flex-1">
              {t('documentUpload.uploadButton')}
            </Button>
          </div>
        </div>
      }

      {isUploading &&
      <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm font-medium">{t('dashboard.fileUploading')}</p>
            <p className="text-xs text-muted-foreground">{file?.name}</p>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      }
    </div>);

};