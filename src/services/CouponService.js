class CouponService {
  constructor() {
    this.coupons = [
      {
        id: 1,
        retailer: 'Amazon',
        initialValue: '50',
        currentValue: '50',
        expirationDate: new Date('2024-12-31'),
        activationCode: 'AMZN2024',
        pin: '1234'
      },
      {
        id: 2,
        retailer: 'Amazon',
        initialValue: '100',
        currentValue: '100',
        expirationDate: new Date('2024-06-30'),
        activationCode: 'AMZN100SUMMER',
        pin: '5678'
      },
      {
        id: 3,
        retailer: 'Amazon',
        initialValue: '25',
        currentValue: '25',
        expirationDate: new Date('2024-03-15'),
        activationCode: 'AMZN25SPRING',
        pin: '9012'
      },
      {
        id: 4,
        retailer: 'Target',
        initialValue: '75',
        currentValue: '75',
        expirationDate: new Date('2024-09-30'),
        activationCode: 'TGT75FALL',
        pin: '4321'
      },
      {
        id: 5,
        retailer: 'Target',
        initialValue: '150',
        currentValue: '150',
        expirationDate: new Date('2024-08-15'),
        activationCode: 'TGT150AUG',
        pin: '7890'
      },
      {
        id: 6,
        retailer: 'Best Buy',
        initialValue: '200',
        currentValue: '200',
        expirationDate: new Date('2024-11-25'),
        activationCode: 'BB200NOV',
        pin: '2468'
      },
      {
        id: 7,
        retailer: 'Best Buy',
        initialValue: '50',
        currentValue: '50',
        expirationDate: new Date('2024-07-04'),
        activationCode: 'BB50JULY',
        pin: '1357'
      },
      {
        id: 8,
        retailer: 'Walmart',
        initialValue: '100',
        currentValue: '100',
        expirationDate: new Date('2024-05-01'),
        activationCode: 'WMT100MAY',
        pin: '9876'
      },
      {
        id: 9,
        retailer: 'Walmart',
        initialValue: '25',
        currentValue: '25',
        expirationDate: new Date('2024-10-15'),
        activationCode: 'WMT25OCT',
        pin: '6543'
      },
      {
        id: 10,
        retailer: 'Nike',
        initialValue: '75',
        currentValue: '75',
        expirationDate: new Date('2024-04-20'),
        activationCode: 'NIKE75APR',
        pin: '0123'
      },
      {
        id: 11,
        retailer: 'Nike',
        initialValue: '200',
        currentValue: '200',
        expirationDate: new Date('2024-12-25'),
        activationCode: 'NIKE200XMAS',
        pin: '3579'
      },
      {
        id: 12,
        retailer: 'Apple Store',
        initialValue: '500',
        currentValue: '500',
        expirationDate: new Date('2024-09-15'),
        activationCode: 'APPLE500FALL',
        pin: '8642'
      },
      {
        id: 13,
        retailer: 'Apple Store',
        initialValue: '100',
        currentValue: '100',
        expirationDate: new Date('2024-03-31'),
        activationCode: 'APPLE100MAR',
        pin: '9753'
      },
      {
        id: 14,
        retailer: 'Home Depot',
        initialValue: '250',
        currentValue: '250',
        expirationDate: new Date('2024-05-15'),
        activationCode: 'HD250SPRING',
        pin: '1597'
      },
      {
        id: 15,
        retailer: 'Home Depot',
        initialValue: '75',
        currentValue: '75',
        expirationDate: new Date('2024-08-31'),
        activationCode: 'HD75AUG',
        pin: '7531'
      },
      {
        id: 16,
        retailer: 'Starbucks',
        initialValue: '50',
        currentValue: '50',
        expirationDate: new Date('2024-07-31'),
        activationCode: 'SBUX50SUMMER',
        pin: '2468'
      },
      {
        id: 17,
        retailer: 'Starbucks',
        initialValue: '25',
        currentValue: '25',
        expirationDate: new Date('2024-12-01'),
        activationCode: 'SBUX25DEC',
        pin: '1379'
      },
      {
        id: 18,
        retailer: 'Microsoft Store',
        initialValue: '150',
        currentValue: '150',
        expirationDate: new Date('2024-06-15'),
        activationCode: 'MS150JUNE',
        pin: '8520'
      },
      {
        id: 19,
        retailer: 'Microsoft Store',
        initialValue: '200',
        currentValue: '200',
        expirationDate: new Date('2024-11-30'),
        activationCode: 'MS200NOV',
        pin: '7410'
      },
      {
        id: 20,
        retailer: 'GameStop',
        initialValue: '100',
        currentValue: '100',
        expirationDate: new Date('2024-08-01'),
        activationCode: 'GAME100AUG',
        pin: '9630'
      },
      // Additional non-expired coupons
      {
        id: 21,
        retailer: 'Amazon',
        initialValue: '75',
        currentValue: '75',
        expirationDate: new Date('2025-06-30'),
        activationCode: 'AMZN75FUTURE',
        pin: '2580'
      },
      {
        id: 22,
        retailer: 'Target',
        initialValue: '125',
        currentValue: '125',
        expirationDate: new Date('2025-03-15'),
        activationCode: 'TGT125SPRING',
        pin: '3690'
      },
      {
        id: 23,
        retailer: 'Best Buy',
        initialValue: '300',
        currentValue: '300',
        expirationDate: new Date('2025-01-31'),
        activationCode: 'BB300JAN',
        pin: '1470'
      },
      {
        id: 24,
        retailer: 'Walmart',
        initialValue: '50',
        currentValue: '50',
        expirationDate: new Date('2025-04-15'),
        activationCode: 'WMT50APR',
        pin: '8520'
      },
      {
        id: 25,
        retailer: 'Nike',
        initialValue: '150',
        currentValue: '150',
        expirationDate: new Date('2025-07-04'),
        activationCode: 'NIKE150JULY',
        pin: '9630'
      },
      {
        id: 26,
        retailer: 'Apple Store',
        initialValue: '250',
        currentValue: '250',
        expirationDate: new Date('2025-05-01'),
        activationCode: 'APPLE250MAY',
        pin: '7410'
      },
      {
        id: 27,
        retailer: 'Home Depot',
        initialValue: '100',
        currentValue: '100',
        expirationDate: new Date('2025-02-14'),
        activationCode: 'HD100FEB',
        pin: '8520'
      },
      {
        id: 28,
        retailer: 'Starbucks',
        initialValue: '30',
        currentValue: '30',
        expirationDate: new Date('2025-08-31'),
        activationCode: 'SBUX30AUG',
        pin: '9630'
      },
      {
        id: 29,
        retailer: 'Microsoft Store',
        initialValue: '250',
        currentValue: '250',
        expirationDate: new Date('2025-09-30'),
        activationCode: 'MS250SEPT',
        pin: '1470'
      },
      {
        id: 30,
        retailer: 'GameStop',
        initialValue: '75',
        currentValue: '75',
        expirationDate: new Date('2025-10-31'),
        activationCode: 'GAME75OCT',
        pin: '2580'
      }
    ];
  }

  getAllCoupons() {
    return [...this.coupons];
  }

  addCoupon(coupon) {
    const newCoupon = { 
      ...coupon, 
      id: Date.now(),
      // Ensure currentValue equals initialValue when adding a new coupon
      currentValue: coupon.initialValue 
    };
    this.coupons.push(newCoupon);
    return newCoupon;
  }

  updateCoupon(updatedCoupon) {
    const index = this.coupons.findIndex(coupon => coupon.id === updatedCoupon.id);
    if (index !== -1) {
      // Preserve the initialValue from the existing coupon
      const initialValue = this.coupons[index].initialValue;
      
      // Ensure currentValue doesn't exceed initialValue
      const safeCurrentValue = parseFloat(updatedCoupon.currentValue) > parseFloat(initialValue) 
        ? initialValue 
        : updatedCoupon.currentValue;
      
      this.coupons[index] = {
        ...updatedCoupon,
        initialValue, // Keep the original initialValue
        currentValue: safeCurrentValue // Ensure currentValue doesn't exceed initialValue
      };
      return this.coupons[index];
    }
    return null;
  }
}

export const couponService = new CouponService();