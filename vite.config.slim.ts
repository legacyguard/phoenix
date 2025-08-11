import { defineConfig, mergeConfig } from 'vite';
import base from './vite.config';
export default mergeConfig(base, defineConfig({
  build: {
    // zachováme existujúce nastavenia z base, len doplníme
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts', 'chart.js', 'd3'],
          'vendor-ai': ['ai', '@ai-sdk/ui', '@ai-sdk/react', '@ai-sdk/openai', 'openai'],
          'vendor-supabase': ['@supabase/supabase-js'],
        }
      }
    },
    // zmenší bundle – vyhodí "noisy" logy a debugger v prod
    // POZN: ponechávame console.error/warn
    esbuild: {
      pure: ['console.log','console.info','console.debug'],
      drop: ['debugger']
    }
  }
}));
