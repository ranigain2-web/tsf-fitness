// TSF-002: real-engine verification page (served at /db-e2e.html,
// linked from the e2e suite). The unit tests run on fake-indexeddb;
// this page runs seedDatabase and the v1→v2 migration against the
// browser's REAL IndexedDB — key ordering, structured clone, and
// upgrade mechanics are exactly where a reimplementation can diverge,
// and the migration invariant is "no user history lost on upgrade".
// Button-gated: storage is never touched without a click. Only its own
// fixed-name test databases are used, and they are deleted afterwards.

import Dexie from 'dexie'
import { TsfDb, V1_SCHEMA } from './db.ts'
import { FIXTURES } from './fixtures.ts'
import { seedDatabase } from './seed.ts'

interface Result {
  name: string
  ok: boolean
  detail: string
}

function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(name)
    // Deleting a nonexistent database is a success; blocked resolves
    // too — the next open would just wait its turn.
    req.onsuccess = () => resolve()
    req.onerror = () => resolve()
    req.onblocked = () => resolve()
  })
}

async function verifySeed(): Promise<Result> {
  const name = 'tsf-e2e-seed'
  await deleteDatabase(name)
  const db = new TsfDb(name)
  await db.open()
  await seedDatabase(db)
  const mismatches: string[] = []
  for (const [table, rows] of Object.entries(FIXTURES)) {
    const n = await db.table(table).count()
    if (n !== rows.length) mismatches.push(`${table}: ${n}/${rows.length}`)
  }
  const total = Object.values(FIXTURES).reduce((a, r) => a + r.length, 0)
  await db.close()
  await deleteDatabase(name)
  return {
    name: 'seed on real engine',
    ok: mismatches.length === 0,
    detail: mismatches.join(', ') || `${Object.keys(FIXTURES).length} tables, ${total} rows verified`,
  }
}

async function verifyMigration(): Promise<Result> {
  const name = 'tsf-e2e-migration'
  await deleteDatabase(name)

  // A v1-only database, as shipped before v2 existed.
  const v1 = new Dexie(name)
  v1.version(1).stores(V1_SCHEMA)
  await v1.open()
  await v1.table('profiles').put({
    id: 'legacy-profile-000',
    name: 'Legacy User',
    createdAt: 1,
    updatedAt: 2,
  })
  await v1.close()

  // Reopen with the current definition: the upgrade must run and the
  // legacy row must come through with the units default stamped.
  const current = new TsfDb(name)
  await current.open()
  const p = await current.profiles.get('legacy-profile-000')
  const detail = `verno=${current.verno}, units=${p?.units ?? 'missing'}, name=${p?.name ?? 'missing'}`
  const ok =
    current.verno === 2 && p?.units === 'kg' && p?.name === 'Legacy User'
  await current.close()
  await deleteDatabase(name)
  return { name: 'v1→v2 migration on real engine', ok, detail }
}

async function run(): Promise<void> {
  const results = document.querySelector('#results')
  if (!results) throw new Error('#results missing')
  const out: Result[] = []
  for (const fn of [verifySeed, verifyMigration]) {
    try {
      out.push(await fn())
    } catch (err) {
      out.push({ name: fn.name, ok: false, detail: String(err) })
    }
  }
  results.textContent = JSON.stringify(out, null, 2)
  results.setAttribute('data-done', 'true')
}

document.querySelector('#run')?.addEventListener('click', () => {
  void run()
})
