/**
 * Mock Coupon Service
 * Provides coupon functionality without requiring PocketBase
 * Use VITE_USE_MOCK=true to enable this service
 */

import type { Coupon, CouponFormData, RetailerStat } from '../types';
import type { ICouponService } from './CouponServiceFactory';

// In-memory store for coupons
let mockCoupons: Coupon[] = [];

// Initialize with sample data
const initializeMockCoupons = (): void => {
  if (mockCoupons.length === 0) {
    mockCoupons = [
      {
        id: 'coupon-1',
        userId: 'regular-user-id',
        retailer: 'Amazon',
        initialValue: '50.00',
        currentValue: '50.00',
        expirationDate: '2025-12-31',
        notes: 'Gift card for books',
        barcode: '123456789012',
        reference: 'AMZ-001',
        activationCode: 'ABC123',
        pin: '1234',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'coupon-2',
        userId: 'regular-user-id',
        retailer: 'Starbucks',
        initialValue: '25.00',
        currentValue: '15.00',
        expirationDate: '2025-06-30',
        notes: 'Coffee gift card',
        barcode: '987654321098',
        reference: 'SBX-001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'coupon-3',
        userId: 'regular-user-id',
        retailer: 'Target',
        initialValue: '100.00',
        currentValue: '100.00',
        expirationDate: '2025-09-15',
        notes: 'Holiday gift',
        barcode: '456789012345',
        reference: 'TGT-001',
        pin: '5678',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'coupon-4',
        userId: 'manager-user-id',
        retailer: 'Apple',
        initialValue: '200.00',
        currentValue: '200.00',
        expirationDate: '2026-01-15',
        notes: 'App Store gift card',
        barcode: '111222333444',
        reference: 'APL-001',
        activationCode: 'APPLE2025',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'coupon-5',
        userId: 'demo-user-id',
        retailer: 'Netflix',
        initialValue: '30.00',
        currentValue: '30.00',
        expirationDate: '2025-12-01',
        notes: 'Streaming subscription',
        barcode: '555666777888',
        reference: 'NFLX-001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
};

// Initialize on module load
initializeMockCoupons();

class MockCouponService implements ICouponService {
  async getAllCoupons(): Promise<Coupon[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockCoupons];
  }

  async addCoupon(coupon: CouponFormData, userId?: string | null): Promise<Coupon> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const newCoupon: Coupon = {
      id: `coupon-${Date.now()}`,
      userId: userId || 'unknown-user',
      retailer: coupon.retailer,
      initialValue: coupon.initialValue,
      currentValue: coupon.currentValue || coupon.initialValue,
      expirationDate: coupon.expirationDate,
      notes: coupon.notes,
      barcode: coupon.barcode,
      reference: coupon.reference,
      activationCode: coupon.activationCode,
      pin: coupon.pin,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockCoupons.push(newCoupon);
    return newCoupon;
  }

  async updateCoupon(updatedCoupon: Partial<Coupon>): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!updatedCoupon.id) {
      throw new Error('Cannot update coupon without an ID');
    }

    const index = mockCoupons.findIndex(c => c.id === updatedCoupon.id);
    if (index === -1) {
      throw new Error('Coupon not found');
    }

    mockCoupons[index] = {
      ...mockCoupons[index],
      ...updatedCoupon,
      updated_at: new Date().toISOString()
    };

    return true;
  }

  async markCouponAsUsed(couponId: string): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const index = mockCoupons.findIndex(c => c.id === couponId);
    if (index === -1) {
      return false;
    }

    mockCoupons[index].currentValue = '0';
    mockCoupons[index].updated_at = new Date().toISOString();

    return true;
  }

  async partiallyUseCoupon(couponId: string, amount: number): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const index = mockCoupons.findIndex(c => c.id === couponId);
    if (index === -1) {
      return false;
    }

    const currentValue = parseFloat(mockCoupons[index].currentValue);
    const newValue = Math.max(0, currentValue - amount).toString();

    mockCoupons[index].currentValue = newValue;
    mockCoupons[index].updated_at = new Date().toISOString();

    return true;
  }

  async getUniqueRetailers(): Promise<string[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const retailers = mockCoupons.map(c => c.retailer);
    return [...new Set(retailers)];
  }

  async getRetailerStats(): Promise<RetailerStat[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 150));

    const retailerMap = new Map<string, RetailerStat>();

    const uniqueRetailers = [...new Set(mockCoupons.map(c => c.retailer))];
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

    const now = new Date();
    mockCoupons.forEach(coupon => {
      const retailer = retailerMap.get(coupon.retailer);
      if (!retailer) return;

      const value = parseFloat(coupon.currentValue);
      const expirationDate = coupon.expirationDate ? new Date(coupon.expirationDate) : null;
      const isExpired = expirationDate ? expirationDate < now : false;

      retailer.couponCount++;
      retailer.totalValue += value;

      if (isExpired) {
        retailer.expiredCouponCount++;
        retailer.expiredTotalValue += value;
      } else {
        retailer.activeCouponCount++;
        retailer.activeTotalValue += value;
      }
    });

    return Array.from(retailerMap.values());
  }

  // Helper method to reset coupons (useful for testing)
  resetCoupons(): void {
    mockCoupons = [];
    initializeMockCoupons();
  }
}

export default new MockCouponService();
