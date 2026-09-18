---
phase: quick-260918-jki
plan: 01
type: execute
wave: 1
depends_on: []
autonomous: true
requirements:
  - HIST-01
  - HIST-02
  - HIST-03
  - HIST-04
  - HIST-05
  - HIST-06
  - HIST-07
files_modified:
  - app/src/domain/batch.js
  - app/src/domain/batch.test.js
  - app/src/ui/RecipeHistory.jsx
  - app/src/ui/RecipeHistory.test.jsx
  - app/src/ui/BatchRow.jsx
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/VersionRow.jsx
  - app/src/ui/VersionRow.test.jsx

estimate:
  tokens: 45000
  raw_tokens: 45000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "The Version row's History disclosure reads exactly `History` — no number, no version word, no parentheses — and still discloses the recipe-level development outline (HIST-01)."
    - "The Batches disclosure still reads `Batches (n)` where n counts every batch of the version in view, the one being read included (HIST-02) — unchanged from HEAD."
    - "An attempt is named `Batch · [churn date]` in BOTH the History outline and the Batches register, from one shared function, so the two lists cannot drift (HIST-03)."
    - "An attempt's provenance line reads `Tasted [tasting date]` or `Not yet tasted` in BOTH panels, from one shared function; an undated tasting reads `Tasted date unknown` through the existing recordDateWords (HIST-04)."
    - "A version with no attempts reads `Not yet churned` in the History outline (HIST-05)."
    - "`From batch · [churn date]` is the only citation label in app/src; the retired one appears nowhere, comments included (HIST-06)."
    - "In the Batches register the provenance leads and the machine measurements / At the machine words follow it as supporting evidence — they never stand alone as the row's provenance (HIST-07)."
    - "Absence is stated once per attempt: an untasted attempt says so in its provenance line and renders no second absence sentence in its outcome slot (HIST-04)."
    - "`npm --prefix app test -- --run` passes with no fewer than the 1041 assertions that pass at HEAD, minus only the two count-only History tests this plan retires (HIST-01)."
    - "No file under app/src/styles is touched: this change carries no CSS, so the tokens-only rule is satisfied by having nothing to declare."
  artifacts:
    - app/src/domain/batch.js
    - app/src/ui/RecipeHistory.jsx
    - app/src/ui/BatchRow.jsx
    - app/src/ui/VersionRow.jsx
  key_links:
    - "app/src/domain/batch.js runs under Vitest's node environment and must stay framework-free: the two new functions are pure string builders over a batch record, with no import beyond what the file already has."
    - "`augustSecondBatch` (app/src/data/batch-2026-08-02.js) has a tasting whose `tastedDate` is null. So `tastingProvenance(augustSecondBatch)` is the string `Tasted date unknown`, NOT a formatted date. Every BatchRow assertion that touches the provenance must expect that exact string."
    - "BatchRow.test.jsx:1354 pins batchHistoryMetaFor's whole array with toEqual. Prepending the provenance changes that array, so the assertion moves with the code or the suite fails."
    - "BatchRow.test.jsx:1363 expects an empty array for a batch stripped of its three supporting facts. That batch still HAS a tasting, so the array is no longer empty — it holds the provenance alone."
    - "RecipeHistory.test.jsx:216 asserts `Tasted date unknown`. The string survives this change but its source moves from the outcome paragraph to the provenance line; keep the assertion and anchor it to the provenance."
    - "A gate greps app/src for each retired string. A code comment quoting one verbatim fails the gate — name the change without quoting the old words, exactly as the existing comment at BatchRow.jsx:315 does."
    - "VersionRow.jsx's `versionCount` exists only to build the retired count label and to guard the control's render. Once the label loses the count the variable is an orphan of this change: remove it and guard on recipeVersions.length."
---

