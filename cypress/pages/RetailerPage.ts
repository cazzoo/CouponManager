/**
 * Page Object Model for the Retailer management page
 * 
 * Encapsulates all selectors, actions, and assertions related to retailer
 * management. Provides methods for creating, editing, deleting, and viewing
 * retailers.
 * 
 * @module RetailerPage
 * @author Kilo Code
 * @date 2025-01-26
 */

import type { RetailerData } from '../support/types';

/**
 * Page Object for the Retailer management page
 * 
 * Provides methods to interact with retailer lists, forms, and individual
 * retailer items.
 */
export class RetailerPage {
  // Selectors using data-testid attributes
  private readonly selectors = {
    /** Retailer page container */
    retailerPage: '[data-testid="retailer-page"]',
    /** Retailer list container */
    retailerList: '[data-testid="retailer-list"]',
    /** Add retailer button */
    addRetailerButton: '[data-testid="add-retailer-button"]',
    /** Retailer form */
    retailerForm: '[data-testid="retailer-form"]',
    /** Retailer name input */
    retailerNameInput: '[data-testid="retailer-name-input"]',
    /** Retailer website input */
    retailerWebsiteInput: '[data-testid="retailer-website-input"]',
    /** Retailer address input */
    retailerAddressInput: '[data-testid="retailer-address-input"]',
    /** Retailer submit button */
    retailerSubmitButton: '[data-testid="retailer-submit-button"]',
    /** Retailer cancel button */
    retailerCancelButton: '[data-testid="retailer-cancel-button"]',
    /** Search input */
    searchInput: '[data-testid="retailer-search-input"]',
    /** Sort dropdown */
    sortDropdown: '[data-testid="retailer-sort-dropdown"]',
    /** Retailer item (dynamic selector) */
    retailerItem: '[data-testid^="retailer-item-"]',
    /** Retailer name display (dynamic selector) */
    retailerNameDisplay: '[data-testid^="retailer-name-"]',
    /** Retailer website display (dynamic selector) */
    retailerWebsiteDisplay: '[data-testid^="retailer-website-"]',
    /** Retailer address display (dynamic selector) */
    retailerAddressDisplay: '[data-testid^="retailer-address-"]',
    /** Edit retailer button (dynamic selector) */
    editRetailerButton: '[data-testid^="edit-retailer-"]',
    /** Delete retailer button (dynamic selector) */
    deleteRetailerButton: '[data-testid^="delete-retailer-"]',
    /** View retailer button (dynamic selector) */
    viewRetailerButton: '[data-testid^="view-retailer-"]',
    /** Retailer logo (dynamic selector) */
    retailerLogo: '[data-testid^="retailer-logo-"]',
    /** Empty state message */
    emptyState: '[data-testid="retailer-empty-state"]',
    /** Loading indicator */
    loadingIndicator: '[data-testid="retailer-loading"]',
    /** Pagination container */
    pagination: '[data-testid="retailer-pagination"]',
    /** Previous page button */
    previousPageButton: '[data-testid="pagination-previous"]',
    /** Next page button */
    nextPageButton: '[data-testid="pagination-next"]'
  };

  /**
   * Navigates to the retailers page
   * 
   * @returns The RetailerPage instance for method chaining
   */
  navigate(): this {
    cy.visit('/retailers');
    return this;
  }

  /**
   * Clicks the add retailer button
   * 
   * @returns The RetailerPage instance for method chaining
   */
  clickAddRetailer(): this {
    cy.get(this.selectors.addRetailerButton).click();
    return this;
  }

  /**
   * Fills in the retailer name field
   * 
   * @param name - Retailer name
   * @returns The RetailerPage instance for method chaining
   */
  fillRetailerName(name: string): this {
    cy.get(this.selectors.retailerNameInput).clear().type(name);
    return this;
  }

