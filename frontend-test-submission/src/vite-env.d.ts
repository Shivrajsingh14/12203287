/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_EVALUATION_SERVER_URL: string;
  readonly VITE_AUTH_TOKEN: string;
  readonly VITE_PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
