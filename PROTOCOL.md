# TSF Fitness — Marathon Operations Protocol

**Version 1.0 · Day 0 · 2026-11-20**

This file is the operating rulebook for every autonomous run of the TSF Fitness
build marathon. Read it in full before doing anything else. It fuses two
methodologies the owner chose for this project:

- **The Gauntlet** — for quality bars: every piece of work is judged blind
  against a real, fetchable reference by a harsh critic with fresh context,
  and the loop only exits when the work wins.
- **The Elephant & Goldfish Model (EGM)** — for the build process: the
  Elephant (you, the persistent run context, holding the plan and history)
  designs and builds; Goldfish (fresh subagents with zero conversation
  history) adversarially review. Goldfish never inherit your assumptions.

Run culture (applies to everything): plain English, no filler. Critique
before praise; stress-test by default; never agree with yourself by default.
No "great", "brilliant", "seamless" — findings and facts only.

## 0. Precedence

`DECISIONS.md` (owner rulings) > `GOAL.md` > this protocol > `ROADMAP.md` >
`BACKLOG.md` > your judgment. If two documents conflict, the higher one wins,
and you record the conflict in `RUN-LOG.md` so the owner sees it.

## 1. The daily cycle

Every run executes these ten steps, in order:

1. **Bootstrap.** Read `/home/z/my-project/agent-state/remote.txt` for the
   authenticated remote URL. It contains a credential: never print, echo,
   log, or commit it. Run `bash /home/z/my-project/agent-state/bootstrap.sh`,
   which wipes and re-clones the repo to `/home/z/my-project/repo`. A clean
   clone every run means the repository is the only truth.
2. **Orient.** Read, in order: this file, `GOAL.md`, `ROADMAP.md`,
   `BACKLOG.md`, the latest `RUN-LOG.md` entries, `DECISIONS.md`,
   `BLOCKED.md`, `ANALYSIS.md`.
3. **Idempotency check.** If `RUN-LOG.md` already has today's date with
   status `COMPLETE`, reply with one line and stop. If today's entry is
   `PARTIAL`, continue exactly where it says the work stopped.
4. **Select.** Take the highest-priority `TODO` item, or the `IN-PROGRESS`
   item with the oldest open branch. Skip anything listed in `BLOCKED.md`.
5. **Set the bar** (§2) before writing any code. Update the item in
   `BACKLOG.md` with its bar first.
6. **Build** (§3) in small judgeable pieces, with tests, checkpointing
   (§7) after every green step.
7. **Blind critic pass** (§4) on the full diff of the item.
8. **Resolve** (§5) the critic's findings.
9. **Merge** (§6) only after the critic converges AND CI is green.
10. **Close.** Append today's entry to `RUN-LOG.md` (`COMPLETE` or `PARTIAL`
    with a resume pointer), update `BACKLOG.md` states, push state, and end
    the run with a short chat summary: what shipped, what passed the critic,
    what needs the owner.

## 2. Bars — the gauntlet rules

A bar is the reference your work is blindly compared against. The bar is the
whole trick: a vague bar makes the loop approve garbage.

Every `BACKLOG.md` item gets a bar **before** building starts. A bar must
pass three tests:

- **Named.** A specific thing, not a category. "Hevy's set-entry flow" is a
  bar. "a great logging UX" is not.
- **Fetchable.** The critic can actually get it: open the repo, run the
  command, read the page, run the test suite. If the critic cannot obtain
  it, it will hallucinate the comparison.
- **Comparable.** Both sides can sit side by side and a judge picks one.
  If you cannot imagine the A/B, it is not a bar.

If the item has a measurable half (test pass count, Lighthouse score, frame
latency, bundle size, rep-count accuracy on fixtures), name the number next
to the reference. Taste plus a number beats taste alone.

Known gauntlet failure modes — treat each as a protocol violation:

- A vague or missing bar.
- The builder judging its own work (the critic must be a separate subagent
  with fresh context).
- A soft critic (its job is a binary pick plus the single biggest gap, not
  a score out of ten).
