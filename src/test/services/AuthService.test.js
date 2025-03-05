import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import AuthService from '../../services/AuthService';

// Mock window.crypto for UUID generation
beforeEach(() => {
  // Mock window.crypto.randomUUID
  if (!window.crypto) {
    window.crypto = {};
  }
  window.crypto.randomUUID = vi.fn().mockReturnValue('mock-uuid');
});

// Mock Supabase client to avoid actual API calls during tests
vi.mock('../../services/SupabaseClient', () => {
  const mockAuth = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInAnonymously: vi.fn()
  };

  return {
    default: {
      auth: mockAuth
    }
  };
});

// Import the mocked module
import supabase from '../../services/SupabaseClient';

describe('AuthService', () => {
  beforeEach(() => {
    // Clear all mocks between tests
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('signUp', () => {
    it('should call Supabase signUp with correct parameters', async () => {
      // Set up mock return value
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });

      // Call the service method
      const result = await AuthService.signUp('test@example.com', 'password123');

      // Verify Supabase was called correctly
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Verify the returned data
      expect(result).toEqual({
        user: { id: 'test-user-id' },
        error: null
      });
    });

    it('should handle signup errors correctly', async () => {
      // Set up mock to return an error
      const mockError = new Error('Email already in use');
      supabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: mockError
      });

      // Call the service method
      const result = await AuthService.signUp('test@example.com', 'password123');

      // Verify error handling
      expect(result).toEqual({
        user: null,
        error: mockError
      });
    });
  });

  describe('signIn', () => {
    it('should call Supabase signInWithPassword with correct parameters', async () => {
      // Set up mock return value
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { 
          user: { id: 'test-user-id', email: 'test@example.com' },
          session: { access_token: 'test-token' }
        },
        error: null
      });

      // Call the service method
      const result = await AuthService.signIn('test@example.com', 'password123');

      // Verify Supabase was called correctly
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Verify the returned data
      expect(result).toEqual({
        user: { id: 'test-user-id', email: 'test@example.com' },
        session: { access_token: 'test-token' },
        error: null
      });
    });

    it('should handle signin errors correctly', async () => {
      // Set up mock to return an error
      const mockError = new Error('Invalid login credentials');
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      });

      // Call the service method
      const result = await AuthService.signIn('test@example.com', 'wrong-password');

      // Verify error handling
      expect(result).toEqual({
        user: null,
        session: null,
        error: mockError
      });
    });
  });

  describe('signInAnonymously', () => {
    it('should sign in anonymously successfully', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'anonymous@example.com' };
      const mockSession = { user: mockUser, access_token: 'token-123' };
      
      // Set up the mock to return successful anonymous sign-in
      supabase.auth.signInAnonymously.mockResolvedValue({
        data: {
          user: mockUser,
          session: mockSession
        },
        error: null
      });
      
      // Act
      const result = await AuthService.signInAnonymously();
      
      // Assert
      expect(supabase.auth.signInAnonymously).toHaveBeenCalled();
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should handle errors during anonymous sign-in', async () => {
      // Arrange
      const mockError = new Error('Anonymous sign-in failed');
      
      // Set up the mock to return an error
      supabase.auth.signInAnonymously.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      });
      
      // Act
      const result = await AuthService.signInAnonymously();
      
      // Assert
      expect(supabase.auth.signInAnonymously).toHaveBeenCalled();
      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should handle unexpected exceptions during anonymous sign-in', async () => {
      // Arrange
      const mockError = new Error('Unexpected error');
      
      // Set up the mock to throw an exception
      supabase.auth.signInAnonymously.mockRejectedValue(mockError);
      
      // Act
      const result = await AuthService.signInAnonymously();
      
      // Assert
      expect(supabase.auth.signInAnonymously).toHaveBeenCalled();
      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signOut', () => {
    it('should call Supabase signOut method', async () => {
      // Set up mock return value
      supabase.auth.signOut.mockResolvedValue({
        error: null
      });

      // Call the service method
      const result = await AuthService.signOut();

      // Verify Supabase was called
      expect(supabase.auth.signOut).toHaveBeenCalled();
      
      // Verify the returned data
      expect(result).toEqual({
        error: null
      });
    });

    it('should handle signout errors correctly', async () => {
      // Set up mock to return an error
      const mockError = new Error('Session expired');
      supabase.auth.signOut.mockResolvedValue({
        error: mockError
      });

      // Call the service method
      const result = await AuthService.signOut();

      // Verify error handling
      expect(result).toEqual({
        error: mockError
      });
    });
  });

  describe('getCurrentSession', () => {
    it('should retrieve the current session', async () => {
      // Set up mock return value
      supabase.auth.getSession.mockResolvedValue({
        data: { 
          session: { 
            user: { id: 'test-user-id' },
            access_token: 'test-token' 
          }
        },
        error: null
      });

      // Call the service method
      const result = await AuthService.getCurrentSession();

      // Verify Supabase was called
      expect(supabase.auth.getSession).toHaveBeenCalled();
      
      // Verify the returned data
      expect(result).toEqual({
        session: { 
          user: { id: 'test-user-id' },
          access_token: 'test-token' 
        },
        error: null
      });
    });

    it('should handle session retrieval errors', async () => {
      // Set up mock to return an error
      const mockError = new Error('Unable to retrieve session');
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError
      });

      // Call the service method
      const result = await AuthService.getCurrentSession();

      // Verify error handling
      expect(result).toEqual({
        session: null,
        error: mockError
      });
    });
  });

  describe('onAuthStateChange', () => {
    it('should set up an auth state change listener', () => {
      // Mock implementation for onAuthStateChange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      
      supabase.auth.onAuthStateChange.mockImplementation((callback) => {
        // Call the callback to simulate an auth state change
        callback('SIGNED_IN', { user: { id: 'test-user-id' } });
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });

      // Call the service method
      const unsubscribe = AuthService.onAuthStateChange(mockCallback);

      // Verify Supabase was called with a callback
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      
      // Verify the callback was called with the correct event
      expect(mockCallback).toHaveBeenCalledWith('SIGNED_IN', { user: { id: 'test-user-id' } });
      
      // Verify the result is callable as a function
      expect(typeof unsubscribe).toBe('function');
      
      // Verify the object has the expected data structure
      expect(unsubscribe.data).toBeDefined();
      expect(unsubscribe.data.subscription).toBeDefined();
      expect(typeof unsubscribe.data.subscription.unsubscribe).toBe('function');
      
      // Call the unsubscribe function directly
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
}); 