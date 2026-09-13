// Component test for the batch's own row (sketch 003 variant B, 03.3-01;
// rebuilt to the full battery, one-save model in 03.3.1-02). In the
// existing house style: renderToStaticMarkup (react-dom/server), no
// jsdom, no testing-library. Wrapped in a MemoryRouter since the batch
// list renders Link elements. The tasting pen and its ceremony retire
// with this plan (D-01/D-03) — their own coverage lived here before and
// is removed, not adapted, since no tasting section renders until plan 03.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { BatchRow } from './BatchRow.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

const noop = () => {};

const emptyRecordDraft = {
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

// A batch with no tasting at all — augustSecondBatch's own seed carries
// one, so the "not tasted yet" sentence needs its own untasted fixture.
const untastedBatch = { ...augustSecondBatch, tasting: null };

function renderBatchRow(props) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <BatchRow
        version={oliveOilVersion}
        batches={[]}
        openBatch={null}
        mode="reading"
        draft={null}
        onChangeRecordField={noop}
        onChangeSegment={noop}
        openPen={null}
        penReason={null}
        onStartAmending={noop}
        onCancelRecording={noop}
        onSaveBatch={noop}
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
      draft: emptyRecordDraft,
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
      draft: { ...emptyRecordDraft, churnDate: '2026-08-02' },
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch, { ...augustSecondBatch, id: 'other-batch' }],
    });
    expect(markup).toContain('class="batch-row__date">churned 2 Aug 2026<');
    expect(markup).toContain('>1 later batch<');
  });
});

describe('BatchRow — the openers, present only with no pen open (D-05)', () => {
  it('renders no Correct when the version has no batch — Record lives in VersionRow, Add tasting arrives in plan 03', () => {
    const markup = renderBatchRow({ openPen: null, openBatch: null, batches: [] });
    expect(markup).not.toContain('Record another');
    expect(markup).not.toContain('Record batch');
    expect(markup).not.toContain('>Correct<');
    expect(markup).not.toContain('Add tasting');
  });

  it('renders Correct, as a text control at the row\'s foot, when a batch is in view — no Add tasting yet (plan 03 opens the tasting section)', () => {
    const markup = renderBatchRow({ openPen: null, openBatch: augustSecondBatch, batches: [augustSecondBatch] });
    expect(markup).not.toContain('Record another');
    expect(markup).toContain('>Correct<');
    expect(markup).not.toContain('Add tasting');
    const correctButton = markup.match(/<button[^>]*>Correct<\/button>/)[0];
    expect(correctButton).toContain('class="text-control"');
  });

  it('renders no openers while the plan pen is open — this row renders nothing at the top for a pen it does not own', () => {
    const markup = renderBatchRow({ openPen: 'plan', openBatch: augustSecondBatch, batches: [augustSecondBatch] });
    expect(markup).not.toContain('Record another');
    expect(markup).not.toContain('>Correct<');
    expect(markup).not.toContain('Add tasting');
  });
});

describe('BatchRow — the record and amend ceremony, the battery\'s churn section (D-01, contract "DOM order inventory")', () => {
  it('renders the churn-date field first, then the three measured fields, the two segmented controls, the two textareas, then ceremony A, in that DOM order', () => {
    const markup = renderBatchRow({
      openPen: 'record',
      mode: 'recording',
      draft: { ...emptyRecordDraft, churnDate: '2026-08-09' },
    });
    expect(markup).toMatch(
      /<label class="batch-margin__field"><span>churned<\/span><input[^>]*type="date"[^>]*class="ink-field"[^>]*value="2026-08-09"/,
    );
    const churnDateIndex = markup.indexOf('<span>churned</span>');
    const timeToDrawIndex = markup.indexOf('Time to draw temp.');
    const outOfMachineIndex = markup.indexOf('Out of machine');
    const churnDurationIndex = markup.indexOf('Churn duration');
    const exitConsistencyIndex = markup.indexOf('Exit consistency');
    const airinessIndex = markup.indexOf('Airiness (estimated)');
    const atTheMachineIndex = markup.indexOf('aria-label="At the machine"');
    const ingredientNotesIndex = markup.indexOf('aria-label="Ingredient notes"');
    const ceremonyIndex = markup.indexOf('class="save-ceremony"');
    const nextTimeIndex = markup.indexOf('aria-label="Next time"');
    expect(churnDateIndex).toBeGreaterThanOrEqual(0);
    expect(timeToDrawIndex).toBeGreaterThan(churnDateIndex);
    expect(outOfMachineIndex).toBeGreaterThan(timeToDrawIndex);
    expect(churnDurationIndex).toBeGreaterThan(outOfMachineIndex);
    expect(exitConsistencyIndex).toBeGreaterThan(churnDurationIndex);
    expect(airinessIndex).toBeGreaterThan(exitConsistencyIndex);
    expect(atTheMachineIndex).toBeGreaterThan(airinessIndex);
    expect(ingredientNotesIndex).toBeGreaterThan(atTheMachineIndex);
    expect(ceremonyIndex).toBeGreaterThan(ingredientNotesIndex);
    expect(nextTimeIndex).toBeGreaterThan(ceremonyIndex);
  });

  it('renders the same field-grid-then-ceremony placement while amending', () => {
    const markup = renderBatchRow({
      openPen: 'amend',
      mode: 'recording',
      draft: { ...emptyRecordDraft, churnDate: '2026-08-02' },
    });
    expect(markup).toMatch(/<span>churned<\/span><input[^>]*type="date"[^>]*value="2026-08-02"/);
    expect(markup).toContain('class="save-ceremony"');
    expect(markup).toContain('Save batch');
  });

  it('never renders a disabled Save batch button — the record pen has no completeness gate (D-02)', () => {
    const markup = renderBatchRow({ openPen: 'record', mode: 'recording', draft: emptyRecordDraft });
    expect(markup).not.toContain('disabled=""');
  });
});

