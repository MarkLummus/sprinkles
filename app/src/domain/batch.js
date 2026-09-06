// Pure. No framework, no DOM, no store import. The batch record's shape
// and its rules: create, snapshot, and as-made read/write discipline — see
// 02-CONTEXT.md D-01 (one churn event owning a list of tastings), D-11 (0
// is a real as-made value, distinct from absent), D-18 (a measured or
// as-made value is stored as typed, never rounded), D-20 (the batch's
// opaque id), and BATCH2-01 (the snapshot, taken once and never retaken).
//
// Precision contract (D-18): a value the maker typed is stored as a plain
// JavaScript number and is never rounded, never re-formatted, and never
// passed through the rounding convention the balance figures use. That
// convention belongs to computed figures only — a measured or as-made
// number shows what was entered. asMadeTotals below is the one computed
// figure this module produces; rounding it for display is the table's
// decision, made once, at the point of presentation, not here.

export const BATCH_SCHEMA_VERSION = 1;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * formatRecordDate(iso) -> 'D Mon YYYY', built from the leading
 * YYYY-MM-DD of any ISO 8601 string against a fixed month table. Never
 * constructs a Date and never calls a locale- or timezone-dependent
 * formatter — the same record must read the same on every machine and in
 * every test run.
 */
export function formatRecordDate(iso) {
  const [year, month, day] = iso.slice(0, 10).split('-');
  const monthName = MONTHS[Number(month) - 1];
  return `${Number(day)} ${monthName} ${year}`;
}

/**
 * createBatch(version, churnFields, { id, now }) -> a new batch record.
 * Pure: id and now are supplied by the caller — this function never reaches
 * for crypto.randomUUID() or new Date() itself (that impurity lives in the
 * one save handler that calls this). The snapshot is a structuredClone of
 * the version's rows and declaredAxes, taken once here and never retaken
 * by any later function (BATCH2-01).
 */
export function createBatch(version, churnFields, { id, now }) {
  const asMade = {};
  if (churnFields.asMade) {
    for (const rowId of Object.keys(churnFields.asMade)) {
      asMade[rowId] = churnFields.asMade[rowId];
    }
  }

  return {
    schemaVersion: BATCH_SCHEMA_VERSION,
    id,
    versionId: version.id,
    recordedAt: now,
    amendedAt: [],
    snapshot: {
      coefficientSetId: version.coefficientSetId,
      versionLabel: version.versionLabel,
      rows: structuredClone(version.rows),
      declaredAxes: structuredClone(version.declaredAxes),
    },
    churn: {
      churnDate: churnFields.churnDate ? churnFields.churnDate : null,
      asMade,
      stepChanges: {},
      comeUpMinutes: null,
      drawTempC: null,
      overrunPercent: null,
      drawNotes: null,
      ingredientNotes: null,
      nextTimeNote: null,
    },
    tastings: [],
  };
}

/**
 * hasAsMade(batch, rowId) -> whether the maker wrote something for this
 * row. Presence is tested with an own-property check, in the manner
 * figures.js already uses for authored bands — never truthiness — so a
 * written 0 (D-11) is distinguishable from an absent entry.
 */
export function hasAsMade(batch, rowId) {
  return Object.prototype.hasOwnProperty.call(batch.churn.asMade, rowId);
}

/**
 * asMadeFor(batch, rowId) -> the written number, or null when absent —
 * never the plan's number. The plan never leaks into the as-made reading.
 */
export function asMadeFor(batch, rowId) {
  return hasAsMade(batch, rowId) ? batch.churn.asMade[rowId] : null;
}

/**
 * asMadeTotals(rows, asMade) -> { planTotal, asMadeTotal }. planTotal sums
 * every row's plan grams. asMadeTotal sums the as-made value where the
 * row's key is present (a written 0 contributes zero — D-11) and the
 * row's plan grams where it is not (the plan fills the gap, never the
 * reverse). Presence is decided by an own-property check, never
 * truthiness. Neither total is rounded here — see the precision contract
 * above.
 */
export function asMadeTotals(rows, asMade) {
  let planTotal = 0;
  let asMadeTotal = 0;
  for (const row of rows) {
    planTotal += row.grams;
    asMadeTotal += Object.prototype.hasOwnProperty.call(asMade, row.id) ? asMade[row.id] : row.grams;
  }
  return { planTotal, asMadeTotal };
}
