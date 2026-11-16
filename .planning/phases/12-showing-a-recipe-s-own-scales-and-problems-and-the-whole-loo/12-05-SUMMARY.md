---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 05
subsystem: verification
tags: [webkit-print, ios-simulator, wkwebview, regression-gate, device-unverified]
requires:
  - phase: 12-01
    provides: Low to high scale on the pen, reading and editor
  - phase: 12-02
    provides: printed log pages starting 1.5 in down, 13 and 4 notes lines
  - phase: 12-03
    provides: the round trip
  - phase: 12-06
    provides: 12-cases.mjs, 12-stops-probe.mjs
provides:
  - 12-wkprint.swift (one poll loop, one print)
  - 12-safari-check.mjs (modes pdf and sim, loopback server with in-memory seed page)
  - 12-check.sh (round one's checks in one command)
affects: [round two, phase verifier, gap closure for the Phase 11 walk]
key-files:
  created:
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-wkprint.swift
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-safari-check.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh
  modified: []
key-decisions:
  - "No app file touched; a failing check is reported with its owner, never loosened"
  - "Simulator reading view runs before the pen view: the pen autosaves a draft, and an app loaded with a draft open shows the pen instead of the reading"
requirements-completed: [TASTE-04, PROOF-01, LOG-01]
duration: about 70 min
completed: 2026-11-16
status: complete
gate1: FAIL (one step: the Phase 11 walk; every other step passes)
commits: 2
plan_head_before: 20779ebeb9bc4c79108c9bba177f25b5a0f85c11
plan_head_after: d28fa79f08f11408bf6c9a905cce27e1d0f978d8
actuals:
  tokens: 30000
  tasks: 3
  commits: 2
---

# Phase 12 Plan 05: WebKit print, Simulator and the one-command gate Summary

**The log pages print through WebKit one page each starting 1.5 in down, mobile Safari at 390 px draws the Low to high pen and reading correctly, and 12-check.sh passes every step except the Phase 11 walk, which fails on stale selectors that were already stale before Phase 12: GATE1 is FAIL, honestly.**

All results here are **device-unverified** (macOS WKWebView, Playwright WebKit, iOS Simulator). No device row is written. The paper check waits for round two's iPad rows; Mark's List row adoajjb9sgzbezmyrt4s stays open.

## Gate result

Last line of `12-check.sh`: `FAIL walk exited non-zero`. It does not end `GATE1 PASS`. Steps in order: suite PASS (134 files, 4410 tests), build, probe PASS, print PASS, roundtrip PASS, pdf PASS, sim PASS, walk FAIL.

The 12-04 board check ran in another worktree and is not part of this script; it was not run here.

## Verbatim lines asked for

`12-stops-probe.mjs check pen reading editor`:
```
PASS pen Coffee flavour anchors
PASS pen Coffee flavour stop names
PASS pen Body anchors
PASS pen Body stop names
PASS reading case two Coffee flavour reads 2 of 5
PASS reading case two Body reads heavy (4)
PASS reading case one Mint reads strong (5)
PASS editor .mk-stops reads "faint · 2 · 3 · 4 · strong"
PASS editor no word right outside a Kind option label
```

`12-print-check.mjs rows`:
```
PASS rows case two: six scale rows, the four core then Body then Coffee flavour
PASS rows case two: six scale rows
PASS rows Coffee flavour (Low to high): no .lf-mid
PASS rows Coffee flavour: faint, 1, 5, strong and five ticks
PASS rows Body (Right in the middle): .lf-mid reads right
PASS rows every scale row is 36 px tall (within 0.5 px)
PASS rows the four core rows each read right under the middle tick
PASS rows the problems row: the four core problems then Bitter, Burnt taste
PASS rows the problems row has six options
PASS rows neither log page prints 'Every recipe' or 'This recipe only'
PASS rows case none: four scale rows
PASS rows case none: each row reads right under the middle tick
```

## The finding (FAIL walk): owner is not 12-01/02/03/06

`11-walk.mjs` fails 15 scenarios (create-recipe, edit-first-version, edit-stale, create-save-refused, edit-kept, version-pen-*, record-pen-*, correct-*, tasting-remove-restore) with timeouts on `input[aria-label="Version name"]`, `.nb__new input`, `input[aria-label="Duration..."]`, and the like. The app has had one-row textareas for those fields since the 2026-11-01 quick fixes (1754924a, 09a95c30, ed93b024, 22ec33f5; bug-ipad-tab-lost-from-single-line-fields). I built the pre-Phase-12 commit af101f6e into a scratch folder and ran the same walk: the same 15 FAIL. So this is not Phase 12's regression and not caused by 12-01, 12-02 or 12-03. It is the Phase 11 walk script (and probably `11-walk-before.json`) going stale against post-Phase-11 quick tasks. `MATCH 94 snapshots` cannot be claimed.

Not fixed here: `11-walk.mjs` is outside this plan's files, and loosening the gate would be the wrong repair. Route: a gap-closure plan (`/gsd-plan-phase 12 --gaps`) to refresh the walk's selectors to tag-free `[aria-label=...]` / `.nb__new textarea` and re-baseline if snapshots differ; round two's gate needs it.

## Task results

1. **Tracer, WebKit PDF.** `12-safari-check.mjs pdf`. Case two prints 5 pages. Page 1 alone holds Batch log and Side 1 of 2; page 2 alone holds Tasting log and Side 2 of 2; ink of pages 1 and 2 starts 109.0 pt down (window 100.8 to 115.2); the first bench page's ink starts 40.5 pt down (limit 54). PDFs under `${TMPDIR}sprinkles-12/evidence-05/` (two.pdf, worst.pdf).
2. **Simulator.** iPhone 17e, Safari reports width 390. PASS: Coffee flavour anchors faint, strong only; stop names 1: faint, 2, 3, 4, 5: strong; Body anchors thin, right, heavy; reading Coffee flavour 2 of 5, Body heavy (4); no sideways scroll on either view (scrollWidth 390). Screenshots (device-unverified): `sim-pen.png` shows the open record pen at phone width, Body with thin / right / heavy under five stops and Coffee flavour with only faint and strong under its five, then the problems groups and Cancel / Save batch; `sim-reading.png` shows the Tasting reading with Body "heavy (4)" and Coffee flavour "2 of 5" under "This recipe only", two columns, nothing clipped.
3. **12-check.sh.** Written to the plan; run once end to end; result above.

## Long-words numbers for Mark (Open Question 2: measured, nothing fixed)

One item for him to decide whether anything should change. Case "worst" (long scale names, end words and problem words), in WebKit's own print:
- The PDF is 5 pages, the same count as the fullest normal recipe, but the Tasting log does not fit its page: "Tasting log" is on page 2 and its ink runs to 755 pt of 756 (the bottom margin line); its foot line "Side 2 of 2" lands on page 3, on top of the first bench sheet page. The Batch log stays on page 1 with "Side 1 of 2" (ink bottom 756 pt, just full).
- Print check (Playwright, same case): at Safari's 630 px width the Tasting log needs 827.8 px of 810, so it spills by 17.8 px; at Chrome's 672 px it needs 827.8 of 864 and fits with 36.2 spare. The long end words run past their 76 px grid column by 28 to 54 px (Brown butter and toasted pecan depth: 104 and 130 px wide; Ribbon of salted caramel: 112 and 111 px); that scale's row is 55 px and the other 40 px against 36 for the rest; the problems row is 62.8 px.
- For comparison the fullest normal recipe (case two): Batch log needs 790 of 810 px (20 spare, Safari), Tasting log 767.9 of 810 (42.1 spare).

## Safe to deploy

No app file changed in this plan, no store shape, no DB_VERSION, no store-file-version change in round one: main is safe to deploy after this wave (the Phase 11 walk failure is a stale test script, not the app).

## Deviations from Plan

**1. [Rule 3] Simulator view order and retry.** First sim run got no report (cold Safari swallowed the first openurl); the second showed the reading view loading the app with the pen open. Fixes inside 12-safari-check.mjs: resend openurl once after 45 s, run the reading view first, scroll the scales/cells into view before the screenshot. Commit 1db1269d.
**2. [Rule 3] App suite as `npx vitest run` in app/** instead of `npm --prefix app test` (the project note says the npm form has hung in worktrees; it is the same command). Commit d28fa79f.
**3. 12-04's steps** (board check) are not in 12-check.sh by plan design; they were not run here.
**4. Task 1 and 2 share one commit** (1db1269d) since both live in 12-safari-check.mjs and were finished together.

## Known Stubs

None.

## Threat Flags

None. The server binds 127.0.0.1 only, keeps reports in memory, writes only under the scratch evidence folder, refuses an app/dist path; the seed page is served from memory. No app/dist write; Mark's `vite preview` untouched; the Simulator I booted was shut down (the already-booted iPad Pro was left alone).

## Self-Check: PASSED

12-safari-check.mjs, 12-wkprint.swift, 12-check.sh exist; commits 1db1269d and d28fa79f are on the branch; `git log --grep='(12-05)' -- app` lists no app file.
