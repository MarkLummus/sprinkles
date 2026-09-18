# One version identity, wherever a version is named

An Impeccable fix description for `/gsd-quick`. Impeccable decided; GSD executes. Nothing under `app/` is edited outside a GSD command.

**Decided:** Mark, 2026-09-18 — a version is identified the same way on its own row and in the history register: a derived ordinal, the authored name, then the state words. The ordinal is creation order, flat. The identity line becomes the version row's heading and the bare `Version` head retires. The authored name leaves the headnote.

**Authority:** `.impeccable/surfaces/route-recipe.md` § 6, the bullet **"One version identity, wherever a version is named"** (added 2026-09-18). Read it before this file — it carries the reasoning, including why the ordinal is flat rather than depth-in-lineage. `DESIGN.md` § Typography carries the Headline (version line) and Small print roles this uses; both already exist and neither changes.

## Why

The page names the same record two ways today.

| Where | Reads today |
|---|---|
| Headnote (`Headnote.jsx:77`) | `50 g oil · 800 g` |
| Version row (`VersionRow.jsx:167`) | `Version` — a bare heading, no identity at all |
| Register row (`VersionStrip.jsx`) | `50 g oil · 800 g · In view · Latest` |

So the block titled `Version` is the one place on the page that does not say which version, while the list beneath it does. And nothing anywhere states a version's position in the recipe's own sequence — `Versions (4)` says how many exist, `Latest` says one of them is newest, and the maker is left to infer the rest from written dates.

One more thing the current code already knows and does not show: the headnote's reading-mode paragraph carries `aria-label={`Version ${version.versionLabel}`}` (`Headnote.jsx:74`). A screen reader has been hearing `Version 50 g oil · 800 g` all along. This fix prints what it hears, and adds the ordinal.

## The identity

```
Version 3 · 50 g oil · 800 g · Latest          ← the version row, on its own page
Version 3 · 50 g oil · 800 g · In view · Latest ← the same version, in the register
```

- **The ordinal** in the text face at `--size-version-line`, joined to the authored name by ` · `. One string, one line, never two elements the CSS could separate.
- **The authored name** exactly as authored. Not title-cased, not truncated, not given a fallback word when blank — a blank version line is already refused at save by `versionLineUnique` / the required field, so it cannot arrive here empty.
- **The state words** in `--size-small-print` grotesk, in the order the register already uses: `In view` first, then `Latest`. On the version row's own identity, `In view` never applies — the maker is on it — so only `Latest` can appear there.
- `is-current`'s bold plus 1px outline on the register's in-view row is **unchanged**. The words stay additional to it. Do not redesign it.

## The ordinal's derivation

**One array, positional, no second key** — the same discipline `Latest` took on 2026-09-17.

```
ordered  = sortedVersions(versionsForRecipe(versions, recipeId))   // createdAt DESCENDING
ordinal  = ordered.length - index                                  // so ordered[0] is highest
```

- Version 1 is the oldest; the newest wears the highest number.
- `createdAt` is the only orderable key a version carries. The authored name is free text (D-01/D-04) and `saveOverVersion` (`lineage.js:125-136`) deliberately never retakes `createdAt`, so a correction does not renumber the book.
- **Do NOT** introduce a second traversal, a second sort, or an ascending re-sort. Reverse the index of the array that already exists. A second opinion about order is exactly what this avoids.
- A version with no `createdAt` sorts where `sortedVersions` already puts it (last, descending) and therefore takes the lowest ordinals. No special word is invented for it.
- The ordinal is **flat creation order, not depth in the lineage**. Two children of one parent take consecutive numbers. `Version 3` makes no claim to descend from `Version 2`; the provenance line one row below answers that and keeps answering it.

Put the derivation in `app/src/domain/lineage.js` beside `sortedVersions`, framework-free and pure, tested under the `node` environment — the domain convention holds. One exported function is enough; it is called from two places and must return the same answer in both.

## Scope

**Files:** `app/src/domain/lineage.js`, `app/src/domain/lineage.test.js`, `app/src/ui/VersionRow.jsx`, `app/src/ui/VersionRow.test.jsx`, `app/src/ui/VersionStrip.jsx`, `app/src/ui/VersionStrip.test.jsx`, `app/src/ui/Headnote.jsx`, `app/src/ui/Headnote.test.jsx`, `app/src/ui/RecipePage.jsx`, `app/src/styles/app.css`.

**In:**

