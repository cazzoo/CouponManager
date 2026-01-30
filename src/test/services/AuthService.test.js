import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import PocketBaseAuthService from '../../services/PocketBaseAuthService';

// Mock window.crypto for UUID generation
beforeEach(() => {
  // Mock window.crypto.randomUUID
  if (!window.crypto) {
    window.crypto = {};
  }
  window.crypto.randomUUID = vi.fn().mockReturnValue('mock-uuid');
});

// Mock the PocketBaseClient
vi.mock('../../services/PocketBaseClient', () => {
  let mockAuthStore = {
    isValid: false,
    token: null,
    model: null,
    save: vi.fn(),
    clear: vi.fn(),
    onChange: vi.fn((callback) => {
      // Immediately call callback with initial state
      callback(null, null);
    })
  };

  let usersCollection = {
    create: vi.fn(),
    authWithPassword: vi.fn()
  };

  const mockInstance = {
    collection: vi.fn((name) => {
      if (name === 'users') {
        return usersCollection;
      }
      return {};
    }),
    authStore: mockAuthStore
  };

  return {
    default: {
      getInstance: vi.fn(() => mockInstance),
      // Expose helper methods for tests to control the mock
      _setMockAuthStore: (store) => { mockAuthStore = store; },
      _setUsersCollection: (col) => { usersCollection = col; },
      _getMockInstance: () => mockInstance
    }
  };
});

// Import the mocked module to get access to helper methods
import PocketBaseClient from '../../services/PocketBaseClient';

