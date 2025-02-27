import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, 
         Card, CardContent, Typography, Box, Grid, useMediaQuery, useTheme, Divider, Chip } from '@mui/material';

const RetailerList = ({ coupons, onRetailerClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const handleRetailerClick = (retailer) => {
    onRetailerClick(retailer, { field: 'expirationDate', order: 'asc' });
  };

  // Function to check if a coupon is expired
  const isExpired = (expirationDate) => {
    if (!expirationDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    return new Date(expirationDate) < today;
  };
  
  // Function to check if a coupon is used (current value is 0)
  const isUsed = (currentValue) => {
    return currentValue === '0';
  };

  // Group coupons by retailer and calculate statistics for active and expired coupons
  const retailerStats = coupons.reduce((acc, coupon) => {
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

  const retailers = Object.values(retailerStats);

  return (
    <>
      {isMobile ? (
        // Card view for mobile devices
        <Box>
          {retailers.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
              No retailers found.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {retailers.map((retailer) => (
                <Grid item xs={12} key={retailer.name}>
                  <Card variant="outlined" sx={{ mb: 1 }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box 
                        onClick={() => handleRetailerClick(retailer.name)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <Typography variant="h6" component="div" color="primary" sx={{ mb: 1 }}>
                          {retailer.name}
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Total Coupons: {retailer.couponCount}
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              Total Value: ${retailer.totalValue.toFixed(2)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                Active:
                              </Typography>
                              <Chip 
                                label={retailer.activeCouponCount} 
                                size="small" 
                                color="success" 
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="body2" fontWeight="medium" color="success.main">
                              ${retailer.activeTotalValue.toFixed(2)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                Expired:
                              </Typography>
                              <Chip 
                                label={retailer.expiredCouponCount} 
                                size="small" 
                                color="error" 
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="body2" fontWeight="medium" color="error.main">
                              ${retailer.expiredTotalValue.toFixed(2)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      ) : (
        // Table view for larger screens
        <TableContainer component={Paper} sx={{ overflow: 'auto' }}>
          <Table stickyHeader sx={{ minWidth: { xs: 400, sm: 650 } }}>
            <TableHead sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper' }}>
              <TableRow>
                <TableCell>Retailer</TableCell>
                <TableCell>Total Coupons</TableCell>
                <TableCell>Total Value</TableCell>
                <TableCell>Active Coupons</TableCell>
                <TableCell>Active Value</TableCell>
                <TableCell>Expired Coupons</TableCell>
                <TableCell>Expired Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {retailers.map((retailer) => (
                <TableRow key={retailer.name}>
                  <TableCell>
                    <Link
                      component="button"
                      onClick={() => handleRetailerClick(retailer.name)}
                      sx={{ cursor: 'pointer' }}
                    >
                      {retailer.name}
                    </Link>
                  </TableCell>
                  <TableCell>{retailer.couponCount}</TableCell>
                  <TableCell>${retailer.totalValue.toFixed(2)}</TableCell>
                  <TableCell>{retailer.activeCouponCount}</TableCell>
                  <TableCell sx={{ color: 'success.main' }}>${retailer.activeTotalValue.toFixed(2)}</TableCell>
                  <TableCell>{retailer.expiredCouponCount}</TableCell>
                  <TableCell sx={{ color: 'error.main' }}>${retailer.expiredTotalValue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default RetailerList;