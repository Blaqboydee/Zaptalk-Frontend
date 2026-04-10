import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      // "autoUpdate" = when you deploy a new version, the SW updates silently
      // in the background and activates on next page load. No pop-ups needed.
      registerType: 'autoUpdate',

      // Tell Workbox to also precache these public-folder assets
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon-180x180.png', 'pwa-*.png', 'maskable-icon-512x512.png'],

      // ── Web App Manifest ──────────────────────────────────────────────
      // This is the JSON file that tells the OS/browser how to present
      // your app when installed. Think of it as your app's ID card.
      manifest: {
        name: 'Ember',
        short_name: 'Ember',          // used on home screen where space is tight
        description: 'Talk to those who matter',
        theme_color: '#FF5722',       // browser toolbar / status bar tint
        background_color: '#06040C',  // splash screen bg while app loads
        display: 'standalone',        // hides browser chrome — feels native
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            // 512px is required for Chrome's install dialog and splash screen
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            // maskable = Android clips this to a circle/squircle shape
            // The generator added background + safe-zone padding automatically
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      // ── Workbox (Service Worker) config ───────────────────────────────
      // Workbox is Google's library that powers the SW. These are its rules.
      workbox: {
        // Precache everything Vite outputs — JS, CSS, HTML
        // "Precache" = download & store on first visit so later visits are instant
        globPatterns: ['**/*.{js,css,html,svg,ico}'],

        runtimeCaching: [
          // Google Fonts stylesheet — cache for 1 year
          // "CacheFirst" = serve from cache, only hit network if not cached yet
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Google Fonts files — cache for 1 year
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // API calls — "NetworkFirst": try network, fall back to cache if offline
          // This means chat messages show stale data rather than a blank screen
          {
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 }, // 5 min
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    allowedHosts: ['eugenio-moira-lowell.ngrok-free.dev'],
  },
})

