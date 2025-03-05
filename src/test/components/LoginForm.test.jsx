import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import LoginForm from '../../components/LoginForm';
import { mockTranslate } from '../util/test-utils';

// Mock the useAuth hook
vi.mock('../../services/AuthContext', () => ({
  useAuth: () => mockUseAuth
}));

// Mock the useLanguage hook
vi.mock('../../services/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => mockTranslate(key, 'en'),
    language: 'en',
    changeLanguage: vi.fn(),
    getSupportedLanguages: () => [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' }
    ]
  })
}));

// Mock auth functions and state
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignInAnonymously = vi.fn();
let mockUseAuth = {
  signIn: mockSignIn,
  signUp: mockSignUp,
  signInAnonymously: mockSignInAnonymously,
  loading: false,
  error: null
};

describe('LoginForm Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSignIn.mockReset();
    mockSignUp.mockReset();
    mockSignInAnonymously.mockReset();
    mockUseAuth = {
      signIn: mockSignIn,
      signUp: mockSignUp,
      signInAnonymously: mockSignInAnonymously,
      loading: false,
      error: null
    };
  });

  it('renders the sign-in form by default', () => {
    render(<LoginForm />);
    
    // Check that the app title is displayed
    expect(screen.getByText('app.coupon_manager')).toBeInTheDocument();
    
    // Check that the tabs are displayed
    expect(screen.getByRole('tab', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sign up/i })).toBeInTheDocument();
    
    // Check that the sign-in tab is selected by default
    expect(screen.getByRole('tab', { name: /sign in/i })).toHaveAttribute('aria-selected', 'true');
    
    // Check that the form fields are displayed
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    
    // Check that the sign-in button is displayed
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();
    
    // Check that the anonymous sign-in button is displayed
    expect(screen.getByRole('button', { name: /continue as guest/i })).toBeInTheDocument();
  });

  it('toggles between sign-in and sign-up forms using tabs', () => {
    render(<LoginForm />);
    
    // Initially in sign-in mode
    const signInTab = screen.getByRole('tab', { name: /sign in/i });
    const signUpTab = screen.getByRole('tab', { name: /sign up/i });
    
    expect(signInTab).toHaveAttribute('aria-selected', 'true');
    expect(signUpTab).toHaveAttribute('aria-selected', 'false');
    
    // Click the sign-up tab
    fireEvent.click(signUpTab);
    
    // Now sign-up tab should be selected
    expect(signInTab).toHaveAttribute('aria-selected', 'false');
    expect(signUpTab).toHaveAttribute('aria-selected', 'true');
    
    // The submit button should now say "Sign Up"
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    
    // Toggle back to sign-in
    fireEvent.click(signInTab);
    
    // Back to sign-in mode
    expect(signInTab).toHaveAttribute('aria-selected', 'true');
    expect(signUpTab).toHaveAttribute('aria-selected', 'false');
    
    // The submit button should now say "Sign In"
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates form fields before submission', async () => {
    // Set up mock auth functions
    mockSignIn.mockResolvedValue();
    mockSignUp.mockResolvedValue();
    mockSignInAnonymously.mockResolvedValue();
    
    // Update the mock auth context
    mockUseAuth = {
      signIn: mockSignIn,
      signUp: mockSignUp,
      signInAnonymously: mockSignInAnonymously,
      loading: false,
      error: null
    };
    
    render(<LoginForm />);
    
    // Submit the form without filling in any fields
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    // Check that validation errors are displayed
    expect(mockSignIn).not.toHaveBeenCalled();
    
    // Fill in invalid email
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    // Check that signIn was not called with invalid data
    expect(mockSignIn).not.toHaveBeenCalled();
    
    // Fill in valid email but short password
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);
    
    // Check that signIn was not called with invalid data
    expect(mockSignIn).not.toHaveBeenCalled();
    
    // Fill in valid data
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Check that signIn was called with correct data
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('calls signIn with valid data', () => {
    render(<LoginForm />);
    
    // Fill in valid data
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    // Check that signIn was called with the correct data
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('calls signUp with valid data', () => {
    render(<LoginForm />);
    
    // Switch to sign-up mode using the tab
    const signUpTab = screen.getByRole('tab', { name: /sign up/i });
    fireEvent.click(signUpTab);
    
    // Fill in valid data
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);
    
    // Check that signUp was called with the correct data
    expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('displays error messages when authentication fails', () => {
    // Set up the mock to include an error
    mockUseAuth = {
      ...mockUseAuth,
      error: { message: 'Invalid credentials' }
    };
    
    render(<LoginForm />);
    
    // Check that the error message is displayed in an Alert component
    const alertElement = document.querySelector('.MuiAlert-root');
    expect(alertElement).toBeInTheDocument();
    expect(alertElement.textContent).toContain('Invalid credentials');
  });

  it('displays loading indicators during authentication and disables form', () => {
    // Set up the mock to indicate loading
    mockUseAuth = {
      ...mockUseAuth,
      loading: true
    };
    
    render(<LoginForm />);
    
    // Check that the form elements are disabled
    expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    
    // Check that the buttons show loading state
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      if (button.getAttribute('role') === 'tab') return; // Skip tabs
      expect(button).toBeDisabled();
    });
    
    // Check for CircularProgress components
    const circularProgressElements = document.querySelectorAll('.MuiCircularProgress-root');
    expect(circularProgressElements.length).toBeGreaterThan(0);
  });

  it('calls signInAnonymously when Continue as Guest is clicked', () => {
    render(<LoginForm />);
    
    // Click the Continue as Guest button
    const guestButton = screen.getByRole('button', { name: /continue as guest/i });
    fireEvent.click(guestButton);
    
    // Check that signInAnonymously was called
    expect(mockSignInAnonymously).toHaveBeenCalled();
  });
}); 