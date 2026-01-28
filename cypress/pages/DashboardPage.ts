/**
 * Page Object Model for the Dashboard page
 * 
 * Encapsulates all selectors, actions, and assertions related to the main
 * dashboard interface. Provides methods for navigation, accessing dashboard
 * features, and verifying dashboard state.
 * 
 * @module DashboardPage
 * @author Kilo Code
 * @date 2025-01-26
 */

/**
 * Page Object for the Dashboard page
 * 
 * Provides methods to interact with the main dashboard, navigate to different
 * sections, and verify dashboard content and state.
 */
export class DashboardPage {
  // Selectors using data-testid attributes
  private readonly selectors = {
    /** Dashboard container */
    dashboardContainer: '[data-testid="dashboard-container"]',
    /** Dashboard title */
    dashboardTitle: '[data-testid="dashboard-title"]',
    /** Welcome message */
    welcomeMessage: '[data-testid="welcome-message"]',
    /** Navigation menu */
    navigationMenu: '[data-testid="navigation-menu"]',
    /** Coupons navigation link */
    couponsLink: '[data-testid="nav-coupons"]',
    /** Retailers navigation link */
    retailersLink: '[data-testid="nav-retailers"]',
    /** Users navigation link */
    usersLink: '[data-testid="nav-users"]',
    /** Settings navigation link */
    settingsLink: '[data-testid="nav-settings"]',
    /** Logout button */
    logoutButton: '[data-testid="logout-button"]',
    /** Language selector */
    languageSelector: '[data-testid="language-selector"]',
    /** User profile dropdown */
    userProfileDropdown: '[data-testid="user-profile-dropdown"]',
    /** Stats cards container */
    statsCards: '[data-testid="stats-cards"]',
    /** Total coupons stat */
    totalCouponsStat: '[data-testid="stat-total-coupons"]',
    /** Active coupons stat */
    activeCouponsStat: '[data-testid="stat-active-coupons"]',
    /** Total retailers stat */
    totalRetailersStat: '[data-testid="stat-total-retailers"]',
    /** Total users stat */
    totalUsersStat: '[data-testid="stat-total-users"]',
    /** Recent activity section */
    recentActivity: '[data-testid="recent-activity"]',
    /** Quick actions section */
    quickActions: '[data-testid="quick-actions"]',
    /** Create coupon quick action */
    createCouponAction: '[data-testid="quick-action-create-coupon"]',
    /** Add retailer quick action */
    addRetailerAction: '[data-testid="quick-action-add-retailer"]'
  };

  /**
   * Navigates to the dashboard
   * 
   * @returns The DashboardPage instance for method chaining
   */
  navigate(): this {
    cy.visit('/dashboard');
    return this;
  }

  /**
   * Clicks the coupons navigation link
   * 
   * @returns The DashboardPage instance for method chaining
   */
  navigateToCoupons(): this {
    cy.get(this.selectors.couponsLink).click();
    return this;
  }

  /**
   * Clicks the retailers navigation link
   * 
   * @returns The DashboardPage instance for method chaining
   */
  navigateToRetailers(): this {
    cy.get(this.selectors.retailersLink).click();
    return this;
  }

  /**
   * Clicks the users navigation link
   * 
   * @returns The DashboardPage instance for method chaining
   */
  navigateToUsers(): this {
    cy.get(this.selectors.usersLink).click();
    return this;
  }

  /**
   * Clicks the settings navigation link
   * 
   * @returns The DashboardPage instance for method chaining
   */
  navigateToSettings(): this {
    cy.get(this.selectors.settingsLink).click();
    return this;
  }

  /**
   * Clicks the logout button
   * 
   * @returns The DashboardPage instance for method chaining
   */
  logout(): this {
    cy.get(this.selectors.logoutButton).click();
    return this;
  }

  /**
   * Clicks the create coupon quick action
   * 
   * @returns The DashboardPage instance for method chaining
   */
  clickCreateCoupon(): this {
    cy.get(this.selectors.createCouponAction).click();
    return this;
  }

  /**
   * Clicks the add retailer quick action
   * 
   * @returns The DashboardPage instance for method chaining
   */
  clickAddRetailer(): this {
    cy.get(this.selectors.addRetailerAction).click();
    return this;
  }

  /**
   * Opens the user profile dropdown
   * 
   * @returns The DashboardPage instance for method chaining
   */
  openUserProfile(): this {
    cy.get(this.selectors.userProfileDropdown).click();
    return this;
  }

