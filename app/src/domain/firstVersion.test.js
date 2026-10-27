// The domain suite for firstVersion.js (Phase 11 STRUCT-04, D-03, D-06): who may
// edit a first version, and the record comparison and error the store's guarded
// writes share. Runs under Vitest's default node environment: it imports no
// store, no component and no framework.
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { editStateFor, firstVersionRefusal, isEditableFirstVersion, sameRecord, VersionChangedError } from './firstVersion.js';
import { blankCreateDraft, buildDraftRecord } from './draft.js';

function row(id, overrides = {}) {
  return { id, ingredientName: id, libraryId: 'wholeMilk', portions: [{ step: 1, grams: 100 }], removed: false, ...overrides };
}

function root(overrides = {}) {
  return { id: 'v1', recipeId: 'r1', parentVersionId: null, rows: [row('row-a'), row('row-b')], method: [], ...overrides };
}

describe('firstVersionRefusal (D-06, RESEARCH G-8)', () => {
  it('is null for a first version with no batch, no child and linked rows', () => {
    const version = root();
    expect(firstVersionRefusal({ version, versions: [version], batches: [] })).toBeNull();
  });

  it("is 'gone' when the version is not there", () => {
    expect(firstVersionRefusal({ version: undefined, versions: [], batches: [] })).toBe('gone');
  });

  it("is 'not-first' for a version with a parent", () => {
    const version = root({ parentVersionId: 'v0' });
    expect(firstVersionRefusal({ version, versions: [version], batches: [] })).toBe('not-first');
  });

  it("is 'has-batch' when a batch is stored for the version, and ignores another version's batch", () => {
    const version = root();
    expect(firstVersionRefusal({ version, versions: [version], batches: [{ id: 'b1', versionId: 'v1' }] })).toBe('has-batch');
    expect(firstVersionRefusal({ version, versions: [version], batches: [{ id: 'b2', versionId: 'other' }] })).toBeNull();
  });

  it("is 'has-child' when some version names it as its parent", () => {
    const version = root();
    const child = root({ id: 'v2', parentVersionId: 'v1' });
    expect(firstVersionRefusal({ version, versions: [version, child], batches: [] })).toBe('has-child');
  });

  it('checks the batch before the child', () => {
    const version = root();
    const child = root({ id: 'v2', parentVersionId: 'v1' });
    expect(firstVersionRefusal({ version, versions: [version, child], batches: [{ id: 'b1', versionId: 'v1' }] })).toBe('has-batch');
  });

  it("is 'unlinked-row' for an active row with no library link", () => {
    const version = root({ rows: [row('row-a'), row('row-b', { libraryId: null })] });
    expect(firstVersionRefusal({ version, versions: [version], batches: [] })).toBe('unlinked-row');
  });

  it('does not refuse for an unlinked row the pen struck, whole row or every line', () => {
    const struckRow = root({ rows: [row('row-a'), row('row-b', { libraryId: null, removed: true })] });
    expect(firstVersionRefusal({ version: struckRow, versions: [struckRow], batches: [] })).toBeNull();
    const struckLines = root({
      rows: [row('row-a'), row('row-b', { libraryId: null, portions: [{ step: 1, grams: 5, removed: true }] })],
    });
    expect(firstVersionRefusal({ version: struckLines, versions: [struckLines], batches: [] })).toBeNull();
  });
});

describe('isEditableFirstVersion', () => {
  it('is true exactly when there is no refusal', () => {
    const version = root();
    expect(isEditableFirstVersion({ version, versions: [version], batches: [] })).toBe(true);
    expect(isEditableFirstVersion({ version, versions: [version], batches: [{ id: 'b1', versionId: 'v1' }] })).toBe(false);
    expect(isEditableFirstVersion({ version: undefined, versions: [], batches: [] })).toBe(false);
  });
});

