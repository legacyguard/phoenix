import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const checks = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    checks: {
      database: false,
      authentication: false,
      storage: false,
      email: false,
    },
    errors: [] as string[],
  };

  try {
    // Check database connection
    const supabase = createRouteHandlerClient({ cookies });
    const { error: dbError } = await supabase
      .from("generated_wills")
      .select("count")
      .limit(1);

    if (!dbError) {
      checks.checks.database = true;
    } else {
      checks.errors.push(`Database: ${dbError.message}`);
    }

    // Check authentication service (Clerk)
    if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      checks.checks.authentication = true;
    } else {
      checks.errors.push("Authentication: Clerk not configured");
    }

    // Check storage service
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      checks.checks.storage = true;
    } else {
      checks.errors.push("Storage: Supabase storage not configured");
    }

    // Check email service
    if (process.env.RESEND_API_KEY) {
      checks.checks.email = true;
    } else {
      checks.errors.push("Email: Resend not configured");
    }

    // Determine overall health
    const allHealthy = Object.values(checks.checks).every(
      (check) => check === true,
    );
    if (!allHealthy) {
      checks.status = "degraded";
    }

    // Return appropriate status code
    const statusCode = checks.status === "healthy" ? 200 : 503;

    return NextResponse.json(checks, { status: statusCode });
  } catch (error) {
    checks.status = "unhealthy";
    checks.errors.push(
      `System: ${error instanceof Error ? error.message : "Unknown error"}`,
    );

    return NextResponse.json(checks, { status: 503 });
  }
}
