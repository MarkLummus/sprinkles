// @vitest-environment jsdom
//
// 08-04 (D-10, Phase 8 Pitfall 2): the kept-draft restore runs once under
// React.StrictMode, proven where it can be told apart. A page-level mount
// cannot tell whether the started-ref guard exists, because the records are
// not loaded at mount; here the version and its batches are present at the
// first render, so the effect runs twice and only the guard stops the second
// read. The harness stands in for the page's wiring: its onRestorePlan opens
// the pen the way the shell's restorePlan does (mode developing, the payload
// as penDraft), so the persist effect keeps the restored pen instead of
// deleting it as clean.
import { StrictMode, act, useRef, useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';

// The write methods past the three drafts ones exist only so the create
// tests can prove a create draft never calls them (D-18, T-09-09).
const repo = vi.hoisted(() => ({
  getDraft: vi.fn(),
  saveDraft: vi.fn(),
  deleteDraft: vi.fn(),
  saveVersion: vi.fn(),
  createVersion: vi.fn(),
  saveRecipe: vi.fn(),
  putAll: vi.fn(),
  putAllRecipes: vi.fn(),
  saveBatch: vi.fn(),
}));

vi.mock('../store/repository.js', () => ({
  repository: {
    getDraft: repo.getDraft,
    saveDraft: repo.saveDraft,
    deleteDraft: repo.deleteDraft,
    saveVersion: repo.saveVersion,
    createVersion: repo.createVersion,
    saveRecipe: repo.saveRecipe,
    putAll: repo.putAll,
    putAllRecipes: repo.putAllRecipes,
    saveBatch: repo.saveBatch,
  },
}));

import { DRAFT_KEPT_STATUS, useDraftWriter, useKeptDraft } from './useKeptDraft.js';
import { blankCreateDraft, buildDraftRecord } from '../domain/draft.js';
import { nextStepKey } from '../domain/stepKeys.js';
import { penDraftFromVersion } from '../domain/penDraft.js';
import { draftFromBatch } from '../domain/recordDraft.js';
import { notebookPath } from './notebookPaths.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';
import { SEED_CATALOG } from '../data/seed-catalog.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const OPENED_AT = '2026-10-10T08:00:00.000Z';
const WRITTEN_AT = '2026-10-10T08:05:00.000Z';

const restorePlanSpy = vi.fn();
const onRestoreRecord = vi.fn();
const onRestoreCreate = vi.fn();
const onPageStatus = vi.fn();
const navigate = vi.fn();

let renders = [];
let current = null;
let controls = null;

function Harness(props) {
  const writer = useDraftWriter(props.versionId);
  const [mode, setMode] = useState('reading');
  const [penDraft, setPenDraft] = useState(null);
  const penOpenedAtRef = useRef(null);
  const { draftRestoreDone } = useKeptDraft({
    writer,
    versionId: props.versionId,
    recipeId: props.recipeId,
    batchId: props.batchId,
    version: props.version,
    batches: props.batches,
    catalog: SEED_CATALOG,
    batchesLoaded: props.batchesLoaded,
    loadFailed: props.loadFailed,
    mode,
    amendingBatchId: null,
    penDraft,
    draft: null,
    amendBaseline: null,
    amendOpener: null,
    penOpenedAtRef,
    onRestorePlan(payload, penOpenedAt) {
      restorePlanSpy(payload, penOpenedAt);
      setPenDraft(payload);
      penOpenedAtRef.current = penOpenedAt;
      setMode('developing');
    },
    onRestoreRecord,
    onPageStatus,
    navigate,
  });
  controls = {
    // Stands in for the shell's Develop opener: the same three writes onRestorePlan makes.
    openPlanPen(payload, openedAt) {
      penOpenedAtRef.current = openedAt;
      setPenDraft(payload);
      setMode('developing');
    },
    setPenDraft,
  };
  renders.push({ mode, penDraft, draftRestoreDone });
  return null;
}

async function flush() {
  for (let i = 0; i < 10; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {
      await Promise.resolve();
    });
  }
}

