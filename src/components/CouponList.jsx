import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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

const localeMap = {
  en: enUS,
  es: es,
  fr: fr,
  de: de
};

const CouponList = ({ coupons, onUpdateCoupon, onMarkAsUsed, retailerFilter, setRetailerFilter, defaultSort }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t, language } = useLanguage();
  const [filters, setFilters] = useState({
    retailer: '',
    minAmount: '',
    maxAmount: '',
  });
  const [showExpired, setShowExpired] = useState(false);
  const [orderBy, setOrderBy] = useState(defaultSort?.field || 'retailer');
  const [order, setOrder] = useState(defaultSort?.order || 'asc');
  const [copiedText, setCopiedText] = useState('');
  const [partialUseDialogOpen, setPartialUseDialogOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const [partialUseAmount, setPartialUseAmount] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
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
  
  const handleCopyToClipboard = (text) => {
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

  const handleSnackbarClose = (event, reason) => {
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

  const formatDate = (date) => {
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

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShowExpiredChange = (event) => {
    setShowExpired(event.target.checked);
  };

  const handlePartialUseOpen = (couponId) => {
    setSelectedCouponId(couponId);
    setPartialUseAmount('');
    setPartialUseDialogOpen(true);
  };

  const handlePartialUseClose = () => {
    setPartialUseDialogOpen(false);
    setSelectedCouponId(null);
    setPartialUseAmount('');
  };

  const handlePartialUseSubmit = () => {
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
  
  // Group coupons by expiration and usage status
  const nonExpiredActiveCoupons = filteredCoupons.filter(coupon => !isExpired(coupon.expirationDate) && !isUsed(coupon.currentValue));
  const nonExpiredUsedCoupons = filteredCoupons.filter(coupon => !isExpired(coupon.expirationDate) && isUsed(coupon.currentValue));
  const expiredCoupons = filteredCoupons.filter(coupon => isExpired(coupon.expirationDate));
  
  // Sort each group separately
  const sortCoupons = (coupons) => {
    return coupons.sort((a, b) => {
      const isAsc = order === 'asc';
      switch (orderBy) {
        case 'retailer':
          return isAsc ? a.retailer.localeCompare(b.retailer) : b.retailer.localeCompare(a.retailer);
        case 'amount':
          return isAsc ? parseFloat(a.currentValue) - parseFloat(b.currentValue) : parseFloat(b.currentValue) - parseFloat(a.currentValue);
        case 'expirationDate':
          return isAsc ? new Date(a.expirationDate) - new Date(b.expirationDate) : new Date(b.expirationDate) - new Date(a.expirationDate);
        default:
          return 0;
      }
    });
  };
  
  // Sort each group and combine them with active non-expired first, then used non-expired, then expired
  const sortedNonExpiredActiveCoupons = sortCoupons(nonExpiredActiveCoupons);
  const sortedNonExpiredUsedCoupons = sortCoupons(nonExpiredUsedCoupons);
  const sortedExpiredCoupons = sortCoupons(expiredCoupons);
  const groupedCoupons = [...sortedNonExpiredActiveCoupons, ...sortedNonExpiredUsedCoupons, ...sortedExpiredCoupons];


  return (
    <>
      {/* Responsive Filter Controls */}
      <Box sx={{ mb: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' } }}>
        <Autocomplete
          freeSolo
          options={[...new Set(coupons.map(coupon => coupon.retailer))]}
          value={filters.retailer}
          onChange={(event, newValue) => {
            setFilters(prev => ({
              ...prev,
              retailer: newValue || ''
            }));
          }}
          onInputChange={(event, newInputValue) => {
            setFilters(prev => ({
              ...prev,
              retailer: newInputValue || ''
            }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('filter.filter_by_retailer')}
              placeholder={t('filter.filter_by_retailer')}
              size="small"
              sx={{ width: '100%' }}
            />
          )}
          size="small"
          sx={{ 
            minWidth: { xs: '100%', sm: '250px', md: '450px' },
            flex: 1
          }}
        />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'row' }, gap: 2, width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            label={t('filter.min_amount')}
            name="minAmount"
            type="number"
            value={filters.minAmount}
            onChange={handleFilterChange}
            size="small"
            sx={{ flex: 1 }}
          />
          <TextField
            label={t('filter.max_amount')}
            name="maxAmount"
            type="number"
            value={filters.maxAmount}
            onChange={handleFilterChange}
            size="small"
            sx={{ flex: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={showExpired} 
                onChange={handleShowExpiredChange} 
                size="small"
              />
            }
            label={t('status.expired')}
          />
          <Button
            variant="outlined"
            onClick={() => {
              setFilters({ retailer: '', minAmount: '', maxAmount: '' });
              setShowExpired(false);
              if (setRetailerFilter) {
                setRetailerFilter('');
              }
            }}
            size="small"
            sx={{ height: 40 }}
            fullWidth={isMobile}
          >
            {t('filter.clear_filters')}
          </Button>
        </Box>
      </Box>

      {groupedCoupons.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1">
            {t('messages.no_coupons_found')}
          </Typography>
        </Box>
      ) : isMobile ? (
        // Card view for mobile devices
        <Box sx={{ width: '100%' }}>
          <Grid container spacing={2}>
            {groupedCoupons.map((coupon) => (
              <Grid item xs={12} key={coupon.id}>
                <Card variant="outlined" sx={{ 
                  mb: 1, 
                  bgcolor: isExpired(coupon.expirationDate) ? 'rgba(211, 47, 47, 0.08)' : 
                          isUsed(coupon.currentValue) ? 'rgba(158, 158, 158, 0.15)' : 'inherit'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {coupon.retailer}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {isExpired(coupon.expirationDate) && (
                          <Chip 
                            label={t('status.expired')} 
                            size="small" 
                            color="error" 
                            sx={{ height: 24 }}
                          />
                        )}
                        {isUsed(coupon.currentValue) && (
                          <Chip 
                            label={t('status.used')} 
                            size="small" 
                            color="default" 
                            sx={{ height: 24 }}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          {t('form.initial_value')}:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1">
                            ${coupon.initialValue}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          {t('form.current_value')}:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" sx={{ 
                            color: isUsed(coupon.currentValue) ? 'text.disabled' : 'text.primary'
                          }}>
                            ${coupon.currentValue}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          {t('tables.expires')}:
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: isExpired(coupon.expirationDate) ? 'error.main' : 'text.primary'
                        }}>
                          {formatDate(coupon.expirationDate)}
                        </Typography>
                      </Grid>
                      {coupon.activationCode && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            {t('form.activation_code')}:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {coupon.activationCode}
                            </Typography>
                            <Tooltip title={t('actions.copy_to_clipboard')}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleCopyToClipboard(coupon.activationCode)}
                                color={copiedText === coupon.activationCode ? 'primary' : 'default'}
                                aria-label={t('actions.copy_to_clipboard')}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Grid>
                      )}
                      {coupon.pin && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            {t('form.pin')}:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {coupon.pin}
                            </Typography>
                            <Tooltip title={t('actions.copy_to_clipboard')}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleCopyToClipboard(coupon.pin)}
                                color={copiedText === coupon.pin ? 'primary' : 'default'}
                                aria-label={t('actions.copy_to_clipboard')}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 0.5 }}>
                      <Tooltip title={t('actions.edit')}>
                        <span>
                          <IconButton
                            size="small" 
                            onClick={() => onUpdateCoupon(coupon)}
                            disabled={isUsed(coupon.currentValue)}
                            aria-label={t('actions.edit')}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      {!isUsed(coupon.currentValue) && (
                        <>
                          <Tooltip title={t('actions.partial_use')}>
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handlePartialUseOpen(coupon.id)}
                                disabled={isUsed(coupon.currentValue)}
                                aria-label={t('actions.partial_use')}
                              >
                                <PaymentIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={t('actions.mark_as_used')}>
                            <span>
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => onMarkAsUsed(coupon.id)}
                                disabled={isUsed(coupon.currentValue)}
                                aria-label={t('actions.mark_as_used')}
                              >
                                <MoneyOffIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        // Table view for larger screens
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
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
                  key={coupon.id}
                  sx={{ 
                    bgcolor: isExpired(coupon.expirationDate) ? 'rgba(211, 47, 47, 0.08)' : 
                            isUsed(coupon.currentValue) ? 'rgba(158, 158, 158, 0.15)' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {coupon.retailer}
                      {isExpired(coupon.expirationDate) && (
                        <Chip label={t('status.expired')} size="small" color="error" />
                      )}
                      {isUsed(coupon.currentValue) && (
                        <Chip label={t('status.used')} size="small" color="default" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title={`Initial value: $${coupon.initialValue}`} arrow>
                        <Typography
                          variant="body2"
                          sx={{ 
                            color: isUsed(coupon.currentValue) ? 'text.disabled' : 'text.primary'
                          }}
                        >
                          ${coupon.currentValue}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ 
                        color: isExpired(coupon.expirationDate) ? 'error.main' : 'text.primary'
                      }}
                    >
                      {formatDate(coupon.expirationDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {coupon.activationCode ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {coupon.activationCode}
                        <Tooltip title={t('actions.copy_to_clipboard')}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleCopyToClipboard(coupon.activationCode)}
                            color={copiedText === coupon.activationCode ? 'primary' : 'default'}
                            aria-label={t('actions.copy_to_clipboard')}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      t('general.not_applicable')
                    )}
                  </TableCell>
                  <TableCell>
                    {coupon.pin ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {coupon.pin}
                        <Tooltip title={t('actions.copy_to_clipboard')}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleCopyToClipboard(coupon.pin)}
                            color={copiedText === coupon.pin ? 'primary' : 'default'}
                            aria-label={t('actions.copy_to_clipboard')}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      t('general.not_applicable')
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title={t('actions.edit')}>
                        <span>
                          <IconButton
                            size="small" 
                            onClick={() => onUpdateCoupon(coupon)}
                            disabled={isUsed(coupon.currentValue)}
                            aria-label={t('actions.edit')}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      {!isUsed(coupon.currentValue) && (
                        <>
                          <Tooltip title={t('actions.partial_use')}>
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handlePartialUseOpen(coupon.id)}
                                disabled={isUsed(coupon.currentValue)}
                                aria-label={t('actions.partial_use')}
                              >
                                <PaymentIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={t('actions.mark_as_used')}>
                            <span>
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => onMarkAsUsed(coupon.id)}
                                disabled={isUsed(coupon.currentValue)}
                                aria-label={t('actions.mark_as_used')}
                              >
                                <MoneyOffIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Partial Use Dialog */}
      <Dialog open={partialUseDialogOpen} onClose={handlePartialUseClose}>
        <DialogTitle>{t('actions.partial_use')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('dialog.enter_amount_to_use')}:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={t('dialog.amount_to_use')}
            type="number"
            fullWidth
            variant="outlined"
            value={partialUseAmount}
            onChange={(e) => setPartialUseAmount(e.target.value)}
            inputProps={{ 
              min: 0.01,
              max: selectedCouponId ? coupons.find(c => c.id === selectedCouponId)?.currentValue : 0,
              step: 0.01
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Tooltip title={t('actions.cancel')}>
              <IconButton onClick={handlePartialUseClose} color="inherit" aria-label={t('actions.cancel')}>
                <CancelIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('actions.save')}>
              <IconButton onClick={handlePartialUseSubmit} color="primary" aria-label={t('actions.save')}>
                <SaveIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {t('notifications.copied_to_clipboard')}
        </Alert>
      </Snackbar>
    </>
  )
};

CouponList.propTypes = {
  coupons: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      retailer: PropTypes.string.isRequired,
      initialValue: PropTypes.string.isRequired,
      currentValue: PropTypes.string.isRequired,
      expirationDate: PropTypes.string.isRequired,
      activationCode: PropTypes.string,
      pin: PropTypes.string
    })
  ).isRequired,
  onUpdateCoupon: PropTypes.func.isRequired,
  onMarkAsUsed: PropTypes.func.isRequired,
  retailerFilter: PropTypes.string,
  setRetailerFilter: PropTypes.func.isRequired,
  defaultSort: PropTypes.shape({
    field: PropTypes.string,
    order: PropTypes.oneOf(['asc', 'desc'])
  })
};

export default CouponList;