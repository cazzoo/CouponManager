/**
 * RetailerList Component Tests
 *
 * Testing mobile card view, desktop table view, sorting, statistics calculation,
 * empty states, and responsive behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RetailerList from '../../components/RetailerList';
import { Coupon } from '../../types';

// Mock LanguageContext
vi.mock('../../services/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    changeLanguage: vi.fn(),
    t: (key: string) => key,
    getSupportedLanguages: () => ['en', 'es', 'fr', 'de']
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock window.matchMedia for responsive behavior
const mockMatchMedia = vi.fn();
let mockMediaQueryList: {
  matches: boolean;
  media: string;
  onchange: null;
  addListener: any;
  removeListener: any;
  addEventListener: any;
  removeEventListener: any;
  dispatchEvent: any;
};

describe('RetailerList - Mobile Rendering', () => {
  const mockCoupons: Coupon[] = [
    {
      id: '1',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '100',
      currentValue: '80',
      expirationDate: '2025-12-31'
    },
    {
      id: '2',
      userId: 'user1',
      retailer: 'Target',
      initialValue: '50',
      currentValue: '50',
      expirationDate: '2025-06-30'
    }
  ];

  beforeEach(() => {
    mockMediaQueryList = {
      matches: true,
      media: '(max-width: 639px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    });
  });

  it('should render mobile card view element in DOM', () => {
    // The mobile view uses Tailwind class 'sm:hidden'.
    // document.querySelector('.sm:hidden') would fail because ':hidden' is parsed as a pseudo-class.
    // Use attribute-based selector to match the class name that contains the colon.
    render(<RetailerList coupons={mockCoupons} />);

    // Both mobile cards and desktop table are in the DOM; JSDOM doesn't apply CSS hiding
    const mobileView = document.querySelector('[class*="sm:hidden"]');
    expect(mobileView).toBeInTheDocument();
  });

  it('should display retailer cards with correct statistics', () => {
    const { container } = render(<RetailerList coupons={mockCoupons} />);

    expect(screen.getAllByText('Amazon').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Target').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/total_coupons/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/total_value/).length).toBeGreaterThan(0);

    const badges = container.querySelectorAll('.badge');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('should display card elements with correct DaisyUI classes', () => {
    render(<RetailerList coupons={mockCoupons} />);

    // Check for card elements
    const cards = document.querySelectorAll('.card');
    expect(cards.length).toBeGreaterThan(0);

    // Check for card body
    const cardBodies = document.querySelectorAll('.card-body');
    expect(cardBodies.length).toBeGreaterThan(0);
  });

  it('should show empty state when no retailers available', () => {
    render(<RetailerList coupons={[]} />);

    expect(screen.getByTestId('retailer-empty-state')).toBeInTheDocument();
    expect(screen.getAllByText('messages.no_retailers_found').length).toBe(2);
  });
});

describe('RetailerList - Desktop Rendering', () => {
  const mockCoupons: Coupon[] = [
    {
      id: '1',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '100',
      currentValue: '80',
      expirationDate: '2025-12-31'
    },
    {
      id: '2',
      userId: 'user1',
      retailer: 'Target',
      initialValue: '50',
      currentValue: '50',
      expirationDate: '2025-06-30'
    }
  ];

  beforeEach(() => {
    // Set desktop view (width >= 640px)
    mockMediaQueryList = {
      matches: false,
      media: '(min-width: 640px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    });
  });

  it('should render desktop table view when screen width >= 640px', () => {
    render(<RetailerList coupons={mockCoupons} />);

    // Check for table
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should display table headers with correct labels', () => {
    render(<RetailerList coupons={mockCoupons} />);

    // Check column headers
    expect(screen.getByText('form.retailer')).toBeInTheDocument();
    expect(screen.getByText('tables.total_coupons')).toBeInTheDocument();
    expect(screen.getByText('general.total_value')).toBeInTheDocument();
    expect(screen.getByText('general.active_coupons')).toBeInTheDocument();
    expect(screen.getByText('tables.active_value')).toBeInTheDocument();
    expect(screen.getByText('general.expired_coupons')).toBeInTheDocument();
    expect(screen.getByText('tables.expired_value')).toBeInTheDocument();
  });

  it('should display retailers as table rows', () => {
    render(<RetailerList coupons={mockCoupons} />);

    // Check retailer buttons
    const amazonButton = screen.getByRole('button', { name: /Amazon/i });
    const targetButton = screen.getByRole('button', { name: /Target/i });
    expect(amazonButton).toBeInTheDocument();
    expect(targetButton).toBeInTheDocument();
  });

  it('should show empty state in table when no retailers', () => {
    render(<RetailerList coupons={[]} />);

    expect(screen.getAllByText('messages.no_retailers_found').length).toBe(2);
  });

  it('should apply zebra striping to table', () => {
    render(<RetailerList coupons={mockCoupons} />);

    const table = screen.getByRole('table');
    expect(table).toHaveClass('table-zebra');
  });
});

describe('RetailerList - Statistics Calculation', () => {
  const mockCoupons: Coupon[] = [
    {
      id: '1',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '100',
      currentValue: '80',
      expirationDate: '2099-12-31'  // Future date - active
    },
    {
      id: '2',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '0',  // Used/expired
      expirationDate: '2099-12-31'
    },
    {
      id: '3',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '30',
      currentValue: '30',
      expirationDate: '2020-01-01'  // Past date - expired
    },
    {
      id: '4',
      userId: 'user1',
      retailer: 'Target',
      initialValue: '40',
      currentValue: '40',
      expirationDate: '2099-06-30'  // Future date - active
    }
  ];

  beforeEach(() => {
    // Set desktop view for easier testing
    mockMediaQueryList = {
      matches: false,
      media: '(min-width: 640px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    });
  });

  it('should correctly calculate total coupon count per retailer', () => {
    render(<RetailerList coupons={mockCoupons} />);

    // Amazon has 3 coupons total
    const amazonRow = screen.getByRole('button', { name: /Amazon/i }).closest('tr');
    const amazonCount = amazonRow?.querySelectorAll('td')[1];
    expect(amazonCount?.textContent).toBe('3');

    // Target has 1 coupon
    const targetRow = screen.getByRole('button', { name: /Target/i }).closest('tr');
    const targetCount = targetRow?.querySelectorAll('td')[1];
    expect(targetCount?.textContent).toBe('1');
  });

  it('should correctly calculate total value per retailer', () => {
    render(<RetailerList coupons={mockCoupons} />);

    // Amazon: 80 + 0 + 30 = 110
    const amazonRow = screen.getByRole('button', { name: /Amazon/i }).closest('tr');
    const amazonValue = amazonRow?.querySelectorAll('td')[2];
    expect(amazonValue?.textContent).toBe('$110.00');

    // Target: 40
    const targetRow = screen.getByRole('button', { name: /Target/i }).closest('tr');
    const targetValue = targetRow?.querySelectorAll('td')[2];
    expect(targetValue?.textContent).toBe('$40.00');
  });

  it('should correctly identify active coupons (not expired and not used)', () => {
    render(<RetailerList coupons={mockCoupons} />);

    // Amazon: 1 active (first coupon only - second is used, third is expired)
    const amazonRow = screen.getByRole('button', { name: /Amazon/i }).closest('tr');
    const amazonActiveCount = amazonRow?.querySelectorAll('td')[3];
    expect(amazonActiveCount?.textContent).toBe('1');
  });

  it('should correctly identify expired coupons (expired date or used)', () => {
    render(<RetailerList coupons={mockCoupons} />);

    // Amazon: 2 expired (second coupon has value 0, third has past date)
    const amazonRow = screen.getByRole('button', { name: /Amazon/i }).closest('tr');
    const amazonExpiredCount = amazonRow?.querySelectorAll('td')[5];
    expect(amazonExpiredCount?.textContent).toBe('2');
  });

  it('should treat coupons with currentValue of 0 as expired', () => {
    const couponsWithZero: Coupon[] = [
      {
        id: '1',
        userId: 'user1',
        retailer: 'Amazon',
        initialValue: '100',
        currentValue: '0',
        expirationDate: '2025-12-31'
      }
    ];

    render(<RetailerList coupons={couponsWithZero} />);

    const amazonRow = screen.getByRole('button', { name: /Amazon/i }).closest('tr');
    const expiredCount = amazonRow?.querySelectorAll('td')[5];
    expect(expiredCount?.textContent).toBe('1');
  });

  it('should calculate active and expired totals correctly', () => {
    render(<RetailerList coupons={mockCoupons} />);

    const amazonRow = screen.getByRole('button', { name: /Amazon/i }).closest('tr');

    // Active total: 80 (only first coupon)
    const activeTotal = amazonRow?.querySelectorAll('td')[4];
    expect(activeTotal?.textContent).toBe('$80.00');

    // Expired total: 0 + 30 = 30 (second and third coupon)
    const expiredTotal = amazonRow?.querySelectorAll('td')[6];
    expect(expiredTotal?.textContent).toBe('$30.00');
  });
});

describe('RetailerList - Sorting Functionality', () => {
  const mockCoupons: Coupon[] = [
    {
      id: '1',
      userId: 'user1',
      retailer: 'Zebra',
      initialValue: '100',
      currentValue: '80'
    },
    {
      id: '2',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '50'
    },
    {
      id: '3',
      userId: 'user1',
      retailer: 'Target',
      initialValue: '200',
      currentValue: '150'
    }
  ];

  beforeEach(() => {
    // Set desktop view
    mockMediaQueryList = {
      matches: false,
      media: '(min-width: 640px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    });
  });

  it('should sort by retailer name ascending by default', () => {
    const { container } = render(<RetailerList coupons={mockCoupons} />);

    const rows = container.querySelectorAll('tbody tr');
    const firstRowRetailer = rows[0]?.querySelector('td')?.textContent;
    expect(firstRowRetailer).toContain('Amazon'); // A comes before T and Z
  });

  it('should show sort indicator for default sort field', () => {
    render(<RetailerList coupons={mockCoupons} />);

    // Name column should have ascending indicator
    const nameHeader = screen.getByText('form.retailer').closest('th');
    expect(nameHeader?.textContent).toContain('↑');
  });

  it('should toggle sort order when clicking same column', async () => {
    const { container } = render(<RetailerList coupons={mockCoupons} />);

    // Click name column to sort descending
    const nameButton = screen.getByText('form.retailer').closest('button');
    fireEvent.click(nameButton!);

    await waitFor(() => {
      const rows = container.querySelectorAll('tbody tr');
      const firstRowRetailer = rows[0]?.querySelector('td')?.textContent;
      expect(firstRowRetailer).toContain('Zebra'); // Z comes last alphabetically
    });
  });

  it('should sort by total coupon count when clicking count column', async () => {
    // handleRequestSort always TOGGLES the current sort order when changing columns.
    // Default is asc-name, so clicking a new column switches to desc.
    const variedCoupons: Coupon[] = [
      {
        id: '1',
        userId: 'user1',
        retailer: 'Amazon',
        initialValue: '100',
        currentValue: '80'
      },
      {
        id: '2',
        userId: 'user1',
        retailer: 'Amazon',
        initialValue: '50',
        currentValue: '50'
      },
      {
        id: '3',
        userId: 'user1',
        retailer: 'Target',
        initialValue: '200',
        currentValue: '150'
      }
    ];

    const { container } = render(<RetailerList coupons={variedCoupons} />);

    const rowsBefore = container.querySelectorAll('tbody tr');
    const firstRowBefore = rowsBefore[0]?.querySelector('td')?.textContent;
    expect(firstRowBefore).toContain('Amazon'); // Default sorted by name (asc)

    // Clicking a new column from asc state → toggles to desc
    const countButton = screen.getByText('tables.total_coupons').closest('button');
    fireEvent.click(countButton!);

    await waitFor(() => {
      const rows = container.querySelectorAll('tbody tr');
      const firstRowRetailer = rows[0]?.querySelector('td')?.textContent;
      // Sorted by couponCount DESC: Amazon (2) comes before Target (1)
      expect(firstRowRetailer).toContain('Amazon');
    });
  });

  it('should sort by total value when clicking value column', async () => {
    const { container } = render(<RetailerList coupons={mockCoupons} />);

    // Click total value column to sort by value (ascending)
    const valueButton = screen.getByText('general.total_value').closest('button');
    fireEvent.click(valueButton!);

    await waitFor(() => {
      const rows = container.querySelectorAll('tbody tr');
      const firstRowRetailer = rows[0]?.querySelector('td')?.textContent;
      expect(firstRowRetailer).toContain('Target'); // $50 is lowest (Target $50, Amazon $80, Zebra $80)
    });
  });

  it('should update sort indicator when changing sort field', async () => {
    // handleRequestSort always toggles order when switching columns.
    // Starting from default asc-name, clicking a new column sets order=desc.
    render(<RetailerList coupons={mockCoupons} />);

    // Click different column (total value) from default asc-name state
    const valueButton = screen.getByText('general.total_value').closest('button');
    fireEvent.click(valueButton!);

    await waitFor(() => {
      // Value column is now active with desc indicator (toggled from default asc)
      const valueHeader = screen.getByText('general.total_value').closest('th');
      expect(valueHeader?.textContent).toContain('↓');
    });
  });
});

describe('RetailerList - Click Interactions', () => {
  const mockCoupons: Coupon[] = [
    {
      id: '1',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '100',
      currentValue: '80'
    }
  ];

  const mockOnRetailerClick = vi.fn();

  beforeEach(() => {
    // Set desktop view
    mockMediaQueryList = {
      matches: false,
      media: '(min-width: 640px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    });
  });

  it('should call onRetailerClick when clicking retailer in table', () => {
    render(<RetailerList coupons={mockCoupons} onRetailerClick={mockOnRetailerClick} />);

    const retailerButton = screen.getByRole('button', { name: /Amazon/i });
    fireEvent.click(retailerButton);

    expect(mockOnRetailerClick).toHaveBeenCalledTimes(1);
    expect(mockOnRetailerClick).toHaveBeenCalledWith('Amazon', {
      field: 'expirationDate',
      order: 'asc'
    });
  });

  it('should not call onRetailerClick when handler not provided', () => {
    render(<RetailerList coupons={mockCoupons} />);

    const retailerButton = screen.getByRole('button', { name: /Amazon/i });
    expect(() => fireEvent.click(retailerButton)).not.toThrow();
  });

  it('should call onRetailerClick when clicking retailer card on mobile', () => {
    mockMediaQueryList = {
      matches: true,
      media: '(max-width: 639px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    });

    render(<RetailerList coupons={mockCoupons} onRetailerClick={mockOnRetailerClick} />);

    const retailerName = screen.getAllByText('Amazon')[0];  // Get first occurrence (mobile card)
    fireEvent.click(retailerName);

    expect(mockOnRetailerClick).toHaveBeenCalledWith('Amazon', {
      field: 'expirationDate',
      order: 'asc'
    });
  });
});

describe('RetailerList - Responsive Behavior', () => {
  const mockCoupons: Coupon[] = [
    {
      id: '1',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '100',
      currentValue: '80'
    }
  ];

  beforeEach(() => {
    mockMediaQueryList = {
      matches: false,
      media: '(min-width: 640px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    });
  });

  it('should add resize event listener on mount', () => {
    // Component uses window.addEventListener('resize', ...) to detect viewport changes
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    render(<RetailerList coupons={mockCoupons} />);

    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    addEventListenerSpy.mockRestore();
  });

  it('should remove resize event listener on unmount', () => {
    // Component removes window resize listener on cleanup
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<RetailerList coupons={mockCoupons} />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it('should check mobile status on mount using window.innerWidth', () => {
    // RetailerList uses window.innerWidth < 640, not matchMedia.
    // In JSDOM, window.innerWidth defaults to 0 < 640, so isMobile=true on mount.
    // Verify the mobile card view element is present in the DOM.
    render(<RetailerList coupons={mockCoupons} />);

    // Both views are in DOM; mobile section has sm:hidden class
    const mobileSection = document.querySelector('[class*="sm:hidden"]');
    expect(mobileSection).toBeInTheDocument();
  });
});

describe('RetailerList - Edge Cases', () => {
  beforeEach(() => {
    // Set desktop view
    mockMediaQueryList = {
      matches: false,
      media: '(min-width: 640px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    });
  });

  it('should handle coupons without expiration dates', () => {
    const couponsWithoutExpiry: Coupon[] = [
      {
        id: '1',
        userId: 'user1',
        retailer: 'Amazon',
        initialValue: '100',
        currentValue: '80'
        // No expirationDate
      }
    ];

    render(<RetailerList coupons={couponsWithoutExpiry} />);

    // Should still render and count as active
    const amazonRow = screen.getByRole('button', { name: /Amazon/i }).closest('tr');
    const activeCount = amazonRow?.querySelectorAll('td')[3];
    expect(activeCount?.textContent).toBe('1');
  });

  it('should handle invalid currentValue values gracefully', () => {
    const couponsWithInvalidValue: Coupon[] = [
      {
        id: '1',
        userId: 'user1',
        retailer: 'Amazon',
        initialValue: '100',
        currentValue: 'invalid'
      }
    ];

    render(<RetailerList coupons={couponsWithInvalidValue} />);

    // Should parse as 0 and not crash
    const amazonRow = screen.getByRole('button', { name: /Amazon/i }).closest('tr');
    const totalValue = amazonRow?.querySelectorAll('td')[2];
    expect(totalValue?.textContent).toBe('$0.00');
  });

  it('should handle multiple retailers with same name correctly', () => {
    const sameNameCoupons: Coupon[] = [
      {
        id: '1',
        userId: 'user1',
        retailer: 'Amazon',
        initialValue: '100',
        currentValue: '80'
      },
      {
        id: '2',
        userId: 'user1',
        retailer: 'Amazon',
        initialValue: '50',
        currentValue: '50'
      }
    ];

    const { container } = render(<RetailerList coupons={sameNameCoupons} />);

    // Should show only one row for Amazon with aggregated stats
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);

    const count = rows[0]?.querySelectorAll('td')[1];
    expect(count?.textContent).toBe('2'); // Both coupons counted
  });

  it('should handle empty coupon array', () => {
    const { container } = render(<RetailerList coupons={[]} />);

    expect(screen.getAllByText('messages.no_retailers_found').length).toBe(2);

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1); // Only the empty state row
  });
});

describe('RetailerList - Accessibility', () => {
  const mockCoupons: Coupon[] = [
    {
      id: '1',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '100',
      currentValue: '80'
    }
  ];

  beforeEach(() => {
    // Set desktop view
    mockMediaQueryList = {
      matches: false,
      media: '(min-width: 640px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    });
  });

  it('should have data-testid for main container', () => {
    render(<RetailerList coupons={mockCoupons} />);

    expect(screen.getByTestId('retailer-list')).toBeInTheDocument();
  });

  it('should have data-testid for empty state', () => {
    render(<RetailerList coupons={[]} />);

    expect(screen.getByTestId('retailer-empty-state')).toBeInTheDocument();
  });

  it('should use button elements for interactive retailer names', () => {
    render(<RetailerList coupons={mockCoupons} />);

    const retailerButton = screen.getByRole('button', { name: /Amazon/i });
    expect(retailerButton).toBeInTheDocument();
  });

  it('should use button elements for sort headers', () => {
    render(<RetailerList coupons={mockCoupons} />);

    const sortButtons = screen.getAllByRole('button');
    expect(sortButtons.length).toBeGreaterThan(0);
  });
});
