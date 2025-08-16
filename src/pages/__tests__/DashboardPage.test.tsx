import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { DashboardPage } from '../DashboardPage';

// Mock Clerk hooks
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: {
      firstName: 'John',
      emailAddresses: [
        { emailAddress: 'john.doe@example.com' }
      ]
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  UserButton: ({ appearance }: any) => (
    <button
      className={appearance?.elements?.userButtonTrigger}
      data-testid="user-button"
    >
      User Profile
    </button>
  ),
}));

// Mock AppLayout component
vi.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">
      {children}
    </div>
  ),
}));

describe('DashboardPage Component', () => {
  test('renders main header with user name', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Welcome to Your Legacy, John Doe! 👋')).toBeInTheDocument();
    expect(screen.getByText(/Your digital legacy is secure and well-organized/)).toBeInTheDocument();
  });

  test('renders key metrics grid with three cards', () => {
    render(<DashboardPage />);
    
    // Digital Assets card
    expect(screen.getByText('Digital Assets')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('items secured')).toBeInTheDocument();
    expect(screen.getByText('Manage Assets')).toBeInTheDocument();
    
    // Trusted Guardians card
    expect(screen.getByText('Trusted Guardians')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('people in your circle')).toBeInTheDocument();
    expect(screen.getByText('View Guardians')).toBeInTheDocument();
    
    // Profile Completion card
    expect(screen.getByText('Profile Completion')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('Complete your profile')).toBeInTheDocument();
    expect(screen.getByText(/Complete your profile to ensure your legacy is protected/)).toBeInTheDocument();
  });

  test('renders recent activity section', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText(/Your latest account activities and updates/)).toBeInTheDocument();
    expect(screen.getByText('View All')).toBeInTheDocument();
    
    // Check for activity items
    expect(screen.getByText(/You added a new asset: "Crypto Wallet"/)).toBeInTheDocument();
    expect(screen.getByText(/You invited a new guardian: "Jane Doe"/)).toBeInTheDocument();
    expect(screen.getByText(/Updated your privacy settings/)).toBeInTheDocument();
    expect(screen.getByText(/Completed your will document/)).toBeInTheDocument();
  });

  test('renders quick actions section', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText(/Common tasks to manage your legacy/)).toBeInTheDocument();
    
    expect(screen.getByText('Create New Document')).toBeInTheDocument();
    expect(screen.getByText('Add Guardian')).toBeInTheDocument();
    expect(screen.getByText('Upload Asset')).toBeInTheDocument();
  });

  test('renders notifications section', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText(/Important updates and reminders/)).toBeInTheDocument();
    
    expect(screen.getByText('Annual Review Due')).toBeInTheDocument();
    expect(screen.getByText(/Your annual account review is due in 15 days/)).toBeInTheDocument();
    
    expect(screen.getByText('New Feature Available')).toBeInTheDocument();
    expect(screen.getByText(/Try our new AI document analysis tool/)).toBeInTheDocument();
  });

  test('renders welcome message section', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('🎉 Welcome to Phoenix! 🎉')).toBeInTheDocument();
    expect(screen.getByText(/Your secure digital legacy management platform/)).toBeInTheDocument();
    
    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByText('Schedule Demo')).toBeInTheDocument();
  });

  test('renders progress bar with correct value', () => {
    render(<DashboardPage />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  test('renders activity items with correct timestamps', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('1 day ago')).toBeInTheDocument();
    expect(screen.getByText('3 days ago')).toBeInTheDocument();
    expect(screen.getByText('1 week ago')).toBeInTheDocument();
  });

  test('renders app layout wrapper', () => {
    render(<DashboardPage />);
    
    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
  });
});
