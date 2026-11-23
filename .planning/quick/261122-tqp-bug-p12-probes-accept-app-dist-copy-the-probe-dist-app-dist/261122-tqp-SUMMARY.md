---
phase: quick-261122-tqp
plan: 01
subsystem: phase-12-probes
tags: [security, probes, T-12-48]
status: complete
requires: []
provides:
  - 12-tab-probe.mjs and 12-keys-probe.mjs refuse a PROBE_DIST that resolves to app/dist
  - 12-refusal-check.sh, a committed check that failed first and now ends REFUSAL PASS
key-files:
  created:
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-refusal-check.sh
  modified:
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-tab-probe.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-keys-probe.mjs
commits: 2
completed: 2026-11-22
---

# Quick 261122-tqp: tab and keys probes refuse app/dist

The tab and keys probes now carry 12-phone-probe.mjs's refusal block (realOf plus the three-clause if), line for line, after `DIST` and before the index.html check. Mark's served `app/dist` is refused with one FAIL line and exit 1, before any server, browser or file read.

## Commits

- `0405444c` test(261122-tqp): the check script, committed first (RED)
- `00e96385` fix(261122-tqp): the copied block in both probes (GREEN)

## RED (before the fix, 0405444c)

```
PASS refusal 12-phone-probe.mjs decoy
PASS refusal 12-phone-probe.mjs app/dist
PASS refusal 12-phone-probe.mjs scratch
FAIL refusal 12-tab-probe.mjs decoy: exit 1, printed FAIL no index.html in PROBE_DIST .../decoy/app/dist
SKIP refusal 12-tab-probe.mjs app/dist (not run: the decoy was not refused)
PASS refusal 12-tab-probe.mjs scratch
FAIL refusal 12-keys-probe.mjs decoy: exit 1, printed FAIL no index.html in PROBE_DIST .../decoy/app/dist
SKIP refusal 12-keys-probe.mjs app/dist (not run: the decoy was not refused)
PASS refusal 12-keys-probe.mjs scratch
REFUSAL FAIL 2
```

## GREEN (after the fix, 00e96385)

```
PASS refusal 12-phone-probe.mjs decoy / app/dist / scratch
PASS refusal 12-tab-probe.mjs decoy / app/dist / scratch
PASS refusal 12-keys-probe.mjs decoy / app/dist / scratch
REFUSAL PASS
```

Block diff against the phone probe: empty for both probes (GREEN-CONFIRMED).

Literal runs from the worktree root (its own `app/dist`, which does not exist here; the main checkout's was never touched):

```
PROBE_DIST=app/dist node .../12-tab-probe.mjs        -> FAIL PROBE_DIST resolves to app/dist (...): build to a scratch folder instead / exit=1
PROBE_DIST=app/dist node .../12-keys-probe.mjs move keys lines -> same single line / exit=1
```

In both probes the refusal line (68 / 62) comes before the index.html check (72 / 66); `realpathSync` appears twice in each (import plus use).

## Deviations from Plan

None - plan executed as written. The check script was run with `sh`; the block-equality check used bash process substitution from a scratch helper script.

## For the orchestrator

- The T-12-48 row in 12-SECURITY.md is still marked open (not edited, as the plan says). Close it with fix commit `00e96385` via the orchestrator or `/gsd-secure-phase 12`.
- The worktree has no app/dist, so the "real app/dist" case here resolved to the worktree's own empty path. Re-run `sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-refusal-check.sh` in the main checkout after the merge, as the dispatch note says.
- Results are Node runs on a Mac, no browser, no device. Nothing for Mark's List.

## Self-Check: PASSED

Files exist, both commits are on the branch, nothing under app/ was changed, 12-check.sh, 12-phone-probe.mjs and 12-SECURITY.md untouched.
