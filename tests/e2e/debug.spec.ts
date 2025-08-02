import { test, expect } from '@playwright/test';

test('debug server connection', async ({ page }) => {
  console.log('Attempting to navigate to http://localhost:8080');
  
  try {
    await page.goto('http://localhost:8080', { timeout: 30000 });
    console.log('Successfully navigated to the page');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-screenshot.png' });
    
    // Log the page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Log the page content
    const content = await page.content();
    console.log('Page content length:', content.length);
    console.log('First 500 chars:', content.substring(0, 500));
    
    // Check if there's any error in console
    page.on('console', msg => console.log('Console:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('Page error:', err));
    
  } catch (error) {
    console.error('Error navigating to page:', error);
    throw error;
  }
});
