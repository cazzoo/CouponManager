import { describe, it, expect, beforeEach } from 'vitest';
import { couponService } from '../../services/CouponService';

describe('CouponService', () => {
  let service;
  
  beforeEach(() => {
    // Create a fresh instance of the service before each test
    service = new (couponService.constructor)();
  });
  
  describe('getAllCoupons', () => {
    it('should return all coupons', () => {
      const coupons = service.getAllCoupons();
      expect(Array.isArray(coupons)).toBe(true);
      expect(coupons.length).toBeGreaterThan(0);
    });
    
    it('should return a copy of the coupons array, not the original reference', () => {
      const coupons = service.getAllCoupons();
      const originalLength = coupons.length;
      
      // Modify the returned array
      coupons.push({ id: 999, retailer: 'Test' });
      
      // Get coupons again and verify the original wasn't modified
      const newCoupons = service.getAllCoupons();
      expect(newCoupons.length).toBe(originalLength);
    });
  });
  
  describe('addCoupon', () => {
    it('should add a new coupon with generated id', () => {
      const originalCount = service.getAllCoupons().length;
      
      const newCoupon = {
        retailer: 'Test Store',
        initialValue: '25',
        expirationDate: new Date('2025-01-01')
      };
      
      const result = service.addCoupon(newCoupon);
      
      // Check that the coupon was added
      const coupons = service.getAllCoupons();
      expect(coupons.length).toBe(originalCount + 1);
      
      // Check that the returned coupon has the expected properties
      expect(result.id).toBeDefined();
      expect(result.retailer).toBe('Test Store');
      expect(result.initialValue).toBe('25');
      expect(result.currentValue).toBe('25'); // Should match initialValue
    });
  });
  
  describe('updateCoupon', () => {
    it('should update an existing coupon', () => {
      // Get the first coupon to update
      const coupons = service.getAllCoupons();
      const couponToUpdate = { ...coupons[0], retailer: 'Updated Retailer' };
      
      const result = service.updateCoupon(couponToUpdate);
      
      // Check that the coupon was updated
      expect(result).not.toBeNull();
      expect(result.retailer).toBe('Updated Retailer');
      
      // Verify the update in the main list
      const updatedCoupons = service.getAllCoupons();
      const updatedCoupon = updatedCoupons.find(c => c.id === couponToUpdate.id);
      expect(updatedCoupon.retailer).toBe('Updated Retailer');
    });
    
    it('should not allow currentValue to exceed initialValue', () => {
      // Get the first coupon to update
      const coupons = service.getAllCoupons();
      const originalCoupon = coupons[0];
      
      // Try to update with a currentValue higher than initialValue
      const couponToUpdate = { 
        ...originalCoupon, 
        currentValue: (parseFloat(originalCoupon.initialValue) + 10).toString() 
      };
      
      const result = service.updateCoupon(couponToUpdate);
      
      // Check that currentValue was capped at initialValue
      expect(result.currentValue).toBe(originalCoupon.initialValue);
    });
    
    it('should return null when updating a non-existent coupon', () => {
      const nonExistentCoupon = {
        id: 99999, // An ID that doesn't exist
        retailer: 'Non-existent',
        initialValue: '50',
        currentValue: '50'
      };
      
      const result = service.updateCoupon(nonExistentCoupon);
      expect(result).toBeNull();
    });
  });
});