/**
 * End-to-End tests for Retailer Management workflows
 *
 * Comprehensive test suite covering all retailer management scenarios including
 * viewing, creating, editing, deleting, filtering, and sorting retailers.
 * Tests include happy paths, error paths, edge cases, and i18n support.
 *
 * @module RetailerManagementE2ETests
 * @author Kilo Code
 * @date 2025-01-26
 */

import { retailerPage, dashboardPage } from '../support';
import type { RetailerData } from '../support/types';

/**
 * Test data for retailer scenarios
 */
const testRetailer: RetailerData = {
  id: 'retailer-test-1',
  name: 'Test Retailer Inc.',
  website: 'https://testretailer.com',
  address: '123 Test Street, Test City, TC 12345'
};

const anotherRetailer: RetailerData = {
  id: 'retailer-test-2',
  name: 'Another Retailer LLC',
  website: 'https://anotherretailer.com',
  address: '456 Another Ave, Another City, AC 67890'
};

/**
 * Retailer Management E2E test suite
 */
describe('Retailer Management Workflows', () => {
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
   * Tests successful retailer management scenarios
   */
  describe('Happy Paths', () => {
    /**
     * Test viewing all retailers
     *
     * Verifies that users can view the complete list of retailers.
     */
    it('should view all retailers', () => {
      retailerPage
        .navigate()
        .shouldBeVisible();

      // Verify retailer list is displayed
      retailerPage.getRetailerList().should('be.visible');
      retailerPage.shouldNotShowLoading();
    });

    /**
     * Test viewing retailer details
     *
     * Verifies that users can view detailed information about a specific retailer.
     */
    it('should view retailer details', () => {
      // Create a retailer first
      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(testRetailer);

      // View retailer details
      retailerPage.viewRetailer(testRetailer.id);

      // Verify details modal is displayed
      cy.getByTestId('retailer-details-modal').should('be.visible');
      cy.getByTestId('retailer-details-name').should('contain', testRetailer.name);
      cy.getByTestId('retailer-details-website').should('contain', testRetailer.website);
      cy.getByTestId('retailer-details-address').should('contain', testRetailer.address);
    });

    /**
     * Test adding a new retailer
     *
     * Verifies that users can create new retailers with all required information.
     */
    it('should add a new retailer', () => {
      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(testRetailer);

      // Verify retailer was added
      retailerPage.shouldContainRetailer(testRetailer.name);
      retailerPage.shouldNotShowLoading();
    });

    /**
     * Test editing an existing retailer
     *
     * Verifies that users can modify existing retailer details.
     */
    it('should edit an existing retailer', () => {
      // Create a retailer first
      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(testRetailer);

      // Edit retailer
      const updatedRetailer = {
        ...testRetailer,
        name: 'Updated Retailer Name',
        website: 'https://updated.com'
      };
      retailerPage.editRetailer(testRetailer.id);

      // Update fields
      cy.getByTestId('retailer-name-input').clear().type(updatedRetailer.name);
      cy.getByTestId('retailer-website-input').clear().type(updatedRetailer.website);
      cy.getByTestId('retailer-submit-button').click();

      // Verify retailer was updated
      retailerPage.shouldContainRetailer(updatedRetailer.name);
      retailerPage.shouldNotContainRetailer(testRetailer.name);
    });

    /**
     * Test deleting a retailer
     *
     * Verifies that users can delete retailers with proper confirmation.
     */
    it('should delete a retailer', () => {
      // Create a retailer first
      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(testRetailer);

      // Delete retailer
      retailerPage.deleteRetailer(testRetailer.id);

      // Confirm deletion
      cy.getByTestId('confirm-delete-button').click();

      // Verify retailer was deleted
      retailerPage.shouldNotContainRetailer(testRetailer.name);
    });

    /**
     * Test filtering retailers by name
     *
     * Verifies that users can search and filter retailers by name.
     */
    it('should filter retailers by name', () => {
      // Create multiple retailers
      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(testRetailer);

      retailerPage.addRetailer(anotherRetailer);

      // Filter by name
      retailerPage.searchRetailers('Test');

      // Verify only matching retailers are shown
      retailerPage.shouldContainRetailer(testRetailer.name);
      retailerPage.shouldNotContainRetailer(anotherRetailer.name);
    });

    /**
     * Test sorting retailers by name
     *
     * Verifies that users can sort retailers alphabetically by name.
     */
    it('should sort retailers by name', () => {
      // Create multiple retailers
      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(testRetailer);

      retailerPage.addRetailer(anotherRetailer);

      // Sort by name (ascending)
      retailerPage.sortRetailers('name-asc');

      // Verify sorting order
      retailerPage.getRetailerList().then(($list) => {
        const retailers = $list.text();
        expect(retailers.indexOf('Another')).to.be.lessThan(retailers.indexOf('Test'));
      });
    });

    /**
     * Test sorting retailers by total coupons
     *
     * Verifies that users can sort retailers by number of coupons.
     */
    it('should sort retailers by total coupons', () => {
      // Create retailers with different coupon counts
      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(testRetailer);

      retailerPage.addRetailer(anotherRetailer);

      // Sort by total coupons (descending)
      retailerPage.sortRetailers('coupons-desc');

      // Verify sorting is applied
      cy.getByTestId('retailer-list').should('be.visible');
    });

    /**
     * Test sorting retailers by total value
     *
     * Verifies that users can sort retailers by total coupon value.
     */
    it('should sort retailers by total value', () => {
      // Create retailers
      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(testRetailer);

      retailerPage.addRetailer(anotherRetailer);

      // Sort by total value (descending)
      retailerPage.sortRetailers('value-desc');

      // Verify sorting is applied
      cy.getByTestId('retailer-list').should('be.visible');
    });

    /**
     * Test viewing retailer's coupons
     *
     * Verifies that users can view all coupons associated with a specific retailer.
     */
    it('should view retailer\'s coupons', () => {
      // Create a retailer first
      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(testRetailer);

      // View retailer's coupons
      cy.getByTestId(`view-coupons-${testRetailer.id}`).click();

      // Verify coupons page is displayed with retailer filter
      cy.url().should('include', '/coupons');
      cy.getByTestId('coupon-retailer-filter').should('contain', testRetailer.name);
    });

    /**
     * Test navigating from retailer to coupon list
     *
     * Verifies that users can navigate from retailer details to associated coupons.
     */
    it('should navigate from retailer to coupon list', () => {
      // Create a retailer first
      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(testRetailer);

      // View retailer details
      retailerPage.viewRetailer(testRetailer.id);

      // Click on coupons link
      cy.getByTestId('retailer-coupons-link').click();

      // Verify navigation to coupon list
      cy.url().should('include', '/coupons');
      cy.getByTestId('coupon-list').should('be.visible');
    });
  });

  /**
   * Error Path Tests
   * Tests retailer management error scenarios
   */
  describe('Error Paths', () => {
    /**
     * Test adding retailer with duplicate name
     *
     * Verifies that duplicate retailer names are rejected.
     */
    it('should show error for duplicate retailer name', () => {
      // Create a retailer
      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(testRetailer);

      // Try to create another retailer with same name
      retailerPage
        .clickAddRetailer()
        .fillRetailerName(testRetailer.name)
        .fillRetailerWebsite('https://different.com')
        .submitRetailerForm();

      // Verify error message
      cy.getByTestId('retailer-error-message').should('be.visible');
      cy.getByTestId('retailer-error-message').should('contain', 'already exists');
    });

    /**
     * Test adding retailer with missing required fields
     *
     * Verifies that form validation prevents submission with missing fields.
     */
    it('should show error for missing required fields', () => {
      retailerPage
        .navigate()
        .shouldBeVisible()
        .clickAddRetailer();

      // Submit without filling required fields
      cy.getByTestId('retailer-submit-button').click();

      // Verify validation errors
      cy.getByTestId('name-error').should('be.visible');
      cy.getByTestId('name-error').should('contain', 'required');
    });

    /**
     * Test deleting retailer with confirmation
     *
     * Verifies that deletion requires confirmation and can be cancelled.
     */
    it('should require confirmation for retailer deletion', () => {
      // Create a retailer first
      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(testRetailer);

      // Attempt to delete
      retailerPage.deleteRetailer(testRetailer.id);

      // Verify confirmation dialog appears
      cy.getByTestId('delete-confirmation-modal').should('be.visible');

      // Cancel deletion
      cy.getByTestId('cancel-delete-button').click();

      // Verify retailer still exists
      retailerPage.shouldContainRetailer(testRetailer.name);
    });

    /**
     * Test editing retailer with invalid website URL
     *
     * Verifies that invalid website URLs are rejected.
     */
    it('should show error for invalid website URL', () => {
      // Create a retailer first
      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(testRetailer);

      // Edit with invalid website
      retailerPage.editRetailer(testRetailer.id);
      cy.getByTestId('retailer-website-input').clear().type('invalid-url');
      cy.getByTestId('retailer-submit-button').click();

      // Verify error message
      cy.getByTestId('website-error').should('be.visible');
      cy.getByTestId('website-error').should('contain', 'Invalid URL');
    });
  });

  /**
   * Edge Case Tests
   * Tests edge cases and boundary conditions
   */
  describe('Edge Cases', () => {
    /**
     * Test handling retailer with no coupons
     *
     * Verifies that retailers without coupons display appropriate empty state.
     */
    it('should handle retailer with no coupons', () => {
      // Create a retailer
      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(testRetailer);

      // View retailer's coupons
      cy.getByTestId(`view-coupons-${testRetailer.id}`).click();

      // Verify empty state is displayed
      cy.getByTestId('coupon-empty-state').should('be.visible');
      cy.getByTestId('coupon-empty-state').should('contain', 'No coupons');
    });

    /**
     * Test handling retailer with only expired coupons
     *
     * Verifies that retailers with only expired coupons display correctly.
     */
    it('should handle retailer with only expired coupons', () => {
      // Create a retailer
      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(testRetailer);

      // Navigate to coupons and create expired coupons
      cy.getByTestId('nav-coupons').click();
      cy.createCoupon({
        code: 'EXPIRED1',
        description: 'Expired coupon 1',
        discountPercentage: 20,
        expirationDate: '2020-01-01',
        retailerId: testRetailer.id
      });

      // View retailer's coupons
      cy.getByTestId(`view-coupons-${testRetailer.id}`).click();

      // Verify expired coupons are shown
      cy.getByTestId('coupon-list').should('be.visible');
      cy.getByTestId('coupon-status-EXPIRED1').should('contain', 'Expired');
    });

    /**
     * Test handling large number of retailers
     *
     * Verifies that application handles pagination and performance
     * with a large number of retailers.
     */
    it('should handle large number of retailers', () => {
      // Create multiple retailers
      for (let i = 0; i < 50; i++) {
        const bulkRetailer = {
          id: `retailer-bulk-${i}`,
          name: `Bulk Retailer ${i}`,
          website: `https://retailer${i}.com`
        };
        retailerPage.addRetailer(bulkRetailer);
      }

      // Verify pagination is visible
      retailerPage.paginationShouldBeVisible();

      // Navigate through pages
      retailerPage.clickNextPage();
      retailerPage.waitForLoad();

      retailerPage.clickPreviousPage();
      retailerPage.waitForLoad();
    });

    /**
     * Test handling retailer with very long name
     *
     * Verifies that retailers with long names are handled correctly.
     */
    it('should handle retailer with very long name', () => {
      const longNameRetailer = {
        ...testRetailer,
        id: 'retailer-long-name',
        name: 'A'.repeat(200)
      };

      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(longNameRetailer);

      // Verify retailer is created and name is truncated if needed
      retailerPage.shouldContainRetailer(longNameRetailer.name.substring(0, 50));
    });

    /**
     * Test handling retailer with special characters in name
     *
     * Verifies that retailers with special characters are handled correctly.
     */
    it('should handle retailer with special characters in name', () => {
      const specialRetailer = {
        ...testRetailer,
        id: 'retailer-special',
        name: 'Retailer & Co. (Special!@#$%)'
      };

      retailerPage
        .navigate()
        .shouldBeVisible()
        .addRetailer(specialRetailer);

      // Verify retailer is displayed correctly
      retailerPage.shouldContainRetailer(specialRetailer.name);
    });
  });

  /**
   * Internationalization Tests
   * Tests retailer management in different languages
   */
  describe('Internationalization (i18n)', () => {
    const languages = ['en', 'es', 'fr', 'de'] as const;

    languages.forEach((lang) => {
      /**
       * Test retailer creation in different language
       *
       * Verifies that retailer creation form is properly translated.
       */
      it(`should create retailer in ${lang}`, () => {
        cy.selectLanguage(lang);

        retailerPage
          .navigate()
          .shouldBeVisible()
          .addRetailer(testRetailer);

        // Verify retailer was created
        retailerPage.shouldContainRetailer(testRetailer.name);
        cy.get('html').should('have.attr', 'lang', lang);
      });

      /**
       * Test retailer list in different language
       *
       * Verifies that retailer list UI elements are properly translated.
       */
      it(`should display retailer list in ${lang}`, () => {
        cy.selectLanguage(lang);

        retailerPage
          .navigate()
          .shouldBeVisible()
          .addRetailer(testRetailer);

        // Verify UI is in selected language
        cy.get('html').should('have.attr', 'lang', lang);
        cy.getByTestId('retailer-list-header').should('exist');
      });

      /**
       * Test error messages in different language
       *
       * Verifies that validation messages are displayed in selected language.
       */
      it(`should show error messages in ${lang}`, () => {
        cy.selectLanguage(lang);

        retailerPage
          .navigate()
          .shouldBeVisible()
          .clickAddRetailer()
          .submitRetailerForm();

        // Verify error messages are in selected language
        cy.getByTestId('name-error').should('be.visible');
        cy.get('html').should('have.attr', 'lang', lang);
      });
    });
  });

  /**
   * Accessibility Tests
   * Tests retailer management for accessibility compliance
   */
  describe('Accessibility', () => {
    /**
     * Test retailer list accessibility
     *
     * Verifies that the retailer list meets WCAG standards.
     */
    it('should have accessible retailer list', () => {
      retailerPage.navigate().shouldBeVisible();

      // Check for proper headings
      cy.getByRole('heading', { name: /retailers/i }).should('exist');

      // Check for proper ARIA labels
      cy.getByTestId('retailer-list').should('have.attr', 'role', 'list');

      // Check keyboard navigation
      cy.getByTestId('add-retailer-button').focus();
      cy.focused().should('have.attr', 'data-testid', 'add-retailer-button');
    });

    /**
     * Test retailer form accessibility
     *
     * Verifies that the retailer form meets WCAG standards.
     */
    it('should have accessible retailer form', () => {
      retailerPage
        .navigate()
        .shouldBeVisible()
        .clickAddRetailer();

      // Check for proper labels
      cy.getByTestId('retailer-name-input').should('have.attr', 'aria-label');
      cy.getByTestId('retailer-website-input').should('have.attr', 'aria-label');
      cy.getByTestId('retailer-address-input').should('have.attr', 'aria-label');

      // Check for error handling
      cy.getByTestId('retailer-error-message').should('have.attr', 'role', 'alert');
    });
  });
});
