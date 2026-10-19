---
phase: quick-261019-ars
plan: 01
quick_id: 261019-ars
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/IngredientsPlace.jsx
  - app/src/ui/IngredientsPlace.test.jsx
autonomous: true
requirements: [PLACE-01]

must_haves:
  truths:
    - "Opening Milk Chocolate on the Ingredients place shows 'Lactose counts as 54.5% of milk solids in Freezing and Sweetness.' in p.ing__helper. It is a flavor entry with a Milk solids figure of 16% and no dairy flag (decide-p9-lactose-line-non-dairy, any-milk-solids; sketch 012 README decision 6)."
    - "An open entry that is not dairy and holds no Milk solids figure shows no p.ing__helper. Locust bean gum still has none."
    - "A dairy entry still shows the line: Heavy cream, 36% fat (dairy, Milk solids 5.4%) and a dairy entry with no Milk solids figure both show it."
    - "The line's wording is unchanged: 'Lactose counts as 54.5% of milk solids in Freezing and Sweetness.' appears exactly once in IngredientsPlace.jsx, as a React text child, with no dangerouslySetInnerHTML."
    - "The line shows on exactly the entries that have a Milk solids figure row. The msnf test is Number.isFinite(entry.composition.msnf), the same test heldFigures uses to draw that row."
    - "`npm --prefix app test -- IngredientsPlace` passes with 32 tests (29 at 5b09c58a, plus 3). `npm --prefix app test` passes with no failures and 3 more tests than its base: 113 files and 3471 tests at 5b09c58a, or more if a sibling item (261019-arq) merged first."
    - "There is exactly one code commit, and it holds exactly the two files. Nothing under .planning/phases or .planning/sketches is edited: 09-places-check.mjs and the other phase-09 check scripts pin neither the lactose wording nor ing__helper (grep at planning time)."
  artifacts:
    - path: app/src/ui/IngredientsPlace.jsx
      provides: "IngredientDetail renders the lactose line when the entry is dairy or holds a finite composition.msnf"
    - path: app/src/ui/IngredientsPlace.test.jsx
      provides: "Three new cases in 'opening an entry': non-dairy with milk solids (line shown), non-dairy without milk solids (no line), dairy without a milk solids figure (line shown)"
  key_links:
    - from: "IngredientDetail (IngredientsPlace.jsx, ~line 301)"
      to: "entry.composition.msnf"
      via: "the p.ing__helper condition, the same Number.isFinite test heldFigures (line 88) uses for figure rows"
      pattern: "fields\\.dairy \\|\\| Number\\.isFinite\\(entry\\.composition\\.msnf\\)"
---

<objective>
Show the Ingredients place's lactose line on any entry that holds a Milk solids figure, dairy or not, per Mark's answer on decide-p9-lactose-line-non-dairy (any-milk-solids). That answer is drawn in sketch 012 README decision 6, and the board redraw was approved as look-p9-012-redraw. Today the line in IngredientDetail renders only when the entry is dairy (dairy === true). After this change it renders when the entry is dairy OR holds a finite composition.msnf, so Milk Chocolate (flavor, 16% milk solids, no dairy flag) shows it under its figures.

Purpose: the lactose note explains how milk solids count toward Freezing and Sweetness, so it belongs on every entry whose Milk solids figure feeds those numbers, not only on dairy ones.

Output: a one-condition change plus a corrected comment in app/src/ui/IngredientsPlace.jsx, and three new test cases in app/src/ui/IngredientsPlace.test.jsx.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/mark/Documents/projects/sprinkles/CLAUDE.md
@/Users/mark/Documents/projects/sprinkles/.claude/CLAUDE.md
@/Users/mark/Documents/projects/sprinkles/app/src/ui/IngredientsPlace.jsx
@/Users/mark/Documents/projects/sprinkles/app/src/ui/IngredientsPlace.test.jsx

<interfaces>
These already exist in app/src/ui/IngredientsPlace.jsx; reuse them and add no new helper:
- shownFields(entry) (lines 59-83) returns { category, heatTreatment, packedState, note, density, hydrationC, dairy, basisOf, sourceOf }. Its key `dairy` is `entry.dairy === true` (line 72). Keep it: the new condition still reads it.
- heldFigures(entry) (lines 87-89) keeps a figure when `Number.isFinite(entry.composition[figure.key])`. Composition numbers are validated at the door, so a held figure is a finite number. A Milk solids row is drawn exactly when `Number.isFinite(entry.composition.msnf)`.
- IngredientDetail({ entry, fields, id }) (lines 273-312) receives the raw `entry` and its `fields`. The lactose paragraph is p.ing__helper at lines 301-303, and it currently renders only on fields.dairy.
- The comment above IngredientDetail (lines 270-272) lists the open entry's lines and names the lactose line as a dairy-only line. After this change that is wrong.