describe('PocketBaseAuthService', () => {
  beforeEach(() => {
    // Clear all mocks between tests
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('signUp', () => {
    it('should call PocketBase users.create with correct parameters', async () => {
      // Arrange - Set up mock return value
      const mockUserRecord = {
        id: 'test-user-id',
        email: 'test@example.com',
        emailVisibility: true,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };

      const mockInstance = PocketBaseClient._getMockInstance();
      mockInstance.collection('users').create.mockResolvedValue(mockUserRecord);

      // Act - Call the service method
      const result = await PocketBaseAuthService.signUp('test@example.com', 'password123');

      // Assert - Verify PocketBase was called correctly
      expect(mockInstance.collection('users').create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        emailVisibility: true
      });

      // Verify the returned data
      expect(result).toEqual({
        data: { user: mockUserRecord },
        error: null
      });
    });

    it('should handle signup errors correctly', async () => {
      // Arrange - Set up mock to return an error
      const mockError = new Error('Email already in use');
      const mockInstance = PocketBaseClient._getMockInstance();
      mockInstance.collection('users').create.mockRejectedValue(mockError);

      // Act - Call the service method
      const result = await PocketBaseAuthService.signUp('test@example.com', 'password123');

      // Assert - Verify error handling
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('signIn', () => {
    it('should call PocketBase authWithPassword with correct parameters', async () => {
      // Arrange - Set up mock return value
      const mockUserRecord = {
        id: 'test-user-id',
        email: 'test@example.com',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };

      const mockAuthData = {
        token: 'test-token',
        record: mockUserRecord
      };

      const mockInstance = PocketBaseClient._getMockInstance();
      mockInstance.collection('users').authWithPassword.mockResolvedValue(mockAuthData);

      // Act - Call the service method
      const result = await PocketBaseAuthService.signIn('test@example.com', 'password123');

      // Assert - Verify PocketBase was called correctly
      expect(mockInstance.collection('users').authWithPassword).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );

      // Verify the returned data
      expect(result.data).toBeDefined();
      expect(result.data.user).toEqual(mockUserRecord);
      expect(result.data.session).toEqual({
        token: 'test-token',
        user: mockUserRecord
      });
      expect(result.error).toBeNull();
    });

    it('should handle signin errors correctly', async () => {
      // Arrange - Set up mock to return an error
      const mockError = new Error('Invalid login credentials');
      const mockInstance = PocketBaseClient._getMockInstance();
      mockInstance.collection('users').authWithPassword.mockRejectedValue(mockError);

      // Act - Call the service method
      const result = await PocketBaseAuthService.signIn('test@example.com', 'wrong-password');

      // Assert - Verify error handling
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('signInAnonymously', () => {
    it('should sign in anonymously successfully', async () => {
      // Arrange & Act
      const result = await PocketBaseAuthService.signInAnonymously();

      // Assert
      expect(result.data).toBeDefined();
      expect(result.data.user).toEqual({
        id: 'anonymous',
        email: 'anonymous@local',
        role: 'demo',
        created: expect.any(String),
        updated: expect.any(String)
      });
      expect(result.data.session).toEqual({
        token: 'anonymous-token',
        user: result.data.user
      });
      expect(result.error).toBeNull();
    });

    it('should handle errors during anonymous sign-in', async () => {
      // Arrange - Mock authStore.save to throw an error
      const mockInstance = PocketBaseClient._getMockInstance();
      mockInstance.authStore.save.mockImplementation(() => {
        throw new Error('Anonymous sign-in failed');
      });

      // Act
      const result = await PocketBaseAuthService.signInAnonymously();

      // Assert
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('signOut', () => {
    it('should clear the auth store', async () => {
      // Arrange
      const mockInstance = PocketBaseClient._getMockInstance();

      // Act - Call the service method
      const result = await PocketBaseAuthService.signOut();

      // Assert - Verify PocketBase was called
      expect(mockInstance.authStore.clear).toHaveBeenCalled();

      // Verify the returned data
      expect(result).toEqual({
        error: null
      });
    });

    it('should handle signout errors correctly', async () => {
      // Arrange - Mock authStore.clear to throw an error
      const mockInstance = PocketBaseClient._getMockInstance();
      mockInstance.authStore.clear.mockImplementation(() => {
        throw new Error('Session expired');
      });

      // Act - Call the service method
      const result = await PocketBaseAuthService.signOut();

      // Assert - Verify error handling
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('getCurrentSession', () => {
    it('should retrieve the current session when valid', async () => {
      // Arrange - Set up a valid session
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };

      const mockInstance = PocketBaseClient._getMockInstance();
      mockInstance.authStore.isValid = true;
      mockInstance.authStore.token = 'test-token';
      mockInstance.authStore.model = mockUser;

      // Act - Call the service method
      const result = await PocketBaseAuthService.getCurrentSession();

      // Assert - Verify the returned data
      expect(result.session).toEqual({
        token: 'test-token',
        user: mockUser
      });
      expect(result.error).toBeNull();
    });

    it('should return null when session is invalid', async () => {
      // Arrange - Set up an invalid session
      const mockInstance = PocketBaseClient._getMockInstance();
      mockInstance.authStore.isValid = false;
      mockInstance.authStore.token = null;
      mockInstance.authStore.model = null;

      // Act - Call the service method
      const result = await PocketBaseAuthService.getCurrentSession();

      // Assert - Verify null session
      expect(result.session).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should return null when token is missing', async () => {
      // Arrange - Set up session without token
      const mockInstance = PocketBaseClient._getMockInstance();
      mockInstance.authStore.isValid = false;
      mockInstance.authStore.token = null;
      mockInstance.authStore.model = null;

      // Act - Call the service method
      const result = await PocketBaseAuthService.getCurrentSession();

      // Assert - Verify null session
      expect(result.session).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should return null when model is missing', async () => {
      // Arrange - Set up session with token but no model
      const mockInstance = PocketBaseClient._getMockInstance();
      mockInstance.authStore.isValid = true;
      mockInstance.authStore.token = 'test-token';
      mockInstance.authStore.model = null;

      // Act - Call the service method
      const result = await PocketBaseAuthService.getCurrentSession();

      // Assert - Verify null session
      expect(result.session).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return the current user from auth store', () => {
      // Arrange - Set up auth store with user
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        emailVisibility: true
      };

      const mockInstance = PocketBaseClient._getMockInstance();
      mockInstance.authStore.model = mockUser;

      // Act - Call the service method
      const result = PocketBaseAuthService.getUser();

      // Assert - Verify the returned user
      expect(result).toEqual(mockUser);
    });

    it('should return null when no user in auth store', () => {
      // Arrange - Set up auth store without user
      const mockInstance = PocketBaseClient._getMockInstance();
      mockInstance.authStore.model = null;

      // Act - Call the service method
      const result = PocketBaseAuthService.getUser();

      // Assert - Verify null user
      expect(result).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    it('should set up an auth state change listener and return unsubscribe function', () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockInstance = PocketBaseClient._getMockInstance();

      // Act - Call the service method
      const unsubscribe = PocketBaseAuthService.onAuthStateChange(mockCallback);

      // Assert - Verify the result
      expect(unsubscribe).toBeDefined();
      expect(unsubscribe.data).toBeDefined();
      expect(unsubscribe.data.subscription).toBeDefined();
      expect(typeof unsubscribe.data.subscription.unsubscribe).toBe('function');
    });
  });
});
