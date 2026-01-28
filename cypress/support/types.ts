/**
 * TypeScript type definitions for Cypress custom commands and Page Object Models
 * 
 * Provides type safety and IntelliSense support for custom Cypress commands
 * used throughout the test suite.
 * 
 * @module CypressTypes
 * @author Kilo Code
 * @date 2025-01-26
 */

import type { AriaRole } from '@testing-library/cypress';

/**
 * Supported language codes for internationalization
 */
export type LanguageCode = 'en' | 'es' | 'fr' | 'de';

/**
 * Coupon data structure for creating and managing coupons
 */
export interface CouponData {
  /** Unique identifier for the coupon (optional for creation) */
  id?: string;
  /** Coupon code displayed to users */
  code: string;
  /** Description of the coupon offer */
  description: string;
  /** Discount percentage (0-100) */
  discountPercentage: number;
  /** Expiration date in ISO format */
  expirationDate: string;
  /** Retailer identifier */
  retailerId: string;
  /** Additional notes or terms */
  notes?: string;
  /** Whether the coupon is currently active */
  isActive?: boolean;
}

/**
 * User credentials for authentication
 */
export interface UserCredentials {
  /** Username or email address */
  username: string;
  /** User password */
  password: string;
}

/**
 * Retailer information
 */
export interface RetailerData {
  /** Unique identifier for the retailer */
  id: string;
  /** Retailer name */
  name: string;
  /** Retailer website URL */
  website?: string;
  /** Physical location address */
  address?: string;
}

/**
 * User management data
 */
export interface UserData {
  /** Unique identifier for the user */
  id?: string;
  /** Username for login */
  username: string;
  /** User email address */
  email: string;
  /** User role (admin, user, etc.) */
  role: string;
  /** Whether the user account is active */
  isActive?: boolean;
}

/**
 * Options for getting elements by ARIA role
 */
export interface GetByRoleOptions {
  /** Accessible name of the element */
  name?: string | RegExp;
  /** Whether the element should be checked */
  checked?: boolean;
  /** Whether the element should be disabled */
  disabled?: boolean;
  /** Whether the element should be selected */
  selected?: boolean;
}

/**
 * Options for accessibility checks
 */
export interface A11yOptions {
  /** Whether to include only critical violations */
  criticalOnly?: boolean;
  /** Whether to include warnings */
  includeWarnings?: boolean;
  /** Custom impact levels to check */
  impactLevels?: ('critical' | 'serious' | 'moderate' | 'minor')[];
}

/**
 * API request options for waitForApi command
 */
export interface WaitForApiOptions {
  /** Maximum time to wait in milliseconds */
  timeout?: number;
  /** Number of expected requests */
  requestCount?: number;
  /** Specific API endpoint to wait for */
  endpoint?: string;
}

/**
 * Custom Cypress commands namespace
 */
declare namespace Cypress {
  /**
   * Chainable interface for custom commands
   */
  interface Chainable {
    /**
     * Authenticates a user with the provided credentials
     * 
     * Fills in the login form and submits it, waiting for successful
     * authentication before proceeding.
     *
     * @param username - Username or email address
     * @param password - User password
     * @returns Chainable element for further chaining
     * @example
     * cy.login('testuser@example.com', 'password123')
     */
    login(username: string, password: string): Chainable<Element>;

    /**
     * Logs out the current user
     * 
     * Performs logout action and verifies the user is redirected
     * to the login page.
     *
     * @returns Chainable element for further chaining
     * @example
     * cy.logout()
     */
    logout(): Chainable<Element>;

    /**
     * Creates a new coupon through the UI
     * 
     * Navigates to coupon creation form, fills in the provided data,
     * and submits the form.
     *
     * @param couponData - Coupon information to create
     * @returns Chainable element for further chaining
     * @example
     * cy.createCoupon({
     *   code: 'SAVE20',
     *   description: '20% off all items',
     *   discountPercentage: 20,
     *   expirationDate: '2025-12-31',
     *   retailerId: 'retailer-1'
     * })
     */
    createCoupon(couponData: CouponData): Chainable<Element>;

    /**
     * Selects a language from the language selector
     * 
     * Changes the application language and verifies the UI updates
     * to reflect the selected language.
     *
     * @param lang - Language code to select
     * @returns Chainable element for further chaining
     * @example
     * cy.selectLanguage('es')
     */
    selectLanguage(lang: LanguageCode): Chainable<Element>;

    /**
     * Waits for all pending API requests to complete
     * 
     * Ensures all network requests have finished before proceeding,
     * useful for testing async operations.
     *
     * @param options - Optional configuration for wait behavior
     * @returns Chainable element for further chaining
     * @example
     * cy.waitForApi()
     * cy.waitForApi({ timeout: 10000, endpoint: '/api/coupons' })
     */
    waitForApi(options?: WaitForApiOptions): Chainable<Element>;

    /**
     * Performs accessibility checks on the current page
     * 
     * Runs axe-core accessibility tests and reports any violations
     * found in the current page or element.
     *
     * @param options - Optional configuration for a11y checks
     * @returns Chainable element for further chaining
     * @example
     * cy.checkA11y()
     * cy.checkA11y({ criticalOnly: true })
     */
    checkA11y(options?: A11yOptions): Chainable<Element>;

    /**
     * Gets an element by its data-testid attribute
     * 
     * Provides a reliable way to select elements for testing that
     * is independent of CSS classes and DOM structure.
     *
     * @param id - The data-testid value to search for
     * @returns Chainable element for further chaining
     * @example
     * cy.getByTestId('submit-button').click()
     */
    getByTestId(id: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Gets an element by its ARIA role
     * 
     * Selects elements based on their semantic role in the document,
     * providing more accessible and maintainable selectors.
     *
     * @param role - The ARIA role to search for
     * @param options - Additional filtering options
     * @returns Chainable element for further chaining
     * @example
     * cy.getByRole('button', { name: 'Submit' }).click()
     */
    getByRole(role: AriaRole, options?: GetByRoleOptions): Chainable<JQuery<HTMLElement>>;
  }
}
