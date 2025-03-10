import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import { useLanguage } from '../services/LanguageContext';
import { useAuth } from '../services/AuthContext';
import RoleService, { Roles, Permissions } from '../services/RoleService';
import supabase from '../services/SupabaseClient';
import { mockUsers } from '../mocks/data/users';

// Debugging info to help troubleshoot issues with the component
console.log('UserManagement: Loading component...');

/**
 * Component for managing users and their roles
 * Only accessible to users with manager role
 */
const UserManagement = () => {
  console.log('UserManagement: Initializing component...');
  const { t } = useLanguage();
  const { user, isManager, userRole, hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Development mode flag for debugging only
  const isDevelopment = import.meta.env.DEV;
  
  console.log('UserManagement: Current state:', { 
    isManager, 
    userRole,
    userId: user?.id,
    userEmail: user?.email
  });

  // Fetch users and their roles
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user has permission to view users
        const canViewUsers = await hasPermission(RoleService.Permissions.VIEW_USERS);
        if (!canViewUsers) {
          setError(t('errors.permission_denied'));
          setLoading(false);
          return;
        }

        let usersData;
        
        // In development mode, always use mock data for reliability
        if (isDevelopment) {
          console.log('UserManagement: Using mock users in development mode');
          usersData = { users: mockUsers };
        } else {
          try {
            // Only try Supabase in production
            console.log('UserManagement: Attempting to fetch users via admin.listUsers');
            const { data, error: usersError } = await supabase.auth.admin.listUsers();
            
            if (usersError) {
              console.error('Error from supabase.auth.admin.listUsers:', usersError);
              throw usersError;
            }
            
            usersData = data;
          } catch (err) {
            console.error('Failed to fetch users via Supabase:', err);
            throw err;
          }
        }

        // Fetch roles for each user
        const roles = {};
        for (const user of usersData.users) {
          try {
            console.log(`Fetching role for user: ${user.id}`);
            const roleData = await RoleService.getUserRole(user.id);
            console.log(`Role data for ${user.id}:`, roleData);
            roles[user.id] = roleData?.role || user.role || 'user'; // Try multiple sources
          } catch (err) {
            console.error(`Error fetching role for user ${user.id}:`, err);
            roles[user.id] = user.role || 'user'; // Fall back to user.role or 'user'
          }
        }

        console.log('UserManagement: Successfully processed users:', usersData.users.length);
        setUsers(usersData.users);
        setUserRoles(roles);
      } catch (err) {
        console.error('Error in fetchUsers:', err);
        setError(t('errors.fetch_users_failed'));
      } finally {
        setLoading(false);
      }
    };

    if (isManager) {
      fetchUsers();
    }
  }, [isManager, hasPermission, t, isDevelopment]);

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Check if user has permission to edit roles
      const canEditRoles = await hasPermission(RoleService.Permissions.EDIT_USER_ROLE);
      if (!canEditRoles) {
        setError(t('errors.permission_denied'));
        setLoading(false);
        return;
      }

      // Don't allow changing own role (to prevent locking yourself out)
      if (userId === user.id) {
        setError(t('errors.cannot_change_own_role'));
        setLoading(false);
        return;
      }

      // Update the role
      const result = await RoleService.setUserRole(userId, newRole);
      
      if (!result) {
        throw new Error(t('errors.role_update_failed'));
      }

      // Update local state
      setUserRoles(prev => ({
        ...prev,
        [userId]: newRole
      }));

      setSuccess(t('messages.role_updated_successfully'));
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err.message || t('errors.role_update_failed'));
    } finally {
      setLoading(false);
    }
  };

  // If not a manager, show access denied
  if (!isManager) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{t('errors.access_denied')}</Alert>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        width: '100%',
        maxWidth: '100%',
        p: { xs: 1, sm: 2, md: 3 },
        '& .MuiPaper-root': {
          width: '100%',
          overflow: 'hidden',
          borderRadius: 1
        }
      }}
    >
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          mb: 3, 
          fontWeight: 'medium',
          fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
        }}
      >
        {t('admin.user_management')}
      </Typography>
      
      {isDevelopment && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Development Mode: Normal authentication restrictions are bypassed.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer 
          component={Paper} 
          variant="outlined"
          sx={{ width: '100%' }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.user_id')}</TableCell>
                <TableCell>{t('admin.email')}</TableCell>
                <TableCell>{t('admin.created_at')}</TableCell>
                <TableCell>{t('admin.role')}</TableCell>
                <TableCell>{t('admin.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((userData) => (
                <TableRow 
                  key={userData.id}
                  sx={{ 
                    '&:nth-of-type(odd)': { 
                      bgcolor: 'rgba(0, 0, 0, 0.02)' 
                    }
                  }}
                >
                  <TableCell 
                    sx={{ 
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: { xs: '80px', sm: '120px', md: '200px' }
                    }}
                  >
                    {userData.id}
                  </TableCell>
                  <TableCell>
                    {userData.email}
                  </TableCell>
                  <TableCell>
                    {new Date(userData.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <FormControl 
                      fullWidth 
                      size="small"
                    >
                      <Select
                        value={userRoles[userData.id] || 'user'}
                        disabled={userData.id === user.id} // Can't change own role
                      >
                        <MenuItem value={RoleService.Roles.USER}>
                          {t('roles.user')}
                        </MenuItem>
                        <MenuItem value={RoleService.Roles.MANAGER}>
                          {t('roles.manager')}
                        </MenuItem>
                        <MenuItem value={RoleService.Roles.DEMO_USER}>
                          {t('roles.demo_user')}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      disabled={userData.id === user.id} // Can't change own role
                      onClick={() => handleRoleChange(
                        userData.id, 
                        userRoles[userData.id] === RoleService.Roles.USER 
                          ? RoleService.Roles.MANAGER 
                          : RoleService.Roles.USER
                      )}
                    >
                      {userRoles[userData.id] === RoleService.Roles.USER 
                        ? t('admin.promote_to_manager') 
                        : t('admin.demote_to_user')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default UserManagement; 