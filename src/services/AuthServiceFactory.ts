/**
 * Factory for selecting the appropriate authentication service implementation
 * Supports both PocketBase and Mock modes based on environment variable
 */

import PocketBaseAuthService from './PocketBaseAuthService';
import MockAuthService from './MockAuthService';
import type { User, Session, AuthResponse, SignUpResponse } from './PocketBaseAuthService';

export interface IAuthService {
  signUp(email: string, password: string): Promise<SignUpResponse>;
  signInWithPassword(credentials: { email: string, password: string }): Promise<AuthResponse>;
  signInAnonymously(): Promise<AuthResponse>;
  signOut(): Promise<boolean>;
  getSession(): Promise<{ session: Session | null; error: Error | null }>;
  getUser(): User | null;
  onAuthStateChange(callback: (event: string, session: Session | null) => void): any;
}

// Check if mock mode should be used
const useMockMode = (): boolean => {
  return import.meta.env.VITE_USE_MOCK === 'true';
};

export const getAuthService = (): IAuthService => {
  if (useMockMode()) {
    console.log('Using MOCK authentication service (VITE_USE_MOCK=true)');
    return MockAuthService as unknown as IAuthService;
  }
  console.log('Using POCKETBASE authentication service');
  return PocketBaseAuthService as unknown as IAuthService;
};

export default PocketBaseAuthService as unknown as IAuthService;
