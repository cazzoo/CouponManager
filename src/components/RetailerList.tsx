import React, { useState, useEffect } from 'react';
import { useLanguage } from '../services/LanguageContext';
import { Coupon, RetailerStat, SortConfig } from '../types';

interface RetailerListProps {
  coupons: Coupon[];
  onRetailerClick?: (retailer: string, sort: SortConfig) => void;
}

type Order = 'asc' | 'desc';

const RetailerList: React.FC<RetailerListProps> = ({ coupons, onRetailerClick }) => {
  const { t } = useLanguage();
  const [orderBy, setOrderBy] = useState<keyof RetailerStat>('name');
  const [order, setOrder] = useState<Order>('asc');
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint in Tailwind
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRetailerClick = (retailer: string): void => {
    if (onRetailerClick) {
      onRetailerClick(retailer, { field: 'expirationDate', order: 'asc' });
    }
  };

  const handleRequestSort = (property: keyof RetailerStat): void => {
    const isAsc = order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Function to check if a coupon is expired
  const isExpired = (expirationDate?: string): boolean => {
    if (!expirationDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    return new Date(expirationDate) < today;
  };
  
  // Function to check if a coupon is used (current value is 0)
  const isUsed = (currentValue: string): boolean => {
    return currentValue === '0';
  };

  // Group coupons by retailer and calculate statistics for active and expired coupons
  const retailerStats: Record<string, RetailerStat> = coupons.reduce((acc: Record<string, RetailerStat>, coupon: Coupon) => {
    if (!acc[coupon.retailer]) {
      acc[coupon.retailer] = {
        name: coupon.retailer,
        couponCount: 0,
        totalValue: 0,
        activeCouponCount: 0,
        activeTotalValue: 0,
        expiredCouponCount: 0,
        expiredTotalValue: 0
      };
    }
    
    // Get coupon value from currentValue property
    const couponValue = parseFloat(coupon.currentValue) || 0;
    
    // Update total counts
    acc[coupon.retailer].couponCount++;
    acc[coupon.retailer].totalValue += couponValue;
    
    // Update active/expired/used counts based on expiration date and usage status
    if (isExpired(coupon.expirationDate)) {
      acc[coupon.retailer].expiredCouponCount++;
      acc[coupon.retailer].expiredTotalValue += couponValue;
    } else if (isUsed(coupon.currentValue)) {
      // Used coupons are not counted as active
      acc[coupon.retailer].expiredCouponCount++;
      acc[coupon.retailer].expiredTotalValue += couponValue;
    } else {
      acc[coupon.retailer].activeCouponCount++;
      acc[coupon.retailer].activeTotalValue += couponValue;
    }
    
    return acc;
  }, {});

  // Sort retailers based on orderBy and order
  const sortedRetailers: RetailerStat[] = Object.values(retailerStats).sort((a, b) => {
    const isAsc = order === 'asc';
    switch (orderBy) {
      case 'name':
        return isAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      case 'couponCount':
        return isAsc ? a.couponCount - b.couponCount : b.couponCount - a.couponCount;
      case 'totalValue':
        return isAsc ? a.totalValue - b.totalValue : b.totalValue - a.totalValue;
      case 'activeCouponCount':
        return isAsc ? a.activeCouponCount - b.activeCouponCount : b.activeCouponCount - a.activeCouponCount;
      case 'activeTotalValue':
        return isAsc ? a.activeTotalValue - b.activeTotalValue : b.activeTotalValue - a.activeTotalValue;
      case 'expiredCouponCount':
        return isAsc ? a.expiredCouponCount - b.expiredCouponCount : b.expiredCouponCount - a.expiredCouponCount;
      case 'expiredTotalValue':
        return isAsc ? a.expiredTotalValue - b.expiredTotalValue : b.expiredTotalValue - a.expiredTotalValue;
      default:
        return 0;
    }
  });

  return (
    <div data-testid="retailer-list">
      {/* Mobile Card View */}
      <div className="sm:hidden">
        {sortedRetailers.length === 0 ? (
          <div className="text-center my-8 text-base-content/70" data-testid="retailer-empty-state">
            {t('messages.no_retailers_found')}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedRetailers.map((retailer) => (
              <div key={retailer.name} className="mb-2">
                <div className="card bg-base-100 shadow-lg border border-base-300">
                  <div className="card-body p-4">
                    <div 
                      onClick={() => handleRetailerClick(retailer.name)}
                      className="cursor-pointer"
                    >
                      <h3 className="card-title text-lg text-primary mb-3">
                        {retailer.name}
                      </h3>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <div className="col-span-12">
                          <p className="text-xs text-base-content/60 mb-1">
                            {t('tables.total_coupons')}: {retailer.couponCount}
                          </p>
                          <p className="text-base font-semibold">
                            {t('general.total_value')}: ${retailer.totalValue.toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="col-span-12">
                          <div className="divider my-2"></div>
                        </div>
                        
                        <div className="col-span-12 grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center mb-1">
                              <span className="text-xs text-base-content/60 mr-2">
                                {t('status.active')}:
                              </span>
                              <span className="badge badge-success badge-outline">
                                {retailer.activeCouponCount}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-success">
                              ${retailer.activeTotalValue.toFixed(2)}
                            </p>
                          </div>
                          
                          <div>
                            <div className="flex items-center mb-1">
                              <span className="text-xs text-base-content/60 mr-2">
                                {t('status.expired')}:
                              </span>
                              <span className="badge badge-error badge-outline">
                                {retailer.expiredCouponCount}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-error">
                              ${retailer.expiredTotalValue.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto rounded-lg border border-base-300 shadow-lg">
          <table className="table table-zebra table-compact w-full">
            <thead>
              <tr>
                <th>
                  <button 
                    onClick={() => handleRequestSort('name')}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {t('form.retailer')}
                    {orderBy === 'name' && (
                      <span className="text-primary">
                        {order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th>
                  <button 
                    onClick={() => handleRequestSort('couponCount')}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {t('tables.total_coupons')}
                    {orderBy === 'couponCount' && (
                      <span className="text-primary">
                        {order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th>
                  <button 
                    onClick={() => handleRequestSort('totalValue')}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {t('general.total_value')}
                    {orderBy === 'totalValue' && (
                      <span className="text-primary">
                        {order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th>
                  <button 
                    onClick={() => handleRequestSort('activeCouponCount')}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {t('general.active_coupons')}
                    {orderBy === 'activeCouponCount' && (
                      <span className="text-primary">
                        {order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th>
                  <button 
                    onClick={() => handleRequestSort('activeTotalValue')}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {t('tables.active_value')}
                    {orderBy === 'activeTotalValue' && (
                      <span className="text-primary">
                        {order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th>
                  <button 
                    onClick={() => handleRequestSort('expiredCouponCount')}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {t('general.expired_coupons')}
                    {orderBy === 'expiredCouponCount' && (
                      <span className="text-primary">
                        {order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th>
                  <button 
                    onClick={() => handleRequestSort('expiredTotalValue')}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {t('tables.expired_value')}
                    {orderBy === 'expiredTotalValue' && (
                      <span className="text-primary">
                        {order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRetailers.length > 0 ? (
                sortedRetailers.map((retailer) => (
                  <tr key={retailer.name} className="hover">
                    <td>
                      <button
                        onClick={() => handleRetailerClick(retailer.name)}
                        className={`font-medium hover:underline transition-colors ${
                          retailer.activeCouponCount > 0 ? 'text-primary' : 'text-error'
                        }`}
                      >
                        {retailer.name}
                      </button>
                    </td>
                    <td>{retailer.couponCount}</td>
                    <td>${retailer.totalValue.toFixed(2)}</td>
                    <td>{retailer.activeCouponCount}</td>
                    <td>${retailer.activeTotalValue.toFixed(2)}</td>
                    <td>{retailer.expiredCouponCount}</td>
                    <td>${retailer.expiredTotalValue.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-base-content/70">
                    {t('messages.no_retailers_found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RetailerList; 