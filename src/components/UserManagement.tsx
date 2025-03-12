import React, { useState, useEffect } from 'react';
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
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { useLanguage } from '../services/LanguageContext';
import { useAuth } from '../services/AuthContext';
import RoleService from '../services/RoleService';
import { Roles, Permissions } from '../services/RoleService';
import supabase from '../services/SupabaseClient';
import { mockUsers } from '../mocks/data/users';
import { User, UserRole } from '../types';

// Interface for user data with role information
interface UserWithRole extends Omit<User, 'role'> {
  role?: UserRole;
}

// Debugging info to help troubleshoot issues with the component
console.log('UserManagement: Loading component...');

// Role constants for consistent usage
const USER_ROLE: UserRole = 'user';
const MANAGER_ROLE: UserRole = 'manager';
const DEMO_USER_ROLE: UserRole = 'demo';

/**
 * Component for managing users and their roles
 * Only accessible to users with manager role
 */
const UserManagement: React.FC = () => {
  console.log('UserManagement: Initializing component...');
  const { t } = useLanguage();
  const { user, userRole, hasPermission } = useAuth();
  
  // Check if the current user is a manager
  const isManager = userRole === MANAGER_ROLE;
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, UserRole>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState<boolean>(false);
  
  // For development environment
  const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_USE_MEMORY_DB === 'true';

  // Permission constants
  const VIEW_USERS_PERMISSION = 'viewUsers';
  const EDIT_USER_ROLE_PERMISSION = 'editUserRole';

  // Helper function to get translated text with fallback
  const getText = (key: string, fallback: string): string => {
    const translated = t(key);
    // If the translation key is returned unchanged, use the fallback
    return translated === key ? fallback : translated;
  };

  // Function to safely convert a string to UserRole type
  const stringToUserRole = (roleString: string | null): UserRole => {
    if (!roleString) return USER_ROLE;
    
    // Map role strings to UserRole type values
    switch (roleString) {
      case 'manager':
        return MANAGER_ROLE;
      case 'demo':
      case 'demo_user':
        return DEMO_USER_ROLE;
      case 'user':
      default:
        return USER_ROLE;
    }
  };

  // Function to fetch user roles safely, ensuring type safety with UserRole
  const fetchUserRoles = async (userData: UserWithRole[]): Promise<Record<string, UserRole>> => {
    const roles: Record<string, UserRole> = {};
    for (const userItem of userData) {
      try {
        // The RoleService.getUserRole() returns string | null
        const roleString = await RoleService.getUserRole(userItem.id);
        roles[userItem.id] = stringToUserRole(roleString);
      } catch (error) {
        console.error(`Failed to fetch role for user ${userItem.id}:`, error);
        roles[userItem.id] = USER_ROLE;
      }
    }
    return roles;
  };

  useEffect(() => {
    const fetchUsers = async (): Promise<void> => {
      try {
        setLoading(true);
        
        // Clear any previous data
        setUsers([]);
        setUserRoles({});
        setUsingMockData(false);
        setError(null);
        
        // Check if user has permission to view users
        const canViewUsers = await hasPermission(VIEW_USERS_PERMISSION);
        if (!canViewUsers) {
          setError(getText('errors.permission_denied', 'Permission denied. You lack the required permissions.'));
          setLoading(false);
          return;
        }

        let userData: UserWithRole[] = [];
        let shouldUseMockData = isDevelopment;

        // Try to get real user data first, unless we're in development mode
        if (!isDevelopment) {
          try {
            console.log('UserManagement: Attempting to fetch users via Supabase');
            const { data, error: apiError } = await supabase.from('users').select('*');
            
            // If that doesn't work, try the admin API
            if (apiError || !data || data.length === 0) {
              console.log('UserManagement: Standard query failed, trying admin API');
              const adminResult = await supabase.auth.admin.listUsers();
              
              if (adminResult.error || !adminResult.data || !adminResult.data.users) {
                console.error('Both standard and admin API calls failed:', apiError || adminResult.error);
                shouldUseMockData = true;
              } else {
                userData = adminResult.data.users as UserWithRole[];
              }
            } else {
              userData = data as UserWithRole[];
            }
          } catch (error) {
            console.error('Error fetching users from Supabase:', error);
            shouldUseMockData = true;
          }
        }

        // Fall back to mock data if needed
        if (shouldUseMockData) {
          console.log('UserManagement: Using mock data');
          userData = mockUsers as UserWithRole[];
          setUsingMockData(true);
        }
        
        if (!userData || userData.length === 0) {
          setError(getText('messages.no_users_found', 'No users found.'));
          setLoading(false);
          return;
        }

        // Process user roles
        const roles = await fetchUserRoles(userData);

        console.log(`UserManagement: Processed ${userData.length} users`);
        setUsers(userData);
        setUserRoles(roles);
        setError(null);
      } catch (err) {
        console.error('Error in fetchUsers:', err);
        setError(getText('errors.fetch_users_failed', 'Failed to fetch users. Please try again.'));
        
        // Last resort: Show mock data even if there was an error
        if (users.length === 0) {
          console.log('UserManagement: Using mock data as last resort');
          setUsers(mockUsers as UserWithRole[]);
          
          const mockRoles: Record<string, UserRole> = {};
          mockUsers.forEach(mockUser => {
            mockRoles[mockUser.id] = stringToUserRole(mockUser.role);
          });
          
          setUserRoles(mockRoles);
          setUsingMockData(true);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (isManager) {
      fetchUsers();
    }
  }, [isManager, hasPermission, t, isDevelopment]);

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: UserRole): Promise<void> => {
    try {
      if (!userId || !newRole) {
        console.error('Invalid parameters for role change', { userId, newRole });
        setError(getText('errors.invalid_parameters', 'Invalid role change parameters.'));
        return;
      }
      
      // First, clear states and show loading
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Check if user has permission to edit roles
      const canEditRoles = await hasPermission(EDIT_USER_ROLE_PERMISSION);
      if (!canEditRoles) {
        setError(getText('errors.permission_denied', 'Permission denied. You lack the required permissions.'));
        setLoading(false);
        return;
      }

      // Don't allow changing own role (to prevent locking yourself out)
      if (userId === user?.id) {
        setError(getText('errors.cannot_change_own_role', 'You cannot change your own role.'));
        setLoading(false);
        return;
      }

      let result = false;
      
      // Find the user in our current list
      const targetUser = users.find(u => u.id === userId);
      if (!targetUser) {
        setError(getText('errors.user_not_found', 'User not found.'));
        setLoading(false);
        return;
      }
      
      console.log(`Changing role for user ${targetUser.email} (${userId}) from ${userRoles[userId]} to ${newRole}`);
      
      // If using mock data or in development mode, just update the local state
      if (usingMockData || isDevelopment) {
        console.log(`Simulating role change in ${usingMockData ? 'mock' : 'development'} mode`);
        result = true;
      } else {
        // Update the role via API in production
        try {
          // Convert UserRole to string for the service API
          result = await RoleService.updateUserRole(userId, newRole as string);
          console.log('Role update API result:', result);
        } catch (apiError) {
          console.error('API error during role update:', apiError);
          // If API fails, still allow the UI update but warn the user
          setSuccess(getText('messages.role_updated_ui_only', 'Role updated in UI only. Database update failed.'));
          result = true; // Force success for UI update
        }
      }
      
      if (!result) {
        throw new Error(getText('errors.role_update_failed', 'Failed to update user role. Please try again.'));
      }
      
      // Update the role in local state
      setUserRoles(prev => ({
        ...prev,
        [userId]: newRole
      }));
      
      // Show success message
      setSuccess(getText('messages.role_updated_successfully', 'User role updated successfully.'));
    } catch (err) {
      console.error('Error in handleRoleChange:', err);
      setError(typeof err === 'string' ? err : (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh the user list
  const refreshUserList = (): void => {
    console.log('Refreshing user list...');
    // We need to re-create the fetchUsers function here to avoid dependency issues with useEffect
    const fetchUsers = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        // Check permission
        const canViewUsers = await hasPermission(VIEW_USERS_PERMISSION);
        if (!canViewUsers) {
          setError(getText('errors.permission_denied', 'Permission denied. You lack the required permissions.'));
          setLoading(false);
          return;
        }
        
        // Fetch users from Supabase
        const { data, error } = await supabase.from('users').select('*');
        if (error) {
          throw new Error(error.message);
        }
        
        // Update the user list
        setUsers(data as UserWithRole[]);
        
        // Fetch roles
        const roles = await fetchUserRoles(data as UserWithRole[]);
        setUserRoles(roles);
        
        setSuccess(getText('messages.users_refreshed', 'User list refreshed successfully.'));
      } catch (err) {
        console.error('Error refreshing user list:', err);
        setError(getText('errors.fetch_users_failed', 'Failed to fetch users. Please try again.'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  };

  if (!isManager) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {getText('errors.access_denied', 'Access Denied. You need manager permissions to view this page.')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {loading && <CircularProgress size={24} sx={{ mr: 1 }} />}
        {getText('app.user_management', 'User Management')}
      </Typography>
      
      {usingMockData && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {getText('warnings.using_mock_data', 'Using mock data. Changes will not be saved to the database.')}
        </Alert>
      )}
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={refreshUserList} disabled={loading} variant="outlined">
          {getText('actions.refresh', 'Refresh')}
        </Button>
      </Box>
      
      <TableContainer 
        component={Paper}
        sx={{ 
          width: '100%',
          overflowX: 'auto'
        }}
      >
        <Table size="small" sx={{ minWidth: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell>{getText('admin.email', 'Email')}</TableCell>
              <TableCell>{getText('admin.user_id', 'User ID')}</TableCell>
              <TableCell>{getText('admin.role', 'Role')}</TableCell>
              <TableCell>{getText('admin.actions', 'Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(userItem => (
              <TableRow key={userItem.id}>
                <TableCell>{userItem.email}</TableCell>
                <TableCell>{userItem.id.substring(0, 8)}...</TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={userRoles[userItem.id] || USER_ROLE}
                      disabled={loading || userItem.id === user?.id}
                      onChange={(e: SelectChangeEvent) => {
                        const newRole = e.target.value as UserRole;
                        handleRoleChange(userItem.id, newRole);
                      }}
                    >
                      <MenuItem value={USER_ROLE}>{getText('roles.user', 'User')}</MenuItem>
                      <MenuItem value={MANAGER_ROLE}>{getText('roles.manager', 'Manager')}</MenuItem>
                      <MenuItem value={DEMO_USER_ROLE}>{getText('roles.demo_user', 'Demo User')}</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {userItem.id === user?.id && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {getText('general.current_user', '(Current User)')}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {userItem.id !== user?.id && (
                    <Button 
                      size="small" 
                      onClick={() => handleRoleChange(userItem.id, USER_ROLE)}
                      disabled={loading || userRoles[userItem.id] === USER_ROLE}
                    >
                      {getText('actions.reset_role', 'Reset Role')}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserManagement; 