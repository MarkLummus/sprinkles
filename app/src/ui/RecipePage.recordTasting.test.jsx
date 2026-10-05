// @vitest-environment jsdom
//
// Quick task 261002-wn0 (sketch 011 decision 30, Mark's answer 1,
// 2026-10-02): below 724, the recipe band's Record a tasting opens the log's
// amend pen with the Tasting section already open, as if Add tasting had
// just been pressed, and never through Correct.
//
// A sibling jsdom file, for the same reason as BatchRow.signed.test.jsx:
// the behaviour is click, focus and the page's own state, which
// renderToStaticMarkup cannot show, and RecipePage.test.jsx must keep
// running with no window in scope. RecipePage is mounted whole, over an
// in-memory stand-in for the repository seam (the only path to the store),
// inside a MemoryRouter that carries the two Notebook paths.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useParams, useLocation } from 'react-router';

const store = vi.hoisted(() => ({ batches: [], saveBatch: null }));

vi.mock('../store/repository.js', async () => {
  const { oliveOilRecipe, oliveOilVersion } = await import('../data/olive-oil.js');
  store.saveBatch = vi.fn(async (record) => {
    const at = store.batches.findIndex((batch) => batch.id === record.id);
    if (at >= 0) store.batches[at] = record;
    else store.batches.push(record);
  });
  return {
    repository: {
      getVersion: async (id) => (id === oliveOilVersion.id ? oliveOilVersion : undefined),
      listVersions: async () => [oliveOilVersion],
      listBatchesForVersion: async () => store.batches.map((batch) => structuredClone(batch)),
      getAllBatches: async () => store.batches.map((batch) => structuredClone(batch)),
      getBatch: async (id) => store.batches.find((batch) => batch.id === id),
      getRecipe: async () => oliveOilRecipe,
      saveBatch: store.saveBatch,
      saveVersion: vi.fn(async () => {}),
      saveRecipe: vi.fn(async () => {}),
    },
  };
});

import { RecipePage } from './RecipePage.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const RECIPE = oliveOilVersion.recipeId;
const VERSION = oliveOilVersion.id;
const VERSION_PATH = `/notebook/${RECIPE}/${VERSION}`;

// The seeded 2 Aug batch with its tasting taken off: it awaits tasting.
const awaiting = { ...structuredClone(augustSecondBatch), tasting: null };

let current = null;
let originalMatchMedia = null;
let pageStatus = null;
let locationNow = null;
let scrollIntoView = null;

// router.jsx keys RecipePage by its three route parameters, so a different
// batch address is a new page instance; this wrapper does the same.
function Keyed({ onPageStatus }) {
  const { recipeId, versionId, batchId } = useParams();
  return <RecipePage key={`${recipeId}::${versionId}::${batchId ?? ''}`} onPageStatus={onPageStatus} />;
}

function Where() {
  locationNow = useLocation();
  return null;
}

// A fixed 393 coarse window: below 724, a coarse pointer. jsdom has no
// Element.scrollIntoView, which the band's focus return calls (Playwright
// WebKit's focus() alone left the band 2.7 screens off; see VersionRow.jsx),
// so this file stubs it and reads the calls.
function installMatchMedia() {
  scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  originalMatchMedia = window.matchMedia;
  window.matchMedia = (query) => {
    const max = query.match(/max-width:\s*([\d.]+)px/);
    const min = query.match(/min-width:\s*([\d.]+)px/);
    let matches = false;
    if (max) matches = 393 <= Number(max[1]);
    else if (min) matches = 393 >= Number(min[1]);
    else if (query.includes('pointer: coarse')) matches = true;
    return { matches, media: query, addEventListener() {}, removeEventListener() {} };
  };
}

async function flush(until) {
  for (let i = 0; i < 40; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {
      await Promise.resolve();
    });
    if (until()) return;
  }
}

