import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

    // First, get the user's profile to find their associated trusted_people ID
    const { data: trustedPersonRecord, error: trustedError } = await supabase
      .from('trusted_people')
      .select('id')
      .eq('email', user.email)
      .single();

    if (trustedError || !trustedPersonRecord) {
      // User might not be in anyone's trusted people list
      return NextResponse.json({ messages: [] });
    }

    // Fetch unlocked or delivered time capsule messages where user is a recipient
    const { data: messages, error: messagesError } = await supabase
      .from('time_capsule_messages')
      .select(`
        id,
        title,
        message_type,
        text_content,
        attachment_url,
        attachment_metadata,
        status,
        unlock_condition,
        unlocked_at,
        created_at,
        user_id,
        profiles!time_capsule_messages_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .contains('recipient_ids', [trustedPersonRecord.id])
      .in('status', ['unlocked', 'delivered'])
      .order('unlocked_at', { ascending: false });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Transform the data for the frontend
    const transformedMessages = messages?.map(message => ({
      id: message.id,
      title: message.title,
      messageType: message.message_type,
      textContent: message.text_content,
      attachmentUrl: message.attachment_url,
      attachmentMetadata: message.attachment_metadata,
      status: message.status,
      unlockCondition: message.unlock_condition,
      unlockedAt: message.unlocked_at,
      createdAt: message.created_at,
      sender: {
        id: message.profiles?.id,
        name: message.profiles?.full_name,
        email: message.profiles?.email
      }
    })) || [];

    return NextResponse.json({ messages: transformedMessages });
  } catch (error) {
    console.error('Error in received messages endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
