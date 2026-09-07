// Domain suite for the uses cross-flags and the stale-amount flag
// (RESEARCH.md, D-08, D-10). Runs under Vitest's default node
// environment — imports no store, no component, and no framework. Every
// fixture is a structuredClone of the seeded olive oil version, edited per
// test; the version already carries D-08's authored `uses` lists.
import { describe, it, expect } from 'vitest';
import { stepsUsingRow, removedRowsUsedBy, orphanedRows, stepsWithStaleAmounts, coveredRowsFor } from './uses.js';
import { oliveOilVersion } from '../data/olive-oil.js';

function clone() {
  return structuredClone(oliveOilVersion);
}

function findRow(version, id) {
  return version.rows.find((row) => row.id === id);
}

function findStep(version, n) {
  return version.method.find((step) => step.n === n);
}

describe('stepsUsingRow', () => {
  it('returns steps 1 and 8 for the lecithin row, step 3 only for skim milk powder, and [] for an unknown row', () => {
    const version = clone();
    expect(stepsUsingRow(version, 'row-09').map((step) => step.n)).toEqual([1, 8]);
    expect(stepsUsingRow(version, 'row-04').map((step) => step.n)).toEqual([3]);
    expect(stepsUsingRow(version, 'row-99')).toEqual([]);
  });

  it('skips removed steps', () => {
    const version = clone();
    findStep(version, 8).removed = true;
    expect(stepsUsingRow(version, 'row-09').map((step) => step.n)).toEqual([1]);
  });

  it('reads a missing uses key as [], never undefined', () => {
    const version = { method: [{ n: 1, removed: false }], rows: [] };
    expect(stepsUsingRow(version, 'row-01')).toEqual([]);
  });
});

describe('removedRowsUsedBy', () => {
  it('returns the lecithin row when it is removed, and [] when nothing is removed', () => {
    const version = clone();
    const step1 = findStep(version, 1);
    expect(removedRowsUsedBy(version, step1)).toEqual([]);

    findRow(version, 'row-09').removed = true;
    expect(removedRowsUsedBy(version, findStep(version, 1)).map((row) => row.id)).toEqual(['row-09']);
  });

  it('returns [] for a step that is itself removed, even when it uses a removed row', () => {
    const version = clone();
    findRow(version, 'row-09').removed = true;
    findStep(version, 1).removed = true;
    expect(removedRowsUsedBy(version, findStep(version, 1))).toEqual([]);
  });
});

describe('coveredRowsFor (03-09, D-UAT-3)', () => {
  it("names both of step 1's rows as covered by step 8 when step 1 is removed", () => {
    const version = clone();
    findStep(version, 1).removed = true;

    const covered = coveredRowsFor(version, findStep(version, 1));
    expect(covered.map((entry) => entry.id)).toEqual(['row-03', 'row-09']);
    for (const entry of covered) {
      expect(entry.coveringSteps.map((step) => step.n)).toEqual([8]);
    }
  });

  it('names sucrose and whole milk as covered by step 3 when step 2 is removed, and omits the three gums', () => {
    const version = clone();
    findStep(version, 2).removed = true;

    const covered = coveredRowsFor(version, findStep(version, 2));
    const coveredIds = covered.map((entry) => entry.id);
    expect(coveredIds).toEqual(expect.arrayContaining(['row-05', 'row-01']));
    expect(coveredIds).not.toContain('row-10');
    expect(coveredIds).not.toContain('row-11');
    expect(coveredIds).not.toContain('row-12');
    for (const entry of covered) {
      expect(entry.coveringSteps.map((step) => step.n)).toEqual([3]);
    }
  });

  it('partitions a removed step\'s rows with orphanedRows: every row step 2 used is in exactly one of the two answers', () => {
    const version = clone();
    findStep(version, 2).removed = true;

    const covered = coveredRowsFor(version, findStep(version, 2));
    const orphaned = orphanedRows(version);
    const step2Rows = findStep(version, 2).uses;

    for (const rowId of step2Rows) {
      const inCovered = covered.some((entry) => entry.id === rowId);
      const inOrphaned = orphaned.some((row) => row.id === rowId);
      expect(inCovered !== inOrphaned).toBe(true); // exactly one, never both, never neither
    }
  });

  it('never returns a row that is itself removed', () => {
    const version = clone();
    findStep(version, 1).removed = true;
    findRow(version, 'row-09').removed = true;

    const covered = coveredRowsFor(version, findStep(version, 1));
    expect(covered.map((entry) => entry.id)).not.toContain('row-09');
  });

  it("returns an empty coverage answer when both step 1 and step 8 are removed, and both of step 1's rows appear in orphanedRows", () => {
    const version = clone();
    findStep(version, 1).removed = true;
    findStep(version, 8).removed = true;

    expect(coveredRowsFor(version, findStep(version, 1))).toEqual([]);
    const orphaned = orphanedRows(version).map((row) => row.id);
    expect(orphaned).toEqual(expect.arrayContaining(['row-03', 'row-09']));
  });

  it('yields an empty coverage answer rather than throwing for a step with no uses key at all', () => {
    const version = { method: [{ n: 1, removed: true }], rows: [{ id: 'row-01', ingredientName: 'A', removed: false }] };
    expect(coveredRowsFor(version, version.method[0])).toEqual([]);
  });

  it('returns [] for a step that is not removed', () => {
    const version = clone();
    expect(coveredRowsFor(version, findStep(version, 1))).toEqual([]);
  });
});

