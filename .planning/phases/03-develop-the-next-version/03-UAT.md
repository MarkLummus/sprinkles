---
status: diagnosed
phase: 03-develop-the-next-version
source: [03-VERIFICATION.md, 03-VERIFICATION.md (gap-closure re-verification, 2026-09-08)]
started: 2026-09-07T20:01:13.243Z
updated: 2026-09-08T01:49:50.000Z
---

## Current Test

[testing complete]

## Tests

### 1. Open the churned olive oil version, click 'Develop the next version', type 48 over the oil row's 40 g, watch the parent's 40 struck in ink beside the new value, type a version line, click 'Save as a new version', and confirm landing on the child's own URL reading clean.
expected: The strike renders live, the six figures and basis note answer live against the typed grams, the save lands on a new URL, and the churned version and its 2 Aug batch are unchanged when reopened (REC1-02).
result: issue
reported: "pass with these observations: - the visual display of the ingredient table is broken: at a normal browser width, the step selector control is overlapping the Grams, As Made, and % of Batch column values. - when viewing the version (not a batch), the \"As Made\" column is visible in the ingredient table - should it be?"
severity: major

### 2. Reload the child version's URL in a fresh page load.
expected: The same twelve rows, grams, method text, and authored notes reappear (REC1-05).
result: pass

### 3. In the pen, remove a row and watch it render struck in place with the totals and six figures updating live; remove a method step that uses a still-active row and watch the row-side orphaned-row flag appear beside it; restore both and watch the flags clear.
expected: Struck rendering, live totals, and the two removal cross-flags behave exactly as described, with no cascade (REC1-03, D-10).
result: issue
reported: "when I removed the Soy Lecithin row, I see a note under the step 1 and a \"remove this step\" button. The free form text edit boxes for the Lead-in and Instruction are still shown with the original text and there is a strike-thru version beneath them, which looks odd. when I removed step 1, neither ingredient row is flagged (there are 2 ingredients checked). when I removed step 2, the flags appeared (with a remove this row button) in the ingredient column, but the step selector for the row now shows Step 1 as selected, which is wrong."
severity: major

### 4. Type a reason, tap a cited batch from the list, save, and read the child's lineage line ('from 50 g oil · 800 g, after the batch of 2 Aug 2026') with both parent and batch as live links; leave the reason blank and confirm it reads 'no reason recorded'.
expected: The ceremony behaves exactly as the brief and D-04 describe (REC1-04).
result: pass

### 5. Fork the same parent twice, then read the version strip's three entries (parent, child A, child B) in creation order, with the current version carried by weight and outline and the churned parent wearing 'churned'.
expected: Strip renders correctly per D-06/D-21 wording rules.
result: pass

### 6. On a saved child, press the show-changes toggle in the lineage line and confirm the URL gains '?changes', the marks appear (struck grams/share, hollow parent tick on the rules, struck-beneath method text), then press the browser's back button and confirm the clean reading returns; copy the URL with the parameter into a new tab.
expected: The addressable toggle behaves exactly as D-02 describes, with no new route (FORM2-01).
result: issue
reported: "when a step is removed, the step numbers don't renumber automatically. otherwise pass."
severity: minor

### 7. Read the four derived advisories in the margin for the churned olive oil version (sub-scale, ultra-pasteurised, hydration, estimated-exposure), confirming the block's 'derived' legend sits parallel to the authored block's own legend, then remove rows in the pen and watch advisories appear/disappear live.
expected: Four advisories render with correct wording and basis lines, positioned between BatchMargin and Authored, and react live to pen edits (FORM2-02).
result: pass

### 8. Click the running head 'Sprinkles' from several page states (reading, developing, not-found) and confirm it always returns to the recipe list; visit a version id that does not exist and confirm 'No recipe found' links back to the list.
expected: Navigation behaves as described in every state.
result: pass
note: "User: \"No recipe found\" is not a link; the Sprinkles running head and the Back to the recipe list link both work. The not-found state links back via its own link, which is what 03-03 built."

