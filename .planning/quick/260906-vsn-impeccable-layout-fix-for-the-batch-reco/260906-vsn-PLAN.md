---
phase: quick-260906-vsn
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/RecipePage.jsx
  - app/src/ui/BatchMargin.jsx
  - app/src/ui/FormulationNote.jsx
  - app/src/ui/GraduatedRule.jsx
  - app/src/ui/BatchMargin.test.jsx
  - app/src/ui/FormulationNote.test.jsx
  - app/src/styles/app.css
  - .impeccable/surfaces/route-recipe-batch.md
autonomous: true
requirements: [UX1-01]

estimate:
  tokens: 78000
  raw_tokens: 39000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "While recording, the churn date is typed in the headnote's \"churned ___\" slot as a pen-blue date field, and focus lands there when the pen layer opens (D-01)."
    - "After saving, the headnote's slot prints the OPEN batch's churn date in pen blue, or \"date unknown\" in pen blue when the record carries no date (D-01)."
    - "Opening an older batch by URL makes the headnote name that batch's churn date, not the version's latest churn (D-02)."
    - "The margin's churn section starts at come-up in both recording and reading; the version's batch list of dates still renders (D-01)."
    - "While recording, the Tab path runs churn date, as-made column, method steps, come-up onward, Save batch, with no graduated rule interrupting it (D-03, D-04)."
    - "A graduated rule stays clickable and keeps its focus treatment while recording (D-04)."
    - "The surface brief records the churn date's new home and the churn section's new start, attributed \"(Mark, 2026-09-07)\" (D-05)."
  artifacts:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/BatchMargin.jsx
    - app/src/ui/FormulationNote.jsx
    - app/src/ui/GraduatedRule.jsx
    - app/src/ui/BatchMargin.test.jsx
    - app/src/ui/FormulationNote.test.jsx
    - app/src/styles/app.css
    - .impeccable/surfaces/route-recipe-batch.md
  key_links:
    - "headnote date input -> handleChangeChurnDate -> draft.churnDate -> handleSaveBatch (the field moved; the save path did not)"
    - "RecipePage openBatch -> the headnote's churn slot, replacing latestChurnDate"
    - "RecipePage mode -> FormulationNote -> GraduatedRule tabIndex"
    - "DOM order: headnote -> ingredient table -> method -> formulation note (skipped while recording) -> margin"
---

<objective>
Fix the first P1 of the 2026-09-07 BatchMargin critique: the ceremony of recording opens in
the wrong place. The churn date moves out of the batch margin into the headnote's
"churned ___" slot, so the pen layer opens where Mark's pen opens — at the top of the
formula page — and one forward Tab runs the sheet's page order to Save batch.

Purpose: make focus and tab order agree with the brief's reading order (UX1-01, and
route-recipe-batch.md § 6's "the tab order follows it").
Output: the churn date in the headnote in both states, the margin's churn section starting
at come-up, the six graduated rules out of the recording tab path, and a revised surface brief.

**Decision IDs** — the five locked decisions handed down with this task, cited as D-01…D-05
throughout:

- **D-01** — The churn date moves into the headnote's version line. While recording it is a
  pen-blue `.ink-field` date input, autofocused, replacing the printed date. When saved the
  slot prints the OPEN batch's churn date in pen blue (`.ink-text`), or "date unknown" in pen
  blue when blank. BatchMargin renders neither a churn date field nor the churn date line in
  reading state; its churn section starts at come-up; the batch list of dates stays.
- **D-02** — The headnote names the OPEN batch's churn date, not the version's latest churn,
  so an older batch opened by URL reads correctly. Keep it minimal.
- **D-03** — DOM order must match the sheet's page order so the recording Tab path runs
  churn date, as-made column, method steps, churn section (come-up onward), Save batch.
  Make the smallest change that achieves it.
- **D-04** — While `mode === 'recording'`, the six GraduatedRule buttons get `tabIndex={-1}`.
  They stay clickable and keep their focus treatment. Thread the smallest prop needed
  through FormulationNote.
- **D-05** — Revise `.impeccable/surfaces/route-recipe-batch.md` §§ 3 and 6 and its Status
  line, attributed "(Mark, 2026-09-07)". Do not rewrite other sections.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@DESIGN.md
