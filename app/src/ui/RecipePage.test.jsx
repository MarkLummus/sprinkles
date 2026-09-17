// The one-pen interlock's own unit tests (D-10, D-UAT-1): derivePenState is
// the single derivation every opener in BatchMargin and Versions now reads
// (Develop moved from Headnote into Versions, 03.1-CONTEXT.md D-04 to
// D-06), replacing the two unrelated states (`mode`, `tastingDraft`) each
// control used to hand-roll its own subset of. The tasting pen retires
// with 03.3.1-02 (D-01/D-03): the derivation's own pens narrow to exactly
// three — plan, record, amend — and the tasting section folds into the
// one record draft behind a `tastingOpen` flag, tested below through the
// pure helpers this file exports rather than through a fourth pen state.
// This file renders nothing of RecipePage itself — it reads the
// repository at module load (D-06), so that import is stubbed here at the
// one seam it goes through, exactly as RecipeList.test.jsx already does.
// What this file DOES render, through renderToStaticMarkup
// (react-dom/server) in the existing node environment (no jsdom, no
// testing library, no click driver — the point is the derivation and the
// disabled/absent markup it feeds, not an interaction), is the pen matrix
// across the one component the derivation still reaches this way
// (VersionRow) — BatchRow's own coverage lives in BatchRow.test.jsx.
import { describe, it, expect, vi } from 'vitest';
vi.mock('../store/repository.js', () => ({ repository: {} }));
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import {
  derivePenState,
  isPenDraftDirty,
  isDraftDirty,
  draftFromBatch,
  tastingHasInk,
  tastingPayloadFromDraft,
  restoreDraftFromUndo,
  isTastingBodyField,
  parseAllMeasuredFields,
  validateRecordDraft,
  buildChurnFieldsFromDraft,
  buildTastingFieldsFromDraft,
  CHURN_DATE_BLOCKED_MESSAGE,
  CHURN_DATE_BLOCKED_STATUS,
  VERSION_BLOCKED_STATUS,
  MEASURED_INVALID_STATUS,
  TASTING_REMOVED_EMPTY_STATUS,
  TASTING_REMOVED_DATA_STATUS,
  TASTING_RESTORED_STATUS,
} from './RecipePage.jsx';
import { VersionRow } from './VersionRow.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';
import { createBatch, completeRecord } from '../domain/batch.js';
import { BATTERY_FIELDS } from '../domain/battery.js';

const noop = () => {};

describe('derivePenState — the one derivation of "a pen is open" (D-01/D-03: three pens, the tasting pen retired)', () => {
  it('reports the plan pen while developing', () => {
    const { openPen } = derivePenState({ mode: 'developing', amendingBatchId: null });
    expect(openPen).toBe('plan');
  });

  it('reports the record pen while recording with no amend target', () => {
    const { openPen } = derivePenState({ mode: 'recording', amendingBatchId: null });
    expect(openPen).toBe('record');
  });

  it('reports the amend pen while recording with an amend target', () => {
    const { openPen } = derivePenState({ mode: 'recording', amendingBatchId: 'batch-1' });
    expect(openPen).toBe('amend');
  });

  it('reports no pen open while reading with nothing in progress', () => {
    const { openPen, reason } = derivePenState({ mode: 'reading', amendingBatchId: null });
    expect(openPen).toBe(null);
    expect(reason).toBe(null);
  });

  it('gives each of the three open states its own distinct, non-empty reason', () => {
    const reasons = [
      derivePenState({ mode: 'developing', amendingBatchId: null }).reason,
      derivePenState({ mode: 'recording', amendingBatchId: null }).reason,
      derivePenState({ mode: 'recording', amendingBatchId: 'batch-1' }).reason,
    ];
    for (const reason of reasons) {
      expect(typeof reason).toBe('string');
      expect(reason.length).toBeGreaterThan(0);
    }
    expect(new Set(reasons).size).toBe(reasons.length);
  });

  // amendingBatchId can be left over from a prior amendment once mode
  // returns to 'reading' (handleCancelRecording clears it, but nothing else
  // asserts it stays clear) — this must never be read as an open amend pen.
  it('reports no pen open when amendingBatchId is stale but mode has returned to reading', () => {
    const { openPen, reason } = derivePenState({ mode: 'reading', amendingBatchId: 'batch-1' });
    expect(openPen).toBe(null);
    expect(reason).toBe(null);
  });
});

// The pen matrix, across the region openPen still reaches on VersionRow —
// every batch-side opener (Correct, Record another batch, Record a batch)
// lives in BatchRow (see BatchRow.test.jsx); VersionRow itself renders no
// Develop opener of any kind while any pen is open. Table-driven so the
// correspondence between a pen and the opener it hides reads as data, not
// as three hand-written near-duplicate tests.
const PEN_MATRIX = [
  { openPen: 'plan', reason: 'the plan is being developed' },
  { openPen: 'record', reason: 'a batch is being recorded' },
  { openPen: 'amend', reason: 'a batch is being amended' },
];

