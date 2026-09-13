// Pure. No framework, no DOM, no store import. Reimplemented (not imported)
// from the old-sprinkles slice's composition.js — verified against the
// printed sheet: Olive Oil Ice Cream, 800 g, churned 2 Aug 2026.
import { rowGrams } from './rows.js';

export const LACTOSE_FRACTION_OF_MSNF = 0.545;

// Relative to sucrose = 100.
export const PAC_LACTOSE = 100;
export const POD_LACTOSE = 16;

export const COEFFICIENT_SET = {
  id: '2026.1-slice-transcription',
  name: 'coefficient set 2026.1 (slice transcription)',
  pacReference: 'PAC relative to sucrose = 100',
  lactoseRule: 'lactose taken as 54.5% of MSNF',
};

const sumBy = (rows, get) => rows.reduce((total, row) => total + get(row), 0);

/** rows: [{ ingredient, portions }] where ingredient carries a `composition` block and a row's total derives as rowGrams(row) (D-01). */
export function computeBalance(rows) {
  const mass = sumBy(rows, (r) => rowGrams(r));
  if (mass === 0) return null;

  const part = (key) => sumBy(rows, (r) => rowGrams(r) * (r.ingredient.composition[key] ?? 0));

  const fat = part('fat');
  const msnf = part('msnf');
  const sugar = part('sugar');
  const other = part('other');
  const emulsifier = part('emulsifier');
  const stabilizer = part('stabilizer');

  const lactose = msnf * LACTOSE_FRACTION_OF_MSNF;
  const solids = fat + msnf + sugar + other + emulsifier + stabilizer;

  const milkfat = sumBy(rows, (r) =>
    r.ingredient.dairy ? rowGrams(r) * (r.ingredient.composition.fat ?? 0) : 0,
  );
  const addedFat = fat - milkfat;

  const pac = (part('pac') + lactose * PAC_LACTOSE) / mass;
  const pod = (part('pod') + lactose * POD_LACTOSE) / mass;

  const pct = (grams) => (100 * grams) / mass;

  return {
    mass,
    water: mass - solids,
    grams: { fat, milkfat, addedFat, msnf, sugar, solids, lactose },
    percent: {
      fat: pct(fat),
      milkfat: pct(milkfat),
      addedFat: pct(addedFat),
      msnf: pct(msnf),
      sugar: pct(sugar),
      solids: pct(solids),
    },
    addedFatShareOfFat: fat === 0 ? 0 : (100 * addedFat) / fat,
    pac,
    pod,
  };
}

/** The weakest basis present wins, so a figure never claims more than its worst input. */
const BASIS_RANK = { stated: 0, derived: 1, estimated: 2, inherited: 3 };

/**
 * formatShareOfBatch(grams, mass) -> the printed share of batch, as a
 * string (D-22). Below 0.05% of batch — the resolution a kitchen scale
 * cannot hold — reads the word "trace" rather than a near-zero percentage;
 * the threshold is exclusive, so exactly 0.05% keeps its one-decimal
 * reading. The word was chosen over a further decimal because a maker
 * reading a formula wants to know a row is below what the scale can show,
 * not two more digits (D11: plain words over notation). A zero or
 * non-positive mass returns the table's existing em-dash placeholder,
 * never NaN% or Infinity%.
 */
export function formatShareOfBatch(grams, mass) {
  if (!(mass > 0)) return '—';
  const share = (100 * grams) / mass;
  if (share < 0.05) return 'trace';
  return `${share.toFixed(1)}%`;
}

/**
 * formatGramsValue(grams) -> the bare computed grams figure at one
 * decimal, with no unit (e.g. `799.7`). formatGrams (below) is defined in
 * terms of this, so the two can never print a different number for the
 * same value. For a render site that strikes a bare number beside an
 * already-unit-suffixed current value — the ingredient table's total row
 * — this is the first-class case: composing two already-unit-suffixed
 * strings is what printed the unit twice (critique P2 #2).
 */
export function formatGramsValue(grams) {
  return grams.toFixed(1);
}

/**
 * formatGrams(grams) -> a computed grams figure at one decimal, with unit
 * (e.g. `799.7 g`). For computed totals only — the plan total and the
 * as-made total (D-22) — never for a measured or as-made value itself,
 * which the precision contract in domain/batch.js forbids rounding.
 */
export function formatGrams(grams) {
  return `${formatGramsValue(grams)} g`;
}

/**
 * formatPortionLine(portionGrams, rowTotalGrams, mass) -> the split-
 * ingredient sub-line printed beneath a portion's own occurrence in the
 * step-grouped table (sketch 003 variant B, ROADMAP Scope bullet 3):
 * `"120 g of 370.4 g · 46.3% in all"`. Composes formatGrams (the "of X g"
 * segment) and formatShareOfBatch (the "Y% in all" segment) rather than
 * reimplementing their rounding or trace-threshold rules — the row's own
 * total and its share of the batch, never recomputed here. portionGrams
 * prints exactly as given, with NO `.toFixed()` applied: it is a stored or
 * typed amount, not a computed total, so the never-round-a-stored-amount
 * discipline formatGrams's own doc comment states applies to it too — a
 * future reader must not "fix" this into formatGramsValue(portionGrams).
 */
export function formatPortionLine(portionGrams, rowTotalGrams, mass) {
  return `${portionGrams} g of ${formatGrams(rowTotalGrams)} · ${formatShareOfBatch(rowTotalGrams, mass)} in all`;
}

export function weakestBasis(rows, field) {
  let worst = 'stated';
  for (const row of rows) {
    if (!((row.ingredient.composition[field] ?? 0) * rowGrams(row) > 0)) continue;
    const basis = row.ingredient.basis?.[field] ?? 'inherited';
    if (BASIS_RANK[basis] > BASIS_RANK[worst]) worst = basis;
  }
  return worst;
}
