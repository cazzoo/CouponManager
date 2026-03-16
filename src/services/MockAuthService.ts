/**
 * Mock Authentication Service
 * Provides authentication functionality without requiring PocketBase
 * Use VITE_USE_MOCK=true to enable this service
 */

import type { User, Session, AuthResponse, SignUpResponse } from './PocketBaseAuthService';

// Mock users for demo mode
const MOCK_USERS: Record<string, { user: User; password: string }> = {
  'demo@example.com': {
    user: {
      id: 'demo-user-id',
      email: 'demo@example.com',
      role: 'demo',
      name: 'Demo User',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    },
    password: 'demo12345'
  },
  'manager@example.com': {
    user: {
      id: 'manager-user-id',
      email: 'manager@example.com',
      role: 'manager',
      name: 'Manager User',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    },
    password: 'password123'
  },
  'user@example.com': {
    user: {
      id: 'regular-user-id',
      email: 'user@example.com',
      role: 'user',
      name: 'Regular User',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    },
    password: 'password123'
  }
};

class MockAuthService {
  private currentUser: User | null = null;
  private currentSession: Session | null = null;
  private authChangeListeners: Set<(event: string, session: Session | null) => void> = new Set();

  async signIn(email: string, password: string): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockUser = MOCK_USERS[email.toLowerCase()];

    if (!mockUser || mockUser.password !== password) {
      return {
        data: null,
        error: new Error('Invalid email or password')
      };
    }

    const session: Session = {
      token: `mock-token-${Date.now()}`,
      user: mockUser.user
    };

    this.currentUser = mockUser.user;
    this.currentSession = session;

    this.notifyAuthChange('signedIn', session);

    return {
      data: { user: mockUser.user, session },
      error: null
    };
  }

  async signInWithPassword(credentials: { email: string; password: string }): Promise<AuthResponse> {
    return this.signIn(credentials.email, credentials.password);
  }

  async signInAnonymously(): Promise<AuthResponse> {
    return this.signIn('demo@example.com', 'demo12345');
  }

  async signUp(email: string, password: string): Promise<SignUpResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Check if user already exists
    if (MOCK_USERS[email.toLowerCase()]) {
      return {
        data: null,
        error: new Error('User already exists')
      };
    }

    // Create new mock user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      role: 'user',
      name: 'New User',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    // Store the new user (in memory only)
    MOCK_USERS[email.toLowerCase()] = {
      user: newUser,
      password
    };

    return {
      data: { user: newUser },
      error: null
    };
  }

  async signOut(): Promise<boolean> {
    this.currentUser = null;
    this.currentSession = null;
    this.notifyAuthChange('signedOut', null);
    return true;
  }

  get isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentSession !== null;
  }

  get currentToken(): string | null {
    return this.currentSession?.token || null;
  }

  getUser(): User | null {
    return this.currentUser;
  }

  addAuthChangeListener(callback: (event: string, session: Session | null) => void): void {
    this.authChangeListeners.add(callback);
  }

  removeAuthChangeListener(callback: (event: string, session: Session | null) => void): void {
    this.authChangeListeners.delete(callback);
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void): { data: { unsubscribe: () => void } } {
    this.addAuthChangeListener(callback);
    return {
      data: {
        unsubscribe: () => {
          this.removeAuthChangeListener(callback);
        }
      }
    };
  }

  async getSession(): Promise<{ session: Session | null; error: Error | null }> {
    return {
      session: this.currentSession,
      error: null
    };
  }

  private notifyAuthChange(event: string, session: Session | null): void {
    this.authChangeListeners.forEach(callback => {
      try {
        callback(event, session);
      } catch (error) {
        console.error('Error in auth state change callback:', error);
      }
    });
  }
}

export default new MockAuthService();