### 9. Confirm the plan's pen and the batch's pen cannot both be open: with the plan's pen open, the batch margin's 'Record a batch'/'Record another batch'/'Amend' controls are disabled with a stated reason in words; with the batch pen open, 'Develop the next version' is disabled.
expected: Mutual exclusivity holds and the reason is stated in words, never just visually implied (D-10).
result: issue
reported: "when developing, the batch controls are disabled, but the add tasting controls are not disabled. Develop button is disabled when Amending or Batch Recording, but not when Adding a tasting. Amend and Batch recording buttons are also enabled while adding a tasting. I was able to select another version while amending."
severity: major

### 10. Open the churned olive oil version, press Amend on its batch, then press the browser's back button or type another version's URL, and confirm the page arrives with no pen open and no ink in the fields. Repeat with Develop the next version open and a changed gram, landing on a sibling version: the sibling must read clean.
expected: The route-keyed remount (app/src/router.jsx) resets all pen state on any id/batchId change; neither the amend-save TypeError nor the cross-version write (both traced in .planning/debug/one-pen-rule-leaks.md) is reachable, including by the browser's own back/forward.
result: pass
note: "User: after clicking Amend (or Develop the next version) the browser's back button lands on the recipe list, not the recipe page. Expected: opening a pen is component state, not a route, so back returns to the prior history entry. List arrived clean, reopened recipe clean, and a sibling URL typed while developing with a changed gram read clean."

### 11. With the dev server running at a normal desktop width (about 1280-1440px), open the churned olive oil version and press Develop the next version. The step selector must sit wholly inside the Step column, with the Grams, As made and % of batch values readable beside it and nothing painted over them. Narrow the window and confirm it still holds.
expected: The class-based column sizing and the step select's shrink guard (app/src/styles/app.css, app/src/styles/tokens.css's --col-step) keep the control inside its own cell at every width tested.
result: issue
reported: "that part passes, but the Remove column and buttons occlude the values in the Data column."
severity: major

### 12. Open the churned olive oil version: the As made column is present, because its 2 Aug batch is in view. Develop the next version and save it as a child, then read the child: the As made column is gone entirely — no header, no empty cells, no empty total — and the remaining columns are legible with nothing shifted onto the wrong one.
expected: hasAsMadeLayer correctly gates the column's presence in a real render, and the class-based sizing means its removal does not shift width onto a neighboring column.
result: pass

### 13. In the pen on the churned olive oil version, remove the Soy lecithin row and then remove step 1. Step 1's Lead-in and Instruction fields must still show their text once, with no struck copy beneath them, and the removed label beside them. Then restore step 1 and type into its Purpose field only: the lead-in and instruction must not become struck.
expected: The struck-beneath device renders only for the field that actually changed, never for a step's removed flag alone.
result: pass

### 14. In the pen, remove step 1 and read what it now says: it must name soy lecithin and Graza Drizzle as still used by step 8, and must offer only a restore control, with no second control claiming to remove it. Then remove step 2 and confirm the three gums flag beside their own names in the table while sucrose and whole milk are named on the step as covered by step 3.
expected: coveredRowsFor's coverage cue renders in words on a removed step whose rows are all still covered, and the cross-flag/remove-this-step control disappears from an already-removed step.
result: issue
reported: "it says that they are used by step 7, not 8.\nremove step 1, first 2 steps are numbered 1. remove second step and steps numbers start over at 1 on third step - probably need to strike the step number on the removed steps or something else.\nit says \"Whole milk and Sucrose are still used by step 1\" not step 3."
severity: minor
note: "The numbers the cue prints are the derived display numbers (old step 8 reads 7 once step 1 is removed; old step 3 reads 1 once steps 1 and 2 are removed), so the cue is consistent with D-UAT-4 renumbering. What the pen lacks is a struck or otherwise marked number on a removed step, so a removed step and the next live step both read 1 and the cue becomes ambiguous."

### 15. In the pen on the churned olive oil version, remove step 2. The three gum rows must flag beside their names, and each flagged row's selector must still show its own allocation — the removed step, marked removed and unselectable — never step 1. Save the child and read it: its method reads 1 to 9 with no gap, and the rows that were only in the removed step read as unallocated. Press show changes: the live steps read 1 to 9 and the struck step reads 2.
expected: The selector's option list (built from every step, not just active ones) keeps the bound value matched to a real option; the saved child's reading and show-changes states both renumber per stepNumbers.js's derivation.
result: pass
note: "User: the 3 unallocated rows have nothing in Step column. Expected per the test: rows that were only in the removed step read as unallocated."

## Summary

