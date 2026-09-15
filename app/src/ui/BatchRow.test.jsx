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
import { BatchRow, AxesGrid, laterBatchMetaFor } from './BatchRow.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';
import { axesForBatch } from '../domain/axes.js';

const noop = () => {};

// The olive oil version's own declared pair (Body, Oil) resolved into the
// six-axis list AxesGrid renders — the same reuse-of-axesForBatch trick
// BatchRow.jsx itself takes for a version that has not been snapshotted
// yet (03.3.1-03 Task 2).
const batteryAxes = axesForBatch({ snapshot: { declaredAxes: oliveOilVersion.declaredAxes } });

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
        onChangeRecordMark={noop}
        onClearAxisMark={noop}
        onChangeDefect={noop}
        onToggleBitter={noop}
        onRemoveTasting={noop}
        onUndoRemove={noop}
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

  it('renders Correct on the Batch head line, right-aligned, when a batch is in view — no Add tasting yet (plan 03 opens the tasting section)', () => {
    const markup = renderBatchRow({ openPen: null, openBatch: augustSecondBatch, batches: [augustSecondBatch] });
    expect(markup).not.toContain('Record another');
    expect(markup).toContain('>Correct<');
    expect(markup).not.toContain('Add tasting');
    expect(markup).not.toContain('batch-row__acts');
    const headIndex = markup.indexOf('class="batch-row__head"');
    const marginIndex = markup.indexOf('class="batch-margin');
    const correctIndex = markup.indexOf('>Correct<');
    expect(headIndex).toBeGreaterThan(-1);
    expect(correctIndex).toBeGreaterThan(headIndex);
    expect(correctIndex).toBeLessThan(marginIndex);
    const correctButton = markup.match(/<button[^>]*class="text-control batch-row__correct"[^>]*>Correct<\/button>/)[0];
    expect(correctButton).toBeTruthy();
  });

  it('names the later-batches panel by aria-controls on its count disclosure', () => {
    const markup = renderBatchRow({
      openPen: null,
      openBatch: augustSecondBatch,
      batches: [augustSecondBatch, { ...augustSecondBatch, id: 'other-batch' }],
    });
    const countButton = markup.match(/<button[^>]*>1 later batch<\/button>/)[0];
    expect(countButton).toContain('aria-expanded="false"');
    expect(countButton).toContain('aria-controls="batch-row-later"');
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
      /<label class="field-row__label field-row__label--date"><span class="pen-caption">Churn date<\/span><input[^>]*type="date"[^>]*class="ink-field"[^>]*value="2026-08-09"/,
    );
    const churnDateIndex = markup.indexOf('<span class="pen-caption">Churn date</span>');
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

  it('renders the unit word as a sibling after the box, never in the caption (sketch 007 lines 42-44, UAT item 2)', () => {
    const markup = renderBatchRow({
      openPen: 'record',
      mode: 'recording',
      draft: emptyRecordDraft,
    });
    expect(markup).toMatch(
      /<span class="pen-caption">Time to draw temp\.<\/span><span class="field-unit"><input[^>]*aria-label="Time to draw temp\., minutes"[^>]*\/><span class="field-unit__unit">min<\/span><\/span>/,
    );
    expect(markup).not.toContain('Time to draw temp., min<');
  });

  it('renders the churn row as one field row holding the date label and the three measured labels (sketch 007 lines 210-216)', () => {
    const markup = renderBatchRow({
      openPen: 'record',
      mode: 'recording',
      draft: emptyRecordDraft,
    });
    const fieldRowIndex = markup.indexOf('<div class="field-row">');
    const churnDateCaptionIndex = markup.indexOf('<span class="pen-caption">Churn date</span>');
    const exitConsistencyIndex = markup.indexOf('Exit consistency');
    expect(fieldRowIndex).toBeGreaterThanOrEqual(0);
    expect(fieldRowIndex).toBeLessThan(churnDateCaptionIndex);
    const churnRowSlice = markup.slice(fieldRowIndex, exitConsistencyIndex);
    const labelCount = churnRowSlice.split('class="field-row__label').length - 1;
    expect(labelCount).toBe(4);
  });

  it('renders the same field-grid-then-ceremony placement while amending', () => {
    const markup = renderBatchRow({
      openPen: 'amend',
      mode: 'recording',
      draft: { ...emptyRecordDraft, churnDate: '2026-08-02' },
    });
    expect(markup).toMatch(/<span class="pen-caption">Churn date<\/span><input[^>]*type="date"[^>]*value="2026-08-02"/);
    expect(markup).toContain('class="save-ceremony"');
    expect(markup).toContain('Save batch');
  });

  it('never renders a disabled Save batch button — the record pen has no completeness gate (D-02)', () => {
    const markup = renderBatchRow({ openPen: 'record', mode: 'recording', draft: emptyRecordDraft });
    expect(markup).not.toContain('disabled=""');
  });
});

