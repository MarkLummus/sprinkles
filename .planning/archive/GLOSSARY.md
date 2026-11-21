# Glossary

**Status: draft for Mark's review. Not authoritative yet.**

Purpose: give each term that collides or causes trouble one meaning, and say which code name and which screen word go with it. This is the delivery layer. Product meanings live in `product-requirements/05-domain-and-language.md` (D17 vocabulary, labels settled on the recipe page). If this file and `05` disagree, `05` wins and this file is wrong. A new product meaning goes through the decision register and Mark's approval first.

Checked against the code on 2026-10-16 (decisions of that day added after the Codex review): `DB_VERSION` 9, `STORE_SCHEMA_VERSION` 8, `VERSION_SCHEMA_VERSION` 6, five stores (`versions`, `batches`, `recipes`, `drafts`, `library`), 26 library entries, draft kinds `plan` / `record` / `amend`.

Columns: **Means here** is the one meaning. **Not** is the sense that gets mixed up with it. **Code** is the identifier or file. **Maker sees** is the word on screen, or "nothing" where there is none.

## Records and identity

| Term | Means here | Not | Code | Maker sees |
|---|---|---|---|---|
| Recipe | The enduring identity that owns versions and history. | A version. A Sheet. | `recipes` store: `{id, name, description}` | Recipe name on Home and the Notebook |
| Version | One saved state of a recipe. | The database version. A file format number. | `versions` store; `createChildVersion` in `lineage.js` | "Version 3 · name" |
| Version name | The maker's name for a version (D17). Starts as "Version 1" on a new recipe; the maker can change it. | "Version line", the older word, still in PROJECT.md. | `versionLabel` | Version name in the band |
| Sheet | The readable, editable, printable view of one version (D17; "Recipe Sheet" is a synonym). | A stored record. It has no store of its own. | Rendered from a version; `sheetCode.js`, print route | Sheet |
| Sheet title, Sheet description | Version-owned title and intro. May differ from the recipe's. | Recipe name, Recipe description. | `sheetTitle`, `sheetDescription` on the version | The Sheet's heading and intro |
| Recipe description | The recipe-level description. | The Sheet description. Two exist; at creation one box fills both (decided 2026-10-16). | `recipe.description` | About this recipe |
| Why | The maker's reason for a version. | A note. | `reason` | Why |
| From version | The version this one came from. | A recipe-to-recipe link (that is Adapted from). | `parentVersionId`, `parentVersionLabel` | From version |
| From batch | The batch a version answers. | | `citedBatchId` | From batch |
| Next version | Continue developing the same recipe: makes a child version. | Adapt, which makes a different recipe. | `createChildVersion` | Next version |
| Batch | One making attempt, with a frozen copy of the version's rows. | A recipe, or a version. | `batches` store; `createBatch` in `batch.js` | Batch |
| Tasting | A later observation attached to a saved batch. | The churn record. | Inside the batch record; `recordDraft.js` | Tasting |
| Correct | Fixing a saved record, kept as a separate, dated act. | Editing history silently. | `amend` (draft kind and functions) | Correct |

## Numbers that all look like "version"

| Term | Means here | Not | Code | Maker sees |
|---|---|---|---|---|
| Database version | The IndexedDB schema number. A bump runs the upgrade, which may reset stores. | A recipe version. | `DB_VERSION` in `store/db.js` | Nothing |
| Store file version | The format number of an exported store file. | The database version. | `STORE_SCHEMA_VERSION` in `store/transfer.js` (8) | Nothing |
| Version record shape | The shape number of one version record. | Either number above. | `VERSION_SCHEMA_VERSION` in `data/olive-oil.js` (6) | Nothing |

## Rows, portions and steps

| Term | Means here | Not | Code | Maker sees |
|---|---|---|---|---|
| Row | One ingredient line on a version. It carries its own copy of the ingredient's figures. | A library entry. A table row. | `version.rows[]`; ids like `row-09` | A line in Ingredients |
| Portion | An amount of one row used in one step. A row's total is the sum of its portions. | A serving count (portion count in `05` is yield). | `row.portions: [{step, grams}]` | As made, Uses |
| Step | One numbered instruction on a version. | The `step` field on a portion, which names a step by its key. | `version.method[]`; `n`, `leadIn`, `instruction`, `targets`, `uses`, `removed` | A step under Instructions |
| Step key | The stored number `n` that identifies a step for good. It never changes on a move or a removal. | The number shown. | `n`; `nextStepKey` in `stepKeys.js` | Nothing |
| Step number | The number shown, counted from position among live steps. | The step key. | `displayNumbers` in `stepNumbers.js` | 1, 2, 3 beside a step |
| Instructions | The Sheet's name for the steps (it replaced "Method", 2026-09-24). | | Code still says `method` | Instructions |
| Uses | The rows a step uses. | | `step.uses: [rowId]` | Uses |
| Before you start | Prep notes above the Ingredients. | An auto-generated mise en place (a parked todo). | `authored.beforeYouStart: [{text, inheritedFrom}]` | Before you start |
| Removed | A flag on a row or step in a child version, drawn struck in Show changes. | Deleted. A first version with no batch and no child deletes outright (decided 2026-10-16). | `removed` | A struck line |
| Show changes | The comparison of a version against its parent. | A history list. | `buildDiff` in `diff.js`; `?changes` query | Show changes |

