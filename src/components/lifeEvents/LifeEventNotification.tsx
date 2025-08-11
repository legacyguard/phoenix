import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Baby,
  Heart,
  HeartCrack,
  Briefcase,
  Home,
  UserMinus,
  Wallet,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  AlertCircle,
  Info,
  Sparkles
} from 'lucide-react';
import type { LifeEvent } from '@/services/lifeEventDetection';
import { LifeEventService } from '@/services/LifeEventService';
import { LifeEventDetectionService } from '@/services/lifeEventDetection';
import { useToast } from '@/components/ui/use-toast';

interface LifeEventNotificationProps {
  lifeEvent: LifeEvent;
  onDismiss?: () => void;
  onUpdate?: () => void;
}

const lifeEventIcons = {
  marriage: Heart,
  divorce: HeartCrack,
  birth: Baby,
  death: UserMinus,
  job_change: Briefcase,
  move: Home,
  retirement: Calendar,
  major_purchase: Wallet,
  illness: AlertCircle
};

const urgencyColors = {
  immediate: 'bg-red-100 text-red-800 border-red-200',
  soon: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  when_convenient: 'bg-blue-100 text-blue-800 border-blue-200'
};

const urgencyBadgeVariants = {
  immediate: 'destructive',
  soon: 'warning',
  when_convenient: 'secondary'
} as const;

