/**
 * Factory for selecting the appropriate coupon service implementation
 * This allows us to switch between in-memory and Supabase implementations
 */

import CouponService from './CouponService.js';
import SupabaseCouponService from './SupabaseCouponService.js';

/**
 * Enum for available storage types
 * @readonly
 * @enum {string}
 */
export const StorageType = {
  IN_MEMORY: 'in-memory',
  SUPABASE: 'supabase'
};

/**
 * Returns the appropriate coupon service based on storage type
 * @param {string} storageType - The type of storage to use (from StorageType enum)
 * @returns {Object} The selected coupon service
 */
export const getCouponService = (storageType = StorageType.SUPABASE) => {
  switch (storageType) {
    case StorageType.IN_MEMORY:
      return CouponService;
    case StorageType.SUPABASE:
      return SupabaseCouponService;
    default:
      console.warn(`Unknown storage type: ${storageType}. Using Supabase as default.`);
      return SupabaseCouponService;
  }
};

// For backward compatibility, export the default (Supabase) service
export default getCouponService(StorageType.SUPABASE); 