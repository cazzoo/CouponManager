/**
 * Page Object Model for the User Management page
 * 
 * Encapsulates all selectors, actions, and assertions related to user
 * management. Provides methods for creating, editing, deleting, and managing
 * user accounts and roles.
 * 
 * @module UserManagementPage
 * @author Kilo Code
 * @date 2025-01-26
 */

import type { UserData } from '../support/types';

/**
 * Page Object for the User Management page
 * 
 * Provides methods to interact with user lists, forms, and individual
 * user items including role management and account activation.
 */
export class UserManagementPage {
  // Selectors using data-testid attributes
  private readonly selectors = {
    /** User management page container */
    userManagementPage: '[data-testid="user-management-page"]',
    /** User list container */
    userList: '[data-testid="user-list"]',
    /** Add user button */
    addUserButton: '[data-testid="add-user-button"]',
    /** User form */
    userForm: '[data-testid="user-form"]',
    /** User username input */
    userUsernameInput: '[data-testid="user-username-input"]',
    /** User email input */
    userEmailInput: '[data-testid="user-email-input"]',
    /** User role select */
    userRoleSelect: '[data-testid="user-role-select"]',
    /** User password input */
    userPasswordInput: '[data-testid="user-password-input"]',
    /** User confirm password input */
    userConfirmPasswordInput: '[data-testid="user-confirm-password-input"]',
    /** User submit button */
    userSubmitButton: '[data-testid="user-submit-button"]',
    /** User cancel button */
    userCancelButton: '[data-testid="user-cancel-button"]',
    /** Search input */
    searchInput: '[data-testid="user-search-input"]',
    /** Role filter dropdown */
    roleFilterDropdown: '[data-testid="user-role-filter"]',
    /** Status filter dropdown */
    statusFilterDropdown: '[data-testid="user-status-filter"]',
    /** Sort dropdown */
    sortDropdown: '[data-testid="user-sort-dropdown"]',
    /** User item (dynamic selector) */
    userItem: '[data-testid^="user-item-"]',
    /** User username display (dynamic selector) */
    userUsernameDisplay: '[data-testid^="user-username-"]',
    /** User email display (dynamic selector) */
    userEmailDisplay: '[data-testid^="user-email-"]',
    /** User role display (dynamic selector) */
    userRoleDisplay: '[data-testid^="user-role-"]',
    /** User status display (dynamic selector) */
    userStatusDisplay: '[data-testid^="user-status-"]',
    /** Edit user button (dynamic selector) */
    editUserButton: '[data-testid^="edit-user-"]',
    /** Delete user button (dynamic selector) */
    deleteUserButton: '[data-testid^="delete-user-"]',
    /** View user button (dynamic selector) */
    viewUserButton: '[data-testid^="view-user-"]',
    /** Activate user button (dynamic selector) */
    activateUserButton: '[data-testid^="activate-user-"]',
    /** Deactivate user button (dynamic selector) */
    deactivateUserButton: '[data-testid^="deactivate-user-"]',
    /** Change role button (dynamic selector) */
    changeRoleButton: '[data-testid^="change-role-"]',
    /** Empty state message */
    emptyState: '[data-testid="user-empty-state"]',
    /** Loading indicator */
    loadingIndicator: '[data-testid="user-loading"]',
    /** Pagination container */
    pagination: '[data-testid="user-pagination"]',
    /** Previous page button */
    previousPageButton: '[data-testid="pagination-previous"]',
    /** Next page button */
    nextPageButton: '[data-testid="pagination-next"]',
    /** Bulk actions toolbar */
    bulkActionsToolbar: '[data-testid="bulk-actions-toolbar"]',
    /** Select all checkbox */
    selectAllCheckbox: '[data-testid="select-all-users"]',
    /** Bulk delete button */
    bulkDeleteButton: '[data-testid="bulk-delete-users"]',
    /** Bulk activate button */
    bulkActivateButton: '[data-testid="bulk-activate-users"]',
    /** Bulk deactivate button */
    bulkDeactivateButton: '[data-testid="bulk-deactivate-users"]'
  };

  /**
   * Navigates to the user management page
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  navigate(): this {
    cy.visit('/users');
    return this;
  }

  /**
   * Clicks the add user button
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  clickAddUser(): this {
    cy.get(this.selectors.addUserButton).click();
    return this;
  }

  /**
   * Fills in the user username field
   * 
   * @param username - User username
   * @returns The UserManagementPage instance for method chaining
   */
  fillUserUsername(username: string): this {
    cy.get(this.selectors.userUsernameInput).clear().type(username);
    return this;
  }

  /**
   * Fills in the user email field
   * 
   * @param email - User email address
   * @returns The UserManagementPage instance for method chaining
   */
  fillUserEmail(email: string): this {
    cy.get(this.selectors.userEmailInput).clear().type(email);
    return this;
  }

