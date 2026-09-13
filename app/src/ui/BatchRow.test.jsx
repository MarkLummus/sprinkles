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
import { BatchRow, AxesGrid } from './BatchRow.jsx';
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
    const tastedIndex = markup.indexOf('<span>Tasted</span>');
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

  it('renders the heading word and both helper strings verbatim', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toMatch(/<h3>Tasting <span class="tasting-head__helper">· optional<\/span>/);
    expect(markup).toContain('— leave anything you did not record blank');
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

  it('renders the note block\'s eyebrow and the contract\'s own verbatim placeholder, dir="auto"', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toMatch(/<p class="note-block__eyebrow">How did it turn out\?<\/p>/);
    const noteTextarea = markup.match(/<textarea[^>]*aria-label="How did it turn out\?"[^>]*>/)[0];
    expect(noteTextarea).toContain('dir="auto"');
    expect(noteTextarea).toContain('placeholder="e.g. flavor, texture, anything that stood out"');
  });

  it('renders the Tasted date input, and Tempering/Tasting temperature as measured fields with their own units', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toMatch(/<label class="batch-margin__field"><span>Tasted<\/span><input[^>]*type="date"/);
    expect(markup).toContain('aria-label="Tempering, minutes"');
    expect(markup).toContain('aria-label="Tasting temperature, degrees Celsius"');
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
    expect(markup).toMatch(/<p class="tasting-status" role="status" aria-live="polite">Tasting restored\.<\/p>/);
    const headIndex = markup.indexOf('<h3>Tasting');
    const statusIndex = markup.indexOf('class="tasting-status"');
    const removeIndex = markup.indexOf('>Remove tasting<');
    expect(statusIndex).toBeGreaterThan(headIndex);
    expect(removeIndex).toBeGreaterThan(statusIndex);
  });

  it('renders the tasting-status region empty (no text node) when tastingStatus is blank', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toMatch(/<p class="tasting-status" role="status" aria-live="polite"><\/p>/);
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

describe('BatchRow — the melt block (contract "DOM order inventory")', () => {
  it('renders Melt test (optional) with its own unit, after the defects row', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    const defectsIndex = markup.indexOf('defects-row');
    const meltBlockIndex = markup.indexOf('melt-block');
    expect(meltBlockIndex).toBeGreaterThan(defectsIndex);
    expect(markup).toContain('Melt test (optional), g lost at 20 min');
  });

  it('renders Melt style (optional) as a radiogroup with the contract\'s own three options', () => {
    const markup = renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } });
    expect(markup).toContain('role="radiogroup" aria-label="Melt style (optional)"');
    for (const option of ['Watery, weeping', 'Creamy puddle', 'Stable foam']) {
      expect(markup).toContain(option);
    }
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
