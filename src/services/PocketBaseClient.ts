import PocketBase from 'pocketbase';

export type AuthMethod = 'password' | 'oauth' | 'anonymous';

interface PocketBaseConfig {
  url: string;
  enableAutoAuth?: boolean;
  authMethod?: AuthMethod;
}

class PocketBaseClient {
  private static instance: PocketBase | null = null;
  private static config: PocketBaseConfig = {
    url: '',
    enableAutoAuth: true,
    authMethod: 'password'
  };

  private constructor() {}

  public static initialize(config?: Partial<PocketBaseConfig>): PocketBase {
    if (PocketBaseClient.instance) {
      return PocketBaseClient.instance;
    }

    PocketBaseClient.config = {
      ...PocketBaseClient.config,
      ...config
    };

    PocketBaseClient.instance = new PocketBase(PocketBaseClient.config.url);

    if (PocketBaseClient.config.enableAutoAuth) {
      PocketBaseClient.loadFromStore();
    }

    return PocketBaseClient.instance;
  }

  public static getInstance(): PocketBase {
    if (!PocketBaseClient.instance) {
      return PocketBaseClient.initialize();
    }
    return PocketBaseClient.instance;
  }

  public static reset(): void {
    if (PocketBaseClient.instance) {
      PocketBaseClient.instance = null;
    }
  }

  private static loadFromStore(): void {
    try {
      const storeData = localStorage.getItem('pocketbase_auth');
      if (storeData && PocketBaseClient.instance) {
        const authData = JSON.parse(storeData);
        console.log('​PocketBaseClient: Loading auth from store - token:', authData.token);
        console.log('​PocketBaseClient: Loading auth from store - model:', authData.model);
        PocketBaseClient.instance.authStore.save(authData.token, authData.model);
      }
    } catch (error) {
      console.error('​PocketBaseClient: Error loading auth from store:', error);
    }
  }
}

export default PocketBaseClient;