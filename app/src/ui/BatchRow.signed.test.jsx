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

  it('an unreadable edit of a field holding -6 reaches the draft as the constant through onChange alone', () => {
    const { spy, input } = mount({ ...emptyRecordDraft, outOfMachineTempC: '-6' });
    expect(input.value).toBe('-6');
    // The prototype setter moves the DOM value without touching React's
    // instance-level value tracker, as the browser does.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '');
    Object.defineProperty(input, 'validity', { configurable: true, value: { badInput: true } });
    // React never routes a native change event to onInput, so this isolates
    // onChange. A later fix to WR-01's double call that drops onChange on
    // signed fields must revisit this test on purpose.
    act(() => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(spy.mock.calls).toEqual([['outOfMachineTempC', MALFORMED_NUMBER_ENTRY]]);
  });

  it('a readable -6 typed over the constant reaches the draft as -6, never the constant', () => {
    const { spy, input } = mount({ ...emptyRecordDraft, outOfMachineTempC: MALFORMED_NUMBER_ENTRY });
    expect(input.value).toBe('');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '-6');
    act(() => {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    // The call count is not pinned: today onInput and onChange both fire for
    // a moved value (WR-01's double call), and a later fix may make it one.
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(1);
    for (const call of spy.mock.calls) {
      expect(call).toEqual(['outOfMachineTempC', '-6']);
      expect(call[1]).not.toBe(MALFORMED_NUMBER_ENTRY);
    }
  });

  it('a wheel over the focused field blurs it and leaves -6 in place', () => {
    const { spy, input } = mount({ ...emptyRecordDraft, outOfMachineTempC: '-6' });
    input.focus();
    expect(document.activeElement).toBe(input);
    act(() => {
      input.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 100 }));
    });
    expect(document.activeElement).not.toBe(input);
    expect(input.value).toBe('-6');
    expect(spy).not.toHaveBeenCalled();
  });
});
