/**
 * Factory for selecting the appropriate role service implementation
 * Supports both PocketBase and Mock modes based on environment variable
 */

import PocketBaseRoleService, { Roles, Permissions } from './PocketBaseRoleService';
import MockRoleService from './MockRoleService';

/**
 * Interface for RoleService implementations
 */
export interface IRoleService {
  getUserRole(userId: string): Promise<string | null>;
  hasPermission(permission: string, context?: Record<string, unknown>): Promise<boolean>;
  checkUserRole(userId: string, requiredRole: string): Promise<boolean>;
  updateUserRole(userId: string, newRole: string): Promise<boolean>;
}

// Check if mock mode should be used
const useMockMode = (): boolean => {
  return import.meta.env.VITE_USE_MOCK === 'true';
};

/**
 * Gets the appropriate role service based on the environment
 * @returns {IRoleService} The role service
 */
export const getRoleService = (): IRoleService => {
  if (useMockMode()) {
    console.log('Using MOCK role service (VITE_USE_MOCK=true)');
    return MockRoleService as unknown as IRoleService;
  }
  console.log('Using POCKETBASE role service');
  return PocketBaseRoleService as unknown as IRoleService;
};

// Expose the roles and permissions
export { Roles, Permissions };

// For immediate use where async isn't possible
export default PocketBaseRoleService as unknown as IRoleService;