describe('BatchRow — one hint sentence while the pen is open (D-06)', () => {
  it('renders the hint sentence exactly once while a batch pen is open', () => {
    const markup = renderBatchRow({ openPen: 'record', draft: emptyRecordDraft });
    const occurrences = markup.split('Links return after you save or cancel.').length - 1;
    expect(occurrences).toBe(1);
  });

  it('renders no hint sentence with no pen open', () => {
    const markup = renderBatchRow({ openPen: null });
    expect(markup).not.toContain('Links return after you save or cancel.');
  });
});

describe('BatchRow — the numeric battery fields (contract "Controls spec")', () => {
  it('renders all three churn measured fields, text-mode with inputMode="decimal", never type="number"', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyRecordDraft });
    for (const label of ['Time to draw temp.', 'Out of machine', 'Churn duration']) {
      expect(markup).toContain(label);
    }
    expect(markup).not.toContain('type="number"');
    const timeToDrawInput = markup.match(/<input[^>]*aria-label="Time to draw temp\., minutes"[^>]*\/>/)[0];
    expect(timeToDrawInput).toContain('inputMode="decimal"');
    expect(timeToDrawInput).toContain('class="ink-field"');
  });

  it('spells out the unit in the accessible name for a °C field', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyRecordDraft });
    expect(markup).toContain('aria-label="Out of machine, degrees Celsius"');
  });

  // The .field-error line, aria-invalid, aria-describedby wiring and the
  // first-invalid-field focus move are Task 2's build (03.3.1-02); Task 1
  // renders no error state on the field itself yet — see RecipePage.test.jsx's
  // own coverage of parseAllMeasuredFields for "storing the errors and
  // aborting" (Task 1's own minimum).
  it('renders no aria-invalid or field-error markup yet — Task 1 stores errors and aborts the save without wiring the field-level UI', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, outOfMachineTempC: '4o' } });
    expect(markup).not.toContain('aria-invalid');
    expect(markup).not.toContain('field-error');
  });
});

describe('BatchRow — the two segmented controls (contract "Controls spec")', () => {
  it('renders Exit consistency and Airiness (estimated) as radiogroups with the contract\'s own option strings', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyRecordDraft });
    expect(markup).toMatch(/role="radiogroup" aria-label="Exit consistency"/);
    expect(markup).toMatch(/role="radiogroup" aria-label="Airiness \(estimated\)"/);
    for (const option of ['Smooth ribbon', 'Wet, soupy', 'Chunky, separated']) {
      expect(markup).toContain(option);
    }
    for (const option of ['Low, dense', 'Medium, standard', 'High, airy']) {
      expect(markup).toContain(option);
    }
  });

  it('checks no option by default (blank stays blank)', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyRecordDraft });
    expect(markup).not.toContain('checked=""');
  });

  it('checks the picked option when the draft holds one', () => {
    const markup = renderBatchRow({
      mode: 'recording',
      draft: { ...emptyRecordDraft, exitConsistency: 'Wet, soupy' },
    });
    const checkedInput = markup.match(/<input[^>]*value="Wet, soupy"[^>]*\/>/)[0];
    expect(checkedInput).toContain('checked=""');
  });
});

