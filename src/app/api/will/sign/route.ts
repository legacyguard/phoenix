import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { pdfGenerationService } from "@/services/pdfGenerationService";
import { willBackupService } from "@/services/willBackupService";
import type { WillContent, WillRequirements } from "@/types/will";
import { eSignatureService } from "@/services/eSignatureService";
import {
  getLegacyGuardSignatureSVG,
  svgToBase64,
} from "@/components/LegacyGuardSignature.utils";
import { getServerTranslation, getLocaleFromRequest } from "@/lib/server-i18n";

export async function POST(request: NextRequest) {
  try {
    const locale = getLocaleFromRequest(request);
    const { t } = getServerTranslation(locale);
    const { willContent, requirements, countryCode, documentType } =
      await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: t("wills.errors.unauthorized") },
        { status: 401 },
      );
    }

    const pdfBlob = pdfGenerationService.generateWillPDF(
      willContent as WillContent,
      requirements as WillRequirements,
      countryCode,
    );

    const arrayBuffer = await pdfBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const { data: savedWill, error: saveError } = await supabase
      .from("generated_wills")
      .insert({
        user_id: user.id,
        country_code: countryCode,
        will_content: willContent,
        requirements: requirements,
        status: "draft",
        pdf_content: base64,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving will:", saveError);
      return NextResponse.json(
        { error: t("wills.errors.failed_to_save") },
        { status: 500 },
      );
    }

    // Common document signing (option to sign with agreement)
    const signatureDate = new Date().toISOString();
    const userIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("remote-addr");

    // Add graphical stamp
    const signerFullName =
      `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim() ||
      user.email;
    const svgSignature = getLegacyGuardSignatureSVG({
      date: signatureDate,
      signerName: signerFullName,
      documentId: savedWill.id,
    });
    const svgStampBase64 = svgToBase64(svgSignature);

    await supabase.from("signed_documents").insert({
      will_id: savedWill.id,
      user_id: user.id,
      signature_date: signatureDate,
      ip_address: userIP,
      signer_name: signerFullName,
      type: documentType,
      svg_stamp: svgStampBase64,
      signature_metadata: {
        browser: request.headers.get("user-agent"),
        timestamp: Date.now(),
        method: "simple_consent",
      },
    });

    // Consideration for legally binding documents using Skribble
    if (documentType === "will") {
      const skribbleResponse = await eSignatureService.requestSkribbleSignature(
        savedWill.id,
        base64,
      );

      if (skribbleResponse.error) {
        console.error("Skribble signing error:", skribbleResponse.error);
        return NextResponse.json(
          {
            error: t("wills.errors.failed_to_sign"),
            details: skribbleResponse.error,
          },
          { status: skribbleResponse.status },
        );
      }

      return NextResponse.json({
        success: true,
        willId: savedWill.id,
        pdfUrl: `data:application/pdf;base64,${base64}`,
        skribbleUrl: skribbleResponse.url,
      });
    }

    await willBackupService.backupWill(savedWill.id, willContent, user.id);

    await supabase.rpc("create_will_version", {
      p_will_id: savedWill.id,
      p_content: willContent,
      p_created_by: "user",
      p_created_reason: "Initial will generation",
      p_changes: null,
    });

    return NextResponse.json({
      success: true,
      willId: savedWill.id,
      pdfUrl: `data:application/pdf;base64,${base64}`,
    });
  } catch (error) {
    console.error("Will generation error:", error);
    return NextResponse.json(
      { error: t("wills.errors.failed_to_generate") },
      { status: 500 },
    );
  }
}
