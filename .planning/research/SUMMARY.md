# Project Research Summary

**Project:** Sprinkles, v2.0 Recipe creation
**Domain:** Recipe and formulation app for home ice cream makers (React 19 + Vite 8 + JSX, IndexedDB)
**Researched:** 2026-10-16
**Confidence:** MEDIUM

## Executive Summary

v2.0 adds blank-start recipe creation to an app that can already read, develop, record and print a recipe. A maker starts a recipe from the Notebook, picks ingredients from a real library, structures Instructions steps with add, remove and reorder, authors Before you start, 0 to 2 custom scales and 0 to 2 custom problems, and optionally targets, equipment and process, then prints and makes it. Recipe managers (Paprika, Recipe Keeper, Mela) give a blank-start pattern but no structured steps. Formulation tools (Gelato Maestro, Gelato Lab) give a searchable library with live figures. Steps that own ingredient amounts (`uses` plus per-step `portions`) have no competitor precedent and are the hardest part.

The recommended approach adds no dependency. The work is pure `domain/` functions, controlled React state on the existing draft-hook pattern, Move up and Move down buttons for reorder (not drag), an exact pure search function, and one IndexedDB change (`DB_VERSION` 9 to 10, clearing only the library store so a larger seed reaches existing profiles). The pen draws edits only against a baseline, so creation needs a fourth no-baseline `creating` mode. `RecipePage.jsx` (1,837 lines, 11 separate jobs) is split first so creating and editing share one editor.

The main risks are structural. Every stored-shape change (library seed and entry shape, scale definitions, a `create` draft kind) must land before creation is saveable, because after that a database bump would wipe real recipes. The candidate library dataset conflicts with the app's values and carries a lactose double-count hazard. No sketch draws any new surface, so approved canvas boards gate the creation phases.

## Key Findings

### Recommended Stack

Add nothing. `app/package.json` and the lockfile should not change. Newer releases exist (React 19.3.1, Vite 8.3.4, Vitest 5.0.5, react-router 8.4.0, idb 8.0.4); none is needed, and a lockfile change under a "no visible change" refactor would put unrelated diffs in it.

**Core technologies:**
- Move up / Move down through the shared `Button` and a pure `moveItem(list, index, delta)`: reorder — dnd-kit and native drag and drop break the CSS-token rule, have a hidden keyboard path and cannot be tested in jsdom
- A `useCreationDraft` hook built from pure operations: form state — react-hook-form would add a second state model and collide with domain-owned row ids and step keys
- A pure `filterLibrary(records, query, category)`: ingredient search — folds case and diacritics, matches all tokens, ranks name-prefix first; no Fuse.js at about 100 to 150 entries
- `idb` 8.0.3 with a guarded `clear()` of the `library` store inside the version-10 upgrade: seeding — the existing single-transaction reseed then refills it at boot
- A one-off node script generating `data/library.js` from `~/Downloads/sprinkles-ingredient-seed-db.json`: seed data — never parsed or fetched at runtime

### Expected Features

**Must have (table stakes):**
- A Notebook place that starts a blank recipe, needing only a name — recipe managers all work this way
- A searchable ingredient library with the basis flag shown, grams entry, and live figures
- Instructions steps with add, remove and reorder, and the rows each step uses
- Before you start notes, authored when the recipe is created
- A read-only Ingredients place
- Reorder by Move up and Move down buttons

**Should have (competitive):**
- Per-recipe custom scales and problems (0 to 2 each), snapshotted into batches
- Optional authored target bands, equipment and process
- Hard delete before the first save, with cleanup of references

**Defer (out of v2.0):**
- Ingredient create, edit and duplicate-and-edit
- Auto-balance or Optimize, templates, Adapted-from, import, photos, timers, cook mode, stars, nutrition, cost
- Structure edits on later versions, Show changes for dropped, added and moved steps, batches recording changed structure
- Drag-only reorder; more than 2 custom scales or problems; data migration while no live data exists

### Architecture Approach

Cut `RecipePage` along its 11 jobs (route identity and signals, eight record-load effects, kept-draft persistence, route-state openers, pen mode and guards, announcer, record-pen controller, version-pen controller, derived view model, layout, fold and media state). Share the editor through a new `creating` mode over a draft of the version being built, with no baseline. About 8 `'developing'` checks in the child components change, and `IngredientTable` needs an explicit no-baseline branch. Add, remove and reorder are new pure operations outside `penDraft.js`; at creation they are hard deletes that prune dangling step `uses` and portion `step` references. Save goes through a new one-transaction `repository.createRecipeWithVersion`, which also closes audit item W1. `createRecipe` gains optional authored sections.

