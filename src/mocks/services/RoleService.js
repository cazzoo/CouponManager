/**
 * Mock Role Service for Development
 * 
 * This service replaces the real RoleService in development mode,
 * allowing testing without requiring Supabase connection.
 */

import { mockUsers } from '../data/users';
import { Roles, Permissions } from '../../services/RoleService';

// Try to import mock coupons if available
let mockCoupons = [];
try {
  // Using dynamic import to avoid circular dependencies
  import('../data/coupons.js').then(module => {
    mockCoupons = module.default || module.mockCoupons || [];
    console.log(`Mock RoleService: Loaded ${mockCoupons.length} mock coupons`);
  }).catch(err => {
    console.log('Mock RoleService: Could not load mock coupons', err);
  });
} catch (error) {
  console.log('Mock RoleService: No mock coupons available', error);
}

// In-memory role storage
let userRoles = [];

// Initialize roles from mock users
const initializeRoles = () => {
  userRoles = mockUsers.map(user => ({
    user_id: user.id,
    role: user.role || 'user',
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.created_at || new Date().toISOString()
  }));

  console.log('Mock RoleService: Initialized with roles:', userRoles);
};

// Initialize on load
initializeRoles();

/**
 * Permission mappings by role - copied from the real RoleService
 */
const permissionsByRole = {
  [Roles.USER]: {
    // Regular users can only manage their own resources
    [Permissions.VIEW_OWN_COUPONS]: true,
    [Permissions.CREATE_COUPON]: true,
    
    // These permissions require ownership check
    [Permissions.EDIT_COUPON]: 'ownerOnly',
    [Permissions.DELETE_COUPON]: 'ownerOnly'
  },
  
  [Roles.DEMO_USER]: {
    // Demo users can only view coupons, no create/edit/delete permissions
    [Permissions.VIEW_OWN_COUPONS]: true
    // Intentionally no other permissions
  },
  
  [Roles.MANAGER]: {
    // Managers have all permissions
    [Permissions.VIEW_OWN_COUPONS]: true,
    [Permissions.VIEW_ANY_COUPON]: true,
    [Permissions.CREATE_COUPON]: true,
    [Permissions.EDIT_COUPON]: true,
    [Permissions.DELETE_COUPON]: true,
    [Permissions.VIEW_USERS]: true,
    [Permissions.EDIT_USER_ROLE]: true,
    [Permissions.MANAGE_SYSTEM]: true
  }
};

