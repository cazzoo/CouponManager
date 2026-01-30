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
    
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('manager@example.com')).toBeInTheDocument();
    expect(screen.getByText('another@example.com')).toBeInTheDocument();
    expect(screen.getByText('demo@example.com')).toBeInTheDocument();
  });

  it('should call signOut and signIn when switching users', async () => {
    import.meta.env.DEV = true;
    mockSignIn.mockResolvedValue({ success: true });
    mockSignOut.mockResolvedValue(undefined);

    render(<DevUserSwitcher />);

    const selectElement = screen.getByLabelText(/switch_user/i);
    fireEvent.mouseDown(selectElement);

    const managerOption = screen.getByText('manager@example.com');
    fireEvent.click(managerOption);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockSignIn).toHaveBeenCalledWith('manager@example.com', 'password123');
    });
  });

  it('should not switch to the same user', async () => {
    import.meta.env.DEV = true;

    render(<DevUserSwitcher />);

    const selectElement = screen.getByLabelText(/switch_user/i);
    fireEvent.mouseDown(selectElement);

    const currentUserOption = screen.getByText('user@example.com');
    fireEvent.click(currentUserOption);

    await waitFor(() => {
      expect(mockSignOut).not.toHaveBeenCalled();
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  it('should show role badges for each user', () => {
    import.meta.env.DEV = true;

    render(<DevUserSwitcher />);

    expect(screen.getByText(/role_manager/i)).toBeInTheDocument();
    expect(screen.getByText(/role_user/i)).toBeInTheDocument();
    expect(screen.getByText(/role_demo/i)).toBeInTheDocument();
  });

  it('should display DEV pill badge', () => {
    import.meta.env.DEV = true;

    render(<DevUserSwitcher />);

    const devBadges = screen.getAllByText('DEV');
    expect(devBadges.length).toBeGreaterThan(0);
  });

  it('should display current user indicator', () => {
    import.meta.env.DEV = true;

    render(<DevUserSwitcher />);

    const currentChips = screen.getAllByText(/current/i);
    expect(currentChips.length).toBeGreaterThan(0);
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

    const selectElement = screen.getByLabelText(/switch_user/i);
    fireEvent.mouseDown(selectElement);

    const demoOption = screen.getByText('demo@example.com');
    fireEvent.click(demoOption);

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

    const selectElement = screen.getByLabelText(/switch_user/i);
    fireEvent.mouseDown(selectElement);

    const managerOption = screen.getByText('manager@example.com');
    fireEvent.click(managerOption);

    await waitFor(() => {
      expect(setLastSelectedUser).toHaveBeenCalledWith('manager@example.com');
    });
  });
});
