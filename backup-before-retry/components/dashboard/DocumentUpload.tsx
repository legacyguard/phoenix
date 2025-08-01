import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Upload, FileText } from 'lucide-react';
import { COUNTRY_CONFIGS } from '@/config/countries';
import { useCountry } from '@/contexts/CountryContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MAX_FILE_SIZES } from '@/utils/constants';
import { useUserPlan } from '@/hooks/useUserPlan';
import { AsyncErrorBoundary } from '@/components/common/AsyncErrorBoundary';

interface DocumentUploadProps {
  onDocumentUploaded: (document: any) => void;
  onCancel: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentUploaded, onCancel }) => {
  const { t } = useTranslation('common');
  const { selectedCountryCode } = useCountry();
  
  const { plan } = useUserPlan();
  
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
  
  const [showForm, setShowForm] = useState(false);

  const documentTypes = [
    { key: 'realEstateDeed', value: t('documentTypes.realEstateDeed') },
    { key: 'birthCertificate', value: t('documentTypes.birthCertificate') },
    { key: 'insurancePolicy', value: t('documentTypes.insurancePolicy') },
    { key: 'lastWill', value: t('documentTypes.lastWill') },
    { key: 'employmentContract', value: t('documentTypes.employmentContract') },
    { key: 'passport', value: t('documentTypes.passport') },
    { key: 'drivingLicense', value: t('documentTypes.drivingLicense') },
    { key: 'bankStatement', value: t('documentTypes.bankStatement') },
    { key: 'investmentCertificate', value: t('documentTypes.investmentCertificate') },
    { key: 'other', value: t('documentTypes.other') },
  ];

  const supportedCountries = Object.values(COUNTRY_CONFIGS);

  const handleFileSelect = useCallback((selectedFile: File) => {
    const maxFileSize = MAX_FILE_SIZES[plan];
    
    // Check file size
    if (selectedFile.size > maxFileSize) {
      const maxSizeMB = maxFileSize / (1024 * 1024);
      toast.error(t('documentUpload.fileTooLarge', { maxSize: maxSizeMB }));
      return;
    }
    
    setFile(selectedFile);
    if (!documentName) {
      // Auto-set document name from filename
      const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, '');
      setDocumentName(nameWithoutExtension);
    }
  }, [documentName, t]);

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

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      setUploadProgress(100);
      setUploadedFilePath(data.path);
      setShowForm(true);
      toast.success(t('documentUpload.fileUploadedSuccess'));
      
      return data.path;
        } catch (error: any) {
      const timestamp = new Date().toISOString();
      const errorMessage = error?.message || 'Neznáma chyba';
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailné logovanie pre debugging
      console.error('[Aplikácia] Chyba pri operácia:', {
        timestamp,
        operation: 'uploadFile',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // Používateľsky prívetivá správa
      let userMessage = 'Nastala chyba pri operácia.';
      
      // Špecifické správy podľa typu chyby
      if (error?.code === 'PGRST116') {
        userMessage = 'Požadované dáta neboli nájdené.';
      } else if (error?.message?.includes('network')) {
        userMessage = 'Chyba pripojenia. Skontrolujte internetové pripojenie.';
      } else if (error?.message?.includes('permission')) {
        userMessage = 'Nemáte oprávnenie na túto akciu.';
      } else if (error?.message?.includes('duplicate')) {
        userMessage = 'Takýto záznam už existuje.';
      }
      
      toast.error(userMessage);
    });
      
      let errorMessage = t('documentUpload.fileUploadFailed');
      if (error instanceof Error) {
        if (error.message.includes('storage')) {
          errorMessage = `${t('documentUpload.fileUploadFailed')}: Problém s úložiskom`;
        } else if (error.message.includes('network')) {
          errorMessage = `${t('documentUpload.fileUploadFailed')}: Skontrolujte internetové pripojenie`;
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('documentUpload.loginToSave'));
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name: documentName.trim(),
          type: documentType,
          country_code: countryCode,
          file_path: uploadedFilePath,
          file_size: file?.size || 0,
          mime_type: file?.type || '',
          expiration_date: expirationDate ? format(expirationDate, 'yyyy-MM-dd') : null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success(t('documentUpload.saved'));
      onDocumentUploaded(data);
        } catch (error: any) {
      const timestamp = new Date().toISOString();
      const errorMessage = error?.message || 'Neznáma chyba';
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailné logovanie pre debugging
      console.error('[Aplikácia] Chyba pri operácia:', {
        timestamp,
        operation: 'handleSaveDocument',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // Používateľsky prívetivá správa
      let userMessage = 'Nastala chyba pri operácia.';
      
      // Špecifické správy podľa typu chyby
      if (error?.code === 'PGRST116') {
        userMessage = 'Požadované dáta neboli nájdené.';
      } else if (error?.message?.includes('network')) {
        userMessage = 'Chyba pripojenia. Skontrolujte internetové pripojenie.';
      } else if (error?.message?.includes('permission')) {
        userMessage = 'Nemáte oprávnenie na túto akciu.';
      } else if (error?.message?.includes('duplicate')) {
        userMessage = 'Takýto záznam už existuje.';
      }
      
      toast.error(userMessage);
    });
      
      let errorMessage = t('documentUpload.failedSave');
      if (error instanceof Error) {
        if (error.message.includes('duplicate')) {
          errorMessage = `${t('documentUpload.failedSave')}: Dokument s týmto názvom už existuje`;
        } else if (error.message.includes('permission')) {
          errorMessage = `${t('documentUpload.failedSave')}: Nedostatočné oprávnenia`;
        }
      }
      
      toast.error(errorMessage);
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
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentType">{t('dashboard.documentType')}</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder={t('documentUpload.typePlaceholder')} />
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

          <div className="space-y-2">
            <Label htmlFor="countryCode">{t('dashboard.countryOfRelevance')}</Label>
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger>
                <SelectValue placeholder={t('documentUpload.countryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {supportedCountries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
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
                  )}
                >
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
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
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
    </AsyncErrorBoundary>
  );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-primary mb-4" />
        <h3 className="text-lg font-semibold">{t('documentUpload.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('documentUpload.subtitle')}</p>
      </div>

      {!file && (
        <div
          className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-input')?.click()}
        >
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
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
          />
        </div>
      )}

      {file && !isUploading && !uploadedFilePath && (
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
      )}

      {isUploading && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm font-medium">{t('dashboard.fileUploading')}</p>
            <p className="text-xs text-muted-foreground">{file?.name}</p>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}
    </div>
  );
};