  /**
   * Fills in the retailer website field
   * 
   * @param website - Retailer website URL
   * @returns The RetailerPage instance for method chaining
   */
  fillRetailerWebsite(website: string): this {
    cy.get(this.selectors.retailerWebsiteInput).clear().type(website);
    return this;
  }

  /**
   * Fills in the retailer address field
   * 
   * @param address - Retailer physical address
   * @returns The RetailerPage instance for method chaining
   */
  fillRetailerAddress(address: string): this {
    cy.get(this.selectors.retailerAddressInput).clear().type(address);
    return this;
  }

  /**
   * Fills in all retailer form fields
   * 
   * @param retailerData - Retailer data object
   * @returns The RetailerPage instance for method chaining
   */
  fillRetailerForm(retailerData: RetailerData): this {
    this.fillRetailerName(retailerData.name);

    if (retailerData.website) {
      this.fillRetailerWebsite(retailerData.website);
    }

    if (retailerData.address) {
      this.fillRetailerAddress(retailerData.address);
    }

    return this;
  }

  /**
   * Submits the retailer form
   * 
   * @returns The RetailerPage instance for method chaining
   */
  submitRetailerForm(): this {
    cy.get(this.selectors.retailerSubmitButton).click();
    return this;
  }

  /**
   * Cancels the retailer form
   * 
   * @returns The RetailerPage instance for method chaining
   */
  cancelRetailerForm(): this {
    cy.get(this.selectors.retailerCancelButton).click();
    return this;
  }

  /**
   * Creates a new retailer with the provided data
   * 
   * @param retailerData - Retailer data object
   * @returns The RetailerPage instance for method chaining
   */
  addRetailer(retailerData: RetailerData): this {
    this.clickAddRetailer()
      .fillRetailerForm(retailerData)
      .submitRetailerForm();
    return this;
  }

  /**
   * Clicks the edit button for a specific retailer
   * 
   * @param retailerId - Retailer identifier
   * @returns The RetailerPage instance for method chaining
   */
  editRetailer(retailerId: string): this {
    cy.get(`[data-testid="edit-retailer-${retailerId}"]`).click();
    return this;
  }

  /**
   * Clicks the delete button for a specific retailer
   * 
   * @param retailerId - Retailer identifier
   * @returns The RetailerPage instance for method chaining
   */
  deleteRetailer(retailerId: string): this {
    cy.get(`[data-testid="delete-retailer-${retailerId}"]`).click();
    return this;
  }

  /**
   * Clicks the view button for a specific retailer
   * 
   * @param retailerId - Retailer identifier
   * @returns The RetailerPage instance for method chaining
   */
  viewRetailer(retailerId: string): this {
    cy.get(`[data-testid="view-retailer-${retailerId}"]`).click();
    return this;
  }

  /**
   * Searches for retailers by keyword
   * 
   * @param searchTerm - Search term
   * @returns The RetailerPage instance for method chaining
   */
  searchRetailers(searchTerm: string): this {
    cy.get(this.selectors.searchInput).clear().type(searchTerm);
    return this;
  }

  /**
   * Sorts retailers by a specific criteria
   * 
   * @param sortValue - Sort value to select
   * @returns The RetailerPage instance for method chaining
   */
  sortRetailers(sortValue: string): this {
    cy.get(this.selectors.sortDropdown).select(sortValue);
    return this;
  }

  /**
   * Clicks the previous page button in pagination
   * 
   * @returns The RetailerPage instance for method chaining
   */
  clickPreviousPage(): this {
    cy.get(this.selectors.previousPageButton).click();
    return this;
  }

  /**
   * Clicks the next page button in pagination
   * 
   * @returns The RetailerPage instance for method chaining
   */
  clickNextPage(): this {
    cy.get(this.selectors.nextPageButton).click();
    return this;
  }

  // Assertion methods

  /**
   * Asserts that the retailer page is visible
   * 
   * @returns The RetailerPage instance for method chaining
   */
  shouldBeVisible(): this {
    cy.get(this.selectors.retailerPage).should('be.visible');
    return this;
  }

