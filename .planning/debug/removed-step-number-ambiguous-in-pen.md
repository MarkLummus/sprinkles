---
status: diagnosed
trigger: "G-03-14 — In the pen, a removed method step keeps its number unstruck while the next live step is renumbered to the same number, so two steps both read \"1\" and the coverage cue's \"still used by step N\" reference becomes ambiguous."
created: 2026-09-08T00:00:00Z
updated: 2026-09-08T00:00:00Z
---

## Current Focus

hypothesis: confirmed. Two necessary conditions, both in Method.jsx, produce an
  arithmetically GUARANTEED duplicate numeral: (1) a removed step's number is resolved
  through the BASELINE map while every live step around it is resolved through the
  CURRENT map — two reference frames on one page; (2) both are emitted into the same
  unmarked element (`<span className="method-step__n" aria-hidden="true">`) with the same
  class and no removed/struck variant in CSS. Removing the step at baseline position k
  makes the next live step's current position exactly k, so the two numerals are always
  equal and always adjacent — unless the removed step is the last active one.
test: complete — six renderToStaticMarkup probes against the real seed through the real
  components, covering the pen and show-changes, single/multiple/non-adjacent removals,
  and the already-removed-when-the-pen-opened case
expecting: n/a, diagnosis returned to caller (goal: find_root_cause_only)
next_action: none — hand to plan-phase --gaps. One product ruling is needed from Mark:
  what mark a removed step's margin number wears (D-UAT-4 says "struck" but the word was
  never operationalised onto the number), and whether the pen adopts the same mark as
  show-changes.

bug_class: Bohrbug (deterministic; identical output for identical state, every render)

