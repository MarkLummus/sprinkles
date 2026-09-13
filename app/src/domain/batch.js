// Pure. No framework, no DOM, no store import. The batch record's shape
// and its rules under the one-save model: create, complete, snapshot, and
// as-made read/write discipline — see 03.3.1-CONTEXT.md D-01 through D-04
// (one save action, a batch carries zero or one tasting, `changed` replaces
// the amendment list), D-07 (the battery's new field names), D-09/D-10
// (blank-is-absent on every new field), and BATCH2-01 (the snapshot, taken
// once and never retaken).
//
// Precision contract (D-18, carried from Phase 2): a value the maker typed
// is stored as a plain JavaScript number and is never rounded, never
// re-formatted, and never passed through the rounding convention the
// balance figures use. That convention belongs to computed figures only —
// a measured or as-made number shows what was entered. asMadeTotals below
// is the one computed figure this module produces; rounding it for display
// is the table's decision, made once, at the point of presentation, not
// here.
import { rowGrams } from './rows.js';

export const BATCH_SCHEMA_VERSION = 3;

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
 * buildChurn(churnFields) -> the churn object both createBatch and
 * completeRecord write, replaced wholesale on every save (D-02). Every
 * numeric field uses an explicit `!= null` check (never `||`/truthiness)
 * so a written 0 survives as a real value (D-10, BATCH1-02); every text
 * field uses presence-of-content, since an empty string and an absent
 * note are the same fact for free text.
 */
function buildChurn(churnFields) {
  const asMade = {};
  if (churnFields.asMade) {
    // A shallow copy of each row's own array (D-10, carried from Phase 2),
    // not a shared reference — the caller's own churnFields.asMade arrays
    // must never be the same array the stored record holds, so a later
    // mutation of the caller's object can never move an already-saved
    // batch.
    for (const rowId of Object.keys(churnFields.asMade)) {
      asMade[rowId] = [...churnFields.asMade[rowId]];
    }
  }

  const stepChanges = {};
  if (churnFields.stepChanges) {
    for (const stepKey of Object.keys(churnFields.stepChanges)) {
      stepChanges[stepKey] = churnFields.stepChanges[stepKey];
    }
  }

  return {
    churnDate: churnFields.churnDate ? churnFields.churnDate : null,
    asMade,
    stepChanges,
    timeToDrawTempMinutes: churnFields.timeToDrawTempMinutes != null ? churnFields.timeToDrawTempMinutes : null,
    outOfMachineTempC: churnFields.outOfMachineTempC != null ? churnFields.outOfMachineTempC : null,
    churnDurationMinutes: churnFields.churnDurationMinutes != null ? churnFields.churnDurationMinutes : null,
    exitConsistency: churnFields.exitConsistency != null ? churnFields.exitConsistency : null,
    airiness: churnFields.airiness != null ? churnFields.airiness : null,
    atTheMachine: churnFields.atTheMachine ? churnFields.atTheMachine : null,
    ingredientNotes: churnFields.ingredientNotes ? churnFields.ingredientNotes : null,
    nextTimeNote: churnFields.nextTimeNote ? churnFields.nextTimeNote : null,
  };
}

/**
 * buildTasting(tastingFields) -> null when tastingFields is null/absent
 * (D-02: an empty tasting section persists no tasting at all), otherwise
 * the single tasting object. marks is copied with a shallow own-key spread
 * (setMark's own discipline — axes.js), so an unmarked axis stays absent
 * rather than becoming a manufactured zero (D-10). defects is a copy of
 * the supplied array, or null when none was supplied. bitterDeclared is
 * true-or-null, never false — the toggle is either declared or absent.
 */
