// 04-09: the kept draft's record, its builder and the check that decides
// whether a stored draft still fits the version it was kept on. Runs under
// Vitest's node environment: draft.js is pure.
import { describe, it, expect } from 'vitest';
import {
  DRAFT_SHAPE_VERSION,
  RECORD_DRAFT_KEYS,
  CREATE_DRAFT_KEYS,
  blankCreateDraft,
  buildDraftRecord,
  draftMatchesCreate,
  draftMatchesVersion,
  isCreateDraftDirty,
  newestDraft,
} from './draft.js';
import { isScaleDefinition } from './catalog.js';
import { nextStepKey } from './stepKeys.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';
import { SEGMENT_OPTIONS, MARK_ONE_OPTIONS, DEFECTS } from './battery.js';
import { removePenNote, setPenNoteText } from './penDraft.js';

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

describe("draftMatchesVersion: a plan draft's noteOrigins", () => {
  const LIST = 'beforeYouStart';
  const fits = (payload) => draftMatchesVersion(structuredClone(planRecord({ payload })), oliveOilVersion, []);
  // One note left (the version's second), so its noteOrigins is { beforeYouStart: [1] }.
  const onlyOneNote = () => removePenNote(planPayload(), LIST, 0);

  it('refuses the reported [99] draft, which the pen could not edit', () => {
    const payload = { ...onlyOneNote(), noteOrigins: { [LIST]: [99] } };
    expect(() => setPenNoteText(payload, oliveOilVersion, LIST, 0, 'Something else')).toThrow(TypeError);
    expect(fits(payload)).toBe(false);
  });

  it('accepts the draft the pen writes after one removal, and the pen can edit it', () => {
    const payload = onlyOneNote();
    expect(payload.noteOrigins).toEqual({ [LIST]: [1] });
    const record = structuredClone(planRecord({ payload }));
    expect(draftMatchesVersion(record, oliveOilVersion, [])).toBe(true);
    expect(() => setPenNoteText(record.payload, oliveOilVersion, LIST, 0, 'Something else')).not.toThrow();
  });

  it('refuses a list the version does not hold as its own array', () => {
    expect(fits({ ...onlyOneNote(), noteOrigins: { [LIST]: [1], carriedForward: [0] } })).toBe(false);
    expect(fits({ ...onlyOneNote(), noteOrigins: { [LIST]: [1], toString: [0] } })).toBe(false);
    expect(fits({ ...planPayload(), noteOrigins: { carriedForward: [] } })).toBe(false);
  });

  it('refuses a noteOrigins that is not a plain object', () => {
    for (const bad of [null, [1], 'beforeYouStart']) {
      expect(fits({ ...onlyOneNote(), noteOrigins: bad })).toBe(false);
    }
  });

  it('refuses a list value that is not an array', () => {
    for (const bad of [1, { 0: 1 }]) {
      expect(fits({ ...onlyOneNote(), noteOrigins: { [LIST]: bad } })).toBe(false);
    }
  });

  it('refuses an origin that is not an integer inside the version list, a hole included', () => {
    // The version holds two notes, so 2 is the first index past the end.
    for (const bad of [-1, 1.5, '1', null, NaN, 2]) {
      expect(fits({ ...onlyOneNote(), noteOrigins: { [LIST]: [bad] } })).toBe(false);
    }
    expect(fits({ ...onlyOneNote(), noteOrigins: { [LIST]: new Array(1) } })).toBe(false);
  });

  it("refuses an origins array whose length differs from the draft's list", () => {
    expect(fits({ ...planPayload(), noteOrigins: { [LIST]: [0] } })).toBe(false);
    expect(fits({ ...onlyOneNote(), noteOrigins: { [LIST]: [0, 1] } })).toBe(false);
  });

  it('accepts every draft the pen writes: the low boundary, all notes removed, a removal then an edit', () => {
    const lowBoundary = removePenNote(planPayload(), LIST, 1);
    expect(lowBoundary.noteOrigins).toEqual({ [LIST]: [0] });
    expect(fits(lowBoundary)).toBe(true);

    const allRemoved = removePenNote(onlyOneNote(), LIST, 0);
    expect(allRemoved.authored[LIST]).toEqual([]);
    expect(allRemoved.noteOrigins).toEqual({ [LIST]: [] });
    expect(fits(allRemoved)).toBe(true);

    const edited = setPenNoteText(onlyOneNote(), oliveOilVersion, LIST, 0, 'Something else');
    expect(edited.noteOrigins).toEqual({ [LIST]: [1] });
    expect(fits(edited)).toBe(true);
  });
});

