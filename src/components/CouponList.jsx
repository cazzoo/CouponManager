import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  TextField, Box, TableSortLabel, Button, Autocomplete, Typography, Card,
  CardContent, Grid, useMediaQuery, useTheme, Chip, Tooltip, FormControlLabel, Checkbox,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import PaymentIcon from '@mui/icons-material/Payment';
import { format } from 'date-fns';

const CouponList = ({ coupons, onUpdateCoupon, onMarkAsUsed, retailerFilter, setRetailerFilter, defaultSort }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    if (text && text !== 'N/A') {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedText(text);
          setTimeout(() => setCopiedText(''), 2000);
        })
        .catch(err => console.error('Failed to copy text: ', err));
    }
  };

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      retailer: retailerFilter || ''
    }));
  }, [retailerFilter]);

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MM/dd/yyyy');
    } catch (error) {
      return 'Invalid Date';
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
              label="Filter by Retailer"
              placeholder="Type retailer name here"
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
            label="Min Amount"
            name="minAmount"
            type="number"
            value={filters.minAmount}
            onChange={handleFilterChange}
            size="small"
            sx={{ flex: 1 }}
          />
          <TextField
            label="Max Amount"
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
            label="Show Expired"
          />
          <Button
            variant="outlined"
            onClick={() => {
              setFilters({ retailer: '', minAmount: '', maxAmount: '' });
              setShowExpired(false);
            }}
            size="small"
            sx={{ height: 40 }}
            fullWidth={isMobile}
          >
            Clear Filters
          </Button>
        </Box>
      </Box>

      {groupedCoupons.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1">
            No coupons found matching your filters.
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
                            label="Expired" 
                            size="small" 
                            color="error" 
                            sx={{ height: 24 }}
                          />
                        )}
                        {isUsed(coupon.currentValue) && (
                          <Chip 
                            label="Used" 
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
                          Initial Value:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1">
                            ${coupon.initialValue}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Current Value:
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
                          Expires:
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
                            Activation Code:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {coupon.activationCode}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => handleCopyToClipboard(coupon.activationCode)}
                              color={copiedText === coupon.activationCode ? 'primary' : 'default'}
                              title="Copy to clipboard"
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      )}
                      {coupon.pin && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            PIN:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {coupon.pin}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => handleCopyToClipboard(coupon.pin)}
                              color={copiedText === coupon.pin ? 'primary' : 'default'}
                              title="Copy to clipboard"
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
                      <Button
                        startIcon={<EditIcon />}
                        size="small" 
                        onClick={() => onUpdateCoupon(coupon)}
                        disabled={isUsed(coupon.currentValue)}
                        title="Edit"
                      >
                        Edit
                      </Button>
                      {!isUsed(coupon.currentValue) && (
                        <>
                          <Button
                            startIcon={<PaymentIcon />}
                            size="small"
                            color="primary"
                            onClick={() => handlePartialUseOpen(coupon.id)}
                            disabled={isUsed(coupon.currentValue)}
                            title="Partial Use"
                          >
                            Partial Use
                          </Button>
                          <Button
                            startIcon={<MoneyOffIcon />}
                            size="small"
                            color="secondary"
                            onClick={() => onMarkAsUsed(coupon.id)}
                            disabled={isUsed(coupon.currentValue)}
                            title="Mark as Used"
                          >
                            Mark as Used
                          </Button>
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
                    Retailer
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'amount'}
                    direction={orderBy === 'amount' ? order : 'asc'}
                    onClick={() => handleRequestSort('amount')}
                  >
                    Current Value
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'expirationDate'}
                    direction={orderBy === 'expirationDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('expirationDate')}
                  >
                    Expires
                  </TableSortLabel>
                </TableCell>
                <TableCell>Activation Code</TableCell>
                <TableCell>PIN</TableCell>
                <TableCell align="right">Actions</TableCell>
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
                        <Chip label="Expired" size="small" color="error" />
                      )}
                      {isUsed(coupon.currentValue) && (
                        <Chip label="Used" size="small" color="default" />
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
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopyToClipboard(coupon.activationCode)}
                          color={copiedText === coupon.activationCode ? 'primary' : 'default'}
                          title="Copy to clipboard"
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {coupon.pin ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {coupon.pin}
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopyToClipboard(coupon.pin)}
                          color={copiedText === coupon.pin ? 'primary' : 'default'}
                          title="Copy to clipboard"
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      startIcon={<EditIcon />}
                      size="small" 
                      onClick={() => onUpdateCoupon(coupon)}
                      disabled={isUsed(coupon.currentValue)}
                      title="Edit"
                    >
                      Edit
                    </Button>
                    {!isUsed(coupon.currentValue) && (
                      <>
                        <Button
                          startIcon={<PaymentIcon />}
                          size="small"
                          color="primary"
                          onClick={() => handlePartialUseOpen(coupon.id)}
                          disabled={isUsed(coupon.currentValue)}
                          title="Partial Use"
                        >
                          Partial Use
                        </Button>
                        <Button
                          startIcon={<MoneyOffIcon />}
                          size="small"
                          color="secondary"
                          onClick={() => onMarkAsUsed(coupon.id)}
                          disabled={isUsed(coupon.currentValue)}
                          title="Mark as Used"
                        >
                          Mark as Used
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Partial Use Dialog */}
      <Dialog open={partialUseDialogOpen} onClose={handlePartialUseClose}>
        <DialogTitle>Partial Use</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter amount to use:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Amount to Use"
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
        <DialogActions>
          <Button onClick={handlePartialUseClose}>Cancel</Button>
          <Button onClick={handlePartialUseSubmit} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
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