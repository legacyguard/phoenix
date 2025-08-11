import { describe, it, expect, beforeEach, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import { LifeMilestoneTriggers } from "@/services/LifeMilestoneTriggers";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe("Annual Review Service", () => {
  const mockUserId = "test-user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Review Identification", () => {
    it("should identify accounts that have never been reviewed", async () => {
      const mockProfile = {
        id: mockUserId,
        last_review_date: null,
        created_at: "2023-01-01",
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      } as Record<string, unknown>);

      const service = new LifeMilestoneTriggers(
        supabase as unknown as Record<string, unknown>,
      );
      const needsReview = await service.checkForAnnualReview(mockUserId);

      expect(needsReview).toBe(true);
    });

    it("should identify accounts needing annual review (> 365 days)", async () => {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      lastYear.setDate(lastYear.getDate() - 10); // 375 days ago

      const mockProfile = {
        id: mockUserId,
        last_review_date: lastYear.toISOString(),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      } as Record<string, unknown>);

      const service = new LifeMilestoneTriggers(
        supabase as unknown as Record<string, unknown>,
      );
      const needsReview = await service.checkForAnnualReview(mockUserId);

      expect(needsReview).toBe(true);
    });

    it("should not flag recent reviews (< 365 days)", async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const mockProfile = {
        id: mockUserId,
        last_review_date: sixMonthsAgo.toISOString(),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      } as Record<string, unknown>);

      const service = new LifeMilestoneTriggers(
        supabase as unknown as Record<string, unknown>,
      );
      const needsReview = await service.checkForAnnualReview(mockUserId);

      expect(needsReview).toBe(false);
    });
  });

  describe("Review Notifications", () => {
    it("should send notification for overdue review", async () => {
      const service = new LifeMilestoneTriggers(
        supabase as unknown as Record<string, unknown>,
      );
      const mockSendNotification = vi.spyOn(service, "sendReviewNotification");

      // Mock overdue profile
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: mockUserId,
                last_review_date: "2022-01-01",
                email: "test@example.com",
              },
              error: null,
            }),
          }),
        }),
      } as Record<string, unknown>);

      await service.checkAndNotifyAnnualReview(mockUserId);

      expect(mockSendNotification).toHaveBeenCalledWith(
        mockUserId,
        "test@example.com",
      );
    });
  });
});

describe("Life Event Checklist Generator", () => {
  const service = new LifeMilestoneTriggers(
    supabase as unknown as Record<string, unknown>,
  );

  describe("New Child Event", () => {
    it("should generate complete checklist for new child", () => {
      const checklist = service.generateLifeEventChecklist("new_child");

      expect(checklist).toBeDefined();
      expect(checklist.items).toContainEqual(
        expect.objectContaining({
          category: "legal",
          task: expect.stringContaining("guardian"),
        }),
      );
      expect(checklist.items).toContainEqual(
        expect.objectContaining({
          category: "financial",
          task: expect.stringContaining("beneficiary"),
        }),
      );
      expect(checklist.items).toContainEqual(
        expect.objectContaining({
          category: "documents",
          task: expect.stringContaining("birth certificate"),
        }),
      );
      expect(checklist.items.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("Marriage Event", () => {
    it("should generate complete checklist for marriage", () => {
      const checklist = service.generateLifeEventChecklist("marriage");

      expect(checklist).toBeDefined();
      expect(checklist.items).toContainEqual(
        expect.objectContaining({
          category: "legal",
          task: expect.stringContaining("will"),
        }),
      );
      expect(checklist.items).toContainEqual(
        expect.objectContaining({
          category: "financial",
          task: expect.stringContaining("account"),
        }),
      );
      expect(checklist.items).toContainEqual(
        expect.objectContaining({
          category: "insurance",
          task: expect.stringContaining("beneficiar"),
        }),
      );
    });
  });

  describe("Retirement Event", () => {
    it("should generate complete checklist for retirement", () => {
      const checklist = service.generateLifeEventChecklist("retirement");

      expect(checklist).toBeDefined();
      expect(checklist.items).toContainEqual(
        expect.objectContaining({
          category: "financial",
          task: expect.stringContaining("pension"),
        }),
      );
      expect(checklist.items).toContainEqual(
        expect.objectContaining({
          category: "healthcare",
          task: expect.stringContaining("Medicare"),
        }),
      );
      expect(checklist.items).toContainEqual(
        expect.objectContaining({
          category: "legal",
          task: expect.stringContaining("power of attorney"),
        }),
      );
    });
  });

  describe("New Job Event", () => {
    it("should generate complete checklist for new job", () => {
      const checklist = service.generateLifeEventChecklist("new_job");

      expect(checklist).toBeDefined();
      expect(checklist.items).toContainEqual(
        expect.objectContaining({
          category: "financial",
          task: expect.stringContaining("401k"),
        }),
      );
      expect(checklist.items).toContainEqual(
        expect.objectContaining({
          category: "insurance",
          task: expect.stringContaining("health insurance"),
        }),
      );
      expect(checklist.items).toContainEqual(
        expect.objectContaining({
          category: "benefits",
          task: expect.stringContaining("life insurance"),
        }),
      );
    });
  });

  describe("Divorce Event", () => {
    it("should generate complete checklist for divorce", () => {
      const checklist = service.generateLifeEventChecklist("divorce");

      expect(checklist).toBeDefined();
      expect(checklist.items).toContainEqual(
        expect.objectContaining({
          category: "legal",
          task: expect.stringContaining("will"),
        }),
      );
      expect(checklist.items).toContainEqual(
        expect.objectContaining({
          category: "financial",
          task: expect.stringContaining("beneficiar"),
        }),
      );
      expect(checklist.items).toContainEqual(
        expect.objectContaining({
          category: "access",
          task: expect.stringContaining("password"),
        }),
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle unknown life event types", () => {
      const checklist = service.generateLifeEventChecklist(
        "unknown_event" as string,
      );

      expect(checklist).toBeDefined();
      expect(checklist.items).toEqual([]);
    });

    it("should persist checklist to database", async () => {
      const mockInsert = vi
        .fn()
        .mockResolvedValue({ data: { id: "checklist-123" }, error: null });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as Record<string, unknown>);

      const testUserId = "test-user-123";
      await service.saveLifeEventChecklist(testUserId, "new_child");

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: testUserId,
          event_type: "new_child",
          checklist_items: expect.any(Array),
        }),
      );
    });
  });
});
