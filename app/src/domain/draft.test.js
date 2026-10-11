// 04-09: the kept draft's record, its builder and the check that decides
// whether a stored draft still fits the version it was kept on. Runs under
// Vitest's node environment: draft.js is pure.
import { describe, it, expect } from 'vitest';
import {
  DRAFT_SHAPE_VERSION,
  RECORD_DRAFT_KEYS,
  buildDraftRecord,
  draftMatchesVersion,
  newestDraft,
} from './draft.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

const NOW = '2026-10-11T09:00:00.000Z';

// What handleStartDeveloping builds, written out so this domain test needs no
// component: one entry per row id, one line per portion, grams a string.
function planPayload(version = oliveOilVersion) {
  return {
    versionLabel: 'less oil',
    reason: '',
    citedBatchId: null,
    sheetTitle: version.sheetTitle,
    sheetDescription: version.sheetDescription,
    rows: Object.fromEntries(
      version.rows.map((row) => [
        row.id,
        { portions: row.portions.map((portion) => ({ step: portion.step, grams: String(portion.grams), removed: false })) },
      ]),
    ),
    method: structuredClone(version.method),
    authored: structuredClone(version.authored),
  };
}

// The blank record draft's own values, one per RECORD_DRAFT_KEYS entry.
function blankRecord() {
  return {
    churnDate: '',
    asMade: {},
    stepChanges: {},
    outOfMachineTempC: '',
    churnDurationMinutes: '',
    exitConsistency: '',
    airiness: '',
    atDraw: '',
    atTheMachine: '',
    ingredientNotes: '',
    nextTimeNote: '',
    tastingOpen: false,
    tastedDate: '',
    temperingMinutes: '',
    tastingTempC: '',
    marks: {},
    note: '',
    defects: [],
    declaredDefects: [],
    fromFreezer: '',
    meltTestG: '',
    meltStyle: '',
  };
}

function planRecord(overrides = {}) {
  return buildDraftRecord({
    versionId: oliveOilVersion.id,
    kind: 'plan',
    payload: planPayload(),
    penOpenedAt: '2026-10-11T08:00:00.000Z',
    now: NOW,
    ...overrides,
  });
}

function recordRecord(payloadOverrides = {}) {
  return buildDraftRecord({
    versionId: oliveOilVersion.id,
    kind: 'record',
    payload: { ...blankRecord(), churnDate: '2026-10-11', ...payloadOverrides },
    now: NOW,
  });
}

function amendRecord(overrides = {}) {
  const baseline = { ...blankRecord(), churnDate: '2026-08-02' };
  return buildDraftRecord({
    versionId: oliveOilVersion.id,
    kind: 'amend',
    payload: { ...baseline, note: 'a little firmer than I wrote' },
    amendingBatchId: augustSecondBatch.id,
    amendBaseline: baseline,
    amendOpener: 'correct',
    now: NOW,
    ...overrides,
  });
}

const batches = [augustSecondBatch];

describe('RECORD_DRAFT_KEYS', () => {
  it('lists the record draft fields once each', () => {
    expect(new Set(RECORD_DRAFT_KEYS).size).toBe(RECORD_DRAFT_KEYS.length);
    expect(RECORD_DRAFT_KEYS).toContain('churnDate');
    expect(RECORD_DRAFT_KEYS).toContain('tastingOpen');
    expect(RECORD_DRAFT_KEYS).toContain('meltStyle');
    expect(Object.keys(blankRecord()).sort()).toEqual([...RECORD_DRAFT_KEYS].sort());
  });
});

describe('buildDraftRecord', () => {
  it('returns the nine fields of the record', () => {
    const record = planRecord();
    expect(Object.keys(record).sort()).toEqual(
      ['amendBaseline', 'amendOpener', 'amendingBatchId', 'kind', 'payload', 'penOpenedAt', 'shapeVersion', 'updatedAt', 'versionId'].sort(),
    );
    expect(record.shapeVersion).toBe(DRAFT_SHAPE_VERSION);
    expect(record.updatedAt).toBe(NOW);
    expect(record.amendingBatchId).toBeNull();
    expect(record.amendBaseline).toBeNull();
  });

  it('clones the payload and the baseline, so a later edit never reaches the record', () => {
    const payload = planPayload();
    const baseline = { ...blankRecord() };
    const record = buildDraftRecord({ versionId: 'v', kind: 'amend', payload, amendBaseline: baseline, now: NOW });
    payload.versionLabel = 'changed after';
    baseline.note = 'changed after';
    expect(record.payload.versionLabel).toBe('less oil');
    expect(record.amendBaseline.note).toBe('');
  });
});