describe('BatchRow — the tasting section, hidden until added (D-01, contract "Settled defaults")', () => {
  it('renders no tasting section at all on a fresh record pen', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyRecordDraft });
    expect(markup).not.toContain('tasting-head');
    expect(markup).not.toContain('tasting-field-row');
    expect(markup).not.toContain('note-block');
    expect(markup).not.toContain('>Tasting<');
    expect(markup).not.toContain('Tempering');
    expect(markup).not.toContain('Tasting temperature');
    expect(markup).not.toContain('How did it turn out?');
  });

  it('renders the head, field-row, and note block once tastingOpen is true, in variant A\'s order (contract "DOM order inventory")', () => {
    const markup = renderBatchRow({
      mode: 'recording',
      draft: { ...emptyRecordDraft, tastingOpen: true },
    });
    const headIndex = markup.indexOf('tasting-head');
    const tastedIndex = markup.indexOf('<span class="pen-caption">Tasted</span>');
    const temperingIndex = markup.indexOf('Tempering');
    const tastingTempIndex = markup.indexOf('Tasting temperature');
    const noteIndex = markup.indexOf('note-block');
    const eyebrowIndex = markup.indexOf('How did it turn out?');
    const ceremonyIndex = markup.indexOf('class="save-ceremony"');
    expect(headIndex).toBeGreaterThanOrEqual(0);
    expect(tastedIndex).toBeGreaterThan(headIndex);
    expect(temperingIndex).toBeGreaterThan(tastedIndex);
    expect(tastingTempIndex).toBeGreaterThan(temperingIndex);
    expect(noteIndex).toBeGreaterThan(tastingTempIndex);
    expect(eyebrowIndex).toBeGreaterThan(noteIndex);
    expect(ceremonyIndex).toBeGreaterThan(eyebrowIndex);
  });

  it('renders a bare "Tasting" region-name heading, with no residual helper spans (sketch 007 line 243; G-03.3.1-4; UAT items 6, 18)', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toMatch(/<h3 class="region-name">Tasting<\/h3>/);
    expect(markup).not.toContain('tasting-head__helper');
    expect(markup).not.toContain('— leave anything you did not record blank');
  });

  it('renders the Remove tasting control, verbatim — the hidden-mode label only (Pitfall 6, contract "DOM order inventory")', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toContain('>Remove tasting<');
    expect(markup).not.toContain('Clear tasting');
  });

  it('renders Tempering only inside the tasting section, never the churn section (contract "Where sources disagree" § 1)', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    const headIndex = markup.indexOf('tasting-head');
    const firstTemperingIndex = markup.indexOf('Tempering');
    expect(firstTemperingIndex).toBeGreaterThan(headIndex);
    const churnSectionMarkup = markup.slice(0, headIndex);
    expect(churnSectionMarkup).not.toContain('Tempering');
  });

  it('renders the note block\'s eyebrow at the caption role and the sketch\'s own verbatim placeholder, dir="auto" (sketch 007 line 256)', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toMatch(/<p class="note-block__eyebrow pen-caption">How did it turn out\?<\/p>/);
    const noteTextarea = markup.match(/<textarea[^>]*aria-label="How did it turn out\?"[^>]*>/)[0];
    expect(noteTextarea).toContain('dir="auto"');
    expect(noteTextarea).toContain('placeholder="e.g. flavor, texture, what stood out"');
  });

  it('renders the Tasted date input, and Tempering/Tasting temperature as measured fields with their own units', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toMatch(
      /<label class="field-row__label field-row__label--date"><span class="pen-caption">Tasted<\/span><input[^>]*type="date"/,
    );
    expect(markup).toContain('aria-label="Tempering, minutes"');
    expect(markup).toContain('aria-label="Tasting temperature, degrees Celsius"');
  });

  it('renders the tasting row as one field row: the Tasted date label first, then Tempering and Tasting temperature, before the note (sketch 007 lines 249-253)', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    const tastedIndex = markup.indexOf('<span class="pen-caption">Tasted</span>');
    const temperingIndex = markup.indexOf('Tempering');
    const tastingTempIndex = markup.indexOf('Tasting temperature');
    const eyebrowIndex = markup.indexOf('How did it turn out?');
    expect(tastedIndex).toBeGreaterThanOrEqual(0);
    expect(temperingIndex).toBeGreaterThan(tastedIndex);
    expect(tastingTempIndex).toBeGreaterThan(temperingIndex);
    expect(eyebrowIndex).toBeGreaterThan(tastingTempIndex);
  });

  it('keeps ceremony A after the churn section when the tasting section is absent', () => {
    const markup = renderBatchRow({
      mode: 'recording',
      draft: { ...emptyRecordDraft, churnDate: '2026-08-09' },
    });
    const ingredientNotesIndex = markup.indexOf('aria-label="Ingredient notes"');
    const ceremonyIndex = markup.indexOf('class="save-ceremony"');
    expect(ceremonyIndex).toBeGreaterThan(ingredientNotesIndex);
  });
});

