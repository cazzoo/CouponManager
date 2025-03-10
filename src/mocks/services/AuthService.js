/**
 * Mock Authentication Service for Development
 * 
 * This service replaces the real Supabase authentication service in development mode,
 * allowing developers to log in with predefined test users without requiring Supabase.
 */

import { mockUsers } from '../data/users';

// In-memory user storage
let currentUser = null;
let users = [...mockUsers];
let authSubscribers = [];

// Simulate localStorage to maintain session across page refreshes
const getStoredUser = () => {
  try {
    const stored = window.localStorage.getItem('mock_auth_user');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading stored user:', error);
    return null;
  }
};

const storeUser = (user) => {
  try {
    if (user) {
      window.localStorage.setItem('mock_auth_user', JSON.stringify(user));
    } else {
      window.localStorage.removeItem('mock_auth_user');
    }
  } catch (error) {
    console.error('Error storing user:', error);
  }
};

// Initialize from localStorage
currentUser = getStoredUser();

// If no user is found in localStorage, create a default one for testing
if (!currentUser) {
  console.log('MockAuthService: Creating default user for testing');
  currentUser = {
    id: "00000000-0000-0000-0000-000000000001",
    email: "user@example.com",
    role: "user",
    name: "Test User"
  };
  storeUser(currentUser);
  
  // Notify subscribers about the new user
  setTimeout(() => {
    authSubscribers.forEach(callback => {
      try {
        callback('SIGNED_IN', { user: currentUser });
      } catch (err) {
        console.error('Error in auth subscriber callback:', err);
      }
    });
  }, 100);
}

// Mock authentication methods
const MockAuthService = {
  // Sign in with email and password
  signInWithPassword: async ({ email, password }) => {
    console.log('MockAuthService: Attempting login with email:', email);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user with matching credentials
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      console.log('MockAuthService: User not found or invalid password');
      // Important: Return error with correct structure matching how Supabase would format it
      return {
        data: null,
        error: {
          message: 'Invalid login credentials',
          status: 400
        }
      };
    }
    
    console.log('MockAuthService: Login successful for user:', user.email);
    // Create a session user (without sensitive info like password)
    const sessionUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    
    // Update current user
    currentUser = sessionUser;
    storeUser(sessionUser);
    
    // Notify subscribers with the correct event and session format
    console.log('MockAuthService: Notifying subscribers of sign in event');
    authSubscribers.forEach(callback => {
      try {
        callback('SIGNED_IN', { user: sessionUser });
      } catch (err) {
        console.error('Error in auth subscriber callback:', err);
      }
    });
    
    return {
      data: { user: sessionUser },
      error: null
    };
  },
  
  // Sign out
  signOut: async () => {
    console.log('MockAuthService: Signing out current user');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Clear current user
    currentUser = null;
    storeUser(null);
    
    // Notify subscribers
    console.log('MockAuthService: Notifying subscribers of sign out event');
    authSubscribers.forEach(callback => {
      try {
        callback('SIGNED_OUT', null);
      } catch (err) {
        console.error('Error in auth subscriber callback:', err);
      }
    });
    
    return { error: null };
  },
  
  // Get current user
  getUser: () => {
    if (currentUser) {
      console.log('MockAuthService: Getting current user:', currentUser.email, 'with ID:', currentUser.id);
      
      // Ensure the user has the required properties for the permission system
      return {
        ...currentUser,
        // Make sure ID is present and in the expected format
        id: currentUser.id || '00000000-0000-0000-0000-000000000001',
        // Ensure role is present
        role: currentUser.role || 'user'
      };
    } else {
      console.log('MockAuthService: No current user found, returning default user');
      
      // Always return a default user for development/testing
      const defaultUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'user@example.com',
        role: 'user',
        name: 'Test User'
      };
      
      // Store this user for future use
      currentUser = defaultUser;
      storeUser(defaultUser);
      
      console.log('MockAuthService: Set default user:', defaultUser.email);
      return defaultUser;
    }
  },
  
  // Subscribe to auth changes
  onAuthStateChange: (callback) => {
    console.log('MockAuthService: Adding auth state change subscriber');
    authSubscribers.push(callback);
    
    // Immediately call with current state
    if (currentUser) {
      console.log('MockAuthService: Immediately notifying new subscriber about existing session');
      try {
        callback('SIGNED_IN', { user: currentUser });
      } catch (err) {
        console.error('Error calling auth subscriber with initial state:', err);
      }
    } else {
      console.log('MockAuthService: Immediately notifying new subscriber about no session');
      try {
        callback('SIGNED_OUT', null);
      } catch (err) {
        console.error('Error calling auth subscriber with initial state:', err);
      }
    }
    
    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            console.log('MockAuthService: Unsubscribing auth state change listener');
            authSubscribers = authSubscribers.filter(cb => cb !== callback);
          }
        }
      }
    };
  },
  
  // Check if email exists
  listUsers: async ({ email }) => {
    const usersWithEmail = users.filter(user => user.email === email);
    return {
      data: usersWithEmail.map(u => ({ id: u.id, email: u.email })),
      error: null
    };
  },
  
  // Admin methods
  admin: {
    // List all users in the system
    listUsers: async () => {
      console.log('MockAuthService: Admin list users called');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return all mock users without sensitive info
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        created_at: user.created_at,
        updated_at: user.created_at
      }));
      
      console.log(`MockAuthService: Returning ${sanitizedUsers.length} users`);
      
      return {
        data: {
          users: sanitizedUsers
        },
        error: null
      };
    }
  }
};

export default MockAuthService; 