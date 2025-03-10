import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getAuthService } from './AuthServiceFactory';
import { getRoleService, Roles } from './RoleServiceFactory';

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
  const [authService, setAuthService] = useState(null);
  const [roleService, setRoleService] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Helper to load a user's role
  const loadUserRole = async (userId) => {
    if (!userId || !roleService) {
      console.log('AuthContext: Cannot load role - userId or roleService missing');
      setUserRole(null);
      return;
    }
    
    console.log('AuthContext: Loading role for user ID:', userId);
    
    try {
      // Hard-coded role detection for known user IDs in development
      if (import.meta.env.DEV) {
        if (userId === '00000000-0000-0000-0000-000000000002') {
          console.log('AuthContext: Development override - setting MANAGER role for manager user');
          setUserRole(Roles.MANAGER);
          return;
        }
        
        if (userId === '00000000-0000-0000-0000-000000000004') {
          console.log('AuthContext: Development override - setting DEMO_USER role for demo user');
          setUserRole(Roles.DEMO_USER);
          return;
        }
      }
      
      // Normal role loading flow
      const roleData = await roleService.getUserRole(userId);
      console.log('AuthContext: Role data from service:', roleData);
      
      if (roleData) {
        console.log('AuthContext: Setting user role to:', roleData.role);
        setUserRole(roleData.role);
      } else {
        console.log('AuthContext: No role found, setting default USER role');
        // Set default role if none exists
        const newRole = await roleService.setUserRole(userId, Roles.USER);
        if (newRole) {
          setUserRole(newRole.role);
        }
      }
    } catch (err) {
      console.error('Error loading user role:', err);
      setUserRole(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let subscription = null;
    
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get the appropriate auth service (real or mock) based on environment
        const service = await getAuthService();
        setAuthService(service);
        
        // Get the appropriate role service
        const roles = await getRoleService();
        setRoleService(roles);
        
        // Get initial auth state
        const initialUser = service.getUser?.() || null;
        if (initialUser) {
          console.log('AuthContext: Found initial user:', initialUser.email);
          setUser(initialUser);
          await loadUserRole(initialUser.id);
        }
        
        // Subscribe to auth changes
        console.log('AuthContext: Setting up auth state change subscription');
        const { data } = service.onAuthStateChange((event, session) => {
          console.log('AuthContext: Auth state change event:', event, session ? 'with session' : 'no session');
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('AuthContext: Setting user after sign in:', session.user.email);
            setUser(session.user);
            loadUserRole(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            console.log('AuthContext: Clearing user after sign out');
            setUser(null);
            setUserRole(null);
          }
        });
        
        subscription = data.subscription;
        setInitialized(true);
      } catch (err) {
        console.error('Error initializing authentication:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        console.log('AuthContext: Cleaning up auth subscription');
        subscription.unsubscribe();
      }
    };
  }, []);

  // Watch userRole changes
  useEffect(() => {
    console.log('AuthContext: userRole changed to:', userRole);
  }, [userRole]);

  // Sign in with email/password
  const signIn = async (email, password) => {
    if (!authService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('AuthContext: Attempting sign in');
      const result = await authService.signInWithPassword({
        email,
        password
      });
      
      console.log('AuthContext: Sign in result:', { 
        hasData: !!result.data, 
        hasError: !!result.error,
        errorType: result.error ? typeof result.error : null
      });
      
      // Handle the error case explicitly
      if (result.error) {
        const formattedError = typeof result.error === 'string' 
          ? { message: result.error } 
          : result.error;
          
        console.log('AuthContext: Setting error state:', formattedError);
        setError(formattedError);
        setLoading(false);
        throw formattedError; // Throw to trigger the catch in the login form
      }
      
      // Development shortcut for role setting
      if (import.meta.env.DEV && result.data?.user) {
        const userEmail = result.data.user.email;
        console.log('AuthContext: Setting role based on email in development:', userEmail);
        
        if (userEmail === 'manager@example.com') {
          console.log('AuthContext: Manual override - Setting MANAGER role');
          setUserRole(Roles.MANAGER);
        } else if (userEmail === 'demo@example.com') {
          console.log('AuthContext: Manual override - Setting DEMO_USER role');
          setUserRole(Roles.DEMO_USER);
        } else {
          console.log('AuthContext: Manual override - Setting USER role');
          setUserRole(Roles.USER);
        }
      }
      
      return result.data;
    } catch (err) {
      // Format the error consistently
      const formattedError = err.message 
        ? err 
        : { message: typeof err === 'string' ? err : 'Authentication failed' };
        
      console.log('AuthContext: Caught error:', formattedError);
      setError(formattedError);
      setLoading(false);
      throw formattedError;
    } finally {
      setLoading(false);
    }
  };

  // Sign up method
  const signUp = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: authUser, error: signUpError } = await authService.signUp(email, password);
      
      if (signUpError) {
        setError(signUpError);
        return { user: null, error: signUpError };
      }
      
      // If user was created successfully, set default role
      if (authUser && roleService) {
        await roleService.setUserRole(authUser.id, Roles.USER);
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
      
      const { user: authUser, error: signInError } = await authService.signInAnonymously();
      
      if (signInError) {
        setError(signInError);
        return { user: null, error: signInError };
      }
      
      // If anonymous user was created successfully, set default role
      if (authUser && roleService) {
        await roleService.setUserRole(authUser.id, Roles.USER);
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
      
      const { error: signOutError } = await authService.signOut();
      
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
  console.log('AuthContext: Determining manager status. Current role:', userRole, 'MANAGER role:', Roles.MANAGER);
  const isManager = userRole === Roles.MANAGER;
  console.log('AuthContext: isManager =', isManager);
  const isAdmin = userRole === Roles.ADMIN;
  
  // Check if user has a specific permission
  const hasPermission = async (permission, resource = {}) => {
    if (!user || !roleService) return false;
    return await roleService.checkPermission(user.id, permission, resource);
  };

  // Value to be provided by the context
  const value = {
    user,
    userRole,
    isManager,
    isAdmin,
    loading: loading || !initialized,
    error,
    signIn,
    signOut,
    signUp,
    signInAnonymously,
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