total: 15
passed: 9
issues: 6
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-03-1
  truth: "The pen flow saves a child at its own URL with the churned version untouched, and the ingredient table renders legibly while developing: the step selector sits in its own cell and never overlaps the Grams, As Made or % of batch values; the As Made column is shown only when a batch is in view."
  status: resolved
  resolved_by: 03-08-PLAN.md
  resolved_at: 2026-09-07
  reason: "User reported: pass with these observations: - the visual display of the ingredient table is broken: at a normal browser width, the step selector control is overlapping the Grams, As Made, and % of Batch column values. - when viewing the version (not a batch), the \"As Made\" column is visible in the ingredient table - should it be?"
  severity: major
  test: 1
  root_cause: "(a) .ingredient-table__step-cell select.ink-field sets width:auto but not the flex:1 1 auto; min-width:0 guard its grams-cell twin has, so under table-layout:fixed the select keeps its min-content width (~320px for the longest option label) in a ~42px Step cell and, with justify-content:flex-end, overflows leftward over % of batch, As made and Grams; (b) hasAsMadeLayer (IngredientTable.jsx:322) gates only the tfoot total and legend, never the As made th or the three AsMadeCell td sites, so a batchless version renders an empty labelled column. Column sizing is positional (nth-child 2-4), so hiding the column without a colgroup/class-based sizing shifts the 88px width onto the Step column."
  artifacts:
    - path: "app/src/styles/app.css"
      issue: "lines 397-399: step select lacks flex:1 1 auto; min-width:0 (compare 358-362 grams cell); lines 326-341 positional nth-child column sizing"
    - path: "app/src/ui/IngredientTable.jsx"
      issue: "line 346 th and lines 374/400/450 td render As made unconditionally; hasAsMadeLayer at 322 unused for the column; option labels at 109 set select min-content width"
    - path: "app/src/ui/RecipePage.jsx"
      issue: "lines 307-312: openBatch falls back to newest batch, so the parent legitimately shows the column and the child is the pure empty case"
  missing:
    - "Add flex:1 1 auto; min-width:0 to the step select (or give the option labels a shorter form) so it shrinks inside its cell"
    - "Gate the As made th and td sites on hasAsMadeLayer"
    - "Convert numeric column sizing from nth-child to colgroup or class-based selectors before making the column conditional"
    - "Mark to confirm the brief reading: column appears only while recording or with a saved batch in view"
  debug_session: .planning/debug/step-selector-overlap-and-as-made-column.md

- gap_id: G-03-3
  truth: "Removing a row flags every step that still uses it and leaves that step editable in one form (no duplicated struck copy beneath live fields); removing a step flags every still-active row it used, regardless of which step it is; a flagged row keeps its own step allocation and never shows a different step as selected."
  status: resolved
  resolved_by: 03-09-PLAN.md, 03-10-PLAN.md
  resolved_at: 2026-09-07
  reason: "User reported: when I removed the Soy Lecithin row, I see a note under the step 1 and a \"remove this step\" button. The free form text edit boxes for the Lead-in and Instruction are still shown with the original text and there is a strike-thru version beneath them, which looks odd. when I removed step 1, neither ingredient row is flagged (there are 2 ingredients checked). when I removed step 2, the flags appeared (with a remove this row button) in the ingredient column, but the step selector for the row now shows Step 1 as selected, which is wrong."
  severity: major
  test: 3
  root_cause: "S1: Method.jsx:72 (and :221 in show-changes) reuses the struck-beneath changed-text device as the removed marker (showStruckBeneath = textChanged || removed), so a removed step prints the same sentence live in its fields and struck beneath; diff.js:123 also treats a first keystroke into an absent aside (null vs empty string) as textChanged. S2: not a code fault - uses.js:45 implements the brief verbatim (a removed step flags only rows no remaining step uses) and step 8 still uses both of step 1 rows, so silence is by design but indistinguishable from failure; the UAT truth contradicts the brief and needs a product ruling. S3: IngredientTable.jsx:316 builds stepOptions from activeSteps so the removed step leaves the option list while StepCell:104 still binds value=draftRow.step; React 19 selects the first non-disabled option when nothing matches, so the display shows Step 1 while the data still holds 2. Also found: the step-side flag and its remove-this-step button persist on an already-removed step (uses.js:33 lacks a step.removed guard)."
  artifacts:
    - path: "app/src/ui/Method.jsx"
      issue: "line 72 and 221: struck-beneath shown for removed steps; line 196: flag not gated on !draftStep.removed"
    - path: "app/src/domain/diff.js"
      issue: "line 123: null vs empty-string aside compared as a text change"
    - path: "app/src/domain/uses.js"
      issue: "line 45: orphanedRows follows the brief rule (rows no remaining step uses); line 33: removedRowsUsedBy lacks a step.removed guard"
    - path: "app/src/ui/IngredientTable.jsx"
      issue: "line 316 stepOptions from activeSteps; line 104 select value bound to draftRow.step with no matching option"
  missing:
    - "Stop using the struck-beneath device as the removed marker; strike only the field that changed; normalise absent purpose/aside to empty string on both sides of the diff"
    - "Product ruling on S2: keep the brief rule and add a legible cue such as still used by step 8, or change brief, uses.js and uses.test.js together"
    - "Keep the removed step in the select option list, disabled and marked removed, so the bound value always has a home (shared seam with G-03-6)"
    - "Gate the step-side flag and its control on the step not already being removed"
  debug_session: .planning/debug/removal-cross-flags-misbehave.md

