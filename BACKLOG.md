# BACKLOG — Work Items with Bars

States: `TODO` / `IN-PROGRESS` (branch name recorded) / `IN-CRITIC` /
`DONE` / `BLOCKED` (see `BLOCKED.md`) / `DEFERRED` (reason recorded).

**Expansion rule:** this file always holds the CURRENT week fully detailed.
At each week boundary (day 7, 14, 21), expand the next week's items from
`ROADMAP.md` into detailed entries with gauntlet bars, as part of the
review day.

Priority order: by ID. Never start a lower item while a higher one is
`IN-PROGRESS` unless the higher one is genuinely blocked or legitimately
multi-day (then note it here).

---

## Week 1 — Foundation

### TSF-001 · D1 · Walking skeleton — PRIORITY 1 · STATUS: IN-PROGRESS (branch `agent/tsf-001-walking-skeleton`, PR #1; critic rounds 5/5 used on 2026-11-21 — §4 cap reached, merge deferred to the next day's run after round 6 converges; see RUN-LOG resume pointer)

**Deliverables:** Vite + React + TypeScript + Tailwind scaffold;
vite-plugin-pwa with offline precache; GitHub Actions CI running lint,
typecheck, test, build on every push and PR; deploy to GitHub Pages;
one Playwright smoke test that loads the app.

**Bar (gauntlet):**
- Named: the PWA installability and offline behavior of the
  [snapdrop](https://github.com/SnapDrop/snapdrop) PWA (works from first
  load, installable, fully functional offline). Fetchable: open
  https://snapdrop.net and its repo; run Lighthouse on it.
- Measurable half: Lighthouse "Install to home screen" + offline checks
  pass on OUR deployed Pages URL; CI green on main; the Playwright smoke
  test loads the deployed app with the network offline.

**Notes:** replace the stub CI job (`.github/workflows/ci.yml`) with the
real toolchain — that stub exists only so Day 0's "CI green" gate is
meaningful. Design note not required (scaffolding), but the PR must state
the tool choices and why (YAGNI lens).

---

### TSF-002 · D2 · Local data model — PRIORITY 2 · STATUS: TODO

**Deliverables:** Dexie schema for profiles, exercises, routines, sessions,
sets, foods, day-logs; typed entities; migration framework; seed script
with fixture data.

**Bar:**
- Named: the migration discipline of Dexie's own documented versioning
  pattern (https://dexie.org/docs/Tutorial/Design#database-versioning) —
  every schema change is a versioned migration, never an edit.
- Measurable half: round-trip unit tests (write → read → deep-equal) for
  every entity; a migration test that seeds a v1 database and rolls it
  forward to current, green in CI.

**Notes:** this is a non-trivial item → EGM design note required in
`docs/designs/data-model.md` before building (schema diagram, entity list,
why IndexedDB over alternatives).

---

### TSF-003 · D3 · Exercise library — PRIORITY 3 · STATUS: TODO

**Deliverables:** import script for an open exercise dataset (wger exercise
API or free-exercise-db) with muscle + equipment tags; searchable picker
screen; attribution in README.

**Bar:**
- Named: the search-and-pick speed of Hevy's exercise picker (fetchable:
  any Hevy demo video or the app's free tier).
- Measurable half: ≥300 exercises importable; an E2E test finds any
  exercise within two interactions; import script re-runnable and
  idempotent.

**Notes:** dataset choice (wger vs free-exercise-db) is a YAGNI/EGM lens
decision — record it in the PR description; attribution (license of the
dataset) is mandatory in the README.

---

### TSF-004 · D4 · Workout logger core — PRIORITY 4 · STATUS: TODO

**Deliverables:** routine builder; session player with sets × reps ×
weight, rest timer, RPE; superset support (v0); fully offline by
construction.

**Bar:**
- Named: Strong's set-entry flow — the fastest logger UI in the category
  (fetchable: Strong's free tier).
- Measurable half: a complete 3-exercise workout is logged in an
  airplane-mode E2E run with zero network requests; the session survives a
  reload; a mid-workout kill + restore resumes the active set.

**Notes:** non-trivial → design note `docs/designs/logger-core.md` (screen
flow, session state machine, how rest timer + superset interact).

---

### TSF-005 · D5 · Progress dashboards v1 — PRIORITY 5 · STATUS: TODO

**Deliverables:** weekly volume by muscle group; PR table; Recharts graphs
driven only by logged data.

**Bar:**
- Named: Hevy's advanced progress graphs (fetchable: Hevy's free tier /
  marketing screenshots) for visual clarity at v1 scope.
- Measurable half: every displayed number computed from seeded fixtures
  with snapshot tests; a lint rule or test asserting no arithmetic inside
  components (computation lives in pure modules).

---

### TSF-006 · D6 · Settings, backup, install — PRIORITY 6 · STATUS: TODO

**Deliverables:** profile + units (kg/lb); dark mode; install prompt flow
(first-class, not a gimmick — iOS storage durability depends on it); JSON
export/import.

**Bar:**
- Named: the install prompt UX of any Google "installable PWA" showcase
  example (fetchable: web.dev PWA examples).
- Measurable half: export → wipe → import restores byte-equal data in an
  E2E test; `navigator.storage.persist()` requested on first run; install
  prompt fires on an E2E-triggered beforeinstallprompt.

---

### TSF-007 · D7 · Weekly review + release v0.1 — PRIORITY 7 · STATUS: TODO

**Deliverables:** blind-critic audit of the week's full diff; drift audit
(§9 of PROTOCOL.md); refactor and debt pass; tag `v0.1`; release notes in
plain English; expand Week 2 backlog items with bars.

**Bar:**
- Measurable half: critic round on the week's diff converges with zero
  unsettled BLOCKER/MAJOR findings; `git grep -E "(TODO|FIXME)"` returns
  nothing new this week without an inline justification; v0.1 tagged and
  CI green on the tag; `docs/reports/` contains the drift report.

---

## Weeks 2–4

Expanded at each review day from `ROADMAP.md` (see the expansion rule at
the top of this file). Expected IDs: TSF-008…TSF-030, one per roadmap day.
