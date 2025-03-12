import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Tooltip,
  Paper
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
import { Coupon, CouponFormData, ThemeConfig } from "./types";

interface AppProps extends ThemeConfig {}

function App({ isDarkMode, onThemeChange }: AppProps) {
  const { t } = useLanguage();
  const { user, loading: authLoading, signOut, userRole, hasPermission } = useAuth();
  
  // Calculate isManager from userRole
  const isManager = userRole === 'manager';
  
  // Debug log for manager status
  console.log('App: User role:', userRole, 'isManager:', isManager);
  
  // Warn if the user is a manager but we're not showing the manager tab
  useEffect(() => {
    if (userRole === 'manager' && !isManager) {
      console.warn('App: User has manager role but isManager is false. This might prevent access to User Management tab.');
    }
  }, [userRole, isManager]);
  
  // State for coupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [retailerFilter, setRetailerFilter] = useState<string>('');
  const [canAddCoupon, setCanAddCoupon] = useState<boolean>(false);
  
  // For development mode alert about memory database
  const [showDbAlert, setShowDbAlert] = useState<boolean>(true);
  
  // Debug log for auth state
  console.log('App: Current auth state:', { 
    isAuthenticated: !!user, 
    userEmail: user?.email,
    authLoading 
  });

  // Check development environment flag
  const isDevelopment = import.meta.env.DEV === true;
  const isUsingMemoryDb = import.meta.env.VITE_USE_MEMORY_DB === 'true';
  const isAutoMockData = import.meta.env.VITE_AUTO_MOCK_DATA === 'true';

  // Load coupons when component mounts or user changes
  useEffect(() => {
    // Only fetch coupons if user is authenticated
    if (user) {
      const fetchCoupons = async (): Promise<void> => {
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

  // Initialize permissions when user changes
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
  const handleSignOut = async (): Promise<void> => {
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

  // Handle opening add coupon dialog
  const handleOpenDialog = (): void => {
    setSelectedCoupon(null);
    setDialogOpen(true);
  };

  // Handle closing add coupon dialog
  const handleCloseDialog = (): void => {
    setDialogOpen(false);
    setSelectedCoupon(null);
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setCurrentTab(newValue);
  };

  // Handle editing a coupon
  const handleEditCoupon = (coupon: Coupon): void => {
    setSelectedCoupon(coupon);
    setDialogOpen(true);
  };

  // Handle retailer filter change
  const handleRetailerFilterChange = (retailer: string): void => {
    setRetailerFilter(retailer);
  };

  // Wrapper for handleUpdateCoupon to match CouponList interface
  const handleCouponUpdate = useCallback((couponId: string, updatedData: Partial<Coupon>): void => {
    if (updatedData && couponId) {
      // Find the coupon by ID and merge with updated data
      const updatedCoupon = {
        ...coupons.find(c => c.id === couponId),
        ...updatedData
      } as Coupon;
      
      // Call the original update function
      handleUpdateCoupon(updatedCoupon);
    }
  }, [coupons]);

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
      <AppBar position="static" sx={{ 
        backgroundColor: "#2e7d32",
        boxShadow: 3,
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
      }}>
        <Toolbar sx={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: { xs: '0 8px', sm: '0 16px' }
        }}>
          <Typography variant="h6" component="div" sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center'
          }}>
            {t('app.coupon_manager')}
          </Typography>
          <LanguageSelector />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ 
              mr: 2, 
              display: { xs: 'none', sm: 'block' },
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              {user.email}
            </Typography>
            <IconButton
              sx={{ 
                mr: 1,
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onClick={() => onThemeChange(!isDarkMode)}
              color="inherit"
            >
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Button 
              color="inherit" 
              onClick={handleSignOut}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              {t('app.sign_out')}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Move tabs below AppBar */}
      <Box sx={{ 
        bgcolor: '#f5f5f5', 
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        ...(isDarkMode && { bgcolor: '#303030', borderBottom: '1px solid #424242' })
      }}>
        <Container maxWidth="xl">
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="main tabs"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: theme => theme.palette.primary.main,
                height: 3
              },
              '& .MuiTab-root': {
                color: theme => theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                textTransform: 'none',
                minWidth: { xs: '100px', sm: '150px' },
                padding: { xs: '16px 8px', sm: '16px 24px' },
                transition: 'color 0.3s ease, background-color 0.3s ease',
                '&:hover': {
                  color: theme => theme.palette.primary.main,
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  ...(isDarkMode && { backgroundColor: 'rgba(255, 255, 255, 0.05)' })
                },
                '&.Mui-selected': {
                  color: theme => theme.palette.primary.main,
                  fontWeight: 600,
                },
                '&.Mui-focusVisible': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  ...(isDarkMode && { backgroundColor: 'rgba(255, 255, 255, 0.1)' })
                },
              },
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={t('app.tabs.coupons')} 
              sx={{ 
                borderRadius: '4px 4px 0 0',
              }}
            />
            <Tab 
              label={t('app.tabs.retailers')} 
              sx={{ 
                borderRadius: '4px 4px 0 0',
              }}
            />
            {isManager && <Tab 
              label={t('app.tabs.users')} 
              sx={{ 
                borderRadius: '4px 4px 0 0',
              }}
            />}
          </Tabs>
        </Container>
      </Box>

      {/* Alert for memory database in development mode */}
      {isDevelopment && isUsingMemoryDb && (
        <Collapse in={showDbAlert}>
          <Alert 
            severity="info" 
            onClose={() => setShowDbAlert(false)}
            sx={{ margin: 1 }}
          >
            {t('app.using_memory_db')} {isAutoMockData ? t('app.with_mock_data') : ''}
          </Alert>
        </Collapse>
      )}

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ margin: 1 }}>
          {error}
        </Alert>
      )}

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Display loading indicator when loading */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        )}

        {/* Tab 0: Coupons */}
        {currentTab === 0 && (
          <Box sx={{ width: '100%' }}>
            <Paper variant="outlined" sx={{ width: '100%', mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="h2">
                  {t('app.your_coupons')}
                </Typography>
                {canAddCoupon && (
                  <Tooltip title={t('coupon.add_new')}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleOpenDialog}
                    >
                      {t('coupon.add')}
                    </Button>
                  </Tooltip>
                )}
              </Box>
            </Paper>
            <CouponList
              coupons={coupons}
              onUpdateCoupon={handleCouponUpdate}
              onMarkAsUsed={handleMarkAsUsed}
              retailerFilter={retailerFilter}
              setRetailerFilter={handleRetailerFilterChange}
              defaultSort={{ field: 'expirationDate', order: 'asc' }}
            />
          </Box>
        )}

        {/* Tab 1: Retailers */}
        {currentTab === 1 && (
          <Box sx={{ width: '100%' }}>
            <Paper variant="outlined" sx={{ width: '100%', mb: 2, p: 2 }}>
              <Typography variant="h5" component="h2">
                {t('app.retailer_stats')}
              </Typography>
            </Paper>
            <RetailerList 
              coupons={coupons} 
              onRetailerClick={(retailer, sort) => {
                setRetailerFilter(retailer);
                setCurrentTab(0);
              }}
            />
          </Box>
        )}

        {/* Tab 2: User Management (for managers) */}
        {currentTab === 2 && isManager && (
          <Box sx={{ width: '100%' }}>
            <Paper variant="outlined" sx={{ width: '100%', mb: 2, p: 2 }}>
              <Typography variant="h5" component="h2">
                {t('app.user_management')}
              </Typography>
            </Paper>
            <UserManagement />
          </Box>
        )}
      </Container>

      {/* Add/Edit Coupon Dialog */}
      <AddCouponForm
        open={dialogOpen}
        onClose={handleCloseDialog}
        onAddCoupon={handleAddCoupon}
        onUpdateCoupon={handleUpdateCoupon}
        coupon={selectedCoupon || undefined}
        coupons={coupons}
      />
    </Box>
  );
}

export default App; 