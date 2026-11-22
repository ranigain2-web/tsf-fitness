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

// One legacy row per table — mirrors the unit test: every table must
// survive the real-engine roll-forward, not just profiles.
const LEGACY_ROWS: Record<string, { id: string } & Record<string, unknown>> = {
  profiles: {
    id: 'legacy-profile-000',
    name: 'Legacy User',
    createdAt: 1,
    updatedAt: 2,
  },
  exercises: {
    id: 'legacy-exercise-000',
    name: 'Old Row',
    muscleGroups: ['chest'],
    equipment: null,
    source: 'builtin',
    createdAt: 3,
  },
  routines: {
    id: 'legacy-routine-000',
    name: 'Old Routine',
    exerciseIds: ['legacy-exercise-000'],
    createdAt: 3,
  },
  sessions: {
    id: 'legacy-session-000',
    routineId: 'legacy-routine-000',
    startedAt: 4,
    endedAt: null,
    notes: null,
  },
  sets: {
    id: 'legacy-set-000',
    sessionId: 'legacy-session-000',
    exerciseId: 'legacy-exercise-000',
    order: 1,
    reps: 5,
    weightKg: 100,
    rpe: null,
    done: true,
    doneAt: 5,
  },
  foods: {
    id: 'legacy-food-000',
    name: 'Old Food',
    brand: null,
    barcode: '4006381333931',
    per100g: { kcal: 1, protein: 1, carb: 1, fat: 1 },
    source: 'custom',
  },
  dayLogs: {
    id: '2026-11-01',
    entries: [{ foodId: 'legacy-food-000', grams: 100, meal: 'lunch' }],
    updatedAt: 6,
  },
}

function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(name)
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
    detail:
      mismatches.join(', ') ||
      `${Object.keys(FIXTURES).length} tables, ${total} rows verified`,
  }
}

async function verifyMigration(): Promise<Result> {
  const name = 'tsf-e2e-migration'
  await deleteDatabase(name)

  // A v1-only database, as shipped before v2 existed.
  const v1 = new Dexie(name)
  v1.version(1).stores(V1_SCHEMA)
  await v1.open()
  for (const [table, row] of Object.entries(LEGACY_ROWS)) {
    await v1.table(table).put(row)
  }
  await v1.close()

  // Reopen with the current definition: the upgrade must run, every
  // legacy row must survive, and the units default must be stamped.
  const current = new TsfDb(name)
  await current.open()
  const problems: string[] = []
  if (current.verno !== 2) problems.push(`verno=${current.verno}`)
  for (const [table, row] of Object.entries(LEGACY_ROWS)) {
    const readBack = await current.table(table).get(row.id)
    if (!readBack) problems.push(`${table}: lost row`)
  }
  const p = await current.profiles.get('legacy-profile-000')
  if (p?.units !== 'kg' || p?.name !== 'Legacy User') {
    problems.push(`profiles upgrade: units=${p?.units}, name=${p?.name}`)
  }
  // All three v2 indexes usable on the real engine.
  const byMuscle = await current.exercises
    .where('muscleGroups')
    .equals('chest')
    .count()
  if (byMuscle !== 1) problems.push(`muscleGroups index: ${byMuscle}`)
  const byBarcode = await current.foods
    .where('barcode')
    .equals('4006381333931')
    .count()
  if (byBarcode !== 1) problems.push(`barcode index: ${byBarcode}`)
  const compound = await current.sets
    .where('[sessionId+exerciseId]')
    .equals(['legacy-session-000', 'legacy-exercise-000'])
    .count()
  if (compound !== 1) problems.push(`compound index: ${compound}`)
  await current.close()
  await deleteDatabase(name)
  return {
    name: 'v1→v2 migration on real engine (7 tables, 3 indexes)',
    ok: problems.length === 0,
    detail: problems.join(', ') || 'all legacy rows intact, units stamped, indexes usable',
  }
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
