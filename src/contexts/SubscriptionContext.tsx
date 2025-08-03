import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { stripeService, SubscriptionStatus } from '@/services/stripeService';
import { supabase } from '@/lib/supabase';
import { SubscriptionContext } from './SubscriptionContext.context';
import { FEATURE_ACCESS } from './SubscriptionContext.constants';

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscriptionStatus(null);
      setIsLoading(false);
      return;
    }

    try {
      const status = await stripeService.getSubscriptionStatus(user.id);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setSubscriptionStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Check feature access
  const checkAccess = (feature: string): boolean => {
    if (!subscriptionStatus || !subscriptionStatus.active) {
      return FEATURE_ACCESS.free.includes(feature);
    }
    return FEATURE_ACCESS.premium.includes(feature);
  };

  // Subscribe to subscription changes
  useEffect(() => {
    if (!user?.id) return;

    refreshSubscription();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          refreshSubscription();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, refreshSubscription]);

  const isPremium = subscriptionStatus?.active || false;

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionStatus,
        isLoading,
        isPremium,
        checkAccess,
        refreshSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