reasoning_checkpoint:
  hypothesis: |
    The defect is not arithmetic — every number printed is correct under D-UAT-4. It is
    typographic: two different reference frames (the pen's baseline for a removed step,
    the draft's current for every live step) are printed in ONE indistinguishable voice.
    Method.jsx:105-109 `displayNumberFor` falls back current-else-baseline; Method.jsx:146
    (pen) and :320 (show-changes) both render the result into
    `<span className="method-step__n" aria-hidden="true">` with no modifier class, and
    app.css:483-487 defines no removed/struck variant for that class. The collision is
    structural: a step removed at baseline position k is immediately followed by the step
    that now holds current position k.
  confirming_evidence:
    - "PEN removed=[1] margins = [1] 1 2 3 4 5 6 7 8 9 — verbatim the user's 'first 2 steps are numbered 1' (evidence 3)"
    - "PEN removed=[1,2] margins = [1] [2] 1 2 3 4 5 6 7 8 — verbatim 'steps numbers start over at 1 on third step' (evidence 3)"
    - "PEN removed=[1] flag = 'Graza Drizzle and Soy lecithin are still used by step 7' — verbatim the user's 'it says that they are used by step 7, not 8' (evidence 3)"
    - "PEN removed=[1,2] flag = 'Whole milk and Sucrose are still used by step 1' — verbatim the user's third quote (evidence 3)"
    - "Emitted markup for a removed step: <span class=\"method-step__n\" aria-hidden=\"true\">1</span> — byte-identical to a live step's, no class modifier (evidence 2)"
    - "app.css:483-487 .method-step__n carries face/size/tabular-nums only; the file has no .method-step__n--removed / --struck rule anywhere (evidence 4)"
    - "removed=[10] (the LAST step) margins = 1..9 [10] with NO duplicate — the one case that does not collide, confirming the mechanism (evidence 5)"
  falsification_test: |
    The hypothesis would be wrong if the number itself were derived incorrectly (an
    off-by-one, a stale map, the stored key leaking through) — it is not: every numeral
    printed matches D-UAT-4 exactly, verified against the current and baseline maps in
    six configurations. It would also be wrong if the removed step's number carried ANY
    distinguishing markup — a class, an attribute, a character. It carries none.
  fix_rationale: |
    Not applied (find_root_cause_only). The direction that follows: give the removed
    step's margin number the mark D-UAT-4 already names ("keeps the parent number it had,
    struck"), through the existing Strike Rule tokens (--rule-strike, --gap-strike), in
    BOTH the pen and show-changes branches, and give assistive technology the same fact in
    words. The cue's number source needs no change once the mark lands — the mark is
    exactly what makes "step 7" resolve to the one unstruck 7 on the page.
  blind_spots: |
    No browser was available; every observation is renderToStaticMarkup against the real
    seed through the real components — decisive for what is emitted and for which CSS
    class applies, but not a screenshot, so the perceptual strength of a candidate mark is
    untested. Whether a strike, a bracket, a dash, or a different weight is the right mark
    is a DESIGN decision this diagnosis deliberately does not make. Whether the pen must
    match show-changes' treatment is likewise Mark's call: today the pen has NO strike
    anywhere on a removed step (its prose sits in live editable fields), so the mark on
    the number would be the pen's only strike.
  candidate_causes:
    - "code — Method.jsx:146/:320 emit the removed step's number into an unmarked element identical to a live step's"
    - "code — Method.jsx:105-109 displayNumberFor blends two reference frames behind one return value with no signal of which frame answered"
    - "config/spec — D-UAT-4's word 'struck' was operationalised onto the step's PROSE (already true from 03-09) and never onto the number; 03-10-PLAN.md:199 explicitly reasoned the margin number is 'decorative and hidden from assistive technology already', so no acceptance criterion required a mark"
    - "test/process — Method.test.jsx:647/:775 collect liveNumbers and removedEntry.marginNumber into SEPARATE assertions and never assert the union is duplicate-free; the guardrail could not see the collision"
    - "data — the seed's ten-step method with every removal candidate followed by another step; only a last-step removal escapes"
  and_gate: |
    YES. The visible ambiguity needs BOTH conditions simultaneously: the cross-frame
    number AND the absent mark. Suppress either and the defect disappears — a removed
    step already renders a BLANK margin when it has no position in either map (evidence 6:
    `1 [(none)] 2 3 …`), and that case is unambiguous today. The specification cause is a
    third contributing condition in a different category: it is why neither of the first
    two was caught by plan, review, or test.

## Symptoms

expected: |
  In the pen, a removed step's number is visibly struck or otherwise marked so it cannot
  be read as the same number as the next live step, and the coverage cue on a removed step
  (03-09's coveredRowsFor "still used by step N") names the covering step by a number the
  reader can find on the page without ambiguity. D-UAT-4 (03-UAT.md:246): "In show-changes
  a struck step keeps the parent number it had, struck; live steps read 1, 2, 3 in their
  new order. n stays immutable identity; display numbers are derived."
actual: |
  User, running UAT test 14 on the churned olive oil version in the pen: "it says that
  they are used by step 7, not 8. remove step 1, first 2 steps are numbered 1. remove
  second step and steps numbers start over at 1 on third step - probably need to strike
  the step number on the removed steps or something else. it says \"Whole milk and Sucrose
  are still used by step 1\" not step 3."
  The arithmetic is consistent with D-UAT-4 (the cue prints derived display numbers). The
  legibility defect is that in the pen the removed step still wears its old number with no
  strike or removed marking on the number itself, so it collides with the renumbered live
  step beside it.
errors: None reported
reproduction: |
  Test 14 in UAT. npm --prefix app run dev, open the churned olive oil version, press
  "Develop the next version", remove step 1, read the margin numbers of step 1 and step 2
  and the cue text on the removed step; then remove step 2 and read again.
started: |
  UAT re-verification after plan 03-10 (64184d0 derived step-position module, 93c5720
  method renumbers on read; struck step keeps its parent number, f36b383 step selector
  keeps a removed step's option) and plan 03-09 (coverage cue in words on a removed step).

## Eliminated

- hypothesis: "The coverage cue names the covering step by the wrong number — an
    off-by-one, the stored key leaking, or the wrong map."
  evidence: "coverageSentence (Method.jsx:19-37) reads displayNumberOf(currentStepNumbers,
    step.n). A covering step is by definition non-removed (stepsUsingRow filters on
    !step.removed, uses.js:25), so it always holds a current position and the fallback is
    never taken. Probe: with step 1 removed the cue reads 'step 7' and old step 8's own
    margin reads 7; with steps 1 and 2 removed the cue reads 'step 1' and old step 3's
    margin reads 1. The cue and the margin agree exactly. Every numeral the cue prints is
    correct under D-UAT-4. The cue is not the fault; it is the first place the collision
    becomes legible as a contradiction, because it is the only text that asks the reader
    to go FIND a numbered step."
  timestamp: probe run 1

- hypothesis: "This is a pen-only defect; show-changes is correct because UAT test 15
    passed on it."
  evidence: "The show-changes branch (Method.jsx:318-322) uses the SAME displayNumberFor
    helper and the SAME unmarked `<span class=\"method-step__n\" aria-hidden=\"true\">`.
    Probe on a saved child rendered against its live parent: child removed step 1 →
    margins 1,1,2,3,4,5,6,7,8,9; child removed steps 1 and 2 → 1,2,1,2,3,4,5,6,7,8 —
    identical sequences to the pen's. Test 15's stated expectation ('the live steps read
    1 to 9 and the struck step reads 2') is literally what D-UAT-4 asks for, so the test
    passed while the collision it produces went unnamed. The defect is live in
    show-changes too and is latent, not absent."
  timestamp: probe run 1

- hypothesis: "The stored key n is leaking through somewhere, so the number is not derived
    at all on a removed step."
  evidence: "Probe with a step already removed in the record the pen opened on: its margin
    renders EMPTY, not its stored key (`1 [(none)] 2 3 4 5 6 7 8 9`). displayNumberFor
    returns null when neither map holds the key, and Method.jsx renders the null as
    nothing. 03-10 removed the stored-key fallback deliberately (03-10-PLAN.md:197). No
    key leaks."
  timestamp: probe run 3

- hypothesis: "A removed step is already distinguishable because it carries the ' removed'
    label — the reader just has to look."
  evidence: "In the PEN the label is `<span class=\"method-step__skipped-label\"> removed</span>`
    at Method.jsx:181 — a sibling of the Instruction textarea, inside
    `.method-step__body`, i.e. in the SECOND grid column (.method-step is
    `grid-template-columns: auto 1fr`, app.css:475-478) and vertically below two form
    fields. The number sits in the FIRST column, at the top. They are in different columns
    and are separated by a text input and a textarea. In show-changes the same label sits
    immediately after the struck prose in the same paragraph — much closer — which is why
    the same collision reads as tolerable there and as broken in the pen."
  timestamp: probe run 1

## Evidence

- timestamp: 1
  checked: "app/src/ui/Method.jsx:105-109, the single number-resolution helper"
  found: |
    function displayNumberFor(step) {
      const current = currentStepNumbers ? displayNumberOf(currentStepNumbers, step.n) : null;
      if (current != null) return current;
      return baselineStepNumbers ? displayNumberOf(baselineStepNumbers, step.n) : null;
    }
    RecipePage.jsx:469-470 supplies the maps: current from the DRAFT method while
    developing (a removed step is absent by construction), baseline from `version.method`
    — the record the pen opened on, where the just-removed step is still active.
  implication: "A removed step's number necessarily comes from the baseline frame and a
    live step's from the current frame. The helper returns a bare integer; nothing in the
    return value, and nothing at the call sites, records which frame answered."

- timestamp: 2
  checked: "The emitted markup for a removed step's margin number, pen branch"
  found: |
    <li id="method-step-1" class="method-step">
      <span class="method-step__n" aria-hidden="true">1</span>
      <div class="method-step__body">
        <label class="method-step__field"><span>Lead-in</span>
          <input type="text" class="ink-field" aria-label="Removed step, lead-in" value="Lecithin into the oil"/></label>
        <label class="method-step__field"><span>Instruction</span>
          <textarea class="ink-field" rows="2" aria-label="Removed step, instruction">Whisk 1.2 g soy lecithin…</textarea></label>
        <span class="method-step__skipped-label"> removed</span>
        …
    The margin span is byte-for-byte what a live step emits (Method.jsx:146-148 for the
    pen, :320-322 for show-changes) — same tag, same single class, same aria-hidden, no
    modifier, no data attribute, no bracket or dash in the text node.
  implication: "There is nothing for CSS or for a reader to hook. The removed step's
    number and the live step's number are the same object typographically."

- timestamp: 3
  checked: "renderToStaticMarkup of Method in the pen against the real lifted seed
    (app/src/data/olive-oil.js), removals applied to the draft only"
  found: |
    (removed steps shown in [brackets])
    removed=[1]    margins = [1] 1 2 3 4 5 6 7 8 9
                   flag    = "Graza Drizzle and Soy lecithin are still used by step 7"
    removed=[2]    margins = 1 [2] 2 3 4 5 6 7 8 9
                   flag    = "Whole milk and Sucrose are still used by step 2"
    removed=[1,2]  margins = [1] [2] 1 2 3 4 5 6 7 8
                   flags   = "Graza Drizzle and Soy lecithin are still used by step 6";
                             "Whole milk and Sucrose are still used by step 1"
    aria-labels on the removed step = "Removed step, lead-in", "Removed step, instruction",
                             "Removed step, target 1, label", …, "Removed step, aside"
  implication: "Exact, verbatim match for all three of the user's quotes. removed=[1]
    reproduces 'first 2 steps are numbered 1' AND 'they are used by step 7, not 8';
    removed=[1,2] reproduces 'steps numbers start over at 1 on third step' AND the exact
    sentence 'Whole milk and Sucrose are still used by step 1'. Every numeral is correct
    under D-UAT-4; only the marking is missing."

- timestamp: 4
  checked: "app/src/styles/app.css and app/src/styles/tokens.css — every strike treatment"
  found: |
    app.css:483-487  .method-step__n { face-grotesk; size-figure-value; tabular-nums }
                     — no text-decoration, no modifier rule anywhere in the file.
    app.css:370-374  .struck-value { line-through; thickness var(--rule-strike);
                     margin-right var(--gap-strike) }  ← the app's one Strike Rule,
                     documented at :366-369 as "one stroke for every 'not in force'
                     meaning across the app — a skipped step, a superseded value, a
                     removed row or step — so no builder adds a fourth."
    app.css:381-388  .prose-struck-beneath — the below-placed form of the same rule.
    app.css:529-531  .method-step__prose--struck { line-through } — on the PROSE only.
    tokens.css:77-78 --rule-strike: 1.2px;  --gap-strike: var(--gap-hair);
  implication: "The Strike Rule and its tokens already exist and already name 'a removed
    step' as one of the meanings they carry. The one place that meaning is not applied is
    the number. A fix reads through --rule-strike/--gap-strike with no new token, which
    satisfies the project's every-visual-value-through-a-token convention."

- timestamp: 5
  checked: "Non-adjacent and multiple removals, to establish whether the collision is
    incidental or structural"
  found: |
    removed=[5]      margins = 1 2 3 4 [5] 5 6 7 8 9        ← duplicate 5, adjacent
    removed=[1,5]    margins = [1] 1 2 3 [5] 4 5 6 7 8      ← 1 twice; 5 twice, NON-adjacent
    removed=[2,5]    margins = 1 [2] 2 3 [5] 4 5 6 7 8
    removed=[1,2,5]  margins = [1] [2] 1 2 [5] 3 4 5 6 7    ← 1, 2 and 5 each twice
    removed=[10]     margins = 1 2 3 4 5 6 7 8 9 [10]       ← NO duplicate
  implication: |
    The collision is arithmetically guaranteed, not incidental: removing the step at
    baseline position k leaves every earlier step's position untouched and shifts the next
    live step into current position k, so the two numerals are always equal. The single
    exception is removing the LAST active step, where no step follows to inherit k. This
    is what makes the cue genuinely ambiguous rather than merely confusing: in
    removed=[1,5] the struck 5 and the live 5 are four rows apart, so a cue reading "still
    used by step 5" has two candidates on the page and no way to choose between them.

- timestamp: 6
  checked: "A step already removed in the record the pen opened on (a second-generation
    removal), still removed in the draft"
  found: |
    already-removed=[2], nothing new removed   margins = 1 [(none)] 2 3 4 5 6 7 8 9
    already-removed=[2], then remove step 5    margins = 1 [(none)] 2 3 [4] 4 5 6 7 8
  implication: "The pen already renders TWO different treatments for a removed step's
    number side by side: an empty margin for one removed before the pen opened, and an
    unmarked baseline number for one removed in this session. The empty case is
    unambiguous today — which is direct evidence that suppressing OR marking the number
    resolves the defect, and evidence that the current design has no single rule for what
    a removed step's margin says."

- timestamp: 7
  checked: "app/src/ui/Method.jsx:19-37 — coverageSentence, the cue's exact wording and
    number source"
  found: |
    Wording: `${rowNames} ${verb} still used by ${stepNames}` where verb is 'are' for more
    than one row and 'is' for one; rowNames and stepNames are joined by joinWithAnd
    ("A, B and C"); each step name is the literal `step ${N}`; groups (rows sharing an
    identical set of covering steps) are joined with '; '.
    Number source: `displayNumberOf(currentStepNumbers, step.n)` — line 22 for the grouping
    key, line 31 for the printed text. The CURRENT map only; no baseline fallback, and none
    is needed since stepsUsingRow (uses.js:25) filters on !step.removed, so a covering step
    always holds a current position. The component's own comment at :16-18 states this.
    Rendered at Method.jsx:294-296, gated on `draftStep.removed && coveredRows.length > 0`.
  implication: "The cue is correct and needs no change to its number source. It is the
    victim, not the cause: it is the only text on the page that asks the reader to locate
    a numbered step, so it is where the duplicate numeral becomes an error rather than a
    curiosity."

- timestamp: 8
  checked: "Every site that prints a step number today (the thirteen from
    steps-do-not-renumber-after-removal.md evidence 4, re-read at current line numbers),
    and whether each carries a struck or removed treatment"
  found: |
    CARRIES A REMOVED/STRUCK TREATMENT
      Method.jsx:117-119  fieldLabel → "Removed step, {name}" — marks removal IN WORDS but
                          DROPS the number entirely; a screen-reader user learns the step
                          is removed and never learns which step it was.
      Method.jsx:181      `<span class="method-step__skipped-label"> removed</span>` — pen;
                          a sibling of the fields, in the body column, NOT the margin.
      Method.jsx:335,338  show-changes: `.method-step__prose--struck` on the prose plus the
                          same " removed" label, both inside `<p class="method-step__lead">`.
      IngredientTable.jsx:159-163  option label → `${N}. ${leadIn} (removed)` plus
                          `disabled` — number present and UNMARKED, the word at the end.
      IngredientTable.jsx:310-320  orphan flag → "used by step {N}, {leadIn}, which is
                          removed" — number present and UNMARKED, the word at the end.
      IngredientTable.jsx:145      `<span class="struck-value">{baselineStepDisplay}</span>`
                          — a genuine strike, but only when `changed` is true, which is
                          FALSE for a row whose step was removed without the row being
                          touched (draftRow.step === row.step). Never fires for this bug.
    CARRIES NO TREATMENT AT ALL
      Method.jsx:146-148  the pen's margin number          ← the defect
      Method.jsx:320-322  show-changes' margin number      ← the same defect, latent
      Method.jsx:31       the coverage cue's "step {N}"    ← names a live step, correct
      IngredientTable.jsx:147,462  the split-step reference `+ {N}`
      IngredientTable.jsx:223-224,273-274  show-changes "was step X, now step Y"
      IngredientTable.jsx:519      the reading state's step column (a removed step's
                          reference reads `unallocated`, so no collision there)
      advisories.js:131   "Step {N} targets {value}." — names a live step, correct
      Method.jsx:145,319,398  id="method-step-{n}" — the stored key, correctly unchanged
  implication: "The removed marker exists at five sites and is absent at the two that
    matter most. Where it exists it is a WORD placed after or below the number, never a
    mark ON the number — so no site currently demonstrates the treatment D-UAT-4 asks for,
    and a fix has no precedent to copy inside this codebase."

