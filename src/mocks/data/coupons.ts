import type { CouponFormData } from '../../types';

export const mockCoupons: CouponFormData[] = [
  {
    retailer: 'Amazon',
    initialValue: '50.00',
    currentValue: '50.00',
    expirationDate: '2025-12-31',
    notes: 'Gift card for books',
    barcode: '123456789012',
    reference: 'AMZ-001',
    activationCode: 'ABC123',
    pin: '1234'
  },
  {
    retailer: 'Starbucks',
    initialValue: '25.00',
    currentValue: '15.00',
    expirationDate: '2025-06-30',
    notes: 'Coffee gift card',
    barcode: '987654321098',
    reference: 'SBX-001'
  },
  {
    retailer: 'Target',
    initialValue: '100.00',
    currentValue: '100.00',
    expirationDate: '2025-09-15',
    notes: 'Holiday gift',
    barcode: '456789012345',
    reference: 'TGT-001',
    pin: '5678'
  }
];
