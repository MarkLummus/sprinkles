// Component test for the batch's own row (sketch 003 variant B, 03.3-01,
// merging BatchMargin.jsx's content with Versions.jsx's batch-owning
// openers/ceremony into one module). In the existing house style:
// renderToStaticMarkup (react-dom/server) in the node test environment,
// no jsdom, no testing-library. Wrapped in a MemoryRouter since the batch
// list renders Link elements. Several cases here are moved verbatim from
// Versions.test.jsx and BatchMargin.test.jsx, narrowed/merged to the
// batch-owning half.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { BatchRow } from './BatchRow.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';
import { readCustomProperties, readAllRules } from '../styles/css-source.js';

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

describe('BatchRow — the Batch region-name head line (sketch 003 variant B, G-03.3-4)', () => {
  it('renders the section with an aria-label of Batch and a visible "Batch" region-name heading', () => {
    const markup = renderBatchRow({});
    expect(markup).toContain('aria-label="Batch"');
    expect(markup).toContain('class="region-name">Batch<');
  });

  it('prints the "Batch" region-name heading exactly once', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch] });
    const occurrences = markup.split('class="region-name">Batch<').length - 1;
    expect(occurrences).toBe(1);
  });
});

describe('BatchRow — the head line (sketch 003 variant B, G-03.3-4)', () => {
  it('renders "churned <date>" beside the Batch heading when a batch is in view', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch] });
    expect(markup).toContain('class="batch-row__date">churned 2 Aug 2026<');
  });

  it('renders no churned-date span when no batch is in view', () => {
    const markup = renderBatchRow({ openBatch: null, batches: [] });
    expect(markup).not.toContain('batch-row__date');
  });

  it('renders the later-batches count, closed by default, with no list content rendered', () => {
    const markup = renderBatchRow({
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch, { ...augustSecondBatch, id: 'other-batch' }],
    });
    expect(markup).toContain('>1 later batch<');
    expect(markup).not.toContain('Batches of this version');
  });

  it('renders the plural count for more than one later batch', () => {
    const markup = renderBatchRow({
      openBatch: null,
      batches: [
        augustSecondBatch,
        { ...augustSecondBatch, id: 'other-batch-1' },
        { ...augustSecondBatch, id: 'other-batch-2' },
      ],
    });
    expect(markup).toContain('>3 later batches<');
  });

  it('renders no later-batches control when there are none beyond the one in view', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch] });
    expect(markup).not.toContain('later batch');
  });

  it('renders no churned-date span and no later-batches control while recording a new batch — that date names the batch in view, not the one being recorded (Mark, 2026-09-10 live review, G-03.3-4)', () => {
    const markup = renderBatchRow({
      openPen: 'record',
      mode: 'recording',
      draft: emptyChurnDraft,
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch, { ...augustSecondBatch, id: 'other-batch' }],
    });
    expect(markup).not.toContain('batch-row__date');
    expect(markup).not.toContain('later batch');
  });

  it('keeps the churned-date span and later-batches control while amending the batch in view', () => {
    const markup = renderBatchRow({
      openPen: 'amend',
      mode: 'recording',
      draft: { ...emptyChurnDraft, churnDate: '2026-08-02' },
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch, { ...augustSecondBatch, id: 'other-batch' }],
    });
    expect(markup).toContain('class="batch-row__date">churned 2 Aug 2026<');
    expect(markup).toContain('>1 later batch<');
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

  it('renders Correct and Add tasting when a batch is in view, as text controls at the row\'s foot (sketch 003 variant B, G-03.3-4)', () => {
    const markup = renderBatchRow({ openPen: null, openBatch: augustSecondBatch, batches: [augustSecondBatch] });
    expect(markup).not.toContain('Record another');
    expect(markup).toContain('>Correct<');
    expect(markup).toContain('Add tasting');
    const actsIndex = markup.indexOf('class="batch-row__acts"');
    const batchMarginCloseIndex = markup.indexOf('</div><div class="batch-row__acts"');
    expect(actsIndex).toBeGreaterThan(-1);
    expect(batchMarginCloseIndex).toBeGreaterThan(-1);
    const correctButton = markup.match(/<button[^>]*>Correct<\/button>/)[0];
    const addTastingButton = markup.match(/<button[^>]*>Add tasting<\/button>/)[0];
    expect(correctButton).toContain('class="text-control"');
    expect(addTastingButton).toContain('class="text-control"');
  });

  it('renders no openers while the plan pen is open — this row renders nothing at the top for a pen it does not own', () => {
    const markup = renderBatchRow({ openPen: 'plan', openBatch: augustSecondBatch, batches: [augustSecondBatch] });
    expect(markup).not.toContain('Record another');
    expect(markup).not.toContain('>Correct<');
    expect(markup).not.toContain('Add tasting');
  });
});