- gap_id: G-03-6
  truth: "When a step is removed, the remaining active steps renumber in sequence in the reading state and in the pen; in show-changes the struck step reads in place without the live steps skipping a number."
  status: resolved
  resolved_by: 03-10-PLAN.md
  resolved_at: 2026-09-07
  reason: "User reported: when a step is removed, the step numbers don't renumber automatically. otherwise pass."
  severity: minor
  test: 6
  root_cause: "step.n is both the stored identity and the printed number at all thirteen display sites (Method.jsx margin numbers and aria-labels in all three branches, IngredientTable step cell, struck old allocation, option labels, show-changes stepFrom/stepTo, accessible names, orphan flag; advisories.js:127 prose), and nothing computes a display position: activeSteps (rows.js:23) filters without renumbering, RecipePage.jsx:252 uses it for reading so the gap lands on the clean page, :828 passes the unfiltered method while developing and showing changes, and lineage.js:97 carries removals forward so gaps accumulate. Renumbering the stored n is ruled out by experiment: diff.js:163 pairs steps by n so every step below a removal would read as rewritten, and row.step/splitStep, four pen handlers, SEED_USES and batch stepChanges all key on n. Same seam as G-03-3 S3; already-saved children store rows whose step names a removed step, so the clean reading prints a step number the method no longer has."
  artifacts:
    - path: "app/src/domain/rows.js"
      issue: "line 23: activeSteps filters, never renumbers (by design)"
    - path: "app/src/ui/Method.jsx"
      issue: "lines 77/226/295 print step.n; aria-labels at 86/96/126/133/162/171/337; ids at 75/224/293"
    - path: "app/src/ui/IngredientTable.jsx"
      issue: "lines 403, 101, 109, 164-165, 48, 201, 231 print step numbers from n"
    - path: "app/src/ui/RecipePage.jsx"
      issue: "line 252 reading uses activeSteps; line 828 pen/show-changes pass unfiltered method"
    - path: "app/src/domain/advisories.js"
      issue: "line 127: Step N clause in derived prose"
    - path: "app/src/domain/diff.js"
      issue: "line 163: baselineStepByN is why n must stay immutable"
    - path: "app/src/domain/lineage.js"
      issue: "line 97: method cloned verbatim so removals accumulate"
  missing:
    - "Keep n as immutable identity and add a derived displayNumbers(version) map (position among active steps) in the domain, threaded to all thirteen display sites including row.step/splitStep, select option labels (values stay n), orphan flag and advisory prose"
    - "Mark to decide what number a struck step wears in show-changes (parent number, none, or a mark)"
    - "Decide whether a saved child whose rows still name a removed step is remapped on read or migrated"
  debug_session: .planning/debug/steps-do-not-renumber-after-removal.md

