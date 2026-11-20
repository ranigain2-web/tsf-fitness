# ROADMAP — The 30-Day Build Marathon

Schedule: primary run daily 01:30 IST, checkpoint run 08:30 IST (idempotent).
Every day has a goal, deliverables, and an acceptance bar. Detailed bars for
the current week live in `BACKLOG.md`; this file tracks the whole arc and
the day statuses. Update the Status column at the end of every run.

Legend: `DONE` / `PARTIAL` (resume pointer in RUN-LOG.md) / `TODO` / `SKIPPED`
(with reason).

## Week 1 — Foundation (Days 1–7)

| Day | Goal | Key deliverables | Acceptance bar | Status |
|---|---|---|---|---|
| 0 | Framework | Repo, protocol, goals, roadmap, backlog, CI stub, cron armed | Fresh clone + this file + green CI | DONE |
| 1 | Walking skeleton | Vite + React + TS + Tailwind scaffold; PWA plugin with offline precache; CI (lint, typecheck, test, build); deploy to GitHub Pages; Playwright smoke | CI green on main; Pages URL serves an installable shell that loads with the network off; one E2E passes | TODO |
| 2 | Local data model | Dexie schema (profiles, exercises, routines, sessions, sets, foods, logs); typed entities; migration framework; seed fixtures | Round-trip unit tests pass; v1-data migration test rolls forward cleanly in CI | TODO |
| 3 | Exercise library | Import open exercise dataset (wger / free-exercise-db) with muscle + equipment tags; searchable picker; attribution in README | ≥300 exercises importable; any exercise findable within two interactions in an E2E test | TODO |
| 4 | Workout logger core | Routine builder; session player (sets, reps, weight, rest timer, RPE); offline by construction | A complete workout logged in an airplane-mode E2E run; session survives reload | TODO |
| 5 | Progress dashboards v1 | Weekly volume by muscle group; PR table; charts driven only by logged data | Every displayed number computed from seeded fixtures with snapshot tests; no arithmetic in components | TODO |
| 6 | Settings and safety | Profile, units (kg/lb), dark mode, install prompt flow, JSON export/import | Export → wipe → import round-trip restores byte-equal data in an E2E test | TODO |
| 7 | Review + release v0.1 | Blind-critic audit of the week; drift audit; refactor pass; tag v0.1; release notes | Critic pass recorded; zero lint debt; v0.1 live on Pages | TODO |

## Week 2 — TRAIN: the camera-AI engine (Days 8–14)

| Day | Goal | Key deliverables | Acceptance bar | Status |
|---|---|---|---|---|
| 8 | MediaPipe pipeline | Camera screen; Web Worker pose model; live 33-landmark skeleton overlay; FPS meter | Playwright with a fake camera track renders the overlay; worker frame latency under the CI budget | TODO |
| 9 | Joint-angle math | Pure functions: hip/knee/ankle, shoulder/elbow/wrist angles from landmark frames; occlusion confidence flags | Golden-fixture tests within 2 degrees; occluded frames flagged, not guessed | TODO |
| 10 | Rep-counting core | Exercise-agnostic state machine (ROM thresholds, tempo, debounce); recorded golden streams | 20+ landmark fixtures produce exact expected rep counts; property fuzzing, zero crashes | TODO |
| 11 | First exercise packs | Squat + push-up configs; live rep HUD; audio cues; set/rest flow in the camera screen | E2E replays of recorded sessions count exactly; cues fire at configured frames | TODO |
| 12 | Form feedback engine | Depth check, back-angle guard, tempo coaching; severity levels; user-adjustable thresholds | Fault-injection fixtures each trigger exactly the right cue; clean fixtures trigger none | TODO |
| 13 | Exercise packs 3–6 | Lunge, glute bridge, plank hold-timer, overhead press; in-camera phone-placement guide | Every pack has its own fixtures and passing tests | TODO |
| 14 | Review + release v0.2 | Lite/full model switch; worker offload audit; battery heuristics; critic audit; tag v0.2 | Critic pass; performance budgets hold; airplane-mode demo clip recorded as a repo artifact | TODO |

## Week 3 — FUEL: nutrition on open data (Days 15–21)

