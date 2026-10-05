// Domain suite for the removal filter (RESEARCH.md Pattern 2, Pitfall 2).
// Runs under Vitest's default node environment — imports no store, no
// component, and no framework.
import { describe, it, expect } from 'vitest';
import { activeRows, activeSteps, isLineRemoved, isRowRemoved, isStepRemoved, rowGrams, targetValueFor } from './rows.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { computeBalance } from './composition.js';

const one = (grams = 1) => [{ step: 1, grams }];

describe('activeRows', () => {
  it('filters out a row carrying removed: true, keeping a row with no removed key', () => {
    const version = { rows: [{ id: 'a', portions: one() }, { id: 'b', portions: one(), removed: true }] };
    expect(activeRows(version)).toEqual([{ id: 'a', portions: one() }]);
  });

  it('returns [] for an empty rows array', () => {
    expect(activeRows({ rows: [] })).toEqual([]);
  });

  // 03.6-REVIEW.md IN-01: isRowRemoved already reads a row with no portions array as not removed.
  it('keeps a row with no portions array as the same object and does not throw', () => {
    const bare = { id: 'x' };
    const result = activeRows({ rows: [bare] });
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(bare);
    expect(isRowRemoved(bare)).toBe(false);
  });

  it('never mutates or reorders the array it is given', () => {
    const rows = [
      { id: 'a', portions: one() },
      { id: 'b', portions: one(), removed: true },
      { id: 'c', portions: [{ step: 2, grams: 5, removed: true }, { step: 3, grams: 6 }] },
    ];
    const before = structuredClone(rows);
    activeRows({ rows });
    expect(rows).toEqual(before);
  });

  it('keeps a split row\'s other line and loses the line that is out', () => {
    const milk = { id: 'a', portions: [{ step: 2, grams: 120, removed: true }, { step: 3, grams: 250.4 }] };
    expect(activeRows({ rows: [milk] })).toEqual([{ id: 'a', portions: [{ step: 3, grams: 250.4, index: 1 }] }]);
  });

  it('tags each kept portion of a copied row with its stored index', () => {
    const row = {
      id: 'a',
      portions: [{ step: 2, grams: 1 }, { step: 3, grams: 2, removed: true }, { step: 4, grams: 3 }],
    };
    const [copy] = activeRows({ rows: [row] });
    expect(copy.portions.map((portion) => portion.index)).toEqual([0, 2]);
    expect(row.portions.every((portion) => !('index' in portion))).toBe(true);
  });

  it('leaves a row with every line in untagged, as the same object', () => {
    const row = { id: 'a', portions: [{ step: 2, grams: 1 }, { step: 3, grams: 2 }] };
    const [kept] = activeRows({ rows: [row] });
    expect(kept).toBe(row);
    expect(kept.portions.every((portion) => !('index' in portion))).toBe(true);
  });

  it('drops a row with every line out', () => {
    const milk = { id: 'a', portions: [{ step: 2, grams: 120, removed: true }, { step: 3, grams: 250.4, removed: true }] };
    expect(activeRows({ rows: [milk, { id: 'b', portions: one() }] }).map((row) => row.id)).toEqual(['b']);
  });

  it('reads the older whole-row flag as every line out', () => {
    const milk = { id: 'a', removed: true, portions: [{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }] };
    expect(activeRows({ rows: [milk] })).toEqual([]);
  });

  it('never drops anything for a truthy value that is not true (T-03.6-01)', () => {
    const rows = [
      { id: 'a', removed: 'true', portions: [{ step: 2, grams: 120, removed: 'true' }, { step: 3, grams: 250.4, removed: 1 }] },
    ];
    expect(activeRows({ rows })).toEqual(rows);
  });

  it('returns the very same row object when every line is in', () => {
    const row = { id: 'a', portions: [{ step: 2, grams: 120 }, { step: 3, grams: 250.4, removed: false }] };
    const [kept] = activeRows({ rows: [row] });
    expect(kept).toBe(row);
  });
});

