# Data Model — TSF-002 · Day 2

Date: 2026-11-22 · Author: the Day-2 run (manual cycle; owner may override
any decision below in review — DECISIONS.md cadence) · Components:
`src/db/*`, `scripts/seed.ts`

## Problem

TSF-001 shipped an installable shell with no storage. Everything the
product promises — logged workouts, an exercise library, a food log,
progress charts — needs durable local data, and ANALYSIS.md invariant #4
says a local-first app that loses user history on upgrade has failed
completely. The data model must exist before the logger (D4), library
(D3), and nutrition flows (D15+) are built, and every future schema
change must arrive as a versioned migration, never an edit.

## Goals / Non-Goals

**Goals:** a Dexie schema covering profiles, exercises, routines,
sessions, sets, foods, and day-logs; typed entities; a migration
framework using Dexie's own versioning; seed fixtures; round-trip tests
for every entity; a migration test that seeds a v1 database and rolls
it forward to current, green in CI.

**Non-Goals:** UI for any entity (D3–D6), the exercise import (D3),
nutrition search (D15), sync (D25 — the model must not preclude it:
UUID keys are the part that cannot be retrofitted without re-keying;
last-write-wins `updatedAt` timestamps on all entities arrive as a
versioned migration, v3, when D25 nears), and any query helper without
a test that needs it.

## Technical Plan

One Dexie database (`tsf-fitness`), seven tables, UUID primary keys
generated at creation time. The version history starts at v1 (the
initial index set) and v2 (current) adds the indexes the roadmap's
dashboards and barcode work need, plus a data-upgrade callback that
stamps a default `units` value onto v1 profile rows — a real
forward-evolution so the migration discipline is proven from day one,
not retrofitted.

```
UI (later days) ──► src/db/db.ts (Dexie, versions 1→2)
                      ├─ profiles   1 row-ish, settings home
                      ├─ exercises  library, *muscleGroups multi-entry
                      ├─ routines   ordered exercise id lists
                      ├─ sessions   one per workout
                      ├─ sets       per-session rows, compound index
                      ├─ foods      per-100g macros, barcode index
                      └─ dayLogs    one document per date, entries embedded
src/db/types.ts ──► all entity shapes (single source of truth)
src/db/fixtures.ts ──► scripts/seed.ts ──► populated db (dev/demo)
src/db/db.test.ts ──► fake-indexeddb: round-trips + v1→v2 migration
```

Entities (fields, not code; every field exists because a roadmap bar
names it — YAGNI fence):

| Entity | Fields | Indexed |
|---|---|---|
| Profile | id, name, units ('kg'\|'lb'), createdAt, updatedAt | updatedAt |
| Exercise | id, name, muscleGroups[], equipment, source ('builtin'\|'import'\|'custom'), createdAt | name, source, *muscleGroups |
| Routine | id, name, exerciseIds[], createdAt | name |
| WorkoutSession | id, routineId\|null, startedAt, endedAt\|null, notes\|null | routineId, startedAt |
| WorkoutSet | id, sessionId, exerciseId, order, reps, weightKg\|null, rpe\|null, done, doneAt\|null | sessionId, exerciseId, [sessionId+exerciseId] |
| Food | id, name, brand\|null, barcode\|null, per100g {kcal, protein, carb, fat}, source | name, barcode |
| DayLog | id = date 'YYYY-MM-DD', entries[{foodId, grams, meal}], updatedAt | (primary key only) |

Storage rule: weights are ALWAYS stored in kg (`weightKg`); the UI
converts for display per `Profile.units`. The storage layer never
converts.

## Alternatives Considered

1. **Auto-increment vs UUID primary keys.** Dexie's `++id` is the
   tutorial default and smaller; rejected because D25's self-host sync
   is a roadmap commitment and last-write-wins merge needs ids that are
   globally unique at creation — auto-increment ids collide across
   devices, and re-keying later is exactly the data-loss hazard
   invariant #4 forbids. UUIDs (`crypto.randomUUID`) chosen.
