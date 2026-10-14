# Phase 6: The ingredient library in the store - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-14
**Phase:** 6-The ingredient library in the store
**Areas discussed:** Version bump, Library record shape, Seeding an upgraded profile, Export file version, Import rules

---

## Version bump

| Option | Description | Selected |
|--------|-------------|----------|
| Keep them (Recommended) | One guarded create in db.js, nothing dropped; REQUIREMENTS line 30 corrected | ✓ |
| Reset again, as REQUIREMENTS says | Profiles at 8 drop the four stores and reseed; the reset branch widens to below 9 | |
| Keep, but I have records to protect | Same as keep, plus a test that a hand-made batch at 8 survives | |

**User's choice:** Keep them (Recommended)
**Notes:** Claude adds the survival test anyway (D-01) since it is cheap and proves the choice.

---

## Library record: key and shape

| Option | Description | Selected |
|--------|-------------|----------|
| Wrapper: { id, entry } (Recommended) | Key path id; entry untouched, so no id leaks into rows | ✓ |
| Flat: { id, ...entry } | One level less, but Phase 7 must strip the id before cloning | |
| Wrapper, and add provenance fields now | Adds origin/addedAt; overlaps ING-01 | |

**User's choice:** Wrapper: { id, entry } (Recommended)
**Notes:** None.

---

## Seeding an upgraded profile

| Option | Description | Selected |
|--------|-------------|----------|
| Library's own emptiness check (Recommended) | Second independent guard in seedIfEmpty; db.js never imports library.js | ✓ |
| Seed inside the upgrade callback | One step, but db.js imports data/library.js, breaking criterion 1 | |
| Top up on every boot | Adds missing seed entries on each boot; more than the phase asks | |

**User's choice:** Library's own emptiness check (Recommended)
**Notes:** None.

---

## Export file: version

| Option | Description | Selected |
|--------|-------------|----------|
| Bump to 8, refuse 7 (Recommended) | Existing older-version message; one shape to validate | ✓ |
| Bump to 8, still accept 7 | Old backups import with no library; two shapes to carry | |

**User's choice:** Bump to 8, refuse 7 (Recommended)
**Notes:** None.

---

## Import rules

| Option | Description | Selected |
|--------|-------------|----------|
| Upsert by id, check the wrapper (Recommended) | Put by id like the other stores; validate id, entry, name, composition | ✓ |
| Replace the library with the file's | Clears the store first; deletes entries the file lacks | |
| Upsert by id, validate every field | Checks basis, source, density, category too; long validator for a shape ING-01 will change | |

**User's choice:** Upsert by id, check the wrapper (Recommended)
**Notes:** None.

---

## Claude's Discretion

- Repository method names for the library, and whether the write surface grows beyond the seed, import and the LIB-02 test.
- How the fake-indexeddb proof for criterion 3 is arranged.
- Plan and wave breakdown.

## Deferred Ideas

- Seed top-up on later builds (ING-01).
- Provenance fields on a library record (ING-01).
- Accepting version 7 export files.

---

## Codex review follow-up (2026-10-14)

Codex reviewed 06-CONTEXT.md read-only. Findings applied to CONTEXT: D-01 now supersedes REQUIREMENTS lines 30 and 58 and says the below-8 reset remains; D-01a adds the genuine version-8 fixture proof; D-04 is qualified (guards are independent) with a four-combination test; D-08 uses the existing `isPlainObject` check.

| Question | Options | Selected |
|----------|---------|----------|
| Refill an imported empty library on the next boot? | Yes, reseed on boot (Recommended) / No, an import is final | Yes, reseed on boot (D-04a) |
| Export in one consistent snapshot? | Yes, one read transaction (Recommended) / No, atomic import only | Yes, one read transaction (D-07a) |
