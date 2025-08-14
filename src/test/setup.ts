import "@testing-library/jest-dom";
import { vi } from "vitest";
import { mockSupabaseClient } from "./mocks/supabase";

// Mock environment variables for tests
vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-anon-key");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
vi.stubEnv("VITE_CLERK_PUBLISHABLE_KEY", "test-clerk-key");
vi.stubEnv("VITE_APP_URL", "http://localhost:3000");
vi.stubEnv("VITE_ENCRYPTION_KEY", "test-encryption-key");
vi.stubEnv("VITE_OPENAI_API_KEY", "test-openai-key");
vi.stubEnv("VITE_PBKDF2_ITER", "100000");

// Provide WebCrypto in test env
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeCrypto = require('node:crypto');
// Ensure WebCrypto in both global and window scopes
// @ts-expect-error
globalThis.crypto = nodeCrypto.webcrypto;
// @ts-expect-error
if (typeof window !== 'undefined') { (window as any).crypto = nodeCrypto.webcrypto; }

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Suppress console errors during tests (can be removed for debugging)
const originalError = console.error;
const originalWarn = console.warn;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render") ||
        args[0].includes("Could not parse CSS") ||
        args[0].includes("act()"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("act()") || args[0].includes("was not wrapped in act"))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
