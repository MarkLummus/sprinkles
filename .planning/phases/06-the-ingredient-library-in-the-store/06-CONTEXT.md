# Phase 6: The ingredient library in the store - Context

**Gathered:** 2026-10-14
**Status:** Ready for planning

<domain>
## Phase Boundary

The ingredient library becomes its own object store behind the repository seam. It is seeded from `data/library.js` (which is then read only as the seed), carried by export and import beside recipes, versions and batches (each as one transaction: one read for export, one commit for import), and a change to a library entry never moves a stored version's or batch's figures. No screen reads or edits the library in this phase; the Ingredients place, editing and provenance (ING-01, ING-02) stay later. Phase 6 does not need Phase 5: it touches `store/`, `data/` and the transfer file, not the recipe page.

</domain>

<decisions>
## Implementation Decisions

### The version bump
- **D-01:** `DB_VERSION` goes 8 to 9 and a profile at 8 keeps its recipes, versions, batches and drafts. The only change in `db.js` is one guarded `createObjectStore` for the library; the reset branch (`oldVersion < 8`) is left exactly as it is: it does not widen, and a profile below 8 still resets. This decision supersedes two passages in `REQUIREMENTS.md`, which the plan reconciles: line 30 ("the reset on a version bump applies as usual") and the Out of Scope row at line 58 ("The reset on a version bump stays until a recipe can be created from scratch"). Both are reworded to say this bump adds a store and does not reset profiles at 8; the reset otherwise stays until a recipe can be created. The `db.js` comment that says a later bump "writes its own lift" gets one line noting that this bump needs neither. — **Reversibility:** reversible — nothing is dropped, so a later reset or lift can still be added.
- **D-01a (proof):** The upgrade is proven from a genuine version-8 fixture, not a second open at the current version (`db.test.js:116` tests the latter). The fixture is a database created at version 8 with a recipe, a version, a batch and a draft, then opened at 9, then `seedIfEmpty` run (seeding is a separate step in `main.jsx`). The test asserts: the four records survive unchanged; the library holds all 26 seed entries; the seeded recipes' computed balance figures are equal before and after. The existing `db.test.js` assertions that hard-code version 8 (lines 81, 108, 188, 234) move to the new version, and the `WR-08` blocked-tab test finishes at 9.

### The library record
- **D-02:** A library record is `{ id, entry }`. The store's key path is `id`, like every other store, and `id` is the existing `library.js` key (`wholeMilk`, `heavyCream`, ...). `entry` is the object from `library.js` byte-for-byte; its fields (name, category, composition, basis, source, note and the rest) do not change in this phase. A row built from a library record clones `record.entry`, so no `id` ever reaches a stored row (Phase 7 depends on this). — **Reversibility:** costly — Phase 7's row builder, the export file and every stored record read this shape, so changing it later needs a lift.
- **D-03:** No provenance fields (`origin`, `addedAt`) and no index on the library store; both belong to ING-01 and the store has no secondary lookup (same as `recipes`).

### Seeding
- **D-04:** `seedIfEmpty` gets a second, independent guard: when the library store is empty it writes all 26 seed entries as `{ id, entry }` in one transaction, whatever the versions store holds. The existing versions-empty guard stays for recipes, batches and versions. The two guards are independent, so a profile upgraded from 8 with versions present gets only the library, a fresh profile gets both, and an interrupted seed (versions still empty) repeats whichever part is missing; the writes are puts, so a repeat is harmless. The library is written before the versions flip the existing check. The emptiness check and the conditional write run in ONE repository-owned readwrite transaction (one new repository method), so a delayed second tab that read an empty library cannot overwrite entries another tab seeded and an import changed (Codex review of the Phase 6 plans, MEDIUM; amended 2026-10-14). The check goes through the repository seam, as the existing one does. Tests cover all four combinations of empty and filled versions and library. — **Reversibility:** reversible.
- **D-04a:** An empty library is always refilled from the seed at boot, whatever put it there, including an import of a file whose library list is empty (decided with Mark, 2026-10-14). There is no marker for a deliberately emptied library; nothing can empty it yet.
- **D-05:** `db.js` does not seed. It never imports `data/library.js`; seeding stays in `store/seed.js`. Boot does not top up missing seed entries on later builds.

### Export and import
- **D-06:** The export file carries a `library` list (the records) beside `recipes`, `versions` and `batches`; drafts stay on the device. `STORE_SCHEMA_VERSION` goes 7 to 8 and the validator requires `library`. A version 7 file is refused with the existing `OLDER_EXPORT_MESSAGE`, as every older file is today. — **Reversibility:** costly — files exported at 8 are in the wild once this ships.
- **D-07:** Import upserts the library by id, like the other three stores: file entries are put, store entries the file lacks stay. All four stores commit in one `repository.importAll` transaction, so an import that fails part-way leaves every store as it was. The failing-put and unclonable-put handling in `importAll` covers the fourth store too.
- **D-07a:** Export reads all four stores in one readonly transaction through one new repository method, so a second tab writing mid-export cannot give a backup built from two moments (decided with Mark, 2026-10-14). `exportStore` calls that method instead of the three separate reads it makes today. A test covers the method. "One transaction" in LIB-03 therefore holds for export as well as import.
- **D-08:** Library validation checks the wrapper only: `id` a non-empty string; `entry` an object by the file's existing `isPlainObject` check (non-null, not an array, which is enough for JSON-parsed input; no stricter prototype test) with a non-empty `name` and a `composition` object of finite numbers; unsafe keys refused (the existing `UNSAFE_KEYS` scan, which checks property names only), and a library `id` that is `__proto__`, `constructor` or `prototype` refused as a value too, the same check `validateRow` applies to row ids since quick batch 261014-e88 (amended with Mark, 2026-10-14; library ids are object keys in `library.js`). It does not check `basis`, `source`, `densityGPerMl`, `category` or `note` per field, since ING-01 will change that shape. Broader import hardening stays on Mark's List (`todo-harden-file-import-and-draft-saves`).

