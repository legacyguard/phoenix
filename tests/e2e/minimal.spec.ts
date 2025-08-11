import { test, expect } from '@playwright/test';

test('minimal test - server connection', async ({ page }) => {
  console.log('Navigating to homepage...');
  await page.goto('/', { timeout: 60000, waitUntil: 'networkidle' });
  
  console.log('Page loaded, checking title...');
  const title = await page.title();
  console.log('Title:', title);
  
  expect(title).toBeTruthy();
});
