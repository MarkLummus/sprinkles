// @vitest-environment jsdom
//
// Phase 03.6 (sketch 011 decision 51, Mark 2026-10-05; replaces quick task 261004-ox6's
// decision 44 B): every line of a split ingredient has its own remove link, and each
// one removes its own line. renderToStaticMarkup drops handlers, so the clicks need a real render
// cycle: jsdom, per file, in a sibling of IngredientTable.test.jsx so that file keeps
// running with no window (see Shell.flyout.test.jsx).
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { IngredientTable } from './IngredientTable.jsx';
import { displayNumbers } from '../domain/stepNumbers.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let current = null;

function mount(onTogglePenLineRemoved, onTogglePenRowRemoved = () => {}) {
  const version = {
    versionLabel: 'v',
    sheetTitle: '',
    sheetDescription: '',
    targets: {},
    rows: [
      {
        id: 'a',
        ingredientName: 'Whole milk',
        portions: [{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }],
        removed: false,
        ingredient: { composition: { fat: 1 }, basis: { fat: 'estimated' } },
      },
      {
        id: 'b',
        ingredientName: 'Heavy cream',
        portions: [{ step: 3, grams: 429.28 }],
        removed: false,
        ingredient: { composition: {}, basis: {} },
      },
    ],
    method: [
      { n: 1, leadIn: 'Gum slurry.', instruction: 'x' },
      { n: 2, leadIn: 'Warm the milk.', instruction: 'x' },
      { n: 3, leadIn: 'Build the base.', instruction: 'x' },
    ],
  };
  const draftVersion = structuredClone(version);
  const penDraft = {
    rows: {
      a: { portions: [{ step: 2, grams: '120' }, { step: 3, grams: '250.4' }], removed: false },
      b: { portions: [{ step: 3, grams: '429.28' }], removed: false },
    },
    asMade: {},
  };
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        currentStepNumbers={displayNumbers(draftVersion.method)}
        onTogglePenRowRemoved={onTogglePenRowRemoved}
        onTogglePenLineRemoved={onTogglePenLineRemoved}
      />,
    );
  });
  current = { container, root };
}

function buttonsLabelled(prefix) {
  return [...current.container.querySelectorAll('button')].filter((button) => (button.getAttribute('aria-label') ?? '').startsWith(prefix));
}

afterEach(() => {
  if (!current) return;
  act(() => current.root.unmount());
  current.container.remove();
  current = null;
});

describe('IngredientTable — every remove link removes its own line (decision 51)', () => {
  it("Whole milk's two links call onTogglePenLineRemoved with its row id and their own portion index, and Heavy cream's with ('b', 0)", () => {
    const onLine = vi.fn();
    const onRow = vi.fn();
    mount(onLine, onRow);

    const links = buttonsLabelled('remove Whole milk');
    expect(links.map((button) => button.getAttribute('aria-label'))).toEqual(['remove Whole milk, Step 2', 'remove Whole milk, Step 3']);

    act(() => links[1].click());
    expect(onLine).toHaveBeenCalledTimes(1);
    expect(onLine).toHaveBeenLastCalledWith('a', 1);

    act(() => links[0].click());
    expect(onLine).toHaveBeenCalledTimes(2);
    expect(onLine).toHaveBeenLastCalledWith('a', 0);

    const cream = [...current.container.querySelectorAll('tbody tr')]
      .find((tr) => tr.textContent.includes('Heavy cream'))
      .querySelector('button');
    act(() => cream.click());
    expect(onLine).toHaveBeenCalledTimes(3);
    expect(onLine).toHaveBeenLastCalledWith('b', 0);

    expect(onRow).not.toHaveBeenCalled();
  });
});
