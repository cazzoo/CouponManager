import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, 
         Card, CardContent, Typography, Box, Grid, useMediaQuery, useTheme, Divider, Chip, TableSortLabel } from '@mui/material';
import { useLanguage } from '../services/LanguageContext';
import { Coupon, RetailerStat, SortConfig } from '../types';

interface RetailerListProps {
  coupons: Coupon[];
  onRetailerClick?: (retailer: string, sort: SortConfig) => void;
}

type Order = 'asc' | 'desc';

const RetailerList: React.FC<RetailerListProps> = ({ coupons, onRetailerClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useLanguage();
  const [orderBy, setOrderBy] = useState<keyof RetailerStat>('name');
  const [order, setOrder] = useState<Order>('asc');

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
    <>
      {isMobile ? (
        // Card view for mobile devices
        <Box sx={{ width: '100%' }}>
          {sortedRetailers.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
              {t('messages.no_retailers_found')}
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {sortedRetailers.map((retailer) => (
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
                              {t('tables.total_coupons')}: {retailer.couponCount}
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {t('general.total_value')}: ${retailer.totalValue.toFixed(2)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                {t('status.active')}:
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
                                {t('status.expired')}:
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
        <TableContainer 
          component={Paper} 
          variant="outlined" 
          sx={{ 
            width: '100%',
            overflowX: 'auto'
          }}
        >
          <Table size="small" sx={{ minWidth: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    {t('form.retailer')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'couponCount'}
                    direction={orderBy === 'couponCount' ? order : 'asc'}
                    onClick={() => handleRequestSort('couponCount')}
                  >
                    {t('tables.total_coupons')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'totalValue'}
                    direction={orderBy === 'totalValue' ? order : 'asc'}
                    onClick={() => handleRequestSort('totalValue')}
                  >
                    {t('general.total_value')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'activeCouponCount'}
                    direction={orderBy === 'activeCouponCount' ? order : 'asc'}
                    onClick={() => handleRequestSort('activeCouponCount')}
                  >
                    {t('general.active_coupons')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'activeTotalValue'}
                    direction={orderBy === 'activeTotalValue' ? order : 'asc'}
                    onClick={() => handleRequestSort('activeTotalValue')}
                  >
                    {t('tables.active_value')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'expiredCouponCount'}
                    direction={orderBy === 'expiredCouponCount' ? order : 'asc'}
                    onClick={() => handleRequestSort('expiredCouponCount')}
                  >
                    {t('general.expired_coupons')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'expiredTotalValue'}
                    direction={orderBy === 'expiredTotalValue' ? order : 'asc'}
                    onClick={() => handleRequestSort('expiredTotalValue')}
                  >
                    {t('tables.expired_value')}
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRetailers.length > 0 ? (
                sortedRetailers.map((retailer) => (
                  <TableRow key={retailer.name} hover>
                    <TableCell>
                      <Link
                        component="button"
                        color={retailer.activeCouponCount > 0 ? 'primary' : 'error'}
                        onClick={() => handleRetailerClick(retailer.name)}
                        sx={{ textDecoration: 'none' }}
                      >
                        {retailer.name}
                      </Link>
                    </TableCell>
                    <TableCell>{retailer.couponCount}</TableCell>
                    <TableCell>${retailer.totalValue.toFixed(2)}</TableCell>
                    <TableCell>{retailer.activeCouponCount}</TableCell>
                    <TableCell>${retailer.activeTotalValue.toFixed(2)}</TableCell>
                    <TableCell>{retailer.expiredCouponCount}</TableCell>
                    <TableCell>${retailer.expiredTotalValue.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {t('messages.no_retailers_found')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default RetailerList; 