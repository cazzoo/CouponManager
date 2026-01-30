import PocketBaseClient from './PocketBaseClient';
import { handlePocketBaseError, AuthenticationError } from './DatabaseError';

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

export interface SignOutResponse {
  error: Error | null;
}

export interface SessionResponse {
  session: Session | null;
  error: Error | null;
}

export type AuthStateChangeCallback = (event: string, session: Session | null) => void;

type AuthStateChangeEvent = 'signedIn' | 'signedOut' | 'tokenRefreshed' | 'unauthorized';

class PocketBaseAuthService {
  private pb: PocketBase;
  private authChangeListeners: Set<AuthStateChangeCallback> = new Set();

  constructor() {
    this.pb = PocketBaseClient.getInstance();
    this.subscribeToAuthChanges();
  }

  private subscribeToAuthChanges(): void {
    this.pb.authStore.onChange((token, model) => {
      const session = token && model ? { token, user: model as User } : null;
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

  async signUp(email: string, password: string): Promise<SignUpResponse> {
    try {
      const record = await this.pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        emailVisibility: true
      });

      const user = this.mapPocketBaseUser(record);

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

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const authData = await this.pb.collection('users').authWithPassword(
        email,
        password
      );

      const user = this.mapPocketBaseUser(authData.record);
      const session: Session = {
        token: authData.token,
        user
      };

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
    try {
      const anonymousUser: User = {
        id: 'anonymous',
        email: 'anonymous@local',
        role: 'demo',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };

      const session: Session = {
        token: 'anonymous-token',
        user: anonymousUser
      };

      // Manually set the auth store to simulate authentication
      this.pb.authStore.save(session.token, anonymousUser);

      return {
        data: { user: anonymousUser, session },
        error: null
      };
    } catch (error) {
      console.error('Error in signInAnonymously:', error);
      const dbError = handlePocketBaseError(error);

      return {
        data: null,
        error: dbError
      };
    }
  }

  async signOut(): Promise<SignOutResponse> {
    try {
      this.pb.authStore.clear();

      return { error: null };
    } catch (error) {
      console.error('Error in signOut:', error);
      const dbError = handlePocketBaseError(error);

      return { error: dbError };
    }
  }

  async getCurrentSession(): Promise<SessionResponse> {
    try {
      const isValid = this.pb.authStore.isValid;

      if (!isValid || !this.pb.authStore.token) {
        return {
          session: null,
          error: null
        };
      }

      const model = this.pb.authStore.model;
      if (!model) {
        return {
          session: null,
          error: null
        };
      }

      const session: Session = {
        token: this.pb.authStore.token,
        user: model as User
      };

      return {
        session,
        error: null
      };
    } catch (error) {
      console.error('Error in getCurrentSession:', error);
      const dbError = handlePocketBaseError(error);

      return {
        session: null,
        error: dbError
      };
    }
  }

  getUser(): User | null {
    try {
      const model = this.pb.authStore.model;

      if (!model) {
        return null;
      }

      return this.mapPocketBaseUser(model);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  onAuthStateChange(callback: AuthStateChangeCallback): any {
    this.authChangeListeners.add(callback);

    const unsubscribe = () => {
      this.authChangeListeners.delete(callback);
    };

    return {
      data: { subscription: { unsubscribe } },
      error: null
    };
  }

  private mapPocketBaseUser(record: any): User {
    return {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role,
      created: record.created,
      updated: record.updated,
      emailVisibility: record.emailVisibility
    };
  }
}

export default new PocketBaseAuthService();