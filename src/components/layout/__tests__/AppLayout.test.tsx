import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AppLayout } from '../AppLayout';

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

describe('AppLayout Component', () => {
  test('renders sidebar with navigation items', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    expect(screen.getByText('Phoenix')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Assets')).toBeInTheDocument();
    expect(screen.getByText('Guardians')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('renders user profile section', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByTestId('user-button')).toBeInTheDocument();
  });

  test('renders main content area with children', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('handles navigation item clicks', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    const dashboardButton = screen.getByText('Dashboard');
    await user.click(dashboardButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Navigating to:', '/dashboard');
    consoleSpy.mockRestore();
  });

  test('shows active navigation state', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    const dashboardButton = screen.getByText('Dashboard');
    expect(dashboardButton).toHaveClass('bg-secondary');
  });

  test('applies responsive classes correctly', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    const sidebar = screen.getByText('Phoenix').closest('aside');
    expect(sidebar).toHaveClass('hidden', 'md:flex');
  });

  test('main content has proper padding', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    const mainContent = screen.getByText('Test Content').closest('main');
    expect(mainContent).toHaveClass('flex-1', 'overflow-auto');
    
    // Find the div with p-8 class inside main
    const contentDiv = mainContent?.querySelector('div');
    expect(contentDiv).toHaveClass('p-8');
  });

  test('sidebar has correct width and styling', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    const sidebar = screen.getByText('Phoenix').closest('aside');
    expect(sidebar).toHaveClass('w-64', 'bg-card', 'border-r', 'border-border');
  });
});
