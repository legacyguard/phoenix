import { defineConfig, mergeConfig } from 'vite';
import baseCfg from './vite.config';
import path from 'node:path';

function toCfg(x:any){ return typeof x === 'function' ? x({ mode:'production' }) : x; }

export default defineConfig(mergeConfig(toCfg(baseCfg), {
  resolve: {
    alias: {
      '@clerk/clerk-react': path.resolve(__dirname, 'src/test/clerk-e2e-stub.tsx'),
    }
  },
  define: {
    'import.meta.env.VITE_IS_PRODUCTION': 'false',
    'import.meta.env.VITE_ENABLE_WILL_SYNC': 'true',
    'import.meta.env.VITE_ENABLE_LEGAL_VALIDATION': 'true',
    'import.meta.env.VITE_ENABLE_EMERGENCY_ACCESS': 'true',
    'import.meta.env.VITE_ENABLE_SHARING': 'true',
    'import.meta.env.VITE_ENABLE_NOTIFICATIONS': 'true',
    'import.meta.env.VITE_PLACEHOLDER_URL': JSON.stringify('/placeholder.svg'),
  }
}));