function buildTasting(tastingFields) {
  if (tastingFields == null) return null;
  return {
    tastedDate: tastingFields.tastedDate != null ? tastingFields.tastedDate : null,
    temperingMinutes: tastingFields.temperingMinutes != null ? tastingFields.temperingMinutes : null,
    tastingTempC: tastingFields.tastingTempC != null ? tastingFields.tastingTempC : null,
    marks: tastingFields.marks ? { ...tastingFields.marks } : {},
    note: tastingFields.note ? tastingFields.note : null,
    defects: tastingFields.defects ? [...tastingFields.defects] : null,
    bitterDeclared: tastingFields.bitterDeclared === true ? true : null,
    meltTestG: tastingFields.meltTestG != null ? tastingFields.meltTestG : null,
    meltStyle: tastingFields.meltStyle != null ? tastingFields.meltStyle : null,
  };
}

/**
 * createBatch(version, churnFields, tastingFields, { id, now }) -> a new
 * batch record. Pure: id and now are supplied by the caller — this
 * function never reaches for crypto.randomUUID() or new Date() itself
 * (that impurity lives in the one save handler that calls this). The
 * snapshot is a structuredClone of the version's rows, declaredAxes and
 * declaredFlaw, taken once here and never retaken by any later function
 * (BATCH2-01). tastingFields is zero-or-one: pass null for a fresh
 * churn-only record.
 */
export function createBatch(version, churnFields, tastingFields, { id, now }) {
  return {
    schemaVersion: BATCH_SCHEMA_VERSION,
    id,
    versionId: version.id,
    recordedAt: now,
    changed: null,
    snapshot: {
      coefficientSetId: version.coefficientSetId,
      versionLabel: version.versionLabel,
      rows: structuredClone(version.rows),
      declaredAxes: structuredClone(version.declaredAxes),
      declaredFlaw: version.declaredFlaw != null ? version.declaredFlaw : null,
    },
    churn: buildChurn(churnFields),
    tasting: buildTasting(tastingFields),
  };
}

/**
 * completeRecord(batch, churnFields, tasting, { now }) -> a new batch
 * whose churn is replaced wholesale and whose tasting is the supplied
 * zero-or-one object — a null tasting argument removes a stored tasting
 * (RESEARCH.md Assumption A3, D-02's literal reading: what a save
 * persists is everything the record currently holds). `changed` is
 * stamped with `now` on every completeRecord call, since a completing
 * save is always a save after the first (D-04). recordedAt, snapshot and
 * id are untouched — the snapshot is never retaken (BATCH2-01).
 */
