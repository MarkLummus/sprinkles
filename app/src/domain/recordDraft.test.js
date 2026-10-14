import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';
import { BATTERY_FIELDS } from './battery.js';
import {
  CHURN_DATE_BLOCKED_MESSAGE,
  batchSavedStatus,
  blankRecordDraft,
  buildChurnFieldsFromDraft,
  buildTastingFieldsFromDraft,
  draftFromBatch,
  isDraftDirty,
  isTastingBodyField,
  parseAllMeasuredFields,
  removeTastingSection,
  restoreDraftFromUndo,
  setRecordField,
  tastingHasInk,
  tastingPayloadFromDraft,
  validateRecordDraft,
} from './recordDraft.js';

// A draft holding only what the save gate reads: the churn date and the
// battery's measured fields, all blank.
function gateDraft(overrides = {}) {
  const draft = { churnDate: '' };
  for (const field of BATTERY_FIELDS) draft[field.key] = '';
  return { ...draft, ...overrides };
}

describe('validateRecordDraft — the record pen\'s save gate', () => {
  it('blocks a blank churn date once every measurement is clean', () => {
    const result = validateRecordDraft(gateDraft());
    expect(result.blockedDateMessage).toBe(CHURN_DATE_BLOCKED_MESSAGE);
    expect(result.invalidFieldKey).toBe(null);
    expect(result.fieldErrors).toEqual({});
  });

  it('reports the measurements first: two malformed fields block, the date does not', () => {
    const result = validateRecordDraft(gateDraft({ churnDurationMinutes: '-3', temperingMinutes: '-2' }));
    expect(result.invalidFieldKey).toBe('churnDurationMinutes');
    expect(Object.keys(result.fieldErrors)).toEqual(['churnDurationMinutes', 'temperingMinutes']);
    expect(result.blockedDateMessage).toBe(null);
  });

  it('lets a churn date with clean fields through', () => {
    const result = validateRecordDraft(gateDraft({ churnDate: '2026-08-09' }));
    expect(result.blockedDateMessage).toBe(null);
    expect(result.invalidFieldKey).toBe(null);
    expect(result.fieldErrors).toEqual({});
  });

  it('leaves its argument unchanged, and answers the same twice', () => {
    for (const draft of [
      gateDraft(),
      gateDraft({ churnDurationMinutes: '-3', temperingMinutes: '-2' }),
      gateDraft({ churnDate: '2026-08-09' }),
    ]) {
      const before = structuredClone(draft);
      const first = validateRecordDraft(draft);
      expect(draft).toEqual(before);
      expect(validateRecordDraft(draft)).toEqual(first);
    }
  });
});

const TASTING_BODY_FIELDS = ['tastedDate', 'temperingMinutes', 'tastingTempC', 'note', 'meltTestG', 'meltStyle', 'fromFreezer'];

function inkedDraft() {
  return {
    ...blankRecordDraft(),
    churnDate: '2026-08-09',
    tastingOpen: true,
    tastedDate: '2026-08-10',
    note: 'Firm, clean finish',
    marks: { hardness: 2 },
    defects: ['icy'],
    declaredDefects: ['grainy'],
  };
}

function pendingUndoOf(draft) {
  return tastingPayloadFromDraft(draft);
}

describe('isDraftDirty', () => {
  it('reads a blank draft as clean and a typed one as dirty, with no baseline', () => {
    expect(isDraftDirty('recording', blankRecordDraft())).toBe(false);
    expect(isDraftDirty('recording', { ...blankRecordDraft(), churnDate: '2026-08-09' })).toBe(true);
    expect(isDraftDirty('reading', inkedDraft())).toBe(false);
  });

  it('compares against the baseline when one is given', () => {
    const baseline = draftFromBatch(structuredClone(augustSecondBatch));
    expect(isDraftDirty('recording', structuredClone(baseline), baseline)).toBe(false);
    expect(isDraftDirty('recording', { ...structuredClone(baseline), note: `${baseline.note}!` }, baseline)).toBe(true);
  });

  it('leaves its arguments unchanged, and answers the same twice', () => {
    const baseline = draftFromBatch(structuredClone(augustSecondBatch));
    const draft = inkedDraft();
    for (const args of [
      ['recording', draft, null],
      ['recording', draft, baseline],
    ]) {
      const before = structuredClone(args);
      const first = isDraftDirty(...args);
      expect(args).toEqual(before);
      expect(isDraftDirty(...args)).toBe(first);
    }
  });
});

