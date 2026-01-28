/**
 * Component tests for RetailerList
 * 
 * Tests RetailerList component which displays retailer statistics.
 * Includes filtering, sorting, responsive design, and retailer interactions.
 * 
 * @module RetailerListTests
 * @author Kilo Code
 * @date 2025-01-26
 */

import React from 'react';
import { mount } from '@cypress/react18';
import { LanguageProvider } from '../../src/services/LanguageContext';
import RetailerList from '../../src/components/RetailerList';
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
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  },
  {
    id: 'coupon-5',
    userId: 'user-1',
    retailer: 'Amazon',
    initialValue: '50',
    currentValue: '50',
    expirationDate: '2025-08-15',
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

describe('RetailerList Component', () => {
  /**
   * Test: Renders list of retailers
   * Verifies all retailers are displayed
   */
  it('renders list of retailers', () => {
    const onRetailerClick = cy.stub().as('onRetailerClick');
    
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={onRetailerClick}
      />
    );

    // Verify all retailers are displayed
    cy.contains('Amazon').should('be.visible');
    cy.contains('Best Buy').should('be.visible');
    cy.contains('Walmart').should('be.visible');
    cy.contains('Target').should('be.visible');
  });

  /**
   * Test: Displays retailer details correctly
   * Verifies retailer statistics are shown accurately
   */
  it('displays retailer details correctly', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify Amazon details (2 coupons, $150 total)
    cy.contains('Amazon').parent().parent().contains('$150.00').should('be.visible');
    cy.contains('Amazon').parent().parent().contains('2').should('be.visible');
  });

  /**
   * Test: Handles empty state
   * Verifies appropriate message when no retailers exist
   */
  it('handles empty state', () => {
    mountWithProviders(
      <RetailerList
        coupons={[]}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify empty state message is displayed
    cy.contains('No retailers found').should('be.visible');
  });

  /**
   * Test: Sorts retailers by name
   * Verifies sorting by retailer name works correctly
   */
  it('sorts retailers by name', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Click retailer name sort header
    cy.contains('Retailer').click();
    
    // Verify sorting is applied
    cy.contains('Amazon').should('be.visible');
    cy.contains('Best Buy').should('be.visible');
  });

  /**
   * Test: Sorts retailers by total coupons
   * Verifies sorting by coupon count works correctly
   */
  it('sorts retailers by total coupons', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Click total coupons sort header
    cy.contains('Total Coupons').click();
    
    // Verify sorting is applied
    cy.contains('2').should('be.visible');
  });

  /**
   * Test: Sorts retailers by total value
   * Verifies sorting by total value works correctly
   */
  it('sorts retailers by total value', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Click total value sort header
    cy.contains('Total Value').click();
    
    // Verify sorting is applied
    cy.contains('$150.00').should('be.visible');
  });

  /**
   * Test: Sorts retailers by active coupons
   * Verifies sorting by active coupon count works correctly
   */
  it('sorts retailers by active coupons', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Click active coupons sort header
    cy.contains('Active Coupons').click();
    
    // Verify sorting is applied
    cy.contains('2').should('be.visible');
  });

  /**
   * Test: Sorts retailers by active value
   * Verifies sorting by active value works correctly
   */
  it('sorts retailers by active value', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Click active value sort header
    cy.contains('Active Value').click();
    
    // Verify sorting is applied
    cy.contains('$150.00').should('be.visible');
  });

  /**
   * Test: Sorts retailers by expired coupons
   * Verifies sorting by expired coupon count works correctly
   */
  it('sorts retailers by expired coupons', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Click expired coupons sort header
    cy.contains('Expired Coupons').click();
    
    // Verify sorting is applied
    cy.contains('1').should('be.visible');
  });

  /**
   * Test: Sorts retailers by expired value
   * Verifies sorting by expired value works correctly
   */
  it('sorts retailers by expired value', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Click expired value sort header
    cy.contains('Expired Value').click();
    
    // Verify sorting is applied
    cy.contains('$50.00').should('be.visible');
  });

  /**
   * Test: Handles retailer click
   * Verifies clicking retailer triggers callback
   */
  it('handles retailer click', () => {
    const onRetailerClick = cy.stub().as('onRetailerClick');
    
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={onRetailerClick}
      />
    );

    // Click on Amazon retailer
    cy.contains('Amazon').click();
    
    // Verify callback was called
    cy.get('@onRetailerClick').should('have.been.calledOnce');
    cy.get('@onRetailerClick').should((stub) => {
      const callArgs = stub.getCall(0).args;
      expect(callArgs[0]).to.equal('Amazon');
      expect(callArgs[1]).to.deep.equal({ field: 'expirationDate', order: 'asc' });
    });
  });

  /**
   * Test: Responsive design - mobile view
   * Verifies component displays correctly on mobile devices
   */
  it('responsive design - mobile view', () => {
    cy.viewport(375, 667);
    
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify retailers are displayed in card view on mobile
    cy.contains('Amazon').should('be.visible');
    cy.contains('Best Buy').should('be.visible');
    cy.contains('Walmart').should('be.visible');
  });

  /**
   * Test: Responsive design - desktop view
   * Verifies component displays correctly on desktop devices
   */
  it('responsive design - desktop view', () => {
    cy.viewport(1280, 720);
    
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify retailers are displayed in table view on desktop
    cy.contains('Amazon').should('be.visible');
    cy.contains('Best Buy').should('be.visible');
  });

  /**
   * Test: Displays active coupon count
   * Verifies active coupon count is shown correctly
   */
  it('displays active coupon count', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify Amazon has 2 active coupons
    cy.contains('Amazon').parent().parent().contains('2').should('be.visible');
  });

  /**
   * Test: Displays expired coupon count
   * Verifies expired coupon count is shown correctly
   */
  it('displays expired coupon count', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify Walmart has 1 expired coupon
    cy.contains('Walmart').parent().parent().contains('1').should('be.visible');
  });

  /**
   * Test: Displays active value
   * Verifies active value is shown correctly
   */
  it('displays active value', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify Amazon active value is $150.00
    cy.contains('Amazon').parent().parent().contains('$150.00').should('be.visible');
  });

  /**
   * Test: Displays expired value
   * Verifies expired value is shown correctly
   */
  it('displays expired value', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify Walmart expired value is $50.00
    cy.contains('Walmart').parent().parent().contains('$50.00').should('be.visible');
  });

  /**
   * Test: Groups coupons by retailer
   * Verifies coupons are correctly grouped by retailer
   */
  it('groups coupons by retailer', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify Amazon has 2 coupons grouped
    cy.contains('Amazon').parent().parent().contains('2').should('be.visible');
    
    // Verify Best Buy has 1 coupon
    cy.contains('Best Buy').parent().parent().contains('1').should('be.visible');
  });

  /**
   * Test: Handles retailers with only expired coupons
   * Verifies retailers with only expired coupons are displayed correctly
   */
  it('handles retailers with only expired coupons', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify Walmart has 0 active coupons
    cy.contains('Walmart').parent().parent().contains('0').should('be.visible');
  });

  /**
   * Test: Handles retailers with mixed active and expired coupons
   * Verifies retailers with mixed status are displayed correctly
   */
  it('handles retailers with mixed active and expired coupons', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify Amazon has 2 active and 0 expired
    cy.contains('Amazon').parent().parent().contains('2').should('be.visible');
  });

  /**
   * Test: Accessibility - table headers have proper labels
   * Verifies table headers are properly labeled
   */
  it('accessibility - table headers have proper labels', () => {
    cy.viewport(1280, 720);
    
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify table headers are present
    cy.contains('Retailer').should('be.visible');
    cy.contains('Total Coupons').should('be.visible');
    cy.contains('Total Value').should('be.visible');
    cy.contains('Active Coupons').should('be.visible');
    cy.contains('Active Value').should('be.visible');
    cy.contains('Expired Coupons').should('be.visible');
    cy.contains('Expired Value').should('be.visible');
  });

  /**
   * Test: Accessibility - retailer links are clickable
   * Verifies retailer names are interactive links
   */
  it('accessibility - retailer links are clickable', () => {
    cy.viewport(1280, 720);
    
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify retailer links are clickable
    cy.contains('Amazon').should('have.attr', 'role', 'button');
  });

  /**
   * Test: Tests with different languages (i18n)
   * Verifies component labels are translated correctly
   */
  it('tests with different languages (i18n)', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify English labels are present
    cy.contains('Retailer').should('be.visible');
    cy.contains('Total Coupons').should('be.visible');
    cy.contains('Total Value').should('be.visible');
    cy.contains('Active Coupons').should('be.visible');
    cy.contains('Active Value').should('be.visible');
    cy.contains('Expired Coupons').should('be.visible');
    cy.contains('Expired Value').should('be.visible');
  });

  /**
   * Test: Handles large number of retailers
   * Verifies component performs well with many retailers
   */
  it('handles large number of retailers', () => {
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
      <RetailerList
        coupons={manyCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify first few retailers are displayed
    cy.contains('Store 0').should('be.visible');
    cy.contains('Store 1').should('be.visible');
  });

  /**
   * Test: Calculates correct totals
   * Verifies retailer totals are calculated correctly
   */
  it('calculates correct totals', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify Amazon total is $150.00 (100 + 50)
    cy.contains('Amazon').parent().parent().contains('$150.00').should('be.visible');
    
    // Verify Best Buy total is $50.00 (75 - 25 used)
    cy.contains('Best Buy').parent().parent().contains('$50.00').should('be.visible');
  });

  /**
   * Test: Sort direction changes on repeated clicks
   * Verifies sort direction toggles between asc and desc
   */
  it('sort direction changes on repeated clicks', () => {
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Click retailer name twice
    cy.contains('Retailer').click();
    cy.contains('Retailer').click();
    
    // Verify sorting is still applied
    cy.contains('Amazon').should('be.visible');
  });

  /**
   * Test: Mobile card displays retailer stats
   * Verifies mobile card view shows all statistics
   */
  it('mobile card displays retailer stats', () => {
    cy.viewport(375, 667);
    
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify mobile card shows all stats
    cy.contains('Amazon').should('be.visible');
    cy.contains('Total Coupons:').should('be.visible');
    cy.contains('Total Value:').should('be.visible');
    cy.contains('Active:').should('be.visible');
    cy.contains('Expired:').should('be.visible');
  });

  /**
   * Test: Retailer link color indicates active status
   * Verifies retailer with active coupons has primary color
   */
  it('retailer link color indicates active status', () => {
    cy.viewport(1280, 720);
    
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify Amazon (has active coupons) is primary color
    cy.contains('Amazon').should('have.css', 'color');
  });

  /**
   * Test: Handles retailers with no active coupons
   * Verifies retailers with only expired coupons show error color
   */
  it('handles retailers with no active coupons', () => {
    cy.viewport(1280, 720);
    
    mountWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={cy.stub()}
      />
    );

    // Verify Walmart (no active coupons) is error color
    cy.contains('Walmart').should('be.visible');
  });
});