**Major components:**
1. `useAnnouncer`, `useRecordData`, pure `sheetView.js`, `RecipeSheet`, `useVersionPen`, `useKeptDraft`, `useRouteIntents` — the page split, in that cut order; `useBatchRecording` can drop off the critical path
2. `creationDraft.js` with pruning operations, and a `create` draft kind — the creation state
3. `createRecipeWithVersion` — one transaction over recipes, versions and drafts
4. Library converter and reviewed library module, with a conflict-gate test — the seed
5. Scale definitions `{key, name, low, high}` accepted beside legacy names — custom scales (consumers: `axes.js`, `draft.js`, `transfer.js`, `lineage.js`, `PrintLogPages`, `BatchRow`)
6. `/ingredients` (read-only) and `/notebook` with New recipe — the two places

### Critical Pitfalls

1. **Stored shapes landing after creation is saveable** — land the scale shape, library entry shape and draft kind before the creation UI is reachable; add a test that fails if the upgrade deletes any store for a profile at or above the new floor.
2. **The creation draft would be deleted by existing code** — `RecipePage`'s restore path deletes any draft failing `draftMatchesVersion`; add a `create` draft kind with its own fit check and one draft slot per device.
3. **Dataset conflicts are different bases, not just different numbers** — dextrose is `sugar: 1, pac: 190` in the app and 92% sugars with `pac: 174.8` in the seed file, which contradicts itself; salt 586 ignores dissociation; pin every existing library entry to its current value, give new rows new ids, tag bulk rows `inherited`.
4. **Lactose double count** — the candidate file's `pac_includes_lactose` flag would double count PAC on every dairy row because `computeBalance` already derives lactose from `msnf`; the converter zeroes dairy `pac` and `pod`, the engine does not change.
5. **The expanded seed never reaches an existing profile** — `seedLibraryIfEmpty` leaves a non-empty library alone; bump to version 10 and clear, and test from a stored version-9 profile.
6. **The page split can change behaviour while tests stay green** — the shell test uses negative source assertions that pass vacuously; keep the 94-snapshot WebKit walk as the gate and add positive assertions.
7. **Step identity at creation** — hard-deleting a step and adding another can reuse a key, and `rowFromLibraryRecord` defaults `step = 1`, which may not exist; prune references and test the invariants as a pure-domain property.
8. **Editor validators assume a stored parent** — `blockedSaveMessage` and `penDraftRows` need a baseline-or-none mode, and edit mode must render no Add or Move controls.

## Implications for Roadmap

Working phase labels only; the roadmapper maps them to numbers.

### Phase 1: Decisions and design gate (no code)
**Rationale:** Nothing that changes stored shape or draws a new surface can be planned until Mark's decisions and approved boards exist.
**Delivers:** Decide rows for Mark; Claude Design canvas snapshots for the Notebook, creation editor, picker, structure controls, scales and problems, targets/equipment/process, and Ingredients.
**Avoids:** Planning against undrawn surfaces (conformance gaps).

### Phase 2: Page split, no visible change
**Rationale:** Creation and editing must share one editor; independent of Phase 3, so the two can run in parallel.
**Delivers:** `RecipePage` cut along its jobs, `RecipeSheet` with a nullable baseline, the shell test rewritten with positive assertions.
**Avoids:** Behaviour drift under green tests; gate is the 94-snapshot WebKit walk.

### Phase 3: Data foundation
**Rationale:** Resets are free only until creation ships, so every stored-shape and seed change lands here.
**Delivers:** Converter and reviewed library module, conflict-gate test, pinned existing ids and values, `DB_VERSION` 10 guarded clear, provenance fields and validators, lactose rule, test from a stored version-9 profile.
**Uses:** `idb` 8.0.3, a one-off generator script.
**Avoids:** Coefficient drift, lactose double count, the seed never reaching existing profiles.

### Phase 4: Scales model
**Rationale:** The scale shape must be settled inside the reset window. Step zero is a code read: the "This recipe only" empty state and Bitter are already fixed in code.
**Delivers:** Dual-shape readers (no reset) or objects-only (reset), depending on Mark's decision.

### Phase 5: Places
**Rationale:** Standard patterns once the surfaces are drawn; the picker is worth little on a small library.
**Delivers:** Read-only `/ingredients`; `/notebook` with New recipe.

### Phase 6: Creation core
**Delivers:** `creationDraft.js` with pruning operations; `createRecipeWithVersion` (one transaction, forced-failure test); `creating` mode; picker; add, remove and move with focus restore; save lands on the new page; Import refused while creation holds ink.
**Avoids:** Dangling references, validators assuming a parent.

### Phase 7: Draft persistence and Resume
**Rationale:** Last editor slice; Mark decides whether it is in v2.0.

### Phase 8: Custom scales and problems authoring
**Rationale:** Canvas first. Bitter only after Mark answers the open bug row.

### Phase 9: Round trip and device proof
**Delivers:** Create, print, Sheet code, record a batch with a custom scale, export, import; production-build WebKit walk; iPad print; an export-before-build row on Mark's List.

### Phase Ordering Rationale

