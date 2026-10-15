# Roadmap: Sprinkles

## Milestones

- ✅ **v1 Develop the next olive oil recipe** — Phases 1-4 and the inserted 03.x phases (shipped 2026-10-13). Archive: `milestones/v1-ROADMAP.md`; audit: `milestones/v1-MILESTONE-AUDIT.md`.
- ✅ **v1.1 Groundwork for creation** — Phases 5-7 (shipped 2026-10-15). The code is made ready for recipe creation; no creation UI ships and no screen changes. Archive: `milestones/v1.1-ROADMAP.md`; audit: `milestones/v1.1-MILESTONE-AUDIT.md`.
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

<details>
<summary>✅ v1.1 Groundwork for creation (Phases 5-7) — SHIPPED 2026-10-15</summary>

- [x] **Phase 5: Split the recipe page** (6/6 plans) - The recipe page's draft logic moves into pure domain operations behind hooks, leaving `RecipePage` as the route shell; the maker sees no change (completed 2026-10-14)
- [x] **Phase 6: The ingredient library in the store** (3/3 plans) - The ingredient library becomes an object store behind the repository seam, seeded, exported and imported, and editing it never moves a stored figure (completed 2026-10-14)
- [x] **Phase 7: Creation primitives** (3/3 plans) - Framework-free functions create a recipe with a root version, hand out step keys that are never reused, and build a row from a library ingredient (completed 2026-10-15)

Full phase detail, plans and progress: `.planning/milestones/v1.1-ROADMAP.md`.

</details>

## Later

**v2 candidates.** Not phases yet; each is numbered when v2 is defined with `/gsd-new-milestone`.

- Version evolution (the former Phase 5; deferred to v2 by Mark, 2026-10-14): a batch records reordered and new Instructions steps, and a version can evolve its step structure by adding, removing and reordering steps, so version development is not limited to amounts and step text. First deferred from Phase 03.5 by Mark, 2026-09-23. Covered by REC-03 and REC-05 in `REQUIREMENTS.md`.

---
*Roadmap created: 2026-09-05; Milestone 1 archived 2026-10-14; v1.1 archived 2026-10-15*
