import { useEffect, useRef, useState } from 'react';
import { repository } from '../store/repository.js';
import { buildDraftRecord, draftMatchesCreate, draftMatchesVersion, isCreateDraftDirty } from '../domain/draft.js';
import { derivePenState, isPenDraftDirty } from '../domain/penDraft.js';
import { isDraftDirty } from '../domain/recordDraft.js';
import { notebookPath } from './notebookPaths.js';

// The page notice a restored draft announces (D-15; sketch 010 decide-p4-draft-kept-words
// C, screen-draft-kept-words.html). Sent with no options, so the router's
// PageStatus clears it after its own five seconds and nothing persists it.
export const DRAFT_KEPT_STATUS = 'Draft kept. Cancel discards it.';

// The kept draft's writer (Phase 8 cut 5, D-08). It owns the three refs the
// draft effects share and the two functions that write or end a draft, and it
// declares no effect and knows nothing about pens. That is what lets both pen
// hooks take discardDraft without needing each other to initialise: the shell
// calls this first, then useVersionPen with discardDraft, then useKeptDraft
// with the writer and the version pen's restorePlan.
export function useDraftWriter(versionId) {
  //  - draftStoredRef: whether a record may be sitting in the store for this
  //    version, so a pen that goes clean deletes it and a pen that was never
  //    dirty writes nothing at all.
  //  - pendingDraftRef / draftTimerRef: the record waiting out the 250 ms
  //    debounce, and its timer.
  const draftStoredRef = useRef(false);
  const pendingDraftRef = useRef(null);
  const draftTimerRef = useRef(null);

  // Writes the record waiting out the debounce at once. Reads refs only, so
  // the listener below can hold the first render's copy for the page's life.
  function flushPendingDraft() {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = null;
    const record = pendingDraftRef.current;
    if (!record) return;
    pendingDraftRef.current = null;
    draftStoredRef.current = true;
    Promise.resolve().then(() => repository.saveDraft(record)).catch(() => {});
  }

  // Save and Cancel end a draft: drop whatever is waiting to be written, so a
  // keystroke typed just before Save cannot write the draft back after it
  // was deleted, then delete the stored record.
  function discardDraft() {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = null;
    pendingDraftRef.current = null;
    draftStoredRef.current = false;
    Promise.resolve().then(() => repository.deleteDraft(versionId)).catch(() => {});
  }

  return { draftStoredRef, pendingDraftRef, draftTimerRef, flushPendingDraft, discardDraft };
}

