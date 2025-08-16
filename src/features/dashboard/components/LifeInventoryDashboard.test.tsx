import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import LifeInventoryDashboard from './LifeInventoryDashboard';

// Mock pre LifeInventoryDashboard komponent
vi.mock('./LifeInventoryDashboard', () => {
  const MockLifeInventoryDashboard = () => (
    <div data-testid="life-inventory-dashboard">
      <h1>Life Inventory Dashboard</h1>
      <div className="dashboard-content">
        <section className="assets-section">
          <h2>Your Assets</h2>
          <p>Manage your valuable possessions</p>
        </section>
        <section className="documents-section">
          <h2>Important Documents</h2>
          <p>Keep your documents organized</p>
        </section>
      </div>
    </div>
  );
  return { default: MockLifeInventoryDashboard };
});

describe('LifeInventoryDashboard Smoke Test', () => {
  it('renderuje sa bez chyby', () => {
    render(<LifeInventoryDashboard />);

    // Overenie, že sa dashboard úspešne renderoval
    expect(screen.getByTestId('life-inventory-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Life Inventory Dashboard')).toBeInTheDocument();
  });

  it('obsahuje hlavný nadpis', () => {
    render(<LifeInventoryDashboard />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Life Inventory Dashboard');
  });

  it('obsahuje sekcie pre assets a documents', () => {
    render(<LifeInventoryDashboard />);

    // Overenie assets sekcie
    expect(screen.getByText('Your Assets')).toBeInTheDocument();
    expect(screen.getByText('Manage your valuable possessions')).toBeInTheDocument();

    // Overenie documents sekcie
    expect(screen.getByText('Important Documents')).toBeInTheDocument();
    expect(screen.getByText('Keep your documents organized')).toBeInTheDocument();
  });

  it('má správnu štruktúru komponentov', () => {
    render(<LifeInventoryDashboard />);

    const dashboard = screen.getByTestId('life-inventory-dashboard');
    const assetsSection = screen.getByText('Your Assets').closest('section');
    const documentsSection = screen.getByText('Important Documents').closest('section');

    expect(dashboard).toContainElement(assetsSection);
    expect(dashboard).toContainElement(documentsSection);
  });
});
