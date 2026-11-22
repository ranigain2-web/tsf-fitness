/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves this repo at https://ranigain2-web.github.io/tsf-fitness/
// so every asset path must carry the /tsf-fitness/ base. Manifest URLs are
// relative ("." and "icons/..."), which the manifest spec resolves against
// the manifest's own URL — correct on any subpath without hardcoding.
export default defineConfig({
  base: '/tsf-fitness/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'TSF Fitness',
        short_name: 'TSF',
        description:
          'Local-first fitness coach PWA. Train. Snap. Fuel. Everything stays on your device.',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
        // The plugin auto-injects the manifest and the manifest icons into
        // the precache; globbing webmanifest/png on top of that duplicates
        // them in the generated manifest (the runtime cache dedupes, but
        // the shipped artifact must be clean). svg stays: favicon.svg is a
        // public/ asset the plugin does not inject. The apple-touch icon
        // is not manifest-injected either, so it gets an explicit entry —
        // an offline iOS add-to-home-screen needs it from the precache.
        globPatterns: ['**/*.{js,css,html,svg}', 'icons/icon-apple-180.png'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
