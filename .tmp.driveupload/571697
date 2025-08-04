import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { pdfGenerationService } from '@/services/pdfGenerationService';
import { willBackupService } from '@/services/willBackupService';
import type { WillContent, WillRequirements } from '@/types/will';
import { getServerTranslation, getLocaleFromRequest } from '@/lib/server-i18n';

export async function POST(request: NextRequest) {
  try {
    const locale = getLocaleFromRequest(request);
    const { t } = getServerTranslation(locale);
    const { willContent, requirements, countryCode } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: t('will.errors.unauthorized') }, { status: 401 });
    }

    // Generate PDF
    const pdfBlob = pdfGenerationService.generateWillPDF(
      willContent as WillContent,
      requirements as WillRequirements,
      countryCode
    );

    // Convert blob to base64 for storage
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Save will to database
    const { data: savedWill, error: saveError } = await supabase
      .from('generated_wills')
      .insert({
        user_id: user.id,
        country_code: countryCode,
        will_content: willContent,
        requirements: requirements,
        status: 'draft',
        pdf_content: base64,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving will:', saveError);
      return NextResponse.json({ error: t('will.errors.failed_to_save') }, { status: 500 });
    }

    // Create backup
    await willBackupService.backupWill(savedWill.id, willContent, user.id);

    // Create will version
    await supabase.rpc('create_will_version', {
      p_will_id: savedWill.id,
      p_content: willContent,
      p_created_by: 'user',
      p_created_reason: 'Initial will generation',
      p_changes: null
    });

    return NextResponse.json({
      success: true,
      willId: savedWill.id,
      pdfUrl: `data:application/pdf;base64,${base64}`
    });
  } catch (error) {
    console.error('Will generation error:', error);
    return NextResponse.json(
      { error: t('will.errors.failed_to_generate') },
      { status: 500 }
    );
  }
}
