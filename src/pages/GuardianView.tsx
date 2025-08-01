import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { useRetry } from '@/utils/retry';
import { RetryStatus } from '@/components/common/RetryStatus';
import { toast } from 'sonner';
import { 
  Shield, 
  FileText, 
  Users, 
  Heart,
  Star,
  Download,
  Eye,
  Calendar,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  PhoneCall,
  Clock
} from 'lucide-react';
import { COUNTRY_CONFIGS } from '@/config/countries';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ErrorRecovery } from '@/components/common/ErrorRecovery';

interface Document {
  id: string;
  name: string;
  type: string;
  country_code: string;
  expiration_date?: string | null;
  is_key_document?: boolean;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone_number?: string;
}

interface Instructions {
  funeral_wishes?: string;
  digital_accounts_shutdown?: string;
  messages_to_loved_ones?: string;
}

interface EmergencyContact {
  id: string;
  user_id: string;
  contact_id: string;
  priority_order: number;
  last_contacted?: string | null;
  contact: {
    id: string;
    name: string;
    email?: string;
    phone_number?: string;
    relationship?: string;
  };
}

export const GuardianView: React.FC = () => {
  const { t } = useTranslation('common');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [instructions, setInstructions] = useState<Instructions | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardianInfo, setGuardianInfo] = useState<{
    id: string;
    name: string;
    email?: string;
    relationship?: string;
    status?: string;
  } | null>(null);
  const [userInfo, setUserInfo] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  
  // Emergency access state
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyConfirmed, setEmergencyConfirmed] = useState(false);
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [accessingEmergency, setAccessingEmergency] = useState(false);
  const [showingEmergencyContacts, setShowingEmergencyContacts] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
     
    loadGuardianData();
  }, []);

  const loadGuardianData = async () => {
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      
      if (!user) {
        toast.error(t('guardianView.errors.pleaseLogin'));
        return;
      }

      // For this demo, we'll load all data
      // In a real application, you'd verify the user is an accepted guardian
      // and only show data they have permission to see
      
      // Load key documents only
      const { data: documentsData, error: docsError } = await supabaseWithRetry
        .from('documents')
        .select('*')
        .eq('is_key_document', true);

      if (docsError) {
        // Error loading documents
      } else {
        setDocuments(documentsData || []);
      }

      // Load important contacts
      const { data: contactsData, error: contactsError } = await supabaseWithRetry
        .from('contacts')
        .select('*');

      if (contactsError) {
        // Error loading contacts
      } else {
        setContacts(contactsData || []);
      }

      // Load instructions
      const { data: instructionsData, error: instructionsError } = await supabaseWithRetry
        .from('instructions')
        .select('*')
        .single();

      if (instructionsError && instructionsError.code !== 'PGRST116') {
        // Error loading instructions
      } else {
        setInstructions(instructionsData);
      }

      // Set placeholder user info
      setUserInfo(t('guardianView.defaultUserName'));
      
    } catch (error: Record<string, unknown>) {
      const timestamp = new Date().toISOString();
      const errorMessage = error?.message || t('errors.unknown');
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailed logging for debugging
      console.error('[Guardian View] Error loading guardian data:', {
        timestamp,
        operation: 'loadGuardianData',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // User-friendly message
      let userMessage = t('guardianView.errors.failedToLoad');
      
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
      
      setError(error);
      toast.error(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCountryFlag = (countryCode: string) => {
    const config = Object.values(COUNTRY_CONFIGS).find(c => c.code === countryCode);
    return config?.flag || '🏳️';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('guardianView.sections.keyDocuments.noExpiration');
    return new Date(dateString).toLocaleDateString();
  };

  const handleEmergencyAccess = async () => {
    if (!emergencyConfirmed || !emergencyNotes.trim()) {
      toast.error(t('guardianView.emergencyAccess.pleaseConfirm'));
      return;
    }

    setAccessingEmergency(true);
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) {
        toast.error(t('guardianView.errors.pleaseLogin'));
        return;
      }

      // Get the guardian relationship
      const { data: guardianData, error: guardianError } = await supabaseWithRetry
        .from('guardians')
        .select('id, user_id')
        .eq('guardian_email', user.email)
        .eq('status', 'accepted')
        .single();

      if (guardianError || !guardianData) {
        toast.error(t('guardianView.emergencyAccess.notAuthorized'));
        return;
      }

      // Load emergency contacts
      const { data: contactsData, error: contactsError } = await supabaseWithRetry
        .from('emergency_contacts')
        .select(`
          *,
          contact:contacts(*)
        `)
        .eq('user_id', guardianData.user_id)
        .order('priority_order');

      if (contactsError) {
        toast.error(t('guardianView.emergencyAccess.failedToLoadContacts'));
        return;
      }

      setEmergencyContacts(contactsData || []);
      setUserId(guardianData.user_id);

      // Log the emergency access
      const contactIds = (contactsData || []).map(ec => ec.contact_id);
      const { error: logError } = await supabaseWithRetry
        .from('emergency_access_logs')
        .insert({
          guardian_id: guardianData.id,
          user_id: guardianData.user_id,
          contacts_accessed: contactIds,
          notes: emergencyNotes
        });

      if (logError) {
        console.error('Failed to log emergency access:', logError);
      }

      setShowEmergencyModal(false);
      setShowingEmergencyContacts(true);
      
      // Send emergency notifications
      try {
        const { data: { user: currentUser } } = await supabaseWithRetry.auth.getUser();
        const guardianName = guardianData.guardian_name || currentUser?.email || 'Guardian';
        
        const notificationResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-emergency-notification`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              userId: guardianData.user_id,
              guardianId: guardianData.id,
              guardianName: guardianName,
              guardianEmail: user.email || '',
              emergencyNotes: emergencyNotes,
              timestamp: new Date().toISOString()
            }),
          }
        );
        
        if (notificationResponse.ok) {
          const result = await notificationResponse.json();
          console.log('Emergency notifications sent:', result);
        } else {
          console.error('Failed to send emergency notifications');
        }
      } catch (notificationError) {
        console.error('Error sending emergency notifications:', notificationError);
        // Don't block the UI - notifications are best effort
      }
      
      toast.success(t('guardianView.emergencyAccess.accessGranted'));
    } catch (error) {
      console.error('Emergency access error:', error);
      toast.error(t('guardianView.emergencyAccess.accessFailed'));
    } finally {
      setAccessingEmergency(false);
    }
  };

  const logContactAttempt = async (contactId: string) => {
    try {
      // Update last_contacted timestamp
      const { error } = await supabaseWithRetry
        .from('emergency_contacts')
        .update({ last_contacted: new Date().toISOString() })
        .eq('contact_id', contactId)
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to log contact attempt:', error);
      } else {
        // Update local state
        setEmergencyContacts(prev => 
          prev.map(ec => 
            ec.contact_id === contactId 
              ? { ...ec, last_contacted: new Date().toISOString() }
              : ec
          )
        );
        toast.success(t('guardianView.emergencyAccess.contactLogged'));
      }
    } catch (error) {
      console.error('Error logging contact attempt:', error);
    }
  };

  if (loading) {
    return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="w-20 h-20 rounded-full mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <Skeleton className="h-6 w-32 mx-auto" />
        </div>

        {/* Key Documents Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Important Contacts Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Final Wishes Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
  }

  // Show error recovery UI if there's an error
  if (error) {
    return (
      <ErrorBoundary>
        <ErrorRecovery 
          error={error}
          onRetry={() => {
            setError(null);
            setLoading(true);
            loadGuardianData();
          }}
        />
      </ErrorBoundary>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t('guardianView.title')}</h1>
          <p className="text-muted-foreground">
            {t('guardianView.subtitle', { userName: userInfo })}
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="heritage">
            <Eye className="h-3 w-3 mr-1" />
            {t('guardianView.readOnlyAccess')}
          </Badge>
          
          {/* Emergency Access Button */}
          <Dialog open={showEmergencyModal} onOpenChange={setShowEmergencyModal}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="lg" className="gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t('guardianView.emergencyAccess.button')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  {t('guardianView.emergencyAccess.modalTitle')}
                </DialogTitle>
                <DialogDescription className="space-y-2">
                  <p>{t('guardianView.emergencyAccess.modalDescription')}</p>
                  <p className="text-sm font-medium text-destructive">
                    {t('guardianView.emergencyAccess.warningText')}
                  </p>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency-notes">
                    {t('guardianView.emergencyAccess.reasonLabel')}
                  </Label>
                  <Textarea
                    id="emergency-notes"
                    placeholder={t('guardianView.emergencyAccess.reasonPlaceholder')}
                    value={emergencyNotes}
                    onChange={(e) => setEmergencyNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="emergency-confirm"
                    checked={emergencyConfirmed}
                    onCheckedChange={(checked) => setEmergencyConfirmed(checked as boolean)}
                  />
                  <Label 
                    htmlFor="emergency-confirm" 
                    className="text-sm font-medium leading-normal cursor-pointer"
                  >
                    {t('guardianView.emergencyAccess.confirmCheckbox')}
                  </Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEmergencyModal(false);
                    setEmergencyConfirmed(false);
                    setEmergencyNotes('');
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleEmergencyAccess}
                  disabled={!emergencyConfirmed || !emergencyNotes.trim() || accessingEmergency}
                >
                  {accessingEmergency ? (
                    <>
                      <span className="animate-spin mr-2">⚡</span>
                      {t('guardianView.emergencyAccess.accessing')}
                    </>
                  ) : (
                    t('guardianView.emergencyAccess.confirmButton')
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Documents */}
      <Card variant="heritage">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {t('guardianView.sections.keyDocuments.title')}
          </CardTitle>
          <CardDescription>
            {t('guardianView.sections.keyDocuments.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.length > 0 ? (
              documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <h4 className="font-medium">{document.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{document.type}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          {getCountryFlag(document.country_code)}
                          <span className="ml-1">
                            {COUNTRY_CONFIGS[document.country_code as keyof typeof COUNTRY_CONFIGS]?.name}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      {t('guardianView.sections.keyDocuments.keyDocumentBadge')}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {t('guardianView.sections.keyDocuments.expires')}: {formatDate(document.expiration_date)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {t('guardianView.sections.keyDocuments.empty')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Important Contacts */}
      <Card variant="earth">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            {t('guardianView.sections.importantContacts.title')}
          </CardTitle>
          <CardDescription>
            {t('guardianView.sections.importantContacts.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{contact.name}</h4>
                      <p className="text-sm text-muted-foreground">{contact.role}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1 text-sm">
                    {contact.email && (
                      <p className="flex items-center text-muted-foreground">
                        <Mail className="h-3 w-3 mr-1" />
                        {contact.email}
                      </p>
                    )}
                    {contact.phone_number && (
                      <p className="flex items-center text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1" />
                        {contact.phone_number}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {t('guardianView.sections.importantContacts.empty')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Final Wishes & Instructions */}
      <Card variant="heritage">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            {t('guardianView.sections.finalWishes.title')}
          </CardTitle>
          <CardDescription>
            {t('guardianView.sections.finalWishes.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Funeral Wishes */}
            {instructions?.funeral_wishes && (
              <div className="space-y-2">
                <h4 className="font-medium text-primary">{t('guardianView.sections.finalWishes.funeralWishes')}</h4>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm">{instructions.funeral_wishes}</p>
                </div>
              </div>
            )}

            {/* Digital Accounts */}
            {instructions?.digital_accounts_shutdown && (
              <div className="space-y-2">
                <h4 className="font-medium text-primary">{t('guardianView.sections.finalWishes.digitalAccounts')}</h4>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm">{instructions.digital_accounts_shutdown}</p>
                </div>
              </div>
            )}

            {/* Messages to Loved Ones */}
            {instructions?.messages_to_loved_ones && (
              <div className="space-y-2">
                <h4 className="font-medium text-primary">{t('guardianView.sections.finalWishes.messagesToLovedOnes')}</h4>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm">{instructions.messages_to_loved_ones}</p>
                </div>
              </div>
            )}

            {!instructions && (
              <p className="text-center text-muted-foreground py-8">
                {t('guardianView.sections.finalWishes.empty')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Guardian Information */}
      <Card>
        <CardContent className="text-center py-6">
          <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {t('guardianView.guardianInfo.description')}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {t('guardianView.guardianInfo.securityNote')}
          </p>
        </CardContent>
      </Card>

      {/* Emergency Contacts Display - Only shown after emergency access */}
      {showingEmergencyContacts && emergencyContacts.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {t('guardianView.emergencyAccess.contactsTitle')}
              </span>
              <Badge variant="destructive">
                {t('guardianView.emergencyAccess.priorityOrder')}
              </Badge>
            </CardTitle>
            <CardDescription>
              {t('guardianView.emergencyAccess.contactsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emergencyContacts.map((ec, index) => (
                <div
                  key={ec.id}
                  className="p-4 border rounded-lg bg-background"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10 flex-shrink-0">
                        <span className="text-sm font-bold text-destructive">
                          {index + 1}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-semibold text-lg">
                            {ec.contact.name}
                          </h4>
                          {ec.contact.relationship && (
                            <p className="text-sm text-muted-foreground">
                              {ec.contact.relationship}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {ec.contact.phone_number && (
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${ec.contact.phone_number}`}
                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                              >
                                <PhoneCall className="h-4 w-4" />
                                {ec.contact.phone_number}
                              </a>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => logContactAttempt(ec.contact_id)}
                              >
                                {t('guardianView.emergencyAccess.logContact')}
                              </Button>
                            </div>
                          )}
                          
                          {ec.contact.email && (
                            <div className="flex items-center gap-2">
                              <a
                                href={`mailto:${ec.contact.email}`}
                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                              >
                                <Mail className="h-4 w-4" />
                                {ec.contact.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {t('guardianView.emergencyAccess.priority', { 
                          order: index + 1 
                        })}
                      </Badge>
                      {ec.last_contacted && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {t('guardianView.emergencyAccess.lastContacted', {
                            time: new Date(ec.last_contacted).toLocaleString()
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                {t('guardianView.emergencyAccess.importantNote')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};