import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type PlanType = Tables<'user_subscriptions'>['plan_type'];

export function useUserPlan() {
  const [plan, setPlan] = useState<PlanType>('starter');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUserPlan() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setPlan('starter');
          setLoading(false);
          return;
        }

        // Try to get subscription from table first
        const { data: subscription, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('plan_type')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (subscriptionError) {
          console.error('Chyba pri načítavaní dát o pláne predplatného:', {
            error: subscriptionError,
            userId: user.id,
            timestamp: new Date().toISOString(),
            errorCode: subscriptionError.code,
            errorMessage: subscriptionError.message
          });
          // Fall back to database function
          const { data, error: functionError } = await supabase
            .rpc('get_user_plan', { user_uuid: user.id });
          
          if (functionError) {
            throw functionError;
          }
          
          setPlan((data as PlanType) || 'starter');
        } else {
          setPlan(subscription?.plan_type || 'starter');
        }
      } catch (err) {
        console.error('Chyba pri načítavaní používateľského plánu:', {
          error: err,
          errorMessage: err instanceof Error ? err.message : 'Neznáma chyba',
          stack: err instanceof Error ? err.stack : undefined,
          timestamp: new Date().toISOString()
        });
        setError(err as Error);
        setPlan('starter'); // Default to starter on error
      } finally {
        setLoading(false);
      }
    }

    fetchUserPlan();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserPlan();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { plan, loading, error };
}
