import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Webhook secret for validation
const WEBHOOK_SECRET = process.env.LEGAL_VALIDATION_WEBHOOK_SECRET || '';

interface LegalValidationRequest {
  willId: string;
  countryCode: string;
  willContent: any;
  validationType: 'full' | 'compliance' | 'signature';
}

interface LegalValidationResponse {
  isValid: boolean;
  issues?: Array<{
    severity: 'error' | 'warning' | 'info';
    code: string;
    message: string;
    field?: string;
  }>;
  recommendations?: string[];
  validatedAt: string;
}

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// POST endpoint for external legal validation services
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-webhook-signature');
    const rawBody = await request.text();
    
    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const validationRequest: LegalValidationRequest = JSON.parse(rawBody);
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch will details
    const { data: will, error: willError } = await supabase
      .from('generated_wills')
      .select('*')
      .eq('id', validationRequest.willId)
      .single();

    if (willError || !will) {
      return NextResponse.json(
        { error: 'Will not found' },
        { status: 404 }
      );
    }

    // Perform legal validation based on country requirements
    const validationResult = await performLegalValidation(
      validationRequest.countryCode,
      validationRequest.willContent,
      validationRequest.validationType
    );

    // Store validation result
    const { error: insertError } = await supabase
      .from('will_validations')
      .insert({
        will_id: validationRequest.willId,
        validation_type: validationRequest.validationType,
        is_valid: validationResult.isValid,
        issues: validationResult.issues,
        recommendations: validationResult.recommendations,
        validated_at: validationResult.validatedAt
      });

    if (insertError) {
      console.error('Error storing validation result:', insertError);
    }

    // Update will status based on validation
    if (!validationResult.isValid) {
      await supabase
        .from('generated_wills')
        .update({ 
          status: 'needs_revision',
          validation_status: 'failed'
        })
        .eq('id', validationRequest.willId);
    }

    return NextResponse.json(validationResult);
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Perform legal validation based on country-specific rules
async function performLegalValidation(
  countryCode: string,
  willContent: any,
  validationType: string
): Promise<LegalValidationResponse> {
  const issues: LegalValidationResponse['issues'] = [];
  const recommendations: string[] = [];

  // Country-specific validation rules
  switch (countryCode) {
    case 'SK':
      validateSlovakianWill(willContent, issues, recommendations);
      break;
    case 'CZ':
      validateCzechWill(willContent, issues, recommendations);
      break;
    case 'MD':
      validateMoldovanWill(willContent, issues, recommendations);
      break;
    case 'UA':
      validateUkrainianWill(willContent, issues, recommendations);
      break;
    case 'RS':
      validateSerbianWill(willContent, issues, recommendations);
      break;
    case 'AL':
      validateAlbanianWill(willContent, issues, recommendations);
      break;
    case 'MK':
      validateMacedonianWill(willContent, issues, recommendations);
      break;
    case 'ME':
      validateMontenegrinWill(willContent, issues, recommendations);
      break;
    default:
      issues.push({
        severity: 'warning',
        code: 'UNSUPPORTED_COUNTRY',
        message: 'Country-specific validation not available'
      });
  }

  // Common validations
  validateCommonRequirements(willContent, issues, recommendations);

  return {
    isValid: !issues.some(issue => issue.severity === 'error'),
    issues: issues.length > 0 ? issues : undefined,
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    validatedAt: new Date().toISOString()
  };
}

// Validate Slovak will requirements
function validateSlovakianWill(
  willContent: any,
  issues: LegalValidationResponse['issues'],
  recommendations: string[]
) {
  // Check required clauses
  if (!willContent.testator?.name || !willContent.testator?.birthDate) {
    issues?.push({
      severity: 'error',
      code: 'SK_MISSING_TESTATOR_INFO',
      message: 'Testator name and birth date are required',
      field: 'testator'
    });
  }

  // Check beneficiary requirements
  if (!willContent.beneficiaries || willContent.beneficiaries.length === 0) {
    issues?.push({
      severity: 'error',
      code: 'SK_NO_BENEFICIARIES',
      message: 'At least one beneficiary must be specified'
    });
  }

  // Validate witness requirements
  if (willContent.witnesses && willContent.witnesses.length < 2) {
    issues?.push({
      severity: 'error',
      code: 'SK_INSUFFICIENT_WITNESSES',
      message: 'Slovak law requires at least 2 witnesses for typed wills'
    });
  }

  // Add recommendations
  recommendations.push('Consider adding alternate beneficiaries in case primary beneficiaries predecease you');
  recommendations.push('Ensure witnesses are not beneficiaries to avoid conflicts of interest');
}