function renderVersionsReading(openPen, reason) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <VersionRow
        version={oliveOilVersion}
        versions={[oliveOilVersion]}
        mode="reading"
        penDraft={{ versionLabel: '', reason: '', citedBatchId: null, headnote: oliveOilVersion.headnote }}
        batches={[]}
        allBatches={[]}
        citedBatch={null}
        openPen={openPen}
        penReason={reason}
        canSaveOver={true}
        onStartDeveloping={noop}
        onCancelDeveloping={noop}
        onChangePenField={noop}
        onSaveAsNewVersion={noop}
        onSaveOverVersion={noop}
        onToggleShowChanges={noop}
      />
    </MemoryRouter>,
  );
}

describe('The pen matrix — Develop absent whenever any pen is open; every other opener\'s own coverage lives in VersionRow.test.jsx/BatchRow.test.jsx', () => {
  it.each(PEN_MATRIX)('with the $openPen pen open, Develop is absent from VersionRow', ({ openPen, reason }) => {
    const markup = renderVersionsReading(openPen, reason);
    expect(markup).not.toMatch(/<button[^>]*>Next version<\/button>/);
  });

  it('with no pen open, Develop renders', () => {
    const versions = renderVersionsReading(null, null);
    expect(versions).toMatch(/<button[^>]*>Next version<\/button>/);
  });
});

// 03-07 Task 2: both dirty checks corrected against the thing they should
// have been comparing against all along — the pen's over what it edits
// (T-03-42), the churn's against what it was filled from (T-03-43). Small
// hand-written fixtures, this file's existing style, exercised directly
// against the two exported check functions — no rendering needed.
function makeBaselineVersion(overrides = {}) {
  return {
    id: 'v1',
    recipeId: 'r1',
    headnote: 'Baseline headnote.',
    rows: [
      { id: 'row-1', portions: [{ step: 1, grams: 100 }], removed: false },
      { id: 'row-2', portions: [{ step: 2, grams: 50 }], removed: false },
    ],
    method: [
      {
        n: 1,
        leadIn: 'Lead in one',
        instruction: 'Instruction one',
        purpose: 'Purpose one',
        aside: 'Aside one',
        targets: [{ label: 'temp', value: '10 C' }],
        removed: false,
        uses: ['row-1'],
      },
      {
        n: 2,
        leadIn: 'Lead in two',
        instruction: 'Instruction two',
        targets: [],
        removed: false,
        uses: [],
      },
    ],
    authored: {
      carriedForward: [{ text: 'Carried note', inheritedFrom: null }],
      beforeYouStart: [{ text: 'Before note', inheritedFrom: null }],
    },
    ...overrides,
  };
}

// Mirrors handleStartDeveloping's own seeding exactly — a row's own
// portions mapped to { step, grams } with grams a string, method/authored
// a structuredClone — so "nothing touched" is genuinely the shape the pen
// opens with.
function makeCleanPenDraft(version) {
  const rows = {};
  for (const row of version.rows) {
    rows[row.id] = {
      portions: row.portions.map((portion) => ({ step: portion.step, grams: String(portion.grams) })),
      removed: row.removed ?? false,
    };
  }
  return {
    versionLabel: '',
    reason: '',
    citedBatchId: null,
    headnote: version.headnote,
    rows,
    method: structuredClone(version.method),
    authored: structuredClone(version.authored),
  };
}

describe('isPenDraftDirty — the pen check, over what it actually edits (T-03-42)', () => {
  const version = makeBaselineVersion();

  it('is not dirty when nothing has been touched', () => {
    expect(isPenDraftDirty('developing', makeCleanPenDraft(version), version)).toBe(false);
  });

  it('is dirty when a step lead-in changes, and clean again typed back', () => {
    const draft = makeCleanPenDraft(version);
    draft.method[0].leadIn = 'Changed lead-in';
    expect(isPenDraftDirty('developing', draft, version)).toBe(true);
    draft.method[0].leadIn = 'Lead in one';
    expect(isPenDraftDirty('developing', draft, version)).toBe(false);
  });

  it('is dirty when the headnote prose changes, and clean again typed back', () => {
    const draft = makeCleanPenDraft(version);
    draft.headnote = 'Changed headnote.';
    expect(isPenDraftDirty('developing', draft, version)).toBe(true);
    draft.headnote = 'Baseline headnote.';
    expect(isPenDraftDirty('developing', draft, version)).toBe(false);
  });

  it('the three the check already caught still work: a changed gram, a changed step allocation, a removed row', () => {
    const gramsDraft = makeCleanPenDraft(version);
    gramsDraft.rows['row-1'].portions[0].grams = '999';
    expect(isPenDraftDirty('developing', gramsDraft, version)).toBe(true);

    const stepDraft = makeCleanPenDraft(version);
    stepDraft.rows['row-1'].portions[0].step = 2;
    expect(isPenDraftDirty('developing', stepDraft, version)).toBe(true);

    const removedDraft = makeCleanPenDraft(version);
    removedDraft.rows['row-1'].removed = true;
    expect(isPenDraftDirty('developing', removedDraft, version)).toBe(true);
  });

  it('is never dirty when the mode is not developing, or when the version or the draft is absent', () => {
    const draft = makeCleanPenDraft(version);
    draft.headnote = 'Changed headnote.';
    expect(isPenDraftDirty('reading', draft, version)).toBe(false);
    expect(isPenDraftDirty('developing', null, version)).toBe(false);
    expect(isPenDraftDirty('developing', draft, null)).toBe(false);
  });
});

