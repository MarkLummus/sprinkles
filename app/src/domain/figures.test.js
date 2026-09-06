// Tolerance convention matches composition.test.js: D-02 asks for agreement
// within 0.1, asserted with Math.abs rather than toBeCloseTo. The one
// deviation-wording example fixed here differs from the plan text — see
// the "percent figure appends the unit" test below and the plan SUMMARY's
// Deviations section for why.
import { describe, it, expect } from 'vitest';
import { buildFigures, describeDeviation, FIGURE_SPECS } from './figures.js';
import { oliveOilVersion } from '../data/olive-oil.js';

const closeTo = (actual, expected, tolerance = 0.1) => Math.abs(actual - expected) < tolerance;

describe('FIGURE_SPECS', () => {
  it('has six entries in fixed render order', () => {
    expect(FIGURE_SPECS.map((spec) => spec.key)).toEqual(['pac', 'pod', 'fat', 'msnf', 'sugar', 'solids']);
  });

  it('PAC and POD both list msnf among their contributing fields', () => {
    const pac = FIGURE_SPECS.find((spec) => spec.key === 'pac');
    const pod = FIGURE_SPECS.find((spec) => spec.key === 'pod');
    expect(pac.fields).toContain('msnf');
    expect(pod.fields).toContain('msnf');
  });
});

describe('buildFigures — seeded olive oil version', () => {
  const figures = buildFigures(oliveOilVersion);
  const byKey = Object.fromEntries(figures.map((figure) => [figure.key, figure]));

  it('returns exactly six figures in fixed key order', () => {
    expect(figures.map((figure) => figure.key)).toEqual(['pac', 'pod', 'fat', 'msnf', 'sugar', 'solids']);
  });

  it('PAC value is 24.1 ±0.1', () => {
    expect(closeTo(byKey.pac.value, 24.1)).toBe(true);
  });

  it('POD value is 13.0 ±0.1', () => {
    expect(closeTo(byKey.pod.value, 13.0)).toBe(true);
  });

  it('fat value is 18.0 ±0.1', () => {
    expect(closeTo(byKey.fat.value, 18.0)).toBe(true);
  });

  it('MSNF value is 8.5 ±0.1', () => {
    expect(closeTo(byKey.msnf.value, 8.5)).toBe(true);
  });

  it('sugar value is 13.5 ±0.1', () => {
    expect(closeTo(byKey.sugar.value, 13.5)).toBe(true);
  });

  it('solids value is 40.8 ±0.1', () => {
    expect(closeTo(byKey.solids.value, 40.8)).toBe(true);
  });

  it('PAC deviation reads inside 22–26', () => {
    expect(byKey.pac.deviation.words).toBe('inside 22–26');
  });

  it('POD deviation reads inside 12–16', () => {
    expect(byKey.pod.deviation.words).toBe('inside 12–16');
  });

  it('fat deviation reads inside 16–20%', () => {
    expect(byKey.fat.deviation.words).toBe('inside 16–20%');
  });

  it('MSNF deviation reads inside 7.5–10%', () => {
    expect(byKey.msnf.deviation.words).toBe('inside 7.5–10%');
  });

  it('solids deviation reads inside 38–42%', () => {
    expect(byKey.solids.deviation.words).toBe('inside 38–42%');
  });

  it('sugar has no authored band and reads no target set', () => {
    expect(byKey.sugar.band).toBeNull();
    expect(byKey.sugar.deviation.words).toBe('no target set');
    expect(byKey.sugar.deviation.kind).toBe('none');
  });

  it('fat figure carries the milkfat/added-fat breakdown', () => {
    expect(closeTo(byKey.fat.milkfat, 13.0)).toBe(true);
    expect(closeTo(byKey.fat.addedFat, 5.0)).toBe(true);
    expect(closeTo(byKey.fat.addedFatShareOfFat, 28, 0.5)).toBe(true);
  });

  it('PAC basis is estimated, naming whole milk, heavy cream, allulose, and salt', () => {
    expect(byKey.pac.basis).toBe('estimated');
    expect(byKey.pac.estimatedRowNames).toEqual(['Whole milk', 'Heavy cream', 'Allulose', 'Fine sea salt']);
  });

  it('sugar basis is stated with no estimated rows', () => {
    expect(byKey.sugar.basis).toBe('stated');
    expect(byKey.sugar.estimatedRowNames).toEqual([]);
  });

  it("every figure's contributorRowIds follow the version's own row order", () => {
    const rowOrder = oliveOilVersion.rows.map((row) => row.id);
    for (const figure of figures) {
      const positions = figure.contributorRowIds.map((id) => rowOrder.indexOf(id));
      const sorted = [...positions].sort((a, b) => a - b);
      expect(positions).toEqual(sorted);
    }
  });
});

