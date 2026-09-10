// The one-pen interlock's own unit tests (D-10, D-UAT-1): derivePenState is
// the single derivation every opener in BatchMargin and Versions now reads
// (Develop moved from Headnote into Versions, 03.1-CONTEXT.md D-04 to
// D-06), replacing the two unrelated states (`mode`, `tastingDraft`) each
// control used to hand-roll its own subset of. This file renders nothing
// of RecipePage itself — it reads the repository at module load (D-06), so
// that import is stubbed here at the one seam it goes through, exactly as
// RecipeList.test.jsx already does. What this file DOES render, through
// renderToStaticMarkup in the existing node environment (no jsdom, no
// testing library, no click driver — the point is the derivation and the
// disabled/absent markup it feeds, not an interaction), is the four-pen
// matrix across the two components the derivation actually reaches.
import { describe, it, expect, vi } from 'vitest';
vi.mock('../store/repository.js', () => ({ repository: {} }));
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { derivePenState, isPenDraftDirty, isDraftDirty, toNumberOrNull } from './RecipePage.jsx';
import { Versions } from './Versions.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';

const noop = () => {};

describe('derivePenState — the one derivation of "a pen is open"', () => {
  it('reports the plan pen while developing', () => {
    const { openPen } = derivePenState({ mode: 'developing', amendingBatchId: null, tastingDraft: null });
    expect(openPen).toBe('plan');
  });

  it('reports the record pen while recording with no amend target', () => {
    const { openPen } = derivePenState({ mode: 'recording', amendingBatchId: null, tastingDraft: null });
    expect(openPen).toBe('record');
  });

  it('reports the amend pen while recording with an amend target', () => {
    const { openPen } = derivePenState({ mode: 'recording', amendingBatchId: 'batch-1', tastingDraft: null });
    expect(openPen).toBe('amend');
  });

  it('reports the tasting pen while reading with a tasting draft', () => {
    const { openPen } = derivePenState({ mode: 'reading', amendingBatchId: null, tastingDraft: {} });
    expect(openPen).toBe('tasting');
  });

  it('reports no pen open while reading with nothing in progress', () => {
    const { openPen, reason } = derivePenState({ mode: 'reading', amendingBatchId: null, tastingDraft: null });
    expect(openPen).toBe(null);
    expect(reason).toBe(null);
  });

  it('gives each of the four open states its own distinct, non-empty reason', () => {
    const reasons = [
      derivePenState({ mode: 'developing', amendingBatchId: null, tastingDraft: null }).reason,
      derivePenState({ mode: 'recording', amendingBatchId: null, tastingDraft: null }).reason,
      derivePenState({ mode: 'recording', amendingBatchId: 'batch-1', tastingDraft: null }).reason,
      derivePenState({ mode: 'reading', amendingBatchId: null, tastingDraft: {} }).reason,
    ];
    for (const reason of reasons) {
      expect(typeof reason).toBe('string');
      expect(reason.length).toBeGreaterThan(0);
    }
    expect(new Set(reasons).size).toBe(reasons.length);
  });

  // Presence, never truthiness of its contents — the same discipline
  // isTastingDraftDirty already applies to a tasting draft. An empty
  // object is a pen that has been opened and not yet typed into.
  it('treats an empty tasting draft object as an open pen, not an unopened one', () => {
    const { openPen } = derivePenState({ mode: 'reading', amendingBatchId: null, tastingDraft: {} });
    expect(openPen).toBe('tasting');
  });

  // amendingBatchId can be left over from a prior amendment once mode
  // returns to 'reading' (handleCancelRecording clears it, but nothing else
  // asserts it stays clear) — this must never be read as an open amend pen.
  it('reports no pen open when amendingBatchId is stale but mode has returned to reading', () => {
    const { openPen, reason } = derivePenState({ mode: 'reading', amendingBatchId: 'batch-1', tastingDraft: null });
    expect(openPen).toBe(null);
    expect(reason).toBe(null);
  });
});

// The four-pen matrix, across the region openPen actually reaches now —
// every batch-side opener (Amend, Record another batch, Record a batch,
// Add a tasting) moved from BatchMargin into Versions in this plan
// (D-04, D-09); BatchMargin itself renders no opener of any kind (see
// BatchMargin.test.jsx). Table-driven so the correspondence between a pen
// and the opener it hides reads as data, not as four hand-written
// near-duplicate tests.
const PEN_MATRIX = [
  { openPen: 'plan', reason: 'the plan is being developed' },
  { openPen: 'record', reason: 'a batch is being recorded' },
  { openPen: 'amend', reason: 'a batch is being amended' },
  { openPen: 'tasting', reason: 'a tasting is being written' },
];