describe('draftFromBatch', () => {
  it('leaves the batch unchanged, and answers the same twice', () => {
    const batch = structuredClone(augustSecondBatch);
    const first = draftFromBatch(batch);
    expect(batch).toEqual(augustSecondBatch);
    expect(draftFromBatch(batch)).toEqual(first);
  });

  it('does not share its asMade, stepChanges or marks with the batch', () => {
    const batch = structuredClone(augustSecondBatch);
    const draft = draftFromBatch(batch);
    for (const key of Object.keys(draft.asMade)) expect(draft.asMade[key]).not.toBe(batch.churn.asMade[key]);
    expect(draft.stepChanges).not.toBe(batch.churn.stepChanges);
    if (batch.tasting) expect(draft.marks).not.toBe(batch.tasting.marks);
  });

  it('reads a batch with no tasting as a closed, blank tasting side', () => {
    const batch = structuredClone(augustSecondBatch);
    batch.tasting = null;
    const draft = draftFromBatch(batch);
    expect(draft.tastingOpen).toBe(false);
    expect(draft.marks).toEqual({});
    expect(tastingHasInk(draft)).toBe(false);
  });
});

describe('tastingHasInk and tastingPayloadFromDraft', () => {
  it('sees no ink in a blank draft and ink in an inked one', () => {
    expect(tastingHasInk(blankRecordDraft())).toBe(false);
    expect(tastingHasInk(inkedDraft())).toBe(true);
  });

  it('leave the draft unchanged and answer the same twice', () => {
    const draft = inkedDraft();
    const before = structuredClone(draft);
    const hasInk = tastingHasInk(draft);
    const payload = tastingPayloadFromDraft(draft);
    expect(draft).toEqual(before);
    expect(tastingHasInk(draft)).toBe(hasInk);
    expect(tastingPayloadFromDraft(draft)).toEqual(payload);
  });

  it('give a payload that shares no marks or lists with the draft', () => {
    const draft = inkedDraft();
    const payload = tastingPayloadFromDraft(draft);
    expect(payload.marks).not.toBe(draft.marks);
    expect(payload.defects).not.toBe(draft.defects);
    expect(payload.declaredDefects).not.toBe(draft.declaredDefects);
  });
});

describe('restoreDraftFromUndo', () => {
  it('writes the tasting side back and reopens the section', () => {
    const inked = inkedDraft();
    const undo = pendingUndoOf(inked);
    const restored = restoreDraftFromUndo(removeTastingSection(inked), undo);
    expect(restored).toEqual(inked);
  });

  it('leaves both arguments unchanged, answers the same twice, and shares nothing with the undo', () => {
    const draft = removeTastingSection(inkedDraft());
    const undo = pendingUndoOf(inkedDraft());
    const draftBefore = structuredClone(draft);
    const undoBefore = structuredClone(undo);
    const first = restoreDraftFromUndo(draft, undo);
    expect(draft).toEqual(draftBefore);
    expect(undo).toEqual(undoBefore);
    expect(restoreDraftFromUndo(draft, undo)).toEqual(first);
    expect(first.marks).not.toBe(undo.marks);
    expect(first.defects).not.toBe(undo.defects);
    expect(first.declaredDefects).not.toBe(undo.declaredDefects);
  });
});

describe('removeTastingSection', () => {
  it('closes the section and blanks every tasting-body field, leaving the churn fields', () => {
    const inked = { ...inkedDraft(), churnDurationMinutes: '24', temperingMinutes: '5', fromFreezer: 'yes' };
    const removed = removeTastingSection(inked);
    const blank = blankRecordDraft();
    expect(removed.tastingOpen).toBe(false);
    for (const key of [...TASTING_BODY_FIELDS, 'marks', 'defects', 'declaredDefects']) {
      expect(removed[key]).toEqual(blank[key]);
    }
    expect(removed.churnDate).toBe('2026-08-09');
    expect(removed.churnDurationMinutes).toBe('24');
  });

  it('leaves its argument unchanged and answers the same twice', () => {
    const draft = inkedDraft();
    const before = structuredClone(draft);
    const first = removeTastingSection(draft);
    expect(draft).toEqual(before);
    expect(removeTastingSection(draft)).toEqual(first);
  });
});

