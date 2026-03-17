import PocketBase from 'pocketbase';

export type AuthMethod = 'password' | 'oauth' | 'anonymous';

interface PocketBaseConfig {
  url: string;
  authMethod?: AuthMethod;
}

class PocketBaseClient {
  private static instance: PocketBase | null = null;
  private static config: PocketBaseConfig = {
    url: import.meta.env.VITE_POCKETBASE_URL || '',
    authMethod: 'password'
  };

  private constructor() {}

  public static initialize(config?: Partial<PocketBaseConfig>): PocketBase {
    if (PocketBaseClient.instance) {
      return PocketBaseClient.instance;
    }

    PocketBaseClient.config = {
      ...PocketBaseClient.config,
      ...config,
      // Use env URL if config doesn't specify one
      url: config?.url || PocketBaseClient.config.url
    };

    PocketBaseClient.instance = new PocketBase(PocketBaseClient.config.url);

    // PocketBase SDK natively handles localStorage persistence
    // The authStore automatically loads from localStorage on initialization
    // No need for custom loadFromStore() logic

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
}

export default PocketBaseClient;