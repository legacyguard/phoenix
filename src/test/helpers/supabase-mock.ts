import { vi } from "vitest";

export const createMockSupabaseClient = () => {
  const mockFrom = vi.fn();
  const mockStorage = {
    from: vi.fn(() => ({
      upload: vi
        .fn()
        .mockResolvedValue({ data: { path: "test-path" }, error: null }),
      download: vi.fn().mockResolvedValue({
        data: new Blob(["test data"]),
        error: null,
      }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      list: vi.fn().mockResolvedValue({ data: [], error: null }),
      createSignedUrl: vi.fn().mockResolvedValue({
        data: { signedUrl: "https://example.com/signed-url" },
        error: null,
      }),
    })),
  };

  const mockAuth = {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: "test-user-id" } },
      error: null,
    }),
    signInWithEmail: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  };

  const client = {
    from: mockFrom,
    storage: mockStorage,
    auth: mockAuth,
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  // Default behavior for from() method
  mockFrom.mockImplementation((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  }));

  return client;
};

export const setupSupabaseMocks = () => {
  const mockClient = createMockSupabaseClient();

  // Mock the imports
  vi.doMock("@/lib/supabase", () => ({
    supabase: mockClient,
  }));

  vi.doMock("@/integrations/supabase/client", () => ({
    supabase: mockClient,
  }));

  return mockClient;
};
