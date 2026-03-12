import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../../components/LoginForm';
import { AuthProvider } from '../../services/AuthContext';
import { LanguageProvider } from '../../services/LanguageContext';

const mockTranslations: Record<string, string> = {
  'app.coupon_manager': 'Coupon Manager',
  'login.sign_in': 'Sign In',
  'login.sign_up': 'Sign Up',
  'login.email_label': 'Email',
  'login.password_label': 'Password',
  'login.error_email_required': 'Email is required',
  'login.error_email_invalid': 'Invalid email format',
  'login.error_password_required': 'Password is required',
  'login.error_password_too_short': 'Password must be at least 6 characters',
  'login.error_general': 'An error occurred during authentication',
  'login.password_requirements': 'Password must be at least 6 characters',
  'login.or_divider': 'OR',
  'login.continue_as_guest': 'Continue as Guest'
};

vi.mock('../../services/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key: string) => (mockTranslations as Record<string, string>)[key] || key,
    changeLanguage: vi.fn()
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignInAnonymously = vi.fn();
const mockSignOut = vi.fn();
const mockHasPermission = vi.fn().mockResolvedValue(false);
let mockAuthError: string | null = null;
let mockLoading = false;

vi.mock('../../services/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    userRole: null,
    loading: mockLoading,
    error: mockAuthError,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signInAnonymously: mockSignInAnonymously,
    signOut: mockSignOut,
    hasPermission: mockHasPermission
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthError = null;
    mockLoading = false;
  });

  function renderLoginForm() {
    return render(
      <LanguageProvider>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </LanguageProvider>
    );
  };

  describe('Rendering', () => {
    it('should render the login form with title', () => {
      renderLoginForm();

      expect(screen.getByText('Coupon Manager')).toBeInTheDocument();
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('should render email and password inputs', () => {
      renderLoginForm();

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByTestId('username-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
    });

    it('should render sign in and sign up tabs', () => {
      renderLoginForm();

      expect(screen.getAllByText('Sign In')).toHaveLength(2);
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('should render submit button with Sign In text initially', () => {
      renderLoginForm();

      const submitButton = screen.getByTestId('login-submit-button');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Sign In');
    });

    it('should render anonymous sign in button', () => {
      renderLoginForm();

      expect(screen.getByText('Continue as Guest')).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('should switch to sign up tab when clicking Sign Up tab', async () => {
      renderLoginForm();
      const user = userEvent.setup();

      const signUpTab = screen.getByText('Sign Up');
      await user.click(signUpTab);

      const submitButton = screen.getByTestId('login-submit-button');
      expect(submitButton).toHaveTextContent('Sign Up');
    });

    it('should switch back to sign in tab when clicking Sign In tab', async () => {
      renderLoginForm();
      const user = userEvent.setup();

      const signUpTab = screen.getByText('Sign Up');
      await user.click(signUpTab);

      const signInTab = screen.getByText('Sign In');
      await user.click(signInTab);

      const submitButton = screen.getByTestId('login-submit-button');
      expect(submitButton).toHaveTextContent('Sign In');
    });

    it('should clear validation errors when switching tabs', async () => {
      renderLoginForm();
      const user = userEvent.setup();

      const submitButton = screen.getByTestId('login-submit-button');
      await user.click(submitButton);

      expect(screen.getByText('Email is required')).toBeInTheDocument();

      const signUpTab = screen.getByText('Sign Up');
      await user.click(signUpTab);

      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation - Sign In Mode', () => {
    it('should show validation errors when submitting empty form', async () => {
      renderLoginForm();
      const user = userEvent.setup();

      const submitButton = screen.getByTestId('login-submit-button');
      await user.click(submitButton);

      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('should show email validation error for invalid email format', async () => {
      renderLoginForm();
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });

    it('should clear email validation error when user starts typing', async () => {
      renderLoginForm();
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'invalid');
      await user.tab();
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();

      await user.clear(emailInput);
      await user.type(emailInput, 'valid@email.com');

      await waitFor(() => {
        expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation - Sign Up Mode', () => {
    it('should show password requirements hint on blur in sign up mode', async () => {
      renderLoginForm();
      const user = userEvent.setup();

      const signUpTab = screen.getByText('Sign Up');
      await user.click(signUpTab);

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, '123');
      await user.tab();

      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    it('should validate password length in production mode', async () => {
      const originalDev = import.meta.env.DEV;

      renderLoginForm();
      const user = userEvent.setup();

      const signUpTab = screen.getByText('Sign Up');
      await user.click(signUpTab);

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, '12345');

      const submitButton = screen.getByTestId('login-submit-button');
      await user.click(submitButton);

      (import.meta.env as any).DEV = originalDev;
    });
  });

  describe('Sign In Flow', () => {
    it('should call signIn with email and password on successful submission', async () => {
      mockSignIn.mockResolvedValue({ success: true });

      renderLoginForm();
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByTestId('login-submit-button');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should show loading spinner during sign in', async () => {
      mockLoading = true;
      renderLoginForm();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByTestId('login-submit-button')).toBeDisabled();
    });

    it('should display error message when sign in fails', async () => {
      const errorMessage = 'Invalid credentials';
      mockAuthError = errorMessage;
      mockSignIn.mockResolvedValue({ success: false, error: errorMessage });

      renderLoginForm();

      expect(screen.getByTestId('login-error-message')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not submit form with invalid email', async () => {
      renderLoginForm();
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByTestId('login-submit-button');

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe('Sign Up Flow', () => {
    it('should call signUp with email and password in sign up mode', async () => {
      mockSignUp.mockResolvedValue({ success: true });

      renderLoginForm();
      const user = userEvent.setup();

      const signUpTab = screen.getByText('Sign Up');
      await user.click(signUpTab);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByTestId('login-submit-button');

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'password123');
      });
    });

    it('should show loading spinner during sign up', async () => {
      mockLoading = true;
      renderLoginForm();
      const user = userEvent.setup();

      // Switch to sign-up tab first
      await user.click(screen.getByText('Sign Up'));

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByTestId('login-submit-button')).toBeDisabled();
    });

    it('should display error message when sign up fails', async () => {
      const errorMessage = 'User already exists';
      mockAuthError = errorMessage;
      mockSignUp.mockResolvedValue({ success: false, error: errorMessage });

      renderLoginForm();

      expect(screen.getByTestId('login-error-message')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Anonymous Sign In', () => {
    it('should call signInAnonymously when clicking Continue as Guest', async () => {
      mockSignInAnonymously.mockResolvedValue({ success: true });

      renderLoginForm();
      const user = userEvent.setup();

      const guestButton = screen.getByText('Continue as Guest');
      await user.click(guestButton);

      await waitFor(() => {
        expect(mockSignInAnonymously).toHaveBeenCalled();
      });
    });

    it('should disable guest button during loading', () => {
      mockLoading = true;
      renderLoginForm();

      expect(screen.getByTestId('anonymous-signin-button')).toBeDisabled();
    });

    it('should display error message when anonymous sign in fails', async () => {
      const errorMessage = 'Anonymous sign in not available';
      mockAuthError = errorMessage;
      mockSignInAnonymously.mockResolvedValue({ success: false, error: errorMessage });

      renderLoginForm();

      expect(screen.getByTestId('login-error-message')).toBeInTheDocument();
    });
  });

  describe('Form State Management', () => {
    it('should maintain form values during failed authentication', () => {
      const errorMessage = 'Invalid credentials';
      mockAuthError = errorMessage;
      mockSignIn.mockResolvedValue({ success: false, error: errorMessage });

      renderLoginForm();

      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
      expect(screen.getByTestId('login-error-message')).toBeInTheDocument();
    });

    it('should disable submit button during loading', async () => {
      mockLoading = true;
      renderLoginForm();

      expect(screen.getByTestId('login-submit-button')).toBeDisabled();
    });

    it('should have proper autoComplete attributes', () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
    });

    it('should have autoComplete="new-password" in sign up mode', async () => {
      renderLoginForm();
      const user = userEvent.setup();

      const signUpTab = screen.getByText('Sign Up');
      await user.click(signUpTab);

      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
    });

    it('should apply input-error class when validation fails', async () => {
      renderLoginForm();
      const user = userEvent.setup();

      const emailInput = screen.getByTestId('username-input');
      await user.click(emailInput);
      await user.tab();

      const submitButton = screen.getByTestId('login-submit-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toHaveClass('input-error');
      });
    });
  });
});
