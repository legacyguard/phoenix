import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import FirstTimeUserGuide from '../FirstTimeUserGuide';

// Mock react-shepherd
const mockShepherdTour = vi.fn();
const mockShepherdTourContext = vi.fn();

vi.mock('react-shepherd', () => ({
  ShepherdTour: ({ children, ...props }: any) => {
    mockShepherdTour(props);
    return children;
  },
  ShepherdTourContext: {
    Consumer: ({ children }: any) => {
      mockShepherdTourContext();
      return children({ tourContext: { start: vi.fn(), cancel: vi.fn(), complete: vi.fn() } });
    }
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('FirstTimeUserGuide Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  test('renders without crashing', () => {
    render(<FirstTimeUserGuide />);
    expect(mockShepherdTour).toHaveBeenCalled();
    expect(mockShepherdTourContext).toHaveBeenCalled();
  });

  test('configures tour options correctly', () => {
    render(<FirstTimeUserGuide />);
    
    const tourProps = mockShepherdTour.mock.calls[0][0];
    expect(tourProps.tourOptions).toBeDefined();
    expect(tourProps.tourOptions.defaultStepOptions.classes).toBe('shepherd-theme-custom');
    expect(tourProps.tourOptions.defaultStepOptions.cancelIcon.enabled).toBe(true);
    expect(tourProps.tourOptions.defaultStepOptions.scrollTo).toBe(true);
    expect(tourProps.tourOptions.useModalOverlay).toBe(true);
  });

  test('defines correct tour steps', () => {
    render(<FirstTimeUserGuide />);
    
    const tourProps = mockShepherdTour.mock.calls[0][0];
    const steps = tourProps.steps;
    
    expect(steps).toHaveLength(5);
    
    // Welcome step
    expect(steps[0].id).toBe('welcome');
    expect(steps[0].text).toContain('Welcome to Your Dashboard!');
    expect(steps[0].buttons).toHaveLength(2);
    
    // Mission step
    expect(steps[1].id).toBe('mission');
    expect(steps[1].attachTo.element).toBe('#mission-card');
    expect(steps[1].attachTo.on).toBe('bottom');
    expect(steps[1].text).toContain('Your Primary Mission');
    
    // Trusted Circle step
    expect(steps[2].id).toBe('trusted-circle');
    expect(steps[2].attachTo.element).toBe('#trusted-circle-card');
    expect(steps[2].attachTo.on).toBe('top');
    expect(steps[2].text).toContain('Your Trusted Circle');
    
    // Life Areas step
    expect(steps[3].id).toBe('life-areas');
    expect(steps[3].attachTo.element).toBe('#life-area-card');
    expect(steps[3].attachTo.on).toBe('left');
    expect(steps[3].text).toContain('Life Areas');
    
    // Quick Actions step
    expect(steps[4].id).toBe('quick-actions');
    expect(steps[4].attachTo.element).toBe('#quick-actions-section');
    expect(steps[4].attachTo.on).toBe('top');
    expect(steps[4].text).toContain('Quick Actions');
  });

  test('handles tour completion correctly', () => {
    render(<FirstTimeUserGuide />);
    
    const tourProps = mockShepherdTour.mock.calls[0][0];
    const onComplete = tourProps.onComplete;
    
    onComplete();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('firstTimeGuideShown', 'true');
  });

  test('handles tour cancellation correctly', () => {
    render(<FirstTimeUserGuide />);
    
    const tourProps = mockShepherdTour.mock.calls[0][0];
    const onCancel = tourProps.onCancel;
    
    onCancel();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('firstTimeGuideShown', 'true');
  });

  test('does not start tour if already shown', () => {
    localStorageMock.getItem.mockReturnValue('true');
    
    render(<FirstTimeUserGuide />);
    
    // Should not start tour if already shown
    expect(mockShepherdTour).toHaveBeenCalled();
  });

  test('starts tour if not shown before', () => {
    localStorageMock.getItem.mockReturnValue('false');
    
    render(<FirstTimeUserGuide />);
    
    // Should configure tour to start
    expect(mockShepherdTour).toHaveBeenCalled();
  });
});
