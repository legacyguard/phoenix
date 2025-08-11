import { defineConfig, mergeConfig } from 'vite';
import base from './vite.config';
import { visualizer } from 'vite-plugin-visualizer';
export default mergeConfig(base, defineConfig({
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
      open: false,
    })
  ]
}));
