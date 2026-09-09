// Renders BatchMargin through renderToStaticMarkup (react-dom/server) in
// the existing node test environment — no jsdom, no testing-library, no
// new dependency (A-4). BatchMargin renders no Link and no router
// context is needed: the batch list and every opener moved to
// Versions.jsx (D-04, D-09) — this file covers the record's content
// alone.
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
      onChangeChurnField={noop}
      tastingDraft={null}
      onChangeTastingField={noop}
      onChangeTastingMark={noop}
      {...props}
    />,
  );
}

describe('BatchMargin — saved-batch reading state', () => {
  it('renders the record content — measured fields and the recorded-against line — with no opener of its own (D-04, D-09: openers and the batch list live in Versions now)', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
    });
    expect(markup).not.toContain('Record another batch');
    expect(markup).not.toContain('>Amend<');
    expect(markup).toContain('recorded 4 Aug 2026');
  });
});

describe('BatchMargin — zero-batch state', () => {
  it('reads "no batch yet" — the record own placeholder line (D-09)', () => {
    const markup = renderMargin({ openBatch: null, batches: [] });
    expect(markup).not.toContain('Record a batch');
    expect(markup).toContain('no batch yet');
  });
});

describe('BatchMargin — unknown-address state', () => {
  it('says the address is not a batch of this version, not that the version has no batch', () => {
    const markup = renderMargin({ openBatch: null, batches: [augustSecondBatch] });
    expect(markup).not.toContain('no batch yet');
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

describe('BatchMargin — recording state offers no control of its own (D-04: the save pair moved to Versions)', () => {
  it('renders the churn fields with no Save or Cancel button', () => {
    const markup = renderMargin({ mode: 'recording', draft: emptyDraft });
    expect(markup).not.toContain('<button');
    expect(markup).toContain('Come-up');
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

  it('renders the tasting date field with no autoFocus — that lands in the ceremony instead (Rule 1: two autofocus elements is undefined behaviour)', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
      tastingDraft: emptyTastingDraft,
    });
    const dateInput = markup.match(/<input[^>]*type="date"[^>]*\/>/)[0];
    expect(dateInput).not.toContain('autofocus');
  });

  it('renders no Save or Cancel control at all — those and the shortcut moved to Versions (D-04)', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
      tastingDraft: emptyTastingDraft,
    });
    expect(markup).not.toContain('Save tasting');
    expect(markup).not.toContain('<button');
    expect(markup).not.toContain('As expected, nothing to note');
  });

  it('renders no tasting form at all once it is closed — the opener that reopens it lives in Versions now (D-04)', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
      tastingDraft: null,
    });
    expect(markup).not.toContain('Add a tasting');
    expect(markup).not.toContain('Save tasting');
  });
});

// The one-pen interlock's own openers (Amend, Record another batch,
// Record a batch, Add a tasting) and the batch list (D-UAT-2) moved to
// Versions.jsx in this plan (D-04, D-09) — their coverage moved to
// Versions.test.jsx along with the markup, rather than being deleted.
describe('BatchMargin — no opener of any kind renders here any more (D-04)', () => {
  it('renders no button at all in the saved-batch reading state', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
    });
    expect(markup).not.toContain('<button');
  });
});

// The record's own prose reads in the text face, in both the margin and
// the method (route-recipe-batch.md § 6, revised 2026-09-08); counted
// values keep the grotesk (03.1-04, task 1).
describe('BatchMargin — the record\'s own prose carries the text face (03.1-04)', () => {
  it('renders the draw notes and ingredient notes with the prose-text class, in the reading state', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
    });
    expect(markup).toMatch(/<p class="prose-text">Soft, not greasy<\/p>/);
    expect(markup).toMatch(/<p class="prose-text">Oil bottle open date 24 Jul 2026<\/p>/);
  });

  it('keeps the measured churn fields in ink-text, not prose-text', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
    });
    expect(markup).toMatch(/<span class="ink-text">20<\/span>/);
  });

  it("carries the prose-field treatment on the recording state's draw notes, ingredient notes, and next time — the measured fields beside them keep ink-field", () => {
    const markup = renderMargin({ mode: 'recording', draft: emptyDraft });
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"[^>]*aria-label="Draw notes"/);
    expect(markup).toMatch(/<input[^>]*class="prose-field"[^>]*aria-label="Ingredient notes"/);
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"[^>]*aria-label="Next time"/);
    expect(markup).toMatch(/<input[^>]*class="ink-field"[^>]*aria-label="Come-up, minutes"/);
  });

  it('keeps the measured churn fields (come-up, draw temperature, overrun) in ink-field', () => {
    const markup = renderMargin({ mode: 'recording', draft: emptyDraft });
    const comeUpInput = markup.match(/<input[^>]*aria-label="Come-up, minutes"[^>]*\/>/)[0];
    expect(comeUpInput).toContain('class="ink-field"');
  });
});

// Every churn and tasting field renders in every state of the record pen
// (D-25) — none of them is on demand; only the batch pen's per-step line
// (Method.jsx) is.
describe('BatchMargin — every churn and tasting field is always present (D-25)', () => {
  it('renders all six recording churn fields', () => {
    const markup = renderMargin({ mode: 'recording', draft: emptyDraft });
    for (const label of ['Come-up', 'Draw temperature', 'Overrun', 'Draw notes', 'Ingredient notes', 'Next time']) {
      expect(markup).toContain(label);
    }
  });

  it('renders the tasting form\'s words and next-time fields with the prose-field treatment', () => {
    const markup = renderMargin({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
      tastingDraft: emptyTastingDraft,
    });
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"[^>]*aria-label="Words"/);
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"[^>]*aria-label="Next time"/);
  });
});
