import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  // Configure visual regression settings for this suite
  test.use({
    // Set viewport to ensure consistent screenshots
    viewport: { width: 1280, height: 720 },
  });

  test.beforeEach(async ({ page }) => {
    // Enable E2E mode for consistent rendering
    await page.addInitScript(() => {
      window.__E2E_USER = {
        id: 'visual_test_user',
        email: 'visual@test.com',
        name: 'Visual Test User',
      };
    });

    // Mark the page as being in visual regression mode
    // This will trigger CSS rules to hide E2E-only elements
    await page.evaluateOnNewDocument(() => {
      // Wait for DOM to be ready then set the attribute
      if (document.readyState !== 'loading') {
        document.body.setAttribute('data-visual-regression', 'true');
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          document.body.setAttribute('data-visual-regression', 'true');
        });
      }
    });
  });

  test('should match the snapshot for the Landing page', async ({ page }) => {
    await page.goto('/');
    
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
    await page.goto('/trusted-circle');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('trusted-circle-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the Legacy Briefing page', async ({ page }) => {
    await page.goto('/legacy-briefing');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('legacy-briefing-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the Will Generator page', async ({ page }) => {
    await page.goto('/will');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('will-generator-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the Manual page', async ({ page }) => {
    await page.goto('/manual');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('manual-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the Pricing page', async ({ page }) => {
    await page.goto('/pricing');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('pricing-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the User Profile page', async ({ page }) => {
    await page.goto('/user-profile');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('user-profile-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  // Premium user tests
  test('should match the snapshot for the Dashboard (Premium View)', async ({ page }) => {
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
    await page.goto('/subscriptions');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('subscriptions-premium-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the Family Hub page', async ({ page }) => {
    await page.goto('/family-hub');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('family-hub-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match the snapshot for the Legacy Letters page', async ({ page }) => {
    await page.goto('/legacy-letters');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
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
      
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('landing-page-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match the mobile snapshot for the Dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      
      await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('dashboard-page-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

});