1. **`lineage.js` — the ordinal.** One exported function returning a version's ordinal within its recipe, derived as above from `sortedVersions`'s own array. Pure, no framework, no store.

2. **`VersionRow.jsx` — the identity becomes the heading.** The reading-mode `<h2 className="region-name">Version</h2>` (`:167`) is replaced by the identity line as the row's `h2`, in the text face at `--size-version-line`, carrying `· Latest` in small print when this version is the newest of its recipe. It sits above the existing `<dl className="version-row__meta-list">`, which is **unchanged** — Written / From version, Why, and From batch keep their captions, their order, their links and their link-suppression exactly as they are. The developing-mode branch (`<h2>Next version</h2>` and its own `dl`) is **not** touched.

3. **`VersionStrip.jsx` — the same identity.** The register row's `.history-register__name` gains the ordinal prefix, joined by ` · `, before the authored name and ahead of the existing markers array. Nothing else in the row moves: provenance, the right column, the one-link rule, the in-view dead-control rule and the pen's link-suppression all survive unchanged.

4. **`Headnote.jsx` — the authored name leaves.** The reading-mode `<p className="headnote__version">` (`:69-78`) is removed. `<h1>{version.recipeName}</h1>` and the authored prose beneath it stay. The **developing-mode** `.headnote__version-field` — the `Version` input the pen writes into — is **untouched**: it is where the name is authored, not where it is read.

5. **The landing focus moves with the name (D-27).** `focusVersionOnMount` currently flows `RecipePage.jsx:1788` → `Headnote`, where `versionIdentityRef`, `tabIndex={-1}`, the `aria-label` and `is-landing-focus` sit on the retiring paragraph. All of it moves to `VersionRow`'s new identity heading, so a fork that lands on its child still puts focus on that child's identity. The visible line now says what the `aria-label` said, so the `aria-label` override is no longer needed — the accessible name and the visible text agree, which is the stronger state. `.is-landing-focus:focus` (`app.css:614`) is shared and keeps its declarations.

6. **`app.css`.** `.headnote__version` (`:485`) is deleted — an orphan this change creates. One rule for the version row's identity heading, reading tokens only: `--face-text`, `--size-version-line`, and whatever gap the existing caption rule already gives the `dl` beneath it. `.history-register__name` and `.history-register__marker` are **unchanged** — the ordinal is part of the name string and needs no rule of its own.

**Out, and named:**

- The batch panel, the batch row, and `Batches (n)`. Batches have no ordinal and none is invented.
- `Versions (n)`, its placement, its id and `.version-row__history`. Settled 2026-09-17.
- The register's geometry, its rule, its right column, its provenance rule and `is-current`'s treatment. Settled 2026-09-17.
- `Next version`, `Record another`, `Correct`, `Show changes`, the ingredient table, the method, the tasting battery.
- `descendantVersions` and `latestVersionPerRecipe` in `lineage.js` — both still orphans, both still not deleted.
- `DESIGN.md`. It is Impeccable's file; § Typography's Headline entry ("the version line under the name") becomes inaccurate as to *position* and is a `/impeccable document` follow-up, not an edit here.

**Anti-goals:** no `v3` abbreviation, no `#3`, no ordinal suffix words (`3rd`), no zero-padding, no separate element or badge for the ordinal, no colour or weight carrying it, no ordinal on a batch, no second ordering key anywhere in the codebase.

## Verify

- On a four-version store the register reads `Version 4`, `Version 3`, `Version 2`, `Version 1` top to bottom, matching its own newest-first order with no gaps and no repeats.
- The version row's identity for the page in view is character-for-character the register's identity for that same version, minus `· In view`.
- Two siblings of one parent take consecutive ordinals, and neither one's provenance claims the other as its parent.
- `Save over` on any version leaves every ordinal on the page unchanged.
- The root version reads `Version 1 · <name>` with no provenance line beneath it, and its row is still two lines tall.
- The word `Version` appears exactly once per identity line — no heading above it repeats it.
- The headnote prints the recipe name and the prose, and no version line. The pen's `Version` field still opens, accepts and saves a name.
- A fork lands on the child with focus on the child's identity heading, whose accessible name matches its visible text.
- Nothing under `app/src` carries `.headnote__version` any more.
- At 1920 and at 393 the longer identity (`Version 4 · 60 g oil · 900 g · In view · Latest`) wraps within the register's left column and causes no horizontal overflow.
