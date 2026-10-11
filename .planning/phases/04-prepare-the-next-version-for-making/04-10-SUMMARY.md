---
phase: 04-prepare-the-next-version-for-making
plan: 10
subsystem: ui, accessibility
tags: [screen-reader, live-region, accessible-name, list-role, document-title, webkit-keyboard-walk, focus, contrast, colour-alone, requirements, d-20, d-21, ux1-01, ux1-03]

requires:
  - phase: 04-07
    provides: "RuleDrawing split: the drawing is static, the name stays on the button"
  - phase: 04-08
    provides: "The Instructions and closing foot on the print route; the print probe pattern"
  - phase: 04-09
    provides: "The three pens' drafts and the notice (DRAFT_KEPT words) the colour mode reads"
provides:
  - "A balance rule's accessible name carries its deviation words after its target (inside 38-42%, 2.0% below 38%); no band says no target set once"
  - "A polite live region in the Balance section reads Contributing to {figure}: {row names} while a rule is focused and marks rows, and is empty otherwise"
  - ".visually-hidden utility (app.css, top level) and the token --app-size-visually-hidden"
  - "role=list on ol.method-steps; the tab title leads with the recipe name on the recipe page"
  - "A focus ring on a date input (WebKit never matches :focus-visible on it)"
  - "04-keyboard-probe.mjs: modes rules, walk, colour, check (WebKit)"
  - "PRINT-01, PRINT-02 and Phase 4 success criteria 1 and 2 read as sketch 010 approved them"
affects: []

actuals:
  tokens: 12400
  tasks: 3
  commits: 3
plan_head_before: 58a29293f3888c587a6e18b19f194df9d567589a
plan_head_after: ffc01ff7aad627ab4d6a60c193aa909364cfeb58
commits: 3

tech-stack:
  added: []
  patterns:
    - "A visually hidden polite status paragraph rendered always (never conditionally) inside the section it describes, so the live region exists before its text changes"
    - "A keyboard probe starts at the page's first stop, treats one element held across several Tab presses (a date input's segments) as one stop, and counts a radio group as reached when any member is"

key-files:
  created:
    - app/src/ui/RecipePage.a11y.test.jsx
    - .planning/phases/04-prepare-the-next-version-for-making/04-keyboard-probe.mjs
  modified:
    - app/src/ui/GraduatedRule.jsx
    - app/src/ui/GraduatedRule.test.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/Method.jsx
    - app/src/ui/Method.test.jsx
    - app/src/styles/app.css
    - app/src/styles/tokens.css
    - app/src/styles/binder.test.js
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md

key-decisions:
  - "The deviation words enter the rule's name only when the figure has a band; with no band the target text already says no target set, so it is said once"
  - "The announcement lists the marked rows' ingredient names in table order, de-duplicated, joined with commas and a final 'and'; the third local copy of the joinNames helper was kept local (GraduatedRule and BasisNote each hold one) rather than extracting a shared module for this plan"
  - "A date input gets its focus ring from :focus, not :focus-visible, because WebKit does not match :focus-visible on it (measured); the fourth rule that draws the focus outline, pinned in binder.test.js"
  - "The walk starts at the page's first stop, not its first link: from 724 to 1589 the fly-out's Places button precedes the first link in the document and is a real Tab stop"

patterns-established:
  - "Probe output: FAIL lines fail the run; NOTE lines are information (the six balance rules left off the Tab path with tabindex -1 while a pen is open are listed, not failed)"

requirements-completed: [UX1-01, UX1-03, PRINT-01, PRINT-02]

duration: 14 min
completed: 2026-10-11

