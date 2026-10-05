---
phase: quick-261005-cgb
plan: 01
quick_id: 261005-cgb
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientTable.test.jsx
  - app/src/ui/RecipePage.perStep.test.jsx
  - .planning/quick/261005-cgb-drop-the-portion-line-on-the-reading-she/261005-cgb-SUMMARY.md
autonomous: true
requirements: [REC1-03]

# Prohibited (do not touch): .impeccable/**, DESIGN.md, PRODUCT.md,
# .planning/sketches/011-recipe-route-c/README.md and every board in that folder,
# app/src/styles/** (no new CSS, no new or changed token), the 03.6 phase docs.

estimate:
  tokens: 20000
  raw_tokens: 20000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "Mark's List row per-step-one-line-left, his answer drop (sketch 011 README decision 51, 'Not drawn' paragraph; 03.6-CONFORMANCE.md 'Open for Mark' item 1): in the reading Sheet, Olive Oil v1 saved with Whole milk's Step 2 line out draws Whole milk once with no portion line. Its name cell holds the name and the estimated chip only, its accessible name is exactly 'Whole milk, 250.4 g, estimated', its share reads 36.8% and the total 679.7 g."
    - "Print shows the same thing, because print renders the reading-state table and app.css's @media print has no portion-line rule of its own."
    - "A line counts as in when activeRows (domain/rows.js, through isLineRemoved) keeps it: neither its own flag nor its step's removal takes it out. So Olive Oil v1 with the step 'Gum slurry' (n 2) removed also reads Whole milk (250.4 g) and Sucrose (64 g) as one line each, with no portion line."
    - "A split row with two or more lines in still prints a portion line on every line. Olive Oil v1 at rest reads '120 g of 370.4 g · 46.3% in all' and '250.4 g of 370.4 g · 46.3% in all'. With milk's Step 2 line out, Sucrose still reads '12 g of 76.0 g · 11.2% in all' and '64 g of 76.0 g · 11.2% in all'."
    - "These stay as they are: the pen (the Step 3 milk line still reads '250.4 g of 250.4 g · 36.8% in all' after Step 2's remove is pressed), Show changes (the same line reads the same there), and recording (still draws the portion line, and the as-made field is still named 'Whole milk, as made, grams, portion 2')."
    - "Each test is committed before its code. npm --prefix app test passes, including tabindex-scan. npm --prefix app run build exits 0. Only the three app files named here change under app/. Nothing under app/src/styles, .impeccable, DESIGN.md or the sketch 011 folder changes."
  artifacts:
    - path: app/src/ui/IngredientTable.jsx
      provides: "renderReadingEntry's isSplit counts the lines still in (liveRow) outside recording"
      contains: "(mode === 'recording' ? row : liveRow).portions.length > 1"
    - path: app/src/ui/IngredientTable.test.jsx
      provides: "Four markup cases over Olive Oil v1. Reading with milk's Step 2 line out. Reading with Gum slurry removed. Reading with both lines in (guard). Recording with the line out (guard)."
      contains: "per-step-one-line-left"
    - path: app/src/ui/RecipePage.perStep.test.jsx
      provides: "The saved child's reading state has no portion line on Whole milk. A new guard: v1's reading state prints both milk portion lines."
      contains: "per-step-one-line-left"
  key_links:
    - from: "IngredientTable renderReadingEntry isSplit"
      to: "baselineActiveById (activeRows({ rows, method: steps }))"
      via: "liveRow = baselineActiveById.get(row.id) ?? row, declared before isSplit"
      pattern: "mode === 'recording' \\? row : liveRow"
---

<objective>
Implement Mark's answer "drop" on his List row per-step-one-line-left. In the reading Sheet and in print, a split ingredient with exactly one line still in reads like a one-line row: no portion line under its name.

Purpose: after Whole milk's Step 2 line is removed and the version saved, the reading state reads "Whole milk 250.4 g of 250.4 g · 36.8% in all". That portion line says nothing a one-line row does not already say, and Sid recommended dropping it in decision 51.
Output: one changed expression in IngredientTable.jsx's reading branch, test cases in IngredientTable.test.jsx and RecipePage.perStep.test.jsx, and a SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/phases/03.6-per-step-shared-ingredients/03.6-CONFORMANCE.md
@app/src/ui/IngredientTable.jsx
@app/src/domain/rows.js