- gap_id: G-03-9
  truth: "Exactly one pen is open at a time: while developing, every batch-side control (record, record another, amend, add a tasting) is disabled with a stated reason; while recording, amending, or adding a tasting, Develop the next version and the other batch-side openers are disabled with a stated reason; while any pen is open, the version strip and batch list do not navigate away from the unsaved ink without the leave warning."
  status: resolved
  resolved_by: 03-06-PLAN.md, 03-07-PLAN.md
  resolved_at: 2026-09-07
  reason: "User reported: when developing, the batch controls are disabled, but the add tasting controls are not disabled. Develop button is disabled when Amending or Batch Recording, but not when Adding a tasting. Amend and Batch recording buttons are also enabled while adding a tasting. I was able to select another version while amending."
  severity: major
  test: 9
  root_cause: "Four defects. RC1: no single a-pen-is-open predicate - RecipePage models openness as two unrelated states, mode (reading|recording|developing) and tastingDraft, so every control hand-rolls its own subset and none sees the tasting pen (tastingDraft is not passed to Headnote). RC2: BatchMargin.jsx:341 Add a tasting has no disabled prop at all, unlike its siblings Amend (296) and Record another batch (318); 03-01 Rule 2 deviation enumerated three openers and missed it. RC3: no in-app navigation guard exists (no useBlocker; beforeunload cannot see a react-router Link), and react-router 8 renders RecipePage with no key so /recipe/A to /recipe/B reuses the instance and preserves mode, draft, amendingBatchId, tastingDraft and penDraft - which yields a crash (amend on A, navigate to B, save: batches.find returns undefined, recordAmendment throws) and a silent wrong write (develop on A, navigate to sibling B, save as new: siblings share row ids so a child OF B is written carrying A grams, method, headnote and notes). RC4: dirty checks wrong both ways - isPenDraftDirty omits method, headnote and authored; isDraftDirty compares an amend draft against blank so the leave warning fires as soon as Amend opens. Fifth leak: where exclusion works, the Develop button gives no reason in words (Headnote.jsx:203 bare disabled; blockedMessage only reachable while developing), failing D-10."
  artifacts:
    - path: "app/src/ui/RecipePage.jsx"
      issue: "98-119 split pen state; 26-79 incomplete dirty checks; 215-227 beforeunload only; 433-435 amend crash path; 706-720 cross-version write path; 776-790 tastingDraft not passed to Headnote"
    - path: "app/src/ui/BatchMargin.jsx"
      issue: "341 Add a tasting lacks disabled; 296/318/353 read only mode; 304 batch list Link navigates freely"
    - path: "app/src/ui/Headnote.jsx"
      issue: "203 Develop disabled reads only mode and states no reason; 110 blockedMessage unreachable outside developing"
    - path: "app/src/ui/VersionStrip.jsx"
      issue: "29 unguarded Link"
    - path: "app/src/router.jsx"
      issue: "RecipePage on two routes with no key and no blocker"
  missing:
    - "Derive one openPen value (plan | record | amend | tasting | null) plus a reason string in RecipePage and pass it to Headnote and BatchMargin; every opener disables when openPen is set to another pen and states the reason in words"
    - "Reset all pen state when the route id or batchId changes so the crash and cross-version-write paths cannot exist regardless of navigation policy"
    - "Guard in-app navigation while a pen is open per the product decision (disable links with a reason, or useBlocker)"
    - "Fix both dirty checks: include method, headnote and authored in isPenDraftDirty; compare an amend draft against the batch it was pre-filled from"
    - "Add a RecipePage-level test seam (the interlock owner has no test file)"
  debug_session: .planning/debug/one-pen-rule-leaks.md