coverage:
  - id: D1
    description: "Each balance rule's accessible name carries its deviation words after its target, and a rule with no target says no target set once"
    requirement: UX1-01
    verification:
      - kind: unit
        ref: "app/src/ui/GraduatedRule.test.jsx#GraduatedRule - the deviation words in the accessible name (inside, below, no band, basis last)"
        status: pass
      - kind: unit
        ref: "app/src/ui/RecipePage.a11y.test.jsx#names the Solids rule's deviation words after its target"
        status: pass
      - kind: probe
        ref: "04-keyboard-probe.mjs rules (WebKit, Olive Oil v1 at 1366 fine)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Focusing a rule announces Contributing to {figure}: {rows} in a polite live region; blurring clears it"
    requirement: UX1-01
    verification:
      - kind: unit
        ref: "app/src/ui/RecipePage.a11y.test.jsx#fills the polite live region with the marked rows on focus and empties it on blur"
        status: pass
      - kind: probe
        ref: "04-keyboard-probe.mjs rules (names every marked row; blur clears)"
        status: pass
    human_judgment: true
    rationale: "That a screen reader speaks the region politely and in a sensible order is VoiceOver behaviour on the device; the probe proves the markup and the text, not the speech"
  - id: D3
    description: "ol.method-steps carries role=list; the recipe page's tab title reads {recipe name} - Sprinkles and returns to Sprinkles on unmount; the region names are h2 in reading"
    requirement: UX1-01
    verification:
      - kind: unit
        ref: "app/src/ui/Method.test.jsx#carries role=list on ol.method-steps"
        status: pass
      - kind: unit
        ref: "app/src/ui/RecipePage.a11y.test.jsx#reads {recipe name} - Sprinkles once the recipe loads and returns to Sprinkles on unmount; stands Before you start, Ingredients, Instructions, Balance and Watch for as h2 elements"
        status: pass
    human_judgment: false
  - id: D4
    description: "In WebKit, Tab from the page's first stop reaches every enabled link, button, radio group and checkbox on Home, the recipe page, the Next version pen, the record pen with the tasting open, the Correct pen, the print route and Search, at 1366 fine and 393 coarse, each stop showing a focus outline"
    requirement: UX1-01
    verification:
      - kind: probe
        ref: "04-keyboard-probe.mjs walk (WebKit, 14 page states, no FAIL)"
        status: pass
    human_judgment: true
    rationale: "Playwright's WebKit on a Mac is not Mobile Safari; D-21's device half (tap then Tab on the iPad, Full Keyboard Access off) is Mark's"
  - id: D5
    description: "Every visible text the walk shows meets WCAG 2.2 AA contrast against its nearest opaque background (4.5:1, 3:1 for large text)"
    requirement: UX1-01
    verification:
      - kind: probe
        ref: "04-keyboard-probe.mjs walk (7 to 357 texts measured per state, no failures; disabled and dashed mark-one options are exempt as inactive)"
        status: pass
    human_judgment: false
  - id: D6
    description: "No new surface conveys a state by colour alone: the draft notice, the Search no-match line and the mark-one off state carry words, the estimated flag is words (D1 above), and the printed pages are one ink"
    requirement: UX1-03
    verification:
      - kind: probe
        ref: "04-keyboard-probe.mjs colour (print pages at 1366 and 393: text, borders and strokes all the ink token; the three notices read their exact words; the off options disabled and dashed)"
        status: pass
    human_judgment: false
  - id: D7
    description: "REQUIREMENTS.md PRINT-01 and PRINT-02 and ROADMAP Phase 4 success criteria 1 and 2 read as sketch 010 approved them"
    requirement: PRINT-01
    verification:
      - kind: command
        ref: "grep -c 'mise-en-place box' REQUIREMENTS.md = 0; 'As made line first' and 'tag row' present in REQUIREMENTS.md; 'As made' present in ROADMAP.md; commit ffc01ff lists REQUIREMENTS.md and ROADMAP.md only, hunks inside the Phase 4 section"
        status: pass
    human_judgment: false
  - id: D8
    description: "Every item Phase 4 leaves Mark is a row on Mark's List"
    requirement: UX1-03
    verification: []
    human_judgment: true
    rationale: "This executor has no ArtifactData tool; the orchestrator writes the rows listed under Mark's List rows to add and verifies the ids"
---

# Phase 4 Plan 10: Screen-reader close-out and the WebKit loop walk Summary

**A balance rule now says its deviation in its name and announces the rows it marks in a polite live region; the steps keep their list role, the tab title leads with the recipe, a date field shows its focus ring in WebKit, and a WebKit probe walks the whole loop at 1366 fine and 393 coarse for Tab reach, visible focus, AA contrast, one-ink print pages and words-not-colour.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-10-11T10:57:00Z (approximate, recorded at the first command)
- **Completed:** 2026-10-11T11:11:00Z
- **Tasks:** 3 (tracer, auto, closing)
- **Files modified:** 12

