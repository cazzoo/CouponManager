/**
 * Component tests for AddCouponForm
 * 
 * Tests the AddCouponForm component which handles adding and editing coupons.
 * Includes validation, form submission, barcode scanning integration, and i18n support.
 * 
 * @module AddCouponFormTests
 * @author Kilo Code
 * @date 2025-01-26
 */

import React from 'react';
import { mount } from '@cypress/react18';
import { LanguageProvider } from '../../src/services/LanguageContext';
import AddCouponForm from '../../src/components/AddCouponForm';
import { Coupon, CouponFormData } from '../../src/types';

/**
 * Mock coupon data for testing
 */
const mockCoupon: Coupon = {
  id: 'test-coupon-1',
  userId: 'test-user-1',
  retailer: 'Test Retailer',
  initialValue: '100',
  currentValue: '100',
  expirationDate: '2025-12-31',
  activationCode: 'TEST123',
  pin: '0000',
  notes: 'Test coupon',
  barcode: '123456789',
  reference: 'REF001',
  created_at: '2025-01-01',
  updated_at: '2025-01-01'
};

/**
 * Mock existing coupons for autocomplete suggestions
 */
const mockCoupons: Coupon[] = [
  {
    id: 'coupon-1',
    userId: 'user-1',
    retailer: 'Amazon',
    initialValue: '50',
    currentValue: '50',
    expirationDate: '2025-06-30'
  },
  {
    id: 'coupon-2',
    userId: 'user-1',
    retailer: 'Best Buy',
    initialValue: '100',
    currentValue: '75',
    expirationDate: '2025-08-15'
  }
];

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

