import { defineConfig, mergeConfig } from 'vite';
import base from './vite.config';
import { VitePWA } from 'vite-plugin-pwa';

export default mergeConfig(base, defineConfig({
  plugins: [
    VitePWA({
      injectRegister: 'auto',         // automaticky zaregistruje SW v prod
      registerType: 'autoUpdate',     // SW sa sám aktualizuje
      includeAssets: [],              // nepridávame zbytočnosti
      manifest: {
        name: 'Phoenix',
        short_name: 'Phoenix',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#111827',
        icons: [] // ikonky rieš neskôr, nechceme nafukovať repo
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: null, // bez offline fallbacku, je to SPA
        runtimeCaching: [
          // statické same-origin: cache-first
          {
            urlPattern: ({request, sameOrigin}) => sameOrigin && ['script','style','image','font'].includes(request.destination),
            handler: 'CacheFirst',
            options: { cacheName: 'static-v1', expiration: { maxEntries: 200, maxAgeSeconds: 60*60*24*30 } }
          },
          // HTML navigácie: network-first (čisté SPA bez offline)
          {
            urlPattern: ({request}) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'pages-v1', networkTimeoutSeconds: 3 }
          },
          // externé API (opatrne): stale-while-revalidate na GET
          {
            urlPattern: ({url, request}) => request.method === 'GET' && !url.origin.includes(location.origin),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'x-origin-v1', expiration: { maxEntries: 100, maxAgeSeconds: 60*10 } }
          }
        ]
      }
    })
  ]
}));
