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
  const sizes: string[] = manifest.icons.map((i: { sizes: string }) => i.sizes)
  expect(sizes).toContain('192x192')
  expect(sizes).toContain('512x512')
  const maskable = manifest.icons.filter((i: { purpose?: string }) =>
    (i.purpose ?? '').includes('maskable'),
  )
  expect(maskable.length).toBeGreaterThanOrEqual(1)
})

test('service worker precaches the shell', async ({ page }) => {
  await page.goto(APP_URL)
  await waitForServiceWorker(page)

  const paths = await precachePaths(page)
  // The generated Workbox worker precaches everything the shell needs
  // offline: revisioned files (manifest, HTML, favicon, all icons) plus
  // hashed JS/CSS assets. The floor guards against gross loss while the
  // member assertions pin every load-bearing entry: HTML, the manifest,
  // JS, CSS (a styled page requires it), and an icon.
  expect(paths.length).toBeGreaterThanOrEqual(9)
  expect(paths).toContain('/tsf-fitness/index.html')
  expect(paths).toContain('/tsf-fitness/manifest.webmanifest')
  expect(paths.some((p) => p.includes('/assets/') && p.endsWith('.js'))).toBe(true)
  expect(paths.some((p) => p.includes('/assets/') && p.endsWith('.css'))).toBe(true)
  expect(paths.some((p) => p.endsWith('/icons/icon-192.png'))).toBe(true)
})

test.use({ colorScheme: 'light' })

test('app reloads with the network fully offline', async ({ page }) => {
  await page.goto(APP_URL)
  await waitForServiceWorker(page)

  await page.context().setOffline(true)
  try {
    await page.reload()
    await expect(page.getByRole('heading', { level: 1, name: 'TSF Fitness' })).toBeVisible()
    await expect(page.getByText('Train. Snap. Fuel.')).toBeVisible()
    // Styled, not merely rendered: the CSS bundle is served from the
    // precache too, so the shell keeps its Tailwind background offline.
    // (Tailwind v4 emits oklch colors; the literal pins slate-50.)
    const bg = await page.evaluate(() => {
      const main = document.querySelector('main')
      return main ? getComputedStyle(main).backgroundColor : 'missing main'
    })
    expect(bg).toBe('oklch(0.984 0.003 247.858)') // Tailwind slate-50
  } finally {
    await page.context().setOffline(false)
  }
})
