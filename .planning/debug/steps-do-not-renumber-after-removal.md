---
status: diagnosed
trigger: "G-03-6 — When a method step is removed in the pen, the step numbers of the remaining steps do not renumber; the same holds in the saved child's reading state and in show-changes."
created: 2026-09-07T00:00:00Z
updated: 2026-09-07T00:00:00Z
---

## Current Focus

hypothesis: confirmed — the displayed step number IS the stored `step.n`, verbatim, at every
  one of the thirteen places a step number is rendered, and `n` is simultaneously the
  record's identity key. There is no concept of a display position anywhere in the codebase.
test: complete — see Evidence (renderToStaticMarkup probes against the real seed)
expecting: n/a, diagnosis returned to caller (goal: find_root_cause_only)
next_action: none — hand to plan-phase --gaps. The struck step's numbering in show-changes
  is a design question for Mark, not a builder's choice; the brief is silent on it.

bug_class: Bohrbug (deterministic; the same render of the same state, every time)

reasoning_checkpoint:
  hypothesis: |
    One cause: `step.n` is both the identity of a step and the number printed for it, and
    nothing anywhere computes a position. `activeSteps` is a filter, not a renumbering, so
    the clean reading of a child that removed step 2 prints 1,3,4…10; the pen and
    show-changes keep the removed step in place, so the LIVE steps read 1,3,4…10 with 2
    struck. Renumbering the stored `n` is not available as a fix, because `n` is the key
    buildDiff pairs parent to child on, the key the pen's handlers match on, the value
    `row.step` points at, and the key a batch's `stepChanges` is stored under.
  confirming_evidence:
    - "Probe render, reading of a child with step 2 removed: n-sequence 1,3,4,5,6,7,8,9,10 (evidence 3)"
    - "Probe render, pen and show-changes: 1,2,3,4,5,6,7,8,9,10 — 2 struck, survivors unrenumbered (evidence 3)"
    - "Method.jsx prints `{step.n}` in all three branches (76-78, 225-227, 294-296) — no index, no derived position (evidence 1)"
    - "rows.js activeSteps is `.filter(s => !s.removed)`, documented 'never mutates or reorders' (evidence 2)"
    - "diff.js:163-164 pairs child to parent through `baselineStepByN` — n IS the identity (evidence 5)"
    - "Probe: renumbering n in place makes buildDiff report textChanged for 8 of 9 surviving steps (evidence 6)"
    - "Probe: a saved child keeps 5 rows whose `step`/`splitStep` names the removed step 2 (evidence 7)"
  falsification_test: |
    The hypothesis would be wrong if any render site derived the number from the array
    (an index, a CSS counter, a position map). Every site was read: none does. It would
    also be wrong if `activeSteps` renumbered — it does not; it is one `.filter`.
  fix_rationale: |
    Not applied (find_root_cause_only). The direction that follows from the evidence is a
    derived display number — position among active steps — computed once and threaded the
    way `changeDiff` already is, with the stored `n` never touched. Renumbering `n` is
    ruled out by direct experiment, not by argument.
  blind_spots: |
    No browser was available; every observation is renderToStaticMarkup against the real
    seed through the real components, which is decisive for what is emitted but not a
    screenshot. Whether the struck step in show-changes should keep the parent's number,
    show no number, or show a mark is a DESIGN question the brief does not answer — this
    diagnosis deliberately does not decide it.
  candidate_causes:
    - "code — Method.jsx/IngredientTable.jsx/advisories.js print the stored n with no position map"
    - "code — rows.js activeSteps filters without renumbering (by design, documented)"
    - "data/schema — the seed's `n` field carries two jobs at once: identity and display"
    - "config/spec — route-recipe-version.md never states a numbering rule for a removed step"
  and_gate: |
    no for the reported symptom — one cause (display == stored n, nothing derives a
    position) fully explains all three states. But the FIX has an AND-gate: a display
    renumbering is only correct if the row's `step` reference, the pen's select options,
    the orphan flag, the stale flag and the hydration advisory are all resolved through the
    SAME map. Renumber the display alone and the ingredient table will say "step 2" while
    the method has no step 2 — which is already true today in a saved child (evidence 7).

## Symptoms

expected: |
  When a step is removed, the remaining active steps renumber in sequence in the reading
  state and in the pen; in show-changes the struck step reads in place without the live
  steps skipping a number (whether the parent's numbering must stay legible on the struck
  step is a design question, not a decision for this diagnosis). Step numbers are the
  maker's way of referring to steps ("step 8"), and the ingredient table's step selector
  and the per-step `uses` cross-flags name steps by number, so numbering must agree
  everywhere it appears.
