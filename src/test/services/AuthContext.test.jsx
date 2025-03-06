import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../services/AuthContext';
import AuthService from '../../services/AuthService';
import RoleService from '../../services/RoleService';

// Mock services
vi.mock('../../services/AuthService', () => ({
  default: {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    signInAnonymously: vi.fn(),
    getCurrentSession: vi.fn(),
    onAuthStateChange: vi.fn()
  }
}));

vi.mock('../../services/RoleService', () => ({
  default: {
    getUserRole: vi.fn(),
    setUserRole: vi.fn()
  },
  Roles: {
    USER: 'user',
    MANAGER: 'manager'
  },
  Permissions: {
    VIEW_ANY_COUPON: 'viewAnyCoupon',
    EDIT_COUPON: 'editCoupon',
    DELETE_COUPON: 'deleteCoupon',
    MANAGE_USERS: 'manageUsers'
  }
}));

// Test component that uses auth context
const TestComponent = () => {
  const { 
    user, 
    userRole,
    signIn, 
    signOut, 
    signUp, 
    loading, 
    error,
    isManager
  } = useAuth();
  
  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error.message}</div>}
      {user ? (
        <div>
          <div data-testid="user-email">{user.email}</div>
          <div data-testid="user-role">{userRole || 'No role'}</div>
          {isManager && <div data-testid="manager-badge">Manager</div>}
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

  it('should render loading state', () => {
    // Mock loading state
    AuthService.getCurrentSession.mockResolvedValue({
      session: null,
      error: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should render authenticated state with user role', async () => {
    // Setup mocks for authentication and role
    AuthService.getCurrentSession.mockResolvedValue({
      session: {
        user: { id: 'test-user-id', email: 'test@example.com' }
      },
      error: null
    });
    
    RoleService.getUserRole.mockResolvedValue({
      userId: 'test-user-id',
      role: 'user'
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

    // Wait for auth initialization to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check if user info and role are displayed
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('user');
    expect(screen.queryByTestId('manager-badge')).not.toBeInTheDocument();
  });

  it('should render manager badge for users with manager role', async () => {
    // Setup mocks for authentication and role
    AuthService.getCurrentSession.mockResolvedValue({
      session: {
        user: { id: 'manager-id', email: 'manager@example.com' }
      },
      error: null
    });
    
    RoleService.getUserRole.mockResolvedValue({
      userId: 'manager-id',
      role: 'manager'
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

    // Wait for auth initialization to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check if user info, role, and manager badge are displayed
    expect(screen.getByTestId('user-email')).toHaveTextContent('manager@example.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('manager');
    expect(screen.getByTestId('manager-badge')).toBeInTheDocument();
  });

  it('should set user role after successful sign up', async () => {
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
    
    // Setup mock for setUserRole
    RoleService.setUserRole.mockResolvedValue({
      userId: 'new-user-id',
      role: 'user'
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
    
    // Check if RoleService.setUserRole was called to set the initial role
    expect(RoleService.setUserRole).toHaveBeenCalledWith('new-user-id', 'user');
  });

  it('should fetch user role after successful sign in', async () => {
    // Setup mock for getCurrentSession
    AuthService.getCurrentSession.mockResolvedValue({
      session: null,
      error: null
    });
    
    // Setup mock for auth state change listener
    AuthService.onAuthStateChange.mockImplementation((callback) => {
      return vi.fn(); // Mock unsubscribe function
    });
    
    // Setup mock for signIn
    AuthService.signIn.mockResolvedValue({
      user: { id: 'existing-user-id', email: 'existing@example.com' },
      error: null
    });
    
    // Setup mock for getUserRole
    RoleService.getUserRole.mockResolvedValue({
      userId: 'existing-user-id',
      role: 'user'
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
    
    // Check if RoleService.getUserRole was called to fetch the user's role
    expect(RoleService.getUserRole).toHaveBeenCalledWith('existing-user-id');
  });
}); 