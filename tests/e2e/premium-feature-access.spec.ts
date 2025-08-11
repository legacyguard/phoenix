import { test, expect } from "@playwright/test";
import { signIn, testUsers, signOut } from "./utils/auth";
test.describe("Premium Feature Access - Minimum User State Coverage", () => {
  test("Logged out user is redirected to login when accessing premium feature", async ({
    page,
  }) => {
    await page.goto("/executor-toolkit");
    await expect(page).toHaveURL(/auth|login/i);
    await expect(page.locator("text=Sign In")).toBeVisible();
  });

  test("Free user attempting to access premium feature should see upgrade", async ({
    page,
  }) => {
    await signIn(page, testUsers.freeUser);
    await page.goto("/executor-toolkit");
    await expect(page).toHaveURL(/\/pricing|\/plan/);
    await expect(page.locator("text=/upgrade to premium/i")).toBeVisible();
    await signOut(page); // Always sign out after stateful tests
  });

  test("Premium user can directly access premium feature", async ({ page }) => {
    await signIn(page, testUsers.premiumUser);
    await page.goto("/executor-toolkit");
    await expect(page).not.toHaveURL(/\/pricing|\/plan/);
    await expect(
      page.locator('h1:has-text("Executor\'s Toolkit")'),
    ).toBeVisible();
    await signOut(page);
  });

  test("Premium feature badge is visible to free users but not to premium", async ({
    page,
  }) => {
    await signIn(page, testUsers.freeUser);
    await page.goto("/dashboard");
    const freeBadges = await page
      .locator('.premium-badge, [data-premium="true"]')
      .count();
    expect(freeBadges).toBeGreaterThan(0);
    await signOut(page);

    await signIn(page, testUsers.premiumUser);
    await page.goto("/dashboard");
    const premiumBadges = await page
      .locator('.premium-badge, [data-premium="true"]')
      .count();
    expect(premiumBadges).toBe(0);
    await signOut(page);
  });
});
