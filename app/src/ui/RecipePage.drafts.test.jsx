// @vitest-environment jsdom
//
// 04-09 (UX1-02, D-14 to D-17): every pen keeps its draft through a reload.
// RecipePage is mounted whole over an in-memory stand-in for the repository
// seam that now holds a drafts map, inside a MemoryRouter that carries the
// version's addresses. A "reload" here is a fresh mount over the same store,
// which is what a real reload is to the page: its state is gone and the
// stored draft is all that is left. The real reloads, in WebKit and Chrome,
// are .planning/phases/04-.../04-draft-probe.mjs.
//
// What this file pins: a stored draft reopens its pen with the ink and the
// approved notice; the page asks nothing (no dialog) and writes nothing to
// versions or batches until Save; typing writes the draft after a debounce;
// Cancel and Save delete it; Escape on an untouched pen leaves none; a draft
// that no longer fits its version is deleted quietly; no beforeunload
// handler exists.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useParams, useLocation } from 'react-router';

const store = vi.hoisted(() => ({
  drafts: new Map(),
  batches: [],
  saveDraft: null,
  deleteDraft: null,
  saveVersion: null,
  saveBatch: null,
}));

vi.mock('../store/repository.js', async () => {
  const { oliveOilRecipe, oliveOilVersion } = await import('../data/olive-oil.js');
  store.saveDraft = vi.fn(async (record) => {
    store.drafts.set(record.versionId, structuredClone(record));
  });
  store.deleteDraft = vi.fn(async (versionId) => {
    store.drafts.delete(versionId);
  });
  store.saveVersion = vi.fn(async () => {});
  store.saveBatch = vi.fn(async (record) => {
    const at = store.batches.findIndex((batch) => batch.id === record.id);
    if (at >= 0) store.batches[at] = structuredClone(record);
    else store.batches.push(structuredClone(record));
  });
  return {
    repository: {
      getVersion: async (id) => (id === oliveOilVersion.id ? structuredClone(oliveOilVersion) : undefined),
      listVersions: async () => [structuredClone(oliveOilVersion)],
      listBatchesForVersion: async () => store.batches.map((batch) => structuredClone(batch)),
      getAllBatches: async () => store.batches.map((batch) => structuredClone(batch)),
      getBatch: async (id) => {
        const found = store.batches.find((batch) => batch.id === id);
        return found ? structuredClone(found) : undefined;
      },
      getRecipe: async () => oliveOilRecipe,
      saveBatch: store.saveBatch,
      saveVersion: store.saveVersion,
      saveRecipe: vi.fn(async () => {}),
      getDraft: async (versionId) => {
        const found = store.drafts.get(versionId);
        return found ? structuredClone(found) : undefined;
      },
      saveDraft: store.saveDraft,
      deleteDraft: store.deleteDraft,
      listDrafts: async () => [...store.drafts.values()].map((record) => structuredClone(record)),
    },
  };
});

import {
  RecipePage,
  DRAFT_KEPT_STATUS,
  blankRecordDraft,
  draftFromBatch,
} from './RecipePage.jsx';
import { RECORD_DRAFT_KEYS, buildDraftRecord } from '../domain/draft.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const RECIPE = oliveOilVersion.recipeId;
const VERSION = oliveOilVersion.id;
const VERSION_PATH = `/notebook/${RECIPE}/${VERSION}`;
const BATCH_PATH = `${VERSION_PATH}/batch/${augustSecondBatch.id}`;
const OPENED_AT = '2026-10-10T08:00:00.000Z';
const WRITTEN_AT = '2026-10-10T08:05:00.000Z';

let current = null;
let pageStatus = null;
let locationNow = null;
let originalMatchMedia = null;

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

