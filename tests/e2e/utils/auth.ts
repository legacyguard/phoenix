import { Page, expect } from "@playwright/test";

export interface TestUser {
  email: string;
  password: string;
  isPremium?: boolean;
}

// Test users - in a real environment, these would be created/cleaned up per test run
export const testUsers = {
  newUser: {
    email: `test-new-${Date.now()}@example.com`,
    password: "TestPassword123!",
    isPremium: false,
  },
  freeUser: {
    email: "test-free@example.com",
    password: "TestPassword123!",
    isPremium: false,
  },
  premiumUser: {
    email: "test-premium@example.com",
    password: "TestPassword123!",
    isPremium: true,
  },
};

export async function signUp(page: Page, user: TestUser) {
  // Mock Clerk and seed auth state before the app scripts run
  await page.addInitScript((u: TestUser) => {
    // @ts-ignore
    window.Clerk = {
      isSignedIn: () => true,
      user: {
        id: 'test-user-id',
        emailAddresses: [{ emailAddress: u.email }],
        firstName: 'Test',
        lastName: 'User',
      },
    };
    localStorage.setItem('test-auth', JSON.stringify({ email: u.email }));
  }, user);

  await page.goto('/dashboard');
  await page.waitForSelector('[data-testid="dashboard-container"], h1:has-text("Welcome back")', { timeout: 15000 });
}

export async function signIn(page: Page, user: TestUser) {
  // Mock Clerk and seed auth state before the app scripts run
  await page.addInitScript((u: TestUser) => {
    // @ts-ignore
    window.Clerk = {
      isSignedIn: () => true,
      user: {
        id: 'test-user-id',
        emailAddresses: [{ emailAddress: u.email }],
        firstName: 'Test',
        lastName: 'User',
      },
    };
    localStorage.setItem('test-auth', JSON.stringify({ email: u.email }));
  }, user);

  await page.goto('/dashboard');
  await page.waitForSelector('[data-testid="dashboard-container"], h1:has-text("Welcome back")', { timeout: 15000 });
}

// Minimal helper to sign the user out
export async function signOut(page: Page) {
  try {
    await page.click('button[aria-label="User menu"]');
    await page.click("text=Sign out");
    await page.waitForURL(/\/auth/);
  } catch {
    // Ignore errors if already signed out
  }
}

// Mock premium status for testing
export async function mockPremiumStatus(page: Page, isPremium: boolean) {
  // This would typically be done through API mocking or test database setup
  // For now, we'll use localStorage or session storage manipulation
  await page.evaluate((premium) => {
    // Set a flag that the app can check for premium status
    localStorage.setItem("test-premium-status", JSON.stringify(premium));
  }, isPremium);
}

// Compatibility helpers expected by tests
export async function login(page: Page) {
  // Default to logging in as a free user
  await signIn(page, testUsers.freeUser);
}

export async function loginAsFreeUser(page: Page) {
  await signIn(page, testUsers.freeUser);
}

export async function loginAsPremiumUser(page: Page) {
  await signIn(page, testUsers.premiumUser);
  // Ensure premium flag is applied for UIs that rely on client flag
  await mockPremiumStatus(page, true);
}

export async function grantPremiumAccess(page: Page) {
  // Toggle premium status for current session
  await mockPremiumStatus(page, true);
}

export async function acceptCookieConsent(page: Page) {
  // Try common selectors; ignore if not present
  const candidates = [
    '[data-testid="cookie-accept"]',
    'button:has-text("Accept All")',
    'button:has-text("Accept")',
    '.cookie-consent-accept',
  ];
  for (const selector of candidates) {
    const btn = page.locator(selector);
    if (await btn.first().isVisible().catch(() => false)) {
      await btn.first().click({ timeout: 1000 }).catch(() => {});
      break;
    }
  }
  // Optionally assert banner hidden if it exists
  // Not failing tests if absent
}
