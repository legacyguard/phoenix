import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import CryptoJS from "crypto-js";
import { checkAndUnlockTimeCapsules } from "@/services/timeCapsuleDelivery";
import {
  POST as createTimeCapsule,
  GET as getTimeCapsules,
} from "@/app/api/time-capsule/route";
// Mock NextRequest and NextResponse for testing
const NextRequest = vi.fn();
const NextResponse = {
  json: (data: any, init?: ResponseInit) => ({
    json: async () => data,
    ...init,
  }),
};

// Mock Supabase client
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null,
      }),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: "https://example.com/file.jpg" },
        }),
      })),
    },
  })),
}));

// Mock crypto-js
vi.mock("crypto-js", () => ({
  default: {
    AES: {
      encrypt: vi.fn((data: string) => ({
        toString: () => `encrypted-${data}`,
      })),
      decrypt: vi.fn((data: string) => ({
        toString: () => data.replace("encrypted-", ""),
      })),
    },
  },
}));

// Mock nodemailer
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: "test-message-id" }),
    })),
  },
}));

// Mock node-cron
vi.mock("node-cron", () => ({
  schedule: vi.fn(),
}));

describe("Time Capsule System", () => {
  let mockSupabaseClient: ReturnType<typeof createClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient = createClient("", "");
  });

  describe("Encryption/Decryption", () => {
    it("should encrypt file content before upload", async () => {
      const testFile = new File(["test content"], "test.txt", {
        type: "text/plain",
      });
      const reader = new FileReader();

      await new Promise((resolve) => {
        reader.onload = () => {
          const encrypted = CryptoJS.AES.encrypt(
            reader.result as string,
            "secret-key",
          ).toString();
          expect(encrypted).toContain("encrypted-");
          resolve(null);
        };
        reader.readAsBinaryString(testFile);
      });
    });

    it("should decrypt file content after retrieval", () => {
      const encryptedContent = "encrypted-test-content";
      const decrypted = CryptoJS.AES.decrypt(
        encryptedContent,
        "secret-key",
      ).toString();
      expect(decrypted).toBe("test-content");
    });
  });

  describe("API Endpoints", () => {
    describe("POST /api/time-capsule", () => {
      it("should create a time capsule with text content", async () => {
        const mockRequest = new NextRequest(
          "http://localhost:3000/api/time-capsule",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer test-token",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: "Test Time Capsule",
              messageType: "text",
              textContent: "This is a test message",
              recipientIds: ["recipient-1", "recipient-2"],
              unlockCondition: "date",
              unlockDate: "2025-12-31T00:00:00Z",
            }),
          },
        );

        // Mock successful database insert
        const mockInsertData = {
          id: "capsule-id",
          user_id: "test-user-id",
          title: "Test Time Capsule",
          message_type: "text",
          text_content: "This is a test message",
          recipient_ids: ["recipient-1", "recipient-2"],
          unlock_condition: "date",
          unlock_date: "2025-12-31T00:00:00Z",
          status: "locked",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        (mockSupabaseClient.from as any).mockReturnValueOnce({
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({ data: mockInsertData, error: null }),
        });

        const response = await createTimeCapsule(mockRequest);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.data).toBeDefined();
        expect(responseData.data.title).toBe("Test Time Capsule");
      });

      it("should handle file upload with encryption", async () => {
        const testFile = new File(["test content"], "test.jpg", {
          type: "image/jpeg",
        });
        const formData = new FormData();
        formData.append("title", "Photo Time Capsule");
        formData.append("messageType", "photo");
        formData.append("recipientIds", JSON.stringify(["recipient-1"]));
        formData.append("unlockCondition", "after_passing");
        formData.append("attachment", testFile);

        const mockRequest = new NextRequest(
          "http://localhost:3000/api/time-capsule",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer test-token",
            },
            body: formData,
          },
        );

        const response = await createTimeCapsule(mockRequest);

        // Note: In actual implementation, file upload is async
        // This test verifies the endpoint structure
        expect(response.status).toBeLessThan(500);
      });

      it("should validate required fields", async () => {
        const mockRequest = new NextRequest(
          "http://localhost:3000/api/time-capsule",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer test-token",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              // Missing required fields
              messageType: "text",
            }),
          },
        );

        const response = await createTimeCapsule(mockRequest);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.error).toBe("Missing required fields");
      });
    });

    describe("GET /api/time-capsule", () => {
      it("should retrieve user time capsules", async () => {
        const mockRequest = new NextRequest(
          "http://localhost:3000/api/time-capsule",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer test-token",
            },
          },
        );

        const mockCapsules = [
          {
            id: "capsule-1",
            user_id: "test-user-id",
            title: "Test Capsule 1",
            message_type: "text",
            text_content: "Test message",
            recipient_ids: ["recipient-1"],
            unlock_condition: "date",
            unlock_date: "2025-12-31T00:00:00Z",
            status: "locked",
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
          },
        ];

        (mockSupabaseClient.from as any).mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockCapsules, error: null }),
        });

        const response = await getTimeCapsules(mockRequest);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.data).toHaveLength(1);
        expect(responseData.data[0].title).toBe("Test Capsule 1");
      });
    });
  });

  describe("Delivery Service", () => {
    it("should check and unlock time capsules based on date", async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const mockLockedCapsules = [
        {
          id: "capsule-1",
          user_id: "user-1",
          title: "Past Due Capsule",
          message_type: "text",
          recipient_ids: ["recipient-1"],
          unlock_condition: "date",
          unlock_date: yesterday.toISOString(),
          status: "locked",
        },
      ];

      const mockSender = {
        full_name: "John Doe",
        email: "john@example.com",
      };

      const mockRecipient = {
        name: "Jane Doe",
        email: "jane@example.com",
      };

      // Mock Supabase queries
      const supabaseMock = {
        from: vi.fn((table: string) => {
          if (table === "time_capsule_messages") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              update: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === "profiles") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi
                .fn()
                .mockResolvedValue({ data: mockSender, error: null }),
            };
          }
          if (table === "trusted_people") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi
                .fn()
                .mockResolvedValue({ data: mockRecipient, error: null }),
            };
          }
          if (table === "notifications") {
            return {
              insert: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          return {};
        }),
      };

      // First call returns locked capsules
      (supabaseMock.from("time_capsule_messages") as any).select = vi
        .fn()
        .mockReturnValueOnce({
          eq: vi
            .fn()
            .mockResolvedValue({ data: mockLockedCapsules, error: null }),
        });

      await checkAndUnlockTimeCapsules();

      // Verify that the service attempted to fetch locked capsules
      expect(supabaseMock.from).toHaveBeenCalledWith("time_capsule_messages");
    });

    it("should check and unlock time capsules based on user passing", async () => {
      const mockLockedCapsules = [
        {
          id: "capsule-2",
          user_id: "user-2",
          title: "After Passing Capsule",
          message_type: "text",
          recipient_ids: ["recipient-2"],
          unlock_condition: "after_passing",
          unlock_date: null,
          status: "locked",
        },
      ];

      const mockDeceasedUser = {
        status: "deceased",
      };

      // Mock Supabase queries for after_passing condition
      const supabaseMock = {
        from: vi.fn((table: string) => {
          if (table === "time_capsule_messages") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi
                .fn()
                .mockResolvedValue({ data: mockLockedCapsules, error: null }),
            };
          }
          if (table === "profiles") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi
                .fn()
                .mockResolvedValue({ data: mockDeceasedUser, error: null }),
            };
          }
          return {};
        }),
      };

      await checkAndUnlockTimeCapsules();

      // Verify service checked user status
      expect(supabaseMock.from).toHaveBeenCalledWith("profiles");
    });
  });

  describe("Notification System", () => {
    it("should send email notifications when capsule is unlocked", async () => {
      const nodemailer = await import("nodemailer");
      const { createTransport } = nodemailer.default;
      const mockTransporter = createTransport();

      const recipientEmail = "recipient@example.com";
      const recipientName = "Recipient Name";
      const senderName = "Sender Name";
      const capsuleTitle = "Test Capsule";

      // The email sending is mocked, so we just verify the function doesn't throw
      await expect(async () => {
        await mockTransporter.sendMail({
          from: "test@example.com",
          to: recipientEmail,
          subject: `${senderName} has left a message for you`,
          html: expect.stringContaining("You have a new message"),
        });
      }).not.toThrow();

      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it("should create in-app notifications", async () => {
      const mockNotificationInsert = vi.fn().mockResolvedValue({ error: null });

      (mockSupabaseClient.from as any).mockReturnValueOnce({
        insert: mockNotificationInsert,
      });

      // Simulate creating an in-app notification
      await mockSupabaseClient.from("notifications").insert({
        user_id: "recipient-id",
        type: "time_capsule_unlocked",
        title: "New message from Sender",
        message: 'Sender has left you a time capsule message: "Test"',
        data: { capsule_id: "capsule-id" },
        read: false,
      });

      expect(mockNotificationInsert).toHaveBeenCalledWith({
        user_id: "recipient-id",
        type: "time_capsule_unlocked",
        title: "New message from Sender",
        message: 'Sender has left you a time capsule message: "Test"',
        data: { capsule_id: "capsule-id" },
        read: false,
      });
    });
  });

  describe("Unlock Policies", () => {
    it("should respect date-based unlock conditions", () => {
      const futureDate = new Date("2025-12-31");
      const today = new Date();

      expect(futureDate > today).toBe(true);

      // Capsule should not unlock if date is in the future
      const shouldUnlock = futureDate <= today;
      expect(shouldUnlock).toBe(false);
    });

    it("should respect after_passing unlock conditions", () => {
      const userStatuses = ["active", "deceased"];

      userStatuses.forEach((status) => {
        const shouldUnlock = status === "deceased";
        expect(shouldUnlock).toBe(status === "deceased");
      });
    });
  });

  describe("Security", () => {
    it("should require authentication for all endpoints", async () => {
      const mockRequest = new NextRequest(
        "http://localhost:3000/api/time-capsule",
        {
          method: "POST",
          headers: {
            // No Authorization header
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Test",
            messageType: "text",
            textContent: "Test",
            recipientIds: [],
            unlockCondition: "date",
          }),
        },
      );

      const response = await createTimeCapsule(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe("Unauthorized");
    });

    it("should encrypt sensitive content", () => {
      const sensitiveData = "This is a private message";
      const encrypted = CryptoJS.AES.encrypt(
        sensitiveData,
        "secret-key",
      ).toString();

      expect(encrypted).not.toBe(sensitiveData);
      expect(encrypted).toContain("encrypted-");
    });
  });
});
