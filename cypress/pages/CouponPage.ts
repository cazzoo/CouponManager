/**
 * Page Object Model for the Coupon management page
 * 
 * Encapsulates all selectors, actions, and assertions related to coupon
 * management. Provides methods for creating, editing, deleting, and viewing
 * coupons.
 * 
 * @module CouponPage
 * @author Kilo Code
 * @date 2025-01-26
 */

import type { CouponData } from '../support/types';

/**
 * Page Object for the Coupon management page
 * 
 * Provides methods to interact with coupon lists, forms, and individual
 * coupon items.
 */
export class CouponPage {
  // Selectors using data-testid attributes
  private readonly selectors = {
    /** Coupon page container */
    couponPage: '[data-testid="coupon-page"]',
    /** Coupon list container */
    couponList: '[data-testid="coupon-list"]',
    /** Create coupon button */
    createCouponButton: '[data-testid="create-coupon-button"]',
    /** Coupon form */
    couponForm: '[data-testid="coupon-form"]',
    /** Coupon code input */
    couponCodeInput: '[data-testid="coupon-code-input"]',
    /** Coupon description input */
    couponDescriptionInput: '[data-testid="coupon-description-input"]',
    /** Coupon discount input */
    couponDiscountInput: '[data-testid="coupon-discount-input"]',
    /** Coupon expiration date input */
    couponExpirationInput: '[data-testid="coupon-expiration-input"]',
    /** Coupon retailer select */
    couponRetailerSelect: '[data-testid="coupon-retailer-select"]',
    /** Coupon notes input */
    couponNotesInput: '[data-testid="coupon-notes-input"]',
    /** Coupon submit button */
    couponSubmitButton: '[data-testid="coupon-submit-button"]',
    /** Coupon cancel button */
    couponCancelButton: '[data-testid="coupon-cancel-button"]',
    /** Search input */
    searchInput: '[data-testid="coupon-search-input"]',
    /** Filter dropdown */
    filterDropdown: '[data-testid="coupon-filter-dropdown"]',
    /** Sort dropdown */
    sortDropdown: '[data-testid="coupon-sort-dropdown"]',
    /** Coupon item (dynamic selector) */
    couponItem: '[data-testid^="coupon-item-"]',
    /** Coupon code display (dynamic selector) */
    couponCodeDisplay: '[data-testid^="coupon-code-"]',
    /** Coupon description display (dynamic selector) */
    couponDescriptionDisplay: '[data-testid^="coupon-description-"]',
    /** Coupon discount display (dynamic selector) */
    couponDiscountDisplay: '[data-testid^="coupon-discount-"]',
    /** Coupon expiration display (dynamic selector) */
    couponExpirationDisplay: '[data-testid^="coupon-expiration-"]',
    /** Edit coupon button (dynamic selector) */
    editCouponButton: '[data-testid^="edit-coupon-"]',
    /** Delete coupon button (dynamic selector) */
    deleteCouponButton: '[data-testid^="delete-coupon-"]',
    /** View coupon button (dynamic selector) */
    viewCouponButton: '[data-testid^="view-coupon-"]',
    /** Empty state message */
    emptyState: '[data-testid="coupon-empty-state"]',
    /** Loading indicator */
    loadingIndicator: '[data-testid="coupon-loading"]',
    /** Pagination container */
    pagination: '[data-testid="coupon-pagination"]',
    /** Previous page button */
    previousPageButton: '[data-testid="pagination-previous"]',
    /** Next page button */
    nextPageButton: '[data-testid="pagination-next"]'
  };

  /**
   * Navigates to the coupons page
   * 
   * @returns The CouponPage instance for method chaining
   */
  navigate(): this {
    cy.visit('/coupons');
    return this;
  }

  /**
   * Clicks the create coupon button
   * 
   * @returns The CouponPage instance for method chaining
   */
  clickCreateCoupon(): this {
    cy.get(this.selectors.createCouponButton).click();
    return this;
  }

  /**
   * Fills in the coupon code field
   * 
   * @param code - Coupon code
   * @returns The CouponPage instance for method chaining
   */
  fillCouponCode(code: string): this {
    cy.get(this.selectors.couponCodeInput).clear().type(code);
    return this;
  }

