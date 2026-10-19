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

const repo = vi.hoisted(() => ({
  getDraft: vi.fn(),
  saveDraft: vi.fn(),
  deleteDraft: vi.fn(),
}));

vi.mock('../store/repository.js', () => ({
  repository: { getDraft: repo.getDraft, saveDraft: repo.saveDraft, deleteDraft: repo.deleteDraft },
}));

import { DRAFT_KEPT_STATUS, useDraftWriter, useKeptDraft } from './useKeptDraft.js';
import { buildDraftRecord } from '../domain/draft.js';
import { penDraftFromVersion } from '../domain/penDraft.js';
import { draftFromBatch } from '../domain/recordDraft.js';
import { notebookPath } from './notebookPaths.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const OPENED_AT = '2026-10-10T08:00:00.000Z';
const WRITTEN_AT = '2026-10-10T08:05:00.000Z';

const restorePlanSpy = vi.fn();
const onRestoreRecord = vi.fn();
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
