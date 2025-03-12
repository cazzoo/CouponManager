import { Coupon, CouponFormData, RetailerStat } from '../types';
import { ICouponService } from './CouponServiceFactory';
import { v4 as uuidv4 } from 'uuid';

class CouponService implements ICouponService {
  private coupons: Coupon[];

  constructor() {
    this.coupons = [
      {
        id: '1',
        userId: 'demo',
        retailer: 'Amazon',
        initialValue: '50',
        currentValue: '50',
        expirationDate: '2024-12-31',
        activationCode: 'AMZN2024',
        pin: '1234'
      },
      {
        id: '2',
        userId: 'demo',
        retailer: 'Amazon',
        initialValue: '100',
        currentValue: '100',
        expirationDate: '2024-06-30',
        activationCode: 'AMZN100SUMMER',
        pin: '5678'
      },
      {
        id: '3',
        userId: 'demo',
        retailer: 'Amazon',
        initialValue: '25',
        currentValue: '25',
        expirationDate: '2024-03-15',
        activationCode: 'AMZN25SPRING',
        pin: '9012'
      },
      {
        id: '4',
        userId: 'demo',
        retailer: 'Target',
        initialValue: '75',
        currentValue: '75',
        expirationDate: '2024-09-30',
        activationCode: 'TGT75FALL',
        pin: '4321'
      },
      {
        id: '5',
        userId: 'demo',
        retailer: 'Target',
        initialValue: '150',
        currentValue: '150',
        expirationDate: '2024-08-15',
        activationCode: 'TGT150AUG',
        pin: '7890'
      }
    ];
  }

  async getAllCoupons(): Promise<Coupon[]> {
    // In a real app, this would be an API call
    return Promise.resolve([...this.coupons]);
  }

  async addCoupon(coupon: CouponFormData, userId: string | null = null): Promise<Coupon> {
    // In a real app, this would be an API call
    const newCoupon: Coupon = {
      id: uuidv4(),
      userId: userId || 'anonymous',
      retailer: coupon.retailer,
      initialValue: coupon.initialValue,
      currentValue: coupon.currentValue || coupon.initialValue,
      expirationDate: coupon.expirationDate,
      notes: coupon.notes,
      barcode: coupon.barcode,
      reference: coupon.reference,
      activationCode: coupon.activationCode,
      pin: coupon.pin,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.coupons.push(newCoupon);
    return Promise.resolve(newCoupon);
  }

  async updateCoupon(updatedCoupon: Partial<Coupon>): Promise<boolean> {
    // In a real app, this would be an API call
    const index = this.coupons.findIndex(coupon => coupon.id === updatedCoupon.id);
    
    if (index >= 0) {
      this.coupons[index] = {
        ...this.coupons[index],
        ...updatedCoupon,
        updated_at: new Date().toISOString()
      };
      return Promise.resolve(true);
    }
    
    return Promise.resolve(false);
  }

  async markCouponAsUsed(couponId: string): Promise<boolean> {
    // In a real app, this would be an API call
    return this.updateCoupon({ id: couponId, currentValue: '0' });
  }

  async partiallyUseCoupon(couponId: string, amount: number): Promise<boolean> {
    // In a real app, this would be an API call
    const coupon = this.coupons.find(c => c.id === couponId);
    
    if (!coupon) {
      return Promise.resolve(false);
    }
    
    // Convert current value to number, subtract the used amount
    const currentValueNum = parseFloat(coupon.currentValue);
    const newValue = Math.max(0, currentValueNum - amount).toString();
    
    // Update the coupon with the new value
    return this.updateCoupon({
      id: couponId,
      currentValue: newValue
    });
  }

  async getUniqueRetailers(): Promise<string[]> {
    const retailers = this.coupons.map(coupon => coupon.retailer);
    return Promise.resolve([...new Set(retailers)]);
  }

  async getRetailerStats(): Promise<RetailerStat[]> {
    const retailerMap = new Map<string, RetailerStat>();
    
    // Initialize with empty stats for each unique retailer
    const uniqueRetailers = [...new Set(this.coupons.map(coupon => coupon.retailer))];
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
    
    // Calculate stats for each coupon
    const now = new Date();
    this.coupons.forEach(coupon => {
      const retailer = retailerMap.get(coupon.retailer);
      if (!retailer) return;
      
      const value = parseFloat(coupon.currentValue);
      const expirationDate = coupon.expirationDate ? new Date(coupon.expirationDate) : null;
      const isExpired = expirationDate ? expirationDate < now : false;
      
      // Update total stats
      retailer.couponCount++;
      retailer.totalValue += value;
      
      // Update active/expired stats
      if (isExpired) {
        retailer.expiredCouponCount++;
        retailer.expiredTotalValue += value;
      } else {
        retailer.activeCouponCount++;
        retailer.activeTotalValue += value;
      }
    });
    
    return Promise.resolve(Array.from(retailerMap.values()));
  }
}

export default new CouponService(); 