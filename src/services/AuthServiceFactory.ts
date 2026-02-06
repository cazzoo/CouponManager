/**
 * Factory for selecting the appropriate authentication service implementation
 * This factory now returns PocketBase authentication service
 */

import PocketBaseAuthService from './PocketBaseAuthService';
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

export const getAuthService = (): IAuthService => {
  console.log('Using POCKETBASE authentication service');
  return PocketBaseAuthService as unknown as IAuthService;
};

export default PocketBaseAuthService as unknown as IAuthService;