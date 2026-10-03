// @vitest-environment jsdom
//
// Quick task 261002-wmz: each control in the band's acts row, below 724,
// calls the RecipePage handler it is named for (sketch 011 decision 30).
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

function mount(batches) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const spies = {
    onStartDeveloping: vi.fn(),
    onStartRecording: vi.fn(),
    onRecordTasting: vi.fn(),
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
    expect(spies.onRecordTasting).not.toHaveBeenCalled();
  });

  it('Record a batch, with no batch, calls onStartRecording once (Test H)', () => {
    const spies = mount([]);
    act(() => buttonNamed('Record a batch').click());
    expect(spies.onStartRecording).toHaveBeenCalledTimes(1);
    expect(spies.onStartDeveloping).not.toHaveBeenCalled();
    expect(spies.onRecordTasting).not.toHaveBeenCalled();
  });

  it('the text-control Next version calls onStartDeveloping once and nothing else (Test I)', () => {
    const spies = mount([augustSecondBatch]);
    act(() => buttonNamed('Next version').click());
    expect(spies.onStartDeveloping).toHaveBeenCalledTimes(1);
    expect(spies.onStartRecording).not.toHaveBeenCalled();
    expect(spies.onRecordTasting).not.toHaveBeenCalled();
  });
});