// blankRecordDraft's own shape, inlined here rather than imported (it is
// not exported — every caller of it lives inside RecipePage.jsx itself);
// every field named in the 03.3.1-02 artifacts list, so a fixture drift
// between this file and the module under test shows up as a failing
// isDraftDirty('recording', blank) assertion rather than silently testing
// the wrong shape.
function makeBlankRecordDraft() {
  return {
    churnDate: '',
    asMade: {},
    stepChanges: {},
    timeToDrawTempMinutes: '',
    outOfMachineTempC: '',
    churnDurationMinutes: '',
    exitConsistency: '',
    airiness: '',
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
    bitterDeclared: false,
    meltTestG: '',
    meltStyle: '',
  };
}

describe('isDraftDirty — the record pen\'s check, extended to every battery field (03.3.1-02 Task 1)', () => {
  it('a fresh recording draft with nothing typed is not dirty', () => {
    expect(isDraftDirty('recording', makeBlankRecordDraft())).toBe(false);
  });

  it('a fresh recording draft is dirty the instant any one churn field is typed', () => {
    expect(isDraftDirty('recording', { ...makeBlankRecordDraft(), atTheMachine: 'x' })).toBe(true);
  });

  it('an amend draft, pre-filled and untouched, is NOT dirty against its baseline', () => {
    const baseline = draftFromBatch(augustSecondBatch);
    const draft = structuredClone(baseline);
    expect(isDraftDirty('recording', draft, baseline)).toBe(false);
  });

  it('the same amend draft with one churn field changed IS dirty, and clean again changed back', () => {
    const baseline = draftFromBatch(augustSecondBatch);
    const draft = structuredClone(baseline);
    draft.atTheMachine = 'Different notes';
    expect(isDraftDirty('recording', draft, baseline)).toBe(true);
    draft.atTheMachine = baseline.atTheMachine;
    expect(isDraftDirty('recording', draft, baseline)).toBe(false);
  });

  it('is dirty when a field the batch had a value in is cleared — a deletion is ink too', () => {
    const baseline = draftFromBatch(augustSecondBatch);
    const draft = structuredClone(baseline);
    draft.atTheMachine = '';
    expect(isDraftDirty('recording', draft, baseline)).toBe(true);
  });

  it('a written zero counts: 0 where the baseline held nothing is dirty', () => {
    const baseline = makeBlankRecordDraft();
    const draft = { ...baseline, churnDurationMinutes: '0' };
    expect(isDraftDirty('recording', draft, baseline)).toBe(true);
  });

  it('an untouched open-but-empty tasting section (tastingOpen true, nothing else changed) is not dirty against its own baseline — Escape/Cancel close it as no ink (RESEARCH.md Open Question 4)', () => {
    const baseline = { ...makeBlankRecordDraft(), tastingOpen: true };
    const draft = structuredClone(baseline);
    expect(isDraftDirty('recording', draft, baseline)).toBe(false);
  });

  it('marks compare value-wise now that the axes are interactive (03.3.1-03 Task 2, a Rule 1 fix): the same value is clean, a changed value is dirty even with the same key count', () => {
    const baseline = { ...makeBlankRecordDraft(), marks: { hardness: 3 } };
    const sameValue = { ...makeBlankRecordDraft(), marks: { hardness: 3 } };
    expect(isDraftDirty('recording', sameValue, baseline)).toBe(false);
    const changedValue = { ...makeBlankRecordDraft(), marks: { hardness: 4 } };
    expect(isDraftDirty('recording', changedValue, baseline)).toBe(true);
  });

  it('defects compare set-wise now that the chips are interactive (03.3.1-03 Task 3, a Rule 1 fix): the same set is clean, a swapped defect at the same count is dirty', () => {
    const baseline = { ...makeBlankRecordDraft(), defects: ['Coarse, icy'] };
    const sameSet = { ...makeBlankRecordDraft(), defects: ['Coarse, icy'] };
    expect(isDraftDirty('recording', sameSet, baseline)).toBe(false);
    const differentCount = { ...makeBlankRecordDraft(), defects: [] };
    expect(isDraftDirty('recording', differentCount, baseline)).toBe(true);
    const swappedSameCount = { ...makeBlankRecordDraft(), defects: ['Sandy, gritty'] };
    expect(isDraftDirty('recording', swappedSameCount, baseline)).toBe(true);
  });

  it('is never dirty outside the recording mode, or with no draft', () => {
    expect(isDraftDirty('reading', makeBlankRecordDraft())).toBe(false);
    expect(isDraftDirty('recording', null)).toBe(false);
  });

  // Task 3: removing the tasting section from an amend draft that started
  // with one is a real edit — dirty against the baseline, so Escape does
  // NOT close the pen and the beforeunload guard fires. This is the
  // opposite case from the "open-but-empty on a fresh draft" test above:
  // there, tastingOpen alone never differed from a null baseline (no
  // baseline exists yet); here, the amend baseline already has
  // tastingOpen true with ink, so collapsing it back to false is a
  // deletion, and "a deletion is ink too" (this file's own established
  // rule) applies to the tasting section exactly as it does to a churn
  // field.
  it('collapsing an amend draft\'s tasting section back to closed, against a baseline that had one, is dirty (a removal is ink, task 3)', () => {
    const baseline = draftFromBatch(augustSecondBatch);
    const draft = structuredClone(baseline);
    draft.tastingOpen = false;
    expect(isDraftDirty('recording', draft, baseline)).toBe(true);
  });
});

