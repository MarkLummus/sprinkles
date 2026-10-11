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

import { SheetCodeSearch, SHEET_CODE_NO_MATCH, SHEET_CODE_MALFORMED, SHEET_CODE_STORE_ERROR } from './SheetCodeSearch.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { sheetCode } from '../domain/sheetCode.js';

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

  it('keeps the page title Search and a polite status region the field points at', async () => {
    await mount([oliveOilVersion]);
    expect(host.querySelector('h1').textContent).toBe('Search');
    const status = host.querySelector('[role="status"]');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(host.querySelector('input').getAttribute('aria-describedby')).toBe(status.id);
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
    const typed = sheetCode(oliveOilVersion).replace('-', '').toLowerCase();
    await typeAndSubmit(typed);
    expect(host.querySelector('[data-testid="landed"]').textContent).toBe(
      'olive-oil-ice-cream/olive-oil-ice-cream-v1',
    );
  });

  it('reads the hyphenated form and surrounding spaces too', async () => {
    await mount([oliveOilVersion]);
    await typeAndSubmit(` ${sheetCode(oliveOilVersion)} `);
    expect(host.querySelector('[data-testid="landed"]')).not.toBeNull();
  });

  it('lands on the newer version when two share a code', async () => {
    // Two versions that really share a code (pinned in sheetCode.test.js).
    const older = { id: 'c', recipeId: 'r', versionLabel: 'x259595', rows: [], method: [], createdAt: '2026-01-01T00:00:00.000Z' };
    const newer = { id: 'c', recipeId: 'r2', versionLabel: 'x1558660', rows: [], method: [], createdAt: '2026-02-01T00:00:00.000Z' };
    expect(sheetCode(older)).toBe(sheetCode(newer));
    await mount([older, newer]);
    await typeAndSubmit(sheetCode(older));
    expect(host.querySelector('[data-testid="landed"]').textContent).toBe('r2/c');
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

  it('reads the same line for an empty and a blank submit', async () => {
    await mount([oliveOilVersion]);
    for (const text of ['', '   ']) {
      await typeAndSubmit(text);
      expect(host.querySelector('[role="status"]').textContent).toBe('No version has this code.');
      expect(document.activeElement).toBe(host.querySelector('input'));
    }
    expect(host.querySelectorAll('[role="status"] *')).toHaveLength(0);
  });

  it('empties the status on a repeat submit and writes the line again on the next frame, so it is read again (WR-07)', async () => {
    await mount([oliveOilVersion]);
    await typeAndSubmit('0000-0000');
    const status = host.querySelector('[role="status"]');
    expect(status.textContent).toBe('No version has this code.');
    await submit();
    expect(status.textContent).toBe('');
    expect(document.activeElement).toBe(host.querySelector('input'));
    await nextFrame();
    expect(status.textContent).toBe('No version has this code.');
    expect(document.activeElement).toBe(host.querySelector('input'));
  });

  it('tells a malformed code from a missing sheet, and keeps focus in the field (WR-07)', async () => {
    await mount([oliveOilVersion]);
    for (const text of ['K7QM-2X9U', 'K7QM-2X9', 'K7QM-2X9DD', 'hello']) {
      await typeAndSubmit(text);
      expect(host.querySelector('[role="status"]').textContent).toBe('Check the code: it has eight letters and numbers.');
      expect(host.querySelector('[data-testid="landed"]')).toBeNull();
      expect(document.activeElement).toBe(host.querySelector('input'));
    }
    expect(SHEET_CODE_MALFORMED).toBe('Check the code: it has eight letters and numbers.');
    expect(host.querySelectorAll('[role="status"] *')).toHaveLength(0);
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
    await typeAndSubmit(sheetCode(oliveOilVersion));
    expect(host.querySelector('[role="status"]').textContent).toBe('');
    expect(host.querySelector('[data-testid="landed"]')).toBeNull();

    await act(async () => {
      release([oliveOilVersion]);
      await pending;
    });
    expect(host.querySelector('button').disabled).toBe(false);
    await typeAndSubmit(sheetCode(oliveOilVersion));
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
