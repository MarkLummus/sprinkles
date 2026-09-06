// Tolerance convention: D-02 asks for agreement within 0.1, so every figure
// below is asserted with an absolute difference below 0.1 (Math.abs), not
// with `toBeCloseTo`, whose decimal-places argument has different semantics
// at the boundary.
import { describe, it, expect } from 'vitest';
import { computeBalance } from './composition.js';
import { oliveOilVersion } from '../data/olive-oil.js';

describe('computeBalance — walking skeleton', () => {
  it('computes the seeded rows total mass within 0.1 of the printed sheet', () => {
    const balance = computeBalance(oliveOilVersion.rows);
    expect(Math.abs(balance.mass - 799.7)).toBeLessThan(0.1);
  });

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
