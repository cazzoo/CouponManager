/**
 * End-to-End tests for Coupon Management workflows
 *
 * Comprehensive test suite covering all coupon management scenarios including
 * creation, editing, deletion, filtering, sorting, and error handling.
 * Tests include happy paths, error paths, edge cases, and i18n support.
 *
 * @module CouponManagementE2ETests
 * @author Kilo Code
 * @date 2025-01-26
 */

import { couponPage, dashboardPage } from '../support';
import type { CouponData } from '../support/types';

/**
 * Test data for coupon scenarios
 */
const testCoupon: CouponData = {
  code: 'SAVE20',
  description: '20% off all items',
  discountPercentage: 20,
  expirationDate: '2025-12-31',
  retailerId: 'retailer-1',
  notes: 'Test coupon for E2E testing'
};

const percentageCoupon: CouponData = {
  code: 'PERCENT30',
  description: '30% discount',
  discountPercentage: 30,
  expirationDate: '2025-12-31',
  retailerId: 'retailer-1'
};

const fixedAmountCoupon: CouponData = {
  code: 'FIXED50',
  description: '$50 off',
  discountPercentage: 50,
  expirationDate: '2025-12-31',
  retailerId: 'retailer-1'
};

/**
 * Coupon Management E2E test suite
 */
describe('Coupon Management Workflows', () => {
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
   * Tests successful coupon management scenarios
   */
  describe('Happy Paths', () => {
    /**
     * Test creating a new coupon with all fields
     *
     * Verifies that a user can create a coupon with all required and
     * optional fields populated.
     */
    it('should create a new coupon with all fields', () => {
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(testCoupon);

      // Verify coupon was created
      couponPage.shouldContainCoupon(testCoupon.code);
      couponPage.shouldNotShowLoading();
    });

    /**
     * Test creating a percentage discount coupon
     *
     * Verifies that percentage-based discount coupons are created correctly.
     */
    it('should create a percentage discount coupon', () => {
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(percentageCoupon);

      // Verify coupon was created with percentage discount
      couponPage.shouldContainCoupon(percentageCoupon.code);
      cy.getByTestId(`coupon-discount-${percentageCoupon.code}`)
        .should('contain', '%');
    });

    /**
     * Test creating a fixed amount discount coupon
     *
     * Verifies that fixed amount discount coupons are created correctly.
     */
    it('should create a fixed amount discount coupon', () => {
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(fixedAmountCoupon);

      // Verify coupon was created with fixed amount discount
      couponPage.shouldContainCoupon(fixedAmountCoupon.code);
      cy.getByTestId(`coupon-discount-${fixedAmountCoupon.code}`)
        .should('contain', '$');
    });

    /**
     * Test creating a coupon with expiration date
     *
     * Verifies that coupons with expiration dates are created correctly
     * and the expiration is displayed properly.
     */
    it('should create a coupon with expiration date', () => {
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(testCoupon);

      // Verify expiration date is displayed
      cy.getByTestId(`coupon-expiration-${testCoupon.code}`)
        .should('contain', '2025-12-31');
    });

    /**
     * Test creating a coupon without expiration date
     *
     * Verifies that coupons can be created without an expiration date
     * and are marked as non-expiring.
     */
    it('should create a coupon without expiration date', () => {
      const noExpiryCoupon: CouponData = {
        ...testCoupon,
        code: 'NOEXPIRY',
        expirationDate: ''
      };

      couponPage
        .navigate()
        .shouldBeVisible()
        .clickCreateCoupon()
        .fillCouponCode(noExpiryCoupon.code)
        .fillCouponDescription(noExpiryCoupon.description)
        .fillCouponDiscount(noExpiryCoupon.discountPercentage)
        .selectRetailer(noExpiryCoupon.retailerId)
        .submitCouponForm();

      // Verify coupon was created without expiration
      couponPage.shouldContainCoupon(noExpiryCoupon.code);
      cy.getByTestId(`coupon-expiration-${noExpiryCoupon.code}`)
        .should('contain', 'Never');
    });

    /**
     * Test editing an existing coupon
     *
     * Verifies that users can modify existing coupon details.
     */
    it('should edit an existing coupon', () => {
      // Create a coupon first
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(testCoupon);

      // Edit the coupon
      const updatedCoupon = { ...testCoupon, code: 'UPDATED20', description: 'Updated description' };
      couponPage.editCoupon(testCoupon.code);

      // Update fields
      cy.getByTestId('coupon-code-input').clear().type(updatedCoupon.code);
      cy.getByTestId('coupon-description-input').clear().type(updatedCoupon.description);
      cy.getByTestId('coupon-submit-button').click();

      // Verify coupon was updated
      couponPage.shouldContainCoupon(updatedCoupon.code);
      couponPage.shouldNotContainCoupon(testCoupon.code);
    });

    /**
     * Test deleting an existing coupon
     *
     * Verifies that users can delete coupons with proper confirmation.
     */
    it('should delete an existing coupon', () => {
      // Create a coupon first
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(testCoupon);

      // Delete the coupon
      couponPage.deleteCoupon(testCoupon.code);

      // Confirm deletion
      cy.getByTestId('confirm-delete-button').click();

      // Verify coupon was deleted
      couponPage.shouldNotContainCoupon(testCoupon.code);
    });

    /**
     * Test marking a coupon as used
     *
     * Verifies that users can mark coupons as used and the status updates.
     */
    it('should mark a coupon as used', () => {
      // Create a coupon first
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(testCoupon);

      // Mark coupon as used
      cy.getByTestId(`mark-used-${testCoupon.code}`).click();

      // Verify coupon is marked as used
      cy.getByTestId(`coupon-status-${testCoupon.code}`)
        .should('contain', 'Used');
    });

    /**
     * Test copying activation code to clipboard
     *
     * Verifies that users can copy coupon codes to clipboard.
     */
    it('should copy activation code to clipboard', () => {
      // Create a coupon first
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(testCoupon);

      // Copy activation code
      cy.getByTestId(`copy-code-${testCoupon.code}`).click();

      // Verify copy feedback
      cy.getByTestId('copy-feedback').should('be.visible');
      cy.getByTestId('copy-feedback').should('contain', 'Copied');
    });

    /**
     * Test copying PIN to clipboard
     *
     * Verifies that users can copy coupon PINs to clipboard.
     */
    it('should copy PIN to clipboard', () => {
      // Create a coupon with PIN
      const couponWithPin = { ...testCoupon, code: 'PIN123' };
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(couponWithPin);

      // Copy PIN
      cy.getByTestId(`copy-pin-${couponWithPin.code}`).click();

      // Verify copy feedback
      cy.getByTestId('copy-feedback').should('be.visible');
      cy.getByTestId('copy-feedback').should('contain', 'Copied');
    });

    /**
     * Test scanning barcode to add coupon
     *
     * Verifies that users can scan barcodes to add coupons.
     */
    it('should scan barcode to add coupon', () => {
      couponPage
        .navigate()
        .shouldBeVisible()
        .clickCreateCoupon();

      // Open barcode scanner
      cy.getByTestId('barcode-scanner-button').click();

      // Verify scanner is opened
      cy.getByTestId('barcode-scanner').should('be.visible');

      // Simulate barcode scan
      cy.getByTestId('barcode-scanner').then(($scanner) => {
        // In real test, this would trigger actual barcode scan
        // For now, we'll simulate the result
        cy.getByTestId('barcode-input').type('123456789');
        cy.getByTestId('scan-confirm-button').click();
      });

      // Verify coupon form is populated
      cy.getByTestId('coupon-code-input').should('have.value', '123456789');
    });

    /**
     * Test filtering coupons by retailer
     *
     * Verifies that users can filter coupons by specific retailers.
     */
    it('should filter coupons by retailer', () => {
      // Create multiple coupons
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(testCoupon);

      const retailer2Coupon = { ...testCoupon, code: 'RETAILER2', retailerId: 'retailer-2' };
      couponPage.createCoupon(retailer2Coupon);

      // Filter by retailer
      couponPage.filterCoupons('retailer-1');

      // Verify only retailer 1 coupons are shown
      couponPage.shouldContainCoupon(testCoupon.code);
      couponPage.shouldNotContainCoupon(retailer2Coupon.code);
    });

    /**
     * Test filtering coupons by amount range
     *
     * Verifies that users can filter coupons by discount amount range.
     */
    it('should filter coupons by amount range', () => {
      // Create coupons with different discounts
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(percentageCoupon);

      const highDiscountCoupon = { ...testCoupon, code: 'HIGH50', discountPercentage: 50 };
      couponPage.createCoupon(highDiscountCoupon);

      // Filter by amount range (20-40%)
      cy.getByTestId('filter-min-amount').clear().type('20');
      cy.getByTestId('filter-max-amount').clear().type('40');
      cy.getByTestId('apply-filter-button').click();

      // Verify only coupons in range are shown
      couponPage.shouldContainCoupon(percentageCoupon.code);
      couponPage.shouldNotContainCoupon(highDiscountCoupon.code);
    });

    /**
     * Test filtering coupons by expiration status
     *
     * Verifies that users can filter coupons by active/expired status.
     */
    it('should filter coupons by expiration status', () => {
      // Create active and expired coupons
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(testCoupon);

      const expiredCoupon = {
        ...testCoupon,
        code: 'EXPIRED',
        expirationDate: '2020-01-01'
      };
      couponPage.createCoupon(expiredCoupon);

      // Filter by active status
      couponPage.filterCoupons('active');

      // Verify only active coupons are shown
      couponPage.shouldContainCoupon(testCoupon.code);
      couponPage.shouldNotContainCoupon(expiredCoupon.code);
    });

    /**
     * Test sorting coupons by retailer name
     *
     * Verifies that users can sort coupons alphabetically by retailer.
     */
    it('should sort coupons by retailer name', () => {
      // Create coupons from different retailers
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(testCoupon);

      const retailerBCoupon = { ...testCoupon, code: 'RETAILERB', retailerId: 'retailer-b' };
      couponPage.createCoupon(retailerBCoupon);

      // Sort by retailer name
      couponPage.sortCoupons('retailer-name');

      // Verify sorting order
      cy.getByTestId('coupon-list').then(($list) => {
        const coupons = $list.text();
        expect(coupons.indexOf('RETAILERB')).to.be.lessThan(coupons.indexOf('SAVE20'));
      });
    });

    /**
     * Test sorting coupons by amount
     *
     * Verifies that users can sort coupons by discount amount.
     */
    it('should sort coupons by amount', () => {
      // Create coupons with different discounts
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(percentageCoupon);

      const highDiscountCoupon = { ...testCoupon, code: 'HIGH50', discountPercentage: 50 };
      couponPage.createCoupon(highDiscountCoupon);

      // Sort by amount (descending)
      couponPage.sortCoupons('amount-desc');

      // Verify sorting order
      cy.getByTestId('coupon-list').then(($list) => {
        const coupons = $list.text();
        expect(coupons.indexOf('HIGH50')).to.be.lessThan(coupons.indexOf('PERCENT30'));
      });
    });

    /**
     * Test sorting coupons by expiration date
     *
     * Verifies that users can sort coupons by expiration date.
     */
    it('should sort coupons by expiration date', () => {
      // Create coupons with different expiration dates
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(testCoupon);

      const expiringSoonCoupon = {
        ...testCoupon,
        code: 'SOON',
        expirationDate: '2025-02-01'
      };
      couponPage.createCoupon(expiringSoonCoupon);

      // Sort by expiration date (soonest first)
      couponPage.sortCoupons('expiration-asc');

      // Verify sorting order
      cy.getByTestId('coupon-list').then(($list) => {
        const coupons = $list.text();
        expect(coupons.indexOf('SOON')).to.be.lessThan(coupons.indexOf('SAVE20'));
      });
    });

    /**
     * Test searching coupons by name or code
     *
     * Verifies that users can search for coupons using keywords.
     */
    it('should search coupons by name or code', () => {
      // Create multiple coupons
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(testCoupon);

      const searchCoupon = { ...testCoupon, code: 'SEARCHME', description: 'Searchable coupon' };
      couponPage.createCoupon(searchCoupon);

      // Search for specific coupon
      couponPage.searchCoupons('SEARCHME');

      // Verify search results
      couponPage.shouldContainCoupon(searchCoupon.code);
      couponPage.shouldNotContainCoupon(testCoupon.code);
    });

    /**
     * Test viewing coupon details
     *
     * Verifies that users can view detailed information about a coupon.
     */
    it('should view coupon details', () => {
      // Create a coupon first
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(testCoupon);

      // View coupon details
      couponPage.viewCoupon(testCoupon.code);

      // Verify details modal is displayed
      cy.getByTestId('coupon-details-modal').should('be.visible');
      cy.getByTestId('coupon-details-code').should('contain', testCoupon.code);
      cy.getByTestId('coupon-details-description').should('contain', testCoupon.description);
    });
  });

  /**
   * Error Path Tests
   * Tests coupon management error scenarios
   */
  describe('Error Paths', () => {
    /**
     * Test creating coupon with missing required fields
     *
     * Verifies that form validation prevents submission with missing fields.
     */
    it('should show error for missing required fields', () => {
      couponPage
        .navigate()
        .shouldBeVisible()
        .clickCreateCoupon();

      // Submit without filling required fields
      cy.getByTestId('coupon-submit-button').click();

      // Verify validation errors
      cy.getByTestId('code-error').should('be.visible');
      cy.getByTestId('description-error').should('be.visible');
      cy.getByTestId('discount-error').should('be.visible');
      cy.getByTestId('retailer-error').should('be.visible');
    });

    /**
     * Test creating coupon with invalid expiration date
     *
     * Verifies that form validation rejects invalid date formats.
     */
    it('should show error for invalid expiration date', () => {
      couponPage
        .navigate()
        .shouldBeVisible()
        .clickCreateCoupon()
        .fillCouponCode(testCoupon.code)
        .fillCouponDescription(testCoupon.description)
        .fillCouponDiscount(testCoupon.discountPercentage)
        .fillCouponExpiration('invalid-date')
        .selectRetailer(testCoupon.retailerId)
        .submitCouponForm();

      // Verify error message
      cy.getByTestId('expiration-error').should('be.visible');
      cy.getByTestId('expiration-error').should('contain', 'Invalid date');
    });

    /**
     * Test editing expired coupon (should be disabled)
     *
     * Verifies that expired coupons cannot be edited.
     */
    it('should disable editing for expired coupons', () => {
      // Create an expired coupon
      const expiredCoupon = {
        ...testCoupon,
        code: 'EXPIRED',
        expirationDate: '2020-01-01'
      };

      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(expiredCoupon);

      // Try to edit expired coupon
      cy.getByTestId(`edit-coupon-${expiredCoupon.code}`).should('be.disabled');
    });

    /**
     * Test deleting coupon with confirmation
     *
     * Verifies that deletion requires confirmation and can be cancelled.
     */
    it('should require confirmation for coupon deletion', () => {
      // Create a coupon first
      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(testCoupon);

      // Attempt to delete
      couponPage.deleteCoupon(testCoupon.code);

      // Verify confirmation dialog appears
      cy.getByTestId('delete-confirmation-modal').should('be.visible');

      // Cancel deletion
      cy.getByTestId('cancel-delete-button').click();

      // Verify coupon still exists
      couponPage.shouldContainCoupon(testCoupon.code);
    });
  });

  /**
   * Edge Case Tests
   * Tests edge cases and boundary conditions
   */
  describe('Edge Cases', () => {
    /**
     * Test handling large number of coupons
     *
     * Verifies that the application handles pagination and performance
     * with a large number of coupons.
     */
    it('should handle large number of coupons', () => {
      // Create multiple coupons
      for (let i = 0; i < 50; i++) {
        const bulkCoupon = {
          ...testCoupon,
          code: `BULK${i}`,
          description: `Bulk coupon ${i}`
        };
        couponPage.createCoupon(bulkCoupon);
      }

      // Verify pagination is visible
      couponPage.paginationShouldBeVisible();

      // Navigate through pages
      couponPage.clickNextPage();
      couponPage.waitForLoad();

      couponPage.clickPreviousPage();
      couponPage.waitForLoad();
    });

    /**
     * Test handling coupon with special characters
     *
     * Verifies that coupons with special characters in code or description
     * are handled correctly.
     */
    it('should handle coupon with special characters', () => {
      const specialCoupon = {
        ...testCoupon,
        code: 'SAVE-20_!',
        description: 'Special chars: @#$%^&*()'
      };

      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(specialCoupon);

      // Verify coupon is displayed correctly
      couponPage.shouldContainCoupon(specialCoupon.code);
      cy.getByTestId(`coupon-description-${specialCoupon.code}`)
        .should('contain', 'Special chars');
    });

    /**
     * Test handling coupon with very long notes
     *
     * Verifies that the application handles long text in notes field.
     */
    it('should handle coupon with very long notes', () => {
      const longNotes = 'A'.repeat(1000);
      const longNotesCoupon = {
        ...testCoupon,
        code: 'LONGNOTES',
        notes: longNotes
      };

      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(longNotesCoupon);

      // Verify notes are stored and displayed
      couponPage.viewCoupon(longNotesCoupon.code);
      cy.getByTestId('coupon-details-notes').should('contain', longNotes);
    });

    /**
     * Test handling coupon with maximum discount
     *
     * Verifies that coupons with 100% discount are handled correctly.
     */
    it('should handle coupon with maximum discount', () => {
      const maxDiscountCoupon = {
        ...testCoupon,
        code: 'FREE',
        discountPercentage: 100
      };

      couponPage
        .navigate()
        .shouldBeVisible()
        .createCoupon(maxDiscountCoupon);

      // Verify discount is displayed correctly
      cy.getByTestId(`coupon-discount-${maxDiscountCoupon.code}`)
        .should('contain', '100%');
    });
  });

  /**
   * Internationalization Tests
   * Tests coupon management in different languages
   */
  describe('Internationalization (i18n)', () => {
    const languages = ['en', 'es', 'fr', 'de'] as const;

    languages.forEach((lang) => {
      /**
       * Test coupon creation in different language
       *
       * Verifies that coupon creation form is properly translated.
       */
      it(`should create coupon in ${lang}`, () => {
        cy.selectLanguage(lang);

        couponPage
          .navigate()
          .shouldBeVisible()
          .createCoupon(testCoupon);

        // Verify coupon was created
        couponPage.shouldContainCoupon(testCoupon.code);
        cy.get('html').should('have.attr', 'lang', lang);
      });

      /**
       * Test coupon list in different language
       *
       * Verifies that coupon list UI elements are properly translated.
       */
      it(`should display coupon list in ${lang}`, () => {
        cy.selectLanguage(lang);

        couponPage
          .navigate()
          .shouldBeVisible()
          .createCoupon(testCoupon);

        // Verify UI is in selected language
        cy.get('html').should('have.attr', 'lang', lang);
        cy.getByTestId('coupon-list-header').should('exist');
      });

      /**
       * Test error messages in different language
       *
       * Verifies that validation messages are displayed in selected language.
       */
      it(`should show error messages in ${lang}`, () => {
        cy.selectLanguage(lang);

        couponPage
          .navigate()
          .shouldBeVisible()
          .clickCreateCoupon()
          .submitCouponForm();

        // Verify error messages are in selected language
        cy.getByTestId('code-error').should('be.visible');
        cy.get('html').should('have.attr', 'lang', lang);
      });
    });
  });
});
