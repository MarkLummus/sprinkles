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
