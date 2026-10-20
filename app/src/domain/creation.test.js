// The creation editor's pure helpers (Phase 10, MAKE-05, D-05, D-08, D-08c):
// the title, a stored payload laid over the blank one, and the Sheet's
// version-shaped view of a draft. Runs in the node environment: the module
// imports no framework, DOM or store.
import { describe, it, expect } from 'vitest';
import {
  UNTITLED,
  creationTitle,
  normalizeCreateDraft,
  creationSheetVersion,
  addNote,
  updateNote,
  removeNote,
  addRow,
  setRowGrams,
  removeRow,
  creationTargets,
  applyStyle,
  clearStyle,
  setBandEnd,
  addScale,
  updateScale,
  removeScale,
  scaleStopsLine,
} from './creation.js';
import { blankCreateDraft, buildDraftRecord, draftMatchesCreate } from './draft.js';
import { rowFromLibraryRecord } from './versionRow.js';
import { library } from '../data/library.js';
import { STYLE_ROWS } from '../data/styles.js';

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

  it('projects a grams value that reads as Infinity at 0 g and throws nothing', () => {
    const overflow = `1${'0'.repeat(309)}`;
    const version = creationSheetVersion(withRows([rowOf(overflow), rowOf('150', { id: 'row-b', libraryId: 'sucrose' })]), records);
    expect(version.rows.map((row) => row.portions[0].grams)).toEqual([0, 150]);
  });

  it('never mutates the draft and holds no grams string', () => {
    const draft = withRows([rowOf('600')]);
    const before = structuredClone(draft);
    const version = creationSheetVersion(draft, records);
    expect(draft).toEqual(before);
    expect(JSON.stringify(version.rows)).not.toContain('"600"');
  });
});

describe('note operations on a create draft (MAKE-08)', () => {
  const noted = (...texts) => ({ ...blank(), beforeYouStart: texts.map((text) => ({ text })) });

  it('addNote ends the list with an empty note and leaves its argument alone', () => {
    const draft = noted('Chill the mix.');
    const before = structuredClone(draft);
    const next = addNote(draft);
    expect(next.beforeYouStart).toEqual([{ text: 'Chill the mix.' }, { text: '' }]);
    expect(next).not.toBe(draft);
    expect(next.beforeYouStart).not.toBe(draft.beforeYouStart);
    expect(draft).toEqual(before);
  });

  it('addNote on a draft with no notes gives one empty note', () => {
    expect(addNote(blank()).beforeYouStart).toEqual([{ text: '' }]);
  });

  it('updateNote changes only the named note, in a new array and a new draft', () => {
    const draft = noted('One.', 'Two.');
    const next = updateNote(draft, 1, 'Keep the cream cold until it goes in.');
    expect(next.beforeYouStart).toEqual([{ text: 'One.' }, { text: 'Keep the cream cold until it goes in.' }]);
    expect(next).not.toBe(draft);
    expect(next.beforeYouStart).not.toBe(draft.beforeYouStart);
    expect(draft.beforeYouStart[1].text).toBe('Two.');
  });

  it('removeNote drops the named note and keeps the others in order', () => {
    const draft = noted('One.', 'Two.', 'Three.');
    expect(removeNote(draft, 0).beforeYouStart).toEqual([{ text: 'Two.' }, { text: 'Three.' }]);
    expect(removeNote(draft, 1).beforeYouStart).toEqual([{ text: 'One.' }, { text: 'Three.' }]);
    expect(draft.beforeYouStart).toHaveLength(3);
  });

  it('keeps an empty note as an empty note', () => {
    const draft = noted('One.', '');
    expect(updateNote(draft, 0, '').beforeYouStart).toEqual([{ text: '' }, { text: '' }]);
    expect(removeNote(draft, 0).beforeYouStart).toEqual([{ text: '' }]);
  });

  it.each([-1, 2, 1.5, Number.NaN])('updateNote and removeNote throw a RangeError for index %s', (index) => {
    const draft = noted('One.', 'Two.');
    expect(() => updateNote(draft, index, 'x')).toThrow(RangeError);
    expect(() => removeNote(draft, index)).toThrow(RangeError);
  });
});

