import { test, expect } from '@playwright/test';
import { loginAsFreeUser, loginAsPremiumUser, acceptCookieConsent } from './utils/auth';

test.describe('Visual Regression Tests', () => {
  // Configure visual regression settings for this suite
  test.use({
    // Set viewport to ensure consistent screenshots
    viewport: { width: 1280, height: 720 },
  });

  test.beforeEach(async ({ page }) => {
    // Ensure consistent starting state
    // Password wall has been removed
  });

  test('should match the snapshot for the Landing page', async ({ page }) => {
    await page.goto('/');
    await acceptCookieConsent(page);
    
    // Wait for hero section to be fully loaded
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    
    // Wait for any animations to complete
    await page.waitForTimeout(1000);
    
    // Take the snapshot
    await expect(page).toHaveScreenshot('landing-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the main Dashboard', async ({ page }) => {
    await loginAsFreeUser(page);
    await page.goto('/dashboard');
    
    // Wait for dashboard to be fully loaded
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
    
    // Wait for any data loading to complete
    await page.waitForLoadState('networkidle');
    
    // Take the snapshot
    await expect(page).toHaveScreenshot('dashboard-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the Vault page', async ({ page }) => {
    await loginAsFreeUser(page);
    await page.goto('/vault');
    
    // Wait for vault content to load
    await page.waitForSelector('[data-testid="vault-container"], [data-testid="vault-dashboard-container"], .vault-page', {
      state: 'visible',
      timeout: 10000
    });
    
    // Wait for any animations to complete
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('vault-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the Trusted Circle page', async ({ page }) => {
    await loginAsFreeUser(page);
    await page.goto('/trusted-circle');
    
    // Wait for trusted circle content to load
    await page.waitForSelector('[data-testid="trusted-circle-container"], .trusted-circle-page, h1:has-text("Your Trusted Circle")', {
      state: 'visible',
      timeout: 10000
    });
    
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('trusted-circle-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the Legacy Briefing page', async ({ page }) => {
    await loginAsFreeUser(page);
    await page.goto('/legacy-briefing');
    
    // Wait for legacy briefing content to load
    await page.waitForSelector('[data-testid="legacy-briefing-container"], .legacy-briefing-page, h1:has-text("Legacy Briefing")', {
      state: 'visible',
      timeout: 10000
    });
    
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('legacy-briefing-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the Will Generator page', async ({ page }) => {
    await loginAsFreeUser(page);
    await page.goto('/will');
    
    // Wait for will generator to load
    await page.waitForSelector('[data-testid="will-generator-container"], .will-generator-page, h1:has-text("Will")', {
      state: 'visible',
      timeout: 10000
    });
    
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('will-generator-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the Manual page', async ({ page }) => {
    await loginAsFreeUser(page);
    await page.goto('/manual');
    
    // Wait for manual content to load
    await page.waitForSelector('[data-testid="manual-container"], .manual-page, h1:has-text("Manual")', {
      state: 'visible',
      timeout: 10000
    });
    
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('manual-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the Pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await acceptCookieConsent(page);
    
    // Wait for pricing content to load
    await page.waitForSelector('[data-testid="pricing-plans"], .pricing-page', {
      state: 'visible',
      timeout: 10000
    });
    
    // Wait for animations
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('pricing-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the User Profile page', async ({ page }) => {
    await loginAsFreeUser(page);
    await page.goto('/user-profile');
    
    // Wait for Clerk's user profile component to load
    await page.waitForSelector('.cl-userProfile-root', {
      state: 'visible',
      timeout: 10000
    });
    
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('user-profile-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  // Premium user tests
  test('should match the snapshot for the Dashboard (Premium View)', async ({ page }) => {
    await loginAsPremiumUser(page);
    await page.goto('/dashboard');
    
    // Wait for dashboard to be fully loaded
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('dashboard-premium-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the Subscriptions page (Premium View)', async ({ page }) => {
    await loginAsPremiumUser(page);
    await page.goto('/subscriptions');
    
    // Wait for subscriptions content to load
    await page.waitForSelector('[data-testid="subscription-dashboard"], .subscription-page', {
      state: 'visible',
      timeout: 10000
    });
    
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('subscriptions-premium-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the Family Hub page', async ({ page }) => {
    await loginAsFreeUser(page);
    await page.goto('/family-hub');
    
    // Wait for family hub content to load
    await page.waitForSelector('[data-testid="family-hub-container"], .family-hub-page, h1:has-text("Family Hub")', {
      state: 'visible',
      timeout: 10000
    });
    
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('family-hub-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the Legacy Letters page', async ({ page }) => {
    await loginAsFreeUser(page);
    await page.goto('/legacy-letters');
    
    // Wait for legacy letters content to load
    await page.waitForSelector('[data-testid="legacy-letters-container"], .legacy-letters-page, h1:has-text("Legacy Letters")', {
      state: 'visible',
      timeout: 10000
    });
    
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('legacy-letters-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  // Mobile viewport tests
  test.describe('Mobile Screenshots', () => {
    test.use({
      viewport: { width: 375, height: 667 }, // iPhone SE size
    });

    test('should match the mobile snapshot for the Landing page', async ({ page }) => {
      await page.goto('/');
      await acceptCookieConsent(page);
      
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('landing-page-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match the mobile snapshot for the Dashboard', async ({ page }) => {
      await loginAsFreeUser(page);
      await page.goto('/dashboard');
      
      await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('dashboard-page-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  // Dark mode tests
  test.describe('Dark Mode Screenshots', () => {
    test('should match the snapshot for the Dashboard in dark mode', async ({ page }) => {
      await loginAsFreeUser(page);
      
      // Navigate to dashboard
      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
      
      // Toggle dark mode
      await page.click('[data-testid="theme-toggle"], button[aria-label*="theme"], button:has-text("Dark")');
      
      // Wait for theme transition
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });
});
