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

  it('appends a draft entry after the saved versions, ordinal one past the saved count (03.5-05 Task 2, D-13)', () => {
    const v1 = makeVersion();
    const v2 = makeVersion({ id: 'v2', versionLabel: 'more salt', createdAt: '2026-08-01T00:00:00.000Z' });
    const draft = { label: 'less oil', createdAt: '2026-09-20T10:00:00.000Z' };
    const entries = railEntries([v1, v2], [], { currentVersionId: 'v1', draft });

    expect(entries).toHaveLength(3);
    expect(entries[2]).toMatchObject({
      dateWords: '20 Sep',
      name: 'Version 3 · less oil',
      stateWords: 'draft',
      churned: false,
      inView: false,
      isDraft: true,
    });
  });

  it('drops the label from the draft entry name when it is blank', () => {
    const v1 = makeVersion();
    const draft = { label: '', createdAt: '2026-09-20T10:00:00.000Z' };
    const entries = railEntries([v1], [], { currentVersionId: 'v1', draft });
    expect(entries[1].name).toBe('Version 2');
  });

  // 03.5-18 Task 2 (decisions_recorded 2): the state words split by
  // position — an older, never-churned version reads "not churned"
  // (upright-393.html Version 4); only the LATEST unchurned version keeps
  // "not yet churned" (1600-no-batch.html's rail).
  it('reads an older, never-churned version as "not churned"', () => {
    const v1 = makeVersion();
    const v2 = makeVersion({ id: 'v2', versionLabel: 'allulose out', createdAt: '2026-08-11T00:00:00.000Z' });
    const v3 = makeVersion({ id: 'v3', versionLabel: 'gum blend up', createdAt: '2026-08-18T00:00:00.000Z' });
    const batch3 = makeBatch({ id: 'b3', versionId: 'v3', churn: { churnDate: '2026-08-20' } });
    const entries = railEntries([v1, v2, v3], [batch3], { currentVersionId: 'v1' });
    expect(entries[1]).toMatchObject({ stateWords: 'not churned', churned: false, latest: false });
  });

  it('still reads the latest, never-churned version as "not yet churned · Latest"', () => {
    const v1 = makeVersion();
    const v2 = makeVersion({ id: 'v2', versionLabel: 'less oil', createdAt: '2026-09-20T00:00:00.000Z' });
    const entries = railEntries([v1, v2], [], { currentVersionId: 'v1' });
    expect(entries[1]).toMatchObject({ stateWords: 'not yet churned · Latest', churned: false, latest: true });
  });

  it('still reads a churned version by its churn date, and the draft entry still reads "draft"', () => {
    const v1 = makeVersion();
    const v2 = makeVersion({ id: 'v2', versionLabel: 'less oil', createdAt: '2026-09-20T00:00:00.000Z' });
    const batch = makeBatch();
    const draft = { label: 'more salt', createdAt: '2026-09-25T00:00:00.000Z' };
    const entries = railEntries([v1, v2], [batch], { currentVersionId: 'v1', draft });
    expect(entries[0]).toMatchObject({ stateWords: 'churned 2 Aug' });
    expect(entries[2]).toMatchObject({ stateWords: 'draft' });
  });
});

describe('railHint (03.5-18 Task 1: open/upright/overflowing, decision 19)', () => {
  it('reads the count alone while closed', () => {
    expect(railHint(2, { open: false })).toBe('2 versions');
  });

  it('reads the upright clause while open and upright', () => {
    expect(railHint(2, { open: true, upright: true })).toBe('2 versions · latest first');
  });

  it('reads the horizontal clause while open and not upright', () => {
    expect(railHint(2, { open: true })).toBe('2 versions · oldest left, latest right');
  });

  it('adds the opens-at clause only while open, horizontal and overflowing', () => {
    expect(railHint(8, { open: true, overflowing: true })).toBe(
      '8 versions · oldest left, latest right · opens at the version in view',
    );
  });

  it('never adds the overflow clause while upright, even while overflowing', () => {
    expect(railHint(8, { open: true, upright: true, overflowing: true })).toBe('8 versions · latest first');
  });
});
