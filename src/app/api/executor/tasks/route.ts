import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { ExecutorTaskService } from "@/services/executorTaskService";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check user subscription status
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.subscription_status !== "premium") {
    return NextResponse.json(
      { error: "Access denied: This is a premium feature." },
      { status: 403 },
    );
  }

  try {
    const tasks = await ExecutorTaskService.getExecutorTasks(user.id);
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Error fetching executor tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}