Facts the planner read (do not re-derive):
- IngredientTable.jsx: `renderEntry` (line 739) sends the reading state AND the recording state through `renderReadingEntry` (line 529). Show changes goes to `renderShowChangesEntry` (line 567) and the pen to `renderDevelopingEntry` (line 615). In `renderReadingEntry`, line 533 is `const isSplit = row.portions.length > 1;`. Line 536 is `const liveRow = baselineActiveById.get(row.id) ?? row;`, with its two-line comment at 534-535. The portion line renders at lines 551-555 under `{isSplit && (...)}`.
- `baselineActiveById` (line 459) is built from `activeRows({ rows, method: steps })` (line 454). For a row with every line in it holds the stored row itself, so `liveRow.portions.length === row.portions.length`. For a row with some lines out it holds a copy whose `portions` are only the lines still in, a line being out by its own flag or by its step's removal (`isLineRemoved` in rows.js). In the reading state `groupPortionsByStep` (line 520, `keepOutLines` false there) already skips a line that is out, so only lines still in reach `renderReadingEntry`.
- Lines 573 (Show changes) and 631 (pen) each hold `const isSplit = row.portions.length > 1;`. They stay as they are. The `multiPortion` rules at 154 (pen grams field name) and 324 (recording as-made field name) stay as they are too.
- The reading state never carried a per-line name suffix. The suffixes "Step N" and "portion N" exist only in the pen (the remove/restore and grams fields' accessible names) and in recording (the as-made field's name), and both are out of scope. So "no per-line name suffix" here means the reading row's name cell is the name plus its chip, and its accessible name is unchanged. The tests pin both.
- A saved batch's reading (mode 'reading' with `openBatch`) is the reading Sheet as well, so the change applies there. The existing case at IngredientTable.test.jsx line 2055 asserts no portion line either way and must still pass.
- Print: `app/src/styles/app.css` `@media print` (line 2806 on) has no `.ingredient-table__portion-note` rule. Print is the reading table restyled, so no style change is needed or allowed.
- Olive Oil v1 (`app/src/data/olive-oil.js`): Whole milk is `row-01`, portions `[{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }]`. Sucrose is `row-05`, portions `[{ step: 2, grams: 12 }, { step: 3, grams: 64 }]`. Method step n 2 is "Gum slurry — the only high-heat step". Batch 799.7 g. With milk's Step 2 line out: 679.7 g, Whole milk 36.8%. With Gum slurry removed: 666.0 g, Whole milk 250.4 g at 37.6%.
- IngredientTable.test.jsx renders with `renderToStaticMarkup` (node env). It already imports `oliveOilVersion` and `displayNumbers` and defines `makeBatch` (line 133). The plan-03 describe at line 2024 shows the Olive Oil fixture pattern: structuredClone, then `version.rows.find((row) => row.id === 'row-01').portions[0].removed = true`, then render with `rows`, `steps={version.method}` and `currentStepNumbers={displayNumbers(version.method)}`.
- RecipePage.perStep.test.jsx (jsdom): the plan-03 case at line 221 ends on the saved child's reading state. Line 240 asserts today's portion line on the single Whole milk row (`'250.4 g of 250.4 g · 36.8% in all'`), and this quick inverts that line. `linesOf(name)` is a function declaration at line 256 (hoisted, so it is usable earlier in the file). `mountAt(VERSION_PATH)` lands on v1's reading state.
- Existing guards that must keep passing unchanged: RecipePage.perStep.test.jsx line 180 (the pen's Step 3 line reads '250.4 g of 250.4 g · 36.8% in all') and line 326 (Show changes). IngredientTable.test.jsx line 2113 (Show changes) and lines 752-753, 867, 1194-1227 (split rows with both lines in).
- HEAD at planning time: 21e837a. The index already holds a staged rename (`.planning/todos/pending/2026-10-04-once-everything-is-done-...md` to `completed/`), and `CLAUDE.md` and `.planning/state.json` have unstaged changes. Untracked `.impeccable/critique/*` files and `.planning/phases/03.6-per-step-shared-ingredients/.gitkeep` are present. None of these may be committed by this plan. Every commit therefore uses the pathspec form, `git commit -m "<message>" -- <paths>`, which commits only the named paths and leaves the staged rename staged.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Drop the portion line when one line is left, test first</name>
  <files>app/src/ui/IngredientTable.test.jsx, app/src/ui/RecipePage.perStep.test.jsx, app/src/ui/IngredientTable.jsx</files>
  <read_first>
    - app/src/ui/IngredientTable.jsx (renderReadingEntry at 529-565, renderEntry at 739, the baselineActiveById block at 454-459)
    - app/src/ui/IngredientTable.test.jsx (lines 1-49 for helpers, 133 for makeBatch, 2020-2065 for the plan-03 Olive Oil fixture pattern)
    - app/src/ui/RecipePage.perStep.test.jsx (lines 90-160 for helpers, 221-259 for the plan-03 case and linesOf)
  </read_first>
  <behavior>
    IngredientTable.test.jsx, one new describe at the end of the file, titled "IngredientTable — a split ingredient with one line left reads like a one-line row (Mark's List per-step-one-line-left: drop)". Every case uses structuredClone(oliveOilVersion) and renders with rows, steps={version.method} and currentStepNumbers={displayNumbers(version.method)}:
    - A (reading, milk's Step 2 line out; fails before the change): exactly one tbody tr whose aria-label starts with "Whole milk". Its aria-label is exactly "Whole milk, 250.4 g, estimated". Its name cell is exactly `<td class="ingredient-table__col-name">Whole milk<span class="target-chip ingredient-table__flag"><span class="target-chip__value">estimated</span></span></td>`. The markup contains no "250.4 g of 250.4 g". Sucrose's two rows still carry portion notes "12 g of 76.0 g · 11.2% in all" and "64 g of 76.0 g · 11.2% in all", in that order.
    - B (reading, method step n 2 removed: `version.method.find((step) => step.n === 2).removed = true`; fails before the change): one Whole milk row and one Sucrose row. Neither row's markup contains "ingredient-table__portion-note". The markup contains no "250.4 g of 250.4 g" and no "64 g of 64.0 g".
    - C (guard, reading, every line in; passes before and after): two Whole milk rows with portion notes "120 g of 370.4 g · 46.3% in all" and "250.4 g of 370.4 g · 46.3% in all", in that order.
    - D (guard, recording, milk's Step 2 line out, draft { asMade: {} }, openBatch null; passes before and after): the single Whole milk row still carries the portion note "250.4 g of 250.4 g · 36.8% in all", and the markup still contains aria-label "Whole milk, as made, grams, portion 2". Its comment says this pins only that this quick leaves recording as built. Open for Mark item 2 (as made while recording, with a line out) is undecided, so this pin may change when Mark decides it.
    RecipePage.perStep.test.jsx:
    - E (fails before the change): in the existing case "opens the saved child in the reading state at the figures the board measured", replace the line-240 assertion with two. `milkRows[0].querySelector('.ingredient-table__portion-note')` is null, and `milkRows[0].getAttribute('aria-label')` is exactly "Whole milk, 250.4 g, estimated". Leave every other assertion in that case as it is, including the Sucrose portion notes.
    - F (guard; passes before and after): a new `it` in the same describe. Mount at VERSION_PATH, press nothing, and flush until `.ingredient-table` is present. `linesOf('Whole milk')` has length 2, and its portion notes read "120 g of 370.4 g · 46.3% in all" and "250.4 g of 370.4 g · 46.3% in all", in that order.
  </behavior>
  <action>
RED. Write cases A to D in app/src/ui/IngredientTable.test.jsx and make change E and add case F in app/src/ui/RecipePage.perStep.test.jsx, exactly as the behavior block says. Write any small helper (a row splitter by aria-label prefix, a portion-note reader) inside the new describe, following the `linesOf` and `note` helpers of the 03.6-04 describe at line 2089. Do not move or change any existing helper or case except the one line-240 assertion E replaces. Put a comment above the new describe and above E: Mark's List row per-step-one-line-left, Mark's answer drop (2026-10-05), sketch 011 README decision 51's "Not drawn" paragraph, 03.6-CONFORMANCE.md "Open for Mark" item 1. Test titles and comments in English.

Run `npm --prefix app test -- IngredientTable.test RecipePage.perStep`. A, B and E must fail and C, D and F must pass. Record each failing assertion's message for the SUMMARY. Commit only the two test files with the pathspec form: `git commit -m "test(261005-cgb): pin no portion line when a split ingredient has one line left" -- app/src/ui/IngredientTable.test.jsx app/src/ui/RecipePage.perStep.test.jsx`. End the message with the two attribution trailer lines from your own system reminder (Co-Authored-By and Claude-Session). Before committing, run `git status --porcelain` and confirm the staged todo rename is still the only other staged entry. The pathspec form leaves it out of the commit. Do not push.

GREEN. In app/src/ui/IngredientTable.jsx, inside `renderReadingEntry` only:
(1) Move the `liveRow` declaration and its two-line comment above `isSplit` so `liveRow` exists first.
(2) Replace `const isSplit = row.portions.length > 1;` there with `const isSplit = (mode === 'recording' ? row : liveRow).portions.length > 1;`.
(3) Above it, add a short English comment. It says that in the reading Sheet, and so in print, a split ingredient with one line still in reads like a one-line row, with no portion line (Mark's List row per-step-one-line-left, Mark's answer drop, 2026-10-05; sketch 011 decision 51). It says that recording, which shares this branch, keeps the stored count as built, because as made with a line out is still open for Mark (03.6-CONFORMANCE.md "Open for Mark" item 2).

Change nothing else. Leave the Show changes and pen `isSplit` lines (573, 631), GramsCell's and AsMadeCell's `multiPortion`, `rowAccessibleLabel`, `formatPortionLine`, rows.js and every class name exactly as they are. Add no CSS, token or style edit.

Why `liveRow`: it already comes from `activeRows`, which reads both a line's own flag and its step's removal through `isLineRemoved`. So a row whose other line went with a removed step (case B) is counted the same way as one whose line was removed on its own (case A), and no second "is this line in" rule is written. Why the recording guard: the orchestrator's scope keeps recording unchanged, and recording renders through this same function.

Run `npm --prefix app test -- IngredientTable.test RecipePage.perStep` again. Every case passes, old and new. Commit only the component with the pathspec form: `git commit -m "feat(261005-cgb): drop the portion line when a split ingredient has one line left" -- app/src/ui/IngredientTable.jsx`, with the same two trailer lines. Do not push.
  </action>
  <verify>
    <automated>npm --prefix app test -- IngredientTable.test RecipePage.perStep</automated>
  </verify>
  <acceptance_criteria>
    - The test commit comes before the feat commit. In the RED run, cases A, B and E failed and C, D and F passed; the SUMMARY records the failing messages.
    - `grep -cF "(mode === 'recording' ? row : liveRow).portions.length > 1" app/src/ui/IngredientTable.jsx` returns 1.
    - `grep -cF "const isSplit = row.portions.length > 1;" app/src/ui/IngredientTable.jsx` returns 2 (Show changes and the pen, unchanged).
    - `grep -c "per-step-one-line-left" app/src/ui/IngredientTable.test.jsx` and the same for app/src/ui/RecipePage.perStep.test.jsx each return at least 1.
    - `npm --prefix app test -- IngredientTable.test RecipePage.perStep` passes. That includes the existing pen guard (perStep line 180), the Show changes guards (perStep line 326, IngredientTable.test line 2113) and the saved-batch reading case (IngredientTable.test line 2055).
    - `git show --name-only --format= HEAD` lists only app/src/ui/IngredientTable.jsx, and `git show --name-only --format= HEAD~1` lists only the two test files.
  </acceptance_criteria>
  <done>In the reading Sheet (and so in print), Olive Oil v1 saved with Whole milk's Step 2 line out, or with Gum slurry removed, reads each one-line-left ingredient with no portion line and its plain accessible name. Split rows with two or more lines in, the pen, Show changes and recording read as before. Two commits, test then feat, each holding only its own paths.</done>
</task>

<task type="auto">
  <name>Task 2: Full suite, build, scope check and SUMMARY</name>
  <files>.planning/quick/261005-cgb-drop-the-portion-line-on-the-reading-she/261005-cgb-SUMMARY.md</files>
  <read_first>
    - .planning/quick/261005-06q-opening-more-closes-the-import-error-pan/261005-06q-SUMMARY.md (the SUMMARY shape and its Deferred Human Verification section)
  </read_first>
  <action>
Run `npm --prefix app test` (the full suite, including app/src/ui/tabindex-scan.test.js). Then run `npm --prefix app run build`. Only one Vite process may run per workspace (CLAUDE.md). The build is not a server, so start no dev server or preview. If a test outside the two touched test files fails because of Task 1's change, stop and report it. Do not edit another file to make it pass.

Scope check, every item must hold:
- `git status --porcelain -- app/` prints nothing.
- `git diff --name-only 21e837a..HEAD` lists only app/src/ui/IngredientTable.jsx, app/src/ui/IngredientTable.test.jsx and app/src/ui/RecipePage.perStep.test.jsx.
- `git diff --name-only 21e837a..HEAD -- app/src/styles .impeccable DESIGN.md PRODUCT.md .planning/sketches` prints nothing.
- The staged todo rename is still staged and uncommitted, and CLAUDE.md, .planning/state.json and the untracked files are as they were.

Write 261005-cgb-SUMMARY.md in the 261005-06q shape, in plain English. Cover: what changed (the one expression and why liveRow), the commits, the six test cases with the RED failure messages, the full-suite file and test counts, and the build result.

Add a short note: 03.6-CONFORMANCE.md "Open for Mark" item 1 and sketch 011 README decision 51's "Not drawn" sentence still describe the earlier build. This quick did not edit either, because the README is Impeccable's and out of scope; whoever owns them updates them. Add another: recording still draws the portion line with one line left, as scoped, and that rides on Open for Mark item 2.

Under "Not verified", list the devices and print preview. Add a "Deferred Human Verification" section of suggested checks for the row per-step-one-line-left, served with `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server. On the iPad (1366) and the iPhone (393), open Olive Oil v1, press Next version, remove Whole milk's Step 2 line, save, and confirm the saved version's Sheet reads Whole milk once with no "of 250.4 g" line under it while Sucrose keeps both of its lines. Then open the browser's print preview and confirm the same. File no Mark's List rows; the orchestrator does. Do not commit the SUMMARY; the quick workflow's docs commit carries it.
  </action>
  <verify>
    <automated>npm --prefix app test && npm --prefix app run build</automated>
  </verify>
  <acceptance_criteria>
    - `npm --prefix app test` passes in full, including tabindex-scan.test.js.
    - `npm --prefix app run build` exits 0.
    - `git status --porcelain -- app/` prints nothing.
    - `git diff --name-only 21e837a..HEAD` prints only the three app/src/ui paths named in this plan.
    - `git diff --name-only 21e837a..HEAD -- app/src/styles .impeccable DESIGN.md PRODUCT.md .planning/sketches` prints nothing.
    - The SUMMARY exists and names per-step-one-line-left in its Deferred Human Verification section.
  </acceptance_criteria>
  <done>The full suite and the build pass, only the three planned app files changed, nothing prohibited was touched, and the SUMMARY lists the suggested device and print checks for per-step-one-line-left.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stored or imported version to the reading table | Unchanged by this plan. A version's rows, including an imported file's, already pass transfer.js's validator (a portion's `removed` is absent or boolean, T-03.6-05). The table renders names and figures as text. This plan only decides whether one existing text span is drawn. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261005-cgb-01 | Tampering | IngredientTable.jsx renderReadingEntry isSplit | low | accept | The count reads activeRows, whose strict `removed === true` checks (isLineRemoved, T-03.6-01) already govern the total and the shares. A malformed flag reads as in, so the worst case is a portion line that stays drawn, which matches the figures shown. No markup is built from stored strings beyond the existing text nodes, and dangerouslySetInnerHTML stays absent. |
| T-261005-cgb-SC | Tampering | npm installs | low | accept | No package is installed or changed by this plan. |
</threat_model>

<verification>
- `npm --prefix app test -- IngredientTable.test RecipePage.perStep` passes, with cases A to F.
- `npm --prefix app test` passes in full, and `npm --prefix app run build` exits 0.
- git log shows test(261005-cgb) before feat(261005-cgb). Each commit holds only its own paths, the staged todo rename is not in either, and nothing is pushed.
- `git status --porcelain -- app/` is empty after the commits.
</verification>

<success_criteria>
- The reading Sheet and print draw no portion line for a split ingredient with exactly one line still in, whether the other line was removed on its own or with its step. The row reads like a one-line row, with its plain name and accessible name.
- Split rows with two or more lines in, the pen, Show changes and recording are unchanged, pinned by the new guards C, D and F and the existing pen and Show changes cases.
- Only IngredientTable.jsx and its two test files changed under app/. No CSS, token, style, .impeccable, DESIGN.md or sketch edit. tabindex-scan is green and the build passes.
</success_criteria>

<output>
Create `.planning/quick/261005-cgb-drop-the-portion-line-on-the-reading-she/261005-cgb-SUMMARY.md` when done
</output>
