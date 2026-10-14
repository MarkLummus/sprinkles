# Phase 2: Record the first batch - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-06
**Phase:** 02-record-the-first-batch
**Areas discussed:** Confirming the 2 Aug ink, Marks and measures, Batch identity/URL/store, Result states and the reading page

---

## Confirming the 2 Aug ink

| Option | Description | Selected |
|--------|-------------|----------|
| Confirmed as transcribed | Every value right; becomes the working case | |
| Mostly right, with corrections | Tell me which values are wrong | ✓ |

**User's choice:** Mostly right, with corrections.
**Notes:** "Fast, Soft, Prechill 15 min" are Whynter machine settings; a structured place for machine settings when appropriate is wanted later. The printed recipe has no equipment details at all. Micro-ingredients under 1 g need a stated handling since the kitchen scale does not read below 1 g. Step 9 reads "Speed Δ @ 20" (speed changed at 20 minutes), not "Speed A".

| Option | Description | Selected |
|--------|-------------|----------|
| Skipped: no lecithin used | As-made 0 g, step 1 struck | ✓ |
| Done, folded into another step | Struck with a changed line saying where it went | |
| Done as written, struck as a tick-off | No strike needed | |

**User's choice:** Skipped: no lecithin used.

| Option | Description | Selected |
|--------|-------------|----------|
| Record it per batch | A measured field, blank reads unknown | ✓ |
| Take it from the version's serve target | No field | |

**User's choice:** Record tasting temperature per batch.

| Option | Description | Selected |
|--------|-------------|----------|
| As-made column only | Step 3 unmarked | |
| Changed step too | A blue line in the maker's words | |

**User's choice:** Free text: step 3 should be driven by amounts in the ingredient table; work out how to keep ingredient amounts and method step amounts in sync (replacement macros). Follow-up offered "Build the reference now" vs "Defer the mechanism to Phase 3"; chose **Defer to Phase 3**, step 3 unmarked in Phase 2.

| Option | Description | Selected |
|--------|-------------|----------|
| Out of the batch record | Bottle date and butterfat return with ING-01 | |
| Keep as a free-text batch note | One optional untyped ingredient-notes line | ✓ |

**User's choice:** Keep as a free-text batch note.

| Option | Description | Selected |
|--------|-------------|----------|
| One original recording | The 45 g is original ink; amend exercised in UAT | ✓ |
| 45 g arrives as an amendment | Fixture demonstrates amend | |

**User's choice:** One original recording ("Actually 45 g" was captured during the churn).
**Notes:** Mark: the log page captures two events, the churn (2 Aug) and a first tasting with no date given (a design bug). A common amendment would be a tasting capturing the four core dimensions plus the recipe's. The log should break into a churn section and one or more dated tasting sections.

| Option | Description | Selected |
|--------|-------------|----------|
| Words required per tasting; write them now | A tasting cannot save without words | |
| Marks alone can save a tasting | Date plus at least one of words or marks | ✓ |

**User's choice:** Marks alone can save a tasting.

| Option | Description | Selected |
|--------|-------------|----------|
| Date required; you supply it | Best known date typed at transcription | |
| Date may be absent, reads as unknown | "date unknown" in ink; undated ordered last | ✓ |

**User's choice:** Date may be absent.

| Option | Description | Selected |
|--------|-------------|----------|
| Per tasting | Each tasting ends with its own next-time note | ✓ |
| One per batch | Single note, overwritten | |

**User's choice:** Per tasting.

| Option | Description | Selected |
|--------|-------------|----------|
| Tasting event | Meltdown sits with the tasting | |
| Churn event | With the four measured values | |

**User's choice:** Question declined; resolved on the old batch brief's evidence as a tasting-event field, stated in CONTEXT.md D-08 and not contested.

---

## Marks and measures

| Option | Description | Selected |
|--------|-------------|----------|
| 1–5 with anchor words at the ends | As the sheet and earlier attempt | ✓ |
| Signed scale centred on Good | −2 to +2 from the binder audit | |

**User's choice:** Free text: the stalled Impeccable design had a 1–5 scale with more descriptive ends, hardness "spoon sinks" to "spoon won't enter". Anchors found in old-sprinkles `CORE_AXES` and adopted.

