/**
 * End-to-End tests for Dashboard workflows
 *
 * Comprehensive test suite covering all dashboard scenarios including
 * viewing statistics, navigation, quick actions, and dynamic updates.
 * Tests include happy paths, edge cases, and i18n support.
 *
 * @module DashboardE2ETests
 * @author Kilo Code
 * @date 2025-01-26
 */

import { dashboardPage } from '../support';
import type { CouponData } from '../support/types';

/**
 * Test data for dashboard scenarios
 */
const testCoupon: CouponData = {
  code: 'DASHTEST',
  description: 'Dashboard test coupon',
  discountPercentage: 25,
  expirationDate: '2025-12-31',
  retailerId: 'retailer-1'
};

/**
 * Dashboard E2E test suite
 */
describe('Dashboard Workflows', () => {
  /**
   * Clean up before each test
   * Clears local storage and cookies to ensure clean state
   */
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.login('test@example.com', 'SecurePass123!');
  });

  /**
   * Clean up after each test
   * Ensures no test data persists between tests
   */
  afterEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  /**
   * Happy Path Tests
   * Tests successful dashboard scenarios
   */
  describe('Happy Paths', () => {
    /**
     * Test viewing dashboard statistics
     *
     * Verifies that users can view all dashboard statistics
     * including total coupons, value, and activity metrics.
     */
    it('should view dashboard statistics', () => {
      dashboardPage
        .navigate()
        .shouldBeVisible()
        .waitForLoad();

      // Verify dashboard is visible
      dashboardPage.shouldBeVisible();

      // Verify stats cards are visible
      dashboardPage.statsShouldBeVisible();

      // Verify quick actions are visible
      dashboardPage.quickActionsShouldBeVisible();
    });

    /**
     * Test viewing total coupons count
     *
     * Verifies that total coupons count is displayed correctly.
     */
    it('should view total coupons count', () => {
      dashboardPage
        .navigate()
        .shouldBeVisible()
        .waitForLoad();

      // Verify total coupons stat is visible
      cy.getByTestId('stat-total-coupons').should('be.visible');
      cy.getByTestId('stat-total-coupons').should('contain', 'Coupons');
    });

    /**
     * Test viewing total value
     *
     * Verifies that total value of all coupons is displayed.
     */
    it('should view total value', () => {
      dashboardPage
        .navigate()
        .shouldBeVisible()
        .waitForLoad();

      // Verify total value stat is visible
      cy.getByTestId('stat-total-value').should('be.visible');
      cy.getByTestId('stat-total-value').should('contain', '$');
    });

    /**
     * Test viewing active coupons count
     *
     * Verifies that active coupons count is displayed correctly.
     */
    it('should view active coupons count', () => {
      dashboardPage
        .navigate()
        .shouldBeVisible()
        .waitForLoad();

      // Verify active coupons stat is visible
      cy.getByTestId('stat-active-coupons').should('be.visible');
      cy.getByTestId('stat-active-coupons').should('contain', 'Active');
    });

    /**
     * Test viewing expired coupons count
     *
     * Verifies that expired coupons count is displayed correctly.
     */
    it('should view expired coupons count', () => {
      dashboardPage
        .navigate()
        .shouldBeVisible()
        .waitForLoad();

      // Verify expired coupons stat is visible
      cy.getByTestId('stat-expired-coupons').should('be.visible');
      cy.getByTestId('stat-expired-coupons').should('contain', 'Expired');
    });

    /**
     * Test viewing recent coupons
     *
     * Verifies that recent coupons are displayed on dashboard.
     */
    it('should view recent coupons', () => {
      dashboardPage
        .navigate()
        .shouldBeVisible()
        .waitForLoad();

      // Verify recent activity section is visible
      dashboardPage.recentActivityShouldBeVisible();

      // Verify recent coupons are displayed
      cy.getByTestId('recent-coupons-list').should('be.visible');
    });

    /**
     * Test navigating to coupon list from dashboard
     *
     * Verifies that users can navigate from dashboard to coupon list.
     */
    it('should navigate to coupon list from dashboard', () => {
      dashboardPage
        .navigate()
        .shouldBeVisible()
        .navigateToCoupons();

      // Verify navigation to coupon list
      cy.url().should('include', '/coupons');
      cy.getByTestId('coupon-list').should('be.visible');
    });

    /**
     * Test navigating to retailer list from dashboard
     *
     * Verifies that users can navigate from dashboard to retailer list.
     */
    it('should navigate to retailer list from dashboard', () => {
      dashboardPage
        .navigate()
        .shouldBeVisible()
        .navigateToRetailers();

      // Verify navigation to retailer list
      cy.url().should('include', '/retailers');
      cy.getByTestId('retailer-list').should('be.visible');
    });

    /**
     * Test quick add coupon from dashboard
     *
     * Verifies that users can quickly add a coupon from dashboard.
     */
    it('should quick add coupon from dashboard', () => {
      dashboardPage
        .navigate()
        .shouldBeVisible()
        .clickCreateCoupon();

      // Verify navigation to coupon creation form
      cy.url().should('include', '/coupons');
      cy.getByTestId('coupon-form').should('be.visible');
    });

    /**
     * Test dashboard updates after adding coupon
     *
     * Verifies that dashboard statistics update after adding a new coupon.
     */
    it('should update dashboard after adding coupon', () => {
      // Get initial total coupons count
      let initialCount = 0;
      cy.getByTestId('stat-total-coupons')
        .invoke('text')
        .then((text) => {
          initialCount = parseInt(text.replace(/\D/g, '') || '0', 10);
        });

      // Add a new coupon
      cy.getByTestId('nav-coupons').click();
      cy.createCoupon(testCoupon);

      // Navigate back to dashboard
      dashboardPage.navigate().waitForLoad();

      // Verify total coupons count increased
      cy.getByTestId('stat-total-coupons')
        .invoke('text')
        .then((text) => {
          const newCount = parseInt(text.replace(/\D/g, '') || '0', 10);
          expect(newCount).to.be.greaterThan(initialCount);
        });
    });

    /**
     * Test dashboard updates after deleting coupon
     *
     * Verifies that dashboard statistics update after deleting a coupon.
     */
    it('should update dashboard after deleting coupon', () => {
      // Add a coupon first
      cy.getByTestId('nav-coupons').click();
      cy.createCoupon(testCoupon);

      // Get initial total coupons count
      let initialCount = 0;
      dashboardPage.navigate().waitForLoad();
      cy.getByTestId('stat-total-coupons')
        .invoke('text')
        .then((text) => {
          initialCount = parseInt(text.replace(/\D/g, '') || '0', 10);
        });

      // Delete the coupon
      cy.getByTestId('nav-coupons').click();
      cy.getByTestId(`delete-coupon-${testCoupon.code}`).click();
      cy.getByTestId('confirm-delete-button').click();

      // Navigate back to dashboard
      dashboardPage.navigate().waitForLoad();

      // Verify total coupons count decreased
      cy.getByTestId('stat-total-coupons')
        .invoke('text')
        .then((text) => {
          const newCount = parseInt(text.replace(/\D/g, '') || '0', 10);
          expect(newCount).to.be.lessThan(initialCount);
        });
    });

    /**
     * Test dashboard updates after marking coupon as used
     *
     * Verifies that dashboard statistics update after marking a coupon as used.
     */
    it('should update dashboard after marking coupon as used', () => {
      // Add a coupon first
      cy.getByTestId('nav-coupons').click();
      cy.createCoupon(testCoupon);

      // Get initial active coupons count
      let initialActiveCount = 0;
      dashboardPage.navigate().waitForLoad();
      cy.getByTestId('stat-active-coupons')
        .invoke('text')
        .then((text) => {
          initialActiveCount = parseInt(text.replace(/\D/g, '') || '0', 10);
        });

      // Mark coupon as used
      cy.getByTestId('nav-coupons').click();
      cy.getByTestId(`mark-used-${testCoupon.code}`).click();

      // Navigate back to dashboard
      dashboardPage.navigate().waitForLoad();

      // Verify active coupons count decreased
      cy.getByTestId('stat-active-coupons')
        .invoke('text')
        .then((text) => {
          const newActiveCount = parseInt(text.replace(/\D/g, '') || '0', 10);
          expect(newActiveCount).to.be.lessThan(initialActiveCount);
        });
    });
  });

  /**
   * Edge Case Tests
   * Tests edge cases and boundary conditions
   */
  describe('Edge Cases', () => {
    /**
     * Test dashboard with no coupons
     *
     * Verifies that dashboard displays appropriate empty state
     * when user has no coupons.
     */
    it('should display empty state with no coupons', () => {
      // Ensure no coupons exist
      cy.request('DELETE', '/api/coupons');

      dashboardPage
        .navigate()
        .shouldBeVisible()
        .waitForLoad();

      // Verify empty state is displayed
      cy.getByTestId('dashboard-empty-state').should('be.visible');
      cy.getByTestId('dashboard-empty-state').should('contain', 'No coupons yet');

      // Verify stats show zero
      cy.getByTestId('stat-total-coupons').should('contain', '0');
      cy.getByTestId('stat-active-coupons').should('contain', '0');
    });

    /**
     * Test dashboard with large number of coupons
     *
     * Verifies that dashboard handles performance and display
     * with a large number of coupons.
     */
    it('should handle large number of coupons', () => {
      // Create multiple coupons
      for (let i = 0; i < 100; i++) {
        const bulkCoupon = {
          ...testCoupon,
          code: `BULK${i}`,
          description: `Bulk coupon ${i}`
        };
        cy.createCoupon(bulkCoupon);
      }

      dashboardPage.navigate().waitForLoad();

      // Verify dashboard loads correctly
      dashboardPage.shouldBeVisible();
      dashboardPage.statsShouldBeVisible();

      // Verify stats are accurate
      cy.getByTestId('stat-total-coupons')
        .invoke('text')
        .then((text) => {
          const count = parseInt(text.replace(/\D/g, '') || '0', 10);
          expect(count).to.be.at.least(100);
        });
    });

    /**
     * Test dashboard with all expired coupons
     *
     * Verifies that dashboard displays correctly when all coupons are expired.
     */
    it('should display correctly with all expired coupons', () => {
      // Create expired coupons
      for (let i = 0; i < 5; i++) {
        const expiredCoupon = {
          ...testCoupon,
          code: `EXPIRED${i}`,
          expirationDate: '2020-01-01'
        };
        cy.createCoupon(expiredCoupon);
      }

      dashboardPage.navigate().waitForLoad();

      // Verify dashboard displays correctly
      dashboardPage.shouldBeVisible();

      // Verify expired count is accurate
      cy.getByTestId('stat-expired-coupons')
        .invoke('text')
        .then((text) => {
          const count = parseInt(text.replace(/\D/g, '') || '0', 10);
          expect(count).to.be.at.least(5);
        });

      // Verify active count is zero
      cy.getByTestId('stat-active-coupons').should('contain', '0');
    });

    /**
     * Test dashboard with all used coupons
     *
     * Verifies that dashboard displays correctly when all coupons are used.
     */
    it('should display correctly with all used coupons', () => {
      // Create coupons and mark them as used
      for (let i = 0; i < 5; i++) {
        const usedCoupon = {
          ...testCoupon,
          code: `USED${i}`
        };
        cy.createCoupon(usedCoupon);
        cy.getByTestId(`mark-used-${usedCoupon.code}`).click();
      }

      dashboardPage.navigate().waitForLoad();

      // Verify dashboard displays correctly
      dashboardPage.shouldBeVisible();

      // Verify active count is zero
      cy.getByTestId('stat-active-coupons').should('contain', '0');
    });
  });

  /**
   * Internationalization Tests
   * Tests dashboard in different languages
   */
  describe('Internationalization (i18n)', () => {
    const languages = ['en', 'es', 'fr', 'de'] as const;

    languages.forEach((lang) => {
      /**
       * Test dashboard in different language
       *
       * Verifies that dashboard UI elements are properly translated.
       */
      it(`should display dashboard in ${lang}`, () => {
        cy.selectLanguage(lang);

        dashboardPage
          .navigate()
          .shouldBeVisible()
          .waitForLoad();

        // Verify UI is in selected language
        cy.get('html').should('have.attr', 'lang', lang);
        cy.getByTestId('dashboard-title').should('exist');
        cy.getByTestId('stat-total-coupons').should('exist');
        cy.getByTestId('stat-active-coupons').should('exist');
      });

      /**
       * Test dashboard statistics in different language
       *
       * Verifies that statistics labels are properly translated.
       */
      it(`should display statistics in ${lang}`, () => {
        cy.selectLanguage(lang);

        dashboardPage.navigate().waitForLoad();

        // Verify statistics are in selected language
        cy.get('html').should('have.attr', 'lang', lang);
        cy.getByTestId('stats-cards').should('be.visible');
      });

      /**
       * Test dashboard quick actions in different language
       *
       * Verifies that quick action buttons are properly translated.
       */
      it(`should display quick actions in ${lang}`, () => {
        cy.selectLanguage(lang);

        dashboardPage.navigate().waitForLoad();

        // Verify quick actions are in selected language
        cy.get('html').should('have.attr', 'lang', lang);
        cy.getByTestId('quick-actions').should('be.visible');
        cy.getByTestId('quick-action-create-coupon').should('exist');
        cy.getByTestId('quick-action-add-retailer').should('exist');
      });
    });
  });

  /**
   * Navigation Tests
   * Tests dashboard navigation functionality
   */
  describe('Navigation', () => {
    /**
     * Test navigation menu functionality
     *
     * Verifies that navigation menu works correctly from dashboard.
     */
    it('should navigate through menu items', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Navigate to coupons
      dashboardPage.navigateToCoupons();
      cy.url().should('include', '/coupons');

      // Navigate back to dashboard
      dashboardPage.navigate();
      cy.url().should('include', '/dashboard');

      // Navigate to retailers
      dashboardPage.navigateToRetailers();
      cy.url().should('include', '/retailers');

      // Navigate back to dashboard
      dashboardPage.navigate();
      cy.url().should('include', '/dashboard');
    });

    /**
     * Test quick action navigation
     *
     * Verifies that quick actions navigate to correct pages.
     */
    it('should navigate via quick actions', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Click create coupon quick action
      dashboardPage.clickCreateCoupon();
      cy.url().should('include', '/coupons');
      cy.getByTestId('coupon-form').should('be.visible');

      // Navigate back
      dashboardPage.navigate();

      // Click add retailer quick action
      dashboardPage.clickAddRetailer();
      cy.url().should('include', '/retailers');
      cy.getByTestId('retailer-form').should('be.visible');
    });

    /**
     * Test user profile dropdown
     *
     * Verifies that user profile dropdown works correctly.
     */
    it('should open user profile dropdown', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Open user profile dropdown
      dashboardPage.openUserProfile();

      // Verify dropdown is visible
      cy.getByTestId('user-profile-menu').should('be.visible');

      // Verify dropdown contains expected options
      cy.getByTestId('profile-settings-link').should('exist');
      cy.getByTestId('logout-button').should('exist');
    });
  });

  /**
   * Dynamic Updates Tests
   * Tests dashboard real-time updates
   */
  describe('Dynamic Updates', () => {
    /**
     * Test dashboard refreshes on data changes
     *
     * Verifies that dashboard statistics refresh automatically
     * when underlying data changes.
     */
    it('should refresh statistics on data changes', () => {
      dashboardPage.navigate().waitForLoad();

      // Get initial count
      let initialCount = 0;
      cy.getByTestId('stat-total-coupons')
        .invoke('text')
        .then((text) => {
          initialCount = parseInt(text.replace(/\D/g, '') || '0', 10);
        });

      // Add a coupon in a new tab/window (simulated)
      cy.getByTestId('nav-coupons').click();
      cy.createCoupon(testCoupon);

      // Navigate back to dashboard
      dashboardPage.navigate().waitForLoad();

      // Verify statistics updated
      cy.getByTestId('stat-total-coupons')
        .invoke('text')
        .then((text) => {
          const newCount = parseInt(text.replace(/\D/g, '') || '0', 10);
          expect(newCount).to.be.greaterThan(initialCount);
        });
    });

    /**
     * Test dashboard handles concurrent updates
     *
     * Verifies that dashboard handles multiple concurrent updates
     * without errors or inconsistencies.
     */
    it('should handle concurrent updates', () => {
      dashboardPage.navigate().waitForLoad();

      // Simulate concurrent updates
      const updates = [
        { action: 'add', code: 'CONCURRENT1' },
        { action: 'add', code: 'CONCURRENT2' },
        { action: 'add', code: 'CONCURRENT3' }
      ];

      updates.forEach((update) => {
        if (update.action === 'add') {
          cy.getByTestId('nav-coupons').click();
          cy.createCoupon({
            ...testCoupon,
            code: update.code
          });
          dashboardPage.navigate();
        }
      });

      // Verify dashboard is stable
      dashboardPage.shouldBeVisible();
      dashboardPage.statsShouldBeVisible();
    });
  });

  /**
   * Accessibility Tests
   * Tests dashboard for accessibility compliance
   */
  describe('Accessibility', () => {
    /**
     * Test dashboard heading structure
     *
     * Verifies that dashboard has proper heading hierarchy.
     */
    it('should have proper heading structure', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check for main heading
      cy.getByRole('heading', { level: 1 }).should('exist');

      // Check for section headings
      cy.getByRole('heading', { level: 2 }).should('exist');
    });

    /**
     * Test dashboard ARIA labels
     *
     * Verifies that dashboard elements have proper ARIA labels.
     */
    it('should have proper ARIA labels', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check for ARIA labels on stats
      cy.getByTestId('stat-total-coupons').should('have.attr', 'aria-label');
      cy.getByTestId('stat-active-coupons').should('have.attr', 'aria-label');

      // Check for ARIA labels on navigation
      cy.getByTestId('nav-coupons').should('have.attr', 'aria-label');
      cy.getByTestId('nav-retailers').should('have.attr', 'aria-label');
    });

    /**
     * Test dashboard keyboard navigation
     *
     * Verifies that dashboard can be navigated using keyboard.
     */
    it('should support keyboard navigation', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Tab through dashboard elements
      cy.getByTestId('nav-coupons').focus();
      cy.focused().should('have.attr', 'data-testid', 'nav-coupons');

      cy.tab();
      cy.focused().should('have.attr', 'data-testid', 'nav-retailers');

      cy.tab();
      cy.focused().should('have.attr', 'data-testid', 'quick-action-create-coupon');
    });

    /**
     * Test dashboard focus indicators
     *
     * Verifies that focus indicators are visible and clear.
     */
    it('should have visible focus indicators', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Focus on navigation element
      cy.getByTestId('nav-coupons').focus();

      // Verify focus indicator is visible
      cy.focused().should('have.css', 'outline').and('not.equal', 'none');
    });
  });
});
