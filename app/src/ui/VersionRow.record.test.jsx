// @vitest-environment jsdom
//
// Quick task 261002-wmz: each control in the band's acts row, below 724,
// calls the RecipePage handler it is named for (sketch 011 decision 30).
// Sketch 016 (PHONE-01) leaves Next version out of the row below 724.
// renderToStaticMarkup drops handlers, so the clicks need a real render
// cycle: jsdom, per file, with the BatchRow.signed.test.jsx mount pattern.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { VersionRow } from './VersionRow.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const noop = () => {};

let current = null;

function mount(batches, extra = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const spies = {
    onStartDeveloping: vi.fn(),
    onStartRecording: vi.fn(),
    onStartTasting: vi.fn(),
  };
  current = { container, root };
  act(() => {
    root.render(
      <MemoryRouter>
        <VersionRow
          version={oliveOilVersion}
          versions={[oliveOilVersion]}
          mode="reading"
          penDraft={null}
          batches={batches}
          allBatches={batches}
          citedBatch={null}
          openPen={null}
          canSaveOver={true}
          below724={true}
          onCancelDeveloping={noop}
          onChangePenField={noop}
          onSaveAsNewVersion={noop}
          onSaveOverVersion={noop}
          onToggleShowChanges={noop}
          {...spies}
          {...extra}
        />
      </MemoryRouter>,
    );
  });
  return spies;
}

function buttonNamed(label) {
  return [...current.container.querySelectorAll('.notebook-version__acts button')].find(
    (button) => button.textContent.trim() === label,
  );
}

afterEach(() => {
  if (!current) return;
  act(() => current.root.unmount());
  current.container.remove();
  current = null;
});

describe('VersionRow — the band\'s controls below 724 call the handler they are named for (261002-wmz)', () => {
  it('Record another, on a tasted batch, calls onStartRecording once and nothing else (Test G)', () => {
    const spies = mount([augustSecondBatch]);
    act(() => buttonNamed('Record another').click());
    expect(spies.onStartRecording).toHaveBeenCalledTimes(1);
    expect(spies.onStartDeveloping).not.toHaveBeenCalled();
    expect(spies.onStartTasting).not.toHaveBeenCalled();
  });

  it('Record batch, with no batch, calls onStartRecording once (Test H)', () => {
    const spies = mount([]);
    act(() => buttonNamed('Record batch').click());
    expect(spies.onStartRecording).toHaveBeenCalledTimes(1);
    expect(spies.onStartDeveloping).not.toHaveBeenCalled();
    expect(spies.onStartTasting).not.toHaveBeenCalled();
  });

  it('Record tasting, on a batch awaiting tasting, calls onStartTasting once with that batch (Test J, 261002-wn0)', () => {
    const spies = mount([{ ...augustSecondBatch, tasting: null }]);
    act(() => buttonNamed('Record tasting').click());
    expect(spies.onStartTasting).toHaveBeenCalledTimes(1);
    expect(spies.onStartTasting).toHaveBeenCalledWith(expect.objectContaining({ id: augustSecondBatch.id }));
    expect(spies.onStartRecording).not.toHaveBeenCalled();
    expect(spies.onStartDeveloping).not.toHaveBeenCalled();
  });

  it('draws no Next version below 724 (PHONE-01): the record act and Print sheet are the row (Test I)', () => {
    const spies = mount([augustSecondBatch]);
    expect(buttonNamed('Next version')).toBeUndefined();
    expect([...current.container.querySelectorAll('.notebook-version__acts > *')].map((node) => node.textContent.trim())).toEqual([
      'Record another',
      'Print sheet',
    ]);
    expect(spies.onStartDeveloping).not.toHaveBeenCalled();
  });

  it('draws no record act while a Next version draft is held, so nothing can call a handler (Test K)', () => {
    const spies = mount([augustSecondBatch], { planHeld: true });
    expect(buttonNamed('Record another')).toBeUndefined();
    expect([...current.container.querySelectorAll('.notebook-version__acts > *')].map((node) => node.textContent.trim())).toEqual([
      'Print sheet',
    ]);
    expect(spies.onStartRecording).not.toHaveBeenCalled();
  });
});