describe('draftMatchesVersion: a record draft', () => {
  it('accepts a blank-shaped record draft with ink in it', () => {
    expect(draftMatchesVersion(recordRecord(), oliveOilVersion, [])).toBe(true);
  });

  it('accepts as-made values and marks that name the version’s own rows and the version’s axes', () => {
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

// WR-04: the draft's values must be ones the pen offers and Save could store,
// so a restored pen can never write a batch the import check refuses.
describe('draftMatchesVersion: values Save could store (WR-04)', () => {
  // Olive oil declares Body and Oil and the problem Bitter; this clone declares none.
  const bareVersion = { ...structuredClone(oliveOilVersion), declaredAxes: [], declaredFlaws: [] };

  it('accepts each word the pen offers, a declared problem and marks on declared axes', () => {
    for (const [field, options] of Object.entries(SEGMENT_OPTIONS)) {
      for (const word of options) {
        expect(draftMatchesVersion(recordRecord({ [field]: word }), oliveOilVersion, [])).toBe(true);
      }
    }
    for (const word of MARK_ONE_OPTIONS) {
      expect(draftMatchesVersion(recordRecord({ atDraw: word }), oliveOilVersion, [])).toBe(true);
      expect(draftMatchesVersion(recordRecord({ fromFreezer: word }), oliveOilVersion, [])).toBe(true);
    }
    expect(draftMatchesVersion(recordRecord({ defects: [DEFECTS[0]] }), oliveOilVersion, [])).toBe(true);
    expect(draftMatchesVersion(recordRecord({ declaredDefects: ['Bitter'] }), oliveOilVersion, [])).toBe(true);
    expect(draftMatchesVersion(recordRecord({ marks: { body: 2, oil: 4 } }), oliveOilVersion, [])).toBe(true);
  });

  it('refuses a word the pen does not offer in any of the five choice fields', () => {
    const refused = [
      { exitConsistency: 'garbage' },
      { airiness: 'fluffy' },
      { meltStyle: 'runny' },
      { atDraw: 'See below' },
      { fromFreezer: 'maybe' },
    ];
    for (const overrides of refused) {
      expect(draftMatchesVersion(recordRecord(overrides), oliveOilVersion, [])).toBe(false);
    }
  });

  it('refuses a defect chip that is not one of the four, an undeclared problem, or a problem twice', () => {
    expect(draftMatchesVersion(recordRecord({ defects: ['whatever'] }), oliveOilVersion, [])).toBe(false);
    expect(draftMatchesVersion(recordRecord({ declaredDefects: ['NotDeclared'] }), oliveOilVersion, [])).toBe(false);
    expect(draftMatchesVersion(recordRecord({ declaredDefects: ['Bitter', 'Bitter'] }), oliveOilVersion, [])).toBe(false);
  });

  it('refuses the review’s reproduction on a version that declares no axis and no problem', () => {
    const record = buildDraftRecord({
      versionId: bareVersion.id,
      kind: 'record',
      payload: {
        ...blankRecord(),
        declaredDefects: ['NotDeclared'],
        marks: { oil: 3 },
        exitConsistency: 'garbage',
        defects: ['whatever'],
      },
      now: NOW,
    });
    expect(draftMatchesVersion(record, bareVersion, [])).toBe(false);
  });

  it('refuses a mark on an axis the version does not declare, and keeps a core axis', () => {
    const oilOnly = (version) =>
      buildDraftRecord({ versionId: version.id, kind: 'record', payload: { ...blankRecord(), marks: { oil: 3 } }, now: NOW });
    const hardnessOnly = buildDraftRecord({
      versionId: bareVersion.id,
      kind: 'record',
      payload: { ...blankRecord(), marks: { hardness: 3 } },
      now: NOW,
    });
    expect(draftMatchesVersion(oilOnly(bareVersion), bareVersion, [])).toBe(false);
    expect(draftMatchesVersion(hardnessOnly, bareVersion, [])).toBe(true);
  });

  it('reads a Correct draft against the corrected batch’s snapshot, not the live version', () => {
    const values = { declaredDefects: ['Bitter'], marks: { oil: 3 } };
    const correct = amendRecord({
      versionId: bareVersion.id,
      payload: { ...blankRecord(), churnDate: '2026-08-02', ...values },
    });
    expect(draftMatchesVersion(correct, bareVersion, batches)).toBe(true);

    const asRecord = buildDraftRecord({
      versionId: bareVersion.id,
      kind: 'record',
      payload: { ...blankRecord(), ...values },
      now: NOW,
    });
    expect(draftMatchesVersion(asRecord, bareVersion, [])).toBe(false);
  });

  // The fit check reads a version's declared keys from the definitions themselves
  // and keeps the core keys beside them (plan 09-08, until plan 09-15 passes the catalog).
  it('fits a record draft marking only a core scale, only a declared scale, or both', () => {
    expect(draftMatchesVersion(recordRecord({ marks: { sweetness: 3 } }), oliveOilVersion, [])).toBe(true);
    expect(draftMatchesVersion(recordRecord({ marks: { oil: 4 } }), oliveOilVersion, [])).toBe(true);
    expect(draftMatchesVersion(recordRecord({ marks: { hardness: 2, body: 5 } }), oliveOilVersion, [])).toBe(true);
  });

  it('refuses a mark on "mystery", and a mark on "body" for a version that declares no scales', () => {
    expect(draftMatchesVersion(recordRecord({ marks: { mystery: 3 } }), oliveOilVersion, [])).toBe(false);
    const bodyOnBare = buildDraftRecord({
      versionId: bareVersion.id,
      kind: 'record',
      payload: { ...blankRecord(), marks: { body: 3 } },
      now: NOW,
    });
    expect(draftMatchesVersion(bodyOnBare, bareVersion, [])).toBe(false);
  });

  it('reads a Correct draft against the snapshot: a declared key only the live version holds does not fit', () => {
    const [body] = oliveOilVersion.declaredAxes;
    const bodyOnlyBatch = { ...structuredClone(augustSecondBatch), snapshot: { ...structuredClone(augustSecondBatch.snapshot), declaredAxes: [body] } };
    const correct = (marks) => amendRecord({ payload: { ...blankRecord(), churnDate: '2026-08-02', marks } });
    expect(draftMatchesVersion(correct({ body: 3 }), oliveOilVersion, [bodyOnlyBatch])).toBe(true);
    expect(draftMatchesVersion(correct({ oil: 3 }), oliveOilVersion, [bodyOnlyBatch])).toBe(false);
  });

  it('does not throw, and refuses, a Correct draft ticking a problem on a batch with no snapshot', () => {
    const noSnapshot = { ...augustSecondBatch };
    delete noSnapshot.snapshot;
    const correct = amendRecord({ payload: { ...blankRecord(), churnDate: '2026-08-02', declaredDefects: ['Bitter'] } });
    expect(() => draftMatchesVersion(correct, oliveOilVersion, [noSnapshot])).not.toThrow();
    expect(draftMatchesVersion(correct, oliveOilVersion, [noSnapshot])).toBe(false);
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

// Phase 9 plan 04 (D-18): the create kind. A create draft is a whole first
// version as typed, kept before any version exists, so its check takes no
// version and no batches.
function createRecord(payloadOverrides = {}, recordOverrides = {}) {
  return {
    ...buildDraftRecord({
      versionId: 'v-new',
      kind: 'create',
      payload: { recipeId: 'r-new', versionId: 'v-new', name: 'Lemon', ...payloadOverrides },
      now: NOW,
    }),
    ...recordOverrides,
  };
}

// The half-made scale draft: a name, no words yet, no kind yet.
const HALF_SCALE = { key: 'scale-a', name: 'Bo', low: '', high: '', kind: '', group: 'declared' };

describe('draftMatchesCreate: what a first version holds as typed (D-18)', () => {
  it('accepts a payload holding only recipeId, versionId and a name', () => {
    expect(draftMatchesCreate(createRecord())).toBe(true);
  });

  it('accepts blankCreateDraft with a name, and with the picked style’s serve temperature as typed text', () => {
    const blank = blankCreateDraft({ recipeId: 'r-new', versionId: 'v-new', name: 'Lemon' });
    expect(draftMatchesCreate(createRecord(blank))).toBe(true);
    expect(draftMatchesCreate(createRecord({ ...blank, serveTempC: '-12.5' }))).toBe(true);
  });

  it('accepts a full first version: rows, portions, method, notes, scales, problems, style and targets', () => {
    const payload = {
      ...blankCreateDraft({ recipeId: 'r-new', versionId: 'v-new', name: 'Lemon' }),
      description: 'Bright',
      beforeYouStart: [{ text: 'Chill the base' }],
      rows: [{ id: 'row-1', libraryId: 'whole-milk', portions: [{ step: 1, grams: '250' }] }],
      method: [{ n: 1, leadIn: 'Heat', instruction: 'Warm the milk', uses: ['row-1'], targets: [{ label: 'Temp', value: '60' }] }],
      scales: [{ key: 'scale-a', name: 'Tang', low: 'flat', high: 'sharp', kind: 'goldilocks', group: 'declared' }],
      problems: ['icy', 'greasy'],
      style: 'gelato',
      targets: { fat: ['6', '9'] },
      serveTempC: '-14',
    };
    expect(draftMatchesCreate(createRecord(payload))).toBe(true);
  });

  it('refuses a record of another shape version, kind, or a mismatched versionId', () => {
    expect(draftMatchesCreate(createRecord({}, { shapeVersion: 99 }))).toBe(false);
    expect(draftMatchesCreate(createRecord({}, { kind: 'plan' }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ versionId: 'other' }))).toBe(false);
    expect(draftMatchesCreate(createRecord({}, { versionId: '' }))).toBe(false);
    expect(draftMatchesCreate(createRecord({}, { updatedAt: 5 }))).toBe(false);
    expect(draftMatchesCreate(null)).toBe(false);
  });

  it('refuses a missing name, an unknown key, and an empty recipeId', () => {
    const noName = createRecord();
    delete noName.payload.name;
    expect(draftMatchesCreate(noName)).toBe(false);
    expect(draftMatchesCreate(createRecord({ colour: 'red' }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ recipeId: '' }))).toBe(false);
  });

  it('refuses an unsafe key anywhere in the record, however deep (T-09-08)', () => {
    // Every other field check passes here, so only the unsafe-key scan can refuse it.
    const unsafeStep = { n: 1, leadIn: '', instruction: '', targets: [JSON.parse('{"label":"x","__proto__":1}')] };
    expect(draftMatchesCreate(createRecord({ method: [unsafeStep] }))).toBe(false);
    const safeStep = { n: 1, leadIn: '', instruction: '', targets: [{ label: 'x' }] };
    expect(draftMatchesCreate(createRecord({ method: [safeStep] }))).toBe(true);
    const record = createRecord();
    record.payload = JSON.parse('{"recipeId":"r-new","versionId":"v-new","name":"Lemon","targets":{"__proto__":{"a":1}}}');
    expect(draftMatchesCreate(record)).toBe(false);
  });

  it('refuses three scales, a scale of kind stars, group core, or key __proto__, and two scales with one key', () => {
    const scale = (key, overrides = {}) => ({ ...HALF_SCALE, key, ...overrides });
    expect(draftMatchesCreate(createRecord({ scales: [scale('a'), scale('b'), scale('c')] }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ scales: [scale('a', { kind: 'stars' })] }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ scales: [scale('a', { group: 'core' })] }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ scales: [scale('__proto__')] }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ scales: [scale('a'), scale('a')] }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ scales: [{ ...HALF_SCALE, extra: 1 }] }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ scales: [scale('')] }))).toBe(false);
  });

  it('refuses a serveTempC that is a number rather than typed text', () => {
    expect(draftMatchesCreate(createRecord({ serveTempC: -14 }))).toBe(false);
  });

  it('refuses a machine key and a process key: the editor authors neither (round 3)', () => {
    expect(draftMatchesCreate(createRecord({ machine: { name: 'Whynter', minFillG: 700, maxFillG: null } }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ process: { pasteuriseC: '69' } }))).toBe(false);
  });

  it('refuses a portion whose step is 0, a method step without an n, and three problems', () => {
    const row = (portions) => [{ id: 'row-1', libraryId: 'whole-milk', portions }];
    expect(draftMatchesCreate(createRecord({ rows: row([{ step: 0, grams: '1' }]) }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ rows: row([{ step: 1.5, grams: '1' }]) }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ rows: row([{ step: 1, grams: 1 }]) }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ rows: row([{ step: 1, grams: '1' }, { step: 1, grams: '2' }]) }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ method: [{ leadIn: 'a', instruction: 'b' }] }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ problems: ['a', 'b', 'c'] }))).toBe(false);
  });

  it('refuses a reserved or repeated row id and an unsafe libraryId', () => {
    const base = { id: 'row-1', libraryId: 'whole-milk', portions: [] };
    expect(draftMatchesCreate(createRecord({ rows: [base] }))).toBe(true);
    expect(draftMatchesCreate(createRecord({ rows: [{ ...base, id: '__proto__' }] }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ rows: [{ ...base, id: '' }] }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ rows: [base, { ...base }] }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ rows: [{ ...base, libraryId: 'prototype' }] }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ rows: [{ ...base, libraryId: '' }] }))).toBe(false);
  });

  it('refuses targets with an unknown band, a band of the wrong size, or a non-text value', () => {
    expect(draftMatchesCreate(createRecord({ targets: { fat: ['1', '2'] } }))).toBe(true);
    expect(draftMatchesCreate(createRecord({ targets: { colour: ['1', '2'] } }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ targets: { fat: ['1'] } }))).toBe(false);
    expect(draftMatchesCreate(createRecord({ targets: { fat: [1, 2] } }))).toBe(false);
  });

  it('accepts a half-made draft that saved-record validity would refuse', () => {
    const payload = {
      ...blankCreateDraft({ recipeId: 'r-new', versionId: 'v-new', name: 'Lemon' }),
      scales: [HALF_SCALE],
      problems: ['', ''],
      rows: [{ id: 'row-1', libraryId: 'whole-milk', portions: [{ step: 1, grams: '12.' }] }],
      method: [],
    };
    expect(draftMatchesCreate(createRecord(payload))).toBe(true);
    // A step whose uses names a row the rows lack still fits.
    const withStep = { ...payload, method: [{ n: 1, leadIn: '', instruction: '', uses: ['row-gone'] }] };
    expect(draftMatchesCreate(createRecord(withStep))).toBe(true);
    // Draft acceptance and saved validity are two checks.
    expect(isScaleDefinition(HALF_SCALE)).toBe(false);
  });

  it('keeps the method as its own issued-key ledger: a removed step fits and a non-boolean removed does not', () => {
    const step = (n, extra = {}) => ({ n, leadIn: '', instruction: `step ${n}`, ...extra });
    const ledger = [step(1), step(2), step(3, { removed: true })];
    expect(draftMatchesCreate(createRecord({ method: ledger }))).toBe(true);
    expect(draftMatchesCreate(createRecord({ method: [step(1, { removed: 'yes' })] }))).toBe(false);
    expect(nextStepKey(ledger)).toBe(4);
  });

  it('is not draftMatchesVersion’s kind: a create record fails it even with a version of the same id', () => {
    const record = createRecord({ versionId: oliveOilVersion.id }, { versionId: oliveOilVersion.id });
    expect(draftMatchesCreate(record)).toBe(true);
    expect(draftMatchesVersion(record, oliveOilVersion, [])).toBe(false);
  });
});

