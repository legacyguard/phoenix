import { test, expect } from "@playwright/test";

test.describe("Dashboard Core Elements", () => {
  test.beforeEach(async ({ page }) => {
    // Enable E2E mode by setting the mock user
    await page.addInitScript(() => {
      window.__E2E_USER = {
        id: 'test_user_id',
        email: 'test@example.com',
        name: 'Test User',
      };
    });
  });

  test("Dashboard displays plan strength in E2E mode", async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Wait for the dashboard container to load
    await page.waitForSelector('[data-testid="dashboard-container"]');

    // Verify the heading is displayed
    const heading = page.locator('[data-testid="dashboard-heading"]');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Welcome back');

    // Verify plan strength value is displayed
    const planStrength = page.locator('[data-testid="plan-strength-value"]');
    await expect(planStrength).toBeVisible();
    await expect(planStrength).toContainText('0%');

    // Verify the plan strength section has proper context
    const planSection = page.locator('h2:has-text("Your Legacy Plan Strength")');
    await expect(planSection).toBeVisible();
  });

  test("Dashboard shows action buttons in E2E mode", async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]');

    // Verify Add Trusted Person button exists
    const addTrustedPersonBtn = page.locator('[data-testid="add-trusted-person-button"]');
    await expect(addTrustedPersonBtn).toBeVisible();
    await expect(addTrustedPersonBtn).toContainText('Add Trusted Person');

    // Verify Add Asset button exists
    const addAssetBtn = page.locator('[data-testid="add-asset-button"]');
    await expect(addAssetBtn).toBeVisible();
    await expect(addAssetBtn).toContainText('Add Asset');

    // Verify Upload Document button exists
    const uploadDocBtn = page.locator('button:has-text("Upload Document")');
    await expect(uploadDocBtn).toBeVisible();
  });

  test("Dashboard displays progress indicators in E2E mode", async ({ page }) => {
    // Navigate to dashboard  
    await page.goto('/dashboard');

    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]');

    // Verify progress indicators are displayed
    const trustedPersonStep = page.locator('[data-testid="step-trusted-person"]');
    await expect(trustedPersonStep).toBeVisible();
    await expect(trustedPersonStep).toHaveAttribute('data-completed', 'true');
    await expect(trustedPersonStep).toContainText('Trusted Person Added');

    const assetsStep = page.locator('[data-testid="step-assets"]');
    await expect(assetsStep).toBeVisible();
    await expect(assetsStep).toHaveAttribute('data-completed', 'true');
    await expect(assetsStep).toContainText('Assets Added');

    const documentsStep = page.locator('[data-testid="step-documents"]');
    await expect(documentsStep).toBeVisible();
    await expect(documentsStep).toHaveAttribute('data-completed', 'true');
    await expect(documentsStep).toContainText('Documents Uploaded');
  });

  test("Plan strength value is stable and readable", async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]');

    // Get the plan strength value
    const planStrength = page.locator('[data-testid="plan-strength-value"]');
    
    // Verify it's visible and contains a percentage
    await expect(planStrength).toBeVisible();
    const strengthText = await planStrength.textContent();
    
    // Should be a valid percentage format
    expect(strengthText).toMatch(/^\d+%$/);
    
    // In E2E mode, it should be 0%
    expect(strengthText).toBe('0%');
  });

  test("All dashboard buttons are enabled and clickable", async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]');

    // Test Add Trusted Person button
    const addTrustedPersonBtn = page.locator('[data-testid="add-trusted-person-button"]');
    await expect(addTrustedPersonBtn).toBeEnabled();
    await addTrustedPersonBtn.click();
    // Dashboard should remain stable
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();

    // Test Add Asset button  
    const addAssetBtn = page.locator('[data-testid="add-asset-button"]');
    await expect(addAssetBtn).toBeEnabled();
    await addAssetBtn.click();
    // Dashboard should remain stable
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();

    // Test Upload Document button
    const uploadDocBtn = page.locator('button:has-text("Upload Document")');
    await expect(uploadDocBtn).toBeEnabled();
    await uploadDocBtn.click();
    // Dashboard should remain stable
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
  });
});
