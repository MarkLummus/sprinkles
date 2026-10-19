// @vitest-environment jsdom
//
// The Search page's Sheet code field (PRINT-04; D-09 to D-13). Mounted whole
// over an in-memory stand-in for the repository seam (the only path to the
// store), inside a MemoryRouter that carries a notebook route which renders
// its own params, so a landing is read off the address, not guessed.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useParams } from 'react-router';

const store = vi.hoisted(() => ({ versions: [], load: null }));

vi.mock('../store/repository.js', () => ({
  repository: { listVersions: async () => (store.load ? store.load() : store.versions) },
}));

import {
  SheetCodeSearch,
  SHEET_CODE_NO_MATCH,
  SHEET_CODE_STORE_ERROR,
  SHEET_CODE_WRONG_LENGTH,
  SHEET_CODE_LETTER_U,
  SHEET_CODE_OTHER_CHARACTER,
} from './SheetCodeSearch.jsx';
import { seedRecipeGroups } from '../data/seed-recipes.js';
import { sheetCode } from '../domain/sheetCode.js';

// The stamped olive oil version the store holds: it carries its stored sheetCode.
const oliveOilVersion = seedRecipeGroups[0].versions[0];

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function Landed() {
  const { recipeId, versionId } = useParams();
  return <p data-testid="landed">{`${recipeId}/${versionId}`}</p>;
}

let host = null;
let root = null;

