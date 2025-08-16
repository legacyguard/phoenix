import React from 'react';
import { render, screen } from '@testing-library/react';
import { Progress } from '../Progress';

describe('Progress Component', () => {
  test('Progress renders with correct base classes', () => {
    render(<Progress />);
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toHaveClass('relative', 'h-2', 'w-full', 'overflow-hidden', 'rounded-full', 'bg-secondary');
  });

  test('Progress shows correct percentage based on value and max', () => {
    render(<Progress value={50} max={100} />);
    const progressBar = screen.getByRole('progressbar');
    const fillElement = progressBar.querySelector('div');
    expect(fillElement).toHaveStyle({ width: '50%' });
  });

  test('Progress handles zero value correctly', () => {
    render(<Progress value={0} max={100} />);
    const progressBar = screen.getByRole('progressbar');
    const fillElement = progressBar.querySelector('div');
    expect(fillElement).toHaveStyle({ width: '0%' });
  });

  test('Progress handles max value correctly', () => {
    render(<Progress value={100} max={100} />);
    const progressBar = screen.getByRole('progressbar');
    const fillElement = progressBar.querySelector('div');
    expect(fillElement).toHaveStyle({ width: '100%' });
  });

  test('Progress clamps values above max', () => {
    render(<Progress value={150} max={100} />);
    const progressBar = screen.getByRole('progressbar');
    const fillElement = progressBar.querySelector('div');
    expect(fillElement).toHaveStyle({ width: '100%' });
  });

  test('Progress clamps negative values', () => {
    render(<Progress value={-50} max={100} />);
    const progressBar = screen.getByRole('progressbar');
    const fillElement = progressBar.querySelector('div');
    expect(fillElement).toHaveStyle({ width: '0%' });
  });

  test('Progress accepts custom className', () => {
    render(<Progress className="custom-class" />);
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toHaveClass('custom-class');
  });

  test('Progress forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Progress ref={ref} />);
    expect(ref.current).toBeInTheDocument();
  });

  test('Progress has correct default values', () => {
    render(<Progress />);
    const progressElement = screen.getByRole('progressbar');
    const fillElement = progressElement.querySelector('div');
    expect(fillElement).toHaveStyle({ width: '0%' });
  });
});
