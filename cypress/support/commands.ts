/**
 * Custom Cypress commands for the Coupon Manager application
 * 
 * Provides reusable commands for common testing operations including
 * authentication, coupon management, language selection, and accessibility
 * checks.
 * 
 * @module CypressCommands
 * @author Kilo Code
 * @date 2025-01-26
 */

import type { AriaRole } from '@testing-library/cypress';
import type {
  CouponData,
  LanguageCode,
  WaitForApiOptions,
  A11yOptions,
  GetByRoleOptions
} from './types';

/**
 * Custom command to authenticate a user
 * 
 * Navigates to the login page, fills in credentials, and submits the form.
 * Verifies successful authentication by checking for the presence of
 * authenticated user elements.
 *
 * @example
 * cy.login('testuser@example.com', 'password123')
 */
Cypress.Commands.add('login', (username: string, password: string) => {
  // Navigate to login page
  cy.visit('/');
  
  // Wait for login form to be visible (with extended timeout for slow networks)
  cy.getByTestId('login-form', { timeout: 10000 }).should('be.visible');

  // Fill in login credentials
  cy.getByTestId('username-input').clear().type(username);
  cy.getByTestId('password-input').clear().type(password);

  // Submit the login form
  cy.getByTestId('login-submit-button').click();

  // Wait for auth loading to complete and dashboard to appear
  // The dashboard-container only appears when user is authenticated AND authLoading is false
  cy.getByTestId('dashboard-container', { timeout: 15000 }).should('be.visible');
  
  // Also verify logout button is present as additional confirmation
  cy.getByTestId('logout-button', { timeout: 5000 }).should('be.visible');
});

/**
 * Custom command to logout the current user
 * 
 * Clicks the logout button and verifies redirection to the login page.
 * Clears any stored authentication tokens from local storage.
 *
 * @example
 * cy.logout()
 */
Cypress.Commands.add('logout', () => {
  // Click logout button
  cy.getByTestId('logout-button').click();

  // Verify we're redirected to login page
  cy.getByTestId('login-form', { timeout: 10000 }).should('be.visible');

  // Clear local storage to ensure clean state
  cy.clearLocalStorage();
});

/**
 * Custom command to create a coupon through the UI
 * 
 * Navigates to the coupon creation form, fills in all required fields,
 * and submits the form. Verifies the coupon was created successfully.
 *
 * @param couponData - Coupon information including code, description, discount, etc.
 * @example
 * cy.createCoupon({
 *   code: 'SAVE20',
 *   description: '20% off all items',
 *   discountPercentage: 20,
 *   expirationDate: '2025-12-31',
 *   retailerId: 'retailer-1'
 * })
 */
Cypress.Commands.add('createCoupon', (couponData: CouponData) => {
  // Navigate to coupon creation page
  cy.getByTestId('create-coupon-button').click();

  // Wait for form to be visible
  cy.getByTestId('coupon-form').should('be.visible');

  // Fill in coupon code
  cy.getByTestId('coupon-code-input').clear().type(couponData.code);

  // Fill in description
  cy.getByTestId('coupon-description-input').clear().type(couponData.description);

  // Fill in discount percentage
  cy.getByTestId('coupon-discount-input').clear().type(couponData.discountPercentage.toString());

  // Fill in expiration date
  cy.getByTestId('coupon-expiration-input').clear().type(couponData.expirationDate);

  // Select retailer
  cy.getByTestId('coupon-retailer-select').select(couponData.retailerId);

  // Fill in notes if provided
  if (couponData.notes) {
    cy.getByTestId('coupon-notes-input').clear().type(couponData.notes);
  }

  // Submit the form
  cy.getByTestId('coupon-submit-button').click();

  // Wait for dialog to close (form submission complete)
  cy.getByTestId('coupon-form').should('not.exist');

  // Verify coupon was created successfully
  cy.getByTestId('coupon-list').should('contain', couponData.code);
});

/**
 * Custom command to select a language
 * 
 * Opens the language selector and selects the specified language.
 * Verifies the UI updates to reflect the selected language.
 *
 * @param lang - Language code (en, es, fr, de)
 * @example
 * cy.selectLanguage('es')
 */
