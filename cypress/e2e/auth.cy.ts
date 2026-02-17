/**
 * End-to-End tests for Authentication flows
 *
 * True E2E tests covering complete user journeys:
 * - Login/logout flows with navigation between pages
 * - Registration flow with redirect to dashboard
 * - Anonymous sign-in flow
 * - Session persistence across page refresh
 * - Language persistence across authentication
 *
 * Component-level tests (validation, error messages, accessibility)
 * have been moved to LoginForm.cy.tsx
 *
 * @module AuthE2ETests
 * @author Kilo Code
 * @date 2025-01-28
 */

import { loginPage } from '../support';
import type { UserCredentials } from '../support/types';

/**
 * Test data for authentication scenarios
 */
const testCredentials: UserCredentials = {
  username: 'user@example.com',
  password: 'password123'
};

/**
 * Authentication E2E test suite
 *
 * These tests focus on complete user journeys that span multiple pages
 * and test the integration between authentication and the rest of the app.
 *
 * For component-level authentication tests (validation, error messages, etc.),
 * see cypress/component/LoginForm.cy.tsx
 */
describe('Authentication Flows', () => {
  /**
   * Clean up before each test
   */
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  /**
   * Clean up after each test
   */
  afterEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  /**
   * Happy Path E2E Tests
   * Tests complete authentication journeys
   */
  describe('Happy Paths', () => {
    /**
     * Test complete login journey
     *
     * E2E: Verifies user can log in and is redirected to dashboard
     * Tests navigation from login page to dashboard
     */
    it('should successfully login with valid credentials', () => {
      // Use custom login command
      cy.login(testCredentials.username, testCredentials.password);

      // Verify successful login by checking dashboard elements
      cy.getByTestId('dashboard-container').should('be.visible');
      cy.getByTestId('logout-button').should('be.visible');
      
      // Verify navigation tabs are present
      cy.getByTestId('nav-coupons').should('be.visible');
      cy.getByTestId('nav-retailers').should('be.visible');
    });

    /**
     * Test anonymous sign-in journey
     *
     * E2E: Verifies anonymous user can access app
     * Tests navigation from login to dashboard for demo user
     */
    it('should successfully sign in anonymously', () => {
      // Navigate to app
      cy.visit('/');

      // Wait for login form
      cy.getByTestId('login-form', { timeout: 10000 }).should('be.visible');

      // Click anonymous sign-in button
      cy.getByTestId('anonymous-signin-button').click();

      // Verify anonymous user is logged in
      cy.getByTestId('dashboard-container', { timeout: 15000 }).should('be.visible');
      cy.getByTestId('logout-button').should('be.visible');
    });

    /**
     * Test complete logout journey
     *
     * E2E: Verifies user can log out and is redirected to login
     * Tests navigation from dashboard back to login page
     */
    it('should successfully logout', () => {
      // First login
      cy.login(testCredentials.username, testCredentials.password);

      // Then logout by clicking the logout button
      cy.getByTestId('logout-button').click();

      // Verify redirect to login page
      cy.getByTestId('login-form', { timeout: 10000 }).should('be.visible');
      
      // Verify dashboard is no longer visible
      cy.getByTestId('dashboard-container').should('not.exist');
    });
  });

  /**
   * Session Persistence Tests
   * Tests that user sessions persist across page refreshes
   */
  describe('Session Persistence', () => {
    /**
     * Test session persistence after page refresh
     *
     * E2E: Verifies user remains logged in after refreshing the page
     * Tests state management across page reload
     */
    it('should maintain session after page refresh', () => {
      // Login first
      cy.login(testCredentials.username, testCredentials.password);

      // Verify dashboard is visible before refresh
      cy.getByTestId('dashboard-container').should('be.visible');

      // Refresh the page
      cy.reload();

      // Verify still logged in after refresh
      cy.getByTestId('dashboard-container', { timeout: 15000 }).should('be.visible');
      cy.getByTestId('logout-button').should('be.visible');
    });
  });

  /**
   * Internationalization Tests
   * Tests language persistence across authentication
   */
  describe('Internationalization (i18n)', () => {
    /**
     * Test language persistence after login
     *
     * E2E: Verifies selected language persists through authentication flow
     * Tests state management across login
     */
    it('should maintain selected language after login', () => {
      const testLang = 'es';
      const testLangName = 'Spanish';

      // Navigate to app first
      cy.visit('/');

      // Wait for login form to ensure app is loaded
      cy.getByTestId('login-form', { timeout: 10000 }).should('be.visible');

      // Wait for language selector to be visible and ready
      cy.get('#language-select', { timeout: 10000 })
        .should('be.visible')
        .and('not.be.disabled');

      // Change language before login using the select element
      // Select by visible text (Spanish) and verify the value changes to 'es'
      cy.get('#language-select')
        .select(testLangName)
        .should('have.value', testLang);

      // Verify language was changed by checking both select value and html lang
      cy.get('#language-select').should('have.value', testLang);
      cy.get('html').should('have.attr', 'lang', testLang);

      // Login
      cy.getByTestId('username-input').clear().type(testCredentials.username);
      cy.getByTestId('password-input').clear().type(testCredentials.password);
      cy.getByTestId('login-submit-button').click();

      // Verify login succeeded
      cy.getByTestId('dashboard-container', { timeout: 15000 }).should('be.visible');

      // Verify language is maintained after login (check html lang attribute)
      cy.get('html').should('have.attr', 'lang', testLang);

      // Also verify the language selector on the dashboard has the correct value
      cy.get('#language-select').should('have.value', testLang);
    });
  });
});