async function mountStrict(batches) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <StrictMode>
        <Harness
          versionId={oliveOilVersion.id}
          recipeId={oliveOilVersion.recipeId}
          version={oliveOilVersion}
          batches={batches}
          batchId={undefined}
          batchesLoaded
          loadFailed={false}
        />
      </StrictMode>,
    );
  });
  await flush();
}

beforeEach(() => {
  renders = [];
  repo.getDraft.mockReset();
  repo.saveDraft.mockReset();
  repo.deleteDraft.mockReset();
  repo.saveDraft.mockResolvedValue(undefined);
  repo.deleteDraft.mockResolvedValue(undefined);
  for (const name of ['saveVersion', 'createVersion', 'saveRecipe', 'putAll', 'putAllRecipes', 'saveBatch']) {
    repo[name].mockReset();
  }
  onRestoreCreate.mockClear();
  restorePlanSpy.mockClear();
  onRestoreRecord.mockClear();
  onPageStatus.mockClear();
  navigate.mockClear();
});

afterEach(async () => {
  if (current) {
    await act(async () => current.root.unmount());
    current.container.remove();
    current = null;
  }
  vi.useRealTimers();
});

describe('useKeptDraft restores once under React.StrictMode (D-10)', () => {
  it('reads this version’s kept draft once and restores it once when the version and batches are there at mount', async () => {
    const payload = { ...penDraftFromVersion(oliveOilVersion), versionLabel: 'hook strict' };
    const record = buildDraftRecord({
      versionId: oliveOilVersion.id,
      kind: 'plan',
      payload,
      penOpenedAt: OPENED_AT,
      now: WRITTEN_AT,
    });
    repo.getDraft.mockResolvedValue(structuredClone(record));

    await mountStrict([]);

    expect(repo.getDraft).toHaveBeenCalledTimes(1);
    expect(repo.getDraft).toHaveBeenCalledWith(oliveOilVersion.id);
    expect(restorePlanSpy).toHaveBeenCalledTimes(1);
    expect(restorePlanSpy).toHaveBeenCalledWith(payload, OPENED_AT);
    expect(onPageStatus).toHaveBeenCalledTimes(1);
    expect(onPageStatus).toHaveBeenCalledWith(DRAFT_KEPT_STATUS);
    const last = renders[renders.length - 1];
    expect(last.draftRestoreDone).toBe(true);
    expect(last.mode).toBe('developing');
    expect(last.penDraft).toEqual(payload);
    // The restored pen is open and dirty, so persist keeps the stored record.
    expect(repo.deleteDraft).not.toHaveBeenCalled();
  });

  it('hands a Correct draft to its own batch’s address and leaves draftRestoreDone false', async () => {
    const baseline = draftFromBatch(augustSecondBatch);
    const record = buildDraftRecord({
      versionId: oliveOilVersion.id,
      kind: 'amend',
      payload: { ...structuredClone(baseline), note: 'a little firmer than I wrote' },
      amendingBatchId: augustSecondBatch.id,
      amendBaseline: baseline,
      amendOpener: 'correct',
      now: WRITTEN_AT,
    });
    repo.getDraft.mockResolvedValue(structuredClone(record));

    await mountStrict([augustSecondBatch]);

    expect(repo.getDraft).toHaveBeenCalledTimes(1);
    expect(repo.getDraft).toHaveBeenCalledWith(oliveOilVersion.id);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(
      notebookPath(oliveOilVersion.recipeId, oliveOilVersion.id, augustSecondBatch.id),
      { replace: true },
    );
    expect(restorePlanSpy).not.toHaveBeenCalled();
    expect(onRestoreRecord).not.toHaveBeenCalled();
    expect(onPageStatus).not.toHaveBeenCalled();
    expect(repo.deleteDraft).not.toHaveBeenCalled();
    const last = renders[renders.length - 1];
    expect(last.draftRestoreDone).toBe(false);
    expect(last.mode).toBe('reading');
  });

  // Plan 09-15 (D-02): a kept record draft is checked against the page's
  // catalog, so one that marks a core scale restores only because the hook
  // passes the catalog on (with none the check throws and the restore ends).
  it('restores a kept record draft that marks a core scale, checking it against the catalog', async () => {
    const payload = { ...draftFromBatch(augustSecondBatch), churnDate: '2026-10-11', marks: { hardness: 3 } };
    const record = buildDraftRecord({ versionId: oliveOilVersion.id, kind: 'record', payload, now: WRITTEN_AT });
    repo.getDraft.mockResolvedValue(structuredClone(record));

    await mountStrict([]);

    expect(onRestoreRecord).toHaveBeenCalledTimes(1);
    expect(onRestoreRecord).toHaveBeenCalledWith(expect.objectContaining({ kind: 'record' }));
    expect(onPageStatus).toHaveBeenCalledWith(DRAFT_KEPT_STATUS);
  });
});

