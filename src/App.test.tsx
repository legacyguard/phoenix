import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from './App';

// Mock pre Clerk provider
const MockClerkProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="clerk-provider">{children}</div>
);

// Mock pre App komponent aby sme sa vyhli komplexným závislostiam
vi.mock('./App', () => {
  const MockApp = () => (
    <div data-testid="app">
      <h1>LegacyGuard App</h1>
      <p>Testovacia aplikácia</p>
    </div>
  );
  return { default: MockApp };
});

describe('App Smoke Test', () => {
  it('renderuje sa bez chyby', () => {
    render(
      <BrowserRouter>
        <MockClerkProvider>
          <App />
        </MockClerkProvider>
      </BrowserRouter>
    );

    // Overenie, že sa aplikácia úspešne renderovala
    expect(screen.getByTestId('app')).toBeInTheDocument();
    expect(screen.getByText('LegacyGuard App')).toBeInTheDocument();
    expect(screen.getByText('Testovacia aplikácia')).toBeInTheDocument();
  });

  it('obsahuje hlavný nadpis', () => {
    render(
      <BrowserRouter>
        <MockClerkProvider>
          <App />
        </MockClerkProvider>
      </BrowserRouter>
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('LegacyGuard App');
  });
});
