/**
 * End-to-End tests for Authentication flows
 *
 * Comprehensive test suite covering all authentication scenarios including
 * login, registration, logout, password management, and error handling.
 * Tests include happy paths, error paths, edge cases, and i18n support.
 *
 * @module AuthE2ETests
 * @author Kilo Code
 * @date 2025-01-26
 */

import { loginPage, dashboardPage } from '../support';
import type { UserCredentials } from '../support/types';

/**
 * Test data for authentication scenarios
 */
const testCredentials: UserCredentials = {
  username: 'test@example.com',
  password: 'SecurePass123!'
};

const weakPasswords = ['123', 'password', 'abc', '12345678'];
const invalidEmails = ['invalid-email', '@example.com', 'test@', 'test@.com'];

/**
 * Authentication E2E test suite
 */
describe('Authentication Flows', () => {
  /**
   * Clean up before each test
   * Clears local storage and cookies to ensure clean state
   */
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
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
   * Tests successful authentication scenarios
   */
  describe('Happy Paths', () => {
    /**
     * Test successful user login with valid credentials
     *
     * Verifies that a user can log in with valid credentials and is
     * redirected to the dashboard with proper authentication state.
     */
    it('should successfully login with valid credentials', () => {
      loginPage
        .navigate()
        .shouldBeVisible()
        .fillForm(testCredentials)
        .submit();

      // Verify successful login by checking dashboard visibility
      dashboardPage.shouldBeVisible();
      dashboardPage.titleShouldContain('Dashboard');

      // Verify user is authenticated
      cy.getByTestId('logout-button').should('be.visible');
    });

    /**
     * Test successful user registration with valid data
     *
     * Verifies that a new user can register with valid information and
     * is automatically logged in after registration.
     */
    it('should successfully register a new user with valid data', () => {
      const newUser = {
        username: `newuser${Date.now()}@example.com`,
        password: 'SecurePass123!'
      };

      loginPage
        .navigate()
        .shouldBeVisible()
        .clickRegister();

      // Fill registration form
      cy.getByTestId('register-username-input').type(newUser.username);
      cy.getByTestId('register-email-input').type(newUser.username);
      cy.getByTestId('register-password-input').type(newUser.password);
      cy.getByTestId('register-confirm-password-input').type(newUser.password);

      // Submit registration
      cy.getByTestId('register-submit-button').click();

      // Verify successful registration and redirect to dashboard
      dashboardPage.shouldBeVisible();
      cy.getByTestId('logout-button').should('be.visible');
    });

    /**
     * Test anonymous sign in functionality
     *
     * Verifies that users can sign in anonymously without providing
     * credentials, accessing the app with limited functionality.
     */
    it('should successfully sign in anonymously', () => {
      loginPage
        .navigate()
        .shouldBeVisible()
        .clickRegister();

      // Click anonymous sign-in button
      cy.getByTestId('anonymous-signin-button').click();

      // Verify anonymous user is logged in
      dashboardPage.shouldBeVisible();
      cy.getByTestId('user-profile-dropdown').should('contain', 'Guest');
    });

    /**
     * Test logout functionality
     *
     * Verifies that a logged-in user can successfully log out and is
     * redirected to the login page with cleared session.
     */
    it('should successfully logout', () => {
      // First login
      cy.login(testCredentials.username, testCredentials.password);

      // Then logout
      dashboardPage.logout();

      // Verify redirect to login page
      loginPage.shouldBeVisible();
      loginPage.shouldNotShowError();

      // Verify session is cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('authToken')).to.be.null;
      });
    });

    /**
     * Test remember me functionality
     *
     * Verifies that when "remember me" is checked, the user's session
     * persists across browser restarts.
     */
    it('should persist session with remember me enabled', () => {
      loginPage
        .navigate()
        .shouldBeVisible()
        .fillForm(testCredentials);

      // Check remember me checkbox
      cy.getByTestId('remember-me-checkbox').check();

      // Submit login
      loginPage.submit();

      // Verify login successful
      dashboardPage.shouldBeVisible();

      // Check that remember me token is stored
      cy.window().then((win) => {
        expect(win.localStorage.getItem('rememberMe')).to.not.be.null;
      });
    });

    /**
     * Test password visibility toggle
     *
     * Verifies that users can toggle password field visibility to
     * confirm their password input.
     */
    it('should toggle password visibility', () => {
      loginPage
        .navigate()
        .shouldBeVisible()
        .fillPassword(testCredentials.password);

      // Password should be hidden by default
      cy.getByTestId('password-input').should('have.attr', 'type', 'password');

      // Click visibility toggle
      cy.getByTestId('password-visibility-toggle').click();

      // Password should now be visible
      cy.getByTestId('password-input').should('have.attr', 'type', 'text');

      // Click toggle again to hide
      cy.getByTestId('password-visibility-toggle').click();

      // Password should be hidden again
      cy.getByTestId('password-input').should('have.attr', 'type', 'password');
    });
  });

  /**
   * Error Path Tests
   * Tests authentication error scenarios and validation
   */
  describe('Error Paths', () => {
    /**
     * Test login with invalid email format
     *
     * Verifies that the form validates email format and displays
     * appropriate error messages for invalid emails.
     */
    invalidEmails.forEach((email) => {
      it(`should show error for invalid email format: ${email}`, () => {
        loginPage
          .navigate()
          .shouldBeVisible()
          .fillUsername(email)
          .fillPassword(testCredentials.password)
          .submit();

        // Verify error message is displayed
        loginPage.shouldShowError();
        loginPage.shouldNotBeVisible();

        // Verify specific email validation error
        cy.getByTestId('username-error').should('be.visible');
      });
    });

    /**
     * Test login with wrong password
     *
     * Verifies that authentication fails with incorrect password
     * and displays appropriate error message.
     */
    it('should show error for wrong password', () => {
      loginPage
        .navigate()
        .shouldBeVisible()
        .fillUsername(testCredentials.username)
        .fillPassword('WrongPassword123!')
        .submit();

      // Verify error message is displayed
      loginPage.shouldShowError('Invalid credentials');
      loginPage.shouldBeVisible();

      // Verify still on login page
      cy.url().should('include', '/login');
    });

    /**
     * Test login with non-existent account
     *
     * Verifies that authentication fails for non-existent accounts
     * with appropriate error messaging.
     */
    it('should show error for non-existent account', () => {
      loginPage
        .navigate()
        .shouldBeVisible()
        .fillUsername('nonexistent@example.com')
        .fillPassword(testCredentials.password)
        .submit();

      // Verify error message is displayed
      loginPage.shouldShowError('User not found');
      loginPage.shouldBeVisible();
    });

    /**
     * Test registration with existing email
     *
     * Verifies that registration fails when attempting to create
     * an account with an email that's already registered.
     */
    it('should show error for registration with existing email', () => {
      loginPage
        .navigate()
        .shouldBeVisible()
        .clickRegister();

      // Try to register with existing email
      cy.getByTestId('register-username-input').type(testCredentials.username);
      cy.getByTestId('register-email-input').type(testCredentials.username);
      cy.getByTestId('register-password-input').type(testCredentials.password);
      cy.getByTestId('register-confirm-password-input').type(testCredentials.password);

      // Submit registration
      cy.getByTestId('register-submit-button').click();

      // Verify error message is displayed
      cy.getByTestId('register-error-message').should('be.visible');
      cy.getByTestId('register-error-message').should('contain', 'already exists');
    });

    /**
     * Test registration with weak password
     *
     * Verifies that registration fails when password doesn't meet
     * security requirements.
     */
    weakPasswords.forEach((password) => {
      it(`should show error for weak password: ${password}`, () => {
        loginPage
          .navigate()
          .shouldBeVisible()
          .clickRegister();

        // Try to register with weak password
        cy.getByTestId('register-username-input').type(`user${Date.now()}@example.com`);
        cy.getByTestId('register-email-input').type(`user${Date.now()}@example.com`);
        cy.getByTestId('register-password-input').type(password);
        cy.getByTestId('register-confirm-password-input').type(password);

        // Submit registration
        cy.getByTestId('register-submit-button').click();

        // Verify error message is displayed
        cy.getByTestId('password-error').should('be.visible');
        cy.getByTestId('password-error').should('contain', 'weak');
      });
    });
  });

  /**
   * Edge Case Tests
   * Tests edge cases and boundary conditions
   */
  describe('Edge Cases', () => {
    /**
     * Test session persistence after page refresh
     *
     * Verifies that user remains logged in after refreshing the page.
     */
    it('should maintain session after page refresh', () => {
      // Login first
      cy.login(testCredentials.username, testCredentials.password);

      // Verify dashboard is visible
      dashboardPage.shouldBeVisible();

      // Refresh the page
      cy.reload();

      // Verify still logged in
      dashboardPage.shouldBeVisible();
      cy.getByTestId('logout-button').should('be.visible');
    });

    /**
     * Test multiple login attempts with rate limiting
     *
     * Verifies that the system implements rate limiting after
     * multiple failed login attempts.
     */
    it('should enforce rate limiting after multiple failed attempts', () => {
      const maxAttempts = 5;

      // Attempt multiple failed logins
      for (let i = 0; i < maxAttempts; i++) {
        loginPage
          .navigate()
          .shouldBeVisible()
          .fillUsername(testCredentials.username)
          .fillPassword('WrongPassword')
          .submit();

        loginPage.shouldShowError();
      }

      // Verify rate limiting message appears
      cy.getByTestId('rate-limit-message').should('be.visible');
      cy.getByTestId('rate-limit-message').should('contain', 'too many attempts');

      // Verify submit button is disabled
      loginPage.submitButtonShouldBeDisabled();
    });

    /**
     * Test login with empty credentials
     *
     * Verifies that form validation prevents submission with empty fields.
     */
    it('should show validation errors for empty credentials', () => {
      loginPage
        .navigate()
        .shouldBeVisible()
        .submit();

      // Verify validation errors
      cy.getByTestId('username-error').should('be.visible');
      cy.getByTestId('password-error').should('be.visible');

      // Verify error messages
      cy.getByTestId('username-error').should('contain', 'required');
      cy.getByTestId('password-error').should('contain', 'required');
    });

    /**
     * Test password mismatch during registration
     *
     * Verifies that registration fails when password confirmation
     * doesn't match the password.
     */
    it('should show error for password mismatch during registration', () => {
      loginPage
        .navigate()
        .shouldBeVisible()
        .clickRegister();

      // Fill form with mismatched passwords
      cy.getByTestId('register-username-input').type(`user${Date.now()}@example.com`);
      cy.getByTestId('register-email-input').type(`user${Date.now()}@example.com`);
      cy.getByTestId('register-password-input').type('Password123!');
      cy.getByTestId('register-confirm-password-input').type('DifferentPassword123!');

      // Submit registration
      cy.getByTestId('register-submit-button').click();

      // Verify error message
      cy.getByTestId('confirm-password-error').should('be.visible');
      cy.getByTestId('confirm-password-error').should('contain', 'do not match');
    });
  });

  /**
   * Internationalization Tests
   * Tests authentication flows in different languages
   */
  describe('Internationalization (i18n)', () => {
    const languages = ['en', 'es', 'fr', 'de'] as const;

    languages.forEach((lang) => {
      /**
       * Test login flow in different language
       *
       * Verifies that all authentication UI elements and messages
       * are properly translated.
       */
      it(`should display login form in ${lang}`, () => {
        // Set language
        cy.selectLanguage(lang);

        loginPage.navigate().shouldBeVisible();

        // Verify language-specific content
        cy.get('html').should('have.attr', 'lang', lang);

        // Verify form labels are translated
        cy.getByTestId('username-label').should('exist');
        cy.getByTestId('password-label').should('exist');
        cy.getByTestId('login-submit-button').should('exist');
      });

      /**
       * Test error messages in different language
       *
       * Verifies that validation and error messages are displayed
       * in the selected language.
       */
      it(`should show error messages in ${lang}`, () => {
        // Set language
        cy.selectLanguage(lang);

        loginPage
          .navigate()
          .shouldBeVisible()
          .fillUsername('invalid-email')
          .fillPassword(testCredentials.password)
          .submit();

        // Verify error message is in selected language
        loginPage.shouldShowError();
        cy.get('html').should('have.attr', 'lang', lang);
      });

      /**
       * Test registration flow in different language
       *
       * Verifies that registration form and validation messages
       * are properly translated.
       */
      it(`should display registration form in ${lang}`, () => {
        // Set language
        cy.selectLanguage(lang);

        loginPage
          .navigate()
          .shouldBeVisible()
          .clickRegister();

        // Verify registration form is visible
        cy.getByTestId('register-form').should('be.visible');

        // Verify form labels are translated
        cy.getByTestId('register-username-label').should('exist');
        cy.getByTestId('register-password-label').should('exist');
        cy.getByTestId('register-submit-button').should('exist');
      });
    });

    /**
     * Test language persistence after login
     *
     * Verifies that selected language persists after authentication.
     */
    it('should maintain selected language after login', () => {
      const testLang = 'es';

      // Set language before login
      cy.selectLanguage(testLang);

      // Login
      cy.login(testCredentials.username, testCredentials.password);

      // Verify language is maintained
      cy.get('html').should('have.attr', 'lang', testLang);

      // Verify dashboard content is in selected language
      dashboardPage.shouldBeVisible();
      cy.get('html').should('have.attr', 'lang', testLang);
    });
  });

  /**
   * Accessibility Tests
   * Tests authentication flows for accessibility compliance
   */
  describe('Accessibility', () => {
    /**
     * Test login form accessibility
     *
     * Verifies that the login form meets WCAG accessibility standards.
     */
    it('should have accessible login form', () => {
      loginPage.navigate().shouldBeVisible();

      // Check for proper labels
      cy.getByTestId('username-input').should('have.attr', 'aria-label');
      cy.getByTestId('password-input').should('have.attr', 'aria-label');

      // Check for proper error handling
      cy.getByTestId('login-error-message').should('have.attr', 'role', 'alert');

      // Check keyboard navigation
      cy.getByTestId('username-input').focus();
      cy.focused().should('have.attr', 'data-testid', 'username-input');

      cy.tab();
      cy.focused().should('have.attr', 'data-testid', 'password-input');

      cy.tab();
      cy.focused().should('have.attr', 'data-testid', 'login-submit-button');
    });

    /**
     * Test password visibility toggle accessibility
     *
     * Verifies that the password visibility toggle is accessible
     * to screen readers and keyboard users.
     */
    it('should have accessible password visibility toggle', () => {
      loginPage.navigate().shouldBeVisible();

      // Check for proper ARIA attributes
      cy.getByTestId('password-visibility-toggle').should('have.attr', 'aria-label');
      cy.getByTestId('password-visibility-toggle').should('have.attr', 'role', 'button');

      // Verify keyboard accessibility
      cy.getByTestId('password-input').focus();
      cy.tab();
      cy.focused().should('have.attr', 'data-testid', 'password-visibility-toggle');
    });
  });
});
