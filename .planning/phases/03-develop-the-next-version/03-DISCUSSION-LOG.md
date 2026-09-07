# Phase 3: Develop the next version - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-07
**Phase:** 3-develop-the-next-version
**Areas discussed:** Opening the pen and addressing changes, A fifth advisory: machine minimum fill, Schema move and old exports

Offered and not selected: Partly marked tastings (the batch brief's position stands unchanged).

---

## Opening the pen and addressing changes

### Label of the control that opens the pen

| Option | Description | Selected |
|--------|-------------|----------|
| Develop the next version | The brief's working name and title; reads as the outcome on a churned version, and the maker is still developing the next state on an unchurned one | ✓ |
| Develop | One familiar word; the save controls name the outcome | |
| Revise this version | Names the act; risks reading as in-place editing of a churned version | |

**User's choice:** Develop the next version

### Is the show-changes state URL-addressable?

| Option | Description | Selected |
|--------|-------------|----------|
| Query parameter, e.g. ?changes | A reading state that survives reload and can be linked; composes with the batch URL; print ignores it | ✓ |
| Page state only, no URL | React state like the pen; reload returns the clean reading | |
| Path segment /recipe/:id/changes | A distinct route; does not compose with the batch URL without a fourth route | |

**User's choice:** Query parameter

### Baseline struck beside the fields on an unchurned child

| Option | Description | Selected |
|--------|-------------|----------|
| The record the pen opened on | What is struck is what is being struck now; one rule serves save-over and save-as-new | ✓ |
| Always the parent | Cumulative difference from the parent; matches show-changes after save-over only | |

**User's choice:** The record the pen opened on

### Must the version line be unique within the recipe?

| Option | Description | Selected |
|--------|-------------|----------|
| Block a duplicate in words | Blocked beside the control, as a blank is | ✓ |
| Allow duplicates | Creation order tells them apart | |

**User's choice:** Block a duplicate in words

---

## A fifth advisory: machine minimum fill

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, a fifth derived advisory | Rows' sum against the equipment profile's minimum fill with a basis line; Phase 1's seed comment anticipated it | |
| No, hold it for SCALE-01 | The packet gives machine capacity to SCALE-01, which forbids asserting safe fit; Phase 3 ships the four named advisories | ✓ |

**User's choice:** No, hold it for SCALE-01
**Notes:** The sheet's "confirm 800 g clears your machine's minimum fill" line stays unprinted in milestone 1.

---

## Schema move and old exports

### How the stored churned version acquires the new record shape

| Option | Description | Selected |
|--------|-------------|----------|
| One-time upgrade adds metadata | DB version bump lifts stored versions to the new shape; the seeded record receives the authored uses lists; content and figures untouched, proven by test | ✓ |
| Tolerate on read, never rewrite | Stored records stay byte-identical; the churned record has no uses lists until re-seeded | |
| Clear and re-seed | Export, clear, re-import by hand | |

**User's choice:** One-time upgrade adds metadata

### What a schemaVersion 2 export does when imported after the move

| Option | Description | Selected |
|--------|-------------|----------|
| Accepted and upgraded on import | Same lift as the DB upgrade; export writes the new version; matches Phase 2's v1 precedent | ✓ |
| Refused, re-export from the current build | Only current files import | |
| Accepted as-is, tolerated on read | Two record shapes live in the store indefinitely | |

**User's choice:** Accepted and upgraded on import

### The seed's authored "uses" lists

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, author it that way | Step 1 lecithin + oil; 2 gums + sucrose + milk; 3 sucrose + SMP + dextrose + salt + milk + cream; 6 allulose; 8 oil + lecithin; 4, 5, 7, 9, 10 none | ✓ |
| Close, I'll correct it in UAT | Author as proposed, correct at UAT | |

**User's choice:** Yes, author it that way

### Imported child whose parent is missing

| Option | Description | Selected |
|--------|-------------|----------|
| Refuse the whole file | Consistent with the validator's refuse-whole-file rule | ✓ |
| Accept, lineage reads "parent not in store" | More forgiving, more states | |

**User's choice:** Refuse the whole file

---

## Claude's Discretion

- Query parameter name and value for show-changes and its composition with the batch URL.
- DB version, store file schemaVersion, per-record schemaVersion; the shared upgrade function's shape.
- Field names for lineage, removed flags, uses lists, inherited-from markers; how removed rows are hidden from the clean reading and from the figures.
- Deriving one row per recipe on the list without a new index.
- Domain module boundaries for lineage, diff, advisories, and flags.
- Pen component decomposition, focus on open and close, blocked-save wording, lineage-line wording beyond the brief.
- Advisory wording and number formatting within the brief's definitions.
- Fixture and UAT for the schema upgrade against a Phase 2 store and export.

## Deferred Ideas

- Minimum-fill advisory — SCALE-01.
- Amending a saved tasting's marks — not this phase.
- Editing bands, adding a step, adding a row — next milestone (held objections).
- Step amounts referencing rows — beyond this milestone.
- Sibling and batch comparison — LEARN-01; as-made ticks and blue "actual" — still deferred; draft persistence — Phase 4; deleting a version — out of scope; documenter re-run after the phase.
