import React, { useState, useEffect, ChangeEvent } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  TextField, Box, TableSortLabel, Button, Autocomplete, Typography, Card,
  CardContent, Grid, useMediaQuery, useTheme, Chip, Tooltip, FormControlLabel, Checkbox,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import PaymentIcon from '@mui/icons-material/Payment';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t, language } = useLanguage();
  
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
    <>
      {/* Filters Section */}
      <Paper variant="outlined" sx={{ width: '100%', mb: 2, p: 2 }}>
        <Box sx={{ width: '100%' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                name="retailer"
                label={t('form.retailer')}
                variant="outlined"
                size="small"
                fullWidth
                value={filters.retailer}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                name="minAmount"
                label={t('filter.min_amount')}
                variant="outlined"
                size="small"
                fullWidth
                type="number"
                value={filters.minAmount}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                name="maxAmount"
                label={t('filter.max_amount')}
                variant="outlined"
                size="small"
                fullWidth
                type="number"
                value={filters.maxAmount}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showExpired}
                    onChange={handleShowExpiredChange}
                    name="showExpired"
                  />
                }
                label={t('filter.show_expired')}
              />
            </Grid>
            {retailerFilter && (
              <Grid item xs={12} sm={2}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => setRetailerFilter && setRetailerFilter('')}
                  startIcon={<CancelIcon />}
                  fullWidth
                >
                  {t('filter.clear_filters')}
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>

      {/* No coupons message */}
      {groupedCoupons.length === 0 && (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
          {t('messages.no_coupons_found')}
        </Typography>
      )}

      {/* Render coupons in card or table view based on screen size */}
      {groupedCoupons.length > 0 && (
        isMobile ? (
          // Mobile card view
          <Box sx={{ width: '100%' }}>
            <Grid container spacing={2}>
              {groupedCoupons.map((coupon) => (
                <Grid item xs={12} key={`card-${coupon.id}`}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      mb: 1,
                      backgroundColor: isExpired(coupon.expirationDate) ? 'rgba(211, 47, 47, 0.08)' : 
                                      isUsed(coupon.currentValue) ? 'rgba(158, 158, 158, 0.15)' : 'inherit' 
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" component="div">
                          {coupon.retailer}
                        </Typography>
                        <Box>
                          {isExpired(coupon.expirationDate) && (
                            <Chip label={t('status.expired')} size="small" color="error" sx={{ mr: 0.5 }} />
                          )}
                          {isUsed(coupon.currentValue) && (
                            <Chip label={t('status.used')} size="small" color="default" />
                          )}
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        {t('form.current_value')}: <strong>${coupon.currentValue}</strong>
                        {coupon.initialValue !== coupon.currentValue && (
                          <span> ({t('form.initial_value')}: ${coupon.initialValue})</span>
                        )}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        {t('tables.expires')}: {formatDate(coupon.expirationDate)}
                      </Typography>
                      
                      {/* Action buttons for mobile */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        {/* Action buttons here */}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          // Desktop table view
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
                      active={orderBy === 'retailer'}
                      direction={orderBy === 'retailer' ? order : 'asc'}
                      onClick={() => handleRequestSort('retailer')}
                    >
                      {t('form.retailer')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'amount'}
                      direction={orderBy === 'amount' ? order : 'asc'}
                      onClick={() => handleRequestSort('amount')}
                    >
                      {t('form.current_value')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'expirationDate'}
                      direction={orderBy === 'expirationDate' ? order : 'asc'}
                      onClick={() => handleRequestSort('expirationDate')}
                    >
                      {t('tables.expires')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>{t('form.activation_code')}</TableCell>
                  <TableCell>{t('form.pin')}</TableCell>
                  <TableCell align="right">{t('tables.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedCoupons.map((coupon) => (
                  <TableRow 
                    key={`table-${coupon.id}`}
                    sx={{ 
                      bgcolor: isExpired(coupon.expirationDate) ? 'rgba(211, 47, 47, 0.08)' : 
                              isUsed(coupon.currentValue) ? 'rgba(158, 158, 158, 0.15)' : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {coupon.retailer}
                        {' '}
                        {isExpired(coupon.expirationDate) && (
                          <Chip label={t('status.expired')} size="small" color="error" sx={{ ml: 1 }} />
                        )}
                        {isUsed(coupon.currentValue) && (
                          <Chip label={t('status.used')} size="small" color="default" sx={{ ml: 1 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          ${coupon.currentValue}
                        </Typography>
                        {coupon.initialValue !== coupon.currentValue && (
                          <Typography variant="caption" color="text.secondary">
                            ({t('form.initial_value')}: ${coupon.initialValue})
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(coupon.expirationDate)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {coupon.activationCode || t('general.not_applicable')}
                        </Typography>
                        {coupon.activationCode && (
                          <Tooltip title={t('actions.copy')}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleCopyToClipboard(coupon.activationCode || '')}
                              aria-label={t('actions.copy')}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {coupon.pin || t('general.not_applicable')}
                        </Typography>
                        {coupon.pin && (
                          <Tooltip title={t('actions.copy')}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleCopyToClipboard(coupon.pin || '')}
                              aria-label={t('actions.copy')}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t('actions.edit')}>
                        <span>
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              // Just trigger the form to update this coupon's details
                              const updatedCoupon = { ...coupon };
                              onUpdateCoupon(coupon.id, updatedCoupon);
                            }}
                            aria-label={t('actions.edit')}
                            disabled={isExpired(coupon.expirationDate) || isUsed(coupon.currentValue)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      {!isUsed(coupon.currentValue) && !isExpired(coupon.expirationDate) && (
                        <>
                          <Tooltip title={t('actions.use_partially')}>
                            <IconButton 
                              size="small" 
                              onClick={() => handlePartialUseOpen(coupon.id)}
                              aria-label={t('actions.use_partially')}
                              sx={{ ml: 1 }}
                            >
                              <PaymentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('actions.mark_as_used')}>
                            <IconButton 
                              size="small" 
                              onClick={() => onMarkAsUsed(coupon.id)}
                              aria-label={t('actions.mark_as_used')}
                              sx={{ ml: 1 }}
                            >
                              <MoneyOffIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}

      {/* Partial use dialog */}
      <Dialog open={partialUseDialogOpen} onClose={handlePartialUseClose}>
        <DialogTitle>{t('dialog.partial_use_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('dialog.partial_use_description')}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="partialUseAmount"
            label={t('form.amount')}
            type="number"
            fullWidth
            value={partialUseAmount}
            onChange={(e) => setPartialUseAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePartialUseClose} color="primary">
            {t('actions.cancel')}
          </Button>
          <Button onClick={handlePartialUseSubmit} color="primary">
            {t('actions.apply')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy to clipboard notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {t('notifications.copied_to_clipboard')}: {copiedText}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CouponList; 