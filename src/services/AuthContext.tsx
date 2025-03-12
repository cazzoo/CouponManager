import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthService } from './AuthServiceFactory';
import { getRoleService, Roles } from './RoleServiceFactory';
import { User, UserRole } from '../types';

// Define interfaces for the context
interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<{ success: boolean; error?: string }>;
  hasPermission: (permission: string, resource?: Record<string, any>) => Promise<boolean>;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthService {
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithPassword?: (credentials: { email: string, password: string }) => Promise<any>;
  signOut: () => Promise<void>;
  getUser: () => User | null;
  onAuthStateChange: (callback: (event: string, session: any) => void) => { data: { unsubscribe: () => void } };
  signInAnonymously?: () => Promise<any>;
}

interface RoleService {
  getUserRole: (userId: string) => Promise<{ role: UserRole } | null>;
  setUserRole: (userId: string, role: UserRole) => Promise<{ role: UserRole } | null>;
  checkPermission: (role: UserRole, permission: string, resource?: Record<string, any>) => Promise<boolean>;
}

// Define the RolesEnum to ensure correct typing
enum RolesEnum {
  USER = 'user',
  MANAGER = 'manager',
  DEMO_USER = 'demo'
}

// Create context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider component for authentication state
 * Manages user authentication state and provides auth methods
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authService, setAuthService] = useState<AuthService | null>(null);
  const [roleService, setRoleService] = useState<RoleService | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Helper to load a user's role
  const loadUserRole = async (userId: string): Promise<void> => {
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
          setUserRole(RolesEnum.MANAGER as UserRole);
          return;
        }
        
        if (userId === '00000000-0000-0000-0000-000000000004') {
          console.log('AuthContext: Development override - setting DEMO_USER role for demo user');
          setUserRole(RolesEnum.DEMO_USER as UserRole);
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
        const newRole = await roleService.setUserRole(userId, RolesEnum.USER as UserRole);
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
    let unsubscribe: (() => void) | null = null;
    
    const initializeAuth = async (): Promise<void> => {
      try {
        setLoading(true);
        
        // Get the appropriate auth service (real or mock) based on environment
        const service = await getAuthService() as unknown as AuthService;
        setAuthService(service);
        
        // Get the appropriate role service
        const roles = await getRoleService() as unknown as RoleService;
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
        const { data } = service.onAuthStateChange((event: string, session: any) => {
          console.log('AuthContext: Auth state change event:', event, session ? 'with session' : 'no session');
          
          if (event === 'SIGNED_IN' && session) {
            const sessionUser = service.getUser();
            if (sessionUser) {
              console.log('AuthContext: User signed in:', sessionUser.email);
              setUser(sessionUser);
              loadUserRole(sessionUser.id);
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('AuthContext: User signed out');
            setUser(null);
            setUserRole(null);
          } else if (event === 'USER_UPDATED') {
            console.log('AuthContext: User updated');
            const updatedUser = service.getUser();
            if (updatedUser) {
              setUser(updatedUser);
            }
          }
        });
        
        unsubscribe = data.unsubscribe;
        setError(null);
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Failed to initialize authentication');
        setUser(null);
        setUserRole(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    
    initializeAuth();
    
    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        console.log('AuthContext: Cleaning up auth subscription');
        unsubscribe();
      }
    };
  }, []);

  /**
   * Sign in a user with email and password
   */
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!authService) {
      return { success: false, error: 'Authentication service not initialized' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('AuthContext: Attempting sign in for user:', email);
      
      // Try to use signIn if it exists, otherwise fallback to signInWithPassword
      let result;
      if (typeof authService.signIn === 'function') {
        console.log('AuthContext: Using authService.signIn method');
        result = await authService.signIn(email, password);
      } else if (typeof authService.signInWithPassword === 'function') {
        console.log('AuthContext: Using authService.signInWithPassword method');
        result = await authService.signInWithPassword({ email, password });
      } else {
        console.error('AuthContext: No compatible sign-in method found');
        setError('Authentication service is not properly configured');
        return { success: false, error: 'Authentication service is not properly configured' };
      }
      
      const { data, error: signInError } = result;
      
      if (signInError) {
        console.error('AuthContext: Sign in error:', signInError);
        setError(signInError.message || 'Failed to sign in');
        return { success: false, error: signInError.message };
      }
      
      if (!data?.user) {
        console.error('AuthContext: No user data returned from sign in');
        setError('Sign in failed - no user data returned');
        return { success: false, error: 'No user data returned' };
      }
      
      console.log('AuthContext: User signed in successfully:', data.user.email);
      // User will be set by auth state change listener
      return { success: true };
    } catch (err: any) {
      console.error('AuthContext: Unexpected sign in error:', err);
      const errorMessage = err.message || 'An unexpected error occurred during sign in';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up a new user
   */
  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!authService) {
      return { success: false, error: 'Authentication service not initialized' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('AuthContext: Attempting sign up for user:', email);
      const { data, error: signUpError } = await authService.signUp(email, password);
      
      if (signUpError) {
        console.error('AuthContext: Sign up error:', signUpError);
        setError(signUpError.message || 'Failed to sign up');
        return { success: false, error: signUpError.message };
      }
      
      if (!data?.user) {
        console.error('AuthContext: No user data returned from sign up');
        setError('Sign up failed - no user data returned');
        return { success: false, error: 'No user data returned' };
      }
      
      console.log('AuthContext: User signed up successfully:', data.user.email);
      
      // In many auth systems, sign up automatically signs the user in
      // The auth state change listener will handle setting the user
      
      return { success: true };
    } catch (err: any) {
      console.error('AuthContext: Unexpected sign up error:', err);
      const errorMessage = err.message || 'An unexpected error occurred during sign up';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in anonymously for demo access
   */
  const signInAnonymously = async (): Promise<{ success: boolean; error?: string }> => {
    if (!authService || !authService.signInAnonymously) {
      return { success: false, error: 'Anonymous sign in not supported' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('AuthContext: Attempting anonymous sign in');
      const { data, error: signInError } = await authService.signInAnonymously();
      
      if (signInError) {
        console.error('AuthContext: Anonymous sign in error:', signInError);
        setError(signInError.message || 'Failed to sign in anonymously');
        return { success: false, error: signInError.message };
      }
      
      if (!data?.user) {
        console.error('AuthContext: No user data returned from anonymous sign in');
        setError('Anonymous sign in failed - no user data returned');
        return { success: false, error: 'No user data returned' };
      }
      
      console.log('AuthContext: Anonymous user signed in successfully');
      // User will be set by auth state change listener
      // Role should be set to DEMO_USER automatically
      
      return { success: true };
    } catch (err: any) {
      console.error('AuthContext: Unexpected anonymous sign in error:', err);
      const errorMessage = err.message || 'An unexpected error occurred during anonymous sign in';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async (): Promise<void> => {
    if (!authService) {
      console.error('AuthContext: Cannot sign out - auth service not initialized');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('AuthContext: Signing out user');
      await authService.signOut();
      
      // The auth state change listener will handle clearing the user state
      console.log('AuthContext: User signed out successfully');
    } catch (err: any) {
      console.error('AuthContext: Sign out error:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if the current user has a specific permission
   */
  const hasPermission = async (permission: string, resource: Record<string, any> = {}): Promise<boolean> => {
    if (!userRole || !roleService) {
      console.log('AuthContext: Permission check failed - no user role or role service');
      return false;
    }
    
    try {
      const allowed = await roleService.checkPermission(userRole, permission, resource);
      console.log(`AuthContext: Permission check for ${permission}:`, allowed ? 'GRANTED' : 'DENIED');
      return allowed;
    } catch (err) {
      console.error(`AuthContext: Error checking permission ${permission}:`, err);
      return false;
    }
  };

  // Provide the auth context value
  const contextValue: AuthContextType = {
    user,
    userRole,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    signInAnonymously,
    hasPermission
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use the auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 