  /**
   * Asserts that the retailer list contains a specific retailer name
   * 
   * @param name - Retailer name to search for
   * @returns The RetailerPage instance for method chaining
   */
  shouldContainRetailer(name: string): this {
    cy.get(this.selectors.retailerList).should('contain', name);
    return this;
  }

  /**
   * Asserts that the retailer list does not contain a specific retailer name
   * 
   * @param name - Retailer name to check for absence
   * @returns The RetailerPage instance for method chaining
   */
  shouldNotContainRetailer(name: string): this {
    cy.get(this.selectors.retailerList).should('not.contain', name);
    return this;
  }

  /**
   * Asserts that a specific retailer is visible in the list
   * 
   * @param retailerId - Retailer identifier
   * @returns The RetailerPage instance for method chaining
   */
  retailerShouldBeVisible(retailerId: string): this {
    cy.get(`[data-testid="retailer-item-${retailerId}"]`).should('be.visible');
    return this;
  }

  /**
   * Asserts that a specific retailer is not visible in the list
   * 
   * @param retailerId - Retailer identifier
   * @returns The RetailerPage instance for method chaining
   */
  retailerShouldNotBeVisible(retailerId: string): this {
    cy.get(`[data-testid="retailer-item-${retailerId}"]`).should('not.exist');
    return this;
  }

  /**
   * Asserts that the retailer form is visible
   * 
   * @returns The RetailerPage instance for method chaining
   */
  retailerFormShouldBeVisible(): this {
    cy.get(this.selectors.retailerForm).should('be.visible');
    return this;
  }

  /**
   * Asserts that the retailer form is not visible
   * 
   * @returns The RetailerPage instance for method chaining
   */
  retailerFormShouldNotBeVisible(): this {
    cy.get(this.selectors.retailerForm).should('not.exist');
    return this;
  }

  /**
   * Asserts that the empty state is displayed
   * 
   * @returns The RetailerPage instance for method chaining
   */
  shouldShowEmptyState(): this {
    cy.get(this.selectors.emptyState).should('be.visible');
    return this;
  }

  /**
   * Asserts that the loading indicator is visible
   * 
   * @returns The RetailerPage instance for method chaining
   */
  shouldShowLoading(): this {
    cy.get(this.selectors.loadingIndicator).should('be.visible');
    return this;
  }

  /**
   * Asserts that the loading indicator is not visible
   * 
   * @returns The RetailerPage instance for method chaining
   */
  shouldNotShowLoading(): this {
    cy.get(this.selectors.loadingIndicator).should('not.exist');
    return this;
  }

  /**
   * Asserts that the pagination is visible
   * 
   * @returns The RetailerPage instance for method chaining
   */
  paginationShouldBeVisible(): this {
    cy.get(this.selectors.pagination).should('be.visible');
    return this;
  }

  /**
   * Asserts that a retailer's website link is correct
   * 
   * @param retailerId - Retailer identifier
   * @param expectedUrl - Expected website URL
   * @returns The RetailerPage instance for method chaining
   */
  retailerWebsiteShouldBe(retailerId: string, expectedUrl: string): this {
    cy.get(`[data-testid="retailer-website-${retailerId}"]`)
      .should('have.attr', 'href')
      .and('include', expectedUrl);
    return this;
  }

  // Navigation methods

  /**
   * Waits for the retailer page to fully load
   * 
   * @returns The RetailerPage instance for method chaining
   */
  waitForLoad(): this {
    cy.get(this.selectors.retailerPage).should('be.visible');
    cy.get(this.selectors.loadingIndicator).should('not.exist');
    return this;
  }

  /**
   * Gets the retailer list element
   * 
   * @returns Chainable element containing the retailer list
   */
  getRetailerList(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.retailerList);
  }
}

/**
 * Creates and returns a new RetailerPage instance
 * 
 * @returns A new RetailerPage instance
 */
export const retailerPage = new RetailerPage();
