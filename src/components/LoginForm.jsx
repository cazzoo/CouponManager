import React, { useState } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, 
  CircularProgress, Alert, Container, Divider,
  Tabs, Tab, FormHelperText
} from '@mui/material';
import { useAuth } from '../services/AuthContext';
import { useLanguage } from '../services/LanguageContext';

/**
 * Login and registration form component
 * Handles both sign in and sign up functionality in a compact layout
 * Uses Material-UI tabs for switching between modes
 * 
 * Features:
 * - Tab-based interface for clear visual distinction between sign-in and sign-up
 * - Compact layout with optimized spacing and margins
 * - Form validation for email and password fields
 * - Loading indicators during authentication
 * - Error message display
 * - Anonymous sign-in option
 * - Full internationalization support
 */
const LoginForm = () => {
  // Get authentication methods from context
  const { signIn, signUp, signInAnonymously, loading, error } = useAuth();
  // Get translation function
  const { t } = useLanguage();
  
  // Form state
  const [tabIndex, setTabIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const isSignUp = tabIndex === 1;

  /**
   * Handle tab change between sign in and sign up
   */
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setValidationErrors({});
  };

  /**
   * Validate form fields
   * @returns {boolean} True if valid, false otherwise
   */
  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = t('login.error_email_required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = t('login.error_email_invalid');
    }
    
    if (!password) {
      errors.password = t('login.error_password_required');
    } else if (password.length < 6) {
      errors.password = t('login.error_password_too_short');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
  };

  /**
   * Handle anonymous sign in
   */
  const handleAnonymousSignIn = async () => {
    await signInAnonymously();
  };

  // Handle input change and validate on blur
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
      if (isSignUp && !showPasswordRequirements) {
        setShowPasswordRequirements(true);
      }
    }
  };

  // Validate specific field on blur
  const handleBlur = (field) => {
    const errors = { ...validationErrors };
    
    if (field === 'email') {
      if (!email.trim()) {
        errors.email = t('login.error_email_required');
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = t('login.error_email_invalid');
      } else {
        delete errors.email;
      }
    }
    
    if (field === 'password') {
      if (!password) {
        errors.password = t('login.error_password_required');
      } else if (password.length < 6) {
        errors.password = t('login.error_password_too_short');
      } else {
        delete errors.password;
      }
    }
    
    setValidationErrors(errors);
  };

  return (
    <Container component="main" maxWidth="xs" data-testid="login-form">
      <Paper elevation={3} sx={{ mt: 4, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
            {t('app.coupon_manager')}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 1, textAlign: 'center', fontSize: '0.875rem' }}>
            {t('login.welcome_message')}
          </Typography>
          
          <Box sx={{ width: '100%', mb: 1 }}>
            <Tabs 
              value={tabIndex} 
              onChange={handleTabChange} 
              variant="fullWidth" 
              aria-label="login options"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                mb: 1
              }}
            >
              <Tab 
                label={t('login.sign_in')} 
                id="tab-signin"
                aria-controls="tabpanel-signin" 
              />
              <Tab 
                label={t('login.sign_up')} 
                id="tab-signup"
                aria-controls="tabpanel-signup" 
              />
            </Tabs>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mt: 1, width: '100%', mb: 1, py: 0 }}>
              {error.message}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }} role="tabpanel" noValidate>
            <TextField
              margin="dense"
              required
              fullWidth
              id="email"
              label={t('login.email_label')}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleInputChange}
              onBlur={() => handleBlur('email')}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              disabled={loading}
              size="small"
              inputProps={{ 
                'aria-label': t('login.email_label'),
              }}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              name="password"
              label={t('login.password_label')}
              type="password"
              id="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={handleInputChange}
              onBlur={() => handleBlur('password')}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              disabled={loading}
              size="small"
              inputProps={{ 
                'aria-label': t('login.password_label'),
              }}
            />
            
            {isSignUp && showPasswordRequirements && !validationErrors.password && (
              <FormHelperText sx={{ ml: 1.5, mb: 1, mt: 0 }}>
                {t('login.password_requirements')}
              </FormHelperText>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 2, 
                mb: 1,
                bgcolor: isSignUp ? 'success.main' : 'primary.main',
                '&:hover': {
                  bgcolor: isSignUp ? 'success.dark' : 'primary.dark',
                }
              }}
              disabled={loading}
              size="medium"
            >
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                isSignUp ? t('login.sign_up') : t('login.sign_in')
              )}
            </Button>

            <Divider sx={{ my: 1, fontSize: '0.75rem' }}>{t('login.or_divider')}</Divider>
            
            <Button
              fullWidth
              variant="outlined"
              onClick={handleAnonymousSignIn}
              disabled={loading}
              sx={{ mb: 1 }}
              size="medium"
            >
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                t('login.continue_as_guest')
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginForm; 