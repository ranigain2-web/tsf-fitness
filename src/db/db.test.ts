// TSF-002: the test suite — per-entity round-trips (write → read →
// deep-equal), seed tests, and the v1→v2 migration test, per the bar's
// measurable half. Each test gets its own fake-indexeddb factory: full
// isolation, no cross-test state, no real browser storage. Real-engine
// verification lives in e2e/db.e2e.spec.ts against actual Chromium.

import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
import Dexie from 'dexie'
import { describe, expect, it } from 'vitest'
import { TsfDb, V1_SCHEMA } from './db.ts'
import { FIXTURES } from './fixtures.ts'
import { seedDatabase } from './seed.ts'

function freshDb(): TsfDb {
  return new TsfDb('tsf-test-' + crypto.randomUUID(), {
    indexedDB: new IDBFactory(),
    IDBKeyRange,
  })
}

const byId = (a: { id: string }, b: { id: string }) =>
  a.id < b.id ? -1 : a.id > b.id ? 1 : 0

describe('round-trip: write → read → deep-equal, every entity', () => {
  it('the fixtures cover every table exactly (no silent rot)', async () => {
    const db = freshDb()
    await db.open()
    expect(Object.keys(FIXTURES).sort()).toEqual(
      db.tables.map((t) => t.name).sort(),
    )
    await db.close()
  })

  for (const [table, rows] of Object.entries(FIXTURES)) {
    it(`${table} (${rows.length} row${rows.length === 1 ? '' : 's'})`, async () => {
      const db = freshDb()
      await db.open()
      await db.table(table).bulkPut([...rows])
      // toArray order is by primary key; compare content, not insertion
      // order — sort both sides so an out-of-order fixture cannot fail
      // spuriously.
      const readBack = await db.table(table).toArray()
      expect([...readBack].sort(byId)).toStrictEqual([...rows].sort(byId))
      await db.close()
    })
  }
})

describe('seed', () => {
  it('populates every table with exactly the fixtures', async () => {
    const db = freshDb()
    await db.open()
    await seedDatabase(db)
    for (const [table, rows] of Object.entries(FIXTURES)) {
      expect(await db.table(table).count()).toBe(rows.length)
    }
    await db.close()
  })

  it('is idempotent: seeding twice changes nothing', async () => {
    const db = freshDb()
    await db.open()
    await seedDatabase(db)
    const before = await Promise.all(
      Object.keys(FIXTURES).map(async (t) => [t, await db.table(t).count()] as const),
    )
    await seedDatabase(db)
    for (const [table, count] of before) {
      expect(await db.table(table).count()).toBe(count)
    }
    await db.close()
  })
})

// The historical v1 schema, frozen as a literal: an edit to the shipped
// V1_SCHEMA block in db.ts must fail this equality — a shipped version
// block is never edited (the Dexie versioning pattern the bar names).
const FROZEN_V1 = {
  profiles: 'id, updatedAt',
  exercises: 'id, name, source',
  routines: 'id, name',
  sessions: 'id, routineId, startedAt',
  sets: 'id, sessionId, exerciseId',
  foods: 'id, name',
  dayLogs: 'id',
} as const

describe('v1 → v2 migration', () => {
  it('the shipped v1 block is frozen verbatim', () => {
    expect(V1_SCHEMA).toEqual(FROZEN_V1)
  })

  it('rolls a seeded v1 database forward to current, every table intact', async () => {
    const name = 'tsf-mig-' + crypto.randomUUID()
    const factory = new IDBFactory()
    const deps = { indexedDB: factory, IDBKeyRange }

    // A v1-only database, as shipped before v2 existed. One legacy row
    // per table — every table must survive the upgrade, not just the
    // two that gain indexes.
    const v1 = new Dexie(name, deps)
    v1.version(1).stores(FROZEN_V1)
    await v1.open()
    // Legacy profile row: the units field does not exist yet.
    const legacyRows: Record<string, unknown> = {
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
    for (const [table, row] of Object.entries(legacyRows)) {
      await v1.table(table).put(row)
    }
    await v1.close()

    // Reopening with the current definition triggers the upgrade.
    const current = new TsfDb(name, deps)
    await current.open()
    expect(current.verno).toBe(2)

    // Data migration: the units default was stamped onto the legacy row.
    const migrated = await current.profiles.get('legacy-profile-000')
    expect(migrated?.units).toBe('kg')
    expect(migrated?.name).toBe('Legacy User')

    // Every table's legacy row is intact after the roll-forward.
    for (const [table, row] of Object.entries(legacyRows)) {
      const id = (row as { id: string }).id
      const readBack = await current.table(table).get(id)
      expect(readBack, `${table} lost its legacy row`).toBeTruthy()
    }
    // Deep-check two shapes the upgrade could plausibly mangle.
    expect(await current.foods.get('legacy-food-000')).toStrictEqual(
      legacyRows.foods,
    )
    expect(await current.dayLogs.get('2026-11-01')).toStrictEqual(
      legacyRows.dayLogs,
    )

    // The new indexes exist and are usable.
    const byMuscle = await current.exercises
      .where('muscleGroups')
      .equals('chest')
      .toArray()
    expect(byMuscle.map((e) => e.id)).toContain('legacy-exercise-000')
    const byBarcode = await current.foods
      .where('barcode')
      .equals('4006381333931')
      .toArray()
    expect(byBarcode.map((f) => f.id)).toContain('legacy-food-000')
    const compound = await current.sets
      .where('[sessionId+exerciseId]')
      .equals(['legacy-session-000', 'legacy-exercise-000'])
      .toArray()
    expect(compound.map((s) => s.id)).toContain('legacy-set-000')

    // Fresh writes work through the current schema.
    await current.profiles.put({
      id: 'post-migration-0001',
      name: 'New User',
      units: 'lb',
      createdAt: 7,
      updatedAt: 8,
    })
    const reread = await current.profiles.get('post-migration-0001')
    expect(reread?.units).toBe('lb')
    await current.close()
  })
})
