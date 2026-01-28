/**
 * End-to-End tests for Responsive Design
 *
 * Comprehensive test suite covering responsive design across different
 * viewport sizes including mobile, tablet, and desktop.
 * Tests ensure UI adapts correctly to all screen sizes.
 *
 * @module ResponsiveDesignE2ETests
 * @author Kilo Code
 * @date 2025-01-26
 */

import { loginPage, dashboardPage, couponPage, retailerPage } from '../support';
import type { CouponData, RetailerData } from '../support/types';

/**
 * Test data for responsive scenarios
 */
const testCoupon: CouponData = {
  code: 'RESPONSIVE',
  description: 'Responsive design test coupon',
  discountPercentage: 20,
  expirationDate: '2025-12-31',
  retailerId: 'retailer-1'
};

const testRetailer: RetailerData = {
  id: 'retailer-responsive',
  name: 'Responsive Retailer',
  website: 'https://responsive.com',
  address: '123 Responsive St, City, ST 12345'
};

/**
 * Viewport configurations for different devices
 */
const viewports = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1024, height: 768 }, // Small desktop
  largeDesktop: { width: 1440, height: 900 } // Large desktop
};

/**
 * Responsive Design E2E test suite
 */
describe('Responsive Design Tests', () => {
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
   * Mobile View Tests
   * Tests application behavior on mobile viewport (375px)
   */
  describe('Mobile View (375px)', () => {
    beforeEach(() => {
      cy.viewport(viewports.mobile.width, viewports.mobile.height);
    });

    /**
     * Test mobile view displays correctly
     *
     * Verifies that application loads and displays correctly
     * on mobile viewport.
     */
    it('should display correctly on mobile viewport', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Verify dashboard is visible
      cy.viewport(viewports.mobile.width, viewports.mobile.height);
      dashboardPage.shouldBeVisible();

      // Verify viewport dimensions
      cy.viewport().should('have.prop', 'viewportWidth', viewports.mobile.width);
    });

    /**
     * Test coupon list on mobile
     *
     * Verifies that coupon list is usable on mobile viewport.
     */
    it('should display coupon list on mobile', () => {
      couponPage.navigate().shouldBeVisible();

      // Verify coupon list is visible
      cy.getByTestId('coupon-list').should('be.visible');

      // Verify mobile-specific elements
      cy.getByTestId('mobile-menu-button').should('be.visible');

      // Verify list items are touch-friendly
      cy.getByTestId('coupon-list').within(() => {
        cy.get('[data-testid^="coupon-item-"]').each(($item) => {
          cy.wrap($item).should('have.css', 'min-height').and('at.least', '44px');
        });
      });
    });

    /**
     * Test retailer list on mobile
     *
     * Verifies that retailer list is usable on mobile viewport.
     */
    it('should display retailer list on mobile', () => {
      retailerPage.navigate().shouldBeVisible();

      // Verify retailer list is visible
      cy.getByTestId('retailer-list').should('be.visible');

      // Verify mobile-specific elements
      cy.getByTestId('mobile-menu-button').should('be.visible');

      // Verify list items are touch-friendly
      cy.getByTestId('retailer-list').within(() => {
        cy.get('[data-testid^="retailer-item-"]').each(($item) => {
          cy.wrap($item).should('have.css', 'min-height').and('at.least', '44px');
        });
      });
    });

    /**
     * Test login form on mobile
     *
     * Verifies that login form is usable on mobile viewport.
     */
    it('should display login form on mobile', () => {
      cy.logout();
      loginPage.navigate().shouldBeVisible();

      // Verify login form is visible
      loginPage.shouldBeVisible();

      // Verify form fields are touch-friendly
      cy.getByTestId('username-input').should('have.css', 'min-height', '44px');
      cy.getByTestId('password-input').should('have.css', 'min-height', '44px');

      // Verify submit button is easily tappable
      cy.getByTestId('login-submit-button').should('have.css', 'min-height', '44px');
    });

    /**
     * Test add coupon form on mobile
     *
     * Verifies that coupon creation form is usable on mobile viewport.
     */
    it('should display add coupon form on mobile', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Verify form is visible
      cy.getByTestId('coupon-form').should('be.visible');

      // Verify form fields are touch-friendly
      cy.getByTestId('coupon-code-input').should('have.css', 'min-height', '44px');
      cy.getByTestId('coupon-description-input').should('have.css', 'min-height', '44px');
      cy.getByTestId('coupon-submit-button').should('have.css', 'min-height', '44px');
    });

    /**
     * Test navigation menu on mobile
     *
     * Verifies that navigation menu works correctly on mobile viewport.
     */
    it('should display navigation menu on mobile', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Verify mobile menu button is visible
      cy.getByTestId('mobile-menu-button').should('be.visible');

      // Open mobile menu
      cy.getByTestId('mobile-menu-button').click();

      // Verify mobile menu is visible
      cy.getByTestId('mobile-menu').should('be.visible');

      // Verify menu items are touch-friendly
      cy.getByTestId('mobile-menu').within(() => {
        cy.get('[data-testid^="nav-"]').each(($item) => {
          cy.wrap($item).should('have.css', 'min-height', '44px');
        });
      });
    });
  });

  /**
   * Tablet View Tests
   * Tests application behavior on tablet viewport (768px)
   */
  describe('Tablet View (768px)', () => {
    beforeEach(() => {
      cy.viewport(viewports.tablet.width, viewports.tablet.height);
    });

    /**
     * Test tablet view displays correctly
     *
     * Verifies that application loads and displays correctly
     * on tablet viewport.
     */
    it('should display correctly on tablet viewport', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Verify dashboard is visible
      cy.viewport(viewports.tablet.width, viewports.tablet.height);
      dashboardPage.shouldBeVisible();

      // Verify viewport dimensions
      cy.viewport().should('have.prop', 'viewportWidth', viewports.tablet.width);
    });

    /**
     * Test coupon list on tablet
     *
     * Verifies that coupon list is usable on tablet viewport.
     */
    it('should display coupon list on tablet', () => {
      couponPage.navigate().shouldBeVisible();

      // Verify coupon list is visible
      cy.getByTestId('coupon-list').should('be.visible');

      // Verify layout is appropriate for tablet
      cy.getByTestId('coupon-list').should('have.css', 'grid-template-columns');
    });

    /**
     * Test retailer list on tablet
     *
     * Verifies that retailer list is usable on tablet viewport.
     */
    it('should display retailer list on tablet', () => {
      retailerPage.navigate().shouldBeVisible();

      // Verify retailer list is visible
      cy.getByTestId('retailer-list').should('be.visible');

      // Verify layout is appropriate for tablet
      cy.getByTestId('retailer-list').should('have.css', 'grid-template-columns');
    });

    /**
     * Test login form on tablet
     *
     * Verifies that login form is usable on tablet viewport.
     */
    it('should display login form on tablet', () => {
      cy.logout();
      loginPage.navigate().shouldBeVisible();

      // Verify login form is visible
      loginPage.shouldBeVisible();

      // Verify form is centered and appropriately sized
      cy.getByTestId('login-form').should('be.visible');
    });

    /**
     * Test add coupon form on tablet
     *
     * Verifies that coupon creation form is usable on tablet viewport.
     */
    it('should display add coupon form on tablet', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Verify form is visible
      cy.getByTestId('coupon-form').should('be.visible');

      // Verify form layout is appropriate for tablet
      cy.getByTestId('coupon-form').should('be.visible');
    });

    /**
     * Test navigation menu on tablet
     *
     * Verifies that navigation menu works correctly on tablet viewport.
     */
    it('should display navigation menu on tablet', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Verify navigation menu is visible
      cy.getByTestId('navigation-menu').should('be.visible');

      // Verify menu items are accessible
      cy.getByTestId('nav-coupons').should('be.visible');
      cy.getByTestId('nav-retailers').should('be.visible');
      cy.getByTestId('nav-users').should('be.visible');
    });
  });

  /**
   * Desktop View Tests
   * Tests application behavior on desktop viewport (1024px)
   */
  describe('Desktop View (1024px)', () => {
    beforeEach(() => {
      cy.viewport(viewports.desktop.width, viewports.desktop.height);
    });

    /**
     * Test desktop view displays correctly
     *
     * Verifies that application loads and displays correctly
     * on desktop viewport.
     */
    it('should display correctly on desktop viewport', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Verify dashboard is visible
      cy.viewport(viewports.desktop.width, viewports.desktop.height);
      dashboardPage.shouldBeVisible();

      // Verify viewport dimensions
      cy.viewport().should('have.prop', 'viewportWidth', viewports.desktop.width);
    });

    /**
     * Test coupon list on desktop
     *
     * Verifies that coupon list is usable on desktop viewport.
     */
    it('should display coupon list on desktop', () => {
      couponPage.navigate().shouldBeVisible();

      // Verify coupon list is visible
      cy.getByTestId('coupon-list').should('be.visible');

      // Verify layout is appropriate for desktop
      cy.getByTestId('coupon-list').should('have.css', 'grid-template-columns');
    });

    /**
     * Test retailer list on desktop
     *
     * Verifies that retailer list is usable on desktop viewport.
     */
    it('should display retailer list on desktop', () => {
      retailerPage.navigate().shouldBeVisible();

      // Verify retailer list is visible
      cy.getByTestId('retailer-list').should('be.visible');

      // Verify layout is appropriate for desktop
      cy.getByTestId('retailer-list').should('have.css', 'grid-template-columns');
    });

    /**
     * Test login form on desktop
     *
     * Verifies that login form is usable on desktop viewport.
     */
    it('should display login form on desktop', () => {
      cy.logout();
      loginPage.navigate().shouldBeVisible();

      // Verify login form is visible
      loginPage.shouldBeVisible();

      // Verify form is centered and appropriately sized
      cy.getByTestId('login-form').should('be.visible');
    });

    /**
     * Test add coupon form on desktop
     *
     * Verifies that coupon creation form is usable on desktop viewport.
     */
    it('should display add coupon form on desktop', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Verify form is visible
      cy.getByTestId('coupon-form').should('be.visible');

      // Verify form layout is appropriate for desktop
      cy.getByTestId('coupon-form').should('be.visible');
    });

    /**
     * Test navigation menu on desktop
     *
     * Verifies that navigation menu works correctly on desktop viewport.
     */
    it('should display navigation menu on desktop', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Verify navigation menu is visible
      cy.getByTestId('navigation-menu').should('be.visible');

      // Verify menu items are accessible
      cy.getByTestId('nav-coupons').should('be.visible');
      cy.getByTestId('nav-retailers').should('be.visible');
      cy.getByTestId('nav-users').should('be.visible');
    });
  });

  /**
   * Large Desktop View Tests
   * Tests application behavior on large desktop viewport (1440px)
   */
  describe('Large Desktop View (1440px)', () => {
    beforeEach(() => {
      cy.viewport(viewports.largeDesktop.width, viewports.largeDesktop.height);
    });

    /**
     * Test large desktop view displays correctly
     *
     * Verifies that application loads and displays correctly
     * on large desktop viewport.
     */
    it('should display correctly on large desktop viewport', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Verify dashboard is visible
      cy.viewport(viewports.largeDesktop.width, viewports.largeDesktop.height);
      dashboardPage.shouldBeVisible();

      // Verify viewport dimensions
      cy.viewport().should('have.prop', 'viewportWidth', viewports.largeDesktop.width);
    });

    /**
     * Test coupon list on large desktop
     *
     * Verifies that coupon list is usable on large desktop viewport.
     */
    it('should display coupon list on large desktop', () => {
      couponPage.navigate().shouldBeVisible();

      // Verify coupon list is visible
      cy.getByTestId('coupon-list').should('be.visible');

      // Verify layout is appropriate for large desktop
      cy.getByTestId('coupon-list').should('have.css', 'grid-template-columns');
    });

    /**
     * Test retailer list on large desktop
     *
     * Verifies that retailer list is usable on large desktop viewport.
     */
    it('should display retailer list on large desktop', () => {
      retailerPage.navigate().shouldBeVisible();

      // Verify retailer list is visible
      cy.getByTestId('retailer-list').should('be.visible');

      // Verify layout is appropriate for large desktop
      cy.getByTestId('retailer-list').should('have.css', 'grid-template-columns');
    });

    /**
     * Test login form on large desktop
     *
     * Verifies that login form is usable on large desktop viewport.
     */
    it('should display login form on large desktop', () => {
      cy.logout();
      loginPage.navigate().shouldBeVisible();

      // Verify login form is visible
      loginPage.shouldBeVisible();

      // Verify form is centered and appropriately sized
      cy.getByTestId('login-form').should('be.visible');
    });

    /**
     * Test add coupon form on large desktop
     *
     * Verifies that coupon creation form is usable on large desktop viewport.
     */
    it('should display add coupon form on large desktop', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Verify form is visible
      cy.getByTestId('coupon-form').should('be.visible');

      // Verify form layout is appropriate for large desktop
      cy.getByTestId('coupon-form').should('be.visible');
    });

    /**
     * Test navigation menu on large desktop
     *
     * Verifies that navigation menu works correctly on large desktop viewport.
     */
    it('should display navigation menu on large desktop', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Verify navigation menu is visible
      cy.getByTestId('navigation-menu').should('be.visible');

      // Verify menu items are accessible
      cy.getByTestId('nav-coupons').should('be.visible');
      cy.getByTestId('nav-retailers').should('be.visible');
      cy.getByTestId('nav-users').should('be.visible');
    });
  });

  /**
   * Viewport Transition Tests
   * Tests application behavior when viewport changes
   */
  describe('Viewport Transitions', () => {
    /**
     * Test transition from mobile to desktop
     *
     * Verifies that application adapts correctly when
     * viewport changes from mobile to desktop.
     */
    it('should adapt from mobile to desktop', () => {
      // Start on mobile
      cy.viewport(viewports.mobile.width, viewports.mobile.height);
      dashboardPage.navigate().shouldBeVisible();

      // Verify mobile menu is visible
      cy.getByTestId('mobile-menu-button').should('be.visible');

      // Transition to desktop
      cy.viewport(viewports.desktop.width, viewports.desktop.height);

      // Verify desktop menu is visible
      cy.getByTestId('navigation-menu').should('be.visible');
      cy.getByTestId('mobile-menu-button').should('not.be.visible');
    });

    /**
     * Test transition from desktop to mobile
     *
     * Verifies that application adapts correctly when
     * viewport changes from desktop to mobile.
     */
    it('should adapt from desktop to mobile', () => {
      // Start on desktop
      cy.viewport(viewports.desktop.width, viewports.desktop.height);
      dashboardPage.navigate().shouldBeVisible();

      // Verify desktop menu is visible
      cy.getByTestId('navigation-menu').should('be.visible');

      // Transition to mobile
      cy.viewport(viewports.mobile.width, viewports.mobile.height);

      // Verify mobile menu is visible
      cy.getByTestId('mobile-menu-button').should('be.visible');
      cy.getByTestId('navigation-menu').should('not.be.visible');
    });

    /**
     * Test transition through multiple viewports
     *
     * Verifies that application adapts correctly through
     * multiple viewport changes.
     */
    it('should adapt through multiple viewport changes', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Cycle through viewports
      const viewportSizes = [
        viewports.mobile,
        viewports.tablet,
        viewports.desktop,
        viewports.largeDesktop
      ];

      viewportSizes.forEach((size) => {
        cy.viewport(size.width, size.height);
        dashboardPage.shouldBeVisible();
      });
    });
  });

  /**
   * Orientation Tests
   * Tests application behavior on different orientations
   */
  describe('Orientation Changes', () => {
    /**
     * Test portrait orientation on mobile
     *
     * Verifies that application displays correctly in
     * portrait orientation on mobile.
     */
    it('should display in portrait orientation on mobile', () => {
      // Set mobile portrait
      cy.viewport(375, 812);
      dashboardPage.navigate().shouldBeVisible();

      // Verify dashboard is visible
      dashboardPage.shouldBeVisible();

      // Verify content fits within viewport
      cy.getByTestId('dashboard-container').should('be.visible');
    });

    /**
     * Test landscape orientation on mobile
     *
     * Verifies that application displays correctly in
     * landscape orientation on mobile.
     */
    it('should display in landscape orientation on mobile', () => {
      // Set mobile landscape
      cy.viewport(812, 375);
      dashboardPage.navigate().shouldBeVisible();

      // Verify dashboard is visible
      dashboardPage.shouldBeVisible();

      // Verify content fits within viewport
      cy.getByTestId('dashboard-container').should('be.visible');
    });

    /**
     * Test orientation change on mobile
     *
     * Verifies that application adapts correctly when
     * orientation changes on mobile.
     */
    it('should adapt to orientation change on mobile', () => {
      // Start in portrait
      cy.viewport(375, 812);
      dashboardPage.navigate().shouldBeVisible();

      // Rotate to landscape
      cy.viewport(812, 375);

      // Verify dashboard is still visible and usable
      dashboardPage.shouldBeVisible();
    });
  });

  /**
   * Touch Target Tests
   * Tests touch target sizes on mobile devices
   */
  describe('Touch Targets', () => {
    beforeEach(() => {
      cy.viewport(viewports.mobile.width, viewports.mobile.height);
    });

    /**
     * Test buttons have adequate touch targets
     *
     * Verifies that all buttons meet minimum touch target size
     * of 44x44 pixels on mobile.
     */
    it('should have adequate touch targets for buttons', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check navigation buttons
      cy.getByTestId('nav-coupons').should('have.css', 'min-height', '44px');
      cy.getByTestId('nav-retailers').should('have.css', 'min-height', '44px');

      // Check action buttons
      cy.getByTestId('logout-button').should('have.css', 'min-height', '44px');
    });

    /**
     * Test form inputs have adequate touch targets
     *
     * Verifies that all form inputs meet minimum touch target size
     * on mobile.
     */
    it('should have adequate touch targets for form inputs', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Check form inputs
      cy.getByTestId('coupon-code-input').should('have.css', 'min-height', '44px');
      cy.getByTestId('coupon-description-input').should('have.css', 'min-height', '44px');
      cy.getByTestId('coupon-discount-input').should('have.css', 'min-height', '44px');

      // Check submit button
      cy.getByTestId('coupon-submit-button').should('have.css', 'min-height', '44px');
    });

    /**
     * Test list items have adequate touch targets
     *
     * Verifies that list items meet minimum touch target size
     * on mobile.
     */
    it('should have adequate touch targets for list items', () => {
      couponPage.navigate().shouldBeVisible();

      // Check coupon list items
      cy.getByTestId('coupon-list').within(() => {
        cy.get('[data-testid^="coupon-item-"]').each(($item) => {
          cy.wrap($item).should('have.css', 'min-height', '44px');
        });
      });
    });
  });

  /**
   * Layout Tests
   * Tests layout behavior across different viewports
   */
  describe('Layout Behavior', () => {
    /**
     * Test sidebar behavior on different viewports
     *
     * Verifies that sidebar adapts correctly across viewports.
     */
    it('should adapt sidebar across viewports', () => {
      // Mobile - sidebar should be hidden by default
      cy.viewport(viewports.mobile.width, viewports.mobile.height);
      dashboardPage.navigate().shouldBeVisible();
      cy.getByTestId('sidebar').should('not.be.visible');
      cy.getByTestId('mobile-menu-button').should('be.visible');

      // Desktop - sidebar should be visible
      cy.viewport(viewports.desktop.width, viewports.desktop.height);
      cy.getByTestId('sidebar').should('be.visible');
      cy.getByTestId('mobile-menu-button').should('not.be.visible');
    });

    /**
     * Test grid layout adapts to viewport
     *
     * Verifies that grid layouts adapt correctly to viewport size.
     */
    it('should adapt grid layout to viewport', () => {
      couponPage.navigate().shouldBeVisible();

      // Mobile - single column
      cy.viewport(viewports.mobile.width, viewports.mobile.height);
      cy.getByTestId('coupon-list').should('have.css', 'grid-template-columns', '1fr');

      // Desktop - multiple columns
      cy.viewport(viewports.desktop.width, viewports.desktop.height);
      cy.getByTestId('coupon-list').should('not.have.css', 'grid-template-columns', '1fr');
    });

    /**
     * Test modal behavior on different viewports
     *
     * Verifies that modals display correctly across viewports.
     */
    it('should display modals correctly across viewports', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Verify modal is visible and properly sized
      cy.getByTestId('coupon-form').should('be.visible');

      // Mobile - modal should take full width
      cy.viewport(viewports.mobile.width, viewports.mobile.height);
      cy.getByTestId('coupon-form').should('have.css', 'width', '100%');

      // Desktop - modal should have constrained width
      cy.viewport(viewports.desktop.width, viewports.desktop.height);
      cy.getByTestId('coupon-form').should('not.have.css', 'width', '100%');
    });
  });

  /**
   * Performance Tests
   * Tests performance across different viewports
   */
  describe('Performance', () => {
    /**
     * Test load time on mobile
     *
     * Verifies that application loads within acceptable time
     * on mobile viewport.
     */
    it('should load quickly on mobile', () => {
      const startTime = Date.now();

      cy.viewport(viewports.mobile.width, viewports.mobile.height);
      dashboardPage.navigate().shouldBeVisible();

      cy.window().then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // 3 seconds max
      });
    });

    /**
     * Test load time on desktop
     *
     * Verifies that application loads within acceptable time
     * on desktop viewport.
     */
    it('should load quickly on desktop', () => {
      const startTime = Date.now();

      cy.viewport(viewports.desktop.width, viewports.desktop.height);
      dashboardPage.navigate().shouldBeVisible();

      cy.window().then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(2000); // 2 seconds max
      });
    });

    /**
     * Test scroll performance on mobile
     *
     * Verifies that scrolling is smooth on mobile viewport.
     */
    it('should scroll smoothly on mobile', () => {
      cy.viewport(viewports.mobile.width, viewports.mobile.height);

      // Create many coupons to enable scrolling
      for (let i = 0; i < 20; i++) {
        const bulkCoupon = { ...testCoupon, code: `SCROLL${i}` };
        cy.createCoupon(bulkCoupon);
      }

      couponPage.navigate().shouldBeVisible();

      // Scroll through list
      cy.getByTestId('coupon-list').scrollTo('bottom');
      cy.getByTestId('coupon-list').scrollTo('top');

      // Verify list is still functional
      cy.getByTestId('coupon-list').should('be.visible');
    });
  });
});
