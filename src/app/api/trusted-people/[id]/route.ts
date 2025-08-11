import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logActivity } from "@/services/loggingService";

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

// PUT endpoint for updating a trusted person
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get the authenticated user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user token and verify
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 },
      );
    }

    const trustedPersonId = params.id;
    const updateData = await request.json();

    // Verify trusted person ownership
    const { data: existingPerson, error: checkError } = await supabaseAdmin
      .from("trusted_people")
      .select("id, name")
      .eq("id", trustedPersonId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingPerson) {
      return NextResponse.json(
        { error: "Trusted person not found" },
        { status: 404 },
      );
    }

    // Update the trusted person
    const { data: updatedPerson, error: updateError } = await supabaseAdmin
      .from("trusted_people")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", trustedPersonId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating trusted person:", updateError);
      return NextResponse.json(
        { error: "Failed to update trusted person" },
        { status: 500 },
      );
    }

    // Log the trusted person update activity
    try {
      const ipAddress =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";

      await logActivity(
        user.id,
        "USER",
        "UPDATED_TRUSTED_PERSON",
        trustedPersonId,
        ipAddress,
        userAgent,
        {
          personName: updatedPerson.name,
          personRole: updatedPerson.role,
          updatedFields: Object.keys(updateData),
          responsibilities: updateData.responsibilities || [],
          preparedness: updateData.preparedness_level,
        },
      );
    } catch (logError) {
      console.error("Failed to log activity:", logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({ trustedPerson: updatedPerson });
  } catch (error) {
    console.error("Error updating trusted person:", error);
    return NextResponse.json(
      { error: "Failed to update trusted person" },
      { status: 500 },
    );
  }
}

// GET endpoint for viewing a trusted person
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get the authenticated user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user token and verify
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 },
      );
    }

    const trustedPersonId = params.id;

    // Fetch the trusted person
    const { data: trustedPerson, error: fetchError } = await supabaseAdmin
      .from("trusted_people")
      .select("*")
      .eq("id", trustedPersonId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !trustedPerson) {
      return NextResponse.json(
        { error: "Trusted person not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ trustedPerson });
  } catch (error) {
    console.error("Error fetching trusted person:", error);
    return NextResponse.json(
      { error: "Failed to fetch trusted person" },
      { status: 500 },
    );
  }
}
