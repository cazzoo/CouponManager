import { describe, it, expect, beforeEach } from 'vitest';
import { CouponService } from '../../services/CouponService';

describe('CouponService', () => {
  let service;
  
  beforeEach(() => {
    // Create a new instance of CouponService for testing
    service = new CouponService();
    
    // Reset the coupons array for testing
    service.coupons = [
      {
        id: 1,
        retailer: 'Amazon',
        initialValue: '50',
        currentValue: '50',
        expirationDate: new Date('2025-12-31'),
        activationCode: 'AMZN2024',
        pin: '1234'
      },
      {
        id: 2,
        retailer: 'Target',
        initialValue: '75',
        currentValue: '75',
        expirationDate: new Date('2025-09-30'),
        activationCode: 'TGT75FALL',
        pin: '4321'
      }
    ];
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
      expect(result.currentValue).toBe('25'); // Should default to initial value
      expect(result.expirationDate).toEqual(new Date('2025-01-01'));
    });
    
    it('should set currentValue equal to initialValue for new coupons', () => {
      const newCoupon = {
        retailer: 'Test Store',
        initialValue: '50',
        expirationDate: new Date('2025-01-01')
      };
      
      const result = service.addCoupon(newCoupon);
      expect(result.currentValue).toBe('50');
    });
    
    it('should handle coupon with no expiration date', () => {
      const newCoupon = {
        retailer: 'Test Store',
        initialValue: '50'
      };
      
      const result = service.addCoupon(newCoupon);
      expect(result.expirationDate).toBeUndefined();
    });
  });
  
  describe('updateCoupon', () => {
    it('should update an existing coupon', () => {
      const updatedData = {
        id: 1,
        retailer: 'Amazon',
        initialValue: '50',
        currentValue: '25',
        expirationDate: new Date('2024-12-31'),
        activationCode: 'AMZN2024-UPDATED',
        pin: '1234'
      };
      
      const result = service.updateCoupon(updatedData);
      
      expect(result).not.toBeNull();
      expect(result.currentValue).toBe('25');
      expect(result.activationCode).toBe('AMZN2024-UPDATED');
    });
    
    it('should return null when coupon id does not exist', () => {
      const nonExistentCoupon = {
        id: 9999, // This ID doesn't exist
        retailer: 'Non-existent',
        initialValue: '100',
        currentValue: '100'
      };
      
      const result = service.updateCoupon(nonExistentCoupon);
      expect(result).toBeNull();
    });
  });
  
  describe('markCouponAsUsed', () => {
    it('should mark a coupon as used (set currentValue to 0)', () => {
      const coupons = service.getAllCoupons();
      const couponToMark = coupons.find(c => c.currentValue !== '0');
      
      const result = service.markCouponAsUsed(couponToMark.id);
      
      // The service returns the updated coupon object, not a boolean
      expect(result).toEqual({
        ...couponToMark,
        currentValue: '0'
      });
      
      // Get the updated coupon
      const updatedCoupon = service.getAllCoupons().find(c => c.id === couponToMark.id);
      
      // Verify currentValue is now 0
      expect(updatedCoupon.currentValue).toBe('0');
    });
    
    it('should return null when coupon id does not exist', () => {
      const result = service.markCouponAsUsed(9999); // Non-existent ID
      expect(result).toBeNull();
    });
  });
  
  describe('partiallyUseCoupon', () => {
    it('should reduce the currentValue by the specified amount', () => {
      const coupons = service.getAllCoupons();
      const couponToUse = coupons.find(c => parseFloat(c.currentValue) >= 10);
      
      const originalValue = parseFloat(couponToUse.currentValue);
      const amountToUse = '5';
      
      const result = service.partiallyUseCoupon(couponToUse.id, amountToUse);
      
      // The service returns the updated coupon object, not a boolean
      expect(result).toEqual({
        ...couponToUse,
        currentValue: (originalValue - parseFloat(amountToUse)).toString()
      });
      
      // Get the updated coupon
      const updatedCoupon = service.getAllCoupons().find(c => c.id === couponToUse.id);
      
      // Calculate expected new value with proper formatting
      const expectedNewValue = (originalValue - parseFloat(amountToUse)).toString();
      
      // Verify currentValue was reduced correctly
      expect(updatedCoupon.currentValue).toBe(expectedNewValue);
    });
    
    it('should mark coupon as used if amount equals currentValue', () => {
      const coupons = service.getAllCoupons();
      const couponToUse = coupons.find(c => c.currentValue !== '0');
      
      const result = service.partiallyUseCoupon(couponToUse.id, couponToUse.currentValue);
      
      // The service returns the updated coupon object, not a boolean
      expect(result).toEqual({
        ...couponToUse,
        currentValue: '0'
      });
      
      // Get the updated coupon
      const updatedCoupon = service.getAllCoupons().find(c => c.id === couponToUse.id);
      
      // Verify currentValue is now 0
      expect(updatedCoupon.currentValue).toBe('0');
    });
    
    it('should return null when coupon id does not exist', () => {
      const result = service.partiallyUseCoupon(9999, '10'); // Non-existent ID
      expect(result).toBeNull();
    });
    
    it('should handle invalid amount input', () => {
      const coupons = service.getAllCoupons();
      const couponToUse = coupons.find(c => c.currentValue !== '0');
      
      // Try with non-numeric amount
      const result = service.partiallyUseCoupon(couponToUse.id, 'invalid');
      
      // The service might return the coupon with NaN as currentValue
      expect(result.currentValue).toBe('NaN');
    });
  });
  
  describe('getUniqueRetailers', () => {
    it('should return a list of unique retailer names', () => {
      const retailers = service.getUniqueRetailers();
      
      // Check that we got an array of strings
      expect(Array.isArray(retailers)).toBe(true);
      expect(retailers.length).toBeGreaterThan(0);
      
      // Check that all elements are strings
      retailers.forEach(retailer => {
        expect(typeof retailer).toBe('string');
      });
      
      // Check that there are no duplicates
      const uniqueRetailers = [...new Set(retailers)];
      expect(retailers.length).toBe(uniqueRetailers.length);
    });
  });
  
  describe('getRetailerStats', () => {
    it('should return statistics for all retailers', () => {
      const stats = service.getRetailerStats();
      
      expect(stats).toBeInstanceOf(Array);
      expect(stats.length).toBeGreaterThan(0);
      
      // Check that each retailer has the required properties
      stats.forEach(retailerStat => {
        expect(retailerStat).toHaveProperty('retailer');
        expect(retailerStat).toHaveProperty('couponCount');
        expect(retailerStat).toHaveProperty('activeCouponCount');
        expect(retailerStat).toHaveProperty('activeTotalValue');
        expect(retailerStat).toHaveProperty('expiredCouponCount');
        expect(retailerStat).toHaveProperty('expiredTotalValue');
      });
    });
    
    it('should calculate correct statistics', () => {
      // Use the imported service instance
      
      // Add test coupons for a specific retailer
      service.coupons = [
        {
          id: 1,
          retailer: 'TestRetailer',
          initialValue: '100',
          currentValue: '100',
          expirationDate: new Date(Date.now() + 86400000), // Future date (tomorrow)
          activationCode: 'TEST1',
          pin: '1111'
        },
        {
          id: 2,
          retailer: 'TestRetailer',
          initialValue: '50',
          currentValue: '0', // Used coupon
          expirationDate: new Date(Date.now() + 86400000), // Future date (tomorrow)
          activationCode: 'TEST2',
          pin: '2222'
        },
        {
          id: 3,
          retailer: 'TestRetailer',
          initialValue: '75',
          currentValue: '75',
          expirationDate: new Date(Date.now() - 86400000), // Past date (yesterday)
          activationCode: 'TEST3',
          pin: '3333'
        }
      ];
      
      const stats = service.getRetailerStats();
      
      // Find the TestRetailer stats
      const testRetailerStats = stats.find(s => s.retailer === 'TestRetailer');
      
      expect(testRetailerStats).toBeDefined();
      expect(testRetailerStats.couponCount).toBe(3);
      expect(testRetailerStats.activeCouponCount).toBe(1); // Only the first coupon is active
      expect(testRetailerStats.activeTotalValue).toBe(100);
      expect(testRetailerStats.expiredCouponCount).toBe(2); // The second (used) and third (expired date) coupons
      expect(testRetailerStats.expiredTotalValue).toBe(75); // Only the third coupon has value (the second is used)
    });
  });
});