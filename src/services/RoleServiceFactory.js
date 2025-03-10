/**
 * Factory for selecting the appropriate role service implementation
 * This allows us to switch between mock service for development and Supabase for production
 */

import RealRoleService, { Roles, Permissions } from './RoleService';

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
 * Gets the appropriate role service based on the environment
 * @returns {Object} The role service
 */
export const getRoleService = async () => {
  // In development with memory DB, use the mock role service
  if (shouldUseMemoryDb()) {
    console.log('Using MOCK role service for development');
    try {
      // Dynamically import the mock role service to avoid bundling it in production
      const { default: MockRoleService } = await import('../mocks/services/RoleService.js');
      return MockRoleService;
    } catch (error) {
      console.error('Error loading mock role service:', error);
      console.warn('Falling back to real role service');
      return RealRoleService;
    }
  }
  
  // Otherwise, use real role service
  console.log('Using REAL role service');
  return RealRoleService;
};

// Expose the roles and permissions
export { Roles, Permissions };

// For immediate use where async isn't possible, default to real service
// but this will be replaced with the appropriate service when getRoleService is called
export default RealRoleService; 