function renderVersionsReading(openPen, reason) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <Versions
        version={oliveOilVersion}
        versions={[oliveOilVersion]}
        mode="reading"
        // Every row in PEN_MATRIX exercises a different ceremony, each
        // reading a different one of these three drafts — supplying all
        // three unconditionally keeps this one render function usable
        // for the whole matrix.
        draft={{
          churnDate: '',
          asMade: {},
          stepChanges: {},
          comeUpMinutes: '',
          drawTempC: '',
          overrunPercent: '',
          drawNotes: '',
          ingredientNotes: '',
          nextTimeNote: '',
        }}
        penDraft={{ versionLabel: '', reason: '', citedBatchId: null, headnote: oliveOilVersion.headnote }}
        tastingDraft={{ date: '', tastingTempC: '', marks: {}, meltdownLossG: '', words: '', nextTimeNote: '' }}
        openBatch={null}
        batches={[]}
        versionIdsWithBatches={new Set()}
        citedBatch={null}
        blockedMessage={null}
        openPen={openPen}
        penReason={reason}
        canSaveOver={true}
        onStartDeveloping={noop}
        onCancelDeveloping={noop}
        onChangePenField={noop}
        onSaveAsNewVersion={noop}
        onSaveOverVersion={noop}
        onStartRecording={noop}
        onStartAmending={noop}
        onChangeChurnDate={noop}
        onCancelRecording={noop}
        onSaveBatch={noop}
        onStartTasting={noop}
        onChangeTastingField={noop}
        onUseAsExpectedShortcut={noop}
        onSaveTasting={noop}
        onCancelTasting={noop}
      />
    </MemoryRouter>,
  );
}

