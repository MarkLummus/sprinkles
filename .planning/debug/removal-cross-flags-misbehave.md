---
status: diagnosed
trigger: "G-03-3 — In the pen, the removal cross-flags between rows and method steps misbehave in three ways: a step flagged by a removed row shows its live edit fields with a struck copy beneath; removing step 1 flags none of the two rows it uses; removing step 2 flags its rows but each flagged row's step selector then shows Step 1 as selected."
created: 2026-09-07T00:00:00Z
updated: 2026-09-07T00:00:00Z
---

## Current Focus

hypothesis: three independent root causes, all confirmed by direct render observation
test: complete — see Evidence
expecting: n/a, diagnosis returned to caller (goal: find_root_cause_only)
next_action: none — hand the three root causes to plan-phase --gaps; symptom 2 needs a
  product decision from Mark before any code moves

bug_class: Bohrbug (all three deterministic, reproduce on every render of the same state)

reasoning_checkpoint:
  hypothesis: |
    S1: the struck-beneath copy is the pen's diff device reused as the removed-marker;
        when a step is removed with its text untouched, textFrom is character-identical
        to the live field values, so the same sentence renders twice.
    S2: orphanedRows correctly implements the brief's rule ("every row it used that no
        remaining step uses"); step 8 still uses both of step 1's rows, so nothing flags.
        The fault is the specified rule vs the maker's expectation, not the code.
    S3: the <select> is bound to draftRow.step (2) while its options come from
        activeSteps (1,3,4…), so no option matches and React's updateOptions selects the
        first option instead.
  confirming_evidence:
    - "Rendered markup: row-09 removed alone produces NO .prose-struck-beneath (evidence 3)"
    - "Rendered markup: row-09 + step 1 removed produces .prose-struck-beneath whose text is byte-identical to the live input/textarea values (evidence 4)"
    - "uses.test.js:54 asserts orphanedRows === [] for a removed step 1, with the reason in its own title (evidence 6)"
    - ".impeccable/surfaces/route-recipe-version.md:41 specifies 'every row it used that no remaining step uses' (evidence 7)"
    - "react-dom 19.2.8 updateOptions falls back to the first non-disabled option when no option matches (evidence 8, read from node_modules source)"
    - "Rendered markup: no <option value=\"2\"> exists once step 2 is removed (evidence 9)"
  falsification_test: |
    S1 would be wrong if the struck copy appeared with only the row removed — it does not.
    S2 would be wrong if step 1 were special (an off-by-one or falsy check on n===1) —
      removing step 2 shows the same partial behaviour (3 of its 5 rows flag), so it is not.
    S3 would be wrong if the select's value matched a rendered option — it does not.
  fix_rationale: |
    S1: the removed-marker must not reuse the changed-text device; the '(removed)' label
        alone already carries the fact. S2: the rule itself, or the absence of any cue for
        the "still used elsewhere" case, is the cause — not the derivation. S3: the option
        list and the bound value must come from the same set, or the mismatch must be shown.
  blind_spots: |
    Not observed in a real browser (no jsdom in this workspace, no browser available);
    S3's fallback is read from the shipped react-dom source and from the absence of a
    matching <option> in SSR markup, both of which are decisive but not a screenshot.
    The user's exact tap sequence for S1 is inferred (see evidence 5) — two independent
    routes to the same visual were found, so the finding holds either way.
  candidate_causes:
    - "code — Method.jsx forced-strike rule (S1)"
    - "code — IngredientTable.jsx select value/options mismatch (S3)"
    - "config/spec — the surface brief's own definition of the orphaned-row rule (S2)"
    - "data — the seed's `uses` lists put row-03/row-09 in two steps each (S2's trigger)"
  and_gate: |
    yes for S2: it needs BOTH the brief's 'no remaining step uses it' rule AND seed data
    where a row is used by two steps. Either alone would not produce the silence.
    S1 and S3 are each single-cause.

## Symptoms

