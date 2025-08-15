import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../Card';

describe('Card Components', () => {
  test('Card renders with correct base classes', () => {
    render(<Card data-testid="card">Card content</Card>);
    const card = screen.getByTestId('card');
    
    expect(card).toHaveClass('bg-card', 'text-card-foreground', 'rounded-lg', 'border', 'shadow-sm');
  });

  test('CardHeader renders with correct classes', () => {
    render(<CardHeader data-testid="header">Header content</CardHeader>);
    const header = screen.getByTestId('header');
    
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
  });

  test('CardTitle renders as h3 with correct classes', () => {
    render(<CardTitle data-testid="title">Card Title</CardTitle>);
    const title = screen.getByTestId('title');
    
    expect(title.tagName).toBe('H3');
    expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
  });

  test('CardDescription renders with correct classes', () => {
    render(<CardDescription data-testid="description">Description text</CardDescription>);
    const description = screen.getByTestId('description');
    
    expect(description).toHaveClass('text-sm', 'text-muted-foreground');
  });

  test('CardContent renders with correct classes', () => {
    render(<CardContent data-testid="content">Content text</CardContent>);
    const content = screen.getByTestId('content');
    
    expect(content).toHaveClass('p-6', 'pt-0');
  });

  test('CardFooter renders with correct classes', () => {
    render(<CardFooter data-testid="footer">Footer content</CardFooter>);
    const footer = screen.getByTestId('footer');
    
    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
  });

  test('Card components can be composed together', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Test Footer')).toBeInTheDocument();
  });
});
