// Component test for the batch's own row (sketch 003 variant B, 03.3-01,
// merging BatchMargin.jsx's content with Versions.jsx's batch-owning
// openers/ceremony into one module). In the existing house style:
// renderToStaticMarkup (react-dom/server) in the node test environment,
// no jsdom, no testing-library. Wrapped in a MemoryRouter since the batch
// list renders Link elements. Several cases here are moved verbatim from
// Versions.test.jsx and BatchMargin.test.jsx, narrowed/merged to the
// batch-owning half.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { BatchRow } from './BatchRow.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

const noop = () => {};

const emptyChurnDraft = {
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

const emptyTastingDraft = {
  date: '',
  tastingTempC: '',
  marks: {},
  meltdownLossG: '',
  words: '',
  nextTimeNote: '',
};

function renderBatchRow(props) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <BatchRow
        version={oliveOilVersion}
        batches={[]}
        openBatch={null}
        mode="reading"
        draft={null}
        onChangeChurnField={noop}
        tastingDraft={null}
        onChangeTastingField={noop}
        onChangeTastingMark={noop}
        openPen={null}
        penReason={null}
        penSaveDisabled={false}
        penHint={null}
        onStartAmending={noop}
        onChangeChurnDate={noop}
        onCancelRecording={noop}
        onSaveBatch={noop}
        onStartTasting={noop}
        onUseAsExpectedShortcut={noop}
        onSaveTasting={noop}
        onCancelTasting={noop}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('BatchRow — no page-level running head (ROADMAP Scope bullet 1)', () => {
  it('renders the section with an aria-label of Batch and no region-name heading', () => {
    const markup = renderBatchRow({});
    expect(markup).toContain('aria-label="Batch"');
    expect(markup).not.toContain('className="region-name"');
  });

  it('prints the "Batch" legend exactly once', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch] });
    const occurrences = markup.split('batch-margin__legend">Batch<').length - 1;
    expect(occurrences).toBe(1);
  });
});

describe('BatchRow — the openers, present only with no pen open (D-05)', () => {
  it('renders no Correct or Add tasting when the version has no batch — Record now lives in VersionRow (G-03.3-4)', () => {
    const markup = renderBatchRow({ openPen: null, openBatch: null, batches: [] });
    expect(markup).not.toContain('Record another');
    expect(markup).not.toContain('Record batch');
    expect(markup).not.toContain('>Correct<');
    expect(markup).not.toContain('Add tasting');
  });

  it('renders Correct and Add tasting when a batch is in view', () => {
    const markup = renderBatchRow({ openPen: null, openBatch: augustSecondBatch, batches: [augustSecondBatch] });
    expect(markup).not.toContain('Record another');
    expect(markup).toContain('>Correct<');
    expect(markup).toContain('Add tasting');
  });

  it('renders no openers while the plan pen is open — this row renders nothing at the top for a pen it does not own', () => {
    const markup = renderBatchRow({ openPen: 'plan', openBatch: augustSecondBatch, batches: [augustSecondBatch] });
    expect(markup).not.toContain('Record another');
    expect(markup).not.toContain('>Correct<');
    expect(markup).not.toContain('Add tasting');
  });
});

describe('BatchRow — the record and amend ceremony (D-05, D-10)', () => {
  it('renders the churn-date field and Cancel then Save, bound to onCancelRecording/onSaveBatch', () => {
    const markup = renderBatchRow({ openPen: 'record', draft: { ...emptyChurnDraft, churnDate: '2026-08-09' } });
    expect(markup).toMatch(/<input[^>]*type="date"[^>]*class="ink-field"[^>]*value="2026-08-09"/);
    const cancelIndex = markup.indexOf('Cancel');
    const saveIndex = markup.indexOf('>Save<');
    expect(cancelIndex).toBeGreaterThanOrEqual(0);
    expect(saveIndex).toBeGreaterThan(cancelIndex);
  });

  it('renders the same ceremony while amending', () => {
    const markup = renderBatchRow({ openPen: 'amend', draft: { ...emptyChurnDraft, churnDate: '2026-08-02' } });
    expect(markup).toMatch(/<input[^>]*type="date"[^>]*value="2026-08-02"/);
    expect(markup).toContain('Cancel');
    expect(markup).toContain('>Save<');
  });
});

