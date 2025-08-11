import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendMessage } from "@/services/notificationService";

// Initialize Supabase client with service role key for server-side operations
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

export async function POST(request: NextRequest) {
  try {
    const { contactId } = await request.json();
    if (!contactId) {
      return NextResponse.json(
        { error: "Missing contact ID" },
        { status: 400 },
      );
    }

    // Get contact details
    const { data: contact, error: contactError } = await supabaseAdmin
      .from("contacts")
      .select("name, email")
      .eq("id", contactId)
      .single();

    if (contactError || !contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Send test message
    await sendMessage(
      contact.email,
      `${contact.name}, this is a test of the emergency alert system.`,
    );

    return NextResponse.json({
      success: true,
      message: "Test message sent successfully.",
    });
  } catch (error) {
    console.error("Error in send-test POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