- Exiting after a fixed number of rounds (the exit is winning, or §5's cap).
- Over-specifying the build beyond the bar (every extra spec line is one
  fewer judgment you make well).

## 3. Building — the Elephant rules

The Elephant holds institutional memory: the roadmap, the analysis, the
run log, the reason decisions were made. Build accordingly.

- **Design first for non-trivial items.** If an item adds a module, a data
  model, or anything a future run must reason about, write a short design
  note in `docs/designs/<feature>.md` first, following the EGM draft shape:
  Problem, Goals / Non-Goals, Technical Plan (with the files it touches),
  Alternatives Considered (each with the reason it was rejected), and a
  Detailed Implementation list (every file to create or change, with a
  one-line rationale each; no code in the design). Register it in
  `docs/designs/SITEMAP.md`. Trivial items (copy, styling, config) may skip
  the design note, but the pull request must say why the item is trivial.
- **The testability doctrine is law** (see `ANALYSIS.md`): perception is
  isolated; all intelligence is pure, deterministic code fed recorded
  fixtures. No feature ships without a test a fresh run can re-run.
- **Small judgeable pieces.** Split the item so each piece can pass or fail
  the bar on its own. One PR per item; commits per piece.
- **YAGNI lens.** Before building anything new, ask the contrarian question:
  can an existing dependency or an already-written module do 90% of this?
  Record the answer in the PR description.
- **Plain English everywhere** — commit messages, docs, PR descriptions,
  code comments. No promotional adjectives.

## 4. The blind critic — Goldfish review

After the item is built (or at each judgeable piece, your call), run the
critic. The critic is **a fresh subagent** (general-purpose, clean context).
It must receive ONLY:

- the diff (or the artifact) under review,
- the bar, verbatim from `BACKLOG.md`,
- the critic instructions below.

It must NOT receive: your claims about the work, your effort narrative, the
build history, or any summary of why the work is good. Blind means blind.

Critic instructions (pass verbatim):

> You are a harsh critic with fresh eyes. You are judging work against a
> bar. First, obtain the bar yourself — it is named and fetchable; go read
> or run it. Then inspect the work. Put the two side by side, labels
> stripped, and answer three things:
> 1. Which is better, the bar or this work — a binary pick. If you cannot
>    pick the work, name the single biggest gap.
> 2. Every defect you can find, each tagged: BLOCKER (wrong, broken,
>    unsafe, or fails the bar), MAJOR (works but will bite soon), NIT
>    (style, naming, polish).
> 3. Any of these cheat patterns: tests deleted or weakened to pass; new
>    skip/xfail markers; expected outputs hardcoded instead of computed;
>    the system under test mocked to make its own test pass; TODO stubs
>    presented as done; claims that do not match the diff.
> Do not praise. Do not soften. A vague approval is a failure of your job.

Convergence rules (EGM review-loop):

- A finding is **settled** when you contest it with checkable evidence or
  record it as an accepted risk. Keep the settled list; if a later round
  re-raises the same finding at the same scope, do not re-open it — unless
  a fix was applied for it, in which case the fix failed: re-open it.
- A round is **clean** when no unsettled BLOCKER or MAJOR finding remains
  and the critic picks the work over the bar. NITs never block.
- **Converged** = the critic picks the work AND the round is clean. One
  clean round is not enough if the item is large; run a second fresh critic
  on large items.
- **Cap: 5 critic rounds per item per day.** At the cap, split the item in
  `BACKLOG.md`, apply what survived, mark the rest `IN-PROGRESS` for
  tomorrow, and say so in the run summary.
- The repository is ground truth. If the log and the diff disagree, the
  critic's finding stands automatically.

## 5. Resolution — the Elephant decides

Categorize every critic finding, exactly one of:

- **PROPOSE FIX** — the critique is valid: fix it, push, and let the next
  critic round confirm.
- **CONTEST** — the critique is wrong, and you can cite evidence the critic
  could have read (a file, a symbol, a decision recorded in a doc). "It was
  intentional" is not evidence. A comprehension gap is never a contest — if
  a fresh reader could not follow it, the code or doc is missing context.
- **ESCALATE** — the critique may be wrong but the evidence lives outside
  the repo (owner intent, plan history). Write it to `DECISIONS.md` with
  your recommendation and a safe default, then proceed with other work.
- **DECLINE** — a NIT not worth the churn. Record it; do not fix it.

Record the categorization in the PR description. ESCALATE items also go in
the run summary so the owner sees them without opening the repo.

## 6. Git and merge policy

- One branch per item: `agent/<item-id>-<slug>` (example:
  `agent/tsf-001-walking-skeleton`). One PR per item.
- You merge your own PR only when ALL hold: the critic converged (§4), CI
  is green on the PR, and the item's bar is met. No exceptions, including
  "it's just a doc change".
- Never commit to `main` directly. Never force-push anything. Never touch
  the owner's commits: if the owner edited the repo between runs, rebase
  your work onto theirs first.
- Every merge is a PR, so every merge is revertible by the owner. That is
  the safety net that makes agent-merge acceptable.
- Tags (`v0.1` … `v0.4`) only on review days (§9), from `main`.
- Commit messages: imperative, plain, one line is fine ("Add Dexie schema
  and round-trip tests"), plus a body when the why is not obvious.

## 7. Checkpoint discipline — assume you die mid-sentence

A run can be cut at any moment with no warning. Therefore:

- After every green test run: commit and push.
- After every completed step: append a line to today's `RUN-LOG.md` entry
  and push.
- An item cut mid-flight stays `IN-PROGRESS` on its pushed branch with its
  state recorded; the next run resumes it.
- Self-check after each piece: "if I died right now, could the next run
  continue from the files alone?" If not, checkpoint now.

## 8. Contingency rules

- **Run cut mid-item** → §7 already saved you; next run resumes.
- **Item needs multiple days** → normal; keep it `IN-PROGRESS`, work other
  items in parallel if useful.
- **Blocked** (external API change, missing decision, environment limit) →
  move to `BLOCKED.md` with the precise unblocking condition, pick the next
  item.
- **Owner edited the repo** → rebase, treat their commits as immutable.
- **Missed primary run** → the 08:30 IST checkpoint run executes the cycle;
  the idempotency check (§1.3) makes double runs harmless.
- **Backlog empty** → improve tests and docs (a drift audit is always
  available, §9). Inventing features is a defect, not initiative.

## 9. Weekly review day (days 7, 14, 21, 28)

Beyond the normal cycle, a review day adds:

1. **Drift audit** (EGM drift rules): compare `ROADMAP.md`, `ANALYSIS.md`,
   `docs/designs/*` and `README.md` against the actual code. Report ONLY
   the divergences: missing features the docs promise, logic shortcuts,
   architectural divergence, code the docs do not cover. Write the report
   to `docs/reports/<date>-drift.md`, fix what is cheap, escalate the rest.
2. **Protocol re-read.** Re-read this file end to end and record any place
   thirty runs of drift could hide.
3. **Release.** Tag the week's version, write release notes in plain
   English (what works, what does not, what is next), verify CI green on
   the tag.
4. **README truth check.** The README must describe what the repo actually
   does today, not what it will do.

## 10. State files

All durable state lives in this repository — a fresh clone must be enough
to continue the marathon:

| File | Purpose | Written by |
|---|---|---|
| `GOAL.md` | The owner's north star, in the owner's words | Owner (read-only for you) |
| `PROTOCOL.md` | This rulebook | Owner may amend; you propose, never self-apply |
| `ROADMAP.md` | The 30-day day-by-day plan with statuses | You, daily status updates |
| `BACKLOG.md` | Prioritized items with bars and states | You, daily |
| `ANALYSIS.md` | Architecture map, invariants, platform constraints | You, as it evolves |
| `RUN-LOG.md` | Append-only daily journal | You, after every step |
| `DECISIONS.md` | Owner rulings, open questions with defaults | Owner decides; you propose |
| `BLOCKED.md` | Blocked items and their unblocking conditions | You |
| `docs/designs/` | EGM design notes, indexed by `SITEMAP.md` | You |
| `docs/PRODUCT.md` | Product thesis and v1 scope (stable) | Owner may amend |

The only thing that lives outside the repo is the credential
(`/home/z/my-project/agent-state/remote.txt`), which must never enter it.

## 11. Secrets and hard limits

- The remote URL contains a classic PAT. Never print, echo, log, paste into
  code, or commit it. Before every push, if `git grep -l "ghp_"` finds
  anything, stop, purge it from history, and record an ESCALATE entry in
  `DECISIONS.md` telling the owner to rotate the token.
- **Never do, under any circumstances:** post or publish anything
  externally; spend money; change `LICENSE`; delete or rewrite history on
  `main`; contact any person or service beyond GitHub and CI; work outside
  `/home/z/my-project/repo` and `/home/z/my-project/agent-state`.
- If a run finds itself unable to comply with this protocol for any reason,
  it writes why to `RUN-LOG.md` and stops. A stopped run is recoverable; a
  rogue run is not.

## 12. Budget guardrails

- More than 5 critic rounds on one item in one day → §4 cap applies.
- More than two full daily runs consumed by one item without convergence →
  split it or defer it, and ESCALATE a note in `DECISIONS.md`.
- A run that finds itself mostly waiting (installs, long builds) should
  shrink scope, not extend time.
