import { test, expect } from '@playwright/test';

test.describe('User Login Flow', () => {
  test('should display login page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads without errors
    await expect(page).toHaveTitle(/LegacyGuard/);
    
    // Verify login elements are present
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should handle login form validation', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should navigate to dashboard after successful login', async ({ page }) => {
    await page.goto('/');
    
    // Mock successful authentication
    await page.addInitScript(() => {
      // Mock Clerk authentication
      (window as Record<string, unknown>).Clerk = {
        isSignedIn: () => true,
        user: {
          id: 'test-user-id',
          emailAddresses: [{ emailAddress: 'test@example.com' }],
          firstName: 'Test',
          lastName: 'User'
        }
      };
    });
    
    // Reload page to trigger auth check
    await page.reload();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Mock authentication error
    await page.addInitScript(() => {
      (window as Record<string, unknown>).Clerk = {
        isSignedIn: () => false,
        openSignIn: () => {
          throw new Error('Authentication failed');
        }
      };
    });
    
    // Should show error message
    await expect(page.locator('text=Authentication failed')).toBeVisible();
  });
}); 