import { test, expect } from '@playwright/test';
import { bypassPasswordWall } from './utils/auth';

test('minimal test - server connection', async ({ page }) => {
  // Bypass password wall
  await bypassPasswordWall(page);
  
  console.log('Navigating to homepage...');
  await page.goto('/', { timeout: 60000, waitUntil: 'networkidle' });
  
  console.log('Page loaded, checking title...');
  const title = await page.title();
  console.log('Title:', title);
  
  expect(title).toBeTruthy();
});