// Validate Czech will requirements
function validateCzechWill(
  willContent: any,
  issues: LegalValidationResponse['issues'],
  recommendations: string[]
) {
  // Check sound mind declaration
  if (!willContent.soundMindDeclaration) {
    issues?.push({
      severity: 'error',
      code: 'CZ_MISSING_SOUND_MIND',
      message: 'Czech law requires explicit declaration of sound mind',
      field: 'soundMindDeclaration'
    });
  }

  // Check notarization requirement
  if (!willContent.requiresNotarization) {
    recommendations.push('Czech typed wills require notarization - ensure this is completed');
  }

  // Validate witness requirements
  if (willContent.witnesses && willContent.witnesses.length < 2) {
    issues?.push({
      severity: 'error',
      code: 'CZ_INSUFFICIENT_WITNESSES',
      message: 'Czech law requires at least 2 witnesses'
    });
  }
}

// Validate Moldovan will requirements
function validateMoldovanWill(
  willContent: any,
  issues: LegalValidationResponse['issues'],
  recommendations: string[]
) {
  // Check sound mind declaration
  if (!willContent.soundMindDeclaration) {
    issues?.push({
      severity: 'error',
      code: 'MD_MISSING_SOUND_MIND',
      message: 'Moldovan law requires explicit declaration of sound mind',
      field: 'soundMindDeclaration'
    });
  }

  // Check notarization requirement
  if (!willContent.requiresNotarization) {
    issues?.push({
      severity: 'error',
      code: 'MD_REQUIRES_NOTARIZATION',
      message: 'Moldovan typed wills must be notarized'
    });
  }

  // Validate witness requirements
  if (willContent.witnesses && willContent.witnesses.length < 2) {
    issues?.push({
      severity: 'error',
      code: 'MD_INSUFFICIENT_WITNESSES',
      message: 'Moldovan law requires at least 2 witnesses'
    });
  }

  recommendations.push('Ensure the will is registered with the notarial chamber for additional security');
}

// Validate Ukrainian will requirements
function validateUkrainianWill(
  willContent: any,
  issues: LegalValidationResponse['issues'],
  recommendations: string[]
) {
  // Check sound mind declaration
  if (!willContent.soundMindDeclaration) {
    issues?.push({
      severity: 'error',
      code: 'UA_MISSING_SOUND_MIND',
      message: 'Ukrainian law requires explicit declaration of sound mind and memory',
      field: 'soundMindDeclaration'
    });
  }

  // Mandatory notarization in Ukraine
  if (!willContent.requiresNotarization) {
    issues?.push({
      severity: 'error',
      code: 'UA_MANDATORY_NOTARIZATION',
      message: 'All wills in Ukraine must be notarized by a notary public'
    });
  }

  recommendations.push('Consider registering your will in the Hereditary Register of Ukraine');
  recommendations.push('Ukrainian law allows for secret wills - consult a notary for this option');
}

// Validate Serbian will requirements
function validateSerbianWill(
  willContent: any,
  issues: LegalValidationResponse['issues'],
  recommendations: string[]
) {
  // Check required clauses
  if (!willContent.testator?.name || !willContent.testator?.birthDate || !willContent.testator?.address) {
    issues?.push({
      severity: 'error',
      code: 'RS_MISSING_TESTATOR_INFO',
      message: 'Testator full identification including name, birth date, and address is required',
      field: 'testator'
    });
  }

  // Validate witness requirements
  if (willContent.witnesses && willContent.witnesses.length < 2) {
    issues?.push({
      severity: 'error',
      code: 'RS_INSUFFICIENT_WITNESSES',
      message: 'Serbian law requires at least 2 witnesses for typed wills'
    });
  }

  recommendations.push('Consider depositing your will with the court for safekeeping');
  recommendations.push('Serbian law recognizes oral wills only in exceptional circumstances');
}

