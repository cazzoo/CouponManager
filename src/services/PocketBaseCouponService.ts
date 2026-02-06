import PocketBase from 'pocketbase';
import PocketBaseClient from './PocketBaseClient';
import PocketBaseAuthService, { User } from './PocketBaseAuthService';
import PocketBaseRoleService, { Permissions } from './PocketBaseRoleService';
import { handlePocketBaseError } from './DatabaseError';
import { Coupon, CouponFormData, RetailerStat } from '../types';
import { ICouponService } from './CouponServiceFactory';

interface PocketBaseCoupon {
  id: string;
  retailer: string;
  initialValue: string;
  currentValue: string;
  expirationDate?: string | null;
  activationCode?: string | null;
  pin?: string | null;
  barcode?: string | null;
  reference?: string | null;
  notes?: string | null;
  userId: string;
  created: string;
  updated: string;
}

class PocketBaseCouponService implements ICouponService {
  private pb: PocketBase;
  private collectionName = 'coupons';

  constructor() {
    this.pb = PocketBaseClient.getInstance();
  }

  #mapToCoupon(pbCoupon: PocketBaseCoupon): Coupon {
    return {
      id: pbCoupon.id,
      userId: pbCoupon.userId,
      retailer: pbCoupon.retailer,
      initialValue: pbCoupon.initialValue,
      currentValue: pbCoupon.currentValue,
      expirationDate: pbCoupon.expirationDate || undefined,
      activationCode: pbCoupon.activationCode || undefined,
      pin: pbCoupon.pin || undefined,
      created_at: pbCoupon.created,
      updated_at: pbCoupon.updated,
      barcode: pbCoupon.barcode || undefined,
      reference: pbCoupon.reference || undefined,
      notes: pbCoupon.notes || undefined
    };
  }

  #mapToPBCoupon(coupon: Partial<Coupon>): Partial<PocketBaseCoupon> {
    const pbCoupon: Partial<PocketBaseCoupon> = {
      retailer: coupon.retailer || '',
      initialValue: coupon.initialValue || '',
      currentValue: coupon.currentValue || coupon.initialValue || '',
      expirationDate: coupon.expirationDate || null,
      activationCode: coupon.activationCode || null,
      pin: coupon.pin || null,
      barcode: coupon.barcode || null,
      reference: coupon.reference || null,
      notes: coupon.notes || null,
      updated: new Date().toISOString()
    };

    if (coupon.id) {
      pbCoupon.id = coupon.id;
    }

    if (coupon.userId) {
      pbCoupon.userId = coupon.userId;
    }

    return pbCoupon;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    try {
      const user = PocketBaseClient.getInstance().authStore.record as unknown as User;

      if (!user) {
        console.error('No authenticated user found');
        return [];
      }

      const canViewAll = await PocketBaseRoleService.hasPermission(Permissions.VIEW_ANY_COUPON);

      // Use single quotes for PocketBase filter syntax
      const filter = canViewAll ? '' : `userId = '${user.id}'`;

      const records = await this.pb.collection(this.collectionName).getList<PocketBaseCoupon>(1, 500, {
        filter: filter,
        sort: '-created',
        $cancelKey: 'getAllCoupons'
      });

      return records.items.map(item => this.#mapToCoupon(item));
    } catch (error) {
      console.error('Unexpected error fetching coupons:', error);
      handlePocketBaseError(error);
      return [];
    }
  }

  async addCoupon(coupon: CouponFormData, userId: string | null = null): Promise<Coupon> {
    try {
      const user = PocketBaseClient.getInstance().authStore.record as unknown as User;

      if (!userId && user) {
        userId = user.id;
      }

      if (!userId) {
        throw new Error('No authenticated user found and no userId provided');
      }

      const couponWithUser = {
        ...coupon,
        userId
      };

      const pbCoupon = this.#mapToPBCoupon(couponWithUser);

      const record = await this.pb.collection(this.collectionName).create<PocketBaseCoupon>(pbCoupon, {
        $cancelKey: 'addCoupon'
      });

      return this.#mapToCoupon(record);
    } catch (error) {
      console.error('Unexpected error adding coupon:', error);
      throw handlePocketBaseError(error);
    }
  }

  async updateCoupon(updatedCoupon: Partial<Coupon>): Promise<boolean> {
    try {
      if (!updatedCoupon.id) {
        throw new Error('Cannot update coupon without an ID');
      }

      const hasPermission = await PocketBaseRoleService.hasPermission(
        Permissions.EDIT_COUPON,
        { couponId: updatedCoupon.id }
      );

      if (!hasPermission) {
        console.error('User does not have permission to update this coupon');
        return false;
      }

      const pbCoupon = this.#mapToPBCoupon(updatedCoupon);

      await this.pb.collection(this.collectionName).update<PocketBaseCoupon>(
        updatedCoupon.id,
        pbCoupon,
        { $cancelKey: `updateCoupon-${updatedCoupon.id}` }
      );

      return true;
    } catch (error) {
      console.error('Unexpected error updating coupon:', error);
      throw handlePocketBaseError(error);
    }
  }

  async markCouponAsUsed(couponId: string): Promise<boolean> {
    try {
      const hasPermission = await PocketBaseRoleService.hasPermission(
        Permissions.EDIT_COUPON,
        { couponId }
      );

      if (!hasPermission) {
        console.error('User does not have permission to mark this coupon as used');
        return false;
      }

      await this.pb.collection(this.collectionName).update<PocketBaseCoupon>(couponId, {
        currentValue: '0',
        updated: new Date().toISOString()
      }, { $cancelKey: `markAsUsed-${couponId}` });

      return true;
    } catch (error) {
      console.error('Unexpected error marking coupon as used:', error);
      return false;
    }
  }

  async partiallyUseCoupon(couponId: string, amount: number): Promise<boolean> {
    try {
      const record = await this.pb.collection(this.collectionName).getOne<PocketBaseCoupon>(couponId, {
        $cancelKey: `getCouponForPartialUse-${couponId}`
      });

      const hasPermission = await PocketBaseRoleService.hasPermission(
        Permissions.EDIT_COUPON,
        { couponId, userId: record.userId }
      );

      if (!hasPermission) {
        console.error('User does not have permission to partially use this coupon');
        return false;
      }

      const currentValueNum = parseFloat(record.currentValue);
      const newValue = Math.max(0, currentValueNum - amount).toString();

      await this.pb.collection(this.collectionName).update<PocketBaseCoupon>(couponId, {
        currentValue: newValue,
        updated: new Date().toISOString()
      }, { $cancelKey: `partiallyUse-${couponId}` });

      return true;
    } catch (error) {
      console.error('Unexpected error partially using coupon:', error);
      return false;
    }
  }

  async getUniqueRetailers(): Promise<string[]> {
    try {
      const user = PocketBaseClient.getInstance().authStore.record as unknown as User;

      if (!user) {
        console.error('No authenticated user found');
        return [];
      }

      const canViewAll = await PocketBaseRoleService.hasPermission(Permissions.VIEW_ANY_COUPON);

      // Use single quotes for PocketBase filter syntax
      const filter = canViewAll ? '' : `userId = '${user.id}'`;

      const records = await this.pb.collection(this.collectionName).getList<PocketBaseCoupon>(1, 500, {
        filter: filter,
        fields: 'retailer',
        $cancelKey: 'getUniqueRetailers'
      });

      const retailers = records.items.map(item => item.retailer);
      return [...new Set(retailers)];
    } catch (error) {
      console.error('Unexpected error fetching retailers:', error);
      return [];
    }
  }

  async getRetailerStats(): Promise<RetailerStat[]> {
    try {
      const coupons = await this.getAllCoupons();
      const retailerMap = new Map<string, RetailerStat>();

      const uniqueRetailers = [...new Set(coupons.map(coupon => coupon.retailer))];
      uniqueRetailers.forEach(name => {
        retailerMap.set(name, {
          name,
          couponCount: 0,
          totalValue: 0,
          activeCouponCount: 0,
          activeTotalValue: 0,
          expiredCouponCount: 0,
          expiredTotalValue: 0
        });
      });

      const now = new Date();
      coupons.forEach(coupon => {
        const retailer = retailerMap.get(coupon.retailer);
        if (!retailer) return;

        const value = parseFloat(coupon.currentValue);
        const expirationDate = coupon.expirationDate ? new Date(coupon.expirationDate) : null;
        const isExpired = expirationDate ? expirationDate < now : false;

        retailer.couponCount++;
        retailer.totalValue += value;

        if (isExpired) {
          retailer.expiredCouponCount++;
          retailer.expiredTotalValue += value;
        } else {
          retailer.activeCouponCount++;
          retailer.activeTotalValue += value;
        }
      });

      return Array.from(retailerMap.values());
    } catch (error) {
      console.error('Unexpected error calculating retailer stats:', error);
      return [];
    }
  }
}

export default new PocketBaseCouponService();