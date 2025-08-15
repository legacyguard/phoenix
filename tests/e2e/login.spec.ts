import { test, expect } from "@playwright/test";
import { signIn, signOut, testUsers } from "./utils/auth";

test.describe("User Login Flow", () => {
  test("should display login page correctly", async ({ page }) => {
    await page.goto("/");

    // Check if the page loads without errors (allow either legacy or new title)
    await expect(page).toHaveTitle(/LegacyGuard|Heritage Vault/i);

    // Verify that the page has loaded with key elements
    // Using more flexible selectors that work with the actual app
    const hasSignIn = await page.locator("text=Sign In").count() > 0;
    const hasGetStarted = await page.locator("text=Get Started").count() > 0;
    expect(hasSignIn || hasGetStarted).toBeTruthy();
  });

  test("should navigate to dashboard after successful login", async ({
    page,
  }) => {
    // Use E2E mode for authentication
    await signIn(page, testUsers.freeUser);

    // Should be on the dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Wait for dashboard elements to be visible
    await expect(
      page.locator('[data-testid="dashboard-container"], [data-testid="upload-zone"], #e2e-probe')
    ).toBeVisible({ timeout: 10000 });
  });

  test("should handle sign out correctly", async ({ page }) => {
    // First sign in
    await signIn(page, testUsers.freeUser);
    await expect(page).toHaveURL(/.*dashboard.*/);

    // Sign out
    await signOut(page);
    
    // Should be back on the home page
    await expect(page).toHaveURL("/");
    await expect(page).toHaveTitle(/LegacyGuard|Heritage Vault/i);
  });
});
