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
    
    // Get all active users (users who have logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: activeUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, last_sign_in_at')
      .gte('last_sign_in_at', thirtyDaysAgo.toISOString())
      .order('last_sign_in_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching active users:', usersError);
      throw usersError;
    }

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
          email: user.email,
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
