---
phase: quick-260909-oox
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/BatchMargin.jsx
  - app/src/ui/BatchMargin.test.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipePage.test.jsx
autonomous: true
requirements: [QUICK-260909-oox]

must_haves:
  truths:
    - "The three measured fields that cannot be negative — Air (Overrun), Melt test (Meltdown loss) and Time to temperature (Come-up) — refuse a value below zero at the field itself."
    - "Out of the machine (Draw temperature) still takes and saves −6, sign intact, with no floor of its own."
    - "Tasting temperature, which is also legitimately negative, is left exactly as it was."
    - "A draft field that is not a finite number saves as nothing written, never as a stored NaN."
    - "A written 0 still saves as 0 — presence over truthiness, unchanged."
    - "No field is coloured, outlined, or otherwise marked by this change; the four-colour system is untouched."
  artifacts:
    - "app/src/ui/BatchMargin.jsx — min=\"0\" on exactly three number inputs."
    - "app/src/ui/RecipePage.jsx — one exported toNumberOrNull carrying the finiteness guard, replacing the two identical local copies."
    - "app/src/ui/BatchMargin.test.jsx — the floor is asserted on the three, and its absence asserted on the two signed fields."
    - "app/src/ui/RecipePage.test.jsx — a unit suite over toNumberOrNull."
  key_links:
    - "BatchMargin input min=\"0\" -> the browser's own range check (rangeUnderflow, stepper clamp) — no app-side rule, no colour."
    - "RecipePage toNumberOrNull -> churnFields (handleSaveBatch) and tastingFields (handleSaveTasting) -> createBatch/recordAmendment/addTasting -> repository.saveBatch."
---

<objective>
Two impossible values can reach a stored batch record today: a negative one, because three number
fields that have no meaning below zero carry no floor; and a non-number one, because
`toNumberOrNull` only tests for the empty string, so any unparsable ink becomes a stored `NaN`
that `readMeasured` will later print as the word "NaN" forever.

Purpose: the record is the thing the next version cites. A stored −24 % air or a stored NaN is a
lie in the citation, and neither can be corrected into "the maker never wrote this" once saved.
Output: a floor on the three fields that need one, none on the two that must keep their sign, and
one finiteness guard in one place, with tests holding all of it.

Scope discipline (CLAUDE.md §2, §3): no blocking save rule is added to the batch pen, no field is
coloured or outlined, no CSS is touched, and nothing about grams is touched — that is sibling item
260909-oow's, in this same file.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@app/src/ui/BatchMargin.jsx
@app/src/ui/BatchMargin.test.jsx
@app/src/ui/RecipePage.jsx
@app/src/ui/RecipePage.test.jsx
</context>

<grounded_facts>
Verified against the working tree before planning — build on these, do not re-derive them.

