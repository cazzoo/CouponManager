/**
 * Factory for selecting the appropriate coupon service implementation
 * This factory returns PocketBase coupon service
 */

import PocketBaseCouponService from './PocketBaseCouponService';
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

/**
 * Returns the PocketBase coupon service
 * @returns {ICouponService} The PocketBase coupon service
 */
export const getCouponService = (): ICouponService => {
  console.log('Using POCKETBASE coupon service');
  return PocketBaseCouponService as unknown as ICouponService;
};

// Export the service
export default PocketBaseCouponService as unknown as ICouponService; 