---
phase: quick-260909-oow
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/domain/lineage.js
  - app/src/domain/lineage.test.js
  - app/src/ui/RecipePage.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientTable.test.jsx
autonomous: true
requirements: [QUICK-260909-oow]

must_haves:
  truths:
    - "Typing `-5`, `1e3`, `1.2345` or `4o` into a plan-pen grams field leaves that row's share — and every graduated rule fed by it — at the figure the parent's own stored grams produce, while Save's sentence names the row."
    - "A written `0` in a plan-pen grams field still takes effect as zero (D-11): the fall-back is `??`, never `||`."
    - "An as-made cell holding a value the grams rule rejects is dropped at save, exactly as a non-numeric one already is — no negative, exponent or three-decimal as-made value reaches a stored batch record or a version's coefficient snapshot."
    - "The batch pen gains no blocking rule: a rejected as-made cell blocks nothing, disables nothing, and shows no new message."
    - "`npm --prefix app test` is green: 30 test files, the 618 baseline tests plus the ones this plan adds."
  artifacts:
    - "app/src/domain/lineage.js — exports `parseGramsDraft(value)`; `NUMERIC_GRAMS_PATTERN` stays module-private and is read by that predicate alone."
    - "app/src/domain/lineage.test.js — `parseGramsDraft` coverage including the agreement property against `blockedSaveMessage`."
    - "app/src/ui/RecipePage.jsx — three draft-grams readers routed through `parseGramsDraft`; no finiteness guard of its own left."
    - "app/src/ui/IngredientTable.jsx — one draft-grams reader routed through `parseGramsDraft`."
    - "app/src/ui/IngredientTable.test.jsx — a regression block proving the pen's live share holds at the parent's figure for each rejected value."
  key_links:
    - "`parseGramsDraft` -> the same `NUMERIC_GRAMS_PATTERN` `findBlockedRow` reads, so the live figure and `blockedSaveMessage` cannot drift apart — one rule, expressed once."
    - "RecipePage `draftVersion` -> `liveVersion` -> `buildFigures` -> `GraduatedRule`: the chain the verify criterion names when it says every graduated rule holds at its last good figure."
    - "RecipePage `handleSaveBatch`'s `asMade` -> `createBatch`/`recordAmendment` -> `repository`: the store path this closes."
---

<objective>
Make the live balance figures accept exactly the grams the save accepts, and stop bad as-made grams reaching the store.

`app/src/domain/lineage.js:138` already owns the real rule as `NUMERIC_GRAMS_PATTERN` — non-negative, up to two decimals, anchored at both ends. Four readers of a draft grams field re-derive a looser rule of their own with a finiteness guard, which admits `-5`, `1e3` and `1.2345`; all three are values `blockedSaveMessage` rejects. In the plan pen this makes the figures on screen disagree with the save gate beside them. In the batch pen there is no blocked-save rule at all, so such a value is written into a stored batch record and into the version's coefficient snapshot permanently.

Purpose: one predicate, one rule, read by every draft-grams reader — so the figures and the gate can never disagree, and nothing the gate would reject can reach the store.
Output: `parseGramsDraft` exported from the domain module that owns the pattern, four call sites converted, domain tests for the predicate, and a component regression for the pen's live share.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md

@app/src/domain/lineage.js
@app/src/domain/lineage.test.js
@app/src/ui/RecipePage.jsx
@app/src/ui/IngredientTable.jsx
@app/src/ui/IngredientTable.test.jsx
</context>

<scope_boundary>
Three things are deliberately NOT in this plan. Do not do them, and do not treat them as omissions:

1. **No blocking rule in the batch pen.** Whether a bad as-made cell should block the batch save is a brief question owned by `.impeccable/surfaces/route-recipe-batch.md`. A rejected as-made cell is dropped, silently, exactly as a non-numeric one already is.
2. **`app/src/domain/batch.js:177` (`asMadeTotals`) is out of scope.** It is a fifth reader of draft grams — in recording mode `IngredientTable.jsx:464` feeds it `draft.asMade`'s typed strings — and it carries the same loose guard. It is left alone because it also serves stored batch records, whose as-made values are already numbers, so converting it would change how an existing record's total reads. Record it in the SUMMARY as a found-and-left observation; do not change it.
3. **`app/src/ui/RecipePage.jsx:674` (`toNumberOrNull`) is another item's work** (quick item `260909-oox`). Leave that line exactly as it is even though it sits four lines below a line this plan edits.
</scope_boundary>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: One predicate in the module that owns the rule</name>
  <files>app/src/domain/lineage.js, app/src/domain/lineage.test.js</files>
  <behavior>
    New tests in `app/src/domain/lineage.test.js`, in their own `describe('parseGramsDraft', ...)` placed after the existing `blockedSaveMessage` block:
    - `'60'` -> `60`; `'1.25'` -> `1.25`; `'0.5'` -> `0.5`
    - `'0'` -> `0` — a written zero is a value (D-11), and it must be `0`, never `null`
    - `''` -> `null`; `undefined` -> `null`
    - `'-5'` -> `null` (a leading minus)
    - `'1e3'` -> `null` (exponent notation)
    - `'1.2345'` -> `null` (more than two decimals)
    - `'4o'` -> `null` (a stray letter)
    - `' 5 '` -> `null` (surrounding whitespace)
    - The agreement property, as one test: for each of `'-5'`, `'1e3'`, `'1.2345'`, `'4o'` and `' 5 '`, `parseGramsDraft` returns `null` AND `blockedSaveMessage` returns a message ending `"'s amount is not a number"` — reuse the block's existing `validRows` helper and `oliveOilVersion`. This is the test that proves the figures and the gate read one rule.
  </behavior>
  <action>
    Export `parseGramsDraft(value)` from `app/src/domain/lineage.js`, placed directly beneath the `NUMERIC_GRAMS_PATTERN` constant at line 138 so the constant stays module-private and this predicate becomes its only reader. It returns `Number(value)` when the pattern matches the value and `null` otherwise — `''` and `undefined` reach `null` through the pattern itself, so give them no branch of their own. Give it a doc comment in the file's existing voice naming what it is for: the one rule every draft-grams reader takes, so the figure on screen and the sentence that blocks the save can never disagree.

    Then change `findBlockedRow`'s non-numeric branch (line 157) to test `parseGramsDraft(draftRow.grams) === null` rather than testing the pattern directly. Leave its blank branch above untouched and above it, so within one row the blank message still precedes the not-a-number message.

    The module stays framework-free: add no import, touch nothing that reaches the DOM or the store.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/domain/lineage.test.js</automated>
    <automated>grep -q 'export function parseGramsDraft' app/src/domain/lineage.js</automated>
    <automated>! grep -n 'if (!NUMERIC_GRAMS_PATTERN.test(draftRow.grams))' app/src/domain/lineage.js # findBlockedRow no longer reads the pattern itself; it goes through the predicate</automated>
    <automated>test "$(grep -v '^\s*[/*]' app/src/domain/lineage.js | grep -c 'NUMERIC_GRAMS_PATTERN')" = "2" # the const declaration and the one read inside parseGramsDraft — nothing else re-derives the rule</automated>
  </verify>
  <done>`parseGramsDraft` is exported, is the only reader of `NUMERIC_GRAMS_PATTERN`, and its new tests pass alongside the block's existing 45.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Every draft-grams reader takes the predicate</name>
  <files>app/src/ui/RecipePage.jsx, app/src/ui/IngredientTable.jsx, app/src/ui/IngredientTable.test.jsx</files>
  <behavior>
    A new block in `app/src/ui/IngredientTable.test.jsx`, placed after the existing `'a blocked save marks the offending row'` describe and mirroring that block's exact harness (`renderToStaticMarkup`, the `makeRow`/`makeVersion` helpers, `draftVersion={structuredClone(version)}`, `mode="developing"`, `openBatch={null}`, and its local `trContaining` helper).

    Use three rows summing to a round mass so every expected share is exact: `makeRow('a', 'Row A', 25, 1)`, `makeRow('b', 'Row B', 50, 1)`, `makeRow('c', 'Row C', 25, 1)` — `draftVersion` is a clone of the version, so the pen's `currentMass` is 100 and Row B's parent share is `50.0%`.

    - Table-driven over `'-5'`, `'1e3'`, `'1.2345'` and `'4o'` as Row B's draft grams: Row B's `<tr>` reads `50.0%` — the parent's own last good share. Each rejected value would otherwise have produced a different figure (`-5` -> `trace`, `1e3` -> `1000.0%`, `1.2345` -> `1.2%`), so also assert the `<tr>` carries none of those.
    - A written zero still takes effect: with Row B's draft grams `'0'`, Row B's `<tr>` reads `trace` and NOT `50.0%` — the fall-back is `??`, so a legitimate zero is never mistaken for a rejected value.
    - A valid value still takes effect: with Row B's draft grams `'25'`, Row B's `<tr>` reads `25.0%`.
  </behavior>
  <action>
    Import `parseGramsDraft` from `../domain/lineage.js` in both files — added to `RecipePage.jsx`'s existing named-import block from that module (lines 8-14), and as a new import line in `IngredientTable.jsx` beside its other domain imports (lines 2-6).

    Convert the four draft-grams readers, deleting each site's now-orphaned `const parsed = Number(...)` line:
    - `RecipePage.jsx` lines 490-492, `draftVersion`'s row map: `grams: parseGramsDraft(draftRow.grams) ?? row.grams`. Use `??`, never `||` — a typed `0` must stay `0` (D-11). This is the site that feeds `liveVersion` -> `buildFigures` -> the graduated rules.
    - `IngredientTable.jsx` lines 589-590: `const currentGramsValue = parseGramsDraft(draftRow.grams) ?? row.grams;`.
    - `RecipePage.jsx` lines 669-672, `handleSaveBatch`'s as-made loop: parse `rawValue` with the predicate and write `asMade[rowId]` only when the result is not `null`. A rejected cell is dropped exactly as a non-numeric one already is — add no message, no disabled control, no blocking rule (see `<scope_boundary>` 1). Leave `toNumberOrNull` on line 674 alone (`<scope_boundary>` 3).
    - `RecipePage.jsx` lines 992-993, the row map that builds a saved child or save-over: same one-line form as the first site. This one is already past the block and safe today; it is folded in so no reader re-derives the rule.

    Adjust an existing comment only where this change makes its wording untrue — the as-made loop's comment above line 669 now covers a rejected value as well as a stray letter. Do not name the guard being removed in any comment, old or new: describe the rule that is there now, not the one that was.

    Everything else in both files stays untouched.
  </action>
  <verify>
    <automated>npm --prefix app test</automated>
    <automated>! grep -rn 'Number\.isFinite' app/src/ui/ # no reader under app/src/ui re-derives the grams rule</automated>
    <automated>test "$(grep -v '^\s*[/*]' app/src/ui/RecipePage.jsx | grep -c 'parseGramsDraft')" = "4" # one import line plus the three call sites</automated>
    <automated>test "$(grep -v '^\s*[/*]' app/src/ui/IngredientTable.jsx | grep -c 'parseGramsDraft')" = "2" # one import line plus the one call site</automated>
    <automated>grep -qF "const toNumberOrNull = (raw) => (raw === '' ? null : Number(raw));" app/src/ui/RecipePage.jsx # left exactly as found — quick item 260909-oox's line, four lines below one this plan edits</automated>
  </verify>
  <done>All four readers take `parseGramsDraft`; the new component block passes; the whole suite is green at 30 files with the baseline 618 tests plus the additions.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| keyboard -> draft state | The maker types a free-text grams field; every value is an arbitrary string until a rule reads it. |
