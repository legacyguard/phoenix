import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Calendar,
  Filter,
  ChevronRight
} from 'lucide-react';
import { LifeEvent, LifeEventDetectionService } from '@/services/lifeEventDetection';
import { LifeEventNotification } from './LifeEventNotification';
import { useToast } from '@/components/ui/use-toast';

interface LifeEventStats {
  total: number;
  completed: number;
  acknowledged: number;
  dismissed: number;
  completionRate: number;
}

export const LifeEventDashboard: React.FC = () => {
  const { userId } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeEvents, setActiveEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null);
  const [filter, setFilter] = useState<'all' | 'immediate' | 'soon' | 'when_convenient'>('all');
  const [stats, setStats] = useState<LifeEventStats>({
    total: 0,
    completed: 0,
    acknowledged: 0,
    dismissed: 0,
    completionRate: 0
  });

  const loadLifeEvents = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const events = await LifeEventDetectionService.getActiveLifeEvents(userId);
      setActiveEvents(events);
    } catch (error) {
      console.error('Error loading life events:', error);
      toast({
        title: t('lifeEvents.loadError'),
        description: t('lifeEvents.loadErrorDesc'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, t, toast]);

  const loadStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      const eventStats = await LifeEventDetectionService.getLifeEventStats(userId);
      setStats({
        total: eventStats.acknowledgedTypes.length + eventStats.dismissedTypes.length,
        completed: Math.round(eventStats.completionRate * eventStats.acknowledgedTypes.length),
        acknowledged: eventStats.acknowledgedTypes.length,
        dismissed: eventStats.dismissedTypes.length,
        completionRate: eventStats.completionRate
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadLifeEvents();
      loadStats();
    }
  }, [userId, loadLifeEvents, loadStats]);

  const handleEventDismiss = (eventId: string) => {
    setActiveEvents(events => events.filter(e => e.id !== eventId));
    setSelectedEvent(null);
    loadStats();
  };

  const handleEventUpdate = () => {
    loadLifeEvents();
    loadStats();
  };

  const filteredEvents = filter === 'all' 
    ? activeEvents 
    : activeEvents.filter(e => e.urgency === filter);

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'immediate':
        return <AlertCircle className="h-4 w-4" />;
      case 'soon':
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate':
        return 'text-red-600';
      case 'soon':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                {t('lifeEvents.dashboard.title')}
              </CardTitle>
              <CardDescription>
                {t('lifeEvents.dashboard.description')}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Bell className="h-5 w-5 mr-2" />
              {filteredEvents.length} {t('lifeEvents.dashboard.active')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">{t('lifeEvents.stats.totalDetected')}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">{t('lifeEvents.stats.completed')}</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">{stats.acknowledged}</div>
              <div className="text-sm text-gray-600">{t('lifeEvents.stats.inProgress')}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(stats.completionRate * 100)}%
              </div>
              <div className="text-sm text-gray-600">{t('lifeEvents.stats.completionRate')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Life Events Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">{t('lifeEvents.tabs.active')}</TabsTrigger>
          <TabsTrigger value="suggestions">{t('lifeEvents.tabs.suggestions')}</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {/* Filter buttons */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('lifeEvents.filter.all')}
            </Button>
            <Button
              variant={filter === 'immediate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('immediate')}
              className={filter === 'immediate' ? 'bg-red-600' : ''}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              {t('lifeEvents.filter.immediate')}
            </Button>
            <Button
              variant={filter === 'soon' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('soon')}
              className={filter === 'soon' ? 'bg-yellow-600' : ''}
            >
              <Clock className="h-4 w-4 mr-2" />
              {t('lifeEvents.filter.soon')}
            </Button>
            <Button
              variant={filter === 'when_convenient' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('when_convenient')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {t('lifeEvents.filter.whenConvenient')}
            </Button>
          </div>

          {/* Life Events List */}
          {filteredEvents.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>{t('lifeEvents.noEvents.title')}</AlertTitle>
              <AlertDescription>
                {t('lifeEvents.noEvents.description')}
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4"
                  >
                    {selectedEvent?.id === event.id ? (
                      <LifeEventNotification
                        lifeEvent={event}
                        onDismiss={() => handleEventDismiss(event.id!)}
                        onUpdate={handleEventUpdate}
                      />
                    ) : (
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full bg-gray-100 ${getUrgencyColor(event.urgency)}`}>
                                {getUrgencyIcon(event.urgency)}
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {t(`lifeEvents.types.${event.type}`)}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {t('lifeEvents.detectedOn', { 
                                    date: new Date(event.detectedDate).toLocaleDateString() 
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {event.suggestedUpdates.length} {t('lifeEvents.updates')}
                              </Badge>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>{t('lifeEvents.suggestions.title')}</AlertTitle>
            <AlertDescription>
              {t('lifeEvents.suggestions.description')}
            </AlertDescription>
          </Alert>

          {/* Proactive suggestions based on patterns */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('lifeEvents.suggestions.annual.title')}</CardTitle>
                <CardDescription>{t('lifeEvents.suggestions.annual.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  {t('lifeEvents.suggestions.annual.action')}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('lifeEvents.suggestions.milestone.title')}</CardTitle>
                <CardDescription>{t('lifeEvents.suggestions.milestone.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  {t('lifeEvents.suggestions.milestone.action')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
