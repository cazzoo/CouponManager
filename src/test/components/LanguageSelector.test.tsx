import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LanguageSelector from '../../components/LanguageSelector';
import { LanguageProvider, useLanguage } from '../../services/LanguageContext';
import type { ReactNode } from 'react';
import type { Language as LanguageType } from '../../types';

const mockChangeLanguage = vi.fn((lng: string) => {
  Object.defineProperty(document.documentElement, 'lang', {
    writable: true,
    value: lng
  });
  window.localStorage.setItem('language', lng);
});
const mockGetSupportedLanguages = (): LanguageType[] => [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }
];

vi.mock('../../services/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    changeLanguage: mockChangeLanguage,
    t: (key: string) => key,
    getSupportedLanguages: mockGetSupportedLanguages
  }),
  LanguageProvider: ({ children }: { children: ReactNode }) => <>{children}</>
}));

// Mock window.matchMedia
const mockMatchMedia = vi.fn();
let mockMediaQueryList: {
  matches: boolean;
  media: string;
  onchange: null;
  addListener: any;
  removeListener: any;
  addEventListener: any;
  removeEventListener: any;
  dispatchEvent: any;
};

beforeEach(() => {
  // Reset mocks
  mockMediaQueryList = {
    matches: false,
    media: '(max-width: 639px)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  };

  mockMatchMedia.mockReturnValue(mockMediaQueryList);
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia
  });

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };
  })();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  // Mock document.documentElement.lang
  Object.defineProperty(document.documentElement, 'lang', {
    writable: true,
    value: 'en'
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

// Helper wrapper component
const createWrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('LanguageSelector - Desktop Rendering', () => {
  it('should render the desktop language selector', () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    const selector = screen.getByTestId('language-selector');
    expect(selector).toBeInTheDocument();
    expect(selector).toHaveClass('hidden', 'md:block');
  });

  it('should render the select element with correct attributes', () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute('id', 'language-select');
    expect(select).toHaveClass('select', 'select-bordered', 'select-sm');
  });

  it('should render language label', () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    const label = screen.getByText(/language/i);
    expect(label).toBeInTheDocument();
  });

  it('should render all supported languages as options', () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4); // en, es, fr, de

    const optionValues = options.map(option => (option as HTMLOptionElement).value);
    expect(optionValues).toContain('en');
    expect(optionValues).toContain('es');
    expect(optionValues).toContain('fr');
    expect(optionValues).toContain('de');
  });

  it('should have English as the default selected language', () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('en');
  });
});

describe('LanguageSelector - Mobile Rendering', () => {
  beforeEach(() => {
    mockMediaQueryList.matches = true;
  });

  it('should render the mobile language selector button', () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    const selector = screen.getByTestId('language-selector');
    expect(selector).toBeInTheDocument();
    expect(selector).not.toHaveClass('hidden');

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn', 'btn-circle', 'btn-ghost', 'btn-sm');
  });

  it('should display language icon on mobile', () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    // The Languages icon from lucide-react is rendered
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Icon is an SVG element
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should open dropdown menu when button is clicked', async () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      const menu = screen.getByRole('list');
      expect(menu).toBeInTheDocument();
    });
  });

  it('should render all supported languages in mobile menu', async () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      const menuItems = screen.getAllByRole('listitem');
      expect(menuItems).toHaveLength(4);
    });
  });

  it('should close dropdown menu after selecting a language', async () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      const menu = screen.getByRole('list');
      expect(menu).toBeInTheDocument();
      expect(menu).toHaveClass('menu-open');
    });

    // Click on Spanish
    const spanishLink = screen.getByText('Spanish');
    fireEvent.click(spanishLink);

    await waitFor(() => {
      const menu = screen.queryByRole('list');
      expect(menu).toBeInTheDocument();
      expect(menu).not.toHaveClass('menu-open');
    });
  });
});

