// @vitest-environment jsdom
//
// Quick task 261110-ac0, row bug-next-version-cancel-focus-after-save: on a
// version page reached from a save, Next version then Cancel must return
// focus to Next version, not to the version heading. jsdom because
// renderToStaticMarkup (VersionRow.test.jsx, node) cannot show focus. The
// harness holds mode and derives openPen from it with derivePenState, the way
// RecipePage does, so the effects that watch mode run as they do in the app.
import { describe, it, expect, afterEach } from 'vitest';
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { VersionRow } from './VersionRow.jsx';
import { derivePenState } from '../domain/penDraft.js';
import { oliveOilVersion } from '../data/olive-oil.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const noop = () => {};

let current = null;

function Harness({ initialMode, below724 }) {
  const [mode, setMode] = useState(initialMode);
  const { openPen } = derivePenState({ mode, amendingBatchId: null });
  return (
    <MemoryRouter>
      <VersionRow
        version={oliveOilVersion}
        versions={[oliveOilVersion]}
        mode={mode}
        penDraft={{ versionLabel: '', reason: '', citedBatchId: null }}
        batches={[]}
        allBatches={[]}
        citedBatch={null}
        openPen={openPen}
        canSaveOver={true}
        below724={below724}
        focusVersionOnMount={true}
        onStartDeveloping={() => setMode('developing')}
        onCancelDeveloping={() => setMode('reading')}
        onStartRecording={noop}
        onStartTasting={noop}
        onChangePenField={noop}
        onSaveAsNewVersion={noop}
        onSaveOverVersion={noop}
        onToggleShowChanges={noop}
      />
    </MemoryRouter>
  );
}

function mount({ initialMode = 'reading', below724 = false } = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  act(() => {
    root.render(<Harness initialMode={initialMode} below724={below724} />);
  });
}

function heading() {
  return current.container.querySelector('h2.notebook-version__identity');
}

function buttonNamed(label) {
  return [...current.container.querySelectorAll('button')].find(
    (button) => button.textContent.trim() === label,
  );
}

afterEach(() => {
  if (!current) return;
  act(() => current.root.unmount());
  current.container.remove();
  current = null;
});

describe('VersionRow — the arrival landing happens once (bug-next-version-cancel-focus-after-save)', () => {
  it('lands focus on the version heading when the row first draws (Test A)', () => {
    mount();
    expect(document.activeElement).toBe(heading());
    expect(heading().classList.contains('is-landing-focus')).toBe(true);
  });

  it.each([
    ['from 724 up', false],
    ['below 724', true],
  ])('Cancel after Next version returns focus to Next version, twice, %s (Test B)', (_label, below724) => {
    mount({ below724 });
    for (let round = 0; round < 2; round += 1) {
      act(() => buttonNamed('Next version').click());
      expect(document.activeElement.getAttribute('aria-label')).toBe('Version name');
      act(() => buttonNamed('Cancel').click());
      expect(document.activeElement).toBe(buttonNamed('Next version'));
    }
  });

  it('Cancel returns focus to Next version when a pen was open at the first draw (Test C)', () => {
    mount({ initialMode: 'developing' });
    act(() => buttonNamed('Cancel').click());
    expect(document.activeElement).toBe(buttonNamed('Next version'));
  });
});