async function mount(versions) {
  store.versions = versions;
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
          <Route path="/search" element={<SheetCodeSearch />} />
          <Route path="/notebook/:recipeId/:versionId" element={<Landed />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

// Type into the field the way React hears it, then submit the form the way
// Enter or the keyboard's Go does. The line is set on the next frame (so a
// repeat is read again), and typeAndSubmit waits for it.
async function type(text) {
  const field = host.querySelector('input');
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(field, text);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function submit() {
  await act(async () => {
    host.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
}

async function nextFrame() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  });
}

async function typeAndSubmit(text) {
  await type(text);
  await submit();
  await nextFrame();
}

afterEach(async () => {
  store.load = null;
  await act(async () => root?.unmount());
  host?.remove();
  host = null;
  root = null;
});

describe('SheetCodeSearch — the field', () => {
  it('is labelled Sheet code and is a text entry that asks for capitals and no spell check', async () => {
    await mount([oliveOilVersion]);
    const field = host.querySelector('input');
    expect(field.labels[0].textContent.trim()).toBe('Sheet code');
    expect(field.type).toBe('text');
    expect(field.getAttribute('autocapitalize')).toBe('characters');
    expect(field.getAttribute('spellcheck')).toBe('false');
    expect(field.getAttribute('enterkeyhint')).toBe('go');
  });

  it('keeps the page title Search and a polite status region the field does not point at', async () => {
    await mount([oliveOilVersion]);
    expect(host.querySelector('h1').textContent).toBe('Search');
    const status = host.querySelector('[role="status"]');
    expect(status.getAttribute('aria-live')).toBe('polite');
    // The field is refocused on every Find; pointing it at the live region made VoiceOver read the line twice.
    expect(host.querySelector('input').hasAttribute('aria-describedby')).toBe(false);
    expect(status.textContent).toBe('');
  });

  it('carries one Find submit button, born on the shared Button, a Tab stop beside the field', async () => {
    await mount([oliveOilVersion]);
    const buttons = host.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent).toBe('Find');
    expect(buttons[0].type).toBe('submit');
    expect(buttons[0].getAttribute('tabindex')).toBe('0');
    expect(buttons[0].className).toBe('notebook-action');
    expect(host.querySelector('input').closest('form')).toBe(buttons[0].closest('form'));
  });
});

describe('SheetCodeSearch — a code typed lands on its version (D-09, D-10, D-12)', () => {
  it("opens Olive Oil v1's own Notebook page from its code in lower case without the hyphen", async () => {
    await mount([oliveOilVersion]);
    const typed = oliveOilVersion.sheetCode.replace('-', '').toLowerCase();
    await typeAndSubmit(typed);
    expect(host.querySelector('[data-testid="landed"]').textContent).toBe(
      'olive-oil-ice-cream/olive-oil-ice-cream-v1',
    );
  });

  it('reads the hyphenated form and surrounding spaces too', async () => {
    await mount([oliveOilVersion]);
    await typeAndSubmit(` ${oliveOilVersion.sheetCode} `);
    expect(host.querySelector('[data-testid="landed"]')).not.toBeNull();
  });

  it('lands on the newer version when two share a code', async () => {
    // Two versions that share one stored code.
    const shared = 'XJ9K-948V';
    const older = { id: 'c', recipeId: 'r', versionLabel: 'x259595', rows: [], method: [], createdAt: '2026-01-01T00:00:00.000Z', sheetCode: shared };
    const newer = { id: 'c', recipeId: 'r2', versionLabel: 'x1558660', rows: [], method: [], createdAt: '2026-02-01T00:00:00.000Z', sheetCode: shared };
    await mount([older, newer]);
    await typeAndSubmit(shared);
    expect(host.querySelector('[data-testid="landed"]').textContent).toBe('r2/c');
  });

  it('finds a version by its stored code, not the one its content derives', async () => {
    const stored = { ...oliveOilVersion, sheetCode: 'ZZZZ-0000' };
    expect(sheetCode(stored)).not.toBe('ZZZZ-0000');
    await mount([stored]);
    await typeAndSubmit(sheetCode(stored));
    expect(host.querySelector('[data-testid="landed"]')).toBeNull();
    await typeAndSubmit('zzzz0000');
    expect(host.querySelector('[data-testid="landed"]').textContent).toBe(
      'olive-oil-ice-cream/olive-oil-ice-cream-v1',
    );
  });
});

describe('SheetCodeSearch — no match (D-13, UX1-03)', () => {
  it('reads exactly "No version has this code." for a code nothing has, and keeps focus in the field', async () => {
    await mount([oliveOilVersion]);
    await typeAndSubmit('0000-0000');
    const status = host.querySelector('[role="status"]');
    expect(status.textContent).toBe('No version has this code.');
    expect(SHEET_CODE_NO_MATCH).toBe('No version has this code.');
    expect(host.querySelector('[data-testid="landed"]')).toBeNull();
    expect(document.activeElement).toBe(host.querySelector('input'));
  });

  it('reads the length line with 0 for an empty, a whitespace-only and a hyphens-only submit', async () => {
    await mount([oliveOilVersion]);
    for (const text of ['', '   ', '----']) {
      await typeAndSubmit(text);
      expect(host.querySelector('[role="status"]').textContent).toBe(SHEET_CODE_WRONG_LENGTH(0));
      expect(host.querySelector('[role="status"]').textContent).toBe(
        'A Sheet code has eight letters and numbers. This one has 0.',
      );
      expect(document.activeElement).toBe(host.querySelector('input'));
    }
    expect(host.querySelectorAll('[role="status"] *')).toHaveLength(0);
  });

  it('empties the status on a repeat submit and writes the line again on the next frame, for every line, so it is read again (WR-07)', async () => {
    await mount([oliveOilVersion]);
    const pairs = [
      ['', SHEET_CODE_WRONG_LENGTH(0)],
      ['K7QM2X', SHEET_CODE_WRONG_LENGTH(6)],
      ['K7QM-2X9!', SHEET_CODE_OTHER_CHARACTER],
      ['K7QM-2X9U', SHEET_CODE_LETTER_U],
      ['0000-0000', SHEET_CODE_NO_MATCH],
    ];
    const status = host.querySelector('[role="status"]');
    for (const [text, line] of pairs) {
      await typeAndSubmit(text);
      expect(status.textContent).toBe(line);
      await submit();
      expect(status.textContent).toBe('');
      expect(document.activeElement).toBe(host.querySelector('input'));
      await nextFrame();
      expect(status.textContent).toBe(line);
      expect(document.activeElement).toBe(host.querySelector('input'));
      expect(host.querySelectorAll('[role="status"] *')).toHaveLength(0);
    }
  });

  it('pins the exact copy of every line', () => {
    expect(SHEET_CODE_WRONG_LENGTH(0)).toBe('A Sheet code has eight letters and numbers. This one has 0.');
    expect(SHEET_CODE_LETTER_U).toBe('Sheet codes never use the letter U.');
    expect(SHEET_CODE_OTHER_CHARACTER).toBe('Sheet codes use only letters and numbers.');
    expect(SHEET_CODE_WRONG_LENGTH(1)).toBe('A Sheet code has eight letters and numbers. This one has 1.');
    expect(SHEET_CODE_WRONG_LENGTH(6)).toBe('A Sheet code has eight letters and numbers. This one has 6.');
    expect(SHEET_CODE_WRONG_LENGTH(10)).toBe('A Sheet code has eight letters and numbers. This one has 10.');
  });

  it('counts the symbols through the field: 6 for K7QM2X, 10 for K7QM 2X9D OO', async () => {
    await mount([oliveOilVersion]);
    await typeAndSubmit('K7QM2X');
    expect(host.querySelector('[role="status"]').textContent).toBe(SHEET_CODE_WRONG_LENGTH(6));
    await typeAndSubmit('K7QM 2X9D OO');
    expect(host.querySelector('[role="status"]').textContent).toBe(SHEET_CODE_WRONG_LENGTH(10));
  });

  it('puts length first, then another character, then U, through the field', async () => {
    await mount([oliveOilVersion]);
    const cases = [
      ['K7QM-2U', SHEET_CODE_WRONG_LENGTH(6)],
      ['!', SHEET_CODE_WRONG_LENGTH(1)],
      ['U!', SHEET_CODE_WRONG_LENGTH(2)],
      ['K7QM-2XU', SHEET_CODE_WRONG_LENGTH(7)],
      ['K7QM-2X9U!', SHEET_CODE_WRONG_LENGTH(9)],
      ['K7QM-2X9!', SHEET_CODE_OTHER_CHARACTER],
      ['K7QM-2X9É', SHEET_CODE_OTHER_CHARACTER],
      ['K7QM-2X9🍦', SHEET_CODE_OTHER_CHARACTER],
      ['K7QM-2X9U', SHEET_CODE_LETTER_U],
    ];
    for (const [text, line] of cases) {
      await typeAndSubmit(text);
      expect(host.querySelector('[role="status"]').textContent).toBe(line);
    }
  });

  it('counts an emoji as one symbol through the field', async () => {
    await mount([oliveOilVersion]);
    const cases = [
      ['🍦', SHEET_CODE_WRONG_LENGTH(1)],
      ['K7QM2X9🍦D', SHEET_CODE_WRONG_LENGTH(9)],
    ];
    for (const [text, line] of cases) {
      await typeAndSubmit(text);
      expect(host.querySelector('[role="status"]').textContent).toBe(line);
      expect(document.activeElement).toBe(host.querySelector('input'));
      expect(host.querySelectorAll('[role="status"] *')).toHaveLength(0);
    }
  });

  it('tells a malformed code from a missing sheet, and says why, with focus kept in the field (WR-07)', async () => {
    await mount([oliveOilVersion]);
    const cases = [
      ['K7QM-2X9U', 'Sheet codes never use the letter U.'],
      ['K7QM-2X9!', 'Sheet codes use only letters and numbers.'],
      ['K7QM-2X9', 'A Sheet code has eight letters and numbers. This one has 7.'],
      ['K7QM-2X9DD', 'A Sheet code has eight letters and numbers. This one has 9.'],
      ['hello', 'A Sheet code has eight letters and numbers. This one has 5.'],
    ];
    for (const [text, line] of cases) {
      await typeAndSubmit(text);
      expect(host.querySelector('[role="status"]').textContent).toBe(line);
      expect(host.querySelector('[data-testid="landed"]')).toBeNull();
      expect(document.activeElement).toBe(host.querySelector('input'));
      expect(host.querySelectorAll('[role="status"] *')).toHaveLength(0);
    }
  });
});

describe('SheetCodeSearch — the versions load first (WR-07)', () => {
  it('holds Find, and answers nothing, until the versions are in; then the same code lands', async () => {
    let release;
    const pending = new Promise((resolve) => {
      release = resolve;
    });
    store.load = () => pending;
    await mount([]);
    const find = host.querySelector('button');
    expect(find.disabled).toBe(true);
    await typeAndSubmit(oliveOilVersion.sheetCode);
    expect(host.querySelector('[role="status"]').textContent).toBe('');
    expect(host.querySelector('[data-testid="landed"]')).toBeNull();

    await act(async () => {
      release([oliveOilVersion]);
      await pending;
    });
    expect(host.querySelector('button').disabled).toBe(false);
    await typeAndSubmit(oliveOilVersion.sheetCode);
    expect(host.querySelector('[data-testid="landed"]').textContent).toBe(
      'olive-oil-ice-cream/olive-oil-ice-cream-v1',
    );
  });

  it('says in words that the store could not be read when the load fails, and leaves Find off', async () => {
    store.load = () => Promise.reject(new Error('store down'));
    await mount([]);
    const status = host.querySelector('[role="status"]');
    expect(status.textContent).toBe('Couldn’t look up that code. Try again.');
    expect(SHEET_CODE_STORE_ERROR).toBe('Couldn’t look up that code. Try again.');
    expect(host.querySelectorAll('[role="status"] *')).toHaveLength(0);
    expect(host.querySelector('button').disabled).toBe(true);
  });
});
