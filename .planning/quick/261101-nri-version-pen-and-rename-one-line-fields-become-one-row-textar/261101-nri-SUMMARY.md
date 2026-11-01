---
phase: quick-261101-nri
plan: 01
quick_id: 261101-nri
status: complete
subsystem: recipe page version pen and Rename one-line fields
requirements: [bug-ipad-tab-lost-from-single-line-fields]
commits: 3
plan_head_before: ff22531923006d2b2ff6487992ffc1a70301ccbd
plan_head_after: dbacf747faa9e9731a5a01242e228a8458c319a1
tasks_complete: 3 of 3
actuals:
  tasks: 3
  commits: 3
---

# Phase quick-261101-nri Plan 01: Version pen and Rename one-line fields Summary

Rename's Recipe name, the version pen's Version name, a row's grams, a step's lead-in and a step's target label and value (six field elements at five sites) are one-row textareas that hold Return and strip pasted line breaks, and the probe measures them identical to the input build in WebKit and Chrome except the ruled target width and the ruled overflowing-value ink.

## Commits

Base (the tree after 261101-nrh): ff225319.

- 1c8fcf03: Task 1, Rename's Recipe name (probe, RecipeBand.jsx, notebook.css duties 1 and 2, RecipeBand.test.jsx, RecipePage.perStep.test.jsx).
- 37a05413: Task 2, the version pen's Version name and grams (VersionRow.jsx, IngredientTable.jsx, notebook.css duties 1, 2 and 5, the test sweep over nine test files, the probe's parent-display fix).
- dbacf747: Task 3, a step's lead-in and target label and value (Method.jsx, notebook.css duties 1 to 4, Method.test.jsx, RecipePage.perStep.test.jsx, the probe's per-line shift fix).

## Probe evidence (final run, `--field all`)

Final line: **3222 PASS, 0 FAIL.** WebKit and Chrome (channel chrome), 1366 fine, 1366 coarse, 1366 coarse DPR 2. Every engine and config tallied the same per group:

| Group | PASS | FAIL |
|-------|------|------|
| rename (Recipe name) | 13 | 0 |
| ceremony (Version name) | 13 | 0 |
| grams (14 developing grams fields) | 104 | 0 |
| steps (10 lead-ins, 16 target labels and values: 42 fields) | 406 | 0 |

INFO, step target width (W1), base input against textarea: WebKit 1.28 px (199 against 200.28); Chrome 6 px fine (174 against 180). Inside Mark's ruling (WebKit at most 1.5 px, Chrome at most 7.5 px). Later boxes in the targets line were compared after that shift.

INFO, overflowing values (O1, WebKit fine, grams pass 1): Whole milk portion 2 '250.4' ink R47 (base R44), Heavy cream '252.8' ink R46 (base R44). The textarea shows 2 to 3 px more of the value before the cut, inside the 4 px ruled.

INFO, Version name's placeholder ink (H1): WebKit identical to base (L10 T14 R74 B26 both). Chrome needed no ruled exception: the duty 5 line-height pair brought it inside the ordinary 1 device px gate in all three configs, so no Chrome H1 line printed.

