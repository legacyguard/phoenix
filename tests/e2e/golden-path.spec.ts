import { test, expect } from '@playwright/test';
import { login } from './utils/auth';

test.describe('Heritage Vault Golden Path', () => {
  test('New user completes core vault setup journey', async ({ page }) => {
    // Sign in using real Clerk authentication
    await login(page);
    
    // Step 2: Assert Dashboard is visible
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
    
    // Step 3: Navigate to Vault
    await page.click('[data-testid="nav-vault"]');
    await expect(page).toHaveURL(/\/vault/);
    
    // Step 4: Click to add a new asset
    await page.click('[data-testid="add-asset-button"]');
    
    // Step 5: Verify DynamicAssetForm appears
    await expect(page.locator('[data-testid="dynamic-asset-form"]')).toBeVisible();
    await expect(page.locator('text=Add New Asset')).toBeVisible();
    
    // Fill in basic asset information
    await page.fill('[data-testid="asset-name-input"]', 'Family Home');
    await page.selectOption('[data-testid="asset-type-select"]', 'real-estate');
    await page.fill('[data-testid="asset-value-input"]', '500000');
    
    // Cancel for now (don't save)
    await page.click('[data-testid="cancel-button"]');
    
    // Step 6: Navigate to Trusted Circle
    await page.click('[data-testid="nav-trusted-circle"]');
    await expect(page).toHaveURL(/\/trusted-circle/);
    
    // Step 7: Click to add a new person
    await page.click('[data-testid="add-person-button"]');
    
    // Step 8: Verify form appears
    await expect(page.locator('[data-testid="add-person-form"]')).toBeVisible();
    await expect(page.locator('text=Add Trusted Person')).toBeVisible();
    
    // Fill in person information
    await page.fill('[data-testid="person-name-input"]', 'John Doe');
    await page.fill('[data-testid="person-email-input"]', 'john.doe@example.com');
    await page.selectOption('[data-testid="person-role-select"]', 'executor');
    
    // Cancel for now
    await page.click('[data-testid="cancel-button"]');
    
    // Verify we're back on the trusted circle page
    await expect(page.locator('h1:has-text("Your Trusted Circle")')).toBeVisible();
  });

  test('User explores all main features', async ({ page }) => {
    await login(page);
    
    // Test navigation to all main sections
    const sections = [
      { nav: 'nav-dashboard', url: '/dashboard', title: 'Welcome back' },
      { nav: 'nav-vault', url: '/vault', title: 'Your Vault' },
      { nav: 'nav-trusted-circle', url: '/trusted-circle', title: 'Your Trusted Circle' },
      { nav: 'nav-legacy-briefing', url: '/legacy-briefing', title: 'Legacy Briefing' }
    ];
    
    for (const section of sections) {
      await page.click(`[data-testid="${section.nav}"]`);
      await expect(page).toHaveURL(new RegExp(section.url));
      await expect(page.locator(`h1:has-text("${section.title}")`)).toBeVisible();
    }
  });
});
