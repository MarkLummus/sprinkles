# Roadmap: Sprinkles

## Milestones

- ✅ **v1 Develop the next olive oil recipe** — Phases 1-4 and the inserted 03.x phases (shipped 2026-10-13). Archive: `milestones/v1-ROADMAP.md`; audit: `milestones/v1-MILESTONE-AUDIT.md`.
- 🚧 **v1.1 Groundwork for creation** — Phases 5-7 (in progress). The code is made ready for recipe creation; no creation UI ships and no screen changes.
- 📋 **v2 Recipe creation** — not scoped yet; candidates are listed under "Later" at the end of this file.

## Phases

<details>
<summary>✅ v1 Develop the next olive oil recipe (Phases 1-4, 14 phases incl. insertions) — SHIPPED 2026-10-13</summary>

- [x] **Phase 1: Read the churned recipe** - The churned olive oil recipe and its balance figures are legible in the app instead of on paper (completed 2026-09-05)
- [x] **Phase 2: Record the first batch** - The 2 Aug batch enters Sprinkles as what actually happened, snapshotted against the version it used (completed 2026-09-06)
- [x] **Phase 3: Develop the next version** - Version 2 is created, adjusted, and compared against the churned version without disturbing it (completed 2026-09-08)
- [x] **Phase 03.1: The imprint and the binder** (INSERTED) - The recipe page gains its front-matter band and every control leaves the printed spread; the pen reads as the page; the binder replaces browser chrome (completed 2026-09-09)
- [x] **Phase 03.2: The portion and the reset** (INSERTED) - Portions become the authored amount and the total derives; `step`/`splitStep` retire; the store resets to the new shape and the seed is rewritten, rather than migrating (completed 2026-09-10)
- [x] **Phase 03.3: The front-matter rows and the page in step order** (INSERTED) - The imprint and the tray retire into two front-matter rows; the table reads in step order; the pen's method opens read-only (completed 2026-09-10)
- [x] **Phase 03.3.1: The full battery: the record pen rebuilt from sketch 007** (INSERTED) - The record pen carries the full tasting battery as sketch 007 draws it (completed 2026-09-13)
- [x] **Phase 03.3.1.1: Record pen conformance polish** (INSERTED) - The 18 untriaged conformance gaps between the shipped record pen and the structural contract are closed (completed 2026-09-16)
- [x] **Phase 03.4: The design layer in code** (INSERTED) - The App palette, Sheet-prefixed tokens, the hand and Home land in code (completed 2026-09-22)
- [x] **Phase 03.5: Separate the recipe from the sheet** (INSERTED) - The recipe record and the version's Recipe Sheet are separate in the store, the routes and the page (completed 2026-10-02)
- [x] **Phase 03.6: Per-step shared ingredients** (INSERTED) - A shared ingredient's lines and a step can be removed without touching the other steps (completed 2026-10-06)
- [x] **Phase 4: Prepare the next version for making** - The new version prints as a bench sheet, matches back to its code, and the whole loop is usable and recoverable (completed 2026-10-13)

Full phase detail, plans and progress: `.planning/milestones/v1-ROADMAP.md`.

</details>

### 🚧 v1.1 Groundwork for creation (In Progress)

**Milestone Goal:** The code is ready for recipe creation, which is the next milestone (v2). No creation UI ships here. Each phase is checked by tests and by the existing screens reading as before.

- [ ] **Phase 5: Split the recipe page** - The recipe page's draft logic moves into pure domain operations behind hooks, leaving `RecipePage` as the route shell; the maker sees no change
- [ ] **Phase 6: The ingredient library in the store** - The ingredient library becomes an object store behind the repository seam, seeded, exported and imported, and editing it never moves a stored figure
- [ ] **Phase 7: Creation primitives** - Framework-free functions create a recipe with a root version, hand out step keys that are never reused, and build a row from a library ingredient

## Phase Details

### Phase 5: Split the recipe page

**Goal**: Creating and editing can share one editor: the recipe page's draft logic becomes pure operations in `domain/`, driven through `usePenDraft` for the pen and a second hook for recording and tasting, and `RecipePage` is left as the route shell, with nothing changed for the maker
**Depends on**: Phase 4 (v1, shipped). The existing suite is the safeguard: it stays green throughout
**Requirements**: EDIT-01, EDIT-02, EDIT-03, EDIT-04
**Success Criteria** (what must be TRUE):
  1. Every pure helper `RecipePage.jsx` exports today (`isDraftDirty`, `isPenDraftDirty`, `restoreStepFromVersion`, `blankRecordDraft`, `draftFromBatch`, `validateRecordDraft`, `buildChurnFieldsFromDraft`, `buildTastingFieldsFromDraft` and the rest) is imported from a module under `app/src/domain/` with no React, DOM or store import, and its tests run under Vitest's default node environment with no jsdom docblock
  2. Each change the pen makes to a draft (an amount, a line or step removed or restored, step text, notes, the headnote) is a pure function in `domain/` tested under node, the pen's handlers reach it through `usePenDraft`, and the blocked-save reset happens in one place instead of the 32 `setBlockedMessage(null)` / `setBlockedTarget(null)` lines repeated across the handlers today
  3. Recording a batch, correcting it and writing its tasting work the same way: pure operations in `domain/` tested under node, driven through one hook, with the churn-date block's reset (16 `setBlockedDateMessage(null)` lines today) in one place
  4. `RecipePage.jsx` reads as the route shell: it reads the route, loads its records through the repository seam and composes the regions and the two hooks, holding no draft logic of its own; every existing test passes, and tests that imported moved helpers from `RecipePage.jsx` now import them from `domain/`, none deleted or weakened
  5. In the built app the maker sees no change: opening, editing, saving and cancelling the version pen, the record pen, a correction and a tasting give the same page, the same saved records and the same kept draft after a reload as before the split

