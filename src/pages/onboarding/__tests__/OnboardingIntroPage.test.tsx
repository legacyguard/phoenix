import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { OnboardingIntroPage } from '../OnboardingIntroPage';

// Mock Clerk hooks
const mockUseUser = vi.fn();
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => mockUseUser(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('OnboardingIntroPage Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    // Default mock implementation
    mockUseUser.mockReturnValue({
      user: {
        firstName: 'John',
        emailAddresses: [
          { emailAddress: 'john.doe@example.com' }
        ]
      },
      isLoaded: true,
      isSignedIn: true,
    });
  });

  test('renders main content sections', () => {
    render(<OnboardingIntroPage />);
    
    // Pain Point 1: Chaos and Uncertainty
    expect(screen.getByText('Understanding Your Concerns')).toBeInTheDocument();
    expect(screen.getByText(/We know that thinking about the future can be overwhelming/)).toBeInTheDocument();
    expect(screen.getByText(/That's why we're here./)).toBeInTheDocument();
    
    // Pain Point 2: Procrastination and Complexity
    expect(screen.getByText('Our Approach')).toBeInTheDocument();
    expect(screen.getByText(/In the next few minutes, we will guide you through a series of simple, human questions/)).toBeInTheDocument();
    expect(screen.getByText(/not legal jargon/)).toBeInTheDocument();
    
    // Value Promise
    expect(screen.getByText("What You'll Get")).toBeInTheDocument();
    expect(screen.getByText(/Your responses will allow us to create a personalized dashboard for you/)).toBeInTheDocument();
    expect(screen.getByText(/a clear, simple overview of your life's inventory/)).toBeInTheDocument();
  });

  test('renders call to action button', () => {
    render(<OnboardingIntroPage />);
    
    const startButton = screen.getByRole('button', { name: "I'm ready. Let's start." });
    expect(startButton).toBeInTheDocument();
    expect(startButton).toHaveClass('bg-primary');
  });

  test('renders trust indicators', () => {
    render(<OnboardingIntroPage />);
    
    expect(screen.getByText('Bank-level security')).toBeInTheDocument();
    expect(screen.getByText('Your data, your control')).toBeInTheDocument();
    expect(screen.getByText('Built with care')).toBeInTheDocument();
  });

  test('renders time estimate', () => {
    render(<OnboardingIntroPage />);
    
    expect(screen.getByText(/This will take approximately 5-10 minutes/)).toBeInTheDocument();
    expect(screen.getByText(/You can pause and continue at any time/)).toBeInTheDocument();
  });

  test('renders icons for each section', () => {
    render(<OnboardingIntroPage />);
    
    // Check that icons are present (they should be rendered as SVG elements)
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  test('navigates to wizard when start button is clicked', () => {
    render(<OnboardingIntroPage />);
    
    const startButton = screen.getByRole('button', { name: "I'm ready. Let's start." });
    fireEvent.click(startButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding/wizard');
  });

  test('has proper accessibility attributes', () => {
    render(<OnboardingIntroPage />);
    
    const startButton = screen.getByRole('button', { name: "I'm ready. Let's start." });
    expect(startButton).toBeInTheDocument();
    
    // Check that headings are properly structured
    const h1 = screen.getByRole('heading', { level: 1 });
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h1).toBeInTheDocument();
    expect(h2).toBeInTheDocument();
  });

  test('renders with proper styling classes', () => {
    render(<OnboardingIntroPage />);
    
    // Check that the main container has the right classes
    const mainContainer = document.querySelector('.min-h-screen.bg-background');
    expect(mainContainer).toBeInTheDocument();
    
    const startButton = screen.getByRole('button', { name: "I'm ready. Let's start." });
    expect(startButton).toHaveClass('bg-primary', 'hover:bg-primary/90');
  });
});