  /**
   * Fills in the coupon description field
   * 
   * @param description - Coupon description
   * @returns The CouponPage instance for method chaining
   */
  fillCouponDescription(description: string): this {
    cy.get(this.selectors.couponDescriptionInput).clear().type(description);
    return this;
  }

  /**
   * Fills in the coupon discount field
   * 
   * @param discount - Discount percentage
   * @returns The CouponPage instance for method chaining
   */
  fillCouponDiscount(discount: number): this {
    cy.get(this.selectors.couponDiscountInput).clear().type(discount.toString());
    return this;
  }

  /**
   * Fills in the coupon expiration date field
   * 
   * @param expirationDate - Expiration date in ISO format
   * @returns The CouponPage instance for method chaining
   */
  fillCouponExpiration(expirationDate: string): this {
    cy.get(this.selectors.couponExpirationInput).clear().type(expirationDate);
    return this;
  }

  /**
   * Selects a retailer from the dropdown
   * 
   * @param retailerId - Retailer identifier
   * @returns The CouponPage instance for method chaining
   */
  selectRetailer(retailerId: string): this {
    cy.get(this.selectors.couponRetailerSelect).select(retailerId);
    return this;
  }

  /**
   * Fills in the coupon notes field
   * 
   * @param notes - Additional notes
   * @returns The CouponPage instance for method chaining
   */
  fillCouponNotes(notes: string): this {
    cy.get(this.selectors.couponNotesInput).clear().type(notes);
    return this;
  }

  /**
   * Fills in all coupon form fields
   * 
   * @param couponData - Coupon data object
   * @returns The CouponPage instance for method chaining
   */
  fillCouponForm(couponData: CouponData): this {
    this.fillCouponCode(couponData.code)
      .fillCouponDescription(couponData.description)
      .fillCouponDiscount(couponData.discountPercentage)
      .fillCouponExpiration(couponData.expirationDate)
      .selectRetailer(couponData.retailerId);

    if (couponData.notes) {
      this.fillCouponNotes(couponData.notes);
    }

    return this;
  }

  /**
   * Submits the coupon form
   * 
   * @returns The CouponPage instance for method chaining
   */
  submitCouponForm(): this {
    cy.get(this.selectors.couponSubmitButton).click();
    return this;
  }

  /**
   * Cancels the coupon form
   * 
   * @returns The CouponPage instance for method chaining
   */
  cancelCouponForm(): this {
    cy.get(this.selectors.couponCancelButton).click();
    return this;
  }

  /**
   * Creates a new coupon with the provided data
   * 
   * @param couponData - Coupon data object
   * @returns The CouponPage instance for method chaining
   */
  createCoupon(couponData: CouponData): this {
    this.clickCreateCoupon()
      .fillCouponForm(couponData)
      .submitCouponForm();
    return this;
  }

  /**
   * Clicks the edit button for a specific coupon
   * 
   * @param couponId - Coupon identifier
   * @returns The CouponPage instance for method chaining
   */
  editCoupon(couponId: string): this {
    cy.get(`[data-testid="edit-coupon-${couponId}"]`).click();
    return this;
  }

  /**
   * Clicks the delete button for a specific coupon
   * 
   * @param couponId - Coupon identifier
   * @returns The CouponPage instance for method chaining
   */
  deleteCoupon(couponId: string): this {
    cy.get(`[data-testid="delete-coupon-${couponId}"]`).click();
    return this;
  }

  /**
   * Clicks the view button for a specific coupon
   * 
   * @param couponId - Coupon identifier
   * @returns The CouponPage instance for method chaining
   */
  viewCoupon(couponId: string): this {
    cy.get(`[data-testid="view-coupon-${couponId}"]`).click();
    return this;
  }

  /**
   * Searches for coupons by keyword
   * 
   * @param searchTerm - Search term
   * @returns The CouponPage instance for method chaining
   */
  searchCoupons(searchTerm: string): this {
    cy.get(this.selectors.searchInput).clear().type(searchTerm);
    return this;
  }

  /**
   * Filters coupons by status or category
   * 
   * @param filterValue - Filter value to select
   * @returns The CouponPage instance for method chaining
   */
  filterCoupons(filterValue: string): this {
    cy.get(this.selectors.filterDropdown).select(filterValue);
    return this;
  }

