import { NextResponse } from "next/server";
import { expirationIntelligence } from "@/services/expiration-intelligence";

// This endpoint should be called by a cron job service (e.g., Vercel Cron, GitHub Actions, or external service)
// It should run daily to check for expiring documents

export async function GET(request: Request) {
  try {
    // Verify the request is from the cron service (add your own authentication)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting expiration check...");

    // Check all expiring documents
    const notifications = await expirationIntelligence.checkExpiringDocuments();

    console.log(
      `Found ${notifications.length} documents requiring notifications`,
    );

    // Save notifications to the database
    if (notifications.length > 0) {
      await expirationIntelligence.saveNotifications(notifications);
    }

    // Group notifications by severity for reporting
    const summary = {
      total: notifications.length,
      critical: notifications.filter((n) => n.severity === "critical").length,
      warning: notifications.filter((n) => n.severity === "warning").length,
      info: notifications.filter((n) => n.severity === "info").length,
      timestamp: new Date().toISOString(),
    };

    console.log("Expiration check completed:", summary);

    return NextResponse.json({
      success: true,
      summary,
      message: `Processed ${notifications.length} expiring documents`,
    });
  } catch (error) {
    console.error("Error in expiration check cron job:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Optional: POST endpoint for manual trigger (for testing)
export async function POST(request: Request) {
  try {
    // Check for admin authentication
    const session = request.headers.get("x-user-session");
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Run the expiration check manually
    const notifications = await expirationIntelligence.checkExpiringDocuments();
    await expirationIntelligence.saveNotifications(notifications);

    return NextResponse.json({
      success: true,
      notificationsCreated: notifications.length,
      notifications: notifications.map((n) => ({
        documentTitle: n.documentTitle,
        severity: n.severity,
        daysUntilExpiration: n.daysUntilExpiration,
        message: n.message,
      })),
    });
  } catch (error) {
    console.error("Error in manual expiration check:", error);
    return NextResponse.json(
      { error: "Failed to check expirations" },
      { status: 500 },
    );
  }
}