Test helpers in app/src/ui/IngredientsPlace.test.jsx: mountList(list) (line 47), click(element) (line 102), rowNamed(container, name) (line 108). The describe block 'opening an entry' runs from line 236 to 356. The Locust bean gum case (lines 271-281) asserts `.ing__helper` is null for an entry with no msnf and no dairy flag. It stays as it is and still passes.

Data, checked at planning time: in app/src/data/library.js, every entry with a finite msnf is dairy (wholeMilk, heavyCream, skimMilkPowder, wholeMilk33, wholeMilk37). In app/src/data/library-seed-db.js (librarySeedDb, 85 entries, 18 with msnf), the only entry with msnf and no dairy flag is milkChocolate (lines 1608-1641: category 'flavor'; composition fat 0.2966, msnf 0.16, sugar 0.4278, other 0.1006, pac 4.78, pod 51.6048; no `dairy` key). No entry stores msnf 0, and none is dairy without msnf. In the shipped data, then, the change adds the line to Milk Chocolate alone.
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Lactose line on any open entry with milk solids (tests red first, then the IngredientDetail condition)</name>
  <files>app/src/ui/IngredientsPlace.test.jsx, app/src/ui/IngredientsPlace.jsx</files>
  <read_first>
    - app/src/ui/IngredientsPlace.jsx lines 54-89 (shownFields, heldFigures) and 270-312 (the comment above IngredientDetail, and IngredientDetail itself)
    - app/src/ui/IngredientsPlace.test.jsx lines 236-311 ('opening an entry': the Heavy cream lactose case at 251-269, the Locust bean gum no-lactose case at 271-281, and the inline-fixture cases at 296-311, whose style the new cases follow)
    - app/src/data/library-seed-db.js lines 1608-1641 (milkChocolate, the entry the redraw shows)
    - .planning/sketches/012-places/README.md line 42 (decision 6)
  </read_first>
  <behavior>
    - New case A, "shows the lactose line on an entry that holds milk solids but is not dairy". Build a one-entry list with an inline fixture shaped like the seed entry: { id: 'milkChocolate', entry: { name: 'Milk Chocolate', category: 'flavor', composition: { fat: 0.2966, msnf: 0.16, sugar: 0.4278, other: 0.1006, pac: 4.78, pod: 51.6048 } } }, with no `dairy` key. Open it. p.ing__helper textContent is exactly 'Lactose counts as 54.5% of milk solids in Freezing and Sweetness.' This FAILS at 5b09c58a, because the line needs dairy there.
    - New case B, "leaves the lactose line out of an entry that is not dairy and holds no milk solids". Fixture: { id: 'dark', entry: { name: 'Dark chocolate', category: 'flavor', dairy: false, composition: { fat: 0.42, sugar: 0.29, other: 0.29 } } }. Open it. `.ing__helper` is null. This passes at 5b09c58a and stays as a guard.
    - New case C, "still shows the lactose line on a dairy entry with no milk solids figure". Fixture: { id: 'butter', entry: { name: 'Butter', category: 'dairy', dairy: true, composition: { fat: 0.82 } } }. Open it. p.ing__helper textContent is exactly the same sentence. This passes at 5b09c58a and pins the "or dairy" half of the condition the item states.
    - The Heavy cream case (lines 251-269) and the Locust bean gum case (lines 271-281) are unchanged and still pass.
  </behavior>
  <action>
Setup: if app/node_modules is missing in this worktree, symlink the main checkout's copy first with `ln -s /Users/mark/Documents/projects/sprinkles/app/node_modules app/node_modules`. Do not commit the symlink.

RED: in app/src/ui/IngredientsPlace.test.jsx, add the three `it` cases from the behavior block (A, then B, then C) inside the 'opening an entry' describe block, straight after the Locust bean gum case, which ends at line 281. Follow the inline-fixture style of the Plain gum case: build a `list`, call mountList(list), click container.querySelector('button.ing__head'), then assert on container.querySelector('.ing__helper'). Assert case A's and case C's text with toBe and the full sentence. Do not change any existing case or its name. Run `npm --prefix app test -- IngredientsPlace`. Exactly one test should fail, case A, because no p.ing__helper is found. Cases B and C pass. Commit nothing yet.

GREEN, per decide-p9-lactose-line-non-dairy (any-milk-solids, Mark 2026-10-19; sketch 012 README decision 6), in app/src/ui/IngredientsPlace.jsx:
1. In IngredientDetail, widen the condition in front of the p.ing__helper paragraph (line 301). It now reads fields.dairy alone. It becomes the parenthesised OR of fields.dairy and Number.isFinite(entry.composition.msnf). That is the same finiteness test heldFigures uses, so the line shows exactly when a Milk solids row is drawn, and on dairy entries as before. Leave the paragraph, its class and the sentence 'Lactose counts as 54.5% of milk solids in Freezing and Sweetness.' exactly as they are. Do not move the condition into shownFields, rename its `dairy` key or add a helper. One expression at the render site is the whole change.
2. Rewrite the comment above IngredientDetail (lines 270-272) so its list of lines says the lactose line shows on any entry with milk solids or marked dairy. For example, the middle line could read "(facts, the lactose line for any entry with milk solids or marked dairy, the Note), each only where the entry has it." The phrase "any entry with milk solids" must appear. Keep the other two comment lines as they are.