describe('describeDeviation', () => {
  it('a value on the lower edge is inside', () => {
    expect(describeDeviation(22, [22, 26], 1, '').words).toBe('inside 22–26');
  });

  it('a value on the upper edge is inside', () => {
    expect(describeDeviation(26, [22, 26], 1, '').words).toBe('inside 22–26');
  });

  it('a value above the band reads the amount above the upper bound', () => {
    expect(describeDeviation(27.4, [22, 26], 1, '').words).toBe('1.4 above 26');
  });

  it('a value below the band reads the amount below the lower bound', () => {
    // The plan pairs value 15.4 with band [12, 16], but 15.4 sits inside
    // that band — the words template is "<amount> below <lo>", which only
    // resolves to "0.6 below 16" when lo is 16. Corrected to band [16, 20]
    // (the fat band), the pairing the plan's own template implies.
    // Documented as a Rule 1 deviation in SUMMARY.
    expect(describeDeviation(15.4, [16, 20], 1, '').words).toBe('0.6 below 16');
  });

  it('a percent figure appends the unit to both the amount and the bound', () => {
    // The plan's own example here (value 20.5 against band [16, 20] reading
    // "4.5% above 20%") is arithmetically inconsistent — 20.5 - 20 = 0.5, not
    // 4.5 — and doesn't match the algorithm every other example in the plan
    // demonstrates (amount = |value - nearest bound|, rounded to decimals).
    // Corrected to value 24.5, which reproduces the plan's own expected words
    // under that same algorithm. Documented as a Rule 1 deviation in SUMMARY.
    expect(describeDeviation(24.5, [16, 20], 1, '%').words).toBe('4.5% above 20%');
  });

  it('an absent band reads no target set with kind none', () => {
    const result = describeDeviation(19, null, 1, '%');
    expect(result.kind).toBe('none');
    expect(result.amount).toBeNull();
    expect(result.words).toBe('no target set');
  });

  it('rounds a near-boundary amount to zero and reports inside', () => {
    expect(describeDeviation(26.04, [22, 26], 1, '').kind).toBe('inside');
  });
});

describe('buildFigures — degenerate inputs', () => {
  it('returns an empty list for a version with zero rows', () => {
    expect(buildFigures({ ...oliveOilVersion, rows: [] })).toEqual([]);
  });

  it('a single-row version yields six figures computed from that row alone', () => {
    const [firstRow] = oliveOilVersion.rows;
    const single = buildFigures({ ...oliveOilVersion, rows: [firstRow] });
    expect(single).toHaveLength(6);
    for (const figure of single) {
      expect(figure.contributorRowIds.every((id) => id === firstRow.id)).toBe(true);
    }
  });

  it("reversing row order changes no figure value or the figures' own order", () => {
    const forward = buildFigures(oliveOilVersion);
    const reversed = buildFigures({ ...oliveOilVersion, rows: [...oliveOilVersion.rows].reverse() });
    expect(reversed.map((figure) => figure.key)).toEqual(forward.map((figure) => figure.key));
    forward.forEach((figure, index) => {
      expect(reversed[index].value).toBeCloseTo(figure.value, 6);
    });
  });
});
