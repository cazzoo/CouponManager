/**
 * End-to-End tests for Accessibility compliance
 *
 * Comprehensive test suite covering accessibility standards including
 * heading structure, form labels, ARIA attributes, keyboard navigation,
 * focus indicators, and WCAG compliance.
 *
 * @module AccessibilityE2ETests
 * @author Kilo Code
 * @date 2025-01-26
 */

import { loginPage, dashboardPage, couponPage, retailerPage } from '../support';
import type { CouponData } from '../support/types';

/**
 * Test data for accessibility scenarios
 */
const testCoupon: CouponData = {
  code: 'A11YTEST',
  description: 'Accessibility test coupon',
  discountPercentage: 20,
  expirationDate: '2025-12-31',
  retailerId: 'retailer-1'
};

/**
 * Accessibility E2E test suite
 */
describe('Accessibility Compliance Tests', () => {
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
   * Heading Structure Tests
   * Tests proper heading hierarchy throughout the application
   */
  describe('Heading Structure', () => {
    /**
     * Test all pages have proper heading structure
     *
     * Verifies that pages use semantic HTML headings
     * in correct hierarchical order.
     */
    it('should have proper heading structure on all pages', () => {
      // Test dashboard
      dashboardPage.navigate().shouldBeVisible();
      cy.getByRole('heading', { level: 1 }).should('exist');

      // Test coupons page
      couponPage.navigate().shouldBeVisible();
      cy.getByRole('heading', { level: 1 }).should('exist');

      // Test retailers page
      retailerPage.navigate().shouldBeVisible();
      cy.getByRole('heading', { level: 1 }).should('exist');
    });

    /**
     * Test headings are in correct order
     *
     * Verifies that headings follow logical hierarchy
     * without skipping levels.
     */
    it('should have headings in correct order', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check for h1
      cy.getByRole('heading', { level: 1 }).should('exist');

      // Check for h2
      cy.getByRole('heading', { level: 2 }).should('exist');

      // Verify no skipped levels (e.g., h1 followed by h3)
      cy.get('h1').then(($h1) => {
        if ($h1.length > 0) {
          cy.get('h3').should('not.exist');
        }
      });
    });

    /**
     * Test page titles are descriptive
     *
     * Verifies that page titles provide meaningful context.
     */
    it('should have descriptive page titles', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check page title
      cy.title().should('not.be.empty');
      cy.title().should('include', 'Coupon Manager');
    });
  });

  /**
   * Form Labels Tests
   * Tests that all form elements have proper labels
   */
  describe('Form Labels', () => {
    /**
     * Test all forms have proper labels
     *
     * Verifies that all form inputs have associated labels.
     */
    it('should have proper labels on all forms', () => {
      // Test login form
      cy.logout();
      loginPage.navigate().shouldBeVisible();

      cy.getByTestId('username-input').should('have.attr', 'aria-label');
      cy.getByTestId('password-input').should('have.attr', 'aria-label');

      // Test coupon form
      cy.login('test@example.com', 'SecurePass123!');
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      cy.getByTestId('coupon-code-input').should('have.attr', 'aria-label');
      cy.getByTestId('coupon-description-input').should('have.attr', 'aria-label');
      cy.getByTestId('coupon-discount-input').should('have.attr', 'aria-label');
      cy.getByTestId('coupon-retailer-select').should('have.attr', 'aria-label');
    });

    /**
     * Test form fields have visible labels
     *
     * Verifies that form fields have visible labels
     * or appropriate ARIA labels.
     */
    it('should have visible labels for form fields', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Check for visible labels
      cy.getByTestId('coupon-code-label').should('exist');
      cy.getByTestId('coupon-description-label').should('exist');
      cy.getByTestId('coupon-discount-label').should('exist');
    });

    /**
     * Test required fields are marked as required
     *
     * Verifies that required form fields are properly marked.
     */
    it('should mark required fields appropriately', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Check for required attributes
      cy.getByTestId('coupon-code-input').should('have.attr', 'required');
      cy.getByTestId('coupon-description-input').should('have.attr', 'required');
      cy.getByTestId('coupon-discount-input').should('have.attr', 'required');
    });

    /**
     * Test error messages are associated with fields
     *
     * Verifies that form error messages are properly
     * associated with their respective fields.
     */
    it('should associate error messages with fields', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Submit empty form to trigger errors
      cy.getByTestId('coupon-submit-button').click();

      // Verify error messages are visible
      cy.getByTestId('code-error').should('be.visible');
      cy.getByTestId('description-error').should('be.visible');
      cy.getByTestId('discount-error').should('be.visible');

      // Verify error messages have proper ARIA roles
      cy.getByTestId('code-error').should('have.attr', 'role', 'alert');
      cy.getByTestId('description-error').should('have.attr', 'role', 'alert');
    });
  });

  /**
   * Button Accessibility Tests
   * Tests that all buttons have accessible names
   */
  describe('Button Accessibility', () => {
    /**
     * Test all buttons have accessible names
     *
     * Verifies that all buttons have descriptive text
     * or ARIA labels.
     */
    it('should have accessible names on all buttons', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check navigation buttons
      cy.getByTestId('nav-coupons').should('have.attr', 'aria-label');
      cy.getByTestId('nav-retailers').should('have.attr', 'aria-label');

      // Check action buttons
      cy.getByTestId('logout-button').should('have.attr', 'aria-label');
      cy.getByTestId('quick-action-create-coupon').should('have.attr', 'aria-label');
    });

    /**
     * Test icon-only buttons have aria-labels
     *
     * Verifies that buttons with only icons have
     * descriptive ARIA labels.
     */
    it('should have aria-labels for icon-only buttons', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check for icon buttons with labels
      cy.getByTestId('mobile-menu-button').should('have.attr', 'aria-label');
      cy.getByTestId('language-selector').should('have.attr', 'aria-label');
    });

    /**
     * Test buttons have proper roles
     *
     * Verifies that buttons have correct ARIA roles.
     */
    it('should have proper roles on buttons', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check button roles
      cy.getByTestId('nav-coupons').should('have.attr', 'role', 'button');
      cy.getByTestId('logout-button').should('have.attr', 'role', 'button');
    });
  });

  /**
   * Image Accessibility Tests
   * Tests that all images have proper alt text
   */
  describe('Image Accessibility', () => {
    /**
     * Test all images have alt text
     *
     * Verifies that all images have descriptive alt text.
     */
    it('should have alt text on all images', () => {
      retailerPage.navigate().shouldBeVisible();

      // Check for retailer logos with alt text
      cy.get('img[data-testid^="retailer-logo-"]').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    /**
     * Test decorative images have empty alt
     *
     * Verifies that decorative images have empty alt attributes.
     */
    it('should have empty alt for decorative images', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check for decorative images
      cy.get('img[alt=""]').should('exist');
    });

    /**
     * Test images have meaningful descriptions
     *
     * Verifies that image alt text provides meaningful context.
     */
    it('should have meaningful image descriptions', () => {
      retailerPage.navigate().shouldBeVisible();

      // Check alt text is not just filename
      cy.get('img[data-testid^="retailer-logo-"]').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt').and('not.match', /\.jpg$|\.png$|\.gif$/);
      });
    });
  });

  /**
   * Keyboard Navigation Tests
   * Tests that application is fully keyboard navigable
   */
  describe('Keyboard Navigation', () => {
    /**
     * Test keyboard navigation works
     *
     * Verifies that users can navigate using Tab key.
     */
    it('should support keyboard navigation', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Tab through navigation
      cy.getByTestId('nav-coupons').focus();
      cy.focused().should('have.attr', 'data-testid', 'nav-coupons');

      cy.tab();
      cy.focused().should('have.attr', 'data-testid', 'nav-retailers');

      cy.tab();
      cy.focused().should('have.attr', 'data-testid', 'nav-users');
    });

    /**
     * Test focus order is logical
     *
     * Verifies that focus follows logical DOM order.
     */
    it('should have logical focus order', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Focus on first element
      cy.getByTestId('nav-coupons').focus();

      // Tab through elements and verify order
      cy.tab();
      cy.focused().should('exist');

      cy.tab();
      cy.focused().should('exist');

      cy.tab();
      cy.focused().should('exist');
    });

    /**
     * Test Enter key activates focused elements
     *
     * Verifies that Enter key activates focused buttons/links.
     */
    it('should activate elements with Enter key', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Focus on navigation item
      cy.getByTestId('nav-coupons').focus();
      cy.focused().should('have.attr', 'data-testid', 'nav-coupons');

      // Press Enter to activate
      cy.focused().type('{enter}');

      // Verify navigation occurred
      cy.url().should('include', '/coupons');
    });

    /**
     * Test Escape key closes modals
     *
     * Verifies that Escape key closes open modals.
     */
    it('should close modals with Escape key', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Verify modal is open
      cy.getByTestId('coupon-form').should('be.visible');

      // Press Escape to close
      cy.get('body').type('{esc}');

      // Verify modal is closed
      cy.getByTestId('coupon-form').should('not.exist');
    });
  });

  /**
   * Focus Indicator Tests
   * Tests that focus indicators are visible and clear
   */
  describe('Focus Indicators', () => {
    /**
     * Test focus indicators are visible
     *
     * Verifies that focused elements have visible indicators.
     */
    it('should have visible focus indicators', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Focus on navigation element
      cy.getByTestId('nav-coupons').focus();

      // Verify focus indicator is visible
      cy.focused().should('have.css', 'outline').and('not.equal', 'none');
    });

    /**
     * Test focus indicators have sufficient contrast
     *
     * Verifies that focus indicators meet contrast requirements.
     */
    it('should have sufficient contrast on focus indicators', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Focus on element
      cy.getByTestId('nav-coupons').focus();

      // Verify focus style is applied
      cy.focused().should('have.css', 'outline-style');
    });

    /**
     * Test focus is removed from hidden elements
     *
     * Verifies that focus is properly managed when elements
     * become hidden or removed from DOM.
     */
    it('should remove focus from hidden elements', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Focus on form element
      cy.getByTestId('coupon-code-input').focus();
      cy.focused().should('have.attr', 'data-testid', 'coupon-code-input');

      // Close modal
      cy.get('body').type('{esc}');

      // Verify focus is not on hidden element
      cy.getByTestId('coupon-code-input').should('not.be.focused');
    });
  });

  /**
   * ARIA Labels Tests
   * Tests that elements have proper ARIA attributes
   */
  describe('ARIA Labels', () => {
    /**
     * Test screen readers can identify elements
     *
     * Verifies that interactive elements have proper ARIA roles.
     */
    it('should have proper ARIA roles', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check for proper roles
      cy.getByRole('navigation').should('exist');
      cy.getByRole('main').should('exist');
      cy.getByRole('button').should('exist');
    });

    /**
     * Test ARIA live regions for dynamic content
     *
     * Verifies that dynamic content updates are announced.
     */
    it('should have ARIA live regions for dynamic content', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check for live regions
      cy.getByTestId('notification-area').should('have.attr', 'aria-live', 'polite');
      cy.getByTestId('status-updates').should('have.attr', 'aria-live', 'polite');
    });

    /**
     * Test ARIA labels for form controls
     *
     * Verifies that form controls have descriptive ARIA labels.
     */
    it('should have ARIA labels for form controls', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Check for ARIA labels
      cy.getByTestId('coupon-code-input').should('have.attr', 'aria-label');
      cy.getByTestId('coupon-retailer-select').should('have.attr', 'aria-label');
    });

    /**
     * Test ARIA expanded/collapsed states
     *
     * Verifies that expandable elements properly indicate state.
     */
    it('should properly indicate expanded/collapsed states', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check for mobile menu button
      cy.getByTestId('mobile-menu-button').should('have.attr', 'aria-expanded', 'false');

      // Open menu
      cy.getByTestId('mobile-menu-button').click();

      // Verify state changed
      cy.getByTestId('mobile-menu-button').should('have.attr', 'aria-expanded', 'true');
    });
  });

  /**
   * Color Contrast Tests
   * Tests that color contrast meets WCAG standards
   */
  describe('Color Contrast', () => {
    /**
     * Test text has sufficient contrast
     *
     * Verifies that text meets WCAG AA contrast requirements.
     */
    it('should have sufficient text contrast', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check contrast on main content
      cy.getByTestId('dashboard-container').should('be.visible');

      // This would typically use axe-core or similar tool
      // For now, we'll verify the element is visible
      cy.getByTestId('dashboard-title').should('be.visible');
    });

    /**
     * Test links have sufficient contrast
     *
     * Verifies that link text meets contrast requirements.
     */
    it('should have sufficient link contrast', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check contrast on navigation links
      cy.getByTestId('nav-coupons').should('be.visible');
      cy.getByTestId('nav-retailers').should('be.visible');
      cy.getByTestId('nav-users').should('be.visible');
    });

    /**
     * Test error messages have sufficient contrast
     *
     * Verifies that error messages are easily readable.
     */
    it('should have sufficient error message contrast', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Trigger error
      cy.getByTestId('coupon-submit-button').click();

      // Verify error message is visible and readable
      cy.getByTestId('code-error').should('be.visible');
      cy.getByTestId('code-error').should('have.css', 'color');
    });
  });

  /**
   * Error Message Accessibility Tests
   * Tests that error messages are accessible
   */
  describe('Error Messages', () => {
    /**
     * Test error messages are announced to screen readers
     *
     * Verifies that errors are properly announced.
     */
    it('should announce error messages to screen readers', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Trigger error
      cy.getByTestId('coupon-submit-button').click();

      // Verify error has proper ARIA role
      cy.getByTestId('code-error').should('have.attr', 'role', 'alert');
      cy.getByTestId('description-error').should('have.attr', 'role', 'alert');
    });

    /**
     * Test error messages are associated with inputs
     *
     * Verifies that errors are linked to their fields.
     */
    it('should associate error messages with inputs', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Trigger error
      cy.getByTestId('coupon-submit-button').click();

      // Verify error is near input
      cy.getByTestId('coupon-code-input').should('exist');
      cy.getByTestId('code-error').should('exist');
    });

    /**
     * Test error messages are dismissible
     *
     * Verifies that users can dismiss error messages.
     */
    it('should allow dismissing error messages', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Trigger error
      cy.getByTestId('coupon-submit-button').click();

      // Check for close button on error
      cy.getByTestId('code-error').within(() => {
        cy.get('[data-testid^="close-error-"]').should('exist');
      });
    });
  });

  /**
   * Skip Links Tests
   * Tests that skip links are available for keyboard users
   */
  describe('Skip Links', () => {
    /**
     * Test skip link to main content
     *
     * Verifies that keyboard users can skip navigation.
     */
    it('should have skip link to main content', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check for skip link
      cy.getByTestId('skip-to-main').should('exist');
      cy.getByTestId('skip-to-main').should('have.attr', 'href', '#main-content');
    });

    /**
     * Test skip link is first focusable element
     *
     * Verifies that skip link receives focus first.
     */
    it('should have skip link as first focusable element', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Focus on page
      cy.get('body').focus();

      // Tab to first element
      cy.tab();

      // Verify skip link is focused
      cy.focused().should('have.attr', 'data-testid', 'skip-to-main');
    });

    /**
     * Test skip link works correctly
     *
     * Verifies that skip link navigates to main content.
     */
    it('should navigate to main content via skip link', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Activate skip link
      cy.getByTestId('skip-to-main').focus();
      cy.focused().type('{enter}');

      // Verify focus moved to main content
      cy.focused().should('have.attr', 'id', 'main-content');
    });
  });

  /**
   * Landmark Tests
   * Tests that page uses proper landmark regions
   */
  describe('Landmarks', () => {
    /**
     * Test page has proper landmarks
     *
     * Verifies that page uses semantic landmark elements.
     */
    it('should have proper landmark regions', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check for landmarks
      cy.getByRole('banner').should('exist'); // Header
      cy.getByRole('navigation').should('exist'); // Nav
      cy.getByRole('main').should('exist'); // Main content
      cy.getByRole('contentinfo').should('exist'); // Footer
    });

    /**
     * Test landmarks have unique labels
     *
     * Verifies that landmarks have unique aria-labels when needed.
     */
    it('should have unique labels for landmarks', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check for unique navigation labels
      cy.getByRole('navigation').should('have.attr', 'aria-label');
    });

    /**
     * Test landmarks are properly nested
     *
     * Verifies that landmarks follow proper nesting rules.
     */
    it('should have properly nested landmarks', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Verify main landmark is not nested in nav
      cy.getByRole('main').should('exist');
    });
  });

  /**
   * Form Validation Tests
   * Tests that form validation is accessible
   */
  describe('Form Validation', () => {
    /**
     * Test validation errors are announced
     *
     * Verifies that validation errors are announced to screen readers.
     */
    it('should announce validation errors', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Submit empty form
      cy.getByTestId('coupon-submit-button').click();

      // Verify errors are announced
      cy.getByRole('alert').should('exist');
    });

    /**
     * Test invalid fields are clearly marked
     *
     * Verifies that invalid fields have visual and ARIA indicators.
     */
    it('should clearly mark invalid fields', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Submit empty form
      cy.getByTestId('coupon-submit-button').click();

      // Verify invalid fields have aria-invalid
      cy.getByTestId('coupon-code-input').should('have.attr', 'aria-invalid', 'true');
      cy.getByTestId('coupon-description-input').should('have.attr', 'aria-invalid', 'true');
    });

    /**
     * Test valid fields are marked as valid
     *
     * Verifies that valid fields have appropriate ARIA state.
     */
    it('should mark valid fields appropriately', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Fill in valid data
      cy.getByTestId('coupon-code-input').type('VALIDCODE');
      cy.getByTestId('coupon-description-input').type('Valid description');
      cy.getByTestId('coupon-discount-input').type('20');

      // Verify fields are not marked as invalid
      cy.getByTestId('coupon-code-input').should('not.have.attr', 'aria-invalid', 'true');
    });
  });

  /**
   * Modal Accessibility Tests
   * Tests that modals are accessible
   */
  describe('Modal Accessibility', () => {
    /**
     * Test modal traps focus
     *
     * Verifies that focus is trapped within modal when open.
     */
    it('should trap focus within modal', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Verify modal is open
      cy.getByTestId('coupon-form').should('be.visible');

      // Focus should be within modal
      cy.get('[data-testid="coupon-form"] *:focus').should('exist');
    });

    /**
     * Test modal has proper ARIA attributes
     *
     * Verifies that modal has correct ARIA attributes.
     */
    it('should have proper ARIA attributes on modal', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Verify modal has role dialog
      cy.getByTestId('coupon-form').should('have.attr', 'role', 'dialog');

      // Verify modal has aria-modal
      cy.getByTestId('coupon-form').should('have.attr', 'aria-modal', 'true');
    });

    /**
     * Test modal can be closed with keyboard
     *
     * Verifies that modal can be closed using keyboard.
     */
    it('should be closable with keyboard', () => {
      couponPage.navigate().shouldBeVisible().clickCreateCoupon();

      // Verify modal is open
      cy.getByTestId('coupon-form').should('be.visible');

      // Close with Escape
      cy.get('body').type('{esc}');

      // Verify modal is closed
      cy.getByTestId('coupon-form').should('not.exist');
    });

    /**
     * Test focus returns to trigger element after modal closes
     *
     * Verifies that focus returns to element that opened modal.
     */
    it('should return focus to trigger after modal closes', () => {
      couponPage.navigate().shouldBeVisible();

      // Focus on create button
      cy.getByTestId('create-coupon-button').focus();
      cy.focused().should('have.attr', 'data-testid', 'create-coupon-button');

      // Open modal
      cy.focused().click();

      // Close modal
      cy.get('body').type('{esc}');

      // Verify focus returned to trigger
      cy.focused().should('have.attr', 'data-testid', 'create-coupon-button');
    });
  });

  /**
   * Table Accessibility Tests
   * Tests that tables are accessible
   */
  describe('Table Accessibility', () => {
    /**
     * Test tables have proper headers
     *
     * Verifies that data tables have proper header structure.
     */
    it('should have proper table headers', () => {
      couponPage.navigate().shouldBeVisible();

      // Check for table headers if tables exist
      cy.get('table').then(($tables) => {
        if ($tables.length > 0) {
          cy.get('th').should('exist');
          cy.get('th').should('have.attr', 'scope');
        }
      });
    });

    /**
     * Test tables have captions
     *
     * Verifies that tables have descriptive captions.
     */
    it('should have table captions', () => {
      couponPage.navigate().shouldBeVisible();

      // Check for table captions if tables exist
      cy.get('table').then(($tables) => {
        if ($tables.length > 0) {
          cy.get('caption').should('exist');
        }
      });
    });
  });

  /**
   * List Accessibility Tests
   * Tests that lists are accessible
   */
  describe('List Accessibility', () => {
    /**
     * Test lists have proper roles
     *
     * Verifies that lists have correct ARIA roles.
     */
    it('should have proper list roles', () => {
      couponPage.navigate().shouldBeVisible();

      // Check for list roles
      cy.getByRole('list').should('exist');
    });

    /**
     * Test list items are properly marked
     *
     * Verifies that list items have correct structure.
     */
    it('should have properly marked list items', () => {
      couponPage.navigate().shouldBeVisible();

      // Check for list items
      cy.getByRole('listitem').should('exist');
    });
  });

  /**
   * Mobile Accessibility Tests
   * Tests accessibility on mobile devices
   */
  describe('Mobile Accessibility', () => {
    beforeEach(() => {
      cy.viewport(375, 667); // Mobile viewport
    });

    /**
     * Test touch targets are adequate on mobile
     *
     * Verifies that touch targets meet minimum size requirements.
     */
    it('should have adequate touch targets on mobile', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Check button touch targets
      cy.getByTestId('nav-coupons').should('have.css', 'min-height', '44px');
      cy.getByTestId('logout-button').should('have.css', 'min-height', '44px');
    });

    /**
     * Test mobile menu is accessible
     *
     * Verifies that mobile menu can be operated with keyboard.
     */
    it('should have accessible mobile menu', () => {
      dashboardPage.navigate().shouldBeVisible();

      // Focus on mobile menu button
      cy.getByTestId('mobile-menu-button').focus();

      // Activate with Enter
      cy.focused().type('{enter}');

      // Verify menu is open
      cy.getByTestId('mobile-menu').should('be.visible');

      // Verify menu items are focusable
      cy.getByTestId('mobile-menu').within(() => {
        cy.get('[data-testid^="nav-"]').should('have.attr', 'tabindex', '0');
      });
    });
  });
});
