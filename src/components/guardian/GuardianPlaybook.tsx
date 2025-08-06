import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { toast } from 'sonner';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { TemplateModal } from './TemplateModal';
import { PlaybookTemplates } from '@/data/playbookTemplates';
import { 
  FileText, 
  Users, 
  MessageSquare, 
  MapPin, 
  Heart,
  Save,
  Eye,
  AlertCircle,
  Plus,
  Trash2,
  User,
  Phone,
  Mail,
  Briefcase,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  notes?: string;
}

interface GuardianPlaybookProps {
  guardianId: string;
  guardianName: string;
  onClose: () => void;
  isReadOnly?: boolean;
}

interface PlaybookData {
  id?: string;
  funeral_wishes: string;
  digital_accounts_shutdown: string;
  important_contacts: Contact[];
  document_locations: string;
  personal_messages: string;
  practical_instructions: string;
  status: 'empty' | 'draft' | 'complete';
}

export const GuardianPlaybook: React.FC<GuardianPlaybookProps> = ({ 
  guardianId, 
  guardianName,
  onClose,
  isReadOnly = false
}) => {
  const { t } = useTranslation('family');
  const [activeTab, setActiveTab] = useState('funeral');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateSection, setTemplateSection] = useState<keyof PlaybookTemplates>('funeral_wishes');
  
  const [playbook, setPlaybook] = useState<PlaybookData>({
    funeral_wishes: '',
    digital_accounts_shutdown: '',
    important_contacts: [],
    document_locations: '',
    personal_messages: '',
    practical_instructions: '',
    status: 'empty'
  });

  // Load existing playbook
  const loadPlaybook = useCallback(async () => {
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      const { data, error } = await supabaseWithRetry
        .from('guardian_playbooks')
        .select('*')
        .eq('guardian_id', guardianId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setPlaybook({
          id: data.id,
          funeral_wishes: data.funeral_wishes || '',
          digital_accounts_shutdown: data.digital_accounts_shutdown || '',
          important_contacts: data.important_contacts || [],
          document_locations: data.document_locations || '',
          personal_messages: data.personal_messages || '',
          practical_instructions: data.practical_instructions || '',
          status: data.status || 'draft'
        });
      }
    } catch (error) {
      console.error('[GuardianPlaybook] Error loading playbook:', error);
      toast.error(t('family.errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [guardianId, t]);

  useEffect(() => {
    loadPlaybook();
  }, [guardianId, loadPlaybook]);

  // Auto-save functionality
  const autoSave = useDebouncedCallback(async () => {
    if (isReadOnly) return;
    
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      const status = calculateStatus();
      const playbookData = {
        ...playbook,
        status,
        user_id: user.id,
        guardian_id: guardianId,
      };

      if (playbook.id) {
        // Update existing
        const { error } = await supabaseWithRetry
          .from('guardian_playbooks')
          .update(playbookData)
          .eq('id', playbook.id);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabaseWithRetry
          .from('guardian_playbooks')
          .insert(playbookData)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setPlaybook(prev => ({ ...prev, id: data.id }));
        }
      }

      // Show subtle save indicator
      toast.success(t('family.messages.autoSaved'), { duration: 1000 });
    } catch (error) {
      console.error('[GuardianPlaybook] Error auto-saving:', error);
    }
  }, 2000);

  const calculateStatus = (): 'empty' | 'draft' | 'complete' => {
    const hasContent = 
      playbook.funeral_wishes ||
      playbook.digital_accounts_shutdown ||
      playbook.important_contacts.length > 0 ||
      playbook.document_locations ||
      playbook.personal_messages ||
      playbook.practical_instructions;

    if (!hasContent) return 'empty';

    // Check if all important sections have content
    const isComplete = 
      playbook.funeral_wishes &&
      playbook.digital_accounts_shutdown &&
      playbook.important_contacts.length > 0 &&
      playbook.document_locations &&
      playbook.personal_messages;

    return isComplete ? 'complete' : 'draft';
  };

  const handleTextChange = (field: keyof PlaybookData, value: string) => {
    setPlaybook(prev => ({ ...prev, [field]: value }));
    autoSave();
  };

  const handleUseTemplate = (section: keyof PlaybookTemplates) => {
    setTemplateSection(section);
    setTemplateModalOpen(true);
  };

  const handleInsertTemplate = (content: string, field: keyof PlaybookData) => {
    handleTextChange(field, content);
  };

  const handleAddContact = () => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name: '',
      role: '',
      phone: '',
      email: '',
      notes: ''
    };
    setPlaybook(prev => ({
      ...prev,
      important_contacts: [...prev.important_contacts, newContact]
    }));
  };

  const handleUpdateContact = (contactId: string, field: keyof Contact, value: string) => {
    setPlaybook(prev => ({
      ...prev,
      important_contacts: prev.important_contacts.map(contact =>
        contact.id === contactId ? { ...contact, [field]: value } : contact
      )
    }));
    autoSave();
  };

  const handleRemoveContact = (contactId: string) => {
    setPlaybook(prev => ({
      ...prev,
      important_contacts: prev.important_contacts.filter(c => c.id !== contactId)
    }));
    autoSave();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await autoSave.flush();
      toast.success(t('family.messages.saved'));
      onClose();
    } catch (error) {
      toast.error(t('family.errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = () => {
    const status = calculateStatus();
    switch (status) {
      case 'complete':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" /> {t('family.status.complete')}</Badge>;
      case 'draft':
        return <Badge variant="secondary">{t('family.status.draft')}</Badge>;
      default:
        return <Badge variant="outline">{t('family.status.empty')}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">{t('family.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {isReadOnly 
                ? t('playbook.title.view', { name: guardianName })
                : t('playbook.title.edit', { name: guardianName })
              }
            </h2>
            <p className="text-muted-foreground mt-1">
              {isReadOnly 
                ? t('family.subtitle.view')
                : t('family.subtitle.edit')
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {!isReadOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPreview ? t('family.edit') : t('family.preview')}
              </Button>
            )}
          </div>
        </div>

        {!isReadOnly && !isPreview && (
          <Alert className="border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('family.autoSaveNotice')}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="funeral" className="text-xs">
            <Heart className="h-3 w-3 mr-1" />
            {t('family.tabs.funeral')}
          </TabsTrigger>
          <TabsTrigger value="digital" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            {t('family.tabs.digital')}
          </TabsTrigger>
          <TabsTrigger value="contacts" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {t('family.tabs.contacts')}
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            {t('family.tabs.documents')}
          </TabsTrigger>
          <TabsTrigger value="messages" className="text-xs">
            <MessageSquare className="h-3 w-3 mr-1" />
            {t('family.tabs.messages')}
          </TabsTrigger>
          <TabsTrigger value="practical" className="text-xs">
            <Briefcase className="h-3 w-3 mr-1" />
            {t('family.tabs.practical')}
          </TabsTrigger>
        </TabsList>

        {/* Funeral Wishes */}
        <TabsContent value="funeral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('family.sections.funeral.title')}</span>
                {!isReadOnly && !isPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUseTemplate('funeral_wishes')}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('family.useTemplate')}
                  </Button>
                )}
              </CardTitle>
              <CardDescription>{t('family.sections.funeral.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isReadOnly || isPreview ? (
                <div className="prose prose-sm max-w-none">
                  {playbook.funeral_wishes || <p className="text-muted-foreground italic">{t('family.noContent')}</p>}
                </div>
              ) : (
                <Textarea
                  value={playbook.funeral_wishes}
                  onChange={(e) => handleTextChange('funeral_wishes', e.target.value)}
                  placeholder={t('family.sections.funeral.placeholder')}
                  rows={8}
                  className="font-mono text-sm"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Digital Accounts */}
        <TabsContent value="digital" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('family.sections.digital.title')}</span>
                {!isReadOnly && !isPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUseTemplate('digital_accounts_shutdown')}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('family.useTemplate')}
                  </Button>
                )}
              </CardTitle>
              <CardDescription>{t('family.sections.digital.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isReadOnly || isPreview ? (
                <div className="prose prose-sm max-w-none">
                  {playbook.digital_accounts_shutdown || <p className="text-muted-foreground italic">{t('family.noContent')}</p>}
                </div>
              ) : (
                <Textarea
                  value={playbook.digital_accounts_shutdown}
                  onChange={(e) => handleTextChange('digital_accounts_shutdown', e.target.value)}
                  placeholder={t('family.sections.digital.placeholder')}
                  rows={8}
                  className="font-mono text-sm"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Important Contacts */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('family.sections.contacts.title')}</span>
                {!isReadOnly && !isPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUseTemplate('important_contacts')}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('family.useTemplate')}
                  </Button>
                )}
              </CardTitle>
              <CardDescription>{t('family.sections.contacts.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(isReadOnly || isPreview) ? (
                <div className="space-y-3">
                  {playbook.important_contacts.length > 0 ? (
                    playbook.important_contacts.map(contact => (
                      <Card key={contact.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{contact.name}</h4>
                              <p className="text-sm text-muted-foreground">{contact.role}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {contact.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                                  {contact.phone}
                                </a>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                                  {contact.email}
                                </a>
                              </div>
                            )}
                          </div>
                          {contact.notes && (
                            <p className="text-sm text-muted-foreground">{contact.notes}</p>
                          )}
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">{t('family.noContacts')}</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {playbook.important_contacts.map((contact, index) => (
                      <Card key={contact.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <Label>{t('family.contact')} {index + 1}</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveContact(contact.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`name-${contact.id}`}>
                                {t('family.contactFields.name')}
                              </Label>
                              <Input
                                id={`name-${contact.id}`}
                                value={contact.name}
                                onChange={(e) => handleUpdateContact(contact.id, 'name', e.target.value)}
                                placeholder={t('family.contactFields.namePlaceholder')}
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <Label htmlFor={`role-${contact.id}`}>
                                {t('family.contactFields.role')}
                              </Label>
                              <Input
                                id={`role-${contact.id}`}
                                value={contact.role}
                                onChange={(e) => handleUpdateContact(contact.id, 'role', e.target.value)}
                                placeholder={t('family.contactFields.rolePlaceholder')}
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <Label htmlFor={`phone-${contact.id}`}>
                                {t('family.contactFields.phone')}
                              </Label>
                              <Input
                                id={`phone-${contact.id}`}
                                value={contact.phone}
                                onChange={(e) => handleUpdateContact(contact.id, 'phone', e.target.value)}
                                placeholder={t('family.contactFields.phonePlaceholder')}
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <Label htmlFor={`email-${contact.id}`}>
                                {t('family.contactFields.email')}
                              </Label>
                              <Input
                                id={`email-${contact.id}`}
                                type="email"
                                value={contact.email}
                                onChange={(e) => handleUpdateContact(contact.id, 'email', e.target.value)}
                                placeholder={t('family.contactFields.emailPlaceholder')}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <Label htmlFor={`notes-${contact.id}`}>
                              {t('family.contactFields.notes')}
                            </Label>
                            <Textarea
                              id={`notes-${contact.id}`}
                              value={contact.notes}
                              onChange={(e) => handleUpdateContact(contact.id, 'notes', e.target.value)}
                              placeholder={t('family.contactFields.notesPlaceholder')}
                              rows={2}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={handleAddContact}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('family.addContact')}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Locations */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('family.sections.documents.title')}</span>
                {!isReadOnly && !isPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUseTemplate('document_locations')}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('family.useTemplate')}
                  </Button>
                )}
              </CardTitle>
              <CardDescription>{t('family.sections.documents.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isReadOnly || isPreview ? (
                <div className="prose prose-sm max-w-none">
                  {playbook.document_locations || <p className="text-muted-foreground italic">{t('family.noContent')}</p>}
                </div>
              ) : (
                <Textarea
                  value={playbook.document_locations}
                  onChange={(e) => handleTextChange('document_locations', e.target.value)}
                  placeholder={t('family.sections.documents.placeholder')}
                  rows={8}
                  className="font-mono text-sm"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Messages */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('family.sections.messages.title')}</span>
                {!isReadOnly && !isPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUseTemplate('personal_messages')}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('family.useTemplate')}
                  </Button>
                )}
              </CardTitle>
              <CardDescription>{t('family.sections.messages.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isReadOnly || isPreview ? (
                <div className="prose prose-sm max-w-none">
                  {playbook.personal_messages || <p className="text-muted-foreground italic">{t('family.noContent')}</p>}
                </div>
              ) : (
                <Textarea
                  value={playbook.personal_messages}
                  onChange={(e) => handleTextChange('personal_messages', e.target.value)}
                  placeholder={t('family.sections.messages.placeholder')}
                  rows={10}
                  className="font-mono text-sm"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practical Instructions */}
        <TabsContent value="practical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('family.sections.practical.title')}</span>
                {!isReadOnly && !isPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUseTemplate('practical_instructions')}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('family.useTemplate')}
                  </Button>
                )}
              </CardTitle>
              <CardDescription>{t('family.sections.practical.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isReadOnly || isPreview ? (
                <div className="prose prose-sm max-w-none">
                  {playbook.practical_instructions || <p className="text-muted-foreground italic">{t('family.noContent')}</p>}
                </div>
              ) : (
                <Textarea
                  value={playbook.practical_instructions}
                  onChange={(e) => handleTextChange('practical_instructions', e.target.value)}
                  placeholder={t('family.sections.practical.placeholder')}
                  rows={8}
                  className="font-mono text-sm"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      {!isReadOnly && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {t('ui.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? t('family.saving') : t('family.save')}
          </Button>
        </div>
      )}

      {/* Template Modal */}
      <TemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        section={templateSection}
        onInsert={(content) => {
          const fieldMap: Record<keyof PlaybookTemplates, keyof PlaybookData> = {
            funeral_wishes: 'funeral_wishes',
            digital_accounts_shutdown: 'digital_accounts_shutdown',
            important_contacts: 'important_contacts',
            document_locations: 'document_locations',
            personal_messages: 'personal_messages',
            practical_instructions: 'practical_instructions'
          };
          handleInsertTemplate(content, fieldMap[templateSection]);
        }}
        existingContent={playbook[templateSection.replace(/_/g, '_') as keyof PlaybookData] as string}
      />
    </div>
  );
};
