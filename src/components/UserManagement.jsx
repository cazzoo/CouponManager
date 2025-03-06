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
import RoleService from '../services/RoleService';
import supabase from '../services/SupabaseClient';

/**
 * Component for managing users and their roles
 * Only accessible to users with manager role
 */
const UserManagement = () => {
  const { t } = useLanguage();
  const { user, isManager, hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

        // Fetch users from Supabase auth
        const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) {
          throw usersError;
        }

        // Fetch roles for each user
        const roles = {};
        for (const user of usersData.users) {
          const roleData = await RoleService.getUserRole(user.id);
          roles[user.id] = roleData?.role || 'user'; // Default to 'user' if no role found
        }

        setUsers(usersData.users);
        setUserRoles(roles);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(t('errors.fetch_users_failed'));
      } finally {
        setLoading(false);
      }
    };

    if (isManager) {
      fetchUsers();
    }
  }, [isManager, hasPermission, t]);

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('admin.user_management')}
      </Typography>
      
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
        <TableContainer component={Paper}>
          <Table>
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
                <TableRow key={userData.id}>
                  <TableCell>{userData.id}</TableCell>
                  <TableCell>{userData.email}</TableCell>
                  <TableCell>
                    {new Date(userData.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
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