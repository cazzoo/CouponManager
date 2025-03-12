import { describe, it, expect, vi, beforeEach } from 'vitest';
import RoleService from '../../services/RoleService';
import { supabase } from '../../services/supabaseClient';

// Mock the Supabase client
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => supabase),
    select: vi.fn(() => supabase),
    insert: vi.fn(() => supabase),
    update: vi.fn(() => supabase),
    delete: vi.fn(() => supabase),
    eq: vi.fn(() => supabase),
    single: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('RoleService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getUserRole', () => {
    it('should return the user role when found', async () => {
      // Mock the Supabase response
      supabase.single.mockResolvedValue({
        data: { 
          user_id: 'test-user-id',
          role: 'user'
        },
        error: null
      });

      const result = await RoleService.getUserRole('test-user-id');
      
      expect(result).toBe('user');
      expect(supabase.from).toHaveBeenCalledWith('user_roles');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
    });

    it('should return null when user role is not found', async () => {
      // Mock the Supabase response for no data
      supabase.single.mockResolvedValue({
        data: null,
        error: { message: 'No data found' }
      });

      const result = await RoleService.getUserRole('nonexistent-user-id');
      
      expect(result).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('user_roles');
    });

    it('should handle errors gracefully', async () => {
      // Mock a Supabase error
      supabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await RoleService.getUserRole('test-user-id');
      
      expect(result).toBeNull();
    });
  });

  describe('setUserRole', () => {
    it('should set a new user role', async () => {
      // Mock the Supabase responses
      supabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'No data found' }
      });

      supabase.single.mockResolvedValueOnce({
        data: { 
          user_id: 'new-user-id',
          role: 'user'
        },
        error: null
      });

      const result = await RoleService.setUserRole('new-user-id', 'user');
      
      expect(result).toEqual({
        userId: 'new-user-id',
        role: 'user'
      });
      
      expect(supabase.from).toHaveBeenCalledWith('user_roles');
      expect(supabase.insert).toHaveBeenCalledWith({
        user_id: 'new-user-id',
        role: 'user'
      });
    });

    it('should update an existing user role', async () => {
      // Mock the Supabase responses
      supabase.single.mockResolvedValueOnce({
        data: { 
          user_id: 'existing-user-id',
          role: 'user'
        },
        error: null
      });

      supabase.single.mockResolvedValueOnce({
        data: { 
          user_id: 'existing-user-id',
          role: 'manager'
        },
        error: null
      });

      const result = await RoleService.setUserRole('existing-user-id', 'manager');
      
      expect(result).toEqual({
        userId: 'existing-user-id',
        role: 'manager'
      });
      
      expect(supabase.from).toHaveBeenCalledWith('user_roles');
      expect(supabase.update).toHaveBeenCalledWith({
        role: 'manager'
      });
    });

    it('should handle errors gracefully', async () => {
      // Mock a Supabase error
      supabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await RoleService.setUserRole('test-user-id', 'user');
      
      expect(result).toBeNull();
    });
  });

  describe('checkPermission', () => {
    it('should return true for manager role with any permission', async () => {
      // Mock the getUserRole method
      const getUserRoleSpy = vi.spyOn(RoleService, 'getUserRole');
      getUserRoleSpy.mockResolvedValue('manager');

      const result = await RoleService.checkPermission('manager-user-id', 'viewAnyCoupon');
      
      expect(result).toBe(true);
      expect(getUserRoleSpy).toHaveBeenCalledWith('manager-user-id');
    });

    it('should return true for user role with viewOwnCoupons permission', async () => {
      // Mock the getUserRole method
      const getUserRoleSpy = vi.spyOn(RoleService, 'getUserRole');
      getUserRoleSpy.mockResolvedValue('user');

      const result = await RoleService.checkPermission('user-id', 'viewOwnCoupons');
      
      expect(result).toBe(true);
      expect(getUserRoleSpy).toHaveBeenCalledWith('user-id');
    });

    it('should return false for user role with other permissions', async () => {
      // Mock the getUserRole method
      const getUserRoleSpy = vi.spyOn(RoleService, 'getUserRole');
      getUserRoleSpy.mockResolvedValue('user');

      const result = await RoleService.checkPermission('user-id', 'viewAnyCoupon');
      
      expect(result).toBe(false);
      expect(getUserRoleSpy).toHaveBeenCalledWith('user-id');
    });

    it('should return false if user role is not found', async () => {
      // Mock the getUserRole method
      const getUserRoleSpy = vi.spyOn(RoleService, 'getUserRole');
      getUserRoleSpy.mockResolvedValue(null);

      const result = await RoleService.checkPermission('unknown-user-id', 'viewOwnCoupons');
      
      expect(result).toBe(false);
      expect(getUserRoleSpy).toHaveBeenCalledWith('unknown-user-id');
    });

    it('should return false if userId is undefined', async () => {
      const result = await RoleService.checkPermission(undefined, 'viewOwnCoupons');
      
      expect(result).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('should return true if user owns the coupon', async () => {
      // Mock the Supabase response
      supabase.single.mockResolvedValue({
        data: { 
          id: 'coupon-1',
          user_id: 'owner-user-id'
        },
        error: null
      });

      const result = await RoleService.isOwner('owner-user-id', 'coupon-1');
      expect(result).toBe(true);
      
      expect(supabase.from).toHaveBeenCalledWith('coupons');
      expect(supabase.select).toHaveBeenCalledWith('user_id');
      expect(supabase.eq).toHaveBeenCalledWith('id', 'coupon-1');
    });

    it('should return false if user does not own the coupon', async () => {
      // Mock the Supabase response
      supabase.single.mockResolvedValue({
        data: { 
          id: 'coupon-1',
          user_id: 'different-user-id'
        },
        error: null
      });

      const result = await RoleService.isOwner('non-owner-user-id', 'coupon-1');
      expect(result).toBe(false);
    });

    it('should return false if coupon is not found', async () => {
      // Mock the Supabase response for no data
      supabase.single.mockResolvedValue({
        data: null,
        error: { message: 'No data found' }
      });

      const result = await RoleService.isOwner('user-id', 'nonexistent-coupon-id');
      expect(result).toBe(false);
    });

    it('should return false if userId or couponId is undefined', async () => {
      const result1 = await RoleService.isOwner(undefined, 'coupon-id');
      const result2 = await RoleService.isOwner('user-id', undefined);
      const result3 = await RoleService.isOwner(undefined, undefined);
      
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });
  });
}); 