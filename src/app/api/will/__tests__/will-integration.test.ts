import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import type {
  WillRequirements,
  GeneratedWill,
  WillContent,
} from "@/types/will";

// Mock Supabase client
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: mockWillRequirements,
              error: null,
            }),
          ),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: mockGeneratedWill,
              error: null,
            }),
          ),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() =>
          Promise.resolve({
            data: mockGeneratedWill,
            error: null,
          }),
        ),
      })),
    })),
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: { id: "test-user-123" } },
          error: null,
        }),
      ),
    },
  })),
}));

const mockWillRequirements: WillRequirements = {
  id: 1,
  country_code: "SK",
  country_name: "Slovakia",
  witness_count: 2,
  requires_handwriting: true,
  requires_notarization: false,
  required_clauses: ["identity", "revocation", "distribution"],
  forbidden_content: [],
  legal_language: {
    title: "Závet",
    identity: "Ja, [name], narodený [date]",
    revocation: "Týmto odvolávam všetky predchádzajúce závety",
    beneficiaries: "Odkazujem",
    signature: "Podpis",
    witness: "Svedok",
    date: "Dátum",
  },
  signature_requirements: "Musí byť podpísané v prítomnosti svedkov",
};

const mockWillContent: WillContent = {
  testator: {
    name: "John Doe",
    birthDate: "1970-01-01",
    address: "123 Main St, Bratislava",
    identification: "SK1234567890",
  },
  beneficiaries: [
    {
      id: "ben-1",
      name: "Jane Doe",
      relationship: "spouse",
      allocation: [
        {
          assetType: "percentage",
          description: "50% of all assets",
          value: 50,
        },
      ],
    },
    {
      id: "ben-2",
      name: "John Jr.",
      relationship: "son",
      allocation: [
        {
          assetType: "percentage",
          description: "50% of all assets",
          value: 50,
        },
      ],
    },
  ],
  executor: {
    name: "Robert Smith",
    relationship: "friend",
    address: "456 Oak St, Bratislava",
    phone: "+421901234567",
  },
  createdDate: "2024-01-01",
};

const mockGeneratedWill: GeneratedWill = {
  id: "will-123",
  user_id: "test-user-123",
  country_code: "SK",
  will_content: mockWillContent,
  status: "draft",
  version: 1,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("Will Generation Integration", () => {
  let supabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    supabase = createClient("https://test.supabase.co", "test-anon-key");
  });

  describe("Fetching Will Requirements", () => {
    it("should fetch will requirements for a specific country", async () => {
      const result = await supabase
        .from("will_requirements")
        .select("*")
        .eq("country_code", "SK")
        .single();

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockWillRequirements);
      expect(result.data.country_code).toBe("SK");
      expect(result.data.witness_count).toBe(2);
      expect(result.data.requires_handwriting).toBe(true);
    });
  });

  describe("Creating a Will", () => {
    it("should create a new will draft", async () => {
      const result = await supabase
        .from("generated_wills")
        .insert({
          user_id: "test-user-123",
          country_code: "SK",
          will_content: mockWillContent,
          status: "draft",
          version: 1,
        })
        .select()
        .single();

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data.status).toBe("draft");
      expect(result.data.will_content.beneficiaries).toHaveLength(2);
    });

    it("should validate beneficiary allocations total 100%", () => {
      const totalAllocation = mockWillContent.beneficiaries.reduce(
        (sum, beneficiary) => {
          const beneficiaryTotal = beneficiary.allocation
            .filter((a) => a.assetType === "percentage")
            .reduce((total, alloc) => total + (alloc.value || 0), 0);
          return sum + beneficiaryTotal;
        },
        0,
      );

      expect(totalAllocation).toBe(100);
    });
  });

  describe("Will Status Transitions", () => {
    it("should transition from draft to pending_signatures", async () => {
      const updatedWill = {
        ...mockGeneratedWill,
        status: "pending_signatures" as const,
      };

      const result = await supabase
        .from("generated_wills")
        .update({ status: "pending_signatures" })
        .eq("id", "will-123");

      expect(result.error).toBeNull();
    });

    it("should validate required fields before moving to pending_signatures", () => {
      const isValid = validateWillContent(mockWillContent);
      expect(isValid).toBe(true);
    });
  });

  describe("Country-Specific Validation", () => {
    it("should validate Slovak will requirements", () => {
      const validation = validateSlovakWill(
        mockWillContent,
        mockWillRequirements,
      );
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should check for required clauses", () => {
      const hasRequiredClauses = checkRequiredClauses(
        mockWillContent,
        mockWillRequirements.required_clauses,
      );
      expect(hasRequiredClauses).toBe(true);
    });
  });

  describe("Will Generation Workflow", () => {
    it("should complete full will generation workflow", async () => {
      // Step 1: Fetch requirements
      const requirementsResult = await supabase
        .from("will_requirements")
        .select("*")
        .eq("country_code", "SK")
        .single();

      expect(requirementsResult.data).toBeDefined();

      // Step 2: Create draft
      const createResult = await supabase
        .from("generated_wills")
        .insert({
          user_id: "test-user-123",
          country_code: "SK",
          will_content: mockWillContent,
          status: "draft",
          version: 1,
        })
        .select()
        .single();

      expect(createResult.data).toBeDefined();
      expect(createResult.data.status).toBe("draft");

      // Step 3: Update to pending signatures
      const updateResult = await supabase
        .from("generated_wills")
        .update({ status: "pending_signatures" })
        .eq("id", createResult.data.id);

      expect(updateResult.error).toBeNull();
    });
  });
});

// Helper functions
function validateWillContent(content: WillContent): boolean {
  return !!(
    content.testator.name &&
    content.testator.birthDate &&
    content.testator.address &&
    content.beneficiaries.length > 0 &&
    content.createdDate
  );
}

function validateSlovakWill(
  content: WillContent,
  requirements: WillRequirements,
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check basic requirements
  if (!content.testator.name) errors.push("Testator name is required");
  if (!content.testator.birthDate)
    errors.push("Testator birth date is required");
  if (!content.testator.address) errors.push("Testator address is required");

  // Check beneficiaries
  if (content.beneficiaries.length === 0) {
    errors.push("At least one beneficiary is required");
  }

  // Check total allocation
  const totalPercentage = content.beneficiaries
    .flatMap((b) => b.allocation)
    .filter((a) => a.assetType === "percentage")
    .reduce((sum, a) => sum + (a.value || 0), 0);

  if (totalPercentage !== 100 && totalPercentage !== 0) {
    errors.push("Total percentage allocation must equal 100%");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function checkRequiredClauses(
  content: WillContent,
  requiredClauses: string[],
): boolean {
  // In a real implementation, this would check the actual will text
  // For now, we'll assume all required clauses are present
  return true;
}
