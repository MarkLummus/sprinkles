// Domain suite for recency and standing (03.4-CONTEXT.md D-05, D-07;
// 03.4-04 Task 1). Runs under Vitest's default node environment — plain
// object fixtures, no framework, no DOM.
import { describe, it, expect } from 'vitest';
import { lastEventAt, standingFor, activeWork, NOT_YET_CHURNED, AWAITING_TASTING, TASTED } from './lastEvent.js';

function makeVersion(overrides = {}) {
  return {
    id: 'v1',
    recipeId: 'r1',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeBatch(overrides = {}) {
  return {
    id: 'b1',
    versionId: 'v1',
    recordedAt: '2026-01-02T00:00:00.000Z',
    changed: null,
    churn: { churnDate: '2026-01-02' },
    tasting: null,
    ...overrides,
  };
}

describe('lastEventAt', () => {
  it('returns the greatest ISO string among every version createdAt and every batch recordedAt/changed', () => {
    const versions = [makeVersion({ createdAt: '2026-01-01T00:00:00.000Z' })];
    const batches = [makeBatch({ recordedAt: '2026-02-01T00:00:00.000Z', changed: '2026-03-01T00:00:00.000Z' })];
    expect(lastEventAt(versions, batches)).toBe('2026-03-01T00:00:00.000Z');
  });

  it('returns null when nothing supplied carries a timestamp', () => {
    expect(lastEventAt([], [])).toBe(null);
    expect(lastEventAt([makeVersion({ createdAt: null })], [])).toBe(null);
  });

  it('ignores a null timestamp rather than treating it as the earliest', () => {
    const versions = [makeVersion({ createdAt: null })];
    const batches = [makeBatch({ recordedAt: '2026-01-05T00:00:00.000Z', changed: null })];
    expect(lastEventAt(versions, batches)).toBe('2026-01-05T00:00:00.000Z');
  });

  it('a batch saved a second time (changed stamped) makes its recipe more recent than a sibling whose only event is an older version save', () => {
    const churnedTwice = activeWork(
      [makeVersion({ id: 'a', recipeId: 'ra', createdAt: '2026-01-01T00:00:00.000Z' })],
      [makeBatch({ id: 'ba', versionId: 'a', recordedAt: '2026-01-02T00:00:00.000Z', changed: '2026-01-10T00:00:00.000Z' })],
    );
    const savedOnceOlder = activeWork(
      [makeVersion({ id: 'b', recipeId: 'rb', createdAt: '2026-01-05T00:00:00.000Z' })],
      [],
    );
    const combined = activeWork(
      [
        makeVersion({ id: 'a', recipeId: 'ra', createdAt: '2026-01-01T00:00:00.000Z' }),
        makeVersion({ id: 'b', recipeId: 'rb', createdAt: '2026-01-05T00:00:00.000Z' }),
      ],
      [makeBatch({ id: 'ba', versionId: 'a', recordedAt: '2026-01-02T00:00:00.000Z', changed: '2026-01-10T00:00:00.000Z' })],
    );
    expect(churnedTwice[0].lastEventAt).toBe('2026-01-10T00:00:00.000Z');
    expect(savedOnceOlder[0].lastEventAt).toBe('2026-01-05T00:00:00.000Z');
    expect(combined.map((entry) => entry.id)).toEqual(['ra', 'rb']);
  });

  it('a back-dated churn date does not change the ordering: churn.churnDate and tasting.tastedDate are never read', () => {
    const versions = [makeVersion({ createdAt: '2026-01-01T00:00:00.000Z' })];
    const batches = [
      makeBatch({
        recordedAt: '2026-01-02T00:00:00.000Z',
        changed: null,
        churn: { churnDate: '2020-01-01' },
        tasting: { tastedDate: '2020-06-01' },
      }),
    ];
    expect(lastEventAt(versions, batches)).toBe('2026-01-02T00:00:00.000Z');
  });
});

describe('standingFor', () => {
  it('returns not-yet-churned when the recipe has no batch', () => {
    expect(standingFor([])).toBe(NOT_YET_CHURNED);
  });

  it("returns awaiting-tasting when the newest batch's tasting is null", () => {
    const batches = [makeBatch({ id: 'a', churn: { churnDate: '2026-01-01' }, tasting: null })];
    expect(standingFor(batches)).toBe(AWAITING_TASTING);
  });

  it('returns tasted when the newest batch carries a tasting object', () => {
    const batches = [makeBatch({ id: 'a', churn: { churnDate: '2026-01-01' }, tasting: { tastedDate: '2026-01-03' } })];
    expect(standingFor(batches)).toBe(TASTED);
  });

  it('decides the newest batch via sortedBatches, not array order', () => {
    const batches = [
      makeBatch({ id: 'older', churn: { churnDate: '2026-01-01' }, tasting: { tastedDate: '2026-01-02' } }),
      makeBatch({ id: 'newer', churn: { churnDate: '2026-02-01' }, tasting: null }),
    ];
    expect(standingFor(batches)).toBe(AWAITING_TASTING);
  });
});

describe('activeWork', () => {
  it('returns one entry per recipe with the recipe id, name, latest version, ordered versions, ordered batches, lastEventAt and standing', () => {
    const versions = [
      makeVersion({ id: 'a', recipeId: 'r1', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', recipeId: 'r1', createdAt: '2026-02-01T00:00:00.000Z' }),
    ];
    const batches = [
      makeBatch({ id: 'ba', versionId: 'a', recordedAt: '2026-01-05T00:00:00.000Z', churn: { churnDate: '2026-01-05' } }),
    ];
    const recipes = [{ id: 'r1', name: 'Olive oil', description: '' }];
    const [entry] = activeWork(versions, batches, recipes);
    expect(entry.id).toBe('r1');
    expect(entry.name).toBe('Olive oil');
    expect(entry.latestVersion.id).toBe('b');
    expect(entry.versions.map((v) => v.id)).toEqual(['b', 'a']);
    expect(entry.batches.map((b) => b.id)).toEqual(['ba']);
    expect(entry.lastEventAt).toBe('2026-02-01T00:00:00.000Z');
    expect(entry.standing).toBe(AWAITING_TASTING);
  });

  it('orders recipes by lastEventAt descending, with a null last event ordering last', () => {
    const versions = [
      makeVersion({ id: 'old', recipeId: 'r-old', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'new', recipeId: 'r-new', createdAt: '2026-03-01T00:00:00.000Z' }),
      makeVersion({ id: 'null', recipeId: 'r-null', createdAt: null }),
    ];
    const ids = activeWork(versions, []).map((entry) => entry.id);
    expect(ids).toEqual(['r-new', 'r-old', 'r-null']);
  });

  it('breaks a tie in lastEventAt on the latest version id, so ordering is stable', () => {
    const versions = [
      makeVersion({ id: 'z-version', recipeId: 'r-z', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'a-version', recipeId: 'r-a', createdAt: '2026-01-01T00:00:00.000Z' }),
    ];
    const ids = activeWork(versions, []).map((entry) => entry.id);
    expect(ids).toEqual(['r-a', 'r-z']);
  });

  it('returns an empty array for an empty versions array', () => {
    expect(activeWork([], [])).toEqual([]);
  });

  it('never throws on a batch whose churn is missing, and leaves it out of that recipe\'s own batches', () => {
    const versions = [makeVersion({ id: 'a', recipeId: 'r1', createdAt: '2026-01-01T00:00:00.000Z' })];
    const malformedBatch = { id: 'bad', versionId: 'a', recordedAt: '2026-01-02T00:00:00.000Z', changed: null };
    expect(() => activeWork(versions, [malformedBatch])).not.toThrow();
    const [entry] = activeWork(versions, [malformedBatch]);
    expect(entry.batches).toEqual([]);
    expect(entry.standing).toBe(NOT_YET_CHURNED);
  });

  it("returns entry.name from the recipe whose id equals the version's recipeId (D-11)", () => {
    const versions = [makeVersion({ id: 'a', recipeId: 'r1', createdAt: '2026-01-01T00:00:00.000Z' })];
    const recipes = [
      { id: 'r1', name: 'Olive Oil Ice Cream, circulator', description: '' },
      { id: 'r2', name: 'Someone else\'s recipe', description: '' },
    ];
    const [entry] = activeWork(versions, [], recipes);
    expect(entry.name).toBe('Olive Oil Ice Cream, circulator');
  });

  it('falls back to the recipeId string when recipes is empty (decisions_recorded 3)', () => {
    const versions = [makeVersion({ id: 'a', recipeId: 'r1', createdAt: '2026-01-01T00:00:00.000Z' })];
    const [entry] = activeWork(versions, [], []);
    expect(entry.name).toBe('r1');
  });

  it('defaults recipes to an empty array when the third argument is omitted', () => {
    const versions = [makeVersion({ id: 'a', recipeId: 'r1', createdAt: '2026-01-01T00:00:00.000Z' })];
    const [entry] = activeWork(versions, []);
    expect(entry.name).toBe('r1');
  });
});
