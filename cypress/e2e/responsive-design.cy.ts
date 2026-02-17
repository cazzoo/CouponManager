/**
 * End-to-End tests for Responsive Design
 *
 * True E2E tests covering complete responsive design journeys:
 * - Application displays correctly on different viewport sizes
 * - Navigation works on mobile and desktop
 *
 * @module ResponsiveDesignE2ETests
 * @author Kilo Code
 * @date 2025-01-28
 */

/**
 * Responsive Design E2E test suite
 *
 * These tests focus on complete user journeys across different viewport sizes.
 * Tests that the application is usable on both mobile and desktop.
 *
 * For component-level responsive tests, see component tests.
 */
describe('Responsive Design Tests', () => {
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
   * Desktop View Tests
   */
  describe('Desktop View (1920px)', () => {
    beforeEach(() => {
      // Set desktop viewport
      cy.viewport(1920, 1080);
    });

    /**
     * Test dashboard displays on desktop
     *
     * E2E: Verifies dashboard is usable on desktop viewport
     */
    it('should display dashboard on desktop viewport', () => {
      // Verify dashboard is visible
      cy.getByTestId('dashboard-container').should('be.visible');

      // Verify navigation is visible
      cy.getByTestId('nav-coupons').should('be.visible');
      cy.getByTestId('nav-retailers').should('be.visible');
    });

    /**
     * Test desktop navigation works
     *
     * E2E: Verifies desktop navigation functions correctly
     */
    it('should navigate using desktop menu', () => {
      // Click navigation
      cy.getByTestId('nav-coupons').click();

      // Verify navigation worked
      cy.getByTestId('coupon-list').should('be.visible');
    });
  });

  /**
   * Mobile View Tests
   */
  describe('Mobile View (375px)', () => {
    beforeEach(() => {
      // Set mobile viewport
      cy.viewport(375, 667);
    });

    /**
     * Test dashboard displays on mobile
     *
     * E2E: Verifies dashboard is usable on mobile viewport
     */
    it('should display dashboard on mobile viewport', () => {
      // Verify dashboard is visible
      cy.getByTestId('dashboard-container').should('be.visible');

      // Verify navigation elements are present (may be in different layout)
      cy.getByTestId('nav-coupons').should('be.visible');
    });

    /**
     * Test mobile navigation works
     *
     * E2E: Verifies navigation works on mobile
     */
    it('should navigate on mobile viewport', () => {
      // Click navigation
      cy.getByTestId('nav-retailers').click();

      // Verify navigation worked
      cy.getByTestId('retailer-list').should('be.visible');
    });
  });
});