describe('sameRecord', () => {
  it('is true for two records equal by every leaf, whatever their key order', () => {
    const a = { id: 'v1', rows: [{ id: 'r', portions: [{ step: 1, grams: 5 }] }], authored: { beforeYouStart: [] } };
    const b = { authored: { beforeYouStart: [] }, rows: [{ portions: [{ grams: 5, step: 1 }], id: 'r' }], id: 'v1' };
    expect(sameRecord(a, b)).toBe(true);
  });

  it('is false when one leaf differs, a key is missing, or an array is reordered', () => {
    const a = { id: 'v1', rows: [{ id: 'r', grams: 5 }], tags: ['x', 'y'] };
    expect(sameRecord(a, { ...a, rows: [{ id: 'r', grams: 6 }] })).toBe(false);
    expect(sameRecord(a, { id: 'v1', rows: a.rows })).toBe(false);
    expect(sameRecord(a, { ...a, tags: ['y', 'x'] })).toBe(false);
  });

  it('tells a string from a number, null from a missing record, and a key holding undefined from an absent key', () => {
    expect(sameRecord({ n: '5' }, { n: 5 })).toBe(false);
    expect(sameRecord(null, undefined)).toBe(false);
    expect(sameRecord(undefined, { id: 'v1' })).toBe(false);
    expect(sameRecord({ a: undefined }, {})).toBe(false);
    expect(sameRecord(undefined, undefined)).toBe(true);
  });
});

describe('VersionChangedError', () => {
  it("is an Error named 'VersionChangedError' carrying the version id and the reason", () => {
    const error = new VersionChangedError('v1', 'changed');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('VersionChangedError');
    expect(error.versionId).toBe('v1');
    expect(error.reason).toBe('changed');
  });
});

describe('firstVersion.js stays pure', () => {
  it('imports only sibling domain modules and reads no clock or random source', () => {
    const source = readFileSync(new URL('./firstVersion.js', import.meta.url), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    const specifiers = [...source.matchAll(/from\s+(['"])([^'"]+)\1/g)].map((match) => match[2]);
    for (const specifier of specifiers) expect(specifier).toMatch(/^\.\/[\w.-]+\.js$/);
    expect(source).not.toMatch(/\bnew Date\b|\bDate\.now\b|\bcrypto\b|\bMath\.random\b/);
  });
});

describe('editStateFor (D-04, D-06, D-23, RESEARCH G-1c)', () => {
  const draftOf = (kind, versionId = 'v1') =>
    buildDraftRecord({
      versionId,
      kind,
      payload: kind === 'edit' ? blankCreateDraft({ recipeId: 'r1', versionId, name: 'Lemon' }) : {},
      now: '2026-10-26T12:00:00.000Z',
    });

  it("is 'editable' for an eligible version with nothing kept on it", () => {
    const version = root();
    expect(editStateFor({ version, versions: [version], batches: [], drafts: [] })).toBe('editable');
    // A draft under another version’s id is not this version’s.
    expect(editStateFor({ version, versions: [version], batches: [], drafts: [draftOf('edit', 'other')] })).toBe('editable');
  });

  it("is 'editing' while an edit draft that fits is kept on it", () => {
    const version = root();
    expect(editStateFor({ version, versions: [version], batches: [], drafts: [draftOf('edit')] })).toBe('editing');
  });

  it("stays 'editing' for a kept edit on a version that now has a batch or a child: a stale edit stays reachable (D-06)", () => {
    const version = root();
    const child = root({ id: 'v2', parentVersionId: 'v1' });
    expect(editStateFor({ version, versions: [version], batches: [{ id: 'b1', versionId: 'v1' }], drafts: [draftOf('edit')] })).toBe('editing');
    expect(editStateFor({ version, versions: [version, child], batches: [], drafts: [draftOf('edit')] })).toBe('editing');
  });

  it('is null when a pen’s draft is kept on it, whatever the pen', () => {
    const version = root();
    for (const kind of ['plan', 'record', 'amend']) {
      expect(editStateFor({ version, versions: [version], batches: [], drafts: [draftOf(kind)] })).toBeNull();
    }
  });

  it('is null for a version that is not eligible with no edit kept', () => {
    const version = root();
    expect(editStateFor({ version, versions: [version], batches: [{ id: 'b1', versionId: 'v1' }], drafts: [] })).toBeNull();
    expect(editStateFor({ version: undefined, versions: [], batches: [], drafts: [] })).toBeNull();
  });

  it('is null when the kept record under the id does not fit as an edit draft', () => {
    const version = root();
    const misfit = { ...draftOf('edit'), payload: { colour: 'red' } };
    expect(editStateFor({ version, versions: [version], batches: [], drafts: [misfit] })).toBeNull();
  });
});
