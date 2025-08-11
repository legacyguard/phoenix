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

// Type definitions
type AccessLevel = "none" | "emergency_only" | "limited_info" | "full_access";

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relationship: string;
  avatarUrl?: string;
  accessLevel: AccessLevel;
  preparednessScore: number;
  lastCommunicated: string;
  phone?: string;
  responsibilities?: string[];
}

interface FamilyHubResponse {
  overallScore: number;
  familyMembers: FamilyMember[];
  emergencyProtocolEnabled: boolean;
}

interface TrustedPerson {
  access_level?: AccessLevel;
  email?: string;
  phone?: string;
  responsibilities?: string[];
  last_communicated?: string;
  created_at?: string;
  id: string;
  name: string;
  relationship: string;
  avatar_url?: string;
  user_id: string;
}

// Helper function to calculate preparedness score for a trusted person
function calculatePreparednessScore(person: TrustedPerson): number {
  let score = 0;

  // Base score for being added as trusted person
  score += 20;

  // Access level scoring
  switch (person.access_level) {
    case "full_access":
      score += 30;
      break;
    case "limited_info":
      score += 20;
      break;
    case "emergency_only":
      score += 10;
      break;
    default:
      score += 0;
  }

  // Email verified
  if (person.email) score += 10;

  // Phone provided
  if (person.phone) score += 10;

  // Responsibilities defined
  if (person.responsibilities && person.responsibilities.length > 0) {
    score += Math.min(person.responsibilities.length * 5, 20);
  }

  // Recent communication (within 30 days)
  const daysSinceContact = person.last_communicated
    ? Math.floor(
        (Date.now() - new Date(person.last_communicated).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 365;

  if (daysSinceContact <= 7) score += 10;
  else if (daysSinceContact <= 30) score += 5;

  return Math.min(score, 100);
}

// GET endpoint for fetching family hub data
export async function GET(request: NextRequest) {
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

    // Fetch all trusted people for the user
    const { data: trustedPeople, error: fetchError } = await supabaseAdmin
      .from("trusted_people")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching trusted people:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch family members" },
        { status: 500 },
      );
    }

    // Fetch emergency protocol status from user profile
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("emergency_protocol_enabled")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
    }

    // Transform trusted people into family members with preparedness scores
    const familyMembers: FamilyMember[] = (trustedPeople || []).map(
      (person) => ({
        id: person.id,
        name: person.name,
        email: person.email,
        relationship: person.relationship,
        avatarUrl: person.avatar_url,
        accessLevel: person.access_level || "none",
        preparednessScore: calculatePreparednessScore(person),
        lastCommunicated: person.last_communicated || person.created_at,
        phone: person.phone,
        responsibilities: person.responsibilities || [],
      }),
    );

    // Calculate overall score
    const overallScore =
      familyMembers.length > 0
        ? Math.round(
            familyMembers.reduce(
              (sum, member) => sum + member.preparednessScore,
              0,
            ) / familyMembers.length,
          )
        : 0;

    const response: FamilyHubResponse = {
      overallScore,
      familyMembers,
      emergencyProtocolEnabled:
        userProfile?.emergency_protocol_enabled || false,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in family-hub GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT endpoint for updating family member access levels
export async function PUT(request: NextRequest) {
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

    const { personId, accessLevel } = await request.json();

    if (!personId || !accessLevel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate access level
    const validAccessLevels: AccessLevel[] = [
      "none",
      "emergency_only",
      "limited_info",
      "full_access",
    ];
    if (!validAccessLevels.includes(accessLevel)) {
      return NextResponse.json(
        { error: "Invalid access level" },
        { status: 400 },
      );
    }

    // Verify trusted person ownership
    const { data: existingPerson, error: checkError } = await supabaseAdmin
      .from("trusted_people")
      .select("id, name")
      .eq("id", personId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingPerson) {
      return NextResponse.json(
        { error: "Trusted person not found" },
        { status: 404 },
      );
    }

    // Update the access level
    const { data: updatedPerson, error: updateError } = await supabaseAdmin
      .from("trusted_people")
      .update({
        access_level: accessLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", personId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating access level:", updateError);
      return NextResponse.json(
        { error: "Failed to update access level" },
        { status: 500 },
      );
    }

    // Log the activity
    try {
      const ipAddress =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";

      await logActivity(
        user.id,
        "USER",
        "UPDATED_FAMILY_ACCESS",
        personId,
        ipAddress,
        userAgent,
        {
          personName: existingPerson.name,
          oldAccessLevel: existingPerson.access_level,
          newAccessLevel: accessLevel,
        },
      );
    } catch (logError) {
      console.error("Failed to log activity:", logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({ success: true, updatedPerson });
  } catch (error) {
    console.error("Error in family-hub PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST endpoint for sending updates to family members
export async function POST(request: NextRequest) {
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

    const { personId } = await request.json();

    if (!personId) {
      return NextResponse.json({ error: "Missing person ID" }, { status: 400 });
    }

    // Verify trusted person ownership
    const { data: trustedPerson, error: checkError } = await supabaseAdmin
      .from("trusted_people")
      .select("id, name, email")
      .eq("id", personId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !trustedPerson) {
      return NextResponse.json(
        { error: "Trusted person not found" },
        { status: 404 },
      );
    }

    // Update last_communicated timestamp
    const { error: updateError } = await supabaseAdmin
      .from("trusted_people")
      .update({
        last_communicated: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", personId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating last_communicated:", updateError);
      return NextResponse.json(
        { error: "Failed to update communication timestamp" },
        { status: 500 },
      );
    }

    // Placeholder for email sending
    await sendUpdateEmail(personId, trustedPerson);

    // Log the activity
    try {
      const ipAddress =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";

      await logActivity(
        user.id,
        "USER",
        "SENT_FAMILY_UPDATE",
        personId,
        ipAddress,
        userAgent,
        {
          personName: trustedPerson.name,
          personEmail: trustedPerson.email,
        },
      );
    } catch (logError) {
      console.error("Failed to log activity:", logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      message: `Update sent to ${trustedPerson.name}`,
    });
  } catch (error) {
    console.error("Error in family-hub POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Placeholder function for sending email updates
async function sendUpdateEmail(
  personId: string,
  trustedPerson: Pick<TrustedPerson, "name" | "email">,
) {
  // TODO: Implement actual email sending logic
  console.log(
    `[Email Update] Would send email to ${trustedPerson.name} (${trustedPerson.email}) - Person ID: ${personId}`,
  );

  // In the future, this would:
  // 1. Generate a personalized update email based on the person's access level
  // 2. Include relevant information they're allowed to see
  // 3. Send via email service (SendGrid, SES, etc.)
  // 4. Track email delivery status
}
