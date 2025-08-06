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
  const { t } = useTranslation('assets');
  const { t: tCommon } = useTranslation('ui');
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
      setNameError(t('validation.nameRequired'));
    } else if (name.trim().length < 2) {
      setNameError(t('validation.nameMinLength'));
    } else if (name.trim().length > 255) {
      setNameError(t('validation.nameMaxLength', { max: 255 }));
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
  { key: 'realEstateDeed', value: t('types.deed'), suggestContact: true },
  { key: 'birthCertificate', value: t('types.birthCertificate') },
  { key: 'insurancePolicy', value: t('types.policy'), suggestContact: true, suggestRenewal: true, suggestSubscription: true },
  { key: 'lastWill', value: t('types.will'), suggestContact: true },
  { key: 'employmentContract', value: t('types.contract'), suggestContact: true },
  { key: 'passport', value: t('types.passport'), suggestRenewal: true },
  { key: 'drivingLicense', value: t('types.license'), suggestRenewal: true },
  { key: 'bankStatement', value: t('types.bankStatement'), suggestContact: true, suggestSubscription: true },
  { key: 'investmentCertificate', value: t('types.certificate'), suggestContact: true },
  { key: 'energyContract', value: t('types.contract'), suggestContact: true, suggestRenewal: true, suggestSubscription: true },
  { key: 'softwareLicense', value: t('types.license'), suggestRenewal: true, suggestSubscription: true },
  { key: 'subscriptionService', value: t('types.contract'), suggestContact: true, suggestRenewal: true, suggestSubscription: true },
  { key: 'other', value: t('types.other') }];


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
      toast.error(t('errors.fileTooLarge', { size: maxSizeMB }));
      return;
    }

    // Check if adding this file would exceed storage limit
    if (storageUsage && !canAddFile(storageUsage.used, selectedFile.size, plan)) {
      toast.error(t('errors.storageLimitReached', {
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
      toast.success(t('ui.uploaded'));

      return data.path;
    } catch (error: Record<string, unknown>) {
      console.error('Upload error:', error);
      toast.error(t('errors.uploadFailed'));
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSaveDocument = async () => {
    if (!uploadedFilePath || !documentName.trim()) {
      toast.error(t('validation.nameRequired'));
      return;
    }

    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) {
        toast.error(t('errors.accessDenied'));
        return;
      }

      const documentData = {
        user_id: user.id,
        name: documentName.trim(),
        original_name: file?.name || '',
        file_path: uploadedFilePath,
        file_size: file?.size || 0,
        document_type: documentType,
        country_code: countryCode,
        expiration_date: expirationDate?.toISOString() || null,
        contract_number: contractNumber || null,
        contact_person: contactPerson || null,
        contact_phone: contactPhone || null,
        contact_email: contactEmail || null,
        renewal_date: renewalDate?.toISOString() || null,
        renewal_action: renewalAction || null,
        importance_level: importanceLevel,
        related_assets: relatedAssets,
        subscription_type: subscriptionType,
        renewal_cost: renewalCost ? parseFloat(renewalCost) : null,
        auto_renewal: autoRenewal,
        provider_contact_info: providerContactInfo,
        cancellation_notice_period: cancellationNoticePeriod,
        metadata: {
          uploaded_at: new Date().toISOString(),
          file_type: file?.type || '',
          processing_status: 'completed'
        }
      };

      const { error } = await supabaseWithRetry
        .from('documents')
        .insert([documentData]);

      if (error) throw error;

      toast.success(t('ui.uploaded'));
      onDocumentUploaded(documentData);
    } catch (error: Record<string, unknown>) {
      console.error('Save document error:', error);
      toast.error(t('errors.uploadFailed'));
    }
  };

  const handleCancel = () => {
    if (isUploading) {
      // If currently uploading, just stop the upload
      setIsUploading(false);
      setUploadProgress(0);
    } else {
      onCancel();
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('assets.title')}</h2>
          <Button variant="outline" onClick={handleCancel}>
            {tCommon('common.buttons.cancel')}
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="documentName">{t('details.fileName')} *</Label>
            <Input
              id="documentName"
              value={documentName}
              onChange={(e) => {
                setDocumentName(e.target.value);
                validateDocumentName(e.target.value);
              }}
              placeholder={t('details.fileName')}
              className={cn(nameError && 'border-red-500')}
            />
            {nameError && (
              <p className="text-sm text-red-500 mt-1">{nameError}</p>
            )}
          </div>

          <div>
            <Label htmlFor="documentType">{t('details.documentType')}</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder={t('details.documentType')} />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.key} value={type.value}>
                    {type.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="countryCode">{t('details.jurisdiction')}</Label>
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedCountries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expirationDate">{t('details.expirationDate')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !expirationDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expirationDate ? format(expirationDate, 'PPP') : t('details.expirationDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expirationDate}
                  onSelect={setExpirationDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>{t('details.importanceLevel')}</Label>
            <RadioGroup value={importanceLevel} onValueChange={(value: 'critical' | 'important' | 'reference') => setImportanceLevel(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="critical" id="critical" />
                <Label htmlFor="critical">{t('actions.markImportant')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="important" id="important" />
                <Label htmlFor="important">{t('details.important')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reference" id="reference" />
                <Label htmlFor="reference">{t('details.reference')}</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSaveDocument} className="flex-1">
              {t('actions.upload')}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              {tCommon('common.buttons.cancel')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('assets.title')}</h2>
        <Button variant="outline" onClick={handleCancel}>
          {tCommon('common.buttons.cancel')}
        </Button>
      </div>

      {!file ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('assets.dragDrop')}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {t('assets.supportedFormats')}
          </p>
          <p className="text-xs text-gray-400">
            {t('upload.maxSize', { size: MAX_FILE_SIZES[plan] / (1024 * 1024) })}
          </p>
          <input
            id="fileInput"
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileInputChange}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="flex-1">
              <h3 className="font-medium">{file.name}</h3>
              <p className="text-sm text-gray-500">
                {formatBytes(file.size)} • {file.type || 'Unknown type'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null);
                setDocumentName('');
                setDocumentType('');
              }}
            >
              {tCommon('common.buttons.remove')}
            </Button>
          </div>

          {isUploading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t('assets.processing')}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          ) : (
            <Button onClick={uploadFile} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              {t('assets.title')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};