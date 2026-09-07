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
import { derivePenState } from './RecipePage.jsx';
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
