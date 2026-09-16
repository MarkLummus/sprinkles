---
status: investigating
trigger: "Show changes ON hides the record pen's per-step controls. On a new version with no batches: clear Show changes, Record batch -> Skipped and 'done differently' shown and operational; enable Show changes, Record another -> Skipped and 'done differently' not visible. Same behaviour if selecting Correct instead of Record another. (Mark, 2026-09-16, UAT of quick task 260916-ch0.)"
created: 2026-09-16T00:00:00Z
updated: 2026-09-16T00:00:00Z
bug_class: Bohrbug (deterministic — reproduces every time the two states are both on)
---

## Current Focus

hypothesis: CONFIRMED — Method.jsx's `isShowingChanges` early return pre-empts the recording branch, because the guard excludes the plan pen but not the record pen
test: read Method.jsx 552, 603, 646, 770 end to end; trace the three props to RecipePage; map every other consumer of the guard
expecting: (met) with `showingChanges` true and `changeDiff` non-null the map returns at 646 and line 770 is never evaluated
next_action: DEFERRED TO A SKETCH (Mark, 2026-09-16: "I think that we need to sketch this out"). The A/B/C call is NOT an agent's to make and is now NOT a code decision either — the show-changes view of the method has never been drawn in any sketch (see Evidence, sketch-authority entry). Draw it first, with the record pen open, then return here. No file under app/ is to be touched until a sketch settles the mark.

## Symptoms

expected: "Opening the record pen gives the maker the per-step recording controls — the Skipped checkbox and 'done differently' — regardless of whether the Show changes view happens to be on."
actual: "With Show changes ON, opening the record pen renders the version's read-only show-changes diff instead. The pen IS open (Save batch is present, mode === 'recording'), but every per-step recording control is gone. The maker is in a pen that cannot be used, while the rest of the page still says it is recording."
errors: none — no console error, no crash. A silent render-branch collision.
reproduction: |
  Confirmed in-browser 2026-09-16 (Playwright, localhost:5173), counts measured from the live DOM:

  1. Open a CHILD version (one with a parent, so Show changes renders at all).
  2. Ensure Show changes is OFF (no `?changes=` in the URL).
  3. Press Record batch.
     -> `.method-step__strike-control` count = 10, "done differently" count = 10. Operational.
  4. Cancel.
  5. Press Show changes ON. URL gains `?changes=`.
  6. Press Record batch (or Record another, or Correct — all are mode === 'recording').
     -> pen IS open (Save batch present), but `.method-step__strike-control` = 0,
        "done differently" = 0, `.method-step__uses-line` = 0.

  Extra fact not in the original report, found while reproducing: Show changes is NOT
  RENDERED AT ALL while a pen is open, so there is no way to toggle it off from inside
  the broken state, and the only path in is to enable it BEFORE opening the pen. Whatever
  fix is chosen has to account for the maker having no in-pen escape hatch today.
started: |
  PRE-EXISTING, not a regression. Quick task 260916-ch0 (the one whose UAT surfaced it)
  touched only tokens.css, app.css, VersionRow.jsx (one className) and test files — no
  rendering logic; `git diff --name-only 1bcd9de~1..f79791c` contains neither Method.jsx
  nor RecipePage.jsx. The collision has been latent since show-changes (03-04) and the
  record pen could first be open at the same time.

## Evidence

- timestamp: 2026-09-16T00:00:00Z
  checked: app/src/ui/Method.jsx — the `steps.map` branch order
  found: |
    The map body has three exits, in this order:

      line ~604   if (isDeveloping)     { return (...) }   // the plan pen
      line  646   if (isShowingChanges) { return (...) }   // read-only diff — EARLY RETURN
      line  ~7xx  return ( ... {mode === 'recording' && <StepRecordingControls .../>} ... )

    StepRecordingControls is rendered at line 770, inside the THIRD exit. When
    `isShowingChanges` is true the map returns at 646 and line 770 is never evaluated.

