import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
import Stripe from 'https://esm.sh/stripe@13.10.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve({
  async POST(req) {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const { userId } = await req.json();

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Missing userId parameter' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Get user's subscription ID from database
      const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
        .from('user_subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subscriptionError || !subscriptionData?.stripe_subscription_id) {
        return new Response(
          JSON.stringify({ error: 'No active subscription found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Cancel subscription at period end
      await stripe.subscriptions.update(subscriptionData.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      // Update local database
      await supabaseAdmin
        .from('user_subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('user_id', userId);

      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to cancel subscription' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  },
});

