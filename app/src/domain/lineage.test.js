// Domain suite for parent/child version construction and the version-line
// rules (03-CONTEXT.md D-01, D-04, D-06, D-10). Runs under Vitest's default
// node environment — imports no store, no component, and no framework.
import { describe, it, expect } from 'vitest';
import {
  sortedVersions,
  versionsForRecipe,
  latestVersionPerRecipe,
  versionLineUnique,
  createChildVersion,
  saveOverVersion,
} from './lineage.js';
import { liftVersionRecord } from '../store/versionLift.js';
import { oliveOilVersion } from '../data/olive-oil.js';

function makeVersion(overrides = {}) {
  return {
    id: 'v1',
    recipeId: 'r1',
    createdAt: '2026-01-01T00:00:00.000Z',
    versionLabel: 'line',
    ...overrides,
  };
}

describe('sortedVersions', () => {
  it('orders by createdAt, most recent first', () => {
    const a = makeVersion({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' });
    const b = makeVersion({ id: 'b', createdAt: '2026-03-01T00:00:00.000Z' });
    const c = makeVersion({ id: 'c', createdAt: '2026-02-01T00:00:00.000Z' });
    expect(sortedVersions([a, b, c]).map((v) => v.id)).toEqual(['b', 'c', 'a']);
  });

  it('puts a null createdAt last', () => {
    const a = makeVersion({ id: 'a', createdAt: null });
    const b = makeVersion({ id: 'b', createdAt: '2026-01-01T00:00:00.000Z' });
    expect(sortedVersions([a, b]).map((v) => v.id)).toEqual(['b', 'a']);
  });

  it('never sorts in place', () => {
    const versions = [makeVersion({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }), makeVersion({ id: 'b', createdAt: '2026-02-01T00:00:00.000Z' })];
    const before = [...versions];
    sortedVersions(versions);
    expect(versions).toEqual(before);
  });
});

describe('versionsForRecipe', () => {
  it('filters to one recipeId', () => {
    const versions = [makeVersion({ id: 'a', recipeId: 'r1' }), makeVersion({ id: 'b', recipeId: 'r2' })];
    expect(versionsForRecipe(versions, 'r1').map((v) => v.id)).toEqual(['a']);
  });
});

describe('latestVersionPerRecipe', () => {
  it('returns exactly one version per recipeId, the greatest createdAt for each, over three versions of two recipes', () => {
    const versions = [
      makeVersion({ id: 'a', recipeId: 'r1', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', recipeId: 'r1', createdAt: '2026-02-01T00:00:00.000Z' }),
      makeVersion({ id: 'c', recipeId: 'r2', createdAt: '2026-01-15T00:00:00.000Z' }),
    ];
    const result = latestVersionPerRecipe(versions);
    expect(result).toHaveLength(2);
    expect(result.map((v) => v.id).sort()).toEqual(['b', 'c']);
  });

  it('returns [] for an empty array', () => {
    expect(latestVersionPerRecipe([])).toEqual([]);
  });

  it('returns the one version given', () => {
    const version = makeVersion();
    expect(latestVersionPerRecipe([version])).toEqual([version]);
  });
});

describe('versionLineUnique', () => {
  const versions = [{ id: 'v1', versionLabel: '50 g oil · 800 g' }];

  it('is false when the candidate line matches an existing version', () => {
    expect(versionLineUnique(versions, '50 g oil · 800 g', null)).toBe(false);
  });

  it('is true when the only colliding version is excluded by id', () => {
    expect(versionLineUnique(versions, '50 g oil · 800 g', 'v1')).toBe(true);
  });

  it('trims both sides before comparing', () => {
    expect(versionLineUnique(versions, '  50 g oil · 800 g  ', null)).toBe(false);
  });

  it('never case-folds: differing case is unique', () => {
    expect(versionLineUnique(versions, '50 g Oil · 800 g', null)).toBe(true);
  });
});

describe('createChildVersion', () => {
  const penFields = {
    versionLabel: '60 g oil · 800 g',
    reason: null,
    citedBatchId: null,
    rows: oliveOilVersion.rows,
    method: oliveOilVersion.method,
    headnote: oliveOilVersion.headnote,
    authored: oliveOilVersion.authored,
  };

  it('carries the supplied id, the parent identity, the supplied createdAt, and the parent recipeId', () => {
    const child = createChildVersion(oliveOilVersion, penFields, { id: 'v2', now: '2026-09-07T10:00:00.000Z' });
    expect(child.id).toBe('v2');
    expect(child.parentVersionId).toBe('olive-oil-ice-cream-v1');
    expect(child.parentVersionLabel).toBe('50 g oil · 800 g');
    expect(child.createdAt).toBe('2026-09-07T10:00:00.000Z');
    expect(child.recipeId).toBe('olive-oil-ice-cream');
  });

  it('does not mutate the parent', () => {
    const parent = structuredClone(oliveOilVersion);
    const before = structuredClone(parent);
    createChildVersion(
      parent,
      { ...penFields, rows: parent.rows, method: parent.method, authored: parent.authored },
      { id: 'v2', now: '2026-09-07T10:00:00.000Z' },
    );
    expect(parent).toEqual(before);
  });

  it('shares no structure with the parent: mutating the parent afterwards leaves the child unchanged', () => {
    const parent = structuredClone(oliveOilVersion);
    const child = createChildVersion(
      parent,
      { ...penFields, rows: parent.rows, method: parent.method, authored: parent.authored },
      { id: 'v2', now: '2026-09-07T10:00:00.000Z' },
    );
    parent.rows[0].grams = 999;
    parent.rows[0].ingredient.composition.fat = 999;
    expect(child.rows[0].grams).not.toBe(999);
    expect(child.rows[0].ingredient.composition.fat).not.toBe(999);
  });
});

describe('saveOverVersion', () => {
  it('keeps id, parentVersionId, parentVersionLabel and createdAt, and replaces the content', () => {
    const child = {
      id: 'v2',
      parentVersionId: 'olive-oil-ice-cream-v1',
      parentVersionLabel: '50 g oil · 800 g',
      createdAt: '2026-09-07T10:00:00.000Z',
      versionLabel: '60 g oil · 800 g',
      reason: null,
      citedBatchId: null,
      rows: oliveOilVersion.rows,
      method: oliveOilVersion.method,
      headnote: 'old headnote',
      authored: oliveOilVersion.authored,
    };
    const penFields = {
      versionLabel: '65 g oil · 800 g',
      reason: 'raised the oil again',
      citedBatchId: 'b-1',
      rows: oliveOilVersion.rows,
      method: oliveOilVersion.method,
      headnote: 'new headnote',
      authored: oliveOilVersion.authored,
    };
    const updated = saveOverVersion(child, penFields, { now: '2026-09-08T00:00:00.000Z' });
    expect(updated.id).toBe('v2');
    expect(updated.parentVersionId).toBe('olive-oil-ice-cream-v1');
    expect(updated.parentVersionLabel).toBe('50 g oil · 800 g');
    expect(updated.createdAt).toBe('2026-09-07T10:00:00.000Z');
    expect(updated.versionLabel).toBe('65 g oil · 800 g');
    expect(updated.reason).toBe('raised the oil again');
    expect(updated.citedBatchId).toBe('b-1');
    expect(updated.headnote).toBe('new headnote');
  });
});

// liftVersionRecord (app/src/store/versionLift.js) is asserted here rather
// than in a dedicated suite — it is the one other pure function this
// phase's version-record shape depends on, and its idempotence is a fact
// both db.js's cursor-lift and transfer.js's import rely on unconditionally.
describe('liftVersionRecord idempotence', () => {
  const phase2Shaped = {
    id: 'v9',
    recipeId: 'r9',
    versionLabel: 'line',
    rows: [{ id: 'row-01', grams: 10 }],
    method: [{ n: 1, instruction: 'do it' }],
    authored: { carriedForward: ['note one'], beforeYouStart: ['note two'] },
  };

  it('lifting a Phase 2-shaped record twice deep-equals lifting it once', () => {
    expect(liftVersionRecord(liftVersionRecord(phase2Shaped))).toEqual(liftVersionRecord(phase2Shaped));
  });

  it('lifting an already-lifted record deep-equals the record itself', () => {
    const lifted = liftVersionRecord(phase2Shaped);
    expect(liftVersionRecord(lifted)).toEqual(lifted);
  });

  it('lifting the seeded olive oil version twice deep-equals lifting it once', () => {
    expect(liftVersionRecord(liftVersionRecord(oliveOilVersion))).toEqual(liftVersionRecord(oliveOilVersion));
  });
});
