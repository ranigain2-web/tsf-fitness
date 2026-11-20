# PRODUCT — Thesis, Scope, Moat

The stable product definition. The agent builds toward this; the owner may
amend it (via DECISIONS.md).

## Positioning (one sentence)

TSF Fitness is a local-first, camera-AI fitness coach: your camera counts
your reps and corrects your form, your food log works offline on open
data, and nothing ever leaves your device unless you run your own sync
server. It installs as a PWA in one tap, works in airplane mode, and
costs nothing to run.

## Why this position is empty (research summary, Nov 2026)

- **The wounded incumbent:** MyFitnessPal ($19.99/mo) paywalled its
  barcode scanner, suffered a ~143M-account breach (2018), and bought the
  disruptor Cal AI (closed Dec 2025) — proof that AI-assisted logging is
  the category's future, and that incumbents buy rather than build.
- **The proof of demand:** Cal AI — photo → calories, built by two
  teenagers — reached 15M+ downloads and $30M+/yr before acquisition.
  Every photo is a paid cloud inference: its speed advantage carries a
  per-use cost.
- **The serious loggers:** Hevy ($23.99/yr) and Strong ($29.99/yr) own
  lifting UX; neither looks at a frame of video; Hevy Trainer explicitly
  adapts only to logged performance.
- **The algorithms:** MacroFactor ($71.99/yr) sells a server-side black
  box; users cannot inspect or export the logic.
- **The ownership niche:** wger proves people want data ownership badly
  enough to run their own server — but it has no AI and no modern UX.

Nobody combines **on-device AI + offline-first data + open food data +
self-hostable sync**. That quadrant is empty because entering it means an
incumbent cannibalizing its subscription revenue and rewriting its data
pipeline at the same time.

## v1 scope (what ships by Day 30)

- Camera coach: pose tracking, rep counting, form feedback, 6 exercise
  packs, audio cues, phone-placement guide.
- Offline workout logger: routines, supersets, rest timer, RPE, PRs.
- Nutrition: Open Food Facts cache-first search, barcode scan, quick
  logging, TDEE + macro targets, dashboards, optional BYO-key photo
  logging (user's own API key; the app never charges for or pays for
  cloud inference).
- Transparent coach: deterministic double progression, program builder,
  weekly insights that cite their trigger numbers.
- Local-first core: JSON export/import, install-first onboarding (iOS
  storage durability), zero telemetry.
- Optional self-host sync: FastAPI + SQLite, Docker, token auth.
- Launch kit: landing page, airplane-mode demo assets, launch post drafts.

## Deliberate exclusions (v1) and why

- **No social feed** — saturated, shifts tool → platform.
- **No wearables** — third-party ecosystems would own the roadmap.
- **No cloud accounts** — identity is the device; sync is opt-in and yours.
- **No native app stores** — one PWA codebase, no review queues, no
  15–30% toll.
- **No recipe AI** — not the wedge.
- **No camera heart-rate (rPPG)** — not reliable enough to ship under a
  fitness brand's credibility in 30 days; parked as a post-v1 experiment.

## Moat and economics

Features get copied in a quarter; cost structures do not. On-device
inference means zero marginal cost per user — the server bill that forces
every cloud competitor into subscriptions does not exist. Privacy is a
physical property (airplane mode), not a policy. Open data means no
lock-in flywheel — which is precisely why users stay voluntarily. The
optional sync is self-hosted Docker, which incumbents cannot offer without
undermining their hosted businesses.

Revenue follows the cost structure: free open-source core; optional hosted
sync at $2–3/mo for those who want convenience without self-hosting
(decision D30, DECISIONS.md).

## Viral mechanics (prepared, not promised)

The ten-second demo: phone on the floor, airplane mode ON, squats counted
aloud, form corrected. No cloud competitor can imitate it — theirs
genuinely stops working offline. The build story: an autonomous agent
built this in 30 nights while its owner slept; the public git history is
the receipt. Distribution surfaces (owner publishes): Show HN, Product
Hunt, r/selfhosted, r/SideProject, short-form video.
