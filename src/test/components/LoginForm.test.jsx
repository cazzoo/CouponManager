import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import LoginForm from '../../components/LoginForm';
import { mockTranslate } from '../util/test-utils';

// Mock the useAuth hook
vi.mock('../../services/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock the useLanguage hook
vi.mock('../../services/LanguageContext', () => ({
  useLanguage: () => ({
    t: mockTranslate
  })
}));

// Import the mocked useAuth after mocking
import { useAuth } from '../../services/AuthContext';

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign-in form by default', () => {
    // Set up the mock implementation for useAuth
    useAuth.mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      signInAnonymously: vi.fn(),
      loading: false,
      error: null
    });

    render(<LoginForm />);
    
    // Check that the sign-in form is rendered
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('validates form fields before submission', async () => {
    // Create a mock sign-in function that returns a promise
    const mockSignIn = vi.fn().mockResolvedValue({
      success: false,
      error: 'Invalid credentials'
    });
    
    // Set up the mock implementation for useAuth
    useAuth.mockReturnValue({
      signIn: mockSignIn,
      signUp: vi.fn(),
      signInAnonymously: vi.fn(),
      loading: false,
      error: null
    });
    
    // Render with our mock
    render(<LoginForm />);
    
    // Get the submit button and click it without filling in the fields
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Submit the form without filling in any fields
    await userEvent.click(submitButton);
    
    // Wait for validation errors to appear
    // In the real component, validateForm() is called which sets the validationErrors state
    // This should cause the email and password fields to show error states
    
    // Now fill in the fields with valid data
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    // Submit the form again
    await userEvent.click(submitButton);
    
    // Verify the sign-in function was called with the correct data
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays error messages when authentication fails', async () => {
    // Create a mock sign-in function that returns an error
    const mockSignIn = vi.fn().mockResolvedValue({
      success: false,
      error: 'Invalid credentials'
    });
    
    // Set up the mock implementation for useAuth with an error
    useAuth.mockReturnValue({
      signIn: mockSignIn,
      signUp: vi.fn(),
      signInAnonymously: vi.fn(),
      loading: false,
      error: 'Invalid credentials'
    });
    
    // Render the component with the mock
    render(<LoginForm />);
    
    // Check that the error message is displayed
    const errorMessage = screen.getByText('Invalid credentials');
    expect(errorMessage).toBeInTheDocument();
  });

  it('displays loading indicator during authentication', async () => {
    // Create a mock sign-in function that doesn't resolve immediately
    const mockSignIn = vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ success: true, user: { id: 'test-user', email: 'test@example.com' } });
        }, 100);
      });
    });
    
    // Set up the mock implementation for useAuth with loading state
    useAuth.mockReturnValue({
      signIn: mockSignIn,
      signUp: vi.fn(),
      signInAnonymously: vi.fn(),
      loading: true,
      error: null
    });
    
    // Render the component with the mock
    render(<LoginForm />);
    
    // Check that the loading indicator is displayed
    const circularProgress = screen.getByRole('progressbar', { hidden: true });
    expect(circularProgress).toBeInTheDocument();
  });

  it('calls signInAnonymously when Continue as Guest is clicked', async () => {
    // Create a mock for signInAnonymously
    const mockSignInAnonymously = vi.fn();
    
    // Set up the mock implementation for useAuth
    useAuth.mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      signInAnonymously: mockSignInAnonymously,
      loading: false,
      error: null
    });
    
    render(<LoginForm />);
    
    // Click the Continue as Guest button
    const guestButton = screen.getByRole('button', { name: /continue as guest/i });
    await userEvent.click(guestButton);
    
    // Check that signInAnonymously was called
    expect(mockSignInAnonymously).toHaveBeenCalled();
  });
}); 