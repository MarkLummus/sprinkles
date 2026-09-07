// The repo's first component test. Renders BatchMargin through
// renderToStaticMarkup (react-dom/server) in the existing node test
// environment — no jsdom, no testing-library, no new dependency (A-4).
// Each case renders a single batch so no Link renders and no router
// context is needed (BatchMargin only lists batches when there is more
// than one).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BatchMargin } from './BatchMargin.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

const noop = () => {};

function renderMargin(props) {
  return renderToStaticMarkup(
    <BatchMargin
      version={oliveOilVersion}
      batches={[]}
      openBatch={null}
      mode="reading"
      draft={null}
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
      {...props}
    />,
  );
}

describe('BatchMargin — saved-batch reading state', () => {
  it('offers both a way to record another batch and a way to amend, worded differently', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
    });
    expect(markup).toContain('Record another batch');
    expect(markup).toContain('Amend');
    expect('Record another batch').not.toBe('Amend');
  });
});

describe('BatchMargin — zero-batch state', () => {
  it('says no batch is recorded against this version yet', () => {
    const markup = renderMargin({ openBatch: null, batches: [] });
    expect(markup).toContain('Record a batch');
    expect(markup).toContain('No batch recorded against this version yet.');
  });
});

describe('BatchMargin — unknown-address state', () => {
  it('says the address is not a batch of this version, not that the version has no batch', () => {
    const markup = renderMargin({ openBatch: null, batches: [augustSecondBatch] });
    expect(markup).not.toContain('No batch recorded against this version yet.');
    expect(markup).toContain('No batch of this version has that address.');
  });
});

describe('BatchMargin — the two entry states are distinguishable', () => {
  it('renders different wording for zero-batch and unknown-address', () => {
    const zeroBatch = renderMargin({ openBatch: null, batches: [] });
    const unknownAddress = renderMargin({ openBatch: null, batches: [augustSecondBatch] });
    expect(zeroBatch).not.toBe(unknownAddress);
  });
});

const emptyDraft = {
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

describe('BatchMargin — recording state offers a way out that does not save', () => {
  it('offers both Save batch and Cancel, Cancel as a real button', () => {
    const markup = renderMargin({ mode: 'recording', draft: emptyDraft });
    expect(markup).toContain('Save batch');
    expect(markup).toContain('Cancel');
    expect(markup).toMatch(/<button[^>]*>Cancel<\/button>/);
  });
});

describe('BatchMargin — reading state offers no way to abandon an edit that is not happening', () => {
  it('does not render the cancel wording', () => {
    const markup = renderMargin({ openBatch: null, batches: [], mode: 'reading' });
    expect(markup).not.toContain('Cancel');
  });
});

describe('BatchMargin — the churn date moved to the headnote (D-01)', () => {
  it('renders no date input and no field labelled for the churn date while recording', () => {
    const markup = renderMargin({ mode: 'recording', draft: emptyDraft });
    expect(markup).not.toMatch(/type="date"/);
    expect(markup).not.toContain('Churn date');
  });

  it('opens the recording churn section at come-up, not the churn date', () => {
    const markup = renderMargin({ mode: 'recording', draft: emptyDraft });
    const comeUpIndex = markup.indexOf('Come-up');
    const drawTempIndex = markup.indexOf('Draw temperature');
    expect(comeUpIndex).toBeGreaterThan(-1);
    expect(drawTempIndex).toBeGreaterThan(-1);
    expect(comeUpIndex).toBeLessThan(drawTempIndex);
  });

  it('no longer prints the churn date in the reading state, while the recorded-on line still does', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
    });
    expect(markup).not.toContain('2 Aug 2026');
    expect(markup).toContain('4 Aug 2026');
  });
});
