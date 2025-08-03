import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { willNotificationService } from '@/services/willNotificationService';
import { getServerTranslation, getLocaleFromRequest } from '@/lib/server-i18n';

export async function POST(request: NextRequest) {
  try {
    const locale = getLocaleFromRequest(request);
    const { t } = getServerTranslation(locale);
    const { 
      willId, 
      notaryName, 
      notaryLicense, 
      notaryJurisdiction,
      notarizationLocation,
      witnesses 
    } = await request.json();
    
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: t('will.errors.unauthorized') }, { status: 401 });
    }

    // Verify will ownership and status
    const { data: will, error: willError } = await supabase
      .from('generated_wills')
      .select('status, country_code, will_content')
      .eq('id', willId)
      .eq('user_id', user.id)
      .single();

    if (willError || !will) {
      return NextResponse.json({ error: t('will.errors.not_found') }, { status: 404 });
    }

    if (will.status !== 'signed' 66 will.status !== 'qes_signed') {
      return NextResponse.json({ error: t('will.errors.must_be_signed') }, { status: 400 });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Create notarization record
    const { data: notarization, error: notarizeError } = await supabase
      .from('will_notarization')
      .insert({
        will_id: willId,
        notary_name: notaryName,
        notary_license: notaryLicense,
        notary_jurisdiction: notaryJurisdiction,
        notarization_date: new Date().toISOString(),
        notarization_location: notarizationLocation,
        verification_code: verificationCode
      })
      .select()
      .single();

    if (notarizeError) {
      console.error('Notarization error:', notarizeError);
      return NextResponse.json({ error: t('will.errors.failed_to_notarize') }, { status: 500 });
    }

    // Record witnesses if provided
    if (witnesses && witnesses.length > 0) {
      const witnessRecords = witnesses.map((witness: any) => ({
        will_id: willId,
        witness_name: witness.name,
        witness_address: witness.address,
        witness_signature: witness.signature,
        signed_at: new Date().toISOString()
      }));

      await supabase
        .from('will_witnesses')
        .insert(witnessRecords);
    }

    // Update will status
    const { error: updateError } = await supabase
      .from('generated_wills')
      .update({
        status: 'completed',
        notarized_at: new Date().toISOString(),
        notary_details: {
          notary_name: notaryName,
          notary_license: notaryLicense,
          verification_code: verificationCode
        }
      })
      .eq('id', willId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: t('will.errors.failed_to_update_status') }, { status: 500 });
    }

    // Create a final version
    await supabase.rpc('create_will_version', {
      p_will_id: willId,
      p_content: will.will_content,
      p_created_by: 'notary',
      p_created_reason: 'Notarization completed',
      p_changes: {
        type: 'notarization',
        notary: notaryName,
        timestamp: new Date().toISOString()
      }
    });

    // Send notification
    await willNotificationService.sendNotarizationComplete(user.id, willId, verificationCode);

    return NextResponse.json({
      success: true,
      notarizationId: notarization.id,
      verificationCode: verificationCode,
      message: t('will.success.notarized')
    });

  } catch (error) {
    console.error('Notarization error:', error);
    return NextResponse.json({ error: t('will.errors.failed_to_notarize') }, { status: 500 });
  }
}

// GET endpoint to verify notarization
export async function GET(request: NextRequest) {
  try {
    const locale = getLocaleFromRequest(request);
    const { t } = getServerTranslation(locale);
    const searchParams = request.nextUrl.searchParams;
    const verificationCode = searchParams.get('code');
    
    if (!verificationCode) {
      return NextResponse.json({ error: t('will.errors.verification_code_required') }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    const { data: notarization, error } = await supabase
      .from('will_notarization')
      .select(`
        *,
        generated_wills (
          id,
          country_code,
          created_at,
          will_content->testator->name
        )
      `)
      .eq('verification_code', verificationCode)
      .single();

    if (error || !notarization) {
      return NextResponse.json({ error: t('will.errors.invalid_verification_code') }, { status: 404 });
    }

    return NextResponse.json({
      verified: true,
      notarization: {
        notaryName: notarization.notary_name,
        notaryLicense: notarization.notary_license,
        notarizationDate: notarization.notarization_date,
        location: notarization.notarization_location,
        willInfo: {
          id: notarization.generated_wills.id,
          testatorName: notarization.generated_wills.name,
          createdAt: notarization.generated_wills.created_at,
          countryCode: notarization.generated_wills.country_code
        }
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: t('will.errors.failed_to_verify') }, { status: 500 });
  }
}

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if ((i + 1) % 4 === 0 && i < 11) {
      code += '-';
    }
  }
  return code;
}
