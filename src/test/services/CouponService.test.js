import { describe, it, expect, beforeEach, vi } from 'vitest';
import PocketBaseCouponService from '../../services/PocketBaseCouponService';
import PocketBaseAuthService from '../../services/PocketBaseAuthService';
import PocketBaseRoleService from '../../services/PocketBaseRoleService';

// Mock the PocketBaseClient
vi.mock('../../services/PocketBaseClient', () => {
  let couponsCollection = {
    getList: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  };

  const mockInstance = {
    collection: vi.fn((name) => {
      if (name === 'coupons') {
        return couponsCollection;
      }
      return {};
    })
  };

  return {
    default: {
      getInstance: vi.fn(() => mockInstance),
      _setCouponsCollection: (col) => { couponsCollection = col; },
      _getMockInstance: () => mockInstance
    }
  };
});

// Import the mocked module to get access to helper methods
import PocketBaseClient from '../../services/PocketBaseClient';

// Mock PocketBaseAuthService
vi.mock('../../services/PocketBaseAuthService', () => ({
  default: {
    getUser: vi.fn()
  }
}));

// Mock PocketBaseRoleService
vi.mock('../../services/PocketBaseRoleService', () => ({
  default: {
    hasPermission: vi.fn()
  },
  Permissions: {
    VIEW_ANY_COUPON: 'viewAnyCoupon',
    EDIT_COUPON: 'editCoupon'
  }
}));