2. **Normalized sets vs embedded in the session document.** Embedding
   means fewer tables and one write per session update; rejected because
   D5's dashboards aggregate sets by muscle group across sessions —
   that query would load and scan every session document — and the
   session player writes sets one at a time, so the whole document
   would be rewritten per set. A `sets` table with a compound
   [sessionId+exerciseId] index chosen.
3. **DayLog entries as a table vs embedded.** The mirror argument of
   (2): no roadmap bar queries entries across days; a day's log is read
   and written as one unit in the quick-logging flow. One document per
   date, entries embedded, date-string primary key chosen.
4. **Dexie's native `.version(n).stores().upgrade()` vs a hand-rolled
   migration runner.** The bar names Dexie's documented versioning
   pattern as the reference; a custom runner re-implements it with more
   code and no test coverage. Native versioning chosen.
5. **fake-indexeddb vs mocking Dexie in tests.** Mocking the DB layer
   would test the mocks, not the schema or the migrations (the
   system-under-test-mocked anti-pattern TSF-001's critics hunt).
   fake-indexeddb is the standard in-memory IndexedDB; chosen, one
   `IDBFactory` instance per test for isolation.
6. **Seed runner tooling.** A tsx/tsx-watch devDependency would add a
   toolchain for one script; Node 24's native type stripping runs plain
   entity TS without one. `node --experimental-strip-types` chosen.
   Amended at build time (honesty over the original plan): Node ships
   no IndexedDB, so a Node-side seed cannot touch the app's real
   browser database. The seeding logic lives in `src/db/seed.ts`
   (`seedDatabase`, reusable, idempotent); `npm run seed` runs a
   headless demo on fake-indexeddb that seeds and VERIFIES every table
   (the CI-checkable evidence); browser seeding is the documented
   devtools one-liner in `src/db/seed.ts`.

## Detailed Implementation

| File | Rationale |
|---|---|
| `docs/designs/data-model.md` | This note. |
| `docs/designs/SITEMAP.md` | Register the design (first real entry). |
| `package.json` | Add `dexie@^4.4.7` (dep) and `fake-indexeddb@^6.2.8` (devDep), both registry-verified Apache-2.0; add the `seed` script. |
| `src/db/types.ts` | The seven typed entities + shared value types; the single source of truth for shapes. |
| `src/db/db.ts` | Database name, `.version(1)` baseline stores, `.version(2)` current (adds `*muscleGroups`, `barcode`, compound set index) with the units-stamping upgrade callback; exported typed table helpers. |
| `src/db/fixtures.ts` | Deterministic seed fixtures: one profile, a handful of exercises/foods, a routine, a session with sets, a day log. |
| `scripts/seed.ts` | `npm run seed`: open the db, bulk-put fixtures, print per-table counts; idempotent (put, not add). |
| `src/db/db.test.ts` | Per-entity round-trip tests (write → read → deep-equal, order-independent) against a fresh fake-indexeddb factory, a fixtures-cover-every-table guard, a frozen-literal check on the shipped v1 block, and the v1→v2 migration test (one legacy row per table, all intact, new indexes usable, verno asserted). |
| `db-e2e.html` + `src/db/e2e-page.ts` | Button-gated verification page shipped at `/db-e2e.html` (added at critic round 1): runs seedDatabase and the v1→v2 migration against the browser's REAL IndexedDB; deletes its own test databases. Excluded from the offline precache (globIgnores) — tooling, not app shell. |
| `e2e/db.e2e.spec.ts` | Playwright drives the verification page in real Chromium — engine-level key ordering, structured clone, and upgrade mechanics that fake-indexeddb cannot prove. |
| `ANALYSIS.md` | Module map: record the data layer and its invariants (UUIDs, versioned migrations only). |

No code in this note; schemas and field tables only. Registered in
SITEMAP at merge time.
