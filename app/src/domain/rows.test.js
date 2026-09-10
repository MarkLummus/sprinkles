// Domain suite for the removal filter (RESEARCH.md Pattern 2, Pitfall 2).
// Runs under Vitest's default node environment — imports no store, no
// component, and no framework.
import { describe, it, expect } from 'vitest';
import { activeRows, activeSteps, rowGrams } from './rows.js';
import { oliveOilVersion } from '../data/olive-oil.js';

describe('activeRows', () => {
  it('filters out a row carrying removed: true, keeping a row with no removed key', () => {
    const version = { rows: [{ id: 'a' }, { id: 'b', removed: true }] };
    expect(activeRows(version)).toEqual([{ id: 'a' }]);
  });

  it('returns [] for an empty rows array', () => {
    expect(activeRows({ rows: [] })).toEqual([]);
  });

  it('never mutates or reorders the array it is given', () => {
    const rows = [{ id: 'a' }, { id: 'b', removed: true }, { id: 'c' }];
    const before = [...rows];
    activeRows({ rows });
    expect(rows).toHaveLength(before.length);
    expect(rows).toEqual(before);
  });
});

describe('activeSteps', () => {
  it('filters out a step carrying removed: true, keeping a step with no removed key', () => {
    const version = { method: [{ n: 1 }, { n: 2, removed: true }] };
    expect(activeSteps(version)).toEqual([{ n: 1 }]);
  });

  it('returns [] for an empty method array', () => {
    expect(activeSteps({ method: [] })).toEqual([]);
  });

  it('never mutates or reorders the array it is given', () => {
    const method = [{ n: 1 }, { n: 2, removed: true }, { n: 3 }];
    const before = [...method];
    activeSteps({ method });
    expect(method).toHaveLength(before.length);
    expect(method).toEqual(before);
  });
});

describe('rowGrams', () => {
  it('is the portion\'s own grams for a one-portion row', () => {
    const row = { portions: [{ step: 3, grams: 252.8 }] };
    expect(rowGrams(row)).toBe(252.8);
  });

  it('is the sum of a two-portion row\'s portions', () => {
    const row = { portions: [{ step: 2, grams: 12 }, { step: 3, grams: 64 }] };
    expect(rowGrams(row)).toBe(76);
  });

  it('120 + 250.4 is the same double as the literal 370.4, so no figure can move in its last decimal', () => {
    const row = { portions: [{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }] };
    expect(rowGrams(row)).toBe(370.4);
  });
});

// Guard 2 (D-01), the companion invariant the assumption-delta checkpoint
// in 03.2-01-PLAN.md accepted: a row's total is derived, never stored, for
// every row of the seeded version — a one-portion row and a multi-portion
// row alike. This goes red the instant a future phase reintroduces a
// stored total beside the portions.
describe('the derived-total invariant (D-01, companion to the 03.2-01 assumption-delta checkpoint)', () => {
  it("every row of the seeded version derives rowGrams as the sum of its own portions' grams", () => {
    for (const row of oliveOilVersion.rows) {
      const expectedTotal = row.portions.reduce((total, portion) => total + portion.grams, 0);
      expect(rowGrams(row)).toBe(expectedTotal);
    }
  });

  it('the invariant holds identically for a one-portion row and a multi-portion row', () => {
    const onePortionRow = oliveOilVersion.rows.find((row) => row.portions.length === 1);
    const multiPortionRow = oliveOilVersion.rows.find((row) => row.portions.length > 1);
    expect(onePortionRow).toBeDefined();
    expect(multiPortionRow).toBeDefined();
    expect(rowGrams(onePortionRow)).toBe(onePortionRow.portions[0].grams);
    expect(rowGrams(multiPortionRow)).toBe(
      multiPortionRow.portions.reduce((total, portion) => total + portion.grams, 0),
    );
  });

  it('no row of the seeded version carries a stored total under any name — grams or step live only on a portion', () => {
    for (const row of oliveOilVersion.rows) {
      expect('grams' in row).toBe(false);
      expect('step' in row).toBe(false);
    }
  });
});
