import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { UpdateTimeCapsuleDto } from "@/types/timeCapsule";
import { getServerTranslation, getLocaleFromRequest } from "@/lib/server-i18n";

// Initialize Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// PUT - Update a time capsule message
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const locale = getLocaleFromRequest(request);
    const { t } = getServerTranslation(locale);

    // Get authenticated user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: t("ui-elements:ui.errors.unauthorized") },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: t("ui.errors.invalidAuthentication") },
        { status: 401 },
      );
    }

    const capsuleId = params.id;
    const updates: UpdateTimeCapsuleDto = await request.json();

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.textContent !== undefined)
      updateData.text_content = updates.textContent;
    if (updates.recipientIds !== undefined)
      updateData.recipient_ids = updates.recipientIds;
    if (updates.unlockCondition !== undefined)
      updateData.unlock_condition = updates.unlockCondition;
    if (updates.unlockDate !== undefined)
      updateData.unlock_date = updates.unlockDate;

    // Update time capsule (only if locked and owned by user)
    const { data, error } = await supabaseAdmin
      .from("time_capsule_messages")
      .update(updateData)
      .eq("id", capsuleId)
      .eq("user_id", user.id)
      .eq("status", "locked")
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: t("timeCapsule.errors.failedToUpdate") },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: t("timeCapsule.errors.notFoundOrCannotModify"),
        },
        { status: 404 },
      );
    }

    // Transform snake_case to camelCase
    const transformedData = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      messageType: data.message_type,
      textContent: data.text_content,
      attachmentUrl: data.attachment_url,
      attachmentMetadata: data.attachment_metadata,
      recipientIds: data.recipient_ids,
      unlockCondition: data.unlock_condition,
      unlockDate: data.unlock_date,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deliveredAt: data.delivered_at,
    };

    return NextResponse.json({ data: transformedData });
  } catch (error) {
    console.error("Error updating time capsule:", error);
    return NextResponse.json(
      { error: t("ui.errors.internalServerError") },
      { status: 500 },
    );
  }
}

// DELETE - Delete a time capsule message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const locale = getLocaleFromRequest(request);
    const { t } = getServerTranslation(locale);

    // Get authenticated user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: t("ui-elements:ui.errors.unauthorized") },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: t("ui.errors.invalidAuthentication") },
        { status: 401 },
      );
    }

    const capsuleId = params.id;

    // First, get the time capsule to check attachment
    const { data: capsule, error: fetchError } = await supabaseAdmin
      .from("time_capsule_messages")
      .select("attachment_url")
      .eq("id", capsuleId)
      .eq("user_id", user.id)
      .eq("status", "locked")
      .single();

    if (fetchError || !capsule) {
      return NextResponse.json(
        {
          error: t("timeCapsule.errors.notFoundOrCannotDelete"),
        },
        { status: 404 },
      );
    }

    // Delete attachment from storage if exists
    if (capsule.attachment_url) {
      const path = capsule.attachment_url.split("/").pop();
      if (path) {
        await supabaseAdmin.storage
          .from("time-capsule-attachments")
          .remove([`${user.id}/time-capsules/${path}`]);
      }
    }

    // Delete time capsule
    const { error } = await supabaseAdmin
      .from("time_capsule_messages")
      .delete()
      .eq("id", capsuleId)
      .eq("user_id", user.id)
      .eq("status", "locked");

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: t("timeCapsule.errors.failedToDelete") },
        { status: 500 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting time capsule:", error);
    return NextResponse.json(
      { error: t("ui.errors.internalServerError") },
      { status: 500 },
    );
  }
}
