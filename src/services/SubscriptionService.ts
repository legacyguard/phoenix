import { Stripe } from 'stripe';
import { supabase } from '@/lib/supabase';

class SubscriptionService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2020-08-27',
    });
  }

  async createCheckoutSession(userId: string, priceId: string) {
    const user = await supabase.from('users').select('email').eq('id', userId).single();
    if (!user.data) throw new Error('User not found');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.data.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.BASE_URL}/subscription/success`,
      cancel_url: `${process.env.BASE_URL}/subscription/cancel`,
    });

    return session;
  }

  
  async createPortalSession(customerId: string) {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.BASE_URL}/subscription` ,
    });

    return session.url;
  }

  handleWebhookEvent(event: Stripe.Event) {
    const handleCheckoutSessionCompleted = async (session) => {
      const customerId = session.customer as string;
      const userRes = await supabase.from('users').update({
        subscription_status: 'premium',
        stripe_customer_id: customerId
      }).eq('stripe_customer_id', customerId);

      if (userRes.error) throw userRes.error;
    };

    const handleSubscriptionDeleted = async (subscription) => {
      const customerId = subscription.customer as string;
      const userRes = await supabase.from('users').update({
        subscription_status: 'free'
      }).eq('stripe_customer_id', customerId);

      if (userRes.error) throw userRes.error;
    };

    switch (event.type) {
      case 'checkout.session.completed':
        handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.deleted':
        handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }
}

export const subscriptionService = new SubscriptionService();

