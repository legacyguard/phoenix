import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from '../label';

describe('Label Component', () => {
  test('renders with correct base classes', () => {
    render(<Label data-testid="label">Test Label</Label>);
    const label = screen.getByTestId('label');
    
    expect(label).toHaveClass(
      'text-sm', 'font-medium', 'leading-none', 
      'peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70'
    );
  });

  test('renders label text correctly', () => {
    const labelText = 'Email Address';
    render(<Label>{labelText}</Label>);
    
    expect(screen.getByText(labelText)).toBeInTheDocument();
  });

  test('forwards ref correctly', () => {
    const ref = React.createRef<HTMLLabelElement>();
    render(<Label ref={ref} data-testid="label">Test Label</Label>);
    
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  test('accepts htmlFor attribute', () => {
    render(<Label htmlFor="email-input" data-testid="label">Email</Label>);
    const label = screen.getByTestId('label');
    
    expect(label).toHaveAttribute('htmlFor', 'email-input');
  });

  test('can be customized with className', () => {
    render(<Label className="custom-class" data-testid="label">Test Label</Label>);
    const label = screen.getByTestId('label');
    
    expect(label).toHaveClass('custom-class');
  });

  test('accepts all standard label attributes', () => {
    render(
      <Label
        data-testid="label"
        htmlFor="test-input"
        className="test-class"
        id="test-label"
        title="Test tooltip"
      >
        Test Label
      </Label>
    );
    const label = screen.getByTestId('label');
    
    expect(label).toHaveAttribute('htmlFor', 'test-input');
    expect(label).toHaveAttribute('id', 'test-label');
    expect(label).toHaveAttribute('title', 'Test tooltip');
    expect(label).toHaveClass('test-class');
  });

  test('renders as label element', () => {
    render(<Label data-testid="label">Test Label</Label>);
    const label = screen.getByTestId('label');
    
    expect(label.tagName).toBe('LABEL');
  });
});
