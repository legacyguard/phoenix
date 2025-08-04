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

interface PrivacySettings {
  defaultProcessingMode: 'hybrid' | 'local_only';
  autoDeleteAfter: number;
  aiFeatureToggles: {
    expirationIntelligence: boolean;
    behavioralNudges: boolean;
    relationshipDetection: boolean;
  };
}

// GET endpoint to fetch current privacy settings
export async function GET(request: NextRequest) {
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

    // Fetch user's privacy settings
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('privacy_mode, auto_delete_after, ai_feature_toggles')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch privacy settings' }, { status: 500 });
    }

    // Default settings if profile doesn't exist
    const defaultSettings: PrivacySettings = {
      defaultProcessingMode: 'hybrid',
      autoDeleteAfter: 0,
      aiFeatureToggles: {
        expirationIntelligence: true,
        behavioralNudges: true,
        relationshipDetection: true
      }
    };

    // Merge with existing settings if available
    const settings: PrivacySettings = userProfile ? {
      defaultProcessingMode: userProfile.privacy_mode || defaultSettings.defaultProcessingMode,
      autoDeleteAfter: userProfile.auto_delete_after || defaultSettings.autoDeleteAfter,
      aiFeatureToggles: userProfile.ai_feature_toggles || defaultSettings.aiFeatureToggles
    } : defaultSettings;

    return NextResponse.json(settings);

  } catch (error) {
    console.error('Privacy settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT endpoint to update privacy settings
export async function PUT(request: NextRequest) {
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

    // Parse request body
    const settings: PrivacySettings = await request.json();

    // Validate settings
    if (!settings.defaultProcessingMode || !['hybrid', 'local_only'].includes(settings.defaultProcessingMode)) {
      return NextResponse.json({ error: 'Invalid processing mode' }, { status: 400 });
    }

    if (typeof settings.autoDeleteAfter !== 'number' || settings.autoDeleteAfter < 0) {
      return NextResponse.json({ error: 'Invalid auto delete period' }, { status: 400 });
    }

    // Check if user profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existingProfile) {
      // Update existing profile
      result = await supabaseAdmin
        .from('user_profiles')
        .update({
          privacy_mode: settings.defaultProcessingMode,
          auto_delete_after: settings.autoDeleteAfter,
          ai_feature_toggles: settings.aiFeatureToggles,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();
    } else {
      // Create new profile
      result = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: user.id,
          privacy_mode: settings.defaultProcessingMode,
          auto_delete_after: settings.autoDeleteAfter,
          ai_feature_toggles: settings.aiFeatureToggles,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error updating privacy settings:', result.error);
      return NextResponse.json({ error: 'Failed to update privacy settings' }, { status: 500 });
    }

    // Log the privacy settings update
    try {
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      await logActivity(
        user.id,
        'USER',
        'UPDATED_PRIVACY_SETTINGS',
        undefined,
        ipAddress,
        userAgent,
        {
          defaultProcessingMode: settings.defaultProcessingMode,
          autoDeleteAfter: settings.autoDeleteAfter,
          aiFeatureToggles: settings.aiFeatureToggles
        }
      );
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Privacy settings updated successfully',
      settings: {
        defaultProcessingMode: result.data.privacy_mode,
        autoDeleteAfter: result.data.auto_delete_after,
        aiFeatureToggles: result.data.ai_feature_toggles
      }
    });

  } catch (error) {
    console.error('Privacy settings PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
