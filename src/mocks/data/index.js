/**
 * Mock Data Index
 * 
 * This file centralizes and exports all mock data for the development environment.
 */

export { default as mockCoupons } from './coupons.js';
export { default as mockUsers } from './users.js';

/**
 * This function returns all mock data in a structured format
 * for easy access in different parts of the application.
 */
export const getAllMockData = () => {
  return {
    coupons: require('./coupons.js').default,
    users: require('./users.js').default,
  };
};

export default getAllMockData; 