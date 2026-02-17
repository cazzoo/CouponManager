/**
 * Page Object Model for the Login page
 * 
 * Encapsulates all selectors, actions, and assertions related to user
 * authentication. Provides a clean interface for interacting with the
 * login form in tests.
 * 
 * @module LoginPage
 * @author Kilo Code
 * @date 2025-01-26
 */

import type { UserCredentials } from '../support/types';

/**
 * Page Object for the Login page
 * 
 * Provides methods to interact with the login form, submit credentials,
 * and verify authentication state.
 */
export class LoginPage {
  // Selectors using data-testid attributes
  private readonly selectors = {
    /** Login form container */
    loginForm: '[data-testid="login-form"]',
    /** Username/email input field */
    usernameInput: '[data-testid="username-input"]',
    /** Password input field */
    passwordInput: '[data-testid="password-input"]',
    /** Login submit button */
    submitButton: '[data-testid="login-submit-button"]',
    /** Error message container */
    errorMessage: '[data-testid="login-error-message"]',
    /** Sign in tab */
    signInTab: '[data-testid="signin-tab"]',
    /** Sign up tab */
    signUpTab: '[data-testid="signup-tab"]',
    /** Anonymous sign in button */
    anonymousButton: '[data-testid="anonymous-signin-button"]'
  };

  /**
   * Navigates to the login page
   * 
   * @returns The LoginPage instance for method chaining
   */
  navigate(): this {
    cy.visit('/');
    return this;
  }

  /**
   * Fills in the username field
   * 
   * @param username - Username or email address
   * @returns The LoginPage instance for method chaining
   */
  fillUsername(username: string): this {
    cy.get(this.selectors.usernameInput).clear().type(username);
    return this;
  }

  /**
   * Fills in the password field
   * 
   * @param password - User password
   * @returns The LoginPage instance for method chaining
   */
  fillPassword(password: string): this {
    cy.get(this.selectors.passwordInput).clear().type(password);
    return this;
  }

  /**
   * Fills in both username and password fields
   * 
   * @param credentials - User credentials object
   * @returns The LoginPage instance for method chaining
   */
  fillForm(credentials: UserCredentials): this {
    this.fillUsername(credentials.username);
    this.fillPassword(credentials.password);
    return this;
  }

  /**
   * Submits the login form
   * 
   * @returns The LoginPage instance for method chaining
   */
  submit(): this {
    cy.get(this.selectors.submitButton).click();
    return this;
  }

  /**
   * Performs a complete login with the provided credentials
   * 
   * Fills in the form and submits it, waiting for authentication to complete.
   *
   * @param credentials - User credentials object
   * @returns The LoginPage instance for method chaining
   */
  login(credentials: UserCredentials): this {
    this.navigate()
      .fillForm(credentials)
      .submit();
    return this;
  }

  /**
   * Clicks the sign up tab to switch to registration mode
   *
   * @returns The LoginPage instance for method chaining
   */
  clickRegister(): this {
    cy.get(this.selectors.signUpTab).click();
    return this;
  }

  /**
   * Clicks the sign in tab to switch to login mode
   *
   * @returns The LoginPage instance for method chaining
   */
  clickSignIn(): this {
    cy.get(this.selectors.signInTab).click();
    return this;
  }

  /**
   * Clicks the anonymous sign in button
   *
   * @returns The LoginPage instance for method chaining
   */
  clickAnonymousSignIn(): this {
    cy.get(this.selectors.anonymousButton).click();
    return this;
  }

  // Assertion methods

  /**
   * Asserts that the login form is visible
   * 
   * @returns The LoginPage instance for method chaining
   */
  shouldBeVisible(): this {
    cy.get(this.selectors.loginForm).should('be.visible');
    return this;
  }

  /**
   * Asserts that the login form is not visible
   * 
   * @returns The LoginPage instance for method chaining
   */
  shouldNotBeVisible(): this {
    cy.get(this.selectors.loginForm).should('not.exist');
    return this;
  }

  /**
   * Asserts that an error message is displayed
   * 
   * @param expectedMessage - Optional expected error message text
   * @returns The LoginPage instance for method chaining
   */
  shouldShowError(expectedMessage?: string): this {
    const assertion = cy.get(this.selectors.errorMessage).should('be.visible');
    if (expectedMessage) {
      assertion.and('contain', expectedMessage);
    }
    return this;
  }

  /**
   * Asserts that no error message is displayed
   * 
   * @returns The LoginPage instance for method chaining
   */
  shouldNotShowError(): this {
    cy.get(this.selectors.errorMessage).should('not.exist');
    return this;
  }

  /**
   * Asserts that the submit button is enabled
   * 
   * @returns The LoginPage instance for method chaining
   */
  submitButtonShouldBeEnabled(): this {
    cy.get(this.selectors.submitButton).should('not.be.disabled');
    return this;
  }

  /**
   * Asserts that the submit button is disabled
   * 
   * @returns The LoginPage instance for method chaining
   */
  submitButtonShouldBeDisabled(): this {
    cy.get(this.selectors.submitButton).should('be.disabled');
    return this;
  }

  /**
   * Asserts that the username field contains the expected value
   * 
   * @param expectedValue - Expected username value
   * @returns The LoginPage instance for method chaining
   */
  usernameShouldContain(expectedValue: string): this {
    cy.get(this.selectors.usernameInput).should('have.value', expectedValue);
    return this;
  }

  /**
   * Asserts that the password field contains the expected value
   * 
   * @param expectedValue - Expected password value
   * @returns The LoginPage instance for method chaining
   */
  passwordShouldContain(expectedValue: string): this {
    cy.get(this.selectors.passwordInput).should('have.value', expectedValue);
    return this;
  }

  // Navigation methods

  /**
   * Waits for the login page to fully load
   * 
   * @returns The LoginPage instance for method chaining
   */
  waitForLoad(): this {
    cy.get(this.selectors.loginForm).should('be.visible');
    return this;
  }
}

/**
 * Creates and returns a new LoginPage instance
 * 
 * @returns A new LoginPage instance
 */
export const loginPage = new LoginPage();
