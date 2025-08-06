import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Mail, FileText, Heart, Shield, MessageSquare, Home, Book } from 'lucide-react';

interface ImportantContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  notes?: string;
}

interface GuardianPlaybookData {
  id?: string;
  funeral_wishes: string;
  digital_accounts_shutdown: string;
  important_contacts: ImportantContact[];
  document_locations: string;
  personal_messages: string;
  practical_instructions: string;
  updated_at?: string;
}

interface GuardianPlaybookViewProps {
  guardianId: string;
  userName: string;
}

export default function GuardianPlaybookView({ guardianId, userName }: GuardianPlaybookViewProps) {
  const { t } = useTranslation('family');
  const [loading, setLoading] = useState(true);
  const [playbook, setPlaybook] = useState<GuardianPlaybookData | null>(null);

  const fetchPlaybook = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error(t('family.notAuthenticated'));
        return;
      }

      // Check if user is the guardian
      const { data: guardianData, error: guardianError } = await supabase
        .from('guardians')
        .select('*')
        .eq('id', guardianId)
        .eq('email', user.email)
        .eq('status', 'accepted')
        .single();

      if (guardianError || !guardianData) {
        toast.error(t('family.accessDenied'));
        return;
      }

      // Fetch the playbook
      const { data, error } = await supabase
        .from('guardian_playbooks')
        .select('*')
        .eq('guardian_id', guardianId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPlaybook({
          ...data,
          important_contacts: data.important_contacts || []
        });
      }
    } catch (error) {
      console.error('Error fetching playbook:', error);
      toast.error(t('family.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [guardianId, t]);

  useEffect(() => {
    fetchPlaybook();
  }, [guardianId, fetchPlaybook]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Book className="h-8 w-8 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('family.loading')}</p>
        </div>
      </div>
    );
  }

  if (!playbook) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('family.notFound.title')}</h2>
            <p className="text-muted-foreground">{t('family.notFound.description')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sections = [
    {
      id: 'funeral',
      icon: Heart,
      title: t('family.tabs.funeral'),
      content: playbook.funeral_wishes,
      color: 'text-pink-500'
    },
    {
      id: 'digital',
      icon: Shield,
      title: t('family.tabs.digital'),
      content: playbook.digital_accounts_shutdown,
      color: 'text-blue-500'
    },
    {
      id: 'documents',
      icon: FileText,
      title: t('family.tabs.documents'),
      content: playbook.document_locations,
      color: 'text-green-500'
    },
    {
      id: 'messages',
      icon: MessageSquare,
      title: t('family.tabs.messages'),
      content: playbook.personal_messages,
      color: 'text-purple-500'
    },
    {
      id: 'instructions',
      icon: Home,
      title: t('family.tabs.instructions'),
      content: playbook.practical_instructions,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4">
            <Book className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {t('playbook.viewTitle', { userName })}
          </h1>
          <p className="text-muted-foreground">
            {t('family.viewDescription')}
          </p>
          <Badge variant="secondary" className="mt-4">
            {t('family.lastUpdated')}: {new Date(playbook.updated_at || '').toLocaleDateString()}
          </Badge>
        </div>

        {/* Important Contacts */}
        {playbook.important_contacts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('family.importantContacts.label')}
              </CardTitle>
              <CardDescription>
                {t('family.importantContacts.viewDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {playbook.important_contacts.map((contact, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{contact.name}</h4>
                          <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {contact.phone && (
                          <a 
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </a>
                        )}
                        {contact.email && (
                          <a 
                            href={`mailto:${contact.email}`}
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </a>
                        )}
                      </div>
                      {contact.notes && (
                        <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                          {contact.notes}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return section.content ? (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${section.color}`} />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{section.content}</p>
                  </div>
                </CardContent>
              </Card>
            ) : null;
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>{t('family.viewFooter')}</p>
        </div>
      </div>
    </div>
  );
}
