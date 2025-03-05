import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../services/AuthContext';
import AuthService from '../../services/AuthService';

// Mock AuthService
vi.mock('../../services/AuthService', () => ({
  default: {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getCurrentSession: vi.fn(),
    onAuthStateChange: vi.fn()
  }
}));

// Test component that uses auth context
const TestComponent = () => {
  const { user, signIn, signOut, signUp, loading, error } = useAuth();
  
  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error.message}</div>}
      {user ? (
        <div>
          <div data-testid="user-email">{user.email}</div>
          <button data-testid="sign-out" onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <button 
            data-testid="sign-in" 
            onClick={() => signIn('test@example.com', 'password123')}
          >
            Sign In
          </button>
          <button 
            data-testid="sign-up" 
            onClick={() => signUp('test@example.com', 'password123')}
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide loading state initially', () => {
    // Setup the mock implementation for getCurrentSession
    AuthService.getCurrentSession.mockResolvedValue({
      session: null,
      error: null
    });
    
    // Setup mock for auth state change listener
    AuthService.onAuthStateChange.mockImplementation((callback) => {
      return vi.fn(); // Mock unsubscribe function
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should handle successful sign in', async () => {
    // Setup mock for getCurrentSession (initial state)
    AuthService.getCurrentSession.mockResolvedValue({
      session: null,
      error: null
    });
    
    // Setup mock for auth state change listener
    AuthService.onAuthStateChange.mockImplementation((callback) => {
      // Simulate auth state change after sign in
      return vi.fn(); // Mock unsubscribe function
    });
    
    // Setup mock for signIn
    AuthService.signIn.mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
      session: { access_token: 'test-token' },
      error: null
    });
    
    // Render the test component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Click the sign in button
    const user = userEvent.setup();
    await user.click(screen.getByTestId('sign-in'));
    
    // Wait for sign in to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Check if AuthService.signIn was called
    expect(AuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    
    // Set the user in the context
    await act(async () => {
      const authCallback = AuthService.onAuthStateChange.mock.calls[0][0];
      authCallback('SIGNED_IN', {
        user: { id: 'test-user-id', email: 'test@example.com' }
      });
    });
    
    // Verify user is now shown
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
  });

  it('should handle sign out', async () => {
    // Setup user in the session initially
    AuthService.getCurrentSession.mockResolvedValue({
      session: { 
        user: { id: 'test-user-id', email: 'test@example.com' }
      },
      error: null
    });
    
    // Setup mock for auth state change listener
    let authCallback;
    AuthService.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return vi.fn(); // Mock unsubscribe function
    });
    
    // Setup mock for signOut
    AuthService.signOut.mockResolvedValue({
      error: null
    });
    
    // Render the test component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial loading and set user
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      // Simulate auth state change with user
      if (authCallback) {
        authCallback('SIGNED_IN', {
          user: { id: 'test-user-id', email: 'test@example.com' }
        });
      }
    });
    
    // Verify user is shown
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    
    // Click the sign out button
    const user = userEvent.setup();
    await user.click(screen.getByTestId('sign-out'));
    
    // Simulate auth state change after sign out
    await act(async () => {
      authCallback('SIGNED_OUT', { user: null });
    });
    
    // Verify sign in button is now available
    expect(screen.getByTestId('sign-in')).toBeInTheDocument();
  });

  it('should handle sign up', async () => {
    // Setup mock for getCurrentSession
    AuthService.getCurrentSession.mockResolvedValue({
      session: null,
      error: null
    });
    
    // Setup mock for auth state change listener
    AuthService.onAuthStateChange.mockImplementation((callback) => {
      return vi.fn(); // Mock unsubscribe function
    });
    
    // Setup mock for signUp
    AuthService.signUp.mockResolvedValue({
      user: { id: 'new-user-id', email: 'test@example.com' },
      error: null
    });
    
    // Render the test component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Click the sign up button
    const user = userEvent.setup();
    await user.click(screen.getByTestId('sign-up'));
    
    // Wait for sign up to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Check if AuthService.signUp was called
    expect(AuthService.signUp).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should handle errors during sign in', async () => {
    // Setup mock for getCurrentSession
    AuthService.getCurrentSession.mockResolvedValue({
      session: null,
      error: null
    });
    
    // Setup mock for auth state change listener
    AuthService.onAuthStateChange.mockImplementation((callback) => {
      return vi.fn(); // Mock unsubscribe function
    });
    
    // Setup mock for signIn to return an error
    const mockError = new Error('Invalid login credentials');
    AuthService.signIn.mockResolvedValue({
      user: null,
      session: null,
      error: mockError
    });
    
    // Render the test component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Click the sign in button
    const user = userEvent.setup();
    await user.click(screen.getByTestId('sign-in'));
    
    // Wait for sign in to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify error message is shown
    expect(screen.getByTestId('error')).toHaveTextContent('Invalid login credentials');
  });
}); 