  /**
   * Sorts coupons by a specific criteria
   * 
   * @param sortValue - Sort value to select
   * @returns The CouponPage instance for method chaining
   */
  sortCoupons(sortValue: string): this {
    cy.get(this.selectors.sortDropdown).select(sortValue);
    return this;
  }

  /**
   * Clicks the previous page button in pagination
   * 
   * @returns The CouponPage instance for method chaining
   */
  clickPreviousPage(): this {
    cy.get(this.selectors.previousPageButton).click();
    return this;
  }

  /**
   * Clicks the next page button in pagination
   * 
   * @returns The CouponPage instance for method chaining
   */
  clickNextPage(): this {
    cy.get(this.selectors.nextPageButton).click();
    return this;
  }

  // Assertion methods

  /**
   * Asserts that the coupon page is visible
   * 
   * @returns The CouponPage instance for method chaining
   */
  shouldBeVisible(): this {
    cy.get(this.selectors.couponPage).should('be.visible');
    return this;
  }

  /**
   * Asserts that the coupon list contains a specific coupon code
   * 
   * @param code - Coupon code to search for
   * @returns The CouponPage instance for method chaining
   */
  shouldContainCoupon(code: string): this {
    cy.get(this.selectors.couponList).should('contain', code);
    return this;
  }

  /**
   * Asserts that the coupon list does not contain a specific coupon code
   * 
   * @param code - Coupon code to check for absence
   * @returns The CouponPage instance for method chaining
   */
  shouldNotContainCoupon(code: string): this {
    cy.get(this.selectors.couponList).should('not.contain', code);
    return this;
  }

  /**
   * Asserts that a specific coupon is visible in the list
   * 
   * @param couponId - Coupon identifier
   * @returns The CouponPage instance for method chaining
   */
  couponShouldBeVisible(couponId: string): this {
    cy.get(`[data-testid="coupon-item-${couponId}"]`).should('be.visible');
    return this;
  }

  /**
   * Asserts that a specific coupon is not visible in the list
   * 
   * @param couponId - Coupon identifier
   * @returns The CouponPage instance for method chaining
   */
  couponShouldNotBeVisible(couponId: string): this {
    cy.get(`[data-testid="coupon-item-${couponId}"]`).should('not.exist');
    return this;
  }

  /**
   * Asserts that the coupon form is visible
   * 
   * @returns The CouponPage instance for method chaining
   */
  couponFormShouldBeVisible(): this {
    cy.get(this.selectors.couponForm).should('be.visible');
    return this;
  }

  /**
   * Asserts that the coupon form is not visible
   * 
   * @returns The CouponPage instance for method chaining
   */
  couponFormShouldNotBeVisible(): this {
    cy.get(this.selectors.couponForm).should('not.exist');
    return this;
  }

  /**
   * Asserts that the empty state is displayed
   * 
   * @returns The CouponPage instance for method chaining
   */
  shouldShowEmptyState(): this {
    cy.get(this.selectors.emptyState).should('be.visible');
    return this;
  }

  /**
   * Asserts that the loading indicator is visible
   * 
   * @returns The CouponPage instance for method chaining
   */
  shouldShowLoading(): this {
    cy.get(this.selectors.loadingIndicator).should('be.visible');
    return this;
  }

  /**
   * Asserts that the loading indicator is not visible
   * 
   * @returns The CouponPage instance for method chaining
   */
  shouldNotShowLoading(): this {
    cy.get(this.selectors.loadingIndicator).should('not.exist');
    return this;
  }

  /**
   * Asserts that the pagination is visible
   * 
   * @returns The CouponPage instance for method chaining
   */
  paginationShouldBeVisible(): this {
    cy.get(this.selectors.pagination).should('be.visible');
    return this;
  }

  // Navigation methods

  /**
   * Waits for the coupon page to fully load
   * 
   * @returns The CouponPage instance for method chaining
   */
  waitForLoad(): this {
    cy.get(this.selectors.couponPage).should('be.visible');
    cy.get(this.selectors.loadingIndicator).should('not.exist');
    return this;
  }

  /**
   * Gets the coupon list element
   * 
   * @returns Chainable element containing the coupon list
   */
  getCouponList(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.couponList);
  }
}

/**
 * Creates and returns a new CouponPage instance
 * 
 * @returns A new CouponPage instance
 */
export const couponPage = new CouponPage();