- timestamp: 2026-09-16T00:00:00Z
  checked: app/src/ui/Method.jsx line 552 — the guard itself
  found: |
      const isShowingChanges = !isDeveloping && showingChanges && changeDiff != null;

    It excludes the PLAN pen (`!isDeveloping`) and says nothing about the RECORD pen.
    `mode === 'recording'` does not appear in it. So the plan pen was protected from this
    collision when show-changes was built and the record pen was not — which reads like
    an omission at 03-04 rather than a deliberate precedence choice.

- timestamp: 2026-09-16T00:00:00Z
  checked: app/src/ui/RecipePage.jsx lines 563-571, 1386-1397
  found: |
    `showingChanges` is URL view state, not record data: `searchParams.has('changes')`,
    toggled by adding/deleting the bare `changes` key. It persists across an in-page
    navigation and is restored by the browser's back button. Nothing clears it when a pen
    opens — which is the other half of why the two states can coexist at all.

- timestamp: 2026-09-16T00:00:00Z
  checked: app/src/ui/Method.jsx 549-785 — the whole `steps.map` body, read end to end
  found: |
    CONFIRMED, with true line numbers. The earlier entry's "~604" and "~7xx" are now exact,
    and one of them was off by one:

      552  const isShowingChanges = !isDeveloping && showingChanges && changeDiff != null;
      603  if (isDeveloping) {                 // exit 1 — the plan pen (returns 621-643)
      646  if (isShowingChanges) {             // exit 2 — read-only diff (returns 664-730)
      737  return (                            // exit 3 — reading AND recording
      770  {mode === 'recording' && (          // StepRecordingControls, 770-777

    `if (isDeveloping)` is at 603, not 604. 646 and 770 were correct. There is exactly one
    `mode === 'recording'` test in the whole map body and it is at 770, inside exit 3 —
    nowhere else. Exit 2 returns at 730, so 770 is unreachable whenever `isShowingChanges`
    is true. Nothing between 646 and 730 mentions `mode` at all: the show-changes JSX does
    not know a pen is open and cannot render around one.

- timestamp: 2026-09-16T00:00:00Z
  checked: app/src/ui/RecipePage.jsx 571, 584, 904-905, 992-1008, 1181-1202, 1390-1397, 1744
  found: |
    The three inputs are independent and nothing reconciles them:

      571   const showingChanges = searchParams.has('changes');   // URL, push history
      584   const [mode, setMode] = useState('reading');          // React state, never URL
      904   const changeDiff = showingChanges && version.parentVersionId && parentVersion
              ? buildDiff(version, parentVersion) : null;

    `handleStartRecording` (992-1008) sets thirteen pieces of state and ends `setMode('recording')`.
    `handleStartAmending` (1181-1202) does the same. NEITHER touches `searchParams`. So
    `showingChanges` survives the pen opening untouched, `changeDiff` stays non-null, and
    `isShowingChanges` is true while `mode === 'recording'`. The collision is reachable by
    design, not by an edge case.

    Note the deliberate asymmetry: `isDeveloping` is in the guard because the plan pen was
    given precedence when show-changes was built; `handleStartDeveloping` does not clear
    `changes` either — it does not need to, the guard already yields to it. The record pen
    was never given the same treatment.

- timestamp: 2026-09-16T00:00:00Z
  checked: BLAST RADIUS 1 — app/src/ui/IngredientTable.jsx 387, 396, 427-494, 591-594, 604
  found: |
    The table carries the SAME guard, one line apart in spirit:

      387  const isShowingChanges = !isDeveloping && showingChanges && diff != null;
      592  if (isShowingChanges) return renderShowChangesEntry(row, portion, portionIndex);

    But it does NOT lose its recording controls, because the As made cell is gated on its
    own predicate and rendered inside the show-changes branch too:

      396  const hasAsMadeLayer = mode === 'recording' || Boolean(openBatch);
      483  {hasAsMadeLayer && (              // inside renderShowChangesEntry
      485    <AsMadeCell row={row} portionIndex={portionIndex} mode={mode} draft={draft} ... />

    That is the same live, editable AsMadeCell renderReadingEntry uses at 451. So in the
    exact broken state Mark reproduced, the ingredient table is FULLY OPERATIONAL: he can
    still type as-made grams into every row while the plan column shows the parent diff.

    Two consequences. (1) The page is internally inconsistent TODAY — same two states, the
    table keeps its recording controls and the method loses them. That is strong evidence
    for "omission at 03-04", not "deliberate precedence". (2) Coexistence is not
    hypothetical: it is shipped, in the sibling region, for this very pair of states. Any
    claim that C is "almost certainly wrong" has to answer why the table does it already.

    The table is unaffected by any change to Method's guard — the two guards are separate
    local consts in separate files. Changing Method cannot disturb it.

    (Aside, pre-existing, not this bug: renderShowChangesEntry computes its aria-label
    as-made value as `openBatch ? ... : null` (464) where renderReadingEntry uses
    `mode !== 'recording' && openBatch ? ... : null` (430) — so in show-changes + recording
    with a saved batch present, the row is announced with the OLD batch's as-made value.
    Noted, not touched.)

- timestamp: 2026-09-16T00:00:00Z
  checked: BLAST RADIUS 2 — app/src/ui/FormulationNote.jsx 7, 19, 28; GraduatedRule.jsx; RecipePage.jsx 1777
  found: |
    Neither component takes a `showingChanges` prop and neither computes an
    `isShowingChanges`. FormulationNote takes `diff` only, and RecipePage feeds it

      1777  diff={mode === 'developing' ? penDiff : changeDiff}

    so while RECORDING with show-changes on it receives `changeDiff` (non-null) and renders
    the per-figure deltas at 28 exactly as it does while reading. GraduatedRule only ever
    sees `figureDelta`; it never learns which state produced it. FormulationNote's only
    recording-awareness is `tabIndex` (19).

    Therefore: the six balance rules ALREADY show the version-vs-parent diff while the
    record pen is open, and are untouchable by any change to Method's guard. This directly
    answers the open question filed under candidate B — the diff does NOT vanish from the
    page if Method yields while recording. It stays in the balance rules, in the table's
    grams and share cells, and in the table's total row.

- timestamp: 2026-09-16T00:00:00Z
  checked: BLAST RADIUS 3 — app/src/ui/VersionRow.jsx 201-232
  found: |
    Confirmed at source, not just observed in the browser:

      205  {openPen === null && (
      206    <div className="versions__openers">       // Next version, Record batch,
      220      {parentVersion && (                     // and Show changes — all three
      227        Show changes

    The whole acts group, Show changes included, is behind `openPen === null`. There is no
    other render site for the toggle. So the maker genuinely has no way to turn the diff off
    from inside the pen — confirmed in code, matching the browser reproduction.

- timestamp: 2026-09-16T00:00:00Z
  checked: BLAST RADIUS 4 — RecipePage.jsx 1744, 853, domain/stepNumbers.js displayNumbers, domain/rows.js activeSteps
  found: |
    THIS IS THE FINDING THAT CHANGES WHAT CANDIDATE B COSTS.

      1744  steps={mode === 'developing' || showingChanges ? version.method : readingVersion.method}

    `readingVersion` (853) is `activeSteps`-filtered — removed steps are GONE. `version.method`
    is unfiltered — removed steps are present. So `showingChanges` does not merely switch the
    branch, it switches WHICH METHOD ARRAY Method is handed.

    Exit 3 (the reading/recording branch, 737-780) was written for the FILTERED array. It
    prints `displayNumberFor(step).number` unconditionally at 740, and `displayNumberFor`
    (567-573) falls back to `baselineStepNumbers` — the PARENT's numbering — when the step
    has no current position, which is exactly the case for a removed step (displayNumbers
    skips `step.removed`).

    So if `isShowingChanges` merely gains a `mode !== 'recording'` term and nothing else
    changes, a child version that removed a step would render that dead step in the record
    pen as an ordinary live step: unmarked, numbered from the parent's frame (so two steps
    can print the same numeral), and offering Skipped and "done differently" controls on a
    step this version does not contain. That is a correctness hazard, not a cosmetic one.
    Candidate B is therefore NOT implementable as written — it needs RecipePage 1744 (and
    for symmetry 1719/1731) to yield to recording as well.

- timestamp: 2026-09-16T00:00:00Z
  checked: BLAST RADIUS 5 — RecipePage.jsx 567-569, 1390-1397 (what candidate A costs)
  found: |
    `handleToggleShowChanges` uses `setSearchParams`'s DEFAULT history behaviour, and the
    comment at 567-569 says that is deliberate: "leaving setSearchParams's default push
    behaviour alone so the browser's own back button returns to the clean reading."

    A push is therefore what candidate A would inherit if it clears `changes` the same way.
    `mode` is React state and is NOT in the URL, so Back would restore `?changes=` WITHOUT
    closing the pen — dropping the maker straight back into the broken state, from inside a
    pen that has no Show changes control to escape with. Candidate A must clear the key with
    `{ replace: true }`, or it re-opens the defect through the Back button.

- timestamp: 2026-09-16T00:00:00Z
  checked: TEST COVERAGE — Method.test.jsx, IngredientTable.test.jsx, RecipePage.test.jsx
  found: |
    The cross-state is completely uncovered, which is why this shipped.

    Method.test.jsx passes `showingChanges` at 551, 577, 605, 626, 650, 1068, 1105 — every
    one of them with `mode="reading"`. Not one crosses show-changes with `mode="recording"`.
    The four `mode="recording"` tests (74, 85, 96, 103) all omit `showingChanges`.

    IngredientTable.test.jsx passes `showingChanges` at 50, 71, 90, 105, 227, 573 — again
    every one `mode="reading"`, and 227 explicitly `openBatch={null}`. So even the branch
    that behaves CORRECTLY (the As made cell inside renderShowChangesEntry) has no test
    proving it.

    RecipePage.test.jsx never exercises `?changes=` at all — grep for "changes" returns only
    prose in two dirty-state test names. There is no page-level test of the URL parameter.

    A regression test would need to assert, at minimum:
      - Method with `mode="recording"` AND `showingChanges` AND a non-null `changeDiff`
        renders `method-step__strike-control` and the "done differently" control
        (whichever of A/B/C is chosen, this is the observable Mark lost);
      - the chosen precedence, stated positively — e.g. under B, that the show-changes
        markers (`prose-struck-beneath`, `struck-value`) are ABSENT while recording;
      - a removed-step case, because of BLAST RADIUS 4: a child that removed a step must
        not offer recording controls on it, and must not print a parent-frame numeral;
      - the IngredientTable counterpart, locking in the As made cell inside
        renderShowChangesEntry so the region that is currently right stays right.

- timestamp: 2026-09-16T00:00:00Z
  checked: correction to the reproduction record — `.method-step__uses-line`
  found: |
    `method-step__uses-line` (Method.jsx 282) lives inside StepPenBody, which only exit 1
    (the PLAN pen) renders. It is 0 in the record pen whether or not show-changes is on, so
    the reported "uses-line = 0" is NOT diagnostic of this bug. The real signal is the pair
    that moved: strike-control 10 -> 0 and "done differently" 10 -> 0. Both live in
    StepRecordingControls (Method.jsx ~443-473), inside exit 3.

- timestamp: 2026-09-16T00:00:00Z
  checked: sketch authority — all nine sketches under .planning/sketches/, for the show-changes VIEW as distinct from the show-changes CONTROL
  found: |
    THE COLLISION WAS NEVER DRAWN. Every occurrence of "Show changes" across all nine
    sketches is the CONTROL — the square-and-word toggle whose appearance 008 settled and
    which 001/002/003 place in the front matter. Counts: 001=2, 002=3, 003=2, 007=1,
    008=10, others 0 — and 007's single hit is only "the same target as the checkbox and
    Show changes", a touch-target note. Sketch 007 owns the record pen (phase 03.3.1 is
    "the record pen rebuilt from sketch 007") and never draws show-changes on.

    003-front-matter-rows:484 says so in its own words:

        // the square carries the state; the strikes themselves are not drawn in this sketch

    And no sketch anywhere draws a removed step in the method: grep for `li.removed` /
    `.removed` across all nine index.html files returns nothing.

    THE INK COLLISION IS ALREADY IN THE DESIGN LANGUAGE, not just in the app. Three
    consumers of `--rule-strike` in 003, all `text-decoration: line-through` at the
    identical thickness:

        39   .strike                      -> the "was" value (show changes)
        137  td .was                      -> the "was" cell  (show changes)
        174  .method li.skipped .lead/... -> skipped         (record pen)

    So "removed from the parent" and "I skipped this" already claim the same ink at the
    same weight in the same sketch file. Option C cannot be drawn from the existing
    vocabulary; it needs a second mark invented. This is why the decision is a sketch
    question and not a code question — and it is consistent with the AND-gate root cause:
    two states that were never drawn together were never reconciled in code either.

## Eliminated

- hypothesis: a regression introduced by quick task 260916-ch0 (the CSS/token change whose UAT found it)
  why: |
    That task's four commits (1bcd9de, 57a6b2f, 6a8b44a, f79791c) touch tokens.css,
    app.css, VersionRow.jsx (one className: `text-toggle` added) and three test files.
    No rendering logic, and neither Method.jsx nor RecipePage.jsx appears in the diff.
    The controls are absent from the DOM entirely (count 0), not merely styled invisible,
    so no CSS change could produce this.

- hypothesis: the controls are present but hidden by the new touch/40-44px CSS
  why: |
    Measured in the live DOM: `document.querySelectorAll('.method-step__strike-control').length`
    is 0 in the broken state and 10 in the working one. They are not rendered, not hidden.

## Open decision — Mark's call, do not settle it in code

The mechanism is clear; the CORRECT BEHAVIOUR is a product decision and must not be
picked silently by an agent (project constraint: "Neither framework may resolve an open
decision by running first"; D12 keeps open labels open).

The candidates, as CORRECTED by the blast-radius evidence above:

  A. Opening a pen turns Show changes OFF.
     Code: `handleStartRecording` and `handleStartAmending` delete the `changes` key.
     Cost: BLAST RADIUS 5 — it must use `{ replace: true }`, not the page's existing default
     push, or the Back button restores `?changes=` without closing the pen and drops the
     maker straight back into the broken state with no in-pen control to escape. That
     contradicts the deliberate comment at RecipePage 567-569, so the exception needs
     stating. It also silently discards a view the maker asked for, page-wide — the table's
     diff cells and the six balance rules go too, though those work fine today.
     Refined question: is losing the diff from the WHOLE page (table and balance rules
     included, which are not broken) an acceptable price for the simplest fix?

  B. Recording out-ranks the diff view — in the Method only.
     Code: `isShowingChanges` gains `mode !== 'recording'`, AND RecipePage 1744 must yield
     `readingVersion.method` while recording.
     Cost: NOT the one-liner it was filed as. BLAST RADIUS 4 shows the one-line version is
     unshippable — a removed step would render in the record pen as a live, numbered,
     recordable step. Two files, not one.
     Its original question is now ANSWERED and is no longer a cost: BLAST RADIUS 2 and 1
     show the diff does NOT vanish from the page. The balance rules keep their per-figure
     deltas and the table keeps its grams/share/total diff cells while recording. Only the
     method's prose yields — the one region where the two inks would fight.
     Refined question: is "the method reads clean while you record, the table and the rules
     still show what changed" a coherent thing to say to a maker, or is a page that shows
     the diff in two regions and not the third worse than showing it in none?

  C. Both are shown, in the method too.
     Code: render StepRecordingControls inside the show-changes branch as well, behind one
     named predicate — structurally identical to what IngredientTable already does with
     `hasAsMadeLayer` at 396/483.
     Cost, and this is the real one: the ink collides. The show-changes branch strikes a
     step's own prose to mean "removed from the parent" (Method 684-687) and the recording
     controls strike the SAME prose to mean "I skipped this" (744-755). Two different facts,
     one mark, on one line — which is precisely the rule the file's own comment at 649-653
     was written to protect. The table escapes this because its As made layer is a separate
     COLUMN; the method's would be the same ink.
     Correction to its earlier dismissal: "almost certainly wrong" was written without
     knowing the app already does exactly this one region over, and does it correctly. C is
     the app's established precedent, not a novelty. What makes it hard in the method is the
     shared strike, not the principle.
     Refined question: is there a second mark for "skipped" that does not collide with
     "removed" — or does the method simply have no room for both claims at once?

Related: whichever is chosen, today Show changes is not rendered while a pen is open
(VersionRow 205, confirmed at source), so the maker cannot toggle it off from inside the
broken state. Under A that becomes moot. Under B or C it stays a live, separate question:
should the toggle be reachable from inside the pen?

## Resolution

root_cause: |
  CONFIRMED against the source.

  Method.jsx's `steps.map` has three exits and the recording controls live only in the
  third. The guard at Method.jsx:552

      const isShowingChanges = !isDeveloping && showingChanges && changeDiff != null;

  yields to the PLAN pen (`!isDeveloping`) and says nothing about the RECORD pen — `mode`
  does not appear in it. So with `showingChanges` true and `changeDiff` non-null, the map
  returns the read-only diff JSX at Method.jsx:646-730 and Method.jsx:770
  `{mode === 'recording' && <StepRecordingControls .../>}` is never evaluated. The pen is
  open (mode is 'recording', Save batch renders from PenFoot) but every per-step recording
  control is absent from the DOM.

  The two states can coexist because nothing reconciles them: `showingChanges` is URL state
  (RecipePage:571), `mode` is React state (RecipePage:584), and neither
  `handleStartRecording` (992-1008) nor `handleStartAmending` (1181-1202) clears the
  `changes` key.

  This is an omission at 03-04, not a precedence decision: the sibling region solves the
  same collision correctly. IngredientTable carries the identical guard (387) but renders
  its live AsMadeCell inside the show-changes branch too (483-487), so the table stays fully
  operational in the exact state where the method dies. The page is internally inconsistent
  today.

  Contributing condition (AND-gate: yes, two conditions must hold together): the branch
  omission alone would be recoverable if the maker could turn Show changes off — but
  VersionRow:205 hides the toggle behind `openPen === null`, so there is no escape hatch
  from inside the pen. Branch collision AND no in-pen toggle together are what make the
  state unusable rather than merely surprising.
fix: |
  NOT APPLIED. Blocked on a SKETCH, not merely on a decision (Mark, 2026-09-16).

  The A/B/C choice turns on a mark that does not exist yet: show-changes and skipped both
  render `line-through` at `--rule-strike` today, and the show-changes view of the method
  has never been drawn in any sketch. Project constraints: "Neither framework may resolve
  an open decision by running first"; Impeccable owns design decisions and GSD phases
  consume approved surface briefs; the sketch is the single authority.

  What the sketch has to answer, in the order that unblocks code:
    1. Does the method show the diff at all while a record pen is open? (This IS A vs B.)
    2. If yes (C), what is the second mark, given line-through is taken twice over? The
       ingredient table already coexists both states correctly by putting As made in a
       separate COLUMN — the method has no column to spend, so it needs a different answer.
    3. Should Show changes be reachable from inside an open pen? (VersionRow:205 hides it
       behind `openPen === null` — this is the second half of the AND-gate root cause, and
       it is a drawable question: where does the toggle sit when the acts group is gone?)

  Suggested home: a new sketch 010, not an amendment to 007. 007 is "pending" and owns the
  record pen at rest; this is a cross-state between two regions 007 does not cover, and
  003 (which owns the method's strikes) is settled. Precedent for splitting rather than
  amending: 009-wide-touch was given its own sketch to keep 007/008 pinned.
verification: (pending a chosen behaviour)
files_changed: []