export const LifeEventNotification: React.FC<LifeEventNotificationProps> = ({
  lifeEvent,
  onDismiss,
  onUpdate
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedUpdates, setCompletedUpdates] = useState<string[]>([]);

  const Icon = lifeEventIcons[lifeEvent.type] || Info;
  const completionProgress = (completedUpdates.length / lifeEvent.suggestedUpdates.length) * 100;

  const handleUpdateEverything = async () => {
    setIsProcessing(true);
    try {
      // Generate checklist based on life event
      const checklist = LifeEventService.generateChecklist(
        lifeEvent.type === 'marriage' || lifeEvent.type === 'divorce' ? 'married_divorced' :
        lifeEvent.type === 'birth' ? 'new_child' :
        lifeEvent.type === 'move' ? 'bought_sold_home' :
        lifeEvent.type === 'death' ? 'trusted_person_passed' :
        'started_business',
        t
      );

      // Save checklist for user
      if (lifeEvent.userId) {
        LifeEventService.saveChecklist(lifeEvent.userId, checklist);
      }

      // Update life event status
      if (lifeEvent.id) {
        await LifeEventDetectionService.updateLifeEventStatus(lifeEvent.id, 'acknowledged');
      }

      // Navigate to first task
      if (checklist.tasks.length > 0) {
        navigate(checklist.tasks[0].actionUrl);
      }

      toast({
        title: t('lifeEvents.updateStarted'),
        description: t('lifeEvents.updateStartedDesc'),
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error starting update process:', error);
      toast({
        title: t('lifeEvents.updateError'),
        description: t('lifeEvents.updateErrorDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReviewLater = async () => {
    if (lifeEvent.id) {
      await LifeEventDetectionService.updateLifeEventStatus(lifeEvent.id, 'acknowledged');
    }
    toast({
      title: t('lifeEvents.savedForLater'),
      description: t('lifeEvents.savedForLaterDesc'),
    });
    onDismiss?.();
  };

  const handleDismiss = async () => {
    if (lifeEvent.id) {
      await LifeEventDetectionService.updateLifeEventStatus(lifeEvent.id, 'dismissed');
    }
    onDismiss?.();
  };

  const getEventTitle = () => {
    const titles = {
      marriage: t('lifeEvents.titles.marriage'),
      divorce: t('lifeEvents.titles.divorce'),
      birth: t('lifeEvents.titles.birth'),
      death: t('lifeEvents.titles.death'),
      job_change: t('lifeEvents.titles.jobChange'),
      move: t('lifeEvents.titles.move'),
      retirement: t('lifeEvents.titles.retirement'),
      major_purchase: t('lifeEvents.titles.majorPurchase'),
      illness: t('lifeEvents.titles.illness')
    };
    return titles[lifeEvent.type] || t('lifeEvents.titles.default');
  };

  const getEventMessage = () => {
    const messages = {
      marriage: t('lifeEvents.messages.marriage'),
      divorce: t('lifeEvents.messages.divorce'),
      birth: t('lifeEvents.messages.birth'),
      death: t('lifeEvents.messages.death'),
      job_change: t('lifeEvents.messages.jobChange'),
      move: t('lifeEvents.messages.move'),
      retirement: t('lifeEvents.messages.retirement'),
      major_purchase: t('lifeEvents.messages.majorPurchase'),
      illness: t('lifeEvents.messages.illness')
    };
    return messages[lifeEvent.type] || t('lifeEvents.messages.default');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-2 ${urgencyColors[lifeEvent.urgency]} shadow-lg`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Icon className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {getEventTitle()}
                  <Badge variant={urgencyBadgeVariants[lifeEvent.urgency]}>
                    {lifeEvent.urgency === 'immediate' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {lifeEvent.urgency === 'soon' && <Clock className="h-3 w-3 mr-1" />}
                    {t(`lifeEvents.urgency.${lifeEvent.urgency}`)}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {getEventMessage()}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Sparkles className="h-4 w-4" />
              {t('lifeEvents.confidence', { confidence: Math.round(lifeEvent.confidence * 100) })}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Life changes message */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">
                {t('lifeEvents.whyUpdate')}
              </AlertTitle>
              <AlertDescription className="text-blue-700">
                {t('lifeEvents.whyUpdateDesc')}
              </AlertDescription>
            </Alert>

            {/* Suggested updates */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                {t('lifeEvents.suggestedUpdates')}
                {completionProgress > 0 && (
                  <span className="text-xs text-gray-500">
                    ({completedUpdates.length}/{lifeEvent.suggestedUpdates.length})
                  </span>
                )}
              </h4>
              
              {completionProgress > 0 && (
                <Progress value={completionProgress} className="h-2 mb-3" />
              )}

              <AnimatePresence>
                {(isExpanded ? lifeEvent.suggestedUpdates : lifeEvent.suggestedUpdates.slice(0, 3)).map((update, index) => (
                  <motion.div
                    key={update}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      completedUpdates.includes(update) 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {completedUpdates.includes(update) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${
                      completedUpdates.includes(update) ? 'text-green-800 line-through' : 'text-gray-700'
                    }`}>
                      {update}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {lifeEvent.suggestedUpdates.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full"
                >
                  {isExpanded ? t('lifeEvents.showLess') : t('lifeEvents.showMore', { 
                    count: lifeEvent.suggestedUpdates.length - 3 
                  })}
                </Button>
              )}
            </div>

            {/* Detection indicators */}
            {lifeEvent.indicators.length > 0 && (
              <div className="pt-2 border-t">
                <details className="text-xs text-gray-500">
                  <summary className="cursor-pointer hover:text-gray-700">
                    {t('lifeEvents.howWeKnew')}
                  </summary>
                  <ul className="mt-2 space-y-1 ml-4">
                    {lifeEvent.indicators.map((indicator, index) => (
                      <li key={index} className="list-disc">{indicator}</li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 flex-wrap">
          <Button
            onClick={handleUpdateEverything}
            disabled={isProcessing}
            className="flex-1 sm:flex-initial"
          >
            {isProcessing ? t('lifeEvents.processing') : t('lifeEvents.helpMeUpdate')}
          </Button>
          <Button
            variant="outline"
            onClick={handleReviewLater}
            disabled={isProcessing}
            className="flex-1 sm:flex-initial"
          >
            {t('lifeEvents.reviewLater')}
          </Button>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            disabled={isProcessing}
            className="flex-1 sm:flex-initial"
          >
            {t('lifeEvents.notApplicable')}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
