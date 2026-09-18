---
quick_id: 260917-vev
slug: apply-impeccable-fix-2026-09-17-history-
status: complete
date: 2026-09-17
commits:
  - 5600936
  - ef13421
  - b384f4b
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
actuals:
  tokens: 10652
  tasks: 3
  commits: 3
plan_head_before: 1ec96b9
---

# The history panels read as a register — Summary

Both disclosed history lists — Versions and Batches — now render one shared row grammar,
`.history-register*`: a wrapping flex line capped at the reading measure, ruled under every
row including the last, with a version row carrying a right-hand record block (`written
<date>` over the batch history stated in words) and a batch row carrying identity only. The
card grid (six columns holding four entries at 1824px) and the side-by-side batch flex are
both retired. The version title is the only link anywhere in either panel — the second
`Open` control is struck in every state, in every file, including test prose (the
`grep -rnw "Open"` gate on both VersionStrip files holds). Provenance is one line, the
citation winning where it exists; a root version renders no provenance line at all but keeps
its row's height from the record block.

## Baseline, measured

`npm --prefix app test` before any edit: **35 files, 1003 tests, all passing** — matches the
plan's own measured baseline exactly, no drift.

## Task 1 — `batch.js` states a version's batch history in words (`5600936`)

`batchHistoryWords(batches)` added after `latestChurnDate` in `app/src/domain/batch.js`,
transcribing route-recipe.md § 3's already-settled vocabulary rather than re-deriving it:
`not yet churned` (0), `churned <date>` (1), `churned twice · last <date>` (2), `churned <n>
times · last <date>` (n ≥ 3). `twice` keeps its brief-mandated special case.

**The one-batch-with-no-date behaviour change, as the plan flagged it explicitly.** Today
(before this change) `VersionStrip.jsx:89` rendered nothing at all for a dated-less
single batch — the count silently disappeared. `batchHistoryWords` now returns bare
`churned` for that case, since the count itself is the point of the line and it should not
vanish just because the date is unknown. This is a real, intended behaviour change, not a
regression.

Six node-environment tests inserted in `batch.test.js` between the `latestChurnDate` and
`augustSecondBatch` describe blocks: zero batches, one dated, one undated, two dated
(asserting the word `twice`, not the numeral), three dated (asserting `3 times` and that the
date is the **latest** of the three regardless of array order), two undated.

**Verify:** `npm --prefix app test -- src/domain/batch.test.js` → 1 file, 61 tests, green.
Full suite: **35 files, 1009 tests, all passing** (1003 baseline + 6 new — no new test file,
so 35 stays 35, exactly as the plan predicted).

## Task 2 — the version panel becomes the register (`ef13421`)

**`VersionStrip.jsx`.** The three stacked `<p>`s became the two-block row:
`history-register__identity` (name + marker, then one provenance `<p>` or none) and
`history-register__record` (`written <date>`, then `batchHistoryWords(versionBatches)`).
`allBatches.filter(...)` was hoisted out of the inline `latestChurnDate(...)` call into
`versionBatches`, fed to `batchHistoryWords` — the count and the phrase now read one array
by construction. `latestChurnDate` dropped from the import (an orphan this change creates).
`metaParts`'s array-and-join was replaced by one `provenance` string: the citation wins —
`after the batch of <date>` when `citedBatchId` resolves to a batch **carrying a churn
date**, otherwise `from <parent>` when `parentVersionId` is set, otherwise `null` (no
element rendered at all, no empty `<p>`). The whole `.version-strip__batch` paragraph —
its link, its plain-word branch under `openPen`, its `.version-strip__churned` span — is
gone; no control replaces it in any state. The header comment was rewritten off "cards" and
off the struck control.

