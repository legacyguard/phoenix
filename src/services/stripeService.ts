import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabase';

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  isPopular?: boolean;
}

export interface SubscriptionStatus {
  active: boolean;
  plan: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
}

class StripeService {
  private stripe: Stripe | null = null;
  private publishableKey: string;

  constructor() {
    this.publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  }

  async initialize(): Promise<void> {
    if (!this.stripe && this.publishableKey) {
      this.stripe = await loadStripe(this.publishableKey);
    }
  }

  getStripe(): Stripe | null {
    return this.stripe;
  }

  // Get available pricing plans
  getPricingPlans(): PricingPlan[] {
    return [
      {
        id: 'free',
        name: 'Free',
        description: 'Get started with basic features',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: [
          '1 Will document',
          '2 Guardians',
          '5 Assets',
          'Basic support'
        ],
        stripePriceId: ''
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'Perfect for individuals and families',
        price: 9.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Unlimited Will documents',
          'Unlimited Guardians',
          'Unlimited Assets',
          'Document encryption',
          'Emergency access',
          'Priority support',
          'Version history',
          'Legal templates'
        ],
        stripePriceId: import.meta.env.VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
        isPopular: true
      },
      {
        id: 'premium_yearly',
        name: 'Premium Yearly',
        description: 'Save 20% with annual billing',
        price: 95.99,
        currency: 'USD',
        interval: 'year',
        features: [
          'All Premium features',
          '2 months free',
          'Annual legal review',
          'Family sharing (up to 5 members)',
          'White-glove onboarding'
        ],
        stripePriceId: import.meta.env.VITE_STRIPE_PREMIUM_YEARLY_PRICE_ID || ''
      }
    ];
  }

  // Create checkout session
  async createCheckoutSession(priceId: string, userId: string): Promise<{ sessionId: string } | { error: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          userId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription/cancel`
        }
      });

      if (error) throw error;
      return { sessionId: data.sessionId };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { error: error instanceof Error ? error.message : 'Failed to create checkout session' };
    }
  }

  // Create portal session for managing subscription
  async createPortalSession(userId: string): Promise<{ url: string } | { error: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          userId,
          returnUrl: `${window.location.origin}/subscription`
        }
      });

      if (error) throw error;
      return { url: data.url };
    } catch (error) {
      console.error('Error creating portal session:', error);
      return { error: error instanceof Error ? error.message : 'Failed to create portal session' };
    }
  }

  // Get user's subscription status
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) return null;

      return {
        active: data.status === 'active',
        plan: data.price_id,
        currentPeriodEnd: new Date(data.current_period_end),
        cancelAtPeriodEnd: data.cancel_at_period_end || false,
        status: data.status
      };
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      return null;
    }
  }

  // Check if user has access to premium features
  async checkPremiumAccess(userId: string): Promise<boolean> {
    const status = await this.getSubscriptionStatus(userId);
    return status?.active || false;
  }

  // Redirect to Stripe Checkout
  async redirectToCheckout(sessionId: string): Promise<{ error?: string }> {
    if (!this.stripe) {
      await this.initialize();
    }

    if (!this.stripe) {
      return { error: 'Stripe not initialized' };
    }

    const { error } = await this.stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      console.error('Error redirecting to checkout:', error);
      return { error: error.message };
    }

    return {};
  }

  // Handle successful payment (called from success page)
  async handlePaymentSuccess(sessionId: string): Promise<void> {
    try {
      // The webhook will handle updating the subscription status
      // This is just for UI feedback
      console.log('Payment successful for session:', sessionId);
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { userId }
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to cancel subscription' 
      };
    }
  }

  // Resume subscription (remove cancel at period end)
  async resumeSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('resume-subscription', {
        body: { userId }
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error resuming subscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to resume subscription' 
      };
    }
  }

  // Get payment history
  async getPaymentHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }
}

export const stripeService = new StripeService();