**Plans**: 6/6 plans executed

Plans:
**Wave 1**
- [x] 05-01-PLAN.md — The before walk: a deterministic WebKit walk of the built app records every D-13 observation, each pen's save and kept draft, and the stores, as 05-walk-before.json (D-11, D-13)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 05-02-PLAN.md — Pen helpers to domain/penDraft.js; penDraftRow serves every draft-row read and closes T-03.6-02 (EDIT-01; D-01, D-02, D-03)

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 05-03-PLAN.md — usePenDraft: eleven pen edits as pure ops through edit(), open, close, restore and checkSave; the blocked reset in one place (EDIT-02; D-04, D-05, D-07, D-08, D-10, D-12)

**Wave 4** *(blocked on Wave 3 completion)*
- [x] 05-04-PLAN.md — Record helpers to domain/recordDraft.js; strings follow their user; three test files repointed (EDIT-01; D-01, D-02)

**Wave 5** *(blocked on Wave 4 completion)*
- [x] 05-05-PLAN.md — useRecordDraft: record, correct and tasting edits as pure ops, lifecycle and the save gate through one hook; the churn-date reset in one place (EDIT-03; D-06, D-07, D-08, D-09, D-10, D-12)

**Wave 6** *(blocked on Wave 5 completion)*
- [x] 05-06-PLAN.md — The proof: the after walk compares MATCH with the before walk; a source test pins D-12, the one-place resets, domain purity and the route shell (EDIT-04; D-11, D-12, D-13)

**UI hint**: yes
**Notes**: No screen changes, so no UI-SPEC is needed (`ui_phase` is off). Hook tests follow `app/src/ui/useFold.reset.test.jsx` (jsdom opted in per file, no hook-testing library adopted); adopting more test tooling is a structural choice to raise in discussion. The bare `penDraft.rows[row.id]` reads that T-03.6-02 tracks (low, open) move with this code.

### Phase 6: The ingredient library in the store

**Goal**: The ingredient library lives in the store behind the repository seam, seeded from `data/library.js`, carried by export and import, and a change to it never moves a stored version's or batch's figures
**Depends on**: Phase 4 (v1, shipped). Does not need Phase 5: it touches the store, the seed and the transfer file, not the recipe page
**Requirements**: LIB-01, LIB-02, LIB-03
**Success Criteria** (what must be TRUE):
  1. On an empty database the library is its own object store, seeded from `data/library.js` and read through the repository seam; outside the seed path (`store/seed.js` and the seed recipe files in `data/`) no module under `app/src` imports `data/library.js`, tests aside, and `idb` is still imported by `store/db.js` alone
  2. A profile left at database version 8 opens at the new database version with the library store present and holding every seed entry, and the seeded recipes still open with their figures
  3. Changing a library entry in the store leaves every stored version's balance figures and every batch's snapshot exactly as they were, proven by a test against a real IndexedDB (fake-indexeddb), as Phase 1 proved it for the in-memory library
  4. An export carries the library beside recipes, versions and batches (drafts stay on the device), and importing that file restores all four in one transaction: an import that fails part-way leaves every store as it was

**Plans**: TBD
**Notes**: Settle in discussion: `app/src/store/db.js` resets only profiles below 8 and says a later bump writes its own lift (04-04: "records Mark makes from now on are real"), while `REQUIREMENTS.md` says the reset applies as usual on this bump. Adding a store needs neither a reset nor a lift, so check for real stored records before choosing.

### Phase 7: Creation primitives

**Goal**: Code can build a new recipe from scratch without touching the store (a recipe with a root version, rows copied from library entries, step keys that are never reused), so v2's creation UI has its groundwork in place
**Depends on**: Phase 6 (MAKE-03 builds a row from the library entry shape LIB-01 settles)
**Requirements**: MAKE-01, MAKE-02, MAKE-03
**Success Criteria** (what must be TRUE):
  1. Given a name and starting rows, one function returns a recipe and its root version (no parent, the version naming the recipe) that the store file's import validation accepts and whose six balance figures compute, with no store call
  2. The step-key allocator never hands out a key that a step of the version holds or has held: with steps 1 to 4 and step 3 removed the next key is 5, never 3, and removing the highest-numbered step does not free its key either
  3. Building a row from a library entry embeds a `structuredClone` of the entry's coefficients and basis: changing the entry afterwards leaves the row unchanged, and a row built for an ingredient the olive oil seed uses, at the seeded amount, gives the same figures as the seeded row
  4. All three live under `app/src/domain/` with no framework, DOM or store import, their tests run under node, and the existing suite stays green with no screen changed (no creation UI calls them yet)

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 5 → 6 → 7. Phase 6 does not need Phase 5 and may run beside it; Phase 7 needs Phase 6.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 5. Split the recipe page | v1.1 | 6/6 | In Progress | - |
| 6. The ingredient library in the store | v1.1 | 0/TBD | Not started | - |
| 7. Creation primitives | v1.1 | 0/TBD | Not started | - |

## Later

**v2 candidates.** Not phases yet; each is numbered when v2 is defined with `/gsd-new-milestone`.

- Version evolution (the former Phase 5; deferred to v2 by Mark, 2026-10-14): a batch records reordered and new Instructions steps, and a version can evolve its step structure by adding, removing and reordering steps, so version development is not limited to amounts and step text. First deferred from Phase 03.5 by Mark, 2026-09-23. Covered by REC-03 and REC-05 in `REQUIREMENTS.md`.

---
*Roadmap created: 2026-09-05; Milestone 1 archived 2026-10-14; v1.1 phases added 2026-10-14*
