import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  RotateCw,
  Phone,
  Mail,
  Globe,
  Clock,
  ChevronRight,
  Filter,
  Download } from
'lucide-react';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Subscription {
  id: string;
  name: string;
  document_type: string;
  subscription_type: 'monthly' | 'yearly' | 'one-time' | 'none';
  renewal_cost: number;
  renewal_date: string;
  auto_renewal: boolean;
  provider_contact_info: {
    phone?: string;
    email?: string;
    website?: string;
  };
  cancellation_notice_period: number;
  importance_level: 'critical' | 'important' | 'reference';
}

interface SubscriptionPreferences {
  tracking_enabled: boolean;
  tracked_document_types: string[];
  default_reminder_days: number[];
  cost_optimization_enabled: boolean;
}

export const SubscriptionDashboard: React.FC = () => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [preferences, setPreferences] = useState<SubscriptionPreferences | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [totalMonthlyCost, setTotalMonthlyCost] = useState(0);
  const [totalYearlyCost, setTotalYearlyCost] = useState(0);
  const [upcomingRenewals, setUpcomingRenewals] = useState<Subscription[]>([]);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      // Load subscriptions
      const { data: docs, error: docsError } = await supabaseWithRetry.
      from('documents').
      select('*').
      in('subscription_type', ['monthly', 'yearly']).
      not('renewal_cost', 'is', null).
      order('renewal_date', { ascending: true });

      if (docsError) throw docsError;

      // Load preferences
      const { data: prefs, error: prefsError } = await supabaseWithRetry.
      from('subscription_preferences').
      select('*').
      eq('user_id', user.id).
      single();

      if (prefsError && prefsError.code !== 'PGRST116') {
        throw prefsError;
      }

      // If no preferences exist, create default ones
      if (!prefs) {
        const { data: newPrefs } = await supabaseWithRetry.
        from('subscription_preferences').
        insert({
          user_id: user.id,
          tracking_enabled: true,
          tracked_document_types: ['insurance_policy', 'energy_contract', 'software_license', 'subscription_service'],
          default_reminder_days: [90, 60, 30, 7],
          cost_optimization_enabled: true
        }).
        select().
        single();

        setPreferences(newPrefs);
      } else {
        setPreferences(prefs);
      }

      setSubscriptions(docs || []);
      calculateCosts(docs || []);
      findUpcomingRenewals(docs || []);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error(t('subscription.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const calculateCosts = (subs: Subscription[]) => {
    let monthly = 0;
    let yearly = 0;

    subs.forEach((sub) => {
      if (sub.subscription_type === 'monthly') {
        monthly += sub.renewal_cost;
        yearly += sub.renewal_cost * 12;
      } else if (sub.subscription_type === 'yearly') {
        yearly += sub.renewal_cost;
        monthly += sub.renewal_cost / 12;
      }
    });

    setTotalMonthlyCost(monthly);
    setTotalYearlyCost(yearly);
  };

  const findUpcomingRenewals = (subs: Subscription[]) => {
    const upcoming = subs.filter((sub) => {
      if (!sub.renewal_date) return false;
      const daysUntil = differenceInDays(new Date(sub.renewal_date), new Date());
      return daysUntil >= 0 && daysUntil <= 90;
    });
    setUpcomingRenewals(upcoming);
  };

  const updatePreference = async (key: keyof SubscriptionPreferences, value: Record<string, unknown>) => {
    if (!preferences) return;

    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      const updatedPrefs = { ...preferences, [key]: value };

      const { error } = await supabaseWithRetry.
      from('subscription_preferences').
      update(updatedPrefs).
      eq('user_id', user.id);

      if (error) throw error;

      setPreferences(updatedPrefs);
      toast.success(t('subscription.preferencesUpdated'));
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error(t('subscription.updateError'));
    }
  };

  const getDaysUntilRenewal = (renewalDate: string) => {
    return differenceInDays(new Date(renewalDate), new Date());
  };

  const getRenewalBadgeColor = (days: number) => {
    if (days <= 7) return 'destructive';
    if (days <= 30) return 'secondary';
    return 'outline';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>);

  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('subscription.dashboard.title')}</h2>
          <p className="text-muted-foreground">{t('subscription.dashboard.subtitle')}</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          {t('subscription.exportReport')}
        </Button>
      </div>

      {/* Cost Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('subscription.monthlyCost')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{totalMonthlyCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('subscription.perMonth')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('subscription.yearlyCost')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{totalYearlyCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('subscription.perYear')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('subscription.activeSubscriptions')}
            </CardTitle>
            <RotateCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingRenewals.length} {t('subscription.upcomingSoon')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals Alert */}
      {upcomingRenewals.length > 0 &&
      <Alert className="border-primary">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('subscription.upcomingRenewalsTitle')}</AlertTitle>
          <AlertDescription>
            {t('subscription.upcomingRenewalsDesc', { count: upcomingRenewals.length })}
          </AlertDescription>
        </Alert>
      }

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t('subscription.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="upcoming">{t('subscription.tabs.upcoming')}</TabsTrigger>
          <TabsTrigger value="settings">{t('subscription.tabs.settings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('subscription.allSubscriptions')}</CardTitle>
              <CardDescription>
                {t('subscription.allSubscriptionsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptions.map((sub) => {
                  const daysUntil = getDaysUntilRenewal(sub.renewal_date);
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 border rounded-lg">

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{sub.name}</h4>
                          <Badge variant={sub.auto_renewal ? 'default' : 'secondary'}>
                            {sub.auto_renewal ? t('subscription.autoRenewal') : t('subscription.manual')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {sub.subscription_type === 'monthly' ?
                          t('subscription.types.monthly') :
                          t('subscription.types.yearly')}
                          {t("subscriptions.subscriptionDashboard._1")}
                          €{sub.renewal_cost.toFixed(2)}
                          {sub.subscription_type === 'monthly' ? '/mo' : '/yr'}
                        </p>
                        {sub.provider_contact_info &&
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {sub.provider_contact_info.phone &&
                          <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {sub.provider_contact_info.phone}
                              </span>
                          }
                            {sub.provider_contact_info.email &&
                          <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {sub.provider_contact_info.email}
                              </span>
                          }
                            {sub.provider_contact_info.website &&
                          <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {sub.provider_contact_info.website}
                              </span>
                          }
                          </div>
                        }
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {format(new Date(sub.renewal_date), 'PPP')}
                          </p>
                          <Badge variant={getRenewalBadgeColor(daysUntil)}>
                            {daysUntil} {t('subscription.daysUntilRenewal')}
                          </Badge>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>);

                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('subscription.upcomingRenewals')}</CardTitle>
              <CardDescription>
                {t('subscription.next90Days')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingRenewals.map((sub) => {
                  const daysUntil = getDaysUntilRenewal(sub.renewal_date);
                  return (
                    <Alert key={sub.id} className={cn(
                      "border-l-4",
                      daysUntil <= 7 ? "border-l-destructive" :
                      daysUntil <= 30 ? "border-l-yellow-500" :
                      "border-l-muted-foreground"
                    )}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium flex items-center gap-2">
                            {sub.name}
                            <Badge variant={getRenewalBadgeColor(daysUntil)}>
                              {daysUntil} {t('subscription.days')}
                            </Badge>
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            €{sub.renewal_cost.toFixed(2)} • {format(new Date(sub.renewal_date), 'PPP')}
                          </p>
                          {sub.cancellation_notice_period > 0 && daysUntil <= sub.cancellation_notice_period &&
                          <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {t('subscription.cancellationNoticeWarning', { days: sub.cancellation_notice_period })}
                            </p>
                          }
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            {t('subscription.review')}
                          </Button>
                          {!sub.auto_renewal &&
                          <Button size="sm">
                              {t('subscription.renew')}
                            </Button>
                          }
                        </div>
                      </div>
                    </Alert>);

                })}
                {upcomingRenewals.length === 0 &&
                <p className="text-center text-muted-foreground py-8">
                    {t('subscription.noUpcomingRenewals')}
                  </p>
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('subscription.preferences')}</CardTitle>
              <CardDescription>
                {t('subscription.preferencesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="tracking-enabled" className="flex flex-col space-y-1 cursor-pointer">
                  <span>{t('subscription.enableTracking')}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {t('subscription.enableTrackingDesc')}
                  </span>
                </Label>
                <Switch
                  id="tracking-enabled"
                  checked={preferences?.tracking_enabled}
                  onCheckedChange={(checked) => updatePreference('tracking_enabled', checked)} />

              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="cost-optimization" className="flex flex-col space-y-1 cursor-pointer">
                  <span>{t('subscription.costOptimization')}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {t('subscription.costOptimizationDesc')}
                  </span>
                </Label>
                <Switch
                  id="cost-optimization"
                  checked={preferences?.cost_optimization_enabled}
                  onCheckedChange={(checked) => updatePreference('cost_optimization_enabled', checked)} />

              </div>

              <div className="space-y-2">
                <Label>{t('subscription.reminderPeriods')}</Label>
                <div className="flex gap-2">
                  {preferences?.default_reminder_days.map((days) =>
                  <Badge key={days} variant="secondary">
                      {days} {t('subscription.daysBefore')}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};