describe('PocketBaseCouponService', () => {
  let mockInstance;
  let couponsCollection;

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'user',
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  };

  const mockCoupons = [
    {
      id: '1',
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '50',
      expirationDate: '2027-12-31',
      activationCode: 'AMZN2024',
      pin: '1234',
      userId: 'test-user-id',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    },
    {
      id: '2',
      retailer: 'Target',
      initialValue: '75',
      currentValue: '75',
      expirationDate: '2027-09-30',
      activationCode: 'TGT75FALL',
      pin: '4321',
      userId: 'test-user-id',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    // Clear all mocks between tests
    vi.clearAllMocks();

    // Get the mocked instance
    mockInstance = PocketBaseClient._getMockInstance();
    couponsCollection = mockInstance.collection('coupons');

    // Default auth mock - user is authenticated
    PocketBaseAuthService.getUser.mockReturnValue(mockUser);

    // Default role mock - user can only view own coupons
    PocketBaseRoleService.hasPermission.mockResolvedValue(false);
  });

  describe('getAllCoupons', () => {
    it('should return all coupons for user', async () => {
      // Arrange - Set up mock return value
      couponsCollection.getList.mockResolvedValue({
        items: mockCoupons,
        totalItems: 2
      });

      // Act - Call the service method
      const result = await PocketBaseCouponService.getAllCoupons();

      // Assert - Verify the result
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0]).toEqual(expect.objectContaining({
        id: '1',
        retailer: 'Amazon',
        initialValue: '50'
      }));
      expect(couponsCollection.getList).toHaveBeenCalledWith(1, 500, {
        filter: 'userId = "test-user-id"',
        sort: '-created'
      });
    });

    it('should return all coupons for manager with viewAnyCoupon permission', async () => {
      // Arrange - Manager can view all coupons
      PocketBaseRoleService.hasPermission.mockImplementation((permission) => {
        return Promise.resolve(permission === 'viewAnyCoupon');
      });

      couponsCollection.getList.mockResolvedValue({
        items: mockCoupons,
        totalItems: 2
      });

      // Act - Call the service method
      const result = await PocketBaseCouponService.getAllCoupons();

      // Assert - Verify no filter is applied (can view all)
      expect(couponsCollection.getList).toHaveBeenCalledWith(1, 500, {
        filter: '',
        sort: '-created'
      });
    });

    it('should return empty array when no user is authenticated', async () => {
      // Arrange - No authenticated user
      PocketBaseAuthService.getUser.mockReturnValue(null);

      // Act - Call the service method
      const result = await PocketBaseCouponService.getAllCoupons();

      // Assert - Verify empty result
      expect(result).toEqual([]);
      expect(couponsCollection.getList).not.toHaveBeenCalled();
    });
  });

  describe('addCoupon', () => {
    it('should add a new coupon with generated id', async () => {
      // Arrange - Set up mock return value
      const newCoupon = {
        retailer: 'Test Store',
        initialValue: '25',
        expirationDate: '2027-01-01'
      };

      const createdCoupon = {
        id: 'new-coupon-id',
        ...newCoupon,
        currentValue: '25',
        userId: 'test-user-id',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };

      couponsCollection.create.mockResolvedValue(createdCoupon);

      // Act - Call the service method
      const result = await PocketBaseCouponService.addCoupon(newCoupon);

      // Assert - Verify coupon was created
      expect(result.id).toBeDefined();
      expect(result.retailer).toBe('Test Store');
      expect(result.initialValue).toBe('25');
      expect(result.currentValue).toBe('25');
      expect(couponsCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          retailer: 'Test Store',
          initialValue: '25',
          currentValue: '25',
          userId: 'test-user-id'
        })
      );
    });

    it('should set currentValue equal to initialValue for new coupons', async () => {
      // Arrange
      const newCoupon = {
        retailer: 'Test Store',
        initialValue: '50',
        expirationDate: '2027-01-01'
      };

      const createdCoupon = {
        id: 'new-id',
        ...newCoupon,
        currentValue: '50',
        userId: 'test-user-id',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };

      couponsCollection.create.mockResolvedValue(createdCoupon);

      // Act
      const result = await PocketBaseCouponService.addCoupon(newCoupon);

      // Assert
      expect(result.currentValue).toBe('50');
    });

    it('should handle coupon with no expiration date', async () => {
      // Arrange
      const newCoupon = {
        retailer: 'Test Store',
        initialValue: '50'
      };

      const createdCoupon = {
        id: 'new-id',
        ...newCoupon,
        currentValue: '50',
        expirationDate: null,
        userId: 'test-user-id',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };

      couponsCollection.create.mockResolvedValue(createdCoupon);

      // Act
      const result = await PocketBaseCouponService.addCoupon(newCoupon);

      // Assert
      expect(result.expirationDate).toBeUndefined();
    });
  });

  describe('updateCoupon', () => {
    it('should update an existing coupon', async () => {
      // Arrange - User has permission
      PocketBaseRoleService.hasPermission.mockResolvedValue(true);

      const updatedData = {
        id: '1',
        retailer: 'Amazon',
        initialValue: '50',
        currentValue: '25',
        expirationDate: '2027-12-31',
        activationCode: 'AMZN2024-UPDATED',
        pin: '1234'
      };

      const updatedCoupon = {
        ...updatedData,
        userId: 'test-user-id',
        updated: new Date().toISOString()
      };

      couponsCollection.update.mockResolvedValue(updatedCoupon);

      // Act - Call the service method
      const result = await PocketBaseCouponService.updateCoupon(updatedData);

      // Assert - Verify coupon was updated
      expect(result).toBe(true);
      expect(couponsCollection.update).toHaveBeenCalledWith('1', expect.objectContaining({
        currentValue: '25',
        activationCode: 'AMZN2024-UPDATED'
      }));
    });

    it('should return false when user lacks permission', async () => {
      // Arrange - User does not have permission
      PocketBaseRoleService.hasPermission.mockResolvedValue(false);

      const updatedData = {
        id: '1',
        retailer: 'Amazon',
        initialValue: '50',
        currentValue: '25'
      };

      // Act - Call the service method
      const result = await PocketBaseCouponService.updateCoupon(updatedData);

      // Assert - Verify permission was checked and update was not called
      expect(PocketBaseRoleService.hasPermission).toHaveBeenCalledWith('editCoupon', { couponId: '1' });
      expect(result).toBe(false);
      expect(couponsCollection.update).not.toHaveBeenCalled();
    });

    it('should throw error when coupon id is not provided', async () => {
      // Arrange - No id provided
      const updatedData = {
        retailer: 'Amazon',
        initialValue: '50',
        currentValue: '25'
      };

      // Act & Assert - Expect error to be thrown
      await expect(PocketBaseCouponService.updateCoupon(updatedData)).rejects.toThrow('Cannot update coupon without an ID');
      expect(couponsCollection.update).not.toHaveBeenCalled();
    });
  });

  describe('markCouponAsUsed', () => {
    it('should mark a coupon as used (set currentValue to 0)', async () => {
      // Arrange - User has permission
      PocketBaseRoleService.hasPermission.mockResolvedValue(true);

      couponsCollection.update.mockResolvedValue({ id: '1' });

      // Act - Call the service method
      const result = await PocketBaseCouponService.markCouponAsUsed('1');

      // Assert - Verify coupon was marked as used
      expect(result).toBe(true);
      expect(couponsCollection.update).toHaveBeenCalledWith('1', {
        currentValue: '0',
        updated: expect.any(String)
      });
    });

    it('should return false when user lacks permission', async () => {
      // Arrange - User does not have permission
      PocketBaseRoleService.hasPermission.mockResolvedValue(false);

      // Act - Call the service method
      const result = await PocketBaseCouponService.markCouponAsUsed('1');

      // Assert - Verify permission was checked and update was not called
      expect(PocketBaseRoleService.hasPermission).toHaveBeenCalledWith('editCoupon', { couponId: '1' });
      expect(result).toBe(false);
      expect(couponsCollection.update).not.toHaveBeenCalled();
    });
  });

  describe('partiallyUseCoupon', () => {
    it('should reduce the currentValue by the specified amount', async () => {
      // Arrange - User has permission and coupon exists
      PocketBaseRoleService.hasPermission.mockResolvedValue(true);

      const existingCoupon = {
        id: '1',
        currentValue: '50',
        userId: 'test-user-id'
      };

      couponsCollection.getOne.mockResolvedValue(existingCoupon);
      couponsCollection.update.mockResolvedValue({ id: '1' });

      // Act - Call the service method
      const result = await PocketBaseCouponService.partiallyUseCoupon('1', 5);

      // Assert - Verify currentValue was reduced
      expect(result).toBe(true);
      expect(couponsCollection.getOne).toHaveBeenCalledWith('1');
      expect(couponsCollection.update).toHaveBeenCalledWith('1', {
        currentValue: '45',
        updated: expect.any(String)
      });
    });

    it('should mark coupon as used if amount equals currentValue', async () => {
      // Arrange - User has permission and coupon exists
      PocketBaseRoleService.hasPermission.mockResolvedValue(true);

      const existingCoupon = {
        id: '1',
        currentValue: '50',
        userId: 'test-user-id'
      };

      couponsCollection.getOne.mockResolvedValue(existingCoupon);
      couponsCollection.update.mockResolvedValue({ id: '1' });

      // Act - Use the full amount
      const result = await PocketBaseCouponService.partiallyUseCoupon('1', 50);

      // Assert - Verify currentValue is now 0
      expect(result).toBe(true);
      expect(couponsCollection.update).toHaveBeenCalledWith('1', {
        currentValue: '0',
        updated: expect.any(String)
      });
    });

    it('should return false when user lacks permission', async () => {
      // Arrange - User does not have permission
      PocketBaseRoleService.hasPermission.mockResolvedValue(false);

      const existingCoupon = {
        id: '1',
        currentValue: '50',
        userId: 'test-user-id'
      };

      couponsCollection.getOne.mockResolvedValue(existingCoupon);

      // Act - Call the service method
      const result = await PocketBaseCouponService.partiallyUseCoupon('1', 10);

      // Assert - Verify permission was checked and update was not called
      expect(PocketBaseRoleService.hasPermission).toHaveBeenCalledWith('editCoupon', {
        couponId: '1',
        userId: 'test-user-id'
      });
      expect(result).toBe(false);
      expect(couponsCollection.update).not.toHaveBeenCalled();
    });
  });

  describe('getUniqueRetailers', () => {
    it('should return a list of unique retailer names', async () => {
      // Arrange - Set up mock return value
      const retailerCoupons = [
        { retailer: 'Amazon' },
        { retailer: 'Target' },
        { retailer: 'Amazon' } // Duplicate
      ];

      couponsCollection.getList.mockResolvedValue({
        items: retailerCoupons,
        totalItems: 3
      });

      // Act - Call the service method
      const result = await PocketBaseCouponService.getUniqueRetailers();

      // Assert - Verify unique retailers
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2); // Only 2 unique retailers
      expect(result).toContain('Amazon');
      expect(result).toContain('Target');
      expect(couponsCollection.getList).toHaveBeenCalledWith(1, 500, {
        filter: 'userId = "test-user-id"',
        fields: 'retailer'
      });
    });
  });

  describe('getRetailerStats', () => {
    it('should return statistics for all retailers', async () => {
      // Arrange - Set up mock return value with mixed coupons
      const now = new Date();
      const futureDate = new Date(now.getTime() + 86400000).toISOString().split('T')[0];
      const pastDate = new Date(now.getTime() - 86400000).toISOString().split('T')[0];

      const testCoupons = [
        {
          id: '1',
          retailer: 'TestRetailer',
          initialValue: '100',
          currentValue: '100',
          expirationDate: futureDate,
          userId: 'test-user-id'
        },
        {
          id: '2',
          retailer: 'TestRetailer',
          initialValue: '50',
          currentValue: '0',
          expirationDate: futureDate,
          userId: 'test-user-id'
        },
        {
          id: '3',
          retailer: 'TestRetailer',
          initialValue: '75',
          currentValue: '75',
          expirationDate: pastDate,
          userId: 'test-user-id'
        }
      ];

      couponsCollection.getList.mockResolvedValue({
        items: testCoupons,
        totalItems: 3
      });

      // Act - Call the service method
      const stats = await PocketBaseCouponService.getRetailerStats();

      // Assert - Verify statistics
      expect(Array.isArray(stats)).toBe(true);
      expect(stats.length).toBeGreaterThan(0);

      const testRetailerStats = stats.find(s => s.name === 'TestRetailer');
      expect(testRetailerStats).toBeDefined();
      expect(testRetailerStats.couponCount).toBe(3);
      expect(testRetailerStats.activeCouponCount).toBe(2);
      expect(testRetailerStats.activeTotalValue).toBe(100);
      expect(testRetailerStats.expiredCouponCount).toBe(1);
      expect(testRetailerStats.expiredTotalValue).toBe(75);
    });
  });
});