INFO, parent display (A1): the grams span is `inline` in the base and `inline-flex` after (261101-lec's rule); see Deviation 1.

INFO, paste (P1): the base inputs turn a line feed into a space ('Probe text', grams '1 2'); the textareas join the parts ('Probetext', '12'). Same as nrh.

INFO, next control after Tab (N1, same in both builds and both engines): Recipe name to Recipe description; Version name to Why; the first grams field (Locust bean gum) to Remove; Step 1 lead-in to Step 1, instruction; Step 1 target label to Step 1, target 1, value; Step 1 target value to Step 1, purpose.

INFO, coarse padding (C1): at a coarse pointer the textareas' padding-block is 10.2px (Recipe name, Version name, grams) against the inputs' 8px or 2px, by the coarse centring rules; the box, parent, sibling and ink gates prove the outcome.

## Step 0 and totals

- Non-test .jsx under app/src: 17 input and 27 textarea openings before; 11 and 33 after (6 and 6, as planned).
- Suite before: 130 files, 4274 tests. After: 130 files, 4286 tests, all passing (12 new tests, none deleted).
- app/dist/index.html mtime 1793568668 before and after. No command of this plan wrote to app/dist; only Mark's preview (pid 31386) listens on 4173. No vite dev or preview was started; all builds went to /private/tmp/sprinkles-261101-nri (base-dist, after-dist, base.json, after.json, check3.txt).
- Files changed under app/src since the base: notebook.css, IngredientTable.jsx, Method.jsx, RecipeBand.jsx, VersionRow.jsx and nine test files (IngredientTable, Method, RecipeBand, VersionRow, RecipePage.perStep, .drafts, .strictMode, .beforeYouStart, .stalePen). Nothing else.
- Duty 5 form: the first form planned (`calc(var(--sheet-leading-field) * var(--app-notebook-size-body))` at a fine pointer, `* var(--sheet-type-note)` in the coarse block) passed every gate in both engines, so it was kept.

## Deviations from Plan

**1. [Rule 1 - Probe correction] Parent box of the grams span is compared by left and width only when its display differs.** At pass 1 (a row not yet changed) the grams span is a plain inline box in the base, whose rect is its font box (17.67 px high), and `inline-flex` after, by 261101-lec's rule, whose rect is its layout box (26.25 px). 84 of the first run's A1 checks failed on that parent figure alone: the field, grandparent (the cell, 38.39 px both), the ' g' text sibling and the anchor all matched within 0.5 px, and at passes 2 and 3 (a changed row, where the base span is already blockified) the parent matched. The probe now records `parentDisplay`; when it differs between builds, the parent's left and width are still compared and its top and height are not, with an INFO line. No tolerance changed and no CSS changed; there is no tokens-only form that makes an inline-flex span report an inline rect. I re-recorded base.json and after.json with the corrected probe. Commit 37a05413.

**2. [Rule 1 - Probe correction] Target-width shifts apply only to boxes on the field's own line.** A step can hold several target chips on separate lines (Steps 2, 5 and 7). The shift list for a step held every target field, so a chip's boxes were credited with the other chips' narrowing and failed (396 FAIL on the first all-groups check, all multi-target steps). A shift now applies to a box only when its vertical range overlaps that field's. The ruled tolerance is unchanged. Commit dbacf747.

**3. [Process] Test order.** In Task 1 the new Rename tests that could fail against the input (tag, rows, Return default) were red first and went green; the line-break and blocked-save tests pass on the input as well, because jsdom's input already strips line breaks and focus already worked. In Tasks 2 and 3 the selector sweep and the new tests were written before the source change for Task 2 (40 sweep failures, 3 new failures) and beside it for Task 3 (the Method.jsx edit was made first, in the working tree, before the Task 2 commit; it was not staged into it). No test was weakened or deleted.

No CSS fix beyond the planned selector-list additions was needed: the long-text check (L1) passed for every pen field, so the `field-sizing: fixed` problem nrh met on its cards did not occur in the pen.

## Known Stubs

None.

## Threat Flags

None. The change adds no endpoint, auth path or storage; stripNewlines (T-261101-nri-01) reaches all six field elements, proven by the new perStep tests. The probe serves only scratch builds on 127.0.0.1 ephemeral ports (T-261101-nri-02).

## Deferred Human Verification

For the orchestrator's iPad check (iPadOS 27 Safari, Magic Keyboard, Full Keyboard Access off, build served by `npm --prefix app run build && npm --prefix app run preview -- --host`; the executor never builds app/dist). No Mark's List rows were written (the executor has no ArtifactData).

1. Open Olive Oil Ice Cream, circulator, Version 1.
2. Tap Rename, then press Tab in Recipe name. Expect: focus moves to Recipe description, not out of the page.
3. Press Return in Recipe name. Expect: nothing is inserted. Then Cancel.
4. Tap Next version. Expect: 'e.g. less oil' sits in Version name where it sat on the previous build.
5. Type a version name and press Tab. Expect: focus moves to Why.
6. Tap the first grams field (Locust bean gum) in the table and press Tab. Expect: focus moves to Remove.
7. Tap "edit this step" on Step 1, tap its lead-in and press Tab. Expect: focus moves to the instruction.
8. Tap the target label and press Tab twice. Expect: focus moves to the value, then to the purpose.
9. Press Return in a grams field, the lead-in and a target. Expect: nothing is inserted.
10. Look at every switched field against the previous build. Expect: same size, same text position.

## Notes for the orchestrator

- Sid's probe (`.impeccable/proposals/2026-11-01-one-line-fields-probe.mjs`) selects by the input tag, so it no longer sees these fields. It was not edited.
- RecipePage.perStep.test.jsx's as-made label helper (line 754) and RecipePage.drafts.test.jsx's measuredField still select by the input tag: they serve the record pen's fields, which are 261101-nrj's.
- No aria-multiline was added, as 261101-lec decided.
- DESIGN.md's One-line field entry still says "Built so far for the creation lead-in and grams". That line is Impeccable's to update after the batch.
- The recipe page's duty selectors ride the same rules as the creation editor's (the `.notebook-recipe__form`, `.notebook-ceremony` and `.method-step__open-fields` scopes); 261101-nrj can widen the same lists for the record pen. The one new rule pair is duty 5's `::placeholder` line height for Version name.
- The probe records `parentDisplay` now; nrj's as-made grams field sits alone in a table cell and will not meet the inline-to-inline-flex case.
- Dist build safety (for Mark's hand deploys): this plan never touched app/dist; main now holds three textarea commits, so a build from main has the version pen and Rename switched but not the record pen (nrj) or the Notebook, Ingredients and Search fields (nrk).

## Self-Check: PASSED

- Commits 1c8fcf03, 37a05413 and dbacf747 are on main (`git rev-list --count ff225319..HEAD` is 3).
- Working tree holds no uncommitted source changes; this SUMMARY is left uncommitted as instructed.
