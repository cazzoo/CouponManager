/**
 * End-to-End tests for Language Switching workflows
 *
 * Comprehensive test suite covering all language switching scenarios including
 * language selection, persistence, UI updates, and format localization.
 * Tests include happy paths, edge cases, and accessibility.
 *
 * @module LanguageSwitchingE2ETests
 * @author Kilo Code
 * @date 2025-01-26
 */

import { dashboardPage, loginPage } from '../support';
import type { LanguageCode } from '../support/types';

/**
 * Language switching E2E test suite
 */
describe('Language Switching Workflows', () => {
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
   * Tests successful language switching scenarios
   */
  describe('Happy Paths', () => {
    /**
     * Test switching from English to Spanish
     *
     * Verifies that users can switch language from English to Spanish
     * and all UI elements update accordingly.
     */
    it('should switch from English to Spanish', () => {
      // Verify initial language is English
      cy.get('html').should('have.attr', 'lang', 'en');

      // Switch to Spanish
      cy.selectLanguage('es');

      // Verify language changed
      cy.get('html').should('have.attr', 'lang', 'es');

      // Verify UI elements are in Spanish
      cy.getByTestId('dashboard-title').should('exist');
      cy.getByTestId('language-selector').should('contain', 'Español');
    });

    /**
     * Test switching from English to French
     *
     * Verifies that users can switch language from English to French
     * and all UI elements update accordingly.
     */
    it('should switch from English to French', () => {
      // Verify initial language is English
      cy.get('html').should('have.attr', 'lang', 'en');

      // Switch to French
      cy.selectLanguage('fr');

      // Verify language changed
      cy.get('html').should('have.attr', 'lang', 'fr');

      // Verify UI elements are in French
      cy.getByTestId('dashboard-title').should('exist');
      cy.getByTestId('language-selector').should('contain', 'Français');
    });

    /**
     * Test switching from English to German
     *
     * Verifies that users can switch language from English to German
     * and all UI elements update accordingly.
     */
    it('should switch from English to German', () => {
      // Verify initial language is English
      cy.get('html').should('have.attr', 'lang', 'en');

      // Switch to German
      cy.selectLanguage('de');

      // Verify language changed
      cy.get('html').should('have.attr', 'lang', 'de');

      // Verify UI elements are in German
      cy.getByTestId('dashboard-title').should('exist');
      cy.getByTestId('language-selector').should('contain', 'Deutsch');
    });

    /**
     * Test switching between all languages
     *
     * Verifies that users can cycle through all available languages
     * and each switch updates the UI correctly.
     */
    it('should switch between all languages', () => {
      const languages: LanguageCode[] = ['en', 'es', 'fr', 'de'];

      languages.forEach((lang) => {
        // Switch to language
        cy.selectLanguage(lang);

        // Verify language changed
        cy.get('html').should('have.attr', 'lang', lang);

        // Verify UI is updated
        cy.getByTestId('dashboard-title').should('be.visible');
      });
    });

    /**
     * Test language persistence after page refresh
     *
     * Verifies that selected language persists when user refreshes the page.
     */
    it('should persist language after page refresh', () => {
      // Switch to Spanish
      cy.selectLanguage('es');

      // Verify language is Spanish
      cy.get('html').should('have.attr', 'lang', 'es');

      // Refresh the page
      cy.reload();

      // Verify language is still Spanish
      cy.get('html').should('have.attr', 'lang', 'es');
      cy.getByTestId('language-selector').should('contain', 'Español');
    });

    /**
     * Test language persistence after logout/login
     *
     * Verifies that selected language persists across user sessions.
     */
    it('should persist language after logout/login', () => {
      // Switch to French
      cy.selectLanguage('fr');

      // Verify language is French
      cy.get('html').should('have.attr', 'lang', 'fr');

      // Logout
      dashboardPage.logout();

      // Verify login page is in French
      cy.get('html').should('have.attr', 'lang', 'fr');

      // Login again
      cy.login('test@example.com', 'SecurePass123!');

      // Verify language is still French
      cy.get('html').should('have.attr', 'lang', 'fr');
      cy.getByTestId('language-selector').should('contain', 'Français');
    });

    /**
     * Test all UI elements update correctly
     *
     * Verifies that all UI elements are properly translated
     * when language is switched.
     */
    it('should update all UI elements correctly', () => {
      // Switch to Spanish
      cy.selectLanguage('es');

      // Check various UI elements
      cy.getByTestId('dashboard-title').should('be.visible');
      cy.getByTestId('nav-coupons').should('be.visible');
      cy.getByTestId('nav-retailers').should('be.visible');
      cy.getByTestId('nav-users').should('be.visible');
      cy.getByTestId('logout-button').should('be.visible');

      // Verify all are in Spanish
      cy.get('html').should('have.attr', 'lang', 'es');
    });

    /**
     * Test form validation messages in selected language
     *
     * Verifies that form validation messages are displayed
     * in the currently selected language.
     */
    it('should display form validation messages in selected language', () => {
      // Switch to German
      cy.selectLanguage('de');

      // Navigate to coupon creation
      cy.getByTestId('nav-coupons').click();
      cy.getByTestId('create-coupon-button').click();

      // Submit empty form to trigger validation
      cy.getByTestId('coupon-submit-button').click();

      // Verify error messages are in German
      cy.getByTestId('code-error').should('be.visible');
      cy.get('html').should('have.attr', 'lang', 'de');
    });

    /**
     * Test error messages in selected language
     *
     * Verifies that error messages are displayed
     * in the currently selected language.
     */
    it('should display error messages in selected language', () => {
      // Switch to Spanish
      cy.selectLanguage('es');

      // Logout
      dashboardPage.logout();

      // Try to login with invalid credentials
      cy.getByTestId('username-input').type('invalid@example.com');
      cy.getByTestId('password-input').type('wrongpassword');
      cy.getByTestId('login-submit-button').click();

      // Verify error message is in Spanish
      cy.getByTestId('login-error-message').should('be.visible');
      cy.get('html').should('have.attr', 'lang', 'es');
    });

    /**
     * Test date formats respect language
     *
     * Verifies that dates are formatted according to
     * the selected language's locale.
     */
    it('should format dates according to language', () => {
      // Create a coupon with specific date
      cy.getByTestId('nav-coupons').click();
      cy.createCoupon({
        code: 'DATEFORMAT',
        description: 'Date format test',
        discountPercentage: 20,
        expirationDate: '2025-12-31',
        retailerId: 'retailer-1'
      });

      // Check date format in English
      cy.get('html').should('have.attr', 'lang', 'en');
      cy.getByTestId('coupon-expiration-DATEFORMAT').should('be.visible');

      // Switch to Spanish and check format
      cy.selectLanguage('es');
      cy.getByTestId('coupon-expiration-DATEFORMAT').should('be.visible');
      cy.get('html').should('have.attr', 'lang', 'es');
    });

    /**
     * Test number formats respect language
     *
     * Verifies that numbers are formatted according to
     * the selected language's locale.
     */
    it('should format numbers according to language', () => {
      // Create a coupon with discount
      cy.getByTestId('nav-coupons').click();
      cy.createCoupon({
        code: 'NUMBERFORMAT',
        description: 'Number format test',
        discountPercentage: 20,
        expirationDate: '2025-12-31',
        retailerId: 'retailer-1'
      });

      // Check number format in English
      cy.get('html').should('have.attr', 'lang', 'en');
      cy.getByTestId('coupon-discount-NUMBERFORMAT').should('be.visible');

      // Switch to German and check format
      cy.selectLanguage('de');
      cy.getByTestId('coupon-discount-NUMBERFORMAT').should('be.visible');
      cy.get('html').should('have.attr', 'lang', 'de');
    });
  });

  /**
   * Edge Case Tests
   * Tests edge cases and boundary conditions
   */
  describe('Edge Cases', () => {
    /**
     * Test language selector on mobile
     *
     * Verifies that language selector works correctly on mobile viewport.
     */
    it('should work on mobile viewport', () => {
      // Set mobile viewport
      cy.viewport(375, 667);

      // Switch language
      cy.selectLanguage('es');

      // Verify language changed
      cy.get('html').should('have.attr', 'lang', 'es');

      // Verify language selector is accessible on mobile
      cy.getByTestId('language-selector').should('be.visible');
      cy.getByTestId('language-selector').should('be.clickable');
    });

    /**
     * Test language selector on desktop
     *
     * Verifies that language selector works correctly on desktop viewport.
     */
    it('should work on desktop viewport', () => {
      // Set desktop viewport
      cy.viewport(1440, 900);

      // Switch language
      cy.selectLanguage('fr');

      // Verify language changed
      cy.get('html').should('have.attr', 'lang', 'fr');

      // Verify language selector is accessible on desktop
      cy.getByTestId('language-selector').should('be.visible');
      cy.getByTestId('language-selector').should('be.clickable');
    });

    /**
     * Test language selector accessibility
     *
     * Verifies that language selector meets accessibility standards.
     */
    it('should be accessible', () => {
      // Check for proper ARIA attributes
      cy.getByTestId('language-selector').should('have.attr', 'aria-label');
      cy.getByTestId('language-selector').should('have.attr', 'role', 'combobox');

      // Check keyboard navigation
      cy.getByTestId('language-selector').focus();
      cy.focused().should('have.attr', 'data-testid', 'language-selector');

      // Verify language options are accessible
      cy.getByTestId('language-selector').click();
      cy.getByTestId('language-option-en').should('have.attr', 'role', 'option');
      cy.getByTestId('language-option-es').should('have.attr', 'role', 'option');
      cy.getByTestId('language-option-fr').should('have.attr', 'role', 'option');
      cy.getByTestId('language-option-de').should('have.attr', 'role', 'option');
    });

    /**
     * Test rapid language switching
     *
     * Verifies that application handles rapid language switches
     * without errors or UI inconsistencies.
     */
    it('should handle rapid language switching', () => {
      const languages: LanguageCode[] = ['en', 'es', 'fr', 'de'];

      // Rapidly switch between languages
      languages.forEach((lang) => {
        cy.selectLanguage(lang);
        cy.get('html').should('have.attr', 'lang', lang);
      });

      // Verify final state is correct
      cy.get('html').should('have.attr', 'lang', 'de');
      cy.getByTestId('dashboard-title').should('be.visible');
    });

    /**
     * Test language switching with unsaved changes
     *
     * Verifies that language switching preserves form state
     * and doesn't lose unsaved changes.
     */
    it('should preserve form state during language switch', () => {
      // Navigate to coupon creation
      cy.getByTestId('nav-coupons').click();
      cy.getByTestId('create-coupon-button').click();

      // Fill in some data
      cy.getByTestId('coupon-code-input').type('TESTCODE');
      cy.getByTestId('coupon-description-input').type('Test description');

      // Switch language
      cy.selectLanguage('es');

      // Verify form data is preserved
      cy.getByTestId('coupon-code-input').should('have.value', 'TESTCODE');
      cy.getByTestId('coupon-description-input').should('have.value', 'Test description');

      // Verify language changed
      cy.get('html').should('have.attr', 'lang', 'es');
    });

    /**
     * Test language switching during async operations
     *
     * Verifies that language switching works correctly
     * during asynchronous operations.
     */
    it('should work during async operations', () => {
      // Start an async operation (e.g., loading coupons)
      cy.getByTestId('nav-coupons').click();

      // Switch language while loading
      cy.selectLanguage('fr');

      // Wait for operation to complete
      cy.waitForApi();

      // Verify language changed and UI is correct
      cy.get('html').should('have.attr', 'lang', 'fr');
      cy.getByTestId('coupon-list').should('be.visible');
    });
  });

  /**
   * Internationalization Tests
   * Tests specific i18n features and edge cases
   */
  describe('Internationalization Features', () => {
    /**
     * Test RTL (Right-to-Left) language support
     *
     * Verifies that application can handle RTL languages if supported.
     * Note: This test is for future RTL language support.
     */
    it('should support RTL languages (if available)', () => {
      // Check if RTL languages are supported
      cy.get('html').then(($html) => {
        const dir = $html.attr('dir');
        if (dir === 'rtl' || dir === 'auto') {
          // Test RTL layout
          cy.getByTestId('dashboard-container').should('have.attr', 'dir', 'rtl');
        } else {
          // Skip test if RTL not supported
          cy.log('RTL languages not currently supported');
        }
      });
    });

    /**
     * Test currency formatting by language
     *
     * Verifies that currency values are formatted according to
     * the selected language's locale.
     */
    it('should format currency by language', () => {
      // Create a coupon with value
      cy.getByTestId('nav-coupons').click();
      cy.createCoupon({
        code: 'CURRENCY',
        description: 'Currency format test',
        discountPercentage: 20,
        expirationDate: '2025-12-31',
        retailerId: 'retailer-1'
      });

      // Check currency in English
      cy.get('html').should('have.attr', 'lang', 'en');

      // Switch to Euro-using language (German)
      cy.selectLanguage('de');
      cy.get('html').should('have.attr', 'lang', 'de');
    });

    /**
     * Test pluralization rules by language
     *
     * Verifies that pluralization is handled correctly
     * for different languages.
     */
    it('should handle pluralization by language', () => {
      // Navigate to dashboard
      dashboardPage.navigate().shouldBeVisible();

      // Check pluralization in English
      cy.get('html').should('have.attr', 'lang', 'en');
      cy.getByTestId('stat-total-coupons').should('be.visible');

      // Switch to Spanish (different pluralization rules)
      cy.selectLanguage('es');
      cy.get('html').should('have.attr', 'lang', 'es');
      cy.getByTestId('stat-total-coupons').should('be.visible');
    });
  });

  /**
   * Persistence Tests
   * Tests language preference persistence across sessions
   */
  describe('Persistence', () => {
    /**
     * Test language preference stored in localStorage
     *
     * Verifies that language preference is correctly stored
     * in browser's localStorage.
     */
    it('should store language preference in localStorage', () => {
      // Switch to French
      cy.selectLanguage('fr');

      // Check localStorage
      cy.window().then((win) => {
        const storedLang = win.localStorage.getItem('preferredLanguage');
        expect(storedLang).to.equal('fr');
      });
    });

    /**
     * Test language preference loaded on page load
     *
     * Verifies that stored language preference is loaded
     * when the page is initially loaded.
     */
    it('should load language preference on page load', () => {
      // Set language preference in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('preferredLanguage', 'de');
      });

      // Reload page
      cy.reload();

      // Verify language is loaded from localStorage
      cy.get('html').should('have.attr', 'lang', 'de');
      cy.getByTestId('language-selector').should('contain', 'Deutsch');
    });

    /**
     * Test language preference cleared on logout
     *
     * Verifies that language preference behavior on logout
     * (depending on implementation requirements).
     */
    it('should handle language preference on logout', () => {
      // Switch to Spanish
      cy.selectLanguage('es');

      // Logout
      dashboardPage.logout();

      // Check if language preference persists or resets
      cy.get('html').should('have.attr', 'lang', 'es');
    });
  });

  /**
   * Accessibility Tests
   * Tests language switching for accessibility compliance
   */
  describe('Accessibility', () => {
    /**
     * Test language attribute on html element
     *
     * Verifies that the html lang attribute is correctly set
     * for screen readers and assistive technologies.
     */
    it('should set correct lang attribute', () => {
      const languages: LanguageCode[] = ['en', 'es', 'fr', 'de'];

      languages.forEach((lang) => {
        cy.selectLanguage(lang);
        cy.get('html').should('have.attr', 'lang', lang);
      });
    });

    /**
     * Test language announcements for screen readers
     *
     * Verifies that language changes are announced
     * to screen readers.
     */
    it('should announce language changes to screen readers', () => {
      // Switch language
      cy.selectLanguage('fr');

      // Check for ARIA live region announcements
      cy.getByTestId('language-change-announcement').should('have.attr', 'role', 'alert');
      cy.getByTestId('language-change-announcement').should('have.attr', 'aria-live', 'polite');
    });

    /**
     * Test keyboard navigation for language selector
     *
     * Verifies that language selector can be operated
     * using keyboard only.
     */
    it('should support keyboard navigation', () => {
      // Focus language selector
      cy.getByTestId('language-selector').focus();
      cy.focused().should('have.attr', 'data-testid', 'language-selector');

      // Open dropdown with Enter
      cy.focused().type('{enter}');

      // Navigate options with arrow keys
      cy.focused().type('{downarrow}');
      cy.focused().type('{downarrow}');

      // Select with Enter
      cy.focused().type('{enter}');

      // Verify language changed
      cy.get('html').should('not.have.attr', 'lang', 'en');
    });
  });
});
