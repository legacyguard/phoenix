import { test, expect } from '@playwright/test';
import { signIn, testUsers } from './utils/auth';

test.describe('Premium Feature Access', () => {
  test('Free user attempting to access premium feature', async ({ page }) => {
    // Sign in as a free user
    await signIn(page, testUsers.freeUser);
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Attempt to access Executor's Toolkit (premium feature)
    await page.click('text=Executor\'s Toolkit');
    
    // Verify upgrade prompt appears
    await expect(page.locator('text=Upgrade to Premium')).toBeVisible();
    
    // Click upgrade button
    await page.click('button:has-text("Upgrade Now")');
    
    // Verify redirect to pricing page
    await expect(page).toHaveURL(/\/pricing/);
    
    // Verify pricing plans are displayed
    await expect(page.locator('text=Choose Your Plan')).toBeVisible();
    await expect(page.locator('text=Free')).toBeVisible();
    await expect(page.locator('text=Premium')).toBeVisible();
  });

  test('Premium user successfully accessing premium feature', async ({ page }) => {
    // Sign in as a premium user
    await signIn(page, testUsers.premiumUser);
    
    // For testing purposes, we'll mock the premium status
    await page.evaluate(() => {
      // Mock subscription status in localStorage
      localStorage.setItem('subscription_status', JSON.stringify({
        tier: 'premium',
        active: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }));
    });
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Access Executor's Toolkit (premium feature)
    await page.click('text=Executor\'s Toolkit');
    
    // Verify no upgrade prompt appears
    await expect(page.locator('text=Upgrade to Premium')).not.toBeVisible();
    
    // Verify toolkit content is accessible
    await expect(page.locator('h1:has-text("Executor\'s Toolkit")')).toBeVisible();
    
    // Verify some toolkit features are present
    await expect(page.locator('text=Estate Settlement Checklist')).toBeVisible();
    await expect(page.locator('text=Legal Forms Library')).toBeVisible();
    await expect(page.locator('text=Professional Network')).toBeVisible();
  });

  test('Premium feature badge visibility', async ({ page }) => {
    // Sign in as a free user
    await signIn(page, testUsers.freeUser);
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Verify premium badges are visible on premium features
    const premiumBadges = page.locator('.premium-badge, [data-premium="true"]');
    const badgeCount = await premiumBadges.count();
    expect(badgeCount).toBeGreaterThan(0);
    
    // Verify tooltip appears on hover
    const firstPremiumFeature = premiumBadges.first();
    await firstPremiumFeature.hover();
    await expect(page.locator('text=Premium feature - Upgrade to access')).toBeVisible();
  });
});
