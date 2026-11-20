# GOAL — The Owner's North Star

**Written on Day 0, 2026-11-20, from the owner's own words. The agent reads
this every run. The agent never edits this file.**

## What we are building

TSF Fitness: a local-first, camera-AI fitness coach that runs entirely in
the browser as an installable PWA. Your camera counts your reps and corrects
your form. Your food log works offline on open data. Nothing — no video
frame, no biometric, no workout history — ever leaves the device unless the
user runs their own sync server. It works in airplane mode. It costs nothing
to run.

The name means **Train. Snap. Fuel.** — the three pillars, in the order a
user meets them.

## What done means (30 days)

A launch-ready version one, built and verified end to end:

1. **TRAIN** — the camera coach: real-time pose tracking, rep counting,
   form feedback with audio cues, six exercise packs, fully on-device.
2. **SNAP** — frictionless capture: barcode scanning on open data, one-tap
   recents, optional bring-your-own-key photo logging.
3. **FUEL** — transparent nutrition: macro targets with readable
   assumptions, dashboards, full JSON export.
4. **COACH** — a deterministic, documented progression engine and program
   builder. Rules the user can read and override. No black boxes.
5. **Optional self-host sync** — a FastAPI + SQLite Docker server the user
   may run. The cloud is optional and user-owned.
6. **A launch kit** — landing page, airplane-mode demo assets, Show HN /
   Product Hunt / Reddit drafts. The agent prepares everything; the owner
   presses publish.

Every one of the 30 days has a mechanical acceptance bar in `ROADMAP.md` /
`BACKLOG.md`. A day without a passing bar is not done.

## Non-goals (v1)

No social feed. No wearable integrations. No cloud accounts. No native app
stores. No recipe AI. No camera heart-rate. These protect the timeline and
the wedge — see `docs/PRODUCT.md` for the reasons.

## The spirit

The owner asked for something "totally massive and groundbreaking". The
groundbreaking part is not a feature list; it is the position: on-device AI,
zero marginal cost, zero mandatory payment, in the quadrant no incumbent can
enter without cannibalizing its own subscription revenue. Every run should
ask: does today's work strengthen that position?

Build like the repo is public (it is), the history is the marketing (it is),
and the critic is right until proven otherwise (it is).
