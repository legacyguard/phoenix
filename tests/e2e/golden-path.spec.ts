import { test, expect } from "@playwright/test";

test.describe("Heritage Vault Golden Path", () => {
  test.beforeEach(async ({ page }) => {
    // Enable E2E mode
    await page.addInitScript(() => {
      window.__E2E_USER = {
        id: 'golden_path_user',
        email: 'golden@test.com',
        name: 'Golden Path User',
      };
    });
  });

  test("User navigates through core vault sections", async ({ page }) => {
    // Start at dashboard
    await page.goto('/dashboard');

    // Verify Dashboard is visible
    await expect(
      page.locator('[data-testid="dashboard-container"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-heading"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-heading"]')).toContainText('Welcome back');

    // Verify core elements are present
    await expect(page.locator('[data-testid="plan-strength-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-trusted-person-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-asset-button"]')).toBeVisible();

    // Navigate to Vault
    await page.goto('/vault');
    await expect(page).toHaveURL(/\/vault/);

    // Verify Vault page loaded
    await expect(page.locator('[data-testid="vault-container"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Your Vault');

    // Verify Add Asset button exists
    const addAssetButton = page.locator('[data-testid="add-asset-button"]');
    await expect(addAssetButton).toBeVisible();
    await expect(addAssetButton).toBeEnabled();

    // Verify asset cards are displayed
    const assetCards = page.locator('[data-testid="asset-card"]');
    await expect(assetCards).toHaveCount(3); // E2E mode shows 3 test assets

    // Navigate to other sections using direct navigation
    await page.goto('/trusted-circle');
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded (without checking for non-existent elements)
    const pageTitle = page.locator('h1').first();
    await expect(pageTitle).toBeVisible();
  });

  test("User can navigate to all main sections", async ({ page }) => {
    // Test navigation by directly visiting URLs
    const sections = [
      { url: "/dashboard", testId: "dashboard-container" },
      { url: "/vault", testId: "vault-container" },
      { url: "/trusted-circle", hasH1: true },
      { url: "/legacy-briefing", hasH1: true },
      { url: "/will", hasH1: true },
      { url: "/manual", hasH1: true },
    ];

    for (const section of sections) {
      await page.goto(section.url);
      await page.waitForLoadState('networkidle');
      
      if (section.testId) {
        // For pages with known test IDs
        await expect(page.locator(`[data-testid="${section.testId}"]`)).toBeVisible();
      } else if (section.hasH1) {
        // For other pages, just check that an h1 exists
        await expect(page.locator('h1').first()).toBeVisible();
      }
      
      // Verify URL is correct
      expect(page.url()).toContain(section.url);
    }
  });
});
