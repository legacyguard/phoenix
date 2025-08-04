import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Activity, MessageSquare, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ExecutorStatusReporting } from './ExecutorStatusReporting';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Communication {
  id: string;
  beneficiary_name: string;
  communication_type: string;
  subject: string;
  communication_date: string;
}

interface FamilyExecutorStatusViewProps {
  deceasedUserId: string;
}

export const FamilyExecutorStatusView: React.FC<FamilyExecutorStatusViewProps> = ({
  deceasedUserId
}) => {
  const { user } = useAuth();
  const { t } = useTranslation('family');
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [executorName, setExecutorName] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch recent communications
      const { data: commData, error: commError } = await supabase
        .from('beneficiary_communications')
        .select('id, beneficiary_name, communication_type, subject, communication_date')
        .eq('deceased_user_id', deceasedUserId)
        .order('communication_date', { ascending: false })
        .limit(5);

      if (!commError && commData) {
        setCommunications(commData);
      }

      // Get executor name
      const { data: statusData } = await supabase
        .rpc('get_latest_executor_status', { p_deceased_user_id: deceasedUserId });

      if (statusData && statusData[0]) {
        setExecutorName(statusData[0].executor_name || t('familyExecutorView.executor'));
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [deceasedUserId, t]);

  useEffect(() => {
     
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('familyExecutorView.title')}</h1>
        <p className="text-muted-foreground">
          {t('familyExecutorView.subtitle')}
        </p>
      </div>

      {/* Status Section - Read Only */}
      <ExecutorStatusReporting deceasedUserId={deceasedUserId} isReadOnly={true} />

      {/* Recent Communications Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t('familyExecutorView.communications.title')}
          </CardTitle>
          <CardDescription>
            {t('familyExecutorView.communications.description', { executor: executorName || t('familyExecutorView.theExecutor') })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {communications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('familyExecutorView.communications.empty')}
            </p>
          ) : (
            <div className="space-y-3">
              {communications.map((comm) => (
                <div key={comm.id} className="flex items-start justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{comm.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('familyExecutorView.communications.to', { name: comm.beneficiary_name })} • {t(`beneficiaryCommunications.types.${comm.communication_type}`)}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(comm.communication_date), 'MMM d')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          {t('familyExecutorView.footer', { executor: executorName || t('familyExecutorView.theExecutor') })}
        </p>
      </div>
    </div>
  );
};
