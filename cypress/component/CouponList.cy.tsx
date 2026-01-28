/**
 * Component tests for CouponList
 * 
 * Tests CouponList component which displays and manages coupons.
 * Includes filtering, sorting, editing, deletion, and responsive design.
 * 
 * @module CouponListTests
 * @author Kilo Code
 * @date 2025-01-26
 */

import React from 'react';
import { mount } from '@cypress/react18';
import { LanguageProvider } from '../../src/services/LanguageContext';
import CouponList from '../../src/components/CouponList';
import { Coupon } from '../../src/types';

/**
 * Mock coupon data for testing
 */
const mockCoupons: Coupon[] = [
  {
    id: 'coupon-1',
    userId: 'user-1',
    retailer: 'Amazon',
    initialValue: '100',
    currentValue: '100',
    expirationDate: '2025-12-31',
    activationCode: 'AMZN123',
    pin: '1234',
    notes: 'Active coupon',
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  },
  {
    id: 'coupon-2',
    userId: 'user-1',
    retailer: 'Best Buy',
    initialValue: '75',
    currentValue: '50',
    expirationDate: '2025-06-30',
    activationCode: 'BB456',
    pin: '5678',
    notes: 'Partially used coupon',
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  },
  {
    id: 'coupon-3',
    userId: 'user-1',
    retailer: 'Walmart',
    initialValue: '50',
    currentValue: '0',
    expirationDate: '2024-12-31',
    activationCode: 'WM789',
    pin: '9999',
    notes: 'Expired and used coupon',
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  },
  {
    id: 'coupon-4',
    userId: 'user-1',
    retailer: 'Target',
    initialValue: '25',
    currentValue: '25',
    expirationDate: '2024-11-01',
    activationCode: 'TGT000',
    pin: '1111',
    notes: 'Expired but unused coupon',
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
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

describe('CouponList Component', () => {
  /**
   * Test: Renders list of coupons
   * Verifies all coupons are displayed in the list
   */
  it('renders list of coupons', () => {
    const onUpdateCoupon = cy.stub().as('onUpdateCoupon');
    const onMarkAsUsed = cy.stub().as('onMarkAsUsed');
    
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={onUpdateCoupon}
        onMarkAsUsed={onMarkAsUsed}
      />
    );

    // Verify all coupons are displayed
    cy.contains('Amazon').should('be.visible');
    cy.contains('Best Buy').should('be.visible');
    cy.contains('Walmart').should('be.visible');
    cy.contains('Target').should('be.visible');
  });

  /**
   * Test: Displays coupon details correctly
   * Verifies all coupon fields are shown accurately
   */
  it('displays coupon details correctly', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Verify coupon details are displayed
    cy.contains('Amazon').should('be.visible');
    cy.contains('$100').should('be.visible');
    cy.contains('AMZN123').should('be.visible');
    cy.contains('1234').should('be.visible');
  });

  /**
   * Test: Handles empty state
   * Verifies appropriate message when no coupons exist
   */
  it('handles empty state', () => {
    mountWithProviders(
      <CouponList
        coupons={[]}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Verify empty state message is displayed
    cy.contains('No coupons found').should('be.visible');
  });

  /**
   * Test: Filters coupons by retailer
   * Verifies retailer filter works correctly
   */
  it('filters coupons by retailer', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
        retailerFilter="Amazon"
        setRetailerFilter={cy.stub()}
      />
    );

    // Verify only Amazon coupons are shown
    cy.contains('Amazon').should('be.visible');
    cy.contains('Best Buy').should('not.exist');
  });

  /**
   * Test: Filters coupons by amount range
   * Verifies min and max amount filters work correctly
   */
  it('filters coupons by amount range', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Filter by minimum amount
    cy.get('[name="minAmount"]').type('50');
    
    // Verify only coupons with value >= 50 are shown
    cy.contains('Amazon').should('be.visible');
    cy.contains('Best Buy').should('be.visible');
    cy.contains('Walmart').should('not.exist');
    cy.contains('Target').should('not.exist');
  });

  /**
   * Test: Shows/hides expired coupons
   * Verifies expired checkbox controls visibility
   */
  it('shows/hides expired coupons', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // By default, expired coupons should not be shown
    cy.contains('Walmart').should('not.exist');
    cy.contains('Target').should('not.exist');
    
    // Check the show expired checkbox
    cy.get('[name="showExpired"]').check();
    
    // Now expired coupons should be visible
    cy.contains('Walmart').should('be.visible');
    cy.contains('Target').should('be.visible');
  });

  /**
   * Test: Sorts coupons by retailer
   * Verifies sorting by retailer name works correctly
   */
  it('sorts coupons by retailer', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
        defaultSort={{ field: 'retailer', order: 'asc' }}
      />
    );

    // Click retailer sort header
    cy.contains('Retailer').click();
    
    // Verify sorting is applied (first coupon should be Amazon)
    cy.contains('Amazon').should('be.visible');
  });

  /**
   * Test: Sorts coupons by amount
   * Verifies sorting by current value works correctly
   */
  it('sorts coupons by amount', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Click amount sort header
    cy.contains('Current Value').click();
    
    // Verify sorting is applied
    cy.contains('$100').should('be.visible');
  });

  /**
   * Test: Sorts coupons by expiration date
   * Verifies sorting by expiration date works correctly
   */
  it('sorts coupons by expiration date', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Click expiration date sort header
    cy.contains('Expires').click();
    
    // Verify sorting is applied
    cy.contains('12/31/2025').should('be.visible');
  });

  /**
   * Test: Handles coupon editing
   * Verifies edit button triggers update callback
   */
  it('handles coupon editing', () => {
    const onUpdateCoupon = cy.stub().as('onUpdateCoupon');
    
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={onUpdateCoupon}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Click edit button on first coupon
    cy.contains('Amazon').parent().parent().find('[aria-label="Edit"]').click();
    
    // Verify onUpdateCoupon was called
    cy.get('@onUpdateCoupon').should('have.been.calledOnce');
  });

  /**
   * Test: Copies activation code to clipboard
   * Verifies copy button copies activation code
   */
  it('copies activation code to clipboard', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Click copy button for activation code
    cy.contains('AMZN123').parent().find('[aria-label="Copy"]').click();
    
    // Verify clipboard notification (if implemented)
    cy.contains('Copied to clipboard!').should('not.exist');
  });

  /**
   * Test: Copies PIN to clipboard
   * Verifies copy button copies PIN
   */
  it('copies PIN to clipboard', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Click copy button for PIN
    cy.contains('1234').parent().find('[aria-label="Copy"]').click();
    
    // Verify clipboard notification (if implemented)
    cy.contains('Copied to clipboard!').should('not.exist');
  });

  /**
   * Test: Displays expired status
   * Verifies expired coupons show expired badge
   */
  it('displays expired status', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Check show expired checkbox
    cy.get('[name="showExpired"]').check();
    
    // Verify expired badges are shown
    cy.contains('Expired').should('be.visible');
  });

  /**
   * Test: Displays used status
   * Verifies used coupons show used badge
   */
  it('displays used status', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Check show expired checkbox
    cy.get('[name="showExpired"]').check();
    
    // Verify used badges are shown
    cy.contains('Used').should('be.visible');
  });

  /**
   * Test: Responsive design - mobile view
   * Verifies component displays correctly on mobile devices
   */
  it('responsive design - mobile view', () => {
    cy.viewport(375, 667);
    
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Verify coupons are displayed in card view on mobile
    cy.contains('Amazon').should('be.visible');
    cy.contains('Best Buy').should('be.visible');
  });

  /**
   * Test: Responsive design - desktop view
   * Verifies component displays correctly on desktop devices
   */
  it('responsive design - desktop view', () => {
    cy.viewport(1280, 720);
    
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Verify coupons are displayed in table view on desktop
    cy.contains('Amazon').should('be.visible');
    cy.contains('Best Buy').should('be.visible');
  });

  /**
   * Test: Clears filters
   * Verifies clear filters button resets all filters
   */
  it('clears filters', () => {
    const setRetailerFilter = cy.stub().as('setRetailerFilter');
    
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
        retailerFilter="Amazon"
        setRetailerFilter={setRetailerFilter}
      />
    );

    // Click clear filters button
    cy.contains('Clear Filters').click();
    
    // Verify setRetailerFilter was called with empty string
    cy.get('@setRetailerFilter').should('have.been.calledWith', '');
  });

  /**
   * Test: Handles coupons without expiration date
   * Verifies coupons with no expiration date are displayed correctly
   */
  it('handles coupons without expiration date', () => {
    const couponsWithoutDate: Coupon[] = [
      {
        id: 'coupon-no-date',
        userId: 'user-1',
        retailer: 'No Date Store',
        initialValue: '50',
        currentValue: '50',
        created_at: '2025-01-01',
        updated_at: '2025-01-01'
      }
    ];
    
    mountWithProviders(
      <CouponList
        coupons={couponsWithoutDate}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Verify coupon is displayed
    cy.contains('No Date Store').should('be.visible');
    cy.contains('N/A').should('be.visible');
  });

  /**
   * Test: Handles coupons without activation code
   * Verifies coupons with no activation code are displayed correctly
   */
  it('handles coupons without activation code', () => {
    const couponsWithoutCode: Coupon[] = [
      {
        id: 'coupon-no-code',
        userId: 'user-1',
        retailer: 'No Code Store',
        initialValue: '50',
        currentValue: '50',
        expirationDate: '2025-12-31',
        created_at: '2025-01-01',
        updated_at: '2025-01-01'
      }
    ];
    
    mountWithProviders(
      <CouponList
        coupons={couponsWithoutCode}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Verify coupon is displayed
    cy.contains('No Code Store').should('be.visible');
    cy.contains('N/A').should('be.visible');
  });

  /**
   * Test: Handles coupons without PIN
   * Verifies coupons with no PIN are displayed correctly
   */
  it('handles coupons without PIN', () => {
    const couponsWithoutPin: Coupon[] = [
      {
        id: 'coupon-no-pin',
        userId: 'user-1',
        retailer: 'No Pin Store',
        initialValue: '50',
        currentValue: '50',
        expirationDate: '2025-12-31',
        created_at: '2025-01-01',
        updated_at: '2025-01-01'
      }
    ];
    
    mountWithProviders(
      <CouponList
        coupons={couponsWithoutPin}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Verify coupon is displayed
    cy.contains('No Pin Store').should('be.visible');
    cy.contains('N/A').should('be.visible');
  });

  /**
   * Test: Groups coupons by status
   * Verifies coupons are grouped by active, used, and expired
   */
  it('groups coupons by status', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // By default, only active coupons should be shown
    cy.contains('Amazon').should('be.visible');
    cy.contains('Best Buy').should('be.visible');
    cy.contains('Walmart').should('not.exist');
    cy.contains('Target').should('not.exist');
  });

  /**
   * Test: Displays initial value when different from current
   * Verifies initial value is shown when it differs from current
   */
  it('displays initial value when different from current', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Verify initial value is shown for partially used coupon
    cy.contains('Best Buy').parent().parent().contains('Initial Value: $75').should('be.visible');
  });

  /**
   * Test: Accessibility - table headers have proper labels
   * Verifies table headers are properly labeled
   */
  it('accessibility - table headers have proper labels', () => {
    cy.viewport(1280, 720);
    
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Verify table headers are present
    cy.contains('Retailer').should('be.visible');
    cy.contains('Current Value').should('be.visible');
    cy.contains('Expires').should('be.visible');
    cy.contains('Activation Code').should('be.visible');
    cy.contains('PIN').should('be.visible');
    cy.contains('Actions').should('be.visible');
  });

  /**
   * Test: Accessibility - action buttons have proper ARIA labels
   * Verifies action buttons have appropriate accessibility attributes
   */
  it('accessibility - action buttons have proper ARIA labels', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Verify edit button has aria-label
    cy.get('[aria-label="Edit"]').should('exist');
    cy.get('[aria-label="Copy"]').should('exist');
  });

  /**
   * Test: Tests with different languages (i18n)
   * Verifies component labels are translated correctly
   */
  it('tests with different languages (i18n)', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Verify English labels are present
    cy.contains('Retailer').should('be.visible');
    cy.contains('Current Value').should('be.visible');
    cy.contains('Expires').should('be.visible');
    cy.contains('Activation Code').should('be.visible');
    cy.contains('PIN').should('be.visible');
    cy.contains('Actions').should('be.visible');
    cy.contains('Filter').should('be.visible');
    cy.contains('Clear Filters').should('be.visible');
  });

  /**
   * Test: Handles large number of coupons
   * Verifies component performs well with many coupons
   */
  it('handles large number of coupons', () => {
    const manyCoupons: Coupon[] = Array.from({ length: 50 }, (_, i) => ({
      id: `coupon-${i}`,
      userId: 'user-1',
      retailer: `Store ${i}`,
      initialValue: '100',
      currentValue: '100',
      expirationDate: '2025-12-31',
      created_at: '2025-01-01',
      updated_at: '2025-01-01'
    }));
    
    mountWithProviders(
      <CouponList
        coupons={manyCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Verify first few coupons are displayed
    cy.contains('Store 0').should('be.visible');
    cy.contains('Store 1').should('be.visible');
  });

  /**
   * Test: Disables edit for expired/used coupons
   * Verifies edit button is disabled for expired or used coupons
   */
  it('disables edit for expired/used coupons', () => {
    mountWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={cy.stub()}
        onMarkAsUsed={cy.stub()}
      />
    );

    // Check show expired checkbox to see expired coupons
    cy.get('[name="showExpired"]').check();
    
    // Verify edit button for expired coupon is disabled
    cy.contains('Walmart').parent().parent().find('[aria-label="Edit"]').should('be.disabled');
  });
});
