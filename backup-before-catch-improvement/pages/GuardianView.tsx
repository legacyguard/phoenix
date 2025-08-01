import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
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
  MapPin
} from 'lucide-react';
import { COUNTRY_CONFIGS } from '@/config/countries';

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

export const GuardianView: React.FC = () => {
  const { t } = useTranslation('common');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [instructions, setInstructions] = useState<Instructions | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardianInfo, setGuardianInfo] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<string>('');

  useEffect(() => {
    loadGuardianData();
  }, []);

  const loadGuardianData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error(t('guardianView.errors.pleaseLogin'));
        return;
      }

      // For this demo, we'll load all data
      // In a real application, you'd verify the user is an accepted guardian
      // and only show data they have permission to see
      
      // Load key documents only
      const { data: documentsData, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('is_key_document', true);

      if (docsError) {
        // Error loading documents
      } else {
        setDocuments(documentsData || []);
      }

      // Load important contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*');

      if (contactsError) {
        // Error loading contacts
      } else {
        setContacts(contactsData || []);
      }

      // Load instructions
      const { data: instructionsData, error: instructionsError } = await supabase
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
      
    } catch (error) {
      toast.error(t('guardianView.errors.failedToLoad'));
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('guardianView.loading')}</p>
        </div>
      </div>
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
        <Badge variant="heritage" className="mx-auto">
          <Eye className="h-3 w-3 mr-1" />
          {t('guardianView.readOnlyAccess')}
        </Badge>
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
            {t('guardianView.footer.guardianInfo')}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {t('guardianView.footer.securityNote')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};