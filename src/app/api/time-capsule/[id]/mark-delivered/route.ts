import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const messageId = params.id;

    // Get the user's trusted_people ID
    const { data: trustedPersonRecord, error: trustedError } = await supabase
      .from('trusted_people')
      .select('id')
      .eq('email', user.email)
      .single();

    if (trustedError || !trustedPersonRecord) {
      return NextResponse.json(
        { error: 'User not found in trusted people' },
        { status: 404 }
      );
    }

    // Verify the user is a recipient of this message
    const { data: message, error: messageError } = await supabase
      .from('time_capsule_messages')
      .select('id, recipient_ids, status')
      .eq('id', messageId)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if user is a recipient
    if (!message.recipient_ids.includes(trustedPersonRecord.id)) {
      return NextResponse.json(
        { error: 'Unauthorized to access this message' },
        { status: 403 }
      );
    }

    // Only update if status is 'unlocked'
    if (message.status === 'unlocked') {
      const { error: updateError } = await supabase
        .from('time_capsule_messages')
        .update({ 
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (updateError) {
        console.error('Error updating message status:', updateError);
        return NextResponse.json(
          { error: 'Failed to update message status' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking message as delivered:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
