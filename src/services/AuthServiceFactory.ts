/**
 * Factory for selecting the appropriate authentication service implementation
 * This allows us to switch between mock auth for development and Supabase auth for production
 */

import supabase from './SupabaseClient';
import { AuthResponse, Session, User, SignInWithPasswordCredentials, SupabaseClient } from '@supabase/supabase-js';

/**
 * Interface for AuthService implementations
 */
export interface IAuthService {
  signUp(email: string, password: string): Promise<AuthResponse>;
  signInWithPassword(credentials: SignInWithPasswordCredentials): Promise<AuthResponse>;
  signInAnonymously(): Promise<AuthResponse>;
  signOut(): Promise<{ error: Error | null }>;
  getSession(): Promise<{ data: { session: Session | null }, error: Error | null }>;
  getUser(): Promise<{ data: { user: User | null }, error: Error | null }>;
  onAuthStateChange(callback: (event: string, session: Session | null) => void): { data: any, error: Error | null };
}

/**
 * Determines if we should use the in-memory database
 * @returns {boolean} True if in-memory database should be used
 */
const shouldUseMemoryDb = (): boolean => {
  // Check for environment variable
  const useMemoryDb = import.meta.env.VITE_USE_MEMORY_DB;
  
  // Convert string to boolean, default to false if not set
  return useMemoryDb === 'true';
};

/**
 * Gets the appropriate auth service based on the environment
 * @returns {Promise<IAuthService>} The authentication service
 */
export const getAuthService = async (): Promise<IAuthService> => {
  // In development with memory DB, use the mock auth service
  if (shouldUseMemoryDb()) {
    console.log('Using MOCK authentication service for development');
    try {
      // Dynamically import the mock auth service to avoid bundling it in production
      const { default: MockAuthService } = await import('../mocks/services/AuthService.js');
      return MockAuthService as unknown as IAuthService;
    } catch (error) {
      console.error('Error loading mock auth service:', error);
      console.warn('Falling back to Supabase authentication');
      return supabase.auth as unknown as IAuthService;
    }
  }
  
  // Otherwise, use Supabase auth
  console.log('Using SUPABASE authentication service');
  return supabase.auth as unknown as IAuthService;
};

// For immediate use where async isn't possible, default to Supabase
// but this will be replaced with the appropriate service when getAuthService is called
export default supabase.auth as unknown as IAuthService; 