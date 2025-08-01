# Testing Guide

## Overview

This project uses Vitest for unit and integration testing, along with Testing Library for component testing.

## Test Infrastructure Setup

### Test Configuration

- **Framework**: Vitest
- **Test Environment**: jsdom
- **Coverage Tool**: v8
- **Test Utilities**: @testing-library/react, @testing-library/jest-dom

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui

# Run specific test file
npm test -- path/to/test.ts
```

### Test Structure

```
src/
├── components/
│   └── __tests__/        # Component tests
├── services/
│   └── __tests__/        # Service unit tests
├── lib/
│   └── __tests__/        # Utility function tests
└── test/
    ├── setup.ts          # Global test setup
    ├── utils.tsx         # Test utilities and custom render
    ├── mocks/            # Mock modules
    └── helpers/          # Test helper functions
```

### Writing Tests

#### Component Tests

```typescript
import { render, screen, fireEvent } from '@/test/utils';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

#### Service Tests

For services that depend on external APIs (like Supabase), use mocks:

```typescript
import { vi } from 'vitest';
import { setupSupabaseMocks } from '@/test/helpers/supabase-mock';

describe('MyService', () => {
  const mockSupabase = setupSupabaseMocks();
  
  it('performs operation', async () => {
    // Configure mock behavior
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    });
    
    // Test your service
  });
});
```

### Test Coverage Goals

For MVP:
- Statements: 40%
- Branches: 30%
- Functions: 40%
- Lines: 40%

For Production:
- Statements: 80%
- Branches: 70%
- Functions: 80%
- Lines: 80%

### CI/CD Integration

Tests run automatically on:
- Push to main or develop branches
- Pull requests

The CI pipeline includes:
1. Linting
2. Type checking
3. Unit tests
4. Coverage reporting
5. Build verification

### Best Practices

1. **Test Isolation**: Each test should be independent
2. **Mock External Dependencies**: Don't make real API calls in tests
3. **Test User Behavior**: Focus on testing what users see and do
4. **Descriptive Test Names**: Use clear, descriptive test names
5. **Arrange-Act-Assert**: Follow the AAA pattern
6. **Keep Tests Simple**: One assertion per test when possible

### Common Testing Patterns

#### Testing Async Operations

```typescript
it('handles async operations', async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});
```

#### Testing Error States

```typescript
it('handles errors gracefully', async () => {
  mockService.someMethod.mockRejectedValue(new Error('Test error'));
  
  const result = await functionUnderTest();
  expect(result.error).toBe('Test error');
});
```

#### Testing User Interactions

```typescript
it('responds to user input', async () => {
  render(<FormComponent />);
  
  const input = screen.getByLabelText('Email');
  await userEvent.type(input, 'test@example.com');
  
  expect(input).toHaveValue('test@example.com');
});
```

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure all paths use the `@/` alias
2. **Mock not working**: Check that mocks are set up before imports
3. **Async test timeout**: Use `await` for all async operations
4. **Environment variables**: Use `vi.stubEnv()` in tests

### Debug Mode

To debug tests:
```bash
# Run tests with node inspector
node --inspect-brk ./node_modules/.bin/vitest run
```

Then open Chrome DevTools at `chrome://inspect`
