// TSF-002: the Dexie database.
// Import convention for this subtree: explicit .ts extensions — the app's
// tsconfig allows them (allowImportingTsExtensions), and they keep these
// modules directly executable by Node's type stripping (npm run seed). Versions follow Dexie's documented
// versioning pattern (the bar's named reference): every schema change
// is a NEW version block with its own stores() and, when data must
// move, an upgrade() callback. A shipped version block is never edited
// (ANALYSIS.md invariant #4: no user history lost on upgrade).

import Dexie, { type DexieOptions, type EntityTable } from 'dexie'
import type {
  DayLog,
  Exercise,
  Food,
  Profile,
  Routine,
  WorkoutSession,
  WorkoutSet,
} from './types.ts'

export const DB_NAME = 'tsf-fitness'

// v1 — the baseline as first shipped: seven tables, basic indexes.
// Kept verbatim forever: it is the migration source for any database
// created before v2 existed.
export const V1_SCHEMA = {
  profiles: 'id, updatedAt',
  exercises: 'id, name, source',
  routines: 'id, name',
  sessions: 'id, routineId, startedAt',
  sets: 'id, sessionId, exerciseId',
  foods: 'id, name',
  dayLogs: 'id',
} as const

// v2 — current. Adds the indexes the roadmap needs: multi-entry
// muscle groups (D5 volume-by-muscle dashboards), barcode (D17
// scanning), and the compound set index (per-session-per-exercise
// queries). The upgrade callback stamps the units default onto v1
// profile rows that predate the field.
export const V2_SCHEMA = {
  ...V1_SCHEMA,
  exercises: 'id, name, source, *muscleGroups',
  sets: 'id, sessionId, exerciseId, [sessionId+exerciseId]',
  foods: 'id, name, barcode',
} as const

export class TsfDb extends Dexie {
  profiles!: EntityTable<Profile, 'id'>
  exercises!: EntityTable<Exercise, 'id'>
  routines!: EntityTable<Routine, 'id'>
  sessions!: EntityTable<WorkoutSession, 'id'>
  sets!: EntityTable<WorkoutSet, 'id'>
  foods!: EntityTable<Food, 'id'>
  dayLogs!: EntityTable<DayLog, 'id'>

  constructor(name: string = DB_NAME, deps?: DexieOptions) {
    super(name, deps)
    this.version(1).stores(V1_SCHEMA)
    this.version(2)
      .stores(V2_SCHEMA)
      .upgrade((tx) =>
        // Legacy rows lack the units field entirely (typed as a record:
        // the entity type requires it, the stored v1 data may not have it).
        tx
          .table('profiles')
          .toCollection()
          .modify((p: Record<string, unknown>) => {
            if (p.units === undefined) p.units = 'kg'
          }),
      )
  }
}

// The application instance. Tests never use it — they construct their
// own TsfDb on a fresh fake-indexeddb factory per test.
export const db = new TsfDb()
