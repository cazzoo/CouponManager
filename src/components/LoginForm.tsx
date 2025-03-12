import React, { useState, ChangeEvent, FormEvent, FocusEvent } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, 
  CircularProgress, Alert, Container, Divider,
  Tabs, Tab, FormHelperText
} from '@mui/material';
import { useAuth } from '../services/AuthContext';
import { useLanguage } from '../services/LanguageContext';

/**
 * Validation errors interface for form fields
 */
interface ValidationErrors {
  email?: string;
  password?: string;
  [key: string]: string | undefined;
}

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
const LoginForm: React.FC = () => {
  // Get authentication methods from context
  const { signIn, signUp, signInAnonymously, loading, error } = useAuth();
  // Get translation function
  const { t } = useLanguage();
  
  // Form state
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showPasswordRequirements, setShowPasswordRequirements] = useState<boolean>(false);

  const isSignUp = tabIndex === 1;

  // At the top of the component, add this console log
  console.log('LoginForm state:', { email, password: password ? '[MASKED]' : '', error, loading });

  /**
   * Handle tab change between sign in and sign up
   */
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTabIndex(newValue);
    setValidationErrors({});
  };

  /**
   * Validate form fields
   * @returns True if valid, false otherwise
   */
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    const isDevelopment = import.meta.env.DEV;
    
    if (!email.trim()) {
      errors.email = t('login.error_email_required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = t('login.error_email_invalid');
    }
    
    if (!password) {
      errors.password = t('login.error_password_required');
    } else if (!isDevelopment && password.length < 6) {
      // Only enforce password length in production
      errors.password = t('login.error_password_too_short');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   * @param e - Form submit event
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      console.log('Attempting login with:', { email });
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      // Don't reset the form on failure - the form will be unmounted on success
    } catch (err) {
      // Just catch the error to prevent unhandled promise rejection
      // The error state is managed by AuthContext
      console.log('Login failed:', err);
      // The form state is preserved because we don't reset it here
    }
  };

  /**
   * Handle anonymous sign in
   */
  const handleAnonymousSignIn = async (): Promise<void> => {
    await signInAnonymously();
  };

  /**
   * Handle input field changes
   * @param e - Change event
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    
    // Clear validation errors for the field being edited
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: undefined
      });
    }
    
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
  };

  /**
   * Handle blur events for validation
   * @param field - Field name
   */
  const handleBlur = (field: string): void => {
    if (field === 'password' && isSignUp) {
      setShowPasswordRequirements(true);
    }
    
    // For other fields, do inline validation
    if (email && field === 'email' && !/\S+@\S+\.\S+/.test(email)) {
      setValidationErrors({
        ...validationErrors,
        email: t('login.error_email_invalid')
      });
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
            {t('app.coupon_manager')}
          </Typography>
          <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label={t('login.sign_in')} />
            <Tab label={t('login.sign_up')} />
          </Tabs>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            name="email"
            label={t('login.email_label')}
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleInputChange}
            onBlur={() => handleBlur('email')}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            type="password"
            id="password"
            label={t('login.password_label')}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            value={password}
            onChange={handleInputChange}
            onBlur={() => handleBlur('password')}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
          />
          
          {isSignUp && showPasswordRequirements && (
            <FormHelperText>
              {t('login.password_requirements')}
            </FormHelperText>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {typeof error === 'string' ? error : t('login.error_general')}
            </Alert>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              isSignUp ? t('login.sign_up') : t('login.sign_in')
            )}
          </Button>
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('login.or_divider')}
            </Typography>
          </Divider>
          
          <Button
            fullWidth
            variant="outlined"
            onClick={handleAnonymousSignIn}
            disabled={loading}
          >
            {t('login.continue_as_guest')}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginForm; 