expected: |
  Removing a row flags every non-removed step whose `uses` names it, and that step
  stays a single editable form (its lead-in and instruction fields, with the row-side
  cross-flag note and a remove-this-step control, and no duplicated struck copy of the
  same text beneath the live fields). Removing a step flags every still-active row it
  used, for any step including step 1. A flagged row keeps its own step allocation;
  its step selector never changes to a different step, and never shows Step 1 as
  selected when the row's step was 2. No cascade: nothing is removed automatically
  (route-recipe-version.md § 3, 03-CONTEXT D-10).
actual: |
  User reported: "when I removed the Soy Lecithin row, I see a note under the step 1
  and a 'remove this step' button. The free form text edit boxes for the Lead-in and
  Instruction are still shown with the original text and there is a strike-thru version
  beneath them, which looks odd. when I removed step 1, neither ingredient row is
  flagged (there are 2 ingredients checked). when I removed step 2, the flags appeared
  (with a remove this row button) in the ingredient column, but the step selector for
  the row now shows Step 1 as selected, which is wrong."
errors: None reported
reproduction: |
  Test 3 in UAT — open `/recipe/olive-oil-ice-cream-v1`, click "Develop the next version";
  (1) remove the Soy lecithin row and look at the step that uses it;
  (2) restore it, remove step 1 (which has two rows checked in its uses list) and look at
      the ingredient rows;
  (3) restore step 1, remove step 2, look at the flagged rows' step selectors.
started: Discovered during Phase 3 UAT on 2026-09-07. Cross-flags built in plan 03-02
  (commits 3dc7812, 578f0b8).

## Eliminated

- hypothesis: "Symptom 2 is an off-by-one or a falsy check on step number 1 — `if (step.n)`
    or an index-vs-n confusion — so step 1's uses are never read."
  evidence: "Removing step 2 shows the identical partial behaviour: of its five used rows
    (row-10, row-11, row-12, row-05, row-01) only the three gums flag; row-05 (sucrose)
    and row-01 (whole milk) do not, because step 3 still uses them. Step 1 is not special;
    the rule is uniform. Also `orphanedRows` reads `step.uses` via a for-of over
    `version.method` with no numeric test anywhere (uses.js:45-57)."
  timestamp: probe run 1

- hypothesis: "Symptom 1's struck copy is caused by removing the ROW — the cross-flag path
    itself sets or implies textChanged."
  evidence: "Rendered markup with only row-09 removed contains no `.prose-struck-beneath`
    at all, and buildDiff reports textChanged:false for all ten steps. The struck copy
    requires either `draftStep.removed` or a genuine text change."
  timestamp: probe run 1 (scenario A)

- hypothesis: "Symptom 3 is a state bug — removing step 2 rewrites the row's step to 1."
  evidence: "`handleTogglePenStepRemoved` (RecipePage.jsx:653) touches only
    `prev.method`; it never writes `prev.rows`. React's option fallback mutates the DOM
    only and fires no onChange, so `penDraft.rows['row-10'].step` stays 2 — confirmed by
    the absence of a `.struck-value` beside the select (`changed = draftRow.step !==
    row.step` is false). The DATA is intact; only the DISPLAY is wrong."
  timestamp: probe run 1 (scenario C)

## Evidence

- timestamp: 1
  checked: "app/src/domain/uses.js — all four exported functions"
  found: "`orphanedRows` = non-removed rows used by ≥1 removed step and by NO non-removed
    step. `removedRowsUsedBy(version, step)` does not test `step.removed`, so it also
    answers for a step that is itself removed."
  implication: "The 'no remaining step uses it' rule is deliberate and central to S2; the
    missing `step.removed` guard is a separate, smaller defect (see evidence 10)."

- timestamp: 2
  checked: "Seed `uses` lists in app/src/data/olive-oil.js"
  found: "step 1 uses ['row-09','row-03']; step 8 uses ['row-03','row-09'] — the same two
    rows. step 2 uses ['row-10','row-11','row-12','row-05','row-01']; step 3 uses
    ['row-05','row-04','row-07','row-08','row-01','row-02'] — sharing row-05 and row-01."
  implication: "Every row step 1 uses is also used by step 8, so removing step 1 can never
    orphan anything under the current rule. Removing step 2 orphans exactly the three gums."

