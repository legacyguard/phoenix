import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const StrategicSummary: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [userProgress, setUserProgress] = useState<'initial' | 'documentAdded' | 'guardianAdded'>('initial');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserProgress();
  }, []);

  const checkUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has documents
      const { count: documentCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Check if user has guardians
      const { count: guardianCount } = await supabase
        .from('guardians')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if ((documentCount || 0) > 0 && (guardianCount || 0) > 0) {
        setUserProgress('guardianAdded');
      } else if ((documentCount || 0) > 0) {
        setUserProgress('documentAdded');
      } else {
        setUserProgress('initial');
      }
    } catch (error) {
      console.error('Chyba pri kontrole stavu profilu používateľa:', {
        error,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : 'Neznáma chyba',
        component: 'StrategicSummary.checkUserProgress',
        documentCount,
        guardianCount
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getContent = () => {
    switch (userProgress) {
      case 'initial':
        return {
          text: t('dashboard.strategicSummary.initial'),
          buttonLabel: t('dashboard.strategicSummary.addDocument'),
          buttonIcon: <FileText className="mr-2 h-4 w-4" />,
          buttonAction: () => navigate('/vault'),
        };
      case 'documentAdded':
        return {
          text: t('dashboard.strategicSummary.documentAdded'),
          buttonLabel: t('dashboard.strategicSummary.addGuardian'),
          buttonIcon: <Shield className="mr-2 h-4 w-4" />,
          buttonAction: () => navigate('/guardians'),
        };
      case 'guardianAdded':
        return {
          text: t('dashboard.strategicSummary.guardianAdded'),
          buttonLabel: t('dashboard.strategicSummary.continueBuilding'),
          buttonIcon: <ArrowRight className="mr-2 h-4 w-4" />,
          buttonAction: () => navigate('/vault'),
        };
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-10 bg-muted rounded w-40"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const content = getContent();
  if (!content) return null;

  return (
    <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            {content.text}
          </p>
          <Button 
            onClick={content.buttonAction}
            size="lg"
            className="font-semibold"
          >
            {content.buttonIcon}
            {content.buttonLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
