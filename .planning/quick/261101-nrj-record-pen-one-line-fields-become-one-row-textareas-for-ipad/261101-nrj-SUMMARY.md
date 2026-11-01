---
phase: quick-261101-nrj
plan: 01
quick_id: 261101-nrj
status: complete
subsystem: record pen one-line fields
requirements: [bug-ipad-tab-lost-from-single-line-fields]
commits: 3
plan_head_before: 4fa37e4c1fe0a3c85defe4120646d891bb961fc7
plan_head_after: 44c71a11afede49e29e3d01ce423de28828b512e
tasks_complete: 3 of 3
actuals:
  tasks: 3
  commits: 3
---

# Phase quick-261101-nrj Plan 01: Record pen one-line fields Summary

The record pen's Duration, Tempering and Melt test, each row's as-made grams on the Sheet, and a step's Done differently line are one-row textareas that hold Return and strip pasted line breaks; Out of machine and Temperature stay number inputs and the two dates stay date inputs. The probe measures every switched field identical to the input build in WebKit and Chrome at 1366 fine, coarse, coarse DPR 2 and 393 coarse DPR 3, with no ruled exception needed.

## Commits

Base: 4fa37e4c.

- d62d123d: Task 1, Duration, Tempering and Melt test (probe, BatchRow.jsx, notebook.css duties 1 and 2, BatchRow.test.jsx, BatchRow.signed.test.jsx, RecipePage.recordTasting.test.jsx).
- 9ad146c4: Task 2, each row's as-made grams (IngredientTable.jsx, notebook.css duty 3, IngredientTable.test.jsx, IngredientTable.remove.test.jsx, RecipePage.perStep.test.jsx, the probe's display: contents fix).
- 44c71a11: Task 3, Done differently (Method.jsx, notebook.css duties 1 and 2, Method.test.jsx, the new Method.recording.test.jsx).

## Probe evidence (final run, `--field all`)

Final line: **1048 PASS, 0 FAIL.** WebKit and Chrome (channel chrome), configs 1366 fine, 1366 coarse, 1366 coarse DPR 2, 393 coarse DPR 3. Every engine and config tallied the same per group:

| Group | PASS | FAIL |
|-------|------|------|
| measured (Duration, Tempering, Melt test) | 31 | 0 |
| signed (Out of machine, Temperature, the two dates; S0) | 5 | 0 |
| asmade (14 as-made fields) | 81 | 0 |
| done (Step 1 Done differently) | 13 | 0 |

Plus 8 F1 gates (matchMedia coarse equals hasTouch), 1 per engine and config. 393 passed in both engines for all four groups: the as-made block with its auto start margin, the measured fields in the flex .field-unit and Done differently in its flex-column label needed no further rule.

INFO, base tags: INPUT for all three groups.

INFO, paste (P1): the base inputs turn a line feed into a space ('1 2', 'Probe text'); the textareas join the parts ('12', 'Probetext').

INFO, base scrollLeft (L1) for a long value, filled-field figure: measured Duration WebKit 119 (after 111), Chrome 104 (after 98); Done differently WebKit 1186 (after 1090), Chrome 1183 (after 1090). Both builds scroll; the after height equals the filled height and no scrollbar shows.

INFO, next control after Tab (N1, same in both builds and both engines): Duration to "At the machine"; Tempering to "Temperature, degrees Celsius"; Melt test to an unlabelled input (the Melt style radio); the first as-made field (Locust bean gum) to "Guar gum, as made, grams"; the last as-made field (Soy lecithin) to "Step 1, skipped"; Done differently to "Step 2, skipped".

INFO, coarse padding (C1): at a coarse pointer the textareas' padding-block is 10.2px against the inputs' 2px, by the coarse centring rules; the box, parent, sibling, row-neighbour and ink gates prove the outcome.

## Step 0 and totals

- Non-test .jsx under app/src: 11 input and 33 textarea openings before; 9 and 36 after (2 fewer, 3 more, as planned). BatchRow.jsx 3 and 4 before, 3 and 5 after; IngredientTable.jsx 1 and 2 before, 0 and 3 after; Method.jsx 1 and 6 before, 0 and 7 after.
- Suite before: 130 files, 4286 tests. After: 131 files, 4299 tests, all passing (13 new tests, none deleted: 4 in BatchRow.signed.test.jsx, 3 in IngredientTable.remove.test.jsx, 6 in the new Method.recording.test.jsx).
- app/dist/index.html mtime 1793568668 before and after. No command of this plan wrote to app/dist; only Mark's preview (pid 31386) listens on 4173. No vite dev or preview was started; all builds went to /private/tmp/sprinkles-261101-nrj (base-dist, after-dist, base.json, after.json, check1.txt to check3.txt).
- Files changed under app/src since the base: notebook.css, BatchRow.jsx, IngredientTable.jsx, Method.jsx and eight test files (BatchRow, BatchRow.signed, RecipePage.recordTasting, IngredientTable, IngredientTable.remove, RecipePage.perStep, Method, Method.recording). Nothing else.
- Sweep gates: the old-tag lines over the six test files are 0; the IngredientTable.remove.test.jsx input-prototype setters are 0.