// The kept-draft effects (Phase 8 cut 6, EDIT-05, D-08, D-10). Called after
// useVersionPen, above the early returns: the writer comes from useDraftWriter,
// onRestorePlan is useVersionPen's restorePlan, and onRestoreRecord is the
// record pen's half of a restore. Both callbacks run only after the restore
// guard has seen the version and its batches, so they are safe while records
// are still loading.
//
// A creation (Phase 9, D-18) goes through the same hook and the same restore
// path. With `creating` true there is no stored version yet, so the restore
// waits for neither a version nor its batches, a stored draft is checked with
// the create kind's own fit check, onRestoreCreate receives its payload, and
// the persist effect keeps `createDraft` as a draft of kind create. Nothing is
// written to versions, recipes or batches. The creation editor must hold
// createDraft as state: a new object on every change and the same object
// across renders when nothing changed, never a payload rebuilt during render.
// The late-read rule below compares object identity, so a rebuilt payload
// would read as typed on every render and skip every restore.
export function useKeptDraft({
  writer,
  versionId,
  recipeId,
  batchId,
  version,
  batches,
  batchesLoaded,
  loadFailed,
  mode,
  amendingBatchId,
  penDraft,
  draft,
  amendBaseline,
  amendOpener,
  penOpenedAtRef,
  onRestorePlan,
  onRestoreRecord,
  creating = false,
  createDraft,
  onRestoreCreate,
  onPageStatus,
  navigate,
}) {
  const { draftStoredRef, pendingDraftRef, draftTimerRef, flushPendingDraft } = writer;

  // Kept drafts (04-09, D-14 to D-17). A pen's draft lives in the drafts store,
  // through the repository seam, from its first keystroke until Save or
  // Cancel: a reload, a closed tab, a crash or the next day brings the pen
  // back with its ink. The refs below hold what the effects share; each is
  // read at the moment it fires, so none of them is a dependency.
  //  - draftRestoreStartedRef: the restore runs once per page instance. A ref,
  //    not state, and no cancelled flag: StrictMode runs the effect twice in
  //    development, and a flag set by the first cleanup would drop the read the
  //    guard let through.
  //  - draftRestoreDone: the persist effect below waits for it (research
  //    Pitfall 5): on first render mode is 'reading' and both drafts are null,
  //    which reads as clean and would delete the draft the restore is about to
  //    read.
  //  - draftStoredRef / pendingDraftRef / draftTimerRef: the writer's refs
  //    (useDraftWriter).
  const [draftRestoreDone, setDraftRestoreDone] = useState(false);
  const draftRestoreStartedRef = useRef(false);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  // The creation's counterpart of modeRef: the payload the editor holds now,
  // compared with the one it held when the read began (a changed one means the
  // maker typed while the read was out).
  const createDraftRef = useRef(createDraft);
  createDraftRef.current = createDraft;

  // Restore (D-15): once the version and its batches are read, look for this
  // version's draft. A record that no longer fits (an import replaced the
  // version, the batch it corrects is gone) is deleted quietly and the page
  // opens in reading; one that fits reopens its pen with the ink and the page
  // notice. Restoring sets state only: nothing is written to versions or
  // batches until the maker presses Save, and nothing is asked (no dialog).
  useEffect(() => {
    if (draftRestoreStartedRef.current) return;
    if (!creating && (!version || version.recipeId !== recipeId || !batchesLoaded || loadFailed)) return;
    draftRestoreStartedRef.current = true;
    const createDraftAtRead = createDraftRef.current;
    Promise.resolve()
      .then(() => repository.getDraft(versionId))
      .then((record) => {
        if (!record) {
          setDraftRestoreDone(true);
          return;
        }
        if (!(creating ? draftMatchesCreate(record) : draftMatchesVersion(record, version, batches))) {
          Promise.resolve().then(() => repository.deleteDraft(versionId)).catch(() => {});
          setDraftRestoreDone(true);
          return;
        }
        // A pen the maker opened while the read was out wins over the stored
        // one; the persist effect then keeps whichever is open. The stored
        // record is still there, so a pen that goes clean deletes it and one
        // that stays dirty writes over it. A creation is the same: a payload
        // the editor replaced while the read was out is what the maker typed,
        // and it wins. The record is still in the store, so it is marked as
        // present: the persist effect writes the typed draft over it, or, when
        // the maker cleared it back to blank, deletes it.
        if (creating ? createDraftRef.current !== createDraftAtRead : modeRef.current !== 'reading') {
          draftStoredRef.current = true;
          setDraftRestoreDone(true);
          return;
        }
        // A Correct draft belongs to its own batch's address: the head, the
        // axes snapshot and the amend save all name the batch the URL shows,
        // so this page never edits a batch it is not showing. Opened on any
        // other address of the version, the address is replaced with the
        // batch's own and nothing is restored here. The persist effect stays
        // off on this instance (draftRestoreDone is not set), so it cannot
        // delete the draft the next instance, keyed by that batch, reads.
        if (!creating && record.kind === 'amend' && batchId !== record.amendingBatchId) {
          navigate(notebookPath(version.recipeId, version.id, record.amendingBatchId), { replace: true });
          return;
        }
        draftStoredRef.current = true;
        if (creating) {
          onRestoreCreate(record.payload);
        } else if (record.kind === 'plan') {
          onRestorePlan(record.payload, record.penOpenedAt);
        } else {
          // A new batch's record ('record') opens on any of the version's
          // addresses; a Correct draft ('amend') only on its own batch's,
          // which the redirect above has already settled.
          onRestoreRecord(record);
        }
        onPageStatus(DRAFT_KEPT_STATUS);
        setDraftRestoreDone(true);
      })
      .catch(() => setDraftRestoreDone(true));
  }, [version, batchesLoaded, loadFailed, creating]);

  // Persist: while a pen is open and holds ink, its draft is written 250 ms
  // after the last change; when no pen is open, or the open pen is clean
  // again, the stored draft is deleted. Dirtiness is the two checks the Escape
  // effect below reads (isPenDraftDirty, isDraftDirty), never a third.
  useEffect(() => {
    if (!draftRestoreDone) return undefined;
    const { openPen: persistedPen } = derivePenState({ mode, amendingBatchId });
    let record = null;
    if (creating) {
      if (isCreateDraftDirty(createDraft)) {
        record = buildDraftRecord({
          versionId,
          kind: 'create',
          payload: createDraft,
          now: new Date().toISOString(),
        });
      }
    } else if (persistedPen === 'plan' && isPenDraftDirty(mode, penDraft, version)) {
      record = buildDraftRecord({
        versionId,
        kind: 'plan',
        payload: penDraft,
        penOpenedAt: penOpenedAtRef.current,
        now: new Date().toISOString(),
      });
    } else if ((persistedPen === 'record' || persistedPen === 'amend') && isDraftDirty(mode, draft, amendBaseline)) {
      record = buildDraftRecord({
        versionId,
        kind: persistedPen,
        payload: draft,
        amendingBatchId,
        amendBaseline,
        amendOpener,
        now: new Date().toISOString(),
      });
    }
    if (!record) {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
      draftTimerRef.current = null;
      pendingDraftRef.current = null;
      if (draftStoredRef.current) {
        draftStoredRef.current = false;
        Promise.resolve().then(() => repository.deleteDraft(versionId)).catch(() => {});
      }
      return undefined;
    }
    pendingDraftRef.current = record;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(flushPendingDraft, 250);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [draftRestoreDone, mode, amendingBatchId, penDraft, draft, amendBaseline, amendOpener, version, creating, createDraft]);

  // A page going away inside the debounce window must not lose the last
  // keystrokes: pagehide and a tab going hidden write the waiting record at
  // once, and so does unmounting (best effort at pagehide; IndexedDB may not
  // finish before the page is gone, so up to the last 250 ms of typing can be
  // lost to a hard kill).
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') flushPendingDraft();
    }
    window.addEventListener('pagehide', flushPendingDraft);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', flushPendingDraft);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      flushPendingDraft();
    };
  }, []);

  return { draftRestoreDone };
}
