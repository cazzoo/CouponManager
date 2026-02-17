import React, { useState, ChangeEvent, FormEvent, FocusEvent } from 'react';
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
    <div className="container mx-auto max-w-xs">
      <div className="card bg-base-100 shadow-xl p-4 mt-8">
        <div className="mb-2 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-1">
            {t('app.coupon_manager')}
          </h1>
          <div className="tabs tabs-boxed mb-2">
            <a
              className={`tab ${tabIndex === 0 ? 'tab-active' : ''}`}
              onClick={(e) => handleTabChange(e, 0)}
              data-testid="signin-tab"
            >
              {t('login.sign_in')}
            </a>
            <a
              className={`tab ${tabIndex === 1 ? 'tab-active' : ''}`}
              onClick={(e) => handleTabChange(e, 1)}
              data-testid="signup-tab"
            >
              {t('login.sign_up')}
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} data-testid="login-form">
          <div className="form-control">
            <label className="label" htmlFor="email">
              <span className="label-text">{t('login.email_label')}</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`input input-bordered w-full ${validationErrors.email ? 'input-error' : ''}`}
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleInputChange}
              onBlur={() => handleBlur('email')}
              data-testid="username-input"
            />
            {validationErrors.email && (
              <label className="label">
                <span className="label-text-alt text-error">{validationErrors.email}</span>
              </label>
            )}
          </div>

          <div className="form-control mt-2">
            <label className="label" htmlFor="password">
              <span className="label-text">{t('login.password_label')}</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`input input-bordered w-full ${validationErrors.password ? 'input-error' : ''}`}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={handleInputChange}
              onBlur={() => handleBlur('password')}
              data-testid="password-input"
            />
            {validationErrors.password && (
              <label className="label">
                <span className="label-text-alt text-error">{validationErrors.password}</span>
              </label>
            )}
          </div>

          {isSignUp && showPasswordRequirements && (
            <label className="label">
              <span className="label-text-alt">{t('login.password_requirements')}</span>
            </label>
          )}

          {error && (
            <div className="alert alert-error mt-2" data-testid="login-error-message">
              <span>{typeof error === 'string' ? error : t('login.error_general')}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full mt-3 mb-2"
            disabled={loading}
            data-testid="login-submit-button"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" role="progressbar" aria-label="Loading"></span>
            ) : (
              isSignUp ? t('login.sign_up') : t('login.sign_in')
            )}
          </button>
          
          <div className="divider my-2">
            {t('login.or_divider')}
          </div>
          
          <button
            type="button"
            className="btn btn-outline w-full"
            onClick={handleAnonymousSignIn}
            disabled={loading}
            data-testid="anonymous-signin-button"
          >
            {t('login.continue_as_guest')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm; 