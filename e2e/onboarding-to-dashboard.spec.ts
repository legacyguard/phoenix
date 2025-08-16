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
    // Step 1: Visit page and start registration
    await page.goto('http://localhost:4173');
    
    // Verify landing page loads
    await expect(page.locator('h1')).toContainText('Each of us has things in life');
    
    // Find and click "Get Started" or similar button
    const getStartedButton = page.getByRole('button', { name: /begin calmly|get started|start/i });
    await expect(getStartedButton).toBeVisible();
    await getStartedButton.click();

    // Step 2: Complete story-driven onboarding
    await expect(page).toHaveURL(/.*onboarding.*/);
    
    // Verify onboarding conversation starts
    await expect(page.locator('h2')).toContainText("We'll help you organize it");
    
    // Complete Scene 1: Safety Box
    const safetyBoxTextarea = page.locator('textarea').first();
    await safetyBoxTextarea.fill('Important documents, family photos, insurance policies');
    
    // Navigate to next scene (if there's a next button)
    const nextButton = page.getByRole('button', { name: /next|continue|next scene/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }
    
    // Complete Scene 2: Trusted Person
    const trustedPersonTextarea = page.locator('textarea').last();
    await trustedPersonTextarea.fill('My spouse Jane and my son Michael');
    
    // Submit onboarding
    const submitButton = page.getByRole('button', { name: /submit|finish|complete/i });
    await submitButton.click();
    
    // Wait for onboarding completion and redirect
    await page.waitForURL(/.*dashboard.*/);

    // Step 3: Verify dashboard loads correctly
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Verify personalized header
    await expect(page.locator('h1')).toContainText('Your Treasure Box, TestUser');
    await expect(page.locator('p')).toContainText('An Overview of Your Legacy');
    
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
    await expect(nextBestStepSection).toBeVisible();
    
    // Verify it shows priority area
    await expect(nextBestStepSection).toContainText('Next Best Step');
    await expect(nextBestStepSection).toContainText('is an');
    
    // Find and click the CTA button
    const startButton = page.getByRole('button', { name: /start this.*step|begin.*step/i });
    await expect(startButton).toBeVisible();
    await startButton.click();

    // Step 5: Verify MicroTaskEngine opens
    const microTaskEngine = page.locator('[data-testid="microtask-engine"], .microtask-engine, [role="dialog"]');
    await expect(microTaskEngine).toBeVisible();
    
    // Verify SheetHeader shows correct task title
    const sheetHeader = page.locator('[data-testid="sheet-header"], .sheet-header, [role="banner"]');
    if (await sheetHeader.isVisible()) {
      await expect(sheetHeader).toContainText(/Secure Bank Account|Add Bank Account|Financial Security/i);
    }
    
    // Verify task content is visible
    const taskContent = page.locator('[data-testid="task-content"], .task-content, [role="main"]');
    await expect(taskContent).toBeVisible();
  });

  test('dashboard shows correct life areas based on onboarding data', async ({ page }) => {
    // Complete onboarding first
    await completeOnboarding(page);
    
    // Navigate to dashboard
    await page.goto('http://localhost:4173/dashboard');
    
    // Verify life areas are displayed
    const lifeAreas = page.locator('[role="region"], .life-area, [data-testid="life-area"]');
    await expect(lifeAreas).toHaveCount(4); // Financial, Property, Family, Legal
    
    // Verify financial security area (always present)
    const financialArea = page.locator('text=Financial Security').first();
    await expect(financialArea).toBeVisible();
    
    // Verify property area (based on onboarding data)
    const propertyArea = page.locator('text=Home & Property');
    await expect(propertyArea).toBeVisible();
    
    // Verify family protection area (based on onboarding data)
    const familyArea = page.locator('text=Family Protection');
    await expect(familyArea).toBeVisible();
    
    // Verify legal documents area (always present)
    const legalArea = page.locator('text=Legal Documents');
    await expect(legalArea).toBeVisible();
  });

  test('scenario planning section is accessible', async ({ page }) => {
    // Complete onboarding first
    await completeOnboarding(page);
    
    // Navigate to dashboard
    await page.goto('http://localhost:4173/dashboard');
    
    // Verify scenario planning section
    const scenarioSection = page.locator('text=Life Scenario Planning');
    await expect(scenarioSection).toBeVisible();
    
    // Verify scenario buttons
    const scenarioButtons = page.locator('button:has-text("What if")');
    await expect(scenarioButtons).toHaveCount(4);
    
    // Click on a scenario button
    const firstScenarioButton = scenarioButtons.first();
    await firstScenarioButton.click();
    
    // Verify ScenarioPlanner opens
    const scenarioPlanner = page.locator('[data-testid="scenario-planner"], .scenario-planner, [role="dialog"]');
    await expect(scenarioPlanner).toBeVisible();
  });
});

// Helper function to complete onboarding
async function completeOnboarding(page: any) {
  await page.goto('http://localhost:4173/onboarding/wizard');
  
  // Fill safety box question
  const safetyBoxTextarea = page.locator('textarea').first();
  await safetyBoxTextarea.fill('Important documents, family photos, insurance policies');
  
  // Fill trusted person question
  const trustedPersonTextarea = page.locator('textarea').last();
  await trustedPersonTextarea.fill('My spouse Jane and my son Michael');
  
  // Submit
  const submitButton = page.getByRole('button', { name: /submit|finish|complete/i });
  await submitButton.click();
  
  // Wait for completion
  await page.waitForURL(/.*dashboard.*/);
}