describe('BatchRow — the tasting-status channel and the Remove/undo head slot (contract "Feedback and undo lifecycle", "DOM order inventory")', () => {
  it('renders the tasting-status region as role=status/aria-live=polite, after the heading and before the undo/Remove controls', () => {
    const markup = renderBatchRow({
      mode: 'recording',
      draft: { ...emptyRecordDraft, tastingOpen: true },
      tastingStatus: 'Tasting restored.',
    });
    expect(markup).toMatch(/<p class="tasting-status pen-helper" role="status" aria-live="polite">Tasting restored\.<\/p>/);
    const headIndex = markup.indexOf('<h3 class="region-name">Tasting');
    const statusIndex = markup.indexOf('class="tasting-status pen-helper"');
    const removeIndex = markup.indexOf('>Remove tasting<');
    expect(statusIndex).toBeGreaterThan(headIndex);
    expect(removeIndex).toBeGreaterThan(statusIndex);
  });

  it('renders the tasting-status region empty (no text node) when tastingStatus is blank', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toMatch(/<p class="tasting-status pen-helper" role="status" aria-live="polite"><\/p>/);
  });

  it('carries two aria-live="polite" regions total — tasting-status in the head, form-status at the foot (this plan\'s own verify)', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    const occurrences = markup.split('aria-live="polite"').length - 1;
    expect(occurrences).toBe(2);
  });

  it('renders no undo control at all with no removal pending', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).not.toContain('undo-control');
    expect(markup).not.toContain('Undo clear tasting');
  });

  it('renders the Undo control in the tasting head — the contract\'s own static mount — while the section is visible and a removal is pending (a reopened section after a data removal)', () => {
    const markup = renderBatchRow({
      mode: 'recording',
      draft: { ...emptyRecordDraft, tastingOpen: true },
      pendingUndo: { tastedDate: '2026-08-03', temperingMinutes: '', tastingTempC: '', marks: {}, note: '', defects: [], bitterDeclared: false, meltTestG: '', meltStyle: '' },
    });
    expect(markup).toContain('Undo clear tasting');
    const undoIndex = markup.indexOf('Undo clear tasting');
    const removeIndex = markup.indexOf('>Remove tasting<');
    expect(removeIndex).toBeGreaterThan(undoIndex);
  });

  it('renders Remove tasting as a right-aligned text control, the last child of the tasting head (sketch 007 line 246)', () => {
    const markup = renderBatchRow({
      mode: 'recording',
      draft: { ...emptyRecordDraft, tastingOpen: true },
      tastingStatus: 'Some status',
    });
    expect(markup).toMatch(
      /<button type="button" class="text-control tasting-head__remove"[^>]*>Remove tasting<\/button>/,
    );
    const statusIndex = markup.indexOf('class="tasting-status pen-helper"');
    const removeIndex = markup.indexOf('class="text-control tasting-head__remove"');
    expect(removeIndex).toBeGreaterThan(statusIndex);
  });
});