## Accomplishments

- **Tracer (Task 1).** The rule's accessible name reads label, value (or the was/now phrase), target, deviation words, basis. A visually hidden `p[role=status][aria-live=polite]` sits after the Balance fold body and reads `Contributing to {figure}: {names}` while a rule marks rows. Rule: the names come from the focused figure's `contributorRowIds` against the live version's rows, in table order, de-duplicated. `.visually-hidden` is a top-level app.css rule reading the new `--app-size-visually-hidden` token. Tracer gate: the `<verify>` is automated-only and `human_verify_mode` is end-of-phase, so the targeted tests and the probe's `rules` mode were re-run and passed before expansion (log: tracer verified end to end, expanding).
- **Task 2.** `role="list"` on `ol.method-steps`; the document title (`{recipe name} · Sprinkles`, restored to `Sprinkles` on unmount; the print route already set its own); the region names pinned as h2 in reading; and `04-keyboard-probe.mjs` `walk`, `colour` and `check` modes.
- **Task 3.** PRINT-01 and PRINT-02 and Phase 4 success criteria 1 and 2 now say what Mark approved in sketch 010 (As made first, Balance beside the table, no % of batch, no tick box, typed targets as a tag row, the blank log as two sides front and back).

Probe results on a scratch build (`PROBE_DIST`, never `app/dist`): `check` prints 54 checks passed, no FAIL. `walk` covers 14 page states (7 pages by 2 viewports) with 6 to 77 Tab stops each and 7 to 357 texts measured each.

## Task Commits

1. **Task 1 (tracer): a balance rule names its deviation and announces the rows it marks** - `738a1e1` (feat)
2. **Task 2: list role, a date focus ring, and a WebKit walk of the loop** - `8576e96` (feat)
3. **Task 3: PRINT-01, PRINT-02 and Phase 4 criteria 1 and 2** - `ffc01ff` (docs)

## Files Created/Modified

- `app/src/ui/GraduatedRule.jsx`, `GraduatedRule.test.jsx` - deviation words in the name; four name cases pinned
- `app/src/ui/RecipePage.jsx` - the live region, the announcement text, the document title effect
- `app/src/ui/RecipePage.a11y.test.jsx` (new) - name, live region on focus and blur, title, h2 pins
- `app/src/ui/Method.jsx`, `Method.test.jsx` - role=list and its pin
- `app/src/styles/app.css`, `tokens.css` - `.visually-hidden`, `--app-size-visually-hidden`, the date input's focus rule
- `app/src/styles/binder.test.js` - the focus-outline rule set now has four members
- `.planning/phases/04-prepare-the-next-version-for-making/04-keyboard-probe.mjs` (new) - rules, walk, colour, check
- `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md` - scoped wording edits

## Decisions Made

