import supabase from './SupabaseClient.js';

/**
 * Service for managing coupons using Supabase for data persistence
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
      updatedAt: dbCoupon.updated_at ? new Date(dbCoupon.updated_at) : null
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

    return result;
  }

  /**
   * Retrieves all coupons from the database
   * @returns {Promise<Array>} A promise that resolves to an array of coupon objects
   */
  async getAllCoupons() {
    try {
      const { data, error } = await supabase
        .from(this.#tableName)
        .select('*')
        .order('id');

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
   * @returns {Promise<Object|null>} A promise that resolves to the added coupon or null if failed
   */
  async addCoupon(coupon) {
    try {
      // Convert to snake_case for database
      const dbCoupon = this.#mapToSnakeCase(coupon);
      
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
   * @returns {Promise<Object|null>} A promise that resolves to the updated coupon or null if failed
   */
  async updateCoupon(updatedCoupon) {
    try {
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
   * Marks a coupon as fully used by setting its current value to 0
   * @param {number} couponId - The ID of the coupon to mark as used
   * @returns {Promise<boolean>} A promise that resolves to true if successful, false otherwise
   */
  async markCouponAsUsed(couponId) {
    try {
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
   * @returns {Promise<Object|null>} A promise that resolves to the updated coupon or null if failed
   */
  async partiallyUseCoupon(couponId, amount) {
    try {
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

      // Calculate new value
      const currentValue = parseFloat(coupon.current_value);
      const amountToDeduct = parseFloat(amount);
      
      if (isNaN(currentValue) || isNaN(amountToDeduct)) {
        console.error('Invalid numeric values for coupon update');
        return null;
      }

      const newValue = Math.max(0, currentValue - amountToDeduct).toString();

      // Update the coupon with new value
      const { data, error } = await supabase
        .from(this.#tableName)
        .update({ 
          current_value: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', couponId)
        .select()
        .single();

      if (error) {
        console.error('Error partially using coupon:', error);
        return null;
      }

      // Convert back to camelCase for application
      return this.#mapToCamelCase(data);
    } catch (error) {
      console.error('Unexpected error partially using coupon:', error);
      return null;
    }
  }

  /**
   * Gets unique retailers from all coupons
   * @returns {Promise<Array>} A promise that resolves to an array of unique retailer names
   */
  async getUniqueRetailers() {
    try {
      const { data, error } = await supabase
        .from(this.#tableName)
        .select('retailer');

      if (error) {
        console.error('Error fetching retailers:', error);
        return [];
      }

      // Extract unique retailer names
      const retailers = [...new Set(data.map(item => item.retailer))];
      return retailers;
    } catch (error) {
      console.error('Unexpected error fetching retailers:', error);
      return [];
    }
  }
}

export default new SupabaseCouponService(); 