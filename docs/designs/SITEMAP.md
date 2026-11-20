# Design Docs — SITEMAP

EGM design notes index. Every non-trivial feature gets a design doc in
this directory BEFORE it is built (PROTOCOL.md §3), registered here:
Link, Date, Author, Components, Description.

| Link | Date | Author | Components | Description |
|---|---|---|---|---|
| — | — | — | — | No designs yet. First expected: `data-model.md` (TSF-002, Day 2) and `camera-pipeline.md` (TSF-008, Day 8). |

## Design doc shape (keep it short and plain)

1. **Problem** — the user pain, one paragraph.
2. **Goals / Non-Goals** — explicit scope fence.
3. **Technical Plan** — prose + a simple diagram; files it touches.
4. **Alternatives Considered** — each with the reason it was rejected
   (`Rejected: <technical reason>`).
5. **Detailed Implementation** — every file to create or change with a
   one-line rationale each. No code.

Review: every design doc faces a Goldfish critic pass before
implementation starts (zoom-out: does this serve GOAL.md? comprehension:
is it self-contained? critique: what is wrong, missing, risky?).
