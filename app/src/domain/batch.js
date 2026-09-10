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
import { rowGrams } from './rows.js';

export const BATCH_SCHEMA_VERSION = 2;

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
    // A shallow copy of each row's own array (D-10), not a shared
    // reference — the caller's own churnFields.asMade arrays must never be
    // the same array the stored record holds, so a later mutation of the
    // caller's object can never move an already-saved batch.
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
      stepChanges,
      // Each of the six churn measurements/notes is read from churnFields
      // when supplied and defaults to null otherwise. The three numeric
      // fields use an explicit != null check (never `||`/truthiness) so a
      // written 0 or 0% survives as a real value (D-11, D-18, BATCH1-02);
      // the three text fields use presence-of-content, since an empty
      // string and an absent note are the same fact for free text.
      comeUpMinutes: churnFields.comeUpMinutes != null ? churnFields.comeUpMinutes : null,
      drawTempC: churnFields.drawTempC != null ? churnFields.drawTempC : null,
      overrunPercent: churnFields.overrunPercent != null ? churnFields.overrunPercent : null,
      drawNotes: churnFields.drawNotes ? churnFields.drawNotes : null,
      ingredientNotes: churnFields.ingredientNotes ? churnFields.ingredientNotes : null,
      nextTimeNote: churnFields.nextTimeNote ? churnFields.nextTimeNote : null,
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
 * isTastingSaveable(tasting) -> boolean. OBS1-01's gate and D-02's rule in
 * code: true when the tasting's words is a string with content after
 * trim, or when its marks object has at least one own key. Nothing else
 * is required — not a date, not a temperature, not a meltdown loss.
 *
 * Words: String.prototype.trim strips Unicode whitespace, including the
 * non-breaking space (U+00A0) and the ideographic space (U+3000), so a
 * field holding only invisible characters is not words. Length is counted
 * in UTF-16 code units, so a single emoji is words even though it
 * occupies two of them (a surrogate pair).
 *
 * Marks: presence is decided by an own-key count, never a truthiness scan
 * over the values — a mark of 0 is not a legal stop today, but the gate
 * must not be the thing that decides that.
 */
export function isTastingSaveable(tasting) {
  const hasWords = typeof tasting.words === 'string' && tasting.words.trim().length > 0;
  const hasMarks = tasting.marks != null && Object.keys(tasting.marks).length > 0;
  return hasWords || hasMarks;
}

/**
 * sortedTastings(batch) -> a new array of the batch's tastings ordered by
 * date ascending, undated tastings last (D-03). Never sorts in place —
 * batch.tastings itself is untouched. Array.prototype.sort is stable, so
 * two tastings that compare equal (both dated the same day, or both
 * undated) keep the order they were added.
 */
export function sortedTastings(batch) {
  return [...batch.tastings].sort((a, b) => {
    if (a.date === b.date) return 0;
    if (a.date === null) return 1;
    if (b.date === null) return -1;
    return a.date < b.date ? -1 : 1;
  });
}

/**
 * sortedBatches(batches) -> a new array of batches ordered by churn date
 * descending, undated batches last — the same tie-break rule
 * sortedTastings applies to a batch's tastings, applied here to a
 * version's batches (route-recipe.md "most recent batch" default, and
 * the batch list in its margin). Never sorts in place.
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

/** hasTasting(batch) -> whether the batch has at least one tasting — the test behind "not yet evaluated" (D-05). */
export function hasTasting(batch) {
  return batch.tastings.length > 0;
}

/**
 * addTasting(batch, tastingFields, { id }) -> a new batch with the tasting
 * appended, carrying the supplied id. Does not validate — the caller
 * gates on isTastingSaveable, matching this module's existing habit of
 * returning facts rather than throwing. Leaves snapshot, recordedAt and
 * amendedAt untouched: adding a tasting is never an amendment, and the
 * snapshot is never retaken (D-06). This function and recordAmendment
 * below are deliberately separate and neither may ever do the other's
 * job — a second tasting is not a correction, and a correction is not an
 * event (see recordAmendment).
 */
export function addTasting(batch, tastingFields, { id }) {
  const tasting = {
    id,
    date: tastingFields.date != null ? tastingFields.date : null,
    tastingTempC: tastingFields.tastingTempC != null ? tastingFields.tastingTempC : null,
    marks: tastingFields.marks ? { ...tastingFields.marks } : {},
    meltdownLossG: tastingFields.meltdownLossG != null ? tastingFields.meltdownLossG : null,
    words: tastingFields.words ? tastingFields.words : null,
    nextTimeNote: tastingFields.nextTimeNote ? tastingFields.nextTimeNote : null,
  };
  return {
    ...batch,
    tastings: [...batch.tastings, tasting],
  };
}

/**
 * recordAmendment(batch, churnFields, amendedAt) -> a new batch whose
 * churn is the supplied fields and whose amendedAt has amendedAt
 * appended. Leaves recordedAt, tastings and snapshot exactly as they
 * were — prior field values are not kept (D-06): the record shows what
 * it now says, plus the dates on which it was corrected. This function
 * and addTasting above are deliberately separate and neither may ever do
 * the other's job: a second tasting is not a correction, and a
 * correction is not an event.
 */
export function recordAmendment(batch, churnFields, amendedAt) {
  return {
    ...batch,
    churn: { ...churnFields },
    amendedAt: [...batch.amendedAt, amendedAt],
  };
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