export function completeRecord(batch, churnFields, tasting, { now }) {
  return {
    ...batch,
    churn: buildChurn(churnFields),
    tasting: buildTasting(tasting),
    changed: now,
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
 * asMadeFor(batch, rowId) -> the written array, aligned index-for-index
 * with that row's portions, or null when absent — never the plan's
 * numbers. The plan never leaks into the as-made reading.
 */
export function asMadeFor(batch, rowId) {
  return hasAsMade(batch, rowId) ? batch.churn.asMade[rowId] : null;
}

/**
 * asMadeForPortion(batch, rowId, index) -> the written value at that
 * portion, or null when the row key is absent, the element itself is
 * null, or the index does not resolve to an element at all. The same
 * explicit-null discipline the rest of this module uses (D-11): a written
 * 0 at that index is a real value, distinguishable from an absent one.
 */
export function asMadeForPortion(batch, rowId, index) {
  if (!hasAsMade(batch, rowId)) return null;
  const value = batch.churn.asMade[rowId][index];
  return value === undefined ? null : value;
}

/**
 * stepChangeFor(batch, n) -> the step's { struck, line } entry, or null.
 * Presence is decided by an own-property check on the step number as a
 * string key. An absent key means the maker wrote nothing about that step —
 * and that is *not* the same fact as the step having been done as written
 * (BATCH1-01's anti-goal): no function in this module has a "done as
 * written" return value at all.
 */
export function stepChangeFor(batch, n) {
  const key = String(n);
  return Object.prototype.hasOwnProperty.call(batch.churn.stepChanges, key) ? batch.churn.stepChanges[key] : null;
}

/** isStruck(batch, n) -> the step's struck flag, or false when untouched. */
export function isStruck(batch, n) {
  const entry = stepChangeFor(batch, n);
  return entry ? entry.struck : false;
}

/** changedLineFor(batch, n) -> the maker's line, or null when there is none. */
export function changedLineFor(batch, n) {
  const entry = stepChangeFor(batch, n);
  return entry ? entry.line : null;
}

/**
 * readMeasured(value, options) -> the string a maker reads for a measured
 * field. This is BATCH1-02's contract in code: a blank measurement (value
 * null or absent) reads the word `unknown`, and there is no code path here
 * by which the recipe's own target can reach this function — every caller
 * passes a stored churn/tasting field, never version.targets, version.process,
 * or version.iceEd. A written value is converted to a string exactly as
 * stored — no toFixed, no Math.round, no locale-dependent formatter — so a
 * value typed finer than the field's stated precision (D-18) survives
 * unchanged. options.signed prefixes a non-zero value with '+' (positive) or
 * the Unicode minus sign U+2212 (negative); a signed zero carries no sign.
 */
export function readMeasured(value, options = {}) {
  if (value == null) return 'unknown';
  if (options.signed) {
    if (value > 0) return `+${value}`;
    if (value < 0) return `−${Math.abs(value)}`;
  }
  return `${value}`;
}

/**
 * asMadeTotals(rows, asMade) -> { planTotal, asMadeTotal }. planTotal sums
 * every row's plan grams (rowGrams). asMadeTotal sums, per portion: the
 * as-made element where the row's key is present and that element parses
 * (a written 0 contributes zero — D-11), and that portion's own plan
 * grams otherwise — whether because the row's key is absent, the element
 * is null, or the element does not parse (D-10, "the plan fills the gap,
 * never the reverse", now applied one portion at a time). Presence is
 * decided by an own-property check on the row, never truthiness. Neither
 * total is rounded here — see the precision contract above.
 *
 * A present element is coerced with Number() before summing, since the
 * live recording draft holds as-made values as typed strings until save
 * (D-18) — without this, `+=` would concatenate rather than add. An
 * element that is null, an empty string (a portion within an otherwise
 * written row that the maker has not yet typed into), or does not parse
 * to a finite number is treated the same as an absent element: the
 * portion's own plan grams fills the gap, never NaN.
 */
export function asMadeTotals(rows, asMade) {
  let planTotal = 0;
  let asMadeTotal = 0;
  for (const row of rows) {
    planTotal += rowGrams(row);
    const hasRow = Object.prototype.hasOwnProperty.call(asMade, row.id);
    const values = hasRow ? asMade[row.id] : null;
    for (const [i, portion] of row.portions.entries()) {
      let contribution = portion.grams;
      if (hasRow) {
        const raw = values[i];
        if (raw !== null && raw !== undefined && raw !== '') {
          const value = Number(raw);
          if (Number.isFinite(value)) contribution = value;
        }
      }
      asMadeTotal += contribution;
    }
  }
  return { planTotal, asMadeTotal };
}

/**
 * sortedBatches(batches) -> a new array of batches ordered by churn date
 * descending, undated batches last. Never sorts in place.
 */
export function sortedBatches(batches) {
  return [...batches].sort((a, b) => {
    const aDate = a.churn.churnDate;
    const bDate = b.churn.churnDate;
    if (aDate === bDate) return 0;
    if (aDate === null) return 1;
    if (bDate === null) return -1;
    return aDate < bDate ? 1 : -1;
  });
}

/**
 * latestChurnDate(batches) -> the most recent churn.churnDate across a
 * list of batches, or null when none of them carries one. Undated
 * batches are ignored rather than treated as recent.
 */
export function latestChurnDate(batches) {
  let latest = null;
  for (const batch of batches) {
    const date = batch.churn.churnDate;
    if (date == null) continue;
    if (latest == null || date > latest) latest = date;
  }
  return latest;
}
