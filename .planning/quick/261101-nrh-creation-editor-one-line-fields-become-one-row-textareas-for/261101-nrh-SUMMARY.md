---
phase: quick-261101-nrh
plan: 01
quick_id: 261101-nrh
status: complete
subsystem: creation editor one-line fields
requirements: [bug-ipad-tab-lost-from-single-line-fields]
commits: 4
plan_head_before: cfe405f97ca5d4bb10e645cee6173355a02bf1b6
plan_head_after: 1754924a330af4fe5b12e48c5944016d09057324
tasks_complete: 3 of 3
actuals:
  tasks: 3
  commits: 4
---

# Phase quick-261101-nrh Plan 01: Creation editor one-line fields Summary

The creation editor's nine one-line field sites (Recipe name, Version name, a step's target label and value, the scale and problem card fields, Serving temperature, the twelve style ends and the picker's Name) are one-row textareas that hold Return and strip pasted line breaks, and the probe measures them identical to the input build in WebKit and Chrome except the ruled target width.

`commits: 4` is the measured `git rev-list --count` from the plan base. Three are this plan's fix commits; the fourth, b8d5c080, is the orchestrator's docs commit that recorded Mark's ruling.

## Commits

- 09a95c30: Task 1, Recipe name and Version name (probe, CreationPage.jsx, notebook.css duty 1 and the labelled-above coarse centring, CreationFlow.test.jsx).
- 445a831b: Task 2, the step's targets and the Style region (CreationSteps.jsx, CreationSetup.jsx, notebook.css, three test files, and the probe's target width gate updated to the ruling).
- 1754924a: Task 3, the scale and problem card fields and the picker's Name, the selector sweep, and one CSS rule (see Deviation 4).

## Mark's ruling (2026-11-01, asked in chat)

The first run stopped at Task 2: the target fields, as one-row 20-column textareas, measured narrower than the input by 1.28 px (WebKit 15 px) / 1.31 px (WebKit 16 px) and 6 px (Chrome fine) / 7 px (Chrome coarse), against the planned 0 to 1 and 0 to 4. No column count or token expression reproduces the input's fractional width. Mark accepted the narrowing as measured. The tolerance is now WebKit at most 1.5 px and Chrome at most 7.5 px (`.impeccable/proposals/2026-11-01-one-line-fields.md`, "Mark's ruling on the target widths", commit b8d5c080). Only the probe's target width gate (W1) changed, in commit 445a831b; every other gate is as written.

## Step 0 and totals

- Base: HEAD cfe405f9 (no app/ change since planning HEAD 83a786b3). Non-test .jsx under app/src: 26 input and 18 textarea openings before; 17 and 27 after.
- Suite before: 130 files, 4259 tests. After: 130 files, 4274 tests, all passing. The two Serving temperature tests are rewritten, none deleted.
- app/dist/index.html mtime 1793568668 before and after. No command of this plan wrote to app/dist, and only Mark's preview (pid 31386) listens on 4173. No vite dev or preview was started; all builds went to /private/tmp/sprinkles-261101-nrh.
- Files changed under app/src since the base: CreationPage.jsx, CreationSteps.jsx, CreationSetup.jsx, IngredientPicker.jsx, notebook.css and the five named test files. Nothing else.

## Probe evidence (final run, `--field all`)

Final line: **1338 PASS, 0 FAIL.** Engines WebKit and Chrome (channel chrome), configs 1366 fine, 1366 coarse, 1366 coarse DPR 2. Every engine and config tallied the same per group:

| Group | PASS | FAIL |
|-------|------|------|
| band (Recipe name, Version name) | 20 | 0 |
| targets (label, value) | 22 | 0 |
| style (Serving temperature, twelve ends) | 130 | 0 |
| cards (Scale 1 Name, Low end, High end; Problem 1 Name) | 40 | 0 |
| picker (Name) | 10 | 0 |

INFO, target width (W1), base input against textarea: WebKit fine 200.28 to 199 (1.28 px), WebKit coarse 211.31 to 210 (1.31 px); Chrome fine 180 to 174 (6 px), Chrome coarse 187 to 180 (7 px). All inside the ruling.

INFO, paste (P1): the base inputs turn a line feed into a space ('Probe text', '1 2'; Serving temperature in the base leaves '12'); the textareas join the parts ('Probetext', '12').

INFO, next control after Tab (N1, same in both builds and both engines): Recipe name to Recipe description; Version name to Cancel; target label to Step 1, target value; target value to Step 1, remove target 1; each style low end to its high end, each high end to the next figure's low end (Solids high to Name); Serving temperature to Freezing PAC, target low; scale Name to Remove; Low end to High end; High end to the Kind radio (unlabelled input); problem Name to Remove; picker Name to the Category menu.

