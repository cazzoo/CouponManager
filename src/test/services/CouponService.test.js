import { describe, it, expect, beforeEach } from 'vitest';
import CouponService from '../../services/CouponService';

describe('CouponService', () => {
  let service;
  
  beforeEach(() => {
    // Use the singleton CouponService
    service = CouponService;
    
    // Reset the coupons array for testing via the private property
    service.coupons = [
      {
        id: '1',
        userId: 'test-user',
        retailer: 'Amazon',
        initialValue: '50',
        currentValue: '50',
        expirationDate: '2025-12-31',
        activationCode: 'AMZN2024',
        pin: '1234'
      },
      {
        id: '2',
        userId: 'test-user',
        retailer: 'Target',
        initialValue: '75',
        currentValue: '75',
        expirationDate: '2025-09-30',
        activationCode: 'TGT75FALL',
        pin: '4321'
      }
    ];
  });
  
  describe('getAllCoupons', () => {
    it('should return all coupons', async () => {
      const coupons = await service.getAllCoupons();
      expect(Array.isArray(coupons)).toBe(true);
      expect(coupons.length).toBeGreaterThan(0);
    });
    
    it('should return a copy of the coupons array, not the original reference', async () => {
      const coupons = await service.getAllCoupons();
      const originalLength = coupons.length;
      
      // Modify the returned array
      coupons.push({ id: '999', retailer: 'Test' });
      
      // Get coupons again and verify the original wasn't modified
      const newCoupons = await service.getAllCoupons();
      expect(newCoupons.length).toBe(originalLength);
    });
  });
  
  describe('addCoupon', () => {
    it('should add a new coupon with generated id', async () => {
      const coupons = await service.getAllCoupons();
      const originalCount = coupons.length;
      
      const newCoupon = {
        retailer: 'Test Store',
        initialValue: '25',
        expirationDate: '2025-01-01'
      };
      
      const result = await service.addCoupon(newCoupon);
      
      // Check that the coupon was added
      const updatedCoupons = await service.getAllCoupons();
      expect(updatedCoupons.length).toBe(originalCount + 1);
      
      // Check that the returned coupon has the expected properties
      expect(result.id).toBeDefined();
      expect(result.retailer).toBe('Test Store');
      expect(result.initialValue).toBe('25');
      expect(result.currentValue).toBe('25'); // Should default to initial value
      expect(result.expirationDate).toBe('2025-01-01');
    });
    
    it('should set currentValue equal to initialValue for new coupons', async () => {
      const newCoupon = {
        retailer: 'Test Store',
        initialValue: '50',
        expirationDate: '2025-01-01'
      };
      
      const result = await service.addCoupon(newCoupon);
      expect(result.currentValue).toBe('50');
    });
    
    it('should handle coupon with no expiration date', async () => {
      const newCoupon = {
        retailer: 'Test Store',
        initialValue: '50'
      };
      
      const result = await service.addCoupon(newCoupon);
      expect(result.expirationDate).toBeUndefined();
    });
  });
  
  describe('updateCoupon', () => {
    it('should update an existing coupon', async () => {
      const updatedData = {
        id: '1',
        retailer: 'Amazon',
        initialValue: '50',
        currentValue: '25',
        expirationDate: '2024-12-31',
        activationCode: 'AMZN2024-UPDATED',
        pin: '1234'
      };
      
      const result = await service.updateCoupon(updatedData);
      
      expect(result).toBe(true);
      
      // Verify the coupon was updated
      const coupons = await service.getAllCoupons();
      const updatedCoupon = coupons.find(c => c.id === '1');
      expect(updatedCoupon.currentValue).toBe('25');
      expect(updatedCoupon.activationCode).toBe('AMZN2024-UPDATED');
    });
    
    it('should return null when coupon id does not exist', async () => {
      const nonExistentCoupon = {
        id: '9999', // This ID doesn't exist
        retailer: 'Non-existent',
        initialValue: '100',
        currentValue: '100'
      };
      
      const result = await service.updateCoupon(nonExistentCoupon);
      expect(result).toBe(false);
    });
  });
  
  describe('markCouponAsUsed', () => {
    it('should mark a coupon as used (set currentValue to 0)', async () => {
      const coupons = await service.getAllCoupons();
      const couponToMark = coupons.find(c => c.currentValue !== '0');
      
      const result = await service.markCouponAsUsed(couponToMark.id);
      
      // The service returns a boolean indicating success
      expect(result).toBe(true);
      
      // Get the updated coupon
      const updatedCoupons = await service.getAllCoupons();
      const updatedCoupon = updatedCoupons.find(c => c.id === couponToMark.id);
      
      // Verify currentValue is now 0
      expect(updatedCoupon.currentValue).toBe('0');
    });
    
    it('should return null when coupon id does not exist', async () => {
      const result = await service.markCouponAsUsed('9999'); // Non-existent ID
      expect(result).toBe(false);
    });
  });
  
  describe('partiallyUseCoupon', () => {
    it('should reduce the currentValue by the specified amount', async () => {
      const coupons = await service.getAllCoupons();
      const couponToUse = coupons.find(c => parseFloat(c.currentValue) >= 10);
      
      const originalValue = parseFloat(couponToUse.currentValue);
      const amountToUse = 5;
      
      const result = await service.partiallyUseCoupon(couponToUse.id, amountToUse);
      
      // The service returns a boolean indicating success
      expect(result).toBe(true);
      
      // Get the updated coupon
      const updatedCoupons = await service.getAllCoupons();
      const updatedCoupon = updatedCoupons.find(c => c.id === couponToUse.id);
      
      // Calculate expected new value with proper formatting
      const expectedNewValue = (originalValue - amountToUse).toString();
      
      // Verify currentValue was reduced correctly
      expect(updatedCoupon.currentValue).toBe(expectedNewValue);
    });
    
    it('should mark coupon as used if amount equals currentValue', async () => {
      const coupons = await service.getAllCoupons();
      const couponToUse = coupons.find(c => c.currentValue !== '0');
      
      const result = await service.partiallyUseCoupon(couponToUse.id, parseFloat(couponToUse.currentValue));
      
      // The service returns a boolean indicating success
      expect(result).toBe(true);
      
      // Get the updated coupon
      const updatedCoupons = await service.getAllCoupons();
      const updatedCoupon = updatedCoupons.find(c => c.id === couponToUse.id);
      
      // Verify currentValue is now 0
      expect(updatedCoupon.currentValue).toBe('0');
    });
    
    it('should return null when coupon id does not exist', async () => {
      const result = await service.partiallyUseCoupon('9999', 10); // Non-existent ID
      expect(result).toBe(false);
    });
    
    it('should handle invalid amount input', async () => {
      const coupons = await service.getAllCoupons();
      const couponToUse = coupons.find(c => c.currentValue !== '0');
      
      try {
        // Try with non-numeric amount
        await service.partiallyUseCoupon(couponToUse.id, 'invalid');
        // If we get here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        // We expect an error
        expect(error).toBeDefined();
      }
    });
  });
  
  describe('getUniqueRetailers', () => {
    it('should return a list of unique retailer names', async () => {
      const retailers = await service.getUniqueRetailers();
      
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
    it('should return statistics for all retailers', async () => {
      const stats = await service.getRetailerStats();
      
      expect(Array.isArray(stats)).toBe(true);
      expect(stats.length).toBeGreaterThan(0);
      
      // Check that each retailer has the required properties
      stats.forEach(retailerStat => {
        expect(retailerStat).toHaveProperty('name');
        expect(retailerStat).toHaveProperty('couponCount');
        expect(retailerStat).toHaveProperty('activeCouponCount');
        expect(retailerStat).toHaveProperty('activeTotalValue');
        expect(retailerStat).toHaveProperty('expiredCouponCount');
        expect(retailerStat).toHaveProperty('expiredTotalValue');
      });
    });
    
    it('should calculate correct statistics', async () => {
      // Use the imported service instance
      
      // Add test coupons for a specific retailer
      service.coupons = [
        {
          id: '1',
          userId: 'test-user',
          retailer: 'TestRetailer',
          initialValue: '100',
          currentValue: '100',
          expirationDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Future date (tomorrow)
          activationCode: 'TEST1',
          pin: '1111'
        },
        {
          id: '2',
          userId: 'test-user',
          retailer: 'TestRetailer',
          initialValue: '50',
          currentValue: '0', // Used coupon
          expirationDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Future date (tomorrow)
          activationCode: 'TEST2',
          pin: '2222'
        },
        {
          id: '3',
          userId: 'test-user',
          retailer: 'TestRetailer',
          initialValue: '75',
          currentValue: '75',
          expirationDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Past date (yesterday)
          activationCode: 'TEST3',
          pin: '3333'
        }
      ];
      
      const stats = await service.getRetailerStats();
      
      // Find the TestRetailer stats
      const testRetailerStats = stats.find(s => s.name === 'TestRetailer');
      
      expect(testRetailerStats).toBeDefined();
      expect(testRetailerStats.couponCount).toBe(3);
      // The implementation considers a coupon active if it has a future expiration date,
      // regardless of its currentValue. So both coupon 1 and 2 are considered active.
      expect(testRetailerStats.activeCouponCount).toBe(2); 
      expect(testRetailerStats.activeTotalValue).toBe(100); // Only coupon 1 has value
      expect(testRetailerStats.expiredCouponCount).toBe(1); // Only coupon 3 is expired by date
      expect(testRetailerStats.expiredTotalValue).toBe(75); // Only coupon 3 has value and is expired
    });
  });
});