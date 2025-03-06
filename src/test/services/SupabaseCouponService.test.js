import { describe, it, expect, vi, beforeEach } from 'vitest';
import SupabaseCouponService from '../../services/SupabaseCouponService';
import RoleService from '../../services/RoleService';
import supabase from '../../services/SupabaseClient';

// Mock dependencies
vi.mock('../../services/SupabaseClient', () => ({
  default: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis()
  }
}));

vi.mock('../../services/RoleService', () => ({
  default: {
    checkPermission: vi.fn(),
    getUserRole: vi.fn(),
    isOwner: vi.fn()
  },
  Roles: {
    USER: 'user',
    MANAGER: 'manager'
  },
  Permissions: {
    VIEW_ANY_COUPON: 'viewAnyCoupon',
    EDIT_COUPON: 'editCoupon',
    DELETE_COUPON: 'deleteCoupon'
  }
}));

describe('SupabaseCouponService', () => {
  // Test data
  const mockUserId = 'test-user-id';
  const mockCoupon = {
    id: 1,
    retailer: 'Test Store',
    initialValue: '50',
    currentValue: '50',
    expirationDate: new Date('2025-12-31'),
    activationCode: 'TEST50',
    pin: '1234'
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllCoupons', () => {
    it('should return all coupons for manager role', async () => {
      // Setup mocks
      RoleService.getUserRole.mockResolvedValue({ userId: mockUserId, role: 'manager' });
      RoleService.checkPermission.mockResolvedValue(true);
      
      supabase.order.mockResolvedValue({
        data: [
          { id: 1, retailer: 'Store 1', user_id: mockUserId },
          { id: 2, retailer: 'Store 2', user_id: 'another-user-id' }
        ],
        error: null
      });

      const result = await SupabaseCouponService.getAllCoupons(mockUserId);
      
      expect(result.length).toBe(2);
      expect(RoleService.checkPermission).toHaveBeenCalledWith(mockUserId, 'viewAnyCoupon');
    });

    it('should return only user-owned coupons for regular user', async () => {
      // Setup mocks
      RoleService.getUserRole.mockResolvedValue({ userId: mockUserId, role: 'user' });
      RoleService.checkPermission.mockResolvedValue(false); // Not allowed to view any coupon
      
      supabase.order.mockResolvedValue({
        data: [
          { id: 1, retailer: 'Store 1', user_id: mockUserId }
        ],
        error: null
      });

      const result = await SupabaseCouponService.getAllCoupons(mockUserId);
      
      expect(result.length).toBe(1);
      expect(supabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
    });

    it('should return empty array on error', async () => {
      // Setup mocks
      RoleService.getUserRole.mockResolvedValue({ userId: mockUserId, role: 'user' });
      RoleService.checkPermission.mockResolvedValue(false);
      
      supabase.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await SupabaseCouponService.getAllCoupons(mockUserId);
      
      expect(result).toEqual([]);
    });
  });

  describe('addCoupon', () => {
    it('should add user_id to coupon when adding', async () => {
      // Setup mocks
      supabase.single.mockResolvedValue({
        data: { 
          id: 1, 
          retailer: 'Test Store',
          user_id: mockUserId
        },
        error: null
      });

      await SupabaseCouponService.addCoupon(mockCoupon, mockUserId);
      
      // Verify user_id was included in the insert
      expect(supabase.from).toHaveBeenCalledWith('coupons');
      expect(supabase.insert).toHaveBeenCalledTimes(1);
      
      // First argument of the first call to insert
      const insertArg = supabase.insert.mock.calls[0][0];
      expect(insertArg).toHaveProperty('user_id', mockUserId);
    });

    it('should return null on error', async () => {
      // Setup mocks
      supabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await SupabaseCouponService.addCoupon(mockCoupon, mockUserId);
      
      expect(result).toBeNull();
    });
  });

  describe('updateCoupon', () => {
    it('should check permission before updating', async () => {
      // Setup mocks
      RoleService.checkPermission.mockResolvedValue(true);
      
      supabase.single.mockResolvedValue({
        data: { 
          id: 1, 
          retailer: 'Updated Store',
          user_id: mockUserId
        },
        error: null
      });

      await SupabaseCouponService.updateCoupon(mockCoupon, mockUserId);
      
      // Verify permission check
      expect(RoleService.checkPermission).toHaveBeenCalledWith(
        mockUserId, 
        'editCoupon', 
        { couponId: mockCoupon.id }
      );
      
      // Verify update call
      expect(supabase.from).toHaveBeenCalledWith('coupons');
      expect(supabase.update).toHaveBeenCalledTimes(1);
    });

    it('should not update if user lacks permission', async () => {
      // Setup mocks
      RoleService.checkPermission.mockResolvedValue(false);

      const result = await SupabaseCouponService.updateCoupon(mockCoupon, mockUserId);
      
      // Should not attempt update
      expect(supabase.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('deleteCoupon', () => {
    it('should check permission before deleting', async () => {
      // Setup mocks
      RoleService.checkPermission.mockResolvedValue(true);
      
      supabase.single.mockResolvedValue({
        data: { id: 1 },
        error: null
      });

      await SupabaseCouponService.deleteCoupon(1, mockUserId);
      
      // Verify permission check
      expect(RoleService.checkPermission).toHaveBeenCalledWith(
        mockUserId, 
        'deleteCoupon', 
        { couponId: 1 }
      );
      
      // Verify delete call
      expect(supabase.from).toHaveBeenCalledWith('coupons');
      expect(supabase.delete).toHaveBeenCalledTimes(1);
    });

    it('should not delete if user lacks permission', async () => {
      // Setup mocks
      RoleService.checkPermission.mockResolvedValue(false);

      const result = await SupabaseCouponService.deleteCoupon(1, mockUserId);
      
      // Should not attempt delete
      expect(supabase.delete).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('markCouponAsUsed', () => {
    it('should check permission before marking as used', async () => {
      // Setup mocks
      RoleService.checkPermission.mockResolvedValue(true);
      
      supabase.eq.mockResolvedValue({
        data: { id: 1, current_value: '0' },
        error: null
      });

      await SupabaseCouponService.markCouponAsUsed(1, mockUserId);
      
      // Verify permission check
      expect(RoleService.checkPermission).toHaveBeenCalledWith(
        mockUserId, 
        'editCoupon', 
        { couponId: 1 }
      );
      
      // Verify update call
      expect(supabase.from).toHaveBeenCalledWith('coupons');
      expect(supabase.update).toHaveBeenCalledTimes(1);
    });

    it('should not mark as used if user lacks permission', async () => {
      // Setup mocks
      RoleService.checkPermission.mockResolvedValue(false);

      const result = await SupabaseCouponService.markCouponAsUsed(1, mockUserId);
      
      // Should not attempt update
      expect(supabase.update).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('getCouponsByUser', () => {
    it('should fetch coupons for specific user', async () => {
      // Setup mocks
      supabase.from.mockReturnThis();
      supabase.select.mockReturnThis();
      supabase.eq.mockReturnThis();
      supabase.order.mockReturnValue({
        data: [
          { id: 1, retailer: 'Store 1', user_id: 'target-user-id' },
          { id: 2, retailer: 'Store 2', user_id: 'target-user-id' }
        ],
        error: null
      });

      // Manager requesting another user's coupons
      RoleService.checkPermission.mockResolvedValue(true);

      const result = await SupabaseCouponService.getCouponsByUser('target-user-id', mockUserId);
      
      expect(result.length).toBe(2);
      expect(supabase.eq).toHaveBeenCalledWith('user_id', 'target-user-id');
      expect(RoleService.checkPermission).toHaveBeenCalledWith(mockUserId, 'viewAnyCoupon');
    });

    it('should return empty array if requesting user lacks permission', async () => {
      // Regular user requesting another user's coupons
      RoleService.checkPermission.mockResolvedValue(false);

      const result = await SupabaseCouponService.getCouponsByUser('other-user-id', mockUserId);
      
      // Should not even attempt to query
      expect(supabase.from).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should allow users to view their own coupons', async () => {
      // Setup mocks
      supabase.from.mockReturnThis();
      supabase.select.mockReturnThis();
      supabase.eq.mockReturnThis();
      supabase.order.mockReturnValue({
        data: [
          { id: 1, retailer: 'Store 1', user_id: mockUserId }
        ],
        error: null
      });

      const result = await SupabaseCouponService.getCouponsByUser(mockUserId, mockUserId);
      
      expect(result.length).toBe(1);
      expect(supabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      // Should not check permissions for own resources
      expect(RoleService.checkPermission).not.toHaveBeenCalled();
    });
  });
}); 