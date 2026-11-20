# Scheduled Task Setup — Paste-Ready

The agent session cannot create platform scheduled tasks itself (the
scheduling tool was unavailable on Day 0). The **owner** creates the two
daily tasks in the Z.ai scheduled-tasks UI. Everything else is already
armed: repository, bootstrap, protocol, CI.

## Create these two tasks (copy-paste)

| | Task 1 — Primary | Task 2 — Checkpoint |
|---|---|---|
| Name | TSF Marathon - Primary 0130 IST | TSF Marathon - Checkpoint 0830 IST |
| Schedule | Daily at **01:30** (Asia/Calcutta) | Daily at **08:30** (Asia/Calcutta) |
| Priority | Highest available | Highest available |
| Message | see below (same for both) | see below (same for both) |

The checkpoint task is idempotent: if the primary run already completed
today, it exits after one line (PROTOCOL.md §1.3). Both tasks use the
identical message.

## The message (paste verbatim into both tasks)

```text
TSF Fitness marathon daily cycle. Execute now:
(1) Read /home/z/my-project/agent-state/remote.txt for the authenticated
remote URL - it contains a credential: never print, echo, log or commit it.
(2) Run: bash /home/z/my-project/agent-state/bootstrap.sh (it wipes and
re-clones the repo to /home/z/my-project/repo).
(3) In the repo, read PROTOCOL.md in full, then GOAL.md, ROADMAP.md,
BACKLOG.md, the latest RUN-LOG.md entry, DECISIONS.md, BLOCKED.md and
ANALYSIS.md.
(4) Idempotency: if RUN-LOG.md already has today's date with status
COMPLETE, reply with one line and stop. If today's entry is PARTIAL,
resume exactly where it says.
(5) Otherwise execute one daily cycle per PROTOCOL.md: select the
highest-priority TODO item or resume the oldest IN-PROGRESS item; set or
reuse its gauntlet bar (named, fetchable, comparable - PROTOCOL.md
section 2); build in small judgeable pieces following the testability
doctrine (ANALYSIS.md invariants); commit and push after every green step
(die-any-second discipline, section 7); then run the blind critic pass
(section 4): a fresh subagent that receives ONLY the diff and the bar,
judges blind against the bar, tags findings BLOCKER/MAJOR/NIT and checks
the anti-cheat list; resolve findings per section 5 (PROPOSE FIX / CONTEST
with checkable evidence / ESCALATE to DECISIONS.md / DECLINE nit); merge
your pull request only after the critic converges AND CI is green
(section 6).
(6) Append today's entry to RUN-LOG.md (COMPLETE or PARTIAL with a resume
pointer), update BACKLOG.md states, push the state change.
(7) End with a short chat summary: what shipped, what passed the critic,
what needs the owner.
Hard limits (section 11): never commit to main directly, never
force-push, never post anything externally, never spend money, never
change LICENSE, never print the credential, never work outside
/home/z/my-project/repo and /home/z/my-project/agent-state. If anything
blocks compliance, record why in RUN-LOG.md and stop.
```

## Manual trigger (works anytime)

Sending the same message manually in the marathon chat session runs one
cycle immediately — useful for a supervised Day 1 or whenever you want to
watch a run live.