@.impeccable/surfaces/route-recipe-batch.md
@.impeccable/critique/2026-09-07T02-41-33Z__app-src-ui-batchmargin-jsx.md
@app/src/ui/RecipePage.jsx
@app/src/ui/BatchMargin.jsx
@app/src/ui/FormulationNote.jsx
@app/src/ui/GraduatedRule.jsx
@app/src/ui/BatchMargin.test.jsx
@app/src/styles/app.css
@app/src/styles/tokens.css
</context>

<interface_context>
Facts established by reading the source before planning — treat these as given, do not
re-derive them:

- `RecipePage.jsx` computes `openBatch` at ~line 125 (URL-named batch, else the most recent
  by `sortedBatches`, else null) and `latestChurn = latestChurnDate(batches)` at ~line 343.
  The headnote's version line is ~lines 350–353.
- `handleChangeChurnDate(value)` (~line 181) writes `draft.churnDate`. `handleSaveBatch`
  (~line 228) converts `draft.churnDate === '' ? null : draft.churnDate`. Neither changes.
- `BatchMargin` receives `onChangeChurnDate` as a prop; its only use is the field at lines
  160–169. Reading state prints `churnDateWords` at line 258, derived at line 247.
- `formatRecordDate(iso)` returns `'D Mon YYYY'`. `latestChurnDate` is exported from
  `app/src/domain/batch.js` and covered by `app/src/domain/batch.test.js` — that export and
  its tests stay; only RecipePage's use of it goes.
- `.ink-field` (app.css ~line 395) sets `width: 100%`, grotesk, `--pen-blue`, a
  `--rule-ink-field` ink border and `border-radius: 0`. `.ink-text` (~line 413) sets
  `color: var(--pen-blue)` only. `.headnote__version` (~line 83) is the text face at
  `--size-version-line`.
- The grid is `grid-template-areas: 'headnote headnote' / 'ingredients side' / 'method side'`
  with `.side-region` holding the formulation note and the margin in one flex column.
- `FormulationNote({ version, onFocusFigure, onBlurFigure })` maps figures to
  `<GraduatedRule figure onFocusFigure onBlurFigure />`. `GraduatedRule` renders one
  `<button type="button" className="graduated-rule">`.
- Focusable elements in DOM order today: headnote (none) → IngredientTable (one as-made
  `<input>` per row, recording only) → Method (a checkbox and an input per step, recording
  only) → FormulationNote (six `.graduated-rule` buttons) → BasisNote (none) → BatchMargin.
- Tests run under Vitest in the `node` environment via `renderToStaticMarkup`
  (`app/vitest.config.js`); there is no jsdom and no testing-library. Do not add either.
- Fixture `augustSecondBatch`: `churnDate` `2026-08-02` → "2 Aug 2026"; `recordedAt`
  `2026-08-04` → "4 Aug 2026"; `versionLabel` `50 g oil · 800 g`. Its batch list only
  renders when more than one batch is passed.
</interface_context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Move the churn date into the headnote's "churned ___" slot</name>
  <files>app/src/ui/RecipePage.jsx, app/src/ui/BatchMargin.jsx, app/src/styles/app.css, app/src/ui/BatchMargin.test.jsx</files>
  <read_first>app/src/ui/RecipePage.jsx, app/src/ui/BatchMargin.jsx, app/src/ui/BatchMargin.test.jsx, and app.css lines 73–95 and 390–420</read_first>
  <behavior>
    BatchMargin.test.jsx, updated (all through the existing `renderMargin` helper and
    `renderToStaticMarkup` — no jsdom, no new dependency):
    - Recording state renders no date input at all: the markup matches no `type="date"`
      and contains no field labelled for the churn date.
    - Recording state's churn section opens at come-up: the index of `Come-up` in the
      markup is less than the index of `Draw temperature`, and both are present.
    - Reading state for `augustSecondBatch` no longer prints `2 Aug 2026` anywhere, while
      still printing `4 Aug 2026` in its recorded-on line.
    - The existing four describe blocks keep passing unchanged in intent; drop the now-absent
      `onChangeChurnDate` from the `renderMargin` prop harness.
  </behavior>
  <action>
Per D-01 and D-02, relocate the churn date from the margin to the headnote's version line.

