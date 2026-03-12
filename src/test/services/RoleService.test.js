import { describe, it, expect, vi, beforeEach } from 'vitest';
import PocketBaseRoleService from '../../services/PocketBaseRoleService';
import PocketBaseClient from '../../services/PocketBaseClient';

// Mock the PocketBaseClient
vi.mock('../../services/PocketBaseClient', () => {
  const mockCollection = {
    getList: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  };

  const mockInstance = {
    collection: vi.fn(() => mockCollection),
    authStore: {
      record: null
    }
  };

  return {
    default: {
      getInstance: vi.fn(() => mockInstance)
    }
  };
});

// Mock the PocketBaseAuthService
vi.mock('../../services/PocketBaseAuthService', () => ({
  default: {
    getUser: vi.fn(() => null)
  }
}));

describe('PocketBaseRoleService', () => {
  let mockCollection;

  beforeEach(() => {
    vi.resetAllMocks();

    // Get the mocked collection instance
    const pbInstance = PocketBaseClient.getInstance();
    mockCollection = pbInstance.collection();
  });

  describe('getUserRole', () => {
    it('should return the user role when found', async () => {
      // Mock the PocketBase response
      mockCollection.getList.mockResolvedValue({
        items: [{
          userId: 'test-user-id',
          role: 'user'
        }],
        totalItems: 1
      });

      const result = await PocketBaseRoleService.getUserRole('test-user-id');

      expect(result).toBe('user');
      expect(mockCollection.getList).toHaveBeenCalledWith(1, 1,
        expect.objectContaining({ filter: "userId = 'test-user-id'" })
      );
    });

    it('should return null when user role is not found', async () => {
      // Mock the PocketBase response for no data
      mockCollection.getList.mockResolvedValue({
        items: [],
        totalItems: 0
      });

      const result = await PocketBaseRoleService.getUserRole('nonexistent-user-id');

      expect(result).toBeNull();
      expect(mockCollection.getList).toHaveBeenCalledWith(1, 1,
        expect.objectContaining({ filter: "userId = 'nonexistent-user-id'" })
      );
    });

    it('should handle errors gracefully', async () => {
      // Mock a PocketBase error
      mockCollection.getList.mockRejectedValue(new Error('Database error'));

      const result = await PocketBaseRoleService.getUserRole('test-user-id');

      expect(result).toBeNull();
    });

    it('should return null when userId is not provided', async () => {
      const result = await PocketBaseRoleService.getUserRole('');

      expect(result).toBeNull();
      expect(mockCollection.getList).not.toHaveBeenCalled();
    });
  });

  describe('setUserRole', () => {
    it('should set a new user role', async () => {
      // Mock the PocketBase responses
      mockCollection.getList.mockResolvedValueOnce({
        items: [],
        totalItems: 0
      });

      mockCollection.create.mockResolvedValue({
        id: 'role-id',
        userId: 'new-user-id',
        role: 'user'
      });

      const result = await PocketBaseRoleService.setUserRole('new-user-id', 'user');

      expect(result).toEqual({
        userId: 'new-user-id',
        role: 'user'
      });
      expect(mockCollection.create).toHaveBeenCalledWith(
        { userId: 'new-user-id', role: 'user' },
        expect.any(Object)
      );
    });

    it('should update an existing user role', async () => {
      // Mock the PocketBase responses
      mockCollection.getList.mockResolvedValueOnce({
        items: [{
          id: 'existing-role-id',
          userId: 'existing-user-id',
          role: 'user'
        }],
        totalItems: 1
      });

      // Mock second getList call for getting the record ID to update
      mockCollection.getList.mockResolvedValueOnce({
        items: [{
          id: 'existing-role-id',
          userId: 'existing-user-id',
          role: 'user'
        }],
        totalItems: 1
      });

      mockCollection.update.mockResolvedValue({
        id: 'existing-role-id',
        userId: 'existing-user-id',
        role: 'manager'
      });

      const result = await PocketBaseRoleService.setUserRole('existing-user-id', 'manager');

      expect(result).toEqual({
        userId: 'existing-user-id',
        role: 'manager'
      });
      expect(mockCollection.update).toHaveBeenCalledWith('existing-role-id', {
        userId: 'existing-user-id',
        role: 'manager',
        updated: expect.any(String)
      }, expect.any(Object));
    });

    it('should handle errors gracefully', async () => {
      // Mock a PocketBase error
      mockCollection.getList.mockRejectedValue(new Error('Database error'));

      const result = await PocketBaseRoleService.setUserRole('test-user-id', 'user');

      expect(result).toBeNull();
    });

    it('should return null when userId or role is not provided', async () => {
      const result1 = await PocketBaseRoleService.setUserRole('', 'user');
      const result2 = await PocketBaseRoleService.setUserRole('user-id', '');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(mockCollection.getList).not.toHaveBeenCalled();
    });
  });

  describe('checkPermission', () => {
    it('should return true for manager role with any permission', async () => {
      // Mock the getUserRole method
      mockCollection.getList.mockResolvedValue({
        items: [{
          userId: 'manager-user-id',
          role: 'manager'
        }],
        totalItems: 1
      });

      const result = await PocketBaseRoleService.checkPermission('manager-user-id', 'viewAnyCoupon');

      expect(result).toBe(true);
    });

    it('should return true for user role with viewOwnCoupons permission', async () => {
      // Mock the getUserRole method
      mockCollection.getList.mockResolvedValue({
        items: [{
          userId: 'user-id',
          role: 'user'
        }],
        totalItems: 1
      });

      const result = await PocketBaseRoleService.checkPermission('user-id', 'viewOwnCoupons');

      expect(result).toBe(true);
    });

    it('should return true for user role with createCoupon permission', async () => {
      // Mock the getUserRole method
      mockCollection.getList.mockResolvedValue({
        items: [{
          userId: 'user-id',
          role: 'user'
        }],
        totalItems: 1
      });

      const result = await PocketBaseRoleService.checkPermission('user-id', 'createCoupon');

      expect(result).toBe(true);
    });

    it('should return false for user role with other permissions', async () => {
      // Mock the getUserRole method
      mockCollection.getList.mockResolvedValue({
        items: [{
          userId: 'user-id',
          role: 'user'
        }],
        totalItems: 1
      });

      const result = await PocketBaseRoleService.checkPermission('user-id', 'viewAnyCoupon');

      expect(result).toBe(false);
    });

    it('should return false if user role is not found', async () => {
      // Mock the getUserRole method returning no role
      mockCollection.getList.mockResolvedValue({
        items: [],
        totalItems: 0
      });

      // When no role is found, service defaults to 'user' role which cannot viewAnyCoupon
      const result = await PocketBaseRoleService.checkPermission('unknown-user-id', 'viewAnyCoupon');

      expect(result).toBe(false);
    });

    it('should return false if userId is undefined', async () => {
      const result = await PocketBaseRoleService.checkPermission('', 'viewOwnCoupons');

      expect(result).toBe(false);
      expect(mockCollection.getList).not.toHaveBeenCalled();
    });
  });

  describe('isOwner', () => {
    it('should return true if user owns the coupon', async () => {
      // Mock the PocketBase response
      mockCollection.getOne.mockResolvedValue({
        id: 'coupon-1',
        userId: 'owner-user-id'
      });

      const result = await PocketBaseRoleService.isOwner('owner-user-id', 'coupon-1');

      expect(result).toBe(true);
      expect(mockCollection.getOne).toHaveBeenCalledWith('coupon-1', expect.any(Object));
    });

    it('should return false if user does not own the coupon', async () => {
      // Mock the PocketBase response
      mockCollection.getOne.mockResolvedValue({
        id: 'coupon-1',
        userId: 'different-user-id'
      });

      const result = await PocketBaseRoleService.isOwner('non-owner-user-id', 'coupon-1');

      expect(result).toBe(false);
    });

    it('should return false if coupon is not found', async () => {
      // Mock the PocketBase response for no data
      mockCollection.getOne.mockRejectedValue(new Error('Not found'));

      const result = await PocketBaseRoleService.isOwner('user-id', 'nonexistent-coupon-id');

      expect(result).toBe(false);
    });

    it('should return false if userId or couponId is undefined', async () => {
      const result1 = await PocketBaseRoleService.isOwner('', 'coupon-id');
      const result2 = await PocketBaseRoleService.isOwner('user-id', '');
      const result3 = await PocketBaseRoleService.isOwner('', '');

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
      expect(mockCollection.getOne).not.toHaveBeenCalled();
    });
  });

  describe('checkUserRole', () => {
    it('should return true if user has the required role', async () => {
      // Mock the getUserRole method
      mockCollection.getList.mockResolvedValue({
        items: [{
          userId: 'user-id',
          role: 'manager'
        }],
        totalItems: 1
      });

      const result = await PocketBaseRoleService.checkUserRole('user-id', 'manager');

      expect(result).toBe(true);
    });

    it('should return false if user does not have the required role', async () => {
      // Mock the getUserRole method
      mockCollection.getList.mockResolvedValue({
        items: [{
          userId: 'user-id',
          role: 'user'
        }],
        totalItems: 1
      });

      const result = await PocketBaseRoleService.checkUserRole('user-id', 'manager');

      expect(result).toBe(false);
    });

    it('should return false if user role is not found', async () => {
      // Mock the getUserRole method
      mockCollection.getList.mockResolvedValue({
        items: [],
        totalItems: 0
      });

      const result = await PocketBaseRoleService.checkUserRole('user-id', 'manager');

      expect(result).toBe(false);
    });
  });
});