See key-decisions. None needs Mark except the rows listed below.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] A date input showed no focus ring in WebKit**
- **Found during:** Task 2 (the walk's focus check)
- **Issue:** the churn date and tasting date fields drew no outline when Tab arrived: WebKit leaves `:focus` true and `:focus-visible` false on a date input (focus lives in its inner segments), so the global `:focus-visible` rule drew nothing. Measured on the built app with Playwright WebKit. UX1-01 asks for visible focus.
- **Fix:** `input[type='date']:focus` draws the same ring (the focus tokens, the sheet ink), as a text field gets it. This is the fourth rule that draws the focus outline; `binder.test.js` pins the set.
- **Files modified:** `app/src/styles/app.css`, `app/src/styles/binder.test.js`
- **Verification:** `walk` passes at 1366 fine and 393 coarse; full suite green
- **Commit:** `8576e96`

**2. [Rule 3 - Blocking] The walk's "first link" start missed the fly-out menu button**
- **Found during:** Task 2
- **Issue:** from 724 to 1589 the Places button precedes the first link in the document and is a real Tab stop; starting at the first link reported it never reached, on every page at 1366.
- **Fix:** the probe starts at the page's first stop (first visible, enabled control not at tabindex -1). A date input's several segments count as one stop, and a radio group is reached when any member is.
- **Files modified:** `04-keyboard-probe.mjs`
- **Commit:** `8576e96`

### Plan wording adjusted

- **The h2 pin is in `RecipePage.a11y.test.jsx`, not `RecipePage.test.jsx`.** RecipePage.test.jsx runs in the node environment with no window; mounting the page needs jsdom. The plan allows the title pin in either file; the h2 pin followed it.
- **There is no "Notes" region on the recipe page in reading.** The regions are Before you start, Ingredients, Instructions, Balance and Watch for (the margin), plus the log's Batch. The pin covers those five; "Notes" in the plan's list names a heading the page does not have.
- **The recipe-page tab-title code landed in Task 1's commit** (`738a1e1`) beside the live-region edits to RecipePage.jsx, not in Task 2's. Its test and the rest of Task 2 are in `8576e96`.
- **Task 3's Mark's List writes were handed to the orchestrator** (this executor has no ArtifactData tool); the precondition on the tool is therefore not met in this session by design. The requirement and roadmap edits were made and verified.

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking), 4 plan-wording adjustments. **Impact:** one small app.css rule and its pin; no scope change.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None. The live region renders ingredient names as React text and `document.title` is a plain string assignment (T-04-27); the probe ran on 127.0.0.1 with every off-host request aborted and never touched :4173 or :8077 (T-04-28).

## Issues Encountered

- A build into `PROBE_DIST` must have the variable set in the same shell call; Bash calls start fresh. One build ran with the variable empty and wrote nothing (`app/dist` kept its earlier timestamp). Mark's served build was not refreshed at any point.
- The six balance rules are `tabindex=-1` while a pen is open (route-recipe-batch.md section 6, by design). The probe lists them as NOTE lines, not failures.

## Deferred Human Verification

human_judgment: true (D4, D2). Chrome and Playwright's WebKit do not prove the iPad. Serve the build, never the dev server: `npm --prefix app run build && npm --prefix app run preview -- --host`.

1. **D-21, the device half** (row to add: `check-keyboard-walk-loop`): on the desktop and on the iPad (Safari, 1366 landscape, tap then Tab, Full Keyboard Access OFF), walk the loop by keyboard: review the recipe, open Next version and save, record a batch with a tasting and save, Correct it, open Print sheet and press Print, enter a Sheet code on Search. Every control reachable, focus always visible, labels visible. Tab past the last link handing focus to Safari's chrome is expected. Also look at the date fields (churn date, tasted date): they should now show the ink ring, which Playwright's WebKit proved and the iPad has not.
2. **A balance rule's spoken name and the live announcement** (folded into the same row): with VoiceOver on, focusing a rule reads its name with the deviation words, and the Balance region then says Contributing to the figure and the rows.
3. Earlier plans' device checks stay on their own rows (see below): `check-ipad-pdf-bench-sheet-olive-oil`, `look-print-sheet-route-device`, `p4-05-ipad-mark-one`, `p4-draft-ipad-uat`.

## Mark's List rows to add

This executor has no ArtifactData tool. The orchestrator writes these rows and verifies the ids. Every row: `phase: "04"`, `addedBy: "claude"`, `status: "open"`, `owner: "mark"`, `createdAt` and `updatedAt` now.

**Rows to write (not covered by an id already on the list):**

1. `decide-three-pens-keep-drafts`
   - kind: decide; owner: mark; needs: answer
   - title: Three pens keep drafts, not four
   - detail: D-14 names four pens that keep their draft (developing, recording, amending, tasting). Since 03.3.1 the tasting is a section of the record pen, so the build keeps three drafts and the tasting ink rides inside the record draft, or inside the Correct draft when a tasting is added to a churned batch; nothing typed goes unkept. From 04-09, a departure from D-14 as worded.
   - where: Notebook, any version, a pen with the tasting open, reload
   - options: `three-drafts` "Three drafts, tasting ink kept inside them" (recommended: true); `tasting-draft` "A separate draft for the tasting"
