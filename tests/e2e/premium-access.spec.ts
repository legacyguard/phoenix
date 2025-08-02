import { test, expect } from '@playwright/test';
import { loginAsFreeUser, loginAsPremiumUser, grantPremiumAccess } from './utils/auth';

test.describe('Premium Feature Access', () => {
  test('Free user attempting to access premium feature', async ({ page }) => {
    await loginAsFreeUser(page);

    // Navigate to Executor's Toolkit
    await page.click('[data-testid="nav-executor-toolkit"]');

    // Should redirect to pricing page
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.locator('[data-testid="pricing-plans"]')).toBeVisible();

    // Grant premium access
    await grantPremiumAccess(page);

    // Navigate back to Executor's Toolkit
    await page.click('[data-testid="nav-executor-toolkit"]');

    // Should now have access to toolkit dashboard
    await expect(page).toHaveURL(/\/executor-toolkit/);
    await expect(page.locator('[data-testid="toolkit-dashboard"]')).toBeVisible();
  });

  test('Premium user accessing premium feature', async ({ page }) => {
    await loginAsPremiumUser(page);

    // Directly access Executor's Toolkit
    await page.click('[data-testid="nav-executor-toolkit"]');

    // Should have direct access
    await expect(page).toHaveURL(/\/executor-toolkit/);
    await expect(page.locator('[data-testid="toolkit-dashboard"]')).toBeVisible();
  });
});

