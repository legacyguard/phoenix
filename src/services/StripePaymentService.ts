import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export class StripePaymentService {
  /**
   * Create a payment intent for a legal consultation
   */
  static async createConsultationPaymentIntent(
    consultationId: string,
    amount: number,
    currency: string = 'EUR',
    userEmail?: string
  ): Promise<Stripe.PaymentIntent | null> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Stripe expects amount in cents
        currency: currency.toLowerCase(),
        metadata: {
          consultationId,
          type: 'legal_consultation'
        },
        receipt_email: userEmail,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  }

  /**
   * Retrieve a payment intent by ID
   */
  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      return null;
    }
  }

  /**
   * Cancel a payment intent
   */
  static async cancelPaymentIntent(paymentIntentId: string): Promise<boolean> {
    try {
      await stripe.paymentIntents.cancel(paymentIntentId);
      return true;
    } catch (error) {
      console.error('Error canceling payment intent:', error);
      return false;
    }
  }
}