describe('BatchRow — the record and amend ceremony (D-05, D-10)', () => {
  it('renders the churn-date field as the field grid\'s first cell, ahead of the measured cells and prose fields, then Cancel and Save at the foot (Mark, 2026-09-10 live review, G-03.3-4)', () => {
    const markup = renderBatchRow({
      openPen: 'record',
      mode: 'recording',
      draft: { ...emptyChurnDraft, churnDate: '2026-08-09' },
    });
    expect(markup).toMatch(
      /<label class="batch-margin__field"><span>churned<\/span><input[^>]*type="date"[^>]*class="ink-field"[^>]*value="2026-08-09"/,
    );
    const churnDateIndex = markup.indexOf('<span>churned</span>');
    const timeToTempIndex = markup.indexOf('Time to temperature');
    const proseIndex = markup.indexOf('At the machine');
    const cancelIndex = markup.indexOf('Cancel');
    const saveIndex = markup.indexOf('>Save<');
    expect(churnDateIndex).toBeGreaterThanOrEqual(0);
    expect(timeToTempIndex).toBeGreaterThan(churnDateIndex);
    expect(proseIndex).toBeGreaterThan(timeToTempIndex);
    expect(cancelIndex).toBeGreaterThan(proseIndex);
    expect(saveIndex).toBeGreaterThan(cancelIndex);
  });

  it('renders the same field-grid-then-foot placement while amending', () => {
    const markup = renderBatchRow({
      openPen: 'amend',
      mode: 'recording',
      draft: { ...emptyChurnDraft, churnDate: '2026-08-02' },
    });
    expect(markup).toMatch(/<span>churned<\/span><input[^>]*type="date"[^>]*value="2026-08-02"/);
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

// The record pen's field widths (2026-09-10 checkpoint feedback,
// G-03.3-4): the churned date and the three churn number fields read at
// the width their own input needs, not the full page-width row they
// inherited once 03.3-06/07 widened the batch row to span the page. Read
// through css-source.js, the same stylesheet reader columns.test.js and
// binder.test.js already use — a rule can never be satisfied by prose
// about it.
describe("BatchRow — the record pen's field widths (2026-09-10 checkpoint feedback)", () => {
  const STYLES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'styles');
  const tokensSource = readFileSync(path.join(STYLES_DIR, 'tokens.css'), 'utf8');
  const appCssSource = readFileSync(path.join(STYLES_DIR, 'app.css'), 'utf8');
  const tokens = readCustomProperties(tokensSource);
  const rules = readAllRules(appCssSource);

  it('tokens.css declares a date-width and a figure-width token, each a ch value', () => {
    expect(tokens['--field-w-date']).toMatch(/^\d+(\.\d+)?ch$/);
    expect(tokens['--field-w-figure']).toMatch(/^\d+(\.\d+)?ch$/);
  });

  it('app.css sizes the tasting ceremony date field, the churned-date field in the recording grid, and the recording number fields through those tokens, never a literal', () => {
    const tastingDateRule = rules.find((r) => r.selector === ".versions__ceremony-field .ink-field[type='date']");
    const churnDateRule = rules.find((r) => r.selector === ".batch-margin__field .ink-field[type='date']");
    const figureRule = rules.find((r) => r.selector === ".batch-margin__field .ink-field[type='number']");
    expect(tastingDateRule, 'expected a rule sizing the tasting ceremony date field').toBeTruthy();
    expect(tastingDateRule.declarations).toMatch(/width:\s*var\(--field-w-date\)/);
    expect(churnDateRule, 'expected a rule sizing the churned-date field in the recording grid').toBeTruthy();
    expect(churnDateRule.declarations).toMatch(/width:\s*var\(--field-w-date\)/);
    expect(figureRule, 'expected a rule sizing the recording number fields').toBeTruthy();
    expect(figureRule.declarations).toMatch(/width:\s*var\(--field-w-figure\)/);
  });

  it("renders the churned-date field inside the pen's own field grid, in the same label style as the other three (Mark, 2026-09-10 live review, G-03.3-4)", () => {
    const markup = renderBatchRow({
      openPen: 'record',
      mode: 'recording',
      draft: { ...emptyChurnDraft, churnDate: '2026-08-09' },
    });
    expect(markup).toMatch(
      /<label class="batch-margin__field"><span>churned<\/span><input type="date" class="ink-field"/,
    );
  });

  it('lays the three number fields side by side in the same cells grid the reading state uses', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyChurnDraft });
    const cellsIndex = markup.indexOf('batch-row__cells');
    expect(cellsIndex).toBeGreaterThanOrEqual(0);
    const machineIndex = markup.indexOf('At the machine');
    expect(machineIndex).toBeGreaterThan(cellsIndex);
    const cellsBlock = markup.slice(cellsIndex, machineIndex);
    expect(cellsBlock).toContain('Time to temperature');
    expect(cellsBlock).toContain('Draw temperature');
    expect(cellsBlock).toContain('Air, overrun %');
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
  it('renders the churn triple (come-up, draw temperature, air) with plain-word labels and units beside the figures', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toContain('batch-row__cells');
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Time to temperature<\/span><span class="batch-row__cell-value">20<span class="batch-row__unit"> min<\/span><\/span><span class="batch-row__plan">plan 10–12 min<\/span>/,
    );
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Draw temperature<\/span><span class="batch-row__cell-value">−6<span class="batch-row__unit"> °C<\/span><\/span><\/div>/,
    );
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Air<\/span><span class="batch-row__cell-value"><span class="batch-row__unit">not measured<\/span><\/span><span class="batch-row__plan">overrun<\/span>/,
    );
  });

  it('renders no batch-margin__measured element any more — that rendering retired with BatchMargin.jsx', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).not.toContain('batch-margin__measured');
  });

  it('renders the recorded-against and amended facts as figure cells, not prose sentences', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Recorded<\/span><span class="batch-row__cell-value">4 Aug 2026 against 50 g oil · 800 g<\/span>/,
    );
    expect(markup).not.toContain('class="ink-text">recorded');
    expect(markup).not.toContain('class="ink-text">amended');
  });

  it('renders the draw notes and ingredient notes with the prose-text class', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toMatch(/<p class="prose-text">Soft, not greasy<\/p>/);
    expect(markup).toMatch(/<p class="prose-text">Oil bottle open date 24 Jul 2026<\/p>/);
  });
});