<objective>
Implement the revised owning-history contract in `app/`, as it stands in the working tree at
`.impeccable/surfaces/route-recipe-version.md` § "History is the development outline"
(revised 2026-09-18, clarified 2026-09-18, around line 140) and
`.impeccable/surfaces/route-recipe.md` § 6 "History and Batches have different scopes"
(around line 91). Those two paragraphs are the authority; the Contract diff below is their
whole reach into this codebase, already measured against HEAD.

Purpose: one attempt identity and one attempt provenance, shared by the recipe-level History
outline and the version-level Batches register, so a maker never learns two names for one
record — and one citation label, so a version's cause reads the same wherever it is printed.

Output: eight files changed, no CSS, no new component, no new class. Two new pure functions in
the domain, four label sites corrected, the affected assertions moved with them.
</objective>

## Contract diff — current behaviour against the brief

Measured against the working tree on 2026-09-18. The executor implements this table; it does not
re-derive it from the briefs. Line numbers are HEAD's and may shift by a line as edits land.

<!-- planner-discipline-allow: After batch -->
<!-- planner-discipline-allow: Churned and tasted -->
<!-- planner-discipline-allow: No batch recorded -->
<!-- planner-discipline-allow: No tasting recorded -->
<!-- planner-discipline-allow: History ( -->

| # | Contract item | Site | Current (HEAD) | Target |
|---|---|---|---|---|
| HIST-01 | History disclosure has no count | `VersionRow.jsx:274` | `` {`History (${versionCount} version${versionCount === 1 ? '' : 's'})`} `` | `History` — a plain string child, nothing else |
| HIST-01 | …and its render guard | `VersionRow.jsx:268` | `{versionCount > 0 && (` | `{recipeVersions.length > 0 && (`, and `const versionCount = …` (line ~95) deleted |
| HIST-01 | …panel and outline naming | `VersionRow.jsx:313`, `RecipeHistory.jsx:196` | panel `title="History"`; nav `aria-label="Recipe development history"` | **already conforms** — do not touch |
| HIST-02 | Batches (n) counts every attempt of the version in view | `BatchRow.jsx:493,527` | `batchCount = batches.length`; `` {`Batches (${batchCount})`} `` | **already conforms** — do not touch |
| HIST-03 | Shared link identity `Batch · [churn date]` | `RecipeHistory.jsx:67` | `` const label = `Batch · ${churnDate}` `` (right words, local copy) | reads the shared `batchIdentity(batch)` |
| HIST-03 | …the same identity in the register | `BatchRow.jsx:334` + its three render branches (338–346) | `dateWords = recordDateWords(batch.churn.churnDate)` → link text is the bare date | link/plain text is `batchIdentity(batch)` |
| HIST-04 | Shared attempt provenance | `RecipeHistory.jsx:79` | `{batch.tasting ? 'Churned and tasted' : 'Churned'}` | `{tastingProvenance(batch)}` |
| HIST-04 | …the same provenance in the register | `BatchRow.jsx:319-326` `batchHistoryMetaFor` | returns `[out of machine …, At the machine words, changed …]` | returns `[tastingProvenance(batch), …those same three]` — provenance first |
| HIST-04 | …absence stated once | `RecipeHistory.jsx:53` `tastingOutcome` | returns `'No tasting recorded'` when there is no tasting | returns `null`; the provenance already says it |
| HIST-04 | …no duplicate tasted line | `RecipeHistory.jsx:61` `tastingOutcome` | falls back to `` `Tasted ${recordDateWords(...)}` `` | returns `null`; the provenance now carries that sentence |
| HIST-05 | A version with no attempts | `RecipeHistory.jsx:157` | `<p className="recipe-history__empty">No batch recorded</p>` | same element, text `Not yet churned` |
| HIST-06 | Sole citation label | `RecipeHistory.jsx:125` | `After batch ·{' '}` | `From batch ·{' '}` |
| HIST-06 | …the version row's own citation | `VersionRow.jsx:132,247` | `From batch` | **already conforms** — do not touch |
| HIST-07 | Machine words are supporting evidence | `BatchRow.jsx` `batchHistoryMetaFor` | the machine parts ARE the row's only provenance line | they follow the provenance in the same small-print line |
| HIST-07 | …the batch reading view's own tasting head | `BatchRow.jsx:235`, `:944` | `tasted {date}` in the Tasting head; At the machine prose in the read view | **out of scope** — that is the batch's own record, not a panel row. Do not touch |
| HIST-07 | Distinct scopes | `RecipeHistory.jsx:196`, `BatchRow.jsx:330-331` | `Recipe development history` vs `Batches of this version` | **already conforms** — pin it with one assertion, change nothing |

Nothing else in the candidate list needs a change: `domain/lineage.js`, `store/repository.js`,
`store/transfer.js`, `styles/app.css`, `styles/cross-cutting.test.js`, `ui/RecipeList.jsx`,
`ui/RecipePage.jsx` and `ui/History.jsx` carry none of these strings (verified by grep). Leave
them alone.

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/mark/Documents/projects/sprinkles/CLAUDE.md
@/Users/mark/Documents/projects/sprinkles/.claude/CLAUDE.md
@/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipeHistory.jsx
@/Users/mark/Documents/projects/sprinkles/app/src/ui/History.jsx
@/Users/mark/Documents/projects/sprinkles/app/src/domain/batch.js

House rules that bind this task: simplicity first; surgical changes (every changed line traces to
the table above); plain words and short sentence-case labels; prose renders as text, never markup;
domain modules stay framework-free. Test command: `npm --prefix app test -- --run`. HEAD baseline:
38 files, 1041 tests, all passing.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: One attempt identity and one attempt provenance, in the domain, wired into both panels</name>
  <files>app/src/domain/batch.js, app/src/domain/batch.test.js, app/src/ui/RecipeHistory.jsx, app/src/ui/BatchRow.jsx, app/src/ui/BatchRow.test.jsx</files>
  <read_first>
app/src/domain/batch.js (read `recordDateWords` and the export style around it),
app/src/ui/RecipeHistory.jsx lines 52-90 (`tastingOutcome`, `BatchAttempt`),
app/src/ui/BatchRow.jsx lines 313-357 (`batchHistoryMetaFor`, `BatchHistoryPanel`),
app/src/ui/BatchRow.test.jsx lines 1297-1366 (the register and meta tests),
app/src/data/batch-2026-08-02.js lines 50-70 (the fixture's tasting: `tastedDate` is null).
  </read_first>
  <behavior>
    - `batchIdentity(batch)` returns `Batch · 2 Aug 2026` for a batch churned 2026-08-02.
    - `batchIdentity(batch)` returns `Batch · date unknown` when the churn date is absent — through the existing `recordDateWords`, no second unknown-words rule.
    - `tastingProvenance(batch)` returns `Tasted 3 Aug 2026` for a tasting dated 2026-08-03.
    - `tastingProvenance(batch)` returns `Tasted date unknown` for a tasting with no date (the seeded 2 Aug case).
    - `tastingProvenance(batch)` returns `Not yet tasted` when the batch carries no tasting at all.
    - `batchHistoryMetaFor(augustSecondBatch)` reads `['Tasted date unknown', 'out of machine −6 °C', 'Soft, not greasy']` — the provenance first, the supporting evidence after it.
    - `batchHistoryMetaFor` on a batch with no tasting and none of the three supporting facts reads `['Not yet tasted']` — never an empty list.
  </behavior>
  <action>
Add two exported pure functions to `app/src/domain/batch.js`, beside `recordDateWords` and in the
file's own comment style (a short block saying what the function is FOR, per the Contract diff row
it serves). No import is added; the file stays framework-free and DOM-free, since its suite runs
under the node environment.

`batchIdentity(batch)` builds the shared attempt identity named in HIST-03: the word `Batch`, the
middot separator the page already uses, then `recordDateWords(batch.churn.churnDate)`.
`tastingProvenance(batch)` builds the shared attempt provenance named in HIST-04: with a tasting,
the word `Tasted` then `recordDateWords(batch.tasting.tastedDate)`; with none, `Not yet tasted`.
Both read the same nested shapes the callers already read (`batch.churn.churnDate`,
`batch.tasting`), and neither invents a fallback the domain does not already have.

Write the `batch.test.js` describe blocks for both functions FIRST, from the behaviour list above, in
the style of the file's existing `formatRecordDate` block; watch them fail; then add the functions.

Then wire both call sites, so one string reaches both panels:

In `RecipeHistory.jsx`, import `batchIdentity` and `tastingProvenance` from `../domain/batch.js`
and use them in `BatchAttempt` — `label` becomes `batchIdentity(batch)` (the words are identical,
so no assertion moves; the point is that the copy is gone), and the `HistoryProvenance` child
replaces the two state words with `tastingProvenance(batch)`. Keep the `recipe-history__batch-state`
class and the element exactly as they are.

In `BatchRow.jsx`, import both too. `batchHistoryMetaFor` returns the provenance as its FIRST part
and then pushes its existing three parts unchanged, so the joined line reads provenance first and
the machine evidence after it — HIST-07's "supporting evidence, not a replacement". Because that
array can no longer be empty, drop the now-dead `metaParts.length > 0 &&` guard in
`BatchHistoryPanel` and render `<HistoryProvenance>` unconditionally. In the same component replace
the bare `dateWords` with `batchIdentity(batch)` in all three branches (in view, pen open, linked),
keeping `recordDateWords` only if some other line still needs it — if nothing does, remove the now
orphaned local.

Update the `batchHistoryMetaFor` comment above it: it currently explains what the meta line holds
and must now say the provenance leads. Do not quote any string from the Contract diff's "Current"
column in a comment — a gate greps `app/src` for those, comments included; name the change the way
the existing comment names the retired plural wording, without reprinting it.

Move the three assertions that pin the old array: the whole-array `toEqual` (BatchRow.test.jsx
~1354), the empty-array case (~1363, which keeps its tasting so it now reads the provenance alone —
rename the test to say so, and add the no-tasting variant from the behaviour list), and the
"never reads tasted" test (~1348), whose real subject is the retired plural counting: retarget its
regex to the counting words (`once`, `twice`, `times`), as the sibling test at ~1262 already does.
Add one assertion to the register test at ~1303 that the linked, not-in-view row's text carries the
shared identity, not a bare date.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run src/domain/batch.test.js src/ui/BatchRow.test.jsx</automated>
    <automated>! grep -rn "Churned and tasted" app/src</automated>
    <automated>grep -rn "batchIdentity\|tastingProvenance" app/src/domain/batch.js app/src/ui/RecipeHistory.jsx app/src/ui/BatchRow.jsx | grep -vc "^$"</automated>
  </verify>
  <done>
`batchIdentity` and `tastingProvenance` exist in `app/src/domain/batch.js` with tests covering all
seven behaviour cases; both panels call them; the two state words are gone from `app/src`;
`app/src/domain/batch.js` still imports nothing framework-shaped; the batch and BatchRow suites pass.
  </done>
</task>

<task type="auto">
  <name>Task 2: The History outline's own words — the citation, the unchurned version, and absence said once</name>
  <files>app/src/ui/RecipeHistory.jsx, app/src/ui/RecipeHistory.test.jsx</files>
  <read_first>
app/src/ui/RecipeHistory.jsx lines 52-62 (`tastingOutcome`) and 110-160 (`VersionNode`),
app/src/ui/RecipeHistory.test.jsx lines 99-160 and 191-218 (the assertions that move).
  </read_first>
  <action>
Three label corrections in `RecipeHistory.jsx`, all from the Contract diff:

HIST-06: the citation line in `VersionNode` (~line 125) takes the one citation label the brief
allows — the same two words the Version row already prints for the same fact. The middot, the
`{' '}`, the link and the pen-open plain-text branch beneath it are unchanged.

HIST-05: the no-attempts paragraph in `VersionNode` (~line 157) reads `Not yet churned`, keeping
its `recipe-history__empty` class and its element.

HIST-04: `tastingOutcome` stops speaking about tasting state. It returns the authored outcome only —
the tasting note, or the recorded defects joined with the middot (including the declared flaw) — and
returns `null` in both of its remaining branches: no tasting at all, and a tasting with neither note
nor defects. Those two sentences are now the provenance line's job, and printing them twice is the
duplication the shared provenance exists to end. In `BatchAttempt`, hold the result in a local and
render the outcome `<p>` only when it is non-null; the `prose-text` class still rides on
`batch.tasting?.note`, since defect words are not prose. The `Next time` line beneath is untouched.

Then move the assertions in `RecipeHistory.test.jsx`:
- the two citation assertions (~122, ~215) expect the new label with the same `· <a href=…` shape;
- the untasted test (~142-147) expects the provenance sentence instead of the retired one, and gains
  an assertion that the row renders no `recipe-history__outcome` paragraph at all — absence is stated
  once. Rename the test to say what it now proves;
- the unknown-dates test (~216) keeps `Tasted date unknown` but anchors it to the provenance element
  (`recipe-history__batch-state`), since that is where the string now lives;
- the tests that pin the authored outcome (the note at ~119, the defects at ~159) must keep passing
  untouched — if either needs editing, the outcome rule was cut too deep;
- add one assertion that a version with no attempts reads the unchurned sentence.

No CSS, no class, no new element. Do not quote any "Current" string from the Contract diff in a
comment.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run src/ui/RecipeHistory.test.jsx</automated>
    <automated>! grep -rn "After batch" app/src</automated>
    <automated>! grep -rn "No batch recorded" app/src</automated>
    <automated>! grep -rn "No tasting recorded" app/src</automated>
    <automated>grep -rn "Not yet churned" app/src/ui/RecipeHistory.jsx</automated>
  </verify>
  <done>
The History outline prints one citation label, `Not yet churned` for a version with no attempts, and
exactly one absence sentence per untasted attempt; the three retired strings appear nowhere under
`app/src`; the RecipeHistory suite passes with its authored-outcome tests unedited.
  </done>
</task>

<task type="auto">
  <name>Task 3: The History disclosure loses its count, and the two scopes are pinned</name>
  <files>app/src/ui/VersionRow.jsx, app/src/ui/VersionRow.test.jsx</files>
  <read_first>
app/src/ui/VersionRow.jsx lines 88-104 (the disclosure state and `versionCount`) and 255-280 (the
control itself), app/src/ui/VersionRow.test.jsx lines 355-425 and 444-470.
  </read_first>
  <action>
HIST-01: the `HistoryDisclosure` child in `VersionRow.jsx` (~line 274) becomes the single word
`History` — no template literal, no number, no plural branch. Versions are the outline's primary
nodes and their batches are nested evidence, so a version-only tally names less than the disclosure
holds; that is the brief's reason and it belongs in the comment above the control, replacing the
sentence that currently explains the count. Guard the control on `recipeVersions.length > 0` and
delete the `versionCount` local, which this change orphans. `recipeVersions`, `ordered`, `isLatest`,
the panel, the `aria-controls` wiring and the identity heading are all untouched.

Then move `VersionRow.test.jsx`:
- the primary disclosure test (~364) asserts the button renders the bare word — match the full
  element, `<button … class="text-control history-disclosure" …>History</button>`, so a stray count
  cannot slip back in — and keeps its `aria-controls` and closed-panel assertions;
- the "singular count" test (~412) becomes the negative: the control carries no digit and no
  version word for a lone version. Keep its existing `not.toContain('recipe-history')` line;
- the two tests that exist ONLY to count a deeper tree (~372-407: "counts the whole recipe
  regardless of tree depth" and "counts an ancestor and a sibling from the middle of a two-branch
  tree") are retired with the count they pin — under a fixed label all three render different trees
  and assert one identical string. Delete both `it` blocks whole, with the fixtures declared inside
  them. What they proved about recipe-level scope is pinned by `RecipeHistory.test.jsx`'s forest
  tests and its cross-recipe filter test, which read the outline itself rather than a label;
- the "no control at all" test (~416-420) loses its now-meaningless substring check and asserts the
  disclosure element is absent instead (`history-disclosure`), keeping its `version-row__history` line;
- the lineage test's trailing count assertion (~465) expects the bare word.

HIST-07: add one test to the disclosure describe block pinning the two scopes as distinct — the
Version row's control names the recipe-level outline with no count, while the version's attempt
register is the `Batches (n)` control that BatchRow's own suite already counts. Assert what this
component renders: the word alone, and no `Batches` control in `VersionRow`.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run src/ui/VersionRow.test.jsx</automated>
    <automated>! grep -rn "History (" app/src</automated>
    <automated>! grep -rn "versionCount" app/src/ui/VersionRow.jsx</automated>
    <automated>npm --prefix app test -- --run</automated>
  </verify>
  <done>
The disclosure reads `History` alone; no count string survives anywhere under `app/src`;
`versionCount` is gone; the full suite passes (1041 at HEAD, minus the two retired count tests,
plus the assertions this plan adds).
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stored record → rendered page | A batch's authored words (tasting note, At the machine, Next time) and a version's authored name and Why cross into the DOM. This change adds no new input, no new field, no network call and no package install. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-jki-01 | Tampering | `RecipeHistory.jsx` / `BatchRow.jsx` — authored prose in history rows | low | mitigate | Every changed line renders through a React text child or a template string in a domain function; no `dangerouslySetInnerHTML` is introduced, per the project rule. Gate: `! grep -rn "dangerouslySetInnerHTML" app/src`. |
| T-jki-02 | Information disclosure | `tastingProvenance` / `batchIdentity` | low | accept | Both print facts already on the same page (churn date, tasting date) to the same local-only IndexedDB reader. No new data reaches the screen and nothing leaves the device. |
| T-jki-03 | Tampering | supply chain | low | accept | No npm/pip/cargo install task exists in this plan; `app/package.json` is not modified, so the package-legitimacy gate does not apply. |
</threat_model>

<verification>
1. `npm --prefix app test -- --run` — full suite green; 38 files.
2. Retired strings are gone, comments included:
   `! grep -rn "After batch" app/src`,
   `! grep -rn "Churned and tasted" app/src`,
   `! grep -rn "No batch recorded" app/src`,
   `! grep -rn "No tasting recorded" app/src`,
   `! grep -rn "History (" app/src`.
3. The shared functions have exactly one definition each and at least two call sites:
   `grep -rn "batchIdentity\|tastingProvenance" app/src`.
4. `git diff --stat` touches only the eight files in `files_modified` — no file under
   `app/src/styles/`, none under `.impeccable/`.
5. `npm --prefix app run build` succeeds.
</verification>

<success_criteria>
- Every row of the Contract diff is either implemented or explicitly marked "already conforms" /
  "out of scope" and left untouched.
- `Batch · [churn date]` and `Tasted [date]` / `Not yet tasted` each come from ONE function, called
  by both panels.
- No CSS file is edited, so no visual literal can have been introduced.
- The test suite passes, with the authored-outcome and Batches-count assertions unedited.
</success_criteria>

<output>
Create `.planning/quick/260918-jki-implement-the-revised-owning-history-con/260918-jki-SUMMARY.md` when done.
</output>