describe('AxesGrid — the two DOM orders, one per arrangement (contract "Keyboard and tab order")', () => {
  function nameIdIndex(markup, key) {
    return markup.indexOf(`id="axis-name-${key}"`);
  }

  it('renders the desktop row-major order — Hardness, Scoopability, Body, Smoothness, Sweetness, Oil — when below is false', () => {
    const markup = renderToStaticMarkup(
      <AxesGrid axes={batteryAxes} marks={{}} below={false} onChangeMark={noop} onClearMark={noop} />,
    );
    const order = ['hardness', 'scoopability', 'body', 'smoothness', 'sweetness', 'oil'];
    let lastIndex = -1;
    for (const key of order) {
      const index = nameIdIndex(markup, key);
      expect(index).toBeGreaterThan(lastIndex);
      lastIndex = index;
    }
  });

  it('renders the stacked core-then-declared order — Hardness, Scoopability, Smoothness, Sweetness, then Body, Oil — when below is true', () => {
    const markup = renderToStaticMarkup(
      <AxesGrid axes={batteryAxes} marks={{}} below={true} onChangeMark={noop} onClearMark={noop} />,
    );
    const order = ['hardness', 'scoopability', 'smoothness', 'sweetness', 'body', 'oil'];
    let lastIndex = -1;
    for (const key of order) {
      const index = nameIdIndex(markup, key);
      expect(index).toBeGreaterThan(lastIndex);
      lastIndex = index;
    }
  });

  it('renders the vertical hairline only in the desktop arrangement', () => {
    const desktopMarkup = renderToStaticMarkup(
      <AxesGrid axes={batteryAxes} marks={{}} below={false} onChangeMark={noop} onClearMark={noop} />,
    );
    expect(desktopMarkup).toContain('class="axes-rule"');
    const stackedMarkup = renderToStaticMarkup(
      <AxesGrid axes={batteryAxes} marks={{}} below={true} onChangeMark={noop} onClearMark={noop} />,
    );
    expect(stackedMarkup).not.toContain('axes-rule');
  });

  it('renders the "Declared for this recipe" caption exactly once, in both arrangements', () => {
    for (const below of [false, true]) {
      const markup = renderToStaticMarkup(
        <AxesGrid axes={batteryAxes} marks={{}} below={below} onChangeMark={noop} onClearMark={noop} />,
      );
      const occurrences = markup.split('axes-declared-caption').length - 1;
      expect(occurrences).toBe(1);
      expect(markup).toContain('Declared for this recipe');
    }
  });

  it('reads marks from the given map, keyed by axis key, in either arrangement (marks survive by construction)', () => {
    const markup = renderToStaticMarkup(
      <AxesGrid axes={batteryAxes} marks={{ hardness: 3, oil: 5 }} below={false} onChangeMark={noop} onClearMark={noop} />,
    );
    const hardnessIndex = nameIdIndex(markup, 'hardness');
    const scoopabilityIndex = nameIdIndex(markup, 'scoopability');
    const hardnessChunk = markup.slice(hardnessIndex, scoopabilityIndex);
    expect(hardnessChunk).toContain('(3)');
    const oilIndex = nameIdIndex(markup, 'oil');
    const oilChunk = markup.slice(oilIndex);
    expect(oilChunk).toContain('(5)');
  });

  it('renders every axis unmarked, "(Not recorded)", with an empty marks map', () => {
    const markup = renderToStaticMarkup(
      <AxesGrid axes={batteryAxes} marks={{}} below={false} onChangeMark={noop} onClearMark={noop} />,
    );
    const occurrences = markup.split('(Not recorded)').length - 1;
    expect(occurrences).toBe(6);
  });
});

describe('BatchRow — the axes grid does not crash under Vitest\'s node environment (no window.matchMedia, this plan\'s own critical note)', () => {
  it('renders the tasting section with no window in scope, with no error thrown', () => {
    expect(() =>
      renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } }),
    ).not.toThrow();
  });

  it('renders the desktop row-major arrangement by default under node (matchMedia unavailable → below760 is false)', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toContain('class="axes-rule"');
  });

  it('renders the six goldilocks axes inside the tasting section, after the note block (contract "DOM order inventory")', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    const noteIndex = markup.indexOf('note-block');
    const axesIndex = markup.indexOf('class="axes-grid"');
    expect(axesIndex).toBeGreaterThan(noteIndex);
    for (const name of ['Hardness', 'Scoopability', 'Smoothness', 'Sweetness', 'Body', 'Oil']) {
      expect(markup).toContain(`id="axis-name-`);
    }
  });

  it('wires a mark in the draft to the checked stop when the tasting section renders through BatchRow itself', () => {
    const markup = renderBatchRow({
      mode: 'recording',
      draft: { ...emptyRecordDraft, tastingOpen: true, marks: { hardness: 2 } },
    });
    expect(markup).toContain('(2)');
  });
});