**RecipePage.jsx — the headnote.** Replace the version line's latest-churn clause with a
slot that reads the open batch, not the version's most recent batch:

- Delete the `latestChurn` constant (~line 343) and remove `latestChurnDate` from the import
  on line 5 — those become orphans of this change and CLAUDE.md § 3 requires removing them.
  Leave the export in `app/src/domain/batch.js` and its domain tests alone.
- Render the slot only when `mode === 'recording'` or `openBatch` is non-null; otherwise the
  version line prints the label alone exactly as it does today when no batch exists. The
  separator character between the version label and the slot lives outside the slot's
  element so it never appears without one.
- While `mode === 'recording'`: the slot is a `<label>` whose visible text is the single
  lowercase word naming the act of churning, followed by an `<input type="date">` carrying
  `className="ink-field headnote__churn-field"`, `autoFocus`, `value={draft.churnDate}`,
  and `onChange` calling the existing `handleChangeChurnDate(event.target.value)`. Wrapping
  the word and the input in one `<label>` makes the visible word the input's accessible
  name — do not add an `aria-label` that would contradict it (UX1-01, WCAG 2.5.3). Do not
  touch `handleChangeChurnDate`, `handleSaveBatch`, or the draft shape: the field moved,
  the save path did not.
- Otherwise (a batch is open): the same word as printed matter, followed by a
  `<span className="ink-text">` holding `formatRecordDate(openBatch.churn.churnDate)`, or
  the two words the margin already uses for an undated record when
  `openBatch.churn.churnDate` is absent. Read that wording off BatchMargin's current
  line 247 rather than inventing a second phrasing.

**BatchMargin.jsx — the churn section now starts at come-up.**

- Recording state: delete the whole `<label className="batch-margin__field">` block at
  lines 160–169 so come-up is the first field. Remove `onChangeChurnDate` from the
  destructured props, and remove the corresponding prop from RecipePage's `<BatchMargin>`
  call. Nothing else in the recording branch changes.
- Reading state: delete the `<p className="ink-text">` at line 258 and the constant derived
  at line 247 that feeds it. Keep the amendment line, every measured row, the recorded-on
  line, the batch list, and every button exactly as they are. Update the block comment above
  the component (lines 132–136) so its stated field order starts at come-up and says the
  churn date now lives in the headnote.

**app.css — one modifier, no literals.** Add `.headnote__churn-field` next to the existing
`.ink-field` rules, overriding only what is needed to let a date input sit inline in a line
of prose instead of filling its container. Add a rule for the wrapping label only if the
slot needs it to stay on one line. Use keywords and existing custom properties from
tokens.css; introduce no literal colour, size, spacing, or rule weight, and add no new
token — this change needs none.

Two things this change deliberately does not do, so they are not mistaken for omissions:
the date input's own picker glyph and the browser-default button treatment are the
critique's separate P2 items and stay untouched; and the field-to-text transition at save
reshapes the slot exactly as every other ink field in the margin already does, which is the
brief's established pattern rather than a violation of "nothing moves" (DESIGN.md scopes
that rule to focus and marking).
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/BatchMargin.test.jsx</automated>
  </verify>
  <done>The headnote's slot holds a pen-blue autofocused date field while recording and the open batch's churn date in pen blue when saved; the margin's churn section starts at come-up in both states; the updated BatchMargin suite passes.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Take the graduated rules out of the recording tab path</name>
  <files>app/src/ui/FormulationNote.jsx, app/src/ui/GraduatedRule.jsx, app/src/ui/RecipePage.jsx, app/src/ui/FormulationNote.test.jsx</files>
  <read_first>app/src/ui/FormulationNote.jsx, app/src/ui/GraduatedRule.jsx, app/src/ui/RecipePage.jsx lines 386–394, app/src/ui/BatchMargin.test.jsx (for the renderToStaticMarkup house style to copy)</read_first>
  <behavior>
    New app/src/ui/FormulationNote.test.jsx, in the same style as BatchMargin.test.jsx
    (`renderToStaticMarkup`, `oliveOilVersion`, node environment, no new dependency):
    - Rendered with `mode="recording"`, every `graduated-rule` button in the markup carries
      a tabindex of -1; the count of such tabindex attributes equals the count of
      `graduated-rule` buttons.
    - Rendered with `mode="reading"`, the markup carries no tabindex attribute at all, and
      the same number of `graduated-rule` buttons still render.
    - Both renderings contain the same set of figure labels, proving the rules are still
      drawn and only their reachability changed.
  </behavior>
  <action>
