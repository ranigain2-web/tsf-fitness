// TSF-002: reusable seeding — writes the deterministic fixtures into a
// database, idempotently (bulkPut). Used by the headless demo runner
// (scripts/seed.ts) and by tests; to seed the app's real browser
// database, run this in devtools on the dev server:
//   const m = await import('/src/db/seed.ts'), d = await import('/src/db/db.ts')
//   await m.seedDatabase(d.db)

import type { TsfDb } from './db.ts'
import { FIXTURES } from './fixtures.ts'

export async function seedDatabase(db: TsfDb): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  for (const [table, rows] of Object.entries(FIXTURES)) {
    await db.table(table).bulkPut([...rows])
    counts[table] = rows.length
  }
  return counts
}