describe('row operations on a create draft (MAKE-06, D-05, D-07)', () => {
  it('addRow appends a link-and-grams row last, and the result still fits a create record', () => {
    const first = addRow(blank(), { rowId: 'row-1', libraryId: 'sucrose' });
    const second = addRow(first, { rowId: 'row-2', libraryId: 'wholeMilk' });
    expect(second.rows).toEqual([
      { id: 'row-1', libraryId: 'sucrose', portions: [{ step: 1, grams: '' }] },
      { id: 'row-2', libraryId: 'wholeMilk', portions: [{ step: 1, grams: '' }] },
    ]);
    const record = buildDraftRecord({ versionId: 'v1', kind: 'create', payload: second, now: '2026-10-20T08:00:00.000Z' });
    expect(draftMatchesCreate(record)).toBe(true);
  });

  it('addRow throws a RangeError for a row id already on the draft and a TypeError for an empty id', () => {
    const draft = addRow(blank(), { rowId: 'row-1', libraryId: 'sucrose' });
    expect(() => addRow(draft, { rowId: 'row-1', libraryId: 'wholeMilk' })).toThrow(RangeError);
    expect(() => addRow(draft, { rowId: '', libraryId: 'wholeMilk' })).toThrow(TypeError);
    expect(() => addRow(draft, { rowId: 'row-2', libraryId: '' })).toThrow(TypeError);
  });

  it('setRowGrams changes only that row, keeps the text as typed, and throws for an unknown row', () => {
    const draft = addRow(addRow(blank(), { rowId: 'row-1', libraryId: 'sucrose' }), { rowId: 'row-2', libraryId: 'wholeMilk' });
    const next = setRowGrams(draft, 'row-1', '150.');
    expect(next.rows[0].portions).toEqual([{ step: 1, grams: '150.' }]);
    expect(next.rows[1]).toEqual(draft.rows[1]);
    expect(() => setRowGrams(draft, 'nope', '1')).toThrow(RangeError);
  });

  it('removeRow drops that row, keeps the rest in order, and throws for an unknown row', () => {
    const draft = ['a', 'b', 'c'].reduce((acc, id) => addRow(acc, { rowId: id, libraryId: 'sucrose' }), blank());
    expect(removeRow(draft, 'b').rows.map((row) => row.id)).toEqual(['a', 'c']);
    expect(() => removeRow(draft, 'nope')).toThrow(RangeError);
  });

  it('mutates neither the draft nor its rows', () => {
    const draft = addRow(blank(), { rowId: 'row-1', libraryId: 'sucrose' });
    const before = structuredClone(draft);
    addRow(draft, { rowId: 'row-2', libraryId: 'wholeMilk' });
    setRowGrams(draft, 'row-1', '5');
    removeRow(draft, 'row-1');
    expect(draft).toEqual(before);
  });
});

describe('creationTargets (D-08b)', () => {
  const targetsOf = (targets) => creationTargets({ ...blank(), targets });
  const bigEnd = `1${'0'.repeat(309)}`;

  it('reads a band when both ends parse and low is at or below high', () => {
    expect(targetsOf({ pod: ['14', '18'] })).toEqual({ pod: [14, 18] });
    expect(targetsOf({ pod: ['14', '14'] })).toEqual({ pod: [14, 14] });
    expect(targetsOf({ pod: ['9.25', '12'] })).toEqual({ pod: [9.25, 12] });
  });

  it('gives no key for low above high, a blank end, a negative, three decimals or text', () => {
    expect(targetsOf({ pod: ['18', '14'] })).toEqual({});
    expect(targetsOf({ pod: ['', '18'] })).toEqual({});
    expect(targetsOf({ pod: ['5', ''] })).toEqual({});
    expect(targetsOf({ pod: ['-1', '5'] })).toEqual({});
    expect(targetsOf({ pod: ['x', '5'] })).toEqual({});
    expect(targetsOf({ pod: ['1.234', '5'] })).toEqual({});
  });

  it('gives no key for an end that reads as Infinity, even when both are Infinity', () => {
    expect(targetsOf({ pod: ['0', bigEnd] })).toEqual({});
    expect(targetsOf({ pod: [bigEnd, bigEnd] })).toEqual({});
  });

  it('reads each band on its own', () => {
    expect(targetsOf({ pod: ['14', '18'], fat: ['x', '2'], solids: ['36', '42'] })).toEqual({
      pod: [14, 18],
      solids: [36, 42],
    });
  });
});

