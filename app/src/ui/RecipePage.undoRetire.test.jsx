// @vitest-environment jsdom
//
// Quick task 261014-b25: pins the D-13(e) undo-retirement rule that Phase 5
// had to keep exactly as it was (05-VERIFICATION behavior_unverified_items[0],
// truth 3a). After a tasting with ink is removed, an edit inside the tasting
// body retires the pending undo (Restore tasting goes away) and an edit to a
// churn field leaves it (Restore tasting stays). RecipePage guards that rule
// with `if (isTastingBodyField(field)) recordPen.retireUndo();` at exactly
// five sites: onChangeRecordField, onChangeSegment, onClearSegment,
// onChangeMarkOne and onClearMarkOne. One case per site.
//
// Why a seam: while an undo is pending, the page renders no tasting-body
// control. BatchRow draws every one of them inside `draft.tastingOpen`, a
// removal always sets tastingOpen false, and Add tasting is withheld while
// pendingUndo is set. So a rendered tasting-body control cannot be clicked in
// the "undo pending" state.
//
// What the seam is: RecipePage is mounted whole (real useRecordDraft, real
// handlers, real BatchRow) over an in-memory stand-in for the repository. A
// pass-through mock of ./BatchRow.jsx renders the real BatchRow and records the
// props RecipePage hands it. The churn half is driven through real rendered
// churn controls. The tasting-body half calls the page's own handler from
// those props, the same function a tasting-body control's onChange would call
// if one were mounted. What is observed is unchanged and real: the rendered
// Restore tasting button, plus the pendingUndo prop.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useParams } from 'react-router';

const store = vi.hoisted(() => ({ batches: [], saveBatch: null }));
const seen = vi.hoisted(() => ({ props: null }));

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
      getDraft: async () => undefined,
      saveDraft: vi.fn(async () => {}),
      deleteDraft: vi.fn(async () => {}),
      listDrafts: async () => [],
    },
  };
});

// The pass-through: the real BatchRow, with the props RecipePage gave it kept.
vi.mock('./BatchRow.jsx', async (importOriginal) => {
  const actual = await importOriginal();
  const { createElement } = await import('react');
  return {
    ...actual,
    BatchRow: function SeenBatchRow(props) {
      seen.props = props;
      return createElement(actual.BatchRow, props);
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

let current = null;
let originalMatchMedia = null;

// router.jsx keys RecipePage by its three route parameters; this wrapper does
// the same.
function Keyed() {
  const { recipeId, versionId, batchId } = useParams();
  return <RecipePage key={`${recipeId}::${versionId}::${batchId ?? ''}`} onPageStatus={() => {}} />;
}

// A fixed 393 coarse window, as RecipePage.recordTasting.test.jsx draws it.
function installMatchMedia() {
  Element.prototype.scrollIntoView = vi.fn();
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
  seen.props = null;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/notebook/:recipeId/:versionId" element={<Keyed />} />
          <Route path="/notebook/:recipeId/:versionId/batch/:batchId" element={<Keyed />} />
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

// How many Restore tasting buttons the mounted page holds, anywhere.
function restoreCount() {
  return [...current.container.querySelectorAll('button')].filter(
    (button) => button.textContent.trim() === 'Restore tasting',
  ).length;
}

// Open Add tasting, write a note, press Remove tasting: the pen is left with
// the section closed and an undo pending. Add tasting is scoped to pen()
// because PenFoot carries the same class.
async function removeTastingWithInk() {
  await click(pen().querySelector('.save-ceremony__add-tasting'));
  await setValue(pen().querySelector('textarea[aria-label="How did it turn out?"]'), 'firm');
  await click(pen().querySelector('.tasting-head__remove'));
}

const atDraw = () => pen().querySelector('[data-mo="atdraw"]');
const radioFor = (group, word) => [...group.querySelectorAll('input[type="radio"]')].find((input) => input.value === word);
const exitConsistency = () => pen().querySelector('[role="radiogroup"][aria-label="Exit consistency"]');
const exitClear = () => buttonByText(exitConsistency().closest('.segmented-field'), 'Clear');

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
  seen.props = null;
});

const CASES = [
  {
    handler: 'onChangeRecordField',
    churnEdit: async () => {
      await setValue(pen().querySelector('input[type="date"]'), '2026-10-10');
    },
    churnKey: 'churnDate',
    churnValue: '2026-10-10',
    tastingArgs: ['note', 'Soft'],
    tastingKey: 'note',
    tastingValue: 'Soft',
  },
  {
    handler: 'onChangeSegment',
    churnEdit: async () => {
      await click(radioFor(exitConsistency(), 'Wet, soupy'));
    },
    churnKey: 'exitConsistency',
    churnValue: 'Wet, soupy',
    tastingArgs: ['meltStyle', 'Creamy puddle'],
    tastingKey: 'meltStyle',
    tastingValue: 'Creamy puddle',
  },
  {
    handler: 'onClearSegment',
    prePick: async () => {
      await click(radioFor(exitConsistency(), 'Wet, soupy'));
    },
    churnEdit: async () => {
      await click(exitClear());
    },
    churnKey: 'exitConsistency',
    churnValue: '',
    tastingArgs: ['meltStyle', 'Melt style'],
    tastingKey: 'meltStyle',
    tastingValue: '',
  },
  {
    handler: 'onChangeMarkOne',
    churnEdit: async () => {
      await click(radioFor(atDraw(), 'Not evaluated'));
    },
    churnKey: 'atDraw',
    churnValue: 'Not evaluated',
    tastingArgs: ['fromFreezer', 'Not evaluated'],
    tastingKey: 'fromFreezer',
    tastingValue: 'Not evaluated',
  },
  {
    handler: 'onClearMarkOne',
    prePick: async () => {
      await click(radioFor(atDraw(), 'Nothing to note'));
    },
    churnEdit: async () => {
      await click(buttonByText(atDraw(), 'Clear'));
    },
    churnKey: 'atDraw',
    churnValue: '',
    tastingArgs: ['fromFreezer', 'From freezer'],
    tastingKey: 'fromFreezer',
    tastingValue: '',
  },
];

describe('D-13(e): a tasting-body edit retires the pending undo, a churn-field edit does not (05-VERIFICATION 3a)', () => {
  it.each(CASES)('$handler', async (row) => {
    const { handler } = row;
    installMatchMedia();
    await mountAt(VERSION_PATH, [augustSecondBatch]);
    await click(current.container.querySelector('.batch-row__record'));

    if (row.prePick) await row.prePick();

    await removeTastingWithInk();
    expect(restoreCount(), `${handler}: Restore tasting after the removal`).toBe(1);
    expect(seen.props.pendingUndo, `${handler}: pendingUndo after the removal`).not.toBeNull();

    await row.churnEdit();
    expect(restoreCount(), `${handler}: Restore tasting after the churn-field edit`).toBe(1);
    expect(seen.props.pendingUndo, `${handler}: pendingUndo after the churn-field edit`).not.toBeNull();
    expect(seen.props.draft[row.churnKey], `${handler}: churn draft key ${row.churnKey}`).toBe(row.churnValue);

    await act(async () => {
      seen.props[handler](...row.tastingArgs);
    });
    expect(restoreCount(), `${handler}: Restore tasting after the tasting-body edit`).toBe(0);
    expect(seen.props.pendingUndo, `${handler}: pendingUndo after the tasting-body edit`).toBeNull();
    expect(seen.props.draft[row.tastingKey], `${handler}: tasting draft key ${row.tastingKey}`).toBe(row.tastingValue);
  });
});
