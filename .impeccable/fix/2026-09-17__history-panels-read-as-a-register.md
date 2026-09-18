# The history panels read as a register

An Impeccable fix description for `/gsd-quick`. Impeccable decided; GSD executes. Nothing under `app/` is edited outside a GSD command.

**Decided:** Mark, 2026-09-17 — the two disclosed history lists become one ruled register at the reading measure. The card grid and the wrapping row are both retired. The version title is the only link. Provenance is one line, the citation winning where it exists. A version's batch history is stated in words.

**Authority:** `.impeccable/surfaces/route-recipe.md` § 6, the bullet **"The two history panels read as one register, not as cards"** (revised 2026-09-17). Read it before this file — it carries the reasoning. `DESIGN.md` § Layout and § Components carry the type roles and the table's own rule discipline.

## Why

Measured at 1920 on a four-version, two-branch store:

| | Measured today |
|---|---|
| `.version-strip__list` | `repeat(auto-fill, minmax(260px, 1fr))` resolved to **six columns holding four entries** — two columns of empty air |
| its width | **1824px**, against a reading measure of **638px** — 2.9× |
| each card | 277 × 80px, for content whose longest line is ~280px |
| `.batch-row__later-list` | `display: flex` — two batches sitting **side by side**, not a chronology |
| links per version row | **two** to the same URL: the title and `Open` |

The grid was the shape of a subtree walk, drawn against sketch 003's `.vtree` when the disclosure showed a version's *descendants*. Quick task 260917-odu turned that disclosure into the recipe's **complete set**, and a complete set is a chronological register. The grid lost its justification when that landed; nothing replaced it.

Comparing four records that differ in one value each is the panel's whole job, and a horizontal grid makes the eye traverse 1824px to do it, with no field aligned to the same field in the row above. `DESIGN.md`'s world statement refuses "the recipe-app arrangement of hero photograph, rounded cards"; the ingredient table already shows what this content wants — one unsized column absorbing the slack, sized columns right-aligned and tabular, a baseline rule under every row.

## The row

Two columns, at the measure, shared by both panels.

```
┌─ 1fr ────────────────────────────┬─ max-content ─────────┐
│ 60 g oil · 800 g · In view       │      written 5 Aug 2026│   ← row 1
│ after the batch of 2 Aug 2026    │ churned twice · last…  │   ← row 2
└──────────────────────────────────┴───────────────────────┘
──────────────────────────────────────────────────────────── --rule-baseline
```

- **Left, row 1 — identity.** The version's label in the text face at `--size-version-line`, carrying the state words beside it in `--size-small-print` grotesk exactly as they read today (`· In view`, `· Latest`, `· In view · Latest`). This is the only link.
- **Left, row 2 — provenance.** Small print. **The citation wins where it exists** (Mark, 2026-09-17): `after the batch of 2 Aug 2026` when `citedBatchId` resolves to a batch with a churn date, otherwise `from {parentVersionLabel}` when `parentVersionId` is set. Never both — the run-on is what is being removed. A root version that cites nothing renders **no second line**; no word is invented for it, and the row keeps its height from the right column.
- **Right, row 1 — written.** `written 5 Aug 2026`, right-aligned, tabular.
- **Right, row 2 — batch history.** Right-aligned, tabular. Mark's requested batch count, in § 3's own settled vocabulary.
- **The rule.** `--rule-baseline` solid `--ink` under every row, the ingredient table's own weight — including the last, so the block closes.
- **`is-current` is unchanged.** Bold plus the 1px outline stays on the in-view row: it is pointed-at content, and `DESIGN.md` sanctions it. The words remain additional to it. Do not redesign it.

## The batch history's words

Authority is `route-recipe.md` § 3, "The tip, and the lists", which already settled this vocabulary. Given the batches of one version:

| Count | Reads |
|---|---|
| 0 | `not yet churned` |
| 1 | `churned 2 Aug 2026` |
| 2 | `churned twice · last 20 Aug 2026` |
| n ≥ 3 | `churned 3 times · last 20 Aug 2026` |

`twice` is the brief's own word, so it keeps its special case. Where a batch carries no churn date, `latestChurnDate` returns null — the `· last …` clause is then omitted rather than printing `date unknown` twice on one line.

This *replaces* the strip's current `churned {latestChurnDate}` line, which is the same information without the count. Nothing is lost.

## Scope

**Files:** `app/src/ui/VersionStrip.jsx`, `app/src/ui/VersionStrip.test.jsx`, `app/src/ui/BatchRow.jsx`, `app/src/ui/BatchRow.test.jsx`, `app/src/domain/batch.js`, `app/src/domain/batch.test.js`, `app/src/styles/app.css`, `app/src/styles/cross-cutting.test.js`.

**In:**