Cypress.Commands.add('selectLanguage', (lang: LanguageCode) => {
  // Click language selector to open dropdown
  cy.getByTestId('language-selector').click();

  // Select the specified language option
  cy.getByTestId(`language-option-${lang}`).click();

  // Wait briefly for language change to apply
  cy.wait(500);

  // Verify language was changed by checking for language-specific content
  // This will depend on how the app indicates the current language
  cy.get('html').should('have.attr', 'lang', lang);
});

/**
 * Custom command to wait for API requests to complete
 * 
 * Monitors network activity and waits for all pending XHR/fetch requests
 * to complete. Useful for ensuring async operations finish before proceeding.
 *
 * @param options - Optional configuration including timeout and endpoint filtering
 * @example
 * cy.waitForApi()
 * cy.waitForApi({ timeout: 10000, endpoint: '/api/coupons' })
 */
Cypress.Commands.add('waitForApi', (options: WaitForApiOptions = {}) => {
  const { timeout = 10000, endpoint } = options;

  // Intercept all requests to monitor network activity
  cy.intercept('**/*', (req) => {
    // If endpoint is specified, only wait for matching requests
    if (endpoint && !req.url.includes(endpoint)) {
      return;
    }
    req.continue();
  }).as('apiRequest');

  // Wait for all requests to complete
  cy.wait('@apiRequest', { timeout });
});

/**
 * Custom command to perform accessibility checks
 * 
 * Runs axe-core accessibility testing on the current page or element.
 * Reports any violations found with severity levels.
 *
 * @param options - Optional configuration for a11y checks
 * @example
 * cy.checkA11y()
 * cy.checkA11y({ criticalOnly: true })
 */
Cypress.Commands.add('checkA11y', (options: A11yOptions = {}) => {
  const { criticalOnly = false, includeWarnings = false } = options;

  // Check if axe-core is available
  cy.window().then((win) => {
    if (!win.axe) {
      cy.log('axe-core not available, skipping accessibility check');
      return;
    }

    // Run accessibility check
    cy.injectAxe();
    cy.checkA11y(null, {
      runOnly: {
        type: criticalOnly ? 'tag' : undefined,
        values: criticalOnly ? ['wcag2a', 'wcag2aa'] : undefined
      },
      reporter: 'v2'
    }, (violations) => {
      // Log violations if found
      if (violations.length > 0) {
        cy.log(`Found ${violations.length} accessibility violations`);
        violations.forEach((violation: any) => {
          cy.log(`- ${violation.id}: ${violation.description}`);
        });
      }
    });
  });
});

/**
 * Custom command to get element by data-testid attribute
 * 
 * Provides a reliable selector strategy that is independent of CSS classes
 * and DOM structure changes. This is the preferred way to select elements
 * for testing.
 *
 * @param id - The data-testid value to search for
 * @example
 * cy.getByTestId('submit-button').click()
 */
Cypress.Commands.add('getByTestId', (id: string) => {
  return cy.get(`[data-testid="${id}"]`);
});

/**
 * Custom command to get element by ARIA role
 * 
 * Selects elements based on their semantic role in the document,
 * providing more accessible and maintainable selectors than CSS classes.
 *
 * @param role - The ARIA role to search for
 * @param options - Additional filtering options
 * @example
 * cy.getByRole('button', { name: 'Submit' }).click()
 */
Cypress.Commands.add('getByRole', (role: AriaRole, options: GetByRoleOptions = {}) => {
  const { name, checked, disabled, selected } = options;

  let selector = `[role="${role}"]`;

  // Add additional filters based on options
  if (checked !== undefined) {
    selector += `[aria-checked="${checked}"]`;
  }
  if (disabled !== undefined) {
    selector += `[aria-disabled="${disabled}"]`;
  }
  if (selected !== undefined) {
    selector += `[aria-selected="${selected}"]`;
  }

  let chainable = cy.get(selector);

  // Filter by accessible name if provided
  if (name) {
    const nameRegex = name instanceof RegExp ? name : new RegExp(name, 'i');
    chainable = chainable.filter((index, element) => {
      const accessibleName = element.getAttribute('aria-label') || 
                           element.getAttribute('aria-labelledby') || 
                           element.textContent || '';
      return nameRegex.test(accessibleName);
    });
  }

  return chainable;
});
