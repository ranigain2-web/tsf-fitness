// TSF-002: the test suite — per-entity round-trips (write → read →
// deep-equal), the v1→v2 migration test, and the seed tests, per the
// bar's measurable half. Each test gets its own fake-indexeddb factory:
// full isolation, no cross-test state, no real browser storage.

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

describe('round-trip: write → read → deep-equal, every entity', () => {
  for (const [table, rows] of Object.entries(FIXTURES)) {
    it(`${table} (${rows.length} row${rows.length === 1 ? '' : 's'})`, async () => {
      const db = freshDb()
      await db.open()
      await db.table(table).bulkPut([...rows])
      const readBack = await db.table(table).toArray()
      expect(readBack).toStrictEqual([...rows])
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

describe('v1 → v2 migration', () => {
  it('rolls a seeded v1 database forward to current, data intact', async () => {
    const name = 'tsf-mig-' + crypto.randomUUID()
    const factory = new IDBFactory()
    const deps = { indexedDB: factory, IDBKeyRange }

    // A v1-only database, as shipped before v2 existed.
    const v1 = new Dexie(name, deps)
    v1.version(1).stores(V1_SCHEMA)
    await v1.open()
    // Legacy profile row: the units field does not exist yet.
    const legacyProfile = {
      id: 'legacy-profile-000',
      name: 'Legacy User',
      createdAt: 1,
      updatedAt: 2,
    }
    await v1.table('profiles').put(legacyProfile)
    await v1.table('exercises').put({
      id: 'legacy-exercise-000',
      name: 'Old Row',
      muscleGroups: ['chest'],
      equipment: null,
      source: 'builtin',
      createdAt: 3,
    })
    await v1.close()

    // Reopening with the current definition triggers the upgrade.
    const current = new TsfDb(name, deps)
    await current.open()

    // Data migration: the units default was stamped onto the legacy row.
    const migrated = await current.profiles.get('legacy-profile-000')
    expect(migrated?.units).toBe('kg')
    expect(migrated?.name).toBe('Legacy User')

    // Pre-existing data is intact.
    const exercise = await current.exercises.get('legacy-exercise-000')
    expect(exercise?.name).toBe('Old Row')

    // The new indexes exist and are usable.
    const byMuscle = await current.exercises
      .where('muscleGroups')
      .equals('chest')
      .toArray()
    expect(byMuscle.map((e) => e.id)).toContain('legacy-exercise-000')

    // Fresh writes work through the current schema.
    await current.profiles.put({
      id: 'post-migration-0001',
      name: 'New User',
      units: 'lb',
      createdAt: 4,
      updatedAt: 5,
    })
    const reread = await current.profiles.get('post-migration-0001')
    expect(reread?.units).toBe('lb')
    await current.close()
  })
})