async function mountAt(path, batches) {
  store.batches = batches.map((batch) => structuredClone(batch));
  store.saveBatch.mockClear();
  pageStatus = vi.fn();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Where />
        <Routes>
          <Route path="/notebook/:recipeId/:versionId" element={<Keyed onPageStatus={pageStatus} />} />
          <Route path="/notebook/:recipeId/:versionId/batch/:batchId" element={<Keyed onPageStatus={pageStatus} />} />
        </Routes>
      </MemoryRouter>,
    );
  });
  await flush(() => band() !== null);
  return container;
}

function band() {
  return current.container.querySelector('.notebook-version__acts .notebook-action');
}

function buttonByText(scope, text) {
  return [...scope.querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
}

function pen() {
  return current.container.querySelector('.batch-margin--pen');
}

function tastedInput() {
  const label = [...pen().querySelectorAll('label')].find(
    (candidate) => candidate.querySelector('.pen-caption')?.textContent === 'Tasted',
  );
  return label?.querySelector('input') ?? null;
}

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

async function setValue(element, value) {
  const proto = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  await act(async () => {
    setter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function pressEscape() {
  await act(async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });
}

afterEach(async () => {
  if (current) {
    await act(async () => current.root.unmount());
    current.container.remove();
    current = null;
  }
  if (originalMatchMedia === undefined) delete window.matchMedia;
  else window.matchMedia = originalMatchMedia;
  originalMatchMedia = null;
  delete Element.prototype.scrollIntoView;
});

describe('Record a tasting opens the amend pen on Add tasting (261002-wn0)', () => {
  it('T1: opens the pen on the batch awaiting tasting, Tasting open, Tasted date focused, no Correct anywhere', async () => {
    installMatchMedia();
    await mountAt(VERSION_PATH, [awaiting]);
    expect(band().textContent).toBe('Record a tasting');

    await click(band());

    expect(pen()).not.toBeNull();
    expect([...pen().querySelectorAll('h3')].some((h3) => h3.textContent === 'Tasting')).toBe(true);
    expect(tastedInput()).not.toBeNull();
    expect(document.activeElement).toBe(tastedInput());
    expect(current.container.querySelector('.batch-row__correct')).toBeNull();
    expect(current.container.querySelector('.save-ceremony__add-tasting')).toBeNull();
    const batchRow = current.container.querySelector('.batch-row');
    const ownTexts = [...batchRow.querySelectorAll('*')].map((el) =>
      [...el.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent).join('').trim(),
    );
    expect(ownTexts).not.toContain('Correct');
    expect(current.container.querySelector('.batch-row__date').textContent).toBe('churned 2 Aug 2026');
    expect(pen().querySelector('input[aria-label^="Time to draw temp"]').value).toBe('20');
  });

  it('T2: Cancel closes the pen, writes nothing and returns focus to the band', async () => {
    installMatchMedia();
    await mountAt(VERSION_PATH, [awaiting]);
    await click(band());

    await click(buttonByText(pen(), 'Cancel'));

    expect(pen()).toBeNull();
    expect(store.saveBatch).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(band());
    expect(scrollIntoView.mock.contexts).toContain(band());
    expect(band().textContent).toBe('Record a tasting');
  });

  it('T3: Escape closes an untouched pen onto the band, and does nothing once the maker has typed', async () => {
    installMatchMedia();
    await mountAt(VERSION_PATH, [awaiting]);
    await click(band());

    await pressEscape();
    expect(pen()).toBeNull();
    expect(document.activeElement).toBe(band());

    await click(band());
    await setValue(pen().querySelector('textarea[aria-label="How did it turn out?"]'), 'Soft');
    await pressEscape();
    expect(pen()).not.toBeNull();
  });

  it('T4: Save writes the tasting to that batch through the amend save and lands on the Batch heading', async () => {
    installMatchMedia();
    await mountAt(VERSION_PATH, [awaiting]);
    await click(band());
    await setValue(pen().querySelector('textarea[aria-label="How did it turn out?"]'), 'Soft, not greasy.');
    await setValue(pen().querySelector('input[aria-label^="Tempering"]'), '10');

    await click(buttonByText(pen(), 'Save batch'));
    await flush(() => pen() === null);

    expect(store.saveBatch).toHaveBeenCalledTimes(1);
    const saved = store.saveBatch.mock.calls[0][0];
    expect(saved.id).toBe(awaiting.id);
    expect(saved.tasting.note).toBe('Soft, not greasy.');
    expect(saved.tasting.temperingMinutes).toBe(10);
    expect(saved.churn.churnDate).toBe('2026-08-02');
    expect(pageStatus).toHaveBeenCalled();
    expect(pageStatus.mock.calls.some(([message]) => typeof message === 'string' && message.startsWith('changed ') && !message.includes('against'))).toBe(true);
    expect(pen()).toBeNull();
    expect(document.activeElement).toBe(current.container.querySelector('h2#batch'));
    expect(band().textContent).toBe('Record another');
  });

  // A guard, not a RED: Correct's own path is unchanged by this task, so
  // this passes before and after.
  it('T5: Correct still opens the pen with Tasting closed and Add tasting offered, and Cancel returns to Correct', async () => {
    installMatchMedia();
    await mountAt(VERSION_PATH, [awaiting]);

    const correct = current.container.querySelector('.batch-row__correct');
    await click(correct);

    expect([...pen().querySelectorAll('h3')].some((h3) => h3.textContent === 'Tasting')).toBe(false);
    expect(pen().querySelector('.save-ceremony__add-tasting')).not.toBeNull();
    expect(document.activeElement).toBe(pen().querySelector('input[type="date"]'));

    await click(buttonByText(pen(), 'Cancel'));
    expect(pen()).toBeNull();
    expect(document.activeElement).toBe(current.container.querySelector('.batch-row__correct'));
  });

  // The band names the version's latest batch; a batch list row links to an
  // older batch's own address, where the log shows that older batch. Opening
  // in place there would show one batch's head and save onto another
  // (T-wn0-01), so the band moves to the awaiting batch's own address.
  it('T6: on an older batch\'s address, Record a tasting moves to the awaiting batch and opens the pen there', async () => {
    installMatchMedia();
    const newer = {
      ...structuredClone(augustSecondBatch),
      id: 'newer-batch',
      recordedAt: '2026-08-09T10:00:00.000Z',
      churn: { ...augustSecondBatch.churn, churnDate: '2026-08-09' },
      tasting: null,
    };
    const olderPath = `${VERSION_PATH}/batch/${augustSecondBatch.id}`;
    await mountAt(olderPath, [augustSecondBatch, newer]);
    expect(current.container.querySelector('.batch-row__head .fold-row__count').textContent).toBe('churned 2 Aug 2026');
    expect(band().textContent).toBe('Record a tasting');

    await click(band());
    await flush(() => pen() !== null);

    expect(locationNow.pathname).toBe(`${VERSION_PATH}/batch/newer-batch`);
    expect(pen()).not.toBeNull();
    expect(current.container.querySelector('.batch-row__date').textContent).toBe('churned 9 Aug 2026');
    expect(tastedInput()).not.toBeNull();
    expect(document.activeElement).toBe(tastedInput());
    expect(locationNow.state).toBeNull();

    await click(buttonByText(pen(), 'Cancel'));
    expect(pen()).toBeNull();
    expect(document.activeElement).toBe(band());

    // Back or a reload lands on the same history entry: it carries no state,
    // so no pen opens.
    const entry = { pathname: locationNow.pathname, state: locationNow.state };
    await act(async () => current.root.unmount());
    current.container.remove();
    current = null;
    await mountAt(entry, [augustSecondBatch, newer]);
    expect(pen()).toBeNull();
  });
});