### Claude's Discretion
- Repository method names for the library (reads at least `listLibrary` and `getLibraryEntry`; a write method is needed for the test that changes an entry and for the seed) and whether the repository's write surface grows beyond what the seed, import and the LIB-02 test need.
- How the fake-indexeddb proof for success criterion 3 is arranged: seed the real store, change one library record, and assert every stored version's computed balance figures and every batch's snapshot are equal before and after, reading the persisted records again each time (not the in-memory objects), and once more after an export and import round-trip.
- Plan and wave breakdown, keeping each step small and the suite green at every commit.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope
- `.planning/ROADMAP.md` § Phase 6 — goal, four success criteria, and the note on the reset (settled by D-01)
- `.planning/REQUIREMENTS.md` § Ingredient library — LIB-01 to LIB-03; line 30 is corrected by D-01; § Out of Scope (storage upgrade path)

### The store and the seed
- `app/src/store/db.js` — `DB_VERSION`, the guarded creates, the `< 8` reset branch that stays unchanged
- `app/src/store/repository.js` — the seam; `importAll` is the one-transaction pattern to extend to four stores
- `app/src/store/seed.js` — `seedIfEmpty`, the only place besides the seed recipe files that may import `data/library.js`
- `app/src/store/transfer.js` — `STORE_SCHEMA_VERSION`, `validateStoreFile`, `exportStore`, `importStore`, `OLDER_EXPORT_MESSAGE`
- `app/src/data/library.js` — the 26 seed entries, read only as the seed after this phase
- `app/src/data/olive-oil.js` (and the other seed recipe files) — `embed()` shows a row holding `structuredClone(ingredient)`; the reason D-02 keeps `entry` free of `id`

### Prior decisions and conventions
- `.claude/CLAUDE.md` § Conventions — every store access through the repository seam; `idb` imported by `store/db.js` alone; domain modules framework-free
- `.planning/codebase/CONVENTIONS.md` — source of the Conventions block
- `.planning/notes/2026-10-01-engineering-notes.md` — engineering notes
- Mark's List `todo-storage-upgrade-after-milestone-1` — the reset on a version bump stays until a recipe can be created from scratch; D-01 is consistent with it (no shape changes, so nothing to reset or lift)

No external specs beyond the above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `repository.importAll` — one readwrite transaction over `recipes`, `versions`, `batches`, with an abort-by-hand catch for puts the store cannot clone; extend its store list and argument.
- `repository.putAllRecipes` / `putAllBatches` — the pattern for a one-transaction bulk put (the seed library write follows it).
- `transfer.js` validators (`validateRecipe`, `validateRow`, the `UNSAFE_KEYS` scan) — the shape for the library wrapper validator.
- `fake-indexeddb` 6.2.5 is already a dev dependency; `db.test.js` and `repository.test.js` show how the store tests open a real IndexedDB.

### Established Patterns
- Every store uses key path `id` (drafts use `versionId`); a store with no secondary lookup has no index.
- `db.js`'s upgrade callback holds no async keyword and every create is guarded with `objectStoreNames.contains`.
- Version rows embed a `structuredClone` of the library entry at authoring time, so a library change cannot reach a stored version (LIB-02 proves it against a real IndexedDB).

### Integration Points
- Today only the seed recipe files and tests import `data/library.js`; `store/seed.js` is added to that list, and success criterion 1 pins it there.
- `main.jsx` seeds on boot through `seedIfEmpty`; the Shell's backup and restore call `exportStore` and `importStore`.
- Phase 7 (`MAKE-03`) builds a row from a library record's `entry`.

</code_context>

<specifics>
## Specific Ideas

- Nothing in the app reads the library from the store yet; that is intended. The store is groundwork for Phase 7 and for the later Ingredients place.
- A profile on Mark's iPad or phone at version 8 should open at 9 with its batches intact and the library filled on first boot.

</specifics>

<deferred>
## Deferred Ideas

- Topping up the store with seed entries added by a later build — belongs with ING-01 (editing and adding from the seed).
- Provenance fields on a library record (`origin`, `addedAt`) — ING-01.
- Accepting version 7 export files — not wanted; the validator holds one shape.

### Reviewed Todos (not folded)
- Build the Recipe book print format — keyword match only; a new surface, not the store.
- Consider a "Mise en Place" auto-generator — new capability, not in this phase.
- Write a product brief for phone-based jobs — design brief, not in this phase.

</deferred>

---

*Phase: 6-The ingredient library in the store*
*Context gathered: 2026-10-14*
