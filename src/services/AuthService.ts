import supabase from './SupabaseClient';
import { AuthResponse, Session, User, UserResponse, AuthError } from '@supabase/supabase-js';
import { IAuthService } from './AuthServiceFactory';

/**
 * Interface for sign-in response
 */
interface SignInResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * Interface for sign-up response
 */
interface SignUpResponse {
  user: User | null;
  error: AuthError | null;
}

/**
 * Interface for sign-out response
 */
interface SignOutResponse {
  error: AuthError | null;
}

/**
 * Interface for session response
 */
interface SessionResponse {
  session: Session | null;
  error: AuthError | null;
}

/**
 * Type for auth state change callback
 */
type AuthStateChangeCallback = (event: string, session: Session | null) => void;

/**
 * Service for handling authentication-related operations using Supabase
 */
class AuthService {
  /**
   * Register a new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<SignUpResponse>} Result object
   */
  async signUp(email: string, password: string): Promise<SignUpResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      return {
        user: data?.user || null,
        error: error
      };
    } catch (error) {
      console.error('Error in signUp:', error);
      return {
        user: null,
        error: error as AuthError
      };
    }
  }

  /**
   * Sign in an existing user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<SignInResponse>} Result object
   */
  async signIn(email: string, password: string): Promise<SignInResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return {
        user: data?.user || null,
        session: data?.session || null,
        error: error
      };
    } catch (error) {
      console.error('Error in signIn:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError
      };
    }
  }

  /**
   * Sign in with password (compatibility method for IAuthService interface)
   * @param {object} credentials - Object containing email and password
   * @returns {Promise<any>} Result object matching Supabase's return format
   */
  async signInWithPassword(credentials: { email: string, password: string }): Promise<any> {
    return this.signIn(credentials.email, credentials.password);
  }

  /**
   * Generate a unique identifier for anonymous users
   * @returns {string} A unique identifier
   */
  private _generateUniqueId(): string {
    // Use browser-compatible UUID generation
    // First try the Web Crypto API if available
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    
    // Fallback implementation using Math.random
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Sign in anonymously without providing credentials
   * @returns {Promise<SignInResponse>} Result object
   */
  async signInAnonymously(): Promise<SignInResponse> {
    try {
      // Use Supabase's built-in anonymous sign-in method
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error('Error creating anonymous user:', error);
        return {
          user: null,
          session: null,
          error
        };
      }
      
      return {
        user: data.user,
        session: data.session,
        error: null
      };
    } catch (error) {
      console.error('Unexpected error during anonymous sign-in:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError
      };
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<SignOutResponse>} Result object
   */
  async signOut(): Promise<SignOutResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Error in signOut:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * Get the current session
   * @returns {Promise<SessionResponse>} Result object
   */
  async getCurrentSession(): Promise<SessionResponse> {
    try {
      const { data, error } = await supabase.auth.getSession();
      return {
        session: data?.session || null,
        error: error
      };
    } catch (error) {
      console.error('Error in getCurrentSession:', error);
      return {
        session: null,
        error: error as AuthError
      };
    }
  }

  /**
   * Get the current user
   * @returns {User | null} The current user or null
   */
  getUser(): User | null {
    try {
      // Get the user synchronously from the current session
      const user = supabase.auth.getUser().then(({ data, error }) => {
        if (error || !data.user) {
          return null;
        }
        
        return data.user;
      });
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Subscribe to auth state changes
   * @param {AuthStateChangeCallback} callback - Function to call on auth state change
   * @returns {Object} Object with unsubscribe method
   */
  onAuthStateChange(callback: AuthStateChangeCallback): any {
    // Get the original response from Supabase
    const response = supabase.auth.onAuthStateChange(callback);
    
    // Add a function property to the response so it can be called directly
    // This maintains compatibility with the existing AuthContext cleanup code
    const unsubscribeFunction = () => {
      if (response?.data?.subscription?.unsubscribe) {
        return response.data.subscription.unsubscribe();
      }
    };
    
    // Create a hybrid object that's both the response and a callable function
    return Object.assign(unsubscribeFunction, response);
  }
}

// Create and export a singleton instance
export default new AuthService(); 