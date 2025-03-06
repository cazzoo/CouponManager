import supabase from './SupabaseClient.js';
import RoleService, { Permissions } from './RoleService.js';

/**
 * Service for managing coupons using Supabase for data persistence
 * Includes permission checking and user ownership
 */
class SupabaseCouponService {
  /**
   * The table name in Supabase where coupon data is stored
   * @type {string}
   */
  #tableName = 'coupons';

  /**
   * Converts a database coupon (snake_case) to an application coupon (camelCase)
   * @param {Object} dbCoupon - Coupon data from the database
   * @returns {Object} - Coupon data in application format
   */
  #mapToCamelCase(dbCoupon) {
    return {
      id: dbCoupon.id,
      retailer: dbCoupon.retailer,
      initialValue: dbCoupon.initial_value,
      currentValue: dbCoupon.current_value,
      expirationDate: dbCoupon.expiration_date ? new Date(dbCoupon.expiration_date) : null,
      activationCode: dbCoupon.activation_code,
      pin: dbCoupon.pin,
      createdAt: dbCoupon.created_at ? new Date(dbCoupon.created_at) : null,
      updatedAt: dbCoupon.updated_at ? new Date(dbCoupon.updated_at) : null,
      userId: dbCoupon.user_id // Include the user ID
    };
  }

  /**
   * Converts an application coupon (camelCase) to a database coupon (snake_case)
   * @param {Object} appCoupon - Coupon data from the application
   * @returns {Object} - Coupon data in database format
   */
  #mapToSnakeCase(appCoupon) {
    const result = {
      retailer: appCoupon.retailer,
      initial_value: appCoupon.initialValue,
      current_value: appCoupon.currentValue,
      expiration_date: appCoupon.expirationDate ? appCoupon.expirationDate.toISOString() : null,
      activation_code: appCoupon.activationCode,
      pin: appCoupon.pin,
      updated_at: new Date().toISOString() // Always update the updated_at timestamp
    };

    // Only include id for updates, not for inserts
    if (appCoupon.id) {
      result.id = appCoupon.id;
    }

    // Include user_id if provided
    if (appCoupon.userId) {
      result.user_id = appCoupon.userId;
    }

    return result;
  }

  /**
   * Retrieves all coupons the user has access to view
   * @param {string} userId - The ID of the user making the request
   * @returns {Promise<Array>} A promise that resolves to an array of coupon objects
   */
  async getAllCoupons(userId) {
    try {
      // Check if user has permission to view all coupons
      const canViewAll = await RoleService.checkPermission(userId, Permissions.VIEW_ANY_COUPON);
      
      let query = supabase
        .from(this.#tableName)
        .select('*');
      
      // If user can't view all coupons, restrict to their own
      if (!canViewAll) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.order('id');

      if (error) {
        console.error('Error fetching coupons:', error);
        return [];
      }

      return data.map(dbCoupon => this.#mapToCamelCase(dbCoupon));
    } catch (error) {
      console.error('Unexpected error fetching coupons:', error);
      return [];
    }
  }

  /**
   * Adds a new coupon to the database
   * @param {Object} coupon - The coupon object to add
   * @param {string} userId - The ID of the user creating the coupon
   * @returns {Promise<Object|null>} A promise that resolves to the added coupon or null if failed
   */
  async addCoupon(coupon, userId) {
    try {
      // Add user_id to the coupon data
      const couponWithUser = {
        ...coupon,
        userId: userId
      };
      
      // Convert to snake_case for database
      const dbCoupon = this.#mapToSnakeCase(couponWithUser);
      
      const { data, error } = await supabase
        .from(this.#tableName)
        .insert(dbCoupon)
        .select()
        .single();

      if (error) {
        console.error('Error adding coupon:', error);
        return null;
      }

      // Convert back to camelCase for application
      return this.#mapToCamelCase(data);
    } catch (error) {
      console.error('Unexpected error adding coupon:', error);
      return null;
    }
  }

  /**
   * Updates an existing coupon in the database
   * @param {Object} updatedCoupon - The coupon object with updated values
   * @param {string} userId - The ID of the user updating the coupon
   * @returns {Promise<Object|null>} A promise that resolves to the updated coupon or null if failed
   */
  async updateCoupon(updatedCoupon, userId) {
    try {
      // Check if user has permission to edit this coupon
      const hasPermission = await RoleService.checkPermission(
        userId,
        Permissions.EDIT_COUPON,
        { couponId: updatedCoupon.id }
      );
      
      if (!hasPermission) {
        console.error('User does not have permission to update this coupon');
        return null;
      }
      
      // Convert to snake_case for database
      const dbCoupon = this.#mapToSnakeCase(updatedCoupon);

      const { data, error } = await supabase
        .from(this.#tableName)
        .update(dbCoupon)
        .eq('id', updatedCoupon.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating coupon:', error);
        return null;
      }

      // Convert back to camelCase for application
      return this.#mapToCamelCase(data);
    } catch (error) {
      console.error('Unexpected error updating coupon:', error);
      return null;
    }
  }

  /**
   * Deletes a coupon from the database
   * @param {number} couponId - The ID of the coupon to delete
   * @param {string} userId - The ID of the user deleting the coupon
   * @returns {Promise<boolean>} A promise that resolves to true if successful, false otherwise
   */
  async deleteCoupon(couponId, userId) {
    try {
      // Check if user has permission to delete this coupon
      const hasPermission = await RoleService.checkPermission(
        userId,
        Permissions.DELETE_COUPON,
        { couponId }
      );
      
      if (!hasPermission) {
        console.error('User does not have permission to delete this coupon');
        return false;
      }
      
      const { error } = await supabase
        .from(this.#tableName)
        .delete()
        .eq('id', couponId);

      if (error) {
        console.error('Error deleting coupon:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error deleting coupon:', error);
      return false;
    }
  }

  /**
   * Marks a coupon as fully used by setting its current value to 0
   * @param {number} couponId - The ID of the coupon to mark as used
   * @param {string} userId - The ID of the user marking the coupon as used
   * @returns {Promise<boolean>} A promise that resolves to true if successful, false otherwise
   */
  async markCouponAsUsed(couponId, userId) {
    try {
      // Check if user has permission to edit this coupon
      const hasPermission = await RoleService.checkPermission(
        userId,
        Permissions.EDIT_COUPON,
        { couponId }
      );
      
      if (!hasPermission) {
        console.error('User does not have permission to mark this coupon as used');
        return false;
      }
      
      const { error } = await supabase
        .from(this.#tableName)
        .update({ 
          current_value: '0',
          updated_at: new Date().toISOString()
        })
        .eq('id', couponId);

      if (error) {
        console.error('Error marking coupon as used:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error marking coupon as used:', error);
      return false;
    }
  }

  /**
   * Updates a coupon's currentValue after partial usage
   * @param {number} couponId - The ID of the coupon to update
   * @param {string} amount - The amount to deduct from currentValue
   * @param {string} userId - The ID of the user partially using the coupon
   * @returns {Promise<Object|null>} A promise that resolves to the updated coupon or null if failed
   */
  async partiallyUseCoupon(couponId, amount, userId) {
    try {
      // Check if user has permission to edit this coupon
      const hasPermission = await RoleService.checkPermission(
        userId,
        Permissions.EDIT_COUPON,
        { couponId }
      );
      
      if (!hasPermission) {
        console.error('User does not have permission to use this coupon');
        return null;
      }
      
      // First get the current coupon to calculate new value
      const { data: coupon, error: fetchError } = await supabase
        .from(this.#tableName)
        .select('*')
        .eq('id', couponId)
        .single();

      if (fetchError) {
        console.error('Error fetching coupon for partial use:', fetchError);
        return null;
      }

      // Calculate the new current value
      const currentValueFloat = parseFloat(coupon.current_value);
      const amountFloat = parseFloat(amount);
      
      if (isNaN(currentValueFloat) || isNaN(amountFloat)) {
        console.error('Invalid numeric values for partial coupon use');
        return null;
      }
      
      // Calculate the new value, ensuring it's not negative
      const newValue = Math.max(0, currentValueFloat - amountFloat).toString();

      // Update the coupon with the new value
      const { data: updatedCoupon, error: updateError } = await supabase
        .from(this.#tableName)
        .update({ 
          current_value: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', couponId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating coupon for partial use:', updateError);
        return null;
      }

      return this.#mapToCamelCase(updatedCoupon);
    } catch (error) {
      console.error('Unexpected error partially using coupon:', error);
      return null;
    }
  }

  /**
   * Retrieves all unique retailers from the coupons the user has access to
   * @param {string} userId - The ID of the user making the request
   * @returns {Promise<Array<string>>} A promise that resolves to an array of retailer names
   */
  async getUniqueRetailers(userId) {
    try {
      // Check if user has permission to view all coupons
      const canViewAll = await RoleService.checkPermission(userId, Permissions.VIEW_ANY_COUPON);
      
      let query = supabase
        .from(this.#tableName)
        .select('retailer');
      
      // If user can't view all coupons, restrict to their own
      if (!canViewAll) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching retailers:', error);
        return [];
      }

      // Extract and deduplicate retailer names
      const retailers = [...new Set(data.map(item => item.retailer))];
      
      // Sort alphabetically
      return retailers.sort();
    } catch (error) {
      console.error('Unexpected error fetching retailers:', error);
      return [];
    }
  }

  /**
   * Retrieves coupons belonging to a specific user
   * @param {string} targetUserId - The ID of the user whose coupons to retrieve
   * @param {string} requestingUserId - The ID of the user making the request
   * @returns {Promise<Array>} A promise that resolves to an array of coupon objects
   */
  async getCouponsByUser(targetUserId, requestingUserId) {
    try {
      // Allow users to view their own coupons without permission check
      if (targetUserId !== requestingUserId) {
        // Check if requesting user has permission to view any coupon
        const canViewAll = await RoleService.checkPermission(
          requestingUserId, 
          Permissions.VIEW_ANY_COUPON
        );
        
        if (!canViewAll) {
          console.error('User does not have permission to view other users\' coupons');
          return [];
        }
      }

      const { data, error } = await supabase
        .from(this.#tableName)
        .select('*')
        .eq('user_id', targetUserId)
        .order('id');

      if (error) {
        console.error('Error fetching coupons by user:', error);
        return [];
      }

      return data.map(dbCoupon => this.#mapToCamelCase(dbCoupon));
    } catch (error) {
      console.error('Unexpected error fetching coupons by user:', error);
      return [];
    }
  }
}

// Create and export a singleton instance
export default new SupabaseCouponService(); 