import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RetailerList from '../../components/RetailerList';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the useLanguage hook to avoid "useLanguage must be used within a LanguageProvider" error
vi.mock('../../services/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => key,
    language: 'en',
    changeLanguage: vi.fn(),
    getSupportedLanguages: () => ['en', 'es', 'fr', 'de']
  })
}));

// Mock theme for testing
const theme = createTheme();

// Wrapper component to provide theme context
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('RetailerList Component', () => {
  const mockCoupons = [
    {
      id: 1,
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '50',
      expirationDate: new Date('2025-12-31'),
      activationCode: 'AMZN2024',
      pin: '1234'
    },
    {
      id: 2,
      retailer: 'Amazon',
      initialValue: '25',
      currentValue: '25',
      expirationDate: new Date('2025-06-30'),
      activationCode: 'AMZN25',
      pin: '5678'
    },
    {
      id: 3,
      retailer: 'Target',
      initialValue: '75',
      currentValue: '75',
      expirationDate: new Date('2025-09-30'),
      activationCode: 'TGT75FALL',
      pin: '4321'
    },
    {
      id: 4,
      retailer: 'Target',
      initialValue: '30',
      currentValue: '0', // Used coupon
      expirationDate: new Date('2025-08-15'),
      activationCode: 'TGT30SUMMER',
      pin: '8765'
    },
    {
      id: 5,
      retailer: 'Best Buy',
      initialValue: '100',
      currentValue: '100',
      expirationDate: new Date('2023-12-31'), // Expired coupon
      activationCode: 'BB100DEC',
      pin: '5678'
    }
  ];

  const mockOnRetailerClick = vi.fn();

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <RetailerList 
          coupons={mockCoupons} 
          onRetailerClick={mockOnRetailerClick} 
        />
      </TestWrapper>
    );
    
    // Check if the component renders with retailer names
    expect(screen.getAllByText(/Amazon/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Target/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Best Buy/i).length).toBeGreaterThan(0);
  });

  it('displays correct statistics for each retailer', () => {
    render(
      <TestWrapper>
        <RetailerList 
          coupons={mockCoupons} 
          onRetailerClick={mockOnRetailerClick} 
        />
      </TestWrapper>
    );
    
    // Check Amazon stats (2 coupons, both active, total value $75)
    expect(screen.getByText(/Amazon/i).closest('tr')).toHaveTextContent('2'); // Coupon count
    expect(screen.getByText(/Amazon/i).closest('tr')).toHaveTextContent('75.00'); // Total value
    
    // Check Target stats (2 coupons, 1 active and 1 used, active value $75)
    const targetRow = screen.getByText(/Target/i).closest('tr');
    expect(targetRow).toHaveTextContent('2'); // Coupon count
    expect(targetRow).toHaveTextContent('75.00'); // Active value
    
    // Check Best Buy stats (1 coupon, expired, value $100)
    const bestBuyRow = screen.getByText(/Best Buy/i).closest('tr');
    expect(bestBuyRow).toHaveTextContent('1'); // Coupon count
    expect(bestBuyRow).toHaveTextContent('0'); // Active count (should be 0 since it's expired)
    expect(bestBuyRow).toHaveTextContent('1'); // Expired count
  });

  it('calls onRetailerClick when a retailer is clicked', () => {
    render(
      <TestWrapper>
        <RetailerList 
          coupons={mockCoupons} 
          onRetailerClick={mockOnRetailerClick} 
        />
      </TestWrapper>
    );
    
    // Find and click on the Amazon retailer
    const amazonRetailer = screen.getByText(/Amazon/i);
    fireEvent.click(amazonRetailer);
    
    // Check that onRetailerClick was called with the correct retailer name
    expect(mockOnRetailerClick).toHaveBeenCalledWith('Amazon', { field: 'expirationDate', order: 'asc' });
  });

  it('handles empty coupons array gracefully', () => {
    render(
      <TestWrapper>
        <RetailerList 
          coupons={[]} 
          onRetailerClick={mockOnRetailerClick} 
        />
      </TestWrapper>
    );
    
    // Check that a message is displayed when there are no retailers
    expect(screen.getByText('messages.no_retailers_found')).toBeInTheDocument();
  });

  it('correctly calculates active vs expired coupon statistics', () => {
    render(
      <TestWrapper>
        <RetailerList 
          coupons={mockCoupons} 
          onRetailerClick={mockOnRetailerClick} 
        />
      </TestWrapper>
    );
    
    // Best Buy has 1 expired coupon
    const bestBuyRow = screen.getByText(/Best Buy/i).closest('tr');
    expect(bestBuyRow).toHaveTextContent('0'); // Active count
    expect(bestBuyRow).toHaveTextContent('1'); // Expired count
    
    // Target has 1 active and 1 used coupon (used counts as expired)
    const targetRow = screen.getByText(/Target/i).closest('tr');
    expect(targetRow).toHaveTextContent('1'); // Active count
    expect(targetRow).toHaveTextContent('1'); // Expired/used count
  });
});