describe('newestDraft', () => {
  it('returns the greatest updatedAt, and null for none', () => {
    const older = { versionId: 'a', updatedAt: '2026-10-10T08:00:00.000Z' };
    const newer = { versionId: 'b', updatedAt: '2026-10-11T08:00:00.000Z' };
    expect(newestDraft([older, newer])).toBe(newer);
    expect(newestDraft([newer, older])).toBe(newer);
    expect(newestDraft([])).toBeNull();
  });
});

describe('draftMatchesVersion: a plan draft', () => {
  it('accepts a draft built from the version itself', () => {
    expect(draftMatchesVersion(planRecord(), oliveOilVersion, [])).toBe(true);
  });

  it('refuses a draft of another shape version, another kind or another version', () => {
    expect(draftMatchesVersion({ ...planRecord(), shapeVersion: 2 }, oliveOilVersion, [])).toBe(false);
    expect(draftMatchesVersion({ ...planRecord(), kind: 'tasting' }, oliveOilVersion, [])).toBe(false);
    expect(draftMatchesVersion({ ...planRecord(), versionId: 'someone-else' }, oliveOilVersion, [])).toBe(false);
    expect(draftMatchesVersion(null, oliveOilVersion, [])).toBe(false);
  });

  it('refuses a draft whose row ids no longer match the version', () => {
    const record = planRecord();
    const [firstId] = Object.keys(record.payload.rows);
    record.payload.rows['row-renamed'] = record.payload.rows[firstId];
    delete record.payload.rows[firstId];
    expect(draftMatchesVersion(record, oliveOilVersion, [])).toBe(false);

    const extra = planRecord();
    extra.payload.rows['row-extra'] = { portions: [{ step: 1, grams: '1', removed: false }] };
    expect(draftMatchesVersion(extra, oliveOilVersion, [])).toBe(false);
  });

  it('refuses a draft whose line count differs from a row, or whose grams is not a string', () => {
    const fewer = planRecord();
    fewer.payload.rows['row-01'].portions.pop();
    expect(draftMatchesVersion(fewer, oliveOilVersion, [])).toBe(false);

    const numeric = planRecord();
    numeric.payload.rows['row-01'].portions[0].grams = 120;
    expect(draftMatchesVersion(numeric, oliveOilVersion, [])).toBe(false);
  });

  it('refuses a draft whose steps differ from the version, or whose notes are not { text }', () => {
    const missingStep = planRecord();
    missingStep.payload.method.pop();
    expect(draftMatchesVersion(missingStep, oliveOilVersion, [])).toBe(false);

    const renumbered = planRecord();
    renumbered.payload.method[0].n = 99;
    expect(draftMatchesVersion(renumbered, oliveOilVersion, [])).toBe(false);

    const badNote = planRecord();
    badNote.payload.authored.beforeYouStart = [{ words: 'no text key' }];
    expect(draftMatchesVersion(badNote, oliveOilVersion, [])).toBe(false);

    const noList = planRecord();
    noList.payload.authored = {};
    expect(draftMatchesVersion(noList, oliveOilVersion, [])).toBe(false);
  });

  it('refuses a draft whose text fields are not strings', () => {
    const record = planRecord();
    record.payload.versionLabel = 7;
    expect(draftMatchesVersion(record, oliveOilVersion, [])).toBe(false);
  });
});

