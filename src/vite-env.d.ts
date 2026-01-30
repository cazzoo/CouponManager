/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  // Add any custom env variables here
  readonly VITE_POCKETBASE_URL: string;
  readonly VITE_AUTO_MOCK_DATA: string;
  readonly VITE_USE_MEMORY_DB: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}