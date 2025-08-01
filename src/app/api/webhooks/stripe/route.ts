import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { LegalConsultationService } from '@/services/LegalConsultationService';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Extract consultation ID from metadata
      const consultationId = paymentIntent.metadata?.consultationId;
      
      if (!consultationId) {
        console.error('No consultation ID found in payment intent metadata');
        return NextResponse.json(
          { error: 'No consultation ID in metadata' },
          { status: 400 }
        );
      }

      // Update the consultation with payment information
      const updateSuccess = await LegalConsultationService.updatePaymentInfo(
        consultationId,
        paymentIntent.id
      );

      if (!updateSuccess) {
        console.error('Failed to update consultation payment info');
        return NextResponse.json(
          { error: 'Failed to update consultation' },
          { status: 500 }
        );
      }

      console.log(`Payment successful for consultation ${consultationId}`);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      const failedConsultationId = failedPayment.metadata?.consultationId;
      
      if (failedConsultationId) {
        // Update consultation status to payment_failed
        await LegalConsultationService.updateConsultationStatus(
          failedConsultationId,
          'payment_failed'
        );
        console.log(`Payment failed for consultation ${failedConsultationId}`);
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
