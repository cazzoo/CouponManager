import React, { useState, useEffect, MouseEvent } from 'react';
import { User, Shield, EyeOff } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { useLanguage } from '../services/LanguageContext';
import { getAllDevUsers, getUserInitials, getDevUserByEmail, setLastSelectedUser } from '../config/devUsers';
import type { DevTestUser } from '../config/devUsers';
import type { UserRole } from '../types';

const DevUserSwitcher: React.FC = () => {
  if (!import.meta.env.DEV) {
    return null;
  }

  const { user, signIn, signOut } = useAuth();
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [switching, setSwitching] = useState<boolean>(false);
  const open = Boolean(anchorEl);

  const currentUserEmail: string = user?.email || '';
  const devUsers: DevTestUser[] = getAllDevUsers();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint in Tailwind
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user?.email && switching) {
      setLastSelectedUser(user.email);
      setSwitching(false);
    }
  }, [user, switching]);

  const getRoleIcon = (role: UserRole): React.ReactElement => {
    switch (role) {
      case 'manager':
        return <Shield size={16} className="text-warning" />;
      case 'demo':
        return <EyeOff size={16} className="text-gray-500" />;
      case 'user':
      default:
        return <User size={16} className="text-info" />;
    }
  };

  const getRoleText = (role: UserRole): string => {
    switch (role) {
      case 'manager':
        return t('devUserSwitcher.role_manager');
      case 'demo':
        return t('devUserSwitcher.role_demo');
      case 'user':
      default:
        return t('devUserSwitcher.role_user');
    }
  };

  const handleUserSwitch = async (selectedUser: DevTestUser): Promise<void> => {
    if (selectedUser.email === currentUserEmail) {
      return;
    }

    try {
      setSwitching(true);
      
      if (currentUserEmail) {
        await signOut();
      }

      // All users now have passwords, no special handling needed for demo
      await signIn(selectedUser.email, selectedUser.password);
    } catch (error) {
      console.error('Error switching user:', error);
      setSwitching(false);
    }
  };

  const handleMobileClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileClose = (user?: DevTestUser): void => {
    setAnchorEl(null);
    if (user) {
      handleUserSwitch(user);
    }
  };

  const handleDesktopChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const selectedEmail = event.target.value;
    const selectedUser = getDevUserByEmail(selectedEmail);
    if (selectedUser) {
      handleUserSwitch(selectedUser);
    }
  };

  if (isMobile) {
    return (
      <div className="ml-1" data-testid="dev-user-switcher">
        <div className="tooltip tooltip-bottom" data-tip={t('devUserSwitcher.switch_user')}>
          <div className="relative">
            <div
              className="badge badge-primary badge-xs absolute -bottom-1 -right-1 z-10"
              style={{
                fontSize: '0.6rem',
                height: '18px',
                minWidth: '18px',
                padding: '0 4px'
              }}
            >
              {getUserInitials(currentUserEmail)}
            </div>
            <div className="relative">
              <div
                className="badge badge-primary badge-xs absolute -top-1 -right-1 z-20"
                style={{
                  fontSize: '0.5rem',
                  height: '14px',
                  minWidth: '14px',
                  padding: '0 3px'
                }}
              >
                DEV
              </div>
              <button
                onClick={handleMobileClick}
                className="btn btn-circle btn-ghost btn-sm"
                aria-label={t('devUserSwitcher.switch_user')}
                disabled={switching}
              >
                {switching ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <User size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {open && (
          <div className="dropdown dropdown-end">
            <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-64 p-2 shadow">
              {devUsers.map((devUser) => (
                <li key={devUser.email}>
                  <a
                    onClick={() => handleMobileClose(devUser)}
                    className={`text-base-content hover:bg-base-200 flex items-center gap-2 min-w-[200px] ${
                      devUser.email === currentUserEmail ? 'active' : ''
                    } ${switching ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-1">
                      {getRoleIcon(devUser.role)}
                      <span className="text-sm">{devUser.email}</span>
                    </div>
                    {devUser.email === currentUserEmail && (
                      <div className="badge badge-secondary badge-sm ml-auto">
                        {t('devUserSwitcher.current')}
                      </div>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative ml-2" data-testid="dev-user-switcher">
      <div className="relative">
        <div
          className="badge badge-primary badge-xs absolute -top-1 -right-1 z-10"
          style={{
            fontSize: '0.6rem',
            height: '16px',
            minWidth: '16px',
            padding: '0 4px'
          }}
        >
          DEV
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-xs">{t('devUserSwitcher.switch_user')}</span>
          </label>
          <select
            id="dev-user-select"
            className="select select-bordered select-sm min-w-[200px] text-base-content"
            value={currentUserEmail}
            onChange={handleDesktopChange}
            disabled={switching}
          >
            {devUsers.map((devUser) => (
              <option key={devUser.email} value={devUser.email}>
                {devUser.email} {devUser.email === currentUserEmail ? `(${t('devUserSwitcher.current')})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1 min-w-[200px]">
        {switching ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          getRoleIcon(devUsers.find(u => u.email === currentUserEmail)?.role || 'user')
        )}
        <span className="text-sm">{currentUserEmail || t('devUserSwitcher.switch_user')}</span>
      </div>
    </div>
  );
};

export default DevUserSwitcher;
