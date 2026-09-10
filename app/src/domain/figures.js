// Pure. No framework, no DOM, no store import. Assembles the six balance
// figures a maker reads against their authored bands — see
// 01-CONTEXT.md "Target bands" (D-09..D-12). Computes nothing
// computeBalance/weakestBasis already compute; only reads, ranks, and
// words their output.
import { computeBalance, weakestBasis } from './composition.js';
import { rowGrams } from './rows.js';

// key/label/unit/decimals/domain/targetKey/fields — in the fixed render
// order, which never varies. `domain` is the rule's printed scale (the
// numbers at its two ends) and is never a target. `fields` are the
// composition fields this figure's value and basis are drawn from; PAC and
// POD both list `msnf` because the lactose term routes MSNF into both — PAC
// is the mass-weighted `pac` contributions plus lactose x 100, and lactose
// is MSNF x 0.545. Reporting only a figure's own field would under-report
// the uncertainty a figure actually rests on.
export const FIGURE_SPECS = [
  { key: 'pac', label: 'PAC', unit: '', decimals: 1, domain: [0, 40], targetKey: 'pac', fields: ['pac', 'msnf'] },
  { key: 'pod', label: 'POD', unit: '', decimals: 1, domain: [0, 30], targetKey: 'pod', fields: ['pod', 'msnf'] },
  { key: 'fat', label: 'Total fat', unit: '%', decimals: 1, domain: [0, 30], targetKey: 'fat', fields: ['fat'] },
  { key: 'msnf', label: 'MSNF', unit: '%', decimals: 1, domain: [0, 15], targetKey: 'msnf', fields: ['msnf'] },
  { key: 'sugar', label: 'Sugar solids', unit: '%', decimals: 1, domain: [0, 25], targetKey: 'sugar', fields: ['sugar'] },
  {
    key: 'solids',
    label: 'Total solids',
    unit: '%',
    decimals: 1,
    domain: [25, 55],
    targetKey: 'solids',
    fields: ['fat', 'msnf', 'sugar', 'other', 'emulsifier', 'stabilizer'],
  },
];

const BASIS_ORDER = ['stated', 'derived', 'estimated', 'inherited'];
const worseBasis = (a, b) => (BASIS_ORDER.indexOf(b) > BASIS_ORDER.indexOf(a) ? b : a);

/**
 * describeDeviation(value, band, decimals, unit) -> { kind, amount, words }
 *
 * A value on either band edge is inside the band — the bands a recipe
 * authors are inclusive ranges (this phase's adjacency decision; reporting
 * "0.0 above 26" for a value of exactly 26 is a distinction a maker cannot
 * act on). The amount is rounded to the figure's decimals before deciding
 * the kind, so a value 0.04 outside the band still reads as inside rather
 * than "0 above".
 *
 * `band` absence (not falsiness of its contents) is the only thing that
 * produces the none/no-target-set result — callers pass `null` when the
 * target key is absent from `version.targets`, never a synthesized
 * zero-width band.
 */
export function describeDeviation(value, band, decimals = 1, unit = '') {
  if (!band) {
    return { kind: 'none', amount: null, words: 'no target set' };
  }

  const [lo, hi] = band;
  let kind = 'inside';
  let amount = 0;

  if (value < lo) {
    amount = Number((lo - value).toFixed(decimals));
    if (amount > 0) kind = 'below';
  } else if (value > hi) {
    amount = Number((value - hi).toFixed(decimals));
    if (amount > 0) kind = 'above';
  }

  if (kind === 'inside') {
    return { kind, amount: 0, words: `inside ${lo}–${hi}${unit}` };
  }

  const amountText = amount.toFixed(decimals);
  const words =
    kind === 'below'
      ? `${amountText}${unit} below ${lo}${unit}`
      : `${amountText}${unit} above ${hi}${unit}`;

  return { kind, amount, words };
}

/**
 * buildFigures(version) -> the six figure descriptors, in FIGURE_SPECS
 * order. Returns [] when the version has no rows (computeBalance returns
 * null for an empty row list). Never mutates the version, its rows, or
 * their embedded ingredient records, and never sorts the rows.
 */
export function buildFigures(version) {
  const balance = computeBalance(version.rows);
  if (!balance) return [];

  const targets = version.targets ?? {};
  const valueFor = (spec) => {
    if (spec.key === 'pac') return balance.pac;
    if (spec.key === 'pod') return balance.pod;
    return balance.percent[spec.key];
  };

  return FIGURE_SPECS.map((spec) => {
    const value = valueFor(spec);
    // Branch on key presence, never on value truthiness — an authored band
    // of [0, 0] and an absent band are different facts (D-10).
    const band = Object.prototype.hasOwnProperty.call(targets, spec.targetKey) ? targets[spec.targetKey] : null;
    const deviation = describeDeviation(value, band, spec.decimals, spec.unit);

    const contributorRowIds = [];
    const estimatedRowNames = [];
    for (const row of version.rows) {
      const contributes = spec.fields.some((field) => (row.ingredient.composition[field] ?? 0) * rowGrams(row) > 0);
      if (!contributes) continue;
      contributorRowIds.push(row.id);

      const isEstimated = spec.fields.some((field) => {
        if (!((row.ingredient.composition[field] ?? 0) > 0)) return false;
        const fieldBasis = row.ingredient.basis?.[field] ?? 'inherited';
        return fieldBasis === 'estimated' || fieldBasis === 'inherited';
      });
      if (isEstimated) estimatedRowNames.push(row.ingredientName);
    }

    const basis = spec.fields.reduce(
      (worst, field) => worseBasis(worst, weakestBasis(version.rows, field)),
      'stated',
    );

    const figure = {
      key: spec.key,
      label: spec.label,
      unit: spec.unit,
      decimals: spec.decimals,
      domain: spec.domain,
      value,
      band,
      deviation,
      contributorRowIds,
      basis,
      estimatedRowNames,
    };

    if (spec.key === 'fat') {
      figure.milkfat = balance.percent.milkfat;
      figure.addedFat = balance.percent.addedFat;
      figure.addedFatShareOfFat = balance.addedFatShareOfFat;
    }

    return figure;
  });
}