describe('BatchRow — the defects checklist and the declared toggle (contract "Controls spec")', () => {
  it('carries the group\'s own aria-label with five aria-pressed buttons', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toContain('role="group" aria-label="Any problems? Select all that apply"');
    const pressedButtons = markup.match(/<button[^>]*aria-pressed="[^"]*"[^>]*>/g);
    expect(pressedButtons.length).toBe(5);
  });

  it('renders the caption and its lowercase helper on one row', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toMatch(
      /<p class="defects-row__caption">Any problems\? <span class="defects-row__helper">select all that apply<\/span><\/p>/,
    );
  });

  it('renders the four DEFECTS chips character-for-character, comma-worded', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    for (const label of ['Coarse, icy', 'Sandy, gritty', 'Gummy, elastic', 'Greasy film']) {
      expect(markup).toContain(`>${label}<`);
    }
  });

  it('renders the declared Bitter chip with its visible "· declared" helper and its own full aria-label', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toMatch(/aria-label="Declared for this recipe: Bitter"[^>]*>Bitter <span class="chip-toggle__helper">· declared<\/span>/);
  });

  it('checks no chip by default — nothing is pre-selected', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toMatch(/aria-pressed="false"[^>]*>Coarse, icy</);
    expect(markup).toMatch(/aria-pressed="false"[^>]*>Bitter /);
  });

  it('marks a picked defect chip aria-pressed="true"', () => {
    const markup = renderBatchRow({
      mode: 'recording',
      draft: { ...emptyRecordDraft, tastingOpen: true, defects: ['Sandy, gritty'] },
    });
    expect(markup).toMatch(/aria-pressed="true"[^>]*>Sandy, gritty</);
    expect(markup).toMatch(/aria-pressed="false"[^>]*>Coarse, icy</);
  });

  it('marks the declared chip aria-pressed="true" when bitterDeclared is set', () => {
    const markup = renderBatchRow({
      mode: 'recording',
      draft: { ...emptyRecordDraft, tastingOpen: true, bitterDeclared: true },
    });
    expect(markup).toMatch(/aria-pressed="true"[^>]*>Bitter /);
  });
});

describe('BatchRow — the melt block (sketch 007 lines 285-297; UAT item 12; D-12)', () => {
  it('renders Melt test with its own unit, after the defects row — the "(optional)" suffix is dropped', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    const defectsIndex = markup.indexOf('defects-row');
    const meltBlockIndex = markup.indexOf('melt-block');
    expect(meltBlockIndex).toBeGreaterThan(defectsIndex);
    expect(markup).toContain('<span class="pen-caption">Melt test</span>');
    expect(markup).toContain('<span class="field-unit__unit">g lost at 20 min</span>');
  });

  it('renders Melt style as a radiogroup with the contract\'s own three options — the "(optional)" suffix is dropped', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toContain('role="radiogroup" aria-label="Melt style"');
    for (const option of ['Watery, weeping', 'Creamy puddle', 'Stable foam']) {
      expect(markup).toContain(option);
    }
  });

  it('renders the melt block as one top-aligned field row holding Melt test before the Melt style fieldset', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toContain('class="field-row field-row--start"');
    const meltTestIndex = markup.indexOf('<span class="pen-caption">Melt test</span>');
    const meltStyleIndex = markup.indexOf('<legend class="pen-caption">Melt style</legend>');
    expect(meltTestIndex).toBeGreaterThanOrEqual(0);
    expect(meltStyleIndex).toBeGreaterThan(meltTestIndex);
  });

  it('renders the melt block before ceremony A, at the tasting body\'s foot', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    const meltBlockIndex = markup.indexOf('melt-block');
    const ceremonyIndex = markup.indexOf('class="save-ceremony"');
    expect(ceremonyIndex).toBeGreaterThan(meltBlockIndex);
  });

  it('checks no melt style option by default, and no aria-invalid on a blank melt test', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    const meltBlockMarkup = markup.slice(markup.indexOf('melt-block'));
    expect(meltBlockMarkup).not.toContain('checked=""');
    expect(meltBlockMarkup).not.toContain('aria-invalid');
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

  it('carries no aria-invalid or field-error when the draft holds no errors', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyRecordDraft, fieldErrors: {} });
    expect(markup).not.toContain('aria-invalid');
    expect(markup).not.toContain('field-error');
  });

  it('marks an invalid field with aria-invalid and aria-describedby, and prints the contract\'s own error sentence verbatim (Task 2, D-05)', () => {
    const outOfMachineError = 'Enter a temperature, such as −6, or leave blank.';
    const markup = renderBatchRow({
      mode: 'recording',
      draft: { ...emptyRecordDraft, outOfMachineTempC: '4o' },
      fieldErrors: { outOfMachineTempC: outOfMachineError },
    });
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('aria-describedby="field-error-outOfMachineTempC"');
    expect(markup).toMatch(
      /<span id="field-error-outOfMachineTempC" class="field-error">Enter a temperature, such as −6, or leave blank\.<\/span>/,
    );
  });

  it('leaves an untouched field with no aria-invalid while a sibling field is invalid (Task 2)', () => {
    const markup = renderBatchRow({
      mode: 'recording',
      draft: { ...emptyRecordDraft, outOfMachineTempC: '4o' },
      fieldErrors: { outOfMachineTempC: 'Enter a temperature, such as −6, or leave blank.' },
    });
    const timeToDrawInput = markup.match(/<input[^>]*aria-label="Time to draw temp\., minutes"[^>]*\/>/)[0];
    expect(timeToDrawInput).not.toContain('aria-invalid');
  });
});

