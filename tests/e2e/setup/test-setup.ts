/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, Page } from '@playwright/test';
import { mockUsers, MockUser } from '@/test-utils/mockClerkHelpers';

// Define custom test fixtures
export interface TestFixtures {
  authenticatedPage: Page;
  mockAuth: {
    signIn: (user: MockUser) => Promise<void>;
    signOut: () => Promise<void>;
  };
}

// Create custom test with fixtures
export const test = base.extend<TestFixtures>({
  // Create an authenticated page fixture
  authenticatedPage: async ({ page }, useFixture) => {
    // This page will have authentication mocking set up
    await useFixture(page);
  },

  // Create mock auth utilities
  mockAuth: async ({ page }, useFixture) => {
    const mockAuth = {
      signIn: async (user: MockUser) => {
        // Inject the mock user into the page context
        await page.addInitScript((mockUser) => {
          // Override window.Clerk
          (window as { Clerk?: Record<string, unknown> }).Clerk = {
            loaded: true,
            session: {
              id: 'test-session-id',
              status: 'active',
              lastActiveAt: new Date(),
              userId: mockUser.id
            },
            user: mockUser,
            isSignedIn: () => true,
            signOut: async () => {
              window.location.href = '/';
            }
          };

          // Mock the Clerk React Context
          (window as unknown as { __MOCK_CLERK_USER__: unknown; __MOCK_CLERK_IS_SIGNED_IN__: boolean }).__MOCK_CLERK_USER__ = mockUser;
          (window as unknown as { __MOCK_CLERK_USER__: unknown; __MOCK_CLERK_IS_SIGNED_IN__: boolean }).__MOCK_CLERK_IS_SIGNED_IN__ = true;
        }, user);

        // Also bypass the password wall
        await page.addInitScript(() => {
          window.localStorage.setItem('legacyguard_auth', 'true');
        });
      },

      signOut: async () => {
        await page.addInitScript(() => {
          (window as { Clerk?: Record<string, unknown> }).Clerk = {
            loaded: true,
            session: null,
            user: null,
            isSignedIn: () => false,
            signOut: async () => {
              window.location.href = '/';
            }
          };

          (window as unknown as { __MOCK_CLERK_USER__: unknown; __MOCK_CLERK_IS_SIGNED_IN__: boolean }).__MOCK_CLERK_USER__ = null;
          (window as unknown as { __MOCK_CLERK_USER__: unknown; __MOCK_CLERK_IS_SIGNED_IN__: boolean }).__MOCK_CLERK_IS_SIGNED_IN__ = false;
        });
      }
    };

    await useFixture(mockAuth);
  }
});

// Re-export expect from Playwright
export { expect } from '@playwright/test';

// Export pre-configured test users
export { mockUsers };

// Helper to set up Clerk mock before navigation
export async function setupClerkMock(page: Page, user?: MockUser, isSignedIn: boolean = false) {
  // Intercept and mock @clerk/clerk-react module
  await page.route('**/@clerk/clerk-react', async route => {
    // This would need to serve our mock module, but for E2E tests,
    // we'll use a different approach with script injection
    await route.abort();
  });

  // Set up the mock before any navigation
  await page.addInitScript((config) => {
    const { user, isSignedIn } = config;
    
    // Create mock Clerk global object
    (window as { Clerk?: Record<string, unknown> }).Clerk = {
      loaded: true,
      session: isSignedIn && user ? {
        id: 'test-session-id',
        status: 'active',
        lastActiveAt: new Date(),
        userId: user.id,
        user: user
      } : null,
      user: isSignedIn ? user : null,
      isSignedIn: () => isSignedIn,
      signOut: async () => {
        window.location.href = '/';
      }
    };

    // Store mock state for React components
    (window as { __MOCK_CLERK_STATE__?: { user?: MockUser; isSignedIn: boolean; isLoaded: boolean } }).__MOCK_CLERK_STATE__ = {
      user,
      isSignedIn,
      isLoaded: true
    };

    // Override Clerk's loading script
    Object.defineProperty(window, '__clerk_publishable_key', {
      value: 'pk_test_mock',
      writable: false
    });
  }, { user, isSignedIn });

  // Bypass password wall
  await page.addInitScript(() => {
    window.localStorage.setItem('legacyguard_auth', 'true');
  });
}
