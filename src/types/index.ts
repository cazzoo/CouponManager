/**
 * Common types and interfaces used throughout the application
 */

// User-related types
export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
  last_sign_in_at?: string;
}

export type UserRole = 'user' | 'manager' | 'demo';

// Coupon-related types
export interface Coupon {
  id: string;
  userId: string;
  retailer: string;
  initialValue: string;
  currentValue: string;
  expirationDate?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  barcode?: string;
  reference?: string;
  activationCode?: string;
  pin?: string;
}

export interface CouponFormData {
  retailer: string;
  initialValue: string;
  currentValue?: string;
  expirationDate?: string;
  notes?: string;
  barcode?: string;
  reference?: string;
  activationCode?: string;
  pin?: string;
}

// Data structure for barcode scanner results
export interface CouponData {
  retailer: string;
  initialValue: number | string;
  currentValue?: number | string;
  expirationDate?: string;
  notes?: string;
  barcode?: string;
  reference?: string;
  activationCode?: string;
  pin?: string;
  [key: string]: any;
}

// Sorting and filtering types
export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterConfig {
  retailer?: string;
  minAmount?: number;
  maxAmount?: number;
  showExpired?: boolean;
  showUsed?: boolean;
  search?: string;
}

// Stats-related types
export interface RetailerStat {
  name: string;
  couponCount: number;
  totalValue: number;
  activeCouponCount: number;
  activeTotalValue: number;
  expiredCouponCount: number;
  expiredTotalValue: number;
}

// Language-related types
export interface Language {
  code: string;
  name: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// Theme-related types
export interface ThemeConfig {
  isDarkMode: boolean;
  onThemeChange: (isDarkMode: boolean) => void;
} 