import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the components directly before import in App.jsx
vi.mock('../components/CouponList', () => ({
  default: () => <div data-testid="coupon-list">CouponList Component</div>
}));

vi.mock('../components/RetailerList', () => ({
  default: () => <div data-testid="retailer-list">RetailerList Component</div>
}));

vi.mock('../components/AddCouponForm', () => ({
  default: ({ open, coupon }) => (
    <div 
      data-testid="add-coupon-form" 
      data-open={open}
      data-editing={coupon ? 'true' : 'false'}
    >
      AddCouponForm Component
    </div>
  )
}));

vi.mock('../components/LanguageSelector', () => ({
  default: () => <div data-testid="language-selector">LanguageSelector Component</div>
}));

// Mock services
vi.mock('../services/CouponService', () => ({
  couponService: {
    getAllCoupons: vi.fn(() => [
      { id: 1, retailer: 'TestRetailer', code: 'CODE1', expirationDate: '2023-12-31' },
      { id: 2, retailer: 'AnotherRetailer', code: 'CODE2', expirationDate: '2024-01-15' }
    ]),
  },
}));

vi.mock('../services/LanguageContext', () => ({
  useLanguage: vi.fn(() => ({
    t: (key) => key,
    language: 'en',
    changeLanguage: vi.fn(),
  })),
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App isDarkMode={false} onThemeChange={vi.fn()} />);
    expect(screen.getByText('app.coupon_manager')).toBeInTheDocument();
  });

  it('displays both tabs', () => {
    render(<App isDarkMode={false} onThemeChange={vi.fn()} />);
    expect(screen.getByText('app.coupons')).toBeInTheDocument();
    expect(screen.getByText('app.retailers')).toBeInTheDocument();
  });

  it('shows CouponList by default', () => {
    render(<App isDarkMode={false} onThemeChange={vi.fn()} />);
    expect(screen.getByTestId('coupon-list')).toBeInTheDocument();
    expect(screen.queryByTestId('retailer-list')).not.toBeInTheDocument();
  });

  it('switches to RetailerList when Retailers tab is clicked', async () => {
    const user = userEvent.setup();
    render(<App isDarkMode={false} onThemeChange={vi.fn()} />);
    
    // Click on the Retailers tab
    const retailersTab = screen.getByText('app.retailers');
    await user.click(retailersTab);
    
    // Check that RetailerList is now shown
    await waitFor(() => {
      expect(screen.getByTestId('retailer-list')).toBeInTheDocument();
      expect(screen.queryByTestId('coupon-list')).not.toBeInTheDocument();
    });
  });

  it('opens AddCouponForm when Add Coupon button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<App isDarkMode={false} onThemeChange={vi.fn()} />);
    
    // Initially the form should not be open
    expect(screen.getByTestId('add-coupon-form')).toHaveAttribute('data-open', 'false');
    
    // Click on the Add Coupon button
    const addButton = screen.getByText('app.add_coupon');
    await user.click(addButton);
    
    // Form should now be open
    expect(screen.getByTestId('add-coupon-form')).toHaveAttribute('data-open', 'true');
  });

  it('toggles theme when theme button is clicked', async () => {
    const user = userEvent.setup();
    const onThemeChangeMock = vi.fn();
    render(<App isDarkMode={false} onThemeChange={onThemeChangeMock} />);
    
    // Find and click the theme toggle button (using a more specific selector)
    const themeButton = screen.getByRole('button', { 
      name: '' // The button doesn't have a name, but is the only IconButton in the toolbar
    });
    await user.click(themeButton);
    
    // Check that the theme change function was called
    expect(onThemeChangeMock).toHaveBeenCalledWith(true);
  });

  it('includes LanguageSelector in the app bar', () => {
    render(<App isDarkMode={false} onThemeChange={vi.fn()} />);
    expect(screen.getByTestId('language-selector')).toBeInTheDocument();
  });
}); 