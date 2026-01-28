/**
 * Factory for selecting the appropriate authentication service implementation
 * This factory now returns PocketBase authentication service
 */

import PocketBaseAuthService from './PocketBaseAuthService';
import type { User, Session, AuthResponse, SignOutResponse, SessionResponse, SignUpResponse } from './PocketBaseAuthService';

/**
 * Interface for AuthService implementations
 */
export interface IAuthService {
  signUp(email: string, password: string): Promise<SignUpResponse>;
  signInWithPassword(credentials: { email: string, password: string }): Promise<AuthResponse>;
  signInAnonymously(): Promise<AuthResponse>;
  signOut(): Promise<SignOutResponse>;
  getSession(): Promise<SessionResponse>;
  getUser(): User | null;
  onAuthStateChange(callback: (event: string, session: Session | null) => void): any;
}

/**
 * Gets the appropriate auth service based on the environment
 * @returns {IAuthService} The authentication service
 */
export const getAuthService = (): IAuthService => {
  console.log('Using POCKETBASE authentication service');
  return PocketBaseAuthService as unknown as IAuthService;
};

// For immediate use where async isn't possible
export default PocketBaseAuthService as unknown as IAuthService; 