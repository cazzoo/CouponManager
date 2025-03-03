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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import CouponList from "./components/CouponList";
import RetailerList from "./components/RetailerList";
import AddCouponForm from "./components/AddCouponForm";
import { couponService } from "./services/CouponService";

function App({ isDarkMode, onThemeChange }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [retailerFilter, setRetailerFilter] = useState("");

  useEffect(() => {
    setCoupons(couponService.getAllCoupons());
  }, []);

  const handleAddCoupon = (newCoupon) => {
    setCoupons([...coupons, { ...newCoupon, id: Date.now() }]);
    setDialogOpen(false);
  };

  const handleUpdateCoupon = (updatedCoupon) => {
    setCoupons(
      coupons.map((coupon) =>
        coupon.id === updatedCoupon.id ? updatedCoupon : coupon
      )
    );
    setDialogOpen(false);
    setSelectedCoupon(null);
  };

  const handleMarkAsUsed = (couponId, newValue = "0") => {
    setCoupons(
      coupons.map((coupon) =>
        coupon.id === couponId ? { ...coupon, currentValue: newValue } : coupon
      )
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: "#2e7d32" }}>
        <Toolbar sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Coupon Manager
          </Typography>
          <IconButton
            sx={{ ml: 1 }}
            onClick={() => onThemeChange(!isDarkMode)}
            color="inherit"
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
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
          <Tab label="Coupons" />
          <Tab label="Retailers" />
        </Tabs>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {currentTab === 0 ? (
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
                Add Coupon
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
        ) : (
          <Box sx={{ mt: 2 }}>
            <RetailerList
              coupons={coupons}
              onRetailerClick={(retailer, defaultSort) => {
                setRetailerFilter(retailer);
                setCurrentTab(0);
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;
