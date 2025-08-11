/**
 * Test Suite for Professional Progress Service
 * Tests non-gamified progress tracking functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ProfessionalProgressService } from "@/services/ProfessionalProgressService";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("ProfessionalProgressService", () => {
  const mockUserId = "test-user-123";

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getSecurityAreas", () => {
    it("should return all 9 security areas", async () => {
      // Mock Supabase responses
      const mockProfile = {
        has_will: true,
        has_executor: true,
        has_beneficiaries: false,
        has_emergency_contacts: true,
        has_legacy_letters: false,
        will_updated_at: "2023-01-01",
      };

      const mockDocuments = [
        {
          category: "identity",
          created_at: "2023-01-01",
          updated_at: "2023-01-02",
        },
        {
          category: "insurance",
          created_at: "2023-02-01",
          updated_at: "2023-02-02",
        },
      ];

      const mockAssets = [
        {
          type: "bank_account",
          created_at: "2023-03-01",
          updated_at: "2023-03-02",
        },
        {
          type: "real_estate",
          created_at: "2023-04-01",
          updated_at: "2023-04-02",
        },
      ];

      const mockFamilyMembers = [
        { relationship: "spouse", created_at: "2023-05-01" },
        { relationship: "child", created_at: "2023-05-02" },
      ];

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi
                  .fn()
                  .mockResolvedValue({ data: mockProfile, error: null }),
              }),
            }),
          } as any;
        }
        if (table === "documents") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi
                .fn()
                .mockResolvedValue({ data: mockDocuments, error: null }),
            }),
          } as any;
        }
        if (table === "assets") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockAssets, error: null }),
            }),
          } as any;
        }
        if (table === "family_members") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi
                .fn()
                .mockResolvedValue({ data: mockFamilyMembers, error: null }),
            }),
          } as any;
        }
        return {} as any;
      });

      const areas =
        await ProfessionalProgressService.getSecurityAreas(mockUserId);

      expect(areas).toHaveLength(9);
      expect(areas.map((a) => a.id)).toContain("identity_documents");
      expect(areas.map((a) => a.id)).toContain("financial_records");
      expect(areas.map((a) => a.id)).toContain("estate_planning");
      expect(areas.map((a) => a.id)).toContain("insurance_policies");
      expect(areas.map((a) => a.id)).toContain("property_assets");
      expect(areas.map((a) => a.id)).toContain("family_circle");
      expect(areas.map((a) => a.id)).toContain("medical_directives");
      expect(areas.map((a) => a.id)).toContain("digital_assets");
      expect(areas.map((a) => a.id)).toContain("legacy_messages");
    });

    it("should correctly determine area status based on data", async () => {
      const mockProfile = { has_will: false };
      const mockDocuments = [
        { category: "identity", created_at: "2023-01-01" },
      ];
      const mockAssets: any[] = [];
      const mockFamilyMembers: any[] = [];

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi
                  .fn()
                  .mockResolvedValue({ data: mockProfile, error: null }),
              }),
            }),
          } as any;
        }
        if (table === "documents") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi
                .fn()
                .mockResolvedValue({ data: mockDocuments, error: null }),
            }),
          } as any;
        }
        if (table === "assets") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockAssets, error: null }),
            }),
          } as any;
        }
        if (table === "family_members") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi
                .fn()
                .mockResolvedValue({ data: mockFamilyMembers, error: null }),
            }),
          } as any;
        }
        return {} as any;
      });

      const areas =
        await ProfessionalProgressService.getSecurityAreas(mockUserId);

      const identityArea = areas.find((a) => a.id === "identity_documents");
      const financialArea = areas.find((a) => a.id === "financial_records");
      const estateArea = areas.find((a) => a.id === "estate_planning");

      expect(identityArea?.status).toBe("in_progress"); // Has 1 document
      expect(financialArea?.status).toBe("not_started"); // No assets
      expect(estateArea?.status).toBe("not_started"); // No will
      expect(estateArea?.priority).toBe("urgent"); // No will should be urgent
    });

    it("should detect when documents need review (older than 1 year)", async () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const mockDocuments = [
        {
          category: "identity",
          created_at: twoYearsAgo.toISOString(),
          updated_at: twoYearsAgo.toISOString(),
        },
      ];

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: {}, error: null }),
              }),
            }),
          } as any;
        }
        if (table === "documents") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi
                .fn()
                .mockResolvedValue({ data: mockDocuments, error: null }),
            }),
          } as any;
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        } as any;
      });

      const areas =
        await ProfessionalProgressService.getSecurityAreas(mockUserId);
      const identityArea = areas.find((a) => a.id === "identity_documents");

      expect(identityArea?.reviewNeeded).toBe(true);
    });
  });

  describe("calculateMetrics", () => {
    it("should calculate correct metrics from security areas", () => {
      const mockAreas = [
        {
          id: "1",
          status: "complete" as const,
          priority: "low" as const,
          reviewNeeded: false,
          estimatedTime: "10 minutes",
          lastUpdated: "2023-01-01",
        },
        {
          id: "2",
          status: "in_progress" as const,
          priority: "high" as const,
          reviewNeeded: false,
          estimatedTime: "20 minutes",
          lastUpdated: "2023-02-01",
        },
        {
          id: "3",
          status: "not_started" as const,
          priority: "urgent" as const,
          reviewNeeded: false,
          estimatedTime: "30 minutes",
          lastUpdated: null,
        },
        {
          id: "4",
          status: "complete" as const,
          priority: "medium" as const,
          reviewNeeded: true,
          estimatedTime: "15 minutes",
          lastUpdated: "2023-03-01",
        },
      ];

      const metrics = ProfessionalProgressService.calculateMetrics(
        mockAreas as any,
      );

      expect(metrics.totalAreas).toBe(4);
      expect(metrics.completedAreas).toBe(2);
      expect(metrics.inProgressAreas).toBe(1);
      expect(metrics.needsReviewCount).toBe(1);
      expect(metrics.urgentActionsCount).toBe(1);
      expect(metrics.estimatedTimeToComplete).toBe("50 minutes"); // 20 + 30 minutes
      expect(metrics.lastActivityDate).toBe("2023-03-01");
    });

    it("should format estimated time correctly for hours and minutes", () => {
      const mockAreas = [
        {
          id: "1",
          status: "not_started" as const,
          priority: "low" as const,
          reviewNeeded: false,
          estimatedTime: "45 minutes",
          lastUpdated: null,
        },
        {
          id: "2",
          status: "not_started" as const,
          priority: "low" as const,
          reviewNeeded: false,
          estimatedTime: "90 minutes",
          lastUpdated: null,
        },
      ];

      const metrics = ProfessionalProgressService.calculateMetrics(
        mockAreas as any,
      );
      expect(metrics.estimatedTimeToComplete).toBe("2 hours 15 minutes");
    });
  });

  describe("determineReadinessLevel", () => {
    it('should return "initial" for 0-30% completion', () => {
      const metrics = {
        totalAreas: 10,
        completedAreas: 2, // 20%
        needsReviewCount: 0,
      };

      const level = ProfessionalProgressService.determineReadinessLevel(
        metrics as any,
      );

      expect(level.level).toBe("initial");
      expect(level.label).toBe("Initial Setup");
      expect(level.color).toBe("orange");
    });

    it('should return "developing" for 30-60% completion', () => {
      const metrics = {
        totalAreas: 10,
        completedAreas: 5, // 50%
        needsReviewCount: 0,
      };

      const level = ProfessionalProgressService.determineReadinessLevel(
        metrics as any,
      );

      expect(level.level).toBe("developing");
      expect(level.label).toBe("Developing");
      expect(level.color).toBe("yellow");
    });

    it('should return "established" for 60-80% completion', () => {
      const metrics = {
        totalAreas: 10,
        completedAreas: 7, // 70%
        needsReviewCount: 0,
      };

      const level = ProfessionalProgressService.determineReadinessLevel(
        metrics as any,
      );

      expect(level.level).toBe("established");
      expect(level.label).toBe("Established");
      expect(level.color).toBe("indigo");
    });

    it('should return "comprehensive" for 80-99% completion', () => {
      const metrics = {
        totalAreas: 10,
        completedAreas: 9, // 90%
        needsReviewCount: 0,
      };

      const level = ProfessionalProgressService.determineReadinessLevel(
        metrics as any,
      );

      expect(level.level).toBe("comprehensive");
      expect(level.label).toBe("Comprehensive");
      expect(level.color).toBe("blue");
    });

    it('should return "maintained" for 100% completion with no reviews needed', () => {
      const metrics = {
        totalAreas: 10,
        completedAreas: 10, // 100%
        needsReviewCount: 0,
      };

      const level = ProfessionalProgressService.determineReadinessLevel(
        metrics as any,
      );

      expect(level.level).toBe("maintained");
      expect(level.label).toBe("Fully Maintained");
      expect(level.color).toBe("green");
    });

    it('should not return "maintained" if reviews are needed', () => {
      const metrics = {
        totalAreas: 10,
        completedAreas: 10, // 100%
        needsReviewCount: 2, // But reviews needed
      };

      const level = ProfessionalProgressService.determineReadinessLevel(
        metrics as any,
      );

      expect(level.level).toBe("comprehensive"); // Not maintained due to reviews
      expect(level.label).toBe("Comprehensive");
    });
  });

  describe("generateRecommendations", () => {
    it("should prioritize urgent incomplete areas first", async () => {
      const mockAreas = [
        {
          id: "urgent1",
          name: "Estate Planning",
          status: "not_started" as const,
          priority: "urgent" as const,
          reviewNeeded: false,
          estimatedTime: "45 minutes",
          actionUrl: "/estate",
          description: "Will and trust documents",
        },
        {
          id: "low1",
          name: "Digital Assets",
          status: "not_started" as const,
          priority: "low" as const,
          reviewNeeded: false,
          estimatedTime: "30 minutes",
          actionUrl: "/digital",
          description: "Online accounts",
        },
      ];

      const metrics = {
        completedAreas: 0,
        nextReviewDate: null,
      };

      const recommendations =
        await ProfessionalProgressService.generateRecommendations(
          mockUserId,
          mockAreas as any,
          metrics as any,
        );

      expect(recommendations[0].priority).toBe("urgent");
      expect(recommendations[0].type).toBe("action");
      expect(recommendations[0].title).toContain("Estate Planning");
    });

    it("should include review recommendations for areas needing review", async () => {
      const mockAreas = [
        {
          id: "review1",
          name: "Identity Documents",
          status: "complete" as const,
          priority: "low" as const,
          reviewNeeded: true,
          estimatedTime: "10 minutes",
          actionUrl: "/documents",
          description: "ID documents",
        },
      ];

      const metrics = {
        completedAreas: 1,
        nextReviewDate: null,
      };

      const recommendations =
        await ProfessionalProgressService.generateRecommendations(
          mockUserId,
          mockAreas as any,
          metrics as any,
        );

      const reviewRec = recommendations.find((r) => r.type === "review");
      expect(reviewRec).toBeDefined();
      expect(reviewRec?.title).toContain("Review");
      expect(reviewRec?.title).toContain("Identity Documents");
    });

    it("should suggest professional consultation for comprehensive plans", async () => {
      const mockAreas = [];
      const metrics = {
        completedAreas: 7, // Many areas complete
        nextReviewDate: null,
      };

      const recommendations =
        await ProfessionalProgressService.generateRecommendations(
          mockUserId,
          mockAreas as any,
          metrics as any,
        );

      const consultationRec = recommendations.find(
        (r) => r.type === "consultation",
      );
      expect(consultationRec).toBeDefined();
      expect(consultationRec?.title).toContain("Professional Review");
    });

    it("should limit recommendations to top 5", async () => {
      const mockAreas = Array.from({ length: 10 }, (_, i) => ({
        id: `area${i}`,
        name: `Area ${i}`,
        status: "not_started" as const,
        priority: "high" as const,
        reviewNeeded: false,
        estimatedTime: "10 minutes",
        actionUrl: `/area${i}`,
        description: `Description ${i}`,
      }));

      const metrics = {
        completedAreas: 0,
        nextReviewDate: null,
      };

      const recommendations =
        await ProfessionalProgressService.generateRecommendations(
          mockUserId,
          mockAreas as any,
          metrics as any,
        );

      expect(recommendations.length).toBeLessThanOrEqual(5);
    });
  });

  describe("getActivityTimeline", () => {
    it("should return timeline events sorted by date", async () => {
      const mockDocuments = [
        {
          id: "doc1",
          category: "identity",
          created_at: "2023-03-01T10:00:00Z",
          updated_at: "2023-03-01T10:00:00Z",
        },
        {
          id: "doc2",
          category: "insurance",
          created_at: "2023-03-02T10:00:00Z",
          updated_at: "2023-03-03T10:00:00Z",
        },
      ];

      const mockAssets = [
        {
          id: "asset1",
          type: "bank_account",
          name: "Main Checking",
          created_at: "2023-03-04T10:00:00Z",
          updated_at: "2023-03-04T10:00:00Z",
        },
      ];

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === "documents") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi
                    .fn()
                    .mockResolvedValue({ data: mockDocuments, error: null }),
                }),
              }),
            }),
          } as any;
        }
        if (table === "assets") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi
                    .fn()
                    .mockResolvedValue({ data: mockAssets, error: null }),
                }),
              }),
            }),
          } as any;
        }
        return {} as any;
      });

      const timeline = await ProfessionalProgressService.getActivityTimeline(
        mockUserId,
        10,
      );

      expect(timeline).toHaveLength(3);
      expect(timeline[0].date).toBe("2023-03-04T10:00:00Z"); // Most recent first
      expect(timeline[0].area).toBe("Assets");
      expect(timeline[1].type).toBe("updated"); // Doc2 was updated
      expect(timeline[2].type).toBe("completed"); // Doc1 was just created
    });
  });

  describe("helper methods", () => {
    it("should calculate completion percentage correctly", () => {
      const metrics = {
        totalAreas: 8,
        completedAreas: 3,
      };

      const percentage = ProfessionalProgressService.getCompletionPercentage(
        metrics as any,
      );
      expect(percentage).toBe(38); // 3/8 = 37.5, rounded to 38
    });

    it("should detect when immediate attention is needed", () => {
      const metricsNoAttention = {
        urgentActionsCount: 0,
        needsReviewCount: 1,
      };

      const metricsNeedAttention = {
        urgentActionsCount: 1,
        needsReviewCount: 0,
      };

      const metricsMultipleReviews = {
        urgentActionsCount: 0,
        needsReviewCount: 3,
      };

      expect(
        ProfessionalProgressService.needsImmediateAttention(
          metricsNoAttention as any,
        ),
      ).toBe(false);
      expect(
        ProfessionalProgressService.needsImmediateAttention(
          metricsNeedAttention as any,
        ),
      ).toBe(true);
      expect(
        ProfessionalProgressService.needsImmediateAttention(
          metricsMultipleReviews as any,
        ),
      ).toBe(true);
    });

    it("should get next priority action from recommendations", () => {
      const recommendations = [
        { priority: "low" as const, title: "Low priority" },
        { priority: "high" as const, title: "High priority" },
        { priority: "urgent" as const, title: "Urgent priority" },
        { priority: "medium" as const, title: "Medium priority" },
      ];

      const next = ProfessionalProgressService.getNextPriorityAction(
        recommendations as any,
      );
      expect(next?.title).toBe("Urgent priority");

      const noUrgent = recommendations.filter((r) => r.priority !== "urgent");
      const nextNoUrgent = ProfessionalProgressService.getNextPriorityAction(
        noUrgent as any,
      );
      expect(nextNoUrgent?.title).toBe("High priority");
    });

    it("should store and retrieve area review dates", async () => {
      const areaId = "test-area";

      await ProfessionalProgressService.markAreaReviewed(mockUserId, areaId);

      const stored = localStorage.getItem(
        `area_reviewed_${mockUserId}_${areaId}`,
      );
      expect(stored).toBeDefined();

      const date = new Date(stored!);
      const now = new Date();
      expect(date.toDateString()).toBe(now.toDateString());
    });
  });
});
