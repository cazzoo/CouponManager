import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Sun, Moon } from "lucide-react";
import CouponList from "./components/CouponList";
import RetailerList from "./components/RetailerList";
import AddCouponForm from "./components/AddCouponForm";
import LanguageSelector from "./components/LanguageSelector";
import DevUserSwitcher from "./components/DevUserSwitcher";
import LoginForm from "./components/LoginForm";
import UserManagement from "./components/UserManagement";
import couponService from "./services/CouponServiceFactory";
import { useLanguage } from "./services/LanguageContext";
import { useAuth } from "./services/AuthContext";
import { Permissions } from "./services/RoleServiceFactory";
import { Coupon, CouponFormData, ThemeConfig } from "./types";

interface AppProps extends ThemeConfig {}

function App({ isDarkMode, onThemeChange }: AppProps) {
  const { t } = useLanguage();
  const { user, loading: authLoading, signOut, userRole, hasPermission } = useAuth();
  
  const isManager = userRole === 'manager';
  
  console.log('App: User role:', userRole, 'isManager:', isManager);
  
  useEffect(() => {
    if (userRole === 'manager' && !isManager) {
      console.warn('App: User has manager role but isManager is false. This might prevent access to User Management tab.');
    }
  }, [userRole, isManager]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [retailerFilter, setRetailerFilter] = useState<string>('');
  const [canAddCoupon, setCanAddCoupon] = useState<boolean>(false);
  console.log('App: Current auth state:', { 
    isAuthenticated: !!user, 
    userEmail: user?.email,
    authLoading 
  });
  const isDevelopment = import.meta.env.DEV === true;
  useEffect(() => {
    // Only fetch coupons if user is authenticated
    if (user) {
      const fetchCoupons = async (): Promise<void> => {
        try {
          setLoading(true);
          const allCoupons = await couponService.getAllCoupons();
          console.log('Coupons loaded:', allCoupons);
          console.log('Number of coupons:', allCoupons.length);
          console.log('First coupon (if any):', allCoupons.length > 0 ? allCoupons[0] : 'No coupons');
          setCoupons(allCoupons);
          setError(null);
        } catch (err) {
          console.error('Error loading coupons:', err);
          setError('Failed to load coupons. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchCoupons();
    }
  }, [user]);
  useEffect(() => {
    const checkPermissions = async (): Promise<void> => {
      if (user) {
        try {
          const canAdd = await hasPermission('create:coupon');
          setCanAddCoupon(canAdd);
          
          console.log('User has manager role:', userRole === 'manager');
        } catch (err) {
          console.error('Error checking permissions:', err);
        }
      } else {
        setCanAddCoupon(false);
      }
    };
    
    checkPermissions();
  }, [user, hasPermission, userRole]);

  const handleAddCoupon = async (newCoupon: CouponFormData): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('App: Adding coupon:', newCoupon, 'with user:', user?.id);
      
      const addedCoupon = await couponService.addCoupon(newCoupon, user?.id);
      
      console.log('App: Coupon added successfully:', addedCoupon);
      setCoupons([...coupons, addedCoupon]);
      setError(null);
      setDialogOpen(false);
      return true;
    } catch (err) {
      console.error('Error adding coupon:', err);
      setError('Failed to add coupon. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCoupon = async (updatedCoupon: Partial<Coupon>): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await couponService.updateCoupon(updatedCoupon);
      
      if (result) {
        const updatedCoupons = coupons.map(coupon => 
          coupon.id === updatedCoupon.id ? { ...coupon, ...updatedCoupon } : coupon
        );
        setCoupons(updatedCoupons);
        setError(null);
        return true;
      } else {
        setError('Failed to update coupon. Please try again.');
        return false;
      }
    } catch (err) {
      console.error('Error updating coupon:', err);
      setError('Failed to update coupon. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsUsed = async (couponId: string): Promise<void> => {
    try {
      setLoading(true);
      const result = await couponService.markCouponAsUsed(couponId);
      
      if (result) {
        const updatedCoupons = coupons.map(coupon => {
          if (coupon.id === couponId) {
            return {
              ...coupon,
              isUsed: true
            };
          }
          return coupon;
        });
        
        setCoupons(updatedCoupons);
        setError(null);
      }
      
      if (!result) {
        setError('Failed to mark coupon as used. Please try again.');
      }
    } catch (err) {
      console.error('Error marking coupon as used:', err);
      setError('Failed to mark coupon as used. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleOpenDialog = (): void => {
    setSelectedCoupon(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = (): void => {
    setDialogOpen(false);
    setSelectedCoupon(null);
  };
  const handleTabChange = (newValue: number): void => {
    setCurrentTab(newValue);
  };
  const handleEditCoupon = (coupon: Coupon): void => {
    setSelectedCoupon(coupon);
    setDialogOpen(true);
  };
  const handleRetailerFilterChange = (retailer: string): void => {
    setRetailerFilter(retailer);
  };
  const handleCouponUpdate = useCallback((couponId: string, updatedData: Partial<Coupon>): void => {
    if (updatedData && couponId) {
      const updatedCoupon = {
        ...coupons.find(c => c.id === couponId),
        ...updatedData
      } as Coupon;
      
      handleUpdateCoupon(updatedCoupon);
    }
  }, [coupons]);
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg" role="progressbar"></span>
      </div>
    );
  }
  if (!user) {
    console.log('App: User is not authenticated, showing login form');
    return (
      <div className={`min-h-screen ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
        <nav className="navbar bg-green-600 text-white">
          <div className="container mx-auto">
            <div className="flex-1">
              <a className="btn btn-ghost text-xl normal-case">{t('app.coupon_manager')}</a>
            </div>
            <div className="flex-none gap-2">
              <LanguageSelector />
              {isDevelopment && <DevUserSwitcher />}
              <button
                className="btn btn-ghost btn-circle"
                onClick={() => onThemeChange(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
        <LoginForm />
      </div>
    );
  }

  console.log('App: User is authenticated, showing main application');
  return (
    <div className="min-h-screen bg-base-200" data-testid="dashboard-container">
      <nav className="navbar bg-green-600 text-white shadow-lg border-b border-green-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl normal-case font-semibold tracking-wide">
              {t('app.coupon_manager')}
            </a>
          </div>
          <div className="flex-none gap-2 items-center">
            <LanguageSelector />
            {isDevelopment && <DevUserSwitcher />}
            <div className="hidden sm:block text-sm mr-2 text-green-100">
              {user.email}
            </div>
            <button
              className="btn btn-ghost btn-circle mr-1 hover:bg-green-700"
              onClick={() => onThemeChange(!isDarkMode)}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              className="btn btn-ghost hover:bg-green-700 normal-case"
              onClick={handleSignOut}
              data-testid="logout-button"
            >
              {t('app.sign_out')}
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className={`bg-gray-100 border-b border-gray-200 shadow-sm ${isDarkMode ? "bg-gray-700 border-gray-600" : ""}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="tabs tabs-boxed bg-transparent border-0">
            <a 
              className={`tab ${currentTab === 0 ? 'tab-active bg-green-600 text-white' : 'hover:bg-gray-200'} ${isDarkMode ? 'hover:bg-gray-600' : ''}`}
              onClick={() => handleTabChange(0)}
              data-testid="nav-coupons"
            >
              {t('app.tabs.coupons')}
            </a>
            <a 
              className={`tab ${currentTab === 1 ? 'tab-active bg-green-600 text-white' : 'hover:bg-gray-200'} ${isDarkMode ? 'hover:bg-gray-600' : ''}`}
              onClick={() => handleTabChange(1)}
              data-testid="nav-retailers"
            >
              {t('app.tabs.retailers')}
            </a>
            {isManager && (
              <a 
                className={`tab ${currentTab === 2 ? 'tab-active bg-green-600 text-white' : 'hover:bg-gray-200'} ${isDarkMode ? 'hover:bg-gray-600' : ''}`}
                onClick={() => handleTabChange(2)}
                data-testid="nav-users"
              >
                {t('app.tabs.users')}
              </a>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error m-4">
          <span>{error}</span>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-4">
        {loading && (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {currentTab === 0 && (
          <div className="w-full">
            <div className="card bg-base-100 shadow-xl mb-4">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <h2 className="card-title text-2xl">
                    {t('app.your_coupons')}
                  </h2>
                  {canAddCoupon && (
                    <div className="tooltip" data-tip={t('coupon.add_new')}>
                      <button
                        className="btn btn-primary"
                        onClick={handleOpenDialog}
                        data-testid="create-coupon-button"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('coupon.add')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <CouponList
              coupons={coupons}
              onUpdateCoupon={handleCouponUpdate}
              onMarkAsUsed={handleMarkAsUsed}
              retailerFilter={retailerFilter}
              setRetailerFilter={handleRetailerFilterChange}
              defaultSort={{ field: 'expirationDate', order: 'asc' }}
            />
          </div>
        )}

        {currentTab === 1 && (
          <div className="w-full">
            <div className="card bg-base-100 shadow-xl mb-4">
              <div className="card-body">
                <h2 className="card-title text-2xl">
                  {t('app.retailer_stats')}
                </h2>
              </div>
            </div>
            <RetailerList 
              coupons={coupons} 
              onRetailerClick={(retailer, sort) => {
                setRetailerFilter(retailer);
                setCurrentTab(0);
              }}
            />
          </div>
        )}

        {currentTab === 2 && isManager && (
          <div className="w-full">
            <div className="card bg-base-100 shadow-xl mb-4">
              <div className="card-body">
                <h2 className="card-title text-2xl">
                  {t('app.user_management')}
                </h2>
              </div>
            </div>
            <UserManagement />
          </div>
        )}
      </div>

      <AddCouponForm
        open={dialogOpen}
        onClose={handleCloseDialog}
        onAddCoupon={handleAddCoupon}
        onUpdateCoupon={handleUpdateCoupon}
        coupon={selectedCoupon || undefined}
        coupons={coupons}
      />
    </div>
  );
}

export default App;