describe('blankCreateDraft and isCreateDraftDirty (D-19, MAKE-05)', () => {
  const blank = (name = '') => blankCreateDraft({ recipeId: 'r-new', versionId: 'v-new', name });

  it('starts with Version name "Version 1", every list empty, no style, no targets and no serve temperature', () => {
    expect(blank('Lemon')).toEqual({
      recipeId: 'r-new',
      versionId: 'v-new',
      name: 'Lemon',
      description: '',
      versionLabel: 'Version 1',
      beforeYouStart: [],
      rows: [],
      method: [],
      scales: [],
      problems: [],
      style: null,
      targets: {},
      serveTempC: '',
    });
  });

  it('is clean for the blank draft, a trimmed Version 1, and a blank serve temperature', () => {
    expect(isCreateDraftDirty(blank())).toBe(false);
    expect(isCreateDraftDirty({ ...blank(), versionLabel: 'Version 1 ' })).toBe(false);
    expect(isCreateDraftDirty({ ...blank(), serveTempC: '  ' })).toBe(false);
    expect(isCreateDraftDirty({ ...blank(), name: '   ' })).toBe(false);
  });

  it('reads an absent optional field as its blank value', () => {
    expect(isCreateDraftDirty({ recipeId: 'r-new', versionId: 'v-new', name: '' })).toBe(false);
    expect(isCreateDraftDirty({ recipeId: 'r-new', versionId: 'v-new', name: 'Lemon' })).toBe(true);
  });

  it('is dirty once any field departs from the blank draft', () => {
    expect(isCreateDraftDirty({ ...blank(), name: 'Lemon' })).toBe(true);
    expect(isCreateDraftDirty({ ...blank(), description: 'Bright' })).toBe(true);
    expect(isCreateDraftDirty({ ...blank(), versionLabel: 'Version 2' })).toBe(true);
    expect(isCreateDraftDirty({ ...blank(), versionLabel: '' })).toBe(true);
    expect(isCreateDraftDirty({ ...blank(), beforeYouStart: [{ text: '' }] })).toBe(true);
    expect(isCreateDraftDirty({ ...blank(), rows: [{ id: 'r', libraryId: 'x', portions: [] }] })).toBe(true);
    expect(isCreateDraftDirty({ ...blank(), method: [{ n: 1, leadIn: '', instruction: '' }] })).toBe(true);
    expect(isCreateDraftDirty({ ...blank(), scales: [HALF_SCALE] })).toBe(true);
    expect(isCreateDraftDirty({ ...blank(), problems: [''] })).toBe(true);
    expect(isCreateDraftDirty({ ...blank(), style: 'gelato' })).toBe(true);
    expect(isCreateDraftDirty({ ...blank(), targets: { fat: ['', '12'] } })).toBe(true);
    expect(isCreateDraftDirty({ ...blank(), serveTempC: '-14' })).toBe(true);
  });
});

