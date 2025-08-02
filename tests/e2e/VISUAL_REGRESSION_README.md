# Visual Regression Testing Guide

This guide explains how to use and maintain the visual regression tests for the Heritage Vault application.

## Overview

Visual regression tests automatically capture screenshots of key pages and compare them against baseline images to detect unintended visual changes. This ensures that the UI remains consistent across updates.

## Prerequisites

1. Ensure you have test users configured in `.env.test`:
   ```
   E2E_TEST_USER_EMAIL=your-test-email@example.com
   E2E_TEST_USER_PASSWORD=your-test-password
   E2E_PREMIUM_USER_EMAIL=your-premium-email@example.com
   E2E_PREMIUM_USER_PASSWORD=your-premium-password
   ```

2. The development server must be running (handled automatically by Playwright).

## Running Visual Regression Tests

### First Time Setup

When running visual regression tests for the first time, you need to create baseline screenshots:

```bash
npm run test:visual:update
```

This will:
- Navigate to each page
- Take screenshots
- Save them as baseline images in `tests/e2e/visual-regression.spec.ts-snapshots/`

### Regular Test Runs

To run visual regression tests and compare against baselines:

```bash
npm run test:visual
```

This will:
- Take new screenshots
- Compare them with baseline images
- Report any differences

### Viewing Test Results

If tests fail, view the detailed report:

```bash
npm run test:visual:report
```

The report will show:
- Side-by-side comparisons
- Diff images highlighting changes
- Pixel difference percentages

## Updating Baselines

When you make intentional UI changes, you'll need to update the baseline screenshots:

1. Review the changes in the test report
2. If changes are intentional, update baselines:
   ```bash
   npm run test:visual:update
   ```
3. Review the new screenshots
4. Commit the updated baseline images to git

## Test Coverage

The visual regression suite covers:

### Desktop Views (1280x720)
- Landing page
- Dashboard (free and premium users)
- Vault
- Trusted Circle
- Legacy Briefing
- Will Generator
- Manual
- Pricing
- User Profile
- Subscriptions (premium)
- Family Hub
- Legacy Letters

### Mobile Views (375x667)
- Landing page
- Dashboard

### Dark Mode
- Dashboard

## Configuration

Visual regression settings are configured in `playwright.config.ts`:

```typescript
expect: {
  toHaveScreenshot: {
    threshold: 0.2,        // 20% pixel difference allowed
    maxDiffPixels: 100,    // Maximum 100 different pixels
    animations: 'disabled', // Disable animations for consistency
  }
}
```

## Best Practices

1. **Consistent Environment**: Always run visual tests in the same environment (preferably CI) to avoid OS-specific rendering differences.

2. **Review Changes**: Always review visual changes before updating baselines. Small, unintended changes can accumulate over time.

3. **Commit Baselines**: Baseline images should be committed to version control so all team members use the same references.

4. **Handle Dynamic Content**: For pages with dynamic content (timestamps, random data), consider:
   - Mocking the data
   - Using fixed test data
   - Increasing the threshold for acceptable differences

5. **Cross-Browser Testing**: While we use Chromium for baseline generation, you can run tests on other browsers:
   ```bash
   npx playwright test visual-regression.spec.ts --project=firefox
   ```

## Troubleshooting

### Tests Failing Due to Minor Differences

If tests fail due to minor, acceptable differences:
1. Check the pixel difference percentage in the report
2. If differences are minimal and acceptable, consider increasing the threshold
3. Or update the baselines if the changes are intentional

### Different Results Locally vs CI

This usually happens due to:
- Different operating systems (font rendering varies)
- Different screen resolutions
- Missing fonts

Solution: Use Docker or ensure consistent environments.

### Animation-Related Failures

Ensure animations are disabled in the test configuration. If issues persist, add explicit waits:
```typescript
await page.waitForTimeout(500); // Wait for animations
```

## Maintenance

### Cleaning Up Artifacts

To remove test artifacts and reports:

```bash
npm run test:visual:clean
```

### Adding New Pages

To add visual regression coverage for a new page:

1. Add a new test in `visual-regression.spec.ts`
2. Follow the existing pattern:
   ```typescript
   test('should match the snapshot for the New Page', async ({ page }) => {
     await loginAsFreeUser(page);
     await page.goto('/new-page');
     
     // Wait for key element
     await expect(page.locator('[data-testid="new-page-container"]')).toBeVisible();
     
     // Take snapshot
     await expect(page).toHaveScreenshot('new-page.png', {
       fullPage: true,
       animations: 'disabled',
     });
   });
   ```
3. Run `npm run test:visual:update` to create the baseline
4. Commit the new baseline image

## CI/CD Integration

For CI/CD pipelines:

1. Store baseline images in the repository
2. Run visual tests as part of the test suite:
   ```yaml
   - name: Run Visual Regression Tests
     run: npm run test:visual
   ```
3. Archive test results and reports as artifacts
4. Fail the build on visual regression failures