describe('applyStyle, clearStyle and setBandEnd (MAKE-09, decisions 6, 9, 14, 17)', () => {
  const style = (id) => STYLE_ROWS.find((row) => row.id === id);

  it('applyStyle writes the id, exactly the style bands as strings, and the default temperature', () => {
    const next = applyStyle(blank(), style('philadelphia'));
    expect(next.style).toBe('philadelphia');
    expect(next.targets).toEqual({ pod: ['14', '18'], fat: ['10', '18'], msnf: ['8', '12'], solids: ['36', '42'] });
    expect(next.serveTempC).toBe('-14');
    expect(applyStyle(blank(), style('gelato')).serveTempC).toBe('-12.5');
  });

  it('applyStyle drops a band the style leaves blank', () => {
    const typed = { ...blank(), targets: { fat: ['1', '2'], msnf: ['3', '4'] } };
    expect(applyStyle(typed, style('sorbet')).targets).toEqual({ pod: ['24', '32'], solids: ['26', '36'] });
  });

  it('applying the same style twice gives its own values again', () => {
    const once = applyStyle(blank(), style('french'));
    const edited = setBandEnd(once, 'fat', 1, '99');
    expect(applyStyle(edited, style('french'))).toEqual(once);
  });

  it('a style whose default temperature is not a finite number gives an empty temperature', () => {
    const odd = { ...style('french'), serveTempC: { default: null, min: -16, max: -12 } };
    expect(applyStyle(blank(), odd).serveTempC).toBe('');
  });

  it('clearStyle empties the style and the temperature and leaves the bands', () => {
    const picked = applyStyle(blank(), style('philadelphia'));
    const next = clearStyle(picked);
    expect(next.style).toBeNull();
    expect(next.serveTempC).toBe('');
    expect(next.targets).toEqual(picked.targets);
  });

  it('setBandEnd changes one end, keeps the style, and removes a band left with two blank ends', () => {
    const picked = applyStyle(blank(), style('philadelphia'));
    const next = setBandEnd(picked, 'fat', 1, '16');
    expect(next.targets.fat).toEqual(['10', '16']);
    expect(next.style).toBe('philadelphia');
    const blanked = setBandEnd(setBandEnd(picked, 'fat', 0, ''), 'fat', 1, '');
    expect('fat' in blanked.targets).toBe(false);
  });

  it('setBandEnd starts a band from blank ends and keeps what was typed', () => {
    expect(setBandEnd(blank(), 'sugar', 0, '1.')).toEqual({ ...blank(), targets: { sugar: ['1.', ''] } });
  });

  it('setBandEnd throws a RangeError for a key outside the six bands', () => {
    expect(() => setBandEnd(blank(), 'protein', 0, '1')).toThrow(RangeError);
    expect(() => setBandEnd(blank(), '__proto__', 0, '1')).toThrow(RangeError);
    expect(() => setBandEnd(blank(), 'fat', 2, '1')).toThrow(RangeError);
  });

  it('mutates neither the draft nor the style row', () => {
    const picked = applyStyle(blank(), style('philadelphia'));
    const before = structuredClone(picked);
    const styleBefore = structuredClone(style('philadelphia'));
    setBandEnd(picked, 'fat', 0, '1');
    clearStyle(picked);
    applyStyle(picked, style('gelato'));
    expect(picked).toEqual(before);
    expect(style('philadelphia')).toEqual(styleBefore);
  });

  it('creationSheetVersion carries creationTargets(draft)', () => {
    const draft = { ...blank(), targets: { pod: ['14', '18'], fat: ['9', '1'] } };
    expect(creationSheetVersion(draft).targets).toEqual({ pod: [14, 18] });
  });
});

