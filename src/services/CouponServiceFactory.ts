/**
 * Factory for selecting the appropriate coupon service implementation
 * Supports both PocketBase and Mock modes based on environment variable
 */

import PocketBaseCouponService from './PocketBaseCouponService';
import MockCouponService from './MockCouponService';
import { Coupon, CouponFormData, RetailerStat } from '../types';

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
  getRetailerStats(): Promise<RetailerStat[]>;
}

// Check if mock mode should be used
const useMockMode = (): boolean => {
  return import.meta.env.VITE_USE_MOCK === 'true';
};

/**
 * Returns the appropriate coupon service based on environment
 * @returns {ICouponService} The coupon service (PocketBase or Mock)
 */
export const getCouponService = (): ICouponService => {
  if (useMockMode()) {
    console.log('Using MOCK coupon service (VITE_USE_MOCK=true)');
    return MockCouponService as unknown as ICouponService;
  }
  console.log('Using POCKETBASE coupon service');
  return PocketBaseCouponService as unknown as ICouponService;
};

// Export the service
export default PocketBaseCouponService as unknown as ICouponService;
