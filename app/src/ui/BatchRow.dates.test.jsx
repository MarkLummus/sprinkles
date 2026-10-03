// @vitest-environment jsdom
//
// 261003-by3 (.planning/debug/ios-tasting-date-picker.md): the two date
// inputs in the record and amend pen on the iPhone.
//
// jsdom, because renderToStaticMarkup runs no focus and no event handlers:
// the one-date-focus-per-opener contract and the value-attribute contract
// only show through React's real render cycle. A sibling file, not
// BatchRow.test.jsx, whose node-environment block must keep running with no
// window (same split as BatchRow.signed.test.jsx).
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { BatchRow } from './BatchRow.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const noop = () => {};

// Copied from BatchRow.test.jsx: test files do not import each other.
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

const untastedBatch = { ...augustSecondBatch, tasting: null };

let current = null;
let dateFocuses = [];
let originalFocus = null;

beforeEach(() => {
  dateFocuses = [];
  originalFocus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function focusLogged(...args) {
    if (this.type === 'date') {
      dateFocuses.push(this.closest('label')?.querySelector('.pen-caption')?.textContent);
    }
    return originalFocus.apply(this, args);
  };
});

afterEach(() => {
  HTMLElement.prototype.focus = originalFocus;
  if (!current) return;
  act(() => current.root.unmount());
  current.container.remove();
  current = null;
});

function rowElement(props) {
  return (
    <MemoryRouter>
      <BatchRow
        version={oliveOilVersion}
        versionName="Version 1 · 50 g oil · 800 g"
        openBatch={untastedBatch}
        batches={[untastedBatch]}
        mode="reading"
        openPen={null}
        penReason={null}
        draft={null}
        onChangeRecordField={noop}
        onChangeSegment={noop}
        onChangeRecordMark={noop}
        onClearAxisMark={noop}
        onChangeDefect={noop}
        onToggleBitter={noop}
        onRemoveTasting={noop}
        onUndoRemove={noop}
        onAddTasting={noop}
        onStartAmending={noop}
        onCancelRecording={noop}
        onSaveBatch={noop}
        onStartRecording={noop}
        {...props}
      />
    </MemoryRouter>
  );
}

// First render in reading state, then rerender into the pen: the row is
// already mounted when the opener is tapped, as in the app.
function renderRow(props) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  act(() => root.render(rowElement({})));
  return {
    rerender: (next) => act(() => root.render(rowElement(next))),
  };
}

const dateInput = (caption) =>
  [...current.container.querySelectorAll('label')]
    .find((label) => label.querySelector('.pen-caption')?.textContent === caption)
    ?.querySelector('input[type="date"]');

const recordATasting = {
  openPen: 'amend',
  mode: 'recording',
  amendOpener: 'record-a-tasting',
  addTastingAttempt: 1,
  draft: { ...emptyRecordDraft, tastingOpen: true },
};

const correct = {
  openPen: 'amend',
  mode: 'recording',
  amendOpener: 'correct',
  addTastingAttempt: null,
  draft: { ...emptyRecordDraft, churnDate: '2026-08-02', tastingOpen: true },
};

describe('BatchRow date inputs: one date focus per opener (261003-by3)', () => {
  it('F1: Record a tasting focuses only the Tasted date', () => {
    const { rerender } = renderRow();
    rerender(recordATasting);
    expect(dateFocuses).toEqual(['Tasted']);
    expect(document.activeElement).toBe(dateInput('Tasted'));
  });

  it('F2: Correct focuses only the Churn date', () => {
    const { rerender } = renderRow();
    rerender(correct);
    expect(dateFocuses).toEqual(['Churn date']);
    expect(document.activeElement).toBe(dateInput('Churn date'));
    expect(dateInput('Tasted')).not.toBeNull();
  });

  it('F3: Add tasting inside an open Correct pen focuses only the Tasted date', () => {
    const { rerender } = renderRow();
    rerender({ ...correct, draft: { ...correct.draft, tastingOpen: false } });
    dateFocuses.length = 0;
    rerender({ ...correct, addTastingAttempt: 1 });
    expect(dateFocuses).toEqual(['Tasted']);
    expect(document.activeElement).toBe(dateInput('Tasted'));
  });

  it('F4: Record another focuses only the Churn date', () => {
    const { rerender } = renderRow();
    rerender({ openPen: 'record', mode: 'recording', addTastingAttempt: null, draft: emptyRecordDraft });
    expect(dateFocuses).toEqual(['Churn date']);
  });
});