describe('CREATE_DRAFT_KEYS', () => {
  // Round 3 (Mark, 2026-10-18, before any create draft existed): serveTempC
  // joined (D-19) and machine and process left (the creation editor authors
  // neither). A key changes only by Mark's decision from here on: a renamed,
  // removed or newly required key, or a narrowed check, deletes the drafts
  // kept before it at their next restore, while a new optional key keeps them
  // fitting. The three lists below must stay equal.
  const PAYLOAD_CONTRACT = [
    'beforeYouStart',
    'description',
    'method',
    'name',
    'problems',
    'recipeId',
    'rows',
    'scales',
    'serveTempC',
    'style',
    'targets',
    'versionId',
    'versionLabel',
  ];

  it('equals blankCreateDraft’s keys and the payload contract’s thirteen names', () => {
    const blankKeys = Object.keys(blankCreateDraft({ recipeId: 'r-new', versionId: 'v-new', name: '' })).sort();
    expect([...CREATE_DRAFT_KEYS].sort()).toEqual(blankKeys);
    expect(blankKeys).toEqual(PAYLOAD_CONTRACT);
    expect(PAYLOAD_CONTRACT).toHaveLength(13);
  });

  it('holds no name twice and neither machine nor process', () => {
    expect(new Set(CREATE_DRAFT_KEYS).size).toBe(CREATE_DRAFT_KEYS.length);
    expect(CREATE_DRAFT_KEYS).not.toContain('machine');
    expect(CREATE_DRAFT_KEYS).not.toContain('process');
  });
});