// Task 2 (tdd="true"): D-05's press-to-block sentence, read by ceremony A
// from the one RecipePage state also fed to ceremony B (PenFoot) — the two
// can never disagree. The form-status live region is the record body's
// own last element (contract "DOM order inventory").
describe('BatchRow — the record pen\'s own blocked-date sentence, beside ceremony A (D-05)', () => {
  it('renders the sentence in ceremony A\'s hint slot when set', () => {
    const markup = renderBatchRow({
      openPen: 'record',
      mode: 'recording',
      draft: emptyRecordDraft,
      blockedDateMessage: 'Enter the date you churned.',
    });
    expect(markup).toContain('class="save-ceremony__hint"');
    expect(markup).toContain('Enter the date you churned.');
  });

  it('renders no hint paragraph when the message is unset', () => {
    const markup = renderBatchRow({ openPen: 'record', mode: 'recording', draft: emptyRecordDraft, blockedDateMessage: null });
    expect(markup).not.toContain('save-ceremony__hint');
  });
});

describe('BatchRow — the form-status live region (contract "DOM order inventory", Task 2)', () => {
  it('renders a role="status" region as the record body\'s own last element, after the shared Next time field', () => {
    const markup = renderBatchRow({
      mode: 'recording',
      draft: emptyRecordDraft,
      formStatus: 'Check the marked measurements. Your entries have been kept.',
    });
    expect(markup).toContain('class="form-status"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('Check the marked measurements. Your entries have been kept.');
    const nextTimeIndex = markup.indexOf('aria-label="Next time"');
    const formStatusIndex = markup.indexOf('class="form-status"');
    expect(formStatusIndex).toBeGreaterThan(nextTimeIndex);
  });

  it('renders the region empty (no text node) when formStatus is blank', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyRecordDraft, formStatus: '' });
    expect(markup).toMatch(/<p class="form-status" role="status" aria-live="polite"><\/p>/);
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
  it('renders At the machine and Ingredient notes with the sketch\'s own verbatim placeholders (sketch 007 lines 237-238)', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyRecordDraft });
    const atTheMachine = markup.match(/<textarea[^>]*aria-label="At the machine"[^>]*>/)[0];
    expect(atTheMachine).toContain('placeholder="e.g. bowl frozen overnight"');
    expect(markup).toContain('placeholder="e.g. oil bottle opened 24 Jul"');
  });

  it('renders the shared Next time textarea with its own caption and the sketch\'s verbatim placeholder (sketch 007 line 307; UAT item 14)', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: emptyRecordDraft });
    expect(markup).toContain('placeholder="e.g. churn 2 min longer"');
    expect(markup).toMatch(/<label class="batch-margin__field"><span class="pen-caption">Next time<\/span>/);
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
      /<span class="batch-row__cell-label">Exit consistency<\/span><span class="batch-row__cell-value"><span class="batch-row__unit batch-row__unit--absent">not measured<\/span><\/span>/,
    );
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Airiness<\/span><span class="batch-row__cell-value"><span class="batch-row__unit batch-row__unit--absent">not measured<\/span><\/span>/,
    );
  });

  it('renders no Amended cell — the changed date arrives in plan 05', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).not.toContain('>Amended<');
  });

  // D-04: churned, tasted, changed — only the latest change shows.
  describe('the record\'s dates: churned, tasted, changed (D-04)', () => {
    it('renders no Changed cell when the batch has never been changed', () => {
      const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
      expect(markup).not.toContain('>Changed<');
    });

    it('renders exactly one Changed cell, via formatRecordDate, when the batch carries a changed date', () => {
      const changedBatch = { ...augustSecondBatch, changed: '2026-08-10' };
      const markup = renderBatchRow({ openBatch: changedBatch, batches: [changedBatch], mode: 'reading' });
      expect(markup).toMatch(
        /<span class="batch-row__cell-label">Changed<\/span><span class="batch-row__cell-value">10 Aug 2026<\/span>/,
      );
      expect(markup.split('class="batch-row__cell-label">Changed<').length - 1).toBe(1);
    });
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

// TastingReading (contract "Axes spec"/"Controls spec", brief § 3): the
// read view's own rendering of the single stored tasting — the seeded
// batch marks sweetness and oil at stop 4, both high anchors, with Bitter
// declared and no defects picked (D-07).
describe('BatchRow — the tasting read view, goldilocks words (contract "Axes spec", brief § 3)', () => {
  it('renders only the marked axes as cells, each "{word} (n)" via readMarkWord — sweetness "more (4)", oil "strong (4)"', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Sweetness<\/span><span class="batch-row__cell-value">more \(4\)<\/span>/,
    );
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Oil<\/span><span class="batch-row__cell-value">strong \(4\)<\/span>/,
    );
  });

  it('renders no cell at all for an unmarked axis — dropped entirely, never a blank judgment', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    for (const name of ['Hardness', 'Scoopability', 'Smoothness', 'Body']) {
      expect(markup).not.toContain(`class="batch-row__cell-label">${name}<`);
    }
  });

  it('renders the caption as bare "Tasting" with no summary span, even with marked axes and a declared flaw', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).not.toContain('tasting-reading__summary');
    expect(markup).toMatch(/<h3 class="region-name">\s*Tasting\s*<\/h3>/);
  });

  it('renders no summary line span when nothing is marked and nothing is declared', () => {
    const bareBatch = { ...augustSecondBatch, tasting: { ...augustSecondBatch.tasting, marks: {}, bitterDeclared: null } };
    const markup = renderBatchRow({ openBatch: bareBatch, batches: [bareBatch], mode: 'reading' });
    expect(markup).not.toContain('tasting-reading__summary');
    expect(markup).toMatch(/<h3 class="region-name">\s*Tasting\s*<\/h3>/);
  });

  it('reads the tasted date as "date unknown" when absent, never invented', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toContain('<p class="batch-row__dates">tasted date unknown</p>');
  });

  it('reads the tasted date via formatRecordDate when present', () => {
    const datedBatch = { ...augustSecondBatch, tasting: { ...augustSecondBatch.tasting, tastedDate: '2026-08-03' } };
    const markup = renderBatchRow({ openBatch: datedBatch, batches: [datedBatch], mode: 'reading' });
    expect(markup).toContain('<p class="batch-row__dates">tasted 3 Aug 2026</p>');
  });

  it('reads the tasting temperature signed, and the melt test with its own unit', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Tasting temperature<\/span><span class="batch-row__cell-value">−12<span class="batch-row__unit"> °C<\/span><\/span>/,
    );
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Melt test<\/span><span class="batch-row__cell-value">3<span class="batch-row__unit"> g lost at 20 min<\/span><\/span>/,
    );
  });

  it('reads a blank tasting temperature, melt test and melt style as "not measured"', () => {
    const blankBatch = {
      ...augustSecondBatch,
      tasting: { ...augustSecondBatch.tasting, tastingTempC: null, meltTestG: null, meltStyle: null },
    };
    const markup = renderBatchRow({ openBatch: blankBatch, batches: [blankBatch], mode: 'reading' });
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Tasting temperature<\/span><span class="batch-row__cell-value"><span class="batch-row__unit batch-row__unit--absent">not measured<\/span><\/span>/,
    );
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Melt test<\/span><span class="batch-row__cell-value"><span class="batch-row__unit batch-row__unit--absent">not measured<\/span><\/span>/,
    );
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Melt style<\/span><span class="batch-row__cell-value"><span class="batch-row__unit batch-row__unit--absent">not measured<\/span><\/span>/,
    );
  });

  it('reads the melt style\'s picked words when set', () => {
    const styledBatch = { ...augustSecondBatch, tasting: { ...augustSecondBatch.tasting, meltStyle: 'Creamy puddle' } };
    const markup = renderBatchRow({ openBatch: styledBatch, batches: [styledBatch], mode: 'reading' });
    expect(markup).toMatch(
      /<span class="batch-row__cell-label">Melt style<\/span><span class="batch-row__cell-value">Creamy puddle<\/span>/,
    );
  });

  it('reads the declared flaw as "Bitter · declared" with no other defects picked (the seeded case)', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).toMatch(/<p class="prose-text">Bitter · declared<\/p>/);
  });

  it('joins picked defect words with the declared flaw, comma-worded, when both are present', () => {
    const flawedBatch = {
      ...augustSecondBatch,
      tasting: { ...augustSecondBatch.tasting, defects: ['Sandy, gritty', 'Greasy film'] },
    };
    const markup = renderBatchRow({ openBatch: flawedBatch, batches: [flawedBatch], mode: 'reading' });
    expect(markup).toMatch(/<p class="prose-text">Sandy, gritty · Greasy film · Bitter · declared<\/p>/);
  });

  it('renders no defects line at all with no defects picked and no flaw declared', () => {
    const cleanBatch = { ...augustSecondBatch, tasting: { ...augustSecondBatch.tasting, defects: null, bitterDeclared: null } };
    const markup = renderBatchRow({ openBatch: cleanBatch, batches: [cleanBatch], mode: 'reading' });
    const readingMarkup = markup.slice(markup.indexOf('tasting-reading'));
    expect(readingMarkup).not.toContain('declared');
  });

  it('renders the note as prose when written, and nothing when blank', () => {
    const notedBatch = { ...augustSecondBatch, tasting: { ...augustSecondBatch.tasting, note: 'Soft set, clean finish' } };
    const markup = renderBatchRow({ openBatch: notedBatch, batches: [notedBatch], mode: 'reading' });
    expect(markup).toMatch(/<p class="prose-text">Soft set, clean finish<\/p>/);

    const noNoteMarkup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(noNoteMarkup).not.toContain(augustSecondBatch.tasting.note ?? '__none__');
  });

  it('reads no code reference to the retired plural-tasting wording (Pitfall 7): never "once", "twice", or "times"', () => {
    const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
    expect(markup).not.toMatch(/tasted once|tasted twice|\btimes\b/);
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

// laterBatchMetaFor (D-04, D-09, Pitfall 7): the later-batches list's own
// meta small print — "changed {date}" replaces the retired tasted-count
// wording; the drawn temperature and At-the-machine parts are unchanged.
describe('laterBatchMetaFor — the later-batches list\'s meta small print (D-04)', () => {
  it("reads \"changed {date}\" when the batch carries a changed date", () => {
    const changedBatch = { ...augustSecondBatch, changed: '2026-08-10' };
    expect(laterBatchMetaFor(changedBatch)).toContain('changed 10 Aug 2026');
  });

  it('carries no "changed" part when the batch has never been changed', () => {
    expect(laterBatchMetaFor(augustSecondBatch).some((part) => part.startsWith('changed '))).toBe(false);
  });

  it('never reads "tasted" — the tasted-count wording is retired (Pitfall 7)', () => {
    const tastedBatch = { ...augustSecondBatch, changed: '2026-08-10' };
    expect(laterBatchMetaFor(tastedBatch).join(' · ')).not.toMatch(/\btasted\b/);
  });

  it('keeps the drawn-temperature and At-the-machine parts', () => {
    expect(laterBatchMetaFor(augustSecondBatch)).toEqual(['out of machine −6 °C', 'Soft, not greasy']);
  });

  it('returns an empty list when the batch carries none of the three facts', () => {
    const bareBatch = {
      ...augustSecondBatch,
      changed: null,
      churn: { ...augustSecondBatch.churn, outOfMachineTempC: null, atTheMachine: null },
    };
    expect(laterBatchMetaFor(bareBatch)).toEqual([]);
  });
});
