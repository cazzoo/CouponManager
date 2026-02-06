/**
 * Unit tests for PocketBaseRoleService
 * Tests permission logic, role checking, and ownership verification
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

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

// Import after mocking
import PocketBaseClient from '../../services/PocketBaseClient';
import PocketBaseRoleServiceClass from '../../services/PocketBaseRoleService';
import { Roles, Permissions } from '../../services/PocketBaseRoleService';

// Get mock instance for use in tests
const mockPocketBase = PocketBaseClient.getInstance() as any;

describe('PocketBaseRoleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset auth store record
    mockPocketBase.authStore.record = null;
  });

  describe('getUserRole', () => {
    it('should return role from user auth record when available', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user'
      };
      mockPocketBase.authStore.record = mockUser;

      // Act
      const role = await PocketBaseRoleServiceClass.getUserRole('user-123');

      // Assert
      expect(role).toBe('user');
    });

    it('should fetch role from collection when not in auth record', async () => {
      // Arrange
      mockPocketBase.authStore.record = { id: 'user-123' };
      const mockRecords = {
        items: [{ id: 'role-1', userId: 'user-123', role: 'manager' }]
      };
      const mockCollection = {
        getList: vi.fn().mockResolvedValue(mockRecords)
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const role = await PocketBaseRoleServiceClass.getUserRole('user-123');

      // Assert
      expect(role).toBe('manager');
      expect(mockPocketBase.collection).toHaveBeenCalledWith('user_roles');
    });

    it('should return null when user has no role', async () => {
      // Arrange
      mockPocketBase.authStore.record = null;
      const mockRecords = { items: [] };
      const mockCollection = {
        getList: vi.fn().mockResolvedValue(mockRecords)
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const role = await PocketBaseRoleServiceClass.getUserRole('user-123');

      // Assert
      expect(role).toBeNull();
    });

    it('should return null when userId is empty', async () => {
      // Act
      const role = await PocketBaseRoleServiceClass.getUserRole('');

      // Assert
      expect(role).toBeNull();
    });

    it('should handle errors gracefully and return null', async () => {
      // Arrange
      mockPocketBase.authStore.record = null;
      const mockCollection = {
        getList: vi.fn().mockRejectedValue(new Error('Database error'))
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const role = await PocketBaseRoleServiceClass.getUserRole('user-123');

      // Assert
      expect(role).toBeNull();
    });
  });

  describe('setUserRole', () => {
    it('should create new role when user has no existing role', async () => {
      // Arrange
      const mockCollection = {
        getList: vi.fn().mockResolvedValue({ items: [] }),
        create: vi.fn().mockResolvedValue({
          id: 'role-1',
          userId: 'user-123',
          role: 'manager'
        })
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);
      mockPocketBase.authStore.record = null;

      // Act
      const result = await PocketBaseRoleServiceClass.setUserRole('user-123', 'manager');

      // Assert
      expect(result).toEqual({ userId: 'user-123', role: 'manager' });
      expect(mockCollection.create).toHaveBeenCalled();
    });

    it('should update existing role when user already has one', async () => {
      // Arrange
      const existingRole = { id: 'role-1', userId: 'user-123', role: 'user' };
      const updatedRole = { id: 'role-1', userId: 'user-123', role: 'manager' };
      const mockCollection = {
        getList: vi.fn().mockResolvedValue({ items: [existingRole] }),
        update: vi.fn().mockResolvedValue(updatedRole)
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);
      mockPocketBase.authStore.record = null;

      // Act
      const result = await PocketBaseRoleServiceClass.setUserRole('user-123', 'manager');

      // Assert
      expect(result).toEqual({ userId: 'user-123', role: 'manager' });
      expect(mockCollection.update).toHaveBeenCalledWith('role-1', expect.anything(), expect.anything());
    });

    it('should return null when parameters are invalid', async () => {
      // Act & Assert
      expect(await PocketBaseRoleServiceClass.setUserRole('', 'manager')).toBeNull();
      expect(await PocketBaseRoleServiceClass.setUserRole('user-123', '')).toBeNull();
    });

    it('should handle errors gracefully and return null', async () => {
      // Arrange
      const mockCollection = {
        getList: vi.fn().mockRejectedValue(new Error('Database error'))
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);
      mockPocketBase.authStore.record = null;

      // Act
      const result = await PocketBaseRoleServiceClass.setUserRole('user-123', 'manager');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('hasPermission', () => {
    it('should return false when no user is authenticated', async () => {
      // Arrange
      mockPocketBase.authStore.record = null;

      // Act
      const hasPermission = await PocketBaseRoleServiceClass.hasPermission(Permissions.VIEW_OWN_COUPONS);

      // Assert
      expect(hasPermission).toBe(false);
    });

    it('should delegate to checkPermission when user is authenticated', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user'
      };
      mockPocketBase.authStore.record = mockUser;

      // Act
      const hasPermission = await PocketBaseRoleServiceClass.hasPermission(Permissions.VIEW_OWN_COUPONS);

      // Assert
      expect(hasPermission).toBe(true);
    });

    it('should handle errors gracefully and return false', async () => {
      // Arrange
      mockPocketBase.authStore.record = { id: 'user-123', role: 'invalid' };

      // Act
      const hasPermission = await PocketBaseRoleServiceClass.hasPermission(Permissions.EDIT_COUPON);

      // Assert
      expect(hasPermission).toBe(false);
    });
  });

  describe('checkPermission', () => {
    describe('Demo User Permissions', () => {
      beforeEach(() => {
        mockPocketBase.authStore.record = {
          id: 'demo-123',
          email: 'demo@example.com',
          role: Roles.DEMO_USER
        };
      });

      it('should allow VIEW_OWN_COUPONS permission', async () => {
        // Act
        const hasPermission = await PocketBaseRoleServiceClass.checkPermission('demo-123', Permissions.VIEW_OWN_COUPONS);

        // Assert
        expect(hasPermission).toBe(true);
      });

      it('should deny CREATE_COUPON permission', async () => {
        // Act
        const hasPermission = await PocketBaseRoleServiceClass.checkPermission('demo-123', Permissions.CREATE_COUPON);

        // Assert
        expect(hasPermission).toBe(false);
      });

      it('should deny EDIT_COUPON permission', async () => {
        // Act
        const hasPermission = await PocketBaseRoleServiceClass.checkPermission('demo-123', Permissions.EDIT_COUPON);

        // Assert
        expect(hasPermission).toBe(false);
      });

      it('should deny DELETE_COUPON permission', async () => {
        // Act
        const hasPermission = await PocketBaseRoleServiceClass.checkPermission('demo-123', Permissions.DELETE_COUPON);

        // Assert
        expect(hasPermission).toBe(false);
      });

      it('should deny VIEW_ANY_COUPON permission', async () => {
        // Act
        const hasPermission = await PocketBaseRoleServiceClass.checkPermission('demo-123', Permissions.VIEW_ANY_COUPON);

        // Assert
        expect(hasPermission).toBe(false);
      });
    });

    describe('Regular User Permissions', () => {
      beforeEach(() => {
        mockPocketBase.authStore.record = {
          id: 'user-123',
          email: 'user@example.com',
          role: Roles.USER
        };
      });

      it('should allow VIEW_OWN_COUPONS permission', async () => {
        // Act
        const hasPermission = await PocketBaseRoleServiceClass.checkPermission('user-123', Permissions.VIEW_OWN_COUPONS);

        // Assert
        expect(hasPermission).toBe(true);
      });

      it('should allow CREATE_COUPON permission', async () => {
        // Act
        const hasPermission = await PocketBaseRoleServiceClass.checkPermission('user-123', Permissions.CREATE_COUPON);

        // Assert
        expect(hasPermission).toBe(true);
      });

      it('should allow EDIT_COUPON permission in general', async () => {
        // Act
        const hasPermission = await PocketBaseRoleServiceClass.checkPermission('user-123', Permissions.EDIT_COUPON);

        // Assert
        expect(hasPermission).toBe(true);
      });

      it('should allow DELETE_COUPON permission in general', async () => {
        // Act
        const hasPermission = await PocketBaseRoleServiceClass.checkPermission('user-123', Permissions.DELETE_COUPON);

        // Assert
        expect(hasPermission).toBe(true);
      });

      it('should deny VIEW_ANY_COUPON permission', async () => {
        // Act
        const hasPermission = await PocketBaseRoleServiceClass.checkPermission('user-123', Permissions.VIEW_ANY_COUPON);

        // Assert
        expect(hasPermission).toBe(false);
      });

      it('should deny EDIT_USER_ROLE permission', async () => {
        // Act
        const hasPermission = await PocketBaseRoleServiceClass.checkPermission('user-123', Permissions.EDIT_USER_ROLE);

        // Assert
        expect(hasPermission).toBe(false);
      });
    });

    describe('Manager Permissions', () => {
      beforeEach(() => {
        mockPocketBase.authStore.record = {
          id: 'manager-123',
          email: 'manager@example.com',
          role: Roles.MANAGER
        };
      });

      it('should allow all permissions', async () => {
        // Arrange
        const allPermissions = [
          Permissions.VIEW_OWN_COUPONS,
          Permissions.VIEW_ANY_COUPON,
          Permissions.CREATE_COUPON,
          Permissions.EDIT_COUPON,
          Permissions.DELETE_COUPON,
          Permissions.VIEW_USERS,
          Permissions.EDIT_USER_ROLE,
          Permissions.MANAGE_SYSTEM
        ];

        // Act & Assert
        for (const permission of allPermissions) {
          const hasPermission = await PocketBaseRoleServiceClass.checkPermission('manager-123', permission);
          expect(hasPermission).toBe(true);
        }
      });
    });

    describe('Default User Behavior', () => {
      it('should default to user role when no role found', async () => {
        // Arrange
        mockPocketBase.authStore.record = { id: 'user-456' };
        const mockCollection = {
          getList: vi.fn().mockResolvedValue({ items: [] })
        };
        mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

        // Act
        const hasPermission = await PocketBaseRoleServiceClass.checkPermission('user-456', Permissions.VIEW_OWN_COUPONS);

        // Assert
        expect(hasPermission).toBe(true);
      });
    });
  });

  describe('isOwner', () => {
    it('should return true when user owns the coupon', async () => {
      // Arrange
      const mockRecord = { userId: 'user-123' };
      const mockCollection = {
        getOne: vi.fn().mockResolvedValue(mockRecord)
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const isOwner = await PocketBaseRoleServiceClass.isOwner('user-123', 'coupon-123');

      // Assert
      expect(isOwner).toBe(true);
      expect(mockCollection.getOne).toHaveBeenCalledWith('coupon-123', expect.anything());
    });

    it('should return false when user does not own the coupon', async () => {
      // Arrange
      const mockRecord = { userId: 'user-456' };
      const mockCollection = {
        getOne: vi.fn().mockResolvedValue(mockRecord)
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const isOwner = await PocketBaseRoleServiceClass.isOwner('user-123', 'coupon-123');

      // Assert
      expect(isOwner).toBe(false);
    });

    it('should return false when parameters are empty', async () => {
      // Act & Assert
      expect(await PocketBaseRoleServiceClass.isOwner('', 'coupon-123')).toBe(false);
      expect(await PocketBaseRoleServiceClass.isOwner('user-123', '')).toBe(false);
    });

    it('should handle errors gracefully and return false', async () => {
      // Arrange
      const mockCollection = {
        getOne: vi.fn().mockRejectedValue(new Error('Database error'))
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const isOwner = await PocketBaseRoleServiceClass.isOwner('user-123', 'coupon-123');

      // Assert
      expect(isOwner).toBe(false);
    });
  });

  describe('checkUserRole', () => {
    it('should return true when user has the required role', async () => {
      // Arrange
      mockPocketBase.authStore.record = { id: 'user-123', role: 'manager' };

      // Act
      const hasRole = await PocketBaseRoleServiceClass.checkUserRole('user-123', 'manager');

      // Assert
      expect(hasRole).toBe(true);
    });

    it('should return false when user has a different role', async () => {
      // Arrange
      mockPocketBase.authStore.record = { id: 'user-123', role: 'user' };

      // Act
      const hasRole = await PocketBaseRoleServiceClass.checkUserRole('user-123', 'manager');

      // Assert
      expect(hasRole).toBe(false);
    });
  });

  describe('updateUserRole', () => {
    it('should update role when user has EDIT_USER_ROLE permission', async () => {
      // Arrange
      const mockUser = {
        id: 'manager-123',
        email: 'manager@example.com',
        role: Roles.MANAGER
      };
      mockPocketBase.authStore.record = mockUser;

      const mockCollection = {
        getList: vi.fn().mockResolvedValue({ items: [] }),
        create: vi.fn().mockResolvedValue({
          id: 'role-1',
          userId: 'user-123',
          role: Roles.DEMO_USER
        })
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const result = await PocketBaseRoleServiceClass.updateUserRole('user-123', Roles.DEMO_USER);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when no user is authenticated', async () => {
      // Arrange
      mockPocketBase.authStore.record = null;

      // Act
      const result = await PocketBaseRoleServiceClass.updateUserRole('user-123', Roles.MANAGER);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when user lacks EDIT_USER_ROLE permission', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: Roles.USER
      };
      mockPocketBase.authStore.record = mockUser;

      // Act
      const result = await PocketBaseRoleServiceClass.updateUserRole('user-456', Roles.MANAGER);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle errors gracefully and return false', async () => {
      // Arrange
      const mockUser = {
        id: 'manager-123',
        email: 'manager@example.com',
        role: Roles.MANAGER
      };
      mockPocketBase.authStore.record = mockUser;

      const mockCollection = {
        getList: vi.fn().mockRejectedValue(new Error('Database error'))
      };
      mockPocketBase.collection = vi.fn().mockReturnValue(mockCollection);

      // Act
      const result = await PocketBaseRoleServiceClass.updateUserRole('user-123', Roles.MANAGER);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Role and Permission Constants', () => {
    it('should have correct role constants', () => {
      // Assert
      expect(Roles.USER).toBe('user');
      expect(Roles.MANAGER).toBe('manager');
      expect(Roles.DEMO_USER).toBe('demo');
    });

    it('should have all required permission constants', () => {
      // Assert
      expect(Permissions.VIEW_OWN_COUPONS).toBe('viewOwnCoupons');
      expect(Permissions.VIEW_ANY_COUPON).toBe('viewAnyCoupon');
      expect(Permissions.CREATE_COUPON).toBe('createCoupon');
      expect(Permissions.EDIT_COUPON).toBe('editCoupon');
      expect(Permissions.DELETE_COUPON).toBe('deleteCoupon');
      expect(Permissions.VIEW_USERS).toBe('viewUsers');
      expect(Permissions.EDIT_USER_ROLE).toBe('editUserRole');
      expect(Permissions.MANAGE_SYSTEM).toBe('manageSystem');
    });
  });
});
