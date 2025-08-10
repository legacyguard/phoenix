import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { useRetry } from '@/utils/retry';
import { RetryStatus } from '@/components/common/RetryStatus';
import { toast } from 'sonner';
import { Plus, User, Phone, Mail, Edit, Trash2, BookUser, FileText, Star, Heart, Trash, MessageSquare } from 'lucide-react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface Contact {
  id: string;
  name: string;
  role: string;
  phone_number?: string;
  email?: string;
  notes?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  country_code: string;
  expiration_date?: string | null;
  is_key_document: boolean;
}

interface Instructions {
  id: string;
  funeral_wishes?: string;
  digital_accounts_shutdown?: string;
  messages_to_loved_ones?: string;
}

export const Manual: React.FC = () => {
    const { t } = useTranslation('ui-common');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [instructions, setInstructions] = useState<Instructions | null>(null);
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(true);
  const [isInstructionsLoading, setIsInstructionsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone_number: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
     
    loadContacts();
    loadKeyDocuments();
    loadInstructions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadContacts = async () => {
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      const { data, error } = await supabaseWithRetry
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setContacts(data || []);
        } catch (error: Record<string, unknown>) {
      const timestamp = new Date().toISOString();
const errorMessage = error?.message || t('help.errors.unknown');
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailné logovanie pre debugging
      console.error('[Manuál a kontakty] Chyba pri načítanie kontaktov:', {
        timestamp,
        operation: 'loadContacts',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // Používateľsky prívetivá správa
let userMessage = t('help.errors.loadContacts');
      
      // Špecifické správy podľa typu chyby
      if (error?.code === 'PGRST116') {
userMessage = t('help.errors.dataNotFound');
      } else if (error?.message?.includes('network')) {
userMessage = t('help.errors.network');
      } else if (error?.message?.includes('permission')) {
userMessage = t('help.errors.noPermission');
      } else if (error?.message?.includes('duplicate')) {
userMessage = t('help.errors.duplicateEntry');
      }
      
      toast.error(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      phone_number: '',
      email: '',
      notes: '',
    });
    setEditingContact(null);
  };

  const handleAddContact = () => {
    resetForm();
    setIsContactSheetOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      role: contact.role,
      phone_number: contact.phone_number || '',
      email: contact.email || '',
      notes: contact.notes || '',
    });
    setIsContactSheetOpen(true);
  };

  const handleSaveContact = async () => {
    if (!formData.name.trim() || !formData.role.trim()) {
      toast.error(t('help.contacts.messages.nameAndRoleRequired'));
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) {
        toast.error(t('help.contacts.messages.loginRequired'));
        return;
      }

      const contactData = {
        user_id: user.id,
        name: formData.name.trim(),
        role: formData.role.trim(),
        phone_number: formData.phone_number.trim() || null,
        email: formData.email.trim() || null,
        notes: formData.notes.trim() || null,
      };

      if (editingContact) {
        const { error } = await supabaseWithRetry
          .from('contacts')
          .update(contactData)
          .eq('id', editingContact.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success(t('help.contacts.messages.updated'));
      } else {
        const { error } = await supabaseWithRetry
          .from('contacts')
          .insert([contactData]);

        if (error) throw error;
        toast.success(t('help.contacts.messages.added'));
      }

      setIsContactSheetOpen(false);
      resetForm();
      loadContacts();
        } catch (error: Record<string, unknown>) {
      const timestamp = new Date().toISOString();
const errorMessage = error?.message || t('help.errors.unknown');
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailné logovanie pre debugging
      console.error('[Manuál a kontakty] Chyba pri uloženie kontaktu:', {
        timestamp,
        operation: 'handleSaveContact',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // Používateľsky prívetivá správa
let userMessage = t('help.errors.saveContact');
      
      // Špecifické správy podľa typu chyby
      if (error?.code === 'PGRST116') {
userMessage = t('help.errors.dataNotFound');
      } else if (error?.message?.includes('network')) {
userMessage = t('help.errors.network');
      } else if (error?.message?.includes('permission')) {
userMessage = t('help.errors.noPermission');
      } else if (error?.message?.includes('duplicate')) {
userMessage = t('help.errors.duplicateEntry');
      }
      
      toast.error(userMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const { error } = await supabaseWithRetry
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(prev => prev.filter(contact => contact.id !== id));
      toast.success(t('help.contacts.messages.deleted'));
        } catch (error: Record<string, unknown>) {
      const timestamp = new Date().toISOString();
const errorMessage = error?.message || t('help.errors.unknown');
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailné logovanie pre debugging
      console.error('[Manuál a kontakty] Chyba pri odstránenie kontaktu:', {
        timestamp,
        operation: 'handleDeleteContact',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // Používateľsky prívetivá správa
let userMessage = t('help.errors.deleteContact');
      
      // Špecifické správy podľa typu chyby
      if (error?.code === 'PGRST116') {
userMessage = t('help.errors.dataNotFound');
      } else if (error?.message?.includes('network')) {
userMessage = t('help.errors.network');
      } else if (error?.message?.includes('permission')) {
userMessage = t('help.errors.noPermission');
      } else if (error?.message?.includes('duplicate')) {
userMessage = t('help.errors.duplicateEntry');
      }
      
      toast.error(userMessage);
    }
  };

  const loadKeyDocuments = async () => {
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      const { data, error } = await supabaseWithRetry
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_key_document', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDocuments(data || []);
        } catch (error: Record<string, unknown>) {
      const timestamp = new Date().toISOString();
const errorMessage = error?.message || t('help.errors.unknown');
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailné logovanie pre debugging
      console.error('[Manuál a kontakty] Chyba pri načítanie kľúčových dokumentov:', {
        timestamp,
        operation: 'loadKeyDocuments',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // Používateľsky prívetivá správa
let userMessage = t('help.errors.loadKeyDocuments');
      
      // Špecifické správy podľa typu chyby
      if (error?.code === 'PGRST116') {
userMessage = t('help.errors.dataNotFound');
      } else if (error?.message?.includes('network')) {
userMessage = t('help.errors.network');
      } else if (error?.message?.includes('permission')) {
userMessage = t('help.errors.noPermission');
      } else if (error?.message?.includes('duplicate')) {
userMessage = t('help.errors.duplicateEntry');
      }
      
      toast.error(userMessage);
    } finally {
      setIsDocumentsLoading(false);
    }
  };

  const getCountryFlag = (countryCode: string) => {
    // Simple flag mapping - in a real app you'd want a more comprehensive solution
    const flags: { [key: string]: string } = {
      'SK': '🇸🇰', 'CZ': '🇨🇿', 'DE': '🇩🇪', 'AT': '🇦🇹', 'HU': '🇭🇺',
      'PL': '🇵🇱', 'IT': '🇮🇹', 'FR': '🇫🇷', 'ES': '🇪🇸', 'NL': '🇳🇱',
      'BE': '🇧🇪', 'CH': '🇨🇭', 'US': '🇺🇸', 'GB': '🇬🇧', 'IE': '🇮🇪'
    };
    return flags[countryCode] || '🏳️';
  };

  const loadInstructions = async () => {
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      const { data, error } = await supabaseWithRetry
        .from('instructions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setInstructions(data);
        } catch (error: Record<string, unknown>) {
      const timestamp = new Date().toISOString();
const errorMessage = error?.message || t('help.errors.unknown');
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailné logovanie pre debugging
      console.error('[Manuál a kontakty] Chyba pri načítanie inštrukcií:', {
        timestamp,
        operation: 'loadInstructions',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // Používateľsky prívetivá správa
let userMessage = t('help.errors.loadInstructions');
      
      // Špecifické správy podľa typu chyby
      if (error?.code === 'PGRST116') {
userMessage = t('help.errors.dataNotFound');
      } else if (error?.message?.includes('network')) {
userMessage = t('help.errors.network');
      } else if (error?.message?.includes('permission')) {
userMessage = t('help.errors.noPermission');
      } else if (error?.message?.includes('duplicate')) {
userMessage = t('help.errors.duplicateEntry');
      }
      
      toast.error(userMessage);
    } finally {
      setIsInstructionsLoading(false);
    }
  };

  const debouncedSaveInstructions = useCallback(
    async (field: keyof Instructions, value: string) => {
      try {
        const { data: { user } } = await supabaseWithRetry.auth.getUser();
        if (!user) return;

        const instructionsData = {
          user_id: user.id,
          [field]: value.trim() || null,
        };

        if (instructions) {
          const { error } = await supabaseWithRetry
            .from('instructions')
            .update(instructionsData)
            .eq('id', instructions.id);

          if (error) throw error;
        } else {
          const { data, error } = await supabaseWithRetry
            .from('instructions')
            .insert([instructionsData])
            .select()
            .single();

          if (error) throw error;
          setInstructions(data);
        }
            } catch (error: Record<string, unknown>) {
        const timestamp = new Date().toISOString();
const errorMessage = error?.message || t('help.errors.unknown');
        const errorCode = error?.code || 'UNKNOWN_ERROR';
        
        // Detailné logovanie pre debugging
        console.error('[Manuál a kontakty] Chyba pri načítanie inštrukcií:', {
          timestamp,
          operation: 'loadInstructions',
          errorCode,
          errorMessage,
          errorDetails: error,
          stack: error?.stack
        });
        
        // Používateľsky prívetivá správa
let userMessage = t('help.errors.saveInstructions');
        
        // Špecifické správy podľa typu chyby
        if (error?.code === 'PGRST116') {
userMessage = t('help.errors.dataNotFound');
        } else if (error?.message?.includes('network')) {
userMessage = t('help.errors.network');
        } else if (error?.message?.includes('permission')) {
userMessage = t('help.errors.noPermission');
        } else if (error?.message?.includes('duplicate')) {
userMessage = t('help.errors.duplicateEntry');
        }
        
        toast.error(userMessage);
      }
    },
    [instructions, t]
  );

  const getExpirationStatus = (expirationDate: string | null) => {
    if (!expirationDate) return null;
    
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: t('help.documents.expiration.expired'), variant: 'destructive' as const };
    } else if (diffDays <= 30) {
      return { text: t('help.documents.expiration.expiresSoon'), variant: 'destructive' as const };
    } else if (diffDays <= 90) {
      return { text: t('help.documents.expiration.expiring'), variant: 'secondary' as const };
    }
    return null;
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookUser className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{t('help.title')}</h1>
          <p className="text-muted-foreground">
            {t('help.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="contacts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contacts">{t('help.tabs.contacts')}</TabsTrigger>
          <TabsTrigger value="documents">{t('help.tabs.documents')}</TabsTrigger>
          <TabsTrigger value="instructions">{t('help.tabs.instructions')}</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-6">
          {/* Add Contact Button */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{t('help.contacts.title')}</h2>
              <p className="text-muted-foreground">
                {t('help.contacts.description')}
              </p>
            </div>
            <Sheet open={isContactSheetOpen} onOpenChange={setIsContactSheetOpen}>
              <SheetTrigger asChild>
                <Button onClick={handleAddContact}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('help.contacts.addContact')}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                    {editingContact ? t('help.contacts.form.editTitle') : t('help.contacts.form.addTitle')}
                  </SheetTitle>
                  <SheetDescription>
                    {t('help.contacts.form.description')}
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">{t('help.contacts.form.nameLabel')}</Label>
                    <Input
                      id="contactName"
                      placeholder={t('help.contacts.form.namePlaceholder')}
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">{t('help.contacts.form.roleLabel')}</Label>
                    <Input
                      id="role"
                      placeholder={t('help.contacts.form.rolePlaceholder')}
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('help.contacts.form.phoneLabel')}</Label>
                    <Input
                      id="phone"
                      placeholder={t('help.contacts.form.phonePlaceholder')}
                      value={formData.phone_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('help.contacts.form.emailLabel')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('help.contacts.form.emailPlaceholder')}
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">{t('help.contacts.form.notesLabel')}</Label>
                    <Textarea
                      id="notes"
                      placeholder={t('help.contacts.form.notesPlaceholder')}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsContactSheetOpen(false)}
                      className="flex-1"
                      disabled={isSaving}
                    >
                      {t('help.contacts.form.cancel')}
                    </Button>
                    <Button
                      onClick={handleSaveContact}
                      className="flex-1"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t('help.contacts.form.saving')}
                        </>
                      ) : (
                        editingContact ? t('help.contacts.form.updateButton') : t('help.contacts.form.addButton')
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Contacts List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t('help.contacts.loading')}</p>
              </div>
            </div>
          ) : contacts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('help.contacts.empty.title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('help.contacts.empty.description')}
                </p>
                <Button onClick={handleAddContact}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('help.contacts.addFirstContact')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map((contact) => (
                <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{contact.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {contact.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contact.phone_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.phone_number}</span>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    {contact.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {contact.notes}
                      </p>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditContact(contact)}
                        className="flex-1"
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        {t('help.contacts.card.edit')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteContact(contact.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{t('help.documents.title')}</h2>
              <p className="text-muted-foreground">
                {t('help.documents.description')}
              </p>
            </div>
          </div>

          {/* Key Documents List */}
          {isDocumentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t('help.documents.loading')}</p>
              </div>
            </div>
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('help.documents.empty.title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('help.documents.empty.description')}
                </p>
                <Badge variant="outline" className="text-xs">
                  <Star className="mr-1 h-3 w-3" />
                  {t('help.documents.empty.tip')}
                </Badge>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((document) => (
                <Card key={document.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{document.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {document.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCountryFlag(document.country_code)}</span>
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {getExpirationStatus(document.expiration_date) && (
                      <Badge 
                        variant={getExpirationStatus(document.expiration_date)!.variant}
                        className="text-xs mb-2"
                      >
                        {getExpirationStatus(document.expiration_date)!.text}
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t('help.documents.card.essentialNote')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="instructions" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{t('help.instructions.title')}</h2>
              <p className="text-muted-foreground">
                {t('help.instructions.description')}
              </p>
            </div>
          </div>

          {isInstructionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t('help.instructions.loading')}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Funeral Wishes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    {t('help.instructions.funeral.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('help.instructions.funeral.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={t('help.instructions.funeral.placeholder')}
                    value={instructions?.funeral_wishes || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setInstructions(prev => prev ? { ...prev, funeral_wishes: value } : { id: '', funeral_wishes: value });
                      debouncedSaveInstructions('funeral_wishes', value);
                    }}
                    rows={4}
                    className="resize-none"
                  />
                </CardContent>
              </Card>

              {/* Digital Accounts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash className="h-5 w-5 text-primary" />
                    {t('help.instructions.digitalAccounts.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('help.instructions.digitalAccounts.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={t('help.instructions.digitalAccounts.placeholder')}
                    value={instructions?.digital_accounts_shutdown || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setInstructions(prev => prev ? { ...prev, digital_accounts_shutdown: value } : { id: '', digital_accounts_shutdown: value });
                      debouncedSaveInstructions('digital_accounts_shutdown', value);
                    }}
                    rows={4}
                    className="resize-none"
                  />
                </CardContent>
              </Card>

              {/* Messages to Loved Ones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    {t('help.instructions.messages.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('help.instructions.messages.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={t('help.instructions.messages.placeholder')}
                    value={instructions?.messages_to_loved_ones || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setInstructions(prev => prev ? { ...prev, messages_to_loved_ones: value } : { id: '', messages_to_loved_ones: value });
                      debouncedSaveInstructions('messages_to_loved_ones', value);
                    }}
                    rows={6}
                    className="resize-none"
                  />
                </CardContent>
              </Card>

              <div className="text-center py-4">
                <Badge variant="outline" className="text-xs">
                  <Star className="mr-1 h-3 w-3" />
                  {t('help.instructions.autoSaveNote')}
                </Badge>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </ErrorBoundary>
  );
};