describe('draftMatchesVersion: a record draft', () => {
  it('accepts a blank-shaped record draft with ink in it', () => {
    expect(draftMatchesVersion(recordRecord(), oliveOilVersion, [])).toBe(true);
  });

  it('accepts as-made values and marks that name the version’s own rows and the six axes', () => {
    const record = recordRecord({ asMade: { 'row-01': ['120', ''] }, marks: { hardness: 3, oil: 4 } });
    expect(draftMatchesVersion(record, oliveOilVersion, [])).toBe(true);
  });

  it('refuses a missing field, an extra field or a field of the wrong type', () => {
    const missing = recordRecord();
    delete missing.payload.meltStyle;
    expect(draftMatchesVersion(missing, oliveOilVersion, [])).toBe(false);

    const extra = recordRecord();
    extra.payload.surprise = 'x';
    expect(draftMatchesVersion(extra, oliveOilVersion, [])).toBe(false);

    expect(draftMatchesVersion(recordRecord({ tastingOpen: 'yes' }), oliveOilVersion, [])).toBe(false);
    expect(draftMatchesVersion(recordRecord({ defects: 'icy' }), oliveOilVersion, [])).toBe(false);
    expect(draftMatchesVersion(recordRecord({ churnDate: 20261011 }), oliveOilVersion, [])).toBe(false);
  });

  it('refuses as-made for a row the version lacks, or an array longer than the row’s lines', () => {
    expect(draftMatchesVersion(recordRecord({ asMade: { 'row-missing': ['1'] } }), oliveOilVersion, [])).toBe(false);
    expect(draftMatchesVersion(recordRecord({ asMade: { 'row-02': ['1', '2'] } }), oliveOilVersion, [])).toBe(false);
    expect(draftMatchesVersion(recordRecord({ asMade: { 'row-01': [120] } }), oliveOilVersion, [])).toBe(false);
  });

  it('refuses a mark for an axis that does not exist, or a stop outside 1 to 5', () => {
    expect(draftMatchesVersion(recordRecord({ marks: { flavour: 3 } }), oliveOilVersion, [])).toBe(false);
    expect(draftMatchesVersion(recordRecord({ marks: { hardness: 9 } }), oliveOilVersion, [])).toBe(false);
  });

  it('refuses a record draft that names a batch', () => {
    const record = recordRecord();
    record.amendingBatchId = augustSecondBatch.id;
    expect(draftMatchesVersion(record, oliveOilVersion, batches)).toBe(false);
  });
});

describe('draftMatchesVersion: an amend draft', () => {
  it('accepts a draft that names a batch of the version and carries a baseline', () => {
    expect(draftMatchesVersion(amendRecord(), oliveOilVersion, batches)).toBe(true);
  });

  it('refuses a draft naming a batch no longer in the store', () => {
    expect(draftMatchesVersion(amendRecord(), oliveOilVersion, [])).toBe(false);
    expect(draftMatchesVersion(amendRecord({ amendingBatchId: 'gone' }), oliveOilVersion, batches)).toBe(false);
  });

  it('refuses a draft with no baseline, a baseline of the wrong shape or an unknown opener', () => {
    expect(draftMatchesVersion(amendRecord({ amendBaseline: null }), oliveOilVersion, batches)).toBe(false);
    expect(draftMatchesVersion(amendRecord({ amendBaseline: { churnDate: '' } }), oliveOilVersion, batches)).toBe(false);
    expect(draftMatchesVersion(amendRecord({ amendOpener: 'somewhere' }), oliveOilVersion, batches)).toBe(false);
  });
});

describe('draftMatchesVersion: keys that reach a prototype (T-04-23)', () => {
  it('refuses an own __proto__ key anywhere in the record', () => {
    const payload = JSON.parse('{"__proto__": {"polluted": true}}');
    const record = recordRecord();
    record.payload.asMade = payload;
    expect(Object.prototype.hasOwnProperty.call(record.payload.asMade, '__proto__')).toBe(true);
    expect(draftMatchesVersion(record, oliveOilVersion, [])).toBe(false);
  });

  it('refuses a constructor or prototype key, however deep', () => {
    const nested = planRecord();
    nested.payload.method[0].targets = [{ label: 'x', value: 'y', constructor: 'z' }];
    expect(draftMatchesVersion(nested, oliveOilVersion, [])).toBe(false);

    const deeper = recordRecord();
    deeper.payload.stepChanges = { 1: { struck: false, line: null, prototype: {} } };
    expect(draftMatchesVersion(deeper, oliveOilVersion, [])).toBe(false);
  });

  it('does not loop on a cyclic stored value', () => {
    const record = planRecord();
    record.payload.method[0].targets = [{ label: 'a', value: 'b' }];
    record.payload.method[0].targets[0].self = record.payload.method[0].targets;
    expect(() => draftMatchesVersion(record, oliveOilVersion, [])).not.toThrow();
  });
});
