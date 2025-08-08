# Phoenix Component Standards & Best Practices

This document outlines the component standards and best practices for the Phoenix application, ensuring consistency, maintainability, and high-quality code across all components.

## Table of Contents
1. [Component Structure](#component-structure)
2. [TypeScript Standards](#typescript-standards)
3. [Styling Guidelines](#styling-guidelines)
4. [State Management](#state-management)
5. [Error Handling](#error-handling)
6. [Testing Standards](#testing-standards)
7. [Performance Optimization](#performance-optimization)
8. [Accessibility](#accessibility)
9. [Documentation](#documentation)

## Component Structure

### File Organization
```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── features/        # Feature-specific components
│   ├── layouts/         # Layout components
│   └── professional/    # Professional UI library
├── hooks/               # Custom React hooks
├── services/            # Business logic and API calls
├── utils/               # Utility functions
└── types/               # TypeScript type definitions
```

### Component Template
```tsx
/**
 * Component Name
 * Brief description of what the component does
 */

import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/logger';

// Types
interface ComponentNameProps {
  // Required props
  id: string;
  title: string;
  
  // Optional props
  className?: string;
  disabled?: boolean;
  onAction?: (id: string) => void;
}

// Component
export const ComponentName: React.FC<ComponentNameProps> = memo(({
  id,
  title,
  className,
  disabled = false,
  onAction,
}) => {
  const { t } = useTranslation('namespace');
  
  // Component logic here
  
  return (
    <div className={cn('base-classes', className)}>
      {/* Component JSX */}
    </div>
  );
});

ComponentName.displayName = 'ComponentName';
```

## TypeScript Standards

### Type Safety
- **No `any` types**: Always use specific types or generics
- **Strict null checks**: Handle null/undefined cases explicitly
- **Exhaustive checks**: Use TypeScript's exhaustiveness checking for switch statements

### Interface Naming
```tsx
// Props interfaces
interface ComponentNameProps { }

// Data models
interface UserData { }

// Service responses
interface ApiResponse<T> { }

// Type aliases for unions/enums
type Status = 'pending' | 'complete' | 'error';
```

### Generic Components
```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <>
      {items.map(item => (
        <div key={keyExtractor(item)}>
          {renderItem(item)}
        </div>
      ))}
    </>
  );
}
```

## Styling Guidelines

### Tailwind CSS Usage
- Use Tailwind utility classes for styling
- Create custom utility classes in `tailwind.config.js` for repeated patterns
- Use `cn()` utility for conditional classes

```tsx
// Good
<div className={cn(
  'px-4 py-2 rounded-lg',
  'hover:bg-gray-100 transition-colors',
  disabled && 'opacity-50 cursor-not-allowed',
  className
)}>

// Avoid inline styles
<div style={{ padding: '16px' }}> // Bad
```

### Professional Theme Classes
- Use professional theme classes for consistency:
  - `prof-primary-*` for primary colors
  - `prof-secondary-*` for secondary colors
  - `prof-bg-*` for backgrounds
  - `prof-text-*` for text colors
  - `prof-shadow-*` for shadows

## State Management

### Local State
```tsx
// Use hooks for local state
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

// Use custom hooks for complex state logic
const { data, loading, error, refetch } = useAsyncOperation();
```

### Global State
- Use Context API for cross-component state
- Keep contexts focused and single-purpose
- Provide custom hooks for context consumers

```tsx
// Context provider
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

## Error Handling

### Component Error Boundaries
```tsx
// Wrap components in error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</ErrorBoundary>
```

### Async Operations
```tsx
const handleSubmit = async () => {
  try {
    setIsLoading(true);
    const result = await apiCall();
    // Handle success
  } catch (error) {
    logger.error('Operation failed', error, {
      component: 'ComponentName',
      action: 'submit'
    });
    setError(formatErrorMessage(error));
  } finally {
    setIsLoading(false);
  }
};
```

### User-Friendly Error Messages
- Always translate error messages
- Provide actionable error information
- Log technical details for debugging

## Testing Standards

### Test Structure
```tsx
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Setup code
  });
  
  // Group related tests
  describe('Rendering', () => {
    it('should render with required props', () => {
      // Test implementation
    });
    
    it('should handle edge cases', () => {
      // Test edge cases
    });
  });
  
  describe('User Interactions', () => {
    it('should handle click events', () => {
      // Test interactions
    });
  });
});
```

### Testing Best Practices
- Test user behavior, not implementation details
- Use data-testid for querying elements
- Mock external dependencies
- Test accessibility features

## Performance Optimization

### Component Optimization
```tsx
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback((id: string) => {
  // Handle click
}, [dependency]);

// Memoize components
export const OptimizedComponent = memo(Component);
```

### Lazy Loading
```tsx
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

### Image Optimization
- Use appropriate image formats (WebP, AVIF)
- Implement lazy loading for images
- Provide responsive images with srcSet

## Accessibility

### ARIA Attributes
```tsx
<button
  aria-label={t('button.label')}
  aria-pressed={isPressed}
  aria-disabled={disabled}
  role="button"
  tabIndex={0}
>
```

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Implement proper focus management
- Provide keyboard shortcuts where appropriate

### Screen Reader Support
- Use semantic HTML elements
- Provide alternative text for images
- Use ARIA live regions for dynamic content

## Documentation

### Component Documentation
```tsx
/**
 * SecurityAreaCard - Displays security area information
 * 
 * @component
 * @example
 * <SecurityAreaCard
 *   area={securityArea}
 *   onClick={handleAreaClick}
 *   disabled={false}
 * />
 * 
 * @param {SecurityAreaLike} area - The security area data
 * @param {Function} onClick - Callback when card is clicked
 * @param {boolean} disabled - Whether the card is disabled
 */
```

### README Files
Each feature directory should have a README.md explaining:
- Purpose of the feature
- Component hierarchy
- Key dependencies
- Testing approach

### Code Comments
```tsx
// Use comments to explain "why", not "what"
// Bad: Increment counter
counter++;

// Good: Increment retry counter to track failed attempts
// for exponential backoff calculation
retryCounter++;
```

## Checklist for New Components

- [ ] TypeScript types defined (no `any`)
- [ ] Props interface documented
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Accessibility attributes added
- [ ] Translations used for all text
- [ ] Component memoized if needed
- [ ] Tests written with >80% coverage
- [ ] Documentation added
- [ ] Code reviewed by team

## Common Patterns

### Loading States
```tsx
if (isLoading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage error={error} />;
}

return <YourContent data={data} />;
```

### Form Handling
```tsx
const { values, errors, handleChange, handleSubmit } = useFormValidation(
  initialValues,
  validationRules
);
```

### Data Fetching
```tsx
const { data, loading, error, refetch } = useAsyncOperation();

useEffect(() => {
  refetch(() => fetchData(id));
}, [id, refetch]);
```

## Migration Guide

When updating existing components to meet these standards:

1. **Replace `any` types** with specific types
2. **Add proper error handling** using try-catch blocks
3. **Replace console.log** with logger utility
4. **Add accessibility attributes** to interactive elements
5. **Extract hardcoded strings** to translation files
6. **Add component tests** if missing
7. **Update documentation** to reflect changes

## Resources

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