describe('isLineRemoved and isRowRemoved', () => {
  const milk = (first, second, rowFlag) => ({
    id: 'a',
    ...(rowFlag === undefined ? {} : { removed: rowFlag }),
    portions: [{ step: 2, grams: 120, ...first }, { step: 3, grams: 250.4, ...second }],
  });

  it('a line is out when its own flag or the row flag is exactly true', () => {
    const row = milk({ removed: true }, {});
    expect(isLineRemoved(row, row.portions[0])).toBe(true);
    expect(isLineRemoved(row, row.portions[1])).toBe(false);
    const flagged = milk({}, {}, true);
    expect(isLineRemoved(flagged, flagged.portions[1])).toBe(true);
  });

  it('a row is removed when every line is out or the row flag is true, not when one line is', () => {
    expect(isRowRemoved(milk({ removed: true }, {}))).toBe(false);
    expect(isRowRemoved(milk({ removed: true }, { removed: true }))).toBe(true);
    expect(isRowRemoved(milk({}, {}, true))).toBe(true);
    expect(isRowRemoved({ id: 'x', portions: [] })).toBe(false);
  });

  it('a truthy value that is not true removes nothing (T-03.6-01)', () => {
    expect(isRowRemoved(milk({ removed: 'true' }, { removed: 1 }, 'true'))).toBe(false);
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

// targetValueFor (03.3-07, G-03.3-4's batch-row plan sub-line): the value
// of the first active step's own target carrying the given label.
describe('targetValueFor', () => {
  it("returns the pasteurisation step's own come-up target on the seeded olive-oil version", () => {
    expect(targetValueFor(oliveOilVersion, 'come-up')).toBe('10–12 min');
  });

  it('returns null when no active step carries a target with that label', () => {
    expect(targetValueFor(oliveOilVersion, 'no-such-label')).toBeNull();
  });

  it("never reads a removed step's own targets", () => {
    const version = {
      method: [
        { n: 1, removed: true, targets: [{ label: 'come-up', value: 'should not be read' }] },
        { n: 2, targets: [{ label: 'other', value: '5 min' }] },
      ],
    };
    expect(targetValueFor(version, 'come-up')).toBeNull();
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

// Plan 03.6-05 (sketch 011 decision 51, Mark's answer 2): a removed step takes
// its lines out. Derived from the method, never stored on a line.
describe('a removed step takes its lines out (03.6-05)', () => {
  const stepTwoRemoved = () => {
    const version = structuredClone(oliveOilVersion);
    version.method.find((step) => step.n === 2).removed = true;
    return version;
  };
  const rowOf = (version, id) => version.rows.find((row) => row.id === id);
  const mass = (version) => computeBalance(activeRows(version)).mass;

  it('reads a line out when its step is removed, and only with the method given', () => {
    const version = stepTwoRemoved();
    const milk = rowOf(version, 'row-01');
    expect(isLineRemoved(milk, milk.portions[0], version.method)).toBe(true);
    expect(isLineRemoved(milk, milk.portions[1], version.method)).toBe(false);
    expect(isLineRemoved(milk, milk.portions[0])).toBe(false);
    expect(isLineRemoved(milk, milk.portions[1])).toBe(false);
  });

  it('reads a row out when every line is out through its step, and a split row with a line in as in', () => {
    const version = stepTwoRemoved();
    for (const id of ['row-10', 'row-11', 'row-12']) {
      expect(isRowRemoved(rowOf(version, id), version.method)).toBe(true);
      expect(isRowRemoved(rowOf(version, id))).toBe(false);
    }
    expect(isRowRemoved(rowOf(version, 'row-01'), version.method)).toBe(false);
    expect(isRowRemoved(rowOf(version, 'row-05'), version.method)).toBe(false);
  });

  it('takes the five lines out of the total: 799.7 g with the step in, 666.0 g with it removed, 799.7 g restored', () => {
    const version = stepTwoRemoved();
    expect(mass(version).toFixed(1)).toBe('666.0');
    version.method.find((step) => step.n === 2).removed = false;
    expect(mass(version).toFixed(1)).toBe('799.7');
  });

  it('keeps a line the maker removed on its own out after the step is restored', () => {
    const version = stepTwoRemoved();
    rowOf(version, 'row-01').portions[0].removed = true;
    version.method.find((step) => step.n === 2).removed = false;
    expect(mass(version).toFixed(1)).toBe('679.7');
  });

  it('writes no flag on a line, and tags the kept portion of a copied row with its stored index', () => {
    const version = stepTwoRemoved();
    const before = structuredClone(version);
    const kept = activeRows(version);
    expect(version).toEqual(before);
    expect(kept.find((row) => row.id === 'row-01').portions).toEqual([{ step: 3, grams: 250.4, index: 1 }]);
    expect(kept.map((row) => row.id)).not.toContain('row-10');
  });

  it('reads only a step whose removed is exactly true, found by n (T-03.6-09)', () => {
    const method = [{ n: 1, removed: 'true' }, { n: 2, removed: 1 }, { n: 3 }, { n: 4, removed: true }];
    expect([1, 2, 3, 4, 9].map((n) => isStepRemoved(method, n))).toEqual([false, false, false, true, false]);
  });

  it('reads a version with no method as having no step removed', () => {
    const version = { rows: [{ id: 'a', portions: [{ step: 1, grams: 5 }] }] };
    expect(activeRows(version)).toEqual(version.rows);
  });
});