describe('BatchRow — the tasting ceremony (D-05, D-10)', () => {
  it('renders the tasting-date field, the As expected shortcut, then Cancel then Save', () => {
    const markup = renderBatchRow({ openPen: 'tasting', tastingDraft: emptyTastingDraft });
    expect(markup).toMatch(/<input[^>]*type="date"[^>]*class="ink-field"[^>]*autofocus=""/);
    expect(markup).toContain('As expected, nothing to note');
    const shortcutIndex = markup.indexOf('As expected, nothing to note');
    const cancelIndex = markup.indexOf('Cancel');
    const saveIndex = markup.indexOf('>Save<');
    expect(cancelIndex).toBeGreaterThan(shortcutIndex);
    expect(saveIndex).toBeGreaterThan(cancelIndex);
  });

  it('disables Save and shows the hint when the tasting is not saveable', () => {
    const markup = renderBatchRow({
      openPen: 'tasting',
      tastingDraft: emptyTastingDraft,
      penSaveDisabled: true,
      penHint: 'Write words or mark at least one axis to save.',
    });
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Save<\/button>/);
    expect(markup).toContain('Write words or mark at least one axis to save.');
  });
});

describe('BatchRow — one hint sentence while the pen is open (D-06)', () => {
  it('renders the hint sentence exactly once while a batch pen is open', () => {
    const markup = renderBatchRow({ openPen: 'record', draft: emptyChurnDraft });
    const occurrences = markup.split('Links return after you save or cancel.').length - 1;
    expect(occurrences).toBe(1);
  });

  it('renders no hint sentence with no pen open', () => {
    const markup = renderBatchRow({ openPen: null });
    expect(markup).not.toContain('Links return after you save or cancel.');
  });
});

describe('BatchRow — recording state', () => {
  it('renders all six recording churn fields', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyChurnDraft });
    for (const label of ['Time to temperature', 'Draw temperature', 'Air, overrun %', 'At the machine', 'Ingredient notes', 'Next time']) {
      expect(markup).toContain(label);
    }
  });

  it('keeps the measured churn fields (come-up, draw temperature, overrun) in ink-field', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyChurnDraft });
    const comeUpInput = markup.match(/<input[^>]*aria-label="Time to temperature, minutes"[^>]*\/>/)[0];
    expect(comeUpInput).toContain('class="ink-field"');
  });

  it('carries the prose-field treatment on draw notes, ingredient notes, and next time (a written value drops the empty modifier — see the dedicated describe block below)', () => {
    const markup = renderBatchRow({
      mode: 'recording',
      draft: { ...emptyChurnDraft, drawNotes: 'Soft', ingredientNotes: 'Oil open', nextTimeNote: 'Less oil' },
    });
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"[^>]*aria-label="At the machine"/);
    expect(markup).toMatch(/<input[^>]*class="prose-field"[^>]*aria-label="Ingredient notes"/);
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"[^>]*aria-label="Next time"/);
  });
});

// The hairline-baseline fix (03.1 Gap 2 override, 03.3-01): a blank named
// prose field carries prose-field--empty until it holds text; a written
// field drops the modifier — no visible label word is ever added.
describe('BatchRow — the three named prose fields carry a hairline rule when empty (03.1 Gap 2)', () => {
  it('applies prose-field--empty to draw notes, ingredient notes and next time when each is blank', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyChurnDraft });
    expect(markup).toMatch(/<textarea[^>]*class="prose-field prose-field--empty"[^>]*aria-label="At the machine"/);
    expect(markup).toMatch(/<input[^>]*class="prose-field prose-field--empty"[^>]*aria-label="Ingredient notes"/);
    expect(markup).toMatch(/<textarea[^>]*class="prose-field prose-field--empty"[^>]*aria-label="Next time"/);
  });

  it('drops prose-field--empty once each field holds text', () => {
    const markup = renderBatchRow({
      mode: 'recording',
      draft: { ...emptyChurnDraft, drawNotes: 'Soft', ingredientNotes: 'Oil open', nextTimeNote: 'Less oil' },
    });
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"[^>]*aria-label="At the machine"/);
    expect(markup).not.toMatch(/aria-label="At the machine"[^>]*class="prose-field prose-field--empty"/);
    const drawNotesField = markup.match(/<textarea[^>]*aria-label="At the machine"[^>]*>/)[0];
    expect(drawNotesField).not.toContain('prose-field--empty');
    const ingredientNotesField = markup.match(/<input[^>]*aria-label="Ingredient notes"[^>]*\/>/)[0];
    expect(ingredientNotesField).not.toContain('prose-field--empty');
    const nextTimeField = markup.match(/<textarea[^>]*aria-label="Next time"[^>]*>/)[0];
    expect(nextTimeField).not.toContain('prose-field--empty');
  });
});

