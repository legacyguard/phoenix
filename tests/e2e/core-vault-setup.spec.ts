import { test, expect } from '@playwright/test';
import { signUp, testUsers } from './utils/auth';

test.describe('Core Vault Setup Journey', () => {
  test('New user completes core vault setup', async ({ page }) => {
    // Step 1: Sign up a new user
    await signUp(page, testUsers.newUser);
    
    // Verify we're on the dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Check initial plan strength (should be 0%)
    const initialStrength = await page.locator('[data-testid="plan-strength-value"]').textContent();
    expect(initialStrength).toBe('0%');
    
    // Step 2: Add a Trusted Person
    await page.click('button:has-text("Add Trusted Person")');
    
    // Wait for modal/form to appear
    await page.waitForSelector('[data-testid="trusted-person-form"]');
    
    // Fill in trusted person details
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '+1234567890');
    await page.selectOption('select[name="relationship"]', 'spouse');
    await page.selectOption('select[name="role"]', 'executor');
    
    // Save trusted person
    await page.click('button[type="submit"]:has-text("Add Trusted Person")');
    
    // Wait for success message
    await expect(page.locator('text=Trusted person added successfully')).toBeVisible();
    
    // Verify plan strength increased
    await page.waitForTimeout(1000); // Wait for animation
    const strengthAfterTrusted = await page.locator('[data-testid="plan-strength-value"]').textContent();
    const strengthValueAfterTrusted = parseInt(strengthAfterTrusted || '0');
    expect(strengthValueAfterTrusted).toBeGreaterThan(0);
    
    // Step 3: Add an Asset
    await page.click('a[href="/vault"]');
    await page.click('button:has-text("Add Asset")');
    
    // Fill in asset details
    await page.fill('input[name="name"]', 'Primary Checking Account');
    await page.selectOption('select[name="category"]', 'bank-accounts');
    await page.fill('input[name="value"]', '50000');
    await page.fill('textarea[name="description"]', 'Main household checking account at Local Bank');
    
    // Add account details
    await page.fill('input[name="accountNumber"]', '****1234');
    await page.fill('input[name="bankName"]', 'Local Bank');
    
    // Save asset
    await page.click('button[type="submit"]:has-text("Save Asset")');
    
    // Wait for navigation back to vault
    await expect(page).toHaveURL(/\/vault/);
    
    // Verify asset appears in the list
    await expect(page.locator('text=Primary Checking Account')).toBeVisible();
    
    // Navigate back to dashboard to check plan strength
    await page.click('a[href="/dashboard"]');
    const strengthAfterAsset = await page.locator('[data-testid="plan-strength-value"]').textContent();
    const strengthValueAfterAsset = parseInt(strengthAfterAsset || '0');
    expect(strengthValueAfterAsset).toBeGreaterThan(strengthValueAfterTrusted);
    
    // Step 4: Upload a Document
    await page.click('a[href="/documents"]');
    await page.click('button:has-text("Upload Document")');
    
    // Wait for upload modal
    await page.waitForSelector('[data-testid="document-upload-modal"]');
    
    // Select document type
    await page.selectOption('select[name="documentType"]', 'will');
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      {
        name: 'test-will.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('PDF content')
      }
    ]);
    
    // Add document details
    await page.fill('input[name="documentName"]', 'Last Will and Testament');
    await page.fill('textarea[name="notes"]', 'Updated will signed on January 1, 2024');
    
    // Upload document
    await page.click('button:has-text("Upload Document")');
    
    // Wait for success message
    await expect(page.locator('text=Document uploaded successfully')).toBeVisible();
    
    // Verify document appears in the list
    await expect(page.locator('text=Last Will and Testament')).toBeVisible();
    
    // Final Step: Verify overall plan strength increase
    await page.click('a[href="/dashboard"]');
    const finalStrength = await page.locator('[data-testid="plan-strength-value"]').textContent();
    const finalStrengthValue = parseInt(finalStrength || '0');
    
    // Should have increased significantly after completing all steps
    expect(finalStrengthValue).toBeGreaterThanOrEqual(25); // At least 25% for basic setup
    
    // Verify progress indicators show completed steps
    await expect(page.locator('[data-testid="step-trusted-person"][data-completed="true"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-assets"][data-completed="true"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-documents"][data-completed="true"]')).toBeVisible();
  });

  test('Plan strength calculation accuracy', async ({ page }) => {
    // Sign up and complete various tasks to verify strength calculation
    await signUp(page, {
      email: `test-strength-${Date.now()}@example.com`,
      password: 'TestPassword123!'
    });
    
    // Track strength at each step
    const strengthValues: number[] = [];
    
    // Initial strength
    const getStrength = async () => {
      const text = await page.locator('[data-testid="plan-strength-value"]').textContent();
      return parseInt(text || '0');
    };
    
    strengthValues.push(await getStrength());
    
    // Add multiple trusted persons
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Add Trusted Person")');
      await page.fill('input[name="name"]', `Person ${i + 1}`);
      await page.fill('input[name="email"]', `person${i + 1}@example.com`);
      await page.selectOption('select[name="role"]', i === 0 ? 'executor' : 'beneficiary');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }
    
    strengthValues.push(await getStrength());
    
    // Verify strength increases are proportional
    for (let i = 1; i < strengthValues.length; i++) {
      expect(strengthValues[i]).toBeGreaterThan(strengthValues[i - 1]);
    }
  });
});
