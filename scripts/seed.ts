// TSF-002: `npm run seed` — headless seeding demo. Node ships no
// IndexedDB, so this runner seeds an in-memory fake-indexeddb database
// and verifies every table: it exercises the real Dexie stack with the
// fixtures end to end. It does NOT touch your browser data. To seed
// the app's real (browser) database, run in devtools on the dev
// server: see the one-liner in src/db/seed.ts.

import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
import { TsfDb } from '../src/db/db.ts'
import { seedDatabase } from '../src/db/seed.ts'
import { FIXTURES } from '../src/db/fixtures.ts'

async function main(): Promise<void> {
  const db = new TsfDb('tsf-fitness-seed-demo', {
    indexedDB: new IDBFactory(),
    IDBKeyRange,
  })
  await db.open()
  const counts = await seedDatabase(db)

  // Verify: every table holds exactly what the fixtures define.
  for (const [table, expected] of Object.entries(FIXTURES)) {
    const actual = await db.table(table).count()
    const ok = actual === expected.length
    console.log(`${ok ? 'OK ' : 'BAD'} ${table}: ${actual}/${expected.length} rows`)
    if (!ok) {
      throw new Error(`seed verification failed for ${table}`)
    }
  }
  console.log(`headless seed complete (${Object.values(counts).reduce((a, b) => a + b, 0)} rows, in-memory)`)
  await db.close()
}

main().catch((err: unknown) => {
  console.error('seed failed:', err)
  process.exit(1)
})
