import { describe, it, expect, beforeEach, vi } from 'vitest';

const usersCollectionMock = {
  authWithPassword: vi.fn(),
  create: vi.fn()
};

vi.mock('../../services/PocketBaseClient', () => {
  let instance: any = null;
  return {
    default: {
      getInstance: vi.fn(() => {
        if (!instance) {
          instance = {
            authStore: {
              token: null,
              model: null,
              isValid: false,
              save: vi.fn(),
              clear: vi.fn(),
              onChange: vi.fn((cb: any) => { instance.authChangeCallback = cb; })
            },
            collection: vi.fn((name: string) => {
              if (name === 'users') {
                return usersCollectionMock;
              }
              return {};
            })
          };
        }
        return instance;
      })
    }
  };
});

vi.mock('../../services/DatabaseError', () => ({
  handlePocketBaseError: vi.fn((error: any) => {
    if (error?.status === 401) {
      class AuthenticationError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'AuthenticationError';
        }
      }
      return new AuthenticationError('Invalid credentials');
    }
    if (error?.status === 400) {
      return new Error('Validation error');
    }
    return new Error('Unknown error');
  })
}));

import PocketBaseClient from '../../services/PocketBaseClient';
import PocketBaseAuthService from '../../services/PocketBaseAuthService';
import type { AuthStateChangeCallback } from '../../services/PocketBaseAuthService';

const mockPb = PocketBaseClient.getInstance() as any;

describe('PocketBaseAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPb.authStore.token = null;
    mockPb.authStore.model = null;
    mockPb.authStore.isValid = false;
    usersCollectionMock.authWithPassword.mockReset();
    usersCollectionMock.create.mockReset();
  });

  describe('signIn()', () => {
    it('should successfully sign in with valid credentials', async () => {
      const mockAuthData = {
        token: 'test-token-123',
        record: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          created: '2024-01-01',
          updated: '2024-01-01',
          emailVisibility: true
        }
      };
      usersCollectionMock.authWithPassword.mockResolvedValueOnce(mockAuthData);
      const result = await PocketBaseAuthService.signIn('test@example.com', 'password123');
      expect(result.error).toBeNull();
      expect(result.data?.user.email).toBe('test@example.com');
      expect(result.data?.session?.token).toBe('test-token-123');
    });

    it('should return authentication error for invalid credentials', async () => {
      const authError = new Error('Invalid credentials');
      (authError as any).status = 401;
      usersCollectionMock.authWithPassword.mockRejectedValueOnce(authError);
      const result = await PocketBaseAuthService.signIn('test@example.com', 'wrong-password');
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Invalid credentials');
    });
  });

  describe('signUp()', () => {
    it('should successfully create a new user', async () => {
      const mockRecord = {
        id: 'new-user-123',
        email: 'new@example.com',
        name: 'Regular User',
        role: 'user',
        created: '2024-01-01',
        updated: '2024-01-01',
        emailVisibility: true
      };
      usersCollectionMock.create.mockResolvedValueOnce(mockRecord);
      const result = await PocketBaseAuthService.signUp('new@example.com', 'password123');
      expect(result.error).toBeNull();
      expect(result.data?.user.email).toBe('new@example.com');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists and is valid', () => {
      mockPb.authStore.token = 'valid-token';
      mockPb.authStore.isValid = true;
      expect(PocketBaseAuthService.isAuthenticated).toBe(true);
    });

    it('should return false when token is null', () => {
      mockPb.authStore.token = null;
      mockPb.authStore.isValid = true;
      expect(PocketBaseAuthService.isAuthenticated).toBe(false);
    });
  });

  describe('currentUser', () => {
    it('should return user data when authenticated', () => {
      mockPb.authStore.model = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      };
      const user = PocketBaseAuthService.currentUser;
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null when not authenticated', () => {
      mockPb.authStore.model = null;
      const user = PocketBaseAuthService.currentUser;
      expect(user).toBeNull();
    });
  });

  describe('signOut()', () => {
    it('should successfully sign out', async () => {
      const result = await PocketBaseAuthService.signOut();
      expect(result).toBe(true);
      expect(mockPb.authStore.clear).toHaveBeenCalled();
    });
  });

  describe('Auth State Change Listeners', () => {
    it('should add and trigger auth state change listener', () => {
      const callback: AuthStateChangeCallback = vi.fn();
      PocketBaseAuthService.addAuthChangeListener(callback);
      if (mockPb.authChangeCallback) {
        mockPb.authChangeCallback('test-token', { id: 'user-123' });
      }
      expect(callback).toHaveBeenCalled();
    });

    it('should support unsubscribe', () => {
      const callback: AuthStateChangeCallback = vi.fn();
      const { data } = PocketBaseAuthService.onAuthStateChange(callback);
      if (mockPb.authChangeCallback) {
        mockPb.authChangeCallback('test-token', { id: 'user-123' });
      }
      expect(callback).toHaveBeenCalledTimes(1);
      data.unsubscribe();
      if (mockPb.authChangeCallback) {
        mockPb.authChangeCallback('new-token', { id: 'user-456' });
      }
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
