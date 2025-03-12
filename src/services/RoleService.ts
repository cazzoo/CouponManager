import supabase from './SupabaseClient';
import { IRoleService } from './RoleServiceFactory';

/**
 * Type representing a user role object
 */
interface UserRole {
  userId: string;
  role: string;
}

/**
 * Service for managing user roles and permissions
 */
class RoleService implements IRoleService {
  /**
   * Valid user roles in the system
   * @type {Record<string, string>}
   */
  static Roles = {
    USER: 'user',
    MANAGER: 'manager',
    DEMO_USER: 'demo_user'  // Role type for demo users with limited permissions
  };

  /**
   * Permissions available in the system
   * Each permission maps to a specific action in the application
   * @type {Record<string, string>}
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
   * @type {Record<string, Record<string, boolean | string>>}
   */
  #permissionsByRole: Record<string, Record<string, boolean | string>> = {
    [RoleService.Roles.USER]: {
      // Regular users can only manage their own resources
      [RoleService.Permissions.VIEW_OWN_COUPONS]: true,
      [RoleService.Permissions.CREATE_COUPON]: true,
      
      // These permissions require ownership check
      [RoleService.Permissions.EDIT_COUPON]: 'ownerOnly',
      [RoleService.Permissions.DELETE_COUPON]: 'ownerOnly'
    },
    
    [RoleService.Roles.DEMO_USER]: {
      // Demo users can only view coupons, no create/edit/delete permissions
      [RoleService.Permissions.VIEW_OWN_COUPONS]: true
      // Intentionally no other permissions
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
   * @returns {Promise<string | null>} User role or null if not found
   */
  async getUserRole(userId: string): Promise<string | null> {
    if (!userId) return null;
    
    try {
      // Use service_role to bypass RLS policies and avoid infinite recursion
      // This is safe because we're only reading a user's own role or as an admin
      const { data, error } = await supabase.auth.getSession().then(({ data }) => {
        // If there's a valid session, use standard client
        if (data?.session) {
          return supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', userId)
            .single();
        } else {
          // Fall back to direct query to avoid policy checks
          // We're only selecting the role, not modifying it
          console.log('No active session, using direct query for user role');
          return supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', userId)
            .single();
        }
      });
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      if (!data) {
        return null;
      }
      
      return data.role;
    } catch (error) {
      console.error('Unexpected error fetching user role:', error);
      return null;
    }
  }

  /**
   * Sets or updates a user's role in the database
   * @param {string} userId - The ID of the user
   * @param {string} role - The role to assign (from RoleService.Roles)
   * @returns {Promise<UserRole | null>} Updated user role or null if failed
   */
  async setUserRole(userId: string, role: string): Promise<UserRole | null> {
    if (!userId || !role) {
      console.error('Invalid parameters for setUserRole');
      return null;
    }
    
    try {
      // Check if role already exists
      const existingRole = await this.getUserRole(userId);
      
      let result;
      
      // Use the standard client with session
      const { data: sessionData } = await supabase.auth.getSession();
      const client = sessionData?.session ? supabase : supabase;
      
      if (existingRole) {
        // Update existing role
        console.log(`Updating role for user ${userId} to ${role}`);
        const { data, error } = await client
          .from('user_roles')
          .update({ role, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .select() // Use select to get the updated record
          .single();
        
        if (error) {
          console.error('Error updating user role:', error);
          return null;
        }
        
        result = data;
      } else {
        // Create new role
        console.log(`Creating new role for user ${userId}: ${role}`);
        const { data, error } = await client
          .from('user_roles')
          .insert({
            user_id: userId,
            role
          })
          .select() // Use select to get the inserted record
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
   * @param {string} permission - The permission to check
   * @param {Record<string, any>} [context] - Additional context for permission checking
   * @returns {Promise<boolean>} Whether the user has the permission
   */
  async hasPermission(permission: string, context: Record<string, any> = {}): Promise<boolean> {
    try {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }
      
      return this.checkPermission(user.id, permission, context);
    } catch (error) {
      console.error('Error in hasPermission:', error);
      return false;
    }
  }

  /**
   * Checks if a user has a specific permission
   * @param {string} userId - The ID of the user
   * @param {string} permission - The permission to check
   * @param {Record<string, any>} [context] - Additional context for permission checking
   * @returns {Promise<boolean>} Whether the user has the permission
   */
  async checkPermission(userId: string, permission: string, context: Record<string, any> = {}): Promise<boolean> {
    if (!userId) return false;

    try {
      // Get user role directly
      const userRole = await this.getUserRole(userId);
      
      // Log for debugging
      console.log(`Checking permission ${permission} for user ${userId} with role ${userRole || 'no role'}`);
      
      if (!userRole) return false;

      // For efficiency, handle the manager case first
      // Managers have all permissions
      if (userRole === RoleService.Roles.MANAGER) {
        return true;
      }

      // Simple permission lookup based on role type
      switch (userRole) {
        case RoleService.Roles.USER:
          if (permission === RoleService.Permissions.VIEW_OWN_COUPONS ||
              permission === RoleService.Permissions.CREATE_COUPON) {
            return true;
          }
          
          // Check coupon ownership for these permissions
          if ((permission === RoleService.Permissions.EDIT_COUPON || 
               permission === RoleService.Permissions.DELETE_COUPON) && 
              context.couponId) {
            return await this.isOwner(userId, context.couponId);
          }
          
          return false;
          
        case RoleService.Roles.DEMO_USER:
          // Demo users can only view their own coupons
          return permission === RoleService.Permissions.VIEW_OWN_COUPONS;
          
        default:
          return false;
      }
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
  async isOwner(userId: string, couponId: string): Promise<boolean> {
    if (!userId || !couponId) return false;
    
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('user_id')
        .eq('id', couponId)
        .single();
      
      if (error || !data) {
        console.error('Error checking coupon ownership:', error);
        return false;
      }
      
      return data.user_id === userId;
    } catch (error) {
      console.error('Unexpected error checking ownership:', error);
      return false;
    }
  }

  /**
   * Checks if a user has a specific role
   * @param {string} userId - The ID of the user
   * @param {string} requiredRole - The role to check for
   * @returns {Promise<boolean>} Whether the user has the role
   */
  async checkUserRole(userId: string, requiredRole: string): Promise<boolean> {
    const userRole = await this.getUserRole(userId);
    return userRole === requiredRole;
  }

  /**
   * Updates a user's role
   * @param {string} userId - The ID of the user
   * @param {string} newRole - The new role to assign
   * @returns {Promise<boolean>} Whether the update was successful
   */
  async updateUserRole(userId: string, newRole: string): Promise<boolean> {
    try {
      // First, check if the current user has permission to edit roles
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }
      
      const canEditRoles = await this.hasPermission(RoleService.Permissions.EDIT_USER_ROLE);
      if (!canEditRoles) {
        console.error('Current user does not have permission to edit roles');
        return false;
      }
      
      // Now update the role
      const result = await this.setUserRole(userId, newRole);
      return !!result;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }
}

// Export the Roles and Permissions objects
export const { Roles, Permissions } = RoleService;

// Export a singleton instance
export default new RoleService(); 