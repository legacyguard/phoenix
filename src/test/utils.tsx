import React from 'react';
import { render, RenderOptions, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { BrowserRouter } from 'react-router-dom';
import type { ThemeProvider } from '@/contexts/ThemeContext';
import type { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';
import { AllTheProviders } from './testProviders';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
    },
  },
});

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Export specific testing utilities instead of using export *
export { screen, fireEvent, waitFor, within };
export { customRender as render };
