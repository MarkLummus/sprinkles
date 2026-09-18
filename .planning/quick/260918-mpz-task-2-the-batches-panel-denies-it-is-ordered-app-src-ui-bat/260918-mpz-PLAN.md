---
phase: quick-260918-mpz
plan: 01
type: execute
wave: 1
depends_on: []
autonomous: true
requirements:
  - MPZ-01
files_modified:
  - app/src/ui/BatchRow.jsx
  - app/src/ui/BatchRow.test.jsx

estimate:
  tokens: 14000
  raw_tokens: 14000
  tasks: 1
  confidence: low

must_haves:
  truths:
    - "The Batches panel's register renders as an ordered list in the DOM, so its markup states the chronology its content already has (newest first, from sortedBatches)."
    - "The twin nested batch list in the History panel still renders as an ordered list — the two sites agree."
    - "No visible change: .history-list still sets list-style: none, so no numbers appear and no rule is re-targeted."
  artifacts:
    - app/src/ui/BatchRow.jsx
    - app/src/ui/BatchRow.test.jsx
  key_links:
    - "BatchHistoryPanel -> HistoryList(ordered) -> History.jsx's List = 'ol' branch"
---

<objective>
The Batches panel's register is ordered content in an unordered list. `BatchHistoryPanel`
(app/src/ui/BatchRow.jsx:331) renders `<HistoryList className="history-register" label="Batches of this version">`
without `ordered`, so History.jsx:22 (`const List = ordered ? 'ol' : 'ul'`) picks `ul` — while its
children are `sortedBatches(batches)`, newest first, and its twin (the History panel's nested batch
list, app/src/ui/RecipeHistory.jsx:152) passes `ordered` and renders an `<ol>`.

Purpose: the markup should state the order the content already has, and the two batch lists should
not disagree about whether a batch list is ordered.
Output: one prop added, one test assertion tightened from a class substring to the ordered tag.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@app/src/ui/BatchRow.jsx
@app/src/ui/BatchRow.test.jsx
@app/src/ui/History.jsx
</context>

<blast_radius_survey>
Surveyed at HEAD 06fae6e, before planning. Nothing targets this list by its element name:

- **CSS:** `app/src/styles/history.css` styles the register entirely by class — `.history-list`,
  `.history-item`, `.history-register__*`, `.history-list--records`, `.history-list--branches`.
  A repo-wide search for element-qualified list selectors (`ul.` / `ol.`) across `app/src/styles/*.css`
  returns nothing, and there is no bare `ul` or `ol` element rule anywhere in the stylesheets.
  `.history-list` sets `list-style: none`, so an `<ol>` renders no numbers — the change is invisible.
- **Style contract suites:** `app/src/styles/cross-cutting.test.js` (lines 84, 90-91, 186-187) and
  `app/src/styles/binder.test.js:98` read these same rules by selector string; all class-based, none
  names a tag.
- **Tests naming this list:** `app/src/ui/BatchRow.test.jsx:1307` asserts
  `toContain('class="history-register history-list"')` — tag-agnostic, so it passes either way (which
  is exactly why the defect survived); lines 1308 and 1331 match `<li ...>` children, unaffected by the
  parent's tag.
- **The one `<ul` assertion in the file**, BatchRow.test.jsx:1282, pins
  `<ul class="batch-margin__list"><li>no batch yet</li></ul>` — a different, genuinely unordered
  one-item list. Out of scope, must stay a `ul`.
- **`app/src/ui/History.test.jsx:30`** already asserts `<ol role="list" aria-label="Children"` for the
  shared component's ordered branch, confirming the attribute order React emits.
- `role="list"` is already on the element either way, so the accessibility tree does not change.

Nothing breaks. The item text cites the twin at RecipeHistory.jsx:144; at HEAD it sits at line 152
(the cited-batch provenance block above it grew). Same call site, same `ordered` prop.
</blast_radius_survey>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: The Batches panel's register declares itself ordered</name>
  <files>app/src/ui/BatchRow.jsx, app/src/ui/BatchRow.test.jsx</files>
  <behavior>
    - `BatchHistoryPanel` with three batches renders the register as an `ol`, carrying the same
      `role="list"`, `aria-label` and classes it carries today.
    - Children, order (newest first), markers, links and counts are all unchanged — the existing
      assertions in that test keep passing untouched.
    - The batch-margin "no batch yet" list (BatchRow.test.jsx:1282) is still a `ul`.
  </behavior>
  <action>
    Test first, in `app/src/ui/BatchRow.test.jsx`, inside the existing
    `describe('BatchHistoryPanel — the revealed Batches register')`, in the test named
    `reveals exactly the complete batch count, newest first, with the older batch in view`:
    replace the tag-agnostic class assertion at line 1307 —
    `expect(markup).toContain('class="history-register history-list"');` — with one that pins the
    element as well as the classes:
    `expect(markup).toContain('<ol role="list" aria-label="Batches of this version" class="history-register history-list">');`
    That is the attribute order React emits for History.jsx's `List` (matching the shape already
    asserted at History.test.jsx:30). Run the file and confirm it fails on this one assertion — that
    failure is the defect.

    Then in `app/src/ui/BatchRow.jsx`, in `BatchHistoryPanel`, line 331, add the `ordered` prop to the
    opening tag so it reads `<HistoryList ordered className="history-register" label="Batches of this version">`,
    matching the twin call site at RecipeHistory.jsx:152. Change nothing else: not the className, not
    the label, not the `HistoryPanel` wrapper above it, not the children. Do not touch
    `app/src/ui/History.jsx` — the `ordered ? 'ol' : 'ul'` branch already does the work — and do not
    touch the `batch-margin__list` list, which is legitimately unordered.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run src/ui/BatchRow.test.jsx src/ui/History.test.jsx src/ui/RecipeHistory.test.jsx</automated>
    <automated>grep -c 'HistoryList ordered' app/src/ui/BatchRow.jsx app/src/ui/RecipeHistory.jsx</automated>
    <automated>npm --prefix app test -- --run</automated>
  </verify>
  <done>
    `BatchHistoryPanel` emits `<ol role="list" aria-label="Batches of this version" class="history-register history-list">`;
    the grep reports 1 ordered `HistoryList` in BatchRow.jsx and 3 in RecipeHistory.jsx; the full suite
    is green at its existing 38 files / 1046 tests with no test removed and no count regression.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| none crossed | A presentational list element changes tag; no input, no storage, no network. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-mpz-01 | Tampering | BatchHistoryPanel markup | low | accept | Stored batch data is unread and unwritten by this change; the rendered children are byte-identical. |
| T-mpz-SC | Tampering | package installs | low | accept | No dependency is added, removed or upgraded — no install step, so the legitimacy gate does not apply. |
</threat_model>

<verification>
- `npm --prefix app test -- --run` green, 38 files / 1046 tests, no count regression.
- `git diff` touches exactly two files and no more than two production-code characters beyond the
  test assertion.
</verification>

<success_criteria>
Both batch registers — the Batches panel's and the History panel's nested one — are `<ol>` in the
rendered DOM, proven by the BatchRow test, with no visible change to the page.
</success_criteria>

<output>
Create `.planning/quick/260918-mpz-task-2-the-batches-panel-denies-it-is-ordered-app-src-ui-bat/260918-mpz-SUMMARY.md` when done
</output>
