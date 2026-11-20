import { expect, test, type Page } from '@playwright/test'

/**
 * TSF-001 smoke: the shell is installable and offline-capable.
 *
 * These checks are the mechanical core of the gauntlet bar (snapdrop's
 * PWA behavior): a manifest that Chrome can install, a service worker
 * that precaches the shell, and a reload that survives losing the
 * network. They run against the production build (vite preview), the
 * same artifact GitHub Pages serves.
 */

const APP_URL = '/tsf-fitness/'

async function waitForServiceWorker(page: Page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    // skipWaiting + clientsClaim are emitted by the generated worker, so
    // the page is controlled on first load; wait for that to be true.
    for (let i = 0; i < 100; i++) {
      if (navigator.serviceWorker.controller) return
      await new Promise((r) => setTimeout(r, 100))
    }
    throw new Error('service worker never took control of the page')
  })
}

async function precachePaths(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const names = await caches.keys()
    for (const name of names) {
      if (name.startsWith('workbox-precache')) {
        const cache = await caches.open(name)
        const requests = await cache.keys()
        return requests.map((r) => new URL(r.url).pathname)
      }
    }
    return []
  })
}

test('shell loads with name, pillars, and installable manifest', async ({ page }) => {
  await page.goto(APP_URL)
  await expect(page.getByRole('heading', { level: 1, name: 'TSF Fitness' })).toBeVisible()
  await expect(page.getByText('Train. Snap. Fuel.')).toBeVisible()

  const manifestLink = page.locator('link[rel="manifest"]')
  await expect(manifestLink).toHaveCount(1)
  const manifestHref = await manifestLink.getAttribute('href')
  expect(manifestHref).toBe('/tsf-fitness/manifest.webmanifest')

  const manifest = await page.evaluate(async () => {
    const res = await fetch((document.querySelector('link[rel="manifest"]') as HTMLLinkElement).href)
    return res.json()
  })
  expect(manifest.name).toBe('TSF Fitness')
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons.length).toBeGreaterThanOrEqual(2)
  const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes)
  expect(sizes).toContain('512x512')
})

test('service worker precaches the shell', async ({ page }) => {
  await page.goto(APP_URL)
  await waitForServiceWorker(page)

  const paths = await precachePaths(page)
  // The generated Workbox worker caches manifest, HTML, JS, CSS and icons
  // (9 entries for this shell: 4 revisioned files + 3 hashed assets +
  // favicon + webmanifest).
  expect(paths.length).toBeGreaterThanOrEqual(8)
  expect(paths).toContain('/tsf-fitness/index.html')
  expect(paths.some((p) => p.includes('/assets/') && p.endsWith('.js'))).toBe(true)
  expect(paths.some((p) => p.endsWith('/icons/icon-192.png'))).toBe(true)
})

test('app reloads with the network fully offline', async ({ page }) => {
  await page.goto(APP_URL)
  await waitForServiceWorker(page)

  await page.context().setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'TSF Fitness' })).toBeVisible()
  await expect(page.getByText('Train. Snap. Fuel.')).toBeVisible()
  await page.context().setOffline(false)
})
