// The creation editor's pure helpers (Phase 10, MAKE-05, D-05, D-08, D-08c):
// the title, a stored payload laid over the blank one, and the Sheet's
// version-shaped view of a draft. Runs in the node environment: the module
// imports no framework, DOM or store.
import { describe, it, expect } from 'vitest';
import { UNTITLED, creationTitle, normalizeCreateDraft, creationSheetVersion } from './creation.js';
import { blankCreateDraft, buildDraftRecord, draftMatchesCreate } from './draft.js';
import { rowFromLibraryRecord } from './versionRow.js';
import { library } from '../data/library.js';

const records = new Map(Object.entries(library).map(([id, entry]) => [id, { id, entry }]));
const blank = (name = 'Vanilla') => blankCreateDraft({ recipeId: 'r1', versionId: 'v1', name });
const withRows = (rows) => ({ ...blank(), rows });
const rowOf = (grams, extra = {}) => ({ id: 'row-a', libraryId: 'wholeMilk', portions: [{ step: 1, grams }], ...extra });

describe('creationTitle (D-08c)', () => {
  it('reads Untitled for a blank or whitespace name', () => {
    expect(UNTITLED).toBe('Untitled');
    expect(creationTitle('')).toBe('Untitled');
    expect(creationTitle('   ')).toBe('Untitled');
  });

  it('returns the name as typed otherwise', () => {
    expect(creationTitle('Vanilla')).toBe('Vanilla');
    expect(creationTitle(' Vanilla ')).toBe(' Vanilla ');
  });
});

describe('normalizeCreateDraft', () => {
  it('lays a name-only payload over the blank one', () => {
    const stored = { recipeId: 'r1', versionId: 'v1', name: 'Lemon' };
    expect(normalizeCreateDraft(stored)).toEqual(blankCreateDraft({ recipeId: 'r1', versionId: 'v1', name: 'Lemon' }));
  });

  it('keeps the fields the payload holds and takes the rest from blank', () => {
    const scale = { key: 'scale-a', name: 'Bo', low: '', high: '', kind: '', group: 'declared' };
    const result = normalizeCreateDraft({ recipeId: 'r1', versionId: 'v1', name: 'Lemon', description: 'Plain', scales: [scale] });
    expect(result).toEqual({ ...blankCreateDraft({ recipeId: 'r1', versionId: 'v1', name: 'Lemon' }), description: 'Plain', scales: [scale] });
  });

  it('gives a row with no portion one empty grams field, and keeps a row with a portion as stored', () => {
    const bare = { id: 'row-a', libraryId: 'sucrose', portions: [] };
    const full = { id: 'row-b', libraryId: 'wholeMilk', portions: [{ step: 2, grams: '600' }] };
    const result = normalizeCreateDraft({ ...blank(), rows: [bare, full] });
    expect(result.rows).toEqual([
      { id: 'row-a', libraryId: 'sucrose', portions: [{ step: 1, grams: '' }] },
      full,
    ]);
  });

  it('gives a result that still fits a create record, and leaves its argument alone', () => {
    const payload = { recipeId: 'r1', versionId: 'v1', name: 'Lemon', rows: [{ id: 'row-a', libraryId: 'sucrose', portions: [] }] };
    const before = structuredClone(payload);
    const result = normalizeCreateDraft(payload);
    expect(payload).toEqual(before);
    expect(result).not.toBe(payload);
    expect(draftMatchesCreate(buildDraftRecord({ versionId: 'v1', kind: 'create', payload: result, now: '2026-10-20T08:00:00.000Z' }))).toBe(true);
  });
});

describe('creationSheetVersion (D-05, D-08)', () => {
  it('shapes a blank draft as the version the Sheet reads', () => {
    expect(creationSheetVersion(blank())).toEqual({
      id: 'v1',
      recipeId: 'r1',
      sheetTitle: 'Vanilla',
      sheetDescription: '',
      rows: [],
      method: [],
      authored: { beforeYouStart: [] },
      targets: {},
    });
  });

  it('reads Untitled in the title for a blank name, and the one description in the prose', () => {
    const version = creationSheetVersion({ ...blank(''), description: 'Plain and cold.' });
    expect(version.sheetTitle).toBe('Untitled');
    expect(version.sheetDescription).toBe('Plain and cold.');
  });

  it('projects a draft row through rowFromLibraryRecord with the grams parsed', () => {
    const version = creationSheetVersion(withRows([rowOf('600')]), records);
    expect(version.rows).toEqual([rowFromLibraryRecord(records.get('wholeMilk'), { id: 'row-a', grams: 600, step: 1 })]);
    expect(version.rows[0].ingredient).toEqual(library.wholeMilk);
    expect(version.rows[0].ingredient).not.toBe(records.get('wholeMilk').entry);
  });

  it.each(['', 'abc', '-5', '1.234'])('projects grams %j to a row of 0 g that stays in rows', (grams) => {
    const version = creationSheetVersion(withRows([rowOf(grams)]), records);
    expect(version.rows).toHaveLength(1);
    expect(version.rows[0].portions).toEqual([{ step: 1, grams: 0 }]);
  });

  it('leaves out a row whose library entry is not in the map, without throwing', () => {
    const version = creationSheetVersion(withRows([rowOf('600', { libraryId: 'gone' }), rowOf('50', { id: 'row-b' })]), records);
    expect(version.rows.map((row) => row.id)).toEqual(['row-b']);
  });

  it('projects a row with no portion to 0 g at step 1, without throwing', () => {
    const version = creationSheetVersion(withRows([rowOf('600', { portions: [] })]), records);
    expect(version.rows[0].portions).toEqual([{ step: 1, grams: 0 }]);
  });

  it('never mutates the draft and holds no grams string', () => {
    const draft = withRows([rowOf('600')]);
    const before = structuredClone(draft);
    const version = creationSheetVersion(draft, records);
    expect(draft).toEqual(before);
    expect(JSON.stringify(version.rows)).not.toContain('"600"');
  });
});