- timestamp: 9
  checked: "The step selector's option list, rendered in the pen with step 2 removed
    (IngredientTable.jsx:158-165)"
  found: |
    <option value="2" disabled>2. Gum slurry — the only high-heat step (removed)</option>
    <option value="3">2. Build the base</option>
    …and with step 1 removed:
    <option value="1" disabled>1. Lecithin into the oil (removed)</option>
    <option value="2">1. Gum slurry — the only high-heat step</option>
    Also: whole milk (step 2, splitStep 3) with step 2 removed renders its select showing
    "2. Gum slurry … (removed)" with `+ 2` beside it — resolveStepNumber gives the removed
    primary its baseline 2 and the live splitStep its current 2. The cell reads "2 … + 2".
  implication: "The same duplicate numeral reaches a SECOND surface, and there it is worse:
    the reader must scan to the end of a long label to find '(removed)'. The '2 … + 2'
    cell is a self-contradiction inside one cell — two different steps, both numbered 2,
    six characters apart. Any fix to the margin number must reach these sites or the page
    will still disagree with itself."

- timestamp: 10
  checked: "app/src/ui/Method.test.jsx:583-600, 640-680, 770-810 — the guardrail 03-10 left"
  found: |
    extractStepEntries builds { stepKey, marginNumber, removed } where `removed` is read
    from `body.includes('method-step__skipped-label')` — the LABEL, never the number's own
    markup. The assertions are:
      :647  const liveNumbers = entries.filter(e => !e.removed).map(e => e.marginNumber)
      :651  expect(removedEntry.marginNumber).toBe(2)   // "the number it had before removal"
      :775  the same split in the show-changes test
      :779  expect(struckEntry.marginNumber).toBe(2)
    The live set and the removed step are asserted SEPARATELY and their union is never
    checked for duplicates; no test asserts any mark, class, or attribute on the number.
  implication: "This is the 'why not caught'. The tests pin exactly the VALUES D-UAT-4
    specifies and are all correct — the collision they produce is invisible to them by
    construction, because the two halves are never compared. A duplicate-free assertion
    over the union of live and removed margin numbers would have failed on the first run."