describe('a pen opened while the read is out owns the stored draft (bug-stale-draft-survives-pen-opened-during-read)', () => {
  const OPENED_DURING_READ = '2026-10-10T09:00:00.000Z';
  const typed = { ...penDraftFromVersion(oliveOilVersion), versionLabel: 'typed during the read' };
  const stored = buildDraftRecord({
    versionId: oliveOilVersion.id,
    kind: 'plan',
    payload: { ...penDraftFromVersion(oliveOilVersion), versionLabel: 'kept from last visit' },
    penOpenedAt: OPENED_AT,
    now: WRITTEN_AT,
  });

  async function openPenDuringRead() {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    let resolveRead;
    repo.getDraft.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRead = resolve;
        }),
    );

    await mountStrict([]);
    expect(repo.getDraft).toHaveBeenCalledTimes(1);
    expect(renders[renders.length - 1].draftRestoreDone).toBe(false);

    await act(async () => {
      controls.openPlanPen(typed, OPENED_DURING_READ);
    });
    await act(async () => {
      resolveRead(structuredClone(stored));
    });
    await flush();

    const last = renders[renders.length - 1];
    expect(last.draftRestoreDone).toBe(true);
    expect(last.mode).toBe('developing');
    expect(last.penDraft).toEqual(typed);
    expect(restorePlanSpy).not.toHaveBeenCalled();
    expect(onPageStatus).not.toHaveBeenCalled();
    expect(repo.deleteDraft).not.toHaveBeenCalled();
    expect(repo.saveDraft).not.toHaveBeenCalled();
  }

  it('deletes the stored draft once when that pen is cleared back to clean', async () => {
    await openPenDuringRead();

    await act(async () => {
      controls.setPenDraft(penDraftFromVersion(oliveOilVersion));
    });
    await flush();

    expect(repo.deleteDraft).toHaveBeenCalledTimes(1);
    expect(repo.deleteDraft).toHaveBeenCalledWith(oliveOilVersion.id);
    expect(repo.saveDraft).not.toHaveBeenCalled();
  });

  it('writes that pen over the stored draft after the debounce while it stays dirty', async () => {
    await openPenDuringRead();

    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    await flush();

    expect(repo.saveDraft).toHaveBeenCalledTimes(1);
    const saved = repo.saveDraft.mock.calls[0][0];
    expect(saved.versionId).toBe(oliveOilVersion.id);
    expect(saved.kind).toBe('plan');
    expect(saved.payload).toEqual(typed);
    expect(saved.penOpenedAt).toBe(OPENED_DURING_READ);
    expect(repo.deleteDraft).not.toHaveBeenCalled();
  });
});

// Phase 9 plan 04 (D-18, RESEARCH Pitfall 12): a create draft is kept through
// the same hook with no version and no batches. A harness that passed a
// version would pass without exercising the creating path, so this one passes
// version null and batchesLoaded false, like Phase 10's editor at mount.
let createControls = null;
let createRenders = [];

