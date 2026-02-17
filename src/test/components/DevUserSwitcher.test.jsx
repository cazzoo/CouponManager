import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DevUserSwitcher from '../../components/DevUserSwitcher';

vi.mock('../../services/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../services/LanguageContext', () => ({
  useLanguage: vi.fn()
}));

vi.mock('../../config/devUsers', () => ({
  getAllDevUsers: vi.fn(),
  getUserInitials: vi.fn(),
  getDevUserByEmail: vi.fn(),
  setLastSelectedUser: vi.fn()
}));

import { useAuth } from '../../services/AuthContext';
import { useLanguage } from '../../services/LanguageContext';
import { getAllDevUsers, getUserInitials, getDevUserByEmail, setLastSelectedUser } from '../../config/devUsers';

describe('DevUserSwitcher', () => {
  const mockSignIn = vi.fn();
  const mockSignOut = vi.fn();
  const mockT = vi.fn((key) => key);

  const mockDevUsers = [
    { email: 'user@example.com', password: 'password123', role: 'user' },
    { email: 'manager@example.com', password: 'password123', role: 'manager' },
    { email: 'another@example.com', password: 'password123', role: 'user' },
    { email: 'demo@example.com', password: '', role: 'demo' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    useAuth.mockReturnValue({
      user: { id: '1', email: 'user@example.com' },
      signIn: mockSignIn,
      signOut: mockSignOut
    });

    useLanguage.mockReturnValue({
      t: mockT,
      language: 'en',
      changeLanguage: vi.fn(),
      getSupportedLanguages: vi.fn(() => [
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French' }
      ])
    });

    getAllDevUsers.mockReturnValue(mockDevUsers);
    getUserInitials.mockImplementation((email) => {
      const [username] = email.split('@');
      return username.substring(0, 2).toUpperCase();
    });
    getDevUserByEmail.mockImplementation((email) => 
      mockDevUsers.find((u) => u.email === email)
    );
  });

  it('should not render in production mode', () => {
    const originalDev = import.meta.env.DEV;
    import.meta.env.DEV = false;

    const { container } = render(<DevUserSwitcher />);
    expect(container.firstChild).toBeNull();

    import.meta.env.DEV = originalDev;
  });

  it('should render in development mode', () => {
    import.meta.env.DEV = true;

    render(<DevUserSwitcher />);
    expect(screen.getByTestId('dev-user-switcher')).toBeInTheDocument();
  });

  it('should display all test users in the dropdown', () => {
    import.meta.env.DEV = true;

    render(<DevUserSwitcher />);

    expect(screen.getAllByText('user@example.com').length).toBeGreaterThan(0);
    expect(screen.getAllByText('manager@example.com').length).toBeGreaterThan(0);
    expect(screen.getAllByText('another@example.com').length).toBeGreaterThan(0);
    expect(screen.getAllByText('demo@example.com').length).toBeGreaterThan(0);
  });

  it('should call signOut and signIn when switching users', async () => {
    import.meta.env.DEV = true;
    mockSignIn.mockResolvedValue({ success: true });
    mockSignOut.mockResolvedValue(undefined);

    render(<DevUserSwitcher />);

    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'manager@example.com' } });

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockSignIn).toHaveBeenCalledWith('manager@example.com', 'password123');
    });
  });

  it('should not switch to the same user', async () => {
    import.meta.env.DEV = true;

    render(<DevUserSwitcher />);

    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'user@example.com' } });

    await waitFor(() => {
      expect(mockSignOut).not.toHaveBeenCalled();
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  it('should show role badges for each user', () => {
    import.meta.env.DEV = true;

    render(<DevUserSwitcher />);

    const roleTexts = screen.getAllByText(/current/i);
    expect(roleTexts.length).toBeGreaterThan(0);
  });

  it('should display DEV pill badge', () => {
    import.meta.env.DEV = true;

    render(<DevUserSwitcher />);

    expect(screen.getAllByText('DEV').length).toBeGreaterThan(0);
  });

  it('should display current user indicator', () => {
    import.meta.env.DEV = true;

    render(<DevUserSwitcher />);

    expect(screen.getAllByText(/current/i).length).toBeGreaterThan(0);
  });

  it('should handle demo user sign in correctly', async () => {
    import.meta.env.DEV = true;
    mockSignIn.mockResolvedValue({ success: true });
    mockSignOut.mockResolvedValue(undefined);

    useAuth.mockReturnValue({
      user: { id: '2', email: 'manager@example.com' },
      signIn: mockSignIn,
      signOut: mockSignOut
    });

    render(<DevUserSwitcher />);

    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'demo@example.com' } });

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockSignIn).toHaveBeenCalledWith('demo@example.com', '');
    });
  });

  it('should save last selected user to localStorage', async () => {
    import.meta.env.DEV = true;
    mockSignIn.mockResolvedValue({ success: true });
    mockSignOut.mockResolvedValue(undefined);

    useAuth.mockReturnValue({
      user: { id: '1', email: 'user@example.com' },
      signIn: mockSignIn,
      signOut: mockSignOut
    });

    render(<DevUserSwitcher />);

    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'manager@example.com' } });

    await waitFor(() => {
      expect(setLastSelectedUser).toHaveBeenCalled();
    });
  });

  describe('Mobile View', () => {
    beforeEach(() => {
      import.meta.env.DEV = true;
      global.innerWidth = 500;
      global.dispatchEvent(new Event('resize'));
    });

    it('should render mobile view when screen width is less than 640px', () => {
      render(<DevUserSwitcher />);

      const switcher = screen.getByTestId('dev-user-switcher');
      expect(switcher).toBeInTheDocument();
      expect(switcher).toHaveClass('ml-1');
    });

    it('should render mobile dropdown menu when button is clicked', async () => {
      render(<DevUserSwitcher />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const menu = screen.getByRole('list');
        expect(menu).toBeInTheDocument();
      });
    });

    it('should display user initials badge on mobile', () => {
      render(<DevUserSwitcher />);

      const initialsBadge = screen.getByText('US');
      expect(initialsBadge).toBeInTheDocument();
    });

    it('should render DEV pill badge on mobile', () => {
      render(<DevUserSwitcher />);

      const devBadges = screen.getAllByText('DEV');
      expect(devBadges.length).toBeGreaterThan(0);
    });

    it('should switch users when clicking mobile menu item', async () => {
      mockSignIn.mockResolvedValue({ success: true });
      mockSignOut.mockResolvedValue(undefined);

      render(<DevUserSwitcher />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const menuItems = screen.getAllByText('manager@example.com');
        expect(menuItems.length).toBeGreaterThan(0);
      });

      const managerLink = screen.getAllByText('manager@example.com')[0];
      fireEvent.click(managerLink);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
        expect(mockSignIn).toHaveBeenCalledWith('manager@example.com', 'password123');
      });
    });

    it('should close mobile menu when clicking a user', async () => {
      render(<DevUserSwitcher />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const menu = screen.getByRole('list');
        expect(menu).toBeInTheDocument();
      });

      const managerLink = screen.getAllByText('manager@example.com')[0];
      fireEvent.click(managerLink);

      await waitFor(() => {
        const menu = screen.queryByRole('list');
        expect(menu).not.toBeInTheDocument();
      });
    });

    it('should disable mobile menu items during switching', async () => {
      mockSignIn.mockImplementation(() => new Promise(() => {}));
      mockSignOut.mockResolvedValue(undefined);

      render(<DevUserSwitcher />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const menuItems = screen.getAllByRole('listitem');
        expect(menuItems.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Window Resize Handling', () => {
    it('should detect mobile screen size on mount', () => {
      global.innerWidth = 500;
      render(<DevUserSwitcher />);

      const switcher = screen.getByTestId('dev-user-switcher');
      expect(switcher).toHaveClass('ml-1');
    });

    it('should detect desktop screen size on mount', () => {
      global.innerWidth = 800;
      render(<DevUserSwitcher />);

      const switcher = screen.getByTestId('dev-user-switcher');
      expect(switcher).toHaveClass('ml-2');
    });

    it('should update view mode when window is resized', async () => {
      global.innerWidth = 800;
      render(<DevUserSwitcher />);

      const switcher = screen.getByTestId('dev-user-switcher');
      expect(switcher).toHaveClass('ml-2');

      global.innerWidth = 500;
      global.dispatchEvent(new Event('resize'));

      await waitFor(() => {
        expect(switcher).toHaveClass('ml-1');
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      global.innerWidth = 800;
      global.dispatchEvent(new Event('resize'));
    });

    it('should handle signOut error during user switch', async () => {
      const mockError = new Error('Sign out failed');
      mockSignOut.mockRejectedValue(mockError);
      mockSignIn.mockResolvedValue({ success: true });

      render(<DevUserSwitcher />);

      const selectElement = screen.getByRole('combobox');
      fireEvent.change(selectElement, { target: { value: 'manager@example.com' } });

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });

    it('should handle signIn error during user switch', async () => {
      const mockError = new Error('Sign in failed');
      mockSignOut.mockResolvedValue(undefined);
      mockSignIn.mockRejectedValue(mockError);

      render(<DevUserSwitcher />);

      const selectElement = screen.getByRole('combobox');
      fireEvent.change(selectElement, { target: { value: 'manager@example.com' } });

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    });

    it('should reset switching state on error', async () => {
      const mockError = new Error('Sign in failed');
      mockSignIn.mockRejectedValue(mockError);
      mockSignOut.mockResolvedValue(undefined);

      render(<DevUserSwitcher />);

      const selectElement = screen.getByRole('combobox');

      fireEvent.change(selectElement, { target: { value: 'manager@example.com' } });

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    });
  });

  describe('Role Icons', () => {
    beforeEach(() => {
      global.innerWidth = 800;
      global.dispatchEvent(new Event('resize'));
    });

    it('should display icon for current user role', () => {
      render(<DevUserSwitcher />);

      const userIcon = document.querySelector('.lucide-user');
      expect(userIcon).toBeInTheDocument();
    });

    it('should display EyeOff icon for demo role', () => {
      useAuth.mockReturnValue({
        user: { id: '4', email: 'demo@example.com' },
        signIn: mockSignIn,
        signOut: mockSignOut
      });

      render(<DevUserSwitcher />);

      const eyeOffIcon = document.querySelector('.lucide-eye-off');
      expect(eyeOffIcon).toBeInTheDocument();
    });

    it('should display User icon for user role', () => {
      useAuth.mockReturnValue({
        user: { id: '3', email: 'another@example.com' },
        signIn: mockSignIn,
        signOut: mockSignOut
      });

      render(<DevUserSwitcher />);

      const userIcon = document.querySelector('.lucide-user');
      expect(userIcon).toBeInTheDocument();
    });
  });

  describe('Effect for Saving Last User', () => {
    beforeEach(() => {
      global.innerWidth = 800;
      global.dispatchEvent(new Event('resize'));
    });

    it('should save last selected user after successful switch', async () => {
      let resolveSignIn;

      mockSignIn.mockImplementation(() => new Promise((resolve) => {
        resolveSignIn = resolve;
      }));
      mockSignOut.mockResolvedValue(undefined);

      render(<DevUserSwitcher />);

      const selectElement = screen.getByRole('combobox');
      fireEvent.change(selectElement, { target: { value: 'manager@example.com' } });

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });

      resolveSignIn({ user: { id: '2', email: 'manager@example.com' } });

      await waitFor(() => {
        expect(setLastSelectedUser).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });
});
