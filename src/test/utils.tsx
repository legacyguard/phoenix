import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';

// Create a custom render function that includes all providers
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
    },
  },
});

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </BrowserRouter>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockWill = (overrides = {}) => ({
  id: 'test-will-id',
  userId: 'test-user-id',
  title: 'Test Will',
  content: 'Test will content',
  version: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockAsset = (overrides = {}) => ({
  id: 'test-asset-id',
  userId: 'test-user-id',
  name: 'Test Asset',
  type: 'property',
  value: 100000,
  description: 'Test asset description',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockGuardian = (overrides = {}) => ({
  id: 'test-guardian-id',
  userId: 'test-user-id',
  name: 'Test Guardian',
  email: 'guardian@example.com',
  phone: '+1234567890',
  relationship: 'friend',
  isPrimary: true,
  createdAt: new Date().toISOString(),
  ...overrides,
});