describe("the recipe's own scales (TASTE-01, decision 12, T-04)", () => {
  const asRecord = (payload) => buildDraftRecord({ versionId: 'v1', kind: 'create', payload, now: '2026-10-20T08:00:00.000Z' });

  it('addScale appends an empty declared scale that still fits a create record', () => {
    const next = addScale(blank(), 'scale-a');
    expect(next.scales).toEqual([{ key: 'scale-a', name: '', low: '', high: '', kind: '', group: 'declared' }]);
    expect(draftMatchesCreate(asRecord(next))).toBe(true);
  });

  it('addScale refuses a third scale, a repeated key and an empty key', () => {
    const two = addScale(addScale(blank(), 'scale-a'), 'scale-b');
    expect(() => addScale(two, 'scale-c')).toThrow(RangeError);
    expect(() => addScale(addScale(blank(), 'scale-a'), 'scale-a')).toThrow(RangeError);
    expect(() => addScale(blank(), '')).toThrow(TypeError);
    expect(() => addScale(blank(), 7)).toThrow(TypeError);
  });

  it('updateScale sets a word or the kind and never moves the key', () => {
    const base = addScale(blank(), 'scale-a');
    expect(updateScale(base, 'scale-a', 'name', 'Creaminess').scales[0].name).toBe('Creaminess');
    expect(updateScale(base, 'scale-a', 'low', ' thin ').scales[0].low).toBe(' thin ');
    const typed = updateScale(base, 'scale-a', 'kind', 'magnitude');
    expect(typed.scales[0].kind).toBe('magnitude');
    expect(typed.scales[0].key).toBe('scale-a');
    expect(updateScale(typed, 'scale-a', 'kind', '').scales[0].kind).toBe('');
  });

  it('updateScale throws a RangeError for a kind outside the two, a field outside the four or an unknown key', () => {
    const base = addScale(blank(), 'scale-a');
    expect(() => updateScale(base, 'scale-a', 'kind', 'both')).toThrow(RangeError);
    expect(() => updateScale(base, 'scale-a', 'key', 'scale-z')).toThrow(RangeError);
    expect(() => updateScale(base, 'scale-a', 'group', 'core')).toThrow(RangeError);
    expect(() => updateScale(base, 'scale-z', 'name', 'x')).toThrow(RangeError);
  });

  it('removeScale drops one scale and the other keeps its key', () => {
    const two = addScale(addScale(blank(), 'scale-a'), 'scale-b');
    expect(removeScale(two, 'scale-a').scales.map((scale) => scale.key)).toEqual(['scale-b']);
    expect(() => removeScale(two, 'scale-z')).toThrow(RangeError);
  });

  it('two scales may share a name; nothing refuses it before Save', () => {
    const two = addScale(addScale(blank(), 'scale-a'), 'scale-b');
    const same = updateScale(updateScale(two, 'scale-a', 'name', 'Body'), 'scale-b', 'name', 'Body');
    expect(same.scales.map((scale) => scale.name)).toEqual(['Body', 'Body']);
  });

  it('does not change the draft it is given', () => {
    const base = addScale(blank(), 'scale-a');
    const before = structuredClone(base);
    updateScale(base, 'scale-a', 'name', 'x');
    removeScale(base, 'scale-a');
    addScale(base, 'scale-b');
    expect(base).toEqual(before);
  });

  it('scaleStopsLine joins five stops for a middle scale and two ends for a low-to-high one', () => {
    expect(scaleStopsLine({ low: 'thin', high: 'rich', kind: 'goldilocks' })).toBe(
      'thin · leaning thin · right · leaning rich · rich',
    );
    expect(scaleStopsLine({ low: 'faint', high: 'strong', kind: 'magnitude' })).toBe('faint to strong');
  });

  it('scaleStopsLine is null until both ends (trimmed) and the kind are set, and uses the words as typed', () => {
    expect(scaleStopsLine({ low: 'thin', high: '  ', kind: 'goldilocks' })).toBeNull();
    expect(scaleStopsLine({ low: '', high: 'rich', kind: 'goldilocks' })).toBeNull();
    expect(scaleStopsLine({ low: 'thin', high: 'rich', kind: '' })).toBeNull();
    expect(scaleStopsLine({ low: '<b>x', high: 'y', kind: 'magnitude' })).toBe('<b>x to y');
  });
});
