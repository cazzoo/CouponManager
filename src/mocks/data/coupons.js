/**
 * Mock Coupons for Development Environment
 * 
 * This file contains pre-defined mock data for coupons used in development mode.
 * The data includes various coupon states (active, partially used, expired) for testing.
 */

// Helper to create dates relative to current date
const createDate = (monthsOffset) => {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsOffset);
  return date.toISOString(); // Convert Date to ISO string format
};

export const mockCoupons = [
  // Active coupons
  {
    id: "00000000-0000-0000-0000-000000000101",
    retailer: 'Best Buy',
    initialValue: '200',
    currentValue: '200',
    expirationDate: createDate(6),
    activationCode: 'BB-DEV-2023',
    pin: '0000',
    notes: 'Development mock data - active, full value',
    user_id: "00000000-0000-0000-0000-000000000001" // Associate with Test User
  },
  {
    id: "00000000-0000-0000-0000-000000000102",
    retailer: 'Amazon',
    initialValue: '100',
    currentValue: '100',
    expirationDate: createDate(8),
    activationCode: 'AMZN-DEV-2023',
    pin: '1234',
    notes: 'Development mock data - active, full value',
    user_id: "00000000-0000-0000-0000-000000000001" // Associate with Test User
  },
  
  // Partially used coupons
  {
    id: "00000000-0000-0000-0000-000000000103",
    retailer: 'Walmart',
    initialValue: '75',
    currentValue: '25',
    expirationDate: createDate(3),
    activationCode: 'WM-DEV-2023',
    pin: '1111',
    notes: 'Development mock data - active, partially used',
    user_id: "00000000-0000-0000-0000-000000000002" // Associate with Test Manager
  },
  {
    id: "00000000-0000-0000-0000-000000000104",
    retailer: 'Target',
    initialValue: '50',
    currentValue: '15',
    expirationDate: createDate(2),
    activationCode: 'TARGET-DEV-2023',
    pin: '5678',
    notes: 'Development mock data - active, partially used',
    user_id: "00000000-0000-0000-0000-000000000002" // Associate with Test Manager
  },
  
  // Soon to expire coupons
  {
    id: "00000000-0000-0000-0000-000000000105",
    retailer: 'Starbucks',
    initialValue: '25',
    currentValue: '25',
    expirationDate: createDate(0.5),
    activationCode: 'SBUX-DEV-2023',
    pin: '9999',
    notes: 'Development mock data - active, expires soon',
    user_id: "00000000-0000-0000-0000-000000000003" // Associate with Test Admin
  },
  
  // Expired coupons
  {
    id: "00000000-0000-0000-0000-000000000106",
    retailer: 'Steam',
    initialValue: '50',
    currentValue: '0',
    expirationDate: createDate(-1),
    activationCode: 'STEAM-DEV-2023',
    pin: '2222',
    notes: 'Development mock data - expired and used',
    user_id: "00000000-0000-0000-0000-000000000003" // Associate with Test Admin
  },
  {
    id: "00000000-0000-0000-0000-000000000107",
    retailer: 'Apple',
    initialValue: '100',
    currentValue: '100',
    expirationDate: createDate(-2),
    activationCode: 'APPLE-DEV-2023',
    pin: '3333',
    notes: 'Development mock data - expired but unused',
    user_id: "00000000-0000-0000-0000-000000000004" // Associate with Demo Account
  }
];

export default mockCoupons; 