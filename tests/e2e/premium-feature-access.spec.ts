import { test, expect } from "@playwright/test";

test.describe("Premium Feature Access - Minimum User State Coverage", () => {
  test("Logged out user is redirected to login when accessing premium feature", async ({
    page,
  }) => {
    await page.addInitScript(() => { (window as any).__E2E_USER = null; });
    await page.goto("/executor-toolkit");
    await expect(page).toHaveURL(/login/i);
  });

  test("Free user attempting to access premium feature should see upgrade", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (window as any).__E2E_USER = { id: 'free_user', publicMetadata: { plan: 'free' } };
    });
    await page.goto("/executor-toolkit");
    await expect(page).toHaveURL(/\/pricing/);
  });

  test("Premium user can directly access premium feature", async ({ page }) => {
    // KROK 1: Priprav stav PRED akciou
    await page.addInitScript(() => {
      (window as any).__E2E_USER = {
        id: 'user_premium_e2e_123',
        publicMetadata: { plan: 'premium' },
      };
    });

    // KROK 2: Vykonaj akciu
    await page.goto("/executor-toolkit");

    // KROK 3: Over výsledok
    await expect(page).not.toHaveURL(/\/pricing|\/plan/);
    await expect(page.locator('[data-testid="toolkit-dashboard"]')).toBeVisible();
    await expect(page.locator('h1:has-text("Executor\'s Toolkit")')).toBeVisible();
  });

  test("Premium feature badge is visible to free users but not to premium", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (window as any).__E2E_USER = { id: 'free_user', publicMetadata: { plan: 'free' } };
    });
    await page.goto("/dashboard");
    const freeBadges = await page
      .locator('.premium-badge, [data-premium="true"]')
      .count();
    expect(freeBadges).toBeGreaterThan(0);

    await page.addInitScript(() => {
      (window as any).__E2E_USER = { id: 'premium_user', publicMetadata: { plan: 'premium' } };
    });
    await page.goto("/dashboard");
    const premiumBadges = await page
      .locator('.premium-badge, [data-premium="true"]')
      .count();
    expect(premiumBadges).toBe(0);
  });
});
