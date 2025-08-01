import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  isPremium?: boolean;
}

// Test users - in a real environment, these would be created/cleaned up per test run
export const testUsers = {
  newUser: {
    email: `test-new-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    isPremium: false
  },
  freeUser: {
    email: 'test-free@example.com',
    password: 'TestPassword123!',
    isPremium: false
  },
  premiumUser: {
    email: 'test-premium@example.com',
    password: 'TestPassword123!',
    isPremium: true
  }
};

export async function signUp(page: Page, user: TestUser) {
  // Navigate to sign up page
  await page.goto('/auth');
  
  // Switch to sign up mode
  await page.click('text=Sign up');
  
  // Fill in registration form
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.fill('input[name="confirmPassword"]', user.password);
  
  // Submit form
  await page.click('button[type="submit"]:has-text("Sign up")');
  
  // Wait for navigation to dashboard
  await page.waitForURL(/\/dashboard/);
}

export async function signIn(page: Page, user: TestUser) {
  // Navigate to auth page
  await page.goto('/auth');
  
  // Fill in login form
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  
  // Submit form
  await page.click('button[type="submit"]:has-text("Sign in")');
  
  // Wait for navigation to dashboard
  await page.waitForURL(/\/dashboard/);
}

export async function signOut(page: Page) {
  // Click on user menu
  await page.click('button[aria-label="User menu"]');
  
  // Click sign out
  await page.click('text=Sign out');
  
  // Wait for redirect to auth page
  await page.waitForURL(/\/auth/);
}

// Mock premium status for testing
export async function mockPremiumStatus(page: Page, isPremium: boolean) {
  // This would typically be done through API mocking or test database setup
  // For now, we'll use localStorage or session storage manipulation
  await page.evaluate((premium) => {
    // Set a flag that the app can check for premium status
    localStorage.setItem('test-premium-status', JSON.stringify(premium));
  }, isPremium);
}