| Option | Description | Selected |
|--------|-------------|----------|
| Typed percentage | One field | ✓ |
| Jar weights, percentage derived | Two fields, derived | |

**User's choice:** Typed percentage.

| Option | Description | Selected |
|--------|-------------|----------|
| Before and after grams, loss derived | Two fields | |
| Loss in grams only | One field | ✓ |

**User's choice:** Loss in grams only.

| Option | Description | Selected |
|--------|-------------|----------|
| Authored on the version with the axis | declaredAxes becomes {name, low, high} | ✓ |
| Bare names, no anchors | | |

**User's choice:** Authored on the version.

| Option | Description | Selected |
|--------|-------------|----------|
| Use these | olive oil character "can't find it … tastes of oil first"; bitterness "none … catches the throat" | ✓ |
| I'll write them | | |

**User's choice:** Use the suggested anchors.
**Notes:** Mark expects a common list of dimensions later, especially bitterness.

| Option | Description | Selected |
|--------|-------------|----------|
| Number only | Come-up stores 20 | ✓ |
| Keep an approximate flag | "about 20 min" | |

**User's choice:** Number only.

| Option | Description | Selected |
|--------|-------------|----------|
| Nine stops, keyboard group | 1, 1.5 … 5 as a labelled group | ✓ |
| A number field accepting 1–5 in halves | | |

**User's choice:** Nine stops.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, as listed | Whole minutes; °C to a half degree with sign; whole percent; whole grams; finer kept as typed | ✓ |
| Accept any decimal everywhere | | |

**User's choice:** Yes, as listed.

---

## Batch identity, URL, and the store

| Option | Description | Selected |
|--------|-------------|----------|
| /recipe/:id/batch/:batchId | Nested under the version | ✓ |
| /batch/:batchId | Flat | |

**User's choice:** Nested.

| Option | Description | Selected |
|--------|-------------|----------|
| Opaque id, churn date as the label | crypto.randomUUID | ✓ |
| Readable, from version and churn date | With a suffix on collision | |

**User's choice:** Opaque id.

| Option | Description | Selected |
|--------|-------------|----------|
| Latest churn date only | Margin list shows the count | ✓ |
| Churn date and a count | | |

**User's choice:** Latest churn date only.

| Option | Description | Selected |
|--------|-------------|----------|
| List of amendment dates | recordedAt plus amendedAt list; prior values not kept | ✓ |
| Single latest amended-on date | | |

**User's choice:** List of amendment dates.

Store shape, DB version bump, and export/import extension: not asked; left to Claude's discretion.

---

## Result states and the reading page

| Option | Description | Selected |
|--------|-------------|----------|
| Keep it, on the tasting's words field | One control writes "as expected, nothing to note" | ✓ |
| Drop it | | |

**User's choice:** Keep it.

| Option | Description | Selected |
|--------|-------------|----------|
| Defer | Changed line carries it until Phase 3's step macros | ✓ |
| Include in Phase 2 | Optional blue actual per target chip | |

**User's choice:** Defer.

| Option | Description | Selected |
|--------|-------------|----------|
| All three | Alignment, total row, trace under 0.05% | ✓ |
| Only the alignment | | |

**User's choice:** All three.

| Option | Description | Selected |
|--------|-------------|----------|
| Leave warning only | beforeunload; draft persistence in Phase 4 | ✓ |
| Persist the draft now | | |

**User's choice:** Leave warning only.

---

## Claude's Discretion

- Store shape for batches, DB version bump and upgrade, export/import schema bump and backward import.
- Repository seam methods for batches.
- Snapshot contents beyond rows and coefficients.
- Pen-layer component decomposition, tab order mechanics, wording beyond what the brief fixes.
- Empty margin wording and the two-batch list.
- How the 2 Aug batch is seeded for fixture and UAT.

## Deferred Ideas

- Structured machine settings on the equipment profile (Whynter settings).
- Equipment details on the printed recipe (Phase 4).
- Micro-ingredient handling below 1 g scale resolution (Phase 3 master blend, Phase 4 print).
- Method step amounts as references to ingredient rows (Phase 3).
- A common library of declared dimensions with anchors.
- Blue actual beside target chips; as-made tick on graduated rules; draft persistence (UX1-02, Phase 4).