- timestamp: 3
  checked: "Rendered markup of Method in developing mode with only row-09 removed
    (renderToStaticMarkup, real seed data, RecipePage's own draftVersion construction)"
  found: "Step 1 renders: live Lead-in input, live Instruction textarea, uses checkboxes,
    then `<p class=\"method-step__flag\">uses Soy lecithin, which is removed <button>remove
    this step</button></p>`, then the plain `remove` button. NO `.prose-struck-beneath`."
  implication: "The flag half of symptom 1 is correct. The struck copy is not produced by
    row removal — a second tap is required."

- timestamp: 4
  checked: "Same render with row-09 removed AND step 1 removed"
  found: "`<input value=\"Lecithin into the oil\"/>` and `<textarea>Whisk 1.2 g soy
    lecithin into the 40 g of Drizzle. Cover, leave at room temperature.</textarea>`,
    immediately followed by `<p class=\"prose-struck-beneath\"><b>Lecithin into the
    oil.</b> Whisk 1.2 g soy lecithin into the 40 g of Drizzle. Cover, leave at room
    temperature.</p>` — character-identical text, rendered twice."
  implication: "Exact match for the reported visual. Root cause of S1 is Method.jsx:72
    `const showStruckBeneath = stepDiff.textChanged || draftStep.removed;` — the
    struck-beneath device exists to show the PARENT's text when the text CHANGED, and is
    reused as the removed-marker where the text has not changed, so it duplicates."

- timestamp: 5
  checked: "Whether a second route reaches the same duplicated-text visual without any
    step being removed"
  found: "Yes, two of them. (a) Touching the Aside textarea on a step that has no `aside`
    (step 1 has none) writes `''`; buildDiff compares `(step.aside ?? null) !== null`, so
    `'' !== null` → textChanged true → the identical lead-in/instruction pair renders
    struck beneath itself even though no visible text moved. (b) Editing only Purpose or
    only Aside always strikes the lead-in and instruction beneath the live fields, because
    the struck-beneath block prints only `textFrom.leadIn`/`textFrom.instruction`
    regardless of which of the four fields actually changed."
  implication: "S1's visual is reachable by a stray keystroke, not just by removing a step
    — so the fix must address both the removed-marker reuse (Method.jsx:72) and the
    empty-string-vs-undefined comparison (diff.js:119-123)."

- timestamp: 6
  checked: "app/src/domain/uses.test.js:54"
  found: "An existing passing test: `it('returns [] when step 1 is removed, because step 8
    still uses the lecithin row', ...)` asserting `orphanedRows(version)` equals `[]`."
  implication: "S2's behaviour is not a regression and not an accident — it is asserted.
    Any fix must change the test and the brief together, or leave both and change the UI."

- timestamp: 7
  checked: ".impeccable/surfaces/route-recipe-version.md:41 (the surface brief)"
  found: "'removing a step flags every row it used **that no remaining step uses**, in
    words beside the row's name, with \"remove this row\" offered there.'"
  implication: "Code, unit test and brief all agree. The UAT truth ('flags every
    still-active row it used, regardless of which step it is') contradicts the brief. This
    is a product decision, not a defect to be silently coded around."

- timestamp: 8
  checked: "app/node_modules/react-dom/cjs/react-dom-client.development.js, `updateOptions`
    (line ~1775, react-dom 19.2.8 as installed)"
  found: |
    } else {
      propValue = "" + getToStringValue(propValue);
      multiple = null;
      for (i = 0; i < node.length; i++) {
        if (node[i].value === propValue) { node[i].selected = !0; ...; return; }
        null !== multiple || node[i].disabled || (multiple = node[i]);
      }
      null !== multiple && (multiple.selected = !0);
    }
  implication: "When a controlled <select>'s value matches no option, React explicitly
    marks the FIRST non-disabled option selected. It does not blank the control and does
    not fire onChange. This is the exact mechanism of S3."

- timestamp: 9
  checked: "Rendered markup of IngredientTable in developing mode with step 2 removed"
  found: "The Locust bean gum row carries the orphan flag and a select whose options are
    `1,3,4,5,6,7,8,9,10` — there is no `<option value=\"2\">`. `draftRow.step` is 2. No
    `.struck-value` renders beside the select, because `changed = draftRow.removed ||
    draftRow.step !== row.step` is false (2 === 2)."
  implication: "Root cause of S3: `stepOptions = activeSteps(draftVersion)`
    (IngredientTable.jsx:316) excludes the removed step, while `StepCell`'s
    `value={draftRow.step}` (IngredientTable.jsx:104) still names it. Aggravated by the
    strike rule: the row shows Step 1 with no 'was step 2' mark to contradict it."

- timestamp: 10
  checked: "Same render as evidence 4 — the step-side flag after the step is removed"
  found: "`<p class=\"method-step__flag\">uses Soy lecithin, which is removed <button>remove
    this step</button></p>` is still present on the now-removed step, while the step's own
    control below it reads `restore`. Both buttons call the same
    `onTogglePenStepRemoved(step.n)`, so the button labelled 'remove this step' now
    restores it."
  implication: "A third, smaller defect in the same neighbourhood: a toggle mislabelled as
    a one-way action, sitting two lines above its correctly-labelled twin. Cause:
    `removedRowsUsedBy` has no `step.removed` guard (uses.js:33) and Method.jsx:196 does
    not gate the flag on `!draftStep.removed`."

- timestamp: 11
  checked: "The save path, RecipePage.jsx:711-719 (`buildPenFields`)"
  found: "Rows save `step: draftRow.step` — the state value (2), not the displayed one (1)."
  implication: "S3 does not corrupt the save; but the child is stored with a row allocated
    to a step the child removed, and the maker was shown a different number than the one
    that saved. Interacts with G-03-6 (steps do not renumber)."

## Resolution

root_cause: |
  Three independent causes, one per symptom.

  S1 (duplicated struck copy) — app/src/ui/Method.jsx:72
    `const showStruckBeneath = stepDiff.textChanged || draftStep.removed;`
    The struck-beneath paragraph is the pen's CHANGED-TEXT device: it prints the parent's
    lead-in and instruction so the maker can compare them with what they have typed. It is
    reused as the REMOVED marker, where by definition the text has not changed — so it
    prints the same sentence that is already sitting live in the two fields above it.
    Contributing (diff.js:119-123): `(step.aside ?? null) !== textFrom.aside` treats the
    `''` the pen writes on a first keystroke into an absent Purpose/Aside as a change from
    `null`, so a stray keystroke reaches the same duplicated rendering with nothing
    removed; and the struck block prints only leadIn+instruction whichever of the four
    fields moved.

  S2 (removing step 1 flags nothing) — not a code fault. app/src/domain/uses.js:45
    `orphanedRows` implements the surface brief verbatim ("every row it used that no
    remaining step uses"), is asserted by uses.test.js:54, and is correct for this data:
    step 8 uses row-09 and row-03 too. The cause is the conjunction of (a) that rule and
    (b) seed data in which every row step 1 uses is also used by step 8 — and the fact
    that the pen shows the maker nothing at all in that case, so correct silence is
    indistinguishable from broken machinery. The UAT truth statement contradicts
    route-recipe-version.md:41; the two must be reconciled by Mark before code moves.

  S3 (flagged row's selector jumps to Step 1) — app/src/ui/IngredientTable.jsx:316 + :104
    `stepOptions = activeSteps(draftVersion)` drops the removed step from the option list
    while `StepCell` still binds `value={draftRow.step}` to it. React 19's `updateOptions`
    selects the first non-disabled option when nothing matches (verified in the installed
    react-dom source), so every row allocated to the removed step displays "1. Lecithin
    into the oil". No onChange fires, so state and save keep step 2 — the display alone is
    wrong — and the cell's own `changed` test (`draftRow.step !== row.step`) is false, so
    no "was step 2" strike appears to contradict it.

  Also found, same neighbourhood, not in the report:
    (i) the step-side cross-flag and its "remove this step" button persist on an
        already-removed step, where the button now restores it (uses.js:33 has no
        `step.removed` guard; Method.jsx:196 does not gate on `!draftStep.removed`);
    (ii) Method.jsx:221 carries the identical forced-strike rule in the show-changes
        branch (`stepDiff.textChanged || step.removed`), so a saved child's removed step
        prints its unchanged prose twice there as well — the S1 fix must cover both
        branches or they will disagree.

fix: not applied — goal was find_root_cause_only
verification: n/a
files_changed: []