// A wide fine-pointer window (the default of jsdom's absent matchMedia is a
// throw in the width hooks, so every test installs one).
function installMatchMedia() {
  Element.prototype.scrollIntoView = vi.fn();
  originalMatchMedia = window.matchMedia;
  window.matchMedia = (query) => {
    const max = query.match(/max-width:\s*([\d.]+)px/);
    const min = query.match(/min-width:\s*([\d.]+)px/);
    let matches = false;
    if (max) matches = 1280 <= Number(max[1]);
    else if (min) matches = 1280 >= Number(min[1]);
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

async function mountAt(path) {
  installMatchMedia();
  store.saveDraft.mockClear();
  store.deleteDraft.mockClear();
  store.saveVersion.mockClear();
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
  await flush(() => current.container.querySelector('.notebook-version') !== null || nextVersionPen() !== null);
  // One more turn: the restore reads the store after the loads settle.
  await flush(() => false);
  return current.container;
}

async function unmountPage() {
  await act(async () => current.root.unmount());
  current.container.remove();
  current = null;
  if (originalMatchMedia === undefined) delete window.matchMedia;
  else window.matchMedia = originalMatchMedia;
  originalMatchMedia = null;
  delete Element.prototype.scrollIntoView;
}

afterEach(async () => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  if (current) await unmountPage();
  store.drafts.clear();
  store.batches = [];
});

function nextVersionPen() {
  return current.container.querySelector('form[aria-label="Next version"]');
}

function versionNameField() {
  return current.container.querySelector('input[aria-label="Version name"]');
}

function gramsField(label) {
  return current.container.querySelector(`input[aria-label="${label}"]`);
}

function buttonByText(text) {
  return [...current.container.querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
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

// Lets the 250 ms debounce elapse under fake timers.
async function elapse(ms) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
  await flush(() => false);
}

// What handleStartDeveloping builds, with the maker's two edits applied: a
// version name and Whole milk's first line at 100 g.
function planDraftRecord() {
  const rows = Object.fromEntries(
    oliveOilVersion.rows.map((row) => [
      row.id,
      { portions: row.portions.map((portion) => ({ step: portion.step, grams: String(portion.grams), removed: false })) },
    ]),
  );
  rows['row-01'].portions[0].grams = '100';
  return buildDraftRecord({
    versionId: VERSION,
    kind: 'plan',
    payload: {
      versionLabel: 'less milk',
      reason: '',
      citedBatchId: null,
      sheetTitle: oliveOilVersion.sheetTitle,
      sheetDescription: oliveOilVersion.sheetDescription,
      rows,
      method: structuredClone(oliveOilVersion.method),
      authored: structuredClone(oliveOilVersion.authored),
    },
    penOpenedAt: OPENED_AT,
    now: WRITTEN_AT,
  });
}

function storeDraft(record) {
  store.drafts.set(record.versionId, structuredClone(record));
}

describe('a Next version draft is kept through a reload (04-09, Task 1)', () => {
  it('reopens the pen with the draft’s version name and grams, says the approved words once, and writes no version', async () => {
    storeDraft(planDraftRecord());
    const confirm = vi.spyOn(window, 'confirm');
    const alert = vi.spyOn(window, 'alert');
    const prompt = vi.spyOn(window, 'prompt');
    await mountAt(VERSION_PATH);
    await flush(() => nextVersionPen() !== null);

    expect(nextVersionPen()).not.toBeNull();
    expect(versionNameField().value).toBe('less milk');
    expect(gramsField('Whole milk, grams, portion 1').value).toBe('100');
    expect(gramsField('Whole milk, grams, portion 2').value).toBe('250.4');

    expect(DRAFT_KEPT_STATUS).toBe('Draft kept. Cancel discards it.');
    const keptCalls = pageStatus.mock.calls.filter(([message]) => message === 'Draft kept. Cancel discards it.');
    expect(keptCalls).toHaveLength(1);
    // Sent with no options: the router clears it after its own five seconds
    // and nothing persists it.
    expect(keptCalls[0]).toHaveLength(1);

    expect(store.saveVersion).not.toHaveBeenCalled();
    expect(store.saveBatch).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
    expect(alert).not.toHaveBeenCalled();
    expect(prompt).not.toHaveBeenCalled();
  });

  it('takes the opener’s pen date back from the draft, so the History rail’s draft node keeps the day the pen opened', async () => {
    storeDraft(planDraftRecord());
    await mountAt(VERSION_PATH);
    await flush(() => nextVersionPen() !== null);
    expect(current.container.textContent).toContain('10 Oct');
  });

  it('writes the draft after the 250 ms debounce while the pen holds ink, and not before', async () => {
    await mountAt(VERSION_PATH);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await click(buttonByText('Next version'));
    expect(nextVersionPen()).not.toBeNull();
    // An opened pen with nothing typed holds no ink: nothing is written.
    await elapse(400);
    expect(store.saveDraft).not.toHaveBeenCalled();

    await setValue(versionNameField(), 'less oil');
    await elapse(100);
    expect(store.saveDraft).not.toHaveBeenCalled();
    await elapse(200);
    expect(store.saveDraft).toHaveBeenCalledTimes(1);
    const record = store.saveDraft.mock.calls[0][0];
    expect(record.versionId).toBe(VERSION);
    expect(record.kind).toBe('plan');
    expect(record.payload.versionLabel).toBe('less oil');
    expect(record.shapeVersion).toBe(1);
    expect(typeof record.penOpenedAt).toBe('string');

    await setValue(versionNameField(), 'less oil, more cream');
    await setValue(versionNameField(), 'less oil, more cream still');
    await elapse(300);
    // Two quick changes are one write: the debounce keeps only the last.
    expect(store.saveDraft).toHaveBeenCalledTimes(2);
    expect(store.saveDraft.mock.calls[1][0].payload.versionLabel).toBe('less oil, more cream still');
  });

  it('Cancel deletes the draft and nothing writes it back', async () => {
    storeDraft(planDraftRecord());
    await mountAt(VERSION_PATH);
    await flush(() => nextVersionPen() !== null);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    await click(buttonByText('Cancel'));
    await flush(() => false);
    expect(nextVersionPen()).toBeNull();
    expect(store.deleteDraft).toHaveBeenCalledWith(VERSION);
    expect(store.drafts.has(VERSION)).toBe(false);

    await elapse(1000);
    expect(store.saveDraft).not.toHaveBeenCalled();
    expect(store.drafts.has(VERSION)).toBe(false);
  });

  it('Cancel straight after typing leaves nothing behind either: the waiting write is dropped', async () => {
    await mountAt(VERSION_PATH);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await click(buttonByText('Next version'));
    await setValue(versionNameField(), 'typed just now');
    await click(buttonByText('Cancel'));
    await elapse(1000);
    expect(store.saveDraft).not.toHaveBeenCalled();
    expect(store.drafts.has(VERSION)).toBe(false);
  });

  it('Escape closing an untouched pen leaves no draft (D-16)', async () => {
    await mountAt(VERSION_PATH);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await click(buttonByText('Next version'));
    expect(nextVersionPen()).not.toBeNull();
    await pressEscape();
    expect(nextVersionPen()).toBeNull();
    await elapse(1000);
    expect(store.saveDraft).not.toHaveBeenCalled();
    expect(store.drafts.size).toBe(0);
  });

  it('typing a draft away again deletes it: a pen back at the version’s own values holds no ink', async () => {
    storeDraft(planDraftRecord());
    await mountAt(VERSION_PATH);
    await flush(() => nextVersionPen() !== null);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    await setValue(versionNameField(), '');
    await setValue(gramsField('Whole milk, grams, portion 1'), '120');
    await elapse(400);
    expect(store.deleteDraft).toHaveBeenCalledWith(VERSION);
    expect(store.drafts.has(VERSION)).toBe(false);
  });

  it('deletes a stored draft that no longer fits its version and opens the page in reading, quietly', async () => {
    const stale = planDraftRecord();
    delete stale.payload.rows['row-01'];
    storeDraft(stale);
    const confirm = vi.spyOn(window, 'confirm');
    await mountAt(VERSION_PATH);
    await flush(() => store.deleteDraft.mock.calls.length > 0);

    expect(store.deleteDraft).toHaveBeenCalledWith(VERSION);
    expect(store.drafts.has(VERSION)).toBe(false);
    expect(nextVersionPen()).toBeNull();
    expect(current.container.querySelector('.notebook-version__acts')).not.toBeNull();
    expect(pageStatus.mock.calls.some(([message]) => message === DRAFT_KEPT_STATUS)).toBe(false);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('refuses a restored draft that carries a prototype key and deletes it', async () => {
    const hostile = planDraftRecord();
    hostile.payload.method[0].targets = [JSON.parse('{"label":"a","value":"b","__proto__":{"polluted":true}}')];
    storeDraft(hostile);
    await mountAt(VERSION_PATH);
    await flush(() => store.deleteDraft.mock.calls.length > 0);
    expect(nextVersionPen()).toBeNull();
    expect({}.polluted).toBeUndefined();
  });

  it('registers no beforeunload handler anywhere while a pen holds ink (D-17)', async () => {
    const added = vi.spyOn(window, 'addEventListener');
    await mountAt(VERSION_PATH);
    await click(buttonByText('Next version'));
    await setValue(versionNameField(), 'less oil');
    const types = added.mock.calls.map(([type]) => type);
    expect(types).not.toContain('beforeunload');
  });
});

describe('the record draft’s fields', () => {
  it('RECORD_DRAFT_KEYS is exactly what blankRecordDraft builds, field for field and type for type', () => {
    const blank = blankRecordDraft();
    expect(Object.keys(blank).sort()).toEqual([...RECORD_DRAFT_KEYS].sort());
    // A draft restored from the augustSecondBatch correction has the same fields too.
    expect(Object.keys(draftFromBatch(augustSecondBatch)).sort()).toEqual([...RECORD_DRAFT_KEYS].sort());
  });
});

export { BATCH_PATH, locationNow };
