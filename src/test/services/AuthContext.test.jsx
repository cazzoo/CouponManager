import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../services/AuthContext';
import PocketBaseAuthService from '../../services/PocketBaseAuthService';

// Create singleton mock instance for role service
const mockRoleServiceInstance = {
  getUserRole: vi.fn(),
  setUserRole: vi.fn(),
  hasPermission: vi.fn(),
  checkPermission: vi.fn()
};

// Mock the PocketBaseClient
vi.mock('../../services/PocketBaseClient', () => {
  const mockAuthStore = {
    isValid: false,
    token: null,
    model: null,
    save: vi.fn(),
    clear: vi.fn(),
    onChange: vi.fn()
  };

  const mockCollection = {
    create: vi.fn(),
    authWithPassword: vi.fn()
  };

  const mockInstance = {
    collection: vi.fn(() => mockCollection),
    authStore: mockAuthStore
  };

  return {
    default: {
      getInstance: vi.fn(() => mockInstance)
    }
  };
});

// Mock the PocketBaseAuthService
vi.mock('../../services/PocketBaseAuthService', () => ({
  default: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    signInAnonymously: vi.fn(),
    getCurrentSession: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn()
  }
}));

// Mock the PocketBaseRoleService
vi.mock('../../services/PocketBaseRoleService', () => ({
  default: mockRoleServiceInstance
}));

// Mock the RoleServiceFactory to return the same singleton instance
vi.mock('../../services/RoleServiceFactory', () => ({
  getRoleService: vi.fn(() => Promise.resolve(mockRoleServiceInstance)),
  Roles: {
    USER: 'user',
    MANAGER: 'manager',
    DEMO_USER: 'demo'
  }
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
    PocketBaseAuthService.getCurrentSession.mockReturnValue(Promise.resolve({
      session: null,
      error: null
    }));
    PocketBaseAuthService.getUser.mockReturnValue(null);

    // Mock onAuthStateChange to NOT auto-trigger - tests will trigger manually
    // This ensures roleService is initialized before auth state changes
    PocketBaseAuthService.onAuthStateChange.mockImplementation(() => {
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    // Reset role service mocks
    mockRoleServiceInstance.getUserRole.mockReset();
    mockRoleServiceInstance.setUserRole.mockReset();
    mockRoleServiceInstance.hasPermission.mockReset();
    mockRoleServiceInstance.checkPermission.mockReset();
  });

  it('should render loading state initially', async () => {
    let authChangeCallback;
    PocketBaseAuthService.onAuthStateChange.mockImplementation((callback) => {
      authChangeCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(authChangeCallback).toBeDefined();
    });

    authChangeCallback('signedOut', null);

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
  });

  it('should render authenticated state with user role', async () => {
    const mockUser = { id: 'test-user-id', email: 'test@example.com', role: 'user' };

    PocketBaseAuthService.getCurrentSession.mockReturnValue(Promise.resolve({
      session: { token: 'test-token', user: mockUser },
      error: null
    }));
    PocketBaseAuthService.getUser.mockReturnValue(mockUser);

    mockRoleServiceInstance.getUserRole.mockResolvedValue('user');

    let authChangeCallback;
    PocketBaseAuthService.onAuthStateChange.mockImplementation((callback) => {
      authChangeCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authChangeCallback).toBeDefined();
    });

    authChangeCallback('signedIn', { token: 'test-token', user: mockUser });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('user-role')).toHaveTextContent('user');
      expect(screen.queryByTestId('manager-badge')).not.toBeInTheDocument();
    });
  });

  it('should render manager badge for users with manager role', async () => {
    const mockUser = { id: 'manager-id', email: 'manager@example.com', role: 'manager' };

    PocketBaseAuthService.getCurrentSession.mockReturnValue(Promise.resolve({
      session: { token: 'test-token', user: mockUser },
      error: null
    }));
    PocketBaseAuthService.getUser.mockReturnValue(mockUser);

    mockRoleServiceInstance.getUserRole.mockResolvedValue('manager');

    let authChangeCallback;
    PocketBaseAuthService.onAuthStateChange.mockImplementation((callback) => {
      authChangeCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authChangeCallback).toBeDefined();
    });

    authChangeCallback('signedIn', { token: 'test-token', user: mockUser });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('manager@example.com');
      expect(screen.getByTestId('user-role')).toHaveTextContent('manager');
      expect(screen.getByTestId('manager-badge')).toBeInTheDocument();
    });
  });

  it('should set user role after successful sign up', async () => {
    PocketBaseAuthService.getCurrentSession.mockReturnValue(Promise.resolve({
      session: null,
      error: null
    }));
    PocketBaseAuthService.getUser.mockReturnValue(null);

    const newUser = { id: 'new-user-id', email: 'test@example.com', role: 'user' };
    PocketBaseAuthService.signUp.mockResolvedValue({
      data: { user: newUser },
      error: null
    });

    mockRoleServiceInstance.setUserRole.mockResolvedValue({
      userId: 'new-user-id',
      role: 'user'
    });

    mockRoleServiceInstance.getUserRole.mockResolvedValue(null);

    let authChangeCallback;
    PocketBaseAuthService.onAuthStateChange.mockImplementation((callback) => {
      authChangeCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authChangeCallback).toBeDefined();
    });

    authChangeCallback('signedOut', null);

    await waitFor(() => {
      expect(screen.getByTestId('sign-up')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByTestId('sign-up'));

    if (authChangeCallback) {
      PocketBaseAuthService.getUser.mockReturnValue(newUser);
      authChangeCallback('signedIn', { token: 'test-token', user: newUser });
    }

    await waitFor(() => {
      expect(PocketBaseAuthService.signUp).toHaveBeenCalledWith('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(mockRoleServiceInstance.setUserRole).toHaveBeenCalledWith('new-user-id', 'user');
    });
  });

  it('should fetch user role after successful sign in', async () => {
    PocketBaseAuthService.getCurrentSession.mockReturnValue(Promise.resolve({
      session: null,
      error: null
    }));
    PocketBaseAuthService.getUser.mockReturnValue(null);

    const signedInUser = { id: 'signed-in-user-id', email: 'test@example.com', role: 'user' };
    PocketBaseAuthService.signIn.mockResolvedValue({
      data: { user: signedInUser, session: { token: 'test-token', user: signedInUser } },
      error: null
    });

    mockRoleServiceInstance.getUserRole.mockResolvedValue('user');

    let authChangeCallback;
    PocketBaseAuthService.onAuthStateChange.mockImplementation((callback) => {
      authChangeCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authChangeCallback).toBeDefined();
    });

    authChangeCallback('signedOut', null);

    await waitFor(() => {
      expect(screen.getByTestId('sign-in')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByTestId('sign-in'));

    if (authChangeCallback) {
      PocketBaseAuthService.getUser.mockReturnValue(signedInUser);
      authChangeCallback('signedIn', { token: 'test-token', user: signedInUser });
    }

    await waitFor(() => {
      expect(PocketBaseAuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(mockRoleServiceInstance.getUserRole).toHaveBeenCalledWith('signed-in-user-id');
    });
  });
});
