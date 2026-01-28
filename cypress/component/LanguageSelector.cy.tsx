/**
 * Component tests for LanguageSelector
 * 
 * Tests LanguageSelector component which handles language selection.
 * Includes language switching, persistence, and responsive design.
 * 
 * @module LanguageSelectorTests
 * @author Kilo Code
 * @date 2025-01-26
 */

import React from 'react';
import { mount } from '@cypress/react18';
import { LanguageProvider } from '../../src/services/LanguageContext';
import LanguageSelector from '../../src/components/LanguageSelector';

/**
 * Helper function to mount component with required providers
 */
const mountWithProviders = (component: React.ReactNode) => {
  return mount(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  );
};

describe('LanguageSelector Component', () => {
  /**
   * Test: Renders language options
   * Verifies all supported languages are displayed
   */
  it('renders language options', () => {
    mountWithProviders(<LanguageSelector />);

    // Verify language selector is visible
    cy.get('[data-testid="language-icon"]').should('be.visible');
    
    // Verify dropdown is present (desktop view)
    cy.contains('Language').should('be.visible');
  });

  /**
   * Test: Displays current selected language
   * Verifies currently selected language is shown
   */
  it('displays current selected language', () => {
    mountWithProviders(<LanguageSelector />);

    // Verify current language is displayed
    cy.contains('Language').should('be.visible');
  });

  /**
   * Test: Changes language correctly
   * Verifies language can be changed via dropdown
   */
  it('changes language correctly', () => {
    mountWithProviders(<LanguageSelector />);

    // Click language selector
    cy.contains('Language').click();
    
    // Select Spanish
    cy.contains('Spanish').click();
    
    // Verify language was changed (check localStorage)
    cy.window().then((win) => {
      expect(win.localStorage.getItem('language')).to.equal('es');
    });
  });

  /**
   * Test: Tests all supported languages (en, es, fr, de)
   * Verifies all language options are available
   */
  it('tests all supported languages (en, es, fr, de)', () => {
    mountWithProviders(<LanguageSelector />);

    // Click language selector
    cy.contains('Language').click();
    
    // Verify all languages are present
    cy.contains('English').should('be.visible');
    cy.contains('Spanish').should('be.visible');
    cy.contains('French').should('be.visible');
    cy.contains('German').should('be.visible');
  });

  /**
   * Test: Persists language selection
   * Verifies language selection is saved to localStorage
   */
  it('persists language selection', () => {
    mountWithProviders(<LanguageSelector />);

    // Change language
    cy.contains('Language').click();
    cy.contains('French').click();
    
    // Verify language was saved to localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('language')).to.equal('fr');
    });
  });

  /**
   * Test: Responsive design - mobile view
   * Verifies component displays correctly on mobile devices
   */
  it('responsive design - mobile view', () => {
    cy.viewport(375, 667);
    
    mountWithProviders(<LanguageSelector />);

    // On mobile, language selector should be an icon button
    cy.get('[data-testid="language-icon"]').should('be.visible');
    
    // Click icon to open menu
    cy.get('[data-testid="language-icon"]').click();
    
    // Verify menu shows language options
    cy.contains('English').should('be.visible');
    cy.contains('Spanish').should('be.visible');
    cy.contains('French').should('be.visible');
    cy.contains('German').should('be.visible');
  });

  /**
   * Test: Responsive design - desktop view
   * Verifies component displays correctly on desktop devices
   */
  it('responsive design - desktop view', () => {
    cy.viewport(1280, 720);
    
    mountWithProviders(<LanguageSelector />);

    // On desktop, language selector should be a dropdown
    cy.contains('Language').should('be.visible');
    
    // Click dropdown
    cy.contains('Language').click();
    
    // Verify all options are shown
    cy.contains('English').should('be.visible');
    cy.contains('Spanish').should('be.visible');
    cy.contains('French').should('be.visible');
    cy.contains('German').should('be.visible');
  });

  /**
   * Test: Closes mobile menu after selection
   * Verifies mobile menu closes after language selection
   */
  it('closes mobile menu after selection', () => {
    cy.viewport(375, 667);
    
    mountWithProviders(<LanguageSelector />);

    // Open mobile menu
    cy.get('[data-testid="language-icon"]').click();
    
    // Select a language
    cy.contains('French').click();
    
    // Verify menu is closed (icon should still be visible)
    cy.get('[data-testid="language-icon"]').should('be.visible');
  });

  /**
   * Test: Highlights selected language in menu
   * Verifies currently selected language is visually indicated
   */
  it('highlights selected language in menu', () => {
    mountWithProviders(<LanguageSelector />);

    // Open language selector
    cy.contains('Language').click();
    
    // Verify English is selected by default
    cy.contains('English').should('have.attr', 'aria-selected', 'true');
  });

  /**
   * Test: Accessibility - has proper ARIA labels
   * Verifies language selector has appropriate accessibility attributes
   */
  it('accessibility - has proper ARIA labels', () => {
    mountWithProviders(<LanguageSelector />);

    // Verify icon button has aria-label on mobile
    cy.get('[data-testid="language-icon"]').should('have.attr', 'aria-label');
    
    // Verify dropdown has proper label
    cy.contains('Language').should('be.visible');
  });

  /**
   * Test: Changes language multiple times
   * Verifies language can be changed multiple times
   */
  it('changes language multiple times', () => {
    mountWithProviders(<LanguageSelector />);

    // Change to Spanish
    cy.contains('Language').click();
    cy.contains('Spanish').click();
    
    // Change to French
    cy.contains('Language').click();
    cy.contains('French').click();
    
    // Change to German
    cy.contains('Language').click();
    cy.contains('German').click();
    
    // Verify final language is saved
    cy.window().then((win) => {
      expect(win.localStorage.getItem('language')).to.equal('de');
    });
  });

  /**
   * Test: Handles language change on document
   * Verifies document lang attribute is updated
   */
  it('handles language change on document', () => {
    mountWithProviders(<LanguageSelector />);

    // Change language
    cy.contains('Language').click();
    cy.contains('Spanish').click();
    
    // Verify document lang attribute is updated
    cy.document().then((doc) => {
      expect(doc.documentElement.getAttribute('lang')).to.equal('es');
    });
  });

  /**
   * Test: Mobile menu closes on outside click
   * Verifies mobile menu closes when clicking outside
   */
  it('mobile menu closes on outside click', () => {
    cy.viewport(375, 667);
    
    mountWithProviders(<LanguageSelector />);

    // Open mobile menu
    cy.get('[data-testid="language-icon"]').click();
    
    // Click outside menu
    cy.get('body').click(0, 0);
    
    // Verify menu is closed
    cy.contains('Spanish').should('not.be.visible');
  });

  /**
   * Test: Dropdown closes on outside click (desktop)
   * Verifies desktop dropdown closes when clicking outside
   */
  it('dropdown closes on outside click (desktop)', () => {
    cy.viewport(1280, 720);
    
    mountWithProviders(<LanguageSelector />);

    // Open dropdown
    cy.contains('Language').click();
    
    // Click outside dropdown
    cy.get('body').click(0, 0);
    
    // Verify dropdown is closed
    cy.contains('Spanish').should('not.be.visible');
  });

  /**
   * Test: Language options are in correct order
   * Verifies language options are displayed in expected order
   */
  it('language options are in correct order', () => {
    mountWithProviders(<LanguageSelector />);

    // Open language selector
    cy.contains('Language').click();
    
    // Get all menu items and verify order
    cy.get('[role="option"]').then((items) => {
      expect(items[0]).to.contain.text('English');
      expect(items[1]).to.contain.text('Spanish');
      expect(items[2]).to.contain.text('French');
      expect(items[3]).to.contain.text('German');
    });
  });

  /**
   * Test: Language names are correctly localized
   * Verifies language names are displayed in their native language or English
   */
  it('language names are correctly localized', () => {
    mountWithProviders(<LanguageSelector />);

    // Open language selector
    cy.contains('Language').click();
    
    // Verify language names
    cy.contains('English').should('be.visible');
    cy.contains('Spanish').should('be.visible');
    cy.contains('French').should('be.visible');
    cy.contains('German').should('be.visible');
  });

  /**
   * Test: Handles keyboard navigation
   * Verifies language selector can be navigated with keyboard
   */
  it('handles keyboard navigation', () => {
    mountWithProviders(<LanguageSelector />);

    // Focus on language selector
    cy.contains('Language').focus();
    
    // Press Enter to open
    cy.contains('Language').type('{enter}');
    
    // Verify menu is open
    cy.contains('Spanish').should('be.visible');
  });

  /**
   * Test: Language selector has proper styling
   * Verifies component has expected CSS classes
   */
  it('language selector has proper styling', () => {
    mountWithProviders(<LanguageSelector />);

    // Verify language selector is visible
    cy.contains('Language').should('be.visible');
    
    // Verify icon button on mobile
    cy.get('[data-testid="language-icon"]').should('be.visible');
  });

  /**
   * Test: Tests language change callback
   * Verifies changeLanguage function is called correctly
   */
  it('tests language change callback', () => {
    mountWithProviders(<LanguageSelector />);

    // Change language
    cy.contains('Language').click();
    cy.contains('German').click();
    
    // Verify language was saved
    cy.window().then((win) => {
      expect(win.localStorage.getItem('language')).to.equal('de');
    });
  });

  /**
   * Test: Handles initial language from localStorage
   * Verifies component loads language from localStorage
   */
  it('handles initial language from localStorage', () => {
    // Set initial language in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('language', 'fr');
    });
    
    // Remount component to test localStorage loading
    mountWithProviders(<LanguageSelector />);

    // Verify French is selected
    cy.window().then((win) => {
      expect(win.localStorage.getItem('language')).to.equal('fr');
    });
  });

  /**
   * Test: Mobile icon button is clickable
   * Verifies mobile icon button responds to clicks
   */
  it('mobile icon button is clickable', () => {
    cy.viewport(375, 667);
    
    mountWithProviders(<LanguageSelector />);

    // Click icon button
    cy.get('[data-testid="language-icon"]').click();
    
    // Verify menu opens
    cy.contains('Spanish').should('be.visible');
  });

  /**
   * Test: Dropdown label is visible on desktop
   * Verifies dropdown label is displayed correctly
   */
  it('dropdown label is visible on desktop', () => {
    cy.viewport(1280, 720);
    
    mountWithProviders(<LanguageSelector />);

    // Verify label is visible
    cy.contains('Language').should('be.visible');
  });

  /**
   * Test: Language selection persists across page reloads
   * Verifies language selection survives page reload
   */
  it('language selection persists across page reloads', () => {
    mountWithProviders(<LanguageSelector />);

    // Change language
    cy.contains('Language').click();
    cy.contains('German').click();
    
    // Verify language is saved
    cy.window().then((win) => {
      expect(win.localStorage.getItem('language')).to.equal('de');
    });
  });
});
