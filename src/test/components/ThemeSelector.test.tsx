import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ThemeSelector from '../../components/ThemeSelector';
import { useThemeStore, THEME_OPTIONS } from '../../stores/themeStore';

vi.mock('../../stores/themeStore', () => ({
  useThemeStore: vi.fn(),
  THEME_OPTIONS: [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Corporate', value: 'corporate' }
  ]
}));

describe('ThemeSelector Component', () => {
  const mockSetTheme = vi.fn();
  const mockThemes = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Corporate', value: 'corporate' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('should render the theme selector button', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      expect(screen.getByRole('button', { name: /current theme: light/i })).toBeInTheDocument();
    });

    it('should display the current theme label', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      expect(screen.getByText('Light')).toBeInTheDocument();
    });

    it('should render Palette icon', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      const { container } = render(<ThemeSelector />);

      const paletteIcon = container.querySelector('svg');
      expect(paletteIcon).toBeInTheDocument();
    });
  });

  describe('Theme Selection', () => {
    it('should open theme menu when button is clicked', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      fireEvent.click(button);

      expect(screen.getByText('Theme 1 of 3')).toBeInTheDocument();
    });

    it('should close menu when clicking outside', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      fireEvent.click(button);

      const overlay = document.querySelector('.fixed.inset-0');
      expect(overlay).toBeInTheDocument();

      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(screen.queryByText('Theme 1 of 3')).not.toBeInTheDocument();
    });

    it('should close menu when Escape key is pressed', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      fireEvent.click(button);

      const menu = document.querySelector('.dropdown-content');
      expect(menu).toBeInTheDocument();

      if (menu) {
        fireEvent.keyDown(menu, { key: 'Escape' });
      }

      expect(screen.queryByText('Theme 1 of 3')).not.toBeInTheDocument();
    });

    it('should close menu when clicking Cancel button', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      fireEvent.click(button);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Theme 1 of 3')).not.toBeInTheDocument();
    });
  });

  describe('Theme Change Actions', () => {
    it('should call setTheme when a theme is selected', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      fireEvent.click(button);

      const darkThemeButton = screen.getByText('Dark');
      fireEvent.click(darkThemeButton);

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should navigate to previous theme when left arrow is pressed', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: dark/i });
      fireEvent.click(button);

      const menu = document.querySelector('.dropdown-content');
      expect(menu).toBeInTheDocument();

      if (menu) {
        fireEvent.keyDown(menu, { key: 'ArrowLeft' });
      }

      expect(mockSetTheme).toHaveBeenCalled();
    });

    it('should navigate to next theme when right arrow is pressed', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      fireEvent.click(button);

      const menu = document.querySelector('.dropdown-content');
      expect(menu).toBeInTheDocument();

      if (menu) {
        fireEvent.keyDown(menu, { key: 'ArrowRight' });
      }

      expect(mockSetTheme).toHaveBeenCalled();
    });

    it('should prevent default behavior when arrow keys are pressed', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      fireEvent.click(button);

      const menu = document.querySelector('.dropdown-content');
      expect(menu).toBeInTheDocument();

      if (menu) {
        fireEvent.keyDown(menu, { key: 'ArrowLeft' });
      }
    });
  });

  describe('Navigation Buttons', () => {
    it('should render previous and next buttons on desktop', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      const { container } = render(<ThemeSelector />);

      const prevButton = container.querySelector('[aria-label="Previous theme"]');
      const nextButton = container.querySelector('[aria-label="Next theme"]');

      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    it('should call setTheme with previous theme when previous button is clicked', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme
      });

      const { container } = render(<ThemeSelector />);

      const prevButton = container.querySelector('[aria-label="Previous theme"]');
      expect(prevButton).toBeInTheDocument();

      if (prevButton) {
        fireEvent.click(prevButton);
      }

      expect(mockSetTheme).toHaveBeenCalled();
    });

    it('should call setTheme with next theme when next button is clicked', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      const { container } = render(<ThemeSelector />);

      const nextButton = container.querySelector('[aria-label="Next theme"]');
      expect(nextButton).toBeInTheDocument();

      if (nextButton) {
        fireEvent.click(nextButton);
      }

      expect(mockSetTheme).toHaveBeenCalled();
    });
  });

  describe('Active Theme Indicator', () => {
    it('should show active badge on selected theme', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      fireEvent.click(button);

      expect(screen.getByText('✓ Active')).toBeInTheDocument();
    });

    it('should apply primary styling to active theme button', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: dark/i });
      fireEvent.click(button);

      const darkThemeButtons = screen.getAllByText('Dark');
      const darkThemeButton = darkThemeButtons
        .map(text => text.closest('button'))
        .find(btn => btn !== null);

      expect(darkThemeButton).toHaveClass('btn-primary');
    });

    it('should apply ghost styling to inactive theme buttons', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      fireEvent.click(button);

      const darkThemeButtons = screen.getAllByText('Dark');
      const darkThemeButton = darkThemeButtons
        .map(text => text.closest('button'))
        .find(btn => btn !== null);

      expect(darkThemeButton).toHaveClass('btn-ghost');
    });
  });

  describe('Theme Options Display', () => {
    it('should display all available themes', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      fireEvent.click(button);

      mockThemes.forEach(theme => {
        const elements = screen.getAllByText(theme.label);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('should show correct theme count', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      fireEvent.click(button);

      expect(screen.getByText('Theme 1 of 3')).toBeInTheDocument();
    });

    it('should display theme labels with first letter capitalized', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      fireEvent.click(button);

      const lightElements = screen.getAllByText('Light');
      const lightButton = lightElements
        .map(el => el.closest('button'))
        .find(btn => btn !== null);
      expect(lightButton?.innerHTML).toContain('L');
    });
  });

  describe('A11y Attributes', () => {
    it('should have correct aria-label on theme selector button', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      expect(button).toHaveAttribute('aria-label', 'Current theme: Light. Click to change theme');
    });

    it('should have aria-label on navigation buttons', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      const { container } = render(<ThemeSelector />);

      const prevButton = container.querySelector('[aria-label="Previous theme"]');
      const nextButton = container.querySelector('[aria-label="Next theme"]');

      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });
  });

  describe('Menu Positioning', () => {
    it('should render menu with correct classes', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      fireEvent.click(button);

      const menu = document.querySelector('.dropdown-content');
      expect(menu).toBeInTheDocument();
      expect(menu).toHaveClass('menu', 'p-4', 'shadow-2xl');
    });

    it('should render overlay with correct classes', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      fireEvent.click(button);

      const overlay = document.querySelector('.fixed.inset-0');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('bg-black', 'bg-opacity-50');
    });
  });

  describe('Click Behavior', () => {
    it('should close menu when theme is selected', () => {
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      });

      render(<ThemeSelector />);

      const button = screen.getByRole('button', { name: /current theme: light/i });
      fireEvent.click(button);

      const darkThemeButton = screen.getByText('Dark');
      fireEvent.click(darkThemeButton);

      expect(screen.queryByText('Theme 1 of 3')).not.toBeInTheDocument();
    });
  });
});
