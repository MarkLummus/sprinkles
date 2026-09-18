---
quick_id: 260917-vev
slug: apply-impeccable-fix-2026-09-17-history-
date: 2026-09-17
mode: quick
authority:
  - .impeccable/fix/2026-09-17__history-panels-read-as-a-register.md — THE ASSIGNMENT. Mark decided 2026-09-17. Its "In" list is the work, its "Out, and named" list is a boundary, its "Anti-goals" are refusals. Impeccable decided; GSD executes. Every line citation in it was re-read live against the current tree on 2026-09-17 (HEAD `1ec96b9`, clean) and the disagreements found are recorded under "Measured at planning" below (#3786 — a citation is a guide, never edit authority).
  - .impeccable/surfaces/route-recipe.md § 6, bullet "The two history panels read as one register, not as cards" (revised 2026-09-17) — the reasoning. The grid was the shape of a subtree walk; 260917-odu turned the disclosure into the recipe's complete set, and a complete set is a chronological register. Also § 3, "The tip, and the lists" — the batch-history vocabulary (`not yet churned`, `churned 2 Aug 2026`, `churned twice`) is ALREADY SETTLED there and is transcribed, never re-derived. Also § 6 "History controls name a whole set" — the two disclosure controls, their placement and their ids, settled 2026-09-17 and untouched here.
  - DESIGN.md:192 ("Colour identifies and form carries state"), :190 (the world statement refusing "the recipe-app arrangement of hero photograph, rounded cards"), :253 (the **Small print** role — 400, 0.75rem, tabular where numeric, naming "version-strip meta"), and the ingredient table's own rule discipline at app.css:893 (MEASURED — `border-bottom: var(--rule-baseline) solid var(--ink)` under every row). DESIGN.md is Impeccable's file and is NOT edited here; the one line this change falsifies is named below for `/impeccable document`.
  - CLAUDE.md § 2 (Simplicity First) and § 3 (Surgical Changes) — every changed line traces to the fix description. No adjacent rule is reformatted. Comments THIS change makes false are rewritten (cleaning up my own mess); orphans THIS change creates are removed; pre-existing orphans are named, not deleted.
  - .claude/CLAUDE.md conventions — every visual value reads a custom property from tokens.css; domain math is framework-free under app/src/domain/ and tested under the node environment; the repository seam is untouched; agent prose, commit messages and browser-test input values are English.
  - .claude/skills/sketch-findings-sprinkles/SKILL.md — auto-loaded during this work. Its standing instruction, **measure the real DOM, never reason from CSS source**, is what the browser checkpoint exists for; the fix's own "Why" table is measured evidence at 1920 and its Verify section asks for measured confirmation, not a test count.
files_modified:
  - app/src/domain/batch.js
  - app/src/domain/batch.test.js
  - app/src/ui/VersionStrip.jsx
  - app/src/ui/VersionStrip.test.jsx
  - app/src/ui/BatchRow.jsx
  - app/src/styles/app.css
  - app/src/styles/tokens.css
  - app/src/styles/binder.test.js
  - app/src/styles/cross-cutting.test.js
autonomous: true
must_haves:
  truths:
    - "Both disclosed history lists render as ONE ruled register at the reading measure: a single column of rows capped at `var(--measure-prose)`, newest first, one row per record, a `--rule-baseline` ink rule under every row including the last. No grid, no card, no wrapping flex row, no border box, no second background, no colour carrying state, no shadow, no radius, no motion, no icon, no column-label header row, no horizontal scroll at any width."
    - "One row grammar serves both panels — one CSS class family (`.history-register*`) and one markup shape, so the two lists cannot drift apart again. The version panel uses both columns; the batch panel uses the left column only and renders no right-hand block at all."
    - "A version row's left column is identity then provenance; its right column is `written <date>` then the batch-history phrase, right-aligned and tabular, aligning on a common right edge down the panel."
    - "Provenance is ONE line and the citation wins where it exists: `after the batch of 2 Aug 2026` when `citedBatchId` resolves to a batch carrying a churn date; otherwise `from {parentVersionLabel}` when `parentVersionId` is set; otherwise NO second line at all. Never both — the run-on is what is being removed. No word is invented for a root."
    - "A version's batch history is stated in § 3's own settled vocabulary, computed from ONE array: `not yet churned` (0), `churned 2 Aug 2026` (1), `churned twice · last 20 Aug 2026` (2), `churned 3 times · last 20 Aug 2026` (n≥3). The `· last …` clause is omitted rather than printing an unknown date. `twice` keeps its special case because it is the brief's own word."
    - "The count and the phrase are fed by one hoisted `allBatches.filter(b => b.versionId === version.id)` array, so they cannot disagree by construction — the same discipline 260917-odu used for `Latest` (`ordered[0]`, positional, off the very array the list maps)."
    - "The version title is the only link on a version row. The second control routing to the same URL is struck. Both existing suppressions survive on the title unchanged: the entry in view renders as text (dead-control rule, 260917-odu) and every entry renders as text while `openPen` is set (D-UAT-2)."
    - "`is-current`'s bold-plus-1px-outline is carried over verbatim onto the shared item class — declarations character-for-character, only the selector moves. It is pointed-at content, DESIGN.md sanctions it, and the words `In view` / `Latest` remain additional to it. It is NOT redesigned."
    - "`later` is struck from every class name: `.batch-row__later`, `-list`, `-date`, `-small`, `-meta` — the five residual names 260917-odu named and left — are all retired, and `.version-strip__*` children are retired with them. The names describe what the thing is (a history register), not a direction."
    - "The batch-history phrasing helper is framework-free and pure, exported from `app/src/domain/batch.js` beside `formatRecordDate`, `sortedBatches` and `latestChurnDate`, and tested under Vitest's node environment. It imports no framework, no DOM and no store."
    - "Every visual value reads a custom property from tokens.css. No literal colour, size, spacing or rule weight; no NEW token; no `@media` block added (app.css stays at 7, MEASURED)."
    - "`npm --prefix app test` green and `npm --prefix app run build` succeeds at every commit. Baseline MEASURED at planning time by an actual run: **1003 tests across 35 files**. No new test FILE, so 35 stays 35. Report the real number after each task; NEVER adjust an assertion to reach a number."
    - "Three commits, in order, suite green at each. Nothing left red in between."
  artifacts:
    - "app/src/domain/batch.js: one new exported function, `batchHistoryWords(batches) -> string`, returning § 3's four phrasings; placed after `latestChurnDate` (:290-298, MEASURED), which it calls."
    - "app/src/domain/batch.test.js: a `describe('batchHistoryWords')` block inserted after the `latestChurnDate` block (:452-469, MEASURED) and before `describe('augustSecondBatch …')` (:473), covering all four counts plus the two undated edges."
    - "app/src/ui/VersionStrip.jsx: three stacked `<p>`s replaced by the register's two-column row; one hoisted `versionBatches` array feeding the phrase; `metaParts`' join replaced by one `provenance` string with the citation winning; the second link struck in every state; `latestChurnDate` dropped from the import (an orphan THIS change creates); the header comment rewritten off cards and off the struck control."
    - "app/src/ui/BatchRow.jsx: the inline list at :963-988 (MEASURED) takes the register's row — churn date as identity, `laterBatchMetaFor`'s output as provenance, no right-hand block. The section's class renamed off `later`; its `id`, `aria-label`, `<h2>`, the `sortedBatches` order and the zero-batch branch all untouched."
    - "app/src/styles/app.css: ONE new `.history-register*` family replacing the ten retired selectors, capped at `--measure-prose`, ruled at `--rule-baseline`; `.batch-row__later` renamed to `.batch-row__batches` with its three declarations carried over unchanged."
    - "app/src/styles/tokens.css: `--size-strip-line` (:253, its comment at :249-252 describing the retired card grid) deleted — an orphan THIS change creates, its only consumer being app.css:763."
    - "app/src/styles/binder.test.js: the `is-current` outline test at :95-99 follows the class rename — the selector string and its failure message only. The other three content-state tests beside it are byte-identical."
    - "app/src/styles/cross-cutting.test.js: the `.batch-row__later-meta` assertion at :600 follows the rename to `.history-register__provenance`."
  key_links:
    - "`binder.test.js:95-99` does `ruleFor('.version-strip__item.is-current')` — an EXACT-selector lookup guarded by `toBeTruthy()`. It is NOT in the fix description's eight-file list, and it goes red the instant the item class is renamed. It is the ninth file, named with its evidence, not silently widened."
    - "`css-source.js` keys a GROUPED selector as one normalised string, so `ruleFor('.history-register__provenance')` returns `undefined` if that selector is only ever written inside a comma-joined rule. `.history-register__provenance` MUST have its own top-level rule or `cross-cutting.test.js:600`'s renamed assertion passes/fails for the wrong reason (the trap 260916-ch0 documented for `.text-toggle[aria-pressed='true']`)."
    - "The fix forbids a new `@media` block, and the 393 verify demands the right column WRAP under the left rather than crush it. A fixed two-track grid (`1fr max-content`) cannot do both — at 393 the sized track wins and the left column is crushed or the row overflows (an anti-goal). The row is therefore a WRAPPING FLEX line of two blocks, with the right block carrying `margin-left: auto` so the common right edge holds at width and it drops whole beneath the left when it cannot fit."
    - "There is no jsdom and no testing-library in this suite (`vitest.config.js` pins `environment: 'node'`; all 19 component test files render through `renderToStaticMarkup`). The batch panel's disclosure is click-driven and CANNOT be opened from a test. Its markup change is grep-verified and browser-verified only — do not invent a jsdom file, a new prop or a shared constant module to manufacture coverage for it."
    - "`grep -rnw \"Open\" app/src` cannot reach exit 1: four PRE-EXISTING `RESEARCH.md Open Question` comments live in RecipePage.jsx (:497, :817, :1301) and app.css (:2586) and are out of scope. The gate is scoped to the two VersionStrip files plus a rendered-markup gate, and it counts COMMENTS — the executor must not write that word into either file's prose."
---

# The history panels read as a register

Apply `.impeccable/fix/2026-09-17__history-panels-read-as-a-register.md`. Mark decided
2026-09-17: the two disclosed history lists become one ruled register at the reading
measure. The card grid and the wrapping row are both retired. The version title is the
only link. Provenance is one line, the citation winning where it exists. A version's
batch history is stated in words.

## How to read this plan

**The fix description is the assignment; this plan is the transcription.** Read the fix
description in full first, then `route-recipe.md` § 6's bullet for the reasoning. Its
"Out, and named" list is a boundary, not a suggestion: `is-current`'s treatment, the two
disclosure controls and their ids, `Next version` / `Record another` / `Correct` /
`Show changes`, the batch row's measured cells, the tasting battery, the ingredient
table, the `openPen` / `penReason` behaviour beyond following the title, and
`descendantVersions` in `lineage.js` (still an orphan, still not deleted) are all
untouched.

**Unlike 260916-ch0, this fix carries no CSS of its own.** That plan could cite its
brief by line number because the brief held the declarations. This one describes a row
and names its tokens, so the declarations are written here — once — and the executor
transcribes them rather than re-deriving a layout at execution time. Do not "improve"
them; if one is wrong, say so and stop.

**Anti-goals, repeated because they are the easiest thing to drift into:** no card, no
border box around a row, no second background, no colour carrying state, no shadow, no
radius, no motion, no icon, no header row of column labels, no horizontal scroll at any
width, no new token, no `@media` block.

## Measured at planning — HEAD `1ec96b9`, tree clean

Every citation in the fix description was re-read live. All of them hold, with three
additions and one correction.

**Test baseline, by an actual run** (`npm --prefix app test`, 2026-09-17):
**35 files, 1003 tests, all passing** — exactly the baseline the fix description states.
No drift.

### Two files beyond the fix description's list of eight, each with its evidence

The fix names eight files. Live reading shows two more MUST change for the work to be
correct. Neither is a widening of intent; both are mechanical consequences the fix
description itself anticipates ("only their selectors move if the class names do").

1. **`app/src/styles/binder.test.js:95-99`** — the ninth file.
   ```
   test('`.version-strip__item.is-current` declares its outline at --rule-graduation, not focus weight (D-14)', () => {
     const rule = ruleFor('.version-strip__item.is-current');
     expect(rule, 'expected the current version-strip item rule').toBeTruthy();
   ```
   `ruleFor` is an exact-selector lookup. Rename the item class and this returns
   `undefined` and the `toBeTruthy()` guard fails. The fix requires ONE shared row
   grammar for both panels, which requires one item class, which cannot keep the name
   `version-strip__item` on a batch row. The edit is the selector string and its failure
   message — **nothing else in that file**, and the three sibling content-state tests
   (`.ingredient-table tbody tr.is-marked`, `.batch-margin__list li.is-open`, and the
   outline census) stay byte-identical.

2. **`app/src/styles/tokens.css:249-253`** — the tenth file, and a judgement call stated
   openly. `--size-strip-line: var(--size-small-print)` has exactly ONE consumer in the
   tree (`app.css:763`, MEASURED by `grep -rn -- "--size-strip-line" app/src`), and its
   comment describes "Its card grid (03.3-06 checkpoint feedback)". The fix enumerates
   the nine tokens the register reads and `--size-strip-line` is not among them; each
   register line declares its own role size instead, so this token loses its last
   consumer. CLAUDE.md § 3 says to remove what MY change orphans, so the definition and
   its card-grid comment go. No test resolves it (checked: zero references in
   `binder.test.js`, `cross-cutting.test.js`, `columns.test.js`).

### One file the fix names that is expected to need NO change

**`app/src/ui/BatchRow.test.jsx`.** The fix names it only because of
`laterBatchMetaFor`'s import — and then declines to require that rename ("renaming it is
optional and not required by this fix"). Live grep finds **no** `.batch-row__later*`
class assertion anywhere in that file (only `app.css`, `BatchRow.jsx` and
`cross-cutting.test.js:600` carry those strings), and the batch disclosure is closed in
every render there. **Do not rename `laterBatchMetaFor`**, and expect this file to stay
untouched. If a run proves otherwise, say so in the SUMMARY with the failing assertion.

### The fix's Verify line that cannot be met as written

> "No `Open` text anywhere under `app/src`."

`grep -rnw "Open" app/src` finds **four pre-existing** `RESEARCH.md Open Question`
comments — `RecipePage.jsx:497`, `:817`, `:1301` and `app.css:2586` — unrelated to this
control and out of scope under CLAUDE.md § 3. The achievable gate is scoped to the two
files that render the struck control, plus a rendered-markup gate across `app/src`. Both
are written into Task 2.

### Everything else in the fix description, confirmed live

| Fix description says | Measured |
|---|---|
| `BatchRow.jsx` inline list at `:963-988` | Correct — `<section className="batch-row__later">` at :964 through `</ul>` at :988 |
| `cross-cutting.test.js:600` asserts `.batch-row__later-meta` | Correct — exactly one assertion, inside `describe('exclusion guards …')` |
| Five residual `.batch-row__later-*` names | Correct — `.batch-row__later` (:1723), `-list` (:1729), `-date` (:1738), `-small` (:1744), `-meta` (:1749) |
| `allBatches.filter(…)` already computed for `ownChurnDate` | Correct — `VersionStrip.jsx:40`, inline inside the `latestChurnDate(…)` call, not yet hoisted |
| `latestChurnDate` returns null for undated batches | Correct — `batch.js:290-298`, `continue`s past a null date |
| Nine named tokens all exist in tokens.css | Correct — `--rule-baseline` (:71, 1.5px), `--ink`, `--gap-xs` (:47, 6px), `--gap-l` (:50, 32px), `--face-text`, `--face-grotesk`, `--size-version-line` (:17), `--size-small-print`, `--measure-prose` (:83, 65ch) |
| The ingredient table's own rule discipline | Correct — `app.css:893`, `border-bottom: var(--rule-baseline) solid var(--ink)` on every cell; `tfoot` swaps it for a top rule (:1029) |
| `laterBatchMetaFor` "sits in `batch.js`" | **It does not** — it is exported from `BatchRow.jsx:317`. The fix only asks that its OUTPUT become the provenance line, which it already is; nothing moves. |

### Named, not fixed (pre-existing; do NOT touch)

- **`DESIGN.md:368`** reads: "**Version strip:** the Later disclosure's card grid,
  auto-fill at 260px minimum, one card per descendant …". It was ALREADY stale before
  this fix (260917-odu struck "Later" and "descendant" and did not update it), and this
  change falsifies the rest of it. DESIGN.md is written by Impeccable's own commands
  (`.claude/CLAUDE.md` working agreement) and is **not edited by a GSD task**. Record it
  in the SUMMARY as a `/impeccable document` follow-up. `DESIGN.md:253`'s Small print
  role naming "version-strip meta" is the same case.
- **`descendantVersions`** (`lineage.js:41-44`) — still an orphan, still not deleted,
  named by the fix's own "Out" list.
- **`laterBatchMetaFor`** keeps its name (see above).
- **`.version-strip`** on the `<nav>` and `aria-label="Version strip"` keep their names:
  no CSS rule targets the bare class (MEASURED), the fix's replace list does not include
  it, and § 6's region-name outline depends on the label.

## The register, written once

Both panels render this shape. The version panel uses both blocks; the batch panel
renders the identity block only.

```
<li class="history-register__item[ is-current]">
  <div class="history-register__identity">
    <p class="history-register__name">  identity + state words </p>
    <p class="history-register__provenance"> one line, or absent </p>
  </div>
  <div class="history-register__record">        ← omitted entirely for a batch
    <p>written 5 Aug 2026</p>
    <p>churned twice · last 20 Aug 2026</p>
  </div>
</li>
```

The CSS, replacing `.version-strip__list`, `.version-strip__item`,
`.version-strip__vline`, `.version-strip__meta`, `.version-strip__batch`,
`.version-strip__batch .text-control`, `.version-strip__churned`,
`.version-strip__marker`, `.batch-row__later-list`, `.batch-row__later-date`,
`.batch-row__later-small` and `.batch-row__later-meta`:

```css
.history-register {
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: var(--measure-prose);
  font-family: var(--face-grotesk);
}

.history-register__item {
  display: flex;
  flex-wrap: wrap;
  column-gap: var(--gap-l);
  padding: var(--gap-xs) 0;
  border-bottom: var(--rule-baseline) solid var(--ink);
}

.history-register__item a {
  color: inherit;
}

.history-register__item.is-current {
  font-weight: 700;
  outline: var(--rule-graduation) solid var(--ink);
  outline-offset: var(--focus-outline-offset);
}

.history-register__identity {
  flex: 1 1 auto;
  min-width: 0;
}

.history-register__name {
  font-family: var(--face-text);
  font-size: var(--size-version-line);
  margin: 0;
}

.history-register__marker {
  font-family: var(--face-grotesk);
  font-size: var(--size-small-print);
}

.history-register__provenance {
  font-size: var(--size-small-print);
  margin: 0;
}

.history-register__record {
  margin-left: auto;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.history-register__record p {
  font-size: var(--size-small-print);
  margin: 0;
}
```

Notes the executor needs and cannot see from the block alone:

- **Why flex and not a two-track grid.** See the key link above: `1fr max-content` at 393
  either crushes the left column or overflows, and no `@media` block may be added.
  `flex-wrap: wrap` plus `margin-left: auto` gives the common right edge at width AND the
  whole-block drop at 393, in one rule, with no breakpoint.
- **`min-width: 0`** on the identity block is the wrap guard — the same reason
  `.ingredient-table-region` carries it at `app.css:823` and `.method-region` at `:828`
  (sketch 003 @ `d89b758` lines 49-53, D-15). Without it a long version label refuses to
  wrap and pushes the row wide.
- **`.history-register__item.is-current`'s three declarations are a character-for-character
  carry-over** from `.version-strip__item.is-current` (`app.css:776-780`). Do not retype
  them from memory; copy them. Only the selector moves.
- **`.history-register__marker`'s two declarations are a character-for-character carry-over**
  from `.version-strip__marker` (`app.css:816-820`). It also replaces
  `.batch-row__later-small`, whose third declaration `color: var(--ink)` is **dropped**:
  the register's rows inherit ink, the only element inside them that could set another
  colour is a link, and `.history-register__item a { color: inherit }` already pins that.
  This is on the browser-check list.
- **No row-gap token is needed.** The two lines in a block stack on their own leading with
  `margin: 0`; the row's breathing is `padding: var(--gap-xs) 0` on the item. `0` is not a
  visual value needing a token (precedent throughout app.css).
- **`.history-register__provenance` must be its own top-level rule**, never folded into a
  comma-joined selector — see the key link about `css-source.js`.
- **Placement:** the family replaces the `.version-strip__*` block in place
  (`app.css:749-820`, between `.vmeta`-family rules and `.ingredient-table-region`). It is
  shared by both panels, so it stays there and the `.batch-row__later-*` rules
  (`:1729-1753`) are deleted outright rather than moved.

---

## Task 1 — `batch.js` states a version's batch history in words

**Files:** `app/src/domain/batch.js`, `app/src/domain/batch.test.js`
**Commit:** `feat(history-register): a version's batch history is stated in words`

The fix's item 1. One exported function, framework-free and pure, beside the batch
phrasing this file already keeps. It is built and committed FIRST so the register has
something to call and so the domain change is revertible on its own.

**The function.** Add `batchHistoryWords(batches)` after `latestChurnDate`
(`batch.js:290-298`, the end of the file), returning the sentence for a version's own
batches. Its whole vocabulary comes from `route-recipe.md` § 3, "The tip, and the lists",
already settled — transcribe it, do not re-derive it:

| Count | Returns |
|---|---|
| 0 | `not yet churned` |
| 1 | `churned 2 Aug 2026` |
| 2 | `churned twice · last 20 Aug 2026` |
| n ≥ 3 | `churned 3 times · last 20 Aug 2026` |

Implementation shape: count off `batches.length`; the date off `latestChurnDate(batches)`
and `formatRecordDate`, both already in this module. `twice` is the brief's own word and
keeps its special case; every other count is the numeral plus `times`.

**The two undated edges**, both derived directly from the fix's own rule ("`latestChurnDate`
returns null — the `· last …` clause is then omitted rather than printing `date unknown`
twice on one line"), and both stated here so the executor does not invent a third answer:
- **n ≥ 2 with no dated batch** → the count clause alone: `churned twice`, `churned 3 times`.
- **exactly 1 with no churn date** → `churned`, bare. This is the same omission applied to
  the one-batch row. It is a real behaviour change: today `VersionStrip.jsx:89` renders
  NOTHING for a dated-less batch, so the count silently disappeared. The count is the point
  of this line, so it now shows. Note it in the SUMMARY.

Returns a non-empty string for every input — which is what keeps a root version's row two
lines tall from the right column (the fix's own requirement) with no provenance line.

A JSDoc block above it in the file's existing style, naming § 3 as the vocabulary's
authority.

**The tests.** A `describe('batchHistoryWords')` block in `app/src/domain/batch.test.js`,
inserted after the `latestChurnDate` block (`:452-469`) and before
`describe('augustSecondBatch …')` (`:473`), and `batchHistoryWords` added to the import
list at the top. Six cases, one per row of the table plus the two undated edges:
zero batches; one dated; one undated; two dated (asserting the word `twice`, not `2`);
three dated (asserting `3 times` and that the date is the LATEST of the three, not the
first or last in array order); two undated. Build fixtures in this file's existing style.

**Verify:**
```
npm --prefix app test -- src/domain/batch.test.js
npm --prefix app test
```
Both green. Report the real file/test counts from the second run; the baseline is
**35 files / 1003 tests** and this task adds tests to an existing file, so 35 stays 35.

**Done:** `batchHistoryWords` is exported from `app/src/domain/batch.js`, imports no
framework/DOM/store, returns § 3's four phrasings plus the two omissions, and is covered
by six node-environment tests. Nothing under `app/src/ui` or `app/src/styles` has moved.

---

## Task 2 — the version panel becomes the register

**Files:** `app/src/ui/VersionStrip.jsx`, `app/src/ui/VersionStrip.test.jsx`,
`app/src/styles/app.css`, `app/src/styles/tokens.css`, `app/src/styles/binder.test.js`
**Commit:** `feat(history-register): the versions panel is a ruled register, one link per row`

The fix's items 2, 3 and the version half of item 5.

### 2a — `VersionStrip.jsx`, the register row

Inside the `.map`, before the JSX:

- **Hoist the filter.** `allBatches.filter((batch) => batch.versionId === version.id)`
  currently sits inline inside the `latestChurnDate(…)` call at `:40`. Lift it to one
  named array and pass THAT array to `batchHistoryWords`, so the count and the phrase read
  one list. `latestChurnDate` is no longer called here — drop it from the import at `:2`
  (an orphan this change creates); keep `formatRecordDate`, add `batchHistoryWords`.
- **One provenance string replaces `metaParts`** (`:48-55`, the array and its `.join(' · ')`
  at `:87` both go). The citation wins where it exists:
  `after the batch of ${formatRecordDate(citedBatch.churn.churnDate)}` when `citedBatchId`
  resolves to a batch **carrying a churn date**; otherwise `from ${version.parentVersionLabel}`
  when `parentVersionId` is set; otherwise null. Never both. A null provenance renders no
  element at all — no empty `<p>`, no invented word.
- **`markers` is untouched** (`:61-63`) — `In view`, then `Latest`, in reading order,
  settled 260917-odu.

The markup, replacing `:69-101`'s three `<p>`s:

- `<li>` takes `history-register__item`, plus ` is-current` on the entry in view exactly as
  today's ternary does.
- `<div className="history-register__identity">` holding
  `<p className="history-register__name">` — the title, then the marker span (now
  `history-register__marker`), separated by the same literal space, both **unchanged in
  behaviour**: `{isCurrent || openPen ? version.versionLabel : <Link …>}`. Then the
  provenance `<p className="history-register__provenance">`, rendered only when the string
  exists.
- `<div className="history-register__record">` holding two bare `<p>`s: `written ` plus
  `formatRecordDate(version.createdAt)`, then `batchHistoryWords(versionBatches)`.
- **The second link is struck in every state.** The whole `.version-strip__batch` paragraph
  goes — its link, its plain-word branch under `openPen`, and its `.version-strip__churned`
  span (the churned date moved to the right column). No control replaces it in any state.
  **Do not write that control's label into this file, not even in a comment or a test
  title** — the gate below counts comments, and 260917-odu already hit exactly this class
  of self-invalidating prose.
- The header comment (`:5-23`) describes a card list with "Each card carries …" and names
  the struck control twice. Rewrite it for what the file now renders: the register's row,
  the citation-wins provenance rule, the one link and its two surviving suppressions, and
  `batchHistoryWords` as the source of the right column's second line. Keep the D-10 note
  about `allBatches` being the store's whole batch list.

### 2b — `app.css` and `tokens.css`

- Replace `app.css:749-820` — the comment block plus `.version-strip__list`,
  `.version-strip__item`, `.version-strip__item a`, `.version-strip__item.is-current`,
  `.version-strip__vline`, `.version-strip__meta`, `.version-strip__batch`,
  `.version-strip__batch .text-control`, `.version-strip__churned` and
  `.version-strip__marker` — with the `.history-register*` family written above, under one
  comment naming `route-recipe.md` § 6's 2026-09-17 bullet, the fix description, the
  ingredient table's own rule discipline as the precedent, and the flex-wrap reason (so a
  later reader does not "simplify" it into a grid and silently break 393).
- `tokens.css`: delete `--size-strip-line` (`:253`) and its card-grid comment (`:249-252`).
  It has no consumer once `app.css:763` is gone.
- The `.batch-row__later-*` rules stay for now — Task 3 owns them. The suite is green in
  between because nothing asserts them except `cross-cutting.test.js:600`, which still
  matches.

### 2c — the two test files

- **`binder.test.js:95-99`** — the ninth file, evidence above. Change
  `ruleFor('.version-strip__item.is-current')` to `ruleFor('.history-register__item.is-current')`,
  update the test title and the `toBeTruthy()` message to name the register item, and
  change **nothing else in the file**. The outline census at `:43`, the
  `outline: none` census at `:113`, the no-hex census at `:285` and the no-bare-px census
  at `:289` all read the new rules automatically — they must stay green with no edit,
  which is the proof that every new value reads a token.
- **`VersionStrip.test.jsx`** — effectively the whole file follows the new markup. It is
  not a rename: the row's shape, its link count and two of its strings changed. Work
  through it case by case; the list below is what live reading says each one becomes.
  Fixtures (`makeVersion` with its `parentVersionId: 'v0'` default, `makeBatch`,
  `renderStrip`) are correct as they stand and need no change.

  | Line(s) | Today | Becomes |
  |---|---|---|
  | `:1-9` | header comment, "card list" | the register; keep the MemoryRouter note |
  | `:57` | `<ul class="version-strip__list">` | `<ul class="history-register">` |
  | `:59`, `:266` | exact `version-strip__marker` span | `history-register__marker`, same text |
  | `:76-80` | "Two anchors per card … four anchors, not six" | ONE anchor per row, none on the entry in view → **2** for this three-version, `currentId: 'a'` fixture |
  | `:90` | three `<li>` | unchanged |
  | `:96`, `:98`, `:228`, `:258`, `:289` | `<li class="version-strip__item is-current"><p class="version-strip__vline">` | `history-register__item is-current` / `history-register__name`; note the `<div>` now between them, so the `:96` regex needs the identity wrapper |
  | `:103-110` | "churned <date> … with no count" | survives as written IF the phrase is matched as a text node (`>churned 29 Aug 2026<`); it is now `batchHistoryWords` output for a one-batch version. Retitle it to say so. |
  | `:121-123` | vline + link + marker regex | the name paragraph's regex |
  | `:130-144` | root: `<p class="version-strip__meta">18 Aug 2026</p>` | root renders **no provenance element at all**; the date moves to the record block as `written 18 Aug 2026`; keep `not.toContain('null')` and `not.toContain('from ')` |
  | `:146-161` | parent AND citation AND date joined | **the citation-wins case** — provenance is `after the batch of 2 Aug 2026` ALONE, `from 50 g oil · 800 g` absent, and `written 18 Aug 2026` in the record block. This is the fix's headline behaviour: assert both the presence and the absence. |
  | `:163-176` | `from … · 18 Aug 2026` | provenance is `from 50 g oil · 800 g` alone; `written 18 Aug 2026` separately |
  | `:178-184` | batch line with the struck control, no batch | a version with no batch reads `not yet churned` in the record block and renders no second link |
  | `:186-192` | churned span beside the struck control | `churned 29 Aug 2026`, no second link |
  | `:194-203` | most recent churn date of two | `churned twice · last 3 Sep 2026` — the count AND the latest date |
  | `:214-224` | "…and the struck control in words for every entry except the one in view" | no anchors at all under `openPen`; every label still readable; **no occurrence of that word anywhere in the markup** |
  | `:238-242` | four anchors, no pen | **two** |
  | `:254-261`, `:263-268`, `:270-273`, `:275-285`, `:287-292` | the position-markers block | class names and the identity wrapper follow; the marker semantics (one `In view`, one `Latest`, both on one entry, the stable tie-break) are **unchanged and must stay covered** |

  Two cases to ADD, because they are new contract the fix introduces and nothing above
  covers them: a version whose `citedBatchId` resolves to a batch with a **null** churn
  date falls through to `from …` (the fix says "a batch **with a churn date**"); and a
  root version (no parent, no citation) renders its record block's two lines with no
  provenance element between them, proving the row keeps its height from the right column.

**Verify:**
```
npm --prefix app test
npm --prefix app run build
grep -rn "version-strip__" app/src
grep -rnw "Open" app/src/ui/VersionStrip.jsx app/src/ui/VersionStrip.test.jsx
grep -rn ">Open<" app/src
grep -rn -- "--size-strip-line" app/src
grep -c "@media" app/src/styles/app.css
```
Suite and build green. The four `grep`s exit **1** (no matches) — the three word-gates
count COMMENTS and test titles, which is the direction that matters. `@media` count is
**7**, unchanged. Report the real test numbers.

**Done:** the version panel renders one ruled register row per version, capped at the
measure, with one link on the title and none on the entry in view; provenance is one line
with the citation winning; the right column reads `written <date>` over the batch-history
phrase; `is-current` is byte-identical apart from its selector; no `version-strip__` class
and no orphaned token survive.

---

## Task 3 — the batch panel is the same object

**Files:** `app/src/ui/BatchRow.jsx`, `app/src/styles/app.css`,
`app/src/styles/cross-cutting.test.js`
**Commit:** `feat(history-register): the batches panel takes the register's row`

The fix's item 4 and the batch half of items 5 and 6.

**`BatchRow.jsx:963-988`** — the inline list takes the register's row and nothing else
about the section moves:

- `<section id="batch-row-batches" …>`'s class `batch-row__later` → `batch-row__batches`.
  Its `id`, its `aria-label`, its `<h2 className="region-name">`, the `batchesOpen` gate,
  the `batches.length === 0` branch above it and `.batch-margin__list` are **untouched**
  (the fix's own "the section's name, its `aria-label`, its `h2` and the zero-batch branch
  are untouched").
- `<ul className="batch-row__later-list">` → `history-register`.
- The `<li>` gains `className="history-register__item"` and wraps its contents in one
  `<div className="history-register__identity">`. **No record block is rendered** — a
  batch has nothing to say in the right column, so the element is omitted rather than
  rendered empty.
- `<p className="batch-row__later-date">` → `history-register__name`. Its three branches
  are **behaviourally unchanged**: `<strong>{dateWords}</strong>` plus the marker span for
  the batch in view; plain `dateWords` while a pen is open; otherwise the `<Link>`. The
  marker span's class `batch-row__later-small` → `history-register__marker`.
- `<p className="batch-row__later-meta">` → `history-register__provenance`, still gated on
  `metaParts.length > 0`, still fed by `laterBatchMetaFor(batch)` — which is **not
  renamed** and whose body does not change.
- `sortedBatches(batches)` newest-first ordering is untouched.
- `dateWords`' existing `'date unknown'` fallback is untouched.
- Any comment in this region that names the retired class prefix must be reworded — the
  gate counts comments.

**`app.css`** — delete `.batch-row__later-list` (`:1729`), `.batch-row__later-date`
(`:1738`), `.batch-row__later-small` (`:1744`) and `.batch-row__later-meta` (`:1749`)
outright; their work is done by the register family Task 2 wrote. Rename
`.batch-row__later` (`:1723`) to `.batch-row__batches`, **carrying its three declarations
unchanged** (`margin-top: var(--gap-m)`, `padding-top: var(--gap-s)`,
`border-top: var(--rule-graduation) solid var(--ink)`) — it is the panel's frame, not a
register row, and the fix does not touch it. Correct its comment where it names the
retired shape.

**`cross-cutting.test.js:600`** — inside `describe('exclusion guards — registers the
finding deliberately leaves in place')`, the third assertion of "the batch row's
measured-cell small print keeps its ratified registers" reads
`ruleFor('.batch-row__later-meta')`. Point it at `.history-register__provenance`, keeping
the `font-size: var(--size-small-print)` assertion exactly. This is now a shared rule, not
the batch row's own — adjust that test's name or its comment so the next reader is not
misled, and change nothing else in the file.

**Coverage, honestly bounded.** There is no jsdom and no testing-library in this suite, and
the batch disclosure is click-driven, so **none** of this markup can be rendered from a
test. Do not invent a jsdom file, a new prop or a shared constant module to manufacture
coverage. The render-level proof is `cross-cutting.test.js`'s selector assertion; the rest
is the greps below and the browser checkpoint. Say exactly that in the SUMMARY.

**Verify:**
```
npm --prefix app test
npm --prefix app run build
grep -rn "batch-row__later" app/src
grep -rniE "later[ -]version|later[ -]batch" app/src
grep -rn "version-strip__" app/src
grep -c "@media" app/src/styles/app.css
grep -c "history-register" app/src/ui/VersionStrip.jsx app/src/ui/BatchRow.jsx
```
Suite and build green. The three `grep`s exit **1** — including comments and test titles.
`@media` is **7**. Both components read the shared family. Report the real test numbers.

**Done:** both panels render the same row grammar from one CSS family; `later` survives in
no class name anywhere under `app/src`; the batch section's name, label, heading, order
and zero-batch branch are unchanged; `laterBatchMetaFor` is not renamed.

---

## Checkpoint — the live browser confirmation

`human_verify_mode` is `end-of-phase`, so the executor does **not** run this; it hands back
and the orchestrator runs it, as it did for 260917-odu. Three style/markup suites read CSS
and HTML **as text** under Vitest's `node` environment: they cannot prove a resolved column
count, a painted rule or a measured width. The sketch-findings skill's standing rule —
measure the real DOM, never reason from CSS source — is the whole reason this list exists,
and the fix's Verify section asks for measured values, not a test count.

**The store first.** The seeded store holds ONE version and ONE batch, so the register
cannot be judged on it. Write a four-version, two-branch store straight into IndexedDB
(both object stores use `keyPath: 'id'`): root `olive-oil-ice-cream-v1` → `v2` and `v3` as
siblings, `v4` below `v2`, with two batches on `v2` — the same fixture 260917-odu's browser
check used. Give one version a `citedBatchId` and a parent, so the citation-wins rule has
something to prove.

Then, with the Versions panel open, **reading computed values, not eyeballing**:

1. **At 1920.** `getComputedStyle(list).display` — the list is not a multi-column grid.
   `getComputedStyle(list).gridTemplateColumns` resolves to `none` (or, if flex/grid
   reports otherwise, record what it actually says). `list.getBoundingClientRect().width`
   equals the measure (`--measure-prose`, 65ch), **not** ~1824px. The fix's own measured
   "before" numbers are the comparison.
2. **At 1024.** Same: one column of ruled rows, capped at the measure.
3. **The right edge.** The `written …` and batch-history phrases share one right edge down
   the panel — read `getBoundingClientRect().right` on the record blocks of every row and
   confirm they are equal.
4. **The rule.** Every row, **including the last**, carries a rule under it at
   `--rule-baseline` in `--ink`, so the block closes. No row has a box around it, no row
   has a second background.
5. **The links.** Exactly one `<a>` per version row; **none** on the row in view; nothing
   rendering the struck control's word anywhere on the page.
6. **Provenance, three cases.** A version with a cited batch shows only
   `after the batch of …`. A version with a parent and no citation shows only `from …`.
   The root shows neither — **and its row is still two lines tall**, taking its height from
   the right column.
7. **The four phrasings** render for 0, 1, 2 and 3 batches.
8. **The batch panel.** Open it: a stacked ruled list, newest first, the in-view entry
   `<strong>` plus `· In view` and not a link, the meta line beneath as provenance, nothing
   in a right column. Confirm the `· In view` marker still paints ink after
   `color: var(--ink)` was dropped from the merged rule.
9. **`is-current`** still reads bold plus the 1px outline on the row in view — unchanged.
10. **At 393** (device emulation; `resize_window` does not move the viewport). No
    horizontal overflow — `document.documentElement.scrollWidth` equals 393. The rows
    stack, and the **right block wraps beneath the left rather than crushing it**. If it
    crushes, the row was built as a fixed two-track grid; go back to the key link.
11. **Forced colours emulated.** Every marker, every rule and the `is-current` outline
    survive — they are words and ink rules, with no colour carrying meaning.
12. **The two disclosure controls** (`Versions (n)`, `Batches (n)`), their placement and
    their ids are unchanged, and `Next version` / `Record another` / `Correct` /
    `Show changes` are untouched.

If Mark is away, defer this checkpoint to end-of-phase UAT and carry all twelve items
verbatim into the SUMMARY rather than dropping them; keep the automated verification run
and green.

## Success criteria

- [ ] Every item in the fix description's "In" list (1-6) is applied; nothing beyond it and
      the two files named with evidence above.
- [ ] Nothing in its "Out, and named" list moved; no anti-goal appeared.
- [ ] One CSS family and one markup shape serve both panels; `grep -rn "batch-row__later" app/src`
      and `grep -rn "version-strip__" app/src` both exit 1, comments included.
- [ ] Provenance is one line, the citation winning; the root renders none and keeps its
      height from the right column.
- [ ] `batchHistoryWords` is pure, framework-free, node-tested, and fed by the same single
      array as everything else on the row.
- [ ] The title is the only link; the struck control's word appears in neither VersionStrip
      file, and `>Open<` appears nowhere under `app/src`.
- [ ] `is-current`'s three declarations and `.version-strip__marker`'s two are carried over
      character-for-character; only their selectors moved.
- [ ] No new token, no literal value, no `@media` block (app.css stays at 7); `binder.test.js`'s
      no-hex and no-bare-px censuses pass untouched; `--size-strip-line` is gone.
- [ ] `npm --prefix app test` green and `npm --prefix app run build` succeeds at each of the
      three commits, with the real measured numbers reported (baseline 35 files / 1003 tests).
- [ ] The twelve browser items are run, or deferred verbatim into the SUMMARY.

## Output

Write `260917-vev-SUMMARY.md` in this directory when done. Record: the measured test count
after each commit; the two files beyond the fix description's eight and why each was
forced; that `BatchRow.test.jsx` was named by the fix but needed no change (or the failing
assertion, if it did); the one-batch-with-no-date behaviour change (`churned`, bare, where
the line used to vanish); the dropped `color: var(--ink)` on the merged marker rule; the
browser readings, or the deferral with all twelve items carried; and `DESIGN.md:368` and
`:253` as `/impeccable document` follow-ups this change falsified but did not edit.