**`app.css` / `tokens.css`.** The ten retired selectors
(`.version-strip__list/__item/__item a/__item.is-current/__vline/__meta/__batch/__batch
.text-control/__churned/__marker`) were replaced in place by the `.history-register*`
family written once in the plan and transcribed verbatim here — a wrapping flex row, not a
fixed `1fr max-content` grid, so 393 wraps the record block beneath the identity block
rather than crushing either (the plan's own key link on why grid was rejected).
`is-current`'s three declarations and the marker's two declarations were carried over
character-for-character; only their selectors moved. `--size-strip-line` (tokens.css) was
deleted along with its card-grid comment — an orphan this change creates, its only consumer
(`app.css:763`, pre-change) being gone.

**`binder.test.js`.** The exact-selector outline test at :95-99 follows the item-class
rename — selector string and failure message only; the three sibling content-state tests
stayed byte-identical (confirmed: they read the new `.history-register__item.is-current`
rule automatically with no edit, proving every new value still reads a token).

**`VersionStrip.test.jsx`** was rewritten case by case, following the plan's own table, plus
the two genuinely new cases the plan named: a cited batch with a **null** churn date falls
through to `from <parent>` (the fix's own "with a churn date" qualifier); and a root
version's record block still carries two lines (`written <date>` over `not yet churned`)
with no provenance element between them, proving the row's height comes from the record
block, not a manufactured left-side line. Both are covered — the root case absorbs and
extends the plan's line-130-144 assertion rather than adding a byte-identical sibling test
(CLAUDE.md § 2). 22 tests total (was 21 pre-change across the same describe structure).

**Verify, every number real:**
- `grep -rn "version-strip__" app/src` → exit 1, no matches.
- `grep -rnw "Open" app/src/ui/VersionStrip.jsx app/src/ui/VersionStrip.test.jsx` → exit 1.
- `grep -rn ">Open<" app/src` → exit 1.
- `grep -rn -- "--size-strip-line" app/src` → exit 1.
- `npm --prefix app test -- src/ui/VersionStrip.test.jsx` → 1 file, 22 tests, green.
- Full suite: **35 files, 1010 tests, all passing**.
- `npm --prefix app run build` → succeeds.

## Task 3 — the batch panel takes the same object (`b384f4b`)

**`BatchRow.jsx`.** The inline list at :963-988 (pre-change line numbers) takes the
register's row exactly as the plan specified: the section's class renamed
`batch-row__later` → `batch-row__batches`; its `id`, `aria-label`, `<h2>`, the
`batchesOpen` gate, the zero-batch branch and `sortedBatches`' newest-first order are all
untouched. `<ul>` became `.history-register`; the `<li>` gained
`className="history-register__item"` and wraps its contents in one
`.history-register__identity` div — **no record block is rendered**, since a batch has
nothing to say in the right column. The date paragraph's three branches (`<strong>` +
in-view marker; plain text while a pen is open; otherwise a `<Link>`) are behaviourally
unchanged, only reclassed to `.history-register__name` / `.history-register__marker`. The
meta paragraph became `.history-register__provenance`, still gated on `metaParts.length >
0`, still fed by `laterBatchMetaFor(batch)` — **not renamed**, body unchanged.

**`app.css`.** `.batch-row__later-list`, `-date`, `-small`, `-meta` deleted outright (their
work is now the shared family Task 2 wrote). `.batch-row__later` renamed to
`.batch-row__batches`, carrying its three frame declarations
(`margin-top`/`padding-top`/`border-top`) unchanged — it is the panel's frame, not a
register row, and the fix does not touch it.

**The dropped `color: var(--ink)` declaration**, as the plan flagged: `.version-strip__marker`
(now `.history-register__marker`, written in Task 2) carries only `font-family` and
`font-size` — two declarations, a character-for-character carry-over from the version
strip's own marker rule. `.batch-row__later-small`'s third declaration, `color:
var(--ink)`, is **not** carried into the merged rule: the register's rows inherit ink by
default, the only element inside a row that could set another colour is a link, and
`.history-register__item a { color: inherit }` (written in Task 2) already pins that. This
is on the browser checklist below (item 8) to confirm the `· In view` marker still paints
ink with no rule of its own setting colour.

**`cross-cutting.test.js:600`.** The exact-selector assertion `ruleFor('.batch-row__later-meta')`
now reads `ruleFor('.history-register__provenance')`, keeping the `font-size:
var(--size-small-print)` assertion exactly. The enclosing test's name was extended to say
the rule is now shared, not the batch row's own, so a later reader is not misled.

**`BatchRow.test.jsx` — confirmed to need no change**, exactly as the plan predicted. Live
grep found zero `.batch-row__later*` class assertions in that file before this task (only
`app.css`, `BatchRow.jsx` and `cross-cutting.test.js:600` carried those strings); the file
was untouched, and the suite stayed green with no edit to it.

**Coverage, honestly bounded, as the plan required.** There is no jsdom and no
testing-library in this suite (`vitest.config.js` pins `environment: 'node'`; every
component test renders through `renderToStaticMarkup`), and the batch disclosure is
click-driven, so none of `BatchRow.jsx`'s new markup can be rendered from a test. No jsdom
file, prop, or shared constant module was invented to manufacture coverage for it. The
render-level proof is `cross-cutting.test.js`'s selector assertion above; the rest is the
greps below and the deferred browser check.

**Verify, every number real:**
- `grep -rn "batch-row__later" app/src` → exit 1, no matches.
- `grep -rniE "later[ -]version|later[ -]batch" app/src` → exit 1, no matches.
- `grep -rn "version-strip__" app/src` → exit 1, no matches.
- `grep -c "history-register" app/src/ui/VersionStrip.jsx app/src/ui/BatchRow.jsx` → 7 and 6.
- Full suite: **35 files, 1010 tests, all passing** (unchanged from Task 2 — no test file
  needed a new assertion in this task).
- `npm --prefix app run build` → succeeds.

## Live reading vs. the plan: one measurement discrepancy, surfaced not silently chosen

The plan's own Verify blocks state `grep -c "@media" app/src/styles/app.css` is **7,
unchanged**, at both Task 2 and Task 3. Measured live: `grep -c "@media"` (a plain
substring count, counting comment-line mentions of the word alongside real rule blocks)
returns **11** after this change — but it was already **10** at the plan's own recorded
`1ec96b9` baseline (confirmed by re-running the same grep against that commit), not 7. The
plan's stated baseline of 7 does not match a plain-text `grep -c` at the commit the plan
itself measured against; it must have been counting actual `@media (...)` rule blocks. That
count — `grep -c "^@media"`, top-level rule openers only — is **7 before and 7 after this
entire change**, confirming the plan's real invariant (no `@media` block added) held
throughout. My own Task 2 comment adds one more prose mention of the word "@media" (in the
new `.history-register` comment, explaining why the row is flex and not grid), which moved
the plain-substring count from 10 to 11 — a comment, not a rule. No `@media` rule block was
added or removed by this work.

## Orphans and residual naming, named not fixed

- **`DESIGN.md:368`** ("Version strip: the Later disclosure's card grid, auto-fill at 260px
  minimum, one card per descendant …") was already stale before this change (260917-odu
  struck "Later" and "descendant") and this change falsifies the rest of it — there is no
  card grid, no auto-fill, and no card at all any more. **Not edited here** — DESIGN.md is
  Impeccable's file per `.claude/CLAUDE.md`'s working agreement. Follow-up: `/impeccable
  document`.
- **`DESIGN.md:253`**, the Small print role naming "version-strip meta" — the class it names
  no longer exists (`.version-strip__meta` is retired; the small-print role now lives on
  `.history-register__provenance` and `.history-register__record p`). Same follow-up.
- **`descendantVersions`** (`lineage.js:41-44`) — still an orphan, still not deleted, named
  by the fix's own "Out" list. Untouched.
- **`laterBatchMetaFor`** — keeps its name, per the fix's own explicit "renaming it is
  optional and not required" and the plan's confirmation that it already sits in
  `BatchRow.jsx`, not `batch.js` as the fix description states in passing (the fix only
  requires its output become the provenance line, which it already was).
- **`.version-strip`** on the `<nav>` and `aria-label="Version strip"` keep their names — no
  CSS rule targets the bare class, and the region-name outline in route-recipe.md § 6
  depends on the label. Untouched, per the plan.

## Checkpoint — deferred to the orchestrator, per this run's own instruction

The executor did not run the live browser confirmation (explicitly out of scope for this
run — left for the orchestrator, matching `human_verify_mode: end-of-phase` and this
project's own 260917-odu precedent). All twelve items are carried here verbatim, as the
plan's own deferral clause requires, so nothing drops between hand-off and confirmation.

**The store first.** The seeded store holds ONE version and ONE batch, so the register
cannot be judged on it. Write a four-version, two-branch store straight into IndexedDB
(both object stores use `keyPath: 'id'`): root `olive-oil-ice-cream-v1` → `v2` and `v3` as
siblings, `v4` below `v2`, with two batches on `v2` — the same fixture 260917-odu's browser
check used. Give one version a `citedBatchId` and a parent, so the citation-wins rule has
something to prove.

1. **At 1920.** `getComputedStyle(list).display` — the list is not a multi-column grid.
   `getComputedStyle(list).gridTemplateColumns` resolves to `none` (or, if flex/grid
   reports otherwise, record what it actually says). `list.getBoundingClientRect().width`
   equals the measure (`--measure-prose`, 65ch), **not** ~1824px.
2. **At 1024.** Same: one column of ruled rows, capped at the measure.
3. **The right edge.** The `written …` and batch-history phrases share one right edge down
   the panel — read `getBoundingClientRect().right` on the record blocks of every row and
   confirm they are equal.
4. **The rule.** Every row, **including the last**, carries a rule under it at
   `--rule-baseline` in `--ink`, so the block closes. No row has a box around it, no row
   has a second background.
5. **The links.** Exactly one `<a>` per version row; **none** on the row in view; nothing
   rendering the struck control's word anywhere on the page.
6. **Provenance, three cases.** A version with a cited batch shows only `after the batch of
   …`. A version with a parent and no citation shows only `from …`. The root shows
   neither — **and its row is still two lines tall**, taking its height from the right
   column.
7. **The four phrasings** render for 0, 1, 2 and 3 batches.
8. **The batch panel.** Open it: a stacked ruled list, newest first, the in-view entry
   `<strong>` plus `· In view` and not a link, the meta line beneath as provenance, nothing
   in a right column. Confirm the `· In view` marker still paints ink after `color:
   var(--ink)` was dropped from the merged rule (see Task 3 above).
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

## Known Stubs

None — every rendered value (`written <date>`, `batchHistoryWords`, provenance) is wired to
real data with no placeholder path.

## Threat Flags

None — no new network endpoint, auth path, file access pattern, or schema change. This is a
pure presentation/wording and markup-shape change over data the app already reads.

## Self-Check: PASSED

- FOUND: app/src/domain/batch.js
- FOUND: app/src/domain/batch.test.js
- FOUND: app/src/ui/VersionStrip.jsx
- FOUND: app/src/ui/VersionStrip.test.jsx
- FOUND: app/src/ui/BatchRow.jsx
- FOUND: app/src/styles/app.css
- FOUND: app/src/styles/tokens.css
- FOUND: app/src/styles/binder.test.js
- FOUND: app/src/styles/cross-cutting.test.js
- FOUND: commit 5600936 in `git log --oneline`
- FOUND: commit ef13421 in `git log --oneline`
- FOUND: commit b384f4b in `git log --oneline`
- CONFIRMED: `npm --prefix app test` green at 35 files / 1010 tests (measured, not rounded)
- CONFIRMED: `npm --prefix app run build` succeeds
- CONFIRMED: zero hits for `version-strip__`, `batch-row__later`, `later[ -]version|later[
  -]batch`, `--size-strip-line` anywhere under `app/src` (final state)
- CONFIRMED: `git status --short` clean after all three commits, no untracked or deleted
  files beyond this quick task's own `.planning/` directory