describe('draftFromBatch — Correct reopens everything the record holds (D-03, task 3)', () => {
  it('pre-fills every churn field and tastingOpen from the seeded batch\'s own values', () => {
    const draft = draftFromBatch(augustSecondBatch);
    expect(draft.churnDate).toBe('2026-08-02');
    expect(draft.timeToDrawTempMinutes).toBe('20');
    expect(draft.outOfMachineTempC).toBe('-6');
    expect(draft.churnDurationMinutes).toBe('30');
    expect(draft.atTheMachine).toBe('Soft, not greasy');
    expect(draft.tastingOpen).toBe(true);
    expect(draft.tastingTempC).toBe('-12');
    expect(draft.marks).toEqual({ sweetness: 4, oil: 4 });
    expect(draft.bitterDeclared).toBe(true);
    expect(draft.meltTestG).toBe('3');
  });

  it('pre-fills tastingOpen false and every tasting field blank for a batch with no tasting', () => {
    const untasted = { ...augustSecondBatch, tasting: null };
    const draft = draftFromBatch(untasted);
    expect(draft.tastingOpen).toBe(false);
    expect(draft.tastingTempC).toBe('');
    expect(draft.marks).toEqual({});
    expect(draft.bitterDeclared).toBe(false);
    expect(draft.defects).toEqual([]);
  });

  it('reads blank churn measurements as the empty string, never the literal "null"', () => {
    const blankChurnBatch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-09-01', asMade: {}, stepChanges: {} },
      null,
      { id: 'blank-1', now: '2026-09-01T00:00:00.000Z' },
    );
    const draft = draftFromBatch(blankChurnBatch);
    expect(draft.timeToDrawTempMinutes).toBe('');
    expect(draft.outOfMachineTempC).toBe('');
    expect(draft.exitConsistency).toBe('');
    expect(draft.airiness).toBe('');
  });
});

describe('tastingHasInk — D-02: a save with the section open but empty persists no tasting', () => {
  it('reads no ink on a blank draft with the section open', () => {
    expect(tastingHasInk({ ...makeBlankRecordDraft(), tastingOpen: true })).toBe(false);
  });

  it('reads ink from a mark alone', () => {
    expect(tastingHasInk({ ...makeBlankRecordDraft(), marks: { hardness: 3 } })).toBe(true);
  });

  it('reads ink from a defect alone', () => {
    expect(tastingHasInk({ ...makeBlankRecordDraft(), defects: ['Coarse, icy'] })).toBe(true);
  });

  it('reads ink from the declared-flaw toggle alone', () => {
    expect(tastingHasInk({ ...makeBlankRecordDraft(), bitterDeclared: true })).toBe(true);
  });

  it('reads ink from any single non-empty tasting field', () => {
    expect(tastingHasInk({ ...makeBlankRecordDraft(), note: 'x' })).toBe(true);
    expect(tastingHasInk({ ...makeBlankRecordDraft(), tastedDate: '2026-08-03' })).toBe(true);
    expect(tastingHasInk({ ...makeBlankRecordDraft(), temperingMinutes: '5' })).toBe(true);
    expect(tastingHasInk({ ...makeBlankRecordDraft(), tastingTempC: '-12' })).toBe(true);
    expect(tastingHasInk({ ...makeBlankRecordDraft(), meltTestG: '3' })).toBe(true);
    expect(tastingHasInk({ ...makeBlankRecordDraft(), meltStyle: 'Creamy puddle' })).toBe(true);
  });
});

describe('TASTING_REMOVED_EMPTY_STATUS / TASTING_REMOVED_DATA_STATUS — the contract\'s own verbatim removal sentences, each written once (the ninth round, 007 lines 543, 561)', () => {
  it('are character-identical to the contract\'s "Feedback and undo lifecycle" strings', () => {
    expect(TASTING_REMOVED_EMPTY_STATUS).toBe('Tasting removed.');
    expect(TASTING_REMOVED_DATA_STATUS).toBe('Tasting removed. You can restore it.');
  });
});

