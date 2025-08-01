import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface SubscriptionStatus {
  isPremium: boolean;
  isLoading: boolean;
  subscriptionStatus: 'free' | 'premium' | null;
}

export const useSubscription = (): SubscriptionStatus => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'premium' | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsPremium(false);
      setIsLoading(false);
      setSubscriptionStatus(null);
      return;
    }

    const fetchSubscriptionStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('subscription_status')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const status = data?.subscription_status || 'free';
        setSubscriptionStatus(status);
        setIsPremium(status === 'premium');
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        setIsPremium(false);
        setSubscriptionStatus('free');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('subscription_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newStatus = payload.new.subscription_status || 'free';
          setSubscriptionStatus(newStatus);
          setIsPremium(newStatus === 'premium');
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  return {
    isPremium,
    isLoading,
    subscriptionStatus,
  };
};
