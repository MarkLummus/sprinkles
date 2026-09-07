// Domain suite for the removal filter (RESEARCH.md Pattern 2, Pitfall 2).
// Runs under Vitest's default node environment — imports no store, no
// component, and no framework.
import { describe, it, expect } from 'vitest';
import { activeRows, activeSteps } from './rows.js';

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
