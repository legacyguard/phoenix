import { useEffect, useState } from 'react';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type PlanType = Tables<'user_subscriptions'>['plan_type'];

export function useUserPlan() {
  const [plan, setPlan] = useState<PlanType>('starter');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUserPlan() {
      try {
        const { data: { user } } = await supabaseWithRetry.auth.getUser();
        
        if (!user) {
          setPlan('starter');
          setLoading(false);
          return;
        }

        // Try to get subscription from table first
        const { data: subscription, error: subscriptionError } = await supabaseWithRetry
          .from('user_subscriptions')
          .select('plan_type')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (subscriptionError) {
          console.error('Error loading subscription plan data:', {
            error: subscriptionError,
            userId: user.id,
            timestamp: new Date().toISOString(),
            errorCode: subscriptionError.code,
            errorMessage: subscriptionError.message
          });
          // Fall back to database function
          const { data, error: functionError } = await supabaseWithRetry
            .retryOperation(() => supabaseWithRetry.from('user_subscriptions').select('*').rpc('get_user_plan', { user_uuid: user.id }));
          
          if (functionError) {
            throw functionError;
          }
          
          setPlan((data as PlanType) || 'starter');
        } else {
          setPlan(subscription?.plan_type || 'starter');
        }
    } catch (error: Record<string, unknown>) {
        const timestamp = new Date().toISOString();
        const errorMessage = error?.message || 'Unknown error';
        const errorCode = error?.code || 'UNKNOWN_ERROR';
        
        // Detailed logging for debugging
        console.error('[Application] Error during operation:', {
          timestamp,
          operation: 'fetchUserPlan',
          errorCode,
          errorMessage,
          errorDetails: error,
          stack: error?.stack
        });
        
        // User-friendly message
        let userMessage = 'An error occurred while loading your subscription plan.';
        
        // Specific messages based on error type
        if (error?.code === 'PGRST116') {
          userMessage = 'Required data was not found.';
        } else if (error?.message?.includes('network')) {
          userMessage = 'Connection error. Please check your internet connection.';
        } else if (error?.message?.includes('permission')) {
          userMessage = 'You do not have permission to perform this action.';
        } else if (error?.message?.includes('duplicate')) {
          userMessage = 'This record already exists.';
        }
        
        toast.error(userMessage);
        setError(error as Error);
        setPlan('starter'); // Default to starter on error
      } finally {
        setLoading(false);
      }
    }

    fetchUserPlan();

    // Subscribe to auth changes (use original supabase client for event subscription)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserPlan();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { plan, loading, error };
}
