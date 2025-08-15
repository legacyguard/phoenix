import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';

describe('Input Component', () => {
  test('Input renders with correct base classes', () => {
    render(<Input data-testid="input" placeholder="Enter text" />);
    const input = screen.getByTestId('input');
    
    expect(input).toHaveClass(
      'flex', 'h-10', 'w-full', 'rounded-md', 'border', 'border-input',
      'bg-background', 'px-3', 'py-2', 'text-sm', 'ring-offset-background'
    );
  });

  test('Input accepts and displays value', () => {
    render(<Input data-testid="input" value="test value" onChange={() => {}} />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    
    expect(input.value).toBe('test value');
  });

  test('Input handles placeholder text', () => {
    render(<Input data-testid="input" placeholder="Enter your name" />);
    const input = screen.getByTestId('input');
    
    expect(input).toHaveAttribute('placeholder', 'Enter your name');
  });

  test('Input can be disabled', () => {
    render(<Input data-testid="input" disabled />);
    const input = screen.getByTestId('input');
    
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  test('Input forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} data-testid="input" />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  test('Input accepts all standard input attributes', () => {
    render(
      <Input
        data-testid="input"
        type="email"
        name="email"
        id="email-input"
        required
        minLength={5}
        maxLength={50}
      />
    );
    const input = screen.getByTestId('input');
    
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('id', 'email-input');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('minLength', '5');
    expect(input).toHaveAttribute('maxLength', '50');
  });

  test('Input can be customized with className', () => {
    render(<Input data-testid="input" className="custom-class" />);
    const input = screen.getByTestId('input');
    
    expect(input).toHaveClass('custom-class');
  });
});