function CreateHarness({ initial }) {
  const writer = useDraftWriter('v-new');
  const [createDraft, setCreateDraft] = useState(initial);
  const penOpenedAtRef = useRef(null);
  const { draftRestoreDone } = useKeptDraft({
    writer,
    versionId: 'v-new',
    recipeId: 'r-new',
    batchId: undefined,
    version: null,
    batches: [],
    batchesLoaded: false,
    loadFailed: false,
    mode: 'reading',
    amendingBatchId: null,
    penDraft: null,
    draft: null,
    amendBaseline: null,
    amendOpener: null,
    penOpenedAtRef,
    onRestorePlan: restorePlanSpy,
    onRestoreRecord,
    creating: true,
    createDraft,
    onRestoreCreate(payload) {
      onRestoreCreate(payload);
      setCreateDraft(payload);
    },
    onPageStatus,
    navigate,
  });
  createControls = { setCreateDraft, discardDraft: writer.discardDraft, endDraft: writer.endDraft, resumeDraft: writer.resumeDraft };
  createRenders.push({ createDraft, draftRestoreDone });
  return null;
}

async function mountCreate(initial) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <StrictMode>
        <CreateHarness initial={initial} />
      </StrictMode>,
    );
  });
  await flush();
}

async function unmountCurrent() {
  await act(async () => current.root.unmount());
  current.container.remove();
  current = null;
}

function blankCreate(name = '') {
  return blankCreateDraft({ recipeId: 'r-new', versionId: 'v-new', name });
}

function createRecordOf(payload) {
  return buildDraftRecord({ versionId: 'v-new', kind: 'create', payload, now: WRITTEN_AT });
}

const HALF_SCALE = { key: 'scale-a', name: 'Bo', low: '', high: '', kind: '', group: 'declared' };

function expectNoVersionRecipeOrBatchWrite() {
  for (const name of ['saveVersion', 'createVersion', 'saveRecipe', 'putAll', 'putAllRecipes', 'saveBatch']) {
    expect(repo[name]).not.toHaveBeenCalled();
  }
}

