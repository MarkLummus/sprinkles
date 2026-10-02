// @vitest-environment jsdom
//
// WR-01 (03.5 review) and truth 26b in 03.5-VERIFICATION.md: MeasuredField's
// three signed-field handlers (onChange, onInput, onWheel in BatchRow.jsx)
// had no test that fires an event, because renderToStaticMarkup drops event
// handlers. Deleting onInput or onWheel left the suite green.
//
// jsdom, because MeasuredField is not exported and its handlers are inline
// closures: mounting BatchRow through React's real render cycle is the only
// route that needs no source change.
//
// A sibling file, not BatchRow.test.jsx: that file's node-environment
// describe block ("renders the tasting section with no window in scope")
// must keep running with no window. Same split as useFold.reset.test.jsx
// beside useBelowDesktop.test.js.
//
// What jsdom cannot show: it never reports validity.badInput on a number
// input, so the tests shadow validity on the node; and it never steps a
// number input on wheel, so the wheel test proves the blur (the mechanism),
// not Chromium's value stepping.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { BatchRow, MALFORMED_NUMBER_ENTRY } from './BatchRow.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';

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

let current = null;

function mount(draft) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const spy = vi.fn();
  current = { container, root };
  act(() => {
    root.render(
      <MemoryRouter>
        <BatchRow
          version={oliveOilVersion}
          batches={[]}
          openBatch={null}
          mode="recording"
          draft={draft}
          onChangeRecordField={spy}
          onChangeSegment={noop}
          onChangeRecordMark={noop}
          onClearAxisMark={noop}
          onChangeDefect={noop}
          onToggleBitter={noop}
          onRemoveTasting={noop}
          onUndoRemove={noop}
          onAddTasting={noop}
          openPen="record"
          penReason={null}
          onStartAmending={noop}
          onCancelRecording={noop}
          onSaveBatch={noop}
          versionName="Version 1 · 50 g oil · 800 g"
          onStartRecording={noop}
        />
      </MemoryRouter>,
    );
  });
  const input = container.querySelector('input[aria-label="Out of machine, degrees Celsius"]');
  return { spy, input };
}

afterEach(() => {
  if (!current) return;
  act(() => current.root.unmount());
  current.container.remove();
  current = null;
});

describe('MeasuredField — the signed-field handlers (03.5 review WR-01, truth 26b)', () => {
  it('a lone minus in an empty field reaches the draft as the constant through onInput alone', () => {
    const { spy, input } = mount(emptyRecordDraft);
    expect(input).not.toBeNull();
    // The browser reports a lone minus as value '' with badInput true.
    Object.defineProperty(input, 'validity', { configurable: true, value: { badInput: true } });
    act(() => {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(spy.mock.calls).toEqual([['outOfMachineTempC', MALFORMED_NUMBER_ENTRY]]);
  });
});
