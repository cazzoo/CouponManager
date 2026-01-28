/**
 * Factory for selecting the appropriate role service implementation
 * This factory now returns PocketBase role service
 */

import PocketBaseRoleService, { Roles, Permissions } from './PocketBaseRoleService';

/**
 * Interface for RoleService implementations
 */
export interface IRoleService {
  getUserRole(userId: string): Promise<string | null>;
  hasPermission(permission: string, context?: Record<string, any>): Promise<boolean>;
  checkUserRole(userId: string, requiredRole: string): Promise<boolean>;
  updateUserRole(userId: string, newRole: string): Promise<boolean>;
}

/**
 * Gets the appropriate role service based on the environment
 * @returns {IRoleService} The role service
 */
export const getRoleService = (): IRoleService => {
  console.log('Using POCKETBASE role service');
  return PocketBaseRoleService as unknown as IRoleService;
};

// Expose the roles and permissions
export { Roles, Permissions };

// For immediate use where async isn't possible
export default PocketBaseRoleService as unknown as IRoleService; 