/**
 * End-to-End tests for Dashboard
 *
 * True E2E tests covering complete dashboard journeys:
 * - View dashboard after login
 * - Navigate from dashboard to other pages
 *
 * Note: Dashboard stat cards don't have individual testids yet,
 * so those tests are skipped.
 *
 * @module DashboardE2ETests
 * @author Kilo Code
 * @date 2025-01-28
 */

/**
 * Dashboard E2E test suite
 *
 * These tests focus on complete user journeys involving the dashboard.
 * Tests integration between dashboard and other pages.
 *
 * For component-level dashboard tests (individual stat cards, rendering, etc.),
 * see component tests.
 */
describe('Dashboard Workflows', () => {
  /**
   * Login before each test
   */
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.login('user@example.com', 'password123');
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
   * Tests complete dashboard journeys
   */
  describe('Happy Paths', () => {
    /**
     * Test viewing dashboard after login
     *
     * E2E: Verifies user can see dashboard after login
     */
    it('should view dashboard after login', () => {
      // Verify dashboard container is visible (already verified by cy.login)
      cy.getByTestId('dashboard-container').should('be.visible');

      // Verify navigation elements are present
      cy.getByTestId('nav-coupons').should('be.visible');
      cy.getByTestId('nav-retailers').should('be.visible');
      cy.getByTestId('logout-button').should('be.visible');
    });

    /**
     * Test navigating to coupon list from dashboard
     *
     * E2E: Verifies navigation flow from dashboard to coupons
     */
    it('should navigate to coupon list from dashboard', () => {
      // Click coupons navigation tab
      cy.getByTestId('nav-coupons').click();

      // Verify coupon list is visible
      cy.getByTestId('coupon-list').should('be.visible');
    });

    /**
     * Test navigating to retailer list from dashboard
     *
     * E2E: Verifies navigation flow from dashboard to retailers
     */
    it('should navigate to retailer list from dashboard', () => {
      // Click retailers navigation tab
      cy.getByTestId('nav-retailers').click();

      // Verify retailer list is visible
      cy.getByTestId('retailer-list').should('be.visible');
    });
  });
});
