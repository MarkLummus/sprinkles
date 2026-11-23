---
phase: quick-261122-tqk
plan: 01
subsystem: ui
tags: [notebook, phone-01, width-rule, new-recipe-entry]
requires: []
provides:
  - "The Notebook's New recipe entry (Name, Cancel, Start) is drawn only at 724 and wider, as its New recipe button already was"
affects: [app/src/ui/NotebookPlace.jsx]
tech-stack:
  added: []
  patterns: ["hidden by render condition, state kept (the editor's own addresses cross the cut the same way)"]
key-files:
  created: []
  modified:
    - app/src/ui/NotebookPlace.jsx
    - app/src/ui/NotebookPlace.test.jsx
decisions:
  - "The entry is hidden below 724, not closed: open, name and required are left alone, so it returns from 724 up holding what was typed"
  - "handleStart is unchanged: with the entry not drawn below 724, Start cannot be pressed where the editor cannot open"
status: complete
commits: 2
plan_head_before: 8374320f5e844fb2276c748f246b70d2eada6725
plan_head_after: 460e7c56 (the fix commit; the SUMMARY commit follows it and cannot cite its own hash)
actuals:
  tokens: 1500
  tasks: 3
  commits: 2
---

# Phase quick-261122-tqk Plan 01: the Notebook's New recipe entry follows the 724 width rule Summary

The Notebook's New recipe entry now carries the same `!below724` test as its New recipe button, so Start cannot be pressed at a width where the editor cannot open, and no create draft is stranded.

Closes bug-p12-start-after-narrowing-strands-draft (state machine audit 2026-11-22, item 1).

## What changed

- `app/src/ui/NotebookPlace.jsx`: one code line. The entry form's condition went from `{!draft && open && (` to `{!below724 && !draft && open && (`. The comment above NotebookHead had its last sentence replaced to say neither New recipe nor the entry is drawn below 724, and that an open entry leaves the page with what was typed kept and is drawn again from 724 up. No other code line changed.
- `app/src/ui/NotebookPlace.test.jsx`: a describe "an entry open as the window crosses 724 (bug-p12-start-after-narrowing-strands-draft)" nested in "NotebookPlace starting a recipe", with a mutable-width `window.matchMedia` stub (the model in CreationFlow.test.jsx) and three cases N1, N2 and N3.

Commits:
- `460e7c56` fix(261122-tqk): the Notebook's New recipe entry is not drawn below 724, so Start cannot strand a draft

## Red evidence (before the fix, unchanged NotebookPlace.jsx)

Two failures, one pass, as the plan required.

- N1 (narrowing takes the entry off the page): `AssertionError: expected <form class="nb__new" …(1)>…(2)</form> to be null`, at the `form.nb__new` null expectation after `setWidth(393)`.
- N2 (back at 724 with the typed name, Start opens the editor): `AssertionError: expected <form class="nb__new" …(1)>…(2)</form> to be null`, at the `form.nb__new` null expectation after `setWidth(723)`.
- N3 (control: opened narrow, widened to 1024, New recipe offered, entry opens with focus in Name): passed, which shows the width stub drives `useBelow724` at mount and on a change.

## Green

- NotebookPlace.test.jsx whole: 58 passed.
- Full suite: 136 files, 4541 tests, zero failures (baseline 4538 plus the three new cases).

## Browser readings (Playwright on a Mac; nothing is device-verified)

Probe at `${TMPDIR}/sprinkles-tqk/probe-tqk.mjs` (scratch, not in the repo). Two scratch builds: base (HEAD before the fix) and fix. A coarse pointer (hasTouch) was set; every request off 127.0.0.1 was aborted; served on an ephemeral port, no Vite process, port 4173 and app/dist untouched.

| Run | Build | Result |
| --- | --- | --- |
| WebKit 393, base | base | defect reproduced: entry outlived the narrowing, Start moved to /notebook/new, desk line shown with no control, one create draft "Pistachio" stored, Notebook draft row has no button |
| Chromium 393, base | base | same, every line as WebKit |
| WebKit 393 to 1024, fix | fix | entry gone at 393, no Start in main, path /notebook, no draft; at 1024 entry back holding Pistachio, New recipe not drawn while open, Start opened the editor with Recipe name Pistachio, one create draft; Cancel gave "Draft discarded.", New recipe in the head, no draft left |
| WebKit 723 to 724, fix | fix | same, at the exact cut |
| Chromium 393 to 1024, fix | fix | same as the WebKit 393 run |
| refusal, PROBE_DIST = app/dist | n/a | exit 1 with `FAIL PROBE_DIST resolves to app/dist ...` before anything was served |

All five run files hold PASS lines and no FAIL line.

## Decisions

- Hidden, not closed. Narrowing leaves NotebookHead's own state alone, so widening to 724 or more draws the entry again with the typed name. This is the literal "same width rule as New recipe" and matches how the editor's addresses cross the cut. Closing would need an effect and would throw the typed name away.
- handleStart is unchanged. The only way left to reach the defect is a narrowing during the few milliseconds of the draft write, which the audit puts out of reach by hand (items 6 and 30). No guard added.
- Focus. When the form leaves the page at the narrowing, focus goes to the page body (INFO line in all three fix runs: `BODY`). That already happens to New recipe itself and at the DeskOnly swap. This plan does not move focus.

## Note for sibling 261122-tql (focus across 724)

Its case one, Cancel on the narrowed entry, can no longer be reached: below 724 the entry's Cancel is not drawn, and from 724 up Cancel returns focus to New recipe, which is drawn there. Focus after the narrowing reads `BODY` in WebKit at 393 and 723 and in Chromium at 393.

## Deviations from Plan

None - plan executed exactly as written. One note: the SUMMARY's `plan_head_after` is the fix commit, because this file's own commit cannot cite its own hash.

## Deploy safety

The build is safe to deploy: no stored shape, DB_VERSION or wording changed.

## For the orchestrator

- Mark's List row `bug-p12-start-after-narrowing-strands-draft`: close it now the fix commit has landed (`status: "done"`, `resolvedAt` from `date -u`, a one-line reply). The executor has no ArtifactData and did not touch the list.

### Deferred Human Verification

One check row, titled "The New recipe entry leaves the Notebook in Split View and comes back with the name". Serve the build as CLAUDE.md says, after Mark has deployed main.

1. On the iPad in landscape, open Sprinkles in Safari full screen, on the Notebook.
2. Tap New recipe. Expect: the Name field opens.
3. Type Pistachio.
4. Open another app beside Safari in Split View, so Safari takes the smaller part. Expect: the Name field, Cancel and Start are gone, and there is no New recipe.
5. Drag the divider to give Safari the whole screen again. Expect: the Name field is back, holding Pistachio.
6. Tap Start. Expect: the editor opens, with Recipe name Pistachio.
7. Tap Cancel. Expect: the Notebook, with "Draft discarded." and New recipe.

Pass rule: every Expect holds.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- NotebookPlace.jsx and NotebookPlace.test.jsx changed under app against the base commit; nothing else under app changed and no untracked file sits under app.
- NotebookPlace.jsx's code diff against the base is the one condition line (the rest is comment).
- Commit `460e7c56` is on this branch.