## The library

| Term | Means here | Not | Code | Maker sees |
|---|---|---|---|---|
| Library | The shared catalog of ingredients a row is copied from. | The rows of any recipe. | `library` store `{id, entry}`; `data/library.js` | Ingredients (place, v2.0) |
| Library entry | One ingredient's record in the library. | A row. | `library[id]` | A line in the Ingredients place |
| Ingredient | The figures object a row carries. A `structuredClone` of a library entry, taken when the row was made. | The library entry itself. | `row.ingredient`; `rowFromLibraryRecord` in `versionRow.js` | Nothing |
| Basis | Where one figure came from: stated, derived, estimated or inherited. | A conversion basis (a product term for a unit conversion). | `basis` per field | Source column ("estimated") |
| Seed | Data loaded into an empty store. | A planning seed (`.planning/seeds`). The Downloads dataset, which is a candidate source. | `store/seed.js`, `data/seed-recipes.js` | Nothing |

## Pens, drafts and modes

| Term | Means here | Not | Code | Maker sees |
|---|---|---|---|---|
| Pen | An editing layer drawn over the Sheet. One is open at a time. | The blue handwriting. | `usePenDraft`, `penDraft.js`; `mode` `'developing'` (version pen), `'recording'` (record pen) | The open pen |
| Hand | The Caveat face in pen blue, for observations and ideas only. | Specs, app text, anything entered. | Tokens in `tokens.css` | Handwriting |
| Draft | Unsaved work, kept per version until Save or Cancel. | A Sheet draft (not a record type). | `drafts` store keyed by `versionId`; kinds `plan`, `record`, `amend`; v2.0 adds `create` | "Draft kept. Cancel discards it." |
| Sheet context, App context | The two token families: `sheet-*` for the Sheet, batch log and print; `app-*` for everything else. | "Paper" (not a context name). | Token prefixes | Nothing |

## Tasting measures

| Term | Means here | Not | Code | Maker sees |
|---|---|---|---|---|
| Scale | A 1 to 5 tasting measure with a word at each end. Two kinds (v2.0, decided 2026-10-16): goldilocks, with the fixed middle word "right", and plain magnitude. | A kitchen scale. | `AXES` in `axes.js` (code says "axis") | A row of five stops |
| Core battery | The scales and problems every tasting has. | Recipe-declared ones. | `battery.js`; four core scales | The record pen |
| Declared scale | A scale a recipe picks for itself. Today a name from the fixed list (Body, Oil). | A free definition (v2.0: a name, a label for each end and a kind, 0 to 2 per recipe). | `version.declaredAxes: [name]` | "This recipe only" |
| Problem | A yes/no flag in a tasting. | A scale. | Core: `DEFECTS`; recipe-declared: `version.declaredFlaws` (0 to 2; code says "flaw") | Problems |

## Store, places and codes

| Term | Means here | Not | Code | Maker sees |
|---|---|---|---|---|
| Reset | The upgrade drops and recreates stores on a database version bump, because no real data exists. | A draft or form reset. A lift (migrate). | The upgrade in `store/db.js` | Nothing |
| Lift | An upgrade that converts stored records instead of dropping them. Needed once a recipe can be saved. | A reset. | Not built | Nothing |
| Place | A destination in the rail: Home, Notebook, Recipe book, Idea log, Ingredients, Kitchen. | A page or a route. | `router.jsx` | The rail |
| Notebook | The place for gram-governed development of recipes. | The Recipe book. | `/notebook` | Notebook |
| Sheet code | A short code, `XXXX-XXXX`, assigned when a version is created, unique, stored with the version and never changed by an edit (decided 2026-10-16). It finds the same version again. | A QR code. | `sheetCode.js` | The code on a printed foot, Enter Sheet code |
| Balance | The six figures (PAC, POD, fat, milk solids, sugar, solids) against their bands. | The Things to check advisories. | `figures.js`, `composition.js` | Balance |
| Things to check | The derived advisories beside the Balance. | Authored notes. | `advisories.js` | Things to check |

## Words in current documents to correct

These are the places this file disagrees with the planning text. None is changed yet.

- "Version line" in PROJECT.md should read Version name (D17). `MAKE-05` already does.
- The older research notes say the library holds "12 entries". It holds 26; 12 is the olive oil recipe's row count.
- Code says `method`, `axes` and `flaws` where the maker sees Instructions, scales and problems. The code names stay; this file maps them.

---
*Drafted 2026-10-16. Review with Mark before anything cites it.*