actual: |
  User reported: "when a step is removed, the step numbers don't renumber automatically.
  otherwise pass." (Reported during the show-changes test, test 6.)
errors: None reported
reproduction: |
  Test 6 in UAT — on `/recipe/olive-oil-ice-cream-v1` open the pen, remove a step (say
  step 2), watch the numbering of steps 3 onward; save as a new version; read the child;
  press show-changes.
started: |
  Discovered during Phase 3 UAT on 2026-09-07. Steps carry a stored `n` field in the seed
  (app/src/data/olive-oil.js); `activeSteps` in app/src/domain/rows.js (03-01) filters
  removed steps; the pen for steps landed in 03-02 (app/src/ui/Method.jsx); show-changes
  in 03-04.

## Eliminated

- hypothesis: "The number is an array index or an <ol> counter somewhere, and the bug is a
    stale index in one of the three branches."
  evidence: "All three branches of Method.jsx print `{step.n}` (76-78, 225-227, 294-296),
    and `.method-steps { list-style: none }` (app.css:453) suppresses the browser's own
    counter. The hand-drawn number is the stored field in every state; there is no index
    path to be stale."
  timestamp: probe run 1

- hypothesis: "The fix is to renumber the stored `n` — either on removal in the pen, or on
    save in createChildVersion — so the record and the display always agree."
  evidence: "Direct experiment. Renumbering the survivors of a step-2 removal to 1..9 and
    running `buildDiff(child, parent)` reports `textChanged: true` for 8 of the 9 surviving
    steps: diff.js:163-164 pairs child to parent through `baselineStepByN`, so a renumbered
    step 3 is compared against the parent's step 2 and every step below the removal reads
    as rewritten. It would additionally strand `row.step`/`row.splitStep` (12 rows), the
    pen handlers' `step.n === stepN` matching (RecipePage.jsx:615, 628, 643, 659), and
    SEED_USES (versionLift.js:31). Renumbering the stored key is not available."
  timestamp: probe run 1

- hypothesis: "The reading state is fine and only show-changes is wrong (the user reported
    it during test 6)."
  evidence: "The reading state is the WORST of the three: activeSteps drops the removed
    step and prints 1,3,4,5,6,7,8,9,10 — a visible gap on the page that prints and is made
    from. Two generations of removal compound it: a grandchild that removed step 5 as well
    reads 1,3,4,6,7,8,9,10."
  timestamp: probe run 2

## Evidence

- timestamp: 1
  checked: "app/src/ui/Method.jsx — all three render branches"
  found: "All three print `{step.n}` in `<span className=\"method-step__n\" aria-hidden=\"true\">`
    (76-78 developing, 225-227 show-changes, 294-296 reading), key and anchor on it
    (`key={step.n} id={`method-step-${step.n}`}`, lines 75, 224, 293), and every pen
    aria-label reads `Step ${step.n}, lead-in` / `, instruction` / `, purpose` / `, aside`
    / `, target N, label` (86, 96, 126, 133, 162, 171) plus `Step ${step.n}, what was done
    differently` in the recording branch (337). No index, no counter, no derived position."
  implication: "The displayed number is the STORED n, verbatim, in every state."

- timestamp: 2
  checked: "app/src/domain/rows.js activeSteps; app/src/ui/RecipePage.jsx:252, :286, :828"
  found: "`activeSteps` is `version.method.filter((step) => !step.removed)`, its own docblock
    saying 'Never mutates or reorders the array it is given.' RecipePage:252 builds
    `readingVersion.method = activeSteps(version)`; :828 passes `version.method`
    (unfiltered) while developing or showing changes and `readingVersion.method` otherwise."
  implication: "The clean reading DROPS the removed step and keeps every survivor's original
    n. The pen and show-changes keep the removed step in place. Neither path renumbers."

- timestamp: 3
  checked: "renderToStaticMarkup of Method against the real lifted seed with step 2 removed,
    in all three states (probe, since the workspace has no jsdom)"
  found: |
    READING  n-sequence: 1,3,4,5,6,7,8,9,10
    PEN      n-sequence: 1,2,3,4,5,6,7,8,9,10   (2 struck, survivors unchanged)
    CHANGES  n-sequence: 1,2,3,4,5,6,7,8,9,10   (2 struck, survivors unchanged)
    PEN aria step labels: 1,2,3,4,5,6,7,8,9,10
  implication: "Exact match for the report, in all three states. The reading shows a gap;
    the pen and show-changes show an unbroken 1..10 in which the LIVE steps read
    1,3,4…10 because 2 is struck — the UAT truth's 'live steps skipping a number'."

