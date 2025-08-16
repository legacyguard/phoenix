import { test, expect } from '@playwright/test';

test.describe('Onboarding to Dashboard - Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Clerk authentication state
    // Set localStorage to simulate authenticated user
    await page.goto('http://localhost:4173');
    await page.evaluate(() => {
      localStorage.setItem('clerk-db', JSON.stringify({
        lastActiveTokenId: 'mock-token',
        client: {
          activeSessions: [{
            id: 'mock-session',
            userId: 'mock-user-id',
            status: 'active',
            lastActiveAt: Date.now()
          }]
        }
      }));
      
      // Mock user metadata
      localStorage.setItem('clerk-user-metadata', JSON.stringify({
        firstName: 'TestUser',
        publicMetadata: {
          onboardingData: null // Will be filled during onboarding
        }
      }));
    });
  });

  test('complete onboarding flow and interact with dashboard', async ({ page }) => {
    // Step 1: Visit page and wait for React app to load
    await page.goto('http://localhost:4173');
    
    // Wait for React app to load - look for any content in the root div
    await page.waitForSelector('#root:has(*)', { timeout: 10000 });
    
    // Wait a bit more for the app to fully render
    await page.waitForTimeout(1000);
    
    // Verify landing page loads - look for the actual content
    await expect(page.locator('h1')).toContainText('Each of us has things in life', { timeout: 10000 });
    
    // Find and click "Get Started" or similar button
    const getStartedButton = page.getByRole('button', { name: /begin calmly|get started|start/i });
    await expect(getStartedButton).toBeVisible({ timeout: 10000 });
    await getStartedButton.click();

    // Step 2: Complete story-driven onboarding
    await expect(page).toHaveURL(/.*onboarding.*/);
    
    // Wait for onboarding page to load
    await page.waitForTimeout(1000);
    
    // Verify onboarding conversation starts
    await expect(page.locator('h2')).toContainText("We'll help you organize it", { timeout: 10000 });
    
    // Complete Scene 1: Safety Box
    const safetyBoxTextarea = page.locator('textarea').first();
    await expect(safetyBoxTextarea).toBeVisible({ timeout: 10000 });
    await safetyBoxTextarea.fill('Important documents, family photos, insurance policies');
    
    // Navigate to next scene (if there's a next button)
    const nextButton = page.getByRole('button', { name: /next|continue|next scene/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }
    
    // Complete Scene 2: Trusted Person
    const trustedPersonTextarea = page.locator('textarea').last();
    await expect(trustedPersonTextarea).toBeVisible({ timeout: 10000 });
    await trustedPersonTextarea.fill('My spouse Jane and my son Michael');
    
    // Submit onboarding
    const submitButton = page.getByRole('button', { name: /submit|finish|complete/i });
    await expect(submitButton).toBeVisible({ timeout: 10000 });
    await submitButton.click();
    
    // Wait for onboarding completion and redirect
    await page.waitForURL(/.*dashboard.*/, { timeout: 15000 });

    // Step 3: Verify dashboard loads correctly
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Wait for dashboard to load
    await page.waitForTimeout(1000);
    
    // Verify personalized header
    await expect(page.locator('h1')).toContainText('Your Treasure Box, TestUser', { timeout: 10000 });
    await expect(page.locator('p')).toContainText('An Overview of Your Legacy', { timeout: 10000 });
    
    // Verify FirstTimeUserGuide appears (if implemented)
    const guideElement = page.locator('[data-testid="first-time-guide"], .first-time-guide, [role="dialog"]');
    if (await guideElement.isVisible()) {
      // Skip or complete the guide
      const skipButton = page.getByRole('button', { name: /skip|close|got it/i });
      if (await skipButton.isVisible()) {
        await skipButton.click();
      }
    }

    // Step 4: Verify "Next Best Step" section
    const nextBestStepSection = page.locator('[role="status"], .next-best-step, [aria-live="polite"]');
    await expect(nextBestStepSection).toBeVisible({ timeout: 10000 });
    
    // Verify it shows priority area
    await expect(nextBestStepSection).toContainText('Next Best Step', { timeout: 10000 });
    await expect(nextBestStepSection).toContainText('is an', { timeout: 10000 });
    
    // Find and click the CTA button
    const startButton = page.getByRole('button', { name: /start this.*step|begin.*step/i });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();

    // Step 5: Verify MicroTaskEngine opens
    const microTaskEngine = page.locator('[data-testid="microtask-engine"], .microtask-engine, [role="dialog"]');
    await expect(microTaskEngine).toBeVisible({ timeout: 10000 });
    
    // Verify SheetHeader shows correct task title
    const sheetHeader = page.locator('[data-testid="sheet-header"], .sheet-header, [role="banner"]');
    if (await sheetHeader.isVisible()) {
      await expect(sheetHeader).toContainText(/Secure Bank Account|Add Bank Account|Financial Security/i, { timeout: 10000 });
    }
    
    // Verify task content is visible
    const taskContent = page.locator('[data-testid="task-content"], .task-content, [role="main"]');
    await expect(taskContent).toBeVisible({ timeout: 10000 });
  });

  test('dashboard shows correct life areas based on onboarding data', async ({ page }) => {
    // Complete onboarding first
    await completeOnboarding(page);
    
    // Navigate to dashboard
    await page.goto('http://localhost:4173/dashboard');
    
    // Wait for dashboard to load
    await page.waitForTimeout(1000);
    
    // Verify life areas are displayed
    const lifeAreas = page.locator('[role="region"], .life-area, [data-testid="life-area"]');
    await expect(lifeAreas).toHaveCount(4, { timeout: 10000 }); // Financial, Property, Family, Legal
    
    // Verify financial security area (always present)
    const financialArea = page.locator('text=Financial Security').first();
    await expect(financialArea).toBeVisible({ timeout: 10000 });
    
    // Verify property area (based on onboarding data)
    const propertyArea = page.locator('text=Home & Property');
    await expect(propertyArea).toBeVisible({ timeout: 10000 });
    
    // Verify family protection area (based on onboarding data)
    const familyArea = page.locator('text=Family Protection');
    await expect(familyArea).toBeVisible({ timeout: 10000 });
    
    // Verify legal documents area (always present)
    const legalArea = page.locator('text=Legal Documents');
    await expect(legalArea).toBeVisible({ timeout: 10000 });
  });

  test('scenario planning section is accessible', async ({ page }) => {
    // Complete onboarding first
    await completeOnboarding(page);
    
    // Navigate to dashboard
    await page.goto('http://localhost:4173/dashboard');
    
    // Wait for dashboard to load
    await page.waitForTimeout(1000);
    
    // Verify scenario planning section
    const scenarioSection = page.locator('text=Life Scenario Planning');
    await expect(scenarioSection).toBeVisible({ timeout: 10000 });
    
    // Verify scenario buttons
    const scenarioButtons = page.locator('button:has-text("What if")');
    await expect(scenarioButtons).toHaveCount(4, { timeout: 10000 });
    
    // Click on a scenario button
    const firstScenarioButton = scenarioButtons.first();
    await firstScenarioButton.click();
    
    // Verify ScenarioPlanner opens
    const scenarioPlanner = page.locator('[data-testid="scenario-planner"], .scenario-planner, [role="dialog"]');
    await expect(scenarioPlanner).toBeVisible({ timeout: 10000 });
  });
});

// Helper function to complete onboarding
async function completeOnboarding(page: any) {
  await page.goto('http://localhost:4173/onboarding/wizard');
  
  // Wait for onboarding page to load
  await page.waitForTimeout(1000);
  
  // Fill safety box question
  const safetyBoxTextarea = page.locator('textarea').first();
  await expect(safetyBoxTextarea).toBeVisible({ timeout: 10000 });
  await safetyBoxTextarea.fill('Important documents, family photos, insurance policies');
  
  // Fill trusted person question
  const trustedPersonTextarea = page.locator('textarea').last();
  await expect(trustedPersonTextarea).toBeVisible({ timeout: 10000 });
  await trustedPersonTextarea.fill('My spouse Jane and my son Michael');
  
  // Submit
  const submitButton = page.getByRole('button', { name: /submit|finish|complete/i });
  await expect(submitButton).toBeVisible({ timeout: 10000 });
  await submitButton.click();
  
  // Wait for completion
  await page.waitForURL(/.*dashboard.*/, { timeout: 15000 });
}
