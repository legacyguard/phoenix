import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { stripeService } from '@/services/stripeService';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Subscription = () => {
  const { t } = useTranslation('ui');
  const { user } = useUser();
  const { subscriptionStatus, isLoading, refreshSubscription } = useSubscription();
  const [isManagingBilling, setIsManagingBilling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleManageBilling = async () => {
    if (!user?.id) return;

    setIsManagingBilling(true);
    try {
      const result = await stripeService.createPortalSession(user.id);
      
      if ('url' in result) {
        window.location.href = result.url;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error(t('subscription.errors.portalFailed'));
    } finally {
      setIsManagingBilling(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.id) return;

    setIsCancelling(true);
    try {
      const result = await stripeService.cancelSubscription(user.id);
      
      if (result.success) {
        toast.success(t('subscription.cancelSuccess'));
        await refreshSubscription();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error(t('subscription.errors.cancelFailed'));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!user?.id) return;

    try {
      const result = await stripeService.resumeSubscription(user.id);
      
      if (result.success) {
        toast.success(t('subscription.resumeSuccess'));
        await refreshSubscription();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast.error(t('subscription.errors.resumeFailed'));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{t('subscription.title')}</h1>

      {/* Current Plan */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t('subscription.currentPlan')}
            {subscriptionStatus?.active && (
              <Badge variant="default" className="ml-2">
                {t('subscription.active')}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {t('subscription.planDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('subscription.planName')}</span>
            <span className="font-medium">
              {subscriptionStatus?.active ? t('subscription.premium') : t('subscription.free')}
            </span>
          </div>
          
          {subscriptionStatus?.active && subscriptionStatus.currentPeriodEnd && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t('subscription.nextBilling')}
                </span>
                <span className="font-medium">
                  {format(new Date(subscriptionStatus.currentPeriodEnd), 'PPP')}
                </span>
              </div>
              
              {subscriptionStatus.cancelAtPeriodEnd && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('subscription.cancelledNotice', {
                      date: format(new Date(subscriptionStatus.currentPeriodEnd), 'PPP')
                    })}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          {subscriptionStatus?.active ? (
            <>
              <Button
                onClick={handleManageBilling}
                disabled={isManagingBilling}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {isManagingBilling ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                {t('subscription.manageBilling')}
              </Button>
              
              {subscriptionStatus.cancelAtPeriodEnd ? (
                <Button
                  onClick={handleResumeSubscription}
                  variant="default"
                  className="w-full sm:w-auto"
                >
                  {t('subscription.resume')}
                </Button>
              ) : (
                <Button
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  {isCancelling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {t('subscription.cancel')}
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={() => window.location.href = '/pricing'}
              variant="default"
              className="w-full sm:w-auto"
            >
              {t('subscription.upgradeToPremium')}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>{t('subscription.features.title')}</CardTitle>
          <CardDescription>
            {subscriptionStatus?.active 
              ? t('subscription.features.premiumDescription')
              : t('subscription.features.freeDescription')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {subscriptionStatus?.active ? (
              <>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
                  {t('subscription.features.unlimited')}
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
                  {t('subscription.features.encryption')}
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
                  {t('subscription.features.priority')}
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
                  {t('subscription.features.history')}
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
                  {t('subscription.features.basicWill')}
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
                  {t('subscription.features.limitedGuardians')}
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
                  {t('subscription.features.basicSupport')}
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscription;
