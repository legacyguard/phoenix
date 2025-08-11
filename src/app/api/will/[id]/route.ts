import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getServerTranslation, getLocaleFromRequest } from "@/lib/server-i18n";

// GET /api/will/[id] - Get a specific will
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const locale = getLocaleFromRequest(request);
    const { t } = getServerTranslation(locale);
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: t("common:wills.errors.unauthorized") },
        { status: 401 },
      );
    }

    const { data: will, error } = await supabase
      .from("generated_wills")
      .select(
        `
        *,
        will_signatures (*),
        will_witnesses (*),
        will_notarization (*),
        signature_requests (*)
      `,
      )
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !will) {
      return NextResponse.json(
        { error: t("common:wills.errors.not_found") },
        { status: 404 },
      );
    }

    return NextResponse.json(will);
  } catch (error) {
    console.error("Error fetching will:", error);
    return NextResponse.json(
      { error: t("common:wills.errors.failed_to_load") },
      { status: 500 },
    );
  }
}

// PUT /api/will/[id] - Update a will
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const locale = getLocaleFromRequest(request);
    const { t } = getServerTranslation(locale);
    const supabase = createRouteHandlerClient({ cookies });
    const { willContent, requirements } = await request.json();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: t("common:wills.errors.unauthorized") },
        { status: 401 },
      );
    }

    // Check if will exists and user owns it
    const { data: existingWill } = await supabase
      .from("generated_wills")
      .select("status")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (!existingWill) {
      return NextResponse.json(
        { error: t("common:wills.errors.not_found") },
        { status: 404 },
      );
    }

    // Only allow updates to draft wills
    if (existingWill.status !== "draft") {
      return NextResponse.json(
        { error: t("common:wills.errors.cannot_update_non_draft") },
        { status: 400 },
      );
    }

    // Create a new version before updating
    await supabase.rpc("create_will_version", {
      p_will_id: params.id,
      p_content: willContent,
      p_created_by: "user",
      p_created_reason: "User update",
      p_changes: { type: "update", timestamp: new Date().toISOString() },
    });

    // Update the will
    const { data: updatedWill, error: updateError } = await supabase
      .from("generated_wills")
      .update({
        will_content: willContent,
        requirements: requirements,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: t("common:wills.errors.failed_to_save") },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedWill);
  } catch (error) {
    console.error("Error updating will:", error);
    return NextResponse.json(
      { error: t("common:wills.errors.failed_to_save") },
      { status: 500 },
    );
  }
}

// DELETE /api/will/[id] - Delete a will
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const locale = getLocaleFromRequest(request);
    const { t } = getServerTranslation(locale);
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: t("common:wills.errors.unauthorized") },
        { status: 401 },
      );
    }

    // Check if will exists and user owns it
    const { data: existingWill } = await supabase
      .from("generated_wills")
      .select("status")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (!existingWill) {
      return NextResponse.json(
        { error: t("common:wills.errors.not_found") },
        { status: 404 },
      );
    }

    // Only allow deletion of draft wills
    if (existingWill.status !== "draft") {
      return NextResponse.json(
        { error: t("common:wills.errors.cannot_delete_non_draft") },
        { status: 400 },
      );
    }

    const { error: deleteError } = await supabase
      .from("generated_wills")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: t("common:wills.errors.failed_to_delete") },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting will:", error);
    return NextResponse.json(
      { error: t("common:wills.errors.failed_to_delete") },
      { status: 500 },
    );
  }
}
