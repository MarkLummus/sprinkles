# Technology Stack

**Project:** Sprinkles v2.0 Recipe creation (subsequent milestone; stack additions only)
**Researched:** 2026-10-15
**Overall confidence:** HIGH on the code facts (read from this repo), MEDIUM on third-party library behaviour (docs and web evidence, not exercised on the iPad)

## Verdict

**Add no runtime dependency. Add no dev dependency. The `package.json` does not change for v2.0.**

Every new capability in the milestone is one of three things, and the existing stack already covers all three:

1. **Pure functions** that belong in `app/src/domain/` (move an item in a list, filter the library, build an entry from a seed row). Framework-free, tested under Vitest's `node` environment.
2. **Controlled React state** driven by the existing draft pattern (pure operations behind a hook, as `usePenDraft` and `useRecordDraft` do), rendered through the shared `Button`, `Checkbox` and `Radio`.
3. **One IndexedDB change** through `idb` 8.0.3, which the repository seam already wraps.

Each candidate library fails at least one hard constraint (see Alternatives Considered), and the sizes involved (a handful of steps, 10 to 15 rows, about 100 to 150 library entries) are far below the point where any of them pays for itself.

## Recommended Stack

### Core Framework (unchanged)

| Technology | Version (pinned) | Purpose | Why |
|------------|------------------|---------|-----|
| React | 19.2.8 | Creation screen, Notebook place, Ingredients place | Controlled inputs and local state are enough. React 19 form actions and `useActionState` are not needed: the screen saves through the repository, not a server action. |
| react-router | 8.3.1 | `/notebook` start, creation route, `/ingredients` | Routes are added in `router.jsx`; no new routing capability. |
| Vite | 8.2.2 | Bundling | Nothing needed. |
| Vitest + jsdom | 5.0.0 / 30.1.1 | Tests | Move buttons, filter input and focus can all be asserted in jsdom. `tabindex-scan.test.js` covers new files automatically. |

### Database (unchanged library, one schema bump)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| idb | 8.0.3 (pinned) | Library reseed | The upgrade callback already receives `transaction`; `transaction.objectStore('library').clear()` is synchronous-safe inside it. No new idb API is used. |
| IndexedDB `library` store | `DB_VERSION` 9 to **10** | Larger seed with provenance | See "Seeding pattern" below. |

### Infrastructure

None. No new hosting, no network, no build plugin. The seed is committed source, bundled by Vite (about 20 to 25 KB gzipped for roughly 100 to 150 entries; confirm with `vite build`, the current build is about 134 KB gzipped).

### Supporting Libraries

None to add. New in-repo modules (names are suggestions, not decisions):

| Module | Where | Purpose |
|--------|-------|---------|
| `reorder.js` (pure `moveItem(list, index, delta)`) | `app/src/domain/` | Move one step or row up or down. Returns a new array; never touches a step's `n` key or a row's id. |
| `libraryFilter.js` (pure `filterLibrary(records, query, category)`) | `app/src/domain/` | Text and category filter for the creation picker and the Ingredients place. |
| `scripts/build-library.mjs` (one-off, node-only) | repo `app/scripts/` or similar | Reads the 103-row seed JSON once, writes the reviewed `data/library.js`. The JSON is never bundled. |

## Decision 1: Reordering is Up and Down buttons, not drag and drop

**Use two `Button`s per step and per row, "Move up" and "Move down", calling the pure `moveItem`.** Reorder exists only while creating a first version, so there is no diff, strike or lineage interaction to design around.

Why, in order of weight:

