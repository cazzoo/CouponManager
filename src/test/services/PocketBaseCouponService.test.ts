/**
 * Unit tests for PocketBaseCouponService
 * Tests CRUD operations with permission enforcement
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Coupon, CouponFormData } from '../../types';

// Mock PocketBaseClient before importing the service
vi.mock('../../services/PocketBaseClient', () => {
  let instance: any = null;

  return {
    default: {
      getInstance: vi.fn(() => {
        if (!instance) {
          instance = {
            authStore: {
              record: null as any
            },
            collection: vi.fn(() => ({
              getList: vi.fn().mockResolvedValue({ items: [] }),
              getOne: vi.fn().mockResolvedValue({}),
              create: vi.fn().mockResolvedValue({}),
              update: vi.fn().mockResolvedValue({})
            }))
          };
        }
        return instance;
      })
    }
  };
});

// Mock PocketBaseRoleService for permission checks
vi.mock('../../services/PocketBaseRoleService', () => ({
  default: {
    hasPermission: vi.fn().mockResolvedValue(true)
  },
  Permissions: {
    VIEW_ANY_COUPON: 'viewAnyCoupon',
    EDIT_COUPON: 'editCoupon',
    CREATE_COUPON: 'createCoupon'
  }
}));

// Import after mocking
import PocketBaseClient from '../../services/PocketBaseClient';
import PocketBaseCouponService from '../../services/PocketBaseCouponService';
import PocketBaseRoleService, { Permissions } from '../../services/PocketBaseRoleService';

// Get mock instance for use in tests
const mockPocketBase = PocketBaseClient.getInstance() as any;

describe('PocketBaseCouponService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset auth store record
    mockPocketBase.authStore.record = null;
    // Reset permission mock to allow by default
    vi.mocked(PocketBaseRoleService.hasPermission).mockResolvedValue(true);
  });

  describe('getAllCoupons', () => {
    it('should return empty array when no user is authenticated', async () => {
      // Arrange
      mockPocketBase.authStore.record = null;

      // Act
      const coupons = await PocketBaseCouponService.getAllCoupons();

      // Assert
      expect(coupons).toEqual([]);
    });

    it('should fetch only user coupons when user lacks VIEW_ANY_COUPON permission', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'user@example.com', role: 'user' };
      mockPocketBase.authStore.record = mockUser;
      vi.mocked(PocketBaseRoleService.hasPermission).mockResolvedValue(false);

      const mockCollection = {
        getList: vi.fn().mockResolvedValue({ items: [] })
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      await PocketBaseCouponService.getAllCoupons();

      // Assert
      expect(mockCollection.getList).toHaveBeenCalledWith(
        1,
        500,
        expect.objectContaining({
          filter: "userId = 'user-123'"
        })
      );
    });

    it('should fetch all coupons when user has VIEW_ANY_COUPON permission', async () => {
      // Arrange
      const mockUser = { id: 'manager-123', email: 'manager@example.com', role: 'manager' };
      mockPocketBase.authStore.record = mockUser;
      vi.mocked(PocketBaseRoleService.hasPermission).mockResolvedValue(true);

      const mockCollection = {
        getList: vi.fn().mockResolvedValue({ items: [] })
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      await PocketBaseCouponService.getAllCoupons();

      // Assert
      expect(mockCollection.getList).toHaveBeenCalledWith(
        1,
        500,
        expect.objectContaining({
          filter: ''
        })
      );
    });

    it('should map PocketBase coupon records to Coupon type', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'user@example.com', role: 'user' };
      mockPocketBase.authStore.record = mockUser;

      const pbCoupon = {
        id: 'coupon-1',
        retailer: 'Amazon',
        initialValue: '50.00',
        currentValue: '50.00',
        expirationDate: '2027-12-31',
        userId: 'user-123',
        created: '2024-01-01T00:00:00.000Z',
        updated: '2024-01-01T00:00:00.000Z',
        activationCode: null,
        pin: null,
        barcode: null,
        reference: null,
        notes: null
      };

      const mockCollection = {
        getList: vi.fn().mockResolvedValue({ items: [pbCoupon] })
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const coupons = await PocketBaseCouponService.getAllCoupons();

      // Assert
      expect(coupons).toHaveLength(1);
      expect(coupons[0]).toMatchObject({
        id: 'coupon-1',
        retailer: 'Amazon',
        initialValue: '50.00',
        currentValue: '50.00',
        userId: 'user-123'
      });
    });
  });

  describe('addCoupon', () => {
    it('should add coupon with authenticated user ID', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'user@example.com', role: 'user' };
      mockPocketBase.authStore.record = mockUser;

      const couponData: CouponFormData = {
        retailer: 'Target',
        initialValue: '25.00'
      };

      const createdPbCoupon = {
        id: 'coupon-new',
        retailer: 'Target',
        initialValue: '25.00',
        currentValue: '25.00',
        userId: 'user-123',
        created: '2024-01-01T00:00:00.000Z',
        updated: '2024-01-01T00:00:00.000Z',
        expirationDate: null,
        activationCode: null,
        pin: null,
        barcode: null,
        reference: null,
        notes: null
      };

      const mockCollection = {
        create: vi.fn().mockResolvedValue(createdPbCoupon)
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const result = await PocketBaseCouponService.addCoupon(couponData);

      // Assert
      expect(mockCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          retailer: 'Target',
          initialValue: '25.00',
          currentValue: '25.00',
          userId: 'user-123'
        }),
        expect.anything()
      );
      expect(result.userId).toBe('user-123');
    });

    it('should use provided userId when not authenticated', async () => {
      // Arrange
      mockPocketBase.authStore.record = null;

      const couponData: CouponFormData = {
        retailer: 'Amazon',
        initialValue: '50.00'
      };

      const createdPbCoupon = {
        id: 'coupon-new',
        retailer: 'Amazon',
        initialValue: '50.00',
        currentValue: '50.00',
        userId: 'user-456',
        created: '2024-01-01T00:00:00.000Z',
        updated: '2024-01-01T00:00:00.000Z',
        expirationDate: null,
        activationCode: null,
        pin: null,
        barcode: null,
        reference: null,
        notes: null
      };

      const mockCollection = {
        create: vi.fn().mockResolvedValue(createdPbCoupon)
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const result = await PocketBaseCouponService.addCoupon(couponData, 'user-456');

      // Assert
      expect(result.userId).toBe('user-456');
    });

    it('should throw error when no user is authenticated and no userId provided', async () => {
      // Arrange
      mockPocketBase.authStore.record = null;
      const couponData: CouponFormData = {
        retailer: 'Amazon',
        initialValue: '50.00'
      };

      // Act & Assert
      await expect(PocketBaseCouponService.addCoupon(couponData)).rejects.toThrow(
        'No authenticated user found and no userId provided'
      );
    });
  });

  describe('updateCoupon', () => {
    it('should update coupon when user has EDIT_COUPON permission', async () => {
      // Arrange
      vi.mocked(PocketBaseRoleService.hasPermission).mockResolvedValue(true);

      const partialCoupon: Partial<Coupon> = {
        id: 'coupon-1',
        retailer: 'Updated Retailer'
      };

      const mockCollection = {
        update: vi.fn().mockResolvedValue({})
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const result = await PocketBaseCouponService.updateCoupon(partialCoupon);

      // Assert
      expect(result).toBe(true);
      expect(mockCollection.update).toHaveBeenCalledWith(
        'coupon-1',
        expect.objectContaining({
          retailer: 'Updated Retailer'
        }),
        expect.anything()
      );
    });

    it('should return false when user lacks EDIT_COUPON permission', async () => {
      // Arrange
      vi.mocked(PocketBaseRoleService.hasPermission).mockResolvedValue(false);

      const partialCoupon: Partial<Coupon> = {
        id: 'coupon-1',
        retailer: 'Updated Retailer'
      };

      // Act
      const result = await PocketBaseCouponService.updateCoupon(partialCoupon);

      // Assert
      expect(result).toBe(false);
    });

    it('should throw error when coupon ID is missing', async () => {
      // Arrange
      const partialCoupon: Partial<Coupon> = {
        retailer: 'Updated Retailer'
      };

      // Act & Assert
      await expect(PocketBaseCouponService.updateCoupon(partialCoupon)).rejects.toThrow(
        'Cannot update coupon without an ID'
      );
    });
  });

  describe('markCouponAsUsed', () => {
    it('should mark coupon as used when user has EDIT_COUPON permission', async () => {
      // Arrange
      vi.mocked(PocketBaseRoleService.hasPermission).mockResolvedValue(true);

      const mockCollection = {
        update: vi.fn().mockResolvedValue({})
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const result = await PocketBaseCouponService.markCouponAsUsed('coupon-1');

      // Assert
      expect(result).toBe(true);
      expect(mockCollection.update).toHaveBeenCalledWith(
        'coupon-1',
        expect.objectContaining({
          currentValue: '0'
        }),
        expect.anything()
      );
    });

    it('should return false when user lacks EDIT_COUPON permission', async () => {
      // Arrange
      vi.mocked(PocketBaseRoleService.hasPermission).mockResolvedValue(false);

      // Act
      const result = await PocketBaseCouponService.markCouponAsUsed('coupon-1');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('partiallyUseCoupon', () => {
    it('should partially use coupon when user has EDIT_COUPON permission', async () => {
      // Arrange
      vi.mocked(PocketBaseRoleService.hasPermission).mockResolvedValue(true);

      const existingCoupon = {
        id: 'coupon-1',
        currentValue: '50.00',
        userId: 'user-123'
      };

      const mockCollection = {
        getOne: vi.fn().mockResolvedValue(existingCoupon),
        update: vi.fn().mockResolvedValue({})
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const result = await PocketBaseCouponService.partiallyUseCoupon('coupon-1', 20);

      // Assert
      expect(result).toBe(true);
      expect(mockCollection.update).toHaveBeenCalledWith(
        'coupon-1',
        expect.objectContaining({
          currentValue: '30'
        }),
        expect.anything()
      );
    });

    it('should return false when user lacks EDIT_COUPON permission', async () => {
      // Arrange
      vi.mocked(PocketBaseRoleService.hasPermission).mockResolvedValue(false);

      const existingCoupon = {
        id: 'coupon-1',
        currentValue: '50.00',
        userId: 'user-123'
      };

      const mockCollection = {
        getOne: vi.fn().mockResolvedValue(existingCoupon)
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const result = await PocketBaseCouponService.partiallyUseCoupon('coupon-1', 20);

      // Assert
      expect(result).toBe(false);
    });

    it('should not reduce value below zero', async () => {
      // Arrange
      vi.mocked(PocketBaseRoleService.hasPermission).mockResolvedValue(true);

      const existingCoupon = {
        id: 'coupon-1',
        currentValue: '10.00',
        userId: 'user-123'
      };

      const mockCollection = {
        getOne: vi.fn().mockResolvedValue(existingCoupon),
        update: vi.fn().mockResolvedValue({})
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const result = await PocketBaseCouponService.partiallyUseCoupon('coupon-1', 50);

      // Assert
      expect(result).toBe(true);
      expect(mockCollection.update).toHaveBeenCalledWith(
        'coupon-1',
        expect.objectContaining({
          currentValue: '0'
        }),
        expect.anything()
      );
    });
  });

  describe('getUniqueRetailers', () => {
    it('should return empty array when no user is authenticated', async () => {
      // Arrange
      mockPocketBase.authStore.record = null;

      // Act
      const retailers = await PocketBaseCouponService.getUniqueRetailers();

      // Assert
      expect(retailers).toEqual([]);
    });

    it('should return unique retailer names from user coupons', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'user@example.com', role: 'user' };
      mockPocketBase.authStore.record = mockUser;

      const pbCoupons = [
        { retailer: 'Amazon' },
        { retailer: 'Target' },
        { retailer: 'Amazon' }
      ];

      const mockCollection = {
        getList: vi.fn().mockResolvedValue({ items: pbCoupons })
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const retailers = await PocketBaseCouponService.getUniqueRetailers();

      // Assert
      expect(retailers).toEqual(expect.arrayContaining(['Amazon', 'Target']));
      expect(retailers).toHaveLength(2);
    });
  });

  describe('getRetailerStats', () => {
    it('should calculate statistics for all retailers', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'user@example.com', role: 'user' };
      mockPocketBase.authStore.record = mockUser;

      const coupons = [
        {
          id: '1',
          retailer: 'Amazon',
          initialValue: '50.00',
          currentValue: '50.00',
          expirationDate: '2027-12-31',
          userId: 'user-123',
          created: '2024-01-01',
          updated: '2024-01-01'
        },
        {
          id: '2',
          retailer: 'Amazon',
          initialValue: '25.00',
          currentValue: '0.00',
          expirationDate: '2024-01-01',
          userId: 'user-123',
          created: '2024-01-01',
          updated: '2024-01-01'
        },
        {
          id: '3',
          retailer: 'Target',
          initialValue: '100.00',
          currentValue: '80.00',
          expirationDate: '2027-06-30',
          userId: 'user-123',
          created: '2024-01-01',
          updated: '2024-01-01'
        }
      ];

      const mockCollection = {
        getList: vi.fn().mockResolvedValue({ items: coupons })
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Mock getAllCoupons to return our test data
      vi.spyOn(PocketBaseCouponService, 'getAllCoupons').mockResolvedValue(coupons as any);

      // Act
      const stats = await PocketBaseCouponService.getRetailerStats();

      // Assert
      expect(stats).toHaveLength(2);
      const amazonStats = stats.find(s => s.name === 'Amazon');
      const targetStats = stats.find(s => s.name === 'Target');

      expect(amazonStats).toBeDefined();
      expect(amazonStats!.couponCount).toBe(2);
      expect(amazonStats!.totalValue).toBe(50.0); // 50 + 0

      expect(targetStats).toBeDefined();
      expect(targetStats!.couponCount).toBe(1);
      expect(targetStats!.activeCouponCount).toBe(1);
      expect(targetStats!.activeTotalValue).toBe(80.0);
    });
  });
});
