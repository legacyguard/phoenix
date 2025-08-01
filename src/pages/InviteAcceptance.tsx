import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Shield, User } from 'lucide-react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface GuardianInvitation {
  id: string;
  full_name: string;
  relationship: string;
  roles: string[];
  invitation_status: string;
  user_id: string;
}

export const InviteAcceptance: React.FC = () => {
  const { inviteToken } = useParams<{ inviteToken: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [invitation, setInvitation] = useState<GuardianInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [inviterName, setInviterName] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();

    const loadInvitationData = async () => {
      if (!inviteToken) {
        if (mounted) {
          toast.error(t('inviteAcceptance.errors.invalidLink'));
          navigate('/');
        }
        return;
      }

      try {
        // Note: Supabase doesn't support AbortController yet, but we can still check mounted status
        const { data, error } = await supabase
          .from('guardians')
          .select('*')
          .eq('invitation_token', inviteToken)
          .single();

        if (!mounted) return;

        if (error || !data) {
          toast.error(t('inviteAcceptance.errors.notFound'));
          navigate('/');
          return;
        }

        if (data.invitation_status !== 'sent') {
          toast.error(t('inviteAcceptance.errors.alreadyProcessed'));
          navigate('/');
          return;
        }

        setInvitation(data);
        // Get inviter's information
        setInviterName(t('inviteAcceptance.defaultInviterName'));
      } catch (error: any) {
        if (!mounted) return;
        
        const timestamp = new Date().toISOString();
const errorMessage = error?.message || t('errors.unknown');
        const errorCode = error?.code || 'UNKNOWN_ERROR';
        
        console.error('[Guardian Invitation] Error loading invitation:', {
          timestamp,
          operation: 'loadInvitation',
          errorCode,
          errorMessage,
          errorDetails: error,
          stack: error?.stack
        });
        
        let userMessage = t('inviteAcceptance.errors.loadingFailed');
        
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
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadInvitationData();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [inviteToken, navigate, t]);

  const loadInvitation = async () => {
    if (!inviteToken) {
      toast.error(t('inviteAcceptance.errors.invalidLink'));
      navigate('/');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('guardians')
        .select('*')
        .eq('invitation_token', inviteToken)
        .single();

      if (error || !data) {
        toast.error(t('inviteAcceptance.errors.notFound'));
        navigate('/');
        return;
      }

      if (data.invitation_status !== 'sent') {
        toast.error(t('inviteAcceptance.errors.alreadyProcessed'));
        navigate('/');
        return;
      }

      setInvitation(data);
      
      // Get inviter's information (you might want to create a profiles table for this)
      // For now, we'll use a placeholder
      setInviterName(t('inviteAcceptance.defaultInviterName'));
      
    } catch (error: any) {
      const timestamp = new Date().toISOString();
const errorMessage = error?.message || t('errors.unknown');
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailed logging for debugging
      console.error('[Guardian Invitation] Error loading invitation:', {
        timestamp,
        operation: 'loadInvitation',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // User-friendly message
      let userMessage = t('inviteAcceptance.errors.loadingFailed');
      
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
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation) return;
    
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('guardians')
        .update({
          invitation_status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (error) {
        throw error;
      }

      toast.success(t('inviteAcceptance.messages.accepted'));
      
      // Redirect to guardian view or login
      navigate('/guardian-view');
      
    } catch (error: any) {
      const timestamp = new Date().toISOString();
const errorMessage = error?.message || t('errors.unknown');
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailed logging for debugging
      console.error('[Guardian Invitation] Error accepting invitation:', {
        timestamp,
        operation: 'handleAccept',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // User-friendly message
      let userMessage = t('inviteAcceptance.errors.acceptFailed');
      
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
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!invitation) return;
    
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('guardians')
        .update({
          invitation_status: 'declined'
        })
        .eq('id', invitation.id);

      if (error) {
        throw error;
      }

      toast.success(t('inviteAcceptance.messages.declined'));
      navigate('/');
      
    } catch (error: any) {
      const timestamp = new Date().toISOString();
const errorMessage = error?.message || t('errors.unknown');
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailed logging for debugging
      console.error('[Guardian Invitation] Error declining invitation:', {
        timestamp,
        operation: 'handleDecline',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // User-friendly message
      let userMessage = t('inviteAcceptance.errors.declineFailed');
      
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
      setProcessing(false);
    }
  };

  if (loading) {
    return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('inviteAcceptance.loading')}</p>
        </div>
      </div>
    </ErrorBoundary>
  );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('inviteAcceptance.notFound.title')}</h2>
            <p className="text-muted-foreground">{t('inviteAcceptance.notFound.description')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl mb-2">
            {t('invite.title', { name: inviterName })}
          </CardTitle>
          <CardDescription className="text-base">
            {t('inviteAcceptance.subtitle')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Guardian Role Details */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold flex items-center">
              <User className="h-4 w-4 mr-2" />
              {t('inviteAcceptance.guardianRole.title')}
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>{t('inviteAcceptance.guardianRole.yourName')}</strong> {invitation.full_name}</p>
              <p><strong>{t('inviteAcceptance.guardianRole.relationship')}</strong> {invitation.relationship}</p>
              <div>
                <strong>{t('inviteAcceptance.guardianRole.responsibilities')}</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {invitation.roles.map((role, index) => (
                    <Badge key={index} variant="heritage" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* What This Means */}
          <div className="bg-primary/5 p-4 rounded-lg">
            <h3 className="font-semibold text-primary mb-2">{t('inviteAcceptance.whatThisMeans.title')}</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• {t('inviteAcceptance.whatThisMeans.point1')}</li>
              <li>• {t('inviteAcceptance.whatThisMeans.point2')}</li>
              <li>• {t('inviteAcceptance.whatThisMeans.point3')}</li>
              <li>• {t('inviteAcceptance.whatThisMeans.point4')}</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleAccept}
              disabled={processing}
              className="flex-1"
              size="lg"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {processing ? t('inviteAcceptance.buttons.processing') : t('inviteAcceptance.buttons.acceptRole')}
            </Button>
            <Button 
              variant="outline"
              onClick={handleDecline}
              disabled={processing}
              className="flex-1"
              size="lg"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t('inviteAcceptance.buttons.decline')}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {t('inviteAcceptance.disclaimer')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};