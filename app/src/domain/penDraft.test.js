import { describe, it, expect } from 'vitest';
import { oliveOilVersion } from '../data/olive-oil.js';
import { penDraftRow } from './penDraft.js';

function clone() {
  return structuredClone(oliveOilVersion);
}

function draftFor(version) {
  return { rows: Object.fromEntries(version.rows.map((row) => [row.id, { portions: [] }])) };
}

describe('penDraftRow', () => {
  it('returns the exact entry for an own row id', () => {
    const version = clone();
    const penDraft = draftFor(version);
    const row = version.rows[0];
    expect(penDraftRow(penDraft, row.id)).toBe(penDraft.rows[row.id]);
  });

  it('returns undefined for an id absent from rows', () => {
    const penDraft = draftFor(clone());
    expect(penDraftRow(penDraft, 'no-such-row')).toBeUndefined();
  });

  it.each(['__proto__', 'constructor', 'toString', 'hasOwnProperty'])(
    'returns undefined for %s when it is not an own key',
    (name) => {
      const penDraft = draftFor(clone());
      expect(penDraftRow(penDraft, name)).toBeUndefined();
    },
  );

  it('shows the difference the accessor makes against a bare bracket read', () => {
    const penDraft = draftFor(clone());
    expect(penDraft.rows['constructor']).not.toBeUndefined();
    expect(penDraft.rows['toString']).not.toBeUndefined();
    expect(penDraftRow(penDraft, 'constructor')).toBeUndefined();
    expect(penDraftRow(penDraft, 'toString')).toBeUndefined();
  });

  it('still finds an own key named __proto__', () => {
    const entry = { portions: [] };
    const penDraft = { rows: Object.fromEntries([['__proto__', entry]]) };
    expect(penDraftRow(penDraft, '__proto__')).toBe(entry);
  });

  it('does not change the draft', () => {
    const version = clone();
    const penDraft = draftFor(version);
    const before = structuredClone(penDraft);
    penDraftRow(penDraft, version.rows[0].id);
    penDraftRow(penDraft, '__proto__');
    penDraftRow(penDraft, 'no-such-row');
    expect(penDraft).toEqual(before);
  });
});