Per D-04, thread the mode down and set the tab stop off while recording.

- `RecipePage.jsx`: pass the existing `mode` state to `<FormulationNote>`. This matches how
  `IngredientTable` and `Method` already receive it — no new concept.
- `FormulationNote.jsx`: accept `mode` and pass `tabIndex={mode === 'recording' ? -1 : undefined}`
  to each `<GraduatedRule>`. Keeping the ternary here, not in GraduatedRule, leaves the rule
  component ignorant of the pen layer, which it should stay.
- `GraduatedRule.jsx`: accept a `tabIndex` prop and place it on the existing
  `<button className="graduated-rule">`. Passing `undefined` leaves the attribute off
  entirely, so the reading state's markup is byte-identical to today's. Change nothing else:
  the button keeps `type`, `aria-label`, `onFocus`, `onBlur`, its class, and therefore its
  `.graduated-rule:focus` treatment and its click behaviour — a rule stays clickable while
  recording and still marks the ingredient rows it rests on.
- Update the block comment above `GraduatedRule` (or the one above the `<button>`) to say in
  one line why the tab stop is conditional, citing the sheet's page order.

Then confirm D-03 by inspection and record the finding for the SUMMARY. Walk the focusable
elements in DOM order with Task 1 and this task applied: headnote churn date, then the
as-made inputs, then the method's per-step controls, then the six rules (now skipped), then
the margin from come-up to Save batch. That is exactly the locked path, so the smallest
change that makes DOM order agree with it is no change to region order. Do **not** move the
margin or `.side-region` ahead of the method section: that would place the churn section
before the method steps and contradict D-03's own ordering. Write the walked order and this
conclusion into the SUMMARY as the evidence for D-03.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/FormulationNote.test.jsx</automated>
  </verify>
  <done>Every graduated rule carries a tabindex of -1 while recording and none while reading; the rules still render and stay clickable; the new FormulationNote suite passes; the walked DOM order is recorded.</done>
</task>

<task type="auto">
  <name>Task 3: Revise the surface brief and run the full gates</name>
  <files>.impeccable/surfaces/route-recipe-batch.md</files>
  <read_first>.impeccable/surfaces/route-recipe-batch.md lines 10, 44–54, and 97</read_first>
  <action>
Per D-05, revise the brief so it records where the churn date now lives. Edit only these
four places; leave every other section, including §§ 1, 2, 4, 5 and 7, untouched.

1. **Status line (line 10):** append to the existing chain a clause saying the brief was
   revised on 2026-09-07 after the BatchMargin critique. Keep the existing "shaped" and
   "confirmed" clauses verbatim.
2. **§ 3, the Margin bullet (line 48):** the bullet currently opens the churn section with
   the churn date. Rewrite its opening so the churn date lives in the headnote's version
   line — in the slot that already prints the date after the version label — and the margin's
   churn section begins with the measured values, come-up first. Keep the rest of the bullet
   (the unit-on-every-label rule, draw notes, the ingredient-notes line, the next-time note,
   the tasting sections beneath, and the blank-reads-unknown rule) as written. Attribute the
   change "(Mark, 2026-09-07)".
3. **§ 3, "The ceremony" (line 54):** the paragraph currently says the churn section appears
   with the churn date first and focus lands on the date. Rewrite that clause so the
   headnote's slot becomes the writable date field and focus lands there, the churn section
   appears starting at its measured values, and the saved state prints the open batch's date
   in the same slot. Adjust the paragraph's later sentence about the version line so it names
   the open batch's date rather than the latest churn (D-02). Leave the Save batch, snapshot,
   colour-never-changes, and add-a-tasting sentences alone. Attribute "(Mark, 2026-09-07)".
4. **§ 6, the Hierarchy bullet (line 97):** rewrite the hierarchy list and the tab-order
   sentence so both run: the churn date in the headnote, the as-made column, the steps'
   strikes and lines, the churn section from come-up, the tasting section if one is being
   written, save. Add a short clause recording that the graduated rules leave the tab path
   while recording. Attribute "(Mark, 2026-09-07)".