describe('tastingPayloadFromDraft — the undo payload, a plain-object copy (Task 1, RESEARCH.md A4)', () => {
  it('copies every tasting-body field, and nothing from the churn side', () => {
    const draft = {
      ...makeBlankRecordDraft(),
      churnDate: '2026-08-09',
      atTheMachine: 'Soft',
      tastedDate: '2026-08-11',
      temperingMinutes: '5',
      tastingTempC: '-12',
      marks: { hardness: 3, oil: 5 },
      note: 'Grainy at first',
      defects: ['Coarse, icy'],
      bitterDeclared: true,
      meltTestG: '4',
      meltStyle: 'Creamy puddle',
    };
    const payload = tastingPayloadFromDraft(draft);
    expect(payload).toEqual({
      tastedDate: '2026-08-11',
      temperingMinutes: '5',
      tastingTempC: '-12',
      marks: { hardness: 3, oil: 5 },
      note: 'Grainy at first',
      defects: ['Coarse, icy'],
      bitterDeclared: true,
      meltTestG: '4',
      meltStyle: 'Creamy puddle',
    });
    expect(payload).not.toHaveProperty('churnDate');
    expect(payload).not.toHaveProperty('atTheMachine');
  });

  it('copies marks and defects by value — a later mutation of the draft\'s own objects never reaches the payload (never a captured reference)', () => {
    const draft = { ...makeBlankRecordDraft(), marks: { hardness: 3 }, defects: ['Coarse, icy'] };
    const payload = tastingPayloadFromDraft(draft);
    draft.marks.hardness = 5;
    draft.defects.push('Sandy, gritty');
    expect(payload.marks).toEqual({ hardness: 3 });
    expect(payload.defects).toEqual(['Coarse, icy']);
  });
});

describe('TASTING_RESTORED_STATUS — the contract\'s own verbatim restore sentence (Task 2)', () => {
  it('is character-identical to the contract\'s own string', () => {
    expect(TASTING_RESTORED_STATUS).toBe('Tasting restored.');
  });
});

describe('isTastingBodyField — the retirement scope\'s own boundary (Task 2, contract "Feedback and undo lifecycle": "any edit inside the tasting body retires a pending undo... never a churn-section edit or a Next-time edit")', () => {
  it('reports true for every tasting-body field the generic setters share with a churn field', () => {
    for (const field of ['tastedDate', 'temperingMinutes', 'tastingTempC', 'note', 'meltTestG', 'meltStyle']) {
      expect(isTastingBodyField(field)).toBe(true);
    }
  });

  it('reports false for every churn field and the shared Next time — a churn edit never retires a pending undo', () => {
    for (const field of [
      'churnDate',
      'timeToDrawTempMinutes',
      'outOfMachineTempC',
      'churnDurationMinutes',
      'exitConsistency',
      'airiness',
      'atTheMachine',
      'ingredientNotes',
      'nextTimeNote',
    ]) {
      expect(isTastingBodyField(field)).toBe(false);
    }
  });
});

describe('restoreDraftFromUndo — the restore sequence\'s field write-back (Task 2, contract "Feedback and undo lifecycle", threat T-03.3.1-10)', () => {
  it('reopens the section and writes every tasting field back from the payload, leaving the churn side untouched', () => {
    const draft = { ...makeBlankRecordDraft(), churnDate: '2026-08-09', atTheMachine: 'Soft', tastingOpen: false };
    const pendingUndo = {
      tastedDate: '2026-08-11',
      temperingMinutes: '5',
      tastingTempC: '-12',
      marks: { hardness: 3 },
      note: 'Grainy',
      defects: ['Coarse, icy'],
      bitterDeclared: true,
      meltTestG: '4',
      meltStyle: 'Creamy puddle',
    };
    const restored = restoreDraftFromUndo(draft, pendingUndo);
    expect(restored.tastingOpen).toBe(true);
    expect(restored.tastedDate).toBe('2026-08-11');
    expect(restored.temperingMinutes).toBe('5');
    expect(restored.tastingTempC).toBe('-12');
    expect(restored.marks).toEqual({ hardness: 3 });
    expect(restored.note).toBe('Grainy');
    expect(restored.defects).toEqual(['Coarse, icy']);
    expect(restored.bitterDeclared).toBe(true);
    expect(restored.meltTestG).toBe('4');
    expect(restored.meltStyle).toBe('Creamy puddle');
    expect(restored.churnDate).toBe('2026-08-09');
    expect(restored.atTheMachine).toBe('Soft');
  });

  it('never mutates the draft or the payload it is given', () => {
    const draft = { ...makeBlankRecordDraft() };
    const pendingUndo = {
      tastedDate: '2026-08-11',
      temperingMinutes: '',
      tastingTempC: '',
      marks: { hardness: 3 },
      note: '',
      defects: [],
      bitterDeclared: false,
      meltTestG: '',
      meltStyle: '',
    };
    const draftClone = structuredClone(draft);
    const payloadClone = structuredClone(pendingUndo);
    restoreDraftFromUndo(draft, pendingUndo);
    expect(draft).toEqual(draftClone);
    expect(pendingUndo).toEqual(payloadClone);
  });

  it('writes marks/defects by value, not by reference — mutating the restored draft never reaches the payload that produced it', () => {
    const original = { ...makeBlankRecordDraft(), marks: { hardness: 3 }, defects: ['Coarse, icy'] };
    const payload = tastingPayloadFromDraft(original);
    const restored = restoreDraftFromUndo(makeBlankRecordDraft(), payload);
    restored.marks.hardness = 5;
    restored.defects.push('Sandy, gritty');
    expect(payload.marks).toEqual({ hardness: 3 });
    expect(payload.defects).toEqual(['Coarse, icy']);
  });
});

