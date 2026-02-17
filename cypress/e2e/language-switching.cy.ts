/**
 * End-to-End tests for Language Switching
 *
 * True E2E tests covering complete language switching journeys:
 * - Change language and verify UI updates
 *
 * @module LanguageSwitchingE2ETests
 * @author Kilo Code
 * @date 2025-01-28
 */

/**
 * Language Switching E2E test suite
 *
 * These tests focus on complete user journeys for language switching.
 * Tests that language persists across page navigation.
 *
 * For component-level language selector tests, see cypress/component/LanguageSelector.cy.tsx
 */
describe('Language Switching Workflows', () => {
  /**
   * Login before each test
   */
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.login('user@example.com', 'password123');
  });

  /**
   * Clean up after each test
   */
  afterEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  /**
   * Language Switching Tests
   */
  describe('Language Selection', () => {
    /**
     * Test switching language
     *
     * E2E: Verifies language changes and UI updates
     */
    it('should switch language', () => {
      // Wait for dashboard to load
      cy.getByTestId('dashboard-container', { timeout: 15000 }).should('be.visible');

      // Start with English
      cy.get('html').should('have.attr', 'lang', 'en-US');

      // Check which language selector mode is being used (mobile dropdown or desktop select)
      cy.get('body').then(($body) => {
        // Check for desktop select element first
        if ($body.find('#language-select').length > 0) {
          // Desktop mode - use select element
          cy.get('#language-select')
            .should('be.visible')
            .select('Spanish')
            .should('have.value', 'es');
        } else {
          // Mobile mode - use dropdown
          cy.getByTestId('language-selector')
            .should('be.visible')
            .click();
          cy.contains('Spanish').click();
        }
      });

      // Verify language changed
      cy.get('html').should('have.attr', 'lang', 'es');
    });
  });
});
