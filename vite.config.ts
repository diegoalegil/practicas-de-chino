import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Inyecta una Content-Security-Policy razonable SOLO en build (no en dev, para no
// romper el HMR de Vite). Permite cdn.jsdelivr.net para los datos de hanzi-writer.
const CSP =
  "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; " +
  "font-src 'self'; script-src 'self'; connect-src 'self' https://cdn.jsdelivr.net; " +
  "manifest-src 'self'; base-uri 'self'; object-src 'none'";

const cspPlugin: Plugin = {
  name: 'inyectar-csp',
  apply: 'build',
  transformIndexHtml(html) {
    return html.replace(
      '<head>',
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
    );
  },
};

// `base` debe coincidir con el nombre del repo en GitHub Pages.
// Para auditar con Lighthouse desde la raíz: `vite build --base=/`.
export default defineConfig({
  base: '/practicas-de-chino/',
  plugins: [
    cspPlugin,
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Prácticas de Chino',
        short_name: '中文',
        description: 'Reactiva y practica tu chino mandarín',
        lang: 'es',
        dir: 'ltr',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f3ead8',
        theme_color: '#c8492c',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,png,json}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.href.includes('hanzi-writer-data'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'hanzi-writer-data',
              expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
