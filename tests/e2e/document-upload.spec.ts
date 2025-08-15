import { test, expect } from "@playwright/test";
import { getFixturePath } from "./utils/fixtures";

test.describe("Document Upload Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Seed a basic free user for dashboard access in E2E mode
    await page.addInitScript(() => {
      (window as any).__E2E_USER = { id: 'free_user', publicMetadata: { plan: 'free' } };
      try { localStorage.setItem('legacyguard_auth', 'true'); } catch {}
    });
  });

  test("should display upload zone correctly", async ({ page }) => {
    await page.goto("/dashboard");

    // Ensure app mounted (dashboard probe rendered)
    await page.waitForSelector('#e2e-probe', { timeout: 10000 });

    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="upload-zone"]', {
      timeout: 10000,
    });

    // Verify upload zone is visible
    await expect(page.locator('[data-testid="upload-zone"]')).toBeVisible();
    await expect(page.locator("text=Drop files here")).toBeVisible();
  });

  test("should handle file selection via button", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector('#e2e-probe', { timeout: 10000 });
    await page.waitForSelector('[data-testid="upload-zone"]', { timeout: 10000 });

    // Create a test file
    const testFilePath = getFixturePath("test-document.pdf");

    // Mock file input
    await page.setInputFiles('input[type="file"]', testFilePath);

    // Should show processing state via harness
    await expect(page.locator('#e2e-upload-status')).toHaveText('Processing');
  });

  test("should handle drag and drop", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector('#e2e-probe', { timeout: 10000 });
    await page.waitForSelector('[data-testid="upload-zone"]', { timeout: 10000 });

    const uploadZone = page.locator('[data-testid="upload-zone"]');

    // Create a test file
    const testFilePath = getFixturePath("test-document.pdf");

    // Simulate drag and drop
    await uploadZone.dispatchEvent("drop", {
      dataTransfer: {
        files: [testFilePath],
      },
    });

    // Should show processing state via harness
    await expect(page.locator('#e2e-upload-status')).toHaveText('Processing');
  });

  test("should validate file types", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector('#e2e-probe', { timeout: 10000 });
    await page.waitForSelector('[data-testid="upload-zone"]', { timeout: 10000 });

    // Create an invalid file
    const invalidFilePath = getFixturePath("invalid-file.txt");

    // Mock file input with invalid file
    await page.setInputFiles('input[type="file"]', invalidFilePath);

    // Should show error message for invalid file type via harness
    await expect(page.locator('#e2e-upload-status')).toHaveText('Invalid file type');
  });

test("should handle upload errors gracefully", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector('#e2e-probe', { timeout: 10000 });
    await page.waitForSelector('[data-testid="upload-zone"]', { timeout: 10000 });

    // Create a temporary file with 'error' in the name to trigger harness error
    const os = await import('os');
    const fs = await import('fs');
    const path = await import('path');
    const tmpDir = os.tmpdir();
    const tmpFile = path.join(tmpDir, `upload-error-${Date.now()}.pdf`);
    fs.writeFileSync(tmpFile, 'dummy');

    await page.setInputFiles('input[type="file"]', tmpFile);

    // Should show error message via harness
    await expect(page.locator('#e2e-upload-status')).toHaveText('Upload failed');
  });

  test("should show upload progress", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector('#e2e-probe', { timeout: 10000 });
    await page.waitForSelector('[data-testid="upload-zone"]', { timeout: 10000 });

    const testFilePath = getFixturePath("test-document.pdf");
    await page.setInputFiles('input[type="file"]', testFilePath);

    // Should show progress indicator (briefly visible) via harness
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
  });

  test("should complete upload successfully", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector('#e2e-probe', { timeout: 10000 });
    await page.waitForSelector('[data-testid="upload-zone"]', { timeout: 10000 });

    const testFilePath = getFixturePath("test-document.pdf");
    await page.setInputFiles('input[type="file"]', testFilePath);

    // Should show success message via harness
    await expect(page.locator('#e2e-upload-status')).toHaveText('Upload successful');
  });
});
