# DECISIONS — Owner Rulings, Open Questions, Defaults

The owner is the only authority here. The agent proposes (with a
recommendation and a safe default); the owner decides. Owner replies in
chat are transcribed here by the next run.

## Resolved by the owner (binding)

| # | Decision | Ruling | Date |
|---|---|---|---|
| 1 | Build target | TSF Fitness — local-first, camera-AI fitness coach, 30-day autonomous marathon | 2026-11-20 |
| 2 | Authentication | Classic PAT, owner-supplied; stored outside the repo; never echoed | 2026-11-20 |
| 3 | Merge policy | The agent merges its own PRs only after blind-critic convergence + green CI; never touches main directly | 2026-11-20 |
| 4 | Schedule | Two runs daily: 01:30 IST primary + 08:30 IST checkpoint (idempotent), highest priority | 2026-11-20 |
| 5 | Repository | Public GitHub repo `ranigain2-web/tsf-fitness`, marked as a template; framework lives IN the repo so a fresh clone carries everything | 2026-11-20 |
| 6 | Process skills | Gauntlet methodology for bars + blind critics; EGM for the build process (design notes, Goldfish reviews, severity-tagged findings, resolve/contest/escalate, drift audits) | 2026-11-20 |
| 7 | Run depth & skill loading | Protocol v1.1, owner-directed after the Day 1 primary-run review: every primary run loads `gauntlet-loop` + `egm-review-loop` via the Skill tool before work (phase EGM skills as routed in §1); depth floor §13 (executed measurements, server-stamped timestamps, registry-verified critic prescriptions, no early stop, next item after an early merge); scheduled-task message upgraded to v2 (docs/SCHEDULED-TASK.md) | 2026-11-21 |

## Adopted defaults (owner may override anytime — say so in chat)

| # | Question | Adopted default | Rationale |
|---|---|---|---|
| 7 | Name meaning | TSF = Train. Snap. Fuel. | Maps to the three pillars in user order |
| 8 | License | MIT (client); AGPL-3.0 for the sync server when it lands (D25) | Max adoption + nobody can sell a closed fork of the server |
| 9 | Photo food logging | In v1 (D19), strictly optional, bring-your-own-key | The Cal AI lesson without the cost structure |
| 10 | Telemetry | Zero in v1 | Privacy is the product; success metrics instead |
| 11 | Future pricing | Decide by D30; candidate: free core + optional hosted sync $2–3/mo | Undercuts every serious tracker; self-host stays free forever |
| 12 | Launch anchor | Day 30 + 2 days for owner review before any posting | Owner publishes, never the agent |
| 13 | Owner review cadence | 15 minutes every Sunday: skim RUN-LOG + merged PRs | Small scheduled presence; autonomy stays supervised |

## Open (awaiting the owner)

_None. Nothing blocks Day 1._
