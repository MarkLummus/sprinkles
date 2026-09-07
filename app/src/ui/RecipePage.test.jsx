// The one-pen interlock's own unit tests (D-10, D-UAT-1): derivePenState is
// the single derivation every opener in BatchMargin and Headnote now reads,
// replacing the two unrelated states (`mode`, `tastingDraft`) each control
// used to hand-roll its own subset of. This file renders nothing of
// RecipePage itself — it reads the repository at module load (D-06), so
// that import is stubbed here at the one seam it goes through, exactly as
// RecipeList.test.jsx already does. What this file DOES render, through
// renderToStaticMarkup in the existing node environment (no jsdom, no
// testing library, no click driver — the point is the derivation and the
// disabled markup it feeds, not an interaction), is the four-pen matrix
// across the two components the derivation actually reaches.
import { describe, it, expect, vi } from 'vitest';
vi.mock('../store/repository.js', () => ({ repository: {} }));
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { derivePenState, isPenDraftDirty, isDraftDirty } from './RecipePage.jsx';
import { BatchMargin } from './BatchMargin.jsx';
import { Headnote } from './Headnote.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

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

// The four-pen matrix, across the two components openPen actually reaches.
// Table-driven so the correspondence between a pen and the openers it
// disables reads as data, not as four hand-written near-duplicate tests —
// exactly the shape that let RC1/RC2 hide, since no single test looked at
// all four pens against all five openers at once.
const PEN_MATRIX = [
  { openPen: 'plan', reason: 'the plan is being developed' },
  { openPen: 'record', reason: 'a batch is being recorded' },
  { openPen: 'amend', reason: 'a batch is being amended' },
  { openPen: 'tasting', reason: 'a tasting is being written' },
];

function renderBatchMargin(openPen, reason) {
  return renderToStaticMarkup(
    <BatchMargin
      version={oliveOilVersion}
      batches={[augustSecondBatch]}
      openBatch={augustSecondBatch}
      mode="reading"
      draft={null}
      openPen={openPen}
      penReason={reason}
      onStartRecording={noop}
      onStartAmending={noop}
      onChangeChurnField={noop}
      onSaveBatch={noop}
      tastingDraft={null}
      onStartTasting={noop}
      onChangeTastingField={noop}
      onChangeTastingMark={noop}
      onUseAsExpectedShortcut={noop}
      onSaveTasting={noop}
      onCancelTasting={noop}
    />,
  );
}

function renderNoBatchMargin(openPen, reason) {
  return renderToStaticMarkup(
    <BatchMargin
      version={oliveOilVersion}
      batches={[]}
      openBatch={null}
      mode="reading"
      draft={null}
      openPen={openPen}
      penReason={reason}
      onStartRecording={noop}
      onStartAmending={noop}
      onChangeChurnField={noop}
      onSaveBatch={noop}
      tastingDraft={null}
      onStartTasting={noop}
      onChangeTastingField={noop}
      onChangeTastingMark={noop}
      onUseAsExpectedShortcut={noop}
      onSaveTasting={noop}
      onCancelTasting={noop}
    />,
  );
}

function renderHeadnoteReading(openPen, reason) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <Headnote
        version={oliveOilVersion}
        mode="reading"
        draft={null}
        penDraft={null}
        openBatch={null}
        batches={[]}
        citedBatch={null}
        blockedMessage={null}
        openPen={openPen}
        penReason={reason}
        onChangeChurnDate={noop}
        onStartDeveloping={noop}
        onCancelDeveloping={noop}
        onChangePenField={noop}
        onSaveAsNewVersion={noop}
        onSaveOverVersion={noop}
      />
    </MemoryRouter>,
  );
}

describe('The four-pen matrix — every opener disabled, every reason in words', () => {
  it.each(PEN_MATRIX)('with the $openPen pen open, Amend and Record another batch disable and state the reason', ({ openPen, reason }) => {
    const markup = renderBatchMargin(openPen, reason);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Amend<\/button>/);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Record another batch<\/button>/);
    expect(markup).toContain(reason);
  });

  it.each(PEN_MATRIX.filter((row) => row.openPen !== 'tasting'))(
    'with the $openPen pen open, Add a tasting disables (the tasting form itself replaces this button while the tasting pen is open)',
    ({ openPen, reason }) => {
      const markup = renderBatchMargin(openPen, reason);
      expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Add a tasting<\/button>/);
    },
  );

  it.each(PEN_MATRIX)('with the $openPen pen open, Record a batch (no-batch branch) disables and states the reason', ({ openPen, reason }) => {
    const markup = renderNoBatchMargin(openPen, reason);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Record a batch<\/button>/);
    expect(markup).toContain(reason);
  });

  it.each(PEN_MATRIX)('with the $openPen pen open, Develop the next version disables and states the reason', ({ openPen, reason }) => {
    const markup = renderHeadnoteReading(openPen, reason);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Develop the next version<\/button>/);
    expect(markup).toContain(reason);
  });

  it('with no pen open, none of the five openers disables and no reason line renders', () => {
    const margin = renderBatchMargin(null, null);
    const noBatchMargin = renderNoBatchMargin(null, null);
    const headnote = renderHeadnoteReading(null, null);
    expect(margin).not.toMatch(/<button[^>]*disabled=""[^>]*>Amend<\/button>/);
    expect(margin).not.toMatch(/<button[^>]*disabled=""[^>]*>Record another batch<\/button>/);
    expect(margin).not.toMatch(/<button[^>]*disabled=""[^>]*>Add a tasting<\/button>/);
    expect(margin).not.toContain('unavailable while');
    expect(noBatchMargin).not.toMatch(/<button[^>]*disabled=""[^>]*>Record a batch<\/button>/);
    expect(noBatchMargin).not.toContain('unavailable while');
    expect(headnote).not.toMatch(/<button[^>]*disabled=""[^>]*>Develop the next version<\/button>/);
    expect(headnote).not.toContain('unavailable while');
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
      { id: 'row-1', grams: 100, step: 1, removed: false },
      { id: 'row-2', grams: 50, step: 2, removed: false },
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

// Mirrors handleStartDeveloping's own seeding exactly — grams as strings,
// method/authored a structuredClone — so "nothing touched" is genuinely
// the shape the pen opens with.
function makeCleanPenDraft(version) {
  const rows = {};
  for (const row of version.rows) {
    rows[row.id] = { grams: String(row.grams), step: row.step, removed: row.removed ?? false };
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
    gramsDraft.rows['row-1'].grams = '999';
    expect(isPenDraftDirty('developing', gramsDraft, version)).toBe(true);

    const stepDraft = makeCleanPenDraft(version);
    stepDraft.rows['row-1'].step = 2;
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

function makeAmendBaseline(overrides = {}) {
  return {
    churnDate: '2026-08-02',
    asMade: { 'row-1': '100' },
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
    draft.asMade['row-2'] = '50';
    expect(isDraftDirty('recording', draft, baseline)).toBe(true);
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
