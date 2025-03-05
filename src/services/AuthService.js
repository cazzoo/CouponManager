import supabase from './SupabaseClient';

/**
 * Service for handling authentication-related operations using Supabase
 */
class AuthService {
  /**
   * Register a new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<{user: Object|null, error: Error|null}>} Result object
   */
  async signUp(email, password) {
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
        error: error
      };
    }
  }

  /**
   * Sign in an existing user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<{user: Object|null, session: Object|null, error: Error|null}>} Result object
   */
  async signIn(email, password) {
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
        error: error
      };
    }
  }

  /**
   * Generate a unique identifier for anonymous users
   * @returns {string} A unique identifier
   */
  _generateUniqueId() {
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
   * @returns {Promise<{user: Object|null, session: Object|null, error: Error|null}>} Result object
   */
  async signInAnonymously() {
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
        error
      };
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<{error: Error|null}>} Result object
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Error in signOut:', error);
      return { error };
    }
  }

  /**
   * Get the current session
   * @returns {Promise<{session: Object|null, error: Error|null}>} Result object
   */
  async getCurrentSession() {
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
        error: error
      };
    }
  }

  /**
   * Subscribe to auth state changes
   * @param {Function} callback - Function to call on auth state change
   * @returns {Object} Object with data.subscription.unsubscribe method that can also be called directly as a function
   */
  onAuthStateChange(callback) {
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