describe('BatchRow — the textareas (contract "Textareas")', () => {
  it('renders At the machine with no placeholder, and Ingredient notes with the contract\'s own placeholder', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyRecordDraft });
    const atTheMachine = markup.match(/<textarea[^>]*aria-label="At the machine"[^>]*>/)[0];
    expect(atTheMachine).not.toContain('placeholder');
    expect(markup).toContain('placeholder="e.g. oil bottle opened 24 Jul"');
  });

  it('renders the shared Next time textarea with the contract\'s own placeholder', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyRecordDraft });
    expect(markup).toContain('placeholder="optional — for the batch, the tasting, or both"');
  });

  it('carries dir="auto" on every textarea', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyRecordDraft });
    const textareas = markup.match(/<textarea[^>]*>/g);
    for (const textarea of textareas) {
      expect(textarea).toContain('dir="auto"');
    }
  });

  it('carries the prose-field--empty modifier when blank, and drops it once written', () => {
    const blankMarkup = renderBatchRow({ mode: 'recording', draft: emptyRecordDraft });
    expect(blankMarkup).toMatch(/<textarea[^>]*class="prose-field prose-field--empty"[^>]*aria-label="At the machine"/);
    expect(blankMarkup).toMatch(/<textarea[^>]*class="prose-field prose-field--empty"[^>]*aria-label="Ingredient notes"/);
    expect(blankMarkup).toMatch(/<textarea[^>]*class="prose-field prose-field--empty"[^>]*aria-label="Next time"/);

    const writtenMarkup = renderBatchRow({
      mode: 'recording',
      draft: { ...emptyRecordDraft, atTheMachine: 'Soft', ingredientNotes: 'Oil open', nextTimeNote: 'Less oil' },
    });
    const atTheMachineField = writtenMarkup.match(/<textarea[^>]*aria-label="At the machine"[^>]*>/)[0];
    expect(atTheMachineField).not.toContain('prose-field--empty');
    const ingredientNotesField = writtenMarkup.match(/<textarea[^>]*aria-label="Ingredient notes"[^>]*>/)[0];
    expect(ingredientNotesField).not.toContain('prose-field--empty');
    const nextTimeField = writtenMarkup.match(/<textarea[^>]*aria-label="Next time"[^>]*>/)[0];
    expect(nextTimeField).not.toContain('prose-field--empty');
  });
});

describe("BatchRow — the record's reading state, measured values as cells (contract's own battery labels)", () => {
  it('renders the churn triple with plain-word labels and units beside the figures', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toContain('batch-row__cells');
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Time to draw temp\.<\/span><span class="batch-row__cell-value">20<span class="batch-row__unit"> min<\/span><\/span><span class="batch-row__plan">plan 10–12 min<\/span>/,
    );
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Out of machine<\/span><span class="batch-row__cell-value">−6<span class="batch-row__unit"> °C<\/span><\/span><\/div>/,
    );
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Churn duration<\/span><span class="batch-row__cell-value">30<span class="batch-row__unit"> min<\/span><\/span>/,
    );
  });

  it('reads exit consistency and airiness as "not measured" when the batch left them blank', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Exit consistency<\/span><span class="batch-row__cell-value"><span class="batch-row__unit">not measured<\/span><\/span>/,
    );
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Airiness<\/span><span class="batch-row__cell-value"><span class="batch-row__unit">not measured<\/span><\/span>/,
    );
  });

  it('renders no Amended cell — the changed date arrives in plan 05', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).not.toContain('>Amended<');
  });

  it('renders the recorded-against fact as a figure cell, not a prose sentence', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Recorded<\/span><span class="batch-row__cell-value">4 Aug 2026 against 50 g oil · 800 g<\/span>/,
    );
  });

  it('renders the at-the-machine and ingredient notes prose with the prose-text class', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toMatch(/<p class="prose-text">Soft, not greasy<\/p>/);
    expect(markup).toMatch(/<p class="prose-text">oil bottle opened 24 Jul<\/p>/);
  });

  it('reads no code reference to any retired churn field name', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).not.toContain('comeUpMinutes');
    expect(markup).not.toContain('drawTempC');
    expect(markup).not.toContain('overrunPercent');
  });
});

describe('BatchRow — silence stays a value for an untasted batch', () => {
  it('reads "This batch has not been tasted yet." when the batch carries no tasting', () => {
    const markup = renderBatchRow({ openBatch: untastedBatch, batches: [untastedBatch], mode: 'reading' });
    expect(markup).toContain('This batch has not been tasted yet.');
  });

  it('reads no "not tasted" sentence for a batch that carries a tasting', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).not.toContain('This batch has not been tasted yet.');
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