| draft state -> repository | `handleSaveBatch` -> `createBatch`/`recordAmendment` -> `repository` -> IndexedDB. A batch also `structuredClone`s the version's rows and coefficients, so anything crossing here is permanent in that snapshot. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-oow-01 | Tampering | `app/src/ui/RecipePage.jsx` `handleSaveBatch`'s as-made loop | medium | mitigate | Route the as-made read through `parseGramsDraft` so a negative, exponent-notation or three-decimal string is dropped before `createBatch`/`recordAmendment` writes it into the batch record and the version's coefficient snapshot (Task 2). |
| T-oow-02 | Tampering | `app/src/ui/RecipePage.jsx:490`, `app/src/ui/IngredientTable.jsx:589` — the live figures | low | mitigate | Same predicate at both reads, so a value the save gate rejects can never move a figure on screen; the figure holds at the parent's own stored grams (Task 2). |
| T-oow-03 | Denial of Service | `parseGramsDraft`'s regex | low | accept | `^\d+(\.\d{1,2})?$` has no nested or ambiguous quantifier and runs in linear time; the pattern is unchanged from the one already shipped, and its input is one short field. |
| T-oow-04 | Tampering | `asMade[rowId] = parsed` — a bracket write keyed by a stored row id | low | accept | Pre-existing and unchanged in shape by this plan: the ids come from a local draft seeded from a stored version, and the loop writes into a fresh object literal, so no prototype is reachable. Same family as the open medium T-03-10 recorded in `03-SECURITY.md`; not widened here and not closed here. |

No package-manager install task exists in this plan, so no supply-chain (`T-*-SC`) row applies and no package legitimacy gate is required. Highest severity is medium, below the configured `high` blocking threshold (ASVS L1) — nothing here blocks.
</threat_model>

<verification>
1. `npm --prefix app test` — green, 30 files, 618 baseline tests plus this plan's additions.
2. `! grep -rn 'Number\.isFinite' app/src/ui/` — no reader under `app/src/ui` carries a grams rule of its own.
3. `grep -n 'asMadeTotals' app/src/domain/batch.js` still shows the untouched function (`<scope_boundary>` 2), and `grep -n 'toNumberOrNull' app/src/ui/RecipePage.jsx:674` is unchanged (`<scope_boundary>` 3).
4. Manual, if the app is already running (not required to pass this plan): in the plan pen, type `-5` into a grams field — every graduated rule holds at its last good figure and Save's sentence names that row.
</verification>

<success_criteria>
- `parseGramsDraft` is exported from `app/src/domain/lineage.js`, built on `NUMERIC_GRAMS_PATTERN`, and is the module's only reader of that constant.
- All four named draft-grams readers take it; none re-derives the rule.
- `-5`, `1e3`, `1.2345` and `4o` leave the pen's figures at the parent's own grams; `0` and `25` still take effect.
- A rejected as-made cell is dropped at save; the batch pen gained no blocking rule.
- `npm --prefix app test` passes.
</success_criteria>

<output>
Create `.planning/quick/260909-oow-make-the-live-balance-figures-accept-exa/260909-oow-SUMMARY.md` when done.

Record in it: the two found-and-left observations from `<scope_boundary>` (`asMadeTotals` as a fifth loose reader; `toNumberOrNull` as `260909-oox`'s work), and one named consequence — a batch record saved before this fix that holds an as-made value the rule rejects loses that cell when the batch is amended, because `handleStartAmending` refills the draft with `String(value)` at line 636 and the save now drops it. That is this task's own stated rule applied to old data; no migration and no exception was added for it.
</output>