## Deviations from Plan

**1. [Rule 1 - Probe correction] A row neighbour with display: contents has no box.** Below 724 the as-made row's first cell (the amount cell) is `display: contents`, so its rect is 0x0 at the viewport origin; relative to the anchor its top only tracks the scroll. The first Task 2 run printed 28 B1 FAIL at 393 (14 fields, both engines) on that one neighbour, with the field, parent, grandparent, siblings, other neighbours and the anchor height all matching. The probe now records `display: contents` per row neighbour and compares that fact, not the box. No tolerance changed and no CSS changed. I re-recorded base.json and after.json with the corrected probe. Commit 9ad146c4.

**2. [Process] Test order.** The Task 1 tests were written after the source change in the same task (the targeted suites and the probe passed first time); in Tasks 2 and 3 the selector sweep and the new tests were written first and failed against the input element (8 in Task 2, 7 in Task 3, the Task 3 jsdom harness first failing for a missing `currentStepNumbers`, which was the test's fault and was fixed before the source change). No test was weakened or deleted.

No CSS beyond the planned selector-list additions and the one as-made block rule was needed. The `field-sizing: fixed` problem nrh met on its cards did not occur here (L1 passed for every pen field).

## Known Stubs

None.

## Threat Flags

None. The change adds no endpoint, auth path or storage; stripNewlines (T-261101-nrj-01) reaches all five switched sites, proven by the new tests. The signed fields are untouched (T-261101-nrj-02, S0 gate). The probe serves only scratch builds on 127.0.0.1 ephemeral ports (T-261101-nrj-03).

## Deferred Human Verification

For the orchestrator's device checks (build served by `npm --prefix app run build && npm --prefix app run preview -- --host`; the executor never builds app/dist). No Mark's List rows were written (the executor has no ArtifactData).

iPad (iPadOS 27 Safari, Magic Keyboard, Full Keyboard Access off):

1. Open Olive Oil Ice Cream, circulator, Version 1, and press Record another or Record batch.
2. Tap Duration, type a number and press Tab. Expect: focus moves to "At the machine", not out of the page.
3. Press Add tasting. Tap Tempering, type a number and press Tab. Expect: focus moves to Temperature.
4. Tap Melt test, type a number and press Tab. Expect: focus moves to the next control (an unlabelled radio in the Melt style group).
5. On the Sheet, tap the Locust bean gum as-made field, type a number and press Tab. Expect: focus moves to the Guar gum as-made field.
6. Tap the last as-made field (Soy lecithin) and press Tab. Expect: focus moves to Step 1, skipped.
7. Press Step 1's Done differently, type a few words and press Tab. Expect: focus moves to Step 2, skipped, and the line stays open.
8. Press Return in each of these fields. Expect: nothing is inserted and focus stays.
9. Look over every field. Expect: it looks as it did on the previous build.

iPhone (the record pen at phone width):

1. Tap Duration, Tempering, Melt test and an as-made field in turn. Expect: the decimal pad opens for each, as before.
2. Tap Out of machine and Temperature. Expect: the numbers layer opens with a minus key, as before.

## Notes for the orchestrator

- Sid's probe (`.impeccable/proposals/2026-11-01-one-line-fields-probe.mjs`) selects by the input tag, so it no longer sees these fields. It was not edited.
- No aria-multiline was added, as 261101-lec decided.
- DESIGN.md's One-line field entry still says "Built so far for the creation lead-in and grams". That line is Impeccable's to update after the batch.
- The dir=auto test in BatchRow.test.jsx was narrowed to the prose textareas (class prose-field); the measured fields carry no dir, as before.
- RecipePage.drafts.test.jsx's measuredField was named in nri's notes as still selecting by the input tag; it needed no change here (the full suite is green), so it is not tag-bound to these fields.
- Dist build safety (for Mark's hand deploys): this plan never touched app/dist. Main now holds the creation editor, the version pen and Rename, and the record pen as textareas; only the Notebook, Ingredients and Search fields (nrk) remain inputs.
- Light-weight ledger entries: none (no stubs, skipped tests or unrun verifies).

## Self-Check: PASSED

- Commits d62d123d, 9ad146c4 and 44c71a11 are on main (`git rev-list --count 4fa37e4c..HEAD` is 3).
- Working tree holds no uncommitted source changes; this SUMMARY is left uncommitted as instructed.