- timestamp: 11
  checked: ".planning/phases/03-develop-the-next-version/03-10-PLAN.md — how D-UAT-4's word
    'struck' was carried into the build"
  found: |
    03-UAT.md:246 (the ruling): "In show-changes a struck step keeps the parent number it
      had, STRUCK; live steps read 1, 2, 3 in their new order."
    03-10-PLAN.md:178 (the restatement): "prints … the struck step as two — the number it
      had in the parent — with the struck step's PROSE struck in place as 03-09 left it."
    03-10-PLAN.md:199 (the reasoning that removed the requirement): "The removed label
      carries the meaning; the margin number is decorative and hidden from assistive
      technology already."
    03-10-PLAN.md:346 (the acceptance criterion): "A struck step in show-changes reads the
      number it had in the parent (D-UAT-4)." — value only, no mark.
  implication: "D-UAT-4's 'struck' was read as describing the STEP (already struck by
    03-09) rather than the NUMBER, and the plan then argued the number needs no marking
    because it is decorative and aria-hidden. That argument is sound about assistive
    technology and wrong about the eye: aria-hidden means the collision is invisible to a
    screen reader, not that it is invisible to a reader. This is the specification-layer
    contributing cause, and it is why the ruling must be restated explicitly rather than
    re-derived by a builder."