describe('BatchRow — the record\'s reading state, measured values as cells (sketch 003 variant B)', () => {
  it('renders the churn triple (come-up, draw temperature, overrun) inside batch-row__cells', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toContain('batch-row__cells');
    expect(markup).toMatch(
      /<div class="batch-row__cell"><span class="batch-row__cell-label">Time to temperature, min<\/span><span class="batch-row__cell-value">20<\/span><\/div>/,
    );
    expect(markup).toMatch(
      /<div class="batch-row__cell"><span class="batch-row__cell-label">Draw temperature, °C<\/span><span class="batch-row__cell-value">−6<\/span><\/div>/,
    );
    expect(markup).toMatch(
      /<div class="batch-row__cell"><span class="batch-row__cell-label">Air, overrun %<\/span><span class="batch-row__cell-value">unknown<\/span><\/div>/,
    );
  });

  it('renders no batch-margin__measured element any more — that rendering retired with BatchMargin.jsx', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).not.toContain('batch-margin__measured');
  });

  it('renders the record content — measured fields and the recorded-against line', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toContain('recorded 4 Aug 2026');
  });

  it('renders the draw notes and ingredient notes with the prose-text class', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toMatch(/<p class="prose-text">Soft, not greasy<\/p>/);
    expect(markup).toMatch(/<p class="prose-text">Oil bottle open date 24 Jul 2026<\/p>/);
  });
});

describe('BatchRow — a tasting\'s own measured/mark rows also read as cells', () => {
  it('renders the tasting temperature and meltdown as batch-row__cells, an unmarked axis reading "unmarked"', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Tasting temperature, °C<\/span><span class="batch-row__cell-value">−12<\/span>/,
    );
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Melt test, g<\/span><span class="batch-row__cell-value">3<\/span>/,
    );
    expect(markup).toContain('>unmarked<');
  });
});

describe('BatchRow — zero-batch and unknown-address states', () => {
  it('reads "no batch yet" with no batch recorded', () => {
    const markup = renderBatchRow({ openBatch: null, batches: [] });
    expect(markup).toContain('no batch yet');
  });

  it('says the address is not a batch of this version, not that the version has no batch', () => {
    const markup = renderBatchRow({ openBatch: null, batches: [augustSecondBatch] });
    expect(markup).not.toContain('no batch yet');
    expect(markup).toContain('No batch of this version has that address.');
  });
});

describe('BatchRow — the batch list, always a list (D-09)', () => {
  it('reads "no batch yet" with no batch recorded', () => {
    const markup = renderBatchRow({ batches: [] });
    expect(markup).toMatch(/<ul class="batch-margin__list"><li>no batch yet<\/li><\/ul>/);
  });

  it('renders a single batch as a list entry, "churned <date>", an ink link', () => {
    const markup = renderBatchRow({ batches: [augustSecondBatch], openBatch: null });
    expect(markup).toMatch(/<li[^>]*><a[^>]*href="\/recipe\/olive-oil-ice-cream-v1\/batch\/[^"]+"[^>]*>churned 2 Aug 2026<\/a><\/li>/);
  });

  it('renders the open batch as plain text with the is-open class, not a link', () => {
    const markup = renderBatchRow({ batches: [augustSecondBatch], openBatch: augustSecondBatch });
    expect(markup).toMatch(/<li class="is-open">churned 2 Aug 2026<\/li>/);
  });

  it('renders no links in the batch list while a pen is open', () => {
    const markup = renderBatchRow({
      batches: [augustSecondBatch],
      openBatch: augustSecondBatch,
      openPen: 'record',
      draft: emptyChurnDraft,
    });
    expect(markup).not.toMatch(/<a[^>]*\/batch\//);
    expect(markup).toContain('churned 2 Aug 2026');
  });
});

describe('BatchRow — the tasting form', () => {
  it('heads the open form the way a read tasting is headed', () => {
    const markup = renderBatchRow({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
      tastingDraft: emptyTastingDraft,
    });
    expect(markup).toContain('<p class="batch-margin__legend">Tasting</p>');
  });

  it('renders the tasting date field with no autoFocus — that lands in the ceremony instead', () => {
    const markup = renderBatchRow({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
      tastingDraft: emptyTastingDraft,
    });
    const dateInputs = markup.match(/<input[^>]*type="date"[^>]*\/>/g);
    // Only the reading state's tasting form date input is present here
    // (openPen is null so no ceremony renders); it carries no autofocus.
    for (const input of dateInputs) {
      expect(input).not.toContain('autofocus');
    }
  });

  it('renders no tasting form at all once it is closed', () => {
    const markup = renderBatchRow({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch],
      mode: 'reading',
      tastingDraft: null,
    });
    expect(markup).not.toContain('tasting--recording');
  });
});
