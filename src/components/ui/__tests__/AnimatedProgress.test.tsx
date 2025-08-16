import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import AnimatedProgress from '../AnimatedProgress';

describe('AnimatedProgress Component', () => {
  test('renders progress bar with correct percentage', () => {
    render(<AnimatedProgress currentStep={2} totalSteps={4} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    
    // Should show 50% progress (2/4)
    expect(screen.getByText('50% Complete')).toBeInTheDocument();
  });

  test('renders step indicator correctly', () => {
    render(<AnimatedProgress currentStep={3} totalSteps={5} />);
    
    expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();
    expect(screen.getByText('60% Complete')).toBeInTheDocument();
  });

  test('renders correct number of step dots', () => {
    render(<AnimatedProgress currentStep={1} totalSteps={3} />);
    
    // Should render 3 dots for 3 total steps
    const dots = document.querySelectorAll('[class*="w-2 h-2 rounded-full"]');
    expect(dots).toHaveLength(3);
  });

  test('handles edge cases correctly', () => {
    // First step
    const { rerender } = render(<AnimatedProgress currentStep={1} totalSteps={3} />);
    expect(screen.getByText('33% Complete')).toBeInTheDocument();
    
    // Last step
    rerender(<AnimatedProgress currentStep={3} totalSteps={3} />);
    expect(screen.getByText('100% Complete')).toBeInTheDocument();
    
    // Zero steps (should default to 1 total step)
    rerender(<AnimatedProgress currentStep={0} totalSteps={0} />);
    expect(screen.getByText('0% Complete')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(
      <AnimatedProgress 
        currentStep={2} 
        totalSteps={4} 
        className="custom-class" 
      />
    );
    
    const container = screen.getByText('Step 2 of 4').closest('div');
    expect(container?.parentElement).toHaveClass('custom-class');
  });

  test('has proper accessibility attributes', () => {
    render(<AnimatedProgress currentStep={2} totalSteps={4} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '2');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '4');
    expect(progressBar).toHaveAttribute('aria-label', 'Progress: step 2 of 4');
  });
});