describe('BatchRow — the tasting head line and marked-axes-only cells (sketch 003 variant B, G-03.3-4)', () => {
  it('renders one Tasting head line naming the temperature and date', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toMatch(
      /<p class="region-name">Tasting <span class="batch-row__tasting-meta">· at −12 °C · date unknown<\/span><\/p>/,
    );
    expect(markup).not.toContain('Tasting temperature, °C');
  });

  it('renders only marked axes as cells; no unmarked-axis cell renders', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toContain('>Olive oil character<');
    expect(markup).toContain('>Bitterness<');
    expect(markup).toContain('>Sweetness<');
    expect(markup).not.toContain('>Hardness<');
    expect(markup).not.toContain('>Scoopability<');
    expect(markup).not.toContain('>Smoothness<');
  });

  it('renders the melt-test cell with a static "g at 20 min" unit', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Melt test<\/span><span class="batch-row__cell-value">3<span class="batch-row__unit"> g at 20 min<\/span><\/span>/,
    );
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

describe('BatchRow — the batch list, always a list only with zero batches; a closed-by-default disclosure otherwise (D-09, sketch 003 variant B, G-03.3-4)', () => {
  it('reads "no batch yet" with no batch recorded', () => {
    const markup = renderBatchRow({ batches: [] });
    expect(markup).toMatch(/<ul class="batch-margin__list"><li>no batch yet<\/li><\/ul>/);
  });

  it('renders no "Batches of this version" section by default when a batch exists — the disclosure is closed by default', () => {
    const markup = renderBatchRow({ batches: [augustSecondBatch], openBatch: augustSecondBatch });
    expect(markup).not.toContain('Batches of this version');
    expect(markup).not.toContain('batch-margin__list');
  });

  it('renders no "Batches of this version" section by default with an address that matches no batch', () => {
    const markup = renderBatchRow({ batches: [augustSecondBatch], openBatch: null });
    expect(markup).not.toContain('Batches of this version');
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
