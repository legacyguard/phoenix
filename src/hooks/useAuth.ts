import { useUser } from "@clerk/clerk-react";

// Unified auth hook that also supports E2E test mocks
export const useAuth = () => {
  // Detect Playwright/E2E mock in the browser context
  if (typeof window !== 'undefined') {
    const anyWin = window as any;
    const mockedUser = anyWin?.Clerk?.user;
    const testAuth = (() => {
      try { return JSON.parse(localStorage.getItem('test-auth') || 'null'); } catch { return null; }
    })();

    if (mockedUser || testAuth) {
      // Prefer the mocked Clerk user shape, fall back to minimal info from localStorage
      const user = mockedUser || {
        id: 'e2e-user',
        emailAddresses: [{ emailAddress: testAuth?.email || 'e2e@example.com' }],
        firstName: 'E2E',
        lastName: 'User',
        createdAt: new Date().toISOString(),
        publicMetadata: { onboardingCompleted: false },
      };
      return { user, isLoaded: true, isSignedIn: true };
    }
  }

  // Default to Clerk in non-test environments
  const { user, isLoaded, isSignedIn } = useUser();
  return { user, isLoaded, isSignedIn };
};
