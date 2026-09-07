// The repo's first component test. Renders BatchMargin through
// renderToStaticMarkup (react-dom/server) in the existing node test
// environment — no jsdom, no testing-library, no new dependency (A-4).
// Each case renders a single batch so no Link renders and no router
// context is needed (BatchMargin only lists batches when there is more
// than one).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
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
      openPen={null}
      penReason={null}
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

const emptyTastingDraft = {
  date: '',
  tastingTempC: '',
  marks: {},
  meltdownLossG: '',
  words: '',
  nextTimeNote: '',
};

describe('BatchMargin — the tasting form can be abandoned (D-1 through D-4)', () => {
  it('heads the open form the way a read tasting is headed', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
      tastingDraft: emptyTastingDraft,
    });
    expect(markup).toContain('<p class="batch-margin__legend">Tasting</p>');
  });

  it('lands the caret in the tasting date field without a click', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
      tastingDraft: emptyTastingDraft,
    });
    const dateInput = markup.match(/<input[^>]*type="date"[^>]*\/>/)[0];
    expect(dateInput).toContain('autofocus=""');
  });

  it('offers both a way to save and a way to leave without writing', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
      tastingDraft: emptyTastingDraft,
    });
    expect(markup).toContain('Save tasting');
    expect(markup).toMatch(/<button[^>]*>Cancel<\/button>/);
  });

  it('offers the way back in once the form is closed', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
      tastingDraft: null,
    });
    expect(markup).toContain('Add a tasting');
    expect(markup).not.toContain('Save tasting');
  });
});

// The one-pen interlock (D-10, D-UAT-1), asserted where the diagnosis found
// it missing: RC2 is that Add a tasting had no disabled condition at all,
// and this component's own test file only ever asserted its presence
// (line 180's ancestor). openPen is the one derivation every opener here
// reads; none of them tests `mode` or `tastingDraft` directly any more.
describe('BatchMargin — the one-pen interlock reads openPen, not mode', () => {
  it('disables Amend, Record another batch and Add a tasting while the plan pen is open — this is the assertion that would have caught RC2', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
      openPen: 'plan',
      penReason: 'the plan is being developed',
    });
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Amend<\/button>/);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Record another batch<\/button>/);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Add a tasting<\/button>/);
  });

  it('disables Amend and Record another batch while a tasting is being written, even though the tasting form itself is not rendered here', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
      tastingDraft: null,
      openPen: 'tasting',
      penReason: 'a tasting is being written',
    });
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Amend<\/button>/);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Record another batch<\/button>/);
  });

  it('disables none of the three with no pen open', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
      openPen: null,
      penReason: null,
    });
    expect(markup).not.toMatch(/<button[^>]*disabled=""[^>]*>Amend<\/button>/);
    expect(markup).not.toMatch(/<button[^>]*disabled=""[^>]*>Record another batch<\/button>/);
    expect(markup).not.toMatch(/disabled=""[^>]*>Add a tasting<\/button>/);
  });

  it('disables Record a batch in the no-batch branch while the plan pen is open, and states the reason', () => {
    const markup = renderMargin({
      openBatch: null,
      batches: [],
      mode: 'reading',
      openPen: 'plan',
      penReason: 'the plan is being developed',
    });
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Record a batch<\/button>/);
    expect(markup).toContain('the plan is being developed');
  });
});

// D-UAT-2: the batch list itself (rendered only when a version has more
// than one batch) is not a way off the page while a pen is open.
const secondBatch = {
  ...structuredClone(augustSecondBatch),
  id: 'a-second-batch-id',
  churn: { ...structuredClone(augustSecondBatch.churn), churnDate: '2026-08-10' },
};

describe('BatchMargin — the batch list is not a way off the page while a pen is open (D-UAT-2)', () => {
  it('renders no anchor for the batch list while a pen is open, still reads each date in words, and carries the reason', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch, secondBatch],
      mode: 'reading',
      openPen: 'plan',
      penReason: 'the plan is being developed',
    });
    expect(markup).not.toContain('<a ');
    expect(markup).toContain('2 Aug 2026');
    expect(markup).toContain('10 Aug 2026');
    expect(markup).toContain('Another batch cannot be opened while the plan is being developed.');
  });

  it('still marks the batch already showing with is-open while a pen is open', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch, secondBatch],
      mode: 'reading',
      openPen: 'plan',
      penReason: 'the plan is being developed',
    });
    expect(markup).toMatch(/<li class="is-open">2 Aug 2026<\/li>/);
  });

  it('renders the batch list as links exactly as today with no pen open', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <BatchMargin
          version={oliveOilVersion}
          batches={[augustSecondBatch, secondBatch]}
          openBatch={augustSecondBatch}
          mode="reading"
          draft={null}
          openPen={null}
          penReason={null}
          onStartRecording={() => {}}
          onStartAmending={() => {}}
          onChangeChurnField={() => {}}
          onSaveBatch={() => {}}
          tastingDraft={null}
          onStartTasting={() => {}}
          onChangeTastingField={() => {}}
          onChangeTastingMark={() => {}}
          onUseAsExpectedShortcut={() => {}}
          onSaveTasting={() => {}}
          onCancelTasting={() => {}}
        />
      </MemoryRouter>,
    );
    expect(markup).toMatch(/<a href="\/recipe\/[^"]+\/batch\/[^"]+"[^>]*>2 Aug 2026<\/a>/);
    expect(markup).toMatch(/<a href="\/recipe\/[^"]+\/batch\/[^"]+"[^>]*>10 Aug 2026<\/a>/);
    expect(markup).not.toContain('cannot be opened while');
  });
});