  // Assertion methods

  /**
   * Asserts that the dashboard is visible
   * 
   * @returns The DashboardPage instance for method chaining
   */
  shouldBeVisible(): this {
    cy.get(this.selectors.dashboardContainer).should('be.visible');
    return this;
  }

  /**
   * Asserts that the dashboard is not visible
   * 
   * @returns The DashboardPage instance for method chaining
   */
  shouldNotBeVisible(): this {
    cy.get(this.selectors.dashboardContainer).should('not.exist');
    return this;
  }

  /**
   * Asserts that the dashboard title contains the expected text
   * 
   * @param expectedTitle - Expected dashboard title
   * @returns The DashboardPage instance for method chaining
   */
  titleShouldContain(expectedTitle: string): this {
    cy.get(this.selectors.dashboardTitle).should('contain', expectedTitle);
    return this;
  }

  /**
   * Asserts that the welcome message contains the expected text
   * 
   * @param expectedMessage - Expected welcome message
   * @returns The DashboardPage instance for method chaining
   */
  welcomeMessageShouldContain(expectedMessage: string): this {
    cy.get(this.selectors.welcomeMessage).should('contain', expectedMessage);
    return this;
  }

  /**
   * Asserts that a specific navigation link is active
   * 
   * @param linkSelector - Selector for the navigation link
   * @returns The DashboardPage instance for method chaining
   */
  navLinkShouldBeActive(linkSelector: string): this {
    cy.get(linkSelector).should('have.class', 'active');
    return this;
  }

  /**
   * Asserts that the stats cards are visible
   * 
   * @returns The DashboardPage instance for method chaining
   */
  statsShouldBeVisible(): this {
    cy.get(this.selectors.statsCards).should('be.visible');
    return this;
  }

  /**
   * Asserts that the total coupons stat contains the expected value
   * 
   * @param expectedValue - Expected number of total coupons
   * @returns The DashboardPage instance for method chaining
   */
  totalCouponsShouldBe(expectedValue: number): this {
    cy.get(this.selectors.totalCouponsStat).should('contain', expectedValue.toString());
    return this;
  }

  /**
   * Asserts that the active coupons stat contains the expected value
   * 
   * @param expectedValue - Expected number of active coupons
   * @returns The DashboardPage instance for method chaining
   */
  activeCouponsShouldBe(expectedValue: number): this {
    cy.get(this.selectors.activeCouponsStat).should('contain', expectedValue.toString());
    return this;
  }

  /**
   * Asserts that the total retailers stat contains the expected value
   * 
   * @param expectedValue - Expected number of retailers
   * @returns The DashboardPage instance for method chaining
   */
  totalRetailersShouldBe(expectedValue: number): this {
    cy.get(this.selectors.totalRetailersStat).should('contain', expectedValue.toString());
    return this;
  }

  /**
   * Asserts that the total users stat contains the expected value
   * 
   * @param expectedValue - Expected number of users
   * @returns The DashboardPage instance for method chaining
   */
  totalUsersShouldBe(expectedValue: number): this {
    cy.get(this.selectors.totalUsersStat).should('contain', expectedValue.toString());
    return this;
  }

  /**
   * Asserts that the recent activity section is visible
   * 
   * @returns The DashboardPage instance for method chaining
   */
  recentActivityShouldBeVisible(): this {
    cy.get(this.selectors.recentActivity).should('be.visible');
    return this;
  }

  /**
   * Asserts that the quick actions section is visible
   * 
   * @returns The DashboardPage instance for method chaining
   */
  quickActionsShouldBeVisible(): this {
    cy.get(this.selectors.quickActions).should('be.visible');
    return this;
  }

  // Navigation methods

  /**
   * Waits for the dashboard to fully load
   * 
   * @returns The DashboardPage instance for method chaining
   */
  waitForLoad(): this {
    cy.get(this.selectors.dashboardContainer).should('be.visible');
    cy.get(this.selectors.statsCards).should('be.visible');
    return this;
  }

  /**
   * Gets the current welcome message text
   * 
   * @returns Chainable element containing the welcome message
   */
  getWelcomeMessage(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.welcomeMessage);
  }
}

/**
 * Creates and returns a new DashboardPage instance
 * 
 * @returns A new DashboardPage instance
 */
export const dashboardPage = new DashboardPage();
