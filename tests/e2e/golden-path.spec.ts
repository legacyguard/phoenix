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
      { url: "/trusted-circle" },
      { url: "/legacy-briefing" },
      { url: "/will" },
      { url: "/manual" },
    ];

    for (const section of sections) {
      await page.goto(section.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      // Add a small delay for React to mount
      await page.waitForTimeout(500);
      
      if (section.testId) {
        // For pages with known test IDs, verify they're visible
        await expect(page.locator(`[data-testid="${section.testId}"]`)).toBeVisible({ timeout: 10000 });
      } else {
        // For other pages, just ensure the page loaded without errors
        // Check that we're not on an error page
        const notFoundText = await page.locator('text=404').count();
        const errorText = await page.locator('text=Error').count();
        expect(notFoundText).toBe(0);
        expect(errorText).toBe(0);
        
        // Verify the page has some content (any visible text)
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.length).toBeGreaterThan(10);
      }
      
      // Verify URL is correct
      expect(page.url()).toContain(section.url);
    }
  });
});
