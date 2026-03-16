/**
 * Mock Role Service
 * Provides role-based access control without requiring PocketBase
 * Use VITE_USE_MOCK=true to enable this service
 */

import type { IRoleService } from './RoleServiceFactory';

// Mock roles for users
const mockUserRoles: Record<string, string> = {
  'demo-user-id': 'demo',
  'manager-user-id': 'manager',
  'regular-user-id': 'user'
};

class MockRoleService implements IRoleService {
  static Roles = {
    USER: 'user',
    MANAGER: 'manager',
    DEMO_USER: 'demo'
  };

  static Permissions = {
    VIEW_OWN_COUPONS: 'viewOwnCoupons',
    VIEW_ANY_COUPON: 'viewAnyCoupon',
    CREATE_COUPON: 'createCoupon',
    EDIT_COUPON: 'editCoupon',
    DELETE_COUPON: 'deleteCoupon',
    VIEW_USERS: 'viewUsers',
    EDIT_USER_ROLE: 'editUserRole',
    MANAGE_SYSTEM: 'manageSystem'
  };

  async getUserRole(userId: string): Promise<string | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockUserRoles[userId] || null;
  }

  async hasPermission(permission: string, context: Record<string, unknown> = {}): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));

    const userId = context.userId as string | undefined;
    if (!userId) return false;

    const role = await this.getUserRole(userId);

    if (!role) {
      return false;
    }

    // Manager has all permissions
    if (role === MockRoleService.Roles.MANAGER) {
      return true;
    }

    switch (permission) {
      case MockRoleService.Permissions.VIEW_OWN_COUPONS:
      case MockRoleService.Permissions.CREATE_COUPON:
        return true;

      case MockRoleService.Permissions.VIEW_ANY_COUPON:
        return role === MockRoleService.Roles.MANAGER;

      case MockRoleService.Permissions.EDIT_COUPON:
      case MockRoleService.Permissions.DELETE_COUPON:
        // Demo users can't edit
        if (role === MockRoleService.Roles.DEMO_USER) {
          return false;
        }
        return true;

      case MockRoleService.Permissions.VIEW_USERS:
      case MockRoleService.Permissions.EDIT_USER_ROLE:
        return role === MockRoleService.Roles.MANAGER;

      case MockRoleService.Permissions.MANAGE_SYSTEM:
        return role === MockRoleService.Roles.MANAGER;

      default:
        return false;
    }
  }

  async checkUserRole(userId: string, requiredRole: string): Promise<boolean> {
    const userRole = await this.getUserRole(userId);
    return userRole === requiredRole;
  }

  async updateUserRole(userId: string, newRole: string): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!['user', 'manager', 'demo'].includes(newRole)) {
      return false;
    }

    mockUserRoles[userId] = newRole;
    return true;
  }
}

export const { Roles, Permissions } = MockRoleService;

export default new MockRoleService();
