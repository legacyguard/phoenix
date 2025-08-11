import { describe, it, expect, vi, beforeEach } from "vitest";
import { analytics } from "../analytics";

// Mock the analytics singleton
vi.mock("../analytics", () => ({
  analytics: {
    track: vi.fn(),
    trackOnboardingStep: vi.fn(),
    trackDocumentAction: vi.fn(),
    trackFamilyAction: vi.fn(),
    trackEmotionalMilestone: vi.fn(),
    trackFeatureUsage: vi.fn(),
    getUserMetrics: vi.fn(),
    setConsent: vi.fn(),
    startNewSession: vi.fn(),
    endSession: vi.fn(),
  },
}));

describe("Analytics Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should track events", async () => {
    await analytics.track("test_event", { test: "data" });

    expect(analytics.track).toHaveBeenCalledWith("test_event", {
      test: "data",
    });
  });

  it("should track onboarding steps", async () => {
    await analytics.trackOnboardingStep("step1", true);

    expect(analytics.trackOnboardingStep).toHaveBeenCalledWith("step1", true);
  });

  it("should track document actions", async () => {
    await analytics.trackDocumentAction("uploaded", "will");

    expect(analytics.trackDocumentAction).toHaveBeenCalledWith(
      "uploaded",
      "will",
    );
  });

  it("should track family actions", async () => {
    await analytics.trackFamilyAction("guardian_added");

    expect(analytics.trackFamilyAction).toHaveBeenCalledWith("guardian_added");
  });

  it("should track emotional milestones", async () => {
    await analytics.trackEmotionalMilestone("first_peace_of_mind");

    expect(analytics.trackEmotionalMilestone).toHaveBeenCalledWith(
      "first_peace_of_mind",
    );
  });

  it("should track feature usage", async () => {
    await analytics.trackFeatureUsage("ai_suggestions", true);

    expect(analytics.trackFeatureUsage).toHaveBeenCalledWith(
      "ai_suggestions",
      true,
    );
  });

  it("should get user metrics", async () => {
    const mockMetrics = {
      onboarding_completion_rate: 80,
      time_to_first_value: 30,
      feature_adoption_rates: { ai_suggestions: 100 },
      document_completion_percentage: 75,
      family_preparedness_score: 90,
    };

    analytics.getUserMetrics.mockResolvedValue(mockMetrics);

    const result = await analytics.getUserMetrics("user123");

    expect(analytics.getUserMetrics).toHaveBeenCalledWith("user123");
    expect(result).toEqual(mockMetrics);
  });

  it("should set consent", () => {
    analytics.setConsent(true);

    expect(analytics.setConsent).toHaveBeenCalledWith(true);
  });

  it("should start new session", () => {
    analytics.startNewSession();

    expect(analytics.startNewSession).toHaveBeenCalled();
  });

  it("should end session", () => {
    analytics.endSession();

    expect(analytics.endSession).toHaveBeenCalled();
  });
});
