import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getServerTranslation, getLocaleFromRequest } from "@/lib/server-i18n";

// GET /api/will/list - Get all wills for the current user
export async function GET(request: NextRequest) {
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

    const { data: wills, error } = await supabase
      .from("generated_wills")
      .select(
        `
        id,
        country_code,
        status,
        version,
        created_at,
        updated_at,
        signed_at,
        notarized_at,
        will_content->testator->name,
        signature_requests (
          id,
          status,
          signature_level,
          signed_at
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wills:", error);
      return NextResponse.json(
        { error: t("common:wills.errors.failed_to_fetch") },
        { status: 500 },
      );
    }

    return NextResponse.json(wills || []);
  } catch (error) {
    console.error("Error in will list:", error);
    return NextResponse.json(
      { error: t("common:wills.errors.failed_to_fetch") },
      { status: 500 },
    );
  }
}
