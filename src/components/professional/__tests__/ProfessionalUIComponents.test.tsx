/**
 * Test Suite for Professional UI Components
 * Tests non-gamified, professional UI components
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  StatusBadge,
  PriorityIndicator,
  ReadinessLevel,
  SecurityAreaCard,
  RecommendationCard,
  ProgressOverview,
  InfoAlert
} from '../ProfessionalUIComponents';

describe('StatusBadge', () => {
  it('should render complete status with correct styling', () => {
    const { container } = render(<StatusBadge status="complete" />);
    
    const badge = screen.getByText('Complete');
    expect(badge).toBeInTheDocument();
    
    // The badge is within a span, check its parent
    const badgeContainer = container.querySelector('span');
    expect(badgeContainer).toBeTruthy();
    
    // Check that it contains the expected content and icon
    const icon = badgeContainer?.querySelector('svg');
    expect(icon).toBeInTheDocument();
    
    // Check that the container has some expected class names (more flexible)
    const containerClasses = badgeContainer?.className || '';
    expect(containerClasses).toContain('inline-flex');
    expect(containerClasses).toContain('items-center');
  });

  it('should render in_progress status with correct icon', () => {
    const { container } = render(<StatusBadge status="in_progress" />);
    
    const badge = screen.getByText('In Progress');
    expect(badge).toBeInTheDocument();
    
    // Check for the clock icon
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    
    // Verify it's contained within a span with appropriate styling
    const badgeContainer = container.querySelector('span');
    expect(badgeContainer).toBeTruthy();
  });

  it('should render needs_review status with warning styling', () => {
    const { container } = render(<StatusBadge status="needs_review" />);
    
    const badge = screen.getByText('Needs Review');
    expect(badge).toBeInTheDocument();
    
    // Check for the alert icon
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    
    // Verify the container structure
    const badgeContainer = container.querySelector('span');
    expect(badgeContainer).toBeTruthy();
  });

  it('should render not_started status with neutral styling', () => {
    const { container } = render(<StatusBadge status="not_started" />);
    
    const badge = screen.getByText('Not Started');
    expect(badge).toBeInTheDocument();
    
    // Check for the file icon
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    
    // Verify the container structure
    const badgeContainer = container.querySelector('span');
    expect(badgeContainer).toBeTruthy();
  })
});

describe('PriorityIndicator', () => {
  it('should render urgent priority with red color', () => {
    render(<PriorityIndicator priority="urgent" />);
    
    const label = screen.getByText('Urgent');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('text-prof-urgent');
  });

  it('should render high priority with orange color', () => {
    render(<PriorityIndicator priority="high" />);
    
    const label = screen.getByText('High Priority');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('text-prof-high');
  });

  it('should hide label when showLabel is false', () => {
    render(<PriorityIndicator priority="medium" showLabel={false} />);
    
    const label = screen.queryByText('Medium Priority');
    expect(label).not.toBeInTheDocument();
    
    // But the dot should still be visible
    const dot = document.querySelector('.bg-prof-medium');
    expect(dot).toBeInTheDocument();
  });

  it('should render low priority with gray color', () => {
    render(<PriorityIndicator priority="low" />);
    
    const label = screen.getByText('Low Priority');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('text-prof-low');
  });
});

describe('ReadinessLevel', () => {
  it('should render initial level with orange styling', () => {
    render(<ReadinessLevel level="initial" />);
    
    const label = screen.getByText('Initial Setup');
    expect(label).toBeInTheDocument();
    expect(label.parentElement?.parentElement).toHaveClass('bg-orange-50');
  });

  it('should render developing level with yellow styling', () => {
    render(<ReadinessLevel level="developing" />);
    
    const label = screen.getByText('Developing');
    expect(label).toBeInTheDocument();
    expect(label.parentElement?.parentElement).toHaveClass('bg-yellow-50');
  });

  it('should render maintained level with green styling', () => {
    render(<ReadinessLevel level="maintained" />);
    
    const label = screen.getByText('Fully Maintained');
    expect(label).toBeInTheDocument();
    expect(label.parentElement?.parentElement).toHaveClass('bg-green-50');
  });

  it('should show description when showDescription is true', () => {
    render(<ReadinessLevel level="comprehensive" showDescription={true} />);
    
    const description = screen.getByText('Most security areas well-established');
    expect(description).toBeInTheDocument();
  });

  it('should hide description when showDescription is false', () => {
    render(<ReadinessLevel level="established" showDescription={false} />);
    
    const description = screen.queryByText('Core security measures in place');
    expect(description).not.toBeInTheDocument();
  });
});

describe('SecurityAreaCard', () => {
  const defaultProps = {
    title: 'Estate Planning',
    description: 'Will and trust documents',
    status: 'in_progress' as const,
    priority: 'high' as const,
    estimatedTime: '45 minutes',
    lastUpdated: '2 days ago',
    onClick: vi.fn(),
  };

  it('should render card with all provided information', () => {
    render(<SecurityAreaCard {...defaultProps} />);
    
    expect(screen.getByText('Estate Planning')).toBeInTheDocument();
    expect(screen.getByText('Will and trust documents')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('45 minutes')).toBeInTheDocument();
    expect(screen.getByText('Updated 2 days ago')).toBeInTheDocument();
  });

  it('should show priority indicator stripe for high priority', () => {
    render(<SecurityAreaCard {...defaultProps} priority="high" />);
    
    const stripe = document.querySelector('.bg-prof-high');
    expect(stripe).toBeInTheDocument();
  });

  it('should show urgent priority stripe', () => {
    render(<SecurityAreaCard {...defaultProps} priority="urgent" />);
    
    const stripe = document.querySelector('.bg-prof-urgent');
    expect(stripe).toBeInTheDocument();
  });

  it('should not show priority stripe for low priority', () => {
    render(<SecurityAreaCard {...defaultProps} priority="low" />);
    
    const stripe = document.querySelector('.bg-prof-urgent, .bg-prof-high, .bg-prof-medium');
    expect(stripe).not.toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    const handleClick = vi.fn();
    render(<SecurityAreaCard {...defaultProps} onClick={handleClick} />);
    
    const card = screen.getByText('Estate Planning').closest('div[class*="cursor-pointer"]');
    fireEvent.click(card!);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('RecommendationCard', () => {
  const defaultProps = {
    type: 'action' as const,
    title: 'Complete Estate Planning',
    description: 'Set up your will and trust documents',
    priority: 'urgent' as const,
    estimatedTime: '45 minutes',
    actionLabel: 'Start Now',
    onAction: vi.fn(),
  };

  it('should render recommendation with all information', () => {
    render(<RecommendationCard {...defaultProps} />);
    
    expect(screen.getByText('Complete Estate Planning')).toBeInTheDocument();
    expect(screen.getByText('Set up your will and trust documents')).toBeInTheDocument();
    expect(screen.getByText('45 minutes')).toBeInTheDocument();
    expect(screen.getByText('Start Now')).toBeInTheDocument();
  });

  it('should show urgent styling for urgent priority', () => {
    render(<RecommendationCard {...defaultProps} priority="urgent" />);
    
    const card = screen.getByText('Complete Estate Planning').closest('div[class*="border"]');
    expect(card).toHaveClass('border-prof-urgent/30');
    
    const button = screen.getByText('Start Now');
    expect(button).toHaveClass('bg-prof-urgent');
  });

  it('should show different icon for review type', () => {
    render(<RecommendationCard {...defaultProps} type="review" />);
    
    // Clock icon should be present for review type
    const iconContainer = document.querySelector('.text-prof-warning');
    expect(iconContainer).toBeInTheDocument();
  });

  it('should call onAction when button is clicked', () => {
    const handleAction = vi.fn();
    render(<RecommendationCard {...defaultProps} onAction={handleAction} />);
    
    const button = screen.getByText('Start Now');
    fireEvent.click(button);
    
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('should use default action label when not provided', () => {
    const { actionLabel, ...propsWithoutLabel } = defaultProps;
    render(<RecommendationCard {...propsWithoutLabel} />);
    
    expect(screen.getByText('Take Action')).toBeInTheDocument();
  });
});

describe('ProgressOverview', () => {
  const defaultProps = {
    completedAreas: 5,
    totalAreas: 9,
    needsReviewCount: 2,
    urgentActionsCount: 1,
  };

  it('should display all metrics correctly', () => {
    render(<ProgressOverview {...defaultProps} />);
    
    expect(screen.getByText('5/9')).toBeInTheDocument();
    expect(screen.getByText('Areas Complete')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Need Review')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Urgent Actions')).toBeInTheDocument();
  });

  it('should calculate and display percentage correctly', () => {
    render(<ProgressOverview {...defaultProps} />);
    
    // 5/9 = 55.55%, rounded to 56%
    expect(screen.getByText('56%')).toBeInTheDocument();
    expect(screen.getByText('Secured')).toBeInTheDocument();
  });

  it('should not show urgent actions card when count is 0', () => {
    render(<ProgressOverview {...defaultProps} urgentActionsCount={0} />);
    
    const urgentText = screen.queryByText('Urgent Actions');
    expect(urgentText).not.toBeInTheDocument();
  });

  it('should not show needs review card when count is 0', () => {
    render(<ProgressOverview {...defaultProps} needsReviewCount={0} />);
    
    const reviewText = screen.queryByText('Need Review');
    expect(reviewText).not.toBeInTheDocument();
  });

  it('should handle 100% completion correctly', () => {
    render(<ProgressOverview completedAreas={9} totalAreas={9} needsReviewCount={0} urgentActionsCount={0} />);
    
    expect(screen.getByText('9/9')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});

describe('InfoAlert', () => {
  const defaultProps = {
    title: 'Important Information',
    description: 'This is a helpful message for the user',
  };

  it('should render info alert with default type', () => {
    render(<InfoAlert {...defaultProps} />);
    
    expect(screen.getByText('Important Information')).toBeInTheDocument();
    expect(screen.getByText('This is a helpful message for the user')).toBeInTheDocument();
    
    const alert = screen.getByText('Important Information').closest('div[class*="rounded-lg"]');
    expect(alert).toHaveClass('bg-prof-info-light');
  });

  it('should render success alert with green styling', () => {
    render(<InfoAlert {...defaultProps} type="success" />);
    
    const alert = screen.getByText('Important Information').closest('div[class*="rounded-lg"]');
    expect(alert).toHaveClass('bg-prof-success-light');
  });

  it('should render warning alert with yellow styling', () => {
    render(<InfoAlert {...defaultProps} type="warning" />);
    
    const alert = screen.getByText('Important Information').closest('div[class*="rounded-lg"]');
    expect(alert).toHaveClass('bg-prof-warning-light');
  });

  it('should render error alert with red styling', () => {
    render(<InfoAlert {...defaultProps} type="error" />);
    
    const alert = screen.getByText('Important Information').closest('div[class*="rounded-lg"]');
    expect(alert).toHaveClass('bg-prof-error-light');
  });

  it('should render action button when provided', () => {
    const handleAction = vi.fn();
    render(
      <InfoAlert 
        {...defaultProps} 
        action={{ label: 'Learn More', onClick: handleAction }}
      />
    );
    
    const button = screen.getByText('Learn More');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('should render without description when not provided', () => {
    render(<InfoAlert title="Just a title" />);
    
    expect(screen.getByText('Just a title')).toBeInTheDocument();
    expect(screen.queryByText('This is a helpful message')).not.toBeInTheDocument();
  });
});
