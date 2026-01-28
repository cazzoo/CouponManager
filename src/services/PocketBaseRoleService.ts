import PocketBaseClient from './PocketBaseClient';
import PocketBaseAuthService from './PocketBaseAuthService';
import { handlePocketBaseError } from './DatabaseError';
import { IRoleService } from './RoleServiceFactory';

interface PocketBaseUserRole {
  id: string;
  userId: string;
  role: string;
  created: string;
  updated: string;
}

class PocketBaseRoleService implements IRoleService {
  private pb: PocketBase;
  private collectionName = 'user_roles';

  static Roles = {
    USER: 'user',
    MANAGER: 'manager',
    DEMO_USER: 'demo'
  };

  static Permissions = {
    VIEW_OWN_COUPONS: 'viewOwnCoupons',
    VIEW_ANY_COUPON: 'viewAnyCoupon',
    CREATE_COUPON: 'createCoupon',
    EDIT_COUPON: 'editCoupon',
    DELETE_COUPON: 'deleteCoupon',
    VIEW_USERS: 'viewUsers',
    EDIT_USER_ROLE: 'editUserRole',
    MANAGE_SYSTEM: 'manageSystem'
  };

  constructor() {
    this.pb = PocketBaseClient.getInstance();
  }

  async getUserRole(userId: string): Promise<string | null> {
    if (!userId) return null;

    try {
      const filter = `userId = "${userId}"`;
      const records = await this.pb.collection(this.collectionName).getList<PocketBaseUserRole>(1, 1, {
        filter: filter
      });

      if (records.items.length === 0) {
        return null;
      }

      return records.items[0].role;
    } catch (error) {
      console.error('Unexpected error fetching user role:', error);
      return null;
    }
  }

  async setUserRole(userId: string, role: string): Promise<{ userId: string; role: string } | null> {
    if (!userId || !role) {
      console.error('Invalid parameters for setUserRole');
      return null;
    }

    try {
      const existingRole = await this.getUserRole(userId);

      let result: PocketBaseUserRole;

      if (existingRole) {
        console.log(`Updating role for user ${userId} to ${role}`);

        const filter = `userId = "${userId}"`;
        const records = await this.pb.collection(this.collectionName).getList<PocketBaseUserRole>(1, 1, {
          filter: filter
        });

        if (records.items.length > 0) {
          result = await this.pb.collection(this.collectionName).update<PocketBaseUserRole>(
            records.items[0].id,
            {
              userId,
              role,
              updated: new Date().toISOString()
            }
          );
        } else {
          return null;
        }
      } else {
        console.log(`Creating new role for user ${userId}: ${role}`);

        result = await this.pb.collection(this.collectionName).create<PocketBaseUserRole>({
          userId,
          role
        });
      }

      return {
        userId: result.userId,
        role: result.role
      };
    } catch (error) {
      console.error('Unexpected error setting user role:', error);
      return null;
    }
  }

  async hasPermission(permission: string, context: Record<string, any> = {}): Promise<boolean> {
    try {
      const user = PocketBaseAuthService.getUser();

      if (!user) {
        return false;
      }

      return this.checkPermission(user.id, permission, context);
    } catch (error) {
      console.error('Error in hasPermission:', error);
      return false;
    }
  }

  async checkPermission(userId: string, permission: string, context: Record<string, any> = {}): Promise<boolean> {
    if (!userId) return false;

    try {
      const userRole = await this.getUserRole(userId);

      console.log(`Checking permission ${permission} for user ${userId} with role ${userRole || 'no role'}`);

      if (!userRole) return false;

      if (userRole === PocketBaseRoleService.Roles.MANAGER) {
        return true;
      }

      switch (userRole) {
        case PocketBaseRoleService.Roles.USER:
          if (permission === PocketBaseRoleService.Permissions.VIEW_OWN_COUPONS ||
              permission === PocketBaseRoleService.Permissions.CREATE_COUPON) {
            return true;
          }

          if ((permission === PocketBaseRoleService.Permissions.EDIT_COUPON || 
               permission === PocketBaseRoleService.Permissions.DELETE_COUPON) && 
              context.couponId) {
            return await this.isOwner(userId, context.couponId);
          }

          return false;

        case PocketBaseRoleService.Roles.DEMO_USER:
          return permission === PocketBaseRoleService.Permissions.VIEW_OWN_COUPONS;

        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  async isOwner(userId: string, couponId: string): Promise<boolean> {
    if (!userId || !couponId) return false;

    try {
      const record = await this.pb.collection('coupons').getOne<{ userId: string }>(couponId);

      return record.userId === userId;
    } catch (error) {
      console.error('Unexpected error checking ownership:', error);
      return false;
    }
  }

  async checkUserRole(userId: string, requiredRole: string): Promise<boolean> {
    const userRole = await this.getUserRole(userId);
    return userRole === requiredRole;
  }

  async updateUserRole(userId: string, newRole: string): Promise<boolean> {
    try {
      const currentUser = PocketBaseAuthService.getUser();

      if (!currentUser) {
        return false;
      }

      const canEditRoles = await this.hasPermission(PocketBaseRoleService.Permissions.EDIT_USER_ROLE);

      if (!canEditRoles) {
        console.error('Current user does not have permission to edit roles');
        return false;
      }

      const result = await this.setUserRole(userId, newRole);
      return !!result;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }
}

export const { Roles, Permissions } = PocketBaseRoleService;

export default new PocketBaseRoleService();