describe('orphanedRows', () => {
  it('returns [] when step 1 is removed, because step 8 still uses the lecithin row', () => {
    const version = clone();
    findStep(version, 1).removed = true;
    expect(orphanedRows(version)).toEqual([]);
  });

  it('returns the lecithin row when steps 1 and 8 are both removed', () => {
    const version = clone();
    findStep(version, 1).removed = true;
    findStep(version, 8).removed = true;
    const ids = orphanedRows(version).map((row) => row.id);
    expect(ids).toContain('row-09');
  });

  it('never returns a row that is itself already removed', () => {
    const version = clone();
    findStep(version, 6).removed = true; // only step using row-06 (allulose)
    findRow(version, 'row-06').removed = true;
    const ids = orphanedRows(version).map((row) => row.id);
    expect(ids).not.toContain('row-06');
  });

  it('returns rows in the version authored order, never sorted', () => {
    const version = clone();
    findStep(version, 1).removed = true;
    findStep(version, 8).removed = true;
    findStep(version, 2).removed = true; // orphans the three gums too
    const ids = orphanedRows(version).map((row) => row.id);
    const authoredOrder = version.rows.map((row) => row.id);
    const filteredAuthoredOrder = authoredOrder.filter((id) => ids.includes(id));
    expect(ids).toEqual(filteredAuthoredOrder);
  });
});

describe('stepsWithStaleAmounts', () => {
  it('returns one entry for step 3 when skim milk powder moves from 22.4 to 24 and step 3 is untouched', () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-04').grams = 24;

    const entries = stepsWithStaleAmounts(current, baseline);
    expect(entries).toEqual([
      { n: 3, changes: [{ rowId: 'row-04', ingredientName: 'Skim milk powder', from: 22.4, to: 24 }] },
    ]);
  });

  it('is suppressed when the step whose row moved also has its own text edited', () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-04').grams = 24;
    findStep(current, 3).instruction = 'A rewritten instruction.';

    expect(stepsWithStaleAmounts(current, baseline)).toEqual([]);
  });

  it("rests on uses, not on prose: moving allulose flags step 6 and not step 3", () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-06').grams = 22; // allulose, used only by step 6

    const entries = stepsWithStaleAmounts(current, baseline);
    expect(entries.map((entry) => entry.n)).toEqual([6]);
  });

  it('never flags a removed step', () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-04').grams = 24;
    findStep(current, 3).removed = true;

    expect(stepsWithStaleAmounts(current, baseline)).toEqual([]);
  });

  it("never raises a flag from a removed row's grams change", () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-04').grams = 24;
    findRow(current, 'row-04').removed = true;

    expect(stepsWithStaleAmounts(current, baseline)).toEqual([]);
  });
});
