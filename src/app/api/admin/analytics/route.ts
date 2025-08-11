// src/app/api/admin/analytics/route.ts

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";

// Helper function to check if user is admin
async function isAdmin(supabase: SupabaseClient): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // Check if user has admin role in user_metadata or a separate admin table
  // This is a simplified check - in production, you'd have a proper admin role system
  const isAdminUser =
    user.email?.endsWith("@legacyguard.com") ||
    user.user_metadata?.role === "admin";

  return isAdminUser;
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    // Check admin authorization
    if (!(await isAdmin(supabase))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch analytics data from database
    const analytics = await getAnalyticsData(supabase);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function getAnalyticsData(supabase: SupabaseClient) {
  // Parallel fetch all analytics data
  const [
    totalUsers,
    activeUsers,
    userJourney,
    featureAdoption,
    preparednessStats,
    abTestResults,
    userSegments,
    timeSeriesData,
  ] = await Promise.all([
    getTotalUsers(supabase),
    getActiveUsers(supabase),
    getUserJourneyStats(supabase),
    getFeatureAdoptionStats(supabase),
    getPreparednessStats(supabase),
    getABTestResults(),
    getUserSegments(supabase),
    getTimeSeriesData(),
  ]);

  return {
    overview: {
      totalUsers,
      activeUsers,
      avgSessionDuration: "14:32", // Would calculate from session data
      bounceRate: 23.5, // Would calculate from session data
    },
    userJourney,
    featureAdoption,
    preparednessStats,
    abTestResults,
    userSegments,
    timeSeriesData,
  };
}

async function getTotalUsers(supabase: SupabaseClient): Promise<number> {
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return count || 0;
}

async function getActiveUsers(supabase: SupabaseClient): Promise<number> {
  // Users active in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("last_active", thirtyDaysAgo.toISOString());

  return count || 0;
}

async function getUserJourneyStats(supabase: SupabaseClient) {
  const { data: users } = await supabase
    .from("profiles")
    .select("onboarding_completed, created_at");

  const total = users?.length || 0;
  const onboardingCompleted =
    users?.filter((u) => u.onboarding_completed).length || 0;

  // Get users with possessions
  const { count: withPossessions } = await supabase
    .from("possessions")
    .select("user_id", { count: "exact", head: true })
    .limit(1);

  // Get users with trusted people
  const { count: withTrustedPeople } = await supabase
    .from("trusted_people")
    .select("user_id", { count: "exact", head: true })
    .limit(1);

  // Get users with documents
  const { count: withDocuments } = await supabase
    .from("documents")
    .select("user_id", { count: "exact", head: true })
    .limit(1);

  // Get users with wills
  const { count: withWills } = await supabase
    .from("wills")
    .select("user_id", { count: "exact", head: true })
    .limit(1);

  return {
    onboardingCompletionRate: Math.round((onboardingCompleted / total) * 100),
    firstPossessionAdded: Math.round(((withPossessions || 0) / total) * 100),
    firstTrustedPersonAdded: Math.round(
      ((withTrustedPeople || 0) / total) * 100,
    ),
    firstDocumentUploaded: Math.round(((withDocuments || 0) / total) * 100),
    willGenerated: Math.round(((withWills || 0) / total) * 100),
  };
}

async function getFeatureAdoptionStats(supabase: SupabaseClient) {
  const { data: users } = await supabase
    .from("profiles")
    .select("privacy_mode, push_notifications_enabled");

  const total = users?.length || 0;
  const localOnlyMode =
    users?.filter((u) => u.privacy_mode === "local").length || 0;
  const pushEnabled =
    users?.filter((u) => u.push_notifications_enabled).length || 0;

  // These would come from actual feature usage tracking
  return {
    localOnlyModeUsers: Math.round((localOnlyMode / total) * 100),
    familyHubUsers: 45, // Placeholder
    documentScannerUsers: 72, // Placeholder
    emergencyAccessSetup: 38, // Placeholder
    pushNotificationsEnabled: Math.round((pushEnabled / total) * 100),
  };
}

async function getPreparednessStats(supabase: SupabaseClient) {
  // Get average preparedness score
  const { data: scores } = await supabase
    .from("profiles")
    .select("preparedness_score");

  const avgScore =
    scores?.reduce((sum, s) => sum + (s.preparedness_score || 0), 0) /
    (scores?.length || 1);

  // Get will creation percentage
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: usersWithWills } = await supabase
    .from("wills")
    .select("user_id", { count: "exact", head: true })
    .limit(1);

  // Get average documents per user
  const { count: totalDocs } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true });

  // Get average trusted people per user
  const { count: totalTrusted } = await supabase
    .from("trusted_people")
    .select("*", { count: "exact", head: true });

  return {
    averageOverallScore: Math.round(avgScore),
    willsCreated: Math.round(((usersWithWills || 0) / (totalUsers || 1)) * 100),
    documentsUploaded:
      Math.round(((totalDocs || 0) / (totalUsers || 1)) * 10) / 10,
    trustedPeopleAdded:
      Math.round(((totalTrusted || 0) / (totalUsers || 1)) * 10) / 10,
  };
}

async function getABTestResults() {
  // This would fetch from an experiments table
  // For now, returning mock data
  return [
    {
      testName: "Dashboard Title Experiment",
      controlConversion: 12.5,
      variationConversion: 14.8,
      winner: "Variation",
      confidence: 97,
      sampleSize: 5430,
      duration: 14,
    },
    {
      testName: "Onboarding Flow Simplification",
      controlConversion: 41.2,
      variationConversion: 52.7,
      winner: "Variation",
      confidence: 99.2,
      sampleSize: 3210,
      duration: 21,
    },
  ];
}

async function getUserSegments(supabase: SupabaseClient) {
  const { data: users } = await supabase
    .from("profiles")
    .select("last_active, preparedness_score");

  const total = users?.length || 0;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  let highlyEngaged = 0;
  let moderatelyEngaged = 0;
  let atRisk = 0;
  let dormant = 0;

  users?.forEach((user) => {
    const lastActive = new Date(user.last_active);
    const score = user.preparedness_score || 0;

    if (lastActive > thirtyDaysAgo && score > 80) {
      highlyEngaged++;
    } else if (lastActive > thirtyDaysAgo && score >= 40) {
      moderatelyEngaged++;
    } else if (lastActive > ninetyDaysAgo) {
      atRisk++;
    } else {
      dormant++;
    }
  });

  return [
    {
      segment: "Highly Engaged",
      percentage: Math.round((highlyEngaged / total) * 100),
      description: "Login weekly, >80% preparedness",
    },
    {
      segment: "Moderately Engaged",
      percentage: Math.round((moderatelyEngaged / total) * 100),
      description: "Login monthly, 40-80% preparedness",
    },
    {
      segment: "At Risk",
      percentage: Math.round((atRisk / total) * 100),
      description: "Haven't logged in >30 days",
    },
    {
      segment: "Dormant",
      percentage: Math.round((dormant / total) * 100),
      description: "No activity >90 days",
    },
  ];
}

async function getTimeSeriesData() {
  // This would aggregate user activity by month
  // For now, returning mock data
  return [
    { date: "2024-01", activeUsers: 5234, newUsers: 892 },
    { date: "2024-02", activeUsers: 6122, newUsers: 1203 },
    { date: "2024-03", activeUsers: 7234, newUsers: 1567 },
    { date: "2024-04", activeUsers: 8122, newUsers: 1832 },
    { date: "2024-05", activeUsers: 8932, newUsers: 1623 },
    { date: "2024-06", activeUsers: 8432, newUsers: 1402 },
  ];
}
