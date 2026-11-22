import { defineConfig, devices } from '@playwright/test'

// E2E runs against the production build served by `vite preview`, so the
// test exercises exactly what GitHub Pages will ship (base path, hashed
// assets, service worker), not the dev server.
//
// Setting E2E_BASE_URL (used by the post-deploy CI job) switches the whole
// suite to run against the deployed app instead of a local server; in that
// mode no webServer is started.
const liveBaseUrl = process.env.E2E_BASE_URL

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: liveBaseUrl ?? 'http://localhost:4173',
  },
  webServer: liveBaseUrl
    ? undefined
    : {
        command: 'npm run preview -- --port 4173 --strictPort',
        url: 'http://localhost:4173/tsf-fitness/',
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