- Stored shapes before saveable creation, because a later version bump would wipe real recipes.
- The split precedes the creation editor, and the data foundation is independent of it.
- The design gate precedes every surface phase.
- Custom scales authoring comes last of the editor slices because it needs decisions, a drawn surface, and changes to the record pen and seeds.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** decisions and boards gate everything.
- **Phase 3:** the dextrose and salt bases may need one research pass.
- **Phase 4:** the scale kind (goldilocks versus magnitude).
- **Phase 6:** WebKit focus behaviour for the Move buttons, MEDIUM confidence, needs a targeted probe on the iPad.

Phases with standard patterns (skip research-phase):
- **Phase 2, 5, 7:** established patterns once the surfaces are drawn.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH on repo facts, MEDIUM on `clear()` inside an upgrade | Not run against fake-indexeddb or the iPad; drag-and-drop rejection stands on the token rule regardless |
| Features | MEDIUM | Competitor behaviour from marketing and help pages; "no competitor does X" claims are LOW |
| Architecture | HIGH on seams, MEDIUM on the creation-editor shape | Full read of `RecipePage.jsx` and the shell test; the surface is undrawn |
| Pitfalls | HIGH on code-grounded items, MEDIUM on WebKit focus | Vendor bug reports, not Apple docs |

**Overall confidence:** MEDIUM

### Where the four files disagree (not resolved)

1. **Library entry count.** FEATURES, STACK and PITFALLS say the library holds 12 entries; ARCHITECTURE counted 26. A check of `app/src/data/library.js` finds 26 entries, so 12 is the olive oil recipe's row count, not the library's. Verify against a stored profile before writing pin tests.
2. **Does the version-10 clear need an explicit amendment to Phase 6 D-05?** STACK says D-05 stays true under the clear; PITFALLS says it must be revised regardless; ARCHITECTURE says only a top-up needs the amendment. Record a decision-log entry either way.
3. **Merge direction.** ARCHITECTURE keeps app values authoritative (dextrose 190, salt 580); STACK generates from the seed JSON with pinned ids but does not pin values. The generator must pin existing values.
4. **Lactose double count** appears only in ARCHITECTURE; STACK's converter rules omit it.
5. **Dextrose 174.8 versus 190** is a basis difference (PITFALLS), not a number to pick (STACK, ARCHITECTURE).
6. **Creation draft persistence.** PITFALLS treats it as required (UX1-02); ARCHITECTURE calls it Mark's decision.
7. **Scale shape.** ARCHITECTURE: dual-shape, no reset. PITFALLS: objects-only while reset is free. This decides whether scales precede creation.
8. **Removal at creation.** FEATURES and ARCHITECTURE: hard delete with pruning. PITFALLS: flag, then compact on save with a high-water key.
9. **Loader extraction timing in the split.** ARCHITECTURE: early. PITFALLS: late.
10. **Structure after the first save.** All agree later-version structure edits are out of scope; they disagree on whether a zero-batch root stays editable or gets a review step before Save.
11. **Bitter.** Fixed in code (ARCHITECTURE, PITFALLS), but an open Bitter bug row exists on Mark's List; do not fix before Mark answers it.

### Open decisions for Mark (unresolved)

1. Library coefficient conflicts: dextrose basis, salt 580 versus 586, fructose POD, strawberries, skim milk powder, coconut milk and heavy cream possibly different products.
2. The Phase 6 D-05 amendment: clear-on-bump or top-up.
3. Scale kind: goldilocks with a fixed "right" middle, or plain magnitude.
4. Bitter's fate, after the bug row is answered.
5. Scale shape: dual-shape or objects-only with a reset (check devices for real batches first).
6. Creation draft persistence in v2.0.
7. An ingredient not in the library: stop with a message, or a name-only row with limited figures.
8. Version name default on a blank start.
9. Meaning of "reorder rows" when the table reads in step order.
10. Row and step removal at creation: hard delete or flag.
11. Pre-filled target bands or blank.
12. Structure after the first save: review step, editable zero-batch root, or accept the limit.
13. Recipe name uniqueness.
14. One or two descriptions (the recipe record and the Sheet each have one).
15. A `libraryId` link on rows, or record it as deferred.
16. The `importAll` overwrite policy, before any library editing.

### Gaps to Address

- Library entry count (12 versus 26): verify against a stored profile before pin tests.
- Dextrose and salt chemistry: Mark decides each; salt 586 is flagged "verify before shipping" in the seed file.
- Version 10 clear removes library records written by `importAll`: harmless now, record it in `db.js` and test it.
- WebKit focus for the Move controls and 40+ row performance on the iPad: unmeasured; probe on a production build.
- The Sheet code changes under reorder: print after the last reorder.
- Row-to-library link and the picker dead end: unresolved.
- Decide rows for Mark were not written to Mark's List by this run.

## Sources

- `.planning/research/STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md`
- `app/src/data/library.js`, `app/src/store/db.js`, `app/src/domain/newRecipe.js`, `app/src/ui/RecipePage.jsx`
- `.planning/seeds/SEED-261001-iq4-recipe-specific-tasting-measures-and-failures.md`
- `~/Downloads/sprinkles-ingredient-seed-db.json`

---
*Research completed: 2026-10-16*
*Ready for roadmap: yes*
