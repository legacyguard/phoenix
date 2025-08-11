import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Document Upload Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for all tests
    await page.addInitScript(() => {
      (window as Record<string, unknown>).Clerk = {
        isSignedIn: () => true,
        user: {
          id: "test-user-id",
          emailAddresses: [{ emailAddress: "test@example.com" }],
          firstName: "Test",
          lastName: "User",
        },
      };
    });
  });

  test("should display upload zone correctly", async ({ page }) => {
    await page.goto("/dashboard");

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

    // Create a test file
    const testFilePath = path.join(__dirname, "../fixtures/test-document.pdf");

    // Mock file input
    await page.setInputFiles('input[type="file"]', testFilePath);

    // Should show file preview or processing state
    await expect(page.locator("text=Processing")).toBeVisible();
  });

  test("should handle drag and drop", async ({ page }) => {
    await page.goto("/dashboard");

    const uploadZone = page.locator('[data-testid="upload-zone"]');

    // Create a test file
    const testFilePath = path.join(__dirname, "../fixtures/test-document.pdf");

    // Simulate drag and drop
    await uploadZone.dispatchEvent("drop", {
      dataTransfer: {
        files: [testFilePath],
      },
    });

    // Should show processing state
    await expect(page.locator("text=Processing")).toBeVisible();
  });

  test("should validate file types", async ({ page }) => {
    await page.goto("/dashboard");

    // Create an invalid file
    const invalidFilePath = path.join(
      __dirname,
      "../fixtures/invalid-file.txt",
    );

    // Mock file input with invalid file
    await page.setInputFiles('input[type="file"]', invalidFilePath);

    // Should show error message for invalid file type
    await expect(page.locator("text=Invalid file type")).toBeVisible();
  });

  test("should handle upload errors gracefully", async ({ page }) => {
    await page.goto("/dashboard");

    // Mock network error
    await page.route("**/api/upload", (route) => {
      route.abort("failed");
    });

    const testFilePath = path.join(__dirname, "../fixtures/test-document.pdf");
    await page.setInputFiles('input[type="file"]', testFilePath);

    // Should show error message
    await expect(page.locator("text=Upload failed")).toBeVisible();
  });

  test("should show upload progress", async ({ page }) => {
    await page.goto("/dashboard");

    // Mock upload progress
    await page.route("**/api/upload", (route) => {
      // Simulate progress
      route.fulfill({
        status: 200,
        body: JSON.stringify({ progress: 50 }),
      });
    });

    const testFilePath = path.join(__dirname, "../fixtures/test-document.pdf");
    await page.setInputFiles('input[type="file"]', testFilePath);

    // Should show progress indicator
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
  });

  test("should complete upload successfully", async ({ page }) => {
    await page.goto("/dashboard");

    // Mock successful upload
    await page.route("**/api/upload", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          documentId: "doc-123",
          filename: "test-document.pdf",
        }),
      });
    });

    const testFilePath = path.join(__dirname, "../fixtures/test-document.pdf");
    await page.setInputFiles('input[type="file"]', testFilePath);

    // Should show success message
    await expect(page.locator("text=Upload successful")).toBeVisible();

    // Should show document in list
    await expect(page.locator("text=test-document.pdf")).toBeVisible();
  });
});