Then run the gates, in this order, and record each result verbatim in the SUMMARY:

- The full suite: `npm --prefix app test`
- The build: `npm --prefix app run build`
- The Impeccable mechanical detector, once, over the four changed UI files:
  `/Users/mark/.claude/skills/impeccable/scripts/impeccable detect --json --scope layout app/src/ui/RecipePage.jsx app/src/ui/BatchMargin.jsx app/src/ui/GraduatedRule.jsx app/src/ui/FormulationNote.jsx`

The detector's result goes in the SUMMARY whatever it says. If it reports a finding on a
line this task did not touch, record it as pre-existing and out of scope rather than fixing
it — CLAUDE.md § 3 binds. If it reports a finding on a line this task did write, fix it and
rerun.
  </action>
  <verify>
    <automated>npm --prefix app test && npm --prefix app run build && /Users/mark/.claude/skills/impeccable/scripts/impeccable detect --json --scope layout app/src/ui/RecipePage.jsx app/src/ui/BatchMargin.jsx app/src/ui/GraduatedRule.jsx app/src/ui/FormulationNote.jsx</automated>
    <human-check>Open the recipe route, press "Record a batch", and confirm focus lands on the headnote's churn date; then Tab through and confirm the path runs as-made column, method steps, come-up, and reaches Save batch without stopping on a graduated rule. Save, and confirm the headnote prints the date in pen blue with nothing having changed colour.</human-check>
  </verify>
  <done>The brief's Status line, § 3 Margin bullet, § 3 ceremony paragraph, and § 6 hierarchy bullet name the churn date's new home with the 2026-09-07 attribution; the full suite and the build pass; the detector has been run once over the four changed files and its result is in the SUMMARY.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| maker's keyboard → draft state → IndexedDB | The only untrusted input on this surface; already bounded by the repository seam. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-vsn-01 | Tampering | The relocated churn date input in RecipePage's headnote | low | mitigate | The field writes `draft.churnDate` through the unchanged `handleChangeChurnDate`, and `handleSaveBatch`'s existing `'' -> null` conversion is the only path to storage — this task adds no new write path and no new parse. |
| T-vsn-02 | Information disclosure | The headnote's saved-state churn date | low | mitigate | Rendered as a React text child inside `<span className="ink-text">`, never as markup; the project's no-`dangerouslySetInnerHTML` rule holds unchanged. |
| T-vsn-03 | Tampering | Supply chain | low | accept | This task installs no package; `app/package.json` is not in `files_modified`. No legitimacy gate is required. |
</threat_model>

<verification>
- `npm --prefix app test` passes, including the updated BatchMargin suite and the new
  FormulationNote suite.
- `npm --prefix app run build` passes.
- The Impeccable layout detector has been run once over the four changed UI files and its
  JSON result is recorded in the SUMMARY.
- `app/src/ui/BatchMargin.jsx` renders no churn date field and no churn date line; its
  churn section opens at come-up in both states; the batch list still renders.
- `app/src/ui/RecipePage.jsx` no longer imports or calls `latestChurnDate`; the headnote
  reads `openBatch`.
- No literal colour, size, spacing, or rule weight was added to `app/src/styles/app.css`;
  no token was added to `app/src/styles/tokens.css`.
- Files outside `files_modified` are unchanged.
</verification>

<success_criteria>
- Recording opens with focus on the headnote's churn date, and one forward Tab path reaches
  Save batch through the as-made column, the method steps, and the churn section from
  come-up, with no graduated rule in the way.
- A saved batch's churn date prints in pen blue in the headnote's slot; an undated record
  prints the margin's existing undated wording there instead; an older batch opened by URL
  names its own date.
- The surface brief records the new home in §§ 3 and 6 and in its Status line, attributed to
  Mark on 2026-09-07.
- The full test suite and the build pass.
</success_criteria>

<output>
Create `.planning/quick/260906-vsn-impeccable-layout-fix-for-the-batch-reco/260906-vsn-SUMMARY.md` when done.
The SUMMARY must include: the walked DOM/focus order from Task 2 with the D-03 conclusion,
and the detector's verbatim result from Task 3.
</output>