  /**
   * Selects a user role from the dropdown
   * 
   * @param role - User role to select
   * @returns The UserManagementPage instance for method chaining
   */
  selectUserRole(role: string): this {
    cy.get(this.selectors.userRoleSelect).select(role);
    return this;
  }

  /**
   * Fills in the user password field
   * 
   * @param password - User password
   * @returns The UserManagementPage instance for method chaining
   */
  fillUserPassword(password: string): this {
    cy.get(this.selectors.userPasswordInput).clear().type(password);
    return this;
  }

  /**
   * Fills in the user confirm password field
   * 
   * @param password - Password to confirm
   * @returns The UserManagementPage instance for method chaining
   */
  fillUserConfirmPassword(password: string): this {
    cy.get(this.selectors.userConfirmPasswordInput).clear().type(password);
    return this;
  }

  /**
   * Fills in all user form fields
   * 
   * @param userData - User data object
   * @param password - Optional password for new user creation
   * @returns The UserManagementPage instance for method chaining
   */
  fillUserForm(userData: UserData, password?: string): this {
    this.fillUserUsername(userData.username)
      .fillUserEmail(userData.email)
      .selectUserRole(userData.role);

    if (password) {
      this.fillUserPassword(password).fillUserConfirmPassword(password);
    }

    return this;
  }

  /**
   * Submits the user form
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  submitUserForm(): this {
    cy.get(this.selectors.userSubmitButton).click();
    return this;
  }

  /**
   * Cancels the user form
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  cancelUserForm(): this {
    cy.get(this.selectors.userCancelButton).click();
    return this;
  }

  /**
   * Creates a new user with the provided data
   * 
   * @param userData - User data object
   * @param password - Password for the new user
   * @returns The UserManagementPage instance for method chaining
   */
  addUser(userData: UserData, password: string): this {
    this.clickAddUser()
      .fillUserForm(userData, password)
      .submitUserForm();
    return this;
  }

  /**
   * Clicks the edit button for a specific user
   * 
   * @param userId - User identifier
   * @returns The UserManagementPage instance for method chaining
   */
  editUser(userId: string): this {
    cy.get(`[data-testid="edit-user-${userId}"]`).click();
    return this;
  }

  /**
   * Clicks the delete button for a specific user
   * 
   * @param userId - User identifier
   * @returns The UserManagementPage instance for method chaining
   */
  deleteUser(userId: string): this {
    cy.get(`[data-testid="delete-user-${userId}"]`).click();
    return this;
  }

  /**
   * Clicks the view button for a specific user
   * 
   * @param userId - User identifier
   * @returns The UserManagementPage instance for method chaining
   */
  viewUser(userId: string): this {
    cy.get(`[data-testid="view-user-${userId}"]`).click();
    return this;
  }

  /**
   * Clicks the activate button for a specific user
   * 
   * @param userId - User identifier
   * @returns The UserManagementPage instance for method chaining
   */
  activateUser(userId: string): this {
    cy.get(`[data-testid="activate-user-${userId}"]`).click();
    return this;
  }

  /**
   * Clicks the deactivate button for a specific user
   * 
   * @param userId - User identifier
   * @returns The UserManagementPage instance for method chaining
   */
  deactivateUser(userId: string): this {
    cy.get(`[data-testid="deactivate-user-${userId}"]`).click();
    return this;
  }

  /**
   * Clicks the change role button for a specific user
   * 
   * @param userId - User identifier
   * @returns The UserManagementPage instance for method chaining
   */
  changeUserRole(userId: string): this {
    cy.get(`[data-testid="change-role-${userId}"]`).click();
    return this;
  }

  /**
   * Searches for users by keyword
   * 
   * @param searchTerm - Search term
   * @returns The UserManagementPage instance for method chaining
   */
  searchUsers(searchTerm: string): this {
    cy.get(this.selectors.searchInput).clear().type(searchTerm);
    return this;
  }

  /**
   * Filters users by role
   * 
   * @param role - Role to filter by
   * @returns The UserManagementPage instance for method chaining
   */
  filterByRole(role: string): this {
    cy.get(this.selectors.roleFilterDropdown).select(role);
    return this;
  }

  /**
   * Filters users by status
   * 
   * @param status - Status to filter by
   * @returns The UserManagementPage instance for method chaining
   */
  filterByStatus(status: string): this {
    cy.get(this.selectors.statusFilterDropdown).select(status);
    return this;
  }

  /**
   * Sorts users by a specific criteria
   * 
   * @param sortValue - Sort value to select
   * @returns The UserManagementPage instance for method chaining
   */
  sortUsers(sortValue: string): this {
    cy.get(this.selectors.sortDropdown).select(sortValue);
    return this;
  }

