/**
 * Factory for selecting the appropriate coupon service implementation
 * This allows us to switch between in-memory and Supabase implementations
 */

import CouponService from './CouponService';
import SupabaseCouponService from './SupabaseCouponService';
import { Coupon, CouponFormData } from '../types';

/**
 * Interface for Coupon Service implementations
 */
export interface ICouponService {
  getAllCoupons(): Promise<Coupon[]>;
  addCoupon(coupon: CouponFormData, userId?: string | null): Promise<Coupon>;
  updateCoupon(updatedCoupon: Partial<Coupon>): Promise<boolean>;
  markCouponAsUsed(couponId: string): Promise<boolean>;
  partiallyUseCoupon(couponId: string, amount: number): Promise<boolean>;
  getUniqueRetailers(): Promise<string[]>;
  getRetailerStats(): Promise<any[]>;
}

/**
 * Enum for available storage types
 * @readonly
 * @enum {string}
 */
export enum StorageType {
  IN_MEMORY = 'in-memory',
  SUPABASE = 'supabase'
}

/**
 * Determines if we should use the in-memory database
 * @returns {boolean} True if in-memory database should be used
 */
const shouldUseMemoryDb = (): boolean => {
  // Check for environment variable
  const useMemoryDb = import.meta.env.VITE_USE_MEMORY_DB;
  
  // Convert string to boolean, default to false if not set
  return useMemoryDb === 'true';
};

/**
 * Determines if we should auto-inject mock data
 * @returns {boolean} True if mock data should be injected
 */
const shouldAutoMockData = (): boolean => {
  // Check for environment variable
  const autoMockData = import.meta.env.VITE_AUTO_MOCK_DATA;
  
  // Convert string to boolean, default to false if not set
  return autoMockData === 'true';
};

/**
 * Determines the default storage type based on environment
 * @returns {StorageType} The default storage type
 */
const getDefaultStorageType = (): StorageType => {
  return shouldUseMemoryDb() ? StorageType.IN_MEMORY : StorageType.SUPABASE;
};

/**
 * Adds mock data to the in-memory service
 * @param {ICouponService} service - The service to add mock data to
 */
const injectMockData = async (service: ICouponService): Promise<void> => {
  console.log('Injecting mock data for development...');
  
  try {
    // Lazy-load mock data to avoid bundling it in production builds
    const { mockCoupons } = await import('../mocks/data/coupons.js');
    
    // Add each mock coupon to the service
    for (const coupon of mockCoupons) {
      await service.addCoupon(coupon);
    }
    console.log('Mock data injected successfully.');
  } catch (error) {
    console.error('Error injecting mock data:', error);
  }
};

/**
 * Returns the appropriate coupon service based on storage type
 * @param {StorageType} storageType - The type of storage to use (from StorageType enum)
 * @returns {ICouponService} The selected coupon service
 */
export const getCouponService = (storageType: StorageType = getDefaultStorageType()): ICouponService => {
  let service: ICouponService;
  
  switch (storageType) {
    case StorageType.IN_MEMORY:
      console.log('Using IN-MEMORY coupon service for development');
      service = CouponService as unknown as ICouponService;
      
      // Auto-inject mock data if enabled
      if (shouldAutoMockData()) {
        injectMockData(service);
      }
      
      return service;
    
    case StorageType.SUPABASE:
      console.log('Using SUPABASE coupon service');
      return SupabaseCouponService as unknown as ICouponService;
    
    default:
      console.warn(`Unknown storage type: ${storageType}. Using Supabase as default.`);
      return SupabaseCouponService as unknown as ICouponService;
  }
};

// Export the service based on the environment
export default getCouponService(); 