- timestamp: 4
  checked: "Every place a step number reaches a reader — full grep of src for step.n / .step"
  found: |
    THIRTEEN display sites, all printing the stored n directly:
      Method.jsx:77, :226, :295      the margin number, three branches
      Method.jsx:86,96,126,133,162,171,337  seven aria-labels, "Step {n}, …"
      Method.jsx:75,224,293          id="method-step-{n}" (defined; no link targets it yet,
                                     but 02-PATTERNS.md:420 reserves it for per-step targeting)
      IngredientTable.jsx:403        reading cell `${row.step} + ${row.splitStep}`
      IngredientTable.jsx:101        the pen's struck old allocation `{row.step}`
      IngredientTable.jsx:109        the pen's option label `${step.n}. ${step.leadIn}`
      IngredientTable.jsx:164-165    show-changes `rowDiff.stepFrom` / `stepTo`
      IngredientTable.jsx:48, :201   accessible name "was step 8, now step 6"
      IngredientTable.jsx:231        orphan flag "step {n}, {leadIn}"
      advisories.js:127              "Step {n} targets 85 °C" — derived prose in the margin
  implication: "A display renumbering has a fan-out of thirteen sites across three files
    plus one domain module. Any fix that changes one and not the rest makes the page
    disagree with itself in the maker's own vocabulary."

- timestamp: 5
  checked: "Every place a step number is used as an IDENTITY key"
  found: |
      diff.js:163-164   `baselineStepByN` — the parent↔child pairing for the whole diff
      uses.js:82,94     stepsWithStaleAmounts returns { n }; stepDiffByN keys by n
      RecipePage.jsx:615,628,643,659  every pen handler matches `step.n === stepN`
      Method.jsx:64-67  draftStep / stepDiff / staleEntry all looked up by n
      IngredientTable   `row.step` and `row.splitStep` are foreign keys naming a step's n
      batch.js:115-117  a batch's churn.stepChanges is an object keyed by String(n)
      versionLift.js:31 SEED_USES is keyed by n
      transfer.js:80    validateStep checks removed/uses; it does not validate n at all
  implication: "n carries two jobs at once: identity and display. That was harmless while
    the method was a fixed ten steps — 'adding a step' is explicitly out of scope
    (route-recipe-version.md:69, held objection at :123) — and removal is what split them."

- timestamp: 6
  checked: "What happens if the stored n IS renumbered — the obvious fix, tested directly"
  found: "Renumbering the nine survivors of a step-2 removal to 1..9 and running
    `buildDiff(renumbered, parent)` gives textChanged per n:
    1:false 2:true 3:true 4:true 5:true 6:true 7:true 8:true 9:true"
  implication: "Renumbering the record makes every step below the removal read as rewritten
    in show-changes, because the diff pairs on n. Decisive: the stored n must not move."

- timestamp: 7
  checked: "A saved child's rows after step 2 is removed (createChildVersion, lineage.js:97)"
  found: "`method: structuredClone(penFields.method)` — the removed step is carried into the
    child's record verbatim, `removed: true`, n unchanged; nothing is pruned. The child's
    rows still name step 2: Whole milk=2+3, Sucrose=2+3, Locust bean gum=2, Guar gum=2,
    Lambda carrageenan=2. In the child's CLEAN READING the ingredient table therefore prints
    '2 + 3' and '2' for five rows while the method beside it has no step 2 at all."
  implication: "A second, unreported defect in the same seam, already live in saved data:
    a dangling step reference on the page that prints and is made from. This is the mirror
    of the sibling diagnosis's S3 — there the option list dropped the row's step, here the
    method does. Any renumbering fix must resolve row.step through the same map or the
    disagreement gets worse, not better."

- timestamp: 8
  checked: "Two generations of removal (child removes step 2, grandchild also removes step 5)"
  found: "GRANDCHILD stored: 1 2(removed) 3 4 5(removed) 6 7 8 9 10.
    GRANDCHILD reading n-sequence: 1,3,4,6,7,8,9,10 — two gaps.
    Its show-changes against its own parent renders 2 struck-beneath blocks and 2 'removed'
    labels, i.e. the step the PARENT removed is struck again in the grandchild."
  implication: "Removals accumulate in the record forever and the reading gap compounds with
    them. The grandchild's show-changes also re-strikes a step its parent removed — adjacent
    to G-03-3's finding (ii) about the forced strike, and it means the struck steps in
    show-changes are not only 'what this version removed'."