describe('a create draft is kept through the same hook with no version (D-18)', () => {
  beforeEach(() => {
    createRenders = [];
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });

  it('reads once under StrictMode and restores a name-only draft once, with version null and batches not loaded', async () => {
    const payload = { recipeId: 'r-new', versionId: 'v-new', name: 'Lemon' };
    repo.getDraft.mockResolvedValue(createRecordOf(payload));

    await mountCreate(blankCreate());

    expect(repo.getDraft).toHaveBeenCalledTimes(1);
    expect(repo.getDraft).toHaveBeenCalledWith('v-new');
    expect(onRestoreCreate).toHaveBeenCalledTimes(1);
    expect(onRestoreCreate).toHaveBeenCalledWith(payload);
    expect(onPageStatus).toHaveBeenCalledTimes(1);
    expect(onPageStatus).toHaveBeenCalledWith(DRAFT_KEPT_STATUS);
    expect(createRenders[createRenders.length - 1].draftRestoreDone).toBe(true);
    expect(repo.deleteDraft).not.toHaveBeenCalled();
    expectNoVersionRecipeOrBatchWrite();
  });

  it('restores a half-made draft, a scale with blank words included, and does not delete it', async () => {
    const payload = { ...blankCreate('Lemon'), scales: [HALF_SCALE], problems: ['', ''] };
    repo.getDraft.mockResolvedValue(createRecordOf(payload));

    await mountCreate(blankCreate());

    expect(onRestoreCreate).toHaveBeenCalledTimes(1);
    expect(onRestoreCreate).toHaveBeenCalledWith(payload);
    expect(repo.deleteDraft).not.toHaveBeenCalled();
  });

  it('deletes a stored create draft that does not fit and restores nothing', async () => {
    repo.getDraft.mockResolvedValue(createRecordOf({ recipeId: 'r-new', versionId: 'v-new', name: 'Lemon', machine: {} }));

    await mountCreate(blankCreate());

    expect(onRestoreCreate).not.toHaveBeenCalled();
    expect(repo.deleteDraft).toHaveBeenCalledTimes(1);
    expect(repo.deleteDraft).toHaveBeenCalledWith('v-new');
    expect(createRenders[createRenders.length - 1].draftRestoreDone).toBe(true);

    // A mounted creation is always kept (D-04a): once the restore has settled
    // the harness's own payload is written 250 ms later. Production never
    // mounts an unfit draft; CreationRoute filters with draftMatchesCreate.
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    await flush();
    expect(repo.saveDraft).toHaveBeenCalledTimes(1);
    expect(repo.saveDraft.mock.calls[0][0].payload).toEqual(blankCreate());
  });

  it('writes a create record 250 ms after the last change, and no version, recipe or batch', async () => {
    repo.getDraft.mockResolvedValue(null);
    await mountCreate(blankCreate());
    expect(repo.saveDraft).not.toHaveBeenCalled();

    await act(async () => {
      createControls.setCreateDraft(blankCreate('Lem'));
    });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    await act(async () => {
      createControls.setCreateDraft(blankCreate('Lemon'));
    });
    await act(async () => {
      vi.advanceTimersByTime(249);
    });
    await flush();
    expect(repo.saveDraft).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    await flush();

    expect(repo.saveDraft).toHaveBeenCalledTimes(1);
    const saved = repo.saveDraft.mock.calls[0][0];
    expect(saved.kind).toBe('create');
    expect(saved.versionId).toBe('v-new');
    expect(saved.payload.name).toBe('Lemon');
    expectNoVersionRecipeOrBatchWrite();
  });

  it('writes the waiting record when the page unmounts inside the debounce', async () => {
    repo.getDraft.mockResolvedValue(null);
    await mountCreate(blankCreate());

    await act(async () => {
      createControls.setCreateDraft(blankCreate('Lemon'));
    });
    expect(repo.saveDraft).not.toHaveBeenCalled();
    await unmountCurrent();
    await flush();

    expect(repo.saveDraft).toHaveBeenCalledTimes(1);
    expect(repo.saveDraft.mock.calls[0][0].kind).toBe('create');
    expect(repo.saveDraft.mock.calls[0][0].payload.name).toBe('Lemon');
  });

  it('overwrites the stored record with the cleared payload when a creation is set back to blank, and never deletes it', async () => {
    repo.getDraft.mockResolvedValue(createRecordOf({ recipeId: 'r-new', versionId: 'v-new', name: 'Lemon' }));
    await mountCreate(blankCreate());
    expect(onRestoreCreate).toHaveBeenCalledTimes(1);
    expect(repo.deleteDraft).not.toHaveBeenCalled();

    await act(async () => {
      createControls.setCreateDraft(blankCreate(''));
    });
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    await flush();

    expect(repo.saveDraft).toHaveBeenCalledTimes(1);
    expect(repo.saveDraft.mock.calls[0][0].payload).toEqual(blankCreate(''));
    expect(repo.deleteDraft).not.toHaveBeenCalled();
  });

  describe('a read that resolves after the maker has typed (late read, T-09-45)', () => {
    const stored = { recipeId: 'r-new', versionId: 'v-new', name: 'Lemon' };
    let resolveRead;

    async function mountWithDeferredRead() {
      repo.getDraft.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveRead = resolve;
          }),
      );
      await mountCreate(blankCreate());
      expect(repo.getDraft).toHaveBeenCalledTimes(1);
      expect(createRenders[createRenders.length - 1].draftRestoreDone).toBe(false);
    }

    async function resolveStored() {
      await act(async () => {
        resolveRead(createRecordOf(stored));
      });
      await flush();
    }

    it('keeps what was typed: no restore, no status, no delete, and the typed draft is written over the stored one', async () => {
      await mountWithDeferredRead();
      await act(async () => {
        createControls.setCreateDraft(blankCreate('Typed'));
      });
      await resolveStored();

      expect(onRestoreCreate).not.toHaveBeenCalled();
      expect(onPageStatus).not.toHaveBeenCalled();
      expect(repo.deleteDraft).not.toHaveBeenCalled();
      expect(createRenders[createRenders.length - 1].draftRestoreDone).toBe(true);

      await act(async () => {
        vi.advanceTimersByTime(250);
      });
      await flush();
      expect(repo.saveDraft).toHaveBeenCalledTimes(1);
      const saved = repo.saveDraft.mock.calls[0][0];
      expect(saved.kind).toBe('create');
      expect(saved.payload.name).toBe('Typed');
    });

    it('restores the stored draft when the maker typed nothing while the read was out', async () => {
      await mountWithDeferredRead();
      await resolveStored();

      expect(onRestoreCreate).toHaveBeenCalledTimes(1);
      expect(onRestoreCreate).toHaveBeenCalledWith(stored);
      expect(onPageStatus).toHaveBeenCalledWith(DRAFT_KEPT_STATUS);
    });

    it('typed, then cleared back to blank: nothing restored, the cleared payload written over the stored record, no delete', async () => {
      await mountWithDeferredRead();
      await act(async () => {
        createControls.setCreateDraft(blankCreate('Typed'));
      });
      await act(async () => {
        createControls.setCreateDraft(blankCreate(''));
      });
      await resolveStored();
      await act(async () => {
        vi.advanceTimersByTime(250);
      });
      await flush();

      expect(onRestoreCreate).not.toHaveBeenCalled();
      expect(repo.saveDraft).toHaveBeenCalledTimes(1);
      const saved = repo.saveDraft.mock.calls[0][0];
      expect(saved.payload).toEqual(blankCreate(''));
      expect(repo.deleteDraft).not.toHaveBeenCalled();

      // The next visit finds the cleared draft in the store and restores it.
      await unmountCurrent();
      repo.getDraft.mockReset();
      repo.getDraft.mockResolvedValue(structuredClone(saved));
      onRestoreCreate.mockClear();
      await mountCreate(blankCreate());
      expect(repo.getDraft).toHaveBeenCalledTimes(1);
      expect(onRestoreCreate).toHaveBeenCalledTimes(1);
      expect(onRestoreCreate).toHaveBeenCalledWith(blankCreate(''));
    });
  });

  describe('a final discard (Cancel on a creation)', () => {
    async function advance(ms = 250) {
      await act(async () => {
        vi.advanceTimersByTime(ms);
      });
      await flush();
    }

    function deferredDelete() {
      const handle = {};
      repo.deleteDraft.mockImplementation(
        () =>
          new Promise((resolve, reject) => {
            handle.resolve = resolve;
            handle.reject = reject;
          }),
      );
      return handle;
    }

    async function discardFinal() {
      let outcome = 'pending';
      let promise;
      await act(async () => {
        promise = createControls.discardDraft({ final: true });
        promise.then(
          () => {
            outcome = 'resolved';
          },
          () => {
            outcome = 'rejected';
          },
        );
      });
      await flush();
      return { promise, outcome: () => outcome };
    }

    it('is terminal: a restore read that resolves after it restores nothing, announces nothing and writes nothing', async () => {
      let resolveRead;
      repo.getDraft.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveRead = resolve;
          }),
      );
      await mountCreate(blankCreate());
      await discardFinal();
      await act(async () => {
        resolveRead(createRecordOf({ recipeId: 'r-new', versionId: 'v-new', name: 'Lemon' }));
      });
      await flush();
      await advance();
      expect(createRenders[createRenders.length - 1].draftRestoreDone).toBe(true);
      await unmountCurrent();
      await flush();

      expect(onRestoreCreate).not.toHaveBeenCalled();
      expect(onPageStatus).not.toHaveBeenCalled();
      expect(repo.saveDraft).not.toHaveBeenCalled();
      expect(repo.deleteDraft).toHaveBeenCalledTimes(1);
      expect(repo.deleteDraft).toHaveBeenCalledWith('v-new');
    });

    it('schedules no write for an edit made after it', async () => {
      repo.getDraft.mockResolvedValue(null);
      await mountCreate(blankCreate());
      await act(async () => {
        createControls.setCreateDraft(blankCreate('Lemon'));
      });
      await discardFinal();
      await act(async () => {
        createControls.setCreateDraft(blankCreate('Lemons'));
      });
      await advance();
      await unmountCurrent();
      await flush();

      expect(repo.saveDraft).not.toHaveBeenCalled();
    });

    it('is not what a plain discard does: the pens’ discard leaves an edit to be written', async () => {
      repo.getDraft.mockResolvedValue(null);
      await mountCreate(blankCreate());
      await act(async () => {
        createControls.discardDraft();
      });
      await flush();
      await act(async () => {
        createControls.setCreateDraft(blankCreate('Lemon'));
      });
      await advance();

      expect(repo.deleteDraft).toHaveBeenCalledTimes(1);
      expect(repo.saveDraft).toHaveBeenCalledTimes(1);
      expect(repo.saveDraft.mock.calls[0][0].payload.name).toBe('Lemon');
    });

    it('resolves only once the delete resolves', async () => {
      repo.getDraft.mockResolvedValue(null);
      await mountCreate(blankCreate());
      const handle = deferredDelete();
      const discard = await discardFinal();
      expect(discard.outcome()).toBe('pending');

      await act(async () => {
        handle.resolve();
      });
      await flush();
      expect(discard.outcome()).toBe('resolved');
    });

    it('rejects when the delete fails, while a plain discard over a failing delete raises nothing', async () => {
      repo.getDraft.mockResolvedValue(null);
      await mountCreate(blankCreate());
      repo.deleteDraft.mockRejectedValue(new Error('store gone'));
      const discard = await discardFinal();
      expect(discard.outcome()).toBe('rejected');
      await expect(discard.promise).rejects.toThrow('store gone');

      await act(async () => {
        createControls.discardDraft();
      });
      await flush();
      expect(repo.deleteDraft).toHaveBeenCalledTimes(2);
    });

    it('gives back the ink that was waiting at Cancel at once when the delete fails', async () => {
      repo.getDraft.mockResolvedValue(null);
      await mountCreate(blankCreate());
      await act(async () => {
        createControls.setCreateDraft(blankCreate('Lemon'));
      });
      expect(repo.saveDraft).not.toHaveBeenCalled();
      repo.deleteDraft.mockRejectedValue(new Error('store gone'));
      await discardFinal();

      expect(repo.saveDraft).toHaveBeenCalledTimes(1);
      expect(repo.saveDraft.mock.calls[0][0].payload.name).toBe('Lemon');
    });

    it('writes an edit made after a failed final discard once the debounce has run', async () => {
      repo.getDraft.mockResolvedValue(null);
      await mountCreate(blankCreate());
      await act(async () => {
        createControls.setCreateDraft(blankCreate('Lemon'));
      });
      repo.deleteDraft.mockRejectedValue(new Error('store gone'));
      await discardFinal();
      repo.saveDraft.mockClear();

      await act(async () => {
        createControls.setCreateDraft(blankCreate('Lemons'));
      });
      expect(repo.saveDraft).not.toHaveBeenCalled();
      await advance();

      expect(repo.saveDraft).toHaveBeenCalledTimes(1);
      expect(repo.saveDraft.mock.calls[0][0].payload.name).toBe('Lemons');
    });

    it('holds an edit made while the delete is out, and writes it when the delete fails', async () => {
      repo.getDraft.mockResolvedValue(null);
      await mountCreate(blankCreate());
      const handle = deferredDelete();
      await discardFinal();
      await act(async () => {
        createControls.setCreateDraft(blankCreate('Lemons'));
      });
      await advance();
      await act(async () => {
        window.dispatchEvent(new Event('pagehide'));
      });
      await flush();
      expect(repo.saveDraft).not.toHaveBeenCalled();

      await act(async () => {
        handle.reject(new Error('store gone'));
      });
      await flush();
      expect(repo.saveDraft).toHaveBeenCalledTimes(1);
      expect(repo.saveDraft.mock.calls[0][0].payload.name).toBe('Lemons');
    });

    it('drops an edit made while the delete is out when the delete succeeds', async () => {
      repo.getDraft.mockResolvedValue(null);
      await mountCreate(blankCreate());
      const handle = deferredDelete();
      await discardFinal();
      await act(async () => {
        createControls.setCreateDraft(blankCreate('Lemons'));
      });
      await act(async () => {
        handle.resolve();
      });
      await flush();
      await advance();
      await unmountCurrent();
      await flush();

      expect(repo.saveDraft).not.toHaveBeenCalled();
    });
  });

  describe('endDraft and resumeDraft (Save, MAKE-10)', () => {
    async function advance(ms = 250) {
      await act(async () => {
        vi.advanceTimersByTime(ms);
      });
      await flush();
    }

    async function typeThenEnd(name) {
      repo.getDraft.mockResolvedValue(null);
      await mountCreate(blankCreate());
      await act(async () => {
        createControls.setCreateDraft(blankCreate(name));
      });
      await act(async () => {
        createControls.endDraft();
      });
      await flush();
    }

    it('stops the writer without deleting: the waiting write never happens', async () => {
      await typeThenEnd('Lemon');
      await advance(1000);
      expect(repo.saveDraft).not.toHaveBeenCalled();
      expect(repo.deleteDraft).not.toHaveBeenCalled();
    });

    it('schedules no write for a change made after it, and an unmount writes nothing', async () => {
      await typeThenEnd('Lemon');
      await act(async () => {
        createControls.setCreateDraft(blankCreate('Lemons'));
      });
      await advance(1000);
      await unmountCurrent();
      await flush();
      expect(repo.saveDraft).not.toHaveBeenCalled();
      expect(repo.deleteDraft).not.toHaveBeenCalled();
    });

    it('resumeDraft writes the record held at endDraft at once', async () => {
      await typeThenEnd('Lemon');
      await act(async () => {
        createControls.resumeDraft();
      });
      await flush();
      expect(repo.saveDraft).toHaveBeenCalledTimes(1);
      expect(repo.saveDraft.mock.calls[0][0].payload.name).toBe('Lemon');
      expect(repo.deleteDraft).not.toHaveBeenCalled();
    });

    it('resumeDraft writes the newest record when the draft changed while it was ended', async () => {
      await typeThenEnd('Lemon');
      await act(async () => {
        createControls.setCreateDraft(blankCreate('Lemons'));
      });
      await act(async () => {
        createControls.resumeDraft();
      });
      await flush();
      expect(repo.saveDraft).toHaveBeenCalledTimes(1);
      expect(repo.saveDraft.mock.calls[0][0].payload.name).toBe('Lemons');
    });

    it('after resumeDraft later edits are debounced as before', async () => {
      await typeThenEnd('Lemon');
      await act(async () => {
        createControls.resumeDraft();
      });
      repo.saveDraft.mockClear();
      await act(async () => {
        createControls.setCreateDraft(blankCreate('Lemony'));
      });
      expect(repo.saveDraft).not.toHaveBeenCalled();
      await advance();
      expect(repo.saveDraft).toHaveBeenCalledTimes(1);
      expect(repo.saveDraft.mock.calls[0][0].payload.name).toBe('Lemony');
    });

    it('resumeDraft with nothing waiting writes nothing more', async () => {
      repo.getDraft.mockResolvedValue(null);
      await mountCreate(blankCreate());
      await advance();
      expect(repo.saveDraft).toHaveBeenCalledTimes(1);
      await act(async () => {
        createControls.endDraft();
      });
      await act(async () => {
        createControls.resumeDraft();
      });
      await flush();
      expect(repo.saveDraft).toHaveBeenCalledTimes(1);
    });
  });

  it('keeps the method as its own issued-key ledger across a closed tab: the next step key is 4, not 3', async () => {
    const step = (n, extra = {}) => ({ n, leadIn: `lead ${n}`, instruction: `do ${n}`, ...extra });
    const method = [step(1), step(2), step(3, { removed: true })];
    repo.getDraft.mockResolvedValue(null);
    await mountCreate(blankCreate('Lemon'));

    await act(async () => {
      createControls.setCreateDraft({ ...blankCreate('Lemon'), method });
    });
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    await flush();
    expect(repo.saveDraft).toHaveBeenCalledTimes(1);
    const written = repo.saveDraft.mock.calls[0][0];

    await unmountCurrent();
    repo.getDraft.mockReset();
    repo.getDraft.mockResolvedValue(structuredClone(written));
    onRestoreCreate.mockClear();
    await mountCreate(blankCreate());

    expect(onRestoreCreate).toHaveBeenCalledTimes(1);
    const restored = onRestoreCreate.mock.calls[0][0];
    expect(restored.method).toEqual(method);
    expect(nextStepKey(restored.method)).toBe(4);
    expect(repo.deleteDraft).not.toHaveBeenCalled();
  });
});
