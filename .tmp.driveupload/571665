import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logActivity } from '@/services/loggingService';

// Initialize Supabase client with service role key for server-side operations
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

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract user token and verify
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    const { memberId, newLevel } = await request.json();

    if (!memberId || !newLevel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate access level
    const validAccessLevels = ['none', 'emergency_only', 'limited_info', 'full_access'];
    if (!validAccessLevels.includes(newLevel)) {
      return NextResponse.json({ error: 'Invalid access level' }, { status: 400 });
    }

    // Verify trusted person ownership
    const { data: existingPerson, error: checkError } = await supabaseAdmin
      .from('trusted_people')
      .select('id, name, access_level')
      .eq('id', memberId)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existingPerson) {
      return NextResponse.json({ error: 'Trusted person not found' }, { status: 404 });
    }

    // Update the access level
    const { data: updatedPerson, error: updateError } = await supabaseAdmin
      .from('trusted_people')
      .update({
        access_level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating access level:', updateError);
      return NextResponse.json({ error: 'Failed to update access level' }, { status: 500 });
    }

    // Log the activity
    try {
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      await logActivity(
        user.id,
        'USER',
        'UPDATED_FAMILY_ACCESS',
        memberId,
        ipAddress,
        userAgent,
        {
          personName: existingPerson.name,
          oldAccessLevel: existingPerson.access_level,
          newAccessLevel: newLevel
        }
      );
    } catch (logError) {
      console.error('Failed to log activity:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({ success: true, updatedPerson });
  } catch (error) {
    console.error('Error in access-level POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
