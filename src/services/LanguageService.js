// Language translations
const translations = {
  en: {
    // App
    coupon_manager: 'Coupon Manager',
    add_coupon: 'Add Coupon',
    coupons: 'Coupons',
    retailers: 'Retailers',
    
    // Form fields
    retailer: 'Retailer',
    initial_value: 'Initial Value',
    current_value: 'Current Value',
    expiration_date: 'Expiration Date',
    activation_code: 'Activation Code',
    pin: 'PIN',
    
    // Actions
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    mark_as_used: 'Mark as Used',
    partial_use: 'Partial Use',
    scan_barcode: 'Scan Barcode',
    
    // Filter
    filter: 'Filter',
    filter_by_retailer: 'Filter by Retailer',
    filter_by_amount: 'Filter by Amount',
    filter_by_status: 'Filter by Status',
    clear_filters: 'Clear Filters',
    
    // Statuses
    active: 'Active',
    expired: 'Expired',
    used: 'Used',
    
    // Others
    total_value: 'Total Value',
    active_coupons: 'Active Coupons',
    expired_coupons: 'Expired Coupons',
    language: 'Language',
    
    // Error messages
    error_accessing_camera: 'Error accessing camera',
    invalid_qr_format: 'Invalid QR code format',
    missing_required_fields: 'Missing required fields',
  },
  es: {
    // App
    coupon_manager: 'Gestor de Cupones',
    add_coupon: 'Añadir Cupón',
    coupons: 'Cupones',
    retailers: 'Comerciantes',
    
    // Form fields
    retailer: 'Comerciante',
    initial_value: 'Valor Inicial',
    current_value: 'Valor Actual',
    expiration_date: 'Fecha de Vencimiento',
    activation_code: 'Código de Activación',
    pin: 'PIN',
    
    // Actions
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    mark_as_used: 'Marcar como Usado',
    partial_use: 'Uso Parcial',
    scan_barcode: 'Escanear Código',
    
    // Filter
    filter: 'Filtrar',
    filter_by_retailer: 'Filtrar por Comerciante',
    filter_by_amount: 'Filtrar por Cantidad',
    filter_by_status: 'Filtrar por Estado',
    clear_filters: 'Limpiar Filtros',
    
    // Statuses
    active: 'Activo',
    expired: 'Expirado',
    used: 'Usado',
    
    // Others
    total_value: 'Valor Total',
    active_coupons: 'Cupones Activos',
    expired_coupons: 'Cupones Expirados',
    language: 'Idioma',
    
    // Error messages
    error_accessing_camera: 'Error al acceder a la cámara',
    invalid_qr_format: 'Formato de código QR inválido',
    missing_required_fields: 'Faltan campos obligatorios',
  },
  fr: {
    // App
    coupon_manager: 'Gestionnaire de Coupons',
    add_coupon: 'Ajouter un Coupon',
    coupons: 'Coupons',
    retailers: 'Détaillants',
    
    // Form fields
    retailer: 'Détaillant',
    initial_value: 'Valeur Initiale',
    current_value: 'Valeur Actuelle',
    expiration_date: 'Date d\'Expiration',
    activation_code: 'Code d\'Activation',
    pin: 'PIN',
    
    // Actions
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    mark_as_used: 'Marquer comme Utilisé',
    partial_use: 'Utilisation Partielle',
    scan_barcode: 'Scanner le Code-barres',
    
    // Filter
    filter: 'Filtrer',
    filter_by_retailer: 'Filtrer par Détaillant',
    filter_by_amount: 'Filtrer par Montant',
    filter_by_status: 'Filtrer par Statut',
    clear_filters: 'Effacer les Filtres',
    
    // Statuses
    active: 'Actif',
    expired: 'Expiré',
    used: 'Utilisé',
    
    // Others
    total_value: 'Valeur Totale',
    active_coupons: 'Coupons Actifs',
    expired_coupons: 'Coupons Expirés',
    language: 'Langue',
    
    // Error messages
    error_accessing_camera: 'Erreur d\'accès à la caméra',
    invalid_qr_format: 'Format de code QR invalide',
    missing_required_fields: 'Champs obligatoires manquants',
  },
  de: {
    // App
    coupon_manager: 'Gutschein-Manager',
    add_coupon: 'Gutschein Hinzufügen',
    coupons: 'Gutscheine',
    retailers: 'Händler',
    
    // Form fields
    retailer: 'Händler',
    initial_value: 'Anfangswert',
    current_value: 'Aktueller Wert',
    expiration_date: 'Ablaufdatum',
    activation_code: 'Aktivierungscode',
    pin: 'PIN',
    
    // Actions
    save: 'Speichern',
    cancel: 'Abbrechen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    mark_as_used: 'Als Benutzt Markieren',
    partial_use: 'Teilweise Verwendung',
    scan_barcode: 'Barcode Scannen',
    
    // Filter
    filter: 'Filter',
    filter_by_retailer: 'Nach Händler Filtern',
    filter_by_amount: 'Nach Betrag Filtern',
    filter_by_status: 'Nach Status Filtern',
    clear_filters: 'Filter Löschen',
    
    // Statuses
    active: 'Aktiv',
    expired: 'Abgelaufen',
    used: 'Benutzt',
    
    // Others
    total_value: 'Gesamtwert',
    active_coupons: 'Aktive Gutscheine',
    expired_coupons: 'Abgelaufene Gutscheine',
    language: 'Sprache',
    
    // Error messages
    error_accessing_camera: 'Fehler beim Zugriff auf die Kamera',
    invalid_qr_format: 'Ungültiges QR-Code-Format',
    missing_required_fields: 'Erforderliche Felder fehlen',
  }
};

// List of supported languages
const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }
];

// Default language
const DEFAULT_LANGUAGE = 'en';

// Get all supported languages
export const getSupportedLanguages = () => supportedLanguages;

// Translate a specific key to the current language
export const translateText = (key, language) => {
  // If language is not supported, fallback to English
  if (!translations[language]) {
    language = DEFAULT_LANGUAGE;
  }
  
  // If translation exists, return it. Otherwise return the key itself
  return translations[language][key] || key;
};

// Language service singleton
class LanguageService {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || DEFAULT_LANGUAGE;
  }
  
  getCurrentLanguage() {
    return this.currentLanguage;
  }
  
  setCurrentLanguage(language) {
    if (translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('language', language);
    }
    return this.currentLanguage;
  }
  
  translate(key) {
    return translateText(key, this.currentLanguage);
  }
}

export const languageService = new LanguageService(); 