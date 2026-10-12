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
import { MemoryRouter, Routes, Route, useParams, useLocation, useNavigationType } from 'react-router';

const store = vi.hoisted(() => ({
  drafts: new Map(),
  batches: [],
  // A second version of the recipe, served only while a test sets withSibling.
  sibling: null,
  withSibling: false,
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
  store.sibling = {
    ...structuredClone(oliveOilVersion),
    id: 'olive-oil-ice-cream-v2',
    versionLabel: 'second',
    createdAt: '2026-09-01T00:00:00.000Z',
  };
  store.saveVersion = vi.fn(async () => {});
  store.saveBatch = vi.fn(async (record) => {
    const at = store.batches.findIndex((batch) => batch.id === record.id);
    if (at >= 0) store.batches[at] = structuredClone(record);
    else store.batches.push(structuredClone(record));
  });
  return {
    repository: {
      getVersion: async (id) => {
        if (id === oliveOilVersion.id) return structuredClone(oliveOilVersion);
        if (store.withSibling && id === store.sibling.id) return structuredClone(store.sibling);
        return undefined;
      },
      listVersions: async () =>
        store.withSibling ? [structuredClone(oliveOilVersion), structuredClone(store.sibling)] : [structuredClone(oliveOilVersion)],
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

import { repository } from '../store/repository.js';
import {
  RecipePage,
  DRAFT_KEPT_STATUS,
  PAGE_LOAD_ERROR,
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
let navigationType = null;
let originalMatchMedia = null;

// router.jsx keys RecipePage by its three route parameters, so a different
// batch address is a new page instance; this wrapper does the same.
function Keyed({ onPageStatus }) {
  const { recipeId, versionId, batchId } = useParams();
  return <RecipePage key={`${recipeId}::${versionId}::${batchId ?? ''}`} onPageStatus={onPageStatus} />;
}

function Where() {
  locationNow = useLocation();
  navigationType = useNavigationType();
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
  store.withSibling = false;
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


// ---------------------------------------------------------------------------
// Task 2: the record and Correct pens.
// ---------------------------------------------------------------------------
function pen() {
  return current.container.querySelector('.batch-margin--pen');
}

function churnDateField() {
  return pen().querySelector('.field-row__label--date input');
}

function measuredField(labelStart) {
  return pen().querySelector(`input[aria-label^="${labelStart}"]`);
}

function markedStop(axisName) {
  const axis = [...pen().querySelectorAll('.axis-mark')].find(
    (node) => node.querySelector('.axis-mark__name')?.textContent === axisName,
  );
  return axis?.querySelector('input[type="radio"]:checked')?.value ?? null;
}

function recordDraftRecord(overrides = {}) {
  return buildDraftRecord({
    versionId: VERSION,
    kind: 'record',
    payload: {
      ...blankRecordDraft(),
      churnDate: '2026-10-09',
      outOfMachineTempC: '-6',
      tastingOpen: true,
      marks: { hardness: 3 },
      ...overrides,
    },
    now: WRITTEN_AT,
  });
}

// The Correct pen on the 2 Aug batch: payload is the baseline with one edit.
function amendDraftRecord({ edit = { note: 'a little firmer than I wrote' }, ...overrides } = {}) {
  const baseline = draftFromBatch(augustSecondBatch);
  return buildDraftRecord({
    versionId: VERSION,
    kind: 'amend',
    payload: { ...structuredClone(baseline), ...edit },
    amendingBatchId: augustSecondBatch.id,
    amendBaseline: baseline,
    amendOpener: 'correct',
    now: WRITTEN_AT,
    ...overrides,
  });
}

describe('the record pen keeps its draft, its tasting section included (04-09, Task 2)', () => {
  it('reopens the churn date, a measured value, the open tasting and its mark, and says the words once', async () => {
    storeDraft(recordDraftRecord());
    const confirm = vi.spyOn(window, 'confirm');
    await mountAt(VERSION_PATH);
    await flush(() => pen() !== null);

    expect(pen()).not.toBeNull();
    expect(churnDateField().value).toBe('2026-10-09');
    expect(measuredField('Out of machine').value).toBe('-6');
    expect([...pen().querySelectorAll('h3, h2')].some((node) => node.textContent === 'Tasting')).toBe(true);
    expect(markedStop('Hardness')).toBe('3');
    expect(pageStatus.mock.calls.filter(([message]) => message === DRAFT_KEPT_STATUS)).toHaveLength(1);
    expect(store.saveBatch).not.toHaveBeenCalled();
    expect(store.saveVersion).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
  });

  it('opens on any address of the version, a batch address included', async () => {
    store.batches = [structuredClone(augustSecondBatch)];
    storeDraft(recordDraftRecord());
    await mountAt(BATCH_PATH);
    await flush(() => pen() !== null);
    expect(churnDateField().value).toBe('2026-10-09');
    expect(locationNow.pathname).toBe(BATCH_PATH);
  });

  it('Save batch writes the batch once and deletes the draft, and nothing writes it back', async () => {
    storeDraft(recordDraftRecord());
    await mountAt(VERSION_PATH);
    await flush(() => pen() !== null);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    await click(buttonByText('Save batch'));
    await flush(() => store.saveBatch.mock.calls.length > 0);
    await flush(() => store.deleteDraft.mock.calls.length > 0);
    expect(store.saveBatch).toHaveBeenCalledTimes(1);
    expect(store.saveBatch.mock.calls[0][0].churn.churnDate).toBe('2026-10-09');
    expect(store.deleteDraft).toHaveBeenCalledWith(VERSION);
    expect(store.drafts.has(VERSION)).toBe(false);

    await elapse(1000);
    expect(store.saveDraft).not.toHaveBeenCalled();
    expect(store.drafts.has(VERSION)).toBe(false);
  });

  it('Cancel deletes the draft', async () => {
    storeDraft(recordDraftRecord());
    await mountAt(VERSION_PATH);
    await flush(() => pen() !== null);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    await click(buttonByText('Cancel'));
    await elapse(1000);
    expect(pen()).toBeNull();
    expect(store.deleteDraft).toHaveBeenCalledWith(VERSION);
    expect(store.drafts.has(VERSION)).toBe(false);
    expect(store.saveDraft).not.toHaveBeenCalled();
    expect(store.saveBatch).not.toHaveBeenCalled();
  });

  it('typing in a fresh record pen writes a record draft after the debounce', async () => {
    await mountAt(VERSION_PATH);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await click(buttonByText('Record a batch'));
    await flush(() => pen() !== null);
    await elapse(400);
    expect(store.saveDraft).not.toHaveBeenCalled();

    await setValue(churnDateField(), '2026-10-09');
    await elapse(300);
    expect(store.saveDraft).toHaveBeenCalledTimes(1);
    const record = store.saveDraft.mock.calls[0][0];
    expect(record.kind).toBe('record');
    expect(record.amendingBatchId).toBeNull();
    expect(record.amendBaseline).toBeNull();
    expect(record.payload.churnDate).toBe('2026-10-09');
    expect(Object.keys(record.payload).sort()).toEqual([...RECORD_DRAFT_KEYS].sort());
  });
});

describe('the Correct pen keeps its draft and reopens beside its own batch (04-09, Task 2)', () => {
  it('reopens on the batch’s address with its baseline, so an untouched field is not dirty', async () => {
    store.batches = [structuredClone(augustSecondBatch)];
    storeDraft(amendDraftRecord());
    await mountAt(BATCH_PATH);
    await flush(() => pen() !== null);

    expect(pen()).not.toBeNull();
    expect(churnDateField().value).toBe('2026-08-02');
    expect(pen().querySelector('textarea[aria-label="Tasting note"], textarea')).not.toBeNull();
    expect(pageStatus.mock.calls.filter(([message]) => message === DRAFT_KEPT_STATUS)).toHaveLength(1);
    expect(store.saveBatch).not.toHaveBeenCalled();
    // Dirty against its baseline, so Escape does not close it.
    await pressEscape();
    expect(pen()).not.toBeNull();
  });

  it('a Correct draft equal to its baseline is clean: the baseline came back, not a blank', async () => {
    store.batches = [structuredClone(augustSecondBatch)];
    storeDraft(amendDraftRecord({ edit: {} }));
    await mountAt(BATCH_PATH);
    await flush(() => pen() !== null);
    expect(pen()).not.toBeNull();
    await pressEscape();
    expect(pen()).toBeNull();
  });

  it('the same draft opened on the version’s bare address replaces the address with the batch’s and keeps the draft for it', async () => {
    store.batches = [structuredClone(augustSecondBatch)];
    storeDraft(amendDraftRecord());
    await mountAt(VERSION_PATH);
    await flush(() => locationNow.pathname === BATCH_PATH);
    await flush(() => pen() !== null);

    expect(locationNow.pathname).toBe(BATCH_PATH);
    // Replaced, not pushed: Back never returns to the bare address.
    expect(navigationType).toBe('REPLACE');
    expect(pen()).not.toBeNull();
    expect(churnDateField().value).toBe('2026-08-02');
    // The instance the address left deleted nothing, and the one beside the
    // batch announced once.
    expect(store.deleteDraft).not.toHaveBeenCalled();
    expect(store.drafts.has(VERSION)).toBe(true);
    expect(pageStatus.mock.calls.filter(([message]) => message === DRAFT_KEPT_STATUS)).toHaveLength(1);
  });

  it('Save batch on a restored Correct draft writes the corrected batch once and deletes the draft', async () => {
    store.batches = [structuredClone(augustSecondBatch)];
    storeDraft(amendDraftRecord());
    await mountAt(BATCH_PATH);
    await flush(() => pen() !== null);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    await click(buttonByText('Save batch'));
    await flush(() => store.saveBatch.mock.calls.length > 0);
    await flush(() => store.deleteDraft.mock.calls.length > 0);
    expect(store.saveBatch).toHaveBeenCalledTimes(1);
    expect(store.saveBatch.mock.calls[0][0].id).toBe(augustSecondBatch.id);
    expect(store.saveBatch.mock.calls[0][0].tasting.note).toBe('a little firmer than I wrote');
    expect(store.deleteDraft).toHaveBeenCalledWith(VERSION);
    await elapse(1000);
    expect(store.drafts.has(VERSION)).toBe(false);
    expect(store.saveDraft).not.toHaveBeenCalled();
  });

  it('Cancel deletes a restored Correct draft', async () => {
    store.batches = [structuredClone(augustSecondBatch)];
    storeDraft(amendDraftRecord());
    await mountAt(BATCH_PATH);
    await flush(() => pen() !== null);
    await click(buttonByText('Cancel'));
    await flush(() => false);
    expect(pen()).toBeNull();
    expect(store.deleteDraft).toHaveBeenCalledWith(VERSION);
    expect(store.drafts.has(VERSION)).toBe(false);
    expect(store.saveBatch).not.toHaveBeenCalled();
  });

  it('a Correct draft naming a batch no longer in the store is deleted and the page reads', async () => {
    store.batches = [];
    storeDraft(amendDraftRecord());
    await mountAt(VERSION_PATH);
    await flush(() => store.deleteDraft.mock.calls.length > 0);
    expect(store.deleteDraft).toHaveBeenCalledWith(VERSION);
    expect(store.drafts.has(VERSION)).toBe(false);
    expect(pen()).toBeNull();
    expect(locationNow.pathname).toBe(VERSION_PATH);
    expect(pageStatus.mock.calls.some(([message]) => message === DRAFT_KEPT_STATUS)).toBe(false);
  });

  it('a restored draft consumes the band’s pending Record a tasting without opening a second pen', async () => {
    const awaiting = { ...structuredClone(augustSecondBatch), tasting: null };
    store.batches = [awaiting];
    const baseline = { ...draftFromBatch(awaiting), tastingOpen: true };
    storeDraft(
      buildDraftRecord({
        versionId: VERSION,
        kind: 'amend',
        payload: { ...structuredClone(baseline), tastedDate: '2026-08-05' },
        amendingBatchId: awaiting.id,
        amendBaseline: baseline,
        amendOpener: 'record-a-tasting',
        now: WRITTEN_AT,
      }),
    );
    await mountAt({ pathname: BATCH_PATH, state: { startTasting: true } });
    await flush(() => pen() !== null);
    await flush(() => locationNow.state === null);

    expect(current.container.querySelectorAll('.batch-margin--pen')).toHaveLength(1);
    expect(locationNow.state).toBeNull();
    expect(pen().querySelector('input[type="date"]:not([required])').value).toBe('2026-08-05');
    expect(pageStatus.mock.calls.filter(([message]) => message === DRAFT_KEPT_STATUS)).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Task 3: the band names a draft waiting on another version of this recipe.
// ---------------------------------------------------------------------------
function siblingPlanDraft(versionLabel) {
  const sibling = store.sibling;
  const rows = Object.fromEntries(
    sibling.rows.map((row) => [
      row.id,
      { portions: row.portions.map((portion) => ({ step: portion.step, grams: String(portion.grams), removed: false })) },
    ]),
  );
  return buildDraftRecord({
    versionId: sibling.id,
    kind: 'plan',
    payload: {
      versionLabel,
      reason: '',
      citedBatchId: null,
      sheetTitle: sibling.sheetTitle,
      sheetDescription: sibling.sheetDescription,
      rows,
      method: structuredClone(sibling.method),
      authored: structuredClone(sibling.authored),
    },
    penOpenedAt: OPENED_AT,
    now: WRITTEN_AT,
  });
}

function bandDraft() {
  return current.container.querySelector('.notebook-version__draft');
}

describe('the version band names a draft kept on another version (04-09, Task 3)', () => {
  it('shows "Draft: Version N · name" as a link to the version the draft was opened on, and the rail’s draft node', async () => {
    store.withSibling = true;
    storeDraft(siblingPlanDraft('40 g oil'));
    await mountAt(VERSION_PATH);
    await flush(() => bandDraft() !== null);

    expect(bandDraft().textContent).toBe('Draft: Version 3 · 40 g oil');
    const link = bandDraft().querySelector('a');
    expect(link.getAttribute('href')).toBe(`/notebook/${RECIPE}/olive-oil-ice-cream-v2`);
    expect(link.getAttribute('tabindex')).toBe('0');
    // On the History rail as its draft node, beside the two saved versions.
    expect(current.container.querySelector('.notebook-history').textContent).toContain('3 versions');
    expect(current.container.querySelector('.notebook-history').textContent).toContain('Version 3 · 40 g oil');
    // This page has no draft of its own: no pen, no notice.
    expect(nextVersionPen()).toBeNull();
    expect(pageStatus.mock.calls.some(([message]) => message === DRAFT_KEPT_STATUS)).toBe(false);
  });

  it('goes while a pen is open here, and the page asks nothing', async () => {
    store.withSibling = true;
    storeDraft(siblingPlanDraft('40 g oil'));
    await mountAt(VERSION_PATH);
    await flush(() => bandDraft() !== null);
    await click(buttonByText('Next version'));
    expect(nextVersionPen()).not.toBeNull();
    expect(bandDraft()).toBeNull();
    // The other version’s draft is untouched by opening this one's pen.
    expect(store.drafts.has('olive-oil-ice-cream-v2')).toBe(true);
    expect(store.deleteDraft).not.toHaveBeenCalled();
  });

  it('names no draft when none is waiting, and none for a record draft', async () => {
    store.withSibling = true;
    await mountAt(VERSION_PATH);
    expect(bandDraft()).toBeNull();
    await unmountPage();
    const record = recordDraftRecord();
    storeDraft({ ...record, versionId: 'olive-oil-ice-cream-v2' });
    await mountAt(VERSION_PATH);
    expect(bandDraft()).toBeNull();
  });
});

describe('the band and the rail name only a draft that would reopen (WR-09)', () => {
  it('names no draft kept on another version once it no longer fits that version', async () => {
    store.withSibling = true;
    const missingRow = siblingPlanDraft('40 g oil');
    delete missingRow.payload.rows[Object.keys(missingRow.payload.rows)[0]];
    storeDraft(missingRow);
    await mountAt(VERSION_PATH);
    expect(bandDraft()).toBeNull();
    expect(current.container.querySelector('.notebook-history').textContent).not.toContain('40 g oil');
  });

  it('names no draft whose version name is not text', async () => {
    store.withSibling = true;
    const numeric = siblingPlanDraft('40 g oil');
    numeric.payload.versionLabel = 42;
    storeDraft(numeric);
    await mountAt(VERSION_PATH);
    expect(bandDraft()).toBeNull();
    expect(current.container.querySelector('.notebook-history').textContent).not.toContain('Version 3');
  });
});

// ---------------------------------------------------------------------------
// WR-05: a failed store read says so, and never turns draft keeping off quietly.
// ---------------------------------------------------------------------------
function loadError() {
  return current.container.querySelector('.not-found');
}

describe('a failed read on the recipe page (WR-05)', () => {
  it('shows the one line, opens no pen and leaves the kept draft alone when the version’s batches cannot be read', async () => {
    storeDraft(planDraftRecord());
    vi.spyOn(repository, 'listBatchesForVersion').mockRejectedValue(new Error('read failed'));
    await mountAt(VERSION_PATH);
    await flush(() => loadError() !== null);

    expect(loadError().textContent).toBe(PAGE_LOAD_ERROR);
    expect(nextVersionPen()).toBeNull();
    expect(store.deleteDraft).not.toHaveBeenCalled();
    expect(store.drafts.has(VERSION)).toBe(true);
    expect(pageStatus.mock.calls.some(([message]) => message === DRAFT_KEPT_STATUS)).toBe(false);
  });

  it('shows the one line, not an empty page, when the version cannot be read', async () => {
    vi.spyOn(repository, 'getVersion').mockRejectedValue(new Error('read failed'));
    await mountAt(VERSION_PATH);
    await flush(() => loadError() !== null);
    expect(loadError().textContent).toBe(PAGE_LOAD_ERROR);
  });

  it.each(['listVersions', 'listDrafts', 'getAllBatches'])('shows the one line when %s fails', async (method) => {
    vi.spyOn(repository, method).mockRejectedValue(new Error('read failed'));
    await mountAt(VERSION_PATH);
    await flush(() => loadError() !== null);
    expect(loadError().textContent).toBe(PAGE_LOAD_ERROR);
    expect(nextVersionPen()).toBeNull();
  });

  it('survives a failed delete of a stale draft: the page opens in reading with no pen', async () => {
    const stale = planDraftRecord();
    delete stale.payload.rows['row-01'];
    storeDraft(stale);
    store.deleteDraft.mockRejectedValueOnce(new Error('delete failed'));
    await mountAt(VERSION_PATH);
    await flush(() => store.deleteDraft.mock.calls.length > 0);
    await flush(() => false);

    expect(store.deleteDraft).toHaveBeenCalledWith(VERSION);
    expect(nextVersionPen()).toBeNull();
    expect(current.container.querySelector('.notebook-version__acts')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Quick 261012-e8l (Mark's List decide-home-next-version-link-opens-pen): Home's
// Next version link opens the Next version pen once. This block pins that the
// pen is the button's own, the request is used once, and a kept draft wins.
// ---------------------------------------------------------------------------
const FROM_HOME = { pathname: VERSION_PATH, state: { startNextVersion: true } };

function sheetTitleField() {
  return current.container.querySelector('[aria-label="Sheet title"]');
}

describe('Home’s Next version opens the pen once (quick 261012-e8l)', () => {
  it('A: opens one pen with the version’s Sheet title and a blank name, replaces the state, and Escape closes it for good', async () => {
    await mountAt(FROM_HOME);
    await flush(() => nextVersionPen() !== null && locationNow.state === null);

    expect(current.container.querySelectorAll('form[aria-label="Next version"]')).toHaveLength(1);
    expect(sheetTitleField().value).toBe(oliveOilVersion.sheetTitle);
    expect(versionNameField().value).toBe('');
    expect(locationNow.state).toBeNull();
    expect(navigationType).toBe('REPLACE');
    expect(pageStatus.mock.calls.some(([message]) => message === DRAFT_KEPT_STATUS)).toBe(false);

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await pressEscape();
    expect(nextVersionPen()).toBeNull();
    await flush(() => false);
    expect(nextVersionPen()).toBeNull();
    await elapse(1000);
    expect(store.saveDraft).not.toHaveBeenCalled();
  });

  it('B: the opened pen keeps a draft after the 250 ms debounce once the maker types', async () => {
    await mountAt(FROM_HOME);
    await flush(() => nextVersionPen() !== null && locationNow.state === null);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    await elapse(400);
    expect(store.saveDraft).not.toHaveBeenCalled();
    await setValue(versionNameField(), 'less oil');
    await elapse(300);
    expect(store.saveDraft).toHaveBeenCalledTimes(1);
    const saved = store.saveDraft.mock.calls[0][0];
    expect(saved.versionId).toBe(VERSION);
    expect(saved.kind).toBe('plan');
    expect(saved.payload.versionLabel).toBe('less oil');
    expect(saved.payload.sheetTitle).toBe(oliveOilVersion.sheetTitle);
  });

  it('C: without the flag no pen opens and the button is there', async () => {
    await mountAt(VERSION_PATH);
    expect(nextVersionPen()).toBeNull();
    expect(buttonByText('Next version')).not.toBeNull();
  });

  it('D: a draft kept on this version reopens its own pen and is not overwritten', async () => {
    storeDraft(planDraftRecord());
    await mountAt(FROM_HOME);
    await flush(() => nextVersionPen() !== null && locationNow.state === null);

    expect(current.container.querySelectorAll('form[aria-label="Next version"]')).toHaveLength(1);
    expect(versionNameField().value).toBe('less milk');
    expect(pageStatus.mock.calls.filter(([message]) => message === DRAFT_KEPT_STATUS)).toHaveLength(1);
    expect(locationNow.state).toBeNull();
    expect(store.deleteDraft).not.toHaveBeenCalled();
    expect(store.drafts.get(VERSION).payload.versionLabel).toBe('less milk');
  });

  it('E: a kept record draft wins; no Next version pen opens', async () => {
    storeDraft(recordDraftRecord());
    await mountAt(FROM_HOME);
    await flush(() => pen() !== null && locationNow.state === null);

    expect(pen()).not.toBeNull();
    expect(nextVersionPen()).toBeNull();
    expect(locationNow.state).toBeNull();
  });

  it('F: a draft kept on another version of this recipe opens no pen and stays untouched', async () => {
    store.withSibling = true;
    storeDraft(siblingPlanDraft('40 g oil'));
    await mountAt(FROM_HOME);
    await flush(() => locationNow.state === null && bandDraft() !== null);

    expect(nextVersionPen()).toBeNull();
    expect(bandDraft().textContent).toBe('Draft: Version 3 · 40 g oil');
    expect(locationNow.state).toBeNull();
    expect(store.drafts.has('olive-oil-ice-cream-v2')).toBe(true);
    expect(store.deleteDraft).not.toHaveBeenCalled();
    expect(buttonByText('Next version')).not.toBeNull();
  });

  it('G: a draft kept on another recipe’s version does not stop the pen', async () => {
    storeDraft({ ...planDraftRecord(), versionId: 'mocha-v1' });
    await mountAt(FROM_HOME);
    await flush(() => nextVersionPen() !== null && locationNow.state === null);

    expect(nextVersionPen()).not.toBeNull();
    expect(versionNameField().value).toBe('');
    expect(store.drafts.has('mocha-v1')).toBe(true);
  });
});
