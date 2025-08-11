import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's trusted people count
    const { data: trustedPeople, error: trustedPeopleError } = await supabase
      .from("trusted_people")
      .select("id")
      .eq("user_id", user.id);

    if (trustedPeopleError || !trustedPeople) {
      return NextResponse.json(
        { error: "Failed to fetch trusted people" },
        { status: 500 },
      );
    }

    // Check if premium is required
    if (trustedPeople.length >= 3) {
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("subscription_status")
        .eq("id", user.id)
        .single();

      if (
        profileError ||
        !profile ||
        profile.subscription_status !== "premium"
      ) {
        return NextResponse.json(
          {
            error: "Limit reached: Upgrade to add more than 3 trusted people.",
            requiresPayment: true,
          },
          { status: 402 },
        );
      }
    }

    // Extract and validate request body
    const newPerson = await req.json();
    if (!newPerson || !newPerson.name) {
      return NextResponse.json(
        { error: "Invalid request: Missing required fields" },
        { status: 400 },
      );
    }

    // Insert new trusted person
    const { data: insertedPerson, error: insertError } = await supabase
      .from("trusted_people")
      .insert({ ...newPerson, user_id: user.id })
      .select()
      .single();

    if (insertError || !insertedPerson) {
      console.error("Error inserting new trusted person:", insertError);
      return NextResponse.json(
        { error: "Failed to add trusted person" },
        { status: 500 },
      );
    }

    return NextResponse.json({ trustedPerson: insertedPerson });
  } catch (error) {
    console.error("Error adding trusted person:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
