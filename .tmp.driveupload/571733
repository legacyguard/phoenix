import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, public_metadata, private_metadata } = evt.data;
    
    const email = email_addresses[0]?.email_address;
    const fullName = `${first_name || ''} ${last_name || ''}`.trim();
    
    try {
      // Upsert user profile in Supabase
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .upsert({
          id: id,
          user_id: id,
          full_name: fullName,
          email: email,
          preferred_language: public_metadata?.language || 'en',
          role: public_metadata?.role || 'user',
          subscription_status: public_metadata?.subscriptionStatus || 'free',
          settings: public_metadata?.settings || {},
          updated_at: new Date().toISOString(),
          ...(eventType === 'user.created' && { created_at: new Date().toISOString() })
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error upserting user profile:', error);
        return new Response('Error syncing user', { status: 500 });
      }

      // Log the sync event
      await supabaseAdmin
        .from('access_logs')
        .insert({
          user_id: id,
          action: `user.${eventType === 'user.created' ? 'created' : 'updated'}`,
          resource_type: 'user_profile',
          resource_id: id,
          metadata: {
            source: 'clerk_webhook',
            event_type: eventType
          }
        });

    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    try {
      // Soft delete the user profile (just mark as inactive)
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', id);

      if (error) {
        console.error('Error deactivating user profile:', error);
        return new Response('Error deactivating user', { status: 500 });
      }

    } catch (error) {
      console.error('Error processing deletion webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
