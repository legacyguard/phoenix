import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle,
  X,
  RotateCcw,
  Calendar,
  FileText,
  BellOff
} from 'lucide-react';
import { format, formatDistanceToNow, addDays } from 'date-fns';
import { toast } from 'sonner';

interface DocumentAlert {
  id: string;
  document_id: string;
  alert_type: 'expiring_90' | 'expiring_30' | 'expiring_7' | 'expired';
  alert_date: string;
  is_read: boolean;
  is_dismissed: boolean;
  snooze_until: string | null;
  created_at: string;
  document: {
    id: string;
    name: string;
    document_type: string;
    renewal_date: string;
    renewal_action?: string;
  };
}

interface AlertCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertCountChange?: (count: number) => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  isOpen,
  onClose,
  onAlertCountChange
}) => {
  const { t } = useTranslation('ui');
  const [alerts, setAlerts] = useState<DocumentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'snoozed' | 'dismissed'>('active');

  const loadAlerts = useCallback(async () => {
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      let query = supabaseWithRetry
        .from('alerts')
        .select(`
          *,
          document:documents!inner(
            id,
            name,
            document_type,
            renewal_date,
            metadata
          )
        `)
        .eq('user_id', user.id)
        .order('alert_date', { ascending: true });

      // Filter based on active tab
      if (activeTab === 'active') {
        query = query
          .eq('is_dismissed', false)
          .or('snooze_until.is.null,snooze_until.lte.now()');
      } else if (activeTab === 'snoozed') {
        query = query
          .eq('is_dismissed', false)
          .gt('snooze_until', new Date().toISOString());
      } else if (activeTab === 'dismissed') {
        query = query.eq('is_dismissed', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      const alertsWithDocumentData = data?.map(alert => ({
        ...alert,
        document: {
          ...alert.document,
          renewal_action: alert.document.metadata?.renewal_action
        }
      })) || [];

      setAlerts(alertsWithDocumentData);

      // Update unread count
      const unreadCount = alertsWithDocumentData.filter(
        a => !a.is_read && !a.is_dismissed && (!a.snooze_until || new Date(a.snooze_until) <= new Date())
      ).length;
      onAlertCountChange?.(unreadCount);

    } catch (error) {
      console.error('[AlertCenter] Error loading alerts:', error);
      toast.error(t('ui.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [activeTab, onAlertCountChange, t]);

  useEffect(() => {
     
    if (isOpen) {
      loadAlerts();
    }
  }, [isOpen, activeTab, loadAlerts]);

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabaseWithRetry
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (error) {
      console.error('[AlertCenter] Error marking as read:', error);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const { error } = await supabaseWithRetry
        .from('alerts')
        .update({ is_dismissed: true })
        .eq('id', alertId);

      if (error) throw error;

      toast.success(t('ui.messages.dismissed'));
      loadAlerts();
    } catch (error) {
      console.error('[AlertCenter] Error dismissing alert:', error);
      toast.error(t('ui.errors.dismissFailed'));
    }
  };

  const snoozeAlert = async (alertId: string, days: number) => {
    try {
      const snoozeUntil = addDays(new Date(), days).toISOString();
      
      const { error } = await supabaseWithRetry
        .from('alerts')
        .update({ snooze_until: snoozeUntil })
        .eq('id', alertId);

      if (error) throw error;

      toast.success(t('alerts.messages.snoozed', { days }));
      loadAlerts();
    } catch (error) {
      console.error('[AlertCenter] Error snoozing alert:', error);
      toast.error(t('ui.errors.snoozeFailed'));
    }
  };

  const markDocumentAsRenewed = async (documentId: string) => {
    try {
      // This would typically update the document's renewal date
      // For now, we'll just dismiss related alerts
      const { error } = await supabaseWithRetry
        .from('alerts')
        .update({ is_dismissed: true })
        .eq('document_id', documentId);

      if (error) throw error;

      toast.success(t('ui.messages.markedAsRenewed'));
      loadAlerts();
    } catch (error) {
      console.error('[AlertCenter] Error marking as renewed:', error);
      toast.error(t('ui.errors.renewFailed'));
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'expiring_7':
      case 'expiring_30':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'expiring_90':
        return <Bell className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertBadgeVariant = (alertType: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (alertType) {
      case 'expired':
        return 'destructive';
      case 'expiring_7':
      case 'expiring_30':
        return 'default';
      case 'expiring_90':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getAlertMessage = (alert: DocumentAlert) => {
    const daysUntil = Math.ceil((new Date(alert.alert_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    switch (alert.alert_type) {
      case 'expired':
        return t('alerts.types.expired', { 
          documentName: alert.document.name,
          daysAgo: Math.abs(daysUntil)
        });
      case 'expiring_7':
        return t('alerts.types.expiring7', {
          documentName: alert.document.name,
          days: daysUntil
        });
      case 'expiring_30':
        return t('alerts.types.expiring30', {
          documentName: alert.document.name,
          days: daysUntil
        });
      case 'expiring_90':
        return t('alerts.types.expiring90', {
          documentName: alert.document.name,
          days: daysUntil
        });
      default:
        return alert.document.name;
    }
  };

  const renderAlert = (alert: DocumentAlert) => (
    <Card 
      key={alert.id} 
      className={`mb-3 ${!alert.is_read ? 'border-primary/50 bg-primary/5' : ''}`}
      onClick={() => !alert.is_read && markAsRead(alert.id)}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {getAlertIcon(alert.alert_type)}
              <span className="font-medium">{getAlertMessage(alert)}</span>
              {!alert.is_read && (
                <Badge variant="secondary" className="ml-2">
                  {t('ui.unread')}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {t(`documentTypes.${alert.document.document_type}`)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t('alerts.expiresOn', { date: format(new Date(alert.alert_date), 'PPP') })}
              </span>
            </div>

            {alert.document.renewal_action && (
              <Alert className="mt-2">
                <AlertDescription className="text-sm">
                  <strong>{t('ui.renewalInstructions')}:</strong> {alert.document.renewal_action}
                </AlertDescription>
              </Alert>
            )}

            {alert.snooze_until && new Date(alert.snooze_until) > new Date() && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <BellOff className="h-3 w-3" />
                {t('alerts.snoozedUntil', { date: format(new Date(alert.snooze_until), 'PPP') })}
              </div>
            )}
          </div>

          <Badge variant={getAlertBadgeVariant(alert.alert_type)}>
            {t('ui.badges.${alert.alert_type}')}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mt-4">
          {!alert.is_dismissed && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  markDocumentAsRenewed(alert.document_id);
                }}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('ui.markAsRenewed')}
              </Button>
              
              {!alert.snooze_until || new Date(alert.snooze_until) <= new Date() ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      snoozeAlert(alert.id, 7);
                    }}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {t('ui.snooze7Days')}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissAlert(alert.id);
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    {t('ui.dismiss')}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    snoozeAlert(alert.id, 0); // Remove snooze
                  }}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  {t('ui.unsnooze')}
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-background shadow-lg">
        <Card className="h-full border-0 rounded-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {t('ui.title')}
                </CardTitle>
                <CardDescription>
                  {t('ui.description')}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'snoozed' | 'dismissed')}>
              <TabsList className="w-full rounded-none">
                <TabsTrigger value="active" className="flex-1">
                  {t('ui.tabs.active')}
                </TabsTrigger>
                <TabsTrigger value="snoozed" className="flex-1">
                  {t('ui.tabs.snoozed')}
                </TabsTrigger>
                <TabsTrigger value="dismissed" className="flex-1">
                  {t('ui.tabs.dismissed')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-0">
                <ScrollArea className="h-[calc(100vh-200px)] p-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t('ui.noActiveAlerts')}
                      </p>
                    </div>
                  ) : (
                    alerts.map(renderAlert)
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="snoozed" className="mt-0">
                <ScrollArea className="h-[calc(100vh-200px)] p-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t('ui.noSnoozedAlerts')}
                      </p>
                    </div>
                  ) : (
                    alerts.map(renderAlert)
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="dismissed" className="mt-0">
                <ScrollArea className="h-[calc(100vh-200px)] p-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t('ui.noDismissedAlerts')}
                      </p>
                    </div>
                  ) : (
                    alerts.map(renderAlert)
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
