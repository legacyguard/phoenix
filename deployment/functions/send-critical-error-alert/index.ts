import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AlertRequest {
  errorCount: number;
  timeWindow: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { errorCount, timeWindow } = (await req.json()) as AlertRequest;

    // Get recent critical errors for the email
    const { data: recentErrors, error: errorsError } = await supabaseClient
      .from("error_logs")
      .select("*")
      .eq("error_level", "critical")
      .gte("created_at", new Date(Date.now() - 3600000).toISOString()) // Last hour
      .order("created_at", { ascending: false })
      .limit(10);

    if (errorsError) {
      throw new Error(`Failed to fetch recent errors: ${errorsError.message}`);
    }

    // Get error statistics
    const { data: stats, error: statsError } = await supabaseClient
      .from("error_statistics")
      .select("*")
      .limit(24); // Last 24 hours

    // Prepare email content
    const errorSummary =
      recentErrors
        ?.map(
          (error, index) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${index + 1}. ${error.error_message}</strong><br>
          <small style="color: #666;">
            ${new Date(error.created_at).toLocaleString()}<br>
            Page: ${error.page_url || "Unknown"}<br>
            User: ${error.user_id || "Anonymous"}
          </small>
        </td>
      </tr>
    `,
        )
        .join("") || "<tr><td>No recent errors found</td></tr>";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Critical Error Alert - LegacyGuard</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0 0 10px 0; font-size: 24px;">
              🚨 Critical Error Alert
            </h1>
            <p style="margin: 0; font-weight: 600;">
              ${errorCount} critical errors detected in the last ${timeWindow}
            </p>
          </div>

          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Alert Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0;"><strong>Error Count:</strong></td>
                <td style="padding: 8px 0;">${errorCount} critical errors</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Time Window:</strong></td>
                <td style="padding: 8px 0;">${timeWindow}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Alert Time:</strong></td>
                <td style="padding: 8px 0;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Recent Critical Errors</h2>
            <table style="width: 100%; border-collapse: collapse;">
              ${errorSummary}
            </table>
          </div>

          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <h3 style="color: #d97706; font-size: 16px; margin-top: 0;">Recommended Actions</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Review the error logs in the Supabase dashboard</li>
              <li>Check if the errors are related to a recent deployment</li>
              <li>Verify system resources and external service connectivity</li>
              <li>Consider rolling back if errors started after a recent change</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${Deno.env.get("SUPABASE_URL")}/project/default/editor/table/error_logs" 
               style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Error Logs in Dashboard
            </a>
          </div>

          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated alert from LegacyGuard error monitoring system.
              You're receiving this because critical errors exceeded the threshold.
            </p>
          </div>
        </body>
      </html>
    `;

    const emailText = `
CRITICAL ERROR ALERT - LegacyGuard

${errorCount} critical errors detected in the last ${timeWindow}

ALERT DETAILS:
- Error Count: ${errorCount} critical errors
- Time Window: ${timeWindow}
- Alert Time: ${new Date().toLocaleString()}

RECENT CRITICAL ERRORS:
${
  recentErrors
    ?.map(
      (error, index) => `
${index + 1}. ${error.error_message}
   Time: ${new Date(error.created_at).toLocaleString()}
   Page: ${error.page_url || "Unknown"}
   User: ${error.user_id || "Anonymous"}
`,
    )
    .join("\n") || "No recent errors found"
}

RECOMMENDED ACTIONS:
- Review the error logs in the Supabase dashboard
- Check if the errors are related to a recent deployment
- Verify system resources and external service connectivity
- Consider rolling back if errors started after a recent change

View logs: ${Deno.env.get("SUPABASE_URL")}/project/default/editor/table/error_logs

This is an automated alert from LegacyGuard error monitoring system.
    `;

    // Send email using Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ERROR_ALERT_EMAIL =
      Deno.env.get("ERROR_ALERT_EMAIL") || "admin@legacyguard.com";
    const RESEND_FROM_EMAIL =
      Deno.env.get("RESEND_FROM_EMAIL") || "alerts@legacyguard.com";

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [ERROR_ALERT_EMAIL],
        subject: `🚨 Critical Error Alert - ${errorCount} errors in ${timeWindow}`,
        html: emailHtml,
        text: emailText,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      throw new Error(`Failed to send email: ${errorData}`);
    }

    // Log that alert was sent
    await supabaseClient.from("error_logs").insert({
      error_level: "warning",
      error_message: `Critical error alert sent: ${errorCount} errors in ${timeWindow}`,
      error_context: {
        type: "alertSent",
        errorCount,
        timeWindow,
        sentTo: ERROR_ALERT_EMAIL,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Critical error alert sent successfully",
        errorCount,
        sentTo: ERROR_ALERT_EMAIL,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error sending critical error alert:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
