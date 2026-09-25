// Pure domain suite for the History rail's own entries and hint text
// (03.5-05, sketch 011 decision 4: a dated rail of the recipe's versions
// only, oldest left). Runs under Vitest's default node environment —
// imports no store, no component, no framework.
import { describe, it, expect } from 'vitest';
import { railEntries, railHint } from './historyRail.js';

function makeVersion(overrides = {}) {
  return {
    id: 'v1',
    recipeId: 'recipe-1',
    versionLabel: 'Original plan',
    createdAt: '2026-07-01T00:00:00.000Z',
    parentVersionId: null,
    ...overrides,
  };
}

function makeBatch(overrides = {}) {
  return {
    id: 'b1',
    versionId: 'v1',
    churn: { churnDate: '2026-08-02' },
    ...overrides,
  };
}

describe('railEntries', () => {
  it('orders a version and its child by createdAt, marking churn, view and latest', () => {
    const v1 = makeVersion();
    const v2 = makeVersion({
      id: 'v2',
      versionLabel: 'less oil',
      createdAt: '2026-09-20T00:00:00.000Z',
      parentVersionId: 'v1',
    });
    const batch = makeBatch();
    const entries = railEntries([v1, v2], [batch], { currentVersionId: 'v1' });

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      dateWords: '1 Jul',
      name: 'Version 1 · Original plan',
      stateWords: 'churned 2 Aug',
      churned: true,
      inView: true,
      latest: false,
    });
    expect(entries[1]).toMatchObject({
      stateWords: 'not yet churned · Latest',
      churned: false,
      inView: false,
      latest: true,
    });
  });

  it('returns no draft entry when draft is not given', () => {
    const v1 = makeVersion();
    const entries = railEntries([v1], [], { currentVersionId: 'v1' });
    expect(entries).toHaveLength(1);
  });
});

describe('railHint', () => {
  it('reads the singular at one version, desktop, not overflowing', () => {
    expect(railHint(1, { belowDesktop: false, overflowing: false })).toBe('1 version · oldest left, latest right');
  });

  it('adds the opens-at clause only while overflowing, desktop', () => {
    expect(railHint(8, { belowDesktop: false, overflowing: true })).toBe(
      '8 versions · oldest left, latest right · opens at the version in view',
    );
  });

  it('drops the desktop clauses below desktop even while overflowing', () => {
    expect(railHint(2, { belowDesktop: true, overflowing: true })).toBe('2 versions');
  });
});
