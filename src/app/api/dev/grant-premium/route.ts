import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  // CRITICAL: Only allow this endpoint in development environment
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is not available in production" },
      { status: 403 },
    );
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Grant premium subscription to the user
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan_type: "premium",
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 1 year from now
          stripe_subscription_id: "dev_premium_subscription",
          stripe_customer_id: "dev_premium_customer",
        },
        {
          onConflict: "user_id",
        },
      );

    if (updateError) {
      console.error("Error granting premium:", updateError);
      return NextResponse.json(
        { error: "Failed to grant premium subscription" },
        { status: 500 },
      );
    }

    // Log the action for debugging
    console.log(`[DEV MODE] Premium subscription granted to user: ${user.id}`);

    return NextResponse.json({
      success: true,
      message: "Developer premium access granted!",
      userId: user.id,
    });
  } catch (error) {
    console.error("Error in dev grant-premium endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