describe('buildChurnFieldsFromDraft and buildTastingFieldsFromDraft', () => {
  function builtInputs() {
    const draft = draftFromBatch(structuredClone(augustSecondBatch));
    const { parsed } = parseAllMeasuredFields(draft);
    return { draft, parsed };
  }

  it('leave the draft and parsed unchanged, and answer the same twice', () => {
    const { draft, parsed } = builtInputs();
    const draftBefore = structuredClone(draft);
    const parsedBefore = structuredClone(parsed);
    const churn = buildChurnFieldsFromDraft(draft, parsed);
    const tasting = buildTastingFieldsFromDraft(draft, parsed);
    expect(draft).toEqual(draftBefore);
    expect(parsed).toEqual(parsedBefore);
    expect(buildChurnFieldsFromDraft(draft, parsed)).toEqual(churn);
    expect(buildTastingFieldsFromDraft(draft, parsed)).toEqual(tasting);
  });

  it('turn blank strings into null and parsed measurements into numbers', () => {
    const { draft, parsed } = builtInputs();
    const blank = { ...blankRecordDraft(), churnDate: '2026-08-09' };
    const { parsed: blankParsed } = parseAllMeasuredFields(blank);
    const churn = buildChurnFieldsFromDraft(blank, blankParsed);
    expect(churn.churnDate).toBe('2026-08-09');
    expect(churn.atDraw).toBe(null);
    expect(churn.ingredientNotes).toBe(null);
    expect(churn.outOfMachineTempC).toBe(null);
    const tasting = buildTastingFieldsFromDraft(blank, blankParsed);
    expect(tasting.note).toBe(null);
    expect(tasting.defects).toBe(null);
    expect(tasting.tastingTempC).toBe(null);
    expect(buildTastingFieldsFromDraft(draft, parsed).tastingTempC).toBe(parsed.tastingTempC.value);
  });

  it('drops an as-made row whose every portion is blank, and keeps one with a number', () => {
    const draft = { ...blankRecordDraft(), churnDate: '2026-08-09', asMade: { empty: ['', ''], some: ['12', ''] } };
    const { parsed } = parseAllMeasuredFields(draft);
    const churn = buildChurnFieldsFromDraft(draft, parsed);
    expect(Object.keys(churn.asMade)).toEqual(['some']);
    expect(churn.asMade.some).toEqual([12, null]);
  });
});

describe('batchSavedStatus', () => {
  it('says "changed" for a record that carries a changed date', () => {
    const record = { ...structuredClone(augustSecondBatch), changed: '2026-08-12T00:00:00.000Z' };
    const before = structuredClone(record);
    const first = batchSavedStatus(record);
    expect(first.startsWith('changed ')).toBe(true);
    expect(record).toEqual(before);
    expect(batchSavedStatus(record)).toBe(first);
  });

  it('says "recorded" for a record with no changed date', () => {
    const record = { ...structuredClone(augustSecondBatch), changed: null };
    const first = batchSavedStatus(record);
    expect(first.startsWith('recorded ')).toBe(true);
    expect(batchSavedStatus(record)).toBe(first);
  });
});

describe('setRecordField', () => {
  it('writes the raw string under the field and leaves the other fields', () => {
    const draft = blankRecordDraft();
    const next = setRecordField(draft, 'churnDate', '2026-10-09');
    expect(next.churnDate).toBe('2026-10-09');
    expect(next.note).toBe('');
    expect(next).not.toBe(draft);
  });

  it('leaves its input unchanged and answers the same twice', () => {
    const draft = blankRecordDraft();
    const before = structuredClone(draft);
    const first = setRecordField(draft, 'note', 'smooth');
    expect(draft).toEqual(before);
    expect(setRecordField(draft, 'note', 'smooth')).toEqual(first);
  });
});

describe('shared state', () => {
  it('blankRecordDraft returns a fresh draft on each call, sharing no object', () => {
    const a = blankRecordDraft();
    const b = blankRecordDraft();
    expect(a).not.toBe(b);
    for (const key of ['asMade', 'stepChanges', 'marks', 'defects', 'declaredDefects']) {
      expect(a[key]).not.toBe(b[key]);
    }
    a.asMade.row = ['1'];
    a.marks.hardness = 3;
    a.defects.push('icy');
    expect(blankRecordDraft()).toEqual(b);
    expect(blankRecordDraft().marks).toEqual({});
  });

  it('a removeTastingSection result does not share its lists with the next one', () => {
    const first = removeTastingSection(blankRecordDraft());
    first.defects.push('icy');
    first.marks.hardness = 3;
    expect(removeTastingSection(blankRecordDraft()).defects).toEqual([]);
    expect(removeTastingSection(blankRecordDraft()).marks).toEqual({});
  });

  it('isTastingBodyField answers the same after many calls', () => {
    const probe = [...TASTING_BODY_FIELDS, 'churnDate', 'marks', 'defects', 'nextTimeNote', 'toString'];
    const before = probe.map((field) => isTastingBodyField(field));
    for (let i = 0; i < 100; i += 1) probe.forEach((field) => isTastingBodyField(field));
    expect(probe.map((field) => isTastingBodyField(field))).toEqual(before);
    expect(before).toEqual([...TASTING_BODY_FIELDS.map(() => true), false, false, false, false, false]);
  });

  it('the module holds no module-level let or var, and never changes the tasting field set', () => {
    const source = readFileSync(new URL('./recordDraft.js', import.meta.url), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    expect(source).not.toMatch(/^(let|var)\s/m);
    expect(source).not.toMatch(/TASTING_BODY_FIELD_KEYS\.(add|delete|clear)/);
  });
});
