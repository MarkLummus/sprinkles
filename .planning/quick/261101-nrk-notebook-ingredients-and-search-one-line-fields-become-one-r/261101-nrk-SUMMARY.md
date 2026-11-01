---
phase: quick-261101-nrk
plan: 01
quick_id: 261101-nrk
status: complete
subsystem: place one-line fields (Search, Notebook, Ingredients)
requirements: [bug-ipad-tab-lost-from-single-line-fields]
commits: 3
plan_head_before: d7bb0025845a0b7942621b8f1e94c55f80514905
plan_head_after: 3e180f902648324323b89a4a1558709ac83ac8c6
tasks_complete: 3 of 3
actuals:
  tasks: 3
  commits: 3
---

# Phase quick-261101-nrk Plan 01: Place one-line fields Summary

Sheet code, the Notebook's New recipe Name and the Ingredients Name filter are one-row textareas. Return still runs Find and still starts a recipe (once per press, via a new `submitOnReturn` that clicks the form's default button), the filter holds Return, and pasted line breaks never reach any of the three. The probe measures all three identical to the input build in WebKit and Chrome at four configs: 416 PASS, 0 FAIL.

## Commits

- 3a315450: Task 1, Sheet code (probe, `submitOnReturn` in oneLineField.js, SheetCodeSearch.jsx, shell.css duties 1, 2 and 4, shell.test.js guard widened to `search__`, SheetCodeSearch.test.jsx).
- 30423924: Task 2, New recipe Name (NotebookPlace.jsx, shell.css duty 2 selector, NotebookPlace.test.jsx, Shell.creationGuard.test.jsx type helper).
- 3e180f90: Task 3, the Ingredients Name filter (IngredientsPlace.jsx, shell.css duty 2 selector, IngredientsPlace.test.jsx).

## Probe result (`261101-nrk-field-probe.mjs`, `check --field all`)

Final line: `416 PASS, 0 FAIL`. Per engine (webkit, chrome) and config (1366 fine, 1366 coarse, 1366 coarse dpr2, 393 coarse dpr3): search 17 PASS, notebook 18 PASS, ingredients 16 PASS, 0 FAIL each. Gates: F0 attributes, E1/B1 boxes (field, parent, grandparent, siblings, named neighbours, anchor height, 0.5 px), C1/C2 computed style, I1 ink (1 device px), K1 focus ring, N1 Tab, P1 paste, L1/L2 long text (Find stays beside the code), R1 five Return presses, R2 unknown code and refused state, R3 Return starts the recipe.

## INFO lines

- Base tag: INPUT for all three.
- Paste (P1): the base inputs turn a line feed into a space ('K7QM 2X9D', 'Probe sorbet', 'Whole milk'), 0 submits; the textareas join the parts ('K7QM2X9D', 'Probesorbet', 'Wholemilk'), 0 submits.
- Return submit counts (Enter, Shift+Enter, Control+Enter, Alt+Enter, Meta+Enter): search and notebook 1, 1, 0, 0, 0 in both builds. Ingredients base 1, 1, 0, 0, 0 (its submit only prevented the default); after 0, 0, 0, 0, 0.
- Base scrollLeft after long text: search 1282 WebKit / 1296 Chrome (after 1270 / 1286); notebook and ingredients 1199 / 1213 (after 1187 / 1203). Both builds scroll; after has no scrollbar and the filled height.
- Coarse vertical padding: the textareas' padding-block is 10.2px against the inputs' 8px (see the C2 line in the probe output); the box, neighbour and ink gates prove the outcome.
- Search field-sizing: 'fixed' after (the input reports 'fixed' too).
- Next control after Tab (N1, same in both builds and both engines): Sheet code to Find; New recipe Name to Cancel; Ingredients Name to Category.

## Test totals

- Step 0: 131 files, 4299 tests, all passing.
- After: 131 files, 4316 tests, all passing (17 new: 6 Search, 7 Notebook, 4 Ingredients; none deleted).

## Gates

- Non-test `.jsx` under app/src: `<input` openings 9 to 6, `<textarea` openings 36 to 39.
- Since Step 0, git shows no change under app/src outside the plan's ten app files.
- app/dist/index.html mtime is unchanged from Step 0 (1793568668); every build went to /private/tmp/sprinkles-261101-nrk. No vite dev or preview was started, and port 4173 holds only Mark's existing preview.

## Deviations from Plan

None - plan executed exactly as written. The probe was written fresh from nrj's skeleton (with its long-text, fine-pointer-only vertical padding, parent-display and display:contents corrections built in from the start) and needed no later fix, so no probe change rode with Tasks 2 or 3. No CSS rule beyond the planned ones was needed.

## Deferred Human Verification

On the iPad (iPadOS 27 Safari, Magic Keyboard, Full Keyboard Access off):

1. In Sheet code, press Tab. Expect: focus moves to Find, not out of the page.
2. In New recipe Name (Notebook, New recipe), press Tab. Expect: focus moves to Cancel.
3. In the Ingredients Name, press Tab. Expect: focus moves to Category.
4. In Sheet code, type a code nothing has and press Return. Expect: "No version has this code." and focus stays in Sheet code.
5. In New recipe Name, type a name and press Return. Expect: the creation editor opens with that name.
6. In the Ingredients Name, type "milk" and press Return. Expect: nothing is inserted and the list stays filtered.
7. Expect: each field looks as it did on the previous build.

On the iPhone (393): Sheet code looks as before, Find stays beside it with a long entry, and the keyboard's Go runs Find. The Ingredients Name's search key inserts nothing.

## Notes for the orchestrator

- Sid's probe (`.impeccable/proposals/2026-11-01-one-line-fields-probe.mjs`) selects by the input tag, so it no longer sees these fields. It was not edited.
- shell.test.js's place-condition guard now admits `search__`.
- `submitOnReturn` clicks the default button rather than calling `requestSubmit`, for the disabled-Find case (proven by the pending-load test).
- DESIGN.md's One-line field entry still says "Built so far for the creation lead-in and grams"; that is Impeccable's to update after the batch.
- oneLineField.js's header comment still names only 261101-lec's fields.
- No aria-multiline was added.
- No Mark's List writes in this plan (the executor has no ArtifactData).

## Self-Check: PASSED

Commits 3a315450, 30423924 and 3e180f90 are on main; the probe file and the ten app files exist; `commits: 3` is `git rev-list --count` from plan_head_before.
