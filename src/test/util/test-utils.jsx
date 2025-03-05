import React, { createContext, useContext } from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create a light theme instance
const theme = createTheme({
  palette: { mode: 'light' },
});

// Create a mock language context that matches the real one
export const MockLanguageContext = createContext();

// Add a mock AuthContext
export const MockAuthContext = createContext();

// Instead of just returning the key, provide basic translations for the most common keys
export const mockTranslate = (key, language = 'en', params = {}) => {
  const translations = {
    en: {
      'add_coupon.title': 'Add Coupon',
      'add_coupon.edit_title': 'Edit Coupon',
      'add_coupon.retailer': 'Retailer',
      'add_coupon.initial_value': 'Initial Value',
      'add_coupon.current_value': 'Current Value',
      'add_coupon.expiration_date': 'Expiration Date',
      'add_coupon.activation_code': 'Activation Code',
      'add_coupon.pin': 'PIN',
      'add_coupon.add_button': 'Add Coupon',
      'add_coupon.update_button': 'Update Coupon',
      'add_coupon.cancel': 'Cancel',
      'add_coupon.scan_barcode': 'Scan Barcode',
      'barcode_scanner.cancel': 'Cancel',
      'barcode_scanner.error': 'Error accessing camera',
      'scan_barcode': 'Scan Barcode',
      'cancel': 'Cancel',
      'error_accessing_camera': 'Error accessing camera',
      'language': 'Language',
      'coupon_manager': 'Coupon Manager',
      'add_coupon': 'Add Coupon',
      'coupons': 'Coupons',
      'statistics': 'Statistics',
      'list.show_expired': 'Show Expired',
      'list.min_amount': 'Min Amount',
      'list.max_amount': 'Max Amount',
      'list.retailer': 'Retailer',
      'list.filter_coupons': 'Filter Coupons',
      'list.value': 'Value',
      'list.expiration': 'Expiration',
      'list.actions': 'Actions',
      'list.mark_used': 'Mark as Used',
      'list.partial_use': 'Partial Use',
      'list.edit': 'Edit',
      'list.partial_use_dialog.title': 'Partial Use',
      'list.partial_use_dialog.amount_label': 'Amount to Use',
      'list.partial_use_dialog.amount_help': 'Enter amount to use:',
      'list.partial_use_dialog.submit': 'Submit',
      'list.partial_use_dialog.cancel': 'Cancel',
      'list.no_coupons': 'No coupons found',
      'list.no_coupons_hint': 'Try adjusting your filters or add a new coupon',
      // Login form translations
      'app.sign_out': 'Sign Out',
      'login.welcome_message': 'Welcome to Coupon Manager. Please sign in to view and manage your coupons.',
      'login.email_label': 'Email Address',
      'login.password_label': 'Password',
      'login.sign_in': 'Sign In',
      'login.sign_up': 'Sign Up',
      'login.need_account': 'Need an account? Create one',
      'login.have_account': 'Already have an account? Sign in',
      'login.or_divider': 'OR',
      'login.continue_as_guest': 'Continue as Guest'
    },
    es: {
      'add_coupon.title': 'Añadir Cupón',
      'add_coupon.edit_title': 'Editar Cupón',
      'add_coupon.retailer': 'Comerciante',
      'add_coupon.initial_value': 'Valor Inicial',
      'add_coupon.current_value': 'Valor Actual',
      'add_coupon.expiration_date': 'Fecha de Vencimiento',
      'add_coupon.activation_code': 'Código de Activación',
      'add_coupon.pin': 'PIN',
      'add_coupon.add_button': 'Añadir Cupón',
      'add_coupon.update_button': 'Actualizar Cupón',
      'add_coupon.cancel': 'Cancelar',
      'add_coupon.scan_barcode': 'Escanear Código',
      'barcode_scanner.cancel': 'Cancelar',
      'barcode_scanner.error': 'Error al acceder a la cámara',
      'scan_barcode': 'Escanear Código',
      'cancel': 'Cancelar',
      'error_accessing_camera': 'Error al acceder a la cámara',
      'language': 'Idioma',
      'coupon_manager': 'Gestor de Cupones',
      'add_coupon': 'Añadir Cupón',
      'coupons': 'Cupones',
      'statistics': 'Estadísticas',
      'list.show_expired': 'Mostrar Vencidos',
      'list.min_amount': 'Valor Mínimo',
      'list.max_amount': 'Valor Máximo',
      'list.retailer': 'Comerciante',
      'list.filter_coupons': 'Filtrar Cupones',
      'list.value': 'Valor',
      'list.expiration': 'Vencimiento',
      'list.actions': 'Acciones',
      'list.mark_used': 'Marcar como Usado',
      'list.partial_use': 'Uso Parcial',
      'list.edit': 'Editar',
      'list.partial_use_dialog.title': 'Uso Parcial',
      'list.partial_use_dialog.amount_label': 'Cantidad a Usar',
      'list.partial_use_dialog.amount_help': 'Ingrese la cantidad a usar:',
      'list.partial_use_dialog.submit': 'Enviar',
      'list.partial_use_dialog.cancel': 'Cancelar',
      'list.no_coupons': 'No se encontraron cupones',
      'list.no_coupons_hint': 'Ajuste los filtros o añada un nuevo cupón',
      // Login form translations
      'app.sign_out': 'Cerrar Sesión',
      'login.welcome_message': 'Bienvenido al Gestor de Cupones. Por favor, inicie sesión para ver y administrar sus cupones.',
      'login.email_label': 'Correo Electrónico',
      'login.password_label': 'Contraseña',
      'login.sign_in': 'Iniciar Sesión',
      'login.sign_up': 'Registrarse',
      'login.need_account': '¿Necesita una cuenta? Cree una',
      'login.have_account': '¿Ya tiene una cuenta? Inicie sesión',
      'login.or_divider': 'O',
      'login.continue_as_guest': 'Continuar como Invitado'
    }
  };
  
  // Get the translation or fall back to the key
  let result = (translations[language] && translations[language][key]) || key;
  
  // Replace any parameters in the translation
  if (params && Object.keys(params).length > 0) {
    Object.keys(params).forEach(paramKey => {
      result = result.replace(`{{${paramKey}}}`, params[paramKey]);
    });
  }
  
  return result;
};

