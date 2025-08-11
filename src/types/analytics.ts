export interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  session_id: string;
  timestamp: Date;
  properties: Record<string, unknown>;
  emotional_context?: "frustrated" | "confused" | "satisfied" | "accomplished";
  user_journey_stage: "onboarding" | "setup" | "maintenance" | "family_prep";
}

export interface UserMetrics {
  onboarding_completion_rate: number;
  time_to_first_value: number; // minutes
  feature_adoption_rates: Record<string, number>;
  document_completion_percentage: number;
  family_preparedness_score: number;
}
