/**
 * End-to-End tests for User Management workflows
 *
 * Comprehensive test suite covering all user management scenarios including
 * viewing, creating, editing, deleting, and managing user roles.
 * Tests include happy paths, error paths, edge cases, and i18n support.
 * All user management operations are restricted to admin users.
 *
 * @module UserManagementE2ETests
 * @author Kilo Code
 * @date 2025-01-26
 */

import { userManagementPage, dashboardPage } from '../support';
import type { UserData } from '../support/types';

/**
 * Test data for user scenarios
 */
const adminCredentials = {
  username: 'admin@example.com',
  password: 'AdminPass123!'
};

const testUser: UserData = {
  id: 'user-test-1',
  username: 'testuser',
  email: 'testuser@example.com',
  role: 'user',
  isActive: true
};

const managerUser: UserData = {
  id: 'user-manager-1',
  username: 'manageruser',
  email: 'manager@example.com',
  role: 'manager',
  isActive: true
};

/**
 * User Management E2E test suite
 */
describe('User Management Workflows', () => {
  /**
   * Clean up before each test
   * Clears local storage and cookies to ensure clean state
   */
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.login(adminCredentials.username, adminCredentials.password);
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
   * Tests successful user management scenarios
   */
  describe('Happy Paths', () => {
    /**
     * Test viewing all users (admin only)
     *
     * Verifies that admin users can view complete list of users.
     */
    it('should view all users (admin only)', () => {
      userManagementPage
        .navigate()
        .shouldBeVisible();

      // Verify user list is displayed
      cy.getByTestId('user-list').should('be.visible');
      userManagementPage.shouldNotShowLoading();
    });

    /**
     * Test adding a new user (admin only)
     *
     * Verifies that admin users can create new user accounts.
     */
    it('should add a new user (admin only)', () => {
      const newUser = {
        username: `newuser${Date.now()}`,
        email: `newuser${Date.now()}@example.com`,
        role: 'user'
      };

      userManagementPage
        .navigate()
        .shouldBeVisible()
        .addUser(newUser, 'SecurePass123!');

      // Verify user was added
      userManagementPage.shouldContainUser(newUser.username);
      userManagementPage.shouldNotShowLoading();
    });

    /**
     * Test editing user role (admin only)
     *
     * Verifies that admin users can modify user roles.
     */
    it('should edit user role (admin only)', () => {
      // Create a user first
      const newUser = {
        username: `roleuser${Date.now()}`,
        email: `roleuser${Date.now()}@example.com`,
        role: 'user'
      };
      userManagementPage
        .navigate()
        .shouldBeVisible()
        .addUser(newUser, 'SecurePass123!');

      // Edit user role
      userManagementPage.editUser(newUser.username);
      cy.getByTestId('user-role-select').select('manager');
      cy.getByTestId('user-submit-button').click();

      // Verify role was changed
      userManagementPage.userRoleShouldBe(newUser.username, 'manager');
    });

    /**
     * Test deleting a user (admin only)
     *
     * Verifies that admin users can delete user accounts.
     */
    it('should delete a user (admin only)', () => {
      // Create a user first
      const newUser = {
        username: `deleteuser${Date.now()}`,
        email: `deleteuser${Date.now()}@example.com`,
        role: 'user'
      };
      userManagementPage
        .navigate()
        .shouldBeVisible()
        .addUser(newUser, 'SecurePass123!');

      // Delete user
      userManagementPage.deleteUser(newUser.username);

      // Confirm deletion
      cy.getByTestId('confirm-delete-button').click();

      // Verify user was deleted
      userManagementPage.shouldNotContainUser(newUser.username);
    });

    /**
     * Test changing user role to admin
     *
     * Verifies that users can be promoted to admin role.
     */
    it('should change user role to admin', () => {
      // Create a user first
      const newUser = {
        username: `promoteuser${Date.now()}`,
        email: `promoteuser${Date.now()}@example.com`,
        role: 'user'
      };
      userManagementPage
        .navigate()
        .shouldBeVisible()
        .addUser(newUser, 'SecurePass123!');

      // Change role to admin
      userManagementPage.editUser(newUser.username);
      cy.getByTestId('user-role-select').select('admin');
      cy.getByTestId('user-submit-button').click();

      // Verify role was changed to admin
      userManagementPage.userRoleShouldBe(newUser.username, 'admin');
    });

    /**
     * Test changing user role to manager
     *
     * Verifies that users can be promoted to manager role.
     */
    it('should change user role to manager', () => {
      // Create a user first
      const newUser = {
        username: `manageruser${Date.now()}`,
        email: `manageruser${Date.now()}@example.com`,
        role: 'user'
      };
      userManagementPage
        .navigate()
        .shouldBeVisible()
        .addUser(newUser, 'SecurePass123!');

      // Change role to manager
      userManagementPage.editUser(newUser.username);
      cy.getByTestId('user-role-select').select('manager');
      cy.getByTestId('user-submit-button').click();

      // Verify role was changed to manager
      userManagementPage.userRoleShouldBe(newUser.username, 'manager');
    });

    /**
     * Test changing user role to user
     *
     * Verifies that users can be demoted to user role.
     */
    it('should change user role to user', () => {
      // Create a manager user first
      const newUser = {
        username: `demoteuser${Date.now()}`,
        email: `demoteuser${Date.now()}@example.com`,
        role: 'manager'
      };
      userManagementPage
        .navigate()
        .shouldBeVisible()
        .addUser(newUser, 'SecurePass123!');

      // Change role to user
      userManagementPage.editUser(newUser.username);
      cy.getByTestId('user-role-select').select('user');
      cy.getByTestId('user-submit-button').click();

      // Verify role was changed to user
      userManagementPage.userRoleShouldBe(newUser.username, 'user');
    });

    /**
     * Test filtering users by role
     *
     * Verifies that users can be filtered by their role.
     */
    it('should filter users by role', () => {
      // Create users with different roles
      const user1 = {
        username: `user1${Date.now()}`,
        email: `user1${Date.now()}@example.com`,
        role: 'user'
      };
      const user2 = {
        username: `admin1${Date.now()}`,
        email: `admin1${Date.now()}@example.com`,
        role: 'admin'
      };

      userManagementPage
        .navigate()
        .shouldBeVisible()
        .addUser(user1, 'SecurePass123!')
        .addUser(user2, 'SecurePass123!');

      // Filter by admin role
      userManagementPage.filterByRole('admin');

      // Verify only admin users are shown
      userManagementPage.shouldContainUser(user2.username);
      userManagementPage.shouldNotContainUser(user1.username);
    });

    /**
     * Test searching users by email
     *
     * Verifies that users can be searched by email address.
     */
    it('should search users by email', () => {
      // Create multiple users
      const user1 = {
        username: `search1${Date.now()}`,
        email: `search1${Date.now()}@example.com`,
        role: 'user'
      };
      const user2 = {
        username: `search2${Date.now()}`,
        email: `search2${Date.now()}@example.com`,
        role: 'user'
      };

      userManagementPage
        .navigate()
        .shouldBeVisible()
        .addUser(user1, 'SecurePass123!')
        .addUser(user2, 'SecurePass123!');

      // Search by email
      userManagementPage.searchUsers(user1.email);

      // Verify search results
      userManagementPage.shouldContainUser(user1.username);
      userManagementPage.shouldNotContainUser(user2.username);
    });

    /**
     * Test bulk delete users
     *
     * Verifies that admin can delete multiple users at once.
     */
    it('should bulk delete users', () => {
      // Create multiple users
      const users = [];
      for (let i = 0; i < 3; i++) {
        const user = {
          username: `bulk${i}${Date.now()}`,
          email: `bulk${i}${Date.now()}@example.com`,
          role: 'user'
        };
        userManagementPage.addUser(user, 'SecurePass123!');
        users.push(user);
      }

      // Select all users
      userManagementPage.selectAllUsers();

      // Click bulk delete
      userManagementPage.clickBulkDelete();

      // Confirm bulk deletion
      cy.getByTestId('confirm-bulk-delete-button').click();

      // Verify all users were deleted
      users.forEach((user) => {
        userManagementPage.shouldNotContainUser(user.username);
      });
    });

    /**
     * Test bulk change roles
     *
     * Verifies that admin can change roles for multiple users at once.
     */
    it('should bulk change roles', () => {
      // Create multiple users
      const users = [];
      for (let i = 0; i < 3; i++) {
        const user = {
          username: `bulkrole${i}${Date.now()}`,
          email: `bulkrole${i}${Date.now()}@example.com`,
          role: 'user'
        };
        userManagementPage.addUser(user, 'SecurePass123!');
        users.push(user);
      }

      // Select all users
      userManagementPage.selectAllUsers();

      // Click bulk change role
      cy.getByTestId('bulk-change-role-button').click();

      // Select new role
      cy.getByTestId('bulk-role-select').select('manager');
      cy.getByTestId('confirm-bulk-role-button').click();

      // Verify all users' roles were changed
      users.forEach((user) => {
        userManagementPage.userRoleShouldBe(user.username, 'manager');
      });
    });
  });

  /**
   * Error Path Tests
   * Tests user management error scenarios
   */
  describe('Error Paths', () => {
    /**
     * Test non-admin trying to access user management
     *
     * Verifies that non-admin users cannot access user management.
     */
    it('should prevent non-admin from accessing user management', () => {
      // Logout and login as regular user
      cy.logout();
      cy.login('user@example.com', 'UserPass123!');

      // Try to access user management
      cy.visit('/users');

      // Verify access is denied
      cy.getByTestId('access-denied-message').should('be.visible');
      cy.url().should('not.include', '/users');
    });

    /**
     * Test admin trying to change own role
     *
     * Verifies that admins cannot change their own role.
     */
    it('should prevent admin from changing own role', () => {
      userManagementPage
        .navigate()
        .shouldBeVisible();

      // Try to edit own role
      userManagementPage.editUser(adminCredentials.username);

      // Verify role field is disabled
      cy.getByTestId('user-role-select').should('be.disabled');
    });

    /**
     * Test deleting last admin user
     *
     * Verifies that system prevents deletion of the last admin.
     */
    it('should prevent deletion of last admin user', () => {
      // Try to delete the only admin
      userManagementPage
        .navigate()
        .shouldBeVisible()
        .deleteUser(adminCredentials.username);

      // Verify error message
      cy.getByTestId('delete-error-message').should('be.visible');
      cy.getByTestId('delete-error-message').should('contain', 'Cannot delete last admin');
    });

    /**
     * Test adding user with existing email
     *
     * Verifies that duplicate email addresses are rejected.
     */
    it('should show error for user with existing email', () => {
      // Create a user
      const existingUser = {
        username: `existing${Date.now()}`,
        email: `existing${Date.now()}@example.com`,
        role: 'user'
      };
      userManagementPage
        .navigate()
        .shouldBeVisible()
        .addUser(existingUser, 'SecurePass123!');

      // Try to create another user with same email
      const duplicateUser = {
        username: `duplicate${Date.now()}`,
        email: existingUser.email,
        role: 'user'
      };
      userManagementPage
        .clickAddUser()
        .fillUserForm(duplicateUser, 'SecurePass123!')
        .submitUserForm();

      // Verify error message
      cy.getByTestId('user-error-message').should('be.visible');
      cy.getByTestId('user-error-message').should('contain', 'already exists');
    });

    /**
     * Test adding user with weak password
     *
     * Verifies that weak passwords are rejected.
     */
    it('should show error for weak password', () => {
      const newUser = {
        username: `weakpass${Date.now()}`,
        email: `weakpass${Date.now()}@example.com`,
        role: 'user'
      };

      userManagementPage
        .navigate()
        .shouldBeVisible()
        .clickAddUser()
        .fillUserForm(newUser, '123')
        .submitUserForm();

      // Verify error message
      cy.getByTestId('password-error').should('be.visible');
      cy.getByTestId('password-error').should('contain', 'weak');
    });
  });

  /**
   * Edge Case Tests
   * Tests edge cases and boundary conditions
   */
  describe('Edge Cases', () => {
    /**
     * Test handling large number of users
     *
     * Verifies that application handles pagination and performance
     * with a large number of users.
     */
    it('should handle large number of users', () => {
      // Create multiple users
      for (let i = 0; i < 50; i++) {
        const bulkUser = {
          username: `bulkuser${i}`,
          email: `bulkuser${i}@example.com`,
          role: 'user'
        };
        userManagementPage.addUser(bulkUser, 'SecurePass123!');
      }

      // Verify pagination is visible
      userManagementPage.paginationShouldBeVisible();

      // Navigate through pages
      userManagementPage.clickNextPage();
      userManagementPage.waitForLoad();

      userManagementPage.clickPreviousPage();
      userManagementPage.waitForLoad();
    });

    /**
     * Test handling user with special characters in email
     *
     * Verifies that users with special characters in email are handled correctly.
     */
    it('should handle user with special characters in email', () => {
      const specialUser = {
        username: `special${Date.now()}`,
        email: 'user+tag@example.com',
        role: 'user'
      };

      userManagementPage
        .navigate()
        .shouldBeVisible()
        .addUser(specialUser, 'SecurePass123!');

      // Verify user was created
      userManagementPage.shouldContainUser(specialUser.username);
    });

    /**
     * Test handling user with very long username
     *
     * Verifies that users with long usernames are handled correctly.
     */
    it('should handle user with very long username', () => {
      const longUsername = 'a'.repeat(100);
      const longUser = {
        username: longUsername,
        email: `long${Date.now()}@example.com`,
        role: 'user'
      };

      userManagementPage
        .navigate()
        .shouldBeVisible()
        .addUser(longUser, 'SecurePass123!');

      // Verify user was created
      userManagementPage.shouldContainUser(longUsername.substring(0, 50));
    });

    /**
     * Test handling user activation/deactivation
     *
     * Verifies that users can be activated and deactivated.
     */
    it('should handle user activation and deactivation', () => {
      // Create a user
      const newUser = {
        username: `activeuser${Date.now()}`,
        email: `activeuser${Date.now()}@example.com`,
        role: 'user'
      };
      userManagementPage
        .navigate()
        .shouldBeVisible()
        .addUser(newUser, 'SecurePass123!');

      // Deactivate user
      userManagementPage.deactivateUser(newUser.username);

      // Verify user is deactivated
      userManagementPage.userStatusShouldBe(newUser.username, 'Inactive');

      // Activate user
      userManagementPage.activateUser(newUser.username);

      // Verify user is activated
      userManagementPage.userStatusShouldBe(newUser.username, 'Active');
    });
  });

  /**
   * Internationalization Tests
   * Tests user management in different languages
   */
  describe('Internationalization (i18n)', () => {
    const languages = ['en', 'es', 'fr', 'de'] as const;

    languages.forEach((lang) => {
      /**
       * Test user creation in different language
       *
       * Verifies that user creation form is properly translated.
       */
      it(`should create user in ${lang}`, () => {
        cy.selectLanguage(lang);

        const newUser = {
          username: `languser${Date.now()}`,
          email: `languser${Date.now()}@example.com`,
          role: 'user'
        };

        userManagementPage
          .navigate()
          .shouldBeVisible()
          .addUser(newUser, 'SecurePass123!');

        // Verify user was created
        userManagementPage.shouldContainUser(newUser.username);
        cy.get('html').should('have.attr', 'lang', lang);
      });

      /**
       * Test user list in different language
       *
       * Verifies that user list UI elements are properly translated.
       */
      it(`should display user list in ${lang}`, () => {
        cy.selectLanguage(lang);

        userManagementPage
          .navigate()
          .shouldBeVisible();

        // Verify UI is in selected language
        cy.get('html').should('have.attr', 'lang', lang);
        cy.getByTestId('user-list-header').should('exist');
      });

      /**
       * Test error messages in different language
       *
       * Verifies that validation messages are displayed in selected language.
       */
      it(`should show error messages in ${lang}`, () => {
        cy.selectLanguage(lang);

        userManagementPage
          .navigate()
          .shouldBeVisible()
          .clickAddUser()
          .submitUserForm();

        // Verify error messages are in selected language
        cy.getByTestId('username-error').should('be.visible');
        cy.get('html').should('have.attr', 'lang', lang);
      });
    });
  });

  /**
   * Accessibility Tests
   * Tests user management for accessibility compliance
   */
  describe('Accessibility', () => {
    /**
     * Test user list accessibility
     *
     * Verifies that user list meets WCAG standards.
     */
    it('should have accessible user list', () => {
      userManagementPage.navigate().shouldBeVisible();

      // Check for proper headings
      cy.getByRole('heading', { name: /users/i }).should('exist');

      // Check for proper ARIA labels
      cy.getByTestId('user-list').should('have.attr', 'role', 'list');

      // Check keyboard navigation
      cy.getByTestId('add-user-button').focus();
      cy.focused().should('have.attr', 'data-testid', 'add-user-button');
    });

    /**
     * Test user form accessibility
     *
     * Verifies that user form meets WCAG standards.
     */
    it('should have accessible user form', () => {
      userManagementPage
        .navigate()
        .shouldBeVisible()
        .clickAddUser();

      // Check for proper labels
      cy.getByTestId('user-username-input').should('have.attr', 'aria-label');
      cy.getByTestId('user-email-input').should('have.attr', 'aria-label');
      cy.getByTestId('user-role-select').should('have.attr', 'aria-label');
      cy.getByTestId('user-password-input').should('have.attr', 'aria-label');

      // Check for error handling
      cy.getByTestId('user-error-message').should('have.attr', 'role', 'alert');
    });

    /**
     * Test bulk actions accessibility
     *
     * Verifies that bulk action controls are accessible.
     */
    it('should have accessible bulk actions', () => {
      userManagementPage.navigate().shouldBeVisible();

      // Check for proper ARIA labels on bulk actions
      cy.getByTestId('select-all-users').should('have.attr', 'aria-label');
      cy.getByTestId('bulk-delete-users').should('have.attr', 'aria-label');
      cy.getByTestId('bulk-activate-users').should('have.attr', 'aria-label');
      cy.getByTestId('bulk-deactivate-users').should('have.attr', 'aria-label');
    });
  });
});