- timestamp: 12
  checked: "The accessible reading of a removed step in each state"
  found: |
    PEN: the margin number is aria-hidden; the field labels read "Removed step, lead-in"
      etc. — removal stated, position never stated. A screen-reader user cannot tell WHICH
      step was removed except by the <li>'s own list position, which COUNTS the removed
      step (app.css:463 `.method-steps { list-style: none }` on a real <ol>), so AT
      announces "item 2 of 10" where the ink beside it reads 1.
    SHOW-CHANGES: no form fields, so no aria-labels at all; the only accessible signal is
      the visible text " removed" inside the lead paragraph. The number is aria-hidden.
    So in both states the ink says "1" and assistive technology says nothing about the
    number at all, while the <li> position says something different again.
  implication: "The fix should give AT the same fact the mark gives the eye — e.g. the
    removed step's field labels naming the number it had rather than dropping it. That
    also closes the ink/AT disagreement first noted in
    steps-do-not-renumber-after-removal.md evidence 11, which 03-10 closed for live steps
    and left open for removed ones."

## Resolution

root_cause: |
  TWO conditions in conjunction, plus a third that explains why neither was caught. The
  AND-gate fires: suppress either of the first two and the ambiguity disappears.

  CAUSE 1 — Two reference frames, one typographic voice (app/src/ui/Method.jsx:105-109).
    `displayNumberFor(step)` returns the step's position in the CURRENT map, else its
    position in the BASELINE map, else nothing. A live step is therefore always numbered
    in the draft's frame and a removed step always in the pen-baseline's frame, and the
    helper returns a bare integer that records nothing about which frame answered.
    RecipePage.jsx:469-470 builds the two maps.

  CAUSE 2 — The number is emitted unmarked (Method.jsx:146-148 pen, :320-322
    show-changes; app/src/styles/app.css:483-487).
    Both branches render `<span className="method-step__n" aria-hidden="true">` with a
    single class and no modifier, and `.method-step__n` defines face, size and
    tabular-nums only. There is no `--removed` or `--struck` variant of that class
    anywhere in app.css, and the removed step's own marker — `<span
    className="method-step__skipped-label"> removed</span>` at Method.jsx:181 — sits in
    the OTHER grid column (`.method-step` is `grid-template-columns: auto 1fr`,
    app.css:475-478), below a text input and a textarea. Number and marker are neither
    adjacent nor associated.

  WHY THE COLLISION IS GUARANTEED, NOT INCIDENTAL: removing the step at baseline position
    k leaves every earlier step's position untouched and shifts the next live step into
    current position k. The removed step's baseline number and its successor's current
    number are therefore always EQUAL and always ADJACENT. Verified across six
    configurations (Evidence 3, 5): [1]→"[1] 1 2 3…", [5]→"1 2 3 4 [5] 5 6…",
    [1,2]→"[1] [2] 1 2 3…", [1,5]→"[1] 1 2 3 [5] 4 5…". The one non-colliding case is
    removing the LAST active step ([10]→"1…9 [10]"), because no step follows to inherit k.

  CAUSE 3 (specification/process, why it shipped) — D-UAT-4 (03-UAT.md:246) reads "a
    struck step keeps the parent number it had, STRUCK". 03-10-PLAN.md:178 restated that
    as the step's PROSE being struck (already true from 03-09) and :199 then reasoned "the
    margin number is decorative and hidden from assistive technology already", so no
    acceptance criterion (:346) and no test required a mark. Method.test.jsx:647/:775
    collect the live numbers and the removed step's number into SEPARATE assertions and
    never check their union for duplicates, so ten passing tests pin exactly the values
    D-UAT-4 asks for while the collision those values produce is invisible to them by
    construction.

  THE CUE IS NOT AT FAULT. coverageSentence (Method.jsx:19-37) prints
    `{rows} {is|are} still used by step {N}` with N from `displayNumberOf(currentStepNumbers,
    step.n)` — the current map only. A covering step is non-removed by construction
    (uses.js:25 filters on `!step.removed`), so the fallback is never taken and the number
    is always the covering step's live position. Every numeral the user quoted is correct:
    "step 7" is old step 8's new position, "step 1" is old step 3's new position. The cue
    is simply the only text on the page that asks the reader to GO FIND a numbered step,
    so it is where the duplicate numeral stops being a curiosity and becomes an error —
    and in a multi-removal case (removed=[1,5]) the two candidates are four rows apart, so
    it is genuinely unresolvable, not merely startling.

  SAME DEFECT, TWO PLACES NOT IN THE REPORT:
    (i) show-changes is identically affected. Method.jsx:320-322 uses the same helper and
        the same unmarked span; a saved child that removed step 1 renders margins
        1,1,2,3,4,5,6,7,8,9 and one that removed steps 1 and 2 renders 1,2,1,2,3,4,5,6,7,8
        — byte-identical sequences to the pen's. UAT test 15 passed on this state because
        its stated expectation ("the live steps read 1 to 9 and the struck step reads 2")
        is literally D-UAT-4, so the collision went unnamed. It reads as tolerable there
        only because the " removed" label sits immediately beside the struck prose in the
        same paragraph, which the pen's live edit fields make impossible.
    (ii) the ingredient table's step selector carries the same duplicate: with step 2
        removed its option list holds "2. Gum slurry — the only high-heat step (removed)"
        and "2. Build the base", differentiated only by a word at the end of a long label
        (IngredientTable.jsx:159-163). Worse, whole milk and sucrose (step 2, splitStep 3)
        render "2. Gum slurry … (removed)" with "+ 2" beside it — two different steps, both
        numbered 2, inside one cell (IngredientTable.jsx:145-147).

  ALSO OBSERVED: the pen already renders two different treatments for a removed step's
    number side by side — an EMPTY margin for a step removed before the pen opened, and an
    unmarked baseline number for one removed in this session (Evidence 6:
    `1 [(none)] 2 3 4 5 6 7 8 9`). The empty case is unambiguous today. There is no single
    rule for what a removed step's margin says.

  NEEDS A PRODUCT RULING FROM MARK, NOT A BUILDER'S GUESS:
    1. What mark the removed step's margin number wears. D-UAT-4 says "struck"; the app's
       Strike Rule (app.css:366-374, tokens.css:77-78) already names "a removed step" as
       one of its meanings and supplies --rule-strike/--gap-strike, so a strike needs no
       new token. A strike on a single tabular numeral at --size-figure-value is small; a
       bracket, a dash, or a different weight are alternatives the ruling should choose
       between rather than a builder.
    2. Whether the PEN adopts the same mark as show-changes. Today the pen has no strike
       anywhere on a removed step — its prose sits in live editable fields — so the mark
       on the number would be the pen's only strike. Consistency argues for the same mark;
       the pen's different nature argues it might need a louder one.
    3. Whether the previously-removed step's EMPTY margin becomes the general rule instead
       (suppress rather than mark), which would also resolve the ambiguity but discards
       D-UAT-4's "keeps the parent number it had".
    4. Whether the selector's option label and the orphan flag adopt the same mark, or
       keep the trailing "(removed)" word.

fix: not applied — goal was find_root_cause_only
verification: n/a
files_changed: []