describe('tastingPayloadFromDraft — the resize-survival guarantee (Task 2, RESEARCH.md A4: "React realization of the carried edges")', () => {
  it('is a plain, structuredClone-safe object — never a captured DOM reference, so it survives the axes re-render a breakpoint crossing triggers (the carried undo-retired-on-resize edge this plan closes)', () => {
    const draft = { ...makeBlankRecordDraft(), marks: { hardness: 3, oil: 5 }, note: 'Grainy', defects: ['Coarse, icy'] };
    const payload = tastingPayloadFromDraft(draft);
    expect(() => structuredClone(payload)).not.toThrow();
    expect(structuredClone(payload)).toEqual(payload);
  });
});

describe('parseAllMeasuredFields — 03.3.1-02 Task 1\'s own minimum: record per-field errors and abort (the churn-date press-to-block and the field-level UI wiring are Task 2\'s build)', () => {
  it('reads a clean, complete draft as valid', () => {
    const draft = { ...makeBlankRecordDraft(), churnDate: '2026-08-09' };
    const result = parseAllMeasuredFields(draft);
    expect(result.hasErrors).toBe(false);
    expect(result.fieldErrors).toEqual({});
  });

  it('names every invalid field with its own verbatim contract sentence', () => {
    const draft = { ...makeBlankRecordDraft(), churnDate: '2026-08-09', outOfMachineTempC: '4o' };
    const result = parseAllMeasuredFields(draft);
    const field = BATTERY_FIELDS.find((f) => f.key === 'outOfMachineTempC');
    expect(result.hasErrors).toBe(true);
    expect(result.fieldErrors.outOfMachineTempC).toBe(field.error);
  });

  it('rejects a negative value on an unsigned field, and accepts the same magnitude signed', () => {
    const negativeUnsigned = parseAllMeasuredFields({ ...makeBlankRecordDraft(), churnDurationMinutes: '-5' });
    expect(negativeUnsigned.hasErrors).toBe(true);
    const negativeSigned = parseAllMeasuredFields({ ...makeBlankRecordDraft(), outOfMachineTempC: '-6' });
    expect(negativeSigned.hasErrors).toBe(false);
  });

  it('the two error strings are character-identical to BATTERY_FIELDS\' own contract sentences', () => {
    const timeField = BATTERY_FIELDS.find((f) => f.key === 'timeToDrawTempMinutes');
    const tempField = BATTERY_FIELDS.find((f) => f.key === 'outOfMachineTempC');
    const unsigned = parseAllMeasuredFields({ ...makeBlankRecordDraft(), timeToDrawTempMinutes: 'x' });
    const signed = parseAllMeasuredFields({ ...makeBlankRecordDraft(), outOfMachineTempC: 'x' });
    expect(unsigned.fieldErrors.timeToDrawTempMinutes).toBe(timeField.error);
    expect(signed.fieldErrors.outOfMachineTempC).toBe(tempField.error);
  });
});

// Task 2 (tdd="true"): the record pen's full save gate — measurements
// validate first (RESEARCH.md Open Question 3), then the churn date
// (D-05). validateRecordDraft is the one derivation both blocks flow
// through; CHURN_DATE_BLOCKED_MESSAGE/MEASURED_INVALID_STATUS are the
// contract's own verbatim sentences, each written once.
describe('validateRecordDraft — the one traversal: measurements first, then the churn date (RESEARCH.md Open Question 3, D-05)', () => {
  it('reads a clean, complete draft as valid with no blocked date', () => {
    const draft = { ...makeBlankRecordDraft(), churnDate: '2026-08-09' };
    const result = validateRecordDraft(draft);
    expect(result.invalidFieldKey).toBe(null);
    expect(result.fieldErrors).toEqual({});
    expect(result.blockedDateMessage).toBe(null);
  });

  it('blocks on a blank churn date only once every measurement is clean', () => {
    const draft = makeBlankRecordDraft();
    const result = validateRecordDraft(draft);
    expect(result.blockedDateMessage).toBe(CHURN_DATE_BLOCKED_MESSAGE);
    expect(result.invalidFieldKey).toBe(null);
  });

  it('names the first invalid field in BATTERY_FIELDS order and carries its own verbatim contract sentence', () => {
    const draft = { ...makeBlankRecordDraft(), churnDate: '2026-08-09', outOfMachineTempC: '4o' };
    const result = validateRecordDraft(draft);
    const field = BATTERY_FIELDS.find((f) => f.key === 'outOfMachineTempC');
    expect(result.invalidFieldKey).toBe('outOfMachineTempC');
    expect(result.fieldErrors.outOfMachineTempC).toBe(field.error);
  });

  it('validates measurements before the churn date: a blank date AND a malformed measurement reports the measurement, not the date', () => {
    const draft = { ...makeBlankRecordDraft(), churnDurationMinutes: 'x' };
    const result = validateRecordDraft(draft);
    expect(result.invalidFieldKey).toBe('churnDurationMinutes');
    expect(result.blockedDateMessage).toBe(null);
  });
});

