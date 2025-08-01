import { test, expect } from '@playwright/test';
import { signIn, testUsers } from './utils/auth';

test.describe('Asset Story Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await signIn(page, testUsers.freeUser);
  });

  test('User can add a story to an asset', async ({ page }) => {
    // Navigate to Vault
    await page.goto('/vault');
    
    // Wait for assets to load
    await page.waitForSelector('[data-testid="asset-card"]');
    
    // Click on the first asset card
    const firstAsset = page.locator('[data-testid="asset-card"]').first();
    await firstAsset.click();
    
    // Wait for asset detail page to load
    await page.waitForSelector('[data-testid="asset-detail"]');
    
    // Click "Add a Story" button
    await page.click('button:has-text("Add a Story")');
    
    // Wait for story modal to appear
    await expect(page.locator('[data-testid="story-modal"]')).toBeVisible();
    
    // Type story text
    const storyText = 'This vintage watch belonged to my grandfather. He wore it every day for 40 years, and it never left his wrist. He gifted it to me on my 18th birthday with the words: "Time is the most precious gift we can give."';
    await page.fill('textarea[placeholder*="story"]', storyText);
    
    // Save the story
    await page.click('button:has-text("Save Story")');
    
    // Wait for modal to close
    await expect(page.locator('[data-testid="story-modal"]')).not.toBeVisible();
    
    // Verify story is displayed on the asset detail page
    const storySection = page.locator('[data-testid="asset-story-section"]');
    await expect(storySection).toBeVisible();
    await expect(storySection).toContainText(storyText);
  });

  test('User can edit an existing story', async ({ page }) => {
    // Navigate to an asset with an existing story
    await page.goto('/vault');
    
    // Create an asset with a story first
    const assetName = `Test Asset ${Date.now()}`;
    await page.click('button:has-text("Add Asset")');
    await page.fill('input[name="name"]', assetName);
    await page.selectOption('select[name="category"]', 'personal-items');
    await page.fill('textarea[name="description"]', 'Test asset for story editing');
    await page.click('button[type="submit"]');
    
    // Wait for navigation back to vault
    await page.waitForURL('/vault');
    
    // Click on the newly created asset
    await page.click(`text=${assetName}`);
    
    // Add initial story
    await page.click('button:has-text("Add a Story")');
    const initialStory = 'Initial story content';
    await page.fill('textarea[placeholder*="story"]', initialStory);
    await page.click('button:has-text("Save Story")');
    
    // Edit the story
    await page.click('button[aria-label="Edit story"]');
    const updatedStory = 'Updated story with more details about the cherished memories';
    await page.fill('textarea[placeholder*="story"]', updatedStory);
    await page.click('button:has-text("Save Story")');
    
    // Verify updated story is displayed
    const storySection = page.locator('[data-testid="asset-story-section"]');
    await expect(storySection).toContainText(updatedStory);
    await expect(storySection).not.toContainText(initialStory);
  });

  test('Story character limit validation', async ({ page }) => {
    // Navigate to Vault and select an asset
    await page.goto('/vault');
    await page.locator('[data-testid="asset-card"]').first().click();
    
    // Open story modal
    await page.click('button:has-text("Add a Story")');
    
    // Try to enter text exceeding character limit (assuming 1000 char limit)
    const longStory = 'a'.repeat(1001);
    await page.fill('textarea[placeholder*="story"]', longStory);
    
    // Verify character counter shows limit
    const charCounter = page.locator('[data-testid="character-counter"]');
    await expect(charCounter).toContainText('1000/1000');
    
    // Verify error message or that extra characters are not accepted
    const textarea = page.locator('textarea[placeholder*="story"]');
    const actualValue = await textarea.inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(1000);
  });

  test('Story persists after page refresh', async ({ page }) => {
    // Navigate to Vault and add a story to an asset
    await page.goto('/vault');
    await page.locator('[data-testid="asset-card"]').first().click();
    
    // Add a story
    const persistentStory = 'This story should persist after refresh';
    await page.click('button:has-text("Add a Story")');
    await page.fill('textarea[placeholder*="story"]', persistentStory);
    await page.click('button:has-text("Save Story")');
    
    // Get the current URL
    const assetUrl = page.url();
    
    // Refresh the page
    await page.reload();
    
    // Verify story is still displayed
    const storySection = page.locator('[data-testid="asset-story-section"]');
    await expect(storySection).toBeVisible();
    await expect(storySection).toContainText(persistentStory);
  });
});
