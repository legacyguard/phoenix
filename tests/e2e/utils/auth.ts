import { Page } from "@playwright/test";

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

function toE2EUser(u: TestUser) {
  const plan = u.isPremium ? 'premium' : 'free';
  return {
    id: `user_${plan}_${Math.random().toString(36).slice(2)}`,
    email: u.email,
    publicMetadata: { plan },
    subscription: { plan },
  };
}

export async function signUp(page: Page, user: TestUser) {
  // Seed E2E user before any app scripts execute
  await page.addInitScript((raw) => {
    (window as any).__E2E_USER = raw;
    try { localStorage.setItem('legacyguard_auth', 'true'); } catch {}
  }, toE2EUser(user));

  await page.goto('/dashboard');
  await page.waitForSelector('[data-testid="dashboard-container"], #e2e-probe, [data-testid="upload-zone"]', { timeout: 15000 });
}

export async function signIn(page: Page, user: TestUser) {
  // Seed E2E user before any app scripts execute
  await page.addInitScript((raw) => {
    (window as any).__E2E_USER = raw;
    try { localStorage.setItem('legacyguard_auth', 'true'); } catch {}
  }, toE2EUser(user));

  await page.goto('/dashboard');
  await page.waitForSelector('[data-testid="dashboard-container"], #e2e-probe, [data-testid="upload-zone"]', { timeout: 15000 });
}

export async function signOut(page: Page) {
  // Clear E2E user before navigation
  await page.addInitScript(() => {
    (window as any).__E2E_USER = null;
  });
  await page.goto('/');
}

// Compatibility helpers expected by tests
export async function login(page: Page) {
  await signIn(page, testUsers.freeUser);
}

export async function loginAsFreeUser(page: Page) {
  await signIn(page, testUsers.freeUser);
}

export async function loginAsPremiumUser(page: Page) {
  await signIn(page, testUsers.premiumUser);
}

export async function grantPremiumAccess(page: Page) {
  // Set current session as premium (idempotent)
  await page.addInitScript(() => {
    const anyWin = window as any;
    const u = anyWin.__E2E_USER || null;
    if (u) {
      anyWin.__E2E_USER = { ...u, publicMetadata: { ...(u.publicMetadata||{}), plan: 'premium' }, subscription: { ...(u.subscription||{}), plan: 'premium' } };
    }
  });
}

export async function acceptCookieConsent(page: Page) {
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
}