describe('LanguageSelector - Language Switching Desktop', () => {
  it('should call changeLanguage when select value changes', async () => {
    // Create a test component to capture the changeLanguage function
    let capturedChangeLanguage: ((lng: string) => void) | undefined;

    const TestComponent: React.FC = () => {
      const { changeLanguage } = useLanguage();
      capturedChangeLanguage = changeLanguage;
      return <LanguageSelector />;
    };

    render(<TestComponent />, { wrapper: createWrapper });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'es' } });

    await waitFor(() => {
      expect(capturedChangeLanguage).toHaveBeenCalledWith('es');
    });
  });

  it('should update document language when language changes', async () => {
    const TestComponent: React.FC = () => {
      const { changeLanguage } = useLanguage();
      return (
        <>
          <button onClick={() => changeLanguage('es')}>Change to Spanish</button>
          <LanguageSelector />
        </>
      );
    };

    render(<TestComponent />, { wrapper: createWrapper });

    const changeButton = screen.getByText('Change to Spanish');
    fireEvent.click(changeButton);

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('es');
    });
  });

  it('should save language to localStorage when changed', async () => {
    const TestComponent: React.FC = () => {
      const { changeLanguage } = useLanguage();
      return (
        <>
          <button onClick={() => changeLanguage('fr')}>Change to French</button>
          <LanguageSelector />
        </>
      );
    };

    render(<TestComponent />, { wrapper: createWrapper });

    const changeButton = screen.getByText('Change to French');
    fireEvent.click(changeButton);

    await waitFor(() => {
      expect(window.localStorage.getItem('language')).toBe('fr');
    });
  });
});

describe('LanguageSelector - Language Switching Mobile', () => {
  beforeEach(() => {
    // Set up mobile viewport
    mockMediaQueryList.matches = true;
  });

  it('should call changeLanguage when mobile menu item is clicked', async () => {
    let capturedChangeLanguage: ((lng: string) => void) | undefined;

    const TestComponent: React.FC = () => {
      const { changeLanguage } = useLanguage();
      capturedChangeLanguage = changeLanguage;
      return <LanguageSelector />;
    };

    render(<TestComponent />, { wrapper: createWrapper });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      const spanishLink = screen.getByText('Spanish');
      fireEvent.click(spanishLink);
    });

    await waitFor(() => {
      expect(capturedChangeLanguage).toHaveBeenCalledWith('es');
    });
  });
});

describe('LanguageSelector - Accessibility', () => {
  it('should have aria-label on desktop select', () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-label');
  });

  it('should have aria-label on mobile button', () => {
    mockMediaQueryList.matches = true;

    render(<LanguageSelector />, { wrapper: createWrapper });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });

  it('should have accessible label for language selector', () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    const label = screen.getByLabelText(/language/i);
    expect(label).toBeInTheDocument();
  });

  it('should associate label with select using htmlFor', () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    const label = screen.getByText(/language/i).closest('label');
    const select = screen.getByRole('combobox');

    expect(label?.htmlFor).toBe('language-select');
    expect(select?.id).toBe('language-select');
  });
});

describe('LanguageSelector - Responsive Behavior', () => {
  it('should render desktop view on large screens', () => {
    mockMediaQueryList.matches = false;

    render(<LanguageSelector />, { wrapper: createWrapper });

    const selector = screen.getByTestId('language-selector');
    expect(selector).toHaveClass('hidden', 'md:block');
  });

  it('should render mobile view on small screens', () => {
    mockMediaQueryList.matches = true;

    render(<LanguageSelector />, { wrapper: createWrapper });

    const selector = screen.getByTestId('language-selector');
    expect(selector).not.toHaveClass('hidden');
  });

  it('should set up media query listener on mount', () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 639px)');
    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('should clean up media query listener on unmount', () => {
    const { unmount } = render(<LanguageSelector />, { wrapper: createWrapper });

    unmount();

    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });
});

describe('LanguageSelector - Translation', () => {
  it('should use translation function for labels', () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    const label = screen.getByText(/language/i);
    expect(label).toBeInTheDocument();
  });

  it('should translate language names correctly', () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
    expect(screen.getByText('German')).toBeInTheDocument();
  });
});

describe('LanguageSelector - Current Language Display', () => {
  it('should show correct current language in desktop select', () => {
    render(<LanguageSelector />, { wrapper: createWrapper });

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('en');
  });

  it('should highlight current language in mobile menu', async () => {
    mockMediaQueryList.matches = true;

    render(<LanguageSelector />, { wrapper: createWrapper });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      const menu = screen.getByRole('list');
      expect(menu).toBeInTheDocument();

      // English should be marked as active
      const englishLink = screen.getByText('English');
      expect(englishLink).toHaveClass('active');
    });
  });
});
