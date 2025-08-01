import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateNudgesForUser } from '@/services/BehavioralNudges';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// This endpoint should be called by a cron job service
// It runs nightly to generate behavioral nudges for active users

export async function GET(request: Request) {
  try {
    // Verify the request is from the cron service
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting behavioral nudges generation...');
    
    // Get all active users (users who have assets, guardians, or wills - indicating they're active)
    // Since there's no direct users table, we'll get users from existing data
    const { data: usersWithAssets, error: assetsError } = await supabase
      .from('assets')
      .select('user_id')
      .limit(1000); // Limit to prevent overwhelming the system

    const { data: usersWithGuardians, error: guardiansError } = await supabase
      .from('guardians')
      .select('user_id')
      .limit(1000);

    const { data: usersWithWills, error: willsError } = await supabase
      .from('wills')
      .select('user_id')
      .limit(1000);

    if (assetsError || guardiansError || willsError) {
      console.error('Error fetching user data:', { assetsError, guardiansError, willsError });
      throw new Error('Failed to fetch user data');
    }

    // Combine all user IDs and remove duplicates
    const allUserIds = new Set([
      ...(usersWithAssets?.map(u => u.user_id) || []),
      ...(usersWithGuardians?.map(u => u.user_id) || []),
      ...(usersWithWills?.map(u => u.user_id) || [])
    ]);

    const activeUsers = Array.from(allUserIds).map(id => ({ id }));

    console.log(`Found ${activeUsers?.length || 0} active users`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{userId: string; email: string; error: string}> = [];

    // Process each active user
    for (const user of activeUsers || []) {
      try {
        await generateNudgesForUser(user.id);
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({
          userId: user.id,
          email: 'unknown', // We don't have email in this structure
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error(`Error generating nudges for user ${user.id}:`, error);
      }
    }

    const summary = {
      totalUsers: activeUsers?.length || 0,
      successfullyProcessed: successCount,
      errors: errorCount,
      timestamp: new Date().toISOString(),
    };

    console.log('Behavioral nudges generation completed:', summary);

    return NextResponse.json({
      success: true,
      summary,
      ...(errors.length > 0 && { errorDetails: errors }),
      message: `Processed ${successCount} users successfully`
    });
  } catch (error) {
    console.error('Error in behavioral nudges cron job:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Optional: POST endpoint for manual trigger (for testing)
export async function POST(request: Request) {
  try {
    // Check for admin authentication
    const session = request.headers.get('x-user-session');
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user ID from request body for single-user testing
    const body = await request.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Run nudge generation for a single user
    await generateNudgesForUser(userId);

    return NextResponse.json({
      success: true,
      message: `Behavioral nudges generated for user ${userId}`,
    });
  } catch (error) {
    console.error('Error in manual behavioral nudges generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate nudges' },
      { status: 500 }
    );
  }
}
