/**
 * Factory for selecting the appropriate authentication service implementation
 * This allows us to switch between mock auth for development and Supabase auth for production
 */

import supabase from './SupabaseClient.js';

/**
 * Determines if we should use the in-memory database
 * @returns {boolean} True if in-memory database should be used
 */
const shouldUseMemoryDb = () => {
  // Check for environment variable
  const useMemoryDb = import.meta.env.VITE_USE_MEMORY_DB;
  
  // Convert string to boolean, default to false if not set
  return useMemoryDb === 'true' || useMemoryDb === true;
};

/**
 * Gets the appropriate auth service based on the environment
 * @returns {Object} The authentication service
 */
export const getAuthService = async () => {
  // In development with memory DB, use the mock auth service
  if (shouldUseMemoryDb()) {
    console.log('Using MOCK authentication service for development');
    try {
      // Dynamically import the mock auth service to avoid bundling it in production
      const { default: MockAuthService } = await import('../mocks/services/AuthService.js');
      return MockAuthService;
    } catch (error) {
      console.error('Error loading mock auth service:', error);
      console.warn('Falling back to Supabase authentication');
      return supabase.auth;
    }
  }
  
  // Otherwise, use Supabase auth
  console.log('Using SUPABASE authentication service');
  return supabase.auth;
};

// For immediate use where async isn't possible, default to Supabase
// but this will be replaced with the appropriate service when getAuthService is called
export default supabase.auth; 