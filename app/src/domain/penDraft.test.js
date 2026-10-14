import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { oliveOilVersion } from '../data/olive-oil.js';
import { isLineRemoved } from './rows.js';
import {
  derivePenState,
  isPenDraftDirty,
  penDraftFromVersion,
  penDraftRow,
  penDraftVersion,
  penFieldsFromDraft,
  penSaveBlock,
  restoreStepFromVersion,
  setPenField,
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

describe('setPenField', () => {
  it('writes the new value and leaves every other key', () => {
    const draft = cleanDraftFor(clone());
    const next = setPenField(draft, 'versionLabel', 'v2');
    expect(next.versionLabel).toBe('v2');
    expect(next.reason).toBe(draft.reason);
    expect(next.rows).toBe(draft.rows);
  });

  it('returns a new draft and leaves its input as it was, and answers the same twice', () => {
    const draft = cleanDraftFor(clone());
    const before = structuredClone(draft);
    const first = setPenField(draft, 'reason', 'Less sugar');
    const second = setPenField(draft, 'reason', 'Less sugar');
    expect(first).not.toBe(draft);
    expect(second).toEqual(first);
    expect(draft).toEqual(before);
  });
});

describe('penDraftFromVersion', () => {
  it('gives an own key for every row id, grams as strings, removed read through isLineRemoved', () => {
    const version = clone();
    const draft = penDraftFromVersion(version);
    for (const row of version.rows) {
      expect(Object.prototype.hasOwnProperty.call(draft.rows, row.id)).toBe(true);
      row.portions.forEach((portion, i) => {
        expect(draft.rows[row.id].portions[i]).toEqual({
          step: portion.step,
          grams: String(portion.grams),
          removed: isLineRemoved(row, portion),
        });
      });
    }
    expect(draft.versionLabel).toBe('');
    expect(draft.reason).toBe('');
    expect(draft.citedBatchId).toBe(null);
    expect(draft.sheetTitle).toBe(version.sheetTitle);
    expect(draft.sheetDescription).toBe(version.sheetDescription);
  });

  it('turns a row id of __proto__ into an own key, not a prototype change', () => {
    const version = clone();
    version.rows[0] = { ...version.rows[0], id: '__proto__' };
    const draft = penDraftFromVersion(version);
    expect(Object.prototype.hasOwnProperty.call(draft.rows, '__proto__')).toBe(true);
    expect(Object.getPrototypeOf(draft.rows)).toBe(Object.prototype);
    expect(penDraftRow(draft, '__proto__').portions.length).toBe(version.rows[0].portions.length);
  });

  it("copies method and authored, so changing the draft's leaves the version untouched", () => {
    const version = clone();
    const before = structuredClone(version);
    const draft = penDraftFromVersion(version);
    draft.method[0].leadIn = 'A typed change';
    draft.authored.beforeYouStart.push({ text: 'new', inheritedFrom: null });
    expect(version).toEqual(before);
  });

  it('leaves its argument as it was and answers the same twice', () => {
    const version = clone();
    const before = structuredClone(version);
    const first = penDraftFromVersion(version);
    const second = penDraftFromVersion(version);
    expect(second).toEqual(first);
    expect(version).toEqual(before);
  });
});

describe('penDraftVersion', () => {
  it('parses typed grams and falls back to the stored amount for a blank or unparseable string', () => {
    const version = clone();
    const draft = cleanDraftFor(version);
    const [first, second] = version.rows;
    draft.rows[first.id].portions[0].grams = '12.5';
    draft.rows[second.id].portions[0].grams = '';
    const result = penDraftVersion(version, draft);
    expect(result.rows[0].portions[0].grams).toBe(12.5);
    expect(result.rows[1].portions[0].grams).toBe(second.portions[0].grams);
    draft.rows[second.id].portions[0].grams = 'abc';
    expect(penDraftVersion(version, draft).rows[1].portions[0].grams).toBe(second.portions[0].grams);
  });

  it("takes the draft's method, titles and authored, and clears every row's own removed flag", () => {
    const version = clone();
    const draft = cleanDraftFor(version);
    draft.sheetTitle = 'Another title';
    const result = penDraftVersion(version, draft);
    expect(result.sheetTitle).toBe('Another title');
    expect(result.method).toBe(draft.method);
    expect(result.authored).toBe(draft.authored);
    expect(result.rows.every((row) => row.removed === false)).toBe(true);
  });

  it('leaves its arguments as they were and answers the same twice', () => {
    const version = clone();
    const draft = cleanDraftFor(version);
    const versionBefore = structuredClone(version);
    const draftBefore = structuredClone(draft);
    const first = penDraftVersion(version, draft);
    const second = penDraftVersion(version, draft);
    expect(second).toEqual(first);
    expect(version).toEqual(versionBefore);
    expect(draft).toEqual(draftBefore);
  });
});

describe('penSaveBlock', () => {
  it('names the version line when it is blank', () => {
    const version = clone();
    const draft = cleanDraftFor(version);
    expect(penSaveBlock(draft, version, [])).toEqual({
      message: 'Enter a version.',
      target: { kind: 'versionLine' },
    });
  });

  it("names the row and line a blank amount blocks on", () => {
    const version = clone();
    const draft = cleanDraftFor(version);
    draft.versionLabel = 'v-next';
    const row = version.rows[1];
    draft.rows[row.id].portions[0].grams = '';
    const block = penSaveBlock(draft, version, []);
    expect(block.target).toEqual({ kind: 'row', rowId: row.id, index: 0 });
    expect(block.message).toBe(`${row.ingredientName} needs an amount, or remove it`);
  });

  it('is null for a clean draft', () => {
    const version = clone();
    const draft = cleanDraftFor(version);
    draft.versionLabel = 'v-next';
    expect(penSaveBlock(draft, version, [])).toBe(null);
  });

  it('leaves its arguments as they were and answers the same twice', () => {
    const version = clone();
    const draft = cleanDraftFor(version);
    const scoped = [];
    const versionBefore = structuredClone(version);
    const draftBefore = structuredClone(draft);
    const first = penSaveBlock(draft, version, scoped);
    const second = penSaveBlock(draft, version, scoped);
    expect(second).toEqual(first);
    expect(version).toEqual(versionBefore);
    expect(draft).toEqual(draftBefore);
    expect(scoped).toEqual([]);
  });
});

describe('penFieldsFromDraft', () => {
  it('stores a reason of only whitespace as null, and keeps any other reason as typed', () => {
    const version = clone();
    const draft = cleanDraftFor(version);
    draft.versionLabel = 'v-next';
    draft.reason = '   ';
    expect(penFieldsFromDraft(draft, version).reason).toBe(null);
    draft.reason = ' Less sugar ';
    expect(penFieldsFromDraft(draft, version).reason).toBe(' Less sugar ');
  });

  it("carries the draft's own version line, citation, method, titles and authored", () => {
    const version = clone();
    const draft = cleanDraftFor(version);
    draft.versionLabel = 'v-next';
    draft.citedBatchId = 'batch-1';
    const fields = penFieldsFromDraft(draft, version);
    expect(fields.versionLabel).toBe('v-next');
    expect(fields.citedBatchId).toBe('batch-1');
    expect(fields.method).toBe(draft.method);
    expect(fields.authored).toBe(draft.authored);
    expect(fields.rows.length).toBe(version.rows.length);
  });

  it('leaves its arguments as they were and answers the same twice', () => {
    const version = clone();
    const draft = cleanDraftFor(version);
    draft.versionLabel = 'v-next';
    const versionBefore = structuredClone(version);
    const draftBefore = structuredClone(draft);
    const first = penFieldsFromDraft(draft, version);
    const second = penFieldsFromDraft(draft, version);
    expect(second).toEqual(first);
    expect(version).toEqual(versionBefore);
    expect(draft).toEqual(draftBefore);
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