  /**
   * Clicks the select all checkbox
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  selectAllUsers(): this {
    cy.get(this.selectors.selectAllCheckbox).click();
    return this;
  }

  /**
   * Clicks the bulk delete button
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  clickBulkDelete(): this {
    cy.get(this.selectors.bulkDeleteButton).click();
    return this;
  }

  /**
   * Clicks the bulk activate button
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  clickBulkActivate(): this {
    cy.get(this.selectors.bulkActivateButton).click();
    return this;
  }

  /**
   * Clicks the bulk deactivate button
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  clickBulkDeactivate(): this {
    cy.get(this.selectors.bulkDeactivateButton).click();
    return this;
  }

  /**
   * Clicks the previous page button in pagination
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  clickPreviousPage(): this {
    cy.get(this.selectors.previousPageButton).click();
    return this;
  }

  /**
   * Clicks the next page button in pagination
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  clickNextPage(): this {
    cy.get(this.selectors.nextPageButton).click();
    return this;
  }

  // Assertion methods

  /**
   * Asserts that the user management page is visible
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  shouldBeVisible(): this {
    cy.get(this.selectors.userManagementPage).should('be.visible');
    return this;
  }

  /**
   * Asserts that the user list contains a specific user
   * 
   * @param username - User username to search for
   * @returns The UserManagementPage instance for method chaining
   */
  shouldContainUser(username: string): this {
    cy.get(this.selectors.userList).should('contain', username);
    return this;
  }

  /**
   * Asserts that the user list does not contain a specific user
   * 
   * @param username - User username to check for absence
   * @returns The UserManagementPage instance for method chaining
   */
  shouldNotContainUser(username: string): this {
    cy.get(this.selectors.userList).should('not.contain', username);
    return this;
  }

  /**
   * Asserts that a specific user is visible in the list
   * 
   * @param userId - User identifier
   * @returns The UserManagementPage instance for method chaining
   */
  userShouldBeVisible(userId: string): this {
    cy.get(`[data-testid="user-item-${userId}"]`).should('be.visible');
    return this;
  }

  /**
   * Asserts that a specific user is not visible in the list
   * 
   * @param userId - User identifier
   * @returns The UserManagementPage instance for method chaining
   */
  userShouldNotBeVisible(userId: string): this {
    cy.get(`[data-testid="user-item-${userId}"]`).should('not.exist');
    return this;
  }

  /**
   * Asserts that the user form is visible
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  userFormShouldBeVisible(): this {
    cy.get(this.selectors.userForm).should('be.visible');
    return this;
  }

  /**
   * Asserts that the user form is not visible
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  userFormShouldNotBeVisible(): this {
    cy.get(this.selectors.userForm).should('not.exist');
    return this;
  }

  /**
   * Asserts that a user has a specific role
   * 
   * @param userId - User identifier
   * @param expectedRole - Expected role
   * @returns The UserManagementPage instance for method chaining
   */
  userRoleShouldBe(userId: string, expectedRole: string): this {
    cy.get(`[data-testid="user-role-${userId}"]`).should('contain', expectedRole);
    return this;
  }

  /**
   * Asserts that a user has a specific status
   * 
   * @param userId - User identifier
   * @param expectedStatus - Expected status
   * @returns The UserManagementPage instance for method chaining
   */
  userStatusShouldBe(userId: string, expectedStatus: string): this {
    cy.get(`[data-testid="user-status-${userId}"]`).should('contain', expectedStatus);
    return this;
  }

  /**
   * Asserts that the empty state is displayed
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  shouldShowEmptyState(): this {
    cy.get(this.selectors.emptyState).should('be.visible');
    return this;
  }

  /**
   * Asserts that the loading indicator is visible
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  shouldShowLoading(): this {
    cy.get(this.selectors.loadingIndicator).should('be.visible');
    return this;
  }

  /**
   * Asserts that the loading indicator is not visible
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  shouldNotShowLoading(): this {
    cy.get(this.selectors.loadingIndicator).should('not.exist');
    return this;
  }

  /**
   * Asserts that the pagination is visible
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  paginationShouldBeVisible(): this {
    cy.get(this.selectors.pagination).should('be.visible');
    return this;
  }

  /**
   * Asserts that bulk actions toolbar is visible
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  bulkActionsShouldBeVisible(): this {
    cy.get(this.selectors.bulkActionsToolbar).should('be.visible');
    return this;
  }

  // Navigation methods

  /**
   * Waits for the user management page to fully load
   * 
   * @returns The UserManagementPage instance for method chaining
   */
  waitForLoad(): this {
    cy.get(this.selectors.userManagementPage).should('be.visible');
    cy.get(this.selectors.loadingIndicator).should('not.exist');
    return this;
  }

  /**
   * Gets the user list element
   * 
   * @returns Chainable element containing the user list
   */
  getUserList(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.userList);
  }
}

/**
 * Creates and returns a new UserManagementPage instance
 * 
 * @returns A new UserManagementPage instance
 */
export const userManagementPage = new UserManagementPage();