- **Constraint fit.** The shared `Button` already carries `tabIndex={0}` (D-19), which is exactly what WebKit on the iPad needs to Tab into a control. A drag handle has no Tab-reachable equivalent that works with Full Keyboard Access off. Keyboard-only reorder under dnd-kit needs Space or Enter to lift, arrows to move, Space or Enter to drop, a separate mode the maker must discover; two labelled buttons are self-describing. (dnd-kit keyboard sensor activation keys: dnd-kit docs, MEDIUM.)
- **Visual values through tokens.** dnd-kit's sortable pattern applies position through inline `transform` and `transition` styles on each item. The repo rule is that no component carries a literal visual value and everything reads a CSS custom property. Moving by buttons changes order in the DOM and nothing else.
- **iPad WebKit reliability.** Native HTML5 drag and drop on iOS Safari is reported unreliable for list reordering (several independent bug reports and a vendor write-up, MEDIUM, anecdotal and dated, no current WebKit statement found). Pointer-event libraries avoid that but then need `touch-action` handling, long-press activation to coexist with scrolling, and text-selection suppression, all of which have to be verified on the real device, not in Chromium (see project memory: verify in the engine that matters).
- **Testability.** `moveItem` is a pure function; the buttons are clickable in jsdom. Drag libraries rely on layout and pointer geometry that jsdom does not provide, so they would ship with weak tests.
- **Scale.** A recipe has about 10 steps and 10 to 15 rows. Moving an item by 1 to 3 positions is the normal case; long drags are not.

**Integration details that bite (HIGH, derived from this codebase):**

- **Reorder changes array position only.** A step's stored `n` is immutable identity and display numbers are derived (`stepNumbers.js`; Key Decision, Phase 3), and row `portions` reference step keys. So a reorder must never rewrite `n` or ids. `nextStepKey` keeps minting new keys for added steps.
- **Key list items by stable id, then restore focus.** After a move, React relocates the DOM node and the browser can drop focus. Re-focus the same Move button in an effect keyed on the item id after the move.
- **Boundary buttons: use `aria-disabled`, not `disabled`.** A `disabled` button that has focus loses it, which strands a keyboard user at the top or bottom of the list. Make the first item's "Move up" and the last item's "Move down" no-ops with `aria-disabled="true"` (or hand focus to the other direction). Whether disabled controls should be shown at all is a design call for Impeccable.
- **Announce the result.** A short `role="status"` line ("Step 3 moved to position 2 of 8") gives a screen-reader and a sighted user the same confirmation. Plain words per the project's plain-words rule.

## Decision 2: Form handling is the existing draft pattern, no form library

**Do not add react-hook-form (7.90.0), Formik, or any form library.**

- The codebase already has the form model this screen needs: pure draft operations in `domain/`, hooks driving them, per-keystroke draft persistence to the `drafts` store, and maker-facing messages from domain functions (`recipeNameMessage`, the version-line gate, `FieldFeedback`). A form library would be a second state model beside it.
- react-hook-form is built on uncontrolled inputs and refs, and `useFieldArray` generates its own `id` per item. This project's list items already have domain-owned identity (row ids, step keys that must never be reused). Two identity systems on one list is the kind of drift the project has been burned by.
- Validation here is domain logic (reserved row ids, duplicate ids, blank name) that must also hold in `createRecipe`; moving it into a resolver duplicates it.
- Custom scales and problems are capped at 0 to 2 each. That is two optional rows of two fields, not a dynamic-form problem.

**Pattern to use:** a `useCreationDraft` hook shaped like `usePenDraft`, built from pure operations (`setName`, `addRow`, `removeRow`, `moveRow`, `addStep`, `moveStep`, and so on). The save calls `createRecipe` with ids from `freshId` and the clock, then writes recipe and version through the repository. Open question for the architecture step: the `drafts` store is keyed by `versionId`, so a creation draft needs its version id minted at "Start" (`freshId`), and an abandoned start must leave no recipe or version record, only a draft.

## Decision 3: Ingredient search and filter is a pure function, no search library

**Do not add Fuse.js (7.5.0), FlexSearch, MiniSearch or a combobox library (downshift, react-aria, Headless UI).**