1. **`batch.js` — the phrasing helper.** One exported function taking a version's batches and returning the sentence from the table above. It sits beside `formatRecordDate`, `sortedBatches` and `latestChurnDate`, which is where this file already keeps batch phrasing. Framework-free, pure, node-environment tested — the domain convention holds.
2. **`VersionStrip.jsx` — the register.** The three stacked `<p>`s become the two-column row. `allBatches.filter(b => b.versionId === version.id)` is already computed for `ownChurnDate`; hoist it once and feed both the count and the phrase from that one array, so they cannot disagree. Drop `metaParts`' join in favour of the single provenance string. Delete `.version-strip__batch` entirely — the churned date moved to the right column and `Open` is struck.
3. **`VersionStrip.jsx` — the one link.** The title is the only `<a>`. Both existing suppressions survive on it unchanged: the entry in view renders as text (dead-control rule, 260917-odu) and every entry renders as text while `openPen` is set (D-UAT-2). No `Open` control is rendered in any state.
4. **`BatchRow.jsx` — the same object.** The inline list at `:963-988` takes the register's row: the churn date as the identity (still the only link, still suppressed while a pen is open, still `<strong>` plus `· In view` for the batch in view), `laterBatchMetaFor`'s output as the provenance line. The right column has nothing to say for a batch and is left empty. `sortedBatches` already orders it newest-first — that is untouched. The section's name, its `aria-label`, its `h2` and the zero-batch branch are untouched.
5. **`app.css` — one shared grammar.** The register's rules replace `.version-strip__list`, `.version-strip__item`, `.version-strip__vline`, `.version-strip__meta`, `.version-strip__batch`, `.version-strip__churned`, `.batch-row__later-list`, `.batch-row__later-date`, `.batch-row__later-small` and `.batch-row__later-meta`. Name them for what they are (a history register), not for a direction — `later` is struck everywhere, and this retires the five residual `.batch-row__later-*` names that 260917-odu named and left. `.version-strip__marker` and `.version-strip__item.is-current` keep their declarations; only their selectors move if the class names do. The list is capped at `var(--measure-prose)`. Every value reads a token: `--rule-baseline`, `--ink`, `--gap-xs`, `--gap-l`, `--face-text`, `--face-grotesk`, `--size-version-line`, `--size-small-print`, `--measure-prose`. No new token, no literal, no `@media` block added.
6. **`cross-cutting.test.js:600`** asserts `.batch-row__later-meta` by exact selector and follows the rename. `BatchRow.test.jsx`'s import of `laterBatchMetaFor` follows if that export is renamed; renaming it is optional and not required by this fix.

**Out, and named:**

- `is-current`'s bold-plus-outline treatment, and the two other content-state rules beside it. Not this fix.
- The disclosure controls themselves (`Versions (n)`, `Batches (n)`), their placement, their ids and `.version-row__history`. Settled 2026-09-17 and untouched.
- `Next version`, `Record another`, `Correct`, `Show changes`, the batch row's measured cells, the tasting battery, the ingredient table.
- The `openPen` / `penReason` props' behaviour beyond following the title.
- `descendantVersions` in `lineage.js`, still an orphan, still not deleted.

**Anti-goals:** no card, no border box around a row, no second background, no colour carrying state, no shadow, no radius, no motion, no icon, no header row of column labels (the page already carries `Version` and `Versions` headings and a third label would stutter), no horizontal scroll at any width.

## Verify

- At 1920 and at 1024 the version panel is a single column of ruled rows, capped at `--measure-prose`, not a grid. `getComputedStyle(list).display` is not `grid` with multiple resolved columns, and the list's measured width equals the measure.
- Written dates and batch-history phrases align on a common right edge down the panel.
- Exactly one `<a>` per version row, and none on the row in view. No `Open` text anywhere under `app/src`.
- A version with a cited batch shows only `after the batch of …`; a version with a parent and no citation shows only `from …`; the root shows neither and its row is still two lines tall.
- The four batch-history phrasings render for 0, 1, 2 and 3 batches.
- The batch panel is a stacked ruled list, newest first, its in-view entry marked `In view` and not a link.
- At 393: no horizontal overflow, the rows stack, the right column wraps under the left rather than crushing it.
- `grep -rniE "later[ -]version|later[ -]batch" app/src` still exits 1, and `grep -rn "batch-row__later" app/src` exits 1 once the rename lands.
- `npm --prefix app test` green (baseline 1003 across 35 files), `npm --prefix app run build` succeeds.

## Note for whoever runs the browser check

The seeded store holds one version and one batch, so the register cannot be judged on it. A four-version, two-branch store with a second batch is what proves the row: write it straight into IndexedDB (both object stores use `keyPath: 'id'`), or save versions through the pen.
