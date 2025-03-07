import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AuthService from './AuthService';
import RoleService, { Roles } from './RoleService';

// Create context
const AuthContext = createContext();

/**
 * Provider component for authentication state
 * Manages user authentication state and provides auth methods
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to load a user's role
  const loadUserRole = async (userId) => {
    if (!userId) {
      setUserRole(null);
      return;
    }
    
    try {
      const roleData = await RoleService.getUserRole(userId);
      if (roleData) {
        setUserRole(roleData.role);
      } else {
        // Set default role if none exists
        const newRole = await RoleService.setUserRole(userId, Roles.USER);
        if (newRole) {
          setUserRole(newRole.role);
        }
      }
    } catch (err) {
      console.error('Error loading user role:', err);
      setUserRole(null);
    }
  };

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { session, error: sessionError } = await AuthService.getCurrentSession();
        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          setUser(session.user);
          await loadUserRole(session.user.id);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const unsubscribe = AuthService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        loadUserRole(session.user.id);
        setError(null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
        setError(null);
      } else if (event === 'USER_UPDATED' && session?.user) {
        setUser(session.user);
        loadUserRole(session.user.id);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sign in method
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: authUser, error: signInError } = await AuthService.signIn(email, password);
      
      if (signInError) {
        setError(signInError);
        return { user: null, error: signInError };
      }
      
      if (authUser) {
        await loadUserRole(authUser.id);
      }
      
      return { user: authUser, error: null };
    } catch (err) {
      setError(err);
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign up method
  const signUp = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: authUser, error: signUpError } = await AuthService.signUp(email, password);
      
      if (signUpError) {
        setError(signUpError);
        return { user: null, error: signUpError };
      }
      
      // If user was created successfully, set default role
      if (authUser) {
        await RoleService.setUserRole(authUser.id, Roles.USER);
        setUserRole(Roles.USER);
      }
      
      return { user: authUser, error: null };
    } catch (err) {
      setError(err);
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Anonymous sign in method
  const signInAnonymously = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: authUser, error: signInError } = await AuthService.signInAnonymously();
      
      if (signInError) {
        setError(signInError);
        return { user: null, error: signInError };
      }
      
      // If anonymous user was created successfully, set default role
      if (authUser) {
        await RoleService.setUserRole(authUser.id, Roles.USER);
        setUserRole(Roles.USER);
      }
      
      return { user: authUser, error: null };
    } catch (err) {
      setError(err);
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign out method
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: signOutError } = await AuthService.signOut();
      
      if (signOutError) {
        setError(signOutError);
        return { error: signOutError };
      }
      
      setUserRole(null);
      return { error: null };
    } catch (err) {
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for role checks
  const isManager = userRole === Roles.MANAGER;
  
  // Check if user has a specific permission
  const hasPermission = async (permission, resource = {}) => {
    if (!user) return false;
    return await RoleService.checkPermission(user.id, permission, resource);
  };

  // Context value
  const value = {
    user,
    userRole,
    loading,
    error,
    signIn,
    signUp,
    signInAnonymously,
    signOut,
    isManager,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Hook to access the auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 