const MockRoleService = {
  /**
   * Retrieves a user's role from memory
   * @param {string} userId - The ID of the user
   * @returns {Promise<Object|null>} User role information or null if not found
   */
  getUserRole: async (userId) => {
    console.log('Mock RoleService: Getting role for user:', userId);
    
    if (!userId) {
      console.warn('Mock RoleService: No userId provided');
      return null;
    }
    
    // Special case for the default test user
    if (userId === '00000000-0000-0000-0000-000000000001') {
      console.log('Mock RoleService: Returning default role for test user');
      return {
        userId: '00000000-0000-0000-0000-000000000001',
        role: Roles.USER
      };
    }
    
    // Special case for the demo user
    if (userId === '00000000-0000-0000-0000-000000000004') {
      console.log('Mock RoleService: Identified demo user, returning DEMO_USER role');
      return {
        userId: '00000000-0000-0000-0000-000000000004',
        role: Roles.DEMO_USER
      };
    }
    
    // Special case for the manager user
    if (userId === '00000000-0000-0000-0000-000000000002') {
      console.log('Mock RoleService: Identified manager user, returning MANAGER role');
      return {
        userId: '00000000-0000-0000-0000-000000000002',
        role: Roles.MANAGER
      };
    }
    
    const roleData = userRoles.find(r => r.user_id === userId);
    
    if (roleData) {
      console.log('Mock RoleService: Found role:', roleData.role, 'for user ID:', userId);
      return {
        userId: roleData.user_id,
        role: roleData.role
      };
    }
    
    // If no role found, create one
    console.log('Mock RoleService: No role found, creating default USER role');
    userRoles.push({
      user_id: userId,
      role: Roles.USER,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    return {
      userId: userId,
      role: Roles.USER
    };
  },

  /**
   * Sets or updates a user's role in memory
   * @param {string} userId - The ID of the user
   * @param {string} role - The role to assign
   * @returns {Promise<Object|null>} Updated user role or null if failed
   */
  setUserRole: async (userId, role) => {
    console.log('Mock RoleService: Setting role for user:', userId, 'to:', role);
    
    if (!userId || !role) {
      console.error('Invalid parameters for setUserRole');
      return null;
    }
    
    const existingRoleIndex = userRoles.findIndex(r => r.user_id === userId);
    const timestamp = new Date().toISOString();
    
    if (existingRoleIndex >= 0) {
      // Update existing role
      userRoles[existingRoleIndex] = {
        ...userRoles[existingRoleIndex],
        role,
        updated_at: timestamp
      };
    } else {
      // Create new role
      userRoles.push({
        user_id: userId,
        role,
        created_at: timestamp,
        updated_at: timestamp
      });
    }
    
    // Return the updated/created role
    return {
      userId,
      role
    };
  },

  /**
   * Checks if a user has a specific permission
   * @param {string} userId - The ID of the user
   * @param {string} permission - The permission to check
   * @param {Object} [options] - Additional options for permission checking
   * @returns {Promise<boolean>} Whether the user has the permission
   */
  checkPermission: async (userId, permission, options = {}) => {
    console.log('Mock RoleService: Checking permission:', permission, 'for user:', userId);
    
    if (!userId) {
      console.log('Mock RoleService: Permission denied - no userId provided');
      return false;
    }

    // Get user role
    const userData = await MockRoleService.getUserRole(userId);
    if (!userData) {
      console.warn('Mock RoleService: No role found for user:', userId);
      return false;
    }

    const userRole = userData.role;
    console.log('Mock RoleService: User has role:', userRole);
    
    // Demo user case - explicitly deny certain permissions
    if (userRole === Roles.DEMO_USER) {
      // Demo users can only view, not create/edit/delete
      if (permission === Permissions.CREATE_COUPON || 
          permission === Permissions.EDIT_COUPON || 
          permission === Permissions.DELETE_COUPON) {
        console.log('Mock RoleService: Demo user denied permission:', permission);
        return false;
      }
    }
    
    // Managers have all permissions
    if (userRole === Roles.MANAGER) {
      console.log('Mock RoleService: User is a manager, granting permission for', permission);
      return true;
    }
    
    // Check specific permission
    const rolePerms = permissionsByRole[userRole] || {};
    const hasPerm = rolePerms[permission];
    
    if (!hasPerm) {
      console.log(`Mock RoleService: Permission ${permission} denied for role ${userRole}`);
      return false;
    }
    
    // Handle ownership-dependent permissions
    if (hasPerm === 'ownerOnly' && options.couponId) {
      const isOwner = await MockRoleService.isOwner(userId, options.couponId);
      console.log(`Mock RoleService: Checking ownership for coupon ${options.couponId}, isOwner: ${isOwner}`);
      return isOwner;
    }
    
    console.log(`Mock RoleService: Permission ${permission} granted for role ${userRole}`);
    return !!hasPerm;
  },

  /**
   * Check if a user is the owner of a specific coupon
   * @param {string} userId - The user ID to check
   * @param {string} couponId - The coupon ID to check ownership for
   * @returns {Promise<boolean>} - True if the user owns the coupon, false otherwise
   */
  isOwner: async (userId, couponId) => {
    console.log(`Mock RoleService: Checking if user ${userId} owns coupon ${couponId}`);
    
    if (!userId || !couponId) return false;
    
    try {
      // Try to dynamically import mock coupons if not available yet
      if (!mockCoupons || mockCoupons.length === 0) {
        try {
          const couponsModule = await import('../data/coupons.js');
          if (couponsModule && (couponsModule.default || couponsModule.mockCoupons)) {
            const loadedCoupons = couponsModule.default || couponsModule.mockCoupons || [];
            console.log(`Mock RoleService: Dynamically loaded ${loadedCoupons.length} mock coupons`);
            // Use the coupons directly from the module
            const coupon = loadedCoupons.find(c => c.id === couponId);
            return coupon?.user_id === userId;
          }
        } catch (err) {
          console.error('Error loading mock coupons dynamically:', err);
        }
      }
      
      // If we still don't have coupons data, use fallback behavior
      return userId.endsWith(couponId.slice(-4));
    } catch (error) {
      console.error('Error in isOwner:', error);
      return false;
    }
  }
};

export default MockRoleService; 