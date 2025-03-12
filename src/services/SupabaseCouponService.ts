import supabase from './SupabaseClient';
import RoleService from './RoleService';
import { Permissions } from './RoleService';
import { Coupon, CouponFormData, RetailerStat } from '../types';
import { ICouponService } from './CouponServiceFactory';

/**
 * DB Coupon type representing the snake_case database structure
 */
interface DBCoupon {
  id?: string;
  retailer: string;
  initial_value: string;
  current_value: string;
  expiration_date?: string | null;
  activation_code?: string;
  pin?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  barcode?: string;
  reference?: string;
  notes?: string;
}

/**
 * Service for managing coupons using Supabase for data persistence
 * Includes permission checking and user ownership
 */
class SupabaseCouponService implements ICouponService {
  /**
   * The table name in Supabase where coupon data is stored
   * @type {string}
   */
  #tableName = 'coupons';

  /**
   * Converts a database coupon (snake_case) to an application coupon (camelCase)
   * @param {DBCoupon} dbCoupon - Coupon data from the database
   * @returns {Coupon} - Coupon data in application format
   */
  #mapToCamelCase(dbCoupon: DBCoupon): Coupon {
    return {
      id: dbCoupon.id || '',
      userId: dbCoupon.user_id || '',
      retailer: dbCoupon.retailer,
      initialValue: dbCoupon.initial_value,
      currentValue: dbCoupon.current_value,
      expirationDate: dbCoupon.expiration_date || undefined,
      activationCode: dbCoupon.activation_code,
      pin: dbCoupon.pin,
      created_at: dbCoupon.created_at,
      updated_at: dbCoupon.updated_at,
      barcode: dbCoupon.barcode,
      reference: dbCoupon.reference,
      notes: dbCoupon.notes
    };
  }

  /**
   * Converts an application coupon (camelCase) to a database coupon (snake_case)
   * @param {Partial<Coupon>} appCoupon - Coupon data from the application
   * @returns {DBCoupon} - Coupon data in database format
   */
  #mapToSnakeCase(appCoupon: Partial<Coupon>): DBCoupon {
    const result: DBCoupon = {
      retailer: appCoupon.retailer || '',
      initial_value: appCoupon.initialValue || '',
      current_value: appCoupon.currentValue || appCoupon.initialValue || '',
      expiration_date: appCoupon.expirationDate || null,
      activation_code: appCoupon.activationCode,
      pin: appCoupon.pin,
      barcode: appCoupon.barcode,
      reference: appCoupon.reference,
      notes: appCoupon.notes,
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
   * @returns {Promise<Coupon[]>} A promise that resolves to an array of coupon objects
   */
  async getAllCoupons(): Promise<Coupon[]> {
    try {
      // Get current user ID from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return [];
      }
      
      const userId = user.id;
      
      // Check if user has permission to view all coupons
      const canViewAll = await RoleService.hasPermission(Permissions.VIEW_ANY_COUPON);
      
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

      return data.map((dbCoupon: DBCoupon) => this.#mapToCamelCase(dbCoupon));
    } catch (error) {
      console.error('Unexpected error fetching coupons:', error);
      return [];
    }
  }

  /**
   * Adds a new coupon to the database
   * @param {CouponFormData} coupon - The coupon object to add
   * @param {string|null} userId - The ID of the user creating the coupon
   * @returns {Promise<Coupon>} A promise that resolves to the added coupon
   */
  async addCoupon(coupon: CouponFormData, userId: string | null = null): Promise<Coupon> {
    try {
      // If userId is not provided, get current user from Supabase
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('No authenticated user found and no userId provided');
        }
        userId = user.id;
      }
      
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
        throw new Error(`Failed to add coupon: ${error.message}`);
      }

      // Convert back to camelCase for application
      return this.#mapToCamelCase(data);
    } catch (error) {
      console.error('Unexpected error adding coupon:', error);
      throw new Error('Failed to add coupon');
    }
  }

  /**
   * Updates an existing coupon in the database
   * @param {Partial<Coupon>} updatedCoupon - The coupon object with updated values
   * @returns {Promise<boolean>} A promise that resolves to true if successful
   */
  async updateCoupon(updatedCoupon: Partial<Coupon>): Promise<boolean> {
    try {
      if (!updatedCoupon.id) {
        throw new Error('Cannot update coupon without an ID');
      }
      
      // Check if user has permission to edit this coupon
      const hasPermission = await RoleService.hasPermission(
        Permissions.EDIT_COUPON,
        { couponId: updatedCoupon.id }
      );
      
      if (!hasPermission) {
        console.error('User does not have permission to update this coupon');
        return false;
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
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error updating coupon:', error);
      return false;
    }
  }

  /**
   * Marks a coupon as fully used by setting its current value to 0
   * @param {string} couponId - The ID of the coupon to mark as used
   * @returns {Promise<boolean>} A promise that resolves to true if successful
   */
  async markCouponAsUsed(couponId: string): Promise<boolean> {
    try {
      // Check if user has permission to edit this coupon
      const hasPermission = await RoleService.hasPermission(
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
   * Partially uses a coupon by reducing its value
   * @param {string} couponId - The ID of the coupon to partially use
   * @param {number} amount - The amount to reduce the coupon by
   * @returns {Promise<boolean>} A promise that resolves to true if successful
   */
  async partiallyUseCoupon(couponId: string, amount: number): Promise<boolean> {
    try {
      // First, get the current coupon to check its value
      const { data: couponData, error: fetchError } = await supabase
        .from(this.#tableName)
        .select('current_value, user_id')
        .eq('id', couponId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching coupon for partial use:', fetchError);
        return false;
      }
      
      // Check if user has permission to edit this coupon
      const hasPermission = await RoleService.hasPermission(
        Permissions.EDIT_COUPON,
        { couponId, userId: couponData.user_id }
      );
      
      if (!hasPermission) {
        console.error('User does not have permission to partially use this coupon');
        return false;
      }
      
      // Calculate new value
      const currentValueNum = parseFloat(couponData.current_value);
      const newValue = Math.max(0, currentValueNum - amount).toString();
      
      // Update the coupon with the new value
      const { error: updateError } = await supabase
        .from(this.#tableName)
        .update({ 
          current_value: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', couponId);
      
      if (updateError) {
        console.error('Error partially using coupon:', updateError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error partially using coupon:', error);
      return false;
    }
  }

  /**
   * Gets a list of unique retailers from the user's coupons
   * @returns {Promise<string[]>} A promise that resolves to an array of retailer names
   */
  async getUniqueRetailers(): Promise<string[]> {
    try {
      // Get current user ID from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return [];
      }
      
      const userId = user.id;
      
      // Check if user has permission to view all coupons
      const canViewAll = await RoleService.hasPermission(Permissions.VIEW_ANY_COUPON);
      
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
      
      // Extract unique retailer names
      const retailers = data.map(item => item.retailer);
      return [...new Set(retailers)];
    } catch (error) {
      console.error('Unexpected error fetching retailers:', error);
      return [];
    }
  }

  /**
   * Gets retailer statistics from the user's coupons
   * @returns {Promise<RetailerStat[]>} A promise that resolves to retailer statistics
   */
  async getRetailerStats(): Promise<RetailerStat[]> {
    try {
      // Get all coupons first
      const coupons = await this.getAllCoupons();
      const retailerMap = new Map<string, RetailerStat>();
      
      // Initialize with empty stats for each unique retailer
      const uniqueRetailers = [...new Set(coupons.map(coupon => coupon.retailer))];
      uniqueRetailers.forEach(name => {
        retailerMap.set(name, {
          name,
          couponCount: 0,
          totalValue: 0,
          activeCouponCount: 0,
          activeTotalValue: 0,
          expiredCouponCount: 0,
          expiredTotalValue: 0
        });
      });
      
      // Calculate stats for each coupon
      const now = new Date();
      coupons.forEach(coupon => {
        const retailer = retailerMap.get(coupon.retailer);
        if (!retailer) return;
        
        const value = parseFloat(coupon.currentValue);
        const expirationDate = coupon.expirationDate ? new Date(coupon.expirationDate) : null;
        const isExpired = expirationDate ? expirationDate < now : false;
        
        // Update total stats
        retailer.couponCount++;
        retailer.totalValue += value;
        
        // Update active/expired stats
        if (isExpired) {
          retailer.expiredCouponCount++;
          retailer.expiredTotalValue += value;
        } else {
          retailer.activeCouponCount++;
          retailer.activeTotalValue += value;
        }
      });
      
      return Array.from(retailerMap.values());
    } catch (error) {
      console.error('Unexpected error calculating retailer stats:', error);
      return [];
    }
  }
}

export default new SupabaseCouponService(); 