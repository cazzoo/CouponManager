import React, { useState, useEffect, MouseEvent } from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Box,
  useMediaQuery,
  IconButton,
  Menu,
  Typography,
  Chip,
  Badge,
  Tooltip,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../services/AuthContext';
import { useLanguage } from '../services/LanguageContext';
import { getAllDevUsers, getUserInitials, getDevUserByEmail, setLastSelectedUser } from '../config/devUsers';
import type { DevTestUser } from '../config/devUsers';
import type { UserRole } from '../types';

const DevUserSwitcher: React.FC = () => {
  const { user, signIn, signOut } = useAuth();
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [switching, setSwitching] = useState<boolean>(false);
  const open = Boolean(anchorEl);
  
  const currentUserEmail: string = user?.email || '';
  const devUsers: DevTestUser[] = getAllDevUsers();

  useEffect(() => {
    if (user?.email && switching) {
      setLastSelectedUser(user.email);
      setSwitching(false);
    }
  }, [user, switching]);

  const getRoleIcon = (role: UserRole): React.ReactElement => {
    switch (role) {
      case 'manager':
        return <ShieldIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />;
      case 'demo':
        return <VisibilityOffIcon fontSize="small" sx={{ color: theme.palette.grey[500] }} />;
      case 'user':
      default:
        return <PersonIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
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

  const handleDesktopChange = (event: SelectChangeEvent<string>): void => {
    const selectedEmail = event.target.value;
    const selectedUser = getDevUserByEmail(selectedEmail);
    if (selectedUser) {
      handleUserSwitch(selectedUser);
    }
  };

  if (isMobile) {
    return (
      <Box sx={{ marginLeft: 1 }} data-testid="dev-user-switcher">
        <Tooltip title={t('devUserSwitcher.switch_user')}>
          <Badge
            badgeContent={getUserInitials(currentUserEmail)}
            color="secondary"
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.6rem',
                height: 18,
                minWidth: 18,
                padding: '0 4px',
                backgroundColor: '#673ab7'
              }
            }}
          >
            <Badge
              badgeContent="DEV"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#673ab7',
                  color: 'white',
                  fontSize: '0.5rem',
                  height: 14,
                  minWidth: 14,
                  padding: '0 3px',
                  top: 6,
                  right: 6
                }
              }}
            >
              <IconButton
                onClick={handleMobileClick}
                color="inherit"
                size="small"
                aria-label={t('devUserSwitcher.switch_user')}
                disabled={switching}
              >
                {switching ? <CircularProgress size={20} /> : <PersonIcon />}
              </IconButton>
            </Badge>
          </Badge>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => handleMobileClose()}
        >
          {devUsers.map((devUser) => (
            <MenuItem
              key={devUser.email}
              onClick={() => handleMobileClose(devUser)}
              selected={devUser.email === currentUserEmail}
              disabled={switching}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {getRoleIcon(devUser.role)}
                  <Typography variant="body2">{devUser.email}</Typography>
                </Box>
                {devUser.email === currentUserEmail && (
                  <Chip
                    label={t('devUserSwitcher.current')}
                    size="small"
                    color="secondary"
                    sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', marginLeft: 2 }} data-testid="dev-user-switcher">
      <Badge
        badgeContent="DEV"
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: '#673ab7',
            color: 'white',
            fontSize: '0.6rem',
            height: 16,
            minWidth: 16,
            padding: '0 4px'
          }
        }}
      >
        <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 200 }}>
          <InputLabel id="dev-user-select-label">{t('devUserSwitcher.switch_user')}</InputLabel>
          <Select
            labelId="dev-user-select-label"
            id="dev-user-select"
            value={currentUserEmail}
            onChange={handleDesktopChange}
            label={t('devUserSwitcher.switch_user')}
            disabled={switching}
            renderValue={(value: string) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {switching ? (
                  <CircularProgress size={16} />
                ) : (
                  <>
                    {getRoleIcon(devUsers.find(u => u.email === value)?.role || 'user')}
                    <Typography variant="body2">{value}</Typography>
                  </>
                )}
              </Box>
            )}
          >
            {devUsers.map((devUser) => (
              <MenuItem key={devUser.email} value={devUser.email}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getRoleIcon(devUser.role)}
                    <Typography variant="body2">{devUser.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {getRoleText(devUser.role)}
                    </Typography>
                    {devUser.email === currentUserEmail && (
                      <Chip
                        label={t('devUserSwitcher.current')}
                        size="small"
                        color="secondary"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Badge>
    </Box>
  );
};

export default DevUserSwitcher;
