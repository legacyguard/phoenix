import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  Zap,
  Brain,
  Heart,
  AlertCircle,
  Target,
  CheckCircle2,
  Activity,
  Shuffle } from
'lucide-react';

const DEMO_ACTIONS = [
{
  name: 'User views dashboard',
  action: 'dashboard_viewed',
  emotion: 'neutral' as const,
  icon: Activity,
  properties: { section: 'main' }
},
{
  name: 'User starts onboarding',
  action: 'onboarding_started',
  emotion: 'curious' as const,
  icon: Brain,
  properties: { source: 'demo' }
},
{
  name: 'User completes task',
  action: 'task_completed',
  emotion: 'accomplished' as const,
  icon: CheckCircle2,
  properties: { task_id: 'demo-task-1', priority: 'high' }
},
{
  name: 'User uploads document',
  action: 'document_uploaded',
  emotion: 'satisfied' as const,
  icon: Target,
  properties: { document_type: 'will', size: 1024 }
},
{
  name: 'User invites guardian',
  action: 'guardian_invited',
  emotion: 'motivated' as const,
  icon: Heart,
  properties: { relationship: 'spouse' }
},
{
  name: 'User encounters error',
  action: 'error_occurred',
  emotion: 'frustrated' as const,
  icon: AlertCircle,
  properties: { error_type: 'validation', field: 'email' }
}];


export const AnalyticsDemo: React.FC = () => {
  const { t } = useTranslation('common');
  const { trackAction, trackMilestone, startTimer, endTimer, isTrackingEnabled } = useAnalytics({
    componentName: 'AnalyticsDemo',
    userJourneyStage: 'testing'
  });

  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [eventCount, setEventCount] = useState(0);

  const handleDemoAction = (action: typeof DEMO_ACTIONS[0]) => {
    trackAction(action.action, action.properties, action.emotion);
    setEventCount((prev) => prev + 1);
  };

  const handleRandomEvents = () => {
    const count = Math.floor(Math.random() * 5) + 3; // 3-7 events
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const randomAction = DEMO_ACTIONS[Math.floor(Math.random() * DEMO_ACTIONS.length)];
        handleDemoAction(randomAction);
      }, i * 500); // Stagger events by 500ms
    }
  };

  const handleStartTimer = () => {
    if (activeTimer) {
      endTimer(activeTimer, true, { demo: true });
      setActiveTimer(null);
    } else {
      const timerId = startTimer('demo_timer');
      setActiveTimer(timerId);
    }
  };

  const handleMilestone = () => {
    trackMilestone('demo_milestone_reached', {
      events_triggered: eventCount,
      demo_mode: true
    });
  };

  if (!isTrackingEnabled) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <span>{t("analytics.analyticsDemo.analytics_demo_tracking_disabl_1")}</span>
          </CardTitle>
          <CardDescription>{t("analytics.analyticsDemo.enable_analytics_tracking_in_y_2")}

          </CardDescription>
        </CardHeader>
      </Card>);

  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>{t("analytics.analyticsDemo.analytics_event_generator_3")}</span>
            </CardTitle>
            <CardDescription>{t("analytics.analyticsDemo.generate_test_events_to_see_re_4")}

            </CardDescription>
          </div>
          <Badge variant="secondary">
            {eventCount}{t("analytics.analyticsDemo.events_sent_5")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DEMO_ACTIONS.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="justify-start"
                onClick={() => handleDemoAction(action)}>

                <Icon className="mr-2 h-4 w-4" />
                {action.name}
              </Button>);

          })}
        </div>
        
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <Button
            onClick={handleRandomEvents}
            variant="secondary">

            <Shuffle className="mr-2 h-4 w-4" />{t("analytics.analyticsDemo.generate_random_events_6")}

          </Button>
          
          <Button
            onClick={handleStartTimer}
            variant={activeTimer ? "destructive" : "default"}>

            {activeTimer ? t('analytics.demo.stopTimer') : t('analytics.demo.startTimer')}
          </Button>
          
          <Button
            onClick={handleMilestone}
            variant="default">

            <Target className="mr-2 h-4 w-4" />{t("analytics.analyticsDemo.track_milestone_7")}

          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>{t("analytics.analyticsDemo.open_the_analytics_dashboard_i_8")}</p>
          <p>{t("analytics.analyticsDemo.events_are_only_sent_when_anal_9")}</p>
        </div>
      </CardContent>
    </Card>);

};