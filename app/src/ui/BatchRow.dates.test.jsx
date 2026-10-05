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
import { act, useState } from 'react';
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

// ---------------------------------------------------------------------------
// iOS's Reset calls setValue(null), which falls back to the input's value
// content attribute. React keeps that attribute equal to the controlled
// value, so Reset re-applied the shown date and onChange never fired.
// ---------------------------------------------------------------------------

let calls = [];

// Stateful, so React state really follows each change, as in RecipePage.
function Harness({ seed }) {
  const [draft, setDraft] = useState(seed);
  return rowElement({
    openPen: 'amend',
    mode: 'recording',
    amendOpener: 'correct',
    addTastingAttempt: null,
    draft,
    onChangeRecordField: (field, value) => {
      calls.push([field, value]);
      setDraft((prev) => ({ ...prev, [field]: value }));
    },
  });
}

const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
const textAreaSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;

async function mountHarness() {
  calls = [];
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <Harness seed={{ ...emptyRecordDraft, churnDate: '2026-08-02', tastingOpen: true, tastedDate: '2026-08-03' }} />,
    );
  });
}

async function pick(input, v) {
  await act(async () => {
    valueSetter.call(input, v);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

// WebKit's setValue(null): a form reset restores the value attribute, or ''
// when there is none; then the input and change events WebKit dispatches.
async function reset(input) {
  await act(async () => {
    const form = document.createElement('form');
    form.id = 'by3-reset-form';
    document.body.appendChild(form);
    input.setAttribute('form', form.id);
    form.reset();
    input.removeAttribute('form');
    form.remove();
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

async function typeAtTheMachine(text) {
  const area = current.container.querySelector('textarea[aria-label="At the machine"]')
    ?? [...current.container.querySelectorAll('label')]
      .find((label) => label.textContent.includes('At the machine'))
      ?.querySelector('textarea');
  await act(async () => {
    textAreaSetter.call(area, text);
    area.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('BatchRow date inputs: no value attribute, so iOS Reset clears (261003-by3)', () => {
  it('A1: neither date input carries a value attribute after mount, and both show their dates', async () => {
    await mountHarness();
    const churn = dateInput('Churn date');
    const tasted = dateInput('Tasted');
    expect(churn.hasAttribute('value')).toBe(false);
    expect(tasted.hasAttribute('value')).toBe(false);
    expect(churn.value).toBe('2026-08-02');
    expect(tasted.value).toBe('2026-08-03');
  });

  it('A2: a re-render from an unrelated draft change leaves no value attribute and keeps the dates', async () => {
    await mountHarness();
    await typeAtTheMachine('bowl cold');
    const churn = dateInput('Churn date');
    const tasted = dateInput('Tasted');
    expect(churn.hasAttribute('value')).toBe(false);
    expect(tasted.hasAttribute('value')).toBe(false);
    expect(churn.value).toBe('2026-08-02');
    expect(tasted.value).toBe('2026-08-03');
  });

  for (const [caption, field] of [['Churn date', 'churnDate'], ['Tasted', 'tastedDate']]) {
    it(`A3: Reset straight after open empties the ${caption} and state follows`, async () => {
      await mountHarness();
      const input = dateInput(caption);
      await reset(input);
      expect(calls).toEqual([[field, '']]);
      expect(input.value).toBe('');
      expect(input.hasAttribute('value')).toBe(false);
    });

    it(`A4: a pick then Reset empties the ${caption}, and a later pick still works`, async () => {
      await mountHarness();
      const input = dateInput(caption);
      await pick(input, '2026-10-01');
      expect(calls).toEqual([[field, '2026-10-01']]);
      expect(input.value).toBe('2026-10-01');
      expect(input.hasAttribute('value')).toBe(false);
      await reset(input);
      expect(calls).toEqual([[field, '2026-10-01'], [field, '']]);
      expect(input.value).toBe('');
      await pick(input, '2026-09-30');
      expect(input.value).toBe('2026-09-30');
      expect(calls[calls.length - 1]).toEqual([field, '2026-09-30']);
    });
  }
});
