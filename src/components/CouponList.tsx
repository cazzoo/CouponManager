import React, { useState, useEffect, ChangeEvent } from 'react';
import { Edit, Copy, CircleX, CreditCard, X } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, es, fr, de } from 'date-fns/locale';
import { useLanguage } from '../services/LanguageContext';
import { Coupon, SortConfig } from '../types';

// Define locale map for date formatting
const localeMap: Record<string, Locale> = {
  en: enUS,
  es: es,
  fr: fr,
  de: de
};

interface CouponListProps {
  coupons: Coupon[];
  onUpdateCoupon: (couponId: string, updatedData: Partial<Coupon>) => void;
  onMarkAsUsed: (couponId: string, newValue?: string) => void;
  retailerFilter?: string;
  setRetailerFilter?: (retailer: string) => void;
  defaultSort?: SortConfig;
}

interface FilterState {
  retailer: string;
  minAmount: string;
  maxAmount: string;
}

type SortOrder = 'asc' | 'desc';

const CouponList: React.FC<CouponListProps> = ({ 
  coupons, 
  onUpdateCoupon, 
  onMarkAsUsed, 
  retailerFilter, 
  setRetailerFilter, 
  defaultSort 
}) => {
  const { t, language } = useLanguage();
  
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      return mediaQuery?.matches ?? false;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    if (!mediaQuery) return;

    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);
  
  // State management
  const [filters, setFilters] = useState<FilterState>({
    retailer: '',
    minAmount: '',
    maxAmount: '',
  });
  const [showExpired, setShowExpired] = useState<boolean>(false);
  const [orderBy, setOrderBy] = useState<string>(defaultSort?.field || 'retailer');
  const [order, setOrder] = useState<SortOrder>(defaultSort?.order || 'asc');
  const [copiedText, setCopiedText] = useState<string>('');
  const [partialUseDialogOpen, setPartialUseDialogOpen] = useState<boolean>(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [partialUseAmount, setPartialUseAmount] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  
  // Function to check if a coupon is expired
  const isExpired = (expirationDate?: string): boolean => {
    if (!expirationDate) return false;
    
    // Add debugging
    const expDate = new Date(expirationDate);
    const today = new Date();
    const isExp = expDate < today;
    console.log(`Expiration check - Date: ${expirationDate}, Parsed: ${expDate}, Today: ${today}, IsExpired: ${isExp}`);
    
    return isExp;
  };
  
  // Function to check if a coupon is used (current value is 0)
  const isUsed = (currentValue: string): boolean => {
    return currentValue === '0';
  };
  
  const handleCopyToClipboard = (text: string): void => {
    if (text && text !== t('general.not_applicable')) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedText(text);
          setSnackbarOpen(true);
          setTimeout(() => setCopiedText(''), 2000);
        })
        .catch(err => console.error('Failed to copy text: ', err));
    }
  };

  const handleSnackbarClose = (event: React.SyntheticEvent | Event, reason?: string): void => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      retailer: retailerFilter || ''
    }));
  }, [retailerFilter]);

  const formatDate = (date?: string): string => {
    if (!date) return t('general.not_applicable');
    
    try {
      // Get date format based on locale
      const dateFormat = language === 'en' ? 'MM/dd/yyyy' : 
                          language === 'de' || language === 'fr' ? 'dd.MM.yyyy' : 
                          'dd/MM/yyyy';
      
      return format(new Date(date), dateFormat, { 
        locale: localeMap[language] || enUS 
      });
    } catch (error) {
      return t('general.invalid_date');
    }
  };

  const handleRequestSort = (property: string): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShowExpiredChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setShowExpired(event.target.checked);
  };

  const handlePartialUseOpen = (couponId: string): void => {
    setSelectedCouponId(couponId);
    setPartialUseAmount('');
    setPartialUseDialogOpen(true);
  };

  const handlePartialUseClose = (): void => {
    setPartialUseDialogOpen(false);
    setSelectedCouponId(null);
    setPartialUseAmount('');
  };

  const handlePartialUseSubmit = (): void => {
    if (!selectedCouponId || !partialUseAmount) return;
    
    const coupon = coupons.find(c => c.id === selectedCouponId);
    if (!coupon) return;
    
    const currentValueNum = parseFloat(coupon.currentValue);
    const partialUseAmountNum = parseFloat(partialUseAmount);
    
    if (partialUseAmountNum <= 0 || partialUseAmountNum > currentValueNum) return;
    
    const newValue = (currentValueNum - partialUseAmountNum).toFixed(2);
    onMarkAsUsed(selectedCouponId, newValue);
    handlePartialUseClose();
  };

  // Filter coupons based on user filters
  const filteredCoupons = coupons
    .filter(coupon => {
      const matchesRetailer = !filters.retailer || coupon.retailer.toLowerCase().includes(filters.retailer.toLowerCase());
      const matchesMinAmount = !filters.minAmount || parseFloat(coupon.currentValue) >= parseFloat(filters.minAmount);
      const matchesMaxAmount = !filters.maxAmount || parseFloat(coupon.currentValue) <= parseFloat(filters.maxAmount);
      const matchesExpiration = showExpired || !isExpired(coupon.expirationDate);
      return matchesRetailer && matchesMinAmount && matchesMaxAmount && matchesExpiration;
    });
  
  // Log for debugging
  console.log('CouponList - Original coupons:', coupons);
  console.log('CouponList - Original coupons length:', coupons.length);
  console.log('CouponList - Filtered coupons:', filteredCoupons);
  console.log('CouponList - Filtered coupons length:', filteredCoupons.length);
  
  // Group coupons by expiration and usage status
  const nonExpiredActiveCoupons = filteredCoupons.filter(coupon => !isExpired(coupon.expirationDate) && !isUsed(coupon.currentValue));
  const nonExpiredUsedCoupons = filteredCoupons.filter(coupon => !isExpired(coupon.expirationDate) && isUsed(coupon.currentValue));
  const expiredCoupons = filteredCoupons.filter(coupon => isExpired(coupon.expirationDate));
  
  // Log grouped coupons for debugging
  console.log('CouponList - Non-expired active coupons:', nonExpiredActiveCoupons.length);
  console.log('CouponList - Non-expired used coupons:', nonExpiredUsedCoupons.length);
  console.log('CouponList - Expired coupons:', expiredCoupons.length);
  
  // Sort each group separately
  const sortCoupons = (couponsToSort: Coupon[]): Coupon[] => {
    return [...couponsToSort].sort((a, b) => {
      const isAsc = order === 'asc';
      switch (orderBy) {
        case 'retailer':
          return isAsc ? a.retailer.localeCompare(b.retailer) : b.retailer.localeCompare(a.retailer);
        case 'amount':
          return isAsc ? parseFloat(a.currentValue) - parseFloat(b.currentValue) : parseFloat(b.currentValue) - parseFloat(a.currentValue);
        case 'expirationDate':
          if (!a.expirationDate) return isAsc ? 1 : -1;
          if (!b.expirationDate) return isAsc ? -1 : 1;
          return isAsc ? new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime() : 
                        new Date(b.expirationDate).getTime() - new Date(a.expirationDate).getTime();
        default:
          return 0;
      }
    });
  };
  
  // Sort each group and combine them with active non-expired first, then used non-expired, then expired
  const sortedNonExpiredActiveCoupons = sortCoupons(nonExpiredActiveCoupons);
  const sortedNonExpiredUsedCoupons = sortCoupons(nonExpiredUsedCoupons);
  const sortedExpiredCoupons = sortCoupons(expiredCoupons);
  
  // Create a Map to ensure unique coupon IDs and prevent duplicate keys
  const couponMap = new Map<string, Coupon>();
  
  // Add coupons to the map in priority order
  sortedNonExpiredActiveCoupons.forEach(coupon => couponMap.set(coupon.id, coupon));
  sortedNonExpiredUsedCoupons.forEach(coupon => couponMap.set(coupon.id, coupon));
  sortedExpiredCoupons.forEach(coupon => couponMap.set(coupon.id, coupon));
  
  // Convert the map values back to an array
  const groupedCoupons = Array.from(couponMap.values());

  // Render the component - rendering logic will be preserved from the original JSX
  return (
    <div data-testid="coupon-list" className="w-full">
      {/* Filters Section */}
      <div className="card w-full mb-2 p-4 border border-base-300 bg-base-100">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
            <div className="md:col-span-3">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">{t('form.retailer')}</span>
                </label>
                <input
                  type="text"
                  name="retailer"
                  placeholder={t('form.retailer')}
                  className="input input-bordered input-sm w-full"
                  value={filters.retailer}
                  onChange={handleFilterChange}
                  data-testid="filter-retailer"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">{t('filter.min_amount')}</span>
                </label>
                <input
                  type="number"
                  name="minAmount"
                  placeholder={t('filter.min_amount')}
                  className="input input-bordered input-sm w-full"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  data-testid="filter-min-amount"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">{t('filter.max_amount')}</span>
                </label>
                <input
                  type="number"
                  name="maxAmount"
                  placeholder={t('filter.max_amount')}
                  className="input input-bordered input-sm w-full"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  data-testid="filter-max-amount"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{t('filter.show_expired')}</span>
                  <input
                    type="checkbox"
                    name="showExpired"
                    className="checkbox checkbox-sm"
                    checked={showExpired}
                    onChange={handleShowExpiredChange}
                    data-testid="filter-show-expired"
                  />
                </label>
              </div>
            </div>
            {retailerFilter && (
              <div className="md:col-span-2">
                <button 
                  className="btn btn-outline btn-sm w-full"
                  onClick={() => setRetailerFilter && setRetailerFilter('')}
                >
                  <X className="w-4 h-4 mr-1" />
                  {t('filter.clear_filters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* No coupons message */}
      {groupedCoupons.length === 0 && (
        <div className="text-center my-8" data-testid="coupon-empty-state">
          <p className="text-lg">{t('messages.no_coupons_found')}</p>
        </div>
      )}

      {/* Render coupons in card or table view based on screen size */}
      {groupedCoupons.length > 0 && (
        isMobile ? (
          // Mobile card view
          <div className="w-full">
            <div className="grid grid-cols-1 gap-2">
              {groupedCoupons.map((coupon) => (
                <div key={`card-${coupon.id}`}>
                  <div 
                    className={`card border border-base-300 bg-base-100 mb-2 ${
                      isExpired(coupon.expirationDate) ? 'bg-error/10' : 
                      isUsed(coupon.currentValue) ? 'bg-neutral/10' : ''
                    }`}
                  >
                    <div className="card-body p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="card-title text-lg">
                          {coupon.retailer}
                        </h3>
                        <div className="flex gap-1">
                          {isExpired(coupon.expirationDate) && (
                            <div className="badge badge-error badge-sm">
                              {t('status.expired')}
                            </div>
                          )}
                          {isUsed(coupon.currentValue) && (
                            <div className="badge badge-neutral badge-sm">
                              {t('status.used')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-base-content/70">
                        {t('form.current_value')}: <strong>${coupon.currentValue}</strong>
                        {coupon.initialValue !== coupon.currentValue && (
                          <span> ({t('form.initial_value')}: ${coupon.initialValue})</span>
                        )}
                      </p>
                      
                      <p className="text-sm text-base-content/70">
                        {t('tables.expires')}: {formatDate(coupon.expirationDate)}
                      </p>
                      
                      {/* Action buttons for mobile */}
                      <div className="flex justify-end mt-2">
                        {/* Action buttons here */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Desktop table view
          <div className="overflow-x-auto w-full">
            <table className="table table-zebra table-compact table-nowrap w-full min-w-full">
              <thead>
                <tr>
                  <th>
                    <button
                      className={`btn btn-ghost btn-xs font-bold ${orderBy === 'retailer' ? 'text-primary' : ''}`}
                      onClick={() => handleRequestSort('retailer')}
                      data-testid="sort-retailer"
                    >
                      {t('form.retailer')}
                      {orderBy === 'retailer' && (
                        <span className="ml-1">
                          {order === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th>
                    <button
                      className={`btn btn-ghost btn-xs font-bold ${orderBy === 'amount' ? 'text-primary' : ''}`}
                      onClick={() => handleRequestSort('amount')}
                      data-testid="sort-value"
                    >
                      {t('form.current_value')}
                      {orderBy === 'amount' && (
                        <span className="ml-1">
                          {order === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th>
                    <button
                      className={`btn btn-ghost btn-xs font-bold ${orderBy === 'expirationDate' ? 'text-primary' : ''}`}
                      onClick={() => handleRequestSort('expirationDate')}
                    >
                      {t('tables.expires')}
                      {orderBy === 'expirationDate' && (
                        <span className="ml-1">
                          {order === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th>{t('form.activation_code')}</th>
                  <th>{t('form.pin')}</th>
                  <th className="text-right">{t('tables.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {groupedCoupons.map((coupon) => (
                  <tr 
                    key={`table-${coupon.id}`}
                    className={`${
                      isExpired(coupon.expirationDate) ? 'bg-error/10' : 
                      isUsed(coupon.currentValue) ? 'bg-neutral/10' : ''
                    }`}
                  >
                    <td>
                      <div className="flex items-center">
                        {coupon.retailer}
                        {isExpired(coupon.expirationDate) && (
                          <div className="badge badge-error badge-sm ml-2">
                            {t('status.expired')}
                          </div>
                        )}
                        {isUsed(coupon.currentValue) && (
                          <div className="badge badge-neutral badge-sm ml-1">
                            {t('status.used')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <span className="font-medium">
                          ${coupon.currentValue}
                        </span>
                        {coupon.initialValue !== coupon.currentValue && (
                          <div className="text-sm text-base-content/50">
                            ({t('form.initial_value')}: ${coupon.initialValue})
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(coupon.expirationDate)}</td>
                    <td>
                      <div className="flex items-center">
                        <span className="mr-2">
                          {coupon.activationCode || t('general.not_applicable')}
                        </span>
                        {coupon.activationCode && (
                          <div className="tooltip" data-tip={t('actions.copy')}>
                            <button 
                              className="btn btn-ghost btn-xs btn-circle"
                              onClick={() => handleCopyToClipboard(coupon.activationCode || '')}
                              aria-label={t('actions.copy')}
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <span className="mr-2">
                          {coupon.pin || t('general.not_applicable')}
                        </span>
                        {coupon.pin && (
                          <div className="tooltip" data-tip={t('actions.copy')}>
                            <button 
                              className="btn btn-ghost btn-xs btn-circle"
                              onClick={() => handleCopyToClipboard(coupon.pin || '')}
                              aria-label={t('actions.copy')}
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="tooltip" data-tip={t('actions.edit')}>
                        <button 
                          className="btn btn-ghost btn-xs btn-circle mr-1"
                          onClick={() => {
                            const updatedCoupon = { ...coupon };
                            onUpdateCoupon(coupon.id, updatedCoupon);
                          }}
                          aria-label={t('actions.edit')}
                          disabled={isExpired(coupon.expirationDate) || isUsed(coupon.currentValue)}
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                      {!isUsed(coupon.currentValue) && !isExpired(coupon.expirationDate) && (
                        <>
                          <div className="tooltip" data-tip={t('actions.use_partially')}>
                            <button 
                              className="btn btn-ghost btn-xs btn-circle mr-1"
                              onClick={() => handlePartialUseOpen(coupon.id)}
                              aria-label={t('actions.use_partially')}
                            >
                              <CreditCard className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="tooltip" data-tip={t('actions.mark_as_used')}>
                            <button 
                              className="btn btn-ghost btn-xs btn-circle"
                              onClick={() => onMarkAsUsed(coupon.id)}
                              aria-label={t('actions.mark_as_used')}
                            >
                              <CircleX className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Partial use dialog */}
      <div className={`modal ${partialUseDialogOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">{t('dialog.partial_use_title')}</h3>
          <p className="py-4">
            {t('dialog.partial_use_description')}
          </p>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">{t('form.amount')}</span>
            </label>
            <input
              type="number"
              id="partialUseAmount"
              className="input input-bordered w-full"
              value={partialUseAmount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPartialUseAmount(e.target.value)}
              autoFocus
            />
          </div>
          <div className="modal-action">
            <button 
              className="btn btn-ghost"
              onClick={handlePartialUseClose}
            >
              {t('actions.cancel')}
            </button>
            <button 
              className="btn btn-primary"
              onClick={handlePartialUseSubmit}
            >
              {t('actions.apply')}
            </button>
          </div>
        </div>
      </div>

      {/* Copy to clipboard notification */}
      {snackbarOpen && (
        <div className="toast toast-end">
          <div className="alert alert-success">
            <span>{t('notifications.copied_to_clipboard')}: {copiedText}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponList; 