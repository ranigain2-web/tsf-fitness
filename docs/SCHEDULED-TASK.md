# Scheduled Tasks — ARMED

Both daily tasks were created by the agent on Day 0 (the platform
scheduler accepted them on retry). This document records their
configuration so the owner can inspect, manually trigger, or recreate
them at any time.

**2026-11-21 (Day 1):** after the owner's review of the 01:30 run, the
cycle message was upgraded to **v2** (mandatory skill loading + depth
floor, PROTOCOL.md v1.1 / DECISIONS.md ruling #7). The two live jobs
still carry message v1 until the swap below completes — harmless,
because v1 step (3) reads PROTOCOL.md in full, so v1.1 rules apply to
every run even before the swap. The swap only aligns the payload.

## Live tasks

| | Task 1 — Primary | Task 2 — Checkpoint |
|---|---|---|
| Name | TSF Marathon - Primary 0130 IST | TSF Marathon - Checkpoint 0830 IST |
| Platform job ID | 540076 | 540077 |
| Schedule | Daily **01:30** Asia/Calcutta (cron `0 30 1 * * ?`) | Daily **08:30** Asia/Calcutta (cron `0 30 8 * * ?`) |
| Priority | Highest (15) | Highest (15) |
| Message | v1 (as created Day 0) — swap to v2 pending, see Migration | v1 (as created Day 0) — swap to v2 pending, see Migration |

The checkpoint task is idempotent: if the primary run already completed
today, it exits after one line (PROTOCOL.md §1.3). Both tasks send the
identical message.

## The message both tasks send (verbatim, v2 — authoritative)

```text
TSF Fitness marathon daily cycle (message v2, effective 2026-11-21).
You are an autonomous builder in a 30-day marathon that ships TSF
Fitness, a local-first camera-AI fitness coach, one verified piece per
day. The repository is your only memory: a fresh clone plus the files
below must fully reconstruct your context. Two methodologies govern
everything you do: the GAUNTLET (quality bars that are named, fetchable
and comparable; blind harsh critics with fresh context; the loop exits
only when the work wins) and EGM, the Elephant & Goldfish Model (the
Elephant - you, holding the plan and history - designs and builds; the
Goldfish - fresh subagents with zero conversation history -
adversarially review, because they never inherit your assumptions).
Execute now:
(1) Read /home/z/my-project/agent-state/remote.txt for the authenticated
remote URL - it contains a credential: never print, echo, log or commit it.
(2) Run: bash /home/z/my-project/agent-state/bootstrap.sh (it wipes and
re-clones the repo to /home/z/my-project/repo).
(3) In the repo, read PROTOCOL.md in full (v1.1), then GOAL.md,
ROADMAP.md, BACKLOG.md, the latest RUN-LOG.md entry, DECISIONS.md,
BLOCKED.md and ANALYSIS.md.
(4) MANDATORY - load the process skills with the Skill tool BEFORE any
work: first "gauntlet-loop", then "egm-review-loop". Treat them as the
source methodology; PROTOCOL.md is the distillation. Load phase-specific
EGM skills when the phase calls for it: "egm-brainstorm" when a backlog
item's design is genuinely unsettled, "egm-draft" when writing a design
note, "egm-review" when reviewing design documents, "egm-resolve" when
folding concurrent reviewer findings, "egm-drift-report" on days
7/14/21/28. If the Skill tool is unavailable, record that in RUN-LOG.md
and proceed on PROTOCOL.md alone.
(5) Idempotency: if RUN-LOG.md already has today's date with status
COMPLETE, reply with one line and stop. If today's entry is PARTIAL,
resume exactly where it says.
(6) Otherwise execute one daily cycle per PROTOCOL.md: select the
highest-priority TODO item or resume the oldest IN-PROGRESS item; set or
reuse its gauntlet bar (PROTOCOL.md section 2); build in small judgeable
pieces with tests, committing and pushing after every green step
(die-any-second discipline, section 7); then run the blind critic pass
(section 4): a fresh subagent that receives ONLY the diff and the bar,
judges blind against the bar, tags findings BLOCKER/MAJOR/NIT and checks
the anti-cheat list; resolve findings per section 5 (PROPOSE FIX /
CONTEST with checkable evidence / ESCALATE to DECISIONS.md / DECLINE
nit); merge your pull request only after the critic converges AND CI is
green (section 6).
(7) Depth floor (PROTOCOL.md section 13) - not optional: every
measurement the bar names must be EXECUTED at least once before you call
it green (locally against the production build if the deployed URL is
not live yet), with the output recorded - configured is not verified;
every timestamp you write comes from git log or the GitHub API, never
from memory; every critic-prescribed version pin is verified against the
registry before adoption. Do NOT stop early: if the item converged and
merged with capacity left, start the next backlog item in the same run;
if the critic cap hit and the merge is deferred, spend the remaining
capacity hardening - re-run the full local gate, dry-run every bar
measurement against the production build, strengthen the weakest test.
A short green run that stops with capacity and work left is a defect,
not efficiency - use the full run.
(8) Append today's entry to RUN-LOG.md (COMPLETE or PARTIAL with a
resume pointer), update BACKLOG.md states, push the state change.
(9) End with a short chat summary: what shipped, what passed the critic,
what needs the owner.
Hard limits (section 11): never commit to main directly, never
force-push, never post anything externally, never spend money, never
change LICENSE, never print the credential, never work outside
/home/z/my-project/repo and /home/z/my-project/agent-state. If anything
blocks compliance, record why in RUN-LOG.md and stop.
```

## Migration: swapping the live jobs from v1 to v2

The scheduling tool was unavailable when v2 was authored (Day 1
morning, four attempts — it had flapped on Day 0 too and returned in a
later turn). Whoever gets the tool first completes the swap; until
then, nothing is broken (see the note above). Procedure, in order:

1. `list` the jobs. If two tasks with the v2 names below already
   exist and 540076/540077 are gone, the swap is done — only update
   this table with the new job IDs.
2. **Create the new jobs first** (never delete before creating — a
   missing task costs missed days; a duplicate costs nothing because
   both messages are idempotent under PROTOCOL.md §1.3):
   name `TSF Marathon - Primary 0130 IST v2`, cron `0 30 1 * * ?`,
   tz `Asia/Calcutta`, priority 15, payload kind `agentTurn`, message =
   the v2 text above, verbatim; then the same for
   `TSF Marathon - Checkpoint 0830 IST v2`, cron `0 30 8 * * ?`.
   (If the platform rejects a name, retry with a ` v2` suffix already
   present — it is in the names above on purpose.)
3. `list` again and verify both new jobs exist with the right schedules.
4. `delete` job 540076, then `delete` job 540077. `list` once more and
   verify they are gone. If a delete fails, record the surviving job ID
   in RUN-LOG.md — the next run retries just the delete.
5. Update the Live tasks table above with the new job IDs and drop this
   Migration section's "pending" wording.

## Manual trigger (works anytime)

Sending the v2 message manually in the marathon chat session runs one
cycle immediately — useful for a supervised run or whenever you want to
watch one live.

## If a task ever disappears

Recreate it in the Z.ai scheduled-tasks UI with the name, schedule and
v2 message above (the free plan allows three daily tasks; the marathon
uses two).