- **Size.** About 100 to 150 entries, held in memory after one `listLibrary()`. A linear scan per keystroke is microseconds.
- **Behaviour wanted is exact, not fuzzy.** A maker typing "dext" wants dextrose. Fuzzy ranking over 100 short names produces surprising neighbours, and the sugars (24 entries, with near-identical names like the corn syrups and maltodextrins) are exactly where surprise is costly.
- **Pure function, in `domain/`:** fold case and diacritics (`normalize('NFD')` and strip combining marks), split the query into tokens, require every token to appear in name, id or category, rank name-prefix matches first, then substring, then a stable sort by name. Category filter is an equality test.
- **Picker UI:** a text input plus a list of `Button`s, not `<datalist>` (inconsistent rendering on iOS, cannot carry the project's tokens) and not a combobox library (ARIA plumbing, inline positioning styles, third-party focus management that fights the explicit-`tabIndex` rule). Every list item is a shared `Button`, so the tabindex scan covers it. Layout and states are an Impeccable brief item.
- The Ingredients place uses the same function with the same filter input. It is read-only: `listLibrary()` and `getLibraryEntry()` already exist, so it needs no new repository method.

## Decision 4: IndexedDB seeding pattern for a larger library with provenance

### What the code does today (read from the repo, HIGH)

- `seedIfEmpty` calls `repository.seedLibraryIfEmpty(records)`. Its emptiness check (`tx.store.count()`) and its writes are **one readwrite transaction**, and it aborts by hand on failure. The records are `{ id, entry }`.
- **If the library holds any record it is left alone** (Phase 6 D-05: "a library holding any record is never topped up"). Mark's iPad and any returning profile already hold the 12 current entries. **Simply enlarging `data/library.js` would seed new profiles and silently leave every existing profile on 12 entries.** This is the main trap in feature 5.
- `validateLibraryRecord` in `transfer.js` checks only the wrapper (`id`, an `entry` object, a non-empty `name`, a `composition` of finite numbers). Extra fields on `entry`, including provenance, pass export and import with no change. `scanForUnsafeKeys` still guards the payload.
- Versions embed a `structuredClone` of their rows' coefficients, so reseeding the library cannot move any stored figure.

### Recommended: bump to `DB_VERSION` 10 and clear the library in that upgrade

```js
// db.js, inside upgrade(), after the guarded createObjectStore calls
// Phase v2: the library grows (more rows, provenance). It is read-only and
// derived from source, so a clear is lossless; the existing seed guard
// (seedLibraryIfEmpty) then refills it at boot, in one transaction.
if (oldVersion > 0 && oldVersion < 10) {
  transaction.objectStore('library').clear();
}
```

Why this and not a top-up:

- **Reuses the proven path unchanged.** `seedLibraryIfEmpty` and its single-transaction guarantee (and Phase 6's device check on the iPad) stay as they are. D-05 stays true.
- **Corrections propagate.** The milestone exists partly because the candidate datasets disagree (dextrose PAC 174.8 versus 190, salt 586 versus 580). If a coefficient is corrected, a put-if-absent top-up would leave the old value in every returning profile; a clear and reseed replaces it. Versions are unaffected because they embed clones.
- **Atomic with the version change.** The clear runs inside the versionchange transaction, so no profile can be at 10 with a half-state. `clear()` is legal there (versionchange transactions are read/write; MDN, HIGH). Keep it synchronous in the callback, as the file's existing comment demands: no `await`, or the transaction auto-commits early.
- **Guard is bounded** to profiles below 10, matching the file's convention that each bump writes its own branch rather than inheriting an earlier reset. A fresh profile (oldVersion 0) skips it; its library is already empty.
- **No lossy case today.** Library editing does not exist in v2.0 and the only other way an entry changes is `importAll`, which carries seed-derived records. The deferred decision "`importAll` replaces a local library entry without asking" must be settled **before** any library editing ships, because after that this clear would destroy maker work. Record that on the bump's comment.

**Alternative, if seed growth is expected repeatedly:** a second repository method `topUpLibrary(records)`: one readwrite transaction, `getAllKeys()` once, `put` only ids not present. No version bump, never overwrites. It contradicts D-05 as written (needs an explicit amendment from Mark) and cannot propagate a coefficient correction. Not recommended for v2.0.

### Seed data pipeline

- **Generate, do not hand-transcribe or parse at runtime.** The seed JSON (103 rows, ~85 KB: 58 science, 45 legacy Ice Ed, `meta.conventions` documenting the PAC basis) has a different field layout from `data/library.js` (`pac`, `pod`, `fat_pct`, `msnf_pct`, `sources[]`, `pac_provenance` versus `composition`, `basis`, `source`, `note`). A one-off node script maps it into the reviewed `data/library.js` module; the diff is what Mark and the tests review. The JSON stays out of the bundle and out of `app/src` (no JSON import, no runtime mapping, no fetch).
- **Provenance goes on the entry as plain data**, next to the existing `basis` and `source`. Suggested shape: `provenance: { dataset, datasetVersion, origin, sources: [...], pacProvenance }`. `origin` distinguishes the science rows from the legacy-imported rows; the existing `basis: 'inherited'` ("seed data, never reviewed") is the right per-field value for the 45 legacy rows. The Ingredients place renders it as text only (no `dangerouslySetInnerHTML`).
- **Id stability is a hard requirement.** `data/library.js` ids are camelCase (`wholeMilk`, `heavyCream`, `oliveOil`) and the seed JSON ids are kebab-case (`sucrose`, `corn-syrup-64de`, `hfcs-42`). Overlaps already exist (sucrose, dextrose, fructose, allulose, salt). The script needs an explicit id map for the existing 12, must keep their ids, and must fail on any duplicate or reserved id (`RESERVED_ROW_IDS` in `versionRow.js`). Unsafe keys are refused by import (`UNSAFE_KEYS`).
- **Tests to extend, not invent:** `seed-coverage.test.js` and `library.test.js` already exist. Add: every entry has name, finite composition, and provenance; ids are unique and not reserved; every library id referenced by a seeded recipe row still exists; export, then import round-trips the larger library; a store opened at v9 with 12 records upgrades to v10 and `seedIfEmpty` yields the full set (fake-indexeddb 6.2.5 supports the upgrade path, as `db.test.js` already does).
- **Transaction size.** About 100 to 150 puts in one transaction is trivial for iOS Safari; no chunking or batching is needed. Storage is a few hundred KB at most.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Reordering | Up/Down `Button`s + pure `moveItem` | `@dnd-kit/core` 6.3.1 + `@dnd-kit/sortable` 10.0.0 | Inline transform styles break the token rule; keyboard mode is a hidden Space/arrows ritual; touch needs `touch-action` and activation tuning that must be proven on the iPad; weak in jsdom; overkill for about 10 items. |
| Reordering | same | `@dnd-kit/react` 0.5.1 | Pre-1.0 API (published 2026-10-15), same constraints. |
| Reordering | same | Native HTML5 drag and drop | Reported unreliable for list reorder on iOS Safari; no keyboard path at all. |
| Reordering | same | `react-beautiful-dnd` / `@hello-pangea/dnd` | Same inline-style and touch problems; adds a large dependency for one screen. |
| Forms | Existing draft pattern | react-hook-form 7.90.0 | Uncontrolled refs and generated field-array ids fight the draft hooks and domain identity; validation already lives in the domain. |
| Forms | Existing draft pattern | Formik / React 19 form actions | Same duplication; actions target server round trips this app does not have. |
| Search | Pure `filterLibrary` | Fuse.js 7.5.0 / MiniSearch / FlexSearch | Fuzzy ranking is wrong for near-identical sugar names; indexing a list of about 100 is wasted weight. |
| Picker | Input + list of `Button`s | `<datalist>`, downshift, react-aria | Poor and inconsistent iOS rendering; third-party focus and inline positioning fight the tabindex and token rules. |
| Seeding | `DB_VERSION` 10 clear + existing reseed | Put-if-absent top-up | Needs an amendment to D-05; cannot propagate coefficient corrections. |
| Seeding | Generated `data/library.js` | Runtime JSON import or fetch | Violates no-network spirit if fetched; if bundled, ships 85 KB of unused fields and a runtime mapping layer with no test seam. |
| Persistence | `idb` as is | Dexie | Rewrites the seam for no gain; this milestone adds no query the seam lacks. |

## Do Not Bump During This Milestone

`npm view` on 2026-10-15 shows newer releases than the repo pins: React 19.3.1, Vite 8.3.4, Vitest 5.0.5, react-router 8.4.0, idb 8.0.4, fake-indexeddb unchecked. The v2.0 features need none of them. Moving the lockfile while the `RecipePage` split is in flight would put unrelated diffs under a "no visible change" refactor (the 94-snapshot WebKit walk). If wanted, do it as its own `/gsd-quick` chore after the split lands.

## Installation

```bash
# Nothing to install for v2.0.
# Verify the claim after the work: package.json and the lockfile have no diff.
git diff --stat -- app/package.json app/package-lock.json
```

## Integration Checklist (for plan checkers)

- [ ] `app/package.json` unchanged.
- [ ] Only `app/src/store/db.js` imports `idb`; `DB_VERSION` is 10 and the clear is synchronous inside `upgrade`.
- [ ] `moveItem` and `filterLibrary` live in `app/src/domain/` with no framework, DOM or store import.
- [ ] Move controls and picker items render through `Button` (tabindex scan green); no raw `<button>`.
- [ ] No inline `style` carrying a literal; any size from `tokens.css`.
- [ ] Provenance and notes render as text.
- [ ] Device check on the iPad over `build` + `preview --host`, not the dev server: Tab reaches every Move button; focus survives a move; the Ingredients place lists the full seed on a profile that previously held 12 entries.

## Sources

- Repo (read directly, HIGH): `app/package.json`, `app/src/store/db.js`, `repository.js` (`seedLibraryIfEmpty`, `importAll`, `exportAll`), `seed.js`, `transfer.js` (`validateLibraryRecord`), `app/src/data/library.js`, `app/src/ui/Button.jsx`, `app/src/ui/SheetCodeSearch.jsx`, `app/src/domain/newRecipe.js`, `app/src/domain/id.js`, `.planning/PROJECT.md`, `.planning/notes/2026-10-01-engineering-notes.md`.
- Seed dataset (read directly, HIGH): `~/Downloads/sprinkles-ingredient-seed-db.json` (103 rows; meta version `0.2-draft (as-is PAC + legacy merge)`; categories sugar 24, fruit 21, dairy 20, flavor 10, other 9, stabilizer 8, polyol 4, emulsifier 3, fiber 2, egg 2).
- npm registry (`npm view`, 2026-10-15, HIGH): versions cited above.
- MDN, `IDBObjectStore.clear()`: https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/clear (clear is allowed in a versionchange transaction; keep it synchronous in the handler). Confidence MEDIUM, the page implies rather than states the versionchange case.
- dnd-kit keyboard sensor docs: https://dndkit.com/api-documentation/sensors/keyboard (Space/Enter start and end, Escape cancels; page says nothing on touch-action or inline transforms, so the inline-style claim rests on dnd-kit's documented sortable pattern and is MEDIUM).
- iOS Safari drag-and-drop reliability, web search, MEDIUM-LOW (anecdotal, dated, no WebKit statement): https://notesnook.com/blog/notesnook-mobile-v3.4.9, https://kolaente.dev/vikunja/vikunja/issues/2092, https://jira.atlassian.com/browse/CONFSERVER-22909.
