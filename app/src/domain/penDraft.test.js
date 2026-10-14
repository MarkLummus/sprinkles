import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { oliveOilVersion } from '../data/olive-oil.js';
import { isLineRemoved } from './rows.js';
import {
  derivePenState,
  isPenDraftDirty,
  penDraftRow,
  restoreStepFromVersion,
  toggleDraftRowLines,
} from './penDraft.js';

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

// A clean draft of a version, shaped as handleStartDeveloping builds it.
function cleanDraftFor(version) {
  return {
    versionLabel: '',
    reason: '',
    citedBatchId: null,
    sheetTitle: version.sheetTitle,
    sheetDescription: version.sheetDescription,
    rows: Object.fromEntries(
      version.rows.map((row) => [
        row.id,
        {
          portions: row.portions.map((portion) => ({
            step: portion.step,
            grams: String(portion.grams),
            removed: isLineRemoved(row, portion),
          })),
        },
      ]),
    ),
    method: structuredClone(version.method),
    authored: { beforeYouStart: structuredClone(version.authored.beforeYouStart) },
  };
}

describe('the moved pen helpers change nothing they are given and answer the same twice', () => {
  it('isPenDraftDirty', () => {
    const version = clone();
    const penDraft = cleanDraftFor(version);
    penDraft.method[0].leadIn = 'A typed change';
    const draftBefore = structuredClone(penDraft);
    const versionBefore = structuredClone(version);
    const first = isPenDraftDirty('developing', penDraft, version);
    const second = isPenDraftDirty('developing', penDraft, version);
    expect(first).toBe(true);
    expect(second).toEqual(first);
    expect(penDraft).toEqual(draftBefore);
    expect(version).toEqual(versionBefore);
  });

  it('toggleDraftRowLines', () => {
    const draftRow = { portions: [{ step: 1, grams: '10', removed: false }, { step: 2, grams: '5', removed: true }] };
    const before = structuredClone(draftRow);
    const first = toggleDraftRowLines(draftRow);
    const second = toggleDraftRowLines(draftRow);
    expect(second).toEqual(first);
    expect(draftRow).toEqual(before);
  });

  it('derivePenState', () => {
    const input = { mode: 'recording', amendingBatchId: 'batch-1' };
    const before = structuredClone(input);
    const first = derivePenState(input);
    const second = derivePenState(input);
    expect(second).toEqual(first);
    expect(input).toEqual(before);
  });

  it('restoreStepFromVersion', () => {
    const version = clone();
    const penDraft = cleanDraftFor(version);
    penDraft.method[0].leadIn = 'A typed change';
    const draftBefore = structuredClone(penDraft);
    const versionBefore = structuredClone(version);
    const first = restoreStepFromVersion(penDraft, version, version.method[0].n);
    const second = restoreStepFromVersion(penDraft, version, version.method[0].n);
    expect(second).toEqual(first);
    expect(penDraft).toEqual(draftBefore);
    expect(version).toEqual(versionBefore);
  });
});

describe('restoreStepFromVersion identity', () => {
  it("restores a copy of the version's step, and other steps keep the draft's own objects", () => {
    const version = clone();
    expect(version.method.length).toBeGreaterThan(1);
    const penDraft = cleanDraftFor(version);
    const restored = restoreStepFromVersion(penDraft, version, version.method[0].n);
    expect(restored.method[0]).toEqual(version.method[0]);
    expect(restored.method[0]).not.toBe(version.method[0]);
    for (let i = 1; i < restored.method.length; i += 1) {
      expect(restored.method[i]).toBe(penDraft.method[i]);
    }
  });
});

describe('penDraft.js holds no shared mutable state', () => {
  it('declares no module-level let or var', () => {
    const source = readFileSync(new URL('./penDraft.js', import.meta.url), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    expect(source).not.toMatch(/^(let|var) /m);
  });
});
