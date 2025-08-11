import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmergencyNotificationRequest {
  userId: string;
  guardianId: string;
  guardianName: string;
  guardianEmail: string;
  emergencyNotes: string;
  timestamp: string;
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

    const {
      userId,
      guardianId,
      guardianName,
      guardianEmail,
      emergencyNotes,
      timestamp,
    } = (await req.json()) as EmergencyNotificationRequest;

    // Get user information
    const { data: userData, error: userError } = await supabaseClient
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      throw new Error("Failed to fetch user information");
    }

    // Get guardian relationship
    const { data: guardianData, error: guardianError } = await supabaseClient
      .from("guardians")
      .select("relationship")
      .eq("id", guardianId)
      .single();

    const guardianRelationship = guardianData?.relationship || "Guardian";

    // Get emergency contacts with their details
    const { data: emergencyContacts, error: contactsError } =
      await supabaseClient
        .from("emergency_contacts")
        .select(
          `
        *,
        contact:contacts(*)
      `,
        )
        .eq("user_id", userId)
        .order("priority_order");

    if (contactsError || !emergencyContacts || emergencyContacts.length === 0) {
      throw new Error("No emergency contacts found");
    }

    // Format timestamp
    const formattedTimestamp = new Date(timestamp).toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "UTC",
    });

    // Build contact list for email
    const contactListHtml = emergencyContacts
      .map((ec, index) => {
        const contact = ec.contact;
        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              <strong>${index + 1}. ${contact.name}</strong><br>
              ${contact.relationship ? `${contact.relationship}<br>` : ""}
              ${contact.phone_number ? `📞 ${contact.phone_number}<br>` : ""}
              ${contact.email ? `✉️ ${contact.email}` : ""}
            </td>
          </tr>
        `;
      })
      .join("");

    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Emergency Contact Access Notification</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0 0 10px 0; font-size: 24px;">
              ⚠️ Emergency Contact Access Notification
            </h1>
            <p style="margin: 0; font-weight: 600;">
              Emergency access to contact information for ${userData.full_name}
            </p>
          </div>

          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Guardian Access Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0;"><strong>Guardian Name:</strong></td>
                <td style="padding: 8px 0;">${guardianName} (${guardianRelationship})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Guardian Email:</strong></td>
                <td style="padding: 8px 0;">${guardianEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Access Time:</strong></td>
                <td style="padding: 8px 0;">${formattedTimestamp} UTC</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; vertical-align: top;"><strong>Situation Notes:</strong></td>
                <td style="padding: 8px 0;">${emergencyNotes}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Emergency Contact List</h2>
            <p style="color: #6b7280; margin-bottom: 15px;">
              The following emergency contacts have been accessed. They are listed in priority order:
            </p>
            <table style="width: 100%; border-collapse: collapse;">
              ${contactListHtml}
            </table>
          </div>

          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <h3 style="color: #d97706; font-size: 16px; margin-top: 0;">Next Steps</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Contact individuals in the priority order shown above</li>
              <li>Coordinate with the guardian (${guardianName}) as needed</li>
              <li>Document all contact attempts and outcomes</li>
              <li>Follow any specific instructions provided by ${userData.full_name}</li>
            </ul>
          </div>

          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated notification from LegacyGuard. This email was sent because 
              ${guardianName} accessed emergency contact information for ${userData.full_name}.
              All emergency access is logged for security purposes.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
              <strong>Privacy Notice:</strong> This email contains sensitive information. 
              Please handle it with appropriate care and confidentiality.
            </p>
          </div>
        </body>
      </html>
    `;

    const emailText = `
EMERGENCY CONTACT ACCESS NOTIFICATION

Emergency access to contact information for ${userData.full_name}

GUARDIAN ACCESS DETAILS:
- Guardian Name: ${guardianName} (${guardianRelationship})
- Guardian Email: ${guardianEmail}
- Access Time: ${formattedTimestamp} UTC
- Situation Notes: ${emergencyNotes}

EMERGENCY CONTACT LIST (in priority order):
${emergencyContacts
  .map((ec, index) => {
    const contact = ec.contact;
    return `
${index + 1}. ${contact.name}
   ${contact.relationship ? `Relationship: ${contact.relationship}` : ""}
   ${contact.phone_number ? `Phone: ${contact.phone_number}` : ""}
   ${contact.email ? `Email: ${contact.email}` : ""}`;
  })
  .join("\n")}

NEXT STEPS:
- Contact individuals in the priority order shown above
- Coordinate with the guardian (${guardianName}) as needed
- Document all contact attempts and outcomes
- Follow any specific instructions provided by ${userData.full_name}

This is an automated notification from LegacyGuard. This email was sent because 
${guardianName} accessed emergency contact information for ${userData.full_name}.
All emergency access is logged for security purposes.
`;

    // Send emails to all emergency contacts who have opted in
    const emailPromises = emergencyContacts
      .filter((ec) => {
        // Check if contact has email and has opted in for notifications
        if (!ec.contact.email) return false;

        const prefs = ec.notification_preferences || { email_enabled: true };
        return prefs.email_enabled !== false;
      })
      .map(async (ec) => {
        const contact = ec.contact;

        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
            },
            body: JSON.stringify({
              from: "LegacyGuard <notifications@legacyguard.eu>",
              to: contact.email,
              subject: `Emergency Contact Access for ${userData.full_name}`,
              html: emailHtml,
              text: emailText,
              reply_to: guardianEmail,
              tags: [
                {
                  name: "notification_type",
                  value: "emergency_access",
                },
                {
                  name: "user_id",
                  value: userId,
                },
              ],
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to send email to ${contact.email}`);
          }

          return { success: true, email: contact.email };
        } catch (error) {
          console.error(`Failed to send email to ${contact.email}:`, error);
          return { success: false, email: contact.email, error: error.message };
        }
      });

    const emailResults = await Promise.all(emailPromises);

    // Also send a notification to the user (account owner)
    if (userData.email) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          },
          body: JSON.stringify({
            from: "LegacyGuard <notifications@legacyguard.eu>",
            to: userData.email,
            subject:
              "Emergency Access Alert - Your Emergency Contacts Have Been Accessed",
            html: `
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                  <h1 style="color: #dc2626; margin: 0 0 10px 0; font-size: 24px;">
                    Emergency Access Alert
                  </h1>
                  <p style="margin: 0;">
                    Your guardian has accessed your emergency contact information.
                  </p>
                </div>
                
                <p>Hello ${userData.full_name},</p>
                
                <p>This is to notify you that your guardian <strong>${guardianName}</strong> has accessed your emergency contact information on ${formattedTimestamp} UTC.</p>
                
                <p><strong>Reason provided:</strong> ${emergencyNotes}</p>
                
                <p>All your emergency contacts have been notified of this access. If you believe this access was unauthorized, please contact us immediately.</p>
                
                <p style="margin-top: 30px; color: #6b7280;">
                  Best regards,<br>
                  The LegacyGuard Team
                </p>
              </body>
            `,
            text: `
Emergency Access Alert

Hello ${userData.full_name},

This is to notify you that your guardian ${guardianName} has accessed your emergency contact information on ${formattedTimestamp} UTC.

Reason provided: ${emergencyNotes}

All your emergency contacts have been notified of this access. If you believe this access was unauthorized, please contact us immediately.

Best regards,
The LegacyGuard Team
            `,
          }),
        });
      } catch (error) {
        console.error("Failed to send notification to user:", error);
      }
    }

    // Log the notification event
    await supabaseClient.from("notification_logs").insert({
      user_id: userId,
      type: "emergency_access",
      recipient_emails: emergencyContacts
        .filter((ec) => ec.contact.email)
        .map((ec) => ec.contact.email),
      metadata: {
        guardian_id: guardianId,
        guardian_name: guardianName,
        emergency_notes: emergencyNotes,
        email_results: emailResults,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        notificationsSent: emailResults.filter((r) => r.success).length,
        totalContacts: emergencyContacts.length,
        results: emailResults,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in send-emergency-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
