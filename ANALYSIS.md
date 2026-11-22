# ANALYSIS — Architecture, Invariants, Platform Constraints

The living technical map of the codebase. Every run updates this when the
architecture evolves; the weekly drift audit checks it against reality.

## Stack (decided Day 0)

| Layer | Choice | Why |
|---|---|---|
| Client | Vite + React + TypeScript | Type-checkable refactors = the cheapest critic available |
| Styling | Tailwind CSS | Utility classes keep UI diffs mechanical and reviewable |
| PWA | vite-plugin-pwa (Workbox) | Battle-tested service worker + offline precache from config |
| Local data | Dexie (IndexedDB) | Typed schemas, live queries, versioned migrations |
| Vision AI | @mediapipe/tasks-vision (WASM, Web Worker) | 33-landmark pose tracking, in-browser, Apache-2.0 |
| State | Zustand | Minimal, testable; no ceremony |
| Unit tests | Vitest | Fast, Vite-native |
| E2E | Playwright | Headless in CI, fake camera tracks, synthetic barcodes |
| Charts | Recharts | Declarative, snapshot-testable |
| Sync server (optional) | FastAPI + SQLite + Docker | One file of routes, one embedded DB, one container |
| CI / hosting | GitHub Actions + GitHub Pages | Free tier, public and auditable |

The backend is small by design: product truth lives on devices; the server
is only an optional relay the user may choose to run.

## Architecture

```
 [Camera getUserMedia]
        │  (frames never leave the device)
        ▼
 [MediaPipe Pose — WASM worker]  ──► 33 landmarks/frame
        │
        ▼
 [Pure engines (TypeScript)]      angles → rep counter → form coach
        │        ▲                         (100% unit-testable,
        │        └── recorded golden fixtures)      │
        ▼                                           ▼
 [Screens: coach overlay, logger,  ◄── Dexie/IndexedDB (local-first)
  food search, dashboard, settings]        │
        ▲                                 │ opt-in only
        └── [Service worker: offline, install]   ▼
                                   [Self-host sync: FastAPI + SQLite, Docker]
```

## Invariants (never violate)

1. **No socket from the inference pipeline.** There is no code path from
   camera frames or landmark data to any network call. This is topology,
   not policy.
2. **Pure engines.** Angle math, rep counting, form rules, progression,
   and nutrition arithmetic are pure functions from recorded input to
   output. Tests replay golden fixtures and assert exact outcomes.
3. **The camera is never required by tests.** Perception is mocked at the
   landmark-stream boundary.
4. **Every schema change is a versioned Dexie migration.** A local-first
   app that loses user history on upgrade has failed completely.
5. **Zero telemetry in v1.** No analytics, no error reporting, no beacons.
6. **No arithmetic in components.** Computation lives in pure modules;
   components render.

## Platform constraints and responses

| Constraint | Fact | Response |
|---|---|---|
| iOS storage eviction | Safari clears script-writable storage after 7 days of non-use; home-screen installed web apps are exempt | Install-first onboarding; `navigator.storage.persist()` on first run; automatic export reminders; one-tap JSON backup (D6) |
| Barcode detection on iOS | BarcodeDetector API unsupported on Safari; fallback scanning reported unreliable | ZXing WASM is the primary cross-platform engine; BarcodeDetector only as accelerator where supported (D17) |
| Pose model size | Several MB on first load | Service-worker precache with progress UI; fully offline after first load (D8) |
| Open Food Facts limits | Free shared API, rate-limited; uneven regional coverage | Cache-first: every fetched product stored locally; search prefers local cache (D15) |
| Camera permissions | getUserMedia needs HTTPS + user gesture | GitHub Pages is HTTPS; camera requested inside the coaching flow, never on load |
| Pose accuracy varies | Accuracy varies with angle, lighting, body type; vendors claim up to ~97% under good conditions (self-reported) | Per-exercise thresholds, user-adjustable ROM, honest placement guide, confidence flags on occlusion (D12–13) |

## Module map

Grows as the codebase grows. Day 0: only the framework exists; Day 1 adds
the client scaffold and the real CI; Day 2 adds the Dexie data layer
(`src/db/`: typed entities, versions 1→2 with the units-stamping upgrade,
deterministic fixtures, round-trip + migration tests on fake-indexeddb).
Data-layer invariants: UUID primary keys generated at creation (sync-safe
for D25), every schema change is a new Dexie version with an upgrade path —
never an edit to a shipped version block (invariant 4). (The weekly drift
audit verifies this section against the actual tree.)
