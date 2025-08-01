import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  LineChart,
  Target,
  Zap,
  Heart,
  Brain,
  RefreshCw } from
'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart } from
'recharts';
import { analyticsService } from '@/services/analytics.service';
import { AnalyticsEvent } from '@/types/analytics';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface EventStreamItem extends AnalyticsEvent {
  id: string;
  timestamp: Date;
}

interface Metric {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
}

const EMOTION_COLORS = {
  curious: '#3B82F6',
  anxious: '#EF4444',
  relieved: '#10B981',
  accomplished: '#8B5CF6',
  confused: '#F59E0B',
  motivated: '#EC4899',
  satisfied: '#06B6D4',
  frustrated: '#DC2626',
  neutral: '#6B7280'
};

export const AnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation('common');
  const [eventStream, setEventStream] = useState<EventStreamItem[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock data for charts - in production, this would come from your analytics service
  const [metrics, setMetrics] = useState({
    dau: 0,
    onboardingRate: 0,
    taskCompletionRate: 0,
    avgTimeToFirstAction: 0,
    retentionRate: 0,
    featureAdoption: 0
  });

  // Subscribe to real-time events
  useEffect(() => {
    if (!isStreaming) return;

    const subscription = analyticsService.subscribe((event) => {
      const streamItem: EventStreamItem = {
        ...event,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date()
      };

      setEventStream((prev) => [streamItem, ...prev].slice(0, 50)); // Keep last 50 events
    });

    return () => subscription.unsubscribe();
  }, [isStreaming]);

  // Simulate fetching metrics
  useEffect(() => {
    const fetchMetrics = () => {
      // In production, fetch from your analytics backend
      setMetrics({
        dau: Math.floor(Math.random() * 500) + 100,
        onboardingRate: Math.random() * 30 + 70, // 70-100%
        taskCompletionRate: Math.random() * 40 + 50, // 50-90%
        avgTimeToFirstAction: Math.floor(Math.random() * 300) + 60, // 60-360 seconds
        retentionRate: Math.random() * 30 + 60, // 60-90%
        featureAdoption: Math.random() * 50 + 30 // 30-80%
      });
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, [timeRange, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const getEmotionIcon = (emotion?: string) => {
    switch (emotion) {
      case 'curious':return Brain;
      case 'anxious':return AlertCircle;
      case 'relieved':
      case 'satisfied':return CheckCircle2;
      case 'accomplished':return Target;
      case 'motivated':return Zap;
      case 'frustrated':return AlertCircle;
      default:return Activity;
    }
  };

  const getEmotionColor = (emotion?: string) => {
    return EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] || EMOTION_COLORS.neutral;
  };

  // Mock data for charts
  const onboardingFunnelData = [
  { stage: 'Started', users: 1000, rate: 100 },
  { stage: 'Q1 Completed', users: 850, rate: 85 },
  { stage: 'Q2 Completed', users: 720, rate: 72 },
  { stage: 'Q3 Completed', users: 650, rate: 65 },
  { stage: 'Q4 Completed', users: 600, rate: 60 },
  { stage: 'Tasks Generated', users: 580, rate: 58 }];


  const emotionalJourneyData = [
  { name: 'Curious', value: 35, color: EMOTION_COLORS.curious },
  { name: 'Anxious', value: 15, color: EMOTION_COLORS.anxious },
  { name: 'Relieved', value: 20, color: EMOTION_COLORS.relieved },
  { name: 'Accomplished', value: 25, color: EMOTION_COLORS.accomplished },
  { name: 'Frustrated', value: 5, color: EMOTION_COLORS.frustrated }];


  const userActivityData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    active: Math.floor(Math.random() * 200) + 50,
    new: Math.floor(Math.random() * 50) + 10
  }));

  const featureUsageData = [
  { feature: 'Document Upload', usage: 85, adoption: 72 },
  { feature: 'Guardian Invite', usage: 62, adoption: 45 },
  { feature: 'Will Builder', usage: 45, adoption: 38 },
  { feature: 'Asset Tracking', usage: 78, adoption: 65 },
  { feature: 'Emergency Contacts', usage: 92, adoption: 88 }];


  const actionableMetrics: Metric[] = [
  {
    label: t('analytics.metrics.dailyActiveUsers'),
    value: metrics.dau,
    change: 12,
    icon: Users,
    color: 'text-blue-600'
  },
  {
    label: t('analytics.metrics.onboardingCompletion'),
    value: `${metrics.onboardingRate.toFixed(1)}%`,
    change: -3,
    icon: CheckCircle2,
    color: 'text-green-600'
  },
  {
    label: t('analytics.metrics.taskCompletion'),
    value: `${metrics.taskCompletionRate.toFixed(1)}%`,
    change: 5,
    icon: Target,
    color: 'text-purple-600'
  },
  {
    label: t('analytics.metrics.timeToFirstAction'),
    value: `${Math.floor(metrics.avgTimeToFirstAction / 60)}m ${metrics.avgTimeToFirstAction % 60}s`,
    change: -15,
    icon: Clock,
    color: 'text-orange-600'
  }];


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('analytics.title')}</h2>
          <p className="text-muted-foreground">
            {t('analytics.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">{t('analytics.timeRange.24h')}</SelectItem>
              <SelectItem value="7d">{t('analytics.timeRange.7d')}</SelectItem>
              <SelectItem value="30d">{t('analytics.timeRange.30d')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {actionableMetrics.map((metric, index) =>
        <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.label}
              </CardTitle>
              <metric.icon className={cn("h-4 w-4", metric.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.change !== undefined &&
            <p className={cn(
              "text-xs flex items-center mt-1",
              metric.change > 0 ? "text-green-600" : "text-red-600"
            )}>
                  <TrendingUp className={cn(
                "h-3 w-3 mr-1",
                metric.change < 0 && "rotate-180"
              )} />
                  {Math.abs(metric.change)}{t("analytics.analyticsDashboard.from_last_period_1")}
            </p>
            }
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">{t('analytics.tabs.insights')}</TabsTrigger>
          <TabsTrigger value="funnel">{t('analytics.tabs.funnel')}</TabsTrigger>
          <TabsTrigger value="emotions">{t('analytics.tabs.emotions')}</TabsTrigger>
          <TabsTrigger value="events">{t('analytics.tabs.events')}</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* User Activity Trend */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.charts.userActivity.title')}</CardTitle>
                <CardDescription>
                  {t('analytics.charts.userActivity.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width={t("assets.assetOverview.100_2")} height={300}>
                  <AreaChart data={userActivityData}>
                    <CartesianGrid strokeDasharray={t("analytics.analyticsDashboard.3_3_7")} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="active"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                      name={t('analytics.charts.userActivity.active')} />

                    <Area
                      type="monotone"
                      dataKey="new"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                      name={t('analytics.charts.userActivity.new')} />

                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Feature Usage */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.charts.featureUsage.title')}</CardTitle>
                <CardDescription>
                  {t('analytics.charts.featureUsage.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width={t("assets.assetOverview.100_2")} height={300}>
                  <BarChart data={featureUsageData} layout="horizontal">
                    <CartesianGrid strokeDasharray={t("analytics.analyticsDashboard.3_3_7")} />
                    <XAxis dataKey="feature" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="usage"
                      fill="#8B5CF6"
                      name={t('analytics.charts.featureUsage.usage')} />

                    <Bar
                      dataKey="adoption"
                      fill="#EC4899"
                      name={t('analytics.charts.featureUsage.adoption')} />

                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Actionable Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>{t('analytics.insights.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('analytics.insights.lowCompletion.title')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('analytics.insights.lowCompletion.description')}
                    </p>
                    <Button variant="link" className="h-auto p-0 mt-1">
                      {t('analytics.insights.lowCompletion.action')}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('analytics.insights.highEngagement.title')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('analytics.insights.highEngagement.description')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('analytics.insights.opportunity.title')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('analytics.insights.opportunity.description')}
                    </p>
                    <Button variant="link" className="h-auto p-0 mt-1">
                      {t('analytics.insights.opportunity.action')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.charts.onboardingFunnel.title')}</CardTitle>
              <CardDescription>
                {t('analytics.charts.onboardingFunnel.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width={t("assets.assetOverview.100_2")} height={400}>
                <BarChart data={onboardingFunnelData} layout="horizontal">
                  <CartesianGrid strokeDasharray={t("analytics.analyticsDashboard.3_3_7")} />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#3B82F6">
                    {onboardingFunnelData.map((entry, index) =>
                    <Cell
                      key={`cell-${index}`}
                      fill={`rgba(59, 130, 246, ${1 - index * 0.15})`} />

                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-6 space-y-3">
                {onboardingFunnelData.slice(0, -1).map((stage, index) => {
                  const nextStage = onboardingFunnelData[index + 1];
                  const dropoff = ((stage.users - nextStage.users) / stage.users * 100).toFixed(1);

                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{stage.stage} → {nextStage.stage}</p>
                        <p className="text-sm text-muted-foreground">
                          {stage.users} → {nextStage.users} users
                        </p>
                      </div>
                      <Badge variant={parseFloat(dropoff) > 20 ? "destructive" : "secondary"}>
                        {dropoff}{t("analytics.analyticsDashboard.drop_off_8")}
                      </Badge>
                    </div>);

                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emotions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.charts.emotionalJourney.title')}</CardTitle>
              <CardDescription>
                {t('analytics.charts.emotionalJourney.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <ResponsiveContainer width={t("assets.assetOverview.100_2")} height={300}>
                  <PieChart>
                    <Pie
                      data={emotionalJourneyData}
                      cx={t("assets.assetOverview.50_4")}
                      cy={t("assets.assetOverview.50_4")}
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value">

                      {emotionalJourneyData.map((entry, index) =>
                      <Cell key={`cell-${index}`} fill={entry.color} />
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-3">
                  <h4 className="font-medium">{t('analytics.emotions.insights')}</h4>
                  {emotionalJourneyData.map((emotion, index) => {
                    const Icon = getEmotionIcon(emotion.name.toLowerCase());
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-4 w-4" style={{ color: emotion.color }} />
                          <span className="text-sm">{emotion.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full"
                              style={{
                                width: `${emotion.value}%`,
                                backgroundColor: emotion.color
                              }} />

                          </div>
                          <span className="text-sm text-muted-foreground w-10 text-right">
                            {emotion.value}%
                          </span>
                        </div>
                      </div>);

                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('analytics.eventStream.title')}</CardTitle>
                  <CardDescription>
                    {t('analytics.eventStream.description')}
                  </CardDescription>
                </div>
                <Button
                  variant={isStreaming ? "secondary" : "default"}
                  size="sm"
                  onClick={() => setIsStreaming(!isStreaming)}>

                  {isStreaming ? t('analytics.eventStream.pause') : t('analytics.eventStream.resume')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {eventStream.length === 0 ?
                  <p className="text-center text-muted-foreground py-8">
                      {t('analytics.eventStream.empty')}
                    </p> :

                  eventStream.map((event) => {
                    const Icon = getEmotionIcon(event.emotional_context);
                    const color = getEmotionColor(event.emotional_context);

                    return (
                      <div
                        key={event.id}
                        className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">

                          <Icon className="h-4 w-4 mt-0.5" style={{ color }} />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{event.event_name}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {event.user_journey_stage}
                              </Badge>
                              {event.emotional_context &&
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{ borderColor: color, color }}>

                                  {event.emotional_context}
                                </Badge>
                            }
                            </div>
                            {event.properties && Object.keys(event.properties).length > 0 &&
                          <p className="text-xs text-muted-foreground">
                                {JSON.stringify(event.properties, null, 2)}
                              </p>
                          }
                          </div>
                        </div>);

                  })
                  }
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};