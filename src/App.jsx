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
import { useLanguage } from "./services/LanguageContext";
import { useAuth } from "./services/AuthContext";

function App({ isDarkMode, onThemeChange }) {
  const { t } = useLanguage();
  const { user, loading: authLoading, signOut, isManager } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [retailerFilter, setRetailerFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleAddCoupon = async (newCoupon) => {
    try {
      setLoading(true);
      const addedCoupon = await couponService.addCoupon(newCoupon);
      setCoupons([...coupons, addedCoupon]);
      setError(null);
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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If user is not authenticated, show the login form
  if (!user) {
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
          sx={{
            bgcolor: "#1b5e20",
            "& .MuiTab-root": {
              color: "rgba(255, 255, 255, 0.7)",
              "&.Mui-selected": {
                color: "#ffffff",
                fontWeight: "bold",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#ffffff",
              height: 3,
            },
          }}
        >
          <Tab label={t('app.coupons')} />
          <Tab label={t('app.retailers')} />
          {isManager && <Tab label={t('app.user_management') || 'User Management'} />}
        </Tabs>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, px: { xs: 2, sm: 3, md: 4 } }}>
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
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedCoupon(null);
                  setDialogOpen(true);
                }}
              >
                {t('app.add_coupon')}
              </Button>
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
        ) : !loading && currentTab === 2 && isManager ? (
          <UserManagement />
        ) : null}
      </Container>
    </Box>
  );
}

export default App;