- gap_id: G-03-11
  truth: "While developing, every ingredient-table control sits inside its own column: the step selector inside Step, and the row-remove control inside its own column, with the Grams, As made and % of batch values readable beside them and nothing painted over them, at desktop and narrow widths."
  status: failed
  reason: "User reported: that part passes, but the Remove column and buttons occlude the values in the Data column."
  severity: major
  test: 11
  root_cause: "Width-allocation fault, not paint order. IngredientTable.jsx emits ingredient-table__col-data and ingredient-table__col-remove but no rule or token styles either class, so under table-layout:fixed they split the remainder; every declared --col-* width costs 24px more than tokens.css's derivation assumed because cells are content-box with 6px 12px padding (88px numeric measures 112px, 66px step measures 90px), so at 1280px the remainder for Data and Remove is 10.81px, not ~197px, and each gets 5.41px (0px at 1024/1152). The Data flag word 'estimated' (66px, unbreakable) and the bare native remove button (60px) cannot shrink; the button overflows its cell 67px to the right and, painted later, covers the Data word (60px overlap, header reads 'DAEMOVE') and intrudes 35px into the side region. Clears only above ~1570px. Not a 03-08 regression: Remove has been unstyled since 03-02 (3dc7812); 03-08's 90px used step width shrank Data/Remove from 33.6px to 5.41px. Second unreported instance: in the reading state at 1280 the Data column is 10.8px and its flag word spills 35px into the Formulation Note (test 12 passed only because the child has no As made column)."
  artifacts:
    - path: "app/src/styles/app.css"
      issue: "line 311 table-layout:fixed; lines 318-324 content-box th/td padding adds 24px to every declared width; lines 326-343 width rules stop at __col-step, no __col-data or __col-remove rule; zero overflow and zero @media rules"
    - path: "app/src/styles/tokens.css"
      issue: "lines 54-66 --col-step derivation subtracts padding from the remainder instead of adding it to each declared width; line 67 --col-step 66px really costs 90px; no --col-data or --col-remove tokens"
    - path: "app/src/ui/IngredientTable.jsx"
      issue: "lines 447/496/521/600/621 emit __col-data and 448/601/622 emit __col-remove, matched by nothing; lines 192-198 RemoveRowControl is a bare native button with UA chrome and no shrink guard"
  missing:
    - "Make declared widths padding-inclusive: box-sizing:border-box on .ingredient-table th/td, or rewrite --col-* tokens; correct the derivation comment at tokens.css:54-66"
    - "Add --col-data and --col-remove tokens plus matching width rules, sized from measured minimums (Data >= 66px content, check 'unreviewed'; Remove >= 60px content)"
    - "Give __col-name width:auto so it is the single unsized column absorbing the remainder as conditional columns come and go (measured: overlap -24.9px at 1024-1440)"
    - "Mark to rule what yields below ~1250px: tighter cell padding for this table, narrower --col-numeric (widest content is the 80.6px '% of batch' header), or an accepted name wrap"
    - "Verify the fix in the reading state too, where the Data column already overflows at 1280"
  debug_session: .planning/debug/remove-column-occludes-values.md

- gap_id: G-03-14
  truth: "In the pen, a removed step's number is visibly struck or marked so it cannot be read as the same number as the next live step, and the coverage cue on a removed step names the covering step by a number the reader can find on the page without ambiguity."
  status: failed
  reason: "User reported: it says that they are used by step 7, not 8.\nremove step 1, first 2 steps are numbered 1. remove second step and steps numbers start over at 1 on third step - probably need to strike the step number on the removed steps or something else.\nit says \"Whole milk and Sucrose are still used by step 1\" not step 3."
  severity: minor
  test: 14
  root_cause: "Two reference frames in one typographic voice. displayNumberFor (Method.jsx:105-109) numbers a live step by its position in the current map and a removed step by its position in the baseline map, returning a bare integer that records which frame answered; both the pen (:146-148) and show-changes (:320-322) emit that integer into an identical .method-step__n span with no removed/struck modifier (app.css:483-487 has none), while the ' removed' label sits in the other grid column below the edit fields. Removing the step at baseline position k shifts the next live step into current position k, so the two numerals are always equal and adjacent; only removing the last step avoids it. Show-changes is identically affected (a saved child that removed step 1 renders 1,1,2,...) and test 15 passed only because its expectation restates D-UAT-4. The coverage cue is not at fault: it names the covering step by current display number, which is correct; it is the victim because it is the one text asking the reader to find a numbered step. Shipped because 03-10-PLAN.md:178/:199 read D-UAT-4's 'struck' as the prose being struck and called the margin number decorative, so no criterion or test required a mark on the number; Method.test.jsx:647/:775 assert live and removed numbers separately and never check the union for duplicates. The pen already renders a step removed before the pen opened with an empty margin, a second treatment beside the unmarked one."
  artifacts:
    - path: "app/src/ui/Method.jsx"
      issue: "105-109 displayNumberFor blends two frames behind a bare integer; 146-148 and 320-322 emit it unmarked; 181 removed label in the body column; 117-119 fieldLabel drops the number for AT"
    - path: "app/src/styles/app.css"
      issue: "483-487 .method-step__n has no removed/struck variant; 366-374 .struck-value already names a removed row or step as a meaning it carries; 475-478 two-column grid"
    - path: "app/src/styles/tokens.css"
      issue: "77-78 --rule-strike and --gap-strike already exist; no new token needed"
    - path: "app/src/ui/IngredientTable.jsx"
      issue: "159-163 option list carries the same duplicate number differentiated only by a trailing (removed); 145-147 two steps both numbered 2 inside one cell; 310-320 orphan flag names a removed step by an unmarked number"
    - path: "app/src/ui/Method.test.jsx"
      issue: "583-600, 647, 775 assert live and removed numbers separately, never the union"
  missing:
    - "Have displayNumberFor report whether it fell back to the baseline map, and render a removed step's number with a struck (or otherwise marked) modifier on .method-step__n via --rule-strike/--gap-strike, in both the pen and show-changes branches"
    - "Have a removed step's field labels name the number it had so assistive technology learns which step is removed"
    - "Carry the same mark to IngredientTable's option label and orphan flag so the page agrees with itself"
    - "Add a test that the union of live and removed margin numbers is unambiguous (no two identically-rendered numerals)"
    - "Mark to rule: what mark the number wears (strike, bracket, dash, weight); whether the pen matches show-changes; whether to suppress instead (existing empty-margin treatment), which discards D-UAT-4's 'keeps the parent number'; whether the selector option and orphan flag adopt the mark or keep the trailing (removed) word"
  debug_session: .planning/debug/removed-step-number-ambiguous-in-pen.md

