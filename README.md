# TSF Fitness

**Train. Snap. Fuel. — the local-first, camera-AI fitness coach that works
in airplane mode.**

Your camera counts your reps and corrects your form. Your food log works
offline on open data. Nothing — no video frame, no biometric, no workout
history — ever leaves your device unless you run your own sync server.

This repository is being built by an **autonomous 30-day agent marathon**:
one focused run every night (01:30 IST) with an 08:30 IST checkpoint,
executing `ROADMAP.md` day by day, merging only what survives a blind
critic. The full commit history is the build log.

## Status

| | |
|---|---|
| Day | 1 of 30 — walking skeleton (TSF-001) |
| Current release | — (v0.1 expected Day 7) |
| Live app | https://ranigain2-web.github.io/tsf-fitness/ — CI deploys `main` and re-verifies the deployed URL (offline smoke, blocking) on every push |

## Development

The app is a local-first PWA: once loaded, the shell (and later, all data
and engines) works with the network off.

```bash
npm install        # install dependencies
npm run dev        # dev server
npm run build      # typecheck + production build (dist/)
npm run preview    # serve the production build
npm test           # Vitest unit tests
npm run e2e        # Playwright offline smoke tests (builds first)
npm run lint       # ESLint
npm run typecheck  # tsc -b
```

Installability and offline behavior are enforced by CI: Playwright loads
the production build, waits for the service worker to control the page,
verifies the precache, then reloads with the network cut and asserts the
shell still renders.

## The operating framework

This repo doubles as a reusable **template** for autonomous build marathons.
Everything the agent needs survives a fresh clone:

| Document | What it governs |
|---|---|
| [GOAL.md](GOAL.md) | The owner's north star (read every run, never edited by the agent) |
| [PROTOCOL.md](PROTOCOL.md) | The rulebook: daily cycle, gauntlet bars, blind critic, EGM review, merge policy, hard limits |
| [ROADMAP.md](ROADMAP.md) | The 30-day day-by-day plan with statuses |
| [BACKLOG.md](BACKLOG.md) | Current-week work items, each with a named acceptance bar |
| [ANALYSIS.md](ANALYSIS.md) | Architecture, invariants, platform constraints |
| [RUN-LOG.md](RUN-LOG.md) | Append-only daily journal |
| [DECISIONS.md](DECISIONS.md) | Owner rulings and adopted defaults |
| [BLOCKED.md](BLOCKED.md) | Items awaiting external unblocking |
| [docs/PRODUCT.md](docs/PRODUCT.md) | Product thesis and v1 scope |
| [docs/designs/](docs/designs/) | EGM design notes, indexed by SITEMAP.md |

## The three pillars

1. **TRAIN** — on-device pose tracking (MediaPipe, WASM), rep counting,
   form feedback with audio cues. Zero marginal cost, zero data risk.
2. **SNAP** — barcode scanning on Open Food Facts (~4.8M products, open
   data), one-tap recents, optional bring-your-own-key photo logging.
3. **FUEL** — macro targets with plain-English assumptions, dashboards,
   deterministic coaching rules you can read and override.

Full rationale, competitive analysis and the 30-day plan: see the documents
above. License: MIT (client); the optional sync server will be AGPL-3.0.