describe('MEASURED_INVALID_STATUS, CHURN_DATE_BLOCKED_MESSAGE and CHURN_DATE_BLOCKED_STATUS — the contract\'s own verbatim sentences, each written once (D-05, § 3)', () => {
  it('matches the contract\'s own status sentence', () => {
    expect(MEASURED_INVALID_STATUS).toBe('Check the marked measurements. Your entries have been kept.');
  });

  it('matches the working blocked-date sentence', () => {
    expect(CHURN_DATE_BLOCKED_MESSAGE).toBe('Enter the date you churned.');
  });

  it('matches the churn date\'s own form-scoped summary, the sibling of MEASURED_INVALID_STATUS', () => {
    expect(CHURN_DATE_BLOCKED_STATUS).toBe('Check the churn date. Your entries have been kept.');
  });
});

describe('VERSION_BLOCKED_STATUS — the form-owned reassurance for a field-owned Version error (260917-e5k: moved off the page channel)', () => {
  it('directs attention to Version and confirms the draft was kept', () => {
    expect(VERSION_BLOCKED_STATUS).toBe('Check the version. Your changes have been kept.');
  });
});

// The version pen's refusal and its storage failure route into the form
// channel (announce), never the page channel (onPageStatus) — the page
// region speaks only on a successful version save (260917-e5k, the
// pending todo's page/form split). Reads RecipePage.jsx as text, in the
// style cross-cutting.test.js already uses for the stylesheet: comments
// are stripped first so prose can never satisfy or break the gate, then
// for each constant every `functionName(CONSTANT` call site is collected
// into a set (not a count), so a fifth failure path never reds this test
// and a path that changes channel does.
describe('RecipePage.jsx — the version pen\'s refusal and failure route through announce, never onPageStatus', () => {
  const recipePagePath = fileURLToPath(new URL('./RecipePage.jsx', import.meta.url));
  const recipePageSource = readFileSync(recipePagePath, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  function callersOf(constantName) {
    const pattern = new RegExp(`(\\w+)\\(${constantName}\\b`, 'g');
    return new Set([...recipePageSource.matchAll(pattern)].map((match) => match[1]));
  }

  it('the refusal (VERSION_BLOCKED_STATUS) is passed only to announce', () => {
    const callers = callersOf('VERSION_BLOCKED_STATUS');
    expect(callers.size).toBeGreaterThan(0);
    expect(callers).toEqual(new Set(['announce']));
  });

  it('the storage failure (VERSION_SAVE_ERROR) is passed only to announce, at every site', () => {
    const callers = callersOf('VERSION_SAVE_ERROR');
    expect(callers.size).toBeGreaterThan(0);
    expect(callers).toEqual(new Set(['announce']));
  });

  it('the success (VERSION_SAVED_STATUS) is passed only to onPageStatus', () => {
    const callers = callersOf('VERSION_SAVED_STATUS');
    expect(callers.size).toBeGreaterThan(0);
    expect(callers).toEqual(new Set(['onPageStatus']));
  });
});

// Source-text ownership contract (260917-ewf Task 1), the same idiom the
// describe above uses: router.jsx cannot be rendered under this suite's
// node environment — createBrowserRouter runs at module scope and calls
// createBrowserHistory, which needs `document` — so no markup test is
// possible for the running head's new home. The repository mock above is
// not the obstacle; this is a plain module-scope DOM dependency.
describe('the running head is owned by the routed shell, not by RecipePage (260917-ewf)', () => {
  const routerPath = fileURLToPath(new URL('../router.jsx', import.meta.url));
  const routerSource = readFileSync(routerPath, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
  const thisFilesRecipePagePath = fileURLToPath(new URL('./RecipePage.jsx', import.meta.url));
  const thisFilesRecipePageSource = readFileSync(thisFilesRecipePagePath, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  it('router.jsx renders the running head exactly once', () => {
    expect(routerSource.match(/className="running-head"/g) ?? []).toHaveLength(1);
  });

  it('RecipePage.jsx renders the running head zero times', () => {
    expect(thisFilesRecipePageSource.match(/className="running-head"/g)).toBeNull();
  });

  it('the notice precedes the keyed page — PageStatus outside RecipePage, key still on RecipePage', () => {
    const statusIndex = routerSource.indexOf('<PageStatus');
    const pageIndex = routerSource.indexOf('<RecipePage');
    expect(statusIndex).toBeGreaterThanOrEqual(0);
    expect(pageIndex).toBeGreaterThan(statusIndex);
    expect(routerSource).toMatch(/<RecipePage\s+key=/);
  });
});

describe('buildChurnFieldsFromDraft / buildTastingFieldsFromDraft — the save assembly (D-02, D-10)', () => {
  it('assembles the churn fields from a valid draft, blank-is-absent on every optional field', () => {
    const draft = { ...makeBlankRecordDraft(), churnDate: '2026-08-09', timeToDrawTempMinutes: '20' };
    const { parsed } = parseAllMeasuredFields(draft);
    const churnFields = buildChurnFieldsFromDraft(draft, parsed);
    expect(churnFields.churnDate).toBe('2026-08-09');
    expect(churnFields.timeToDrawTempMinutes).toBe(20);
    expect(churnFields.outOfMachineTempC).toBe(null);
    expect(churnFields.exitConsistency).toBe(null);
    expect(churnFields.atTheMachine).toBe(null);
  });

  it('parses as-made through parseGramsDraft, dropping a row whose every portion fails to parse', () => {
    const draft = {
      ...makeBlankRecordDraft(),
      churnDate: '2026-08-09',
      asMade: { 'row-01': ['120', '263'], 'row-09': ['abc'] },
    };
    const { parsed } = parseAllMeasuredFields(draft);
    const churnFields = buildChurnFieldsFromDraft(draft, parsed);
    expect(churnFields.asMade['row-01']).toEqual([120, 263]);
    expect(churnFields.asMade).not.toHaveProperty('row-09');
  });

  it('assembles the tasting fields from a valid draft', () => {
    const draft = { ...makeBlankRecordDraft(), tastingTempC: '-12', marks: { oil: 4 }, bitterDeclared: true, meltTestG: '3' };
    const { parsed } = parseAllMeasuredFields(draft);
    const tastingFields = buildTastingFieldsFromDraft(draft, parsed);
    expect(tastingFields.tastingTempC).toBe(-12);
    expect(tastingFields.marks).toEqual({ oil: 4 });
    expect(tastingFields.bitterDeclared).toBe(true);
    expect(tastingFields.meltTestG).toBe(3);
    expect(tastingFields.defects).toBe(null);
  });

  it('feeds createBatch a null tasting when the section holds no ink, and a real one when it does (D-02)', () => {
    const churnOnlyDraft = { ...makeBlankRecordDraft(), churnDate: '2026-08-09' };
    const { parsed: churnOnlyParsed } = parseAllMeasuredFields(churnOnlyDraft);
    const churnOnlyTasting =
      churnOnlyDraft.tastingOpen && tastingHasInk(churnOnlyDraft)
        ? buildTastingFieldsFromDraft(churnOnlyDraft, churnOnlyParsed)
        : null;
    const churnOnlyBatch = createBatch(oliveOilVersion, buildChurnFieldsFromDraft(churnOnlyDraft, churnOnlyParsed), churnOnlyTasting, {
      id: 'churn-only-1',
      now: '2026-08-09T00:00:00.000Z',
    });
    expect(churnOnlyBatch.tasting).toBe(null);

    const withTastingDraft = { ...makeBlankRecordDraft(), churnDate: '2026-08-09', tastingOpen: true, tastingTempC: '-12' };
    const { parsed: withTastingParsed } = parseAllMeasuredFields(withTastingDraft);
    const withTasting =
      withTastingDraft.tastingOpen && tastingHasInk(withTastingDraft)
        ? buildTastingFieldsFromDraft(withTastingDraft, withTastingParsed)
        : null;
    const withTastingBatch = createBatch(oliveOilVersion, buildChurnFieldsFromDraft(withTastingDraft, withTastingParsed), withTasting, {
      id: 'with-tasting-1',
      now: '2026-08-09T00:00:00.000Z',
    });
    expect(withTastingBatch.tasting.tastingTempC).toBe(-12);
  });

  it('feeds completeRecord a null tasting to remove a stored one, stamping changed (RESEARCH.md Assumption A3, D-04)', () => {
    const removalDraft = draftFromBatch(augustSecondBatch);
    removalDraft.tastingOpen = false;
    const { parsed } = parseAllMeasuredFields(removalDraft);
    const churnFields = buildChurnFieldsFromDraft(removalDraft, parsed);
    const tasting = removalDraft.tastingOpen && tastingHasInk(removalDraft) ? buildTastingFieldsFromDraft(removalDraft, parsed) : null;
    const record = completeRecord(augustSecondBatch, churnFields, tasting, { now: '2026-08-10T00:00:00.000Z' });
    expect(record.tasting).toBe(null);
    expect(record.changed).toBe('2026-08-10T00:00:00.000Z');
    expect(record.recordedAt).toBe(augustSecondBatch.recordedAt);
    expect(record.snapshot).toBe(augustSecondBatch.snapshot);
  });

  it('completeRecord without edits stamps changed and leaves recordedAt/snapshot untouched (task 3 acceptance)', () => {
    const draft = draftFromBatch(augustSecondBatch);
    const { parsed } = parseAllMeasuredFields(draft);
    const churnFields = buildChurnFieldsFromDraft(draft, parsed);
    const tasting = draft.tastingOpen && tastingHasInk(draft) ? buildTastingFieldsFromDraft(draft, parsed) : null;
    const record = completeRecord(augustSecondBatch, churnFields, tasting, { now: '2026-08-10T00:00:00.000Z' });
    expect(record.changed).toBe('2026-08-10T00:00:00.000Z');
    expect(record.recordedAt).toBe(augustSecondBatch.recordedAt);
    expect(record.churn.timeToDrawTempMinutes).toBe(20);
    expect(record.tasting.tastingTempC).toBe(-12);
  });
});
