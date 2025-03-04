import i18n, { supportedLanguages } from '../../i18n';

describe('i18n Configuration', () => {
  test('i18n is properly initialized', () => {
    // Check if i18n object is correctly configured
    expect(i18n).toBeDefined();
    expect(i18n.language).toBeDefined();
    expect(i18n.changeLanguage).toBeDefined();
  });

  test('supportedLanguages contains expected languages', () => {
    // Check if supported languages are correctly defined
    expect(supportedLanguages).toBeInstanceOf(Array);
    expect(supportedLanguages.length).toBe(4);
    
    // Check specific languages
    expect(supportedLanguages).toContainEqual({ code: 'en', name: 'English' });
    expect(supportedLanguages).toContainEqual({ code: 'es', name: 'Spanish' });
    expect(supportedLanguages).toContainEqual({ code: 'fr', name: 'French' });
    expect(supportedLanguages).toContainEqual({ code: 'de', name: 'German' });
  });

  test('i18n has correct configuration options', () => {
    // Test basic configuration - handle array fallbackLng
    expect(Array.isArray(i18n.options.fallbackLng) ? i18n.options.fallbackLng[0] : i18n.options.fallbackLng).toBe('en');
    expect(i18n.options.defaultNS).toBe('common');
    expect(i18n.options.keySeparator).toBe('.');
    expect(i18n.options.interpolation.escapeValue).toBe(false);
  });

  test('i18n has language detection configured', () => {
    // Check language detection settings
    expect(i18n.options.detection).toBeDefined();
    expect(i18n.options.detection.order).toContain('localStorage');
    expect(i18n.options.detection.order).toContain('navigator');
    expect(i18n.options.detection.caches).toContain('localStorage');
  });
}); 