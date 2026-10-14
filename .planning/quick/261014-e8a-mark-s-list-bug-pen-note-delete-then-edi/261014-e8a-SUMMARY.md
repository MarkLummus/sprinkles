---
phase: quick-261014-e8a
plan: 01
subsystem: pen-draft-domain
tags: [bug-fix, provenance, drafts, tdd]
status: complete
requirements-completed: [EDIT-02]
key-files:
  modified:
    - app/src/domain/penDraft.js
    - app/src/domain/penDraft.test.js
  created:
    - app/src/store/pen-note-roundtrip.test.js
key-decisions:
  - "Option C: a draft-level penDraft.noteOrigins map, written only by removePenNote, read by setPenNoteText"
  - "DRAFT_SHAPE_VERSION and fitsPlanShape unchanged; older kept drafts restore and compare by position, not migrated"
completed: 2026-10-14
commits: 2
plan_head_before: b1f9bbc7c82c8d15fbd057f0caa9277c22f77b5b
plan_head_after: eb2ee35d923a09d735d05a967394112618cc2dc3
actuals:
  tasks: 2
  commits: 2
---

# Phase quick-261014-e8a Plan 01: Pen note provenance after a delete Summary

After a note is removed, an edited note is compared with its own original in the version the pen opened on, so its inheritedFrom marker follows its own origin (a draft-level `noteOrigins` map written only by `removePenNote`).

Fixes Mark's List bug `bug-pen-note-delete-then-edit-provenance`. The row is for the orchestrator to close after the merge; the executor did not write to Mark's List.

## What changed

- `app/src/domain/penDraft.js`: `removePenNote` also records, per list, each surviving note's position in the version the pen opened on (`noteOrigins`). `setPenNoteText` looks up `draft.noteOrigins?.[listKey]?.[index] ?? index` and compares with `version.authored[listKey][origin]`. Nothing else in the file changed (the diff starts inside `setPenNoteText`'s header comment).
- `app/src/domain/penDraft.test.js`: six cases in a new describe, `a note removed before another is edited`.
- `app/src/store/pen-note-roundtrip.test.js` (new): three cases over fake-indexeddb through the repository seam.

## Design: Option C, and the stated deviation

The item says to make each draft note carry what it was inherited with (or its original position). Option C carries the original position beside the list (`penDraft.noteOrigins = { [listKey]: [originIndex, ...] }`) rather than on each note object. Reason: `penFieldsFromDraft` and `penDraftVersion` pass `penDraft.authored` through as is, so a per-note field would reach the saved record unless the save path stripped it, and `penDraft.test.js` pins `fields.authored` to the draft's own object. With a draft-level key, those functions pick fields by name and never see it, so no save-path code was edited.

Rejected: Option A (seed origins when the pen opens) changes the stored draft of every pen even without a removal, which would break the 05 walk's recorded drafts-store payload (MATCH 94). Option B (stamp `origin` on each note at removal) needs the save path to strip it.

With no removal there is no `noteOrigins` key: the draft, the stored draft, the saved record and the walk are byte-identical to before.

## Kept drafts

- `DRAFT_SHAPE_VERSION` stays 1 (bumping it would delete every kept draft quietly).
- `fitsPlanShape` in `draft.js` is not edited. It reads only `note.text`, so drafts with or without `noteOrigins` both restore; `carriesUnsafeKey` already walks `noteOrigins`.
- A draft stored before this change has no `noteOrigins`. With no removal its positions still line up. If it already had a removal it keeps today's by-position comparison (it cannot throw, every current index lies inside the version's list). It is not migrated: the project prefers a reset over migration when no live data depends on it. Pinned by case 6.

## Evidence

- RED (penDraft.js swapped to HEAD's by-index version, same tests): `Tests  4 failed | 44 passed (48)`. The four failures are exactly the four cases whose names contain "its own original" (N=4, K=4); the swap was restored and `cmp` confirmed the fixed file was back before committing. The plan's single-line RED-PROOF-OK script was run as its separate steps (the sandbox rejects compound commands with variables); the checks were equivalent (R=1, N=4, K=4, restored file identical to the fixed copy).
- GREEN: `npm --prefix app test -- src/domain/penDraft.test.js` gives 48 passed (48).
- REGION: the penDraft.js diff hunks start at line 380, at or after `setPenNoteText`'s header comment (line 375 at HEAD). Nothing above it changed.
- Walk: build to a scratch `--outDir`, `05-walk.mjs record`, then `compare` against `05-walk-before.json`: `MATCH 94 snapshots`.
- Store round trip: `npm --prefix app test -- src/store/pen-note-roundtrip.test.js` gives 3 passed (3).
- Full suite after both tasks: 86 files, 2686 tests, all green (baseline 85 files, 2677 tests; +6 domain, +3 store).
- Scope: only `penDraft.js`, `penDraft.test.js` and the new `pen-note-roundtrip.test.js` changed under `app/`; no package file, no `draft.js`, `lineage.js`, UI or store source.

## Deviations from Plan

None to the code scope. The only difference is procedural: the plan's RED-PROOF and SCOPE-OK one-liners were run as separate plain commands because the sandbox rejects compound commands with variables; the conditions they check were all verified and are reported above.

## Observed, not fixed (unverified)

- (a) `fitsPlanShape` does not compare a draft's note count with its version's. A draft kept across an import that replaced its version with fewer notes could still throw in `setPenNoteText`. This was already possible with the plain index; an origin is the same class.
- (b) No app code stamps `inheritedFrom` on a child's inherited notes (`createChildVersion` copies the parent's markers as they are), although the olive-oil.js comment describes a child carrying its parent's version line. So today markers come only from imported files, and no seeded note can show the marker: there is no visible device check.

## Threat Flags

None. No new endpoint, auth path or schema; the saved note shape is still exactly `{ text, inheritedFrom }` (asserted through `createChildVersion`, `saveVersion` and `getVersion`).

## Self-Check: PASSED

- FOUND: app/src/domain/penDraft.js, app/src/domain/penDraft.test.js, app/src/store/pen-note-roundtrip.test.js
- FOUND commits: 737d2be (fix), eb2ee35 (test)