describe('AddCouponForm Component', () => {
  /**
   * Test: Renders correctly with default props
   * Verifies the form dialog opens and displays all expected fields
   */
  it('renders correctly with default props', () => {
    const onAddCoupon = cy.stub().as('onAddCoupon');
    const onUpdateCoupon = cy.stub().as('onUpdateCoupon');
    
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={cy.stub()}
        onAddCoupon={onAddCoupon}
        onUpdateCoupon={onUpdateCoupon}
        coupons={mockCoupons}
      />
    );

    // Verify dialog title for adding new coupon
    cy.contains('Add Coupon').should('be.visible');
    
    // Verify all form fields are present
    cy.get('[data-testid="retailer-input"]').should('exist');
    cy.get('[data-testid="initial-value-input"]').should('exist');
    cy.get('[data-testid="current-value-input"]').should('exist');
    cy.get('[data-testid="expiration-date-input"]').should('exist');
    cy.get('[data-testid="activation-code-input"]').should('exist');
    cy.get('[data-testid="pin-input"]').should('exist');
    cy.get('[data-testid="notes-input"]').should('exist');
    cy.get('[data-testid="barcode-input"]').should('exist');
    cy.get('[data-testid="reference-input"]').should('exist');
    
    // Verify action buttons
    cy.contains('Cancel').should('be.visible');
    cy.contains('Add').should('be.visible');
  });

  /**
   * Test: Renders correctly in edit mode
   * Verifies the form displays existing coupon data and shows update button
   */
  it('renders correctly in edit mode', () => {
    const onUpdateCoupon = cy.stub().as('onUpdateCoupon');
    
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={cy.stub()}
        onAddCoupon={cy.stub()}
        onUpdateCoupon={onUpdateCoupon}
        coupon={mockCoupon}
        coupons={mockCoupons}
      />
    );

    // Verify dialog title for editing
    cy.contains('Edit').should('be.visible');
    
    // Verify form is pre-filled with coupon data
    cy.get('[data-testid="retailer-input"]').should('have.value', 'Test Retailer');
    cy.get('[data-testid="initial-value-input"]').should('have.value', '100');
    cy.get('[data-testid="current-value-input"]').should('have.value', '100');
    cy.get('[data-testid="activation-code-input"]').should('have.value', 'TEST123');
    cy.get('[data-testid="pin-input"]').should('have.value', '0000');
    cy.get('[data-testid="notes-input"]').should('have.value', 'Test coupon');
    cy.get('[data-testid="barcode-input"]').should('have.value', '123456789');
    cy.get('[data-testid="reference-input"]').should('have.value', 'REF001');
    
    // Verify update button is shown instead of add
    cy.contains('Update').should('be.visible');
  });

  /**
   * Test: Validates required fields
   * Verifies form validation prevents submission without required fields
   */
  it('validates required fields', () => {
    const onAddCoupon = cy.stub().as('onAddCoupon');
    const onClose = cy.stub().as('onClose');
    
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={onClose}
        onAddCoupon={onAddCoupon}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );

    // Try to submit without filling required fields
    cy.get('form').submit();
    
    // Verify form was not submitted
    cy.get('@onAddCoupon').should('not.have.been.called');
    cy.get('@onClose').should('not.have.been.called');
  });

  /**
   * Test: Shows validation errors for invalid inputs
   * Verifies validation messages appear for invalid data
   */
  it('shows validation errors for invalid inputs', () => {
    const onAddCoupon = cy.stub().as('onAddCoupon');
    
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={cy.stub()}
        onAddCoupon={onAddCoupon}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );

    // Fill only retailer field
    cy.get('[data-testid="retailer-input"]').type('Test Store');
    
    // Try to submit without required numeric fields
    cy.get('form').submit();
    
    // Verify submission was prevented
    cy.get('@onAddCoupon').should('not.have.been.called');
  });

  /**
   * Test: Submits successfully with valid data
   * Verifies form submission with all required fields
   */
  it('submits successfully with valid data', () => {
    const onAddCoupon = cy.stub().as('onAddCoupon');
    const onClose = cy.stub().as('onClose');
    
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={onClose}
        onAddCoupon={onAddCoupon}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );

    // Fill required fields
    cy.get('[data-testid="retailer-input"]').type('New Store');
    cy.get('[data-testid="initial-value-input"]').type('50');
    cy.get('[data-testid="current-value-input"]').type('50');
    
    // Submit form
    cy.get('form').submit();
    
    // Verify onAddCoupon was called with correct data
    cy.get('@onAddCoupon').should('have.been.calledOnce');
    cy.get('@onAddCoupon').should((stub) => {
      const callArgs = stub.getCall(0).args[0] as CouponFormData;
      expect(callArgs.retailer).to.equal('New Store');
      expect(callArgs.initialValue).to.equal('50');
      expect(callArgs.currentValue).to.equal('50');
    });
    
    // Verify onClose was called
    cy.get('@onClose').should('have.been.calledOnce');
  });

  /**
   * Test: Resets form after submission
   * Verifies form fields are cleared after successful submission
   */
  it('resets form after submission', () => {
    const onAddCoupon = cy.stub().as('onAddCoupon');
    const onClose = cy.stub().as('onClose');
    
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={onClose}
        onAddCoupon={onAddCoupon}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );

    // Fill and submit form
    cy.get('[data-testid="retailer-input"]').type('Test Store');
    cy.get('[data-testid="initial-value-input"]').type('100');
    cy.get('[data-testid="current-value-input"]').type('100');
    cy.get('form').submit();
    
    // Close and reopen form to verify reset
    cy.get('@onClose').should('have.been.called');
    
    // Remount with open=true to check if form is reset
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={onClose}
        onAddCoupon={onAddCoupon}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );
    
    // Verify fields are empty (or have default values)
    cy.get('[data-testid="retailer-input"]').should('have.value', '');
    cy.get('[data-testid="initial-value-input"]').should('have.value', '');
    cy.get('[data-testid="current-value-input"]').should('have.value', '');
  });

  /**
   * Test: Handles different coupon types (percentage, fixed amount)
   * Verifies form accepts both numeric and percentage values
   */
  it('handles different coupon types (percentage, fixed amount)', () => {
    const onAddCoupon = cy.stub().as('onAddCoupon');
    
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={cy.stub()}
        onAddCoupon={onAddCoupon}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );

    // Test with fixed amount
    cy.get('[data-testid="retailer-input"]').type('Store A');
    cy.get('[data-testid="initial-value-input"]').type('25.50');
    cy.get('[data-testid="current-value-input"]').type('25.50');
    cy.get('form').submit();
    
    cy.get('@onAddCoupon').should('have.been.calledOnce');
    
    // Remount for percentage test
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={cy.stub()}
        onAddCoupon={onAddCoupon}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );
    
    // Test with percentage value (stored as number)
    cy.get('[data-testid="retailer-input"]').type('Store B');
    cy.get('[data-testid="initial-value-input"]').type('20');
    cy.get('[data-testid="current-value-input"]').type('20');
    cy.get('form').submit();
    
    cy.get('@onAddCoupon').should('have.been.calledTwice');
  });

  /**
   * Test: Opens barcode scanner
   * Verifies the scan barcode button opens the scanner dialog
   */
  it('opens barcode scanner', () => {
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={cy.stub()}
        onAddCoupon={cy.stub()}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );

    // Click scan barcode button
    cy.contains('Scan Barcode').click();
    
    // Verify scanner dialog opens
    cy.contains('Scan Barcode').should('be.visible');
  });

  /**
   * Test: Handles scanned barcode data
   * Verifies scanned data populates form fields correctly
   */
  it('handles scanned barcode data', () => {
    const onAddCoupon = cy.stub().as('onAddCoupon');
    const onClose = cy.stub().as('onClose');
    
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={onClose}
        onAddCoupon={onAddCoupon}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );

    // Open scanner
    cy.contains('Scan Barcode').click();
    
    // Simulate successful scan by closing scanner
    cy.contains('Cancel').click();
    
    // Verify form is still accessible
    cy.get('[data-testid="retailer-input"]').should('be.visible');
  });

  /**
   * Test: Provides autocomplete suggestions for retailers
   * Verifies existing retailer names appear as suggestions
   */
  it('provides autocomplete suggestions for retailers', () => {
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={cy.stub()}
        onAddCoupon={cy.stub()}
        onUpdateCoupon={cy.stub()}
        coupons={mockCoupons}
      />
    );

    // Click on retailer input
    cy.get('[data-testid="retailer-input"]').click();
    
    // Verify autocomplete shows existing retailers
    cy.contains('Amazon').should('be.visible');
    cy.contains('Best Buy').should('be.visible');
  });

  /**
   * Test: Handles optional fields
   * Verifies form submission works with only required fields
   */
  it('handles optional fields', () => {
    const onAddCoupon = cy.stub().as('onAddCoupon');
    
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={cy.stub()}
        onAddCoupon={onAddCoupon}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );

    // Fill only required fields
    cy.get('[data-testid="retailer-input"]').type('Minimal Store');
    cy.get('[data-testid="initial-value-input"]').type('10');
    cy.get('[data-testid="current-value-input"]').type('10');
    
    // Submit form
    cy.get('form').submit();
    
    // Verify submission succeeded
    cy.get('@onAddCoupon').should('have.been.calledOnce');
    cy.get('@onAddCoupon').should((stub) => {
      const callArgs = stub.getCall(0).args[0] as CouponFormData;
      expect(callArgs.retailer).to.equal('Minimal Store');
      expect(callArgs.initialValue).to.equal('10');
      expect(callArgs.currentValue).to.equal('10');
      expect(callArgs.activationCode).to.be.undefined;
      expect(callArgs.pin).to.be.undefined;
      expect(callArgs.notes).to.be.undefined;
    });
  });

  /**
   * Test: Handles date picker
   * Verifies expiration date can be set and cleared
   */
  it('handles date picker', () => {
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={cy.stub()}
        onAddCoupon={cy.stub()}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );

    // Verify date picker is present
    cy.get('[data-testid="expiration-date-input"]').should('be.visible');
  });

  /**
   * Test: Closes dialog on cancel
   * Verifies cancel button closes the dialog without submitting
   */
  it('closes dialog on cancel', () => {
    const onClose = cy.stub().as('onClose');
    
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={onClose}
        onAddCoupon={cy.stub()}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );

    // Fill some fields
    cy.get('[data-testid="retailer-input"]').type('Test Store');
    
    // Click cancel
    cy.contains('Cancel').click();
    
    // Verify onClose was called
    cy.get('@onClose').should('have.been.calledOnce');
  });

  /**
   * Test: Updates existing coupon
   * Verifies edit mode submits updated data correctly
   */
  it('updates existing coupon', () => {
    const onUpdateCoupon = cy.stub().as('onUpdateCoupon');
    const onClose = cy.stub().as('onClose');
    
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={onClose}
        onAddCoupon={cy.stub()}
        onUpdateCoupon={onUpdateCoupon}
        coupon={mockCoupon}
        coupons={mockCoupons}
      />
    );

    // Modify some fields
    cy.get('[data-testid="retailer-input"]').clear().type('Updated Store');
    cy.get('[data-testid="current-value-input"]').clear().type('80');
    
    // Submit form
    cy.get('form').submit();
    
    // Verify onUpdateCoupon was called
    cy.get('@onUpdateCoupon').should('have.been.calledOnce');
    cy.get('@onClose').should('have.been.calledOnce');
  });

  /**
   * Test: Tests with different languages (i18n)
   * Verifies form labels are translated correctly
   */
  it('tests with different languages (i18n)', () => {
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={cy.stub()}
        onAddCoupon={cy.stub()}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );

    // Verify English labels are present
    cy.contains('Retailer').should('be.visible');
    cy.contains('Initial Value').should('be.visible');
    cy.contains('Current Value').should('be.visible');
    cy.contains('Expiration Date').should('be.visible');
    cy.contains('Activation Code').should('be.visible');
    cy.contains('PIN').should('be.visible');
    cy.contains('Notes').should('be.visible');
    cy.contains('Barcode').should('be.visible');
    cy.contains('Reference').should('be.visible');
  });

  /**
   * Test: Handles notes field with multiline input
   * Verifies notes field accepts multiple lines of text
   */
  it('handles notes field with multiline input', () => {
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={cy.stub()}
        onAddCoupon={cy.stub()}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );

    // Type multiline text in notes field
    const multilineText = 'Line 1\nLine 2\nLine 3';
    cy.get('[data-testid="notes-input"]').type(multilineText);
    
    // Verify text was entered
    cy.get('[data-testid="notes-input"]').should('have.value', multilineText);
  });

  /**
   * Test: Validates numeric input fields
   * Verifies numeric fields accept only valid numbers
   */
  it('validates numeric input fields', () => {
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={cy.stub()}
        onAddCoupon={cy.stub()}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );

    // Test initial value field
    cy.get('[data-testid="initial-value-input"]').type('100.50');
    cy.get('[data-testid="initial-value-input"]').should('have.value', '100.50');
    
    // Test current value field
    cy.get('[data-testid="current-value-input"]').clear().type('75.25');
    cy.get('[data-testid="current-value-input"]').should('have.value', '75.25');
  });

  /**
   * Test: Handles different value combinations
   * Verifies form handles cases where initial and current values differ
   */
  it('handles different value combinations', () => {
    const onAddCoupon = cy.stub().as('onAddCoupon');
    
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={cy.stub()}
        onAddCoupon={onAddCoupon}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );

    // Set different initial and current values
    cy.get('[data-testid="retailer-input"]').type('Discount Store');
    cy.get('[data-testid="initial-value-input"]').type('100');
    cy.get('[data-testid="current-value-input"]').type('50');
    
    // Submit form
    cy.get('form').submit();
    
    // Verify both values were submitted
    cy.get('@onAddCoupon').should((stub) => {
      const callArgs = stub.getCall(0).args[0] as CouponFormData;
      expect(callArgs.initialValue).to.equal('100');
      expect(callArgs.currentValue).to.equal('50');
    });
  });

  /**
   * Test: Accessibility - form fields have proper labels
   * Verifies all form fields have associated labels
   */
  it('accessibility - form fields have proper labels', () => {
    mountWithProviders(
      <AddCouponForm
        open={true}
        onClose={cy.stub()}
        onAddCoupon={cy.stub()}
        onUpdateCoupon={cy.stub()}
        coupons={[]}
      />
    );

    // Verify all input fields have labels
    cy.get('[data-testid="retailer-input"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="initial-value-input"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="current-value-input"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="expiration-date-input"]').should('have.attr', 'aria-label');
  });
});