describe('The four-pen matrix — Develop absent, every other opener\'s own coverage lives in Versions.test.jsx', () => {
  // D-05/D-06 narrows this from Phase 3's "every opener visible and
  // disabled with its reason" (D-UAT-1): Develop moved into Versions and
  // now renders only while openPen is null — while the plan's own pen is
  // open its ceremony replaces it (D-06), and the record's/tasting's own
  // ceremonies replace it for the other three pens, so Develop is simply
  // absent, not disabled, for every pen in this matrix.
  it.each(PEN_MATRIX)('with the $openPen pen open, Develop is absent from Versions', ({ openPen, reason }) => {
    const markup = renderVersionsReading(openPen, reason);
    expect(markup).not.toContain('>Develop<');
  });

  it('with no pen open, Develop renders', () => {
    const versions = renderVersionsReading(null, null);
    expect(versions).toMatch(/<button[^>]*>Develop<\/button>/);
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

  it('is dirty when a step instruction changes, and clean again typed back', () => {
    const draft = makeCleanPenDraft(version);
    draft.method[0].instruction = 'Changed instruction';
    expect(isPenDraftDirty('developing', draft, version)).toBe(true);
    draft.method[0].instruction = 'Instruction one';
    expect(isPenDraftDirty('developing', draft, version)).toBe(false);
  });

  it('is dirty when a step purpose changes, and clean again typed back', () => {
    const draft = makeCleanPenDraft(version);
    draft.method[0].purpose = 'Changed purpose';
    expect(isPenDraftDirty('developing', draft, version)).toBe(true);
    draft.method[0].purpose = 'Purpose one';
    expect(isPenDraftDirty('developing', draft, version)).toBe(false);
  });

  it('is dirty when a step aside changes, and clean again typed back', () => {
    const draft = makeCleanPenDraft(version);
    draft.method[0].aside = 'Changed aside';
    expect(isPenDraftDirty('developing', draft, version)).toBe(true);
    draft.method[0].aside = 'Aside one';
    expect(isPenDraftDirty('developing', draft, version)).toBe(false);
  });

  it('a first keystroke into an absent purpose/aside, deleted again, reads clean (absent compares equal to empty)', () => {
    const draft = makeCleanPenDraft(version);
    draft.method[1].purpose = 'x';
    expect(isPenDraftDirty('developing', draft, version)).toBe(true);
    draft.method[1].purpose = '';
    expect(isPenDraftDirty('developing', draft, version)).toBe(false);
  });

  it('is dirty when a step target label or value changes, and clean again typed back', () => {
    const draft = makeCleanPenDraft(version);
    draft.method[0].targets[0].label = 'changed-label';
    expect(isPenDraftDirty('developing', draft, version)).toBe(true);
    draft.method[0].targets[0].label = 'temp';
    expect(isPenDraftDirty('developing', draft, version)).toBe(false);

    draft.method[0].targets[0].value = 'changed-value';
    expect(isPenDraftDirty('developing', draft, version)).toBe(true);
    draft.method[0].targets[0].value = '10 C';
    expect(isPenDraftDirty('developing', draft, version)).toBe(false);
  });

  it('is dirty when a row is toggled into or out of a step uses list, and clean again toggled back', () => {
    const draft = makeCleanPenDraft(version);
    draft.method[0].uses = draft.method[0].uses.filter((id) => id !== 'row-1');
    expect(isPenDraftDirty('developing', draft, version)).toBe(true);
    draft.method[0].uses = ['row-1'];
    expect(isPenDraftDirty('developing', draft, version)).toBe(false);

    draft.method[1].uses = ['row-1'];
    expect(isPenDraftDirty('developing', draft, version)).toBe(true);
    draft.method[1].uses = [];
    expect(isPenDraftDirty('developing', draft, version)).toBe(false);
  });

  it('is dirty when a step is removed or restored', () => {
    const draft = makeCleanPenDraft(version);
    draft.method[0].removed = true;
    expect(isPenDraftDirty('developing', draft, version)).toBe(true);
    draft.method[0].removed = false;
    expect(isPenDraftDirty('developing', draft, version)).toBe(false);
  });

  it('is dirty when the headnote prose changes, and clean again typed back', () => {
    const draft = makeCleanPenDraft(version);
    draft.headnote = 'Changed headnote.';
    expect(isPenDraftDirty('developing', draft, version)).toBe(true);
    draft.headnote = 'Baseline headnote.';
    expect(isPenDraftDirty('developing', draft, version)).toBe(false);
  });

  it('is dirty when an authored note text changes, and clean again typed back', () => {
    const draft = makeCleanPenDraft(version);
    draft.authored.carriedForward[0].text = 'Changed note text';
    expect(isPenDraftDirty('developing', draft, version)).toBe(true);
    draft.authored.carriedForward[0].text = 'Carried note';
    expect(isPenDraftDirty('developing', draft, version)).toBe(false);
  });

  it('is dirty when an authored note is removed', () => {
    const draft = makeCleanPenDraft(version);
    draft.authored.beforeYouStart = [];
    expect(isPenDraftDirty('developing', draft, version)).toBe(true);
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

  it('is dirty when a two-portion row\'s SECOND portion alone changes, and clean again typed back — the split is not the pen\'s own to edit, only the amounts are (CONTEXT.md phase boundary)', () => {
    const splitVersion = makeBaselineVersion({
      rows: [{ id: 'row-1', portions: [{ step: 1, grams: 20 }, { step: 2, grams: 30 }], removed: false }],
    });
    const draft = makeCleanPenDraft(splitVersion);
    draft.rows['row-1'].portions[1].grams = '999';
    expect(isPenDraftDirty('developing', draft, splitVersion)).toBe(true);
    draft.rows['row-1'].portions[1].grams = '30';
    expect(isPenDraftDirty('developing', draft, splitVersion)).toBe(false);
  });

  it('is never dirty when the mode is not developing, or when the version or the draft is absent', () => {
    const draft = makeCleanPenDraft(version);
    draft.headnote = 'Changed headnote.';
    expect(isPenDraftDirty('reading', draft, version)).toBe(false);
    expect(isPenDraftDirty('developing', null, version)).toBe(false);
    expect(isPenDraftDirty('developing', draft, null)).toBe(false);
  });
});

function makeAmendBaseline(overrides = {}) {
  return {
    churnDate: '2026-08-02',
    asMade: { 'row-1': ['100'] },
    stepChanges: { 1: { struck: true, line: null } },
    comeUpMinutes: '20',
    drawTempC: '-6',
    overrunPercent: '5',
    drawNotes: 'Soft, not greasy',
    ingredientNotes: 'Oil bottle open date 24 Jul',
    nextTimeNote: 'Next time note',
    ...overrides,
  };
}

describe('isDraftDirty — the churn check, against what it was filled from (T-03-43)', () => {
  it('a fresh recording draft with nothing typed is not dirty', () => {
    const blank = {
      churnDate: '',
      asMade: {},
      stepChanges: {},
      comeUpMinutes: '',
      drawTempC: '',
      overrunPercent: '',
      drawNotes: '',
      ingredientNotes: '',
      nextTimeNote: '',
    };
    expect(isDraftDirty('recording', blank)).toBe(false);
  });

  it('a fresh recording draft is dirty the instant any one field is typed', () => {
    const blank = {
      churnDate: '',
      asMade: {},
      stepChanges: {},
      comeUpMinutes: '',
      drawTempC: '',
      overrunPercent: '',
      drawNotes: '',
      ingredientNotes: '',
      nextTimeNote: '',
    };
    expect(isDraftDirty('recording', { ...blank, drawNotes: 'x' })).toBe(true);
  });

  it('an amend draft, pre-filled and untouched, is NOT dirty against its baseline', () => {
    const baseline = makeAmendBaseline();
    const draft = structuredClone(baseline);
    expect(isDraftDirty('recording', draft, baseline)).toBe(false);
  });

  it('the same amend draft with one churn field changed IS dirty, and clean again changed back', () => {
    const baseline = makeAmendBaseline();
    const draft = structuredClone(baseline);
    draft.drawNotes = 'Different notes';
    expect(isDraftDirty('recording', draft, baseline)).toBe(true);
    draft.drawNotes = baseline.drawNotes;
    expect(isDraftDirty('recording', draft, baseline)).toBe(false);
  });

  it('is dirty when an as-made amount is added that the batch did not have', () => {
    const baseline = makeAmendBaseline();
    const draft = structuredClone(baseline);
    draft.asMade['row-2'] = ['50'];
    expect(isDraftDirty('recording', draft, baseline)).toBe(true);
  });

  it('is dirty when a single portion within an existing as-made row changes, and clean again when reverted — an array-length match alone must not read as equal (D-10)', () => {
    const baseline = makeAmendBaseline({ asMade: { 'row-1': ['120', '263'] } });
    const draft = structuredClone(baseline);
    draft.asMade['row-1'][1] = '999';
    expect(isDraftDirty('recording', draft, baseline)).toBe(true);
    draft.asMade['row-1'][1] = '263';
    expect(isDraftDirty('recording', draft, baseline)).toBe(false);
  });

  it('is dirty when a step strike or its line changes', () => {
    const baseline = makeAmendBaseline();
    const struckDraft = structuredClone(baseline);
    struckDraft.stepChanges[1].struck = false;
    expect(isDraftDirty('recording', struckDraft, baseline)).toBe(true);

    const lineDraft = structuredClone(baseline);
    lineDraft.stepChanges[1].line = 'a new line';
    expect(isDraftDirty('recording', lineDraft, baseline)).toBe(true);
  });

  it('is dirty when a field the batch had a value in is cleared — a deletion is ink too', () => {
    const baseline = makeAmendBaseline();
    const draft = structuredClone(baseline);
    draft.drawNotes = '';
    expect(isDraftDirty('recording', draft, baseline)).toBe(true);
  });

  it('a written zero counts: 0 where the batch held 5 is dirty, 0 where the batch held 0 is clean', () => {
    const baselineWithFive = makeAmendBaseline({ overrunPercent: '5' });
    const draftWithZero = structuredClone(baselineWithFive);
    draftWithZero.overrunPercent = '0';
    expect(isDraftDirty('recording', draftWithZero, baselineWithFive)).toBe(true);

    const baselineWithZero = makeAmendBaseline({ overrunPercent: '0' });
    const draftAlsoZero = structuredClone(baselineWithZero);
    expect(isDraftDirty('recording', draftAlsoZero, baselineWithZero)).toBe(false);
  });
});

describe('toNumberOrNull — nothing written and unparsable ink are the same fact, never a stored NaN (260909-oox)', () => {
  it('reads nothing written as null', () => {
    expect(toNumberOrNull('')).toBe(null);
  });

  it('reads a written figure as that figure', () => {
    expect(toNumberOrNull('20')).toBe(20);
  });

  it('keeps the sign of a negative reading — the batch drew at -6 °C, and out of the machine is legitimately negative', () => {
    expect(toNumberOrNull('-6')).toBe(-6);
  });

  it('reads a written zero as the value 0, not as an absence (presence over truthiness)', () => {
    expect(toNumberOrNull('0')).toBe(0);
  });

  it('reads unparsable ink as nothing written, never as a stored NaN', () => {
    expect(toNumberOrNull('4o')).toBe(null);
    expect(toNumberOrNull('abc')).toBe(null);
  });

  it('reads an infinite figure as nothing written either', () => {
    expect(toNumberOrNull('Infinity')).toBe(null);
  });
});
