import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Button,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  Alert,
  Collapse,
  Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import CouponList from "./components/CouponList";
import RetailerList from "./components/RetailerList";
import AddCouponForm from "./components/AddCouponForm";
import LanguageSelector from "./components/LanguageSelector";
import LoginForm from "./components/LoginForm";
import UserManagement from "./components/UserManagement";
import couponService from "./services/CouponServiceFactory";
import { StorageType } from "./services/CouponServiceFactory";
import { useLanguage } from "./services/LanguageContext";
import { useAuth } from "./services/AuthContext";
import { Permissions } from "./services/RoleServiceFactory";

function App({ isDarkMode, onThemeChange }) {
  const { t } = useLanguage();
  const { user, loading: authLoading, signOut, isManager, userRole, hasPermission } = useAuth();
  
  // Debug log for manager status
  console.log('App: User role:', userRole, 'isManager:', isManager);
  
  // Warn if the user is a manager but we're not showing the manager tab
  useEffect(() => {
    if (userRole === 'manager' && !isManager) {
      console.warn('App: User has manager role but isManager is false. This might prevent access to User Management tab.');
    }
  }, [userRole, isManager]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [retailerFilter, setRetailerFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDbAlert, setShowDbAlert] = useState(true);
  const [canAddCoupon, setCanAddCoupon] = useState(false);
  
  // Debug log for auth state
  console.log('App: Current auth state:', { 
    isAuthenticated: !!user, 
    userEmail: user?.email,
    authLoading 
  });

  // Check if using in-memory database
  const isUsingMemoryDb = import.meta.env.VITE_USE_MEMORY_DB === 'true';
  const isDevelopment = import.meta.env.MODE === 'development';
  const isAutoMockData = import.meta.env.VITE_AUTO_MOCK_DATA === 'true';

  // Load coupons when component mounts or user changes
  useEffect(() => {
    // Only fetch coupons if user is authenticated
    if (user) {
      const fetchCoupons = async () => {
        try {
          setLoading(true);
          const allCoupons = await couponService.getAllCoupons();
          console.log('Coupons loaded:', allCoupons); // Debug log
          console.log('Number of coupons:', allCoupons.length); // Check length
          console.log('First coupon (if any):', allCoupons.length > 0 ? allCoupons[0] : 'No coupons'); // Check first item
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

  // Check if user has permission to add coupons
  useEffect(() => {
    const checkAddCouponPermission = async () => {
      if (user) {
        try {
          const canCreate = await hasPermission(Permissions.CREATE_COUPON);
          console.log('App: User can create coupons:', canCreate);
          // Use the actual permission result
          setCanAddCoupon(canCreate);
        } catch (err) {
          console.error('Error checking coupon permission:', err);
          setCanAddCoupon(false);
        }
      } else {
        console.log('App: No user available, cannot add coupons');
        setCanAddCoupon(false);
      }
    };
    
    checkAddCouponPermission();
  }, [user, hasPermission]);

  const handleAddCoupon = async (newCoupon) => {
    try {
      setLoading(true);
      console.log('App: Adding coupon:', newCoupon, 'with user:', user?.id);
      
      // Pass the current user's ID to the addCoupon method
      const addedCoupon = await couponService.addCoupon(newCoupon, user?.id);
      
      console.log('App: Coupon added successfully:', addedCoupon);
      setCoupons([...coupons, addedCoupon]);
      setError(null);
      setDialogOpen(false); // Close the dialog on success
      return true;
    } catch (err) {
      console.error('Error adding coupon:', err);
      setError('Failed to add coupon. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCoupon = async (updatedCoupon) => {
    try {
      setLoading(true);
      const result = await couponService.updateCoupon(updatedCoupon);
      
      if (result) {
        const updatedCoupons = coupons.map(coupon => 
          coupon.id === updatedCoupon.id ? updatedCoupon : coupon
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

  const handleMarkAsUsed = async (couponId) => {
    try {
      setLoading(true);
      const result = await couponService.markCouponAsUsed(couponId);
      
      if (result) {
        // Update the coupon in the local state
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

  // Handle sign out
  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      // We don't need to do anything else here as the auth state change will trigger a re-render
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If auth is loading, show loading spinner
  if (authLoading) {
    console.log('App: Auth is loading, showing spinner');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If user is not authenticated, show the login form
  if (!user) {
    console.log('App: User is not authenticated, showing login form');
    return (
      <Box sx={{ bgcolor: isDarkMode ? "#303030" : "#f5f5f5", minHeight: "100vh" }}>
        <AppBar position="static" sx={{ backgroundColor: "#2e7d32" }}>
          <Toolbar sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {t('app.coupon_manager')}
            </Typography>
            <LanguageSelector />
            <IconButton
              sx={{ ml: 1 }}
              onClick={() => onThemeChange(!isDarkMode)}
              color="inherit"
            >
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <LoginForm />
      </Box>
    );
  }

  console.log('App: User is authenticated, showing main application');
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: "#2e7d32" }}>
        <Toolbar sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('app.coupon_manager')}
          </Typography>
          <LanguageSelector />
          <IconButton
            sx={{ ml: 1 }}
            onClick={() => onThemeChange(!isDarkMode)}
            color="inherit"
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Button 
            color="inherit" 
            onClick={handleSignOut}
            sx={{ ml: 1 }}
          >
            {t('app.sign_out') || 'Sign Out'}
          </Button>
        </Toolbar>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          aria-label="app navigation tabs"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTabs-indicator": {
              backgroundColor: "primary.main",
              height: 3,
            },
          }}
        >
          <Tab label={t('app.coupons')} />
          <Tab label={t('app.retailers')} />
          {/* Debug output for the user management tab */}
          {console.log('App: Rendering tabs, isManager:', isManager, 'userRole:', userRole)}
          {isManager && (
            <Tab 
              label={t('app.user_management')} 
              data-testid="user-management-tab"
            />
          )}
        </Tabs>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {/* Debug information */}
        {isDevelopment && (
          <Box sx={{ my: 2, p: 2, border: '1px dashed gray', borderRadius: 1, bgcolor: 'rgba(0,0,0,0.03)' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Debug Info:</strong> User: {user ? `${user.email} (${user.id})` : 'Not logged in'} | 
              Role: {userRole || 'None'} |
              isManager: {isManager ? 'Yes' : 'No'} |
              Permissions: CREATE_COUPON={canAddCoupon ? 'Yes' : 'No'} |
              Loading: {loading ? 'Yes' : 'No'} |
              Auth Loading: {authLoading ? 'Yes' : 'No'}
            </Typography>
          </Box>
        )}
        
        {/* Memory Database Alert */}
        {isDevelopment && isUsingMemoryDb && (
          <Collapse in={showDbAlert}>
            <Alert 
              severity="info" 
              onClose={() => setShowDbAlert(false)}
              sx={{ mb: 2 }}
            >
              {t('Using local memory database in development mode.')}
              {isAutoMockData && ' ' + t('Mock data is automatically injected.')}
              {' ' + t('To use Supabase instead, run: pnpm dev:supabase')}
            </Alert>
          </Collapse>
        )}
        
        {error && (
          <Box sx={{ my: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {!loading && currentTab === 0 ? (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", sm: "flex-end" },
                mb: 2,
              }}
            >
              <Tooltip 
                title={!canAddCoupon ? 'You do not have permission to add coupons' : ''}
                arrow
              >
                <span> {/* Tooltip needs a wrapper when the child is disabled */}
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedCoupon(null);
                      setDialogOpen(true);
                    }}
                    disabled={!canAddCoupon || loading}
                    sx={{
                      opacity: !canAddCoupon ? 0.6 : 1,
                      '&.Mui-disabled': {
                        bgcolor: 'rgba(25, 118, 210, 0.5)', 
                        color: 'white'
                      }
                    }}
                  >
                    {t('app.add_coupon')} {!canAddCoupon ? '(Disabled)' : ''}
                  </Button>
                </span>
              </Tooltip>
            </Box>
            <AddCouponForm
              open={dialogOpen}
              onClose={() => {
                setDialogOpen(false);
                setSelectedCoupon(null);
              }}
              onAddCoupon={handleAddCoupon}
              onUpdateCoupon={handleUpdateCoupon}
              coupon={selectedCoupon}
              coupons={coupons}
            />
            <Box>
              <CouponList
                coupons={coupons}
                onUpdateCoupon={(coupon) => {
                  setSelectedCoupon(coupon);
                  setDialogOpen(true);
                }}
                onMarkAsUsed={handleMarkAsUsed}
                retailerFilter={retailerFilter}
                setRetailerFilter={setRetailerFilter}
                defaultSort={{ field: "expirationDate", order: "asc" }}
              />
            </Box>
          </>
        ) : !loading && currentTab === 1 ? (
          <Box sx={{ mt: 2 }}>
            <RetailerList
              coupons={coupons}
              onRetailerClick={(retailer, defaultSort) => {
                setRetailerFilter(retailer);
                setCurrentTab(0);
              }}
            />
          </Box>
        ) : !loading && currentTab === 2 && (isManager || isDevelopment) ? (
          <Box>
            {!isManager && isDevelopment && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                This is a development-only view. In production, this tab is only visible to managers.
              </Alert>
            )}
            <UserManagement />
          </Box>
        ) : null}
      </Container>
    </Box>
  );
}

export default App;
