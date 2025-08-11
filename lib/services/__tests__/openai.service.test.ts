import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { openAIService } from "../openai.service";
import { OPENAI_CONFIG } from "../openai.config";
import documentAnalysisFixtures from "./fixtures/documentAnalysis.json";
import lifeQuestionsFixtures from "./fixtures/lifeQuestions.json";
import type { UserProfile, UserContext } from "../openai.types";

// Mock OpenAI
vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    })),
  };
});

describe("OpenAI Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    openAIService.clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Configuration", () => {
    it("should have valid configuration", () => {
      expect(OPENAI_CONFIG.models.simple).toBe("gpt-3.5-turbo");
      expect(OPENAI_CONFIG.models.complex).toBe("gpt-4-turbo-preview");
      expect(OPENAI_CONFIG.models.vision).toBe("gpt-4-vision-preview");
    });

    it("should have rate limits configured", () => {
      expect(OPENAI_CONFIG.rateLimits.requestsPerMinute).toBe(20);
      expect(OPENAI_CONFIG.rateLimits.requestsPerHour).toBe(100);
      expect(OPENAI_CONFIG.rateLimits.requestsPerDay).toBe(1000);
    });

    it("should have retry configuration", () => {
      expect(OPENAI_CONFIG.retry.maxAttempts).toBe(3);
      expect(OPENAI_CONFIG.retry.initialDelay).toBe(1000);
      expect(OPENAI_CONFIG.retry.backoffMultiplier).toBe(2);
    });
  });

  describe("Document Analysis", () => {
    it("should analyze insurance document successfully", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify(documentAnalysisFixtures.insurance),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 200,
          total_tokens: 300,
        },
      };

      // Mock the OpenAI response
      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (openAIService as Record<string, unknown>).client = {
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      };

      const result = await openAIService.analyzeDocument("mock-base64-image");

      expect(result.success).toBe(true);
      expect(result.data?.type).toBe("insurance");
      expect(result.data?.confidence).toBe(0.95);
      expect(result.data?.extractedData.amount).toBe(500000);
      expect(result.usage?.total).toBe(300);
    });

    it("should handle analysis errors gracefully", async () => {
      const mockError = new Error("API Error");
      const mockCreate = vi.fn().mockRejectedValue(mockError);
      (openAIService as Record<string, unknown>).client = {
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      };

      const result = await openAIService.analyzeDocument("mock-base64-image");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("unknown");
    });

    it("should use cache for repeated requests", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify(documentAnalysisFixtures.insurance),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 200,
          total_tokens: 300,
        },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (openAIService as Record<string, unknown>).client = {
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      };

      // First request
      const result1 = await openAIService.analyzeDocument("mock-base64-image");
      expect(result1.cached).toBe(false);

      // Second request (should be cached)
      const result2 = await openAIService.analyzeDocument("mock-base64-image");
      expect(result2.cached).toBe(true);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe("Life Question Generation", () => {
    it("should generate life questions successfully", async () => {
      const mockProfile: UserProfile = {
        id: "user-123",
        name: "John Doe",
        age: 45,
        familyMembers: 3,
        documentsCount: 5,
        preferences: {
          communicationStyle: "empathetic",
        },
      };

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify(lifeQuestionsFixtures.familyQuestions[0]),
            },
          },
        ],
        usage: {
          prompt_tokens: 80,
          completion_tokens: 150,
          total_tokens: 230,
        },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (openAIService as Record<string, unknown>).client = {
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      };

      const result = await openAIService.generateLifeQuestion(mockProfile);

      expect(result.success).toBe(true);
      expect(result.data?.category).toBe("family");
      expect(result.data?.priority).toBe("high");
      expect(result.data?.estimatedTimeMinutes).toBe(15);
    });
  });

  describe("Action Suggestions", () => {
    it("should suggest next actions based on context", async () => {
      const mockContext: UserContext = {
        currentPage: "documents",
        recentActions: ["uploaded_will", "viewed_checklist"],
        documentsUploaded: 3,
        completionPercentage: 45,
        mood: "motivated",
      };

      const mockSuggestion = {
        id: "suggestion-001",
        action: "Upload your insurance documents",
        reason:
          "You've made great progress with your will. Adding insurance documents will help protect your family's financial future.",
        priority: "soon" as const,
        estimatedTime: "10 minutes",
        encouragement:
          "You're doing wonderfully! Each document you add brings more peace of mind.",
      };

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify(mockSuggestion),
            },
          },
        ],
        usage: {
          prompt_tokens: 90,
          completion_tokens: 120,
          total_tokens: 210,
        },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (openAIService as Record<string, unknown>).client = {
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      };

      const result = await openAIService.suggestNextAction(mockContext);

      expect(result.success).toBe(true);
      expect(result.data?.action).toBe("Upload your insurance documents");
      expect(result.data?.priority).toBe("soon");
      expect(result.data?.encouragement).toBeTruthy();
    });
  });

  describe("Empathetic Message Generation", () => {
    it("should generate supportive messages", async () => {
      const scenario = "User completed their will";
      const tone = "celebratory" as const;

      const mockResponse = {
        choices: [
          {
            message: {
              content:
                "Congratulations on completing your will! This is a profound act of love for your family. You've taken an important step in protecting those you care about most.",
            },
          },
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 40,
          total_tokens: 90,
        },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (openAIService as Record<string, unknown>).client = {
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      };

      const result = await openAIService.generateEmpatheticMessage(
        scenario,
        tone,
      );

      expect(result.success).toBe(true);
      expect(result.data).toContain("Congratulations");
      expect(result.data).toContain("love");
      expect(result.usage?.total).toBe(90);
    });
  });

  describe("Rate Limiting", () => {
    it("should respect rate limits", async () => {
      // Mock rate limiter to return false
      const rateLimiter = (openAIService as Record<string, unknown>)
        .rateLimiter;
      vi.spyOn(rateLimiter, "canMakeRequest").mockReturnValue(false);

      const result = await openAIService.analyzeDocument("mock-base64-image");

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("rate_limit");
      expect(result.error?.retryable).toBe(true);
    });
  });

  describe("Token Usage and Cost Calculation", () => {
    it("should calculate costs correctly", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ message: "test" }),
            },
          },
        ],
        usage: {
          prompt_tokens: 1000,
          completion_tokens: 500,
          total_tokens: 1500,
        },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (openAIService as Record<string, unknown>).client = {
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      };

      const result =
        await openAIService.generateEmpatheticMessage("test scenario");

      expect(result.success).toBe(true);
      expect(result.usage?.total).toBe(1500);
      // For gpt-3.5-turbo: $0.0005/1K prompt + $0.0015/1K completion
      // (1000/1000 * 0.0005) + (500/1000 * 0.0015) = 0.0005 + 0.00075 = 0.00125
      expect(result.usage?.estimatedCost).toBeCloseTo(0.00125, 4);
    });
  });

  describe("Error Handling", () => {
    it("should handle authentication errors", async () => {
      (openAIService as Record<string, unknown>).client = null;

      const result = await openAIService.analyzeDocument("mock-base64-image");

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("authentication");
      expect(result.error?.retryable).toBe(false);
    });
  });
});
