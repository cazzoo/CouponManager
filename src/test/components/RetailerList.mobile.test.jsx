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

// Mock theme for testing with mobile breakpoint
const theme = createTheme();

// Mock the theme and useMediaQuery to simulate mobile view
vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useMediaQuery: () => true, // Always return true to simulate mobile view
    useTheme: () => ({
      ...actual.createTheme(),
      breakpoints: {
        down: () => true,
        up: () => false
      }
    })
  };
});

// Wrapper component to provide theme context
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('RetailerList Component (Mobile View)', () => {
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

  it('renders retailer information', () => {
    render(
      <TestWrapper>
        <RetailerList 
          coupons={mockCoupons} 
          onRetailerClick={mockOnRetailerClick} 
        />
      </TestWrapper>
    );
    
    // Check that retailer information is displayed
    expect(screen.getAllByText(/Amazon/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Target/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Best Buy/i).length).toBeGreaterThan(0);
  });

  it('displays correct statistics for retailers', () => {
    render(
      <TestWrapper>
        <RetailerList 
          coupons={mockCoupons} 
          onRetailerClick={mockOnRetailerClick} 
        />
      </TestWrapper>
    );
    
    // Check for mobile-specific UI elements
    const amazonCard = screen.getAllByText('Amazon')[0].closest('.MuiCard-root');
    expect(amazonCard).toContainHTML('tables.total_coupons');
    expect(amazonCard).toContainHTML('general.total_value');
    
    // Check specific retailer statistics in the cards
    const amazonCardContent = amazonCard.textContent;
    expect(amazonCardContent).toContain('2'); // Total coupons
    expect(amazonCardContent).toContain('75.00'); // Total value
    
    const targetCard = screen.getAllByText('Target')[0].closest('.MuiCard-root');
    expect(targetCard).toHaveTextContent('2'); // Total coupons
    expect(targetCard).toHaveTextContent('75.00'); // Active value
    
    const bestBuyCard = screen.getAllByText('Best Buy')[0].closest('.MuiCard-root');
    expect(bestBuyCard).toHaveTextContent('1'); // Total coupons
    expect(bestBuyCard).toHaveTextContent('0'); // Active count
    expect(bestBuyCard).toHaveTextContent('1'); // Expired count
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
    
    // Find and click on the Amazon retailer box
    const amazonBox = screen.getAllByText('Amazon')[0].closest('[class*="MuiBox-root"]');
    fireEvent.click(amazonBox);
    
    // Check that onRetailerClick was called with the correct retailer name
    expect(mockOnRetailerClick).toHaveBeenCalledWith('Amazon', { field: 'expirationDate', order: 'asc' });
  });

  it('displays chips for active and expired counts', () => {
    render(
      <TestWrapper>
        <RetailerList 
          coupons={mockCoupons} 
          onRetailerClick={mockOnRetailerClick} 
        />
      </TestWrapper>
    );
    
    // Check that chips are rendered for counts
    const activeChips = screen.getAllByText('2');
    expect(activeChips.length).toBeGreaterThan(0);
    
    const expiredChips = screen.getAllByText('1');
    expect(expiredChips.length).toBeGreaterThan(0);
  });

  it('handles empty coupons array gracefully in mobile view', () => {
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
});