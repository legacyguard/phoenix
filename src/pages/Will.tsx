import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { useRetry } from '@/utils/retry';
import { RetryStatus } from '@/components/common/RetryStatus';
import { toast } from 'sonner';
import { FileSignature, Upload, MapPin, User, Save } from 'lucide-react';
import { DocumentUpload } from '@/components/dashboard/DocumentUpload';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { WillForm } from '@/components/will/WillForm';
import WillGenerator from '@/components/WillGenerator';

interface Will {
  id: string;
  status: string;
  document_path?: string;
  physical_location?: string;
  executor_contact_id?: string;
  notes?: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
}

export const Will: React.FC = () => {
  const { t } = useTranslation('common');
  const [will, setWill] = useState<Will | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  
  const [formData, setFormData] = useState({
    status: 'notStarted', // Use key instead of translated value
    physical_location: '',
    executor_contact_id: 'none',
    notes: '',
  });

  const statusOptions = [
    { key: 'notStarted', label: t('will.status.notStarted') },
    { key: 'inPreparation', label: t('will.status.inPreparation') },
    { key: 'completedSigned', label: t('will.status.completedSigned') },
    { key: 'withNotary', label: t('will.status.withNotary') }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'notStarted': return 'secondary';
      case 'inPreparation': return 'default';
      case 'completedSigned': return 'default';
      case 'withNotary': return 'default';
      default: return 'secondary';
    }
  };

  useEffect(() => {
    loadWill();
    loadContacts();
  }, []);

  const loadWill = async () => {
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      const { data, error } = await supabaseWithRetry
        .from('wills')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setWill(data);
        setFormData({
          status: data.status,
          physical_location: data.physical_location || '',
          executor_contact_id: data.executor_contact_id || 'none',
          notes: data.notes || '',
        });
      }
        } catch (error: any) {
      const timestamp = new Date().toISOString();
const errorMessage = error?.message || t('errors.unknown');
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailed logging for debugging
      console.error('[Will] Error loading will:', {
        timestamp,
        operation: 'loadWill',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // User-friendly message
      let userMessage = t('will.errors.loadingFailed');
      
      // Specific messages based on error type
      if (error?.code === 'PGRST116') {
        userMessage = t('errors.dataNotFound');
      } else if (error?.message?.includes('network')) {
        userMessage = t('errors.networkError');
      } else if (error?.message?.includes('permission')) {
        userMessage = t('errors.permissionDenied');
      } else if (error?.message?.includes('duplicate')) {
        userMessage = t('errors.duplicateRecord');
      }
      
      toast.error(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      const { data, error } = await supabaseWithRetry
        .from('contacts')
        .select('id, name, role')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setContacts(data || []);
        } catch (error: any) {
      const timestamp = new Date().toISOString();
const errorMessage = error?.message || t('errors.unknown');
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailed logging for debugging
      console.error('[Will] Error loading contacts:', {
        timestamp,
        operation: 'loadContacts',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // User-friendly message
      let userMessage = t('contacts.errors.loadingFailed');
      
      // Specific messages based on error type
      if (error?.code === 'PGRST116') {
        userMessage = t('errors.dataNotFound');
      } else if (error?.message?.includes('network')) {
        userMessage = t('errors.networkError');
      } else if (error?.message?.includes('permission')) {
        userMessage = t('errors.permissionDenied');
      } else if (error?.message?.includes('duplicate')) {
        userMessage = t('errors.duplicateRecord');
      }
      
      toast.error(userMessage);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) {
        toast.error(t('will.errors.mustBeLoggedIn'));
        return;
      }

      const willData = {
        user_id: user.id,
        status: formData.status,
        physical_location: formData.physical_location.trim() || null,
        executor_contact_id: formData.executor_contact_id === 'none' ? null : (formData.executor_contact_id || null),
        notes: formData.notes.trim() || null,
      };

      if (will) {
        const { error } = await supabaseWithRetry
          .from('wills')
          .update(willData)
          .eq('id', will.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabaseWithRetry
          .from('wills')
          .insert([willData])
          .select()
          .single();

        if (error) throw error;
        setWill(data);
      }

      toast.success(t('will.messages.savedSuccessfully'));
      loadWill();
        } catch (error: any) {
      const timestamp = new Date().toISOString();
const errorMessage = error?.message || t('errors.unknown');
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailed logging for debugging
      console.error('[Will] Error saving will:', {
        timestamp,
        operation: 'handleSave',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // User-friendly message
      let userMessage = t('will.errors.savingFailed');
      
      // Specific messages based on error type
      if (error?.code === 'PGRST116') {
        userMessage = t('errors.dataNotFound');
      } else if (error?.message?.includes('network')) {
        userMessage = t('errors.networkError');
      } else if (error?.message?.includes('permission')) {
        userMessage = t('errors.permissionDenied');
      } else if (error?.message?.includes('duplicate')) {
        userMessage = t('errors.duplicateRecord');
      }
      
      toast.error(userMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocumentUploaded = (document: any) => {
    setShowUpload(false);
    loadWill();
    toast.success(t('will.messages.documentUploaded'));
  };

  const handleWillGenerated = (willData: any) => {
    setShowGenerator(false);
    // Update the will status to "in preparation" or "completed"
    setFormData(prev => ({ ...prev, status: 'inPreparation' }));
    toast.success(t('will.messages.willGenerated'));
    // Optionally save the generated will data
    handleSave();
  };

  if (isLoading) {
    return (
    <ErrorBoundary>
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('will.loading')}</p>
        </div>
      </div>
    </ErrorBoundary>
  );
  }

  // Show WillGenerator if requested
  if (showGenerator) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowGenerator(false)}
            className="mb-4"
          >
            {t('will.backToManagement')}
          </Button>
        </div>
        <WillGenerator 
          onComplete={handleWillGenerated}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSignature className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t('will.title')}</h1>
            <p className="text-muted-foreground">
              {t('will.subtitle')}
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setShowGenerator(true)}
          size="lg"
        >
          <FileSignature className="mr-2 h-4 w-4" />
          {t('will.generateNewWill')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status & Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              {t('will.sections.statusInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="space-y-2">
              <Label>{t('will.fields.currentStatus')}</Label>
              <div className="flex items-center gap-3">
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.key} value={status.key}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant={getStatusVariant(formData.status)}>
                  {statusOptions.find(opt => opt.key === formData.status)?.label || formData.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('will.descriptions.statusDescription')}
              </p>
            </div>

            {/* Physical Location */}
            <div className="space-y-2">
              <Label htmlFor="location">{t('will.fields.physicalLocation')}</Label>
              <Input
                id="location"
                placeholder={t('will.placeholders.physicalLocation')}
                value={formData.physical_location}
                onChange={(e) => setFormData(prev => ({ ...prev, physical_location: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground">
                {t('will.descriptions.physicalLocationDescription')}
              </p>
            </div>

            {/* Executor Contact */}
            <div className="space-y-2">
              <Label>{t('will.fields.executorContact')}</Label>
              <Select
                value={formData.executor_contact_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, executor_contact_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('will.placeholders.selectContact')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('will.options.noContactSelected')}</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{contact.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {contact.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {t('will.descriptions.executorDescription')}
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t('will.fields.additionalNotes')}</Label>
              <Textarea
                id="notes"
                placeholder={t('will.placeholders.additionalNotes')}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('will.buttons.saving')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('will.buttons.saveWillInfo')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {t('will.sections.willDocument')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {will?.document_path ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSignature className="h-4 w-4 text-primary" />
                  <span className="font-medium">{t('will.document.uploaded')}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('will.document.uploadedDescription')}
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUpload(true)}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t('will.buttons.uploadNewVersion')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowGenerator(true)}
                  className="w-full"
                >
                  <FileSignature className="mr-2 h-4 w-4" />
                  {t('will.generateNewWill')}
                </Button>
              </div>
            </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">{t('will.document.noDocument')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('will.document.noDocumentDescription')}
                  </p>
                  <Button onClick={() => setShowUpload(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    {t('will.buttons.uploadDocument')}
                  </Button>
                </div>
              </div>
            )}

            {showUpload && (
              <div className="mt-4">
                <DocumentUpload
                  onDocumentUploaded={handleDocumentUploaded}
                  onCancel={() => setShowUpload(false)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Will;