// Validate Albanian will requirements
function validateAlbanianWill(
  willContent: any,
  issues: LegalValidationResponse['issues'],
  recommendations: string[]
) {
  // Check sound mind declaration
  if (!willContent.soundMindDeclaration) {
    issues?.push({
      severity: 'error',
      code: 'AL_MISSING_SOUND_MIND',
      message: 'Albanian law requires declaration of full mental capacity',
      field: 'soundMindDeclaration'
    });
  }

  // Check notarization requirement
  if (!willContent.requiresNotarization) {
    issues?.push({
      severity: 'error',
      code: 'AL_REQUIRES_NOTARIZATION',
      message: 'Albanian typed wills must be notarized'
    });
  }

  // Albania requires 3 witnesses
  if (!willContent.witnesses || willContent.witnesses.length < 3) {
    issues?.push({
      severity: 'error',
      code: 'AL_INSUFFICIENT_WITNESSES',
      message: 'Albanian law requires 3 witnesses present at signing'
    });
  }

  recommendations.push('Witnesses must be of legal age and mentally competent');
  recommendations.push('Beneficiaries cannot serve as witnesses under Albanian law');
}

// Validate Macedonian will requirements
function validateMacedonianWill(
  willContent: any,
  issues: LegalValidationResponse['issues'],
  recommendations: string[]
) {
  // Check sound mind declaration
  if (!willContent.soundMindDeclaration) {
    issues?.push({
      severity: 'error',
      code: 'MK_MISSING_SOUND_MIND',
      message: 'Macedonian law requires declaration of full consciousness and reason',
      field: 'soundMindDeclaration'
    });
  }

  // Check notarization requirement
  if (!willContent.requiresNotarization) {
    issues?.push({
      severity: 'error',
      code: 'MK_REQUIRES_NOTARIZATION',
      message: 'Macedonian typed wills must be notarized by a notary public'
    });
  }

  // Validate witness requirements
  if (willContent.witnesses && willContent.witnesses.length < 2) {
    issues?.push({
      severity: 'error',
      code: 'MK_INSUFFICIENT_WITNESSES',
      message: 'Macedonian law requires at least 2 witnesses'
    });
  }

  recommendations.push('The will must be read aloud in the presence of witnesses before signing');
}

// Validate Montenegrin will requirements
function validateMontenegrinWill(
  willContent: any,
  issues: LegalValidationResponse['issues'],
  recommendations: string[]
) {
  // Check required clauses
  if (!willContent.testator?.name || !willContent.testator?.birthDate || !willContent.testator?.address) {
    issues?.push({
      severity: 'error',
      code: 'ME_MISSING_TESTATOR_INFO',
      message: 'Testator full identification is required',
      field: 'testator'
    });
  }

  // Validate witness requirements
  if (willContent.witnesses && willContent.witnesses.length < 2) {
    issues?.push({
      severity: 'error',
      code: 'ME_INSUFFICIENT_WITNESSES',
      message: 'Montenegrin law requires at least 2 witnesses for typed wills'
    });
  }

  recommendations.push('Consider court deposition for additional legal protection');
  recommendations.push('Witnesses should not be related to beneficiaries');
}

// Common validation requirements
function validateCommonRequirements(
  willContent: any,
  issues: LegalValidationResponse['issues'],
  recommendations: string[]
) {
  // Check allocation totals to 100%
  const totalAllocation = willContent.beneficiaries?.reduce((sum: number, b: any) => {
    const percentageAllocation = b.allocation
      ?.filter((a: any) => a.assetType === 'percentage')
      ?.reduce((s: number, a: any) => s + (a.value || 0), 0) || 0;
    return sum + percentageAllocation;
  }, 0) || 0;

  if (totalAllocation !== 100 && totalAllocation > 0) {
    issues?.push({
      severity: 'error',
      code: 'INVALID_ALLOCATION_TOTAL',
      message: `Asset allocation must total 100%, currently ${totalAllocation}%`,
      field: 'beneficiaries.allocation'
    });
  }

  // Check executor appointment
  if (!willContent.executor) {
    issues?.push({
      severity: 'warning',
      code: 'NO_EXECUTOR',
      message: 'No executor appointed - court may need to appoint one'
    });
    recommendations.push('Consider appointing an executor to manage your estate');
  }

  // Check for ambiguous language
  if (willContent.specialBequests) {
    willContent.specialBequests.forEach((bequest: any, index: number) => {
      if (bequest.condition && bequest.condition.includes('approximately')) {
        issues?.push({
          severity: 'warning',
          code: 'AMBIGUOUS_LANGUAGE',
          message: 'Avoid ambiguous terms like "approximately" in conditions',
          field: `specialBequests[${index}].condition`
        });
      }
    });
  }
}