2. `look-aug-2-draw-temp-dropped`
   - kind: look; owner: mark; needs: answer
   - title: 2 Aug batch lost its draw temperature
   - detail: The 2 Aug Olive Oil batch's Time to draw temp. of 20 min went with the field (your decision D17). Nothing to do unless you want it kept as a note on that batch. From 04-03 Task 3.
   - where: Olive Oil v1, 2 Aug batch
3. `check-keyboard-walk-loop`
   - kind: check; owner: mark; needs: hands
   - title: Walk the loop by keyboard on the iPad
   - detail: The automated WebKit walk passes at 1366 fine and 393 coarse; it is Playwright's WebKit, not your iPad. On the desktop and on the iPad (Safari, 1366 landscape, tap then Tab, Full Keyboard Access OFF, build plus preview --host) walk the whole loop: review, Next version and save, record with a tasting and save, Correct, Print sheet and Print, a Sheet code on Search. Look for every control reachable, focus always visible (the date fields now draw a ring), labels visible; with VoiceOver, a balance rule reads its deviation and the rows it marks. From 04-10 Task 2, D-21.
   - where: iPad Safari and desktop, Olive Oil v1

**Close if open:** `build-remove-draw-temp-data-element` (status done, `resolvedAt` now, reply "Time to draw temp. removed in 04-03 (8c2d1a5); the 2 Aug batch's 20 min dropped with it"). Use `if_version` from a fresh read.

**Skipped, already on the list (the orchestrator's ids), with the plan's slug they answer:**

| Plan slug | Covered by |
|-----------|------------|
| decide-p4-search-submit-control | decide-search-submit-control |
| decide-p4-instructions-after-balance | decide-instructions-when-balance-continues (closed, Mark chose option-a) |
| decide-p4-safari-header-row | decide-sheet-laid-by-measurement (04-07 supersedes option C by sketch 010 D29); also decide-sheet-balance-tail-alone |
| decide-p4-seeded-at-draw-from-freezer | decide-seeded-batches-at-draw-from-freezer |
| look-p4-print-sheet-link | decide-print-sheet-control-place |
| look-p4-next-time-tasting-closed | p4-05-next-time-closed-tasting |
| look-p4-correct-draft-address | p4-correct-draft-address |
| look-p4-home-draft-version | p4-home-draft-older-version |
| look-p4-search-page | look-sheet-code-search-ipad |
| check-p4-ipad-pdf-bench-sheet | check-ipad-pdf-bench-sheet-olive-oil (and look-sheet-pages-ipad-print, look-print-instructions-page-olive-oil) |
| check-p4-print-route-393 | look-print-sheet-route-device (its two steps are this check) |
| check-p4-mark-one-ipad | p4-05-ipad-mark-one |
| check-p4-draft-closed-tab-ipad | p4-draft-ipad-uat |
| check-p4-print-headers-footers-off | folded into check-ipad-pdf-bench-sheet-olive-oil, whose 04-08 text already says to print with the dialog's headers and footers off; add a sentence there if a separate row is wanted |
| check-whole-loop-on-paper-after-phase-4 | already exists, not duplicated |

Also skipped: `look-declared-pen-reading-0-1-2` and `look-import-failure-sentence-and-reset` are on the list from 04-03 and 04-04 and were not in this plan's list.

## Next Phase Readiness

Phase 4 has no further plans. Phase 4's close-out for Mark is the rows above plus `check-whole-loop-on-paper-after-phase-4`.

## Self-Check: PASSED

- Created files exist: `app/src/ui/RecipePage.a11y.test.jsx`, `.planning/phases/04-prepare-the-next-version-for-making/04-keyboard-probe.mjs` (FOUND)
- Commits `738a1e1`, `8576e96`, `ffc01ff` are ancestors of HEAD; `git rev-list --count` from the recorded base is 3
- Acceptance: GraduatedRule name cases, RecipePage.a11y live text and its clearing, `04-keyboard-probe.mjs check` (54 checks, no FAIL), `npm --prefix app test` (77 files, 2438 tests, 0 failing), Task 3's grep gate and ROADMAP/REQUIREMENTS-only commit
- Mark's List acceptance (rows exist on the list): deferred to the orchestrator as instructed