1. **The label map.** The task names fields by their settled interface labels
   (`product-requirements/05-domain-and-language.md` § "Interface labels settled on the recipe
   page"); the code still carries the old ones. The mapping, and it is the only consistent reading
   of the task:

   | Task's name | Code label / aria-label | Field | BatchMargin.jsx | Floor? |
   |---|---|---|---|---|
   | Time to temperature | `Come-up, minutes` | `comeUpMinutes` | input at line 150 | yes |
   | Out of the machine | `Draw temperature, degrees Celsius` | `drawTempC` | input at line 162 | **no** — legitimately −6 |
   | Air | `Overrun, percent` | `overrunPercent` | input at line 174 | yes |
   | Melt test | `Meltdown loss, grams` | `meltdownLossG` | input at line 84, in `TastingForm` | yes |
   | (not named by the task) | `Tasting temperature, degrees Celsius` | `tastingTempC` | input at line 61 | **no** — leave untouched |

   The task's line citation "lines 150-176" is imprecise: that range holds come-up, draw
   temperature and overrun, and draw temperature is the one it explicitly exempts. Melt test lives
   at line 84 in `TastingForm`. Trust the names, not the range.

2. **Corroboration from the reading state.** `readMeasured(value, { signed: true })` is passed for
   exactly two fields — `drawTempC` (BatchMargin.jsx:230) and `tastingTempC` (BatchMargin.jsx:38).
   Those are precisely the two that must keep a sign and must not get a floor. The other three read
   unsigned.

3. **Five number inputs exist in the app, all in BatchMargin.jsx** (lines 61, 84, 150, 162, 174).
   `grep -rn 'type="number"' app/src` returns those five and nothing else. After this change exactly
   three of them carry a floor.

4. **No `min=` attribute exists anywhere in `app/src` today** — this change introduces the first
   three, so a whole-file count of the attribute is an honest gate.

5. **No `:invalid` or `:valid` rule exists in `app/src/styles/`** (verified: zero matches). Adding
   the attribute therefore introduces no colour, no outline, and no state-carrying styling — the
   four-colour system stays intact and `app/src/styles/` needs no edit at all.

6. **`toNumberOrNull` is defined twice, identically**, as a local `const` inside two handlers:
   `handleSaveBatch` (RecipePage.jsx:674, feeding `comeUpMinutes`, `drawTempC`, `overrunPercent`)
   and `handleSaveTasting` (RecipePage.jsx:772, feeding `tastingTempC` and `meltdownLossG`). Both
   read `(raw) => (raw === '' ? null : Number(raw))`. Melt test — one of the three fields this task
   names — saves through the second copy, so guarding only the first would leave the task's own
   field set half-guarded. One exported helper, used by both, is the fix; the repo already
   establishes that shape (`isDraftDirty`, `isPenDraftDirty`, `derivePenState` are module-level
   exports in this same file, unit-tested from `RecipePage.test.jsx`), and it is what makes the
   guard testable at all in a suite with no DOM.

7. **`toTextOrNull` is also duplicated in both handlers.** It carries no NaN risk. Leave it alone.

8. **`Number(' ')` is 0, and the finiteness guard will not catch it.** Unreachable from the UI: a
   browser's `type="number"` control sanitises whitespace-only input to `''` before it reaches
   React's `onChange`. Do not add trimming — it is not asked for and it is not reachable.

9. **The test suites are node-environment, `renderToStaticMarkup`, no jsdom, no testing-library**
   (`app/vitest.config.js` sets `environment: 'node'`; every `*.test.jsx` renders to markup and
   asserts with regexes). So "rejected at the field" is asserted as the rendered attribute, which is
   what hands the rejection to the browser; there is no DOM in which to assert `rangeUnderflow`. Do
   not add jsdom, testing-library, or any dependency for this.

10. **`RecipePage.test.jsx` already stubs the repository** at module load
    (`vi.mock('../store/repository.js', () => ({ repository: {} }))` at line 14) and already imports
    named exports from `RecipePage.jsx`. A new export is unit-testable there with no new plumbing.

11. **Existing tests that must stay green, unweakened**: BatchMargin.test.jsx:209-215 matches
    `/<input[^>]*class="ink-field"[^>]*aria-label="Come-up, minutes"/` and :217-221 extracts the
    come-up input by aria-label. React serialises attributes in JSX prop order, so placing `min`
    directly after `step` (before `inputMode`/`className`) leaves both regexes matching.

12. **Baseline**: `npm --prefix app test` is green — 30 files, 618 tests.

13. **Sibling item 260909-oow edits this same `RecipePage.jsx`** at lines 491-492, 670-673 and 993
    (the grams rule). Line 670-673 is adjacent to the `toNumberOrNull` at 674. Do not touch grams,
    `draftVersion`, `currentGramsValue`, or the `asMade` filter loop — leave that hunk exactly as
    found so the coordinator's serialized merge stays clean.
</grounded_facts>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: A floor on the three fields that cannot go below zero — and on no others</name>
  <files>app/src/ui/BatchMargin.test.jsx, app/src/ui/BatchMargin.jsx</files>

  <read_first>
    Read grounded facts 1, 2, 3, 5, 9 and 11 above before touching the component: the label map is
    the whole of the decision here, the two signed fields are the whole of what must stay untouched,
    and fact 11 names the two existing regexes that constrain where the attribute may sit.
    Read `app/src/ui/BatchMargin.test.jsx` lines 14-30 (the `renderMargin` helper), 74-79
    (`emptyDraft`), 115-123 (`emptyTastingDraft`) and 217-221 (the extract-by-aria-label pattern) —
    reuse those fixtures and that pattern rather than inventing new ones.
  </read_first>

  <behavior>
    Write these cases into `app/src/ui/BatchMargin.test.jsx` first and watch them fail, then make
    them pass. Add one new `describe` block; do not modify any existing case.

    Extract each input the way line 218 already does — match the whole self-closing tag by its
    aria-label, then assert on that string — so no assertion depends on attribute order.

    Churn fields, rendered with `{ mode: 'recording', draft: emptyDraft }`:
    - Test 1 — the two unsigned churn fields carry the floor: the tag matched by
      `/<input[^>]*aria-label="Come-up, minutes"[^>]*\/>/` contains `min="0"`, and so does the tag
      matched by `/<input[^>]*aria-label="Overrun, percent"[^>]*\/>/`.
    - Test 2 — the drawn temperature has no floor: the tag matched by
      `/<input[^>]*aria-label="Draw temperature, degrees Celsius"[^>]*\/>/` does not contain `min=`.
      Name in the case's own title why: the working case draws at −6 °C, so a floor here would
      reject the real reading.

    Tasting fields, rendered with
    `{ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading', tastingDraft: emptyTastingDraft }`:
    - Test 3 — the melt test carries the floor: the tag matched by
      `/<input[^>]*aria-label="Meltdown loss, grams"[^>]*\/>/` contains `min="0"`.
    - Test 4 — the tasting temperature does not: the tag matched by
      `/<input[^>]*aria-label="Tasting temperature, degrees Celsius"[^>]*\/>/` does not contain
      `min=`, for the same reason as Test 2 — ice cream is tasted below zero.
  </behavior>

  <action>
    One attribute, three times, in `app/src/ui/BatchMargin.jsx`. Nothing else in this file changes.

    Add `min="0"` to the number input for `comeUpMinutes` (line 150), for `overrunPercent`
    (line 174), and for `meltdownLossG` (line 84, inside `TastingForm`). Place it directly after the
    existing `step` prop on each, before `inputMode` — fact 11: two existing regexes read the
    attribute run between `<input` and `aria-label`, and this position keeps both matching.

    Do **not** add it to `drawTempC` (line 162) or `tastingTempC` (line 61). Those two are the
    signed fields (fact 2); a floor on either would reject a real reading.

    Add one short comment above the come-up field, in the file's existing voice, saying which
    measured fields have no meaning below zero and which two keep their sign and why. Keep the
    attribute text itself out of the comment prose so the count gate below stays honest.

    Do not add CSS, a class, an `:invalid` rule, an aria-invalid attribute, a hint paragraph, or any
    app-side save rule: the attribute hands the rejection to the browser's own control, and the
    four-colour system admits no colour that carries state (fact 5). Do not touch
    `app/src/styles/`. Do not touch `app/src/ui/RecipePage.jsx` in this task.
  </action>

  <verify>
    <automated>npm --prefix app test -- src/ui/BatchMargin.test.jsx &amp;&amp; test "$(grep -vE '^[[:space:]]*(//|\*)' app/src/ui/BatchMargin.jsx | grep -c 'min="0"')" -ge 3 &amp;&amp; git diff --quiet HEAD -- app/src/styles/ &amp;&amp; git diff --quiet HEAD -- app/src/ui/RecipePage.jsx</automated>
    <note>The count gate strips comment lines before counting, so a comment naming the attribute can never satisfy its own gate. It proves the floor arrived on at least three fields; proving it arrived on no others is the suite's job, not grep's — Tests 2 and 4 assert the absence on each signed input's own rendered tag, which is the only honest way to read a multi-line JSX element. The last two gates exit non-zero if this task touched styles or RecipePage.jsx at all.</note>
  </verify>

  <done>Come-up, Overrun and Meltdown loss render with min="0"; Draw temperature and Tasting temperature render with no min at all; the four new cases and all pre-existing BatchMargin cases pass; no stylesheet changed.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: One finiteness guard, in one place, on the way to the store</name>
  <files>app/src/ui/RecipePage.test.jsx, app/src/ui/RecipePage.jsx</files>

  <read_first>
    Read grounded facts 6, 7, 8, 10 and 13 above. Fact 6 is why this is one exported helper and not
    the same one-line change written twice; fact 13 is the hunk in this file you must leave exactly
    as found. Read `app/src/ui/RecipePage.jsx` lines 200-218 (`derivePenState`, the last
    module-level export before the component) for the insertion point, lines 665-686
    (`handleSaveBatch`) and lines 770-780 (`handleSaveTasting`) for the two call sites. Read
    `app/src/ui/RecipePage.test.jsx` lines 1-21 for the repository stub and the import line.
  </read_first>

  <behavior>
    Write these cases into `app/src/ui/RecipePage.test.jsx` first and watch them fail, then make
    them pass. Add `toNumberOrNull` to the existing named import from `./RecipePage.jsx` and add one
    new `describe` block; do not modify any existing case.

    - Test 1 — nothing written stays nothing: `toNumberOrNull('')` is `null`.
    - Test 2 — a written figure is that figure: `toNumberOrNull('20')` is `20`.
    - Test 3 — a negative reading keeps its sign: `toNumberOrNull('-6')` is `-6`. Name the working
      case in the title: the batch drew at −6 °C, and out of the machine is legitimately negative.
    - Test 4 — a written zero is a value, not an absence: `toNumberOrNull('0')` is `0`, not `null`
      (presence over truthiness, the discipline `isDraftDirty` and `domain/batch.js` already keep).
    - Test 5 — unparsable ink is nothing written, never a stored NaN: `toNumberOrNull('4o')` and
      `toNumberOrNull('abc')` are both `null`.
    - Test 6 — an infinite figure is not a reading either: `toNumberOrNull('Infinity')` is `null`.
  </behavior>

  <action>
    In `app/src/ui/RecipePage.jsx`, add one module-level export immediately after `derivePenState`'s
    closing brace (line 214) and before the comment block that heads `RecipePage`:

    `export function toNumberOrNull(raw)` — returns `null` when `raw` is the empty string; otherwise
    coerces with `Number` and returns that number only when `Number.isFinite` holds, `null`
    otherwise. Comment it in the file's existing voice: a field the maker left blank and a field
    holding ink that is not a number are the same fact — nothing written — and neither may become a
    stored `NaN`, which `readMeasured` would print as the word "NaN" in the record forever. Note in
    the comment that a written 0 is a value and still returns 0.

    Then delete both of the helper's local arrow-function definitions — the one-line declaration at
    RecipePage.jsx:674 inside `handleSaveBatch`, and its identical twin at RecipePage.jsx:772 inside
    `handleSaveTasting` — leaving both call sites' expressions unchanged; they now resolve to the
    module-level export. Zero local declarations of it may remain. Both handlers are
    inside the component and in scope of it. The duplication is what forces the fix, so it goes: one
    rule, one place, one test (fact 6).

    Leave `toTextOrNull` alone in both handlers (fact 7). Leave the `asMade` loop at lines 670-673,
    `draftVersion` at 491-492 and line 993 exactly as found — that is sibling item 260909-oow's
    territory in this same file (fact 13). Add no trimming (fact 8), no clamping, no negative check,
    and no blocking save rule: whether a bad value should block the batch save is a brief question
    owned by `.impeccable/surfaces/route-recipe-batch.md`, not this task.
  </action>

  <verify>
    <automated>npm --prefix app test -- src/ui/RecipePage.test.jsx &amp;&amp; grep -q 'export function toNumberOrNull' app/src/ui/RecipePage.jsx &amp;&amp; test "$(grep -vE '^[[:space:]]*(//|\*)' app/src/ui/RecipePage.jsx | grep -c 'const toNumberOrNull')" -eq 0 &amp;&amp; test "$(grep -vE '^[[:space:]]*(//|\*)' app/src/ui/RecipePage.jsx | grep -c 'toNumberOrNull(')" -ge 6</automated>
    <note>The two count gates strip comment lines first (a comment naming the symbol cannot satisfy its own gate) and are read together: zero local `const` definitions left, and at least six live call expressions — the five measured fields plus the definition itself — proves the two copies collapsed into one rather than one call site being dropped.</note>
  </verify>

  <done>toNumberOrNull is a single exported function carrying the finiteness guard; both save handlers call it with no local copy; '' and unparsable ink both save as null, '0' saves as 0, '-6' saves as -6; the new cases and all pre-existing RecipePage cases pass.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| maker's keyboard → batch draft state | Untrusted free text enters the app as draft strings; `type="number"` is the only filter today. |
| draft state → repository seam → IndexedDB | The point of no return: `repository.saveBatch` writes a record that later versions cite and that has no correction path for a stored NaN. |

No network boundary is crossed: the store is local, single-user IndexedDB behind
`app/src/store/repository.js`. No external model call, no import, no server (TRUST-01, IMP-01).

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-oox-01 | Tampering | `toNumberOrNull` → `createBatch`/`recordAmendment`/`addTasting` → `repository.saveBatch` | medium | mitigate | Task 2: finiteness guard in the single exported helper, so unparsable ink saves as "nothing written" and a `NaN` — which `readMeasured` would print as the word "NaN" in every later reading of that record — can never be persisted. |
| T-oox-02 | Tampering | `BatchMargin` number inputs | low | mitigate | Task 1: `min="0"` on the three measured fields that have no meaning below zero, so the browser's own range check rejects a negative reading before it becomes a draft the maker intends to save. |
| T-oox-03 | Tampering | client-side validation bypass (DevTools, a programmatic value, a pasted value in a lenient engine) | low | accept | `min` is advisory: a determined maker can still get a negative Air past it. Accepted — the store is this maker's own local IndexedDB, there is no server or second party to defend, and adding a blocking save rule to the batch pen is a brief question owned by `.impeccable/surfaces/route-recipe-batch.md`, explicitly out of this task's scope. ASVS L1: input validation at the boundary that exists. |
| T-oox-04 | Information disclosure | rendered record prose | low | accept | Unchanged by this plan: notes and prose still render as text, never as markup; no `dangerouslySetInnerHTML` is introduced. |
| T-oox-SC | Tampering | npm/pip/cargo installs | high | mitigate | No package is installed by this plan and no dependency is added: `app/package.json` and `app/package-lock.json` are untouched, and no test here needs jsdom or testing-library (fact 9). No legitimacy audit is required because there is no install task. |
</threat_model>

<verification>
Run from the repo root, in order:

1. `npm --prefix app test` — the whole suite green, no case below the 618-test baseline (fact 12);
   the new BatchMargin and RecipePage cases are additions, so the count rises.
2. `npm --prefix app run build` — clean.
3. `git diff --stat` names exactly four files: `app/src/ui/BatchMargin.jsx`,
   `app/src/ui/BatchMargin.test.jsx`, `app/src/ui/RecipePage.jsx`,
   `app/src/ui/RecipePage.test.jsx`. Anything under `app/src/styles/`, `app/package.json`, or a
   grams-related hunk in `RecipePage.jsx` is out of scope and must not appear.
4. `grep -rn 'type="number"' app/src` still returns five inputs, three of which now carry a floor.
</verification>

<success_criteria>
- A negative figure typed into Air, Melt test, or Time to temperature is refused by the field
  itself, with no colour, outline, or app-authored message added anywhere.
- −6 typed into Out of the machine is accepted, saves as `-6`, and still reads back as `−6`.
- Tasting temperature is byte-for-byte unchanged.
- Ink that is not a number saves as nothing written; a `NaN` cannot reach `repository.saveBatch`.
- A written 0 still saves as 0.
- `npm --prefix app test` and `npm --prefix app run build` are green; no dependency added; no
  stylesheet touched; no grams behaviour touched.
</success_criteria>

<output>
Create `.planning/quick/260909-oox-reject-impossible-negative-measured-valu/260909-oox-SUMMARY.md`
when done.
</output>
