/**
 * Factory for selecting the appropriate coupon service implementation
 * This factory now returns PocketBase coupon service
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
 * Returns the appropriate coupon service based on environment
 * @returns {ICouponService} The selected coupon service
 */
export const getCouponService = (): ICouponService => {
  console.log('Using POCKETBASE coupon service');
  return PocketBaseCouponService as unknown as ICouponService;
};

// Auto-inject mock data if enabled
if (shouldAutoMockData()) {
  console.log('Mock data injection enabled for development');
  (async () => {
    try {
      const service = getCouponService();
      const { mockCoupons } = await import('../mocks/data/coupons.js');

      for (const coupon of mockCoupons) {
        await service.addCoupon(coupon, 'demo');
      }
      console.log('Mock data injected successfully.');
    } catch (error) {
      console.error('Error injecting mock data:', error);
    }
  })();
}

// Export the service
export default PocketBaseCouponService as unknown as ICouponService; 