// Mock the original LanguageContext from the app
export const mockUseLanguage = () => {
  const context = useContext(MockLanguageContext);
  if (!context) {
    throw new Error('mockUseLanguage must be used within a MockLanguageProvider');
  }
  return context;
};

// Mock the AuthContext for testing
export const mockUseAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('mockUseAuth must be used within a MockAuthProvider');
  }
  return context;
};

export const MockLanguageProvider = ({ children, initialLanguage = 'en' }) => {
  const [language, setLanguage] = React.useState(initialLanguage);
  
  const value = {
    language,
    changeLanguage: (newLang) => setLanguage(newLang),
    t: (key, params) => mockTranslate(key, language, params)
  };
  
  return (
    <MockLanguageContext.Provider value={value}>
      {children}
    </MockLanguageContext.Provider>
  );
};

// Create a mock AuthProvider component
export const MockAuthProvider = ({ children, initialAuthState = {} }) => {
  const [authState, setAuthState] = React.useState({
    user: { id: 'test-user-id', email: 'test@example.com' },
    loading: false,
    error: null,
    signIn: () => Promise.resolve({ user: { id: 'test-user-id', email: 'test@example.com' }, error: null }),
    signUp: () => Promise.resolve({ user: { id: 'test-user-id', email: 'test@example.com' }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    ...initialAuthState
  });

  return (
    <MockAuthContext.Provider value={authState}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const renderWithProviders = (ui, options = {}) => {
  const { wrapper: CustomWrapper, initialAuthState, ...rest } = options;
  
  const AllTheProviders = ({ children }) => {
    return (
      <ThemeProvider theme={theme}>
        <MockAuthProvider initialAuthState={initialAuthState}>
          {CustomWrapper ? (
            <CustomWrapper>{children}</CustomWrapper>
          ) : (
            <MockLanguageProvider>{children}</MockLanguageProvider>
          )}
        </MockAuthProvider>
      </ThemeProvider>
    );
  };
  
  return render(ui, { wrapper: AllTheProviders, ...rest });
};

// For direct mock usage in tests
export const MockUseLanguage = () => ({
  language: 'en',
  changeLanguage: () => {},
  t: (key, params) => mockTranslate(key, 'en', params)
});

// For direct mock usage in tests
export const MockUseAuth = () => ({
  user: { id: 'test-user-id', email: 'test@example.com' },
  loading: false,
  error: null,
  signIn: () => Promise.resolve({ user: { id: 'test-user-id', email: 'test@example.com' }, error: null }),
  signUp: () => Promise.resolve({ user: { id: 'test-user-id', email: 'test@example.com' }, error: null }),
  signOut: () => Promise.resolve({ error: null })
}); 