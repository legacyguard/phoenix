import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { fileName, fileType, fileSizeBytes } = body;

    // Validate input
    if (!fileName || !fileType || !fileSizeBytes) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileType, fileSizeBytes' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedVideoTypes = ['video/webm', 'video/mp4', 'video/quicktime'];
    if (!allowedVideoTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: webm, mp4, mov' },
        { status: 400 }
      );
    }

    // Validate file size (max 500MB)
    const maxSizeBytes = 500 * 1024 * 1024; // 500MB
    if (fileSizeBytes > maxSizeBytes) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed size of 500MB' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
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

    // Check if user is premium
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Validate premium status
    const isPremium = profile.subscription_status === 'active' && 
      (profile.subscription_tier === 'premium' || profile.subscription_tier === 'enterprise');

    if (!isPremium) {
      return NextResponse.json(
        { 
          error: 'Premium subscription required',
          message: 'Video messages are a premium feature. Please upgrade your subscription to use this feature.',
          requiresPremium: true
        },
        { status: 403 }
      );
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${user.id}/${timestamp}_${sanitizedFileName}`;

    // Create signed upload URL
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('time-capsule-attachments')
      .createSignedUploadUrl(filePath);

    if (uploadError || !uploadData) {
      console.error('Error creating signed upload URL:', uploadError);
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      );
    }

    // Return the upload URL and file path
    return NextResponse.json({
      uploadUrl: uploadData.signedUrl,
      filePath: filePath,
      token: uploadData.token,
      expiresIn: 3600, // 1 hour
      maxSizeBytes: maxSizeBytes,
      bucket: 'time-capsule-attachments'
    });

  } catch (error) {
    console.error('Error in generate-upload-url:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