| Day | Goal | Key deliverables | Acceptance bar | Status |
|---|---|---|---|---|
| 15 | Open food data | Open Food Facts client, cache-first search; every fetched product stored locally; rate-limit backoff | Mocked-API tests pass; offline search over the local cache; backoff verified by unit tests | TODO |
| 16 | Quick logging + targets | Recent/frequent foods; meal slots; TDEE and macro targets with plain-English overrides | A day's log meets targets in an E2E run; TDEE unit tests match the standard equations | TODO |
| 17 | Barcode scanning | ZXing WASM primary engine; BarcodeDetector accelerator where supported; scanned products cached | Synthetic barcode images scan in Playwright; the product lands in the day log | TODO |
| 18 | Macro dashboard | Daily rings, weekly trends, deficit/surplus tracking | Snapshot tests over fixture data; every figure traceable to entries | TODO |
| 19 | Optional photo logging | BYO-key settings (OpenAI-compatible endpoint); parse to confirmable food entries; manual fallback | Mocked-API E2E passes; key stored locally only; tests assert the key never appears in any log or output | TODO |
| 20 | Coach bridge | Deterministic weekly insights combining training + nutrition; every insight cites its trigger numbers | Insight unit tests over fixture states; no vague templates possible | TODO |
| 21 | Review + release v0.3 | Critic audit of FUEL flows; polish; tag v0.3 | Critic pass; all FUEL E2E flows green; v0.3 live | TODO |

## Week 4 — COACH: transparent intelligence (Days 22–28)

| Day | Goal | Key deliverables | Acceptance bar | Status |
|---|---|---|---|---|
| 22 | Progression engine | Deterministic double progression from logged history; rules documented in-app, overridable | Golden tests: clean top-of-range raises weight; misses hold/deload exactly per the documented rules | TODO |
| 23 | Program builder | Goal/frequency/equipment/duration inputs → valid 3-day and 4-day splits; auto-scheduled sessions | E2E generates a program honoring all constraints; program renders to a calendar | TODO |
| 24 | Momentum + sharing | Streaks; PR celebrations; canvas-rendered share cards (pure client-side images) | Render snapshot tests; cards verified to make zero network calls | TODO |
| 25 | Self-host sync server | FastAPI + SQLite, token auth; Dockerfile + compose; last-write-wins conflicts v1; client sync toggle | pytest suite green; docker-compose up then a two-client sync E2E passes; self-host guide written | TODO |
| 26 | Polish pass | Lighthouse CI budgets (perf + a11y ≥ 90) enforced; axe scan; empty states; onboarding tour; i18n scaffold | Budgets green in CI; onboarding E2E completes; zero critical a11y findings | TODO |
| 27 | Landing page + docs | GitHub Pages site: features, embedded airplane-mode demo, self-host guide, roadmap, FAQ | Deployed and link-checked; Lighthouse run recorded | TODO |
| 28 | Release candidate v0.4 | Full blind-critic audit of the month; every GOAL.md v1 feature present or explicitly deferred; tag v0.4 | Critic pass across the whole diff since v0.1; deferral list explicit and owned | TODO |

## Final days — hardening and launch (Days 29–30)

| Day | Goal | Key deliverables | Acceptance bar | Status |
|---|---|---|---|---|
| 29 | Hardening | Adversarial fuzzing of rep counter + food parser; error boundaries; offline smoke on every route; CHANGELOG; final release | Fuzz suite in CI with zero known crashes; every route loads offline; release artifact published | TODO |
| 30 | Launch kit + retro | Show HN draft; Product Hunt kit; r/selfhosted + r/SideProject drafts; demo video script + assets; retrospective; 60-day roadmap proposal | All assets under `/launch-kit`; owner review checklist attached; retro + roadmap posted for the owner | TODO |

## Scheduling principles (why this order)

- **Risk is front-loaded.** The camera-AI engine is the hardest part and owns
  week 2, so fundamental problems surface while there is budget to adapt.
- **Value ships weekly.** Every seventh day tags a release; the product is
  demonstrable from day 7 and a stopped marathon is never a wasted one.
- **The launch is prepared, not executed.** The agent produces every asset;
  only the owner publishes.
