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
    
    it('should handle missing fields by providing defaults', () => {
      const newCoupon = {
        retailer: 'Test Store',
        initialValue: '50'
        // Missing expirationDate and other fields
      };
      
      const result = service.addCoupon(newCoupon);
      
      // Check that defaults were applied
      expect(result.currentValue).toBe('50'); // Should default to initialValue
      expect(result.activationCode).toBe(''); // Should default to empty string
      expect(result.pin).toBe(''); // Should default to empty string
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
  
  describe('markCouponAsUsed', () => {
    it('should mark a coupon as used by setting currentValue to 0', () => {
      // Get the first coupon to mark as used
      const coupons = service.getAllCoupons();
      const couponId = coupons[0].id;
      
      const result = service.markCouponAsUsed(couponId);
      
      // Check that the operation was successful
      expect(result).not.toBeNull();
      
      // Get the updated coupon and verify it's marked as used
      const updatedCoupons = service.getAllCoupons();
      const updatedCoupon = updatedCoupons.find(c => c.id === couponId);
      expect(updatedCoupon.currentValue).toBe('0');
    });
    
    it('should return null when trying to mark a non-existent coupon as used', () => {
      const result = service.markCouponAsUsed(99999); // ID that doesn't exist
      
      // Should return null since coupon doesn't exist
      expect(result).toBeNull();
    });
  });
  
  describe('partiallyUseCoupon', () => {
    it('should reduce the currentValue of a coupon by the specified amount', () => {
      // Get a coupon with a non-zero currentValue
      const coupons = service.getAllCoupons();
      const coupon = coupons.find(c => parseFloat(c.currentValue) > 10);
      const originalValue = parseFloat(coupon.currentValue);
      const useAmount = 5;
      
      const result = service.partiallyUseCoupon(coupon.id, useAmount);
      
      // Check that the operation was successful
      expect(result).not.toBeNull();
      
      // Get the updated coupon and verify the value was reduced
      const updatedCoupons = service.getAllCoupons();
      const updatedCoupon = updatedCoupons.find(c => c.id === coupon.id);
      expect(parseFloat(updatedCoupon.currentValue)).toBe(originalValue - useAmount);
    });
    
    it('should mark coupon as used (currentValue = 0) when use amount equals or exceeds current value', () => {
      // Get a coupon with a non-zero currentValue
      const coupons = service.getAllCoupons();
      const coupon = coupons.find(c => parseFloat(c.currentValue) > 0);
      const useAmount = parseFloat(coupon.currentValue) + 5; // Exceed the current value
      
      const result = service.partiallyUseCoupon(coupon.id, useAmount);
      
      // Check that the operation was successful
      expect(result).not.toBeNull();
      
      // Get the updated coupon and verify it's marked as used
      const updatedCoupons = service.getAllCoupons();
      const updatedCoupon = updatedCoupons.find(c => c.id === coupon.id);
      expect(updatedCoupon.currentValue).toBe('0');
    });
    
    it('should return null when trying to partially use a non-existent coupon', () => {
      const result = service.partiallyUseCoupon(99999, 10); // ID that doesn't exist
      
      // Should return null since coupon doesn't exist
      expect(result).toBeNull();
    });
    
    it('should return null when trying to use a negative amount', () => {
      // Get the first coupon
      const coupons = service.getAllCoupons();
      const couponId = coupons[0].id;
      
      const result = service.partiallyUseCoupon(couponId, -10);
      
      // Should return null since amount is negative
      expect(result).toBeNull();
    });
    
    it('should not allow using more than the available amount', () => {
      // Get a coupon with a non-zero currentValue
      const coupons = service.getAllCoupons();
      const coupon = coupons.find(c => parseFloat(c.currentValue) > 10);
      const originalValue = parseFloat(coupon.currentValue);
      const useAmount = originalValue + 5; // Try to use more than available
      
      const result = service.partiallyUseCoupon(coupon.id, useAmount);
      
      // Check that the operation was successful but capped at available amount
      expect(result).not.toBeNull();
      
      // Get the updated coupon and verify it's marked as fully used (0)
      const updatedCoupons = service.getAllCoupons();
      const updatedCoupon = updatedCoupons.find(c => c.id === coupon.id);
      expect(updatedCoupon.currentValue).toBe('0');
      
      // The coupon should be fully used, not negative
      expect(parseFloat(updatedCoupon.currentValue)).toBeGreaterThanOrEqual(0);
    })
  });
  
  describe('getUniqueRetailers', () => {
    it('should return a list of unique retailer names', () => {
      const retailers = service.getUniqueRetailers();
      
      // Check that the result is an array
      expect(Array.isArray(retailers)).toBe(true);
      
      // Check that there are no duplicates
      const uniqueRetailers = [...new Set(retailers)];
      expect(retailers.length).toBe(uniqueRetailers.length);
      
      // Check that all retailers from coupons are included
      const coupons = service.getAllCoupons();
      const retailersFromCoupons = [...new Set(coupons.map(c => c.retailer))];
      
      // Check that each retailer from coupons is in the result
      retailersFromCoupons.forEach(retailer => {
        expect(retailers).toContain(retailer);
      });
    });
  });
  
  describe('getRetailerStats', () => {
    it('should return statistics for each retailer', () => {
      const stats = service.getRetailerStats();
      
      // Check that the result is an array
      expect(Array.isArray(stats)).toBe(true);
      
      // Check that each retailer has the expected properties
      stats.forEach(retailerStat => {
        expect(retailerStat).toHaveProperty('name');
        expect(retailerStat).toHaveProperty('couponCount');
        expect(retailerStat).toHaveProperty('totalValue');
        expect(retailerStat).toHaveProperty('activeCouponCount');
        expect(retailerStat).toHaveProperty('activeTotalValue');
        expect(retailerStat).toHaveProperty('expiredCouponCount');
        expect(retailerStat).toHaveProperty('expiredTotalValue');
      });
      
      // Check that the counts add up correctly for a specific retailer
      const amazonStats = stats.find(s => s.name === 'Amazon');
      if (amazonStats) {
        expect(amazonStats.activeCouponCount + amazonStats.expiredCouponCount).toBe(amazonStats.couponCount);
        
        // Verify that the total values add up correctly
        const totalValue = parseFloat(amazonStats.activeTotalValue) + parseFloat(amazonStats.expiredTotalValue);
        expect(parseFloat(amazonStats.totalValue)).toBeCloseTo(totalValue);
      }
    });
    
    it('should correctly identify expired and used coupons', () => {
      // Add a test coupon that's expired
      const expiredCoupon = {
        retailer: 'TestRetailer',
        initialValue: '100',
        currentValue: '100',
        expirationDate: new Date('2000-01-01') // Definitely expired
      };
      service.addCoupon(expiredCoupon);
      
      // Add a test coupon that's used (currentValue = 0)
      const usedCoupon = {
        retailer: 'TestRetailer',
        initialValue: '50',
        currentValue: '0',
        expirationDate: new Date('2030-01-01') // Not expired but used
      };
      service.addCoupon(usedCoupon);
      
      // Get stats for the test retailer
      const stats = service.getRetailerStats();
      const testRetailerStats = stats.find(s => s.name === 'TestRetailer');
      
      // Verify that both coupons are counted in the total
      expect(testRetailerStats.couponCount).toBe(2);
      
      // Verify that both are counted as expired/used in the stats
      expect(testRetailerStats.expiredCouponCount).toBe(2);
      
      // Verify that the active count is 0
      expect(testRetailerStats.activeCouponCount).toBe(0);
    });
  });
});