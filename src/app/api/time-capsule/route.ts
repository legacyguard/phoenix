import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { CreateTimeCapsuleDto } from '@/types/timeCapsule';
import { uploadLimiter } from '@/middleware/rateLimiter';
import { getServerTranslation, getLocaleFromRequest } from '@/lib/server-i18n';

// Initialize Supabase client with service role key
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

// POST - Create a new time capsule message
export async function POST(request: NextRequest) {
  try {
    const locale = getLocaleFromRequest(request);
    const { t } = getServerTranslation(locale);
    
    // Apply rate limiting
    const rateLimitResult = await uploadLimiter(request);
    if (rateLimitResult) return rateLimitResult;

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: t('ui.errors.unauthorized') }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: t('ui.errors.invalidAuthentication') }, { status: 401 });
    }

    // Parse form data for file upload support
    const contentType = request.headers.get('content-type');
    let capsuleData: CreateTimeCapsuleDto;
    let attachment: File | null = null;

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      capsuleData = {
        title: formData.get('title') as string,
        messageType: formData.get('messageType') as string,
        textContent: formData.get('textContent') as string || undefined,
        recipientIds: JSON.parse(formData.get('recipientIds') as string || '[]'),
        unlockCondition: formData.get('unlockCondition') as string,
        unlockDate: formData.get('unlockDate') as string || undefined,
      };
      attachment = formData.get('attachment') as File || null;
  } else {
    capsuleData = await request.json();
  }

  // Validate required fields
  if (!capsuleData.title || !capsuleData.messageType || !capsuleData.unlockCondition) {
    return NextResponse.json({ error: t('ui.errors.missingRequiredFields') }, { status: 400 });
  }

  // Prepare database record
  const dbRecord: Record<string, unknown> = {
    user_id: user.id,
    title: capsuleData.title,
    message_type: capsuleData.messageType,
    recipient_ids: capsuleData.recipientIds,
    unlock_condition: capsuleData.unlockCondition,
  };

  // Handle text content
  if (capsuleData.messageType === 'text') {
    if (!capsuleData.textContent) {
      return NextResponse.json({ error: t('timeCapsule.errors.textContentRequired') }, { status: 400 });
    }
    dbRecord.text_content = capsuleData.textContent;
  }

  // Handle unlock date
  if (capsuleData.unlockCondition === 'date') {
    if (!capsuleData.unlockDate) {
      return NextResponse.json({ error: t('timeCapsule.errors.unlockDateRequired') }, { status: 400 });
    }
    dbRecord.unlock_date = capsuleData.unlockDate;
  }

  // Handle file upload
  if (attachment && ['photo', 'video', 'audio'].includes(capsuleData.messageType)) {
    // Note: Server-side file encryption would require a different approach
    // For now, we'll upload the file as-is and rely on Supabase encryption
    const fileBuffer = await attachment.arrayBuffer();

      const fileName = `${user.id}/time-capsules/${uuidv4()}-${attachment.name}`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from('time-capsule-attachments')
        .upload(fileName, fileBuffer, {
          contentType: attachment.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return NextResponse.json({ error: t('timeCapsule.errors.failedToUploadAttachment') }, { status: 500 });
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('time-capsule-attachments')
        .getPublicUrl(fileName);

      dbRecord.attachment_url = publicUrl;
      dbRecord.attachment_metadata = {
        fileName: attachment.name,
        fileSize: attachment.size,
        mimeType: attachment.type
      };

  }

  // Create time capsule in database
  const { data, error } = await supabaseAdmin
    .from('time_capsule_messages')
    .insert(dbRecord)
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: t('timeCapsule.errors.failedToCreate') }, { status: 500 });
  }

  return NextResponse.json({ data });

  } catch (error) {
    console.error('Error creating time capsule:', error);
    return NextResponse.json({ error: t('ui.errors.internalServerError') }, { status: 500 });
  }
}

// GET - List all user's time capsule messages
export async function GET(request: NextRequest) {
  try {
    const locale = getLocaleFromRequest(request);
    const { t } = getServerTranslation(locale);
    
    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: t('ui.errors.unauthorized') }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: t('ui.errors.invalidAuthentication') }, { status: 401 });
    }

    // Fetch time capsules with recipient details
    const { data, error } = await supabaseAdmin
      .from('time_capsule_messages')
      .select(`
        *,
        recipients:recipient_ids
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: t('timeCapsule.errors.failedToFetch') }, { status: 500 });
    }

    // Transform snake_case to camelCase
    const transformedData = data?.map(capsule => ({
      id: capsule.id,
      userId: capsule.user_id,
      title: capsule.title,
      messageType: capsule.message_type,
      textContent: capsule.text_content,
      attachmentUrl: capsule.attachment_url,
      attachmentMetadata: capsule.attachment_metadata,
      recipientIds: capsule.recipient_ids,
      unlockCondition: capsule.unlock_condition,
      unlockDate: capsule.unlock_date,
      status: capsule.status,
      createdAt: capsule.created_at,
      updatedAt: capsule.updated_at,
      deliveredAt: capsule.delivered_at
    }));

    return NextResponse.json({ data: transformedData });

  } catch (error) {
    console.error('Error fetching time capsules:', error);
    return NextResponse.json({ error: t('ui.errors.internalServerError') }, { status: 500 });
  }
}
