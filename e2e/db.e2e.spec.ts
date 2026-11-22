import { expect, test } from '@playwright/test'

// TSF-002: the data layer's real-engine verification. The unit suite
// runs on fake-indexeddb (an in-memory reimplementation); this test
// runs seedDatabase AND the v1→v2 migration inside real Chromium
// IndexedDB, via the button-gated /db-e2e.html page — engine-level
// key ordering, structured clone, and upgrade mechanics are the risk
// surface of the "no user history lost on upgrade" invariant.

const PAGE_URL = '/tsf-fitness/db-e2e.html'

test('data layer verifies on a real browser engine', async ({ page }) => {
  await page.goto(PAGE_URL)

  // Nothing runs without the click (the page is button-gated).
  await expect(page.locator('#results')).toHaveAttribute('data-done', 'false')

  await page.getByRole('button', { name: 'Run data verification' }).click()
  const results = page.locator('#results')
  await expect(results).toHaveAttribute('data-done', 'true', {
    timeout: 20_000,
  })

  const parsed = JSON.parse((await results.textContent()) ?? '[]') as Array<{
    name: string
    ok: boolean
    detail: string
  }>
  expect(parsed.length).toBe(2)
  for (const r of parsed) {
    // The failure message carries the page's own detail line.
    expect(r.ok, `${r.name}: ${r.detail}`).toBe(true)
  }
})
