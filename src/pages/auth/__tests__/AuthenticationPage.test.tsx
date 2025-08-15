import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import axios from 'axios';
import { AuthenticationPage } from '../AuthenticationPage';

// Mock console.log to avoid noise in tests
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('AuthenticationPage Component', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  test('renders login form by default', () => {
    render(<AuthenticationPage />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Enter your credentials to access your account.')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });

  test('renders email and password fields', () => {
    render(<AuthenticationPage />);
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  test('switches to registration form when Sign Up is clicked', async () => {
    const user = userEvent.setup();
    render(<AuthenticationPage />);
    
    const signUpButton = screen.getByText('Sign Up');
    await user.click(signUpButton);
    
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByText('Fill in your details to create your account.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
  });

  test('shows additional fields in registration mode', async () => {
    const user = userEvent.setup();
    render(<AuthenticationPage />);
    
    // Switch to registration
    const signUpButton = screen.getByText('Sign Up');
    await user.click(signUpButton);
    
    // Check for additional fields
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
  });

  test('handles form input changes', async () => {
    const user = userEvent.setup();
    render(<AuthenticationPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('handles form submission', async () => {
    const user = userEvent.setup();
    const axiosSpy = vi.spyOn(axios, 'post').mockResolvedValue({ status: 200, data: {} });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AuthenticationPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Sign In');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(consoleSpy).toHaveBeenCalledWith('Submitting login form:', {
      email: 'test@example.com',
      password: 'password123',
    });

    expect(axiosSpy).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });

    axiosSpy.mockRestore();
    alertSpy.mockRestore();
  });

  test('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<AuthenticationPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button
    
    // Password should be hidden by default
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click to show password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click to hide password again
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('clears form when switching between modes', async () => {
    const user = userEvent.setup();
    render(<AuthenticationPage />);
    
    // Fill in login form
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    // Switch to registration
    const signUpButton = screen.getByText('Sign Up');
    await user.click(signUpButton);
    
    // Check that fields are cleared
    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const newEmailInput = screen.getByLabelText('Email');
    const newPasswordInput = screen.getByLabelText('Password');
    
    expect(firstNameInput).toHaveValue('');
    expect(lastNameInput).toHaveValue('');
    expect(newEmailInput).toHaveValue('');
    expect(newPasswordInput).toHaveValue('');
  });

  test('shows forgot password link in login mode', () => {
    render(<AuthenticationPage />);
    
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
  });

  test('hides forgot password link in registration mode', async () => {
    const user = userEvent.setup();
    render(<AuthenticationPage />);
    
    // Switch to registration
    const signUpButton = screen.getByText('Sign Up');
    await user.click(signUpButton);
    
    expect(screen.queryByText('Forgot your password?')).not.toBeInTheDocument();
  });

  test('has proper form validation attributes', () => {
    render(<AuthenticationPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });

  test('has proper accessibility attributes', () => {
    render(<AuthenticationPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    expect(emailInput).toHaveAttribute('id', 'email');
    expect(passwordInput).toHaveAttribute('id', 'password');
  });
});
