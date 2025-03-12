import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../services/AuthContext';
import * as AuthService from '../../services/AuthService';
import * as RoleService from '../../services/RoleService';

// Mock the AuthService
vi.mock('../../services/AuthService', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  signInAnonymously: vi.fn(),
  getCurrentSession: vi.fn(),
  getUser: vi.fn(),
  onAuthStateChange: vi.fn(),
}));

// Mock the RoleService
vi.mock('../../services/RoleService', () => ({
  getUserRole: vi.fn(),
  setUserRole: vi.fn(),
  hasPermission: vi.fn(),
  checkPermission: vi.fn(),
}));

// Test component that uses the AuthContext
const TestComponent = () => {
  const { user, loading, error, signIn, signUp, signOut, signInAnonymously, userRole } = useAuth();
  
  if (loading) {
    return <div data-testid="loading">Loading...</div>;
  }
  
  if (user) {
    return (
      <div>
        <div data-testid="user-email">{user.email}</div>
        <div data-testid="user-role">{userRole || 'No role'}</div>
        {userRole === 'manager' && <div data-testid="manager-badge">Manager</div>}
        <button data-testid="sign-out" onClick={signOut}>Sign Out</button>
      </div>
    );
  }
  
  return (
    <div>
      <div data-testid="auth-form">
        <button data-testid="sign-in" onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
        <button data-testid="sign-up" onClick={() => signUp('test@example.com', 'password')}>Sign Up</button>
        <button data-testid="sign-in-anon" onClick={signInAnonymously}>Continue as Guest</button>
      </div>
      {error && <div data-testid="auth-error">{error}</div>}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mock implementations
    AuthService.getCurrentSession.mockReturnValue(null);
    AuthService.getUser.mockReturnValue(null);
    
    // Mock onAuthStateChange to call the callback with no user by default
    AuthService.onAuthStateChange.mockImplementation((callback) => {
      // Call the callback with a SIGNED_OUT event
      setTimeout(() => {
        callback('SIGNED_OUT', { user: null });
      }, 0);
      return { data: { unsubscribe: vi.fn() } };
    });
  });

  it('should render loading state initially', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
  });

  it('should render authenticated state with user role', async () => {
    // Setup mocks for authenticated user
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };
    
    // Set up initial state as authenticated
    AuthService.getCurrentSession.mockReturnValue({ user: mockUser });
    AuthService.getUser.mockReturnValue(mockUser);
    
    RoleService.getUserRole.mockResolvedValue('user');

    // Trigger the onAuthStateChange callback with a signed-in event
    AuthService.onAuthStateChange.mockImplementation((callback) => {
      // Call the callback with a SIGNED_IN event
      setTimeout(() => {
        callback('SIGNED_IN', { user: mockUser });
      }, 0);
      return { data: { unsubscribe: vi.fn() } };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Check if user info and role are displayed
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('user-role')).toHaveTextContent('user');
      expect(screen.queryByTestId('manager-badge')).not.toBeInTheDocument();
    });
  });

  it('should render manager badge for users with manager role', async () => {
    // Setup mocks for authentication and role
    const mockUser = { id: 'manager-id', email: 'manager@example.com' };
    
    // Set up initial state as authenticated
    AuthService.getCurrentSession.mockReturnValue({ user: mockUser });
    AuthService.getUser.mockReturnValue(mockUser);
    
    RoleService.getUserRole.mockResolvedValue('manager');

    // Trigger the onAuthStateChange callback with a signed-in event
    AuthService.onAuthStateChange.mockImplementation((callback) => {
      // Call the callback with a SIGNED_IN event
      setTimeout(() => {
        callback('SIGNED_IN', { user: mockUser });
      }, 0);
      return { data: { unsubscribe: vi.fn() } };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Check if user info, role, and manager badge are displayed
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('manager@example.com');
      expect(screen.getByTestId('user-role')).toHaveTextContent('manager');
      expect(screen.getByTestId('manager-badge')).toBeInTheDocument();
    });
  });

  it('should set user role after successful sign up', async () => {
    // Start with no user
    AuthService.getCurrentSession.mockReturnValue(null);
    AuthService.getUser.mockReturnValue(null);
    
    // Setup mock for signUp
    const newUser = { id: 'new-user-id', email: 'test@example.com' };
    AuthService.signUp.mockResolvedValue({
      data: {
        user: newUser
      },
      error: null
    });
    
    // Mock role setting
    RoleService.setUserRole.mockResolvedValue({
      userId: 'new-user-id',
      role: 'user'
    });
    
    // Mock auth state change after sign up
    let authChangeCallback;
    AuthService.onAuthStateChange.mockImplementation((callback) => {
      authChangeCallback = callback;
      return { data: { unsubscribe: vi.fn() } };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Ensure not logged in - sign-up button should be visible
    await waitFor(() => {
      expect(screen.getByTestId('sign-up')).toBeInTheDocument();
    });
    
    // Click sign up button
    const user = userEvent.setup();
    await user.click(screen.getByTestId('sign-up'));
    
    // Simulate auth state change after successful sign up
    if (authChangeCallback) {
      setTimeout(() => {
        // Update the mock to return the new user
        AuthService.getUser.mockReturnValue(newUser);
        // Trigger auth state change
        authChangeCallback('SIGNED_IN', { user: newUser });
      }, 0);
    }
    
    // Verify that signUp was called with correct parameters
    expect(AuthService.signUp).toHaveBeenCalledWith('test@example.com', 'password');
    
    // Verify that setUserRole was called with correct parameters
    await waitFor(() => {
      expect(RoleService.setUserRole).toHaveBeenCalledWith('new-user-id', 'user');
    });
  });

  it('should fetch user role after successful sign in', async () => {
    // Start with no user
    AuthService.getCurrentSession.mockReturnValue(null);
    AuthService.getUser.mockReturnValue(null);
    
    // Setup mock for signIn
    const signedInUser = { id: 'signed-in-user-id', email: 'test@example.com' };
    AuthService.signIn.mockResolvedValue({
      data: {
        user: signedInUser
      },
      error: null
    });
    
    // Mock role fetching
    RoleService.getUserRole.mockResolvedValue('user');
    
    // Mock auth state change after sign in
    let authChangeCallback;
    AuthService.onAuthStateChange.mockImplementation((callback) => {
      authChangeCallback = callback;
      return { data: { unsubscribe: vi.fn() } };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Ensure not logged in - sign-in button should be visible
    await waitFor(() => {
      expect(screen.getByTestId('sign-in')).toBeInTheDocument();
    });
    
    // Click sign in button
    const user = userEvent.setup();
    await user.click(screen.getByTestId('sign-in'));
    
    // Simulate auth state change after successful sign in
    if (authChangeCallback) {
      setTimeout(() => {
        // Update the mock to return the signed in user
        AuthService.getUser.mockReturnValue(signedInUser);
        // Trigger auth state change
        authChangeCallback('SIGNED_IN', { user: signedInUser });
      }, 0);
    }
    
    // Verify that signIn was called with correct parameters
    expect(AuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password');
    
    // Verify that getUserRole was called with correct parameters
    await waitFor(() => {
      expect(RoleService.getUserRole).toHaveBeenCalledWith('signed-in-user-id');
    });
  });
}); 