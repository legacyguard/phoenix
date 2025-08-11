# E2E Testing Suite Documentation

## Overview

This comprehensive End-to-End (E2E) testing suite for LegacyGuard Heritage Vault uses Playwright to ensure all critical user journeys work flawlessly. The tests simulate real user interactions and verify that the application behaves correctly from the user's perspective.

## Test Structure

### 1. Core Vault Setup Test (`core-vault-setup.spec.ts`)

This test suite verifies the complete onboarding journey for new users:

- **User Registration**: Tests the sign-up flow with email/password
- **Trusted Person Addition**: Verifies adding executors and beneficiaries
- **Asset Management**: Tests adding financial assets to the vault
- **Document Upload**: Verifies document upload functionality
- **Plan Strength Tracking**: Ensures the plan strength percentage increases correctly

**Key Scenarios:**

- New user completes core vault setup
- Plan strength calculation accuracy
- Progress indicators update correctly

### 2. Premium Feature Access Test (`premium-feature-access.spec.ts`)

This test suite validates the premium/freemium model implementation:

- **Free User Restrictions**: Verifies upgrade prompts appear for premium features
- **Premium User Access**: Confirms premium users can access all features
- **Pricing Page Redirect**: Tests the upgrade flow redirects correctly
- **Premium Badges**: Verifies visual indicators for premium features

**Key Scenarios:**

- Free user attempting to access premium features
- Premium user successfully accessing premium features
- Premium feature badge visibility and tooltips

### 3. Asset Story Test (`asset-story.spec.ts`)

This test suite ensures the asset story feature works correctly:

- **Story Creation**: Tests adding personal stories to assets
- **Story Editing**: Verifies updating existing stories
- **Character Limits**: Tests validation for story length restrictions
- **Data Persistence**: Ensures stories persist after page refresh

**Key Scenarios:**

- User can add a story to an asset
- User can edit an existing story
- Story character limit validation
- Story persists after page refresh

## Running the Tests

### Prerequisites

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

### Running Tests

**Run all tests:**

```bash
npm run test:e2e
```

**Run tests with UI mode (recommended for debugging):**

```bash
npm run test:e2e:ui
```

**Run tests in headed mode (see browser):**

```bash
npm run test:e2e:headed
```

**Debug a specific test:**

```bash
npm run test:e2e:debug
```

**Run a specific test file:**

```bash
npx playwright test tests/e2e/core-vault-setup.spec.ts
```

**Run tests in a specific browser:**

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Configuration

The tests are configured in `playwright.config.ts` with the following settings:

- **Base URL**: `http://localhost:8080`
- **Test Directory**: `./tests/e2e`
- **Browsers**: Chrome, Firefox, Safari (WebKit)
- **Parallel Execution**: Enabled for faster test runs
- **Retry on Failure**: 2 retries on CI, 0 locally
- **Artifacts**: Screenshots and videos on failure
- **Dev Server**: Automatically starts the dev server before tests

## Test Utilities

### Authentication Helper (`utils/auth.ts`)

Provides reusable functions for:

- User sign-up
- User sign-in
- User sign-out
- Mock premium status for testing

### Test Users

Pre-configured test users:

- `newUser`: For registration tests
- `freeUser`: For testing free tier limitations
- `premiumUser`: For testing premium features

## Best Practices

1. **Use data-testid attributes**: Add `data-testid` attributes to important elements for reliable test selectors
2. **Wait for elements**: Always wait for elements to be visible before interacting
3. **Test isolation**: Each test should be independent and not rely on other tests
4. **Meaningful assertions**: Verify both positive and negative scenarios
5. **Clean test data**: Use unique identifiers (timestamps) for test data

## Writing New Tests

Example test structure:

```typescript
import { test, expect } from "@playwright/test";
import { signIn, testUsers } from "./utils/auth";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await signIn(page, testUsers.freeUser);
  });

  test("should do something", async ({ page }) => {
    // Arrange
    await page.goto("/some-page");

    // Act
    await page.click('button:has-text("Action")');

    // Assert
    await expect(page.locator(".result")).toBeVisible();
  });
});
```

## CI/CD Integration

The tests are designed to run in CI/CD pipelines:

1. **GitHub Actions**: Tests run automatically on pull requests
2. **Vercel**: Tests can be configured to run before deployment
3. **Environment Variables**: Use `process.env.CI` to detect CI environment

## Troubleshooting

### Common Issues:

1. **Tests timing out**
   - Increase timeout in test: `test.setTimeout(60000);`
   - Check if dev server is running

2. **Element not found**
   - Add explicit waits: `await page.waitForSelector('.element');`
   - Verify selectors are correct

3. **Flaky tests**
   - Add retry logic for network requests
   - Use more specific selectors
   - Ensure proper test isolation

### Debugging Tips:

1. **Use UI Mode**: `npm run test:e2e:ui` for visual debugging
2. **Add debug points**: `await page.pause();` to pause execution
3. **Take screenshots**: `await page.screenshot({ path: 'debug.png' });`
4. **Check traces**: View detailed execution traces in the HTML report

## Maintenance

### Regular Tasks:

- Update test data and selectors when UI changes
- Review and update test scenarios quarterly
- Monitor test execution times and optimize slow tests
- Keep Playwright and dependencies updated

### Adding Test Coverage:

When adding new features, ensure to:

1. Add corresponding E2E tests
2. Update existing tests if behavior changes
3. Document new test scenarios in this README

## Reporting

After running tests, view the HTML report:

```bash
npx playwright show-report
```

The report includes:

- Test results summary
- Detailed failure information
- Screenshots and videos of failures
- Execution traces for debugging

## Security Considerations

- Never commit real user credentials
- Use environment variables for sensitive data
- Mock external services when possible
- Clear test data after test runs in production-like environments