- timestamp: 9
  checked: "The hydration advisory's step clause (advisories.js:93-130), rendered live"
  found: "Clean: 'Locust bean gum hydrates at 82 °C, above the 69 °C pasteurisation hold.
    Step 2 targets 85 °C.' With step 2 removed the clause disappears entirely, because
    findHydrationStep iterates activeSteps and no other active step reaches 82 °C.
    advisories.test.js:129 asserts `toContain('Step 2')`."
  implication: "A fourth file renders a step number, in derived prose, in the margin — and
    an existing test pins the literal string 'Step 2'. A display renumbering must reach here
    too, and that test must be read as pinning the number the READER sees, not the key."

- timestamp: 10
  checked: ".impeccable/surfaces/route-recipe-version.md — every mention of a step number"
  found: "The brief never states a numbering rule. § 3 says a saved version reads clean with
    'removed rows and steps absent'; § 3 says in show-changes 'removed rows and steps
    reappear whole and struck'; § 6 quotes the advisory as 'step 2 targets 85 °C'; § 3
    describes the maker's own vocabulary — 'lecithin goes in at step 8 and is used by steps
    1 and 8'. Nothing says what number a surviving step wears once an earlier one is gone,
    and nothing says whether a struck step keeps its number."
  implication: "This is a genuine silence in the design, not a contradiction between code
    and brief (unlike G-03-3's S2). The struck step's numbering in show-changes needs a
    decision from Mark; the reading and the pen do not — the maker's expectation there is
    unambiguous and the brief's 'reads clean … absent' supports it."

- timestamp: 11
  checked: "The accessible reading of the number (app.css:453, Method.jsx:76)"
  found: "`.method-steps { list-style: none; }` on an `<ol>`, with the number drawn by hand in
    a `<span … aria-hidden=\"true\">`. The printed number is hidden from assistive tech; the
    only step position AT can report is the `<li>`'s own position in the list."
  implication: "Once a step is removed, the ink and the accessible reading already disagree:
    the child's fourth `<li>` is announced as item 4 of 9 while the ink beside it reads '5'.
    A fix that derives the display number from the active position makes the two agree for
    the first time — worth stating as a reason to prefer that direction."

## Resolution

root_cause: |
  ONE cause, in one sentence: `step.n` is the step's stored identity AND the number printed
  for it, and nothing in the codebase computes a display position — so removing a step can
  only ever leave the survivors' numbers where they were.

  Concretely:
    - app/src/ui/Method.jsx:77, :226, :295 print `{step.n}` — the stored field — in the
      developing, show-changes and reading branches alike, with seven aria-labels and three
      anchor ids built from the same value.
    - app/src/domain/rows.js:23 `activeSteps` is a `.filter`, documented as never reordering.
      It removes an element and renumbers nothing, so RecipePage.jsx:252's clean reading of a
      child that removed step 2 prints 1, 3, 4, 5, 6, 7, 8, 9, 10 — a gap on the page that
      prints and is made from.
    - RecipePage.jsx:828 passes the unfiltered `version.method` while developing and while
      showing changes, so those two states show 1..10 with 2 struck — an unbroken run of
      printed numbers in which the LIVE steps read 1, 3, 4 … 10. That is the "live steps
      skipping a number" the UAT truth names.
    - lineage.js:97 `createChildVersion` deep-clones the method verbatim, so the removed
      step and its n are carried into the child's record and into every later generation:
      a grandchild that also removed step 5 reads 1, 3, 4, 6, 7, 8, 9, 10.

  Why the obvious fix is not available (tested, not argued): renumbering the stored `n`
  makes `buildDiff` — which pairs child to parent through `baselineStepByN` (diff.js:163)
  — report `textChanged` for 8 of the 9 surviving steps, because renumbered step 3 is
  compared against the parent's step 2. It would also strand `row.step`/`row.splitStep`,
  the four pen handlers that match `step.n === stepN`, SEED_USES, and a batch's
  `stepChanges` keys. `n` must stay put.

  Found in the same seam, not in the report, already live in saved data: a child that
  removed step 2 stores five rows whose `step`/`splitStep` still names step 2 (Whole milk
  2+3, Sucrose 2+3, and the three gums), so the child's CLEAN reading prints "2" and "2 + 3"
  in the step column while its method has no step 2. This is the mirror of the sibling
  diagnosis's S3 (there the pen's option list dropped the row's step; here the method does),
  and it is why a display-only renumbering must be threaded through `row.step` as well.

  Design question, for Mark, not for a builder: route-recipe-version.md is silent on what
  number a struck step wears in show-changes. The reading and the pen need no decision.

fix: not applied — goal was find_root_cause_only
verification: n/a
files_changed: []
