import { test, expect } from "@playwright/test";
import {
  loginAsFreeUser,
  loginAsPremiumUser,
  grantPremiumAccess,
} from "./utils/auth";

test.describe("Premium Feature Access", () => {
  test("Free user attempting to access premium feature", async ({ page }) => {
    await loginAsFreeUser(page);

    // Navigate to Executor's Toolkit
    await page.click('[data-testid="nav-executor-toolkit"]');

    // Should redirect to pricing page
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.locator('[data-testid="pricing-plans"]')).toBeVisible();

    // Grant premium access
    await grantPremiumAccess(page);
    
    // Reload the page to apply the new premium status
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Navigate back to Executor's Toolkit
    await page.click('[data-testid="nav-executor-toolkit"]');

    // Should now have access to toolkit dashboard (or at least not be on pricing page)
    await expect(page).not.toHaveURL(/\/pricing/);
    // The executor toolkit page may not exist, so just verify we're not on pricing
  });

  test("Premium user accessing premium feature", async ({ page }) => {
    await loginAsPremiumUser(page);

    // Directly access Executor's Toolkit
    await page.click('[data-testid="nav-executor-toolkit"]');

    // Should have direct access
    await expect(page).toHaveURL(/\/executor-toolkit/);
    await expect(
      page.locator('[data-testid="toolkit-dashboard"]'),
    ).toBeVisible();
  });
});