## Deviations from Plan

**1. [Rule 1 - Probe correction] Long-text string is four times longer.** The 65-character string does not reach the right edge of the 540 to 600 px band fields, so scrollLeft stayed 0 in both builds. The probe types it four times.

**2. [Rule 1 - Probe correction] C1 compares vertical padding only at a fine pointer.** The coarse centring rule (duty 2) is by design a different padding-block on the textarea. At a coarse pointer the probe compares left and right padding and prints the vertical figures as INFO; the box, parent, sibling and ink gates prove the outcome.

**3. [Ruling] Target width gate widened by Mark's decision.** WebKit at most 1.5 px, Chrome at most 7.5 px, as above. The probe's header comment and the W1 message cite the ruling.

**4. [Rule 1 - Bug] One CSS rule added in Task 3, where the plan said no CSS.** The first Task 3 probe run failed L1 on the scale Name and the problem Name (12 FAIL, all six engine and config pairs): with a long name the card widened to 1796 px and the field never scrolled (scrollLeft 0). Cause: the card sits in a log column that shrinks to its content, and a `field-sizing: content` textarea at width 100% hands the column its whole typed line; the input had contributed a fixed 20-column width. The fix is `.notebook .mk-card textarea.ink-field { field-sizing: fixed; }` in notebook.css (tokens only, selector begins .notebook, no media block). After it the probe passed 1338 of 1338. The band, style and picker fields did not show the problem.

**5. [Process] Task 3 tests were written beside the change, not strictly red first.** The new tests and selector sweep were written together with the source edit; the suite was green afterwards. No test was weakened or deleted.

**6. Test-count gate.** The Task 3 verify greps `ing__filters input` across IngredientPicker.test.jsx; an assertion of mine that no input remains in the form matched it, so I removed that line (the TEXTAREA tagName check already proves the same).

## Known Stubs

None.

## Threat Flags

None. The change adds no endpoint, auth path or storage; stripNewlines (T-261101-nrh-01) reaches every switched field.

## Deferred Human Verification

For the orchestrator's iPad check (iPadOS 27 Safari, Magic Keyboard, Full Keyboard Access off, build served by `npm --prefix app run build && npm --prefix app run preview -- --host`; the executor never builds app/dist). No Mark's List rows were written (the executor has no ArtifactData).

1. Open a new recipe. Tap Recipe name and press Tab. Expect: focus moves to Recipe description, not out of the page.
2. Tap Version name and press Tab. Expect: focus moves to Cancel.
3. Add a step, add a target. Tap the target label and press Tab. Expect: the target value. Tab again. Expect: the target's remove button.
4. Tap Serving temperature and press Tab. Expect: Freezing PAC, target low. Tap a style low end and Tab. Expect: its high end.
5. Add a scale. Tap its Name and press Tab. Expect: Remove. Low end then High end follow in order.
6. Add a problem. Tap its Name and press Tab. Expect: Remove.
7. Add an ingredient. Tap the picker's Name and press Tab. Expect: the Category menu.
8. In each of these fields press Return. Expect: nothing is inserted and focus stays.
9. With the on-screen keyboard (keyboard detached), tap Serving temperature. Expect: a minus key. If there is none, the field drops its inputmode (spec section 2) and that goes to Mark.
10. Look over every field. Expect: it looks as it did on the previous build.

## Notes for the orchestrator

- Sid's probe (`.impeccable/proposals/2026-11-01-one-line-fields-probe.mjs`) selects by the input tag and no longer sees these fields. It was not edited.
- No aria-multiline was added, as 261101-lec decided.
- DESIGN.md's One-line field entry still says "Built so far for the creation lead-in and grams". That line is Impeccable's to update after the batch.
- The duty rules are scoped to the creation page. Siblings can widen their selector lists. The new `.mk-card textarea.ink-field` rule is the card-column fix; any sibling field that sits in a shrink-to-fit column with width 100% may need the same.
- Remaining `input[aria-label="Version name"]` selectors in RecipePage.*.test.jsx belong to the version pen (sibling 261101-nri) and were left alone.
- Scratch builds and records: /private/tmp/sprinkles-261101-nrh (base-dist, after-dist, base.json, after.json, check3.txt).

## Self-Check: PASSED

- Commits 09a95c30, 445a831b and 1754924a are on main (`git merge-base --is-ancestor` against HEAD).
- Working tree holds no uncommitted source changes; this SUMMARY is left uncommitted as instructed.
