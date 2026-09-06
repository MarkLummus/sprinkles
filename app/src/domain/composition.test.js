// Tolerance convention: D-02 asks for agreement within 0.1, so every printed-sheet
// figure below is asserted with an absolute difference below 0.1 (Math.abs), not
// with `toBeCloseTo`, whose decimal-places argument has different semantics at the
// boundary. The one exception is the olive-oil share of fat, which the sheet prints
// as a whole number (28%): asserted within 0.5.
import { describe, it, expect } from 'vitest';
import { computeBalance, weakestBasis, formatShareOfBatch } from './composition.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { library } from '../data/library.js';

const closeTo = (actual, expected, tolerance = 0.1) => Math.abs(actual - expected) < tolerance;

describe('computeBalance — churned olive oil printed sheet', () => {
  const balance = computeBalance(oliveOilVersion.rows);

  it('total mass is 799.7 g', () => {
    expect(closeTo(balance.mass, 799.7)).toBe(true);
  });

  it('total fat is 18.0%', () => {
    expect(closeTo(balance.percent.fat, 18.0)).toBe(true);
  });

  it('milkfat is 13.0%', () => {
    expect(closeTo(balance.percent.milkfat, 13.0)).toBe(true);
  });

  it('olive oil share of fat is 28% (±0.5, the sheet prints a whole number)', () => {
    expect(closeTo(balance.addedFatShareOfFat, 28, 0.5)).toBe(true);
  });

  it('MSNF is 8.5%', () => {
    expect(closeTo(balance.percent.msnf, 8.5)).toBe(true);
  });

  it('sugar solids is 13.5%', () => {
    expect(closeTo(balance.percent.sugar, 13.5)).toBe(true);
  });

  it('total solids is 40.8%', () => {
    expect(closeTo(balance.percent.solids, 40.8)).toBe(true);
  });

  it('PAC is 24.1', () => {
    expect(closeTo(balance.pac, 24.1)).toBe(true);
  });

  it('POD is 13.0', () => {
    expect(closeTo(balance.pod, 13.0)).toBe(true);
  });
});

describe('computeBalance — edge cases', () => {
  it('returns null for zero rows', () => {
    expect(computeBalance([])).toBeNull();
  });

  it('reports a single row as 100% of batch', () => {
    const row = oliveOilVersion.rows[0];
    const balance = computeBalance([row]);
    expect(balance.mass).toBe(row.grams);
    expect((100 * row.grams) / balance.mass).toBe(100);
  });
});

describe('weakestBasis', () => {
  it('is estimated for msnf (whole milk and heavy cream MSNF are estimated)', () => {
    expect(weakestBasis(oliveOilVersion.rows, 'msnf')).toBe('estimated');
  });

  it('is stated for sugar', () => {
    expect(weakestBasis(oliveOilVersion.rows, 'sugar')).toBe('stated');
  });

  it('returns stated for a field no row contributes', () => {
    expect(weakestBasis(oliveOilVersion.rows, 'nonexistentField')).toBe('stated');
  });

  it('ignores a struck (0 g) row even when its composition basis is the worst rank', () => {
    const rows = [
      { grams: 100, ingredient: { composition: { fat: 0.1 }, basis: { fat: 'stated' } } },
      { grams: 0, ingredient: { composition: { fat: 0.1 }, basis: { fat: 'inherited' } } },
    ];
    expect(weakestBasis(rows, 'fat')).toBe('stated');
  });
});

describe('formatShareOfBatch', () => {
  it('returns trace strictly below 0.05% (0.0200%)', () => {
    expect(formatShareOfBatch(0.16, 799.68)).toBe('trace');
  });

  it('keeps one decimal at 0.0600%, above the threshold', () => {
    expect(formatShareOfBatch(0.48, 799.68)).toBe('0.1%');
  });

  it('keeps one decimal at 0.1301%', () => {
    expect(formatShareOfBatch(1.04, 799.68)).toBe('0.1%');
  });

  it('reads 46.3% for whole milk against the seeded mass', () => {
    expect(formatShareOfBatch(370.4, 799.68)).toBe('46.3%');
  });

  it('the threshold is exclusive: exactly 0.05% is not trace', () => {
    expect(formatShareOfBatch(0.5, 1000)).toBe('0.1%');
  });

  it('returns the em-dash placeholder for a zero or invalid mass, never NaN% or Infinity%', () => {
    expect(formatShareOfBatch(1, 0)).toBe('—');
  });
});

describe('embedded-coefficient invariant', () => {
  it('mutating the shared library after building a version does not change that version\'s computed PAC', () => {
    const before = computeBalance(oliveOilVersion.rows).pac;
    const originalPac = library.sucrose.composition.pac;
    library.sucrose.composition.pac = 999;
    try {
      const after = computeBalance(oliveOilVersion.rows).pac;
      expect(after).toBe(before);
    } finally {
      library.sucrose.composition.pac = originalPac;
    }
  });
});