## Decisions (Mark, 2026-09-07, after diagnosis)

- **D-UAT-1 (G-03-9):** Writing a tasting IS a pen. Add a tasting is disabled while developing or recording; Develop the next version, Amend and Record (another) batch are disabled while a tasting is being written. Every disabled opener states its reason in words.
- **D-UAT-2 (G-03-9):** While any pen is open, the version strip, the batch list and the lineage links are disabled with a stated reason (no app dialog, per D-10); pen state also resets on any route id or batchId change as a backstop so the amend-save crash and the cross-version write cannot occur.
- **D-UAT-3 (G-03-3 S2):** Keep the brief rule in uses.js (a removed step flags only rows no remaining step uses). Add a cue on the removed step naming, in words, which of its rows are still covered by another step, so silence is legible.
- **D-UAT-4 (G-03-6):** In show-changes a struck step keeps the parent number it had, struck; live steps read 1, 2, 3 in their new order. n stays immutable identity; display numbers are derived.
- **Assumed (G-03-1 b), not objected:** the As Made column is shown only while recording or with a saved batch in view.
- **Assumed (G-03-6 data), not objected:** saved children whose rows still name a removed step are remapped on read for display; no migration.

## Decisions (Mark, 2026-09-07, after re-verification diagnosis)

- **D-UAT-5 (G-03-14):** A removed step's margin number is struck in show-changes (it keeps the parent number it had, struck, per D-UAT-4) and suppressed in the pen (empty margin, the treatment the pen already uses for a step removed before it opened). Live steps read 1, 2, 3 in their new order in both. The coverage cue keeps naming the covering step by its current display number. The step selector option and the orphan flag must not present a removed step's number as if it were a live one.
- **D-UAT-6 (G-03-11):** Below about 1250px the numeric columns yield: shrink --col-numeric toward its real widest content (the '% of batch' header, about 81px) and tighten this table's cell padding. Ingredient names stay unwrapped at 1280 and above; a wrap below about 1100 is accepted. Declared column widths become padding-inclusive, Data and Remove get their own tokens and width rules, and the name column is the single unsized column that absorbs the remainder.

## Deferred Follow-Ups

- test: 2
  idea: "the URL for the child version could be a slug based on the version name. \"Increase Oil to 48g\" becomes recipe/increase-oil-to-48g, which is nicer than recipe/3f3690ea-9f89-4a45-b908-cffbd13573c3"
  deferred_at: 2026-09-07
- test: 2
  idea: "there is no pure version view when the version has batches, only a specific batch; e.g. on the \"50 g oil · 800 g · churned\" version (recipe/olive-oil-ice-cream-v1), I see the churn values for the Aug 2 batch. we may want to consider a tree view of recipe versions at top level of outline/tree and batches for version below."
  deferred_at: 2026-09-07
