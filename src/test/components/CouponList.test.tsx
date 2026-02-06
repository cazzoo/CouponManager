import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CouponList from '../../components/CouponList';
import { LanguageProvider } from '../../services/LanguageContext';
import type { Coupon } from '../../types';

// Mock translations
const mockTranslations = {
  'form.retailer': 'Retailer',
  'form.current_value': 'Current Value',
  'form.initial_value': 'Initial Value',
  'tables.expires': 'Expires',
  'tables.actions': 'Actions',
  'actions.edit': 'Edit',
  'actions.use_partially': 'Use Partially',
  'actions.mark_as_used': 'Mark as Used',
  'actions.copy': 'Copy',
  'actions.cancel': 'Cancel',
  'actions.apply': 'Apply',
  'form.activation_code': 'Activation Code',
  'form.pin': 'PIN',
  'filter.min_amount': 'Min Amount',
  'filter.max_amount': 'Max Amount',
  'filter.show_expired': 'Show Expired',
  'filter.clear_filters': 'Clear Filters',
  'status.expired': 'Expired',
  'status.used': 'Used',
  'dialog.partial_use_title': 'Use Partially',
  'dialog.partial_use_description': 'Enter amount to use',
  'form.amount': 'Amount',
  'messages.no_coupons_found': 'No coupons found',
  'general.not_applicable': 'N/A',
  'notifications.copied_to_clipboard': 'Copied to clipboard'
};

// Mock language context
vi.mock('../../services/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key: string) => (mockTranslations as Record<string, string>)[key] || key,
    changeLanguage: vi.fn()
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('CouponList - Role Based Access Control', () => {
  const mockCoupons: Coupon[] = [
    {
      id: '1',
      userId: 'user-1',
      retailer: 'Amazon',
      initialValue: '50.00',
      currentValue: '50.00',
      expirationDate: '2027-12-31',
      activationCode: 'AMZN-123',
      pin: '1234',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    },
    {
      id: '2',
      userId: 'user-1',
      retailer: 'Target',
      initialValue: '25.00',
      currentValue: '0.00',
      expirationDate: '2027-06-30',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }
  ];

  const mockOnUpdateCoupon = vi.fn();
  const mockOnEditCoupon = vi.fn();
  const mockOnMarkAsUsed = vi.fn();

  const renderCouponList = (userRole: string | null = 'user') => {
    return render(
      <LanguageProvider>
        <CouponList
          coupons={mockCoupons}
          onUpdateCoupon={mockOnUpdateCoupon}
          onEditCoupon={mockOnEditCoupon}
          onMarkAsUsed={mockOnMarkAsUsed}
          userRole={userRole}
        />
      </LanguageProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Demo User Permissions', () => {
    it('should render coupons for demo users', () => {
      renderCouponList('demo');

      expect(screen.getByText('Amazon')).toBeInTheDocument();
      expect(screen.getByText('Target')).toBeInTheDocument();
    });

    it('should hide Edit button for demo users', () => {
      renderCouponList('demo');

      const editButtons = screen.queryAllByLabelText('Edit');
      expect(editButtons).toHaveLength(0);
    });

    it('should hide Use Partially button for demo users', () => {
      renderCouponList('demo');

      const usePartiallyButtons = screen.queryAllByLabelText('Use Partially');
      expect(usePartiallyButtons).toHaveLength(0);
    });

    it('should hide Mark as Used button for demo users', () => {
      renderCouponList('demo');

      const markAsUsedButtons = screen.queryAllByLabelText('Mark as Used');
      expect(markAsUsedButtons).toHaveLength(0);
    });

    it('should show Copy buttons for demo users (read-only operation)', () => {
      renderCouponList('demo');

      // Copy buttons for activation code and PIN should be visible
      const copyButtons = screen.queryAllByLabelText(/Copy/);
      expect(copyButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Regular User Permissions', () => {
    it('should render coupons for regular users', () => {
      renderCouponList('user');

      expect(screen.getByText('Amazon')).toBeInTheDocument();
      expect(screen.getByText('Target')).toBeInTheDocument();
    });

    it('should show Edit button for regular users on active coupons', () => {
      renderCouponList('user');

      const editButtons = screen.queryAllByLabelText('Edit');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('should show Use Partially button for regular users on active coupons', () => {
      renderCouponList('user');

      const usePartiallyButtons = screen.queryAllByLabelText('Use Partially');
      expect(usePartiallyButtons.length).toBeGreaterThan(0);
    });

    it('should show Mark as Used button for regular users on active coupons', () => {
      renderCouponList('user');

      const markAsUsedButtons = screen.queryAllByLabelText('Mark as Used');
      expect(markAsUsedButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Manager Permissions', () => {
    it('should render coupons for managers', () => {
      renderCouponList('manager');

      expect(screen.getByText('Amazon')).toBeInTheDocument();
      expect(screen.getByText('Target')).toBeInTheDocument();
    });

    it('should show Edit button for managers', () => {
      renderCouponList('manager');

      const editButtons = screen.queryAllByLabelText('Edit');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('should show Use Partially button for managers', () => {
      renderCouponList('manager');

      const usePartiallyButtons = screen.queryAllByLabelText('Use Partially');
      expect(usePartiallyButtons.length).toBeGreaterThan(0);
    });

    it('should show Mark as Used button for managers', () => {
      renderCouponList('manager');

      const markAsUsedButtons = screen.queryAllByLabelText('Mark as Used');
      expect(markAsUsedButtons.length).toBeGreaterThan(0);
    });
  });

  describe('No User Role (null)', () => {
    it('should render coupons when userRole is null', () => {
      renderCouponList(null);

      expect(screen.getByText('Amazon')).toBeInTheDocument();
    });

    it('should show action buttons when userRole is null (treats as regular user)', () => {
      renderCouponList(null);

      const editButtons = screen.queryAllByLabelText('Edit');
      expect(editButtons.length).toBeGreaterThan(0);
    });
  });
});
