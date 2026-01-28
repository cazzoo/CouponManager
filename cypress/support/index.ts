/**
 * Cypress support file entry point
 * 
 * Exports and imports custom commands and type definitions for use
 * throughout the Cypress test suite. This file serves as the central
 * hub for all test utilities and helpers.
 * 
 * @module CypressSupport
 * @author Kilo Code
 * @date 2025-01-26
 */

// Import custom commands to register them with Cypress
import './commands';

// Import type definitions for TypeScript support
import './types';

// Re-export commonly used types for convenience
export type {
  LanguageCode,
  CouponData,
  UserCredentials,
  RetailerData,
  UserData,
  GetByRoleOptions,
  A11yOptions,
  WaitForApiOptions
} from './types';
