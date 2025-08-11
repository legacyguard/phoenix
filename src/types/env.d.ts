/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_IS_PRODUCTION: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_OPENAI_ORG_ID?: string;
  readonly VITE_ENABLE_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
