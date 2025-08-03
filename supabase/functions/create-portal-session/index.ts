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
      const { userId, returnUrl } = await req.json();

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Missing userId parameter' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Get user's Stripe customer ID from database
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      if (userError || !userData?.stripe_customer_id) {
        return new Response(
          JSON.stringify({ error: 'No active subscription found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Create Stripe billing portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: userData.stripe_customer_id,
        return_url: returnUrl || `${Deno.env.get('BASE_URL')}/subscription`,
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Error creating portal session:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to create portal session' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  },
});
