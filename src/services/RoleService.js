import supabase from './SupabaseClient';

/**
 * Service for managing user roles and permissions
 */
class RoleService {
  /**
   * Valid user roles in the system
   * @type {Object}
   */
  static Roles = {
    USER: 'user',
    MANAGER: 'manager'
  };

  /**
   * Permissions available in the system
   * Each permission maps to a specific action in the application
   * @type {Object}
   */
  static Permissions = {
    // Coupon permissions
    VIEW_OWN_COUPONS: 'viewOwnCoupons',     // View coupons owned by the user
    VIEW_ANY_COUPON: 'viewAnyCoupon',       // View any coupon in the system
    CREATE_COUPON: 'createCoupon',          // Create a new coupon
    EDIT_COUPON: 'editCoupon',              // Edit an existing coupon
    DELETE_COUPON: 'deleteCoupon',          // Delete a coupon
    
    // User management permissions
    VIEW_USERS: 'viewUsers',                // View user list
    EDIT_USER_ROLE: 'editUserRole',         // Change a user's role
    
    // System permissions
    MANAGE_SYSTEM: 'manageSystem'           // System-wide operations
  };

  /**
   * Permission mappings by role
   * Defines which permissions each role has access to
   * @type {Object}
   */
  #permissionsByRole = {
    [RoleService.Roles.USER]: {
      // Regular users can only manage their own resources
      [RoleService.Permissions.VIEW_OWN_COUPONS]: true,
      [RoleService.Permissions.CREATE_COUPON]: true,
      
      // These permissions require ownership check
      [RoleService.Permissions.EDIT_COUPON]: 'ownerOnly',
      [RoleService.Permissions.DELETE_COUPON]: 'ownerOnly'
    },
    
    [RoleService.Roles.MANAGER]: {
      // Managers have all permissions
      [RoleService.Permissions.VIEW_OWN_COUPONS]: true,
      [RoleService.Permissions.VIEW_ANY_COUPON]: true,
      [RoleService.Permissions.CREATE_COUPON]: true,
      [RoleService.Permissions.EDIT_COUPON]: true,
      [RoleService.Permissions.DELETE_COUPON]: true,
      [RoleService.Permissions.VIEW_USERS]: true,
      [RoleService.Permissions.EDIT_USER_ROLE]: true,
      [RoleService.Permissions.MANAGE_SYSTEM]: true
    }
  };

  /**
   * Retrieves a user's role from the database
   * @param {string} userId - The ID of the user
   * @returns {Promise<Object|null>} User role information or null if not found
   */
  async getUserRole(userId) {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      return {
        userId: data.user_id,
        role: data.role
      };
    } catch (error) {
      console.error('Unexpected error fetching user role:', error);
      return null;
    }
  }

  /**
   * Sets or updates a user's role in the database
   * @param {string} userId - The ID of the user
   * @param {string} role - The role to assign (from RoleService.Roles)
   * @returns {Promise<Object|null>} Updated user role or null if failed
   */
  async setUserRole(userId, role) {
    if (!userId || !role) {
      console.error('Invalid parameters for setUserRole');
      return null;
    }
    
    try {
      // Check if role already exists
      const existingRole = await this.getUserRole(userId);
      
      let result;
      
      if (existingRole) {
        // Update existing role
        const { data, error } = await supabase
          .from('user_roles')
          .update({ role, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .single();
        
        if (error) {
          console.error('Error updating user role:', error);
          return null;
        }
        
        result = data;
      } else {
        // Create new role
        const { data, error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role
          })
          .single();
        
        if (error) {
          console.error('Error creating user role:', error);
          return null;
        }
        
        result = data;
      }
      
      return {
        userId: result.user_id,
        role: result.role
      };
    } catch (error) {
      console.error('Unexpected error setting user role:', error);
      return null;
    }
  }

  /**
   * Checks if a user has a specific permission
   * @param {string} userId - The ID of the user
   * @param {string} permission - The permission to check
   * @param {Object} [options] - Additional options for permission checking
   * @param {string} [options.couponId] - The ID of the coupon for ownership checks
   * @returns {Promise<boolean>} Whether the user has the permission
   */
  async checkPermission(userId, permission, options = {}) {
    if (!userId) return false;

    try {
      const userRole = await this.getUserRole(userId);
      if (!userRole) return false;

      // Managers have all permissions
      if (userRole.role === RoleService.Roles.MANAGER) {
        return true;
      }

      // Check if the permission is in the user's role permissions
      const permissionsByRole = {
        [RoleService.Roles.USER]: [
          RoleService.Permissions.VIEW_OWN_COUPONS,
          RoleService.Permissions.EDIT_COUPON,
          RoleService.Permissions.DELETE_COUPON
        ],
        [RoleService.Roles.MANAGER]: Object.values(RoleService.Permissions)
      };
      
      const rolePermissions = permissionsByRole[userRole.role] || [];
      
      // If the permission requires ownership, check if the user owns the resource
      if (rolePermissions.includes(permission) && permission.endsWith('Coupon') && options.couponId) {
        return await this.isOwner(userId, options.couponId);
      }
      
      return rolePermissions.includes(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if a user is the owner of a specific coupon
   * @param {string} userId - The user ID to check
   * @param {string} couponId - The coupon ID to check ownership for
   * @returns {Promise<boolean>} - True if the user owns the coupon, false otherwise
   */
  async isOwner(userId, couponId) {
    if (!userId || !couponId) return false;

    try {
      console.log('Calling supabase.from with:', 'coupons');
      const fromResult = supabase.from('coupons');
      console.log('fromResult:', fromResult);
      
      console.log('Calling select with:', 'id, user_id');
      const selectResult = fromResult.select('id, user_id');
      console.log('selectResult:', selectResult);
      
      console.log('Calling eq with:', 'id', couponId);
      const eqResult = selectResult.eq('id', couponId);
      console.log('eqResult:', eqResult);
      
      console.log('Calling single');
      const { data, error } = await eqResult.single();
      
      console.log('isOwner data:', data);
      console.log('isOwner error:', error);
      console.log('userId:', userId);
      console.log('data.user_id:', data?.user_id);
      console.log('comparison result:', data?.user_id === userId);

      if (error || !data) return false;
      
      return data.user_id === userId;
    } catch (error) {
      console.error('Error checking coupon ownership:', error);
      return false;
    }
  }
}

// Export the class directly
export default new RoleService();
export const { Roles, Permissions } = RoleService; 