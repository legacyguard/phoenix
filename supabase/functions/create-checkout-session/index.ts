import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
import Stripe from "https://esm.sh/stripe@13.10.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

serve({
  async POST(req) {
    // Handle CORS
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const { priceId, userId, successUrl, cancelUrl } = await req.json();

      if (!priceId || !userId) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Get user email from Supabase
      const { data: userData, error: userError } = await supabaseAdmin
        .from("users")
        .select("email")
        .eq("id", userId)
        .single();

      if (userError || !userData) {
        throw new Error("User not found");
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        customer_email: userData.email,
        metadata: {
          userId: userId,
        },
        success_url:
          successUrl ||
          `${Deno.env.get("BASE_URL")}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:
          cancelUrl || `${Deno.env.get("BASE_URL")}/subscription/cancel`,
      });

      return new Response(JSON.stringify({ sessionId: session.id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return new Response(
        JSON.stringify({
          error: error.message || "Failed to create checkout session",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  },
});
