import { test, expect } from "@playwright/test";

test.describe("Vault Assets Display", () => {
  test.beforeEach(async ({ page }) => {
    // Enable E2E mode by setting the mock user
    await page.addInitScript(() => {
      window.__E2E_USER = {
        id: 'mock_user_id',
        email: 'test@example.com',
        name: 'Test User',
      };
    });
  });

  test("Vault displays static test assets in E2E mode", async ({ page }) => {
    // Navigate to Vault
    await page.goto("/vault");

    // Wait for the vault container to load
    await page.waitForSelector('[data-testid="vault-container"]');

    // Verify the heading is displayed
    const heading = page.locator('h1');
    await expect(heading).toContainText('Your Vault');

    // Verify the Add Asset button is present
    const addAssetButton = page.locator('[data-testid="add-asset-button"]');
    await expect(addAssetButton).toBeVisible();
    await expect(addAssetButton).toContainText('Add Asset');

    // Verify that exactly 3 test asset cards are displayed
    const assetCards = page.locator('[data-testid="asset-card"]');
    await expect(assetCards).toHaveCount(3);

    // Verify the first asset card has expected content
    const firstAsset = assetCards.first();
    await expect(firstAsset).toContainText('Test Asset 1');
    await expect(firstAsset).toContainText('Bank Account');
    await expect(firstAsset).toContainText('$50,000');

    // Verify the second asset card
    const secondAsset = assetCards.nth(1);
    await expect(secondAsset).toContainText('Test Asset 2');
    await expect(secondAsset).toContainText('Investment Portfolio');
    await expect(secondAsset).toContainText('$125,000');

    // Verify the third asset card
    const thirdAsset = assetCards.nth(2);
    await expect(thirdAsset).toContainText('Test Asset 3');
    await expect(thirdAsset).toContainText('Real Estate');
    await expect(thirdAsset).toContainText('$450,000');
  });

  test("Asset cards have View Details buttons", async ({ page }) => {
    // Navigate to Vault
    await page.goto("/vault");

    // Wait for asset cards to load
    await page.waitForSelector('[data-testid="asset-card"]');

    // Get all View Details buttons within asset cards
    const viewDetailsButtons = page.locator('[data-testid="asset-card"] button:has-text("View Details")');
    
    // Verify each asset card has a View Details button
    await expect(viewDetailsButtons).toHaveCount(3);
    
    // All buttons should be visible
    for (let i = 0; i < 3; i++) {
      await expect(viewDetailsButtons.nth(i)).toBeVisible();
    }
  });

  test("Add Asset button is clickable", async ({ page }) => {
    // Navigate to Vault
    await page.goto("/vault");

    // Wait for the Add Asset button
    const addAssetButton = page.locator('[data-testid="add-asset-button"]');
    await expect(addAssetButton).toBeVisible();

    // Verify the button is enabled and clickable
    await expect(addAssetButton).toBeEnabled();
    
    // Click the button (even if it doesn't do anything in E2E mode)
    await addAssetButton.click();
    
    // The page should still be stable after clicking
    await expect(page.locator('[data-testid="vault-container"]')).toBeVisible();
  });
});
