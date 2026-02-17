import { handlePocketBaseError, AuthenticationError } from './DatabaseError';
import PocketBase, { RecordModel } from 'pocketbase';
import PocketBaseClient from './PocketBaseClient';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created: string;
  updated: string;
  emailVisibility?: boolean;
}

export interface Session {
  token: string;
  user: User;
}

export interface AuthResponse {
  data: {
    user: User;
    session?: Session;
  } | null;
  error: Error | null;
}

export interface SignUpResponse {
  data: {
    user: User;
  } | null;
  error: Error | null;
}

class PocketBaseAuthService {
  private pb: PocketBase;
  private authChangeListeners: Set<AuthStateChangeCallback> = new Set();

  constructor() {
    this.pb = PocketBaseClient.getInstance();
    this.subscribeToAuthChanges();
  }

  private subscribeToAuthChanges(): void {
    this.pb.authStore.onChange((token, model) => {
      const session = token && model ? { token, user: model as unknown as User } : null;
      const event = this.getAuthEvent(token, model);

      this.notifyAuthChange(event, session);
    });
  }

  private getAuthEvent(token: string | null, model: any): AuthStateChangeEvent {
    if (!token) {
      return 'signedOut';
    }
    if (token && !this.pb.authStore.model) {
      return 'signedIn';
    }
    return 'tokenRefreshed';
  }

  private notifyAuthChange(event: string, session: Session | null): void {
    this.authChangeListeners.forEach(callback => {
      try {
        callback(event, session);
      } catch (error) {
        console.error('Error in auth state change callback:', error);
      }
    });
  }

  private mapPocketBaseUser(record: RecordModel): User {
    return {
      id: record.id,
      email: record.email || '',
      name: record.name,
      created: record.created || new Date().toISOString(),
      updated: record.updated || new Date().toISOString(),
      emailVisibility: record.emailVisibility || false
    };
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const authData = await this.pb.collection('users').authWithPassword(
        email,
        password
      );

      const { token, record } = authData;
      const user = {
        id: record.id,
        email: record.email,
        name: record.name,
        role: record.role,
        created: record.created,
        updated: record.updated,
        emailVisibility: record.emailVisibility
      } as unknown as User;
      const session: Session = {
        token,
        user
      };

      this.pb.authStore.save(session.token, user as unknown as RecordModel);

      return {
        data: { user, session },
        error: null
      };
    } catch (error) {
      console.error('Error in signIn:', error);
      const dbError = handlePocketBaseError(error);

      return {
        data: null,
        error: dbError
      };
    }
  }

  async signInWithPassword(credentials: { email: string; password: string }): Promise<AuthResponse> {
    return this.signIn(credentials.email, credentials.password);
  }

  async signInAnonymously(): Promise<AuthResponse> {
    // Anonymous sign-in uses the demo user account
    // This allows users to explore the app without registering
    // Password from seed script: demo12345
    return this.signIn('demo@example.com', 'demo12345');
  }

  async signUp(email: string, password: string): Promise<SignUpResponse> {
    try {
      const record = await this.pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        name: 'Regular User',
        emailVisibility: true
      });

      const user = {
        id: record.id,
        email: record.email,
        name: record.name,
        role: record.role,
        created: record.created,
        updated: record.updated,
        emailVisibility: record.emailVisibility
      } as unknown as User;
      
      return {
        data: { user },
        error: null
      };
    } catch (error) {
      console.error('Error in signUp:', error);
      const dbError = handlePocketBaseError(error);

      return {
        data: null,
        error: dbError
      };
    }
  }

  async signOut(): Promise<boolean> {
    try {
      this.pb.authStore.clear();
      this.notifyAuthChange('signedOut', null);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  }

  get isAuthenticated(): boolean {
    return this.pb.authStore.isValid && !!this.pb.authStore.token;
  }

  get currentUser(): User | null {
    const model = this.pb.authStore.model;
    return model ? {
        id: model.id,
        email: model.email,
        name: model.name,
        role: model.role,
        created: model.created,
        updated: model.updated,
        emailVisibility: model.emailVisibility
      } as User : null;
  }

  getUser(): User | null {
    return this.currentUser;
  }

  get currentToken(): string | null {
    return this.pb.authStore.token || null;
  }

  addAuthChangeListener(callback: AuthStateChangeCallback): void {
    this.authChangeListeners.add(callback);
  }

  removeAuthChangeListener(callback: AuthStateChangeCallback): void {
    this.authChangeListeners.delete(callback);
  }

  onAuthStateChange(callback: AuthStateChangeCallback): { data: { unsubscribe: () => void } } {
    this.addAuthChangeListener(callback);
    return {
      data: {
        unsubscribe: () => {
          this.removeAuthChangeListener(callback);
        }
      }
    };
  }

  async getSession(): Promise<{ session: Session | null; error: Error | null }> {
    try {
      const session = this.pb.authStore.token && this.currentUser ? {
        token: this.pb.authStore.token,
        user: this.currentUser
      } : null;
      return { session, error: null };
    } catch (error) {
      return { session: null, error: error as Error };
    }
  }
}

export default new PocketBaseAuthService();

export type AuthStateChangeCallback = (event: string, session: Session | null) => void;

type AuthStateChangeEvent = 'signedIn' | 'signedOut' | 'tokenRefreshed' | 'unauthorized';