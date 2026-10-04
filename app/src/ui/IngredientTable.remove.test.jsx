// @vitest-environment jsdom
//
// Quick task 261004-ox6 (sketch 011 decision 44, option B, Mark 2026-10-04): every line
// of a split ingredient has its own remove link, and each one removes the whole
// ingredient. renderToStaticMarkup drops handlers, so the clicks need a real render
// cycle: jsdom, per file, in a sibling of IngredientTable.test.jsx so that file keeps
// running with no window (see Shell.flyout.test.jsx).
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { IngredientTable } from './IngredientTable.jsx';
import { displayNumbers } from '../domain/stepNumbers.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let current = null;

function mount(onTogglePenRowRemoved) {
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

describe('IngredientTable — every line of a split ingredient removes the whole ingredient (261004-ox6; sketch 011 decision 44, Test E)', () => {
  it("both of Whole milk's links call onTogglePenRowRemoved with its row id, and Heavy cream's with its own", () => {
    const onToggle = vi.fn();
    mount(onToggle);

    const links = buttonsLabelled('remove Whole milk');
    expect(links.map((button) => button.getAttribute('aria-label'))).toEqual(['remove Whole milk, Step 2', 'remove Whole milk, Step 3']);

    act(() => links[1].click());
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenLastCalledWith('a');

    act(() => links[0].click());
    expect(onToggle).toHaveBeenCalledTimes(2);
    expect(onToggle).toHaveBeenLastCalledWith('a');

    const cream = [...current.container.querySelectorAll('tbody tr')]
      .find((tr) => tr.textContent.includes('Heavy cream'))
      .querySelector('button');
    act(() => cream.click());
    expect(onToggle).toHaveBeenCalledTimes(3);
    expect(onToggle).toHaveBeenLastCalledWith('b');
  });
});
