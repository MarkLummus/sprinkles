// The one shared, synchronous, idempotent lift from any prior version-record
// shape to the current one (D-06, D-07). db.js's upgrade callback calls it
// once per stored record through a cursor; transfer.js's importStore calls
// it once per version object in a schemaVersion 2 file, before validation.
// Neither call site may grow a second ladder of its own — two lifts drift,
// and drift is the hazard this project already has a name for (coefficient
// drift, PROJECT.md).
//
// Fully synchronous: no `await` may appear in this file. db.js's upgrade
// callback awaits only store.openCursor() and cursor.continue() — both
// IDB-native requests on the same versionchange transaction — because
// awaiting anything else inside `upgrade` lets the transaction auto-commit
// early and throws TransactionInactiveError on the next request.

// The version record's own bookkeeping number — distinct from DB_VERSION
// (db.js) and from the store file's schemaVersion (transfer.js). Bumped in
// lockstep with both this phase, but the three numbers mean different
// things and are kept as three constants on purpose.
export const VERSION_SCHEMA_VERSION = 2;

// A fixed constant, not a live timestamp: two machines running this
// migration on different days must agree on the seeded version's
// createdAt, so it is never derived from new Date() or from any batch —
// a version can exist with zero batches. Reads as "before this field
// existed."
export const SEED_CREATED_AT = '2026-07-01T00:00:00.000Z';

// D-08, confirmed by Mark: the seeded olive oil version's per-step row
// ids. Keyed by step n; steps 4, 5, 7, 9 and 10 use no rows. Split rows
// (whole milk, sucrose) appear in both steps 2 and 3.
export const SEED_USES = {
  1: ['row-09', 'row-03'],
  2: ['row-10', 'row-11', 'row-12', 'row-05', 'row-01'],
  3: ['row-05', 'row-04', 'row-07', 'row-08', 'row-01', 'row-02'],
  4: [],
  5: [],
  6: ['row-06'],
  7: [],
  8: ['row-03', 'row-09'],
  9: [],
  10: [],
};

// Accepts a bare string (Phase 1/2's authored-note shape) or an object
// already in the new shape, so lifting an already-lifted note is a no-op.
function liftAuthoredNote(note) {
  if (typeof note === 'string') return { text: note, inheritedFrom: null };
  return { text: note.text, inheritedFrom: note.inheritedFrom ?? null };
}

/**
 * liftVersionRecord(raw) -> a version record carrying every field this
 * phase adds, defaulted with `??` where absent. Additive: never touches
 * grams, ingredient, instruction, targets, equipment or process, and
 * never deletes a key it does not recognise. Idempotent:
 * liftVersionRecord(liftVersionRecord(raw)) deep-equals
 * liftVersionRecord(raw), so db.js's cumulative oldVersion-guard and
 * transfer.js's "schemaVersion 2 or later" branch can both call it
 * unconditionally. The seed patch below fills the seeded olive oil
 * version's `uses` only where a step's own `uses` is still empty, so a
 * maker's later edit to those lists is never overwritten by a re-run.
 */
export function liftVersionRecord(raw) {
  const lifted = {
    ...raw,
    schemaVersion: VERSION_SCHEMA_VERSION,
    parentVersionId: raw.parentVersionId ?? null,
    parentVersionLabel: raw.parentVersionLabel ?? null,
    reason: raw.reason ?? null,
    citedBatchId: raw.citedBatchId ?? null,
    createdAt: raw.createdAt ?? SEED_CREATED_AT,
    rows: raw.rows.map((row) => ({ ...row, removed: row.removed ?? false })),
    method: (raw.method ?? []).map((step) => ({
      ...step,
      removed: step.removed ?? false,
      uses: step.uses ?? [],
    })),
    authored: {
      carriedForward: (raw.authored?.carriedForward ?? []).map(liftAuthoredNote),
      beforeYouStart: (raw.authored?.beforeYouStart ?? []).map(liftAuthoredNote),
    },
  };

  if (raw.id === 'olive-oil-ice-cream-v1') {
    lifted.method = lifted.method.map((step) => {
      if (step.uses.length > 0) return step;
      const seeded = SEED_USES[step.n];
      return seeded ? { ...step, uses: seeded } : step;
    });
  }

  return lifted;
}