Touch nothing else: not shownFields, heldFigures, summaryText, the figure table, the facts line, the CSS, or any file outside these two. Do not edit .planning/phases/09-*/09-places-check.mjs or any other phase-09 script; none of them pins the lactose wording or ing__helper. Do not edit .planning/sketches/012-places. The sentence stays a React text child, and no raw-HTML injection prop is added (T-09-06).

Then run the full suite `npm --prefix app test` and the build `npm --prefix app run build`. Make one commit holding exactly app/src/ui/IngredientsPlace.jsx and app/src/ui/IngredientsPlace.test.jsx. Write the message in English, with the subject `feat(ingredients): lactose line on any entry with milk solids (decide-p9-lactose-line-non-dairy)` and a one-line body saying that Milk Chocolate (flavor, 16% milk solids) now shows it. End the message with these two lines, exactly:
Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01D23VYRNqiLYsxmWdDFqhCG
  </action>
  <verify>
    <automated>npm --prefix app test -- IngredientsPlace && grep -qF 'fields.dairy || Number.isFinite(entry.composition.msnf)' app/src/ui/IngredientsPlace.jsx && test "$(grep -cF 'Lactose counts as 54.5% of milk solids in Freezing and Sweetness.' app/src/ui/IngredientsPlace.jsx)" = 1 && grep -qF 'any entry with milk solids' app/src/ui/IngredientsPlace.jsx && test "$(grep -c dangerouslySetInnerHTML app/src/ui/IngredientsPlace.jsx)" = 0</automated>
  </verify>
  <done>
    The IngredientsPlace suite passes with 32 tests (29 at 5b09c58a, plus the 3 new cases), and case A failed before the GREEN step. The grep gates, with their baselines at 5b09c58a:
    - The condition 'fields.dairy || Number.isFinite(entry.composition.msnf)' is found. It counts 0 at 5b09c58a.
    - The lactose sentence appears exactly once. It counts 1 at 5b09c58a, so the wording is unchanged.
    - The phrase 'any entry with milk solids' is found in the comment. It counts 0 at 5b09c58a.
    - dangerouslySetInnerHTML counts 0, as it does at 5b09c58a.
    `npm --prefix app test` passes with no failures and 3 more tests than its base (113 files and 3471 tests at 5b09c58a, plus any test a sibling merged first). `npm --prefix app run build` succeeds. One commit holds exactly the two files and ends with the two attribution lines.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| store/import → Ingredients place | Library entries can come from an imported backup. composition.msnf and dairy are stored values that now decide whether a fixed sentence renders. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ars-01 | Tampering | IngredientDetail lactose condition in IngredientsPlace.jsx | low | mitigate | An imported entry with a non-number msnf cannot inject anything. Number.isFinite rejects every non-number (a string, object, NaN or Infinity), so a malformed value only leaves the line out. The library validator already checks composition numbers at the door, and heldFigures uses the same test, so the line and the Milk solids row cannot disagree. dairy is read only as `=== true` (shownFields, line 72). |
| T-ars-02 | Tampering | p.ing__helper in IngredientsPlace.jsx | low | accept | The sentence is a fixed literal in the component, rendered as a React text child. No stored text reaches it and no dangerouslySetInnerHTML is added (T-09-06; gate: the dangerouslySetInnerHTML count stays 0). |
</threat_model>

<verification>
- `npm --prefix app test -- IngredientsPlace` passes with 32 tests.
- `npm --prefix app test` passes with no failures, at its base count plus 3.
- `npm --prefix app run build` succeeds.
- `git show --stat HEAD` lists exactly app/src/ui/IngredientsPlace.jsx and app/src/ui/IngredientsPlace.test.jsx.
</verification>

<success_criteria>
On the Ingredients place, an open entry shows "Lactose counts as 54.5% of milk solids in Freezing and Sweetness." when it holds a Milk solids figure or is marked dairy. Milk Chocolate (flavor, 16% milk solids) now shows it, and an entry with neither shows nothing in its place. The wording, its paragraph and its position under the facts line are unchanged, and the sentence still renders as text.
</success_criteria>

<output>
Create `.planning/quick/261019-ars-ingredients-place-lactose-line-on-any-entry-with-milk-solids/261019-ars-SUMMARY.md` when done
</output>
