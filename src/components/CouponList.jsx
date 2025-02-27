import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  TextField, Box, MenuItem, TableSortLabel, Button, Autocomplete, Typography, Card,
  CardContent, Grid, useMediaQuery, useTheme, Chip, Tooltip, Badge, FormControlLabel, Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
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

      {isMobile ? (
        // Card view for mobile devices
        <Box>
          {groupedCoupons.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
              No coupons found matching your filters.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {groupedCoupons.map((coupon) => (
                <Grid item xs={12} key={coupon.id}>
                  <Card variant="outlined" sx={{ 
                    mb: 1, 
                    bgcolor: isExpired(coupon.expirationDate) ? 'rgba(211, 47, 47, 0.08)' : 
                            isUsed(coupon.currentValue) ? 'rgba(158, 158, 158, 0.15)' : 'inherit',
                    borderColor: isExpired(coupon.expirationDate) ? 'error.main' : 
                                isUsed(coupon.currentValue) ? 'text.disabled' : 'inherit'
                  }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" component="div">
                          {coupon.retailer}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {isExpired(coupon.expirationDate) && (
                            <Chip label="Expired" color="error" size="small" />
                          )}
                          {isUsed(coupon.currentValue) && (
                            <Chip label="Used" color="default" size="small" />
                          )}
                          <Chip 
                            label={`$${coupon.currentValue}`} 
                            color={isUsed(coupon.currentValue) ? "default" : "primary"} 
                            size="small" 
                          />
                        </Box>
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        color={isExpired(coupon.expirationDate) ? "error.main" : "text.secondary"} 
                        sx={{ mb: 1 }}
                      >
                        Expires: {formatDate(coupon.expirationDate)}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Initial Value: ${coupon.initialValue} | Current Value: ${coupon.currentValue}
                      </Typography>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" display="block" color="text.secondary">
                            Activation Code
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {coupon.activationCode || 'N/A'}
                            </Typography>
                            {coupon.activationCode && (
                              <Tooltip title={copiedText === coupon.activationCode ? "Copied!" : "Copy to clipboard"}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleCopyToClipboard(coupon.activationCode)}
                                  color={copiedText === coupon.activationCode ? "success" : "default"}
                                >
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" display="block" color="text.secondary">
                            PIN
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {coupon.pin || 'N/A'}
                            </Typography>
                            {coupon.pin && (
                              <Tooltip title={copiedText === coupon.pin ? "Copied!" : "Copy to clipboard"}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleCopyToClipboard(coupon.pin)}
                                  color={copiedText === coupon.pin ? "success" : "default"}
                                >
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
                        <Button
                          startIcon={<EditIcon />}
                          size="small"
                          onClick={() => onUpdateCoupon(coupon)}
                        >
                          Edit
                        </Button>
                        {!isUsed(coupon.currentValue) && (
                          <Button
                            startIcon={<MoneyOffIcon />}
                            size="small"
                            color="secondary"
                            onClick={() => onMarkAsUsed(coupon.id)}
                          >
                            Mark as Used
                          </Button>
                        )}
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
          <Table stickyHeader sx={{ minWidth: { sm: 650, md: 800 } }}>
            <TableHead sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper' }}>
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
                <TableCell>Initial Value</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'expirationDate'}
                    direction={orderBy === 'expirationDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('expirationDate')}
                  >
                    Expiration Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Activation Code</TableCell>
                <TableCell>PIN</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groupedCoupons.map((coupon) => (
                <TableRow 
                  key={coupon.id} 
                  sx={{ 
                    bgcolor: isExpired(coupon.expirationDate) ? 'rgba(211, 47, 47, 0.08)' : 
                            isUsed(coupon.currentValue) ? 'rgba(158, 158, 158, 0.15)' : 'inherit',
                    '& .MuiTableCell-root': {
                      borderColor: isExpired(coupon.expirationDate) ? 'error.main' : 
                                  isUsed(coupon.currentValue) ? 'text.disabled' : 'inherit'
                    }
                  }}
                >
                  <TableCell>{coupon.retailer}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      ${coupon.currentValue}
                      {isUsed(coupon.currentValue) && (
                        <Chip label="Used" color="default" size="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>${coupon.initialValue}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography color={isExpired(coupon.expirationDate) ? "error.main" : "inherit"}>
                        {formatDate(coupon.expirationDate)}
                      </Typography>
                      {isExpired(coupon.expirationDate) && (
                        <Chip label="Expired" color="error" size="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mr: 1 }}>{coupon.activationCode || 'N/A'}</Typography>
                      {coupon.activationCode && (
                        <Tooltip title={copiedText === coupon.activationCode ? "Copied!" : "Copy to clipboard"}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleCopyToClipboard(coupon.activationCode)}
                            color={copiedText === coupon.activationCode ? "success" : "default"}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mr: 1 }}>{coupon.pin || 'N/A'}</Typography>
                      {coupon.pin && (
                        <Tooltip title={copiedText === coupon.pin ? "Copied!" : "Copy to clipboard"}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleCopyToClipboard(coupon.pin)}
                            color={copiedText === coupon.pin ? "success" : "default"}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => onUpdateCoupon(coupon)}
                        color="primary"
                        size="small"
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      {!isUsed(coupon.currentValue) && (
                        <IconButton
                          onClick={() => onMarkAsUsed(coupon.id)}
                          color="secondary"
                          size="small"
                          title="Mark as Used"
                        >
                          <MoneyOffIcon />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default CouponList;