import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { repository } from '../store/repository.js';
import { createBatch, completeRecord } from '../domain/batch.js';
import { freshId } from '../domain/id.js';
import {
  createChildVersion,
  saveOverVersion,
  versionsForRecipe,
} from '../domain/lineage.js';
import { buildDraftRecord, draftMatchesVersion, newestDraft } from '../domain/draft.js';
import {
  derivePenState,
  isPenDraftDirty,
  removePenNote,
  restoreStepFromVersion,
  setPenField,
  setPenGrams,
  setPenNoteText,
  setPenStepField,
  setPenStepTarget,
  togglePenLine,
  togglePenRowLines,
  togglePenStepRemoved,
  togglePenStepUses,
} from '../domain/penDraft.js';
import {
  batchSavedStatus,
  isDraftDirty,
  isTastingBodyField,
  setAsMadePortion,
  setRecordField,
  setRecordMark,
  setStepChange,
  toggleDeclaredDefect,
  toggleDefect,
} from '../domain/recordDraft.js';
import { notebookPath } from './notebookPaths.js';
import { IngredientTable, IngredientsHead } from './IngredientTable.jsx';
import { Method, showsMethodRegion } from './Method.jsx';
import { NoteList } from './Authored.jsx';
import { FormulationNote } from './FormulationNote.jsx';
import { BasisNote } from './BasisNote.jsx';
import { BatchRow } from './BatchRow.jsx';
import { RecipeBand } from './RecipeBand.jsx';
import { Headnote } from './Headnote.jsx';
import { VersionRow } from './VersionRow.jsx';
import { GoToBatch } from './GoToBatch.jsx';
import { RecipeHistory } from './RecipeHistory.jsx';
import { PenFoot } from './PenFoot.jsx';
import { DerivedAdvisories } from './DerivedAdvisories.jsx';
import { FoldRow } from './FoldRow.jsx';
import { useBelow724, useBelowDesktop, useFold, useSheetTwoColumns } from './useBelowDesktop.js';
import { usePenDraft } from './usePenDraft.js';
import { useRecordDraft } from './useRecordDraft.js';
import { useAnnouncer } from './useAnnouncer.js';
import { useRecipeData } from './useRecipeData.js';
import { markedFigure, sheetView } from './sheetView.js';

// The contract's verbatim form-status sentence for a malformed measurement
// ("Controls spec"), read from handleSaveBatch's own announce() call.
export const MEASURED_INVALID_STATUS = 'Check the marked measurements. Your entries have been kept.';

// The churn date's own form-scoped summary, the sibling of
// MEASURED_INVALID_STATUS above: the field says its own sentence (in its
// label, D-05), the form says this summary, and a form-scoped announcement
// never repeats a field-scoped one — .form-status is a visible paragraph,
// so announcing CHURN_DATE_BLOCKED_MESSAGE here would print a second
// visible copy of the field's own sentence.
export const CHURN_DATE_BLOCKED_STATUS = 'Check the churn date. Your entries have been kept.';
export const BATCH_SAVE_ERROR = 'Couldn’t save the batch. Try again.';
export const VERSION_SAVED_STATUS = 'Version saved.';
export const VERSION_SAVE_ERROR = 'Couldn’t save the version. Try again.';
export const VERSION_BLOCKED_STATUS = 'Check the version. Your changes have been kept.';

// The page notice a restored draft announces (D-15; sketch 010 decide-p4-draft-kept-words
// C, screen-draft-kept-words.html). Sent with no options, so the router's
// PageStatus clears it after its own five seconds and nothing persists it.
export const DRAFT_KEPT_STATUS = 'Draft kept. Cancel discards it.';

// The one line the page shows when a store read fails (WR-05). Word for word
// the boot failure line in main.jsx, so it adds no new words.
export const PAGE_LOAD_ERROR = 'Could not open the local store. Try reloading.';

// The contract's verbatim record-status sentences for the record pen's own
// two hidden-mode removal paths (contract "Feedback and undo lifecycle",
// the removal path matrix — Pitfall 6: the always-visible mode's two rows
// ("Nothing recorded to clear.", "Tasting cleared. You can undo this.")
// are never built). Written to the end-of-record ceremony's own
// record-status region, not formStatus (the ninth round; 007 @ 109733d
// lines 303, 543, 561 — the toast lives where the action was). Each
// written once, read from handleRemoveTasting below and from tests
// directly, so neither can drift from the other.
export const TASTING_REMOVED_EMPTY_STATUS = 'Tasting removed.';
export const TASTING_REMOVED_DATA_STATUS = 'Tasting removed. You can restore it.';

// The contract's verbatim tasting-status sentence after a restore (Task 2,
// contract "Feedback and undo lifecycle") — the one announcement this
// build ever writes to tasting-status (Pitfall 6: the always-visible
// mode's own two tasting-status strings are never built).
export const TASTING_RESTORED_STATUS = 'Tasting restored.';

// The not-found markup (03.5-02, decisions_recorded 3): shared by a version
// missing outright and by a version whose recipeId does not match the
// route's own recipeId (a wrong-address read, not a real recipe). Exported
// so NotebookRedirects.jsx's LegacyRecipeRedirect and NotebookLatestRedirect
// render the identical not-found page rather than inventing a second one.
export function RecipeNotFound() {
  return (
    <div className="not-found">
      <p>No recipe found for this version.</p>
      <Link to="/" tabIndex={0}>Back to the recipe list</Link>
    </div>
  );
}

// What the page shows in place of itself when a store read fails (WR-05): the
// not-found container, which already paints the Sheet ground, holding the one
// line. No link: the running head above leads home.
function PageLoadFailed() {
  return (
    <div className="not-found">
      <p>{PAGE_LOAD_ERROR}</p>
    </div>
  );
}

// The brief's book spread, in semantic regions, each wearing its
// plain-language name. The margin's derived-advisories block (FORM2-02)
// renders nothing visible when the version has none — no placeholder text.
export function RecipePage({ onPageStatus = () => {}, onPenOpenChange = () => {} }) {
  const { recipeId, versionId, batchId } = useParams();
  const navigate = useNavigate();
  // The fork's landing focus signal: read once here so the saved child
  // can identify itself before offering another Next version action.
  const location = useLocation();
  const focusVersionOnMount = Boolean(location.state?.focusVersion);
  const focusBatchOnMount = Boolean(location.state?.focusBatch);
  // The band's Record a tasting, pressed on an older batch's address, moves
  // to the awaiting batch's own address and sets this (handleStartTasting);
  // the effect below opens the pen once that page instance has its batches.
  const startTastingOnMount = Boolean(location.state?.startTasting);
  // Home's Next version sets this; the effect below opens the Next version pen
  // once this page has decided its kept draft.
  const startNextVersionOnMount = Boolean(location.state?.startNextVersion);
  // The show-changes state (D-02): on when the `changes` key is present in
  // the URL's search parameters at all — its value is never consulted, so
  // presence is the whole signal. Composes with both /recipe/:id and
  // /recipe/:id/batch/:batchId with no new route, since both already
  // resolve to this component. setSearchParams's default history behaviour
  // (a push, not a replace) is left alone: that is what makes the browser's
  // own back button return to the clean reading, with no extra code.
  const [searchParams, setSearchParams] = useSearchParams();
  const showingChanges = searchParams.has('changes');
  // The three live regions' text and announce, with the guarded five-second
  // clear (useAnnouncer owns them).
  const { formStatus, setFormStatus, tastingStatus, setTastingStatus, recordStatus, setRecordStatus, announce } = useAnnouncer();
  // The eight record reads and the state they fill, settled before the kept-draft
  // restore that waits on loadFailed (useRecipeData owns them).
  const { version, setVersion, versions, setVersions, batches, setBatches, batchesLoaded, drafts, draftsLoaded, versionsLoaded, loadFailed, recipe, setRecipe, citedBatch, parentVersion, allBatches } = useRecipeData(versionId);
  // The signature trace (route-recipe.md § 3, § 5): focusing a balance
  // figure marks the ingredient rows it rests on. This page is the shared
  // parent of the figures and the table, so it is the one place the
  // focused figure's key can live.
  const [focusedFigureKey, setFocusedFigureKey] = useState(null);
  // The pen layer's state (route-recipe-batch.md § 3): a mode, one of
  // 'reading' | 'recording' | 'developing', and the draft form state it is
  // recorded into. mode is never derived from the URL — only the margin's
  // own control, and now the headnote's, ask for it (D-19).
  const [mode, setMode] = useState('reading');
  // The record pen's draft, its amend target, baseline and opener, its
  // blocked-save state (field errors, the churn-date block) and the pending
  // undo (useRecordDraft owns all of them); formStatus above is the open pen's
  // own form-status live region text, whichever pen is open.
  const recordPen = useRecordDraft();
  const {
    draft,
    amendingBatchId,
    amendBaseline,
    amendOpener,
    fieldErrors,
    invalidFieldTarget,
    blockedDateMessage,
    blockedDateAttempt,
    pendingUndo,
  } = recordPen;
  // Add tasting's own attempt counter (D-01, contract "Focus landings"):
  // the same WR-01 pattern as blockedDateAttempt above, so BatchRow's own
  // focus effect re-fires even on a second press.
  const [addTastingAttempt, setAddTastingAttempt] = useState(null);
  const addTastingAttemptRef = useRef(0);
  // Remove tasting's own focus landing (D-01, contract "Focus landings";
  // the ninth round, Pitfall 8): both hidden-mode removal paths move
  // focus — the same WR-01 attempt-counter pattern as addTastingAttempt
  // above, consumed by BatchRow's own focus effect, which reads
  // pendingUndo to choose the end-of-record Add tasting (an empty
  // removal) or Restore tasting (a data removal).
  const [removeTastingAttempt, setRemoveTastingAttempt] = useState(null);
  const removeTastingAttemptRef = useRef(0);
  // The restore sequence's own focus landing (contract "Focus landings":
  // "undo after restore → the Clear/Remove control") — the same
  // attempt-counter pattern, consumed by BatchRow's own focus effect on
  // the Remove tasting control.
  const [restoreAttempt, setRestoreAttempt] = useState(null);
  const restoreAttemptRef = useRef(0);
  const [batchSaveAction, setBatchSaveAction] = useState(null);
  const batchSaveLockRef = useRef(false);
  const [focusBatchAttempt, setFocusBatchAttempt] = useState(null);
  const focusBatchAttemptRef = useRef(0);
  // The plan's own pen draft, its blocked-save message and the field that
  // message names (usePenDraft owns all three).
  const versionPen = usePenDraft();
  const { penDraft, blockedMessage, blockedTarget } = versionPen;
  const [versionSaveAction, setVersionSaveAction] = useState(null);
  const versionSaveLockRef = useRef(false);
  // The History rail's draft node (03.5-05 Task 2, D-13): the day the
  // pen opened, held in memory only — never stored, cleared wherever the
  // pen closes.
  const penOpenedAtRef = useRef(null);

  // D-20: the tab title leads with the recipe name while the page is mounted
  // (a plain string, never markup, T-04-27); the print route sets its own.
  const recipeName = recipe ? recipe.name : null;
  useEffect(() => {
    if (recipeName === null) return undefined;
    document.title = `${recipeName} · Sprinkles`;
    return () => {
      document.title = 'Sprinkles';
    };
  }, [recipeName]);

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
  //  - draftStoredRef: whether a record may be sitting in the store for this
  //    version, so a pen that goes clean deletes it and a pen that was never
  //    dirty writes nothing at all.
  //  - pendingDraftRef / draftTimerRef: the record waiting out the 250 ms
  //    debounce, and its timer.
  const [draftRestoreDone, setDraftRestoreDone] = useState(false);
  const draftRestoreStartedRef = useRef(false);
  const draftStoredRef = useRef(false);
  const pendingDraftRef = useRef(null);
  const draftTimerRef = useRef(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

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

  // Restore (D-15): once the version and its batches are read, look for this
  // version's draft. A record that no longer fits (an import replaced the
  // version, the batch it corrects is gone) is deleted quietly and the page
  // opens in reading; one that fits reopens its pen with the ink and the page
  // notice. Restoring sets state only: nothing is written to versions or
  // batches until the maker presses Save, and nothing is asked (no dialog).
  useEffect(() => {
    if (draftRestoreStartedRef.current) return;
    if (!version || version.recipeId !== recipeId || !batchesLoaded || loadFailed) return;
    draftRestoreStartedRef.current = true;
    Promise.resolve()
      .then(() => repository.getDraft(versionId))
      .then((record) => {
        if (!record) {
          setDraftRestoreDone(true);
          return;
        }
        if (!draftMatchesVersion(record, version, batches)) {
          Promise.resolve().then(() => repository.deleteDraft(versionId)).catch(() => {});
          setDraftRestoreDone(true);
          return;
        }
        // A pen the maker opened while the read was out wins over the stored
        // one; the persist effect then keeps whichever is open.
        if (modeRef.current !== 'reading') {
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
        if (record.kind === 'amend' && batchId !== record.amendingBatchId) {
          navigate(notebookPath(version.recipeId, version.id, record.amendingBatchId), { replace: true });
          return;
        }
        draftStoredRef.current = true;
        if (record.kind === 'plan') {
          versionPen.restore(record.payload);
          penOpenedAtRef.current = record.penOpenedAt;
          setVersionSaveAction(null);
          versionSaveLockRef.current = false;
          setMode('developing');
        } else {
          // A new batch's record ('record') opens on any of the version's
          // addresses; a Correct draft ('amend') only on its own batch's,
          // which the redirect above has already settled.
          recordPen.restore(record);
          setMode('recording');
        }
        onPageStatus(DRAFT_KEPT_STATUS);
        setDraftRestoreDone(true);
      })
      .catch(() => setDraftRestoreDone(true));
  }, [version, batchesLoaded, loadFailed]);

  // Persist: while a pen is open and holds ink, its draft is written 250 ms
  // after the last change; when no pen is open, or the open pen is clean
  // again, the stored draft is deleted. Dirtiness is the two checks the Escape
  // effect below reads (isPenDraftDirty, isDraftDirty), never a third.
  useEffect(() => {
    if (!draftRestoreDone) return undefined;
    const { openPen: persistedPen } = derivePenState({ mode, amendingBatchId });
    let record = null;
    if (persistedPen === 'plan' && isPenDraftDirty(mode, penDraft, version)) {
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
  }, [draftRestoreDone, mode, amendingBatchId, penDraft, draft, amendBaseline, amendOpener, version]);

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

  // Opens the pen the band's Record a tasting asked for across a remount
  // (route state, the focusBatch pattern: the router keys RecipePage by
  // address, so state is all that crosses). Consumed once: the entry's
  // state is replaced with null, so Back or a reload never reopens a pen.
  // It waits for the draft restore: a draft kept on this page reopens its own
  // pen and consumes the request without opening a second one.
  // handleStartAmending is a function declaration, hoisted, and reads only
  // refs, setters, the onPageStatus prop and the recordPen hook value
  // (declared above, at the useRecordDraft call), so calling it from here,
  // above the early returns, is safe.
  const startTastingConsumedRef = useRef(false);
  useEffect(() => {
    if (!startTastingOnMount || startTastingConsumedRef.current || !draftRestoreDone) return;
    if (!batchId) return;
    if (mode !== 'reading') {
      startTastingConsumedRef.current = true;
      navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
      return;
    }
    const target = batches.find((batch) => batch.id === batchId);
    if (!target || target.tasting) return;
    startTastingConsumedRef.current = true;
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
    handleStartAmending(target, { opener: 'record-a-tasting' });
  }, [startTastingOnMount, mode, batchId, batches, draftRestoreDone]);

  // Opens the Next version pen Home's Next version asked for, the startTasting
  // effect's pattern: used once, the entry's state replaced with null before
  // the pen opens, so Back, Forward or a reload never reopens it. A kept draft
  // wins, twice over: a pen already open (a restored one included) means
  // nothing more is opened, and so does a draft kept on another version of
  // this recipe (this version's own was decided by the restore). The pen
  // itself is the button's own, through handleStartDeveloping.
  const startNextVersionConsumedRef = useRef(false);
  useEffect(() => {
    if (!startNextVersionOnMount || startNextVersionConsumedRef.current) return;
    if (!draftRestoreDone || !versionsLoaded || !draftsLoaded) return;
    startNextVersionConsumedRef.current = true;
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
    if (mode !== 'reading') return;
    const recipeVersionIds = new Set(versionsForRecipe(versions, version.recipeId).map((candidate) => candidate.id));
    if (drafts.some((record) => record.versionId !== version.id && recipeVersionIds.has(record.versionId))) return;
    handleStartDeveloping();
  }, [startNextVersionOnMount, mode, draftRestoreDone, versionsLoaded, draftsLoaded, versions, drafts, version]);

  // Escape (D-27): closes only an untouched pen, and does nothing at all
  // once the pen holds ink — Cancel is the one exit, so a stray key can
  // never discard a sheet of transcription. Registered on `document`, not
  // the article, so an Escape pressed while focus rests on `body` (the
  // state the critique found batch Cancel leaving behind) still closes
  // the pen. Reads the same two dirty checks the draft persistence above
  // reads — introducing no third notion of dirtiness. An open but
  // empty tasting section (tastingOpen true, nothing else touched) counts
  // as no ink under isDraftDirty's own baseline/blank comparisons above,
  // so Escape closes it exactly as it closes any other untouched pen
  // (RESEARCH.md Open Question 4). openPen is recomputed here via
  // derivePenState (not read as an outer variable) because this effect
  // must sit above the early returns below, where the page-level openPen
  // constant does not exist yet.
  useEffect(() => {
    const { openPen: escapeOpenPen } = derivePenState({ mode, amendingBatchId });
    if (escapeOpenPen === null) return undefined;
    function handleKeyDown(event) {
      if (event.key !== 'Escape') return;
      if (escapeOpenPen === 'plan' && !isPenDraftDirty(mode, penDraft, version)) {
        handleCancelDeveloping();
      } else if ((escapeOpenPen === 'record' || escapeOpenPen === 'amend') && !isDraftDirty(mode, draft, amendBaseline)) {
        handleCancelRecording();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mode, amendingBatchId, penDraft, version, draft, amendBaseline]);

  // The Shell refuses Import while this is true.
  useEffect(() => {
    onPenOpenChange(derivePenState({ mode, amendingBatchId }).openPen !== null);
  }, [mode, amendingBatchId, onPenOpenChange]);

  // The folds at every width (sketch 011 decisions 18/19 and 33, 03.5-15/16):
  // two media reads, two cuts. Balance and Watch for read sheetTwoColumns
  // (SHEET_TWO_COLUMNS_QUERY, 984): open by default wherever the Sheet is two
  // columns (decision 33, brief task 4). Version details, History, Tasting and
  // the batch list read belowDesktop (BELOW_DESKTOP_QUERY, 1366), passed down
  // as each region's own foldsOpen prop (its negation): open by default from
  // 1366, closed below (decision 18, unchanged). Each fold returns to its own
  // width's default on every visit or crossing of its own cut (useFold,
  // decisions_recorded 2), so a Hide on Balance at 1024 survives a rotation to
  // 1366. Balance's own fold state is local to this component, since its
  // region renders here; Watch for's lives inside DerivedAdvisories and
  // Tasting's inside TastingReading. Both hooks below must sit above the
  // early returns.
  const belowDesktop = useBelowDesktop();
  // The recipe band's record act (sketch 011 decision 30): below 724 its
  // first control is the filled record act. Above the early returns, like
  // every hook here.
  const below724 = useBelow724();
  const sheetTwoColumns = useSheetTwoColumns();
  const [balanceOpen, toggleBalance] = useFold(sheetTwoColumns);
  // The Batch fold (sketch 011 decision 50 C1, Mark 2026-10-05) is open on
  // first load at every width. Its default never changes, so no width
  // crossing resets it, and nothing is stored. It lives here beside Balance's
  // so Go to batch can open it in the same update that fires the landing.
  // RecipePage is keyed by recipe, version and batch, so moving to another
  // batch still opens it again.
  const [batchOpen, toggleBatch] = useFold(true);

  if (loadFailed) return <PageLoadFailed />;
  if (version === undefined) return null;
  // The running head — the way home in every state, including this one
  // (route-recipe-version.md § 4) — is now drawn by the routed shell
  // (router.jsx), above this component and outside its key, so it also
  // covers the loading state above. A mistyped or since-removed version
  // id is no longer a dead end. A version whose own recipeId does not
  // match the route's recipeId is treated the same way (decisions_recorded
  // 3, 03.5-02) — a recipe never renders under a wrong address.
  if (version === null || version.recipeId !== recipeId) {
    return <RecipeNotFound />;
  }
  // The recipe record's own loading/missing branches (03.5-04 Task 1):
  // this fetch starts only once `version` resolves (it is keyed on
  // `version`, above), so `recipe` is briefly `undefined` even once
  // `version` itself has painted — the same "loading branch returns null"
  // discipline the version guard above already follows. `null` — a
  // version whose recipeId names no stored recipe — is treated as the
  // same not-found page, for the same reason the mismatched-recipeId
  // branch above is: a recipe view never renders with no recipe to show.
  if (recipe === undefined) return null;
  if (recipe === null) return <RecipeNotFound />;

  // The one call site (D-UAT-1): every control that disables while a pen
  // is open reads openPen/penReason from here, never mode directly.
  const { openPen, reason: penReason } = derivePenState({ mode, amendingBatchId });

  // D-01: on any version with no batch recorded, both saves are offered;
  // on a churned version only Save (a fork) exists, so a churned
  // version's own record is never written to (D04). Computed once here
  // and passed to both Versions' ceremony and PenFoot's repeated pair —
  // never twice (RESEARCH.md Pattern 2).
  const canSaveOver = batches.length === 0;

  // The Next version draft waiting on another version of this recipe, if any
  // (the newest, when several): the band names it while no pen is open, and
  // the History rail draws it as its draft node.
  const recipeVersionIds = new Set(versionsForRecipe(versions, version.recipeId).map((candidate) => candidate.id));
  // A draft that would not reopen on its own version is not named (WR-09); the
  // same check also validates the versionLabel the band prints.
  const waitingPlanDraft = newestDraft(
    drafts.filter((record) => {
      if (record.kind !== 'plan' || record.versionId === version.id || !recipeVersionIds.has(record.versionId)) return false;
      const draftVersion = versions.find((candidate) => candidate.id === record.versionId);
      return draftMatchesVersion(
        record,
        draftVersion,
        allBatches.filter((batch) => batch.versionId === record.versionId),
      );
    }),
  );

  // The sheet's derived values, from the pure sheetView; the editing page's
  // pen compares against the stored version.
  const view = sheetView({ version, baseline: version, mode, penDraft, parentVersion, showingChanges, batches, batchId });
  const {
    hasRows,
    readingVersion,
    draftVersion,
    liveVersion,
    changeDiff,
    changeStaleSteps,
    penDiff,
    penStaleSteps,
    currentStepNumbers,
    baselineStepNumbers,
    openBatch,
    evidenceBatch,
    comparisonBatchLabel,
  } = view;
  const { markedRowIds, markedFigureLabel, markedAnnouncement } = markedFigure(view, focusedFigureKey);

  // The band's Go to batch row (sketch 011 decision 30). It opens the Batch
  // fold if the maker closed it (decision 50, Mark 2026-10-05), then runs the
  // same two lines an amendment save runs, so the body is shown before
  // BatchRow's landing focuses its Batch heading and draws the ring. The URL
  // and history are not touched.
  function handleGoToBatch() {
    if (!batchOpen) toggleBatch();
    focusBatchAttemptRef.current += 1;
    setFocusBatchAttempt(focusBatchAttemptRef.current);
  }

  // Clearing the amend target here is load-bearing, not redundant: without
  // it, a maker who amends and then starts a fresh recording would leave
  // amendingBatchId set from the earlier amendment, so handleSaveBatch
  // would take the amend path — overwriting the amended batch's record and
  // stamping a false changed date on it, while the new batch is never
  // created (T-02-24).
  function handleStartRecording() {
    batchSaveLockRef.current = false;
    setBatchSaveAction(null);
    setFocusBatchAttempt(null);
    onPageStatus('');
    recordPen.openNew();
    setAddTastingAttempt(null);
    setTastingStatus('');
    setRecordStatus('');
    setRemoveTastingAttempt(null);
    setRestoreAttempt(null);
    setFormStatus('');
    setMode('recording');
  }

  // The one generic setter for every raw-text/date/tasting field the
  // record pen holds (03.3.1-02 artifacts: handleChangeRecordField):
  // stores the raw string the maker typed, exactly as the as-made column
  // already does, so typed precision is never lost to an early Number()
  // coercion — the conversion happens once, at save time
  // (buildChurnFieldsFromDraft/buildTastingFieldsFromDraft). Clears the
  // blocked-date sentence and every field error first (the 888-892
  // pattern) — the record the maker is now editing may no longer be the
  // one either sentence described.
  function handleChangeRecordField(field, value) {
    // Only this field's own entry clears (WR-03): a Save that reported two
    // malformed measurements must not have fixing one silently un-flag the
    // other, still-invalid one.
    recordPen.clearFieldError(field);
    recordPen.edit(setRecordField, field, value);
    setFormStatus('');
    // The retirement scope (contract "Feedback and undo lifecycle"): this
    // generic setter serves both churn fields and tasting-body fields, so
    // it only retires a pending undo when the field it was just given is
    // one of the tasting-body's own (isTastingBodyField, Task 2).
    if (isTastingBodyField(field)) recordPen.retireUndo();
  }

  // The three segmented controls (exit consistency, airiness, melt style)
  // share one handler: a joined group is a radio (007 @ 2a212be line
  // 362) — picking is final, so this always stores the clicked option.
  // BatchRow calls this from each option's onClick, never onChange, since
  // a native radio's onChange does not re-fire on a click that leaves its
  // value unchanged.
  function handleChangeSegment(field, value) {
    // No BATTERY_FIELDS entry is ever keyed by a segment field (WR-03) —
    // nothing of this field's own to clear, and clearing the whole map
    // would silently un-flag an unrelated still-invalid measurement.
    recordPen.edit(setRecordField, field, value);
    setFormStatus('');
    // Same retirement boundary as handleChangeRecordField above: only
    // Melt style is a tasting-body field among the three this handler
    // shares (Exit consistency and Airiness are churn-section fields).
    if (isTastingBodyField(field)) recordPen.retireUndo();
  }

  // An axis stop click (contract "Axes spec"; 007 line 362): a joined
  // group is a radio — this handler always stores the clicked stop and
  // never announces (only the per-axis Clear control announces, below).
  // Every axis lives inside the tasting body, so a mark change always
  // retires a pending undo (Task 2's retirement scope) — unconditionally,
  // unlike the two generic setters above.
  function handleChangeRecordMark(axisKey, stop) {
    // An axis key is never a BATTERY_FIELDS key (WR-03) — nothing of
    // this field's own to clear.
    recordPen.edit(setRecordMark, axisKey, stop);
    setFormStatus('');
    recordPen.retireUndo();
  }

  // The per-axis Clear control (contract "Axes spec", "Feedback and undo
  // lifecycle"): clears the mark and announces "{Axis name} cleared." to
  // form-status — the one path that writes this specific announcement.
  // Focus return to the axis's first stop is AxisMark's own concern (it
  // holds the DOM ref and gates the move on a keyboard activation); this
  // handler owns only state and the announcement. Retires a pending undo
  // unconditionally, same as every other tasting-body edit (Task 2).
  function handleClearAxisMark(axisKey, axisName) {
    recordPen.edit(setRecordMark, axisKey, null);
    recordPen.retireUndo();
    announce(`${axisName} cleared.`);
  }

  // The per-segment Clear control (007 lines 220, 228, 289, 375-381; Plan
  // 04 wires it): the same shape as handleClearAxisMark above — clears
  // the field and announces "{caption} cleared." to form-status. Same
  // retirement boundary as handleChangeSegment (only Melt style is a
  // tasting-body field among the three).
  function handleClearSegment(field, label) {
    recordPen.edit(setRecordField, field, '');
    if (isTastingBodyField(field)) recordPen.retireUndo();
    announce(`${label} cleared.`);
  }

  // The two mark-one controls (At draw on the batch, From freezer on the
  // tasting; sketch 010 D6 to D14) share one pair of handlers, the shape of
  // handleChangeSegment and handleClearSegment above. A pick is final until
  // Clear (a radio), and BatchRow only offers a pick while its group holds no
  // mark, so the draft never holds a pick beside a mark. From freezer is a
  // tasting-body field (it retires a pending undo); At draw is a churn field.
  function handleChangeMarkOne(field, value) {
    recordPen.edit(setRecordField, field, value);
    setFormStatus('');
    if (isTastingBodyField(field)) recordPen.retireUndo();
  }

  function handleClearMarkOne(field, label) {
    recordPen.edit(setRecordField, field, '');
    if (isTastingBodyField(field)) recordPen.retireUndo();
    announce(`${label} cleared.`);
  }

  // A defect chip's own toggle (contract "Controls spec"): a picked chip
  // joins the draft's defects list, an unpicked one leaves it — no
  // default ever; a defect is an independent on/off (007 line 428), so a
  // second click on the same chip clears it, unlike a stop or segmented
  // option. The defects row is inside the tasting body, so a toggle
  // always retires a pending undo (Task 2).
  function handleChangeDefect(defect) {
    recordPen.edit(toggleDefect, defect);
    setFormStatus('');
    recordPen.retireUndo();
  }

  // A declared problem's toggle (contract "Controls spec"; sketch 010 D26):
  // a recipe's own problem word is a presence toggle, not a goldilocks
  // axis — membership in the draft's declaredDefects list, flipped the way
  // handleChangeDefect flips a defect chip. Inside the tasting body, so it
  // always retires a pending undo (Task 2).
  function handleToggleDeclaredDefect(word) {
    recordPen.edit(toggleDeclaredDefect, word);
    setFormStatus('');
    recordPen.retireUndo();
  }

  // Clearing both the strike and the line for a step removes that step's
  // key from the draft entirely (D-13/BATCH1-01): an untouched step must
  // never rest at { struck: false, line: null }, which would be
  // indistinguishable from a step the maker deliberately marked as
  // unchanged — a fact this record never states.
  function handleChangeStepChange(stepNumber, patch) {
    // A step-change key is never a BATTERY_FIELDS key (WR-03) — nothing
    // of this field's own to clear.
    recordPen.edit(setStepChange, stepNumber, patch);
    setFormStatus('');
  }

  // Writes one portion's raw string (D-10). A row with no key yet is
  // seeded with an array of empty strings the length of that row's own
  // portions first, so the array is always aligned with row.portions —
  // the same alignment contract asMadeForPortion reads. Once every
  // portion of a row is back to an empty string, the row's key is deleted
  // entirely — the existing "an empty field means nothing was written"
  // rule (D-13/BATCH1-01), applied at the row level as it is today.
  function handleChangeAsMade(rowId, portionIndex, rawValue) {
    // An as-made row key is never a BATTERY_FIELDS key (WR-03) — nothing
    // of this field's own to clear.
    recordPen.edit(setAsMadePortion, version, rowId, portionIndex, rawValue);
    setFormStatus('');
  }

  // "Correct" reopens the record pen with everything the record holds in
  // the fields — the churn side and, when the batch carries one, the
  // tasting side too (D-03) — pre-filled from the batch, never from the
  // version (task 3, draftFromBatch above).
  //
  // The band's Record a tasting (below 724) opens the same pen through the
  // 'record-a-tasting' opener (sketch 011 decision 30, Mark 2026-10-02,
  // answer 1; route-recipe-batch.md sections 1 and 6): the Tasting section
  // is already open, as if Add tasting had just been pressed, and the Tasted
  // date takes focus through the same attempt counter Add tasting uses. The
  // pre-filled draft and its baseline both carry tastingOpen true, so an
  // untouched pen is clean (Escape closes it, no leave warning) until the
  // maker types. The pen's head is the one Correct's pen shows ("Batch" and
  // "churned {date}"); no board draws another, and the word Correct is only
  // the log head's opener, unmounted while any pen is open.
  function handleStartAmending(batch, { opener = 'correct' } = {}) {
    batchSaveLockRef.current = false;
    setBatchSaveAction(null);
    setFocusBatchAttempt(null);
    onPageStatus('');
    recordPen.openAmend(batch, opener);
    if (opener === 'record-a-tasting') {
      addTastingAttemptRef.current += 1;
      setAddTastingAttempt(addTastingAttemptRef.current);
    } else {
      setAddTastingAttempt(null);
    }
    setTastingStatus('');
    setRecordStatus('');
    setRemoveTastingAttempt(null);
    setRestoreAttempt(null);
    setFormStatus('');
    setMode('recording');
  }

  // The recipe band's Record a tasting (sketch 011 decision 30, answer 1;
  // below 724, VersionRow.jsx) hands over the batch its label rule read
  // (the version's latest). The pen opens in place only when that batch is
  // the batch in view, so the head, the axes snapshot and the amend save
  // always name the same batch (T-wn0-01). On an older batch's address the
  // band moves to the awaiting batch's own address and the pen opens there
  // (startTastingOnMount, above).
  function handleStartTasting(batch) {
    if (openBatch && openBatch.id === batch.id) {
      handleStartAmending(batch, { opener: 'record-a-tasting' });
    } else {
      navigate(notebookPath(version.recipeId, version.id, batch.id), { state: { startTasting: true } });
    }
  }

  // Add tasting (D-01, contract "Focus landings"): opens the tasting
  // section and moves focus to the Tasted date — the section opening and
  // the focus landing are themselves the evidence (contract "Feedback and
  // undo lifecycle": "Adding a tasting writes no announcement at all"), so
  // only the status line is cleared here, never written to.
  function handleAddTasting() {
    setFormStatus('');
    // A stale "Tasting restored." announcement must never linger beside a
    // freshly reopened section (Rule 2): tastingStatus is React state, not
    // tied to the tasting body's own mount/unmount, so it would otherwise
    // survive from an earlier restore into this unrelated reopen.
    setTastingStatus('');
    setRecordStatus('');
    addTastingAttemptRef.current += 1;
    setAddTastingAttempt(addTastingAttemptRef.current);
    recordPen.addTasting();
  }

  // The two hidden-mode removal paths (contract "Feedback and undo
  // lifecycle", the removal path matrix — Pitfall 6: the always-visible
  // mode's two rows are never built): a Remove press with no ink
  // (tastingHasInk false) collapses the section, blanks the tasting side,
  // writes the empty-removal sentence with no undo; a Remove press with
  // ink does the same but captures the tasting's own values in
  // pendingUndo first (tastingPayloadFromDraft, Task 2's restore reads
  // it) and writes the data-removal sentence with its undo clause. Both
  // sentences write to record-status, the end-of-record ceremony's own
  // region (the ninth round, 007 lines 543, 561 — the toast lives where
  // the action was, not formStatus), self-clear after five seconds
  // (plan 02's guarded announce helper), and move focus to the end-of-
  // record ceremony's own Add tasting on the empty path or Restore
  // tasting on the data path — BatchRow's own focus effect (007 lines
  // 542, 560).
  function handleRemoveTasting() {
    setTastingStatus('');
    setRecordStatus('');
    const hasInk = recordPen.removeTasting();
    announce(hasInk ? TASTING_REMOVED_DATA_STATUS : TASTING_REMOVED_EMPTY_STATUS, { selfClear: true, target: 'record' });
    removeTastingAttemptRef.current += 1;
    setRemoveTastingAttempt(removeTastingAttemptRef.current);
  }

  // The restore sequence (contract "Feedback and undo lifecycle"):
  // reopens the section and writes the payload back field-by-field
  // (restoreDraftFromUndo, T-03.3.1-10), clears pendingUndo, focuses the
  // Remove control, and announces "Tasting restored." to tasting-status —
  // the one path that writes to that channel in this build (Pitfall 6:
  // the always-visible mode's own tasting-status announcements are never
  // built). The restore toast self-clears after five seconds, the same
  // guarded five-second clear the removal toasts already carry.
  function handleUndoRemove() {
    recordPen.undoRemoveTasting();
    announce(TASTING_RESTORED_STATUS, { selfClear: true, target: 'tasting' });
    restoreAttemptRef.current += 1;
    setRestoreAttempt(restoreAttemptRef.current);
  }

  // The one save (D-01/D-02/D-03/D-04): every battery measurement
  // validates first (RESEARCH.md Open Question 3), then the churn date
  // (D-05) — Save stays enabled until a valid attempt begins; the two
  // ceremonies then lock together for the persistence boundary so repeat
  // activation cannot write two records. validateRecordDraft is the one
  // traversal both validation blocks flow through. Only once the draft is
  // clean do the two impure calls (a fresh id,
  // the current instant) run, here, in the one save handler — createBatch
  // and completeRecord stay deterministic. Amending (amendingBatchId set)
  // calls completeRecord on the batch being amended instead of createBatch
  // — a correction is never a new event and never retakes the snapshot
  // (BATCH2-01), and every completing save stamps `changed` (D-04). A
  // tasting object is assembled only when the section is open and holds
  // ink (D-02); a null tasting on completeRecord removes a stored one
  // (RESEARCH.md Assumption A3 — surfaced in this plan's SUMMARY for
  // end-of-phase UAT).
  function handleSaveBatch() {
    if (batchSaveLockRef.current) return;
    const check = recordPen.checkSave();

    if (check.outcome === 'measurement') {
      announce(MEASURED_INVALID_STATUS);
      return;
    }

    if (check.outcome === 'churnDate') {
      announce(CHURN_DATE_BLOCKED_STATUS);
      return;
    }

    batchSaveLockRef.current = true;
    const saveAction = amendingBatchId ? 'amend' : 'new';
    setBatchSaveAction(saveAction);
    announce('');

    let now;
    let churnFields;
    let tasting;
    try {
      now = new Date().toISOString();
      ({ churnFields, tasting } = recordPen.buildFields(check.parsed));
    } catch {
      batchSaveLockRef.current = false;
      setBatchSaveAction(null);
      announce(BATCH_SAVE_ERROR);
      return;
    }

    if (amendingBatchId) {
      let record;
      try {
        const batchBeingAmended = batches.find((batch) => batch.id === amendingBatchId);
        record = completeRecord(batchBeingAmended, churnFields, tasting, { now });
      } catch {
        batchSaveLockRef.current = false;
        setBatchSaveAction(null);
        announce(BATCH_SAVE_ERROR);
        return;
      }
      Promise.resolve().then(() => repository.saveBatch(record)).then(() => {
        discardDraft();
        setBatches((prev) => prev.map((batch) => (batch.id === record.id ? record : batch)));
        setMode('reading');
        recordPen.close();
        setFormStatus('');
        batchSaveLockRef.current = false;
        setBatchSaveAction(null);
        onPageStatus(batchSavedStatus(record));
        focusBatchAttemptRef.current += 1;
        setFocusBatchAttempt(focusBatchAttemptRef.current);
      }).catch(() => {
        batchSaveLockRef.current = false;
        setBatchSaveAction(null);
        announce(BATCH_SAVE_ERROR);
      });
      return;
    }

    let record;
    try {
      record = createBatch(version, churnFields, tasting, { id: freshId(), now });
    } catch {
      batchSaveLockRef.current = false;
      setBatchSaveAction(null);
      announce(BATCH_SAVE_ERROR);
      return;
    }

    Promise.resolve().then(() => repository.saveBatch(record)).then(() => {
      discardDraft();
      setBatches((prev) => [...prev, record]);
      setMode('reading');
      recordPen.close();
      setFormStatus('');
      batchSaveLockRef.current = false;
      setBatchSaveAction(null);
      onPageStatus(batchSavedStatus(record));
      navigate(notebookPath(version.recipeId, version.id, record.id), { state: { focusBatch: true } });
    }).catch(() => {
      batchSaveLockRef.current = false;
      setBatchSaveAction(null);
      announce(BATCH_SAVE_ERROR);
    });
  }

  // The deliberate, in-app abandonment path (A-1): returns to reading,
  // drops the draft, and clears the amend target and every blocked/error
  // state, writing nothing, and deletes the kept draft (D-16). Nothing needs
  // to navigate:
  // the batch on screen is derived from the URL and the loaded batch list,
  // never from the draft, so the page already shows the right thing once
  // mode returns to reading.
  function handleCancelRecording() {
    discardDraft();
    batchSaveLockRef.current = false;
    setBatchSaveAction(null);
    setFocusBatchAttempt(null);
    onPageStatus('');
    setMode('reading');
    recordPen.cancel();
    setAddTastingAttempt(null);
    setTastingStatus('');
    setRecordStatus('');
    setRemoveTastingAttempt(null);
    setRestoreAttempt(null);
    setFormStatus('');
  }

  // Seeds penDraft from the version the pen opened on (versionPen.open, which
  // builds it with penDraftFromVersion). Never touches draft or
  // amendingBatchId — mode alone still decides which of developing/recording
  // is live; derivePenState above is what now decides availability everywhere
  // else (RESEARCH.md Pattern 4).
  function handleStartDeveloping() {
    versionPen.open(version);
    setVersionSaveAction(null);
    versionSaveLockRef.current = false;
    penOpenedAtRef.current = new Date().toISOString();
    onPageStatus('');
    // Load-bearing, not defensive: without this a refusal survives in
    // formStatus after the pen closes and prints itself when this pen
    // reopens.
    announce('');
    setMode('developing');
  }

  // The show-changes toggle (D-02): adds or deletes the `changes` key,
  // building a new URLSearchParams from the previous one rather than
  // mutating it, and leaving setSearchParams's default push behaviour
  // alone so the browser's own back button returns to the clean reading.
  function handleToggleShowChanges() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (next.has('changes')) next.delete('changes');
      else next.set('changes', '');
      return next;
    });
  }

  // Discards with no dialog of the app's own (D-10) — mirrors
  // handleCancelRecording exactly.
  function handleCancelDeveloping() {
    discardDraft();
    setMode('reading');
    versionPen.close();
    setVersionSaveAction(null);
    versionSaveLockRef.current = false;
    penOpenedAtRef.current = null;
    onPageStatus('');
    announce('');
  }

  function handleChangePenField(field, value) {
    onPageStatus('');
    announce('');
    versionPen.edit(setPenField, field, value);
  }

  // Writes exactly one portion's raw typed string, leaving every other
  // portion and the removed flag untouched — the pen's amounts edit, the
  // split does not (CONTEXT.md phase boundary).
  function handleChangePenGrams(rowId, portionIndex, value) {
    versionPen.edit(setPenGrams, rowId, portionIndex, value);
  }

  // Serves the orphaned-row flag's "remove this row" control only: it acts
  // on every line of the row through toggleDraftRowLines, does not clear
  // any grams and does not touch any step (route-recipe-version.md § 3).
  // Removal never cascades, so this is always the maker's own tap.
  function handleTogglePenRowRemoved(rowId) {
    versionPen.edit(togglePenRowLines, rowId);
  }

  // Removing a line sets only that portion's removed flag — every other
  // portion and the row-level flag stay as they are, so Step 3's milk is
  // Step 3's (sketch 011 decision 51, Mark's answer 1). The same handler
  // restores; it is always the maker's own tap.
  function handleTogglePenLineRemoved(rowId, portionIndex) {
    versionPen.edit(togglePenLine, rowId, portionIndex);
  }

  // A step field setter for leadIn/instruction/purpose/aside (03-02):
  // `field` is always one of these four literal strings supplied by this
  // file's own call sites, never a maker-influenced key, so a computed
  // property name here carries no T-02-32 risk.
  function handleChangePenStepField(stepN, field, value) {
    versionPen.edit(setPenStepField, stepN, field, value);
  }

  // A target chip's label or value, matched by its index within the
  // step's own targets array rather than by label — a label can itself be
  // mid-edit, so matching by index avoids two chips momentarily colliding
  // on the same label while the maker types.
  function handleChangePenStepTarget(stepN, targetIndex, field, value) {
    versionPen.edit(setPenStepTarget, stepN, targetIndex, field, value);
  }

  // The step's uses list, written through a filter and a concat
  // (route-recipe-version.md § 3), never a bare bracket write — a
  // different fact from the row's own step allocation, and both are kept.
  function handleTogglePenStepUses(stepN, rowId) {
    versionPen.edit(togglePenStepUses, stepN, rowId);
  }

  // Removing sets only the draft step's removed flag — removal never
  // cascades, so this is always the maker's own tap, whether flipping a
  // step's own control or the removed-row cross-flag's "remove this step"
  // control.
  function handleTogglePenStepRemoved(stepN) {
    versionPen.edit(togglePenStepRemoved, stepN);
  }

  // Cancel on an open step (sketch 011 decisions_recorded 5, decision 1;
  // Task 3): restores exactly the one step the pen opened on, from the
  // version the pen opened on (`version`, in scope for the whole page) —
  // the same clear-blocked-state shape every other pen-step handler above
  // already follows.
  function handleRestorePenStep(stepN) {
    versionPen.edit(restoreStepFromVersion, version, stepN);
  }

  // An authored note's text, and the inherited-from marker it carries
  // (route-recipe-version.md, "Inherited notes"): the marker persists when
  // the edited text still equals the text this version inherited it with,
  // and clears the instant it differs — computed once, here, so every
  // reader (Authored.jsx included) can read `note.inheritedFrom` directly
  // rather than re-deriving it.
  function handleChangePenNoteText(listKey, index, value) {
    versionPen.edit(setPenNoteText, version, listKey, index, value);
  }

  // A note can be removed per note (route-recipe-version.md § 3) — an
  // outright removal from the list, not a struck-in-place flag: an
  // authored note carries no cross-flag concern the way a row or step does.
  function handleRemovePenNote(listKey, index) {
    versionPen.edit(removePenNote, listKey, index);
  }

  // Shared by both save paths: the one message that blocks the save is
  // computed by the tested domain function (D-04) — the same sentence can
  // never drift between the two save controls. `excludeId` scopes the
  // uniqueness check: null for a fresh child (compared against every
  // version of the recipe, including the one the pen opened on), the
  // current version's own id for a save-over (so keeping its own line
  // never reads as a collision with itself). Returns null when blocked, or
  // the pen's fields coerced for the domain constructor (rows' grams
  // strings are Number()'d here, at save time, never on keystroke —
  // Pitfall 5). A reason of nothing but whitespace is treated as blank and
  // stored as null, exactly as an empty reason already was.
  function buildPenFields(excludeId) {
    const scopedVersions = versionsForRecipe(versions, version.recipeId).filter((v) => v.id !== excludeId);
    const { blockedKind, fields } = versionPen.checkSave(version, scopedVersions);
    if (blockedKind === 'versionLine') announce(VERSION_BLOCKED_STATUS);
    return fields;
  }

  // The two impure calls (a fresh id, the current instant) live here, in
  // the one save handler — createChildVersion stays deterministic. The
  // parent is never passed to repository.saveVersion (D04, T-03-03).
  function handleSaveAsNewVersion() {
    if (versionSaveLockRef.current) return;
    const penFields = buildPenFields(null);
    if (!penFields) return;
    versionSaveLockRef.current = true;
    setVersionSaveAction('new');
    onPageStatus('');
    announce('');
    let child;
    try {
      child = createChildVersion(version, penFields, { id: freshId(), now: new Date().toISOString() });
    } catch {
      versionSaveLockRef.current = false;
      setVersionSaveAction(null);
      announce(VERSION_SAVE_ERROR);
      return;
    }
    Promise.resolve().then(() => repository.saveVersion(child)).then(() => {
      // The parent's draft: this page's own version id, deleted before the
      // navigation that unmounts the page.
      discardDraft();
      setVersions((prev) => [...prev, child]);
      setMode('reading');
      versionPen.close();
      penOpenedAtRef.current = null;
      onPageStatus(VERSION_SAVED_STATUS);
      // The child mounts fresh because router.jsx keys RecipePage by its
      // route. Land on the saved identity before offering another fork.
      navigate(notebookPath(child.recipeId, child.id), { state: { focusVersion: true } });
    }).catch(() => {
      versionSaveLockRef.current = false;
      setVersionSaveAction(null);
      announce(VERSION_SAVE_ERROR);
    });
  }

  // Available only on a version with zero batches (D-01). The control's
  // absence from the headnote is the design; this re-check is the
  // guarantee — a churned version's own record is never written to (D04)
  // even if this handler were somehow reached with the control hidden.
  function handleSaveOverVersion() {
    if (batches.length > 0 || versionSaveLockRef.current) return;
    const penFields = buildPenFields(version.id);
    if (!penFields) return;
    versionSaveLockRef.current = true;
    setVersionSaveAction('over');
    onPageStatus('');
    announce('');
    let updated;
    try {
      updated = saveOverVersion(version, penFields, { now: new Date().toISOString() });
    } catch {
      versionSaveLockRef.current = false;
      setVersionSaveAction(null);
      announce(VERSION_SAVE_ERROR);
      return;
    }
    Promise.resolve().then(() => repository.saveVersion(updated)).then(() => {
      discardDraft();
      setVersion(updated);
      setVersions((prev) => prev.map((existing) => (existing.id === updated.id ? updated : existing)));
      setMode('reading');
      versionPen.close();
      penOpenedAtRef.current = null;
      versionSaveLockRef.current = false;
      setVersionSaveAction(null);
      onPageStatus(VERSION_SAVED_STATUS);
    }).catch(() => {
      versionSaveLockRef.current = false;
      setVersionSaveAction(null);
      announce(VERSION_SAVE_ERROR);
    });
  }

  // Rename's own write (03.5-04 Task 1, D-12): writes the recipe record
  // through the seam at once — no version, no Why, no fork, and no saved
  // Sheet is touched. RecipeBand owns its own error/saving state; this
  // handler's only job is the seam call and the local state update, the
  // same shape every other save in this file follows (Promise -> then
  // setState).
  function handleSaveRecipe(next) {
    return repository.saveRecipe(next).then(() => setRecipe(next));
  }

  // The values the two sections read, held once so each guard and its section
  // never read different ones (261003-9bz). Before you start is a section of its
  // own above the Ingredients, drawn when it has notes, and in the pen always,
  // with no notes as its heading alone (pen E2); the Instructions are drawn when
  // the version shows a step, or in the pen (sketch 011 decision 36, Mark's
  // answers 1, 3 and 5, 2026-10-04).
  const methodSteps = mode === 'developing' || showingChanges ? version.method : readingVersion.method;
  const beforeNotes = mode === 'developing' && penDraft ? penDraft.authored.beforeYouStart : version.authored.beforeYouStart;
  const beforeRegionShown = mode === 'developing' || beforeNotes.length > 0;
  const methodRegionShown = showsMethodRegion({ mode, steps: methodSteps });
  // An explicit grid row with no item keeps its gutters, so each absent section
  // drops its row through a modifier (app.css).
  const sheetClassName =
    'recipe-page' + (beforeRegionShown ? '' : ' recipe-page--no-before') + (methodRegionShown ? '' : ' recipe-page--no-method');

  return (
    <div className="notebook">
      <header className="notebook-band">
        <div className="notebook-band__grid">
          <RecipeBand recipe={recipe} onSave={handleSaveRecipe} />

          <VersionRow
            version={version}
            versions={versions}
            mode={mode}
            penDraft={penDraft}
            batches={batches}
            allBatches={allBatches}
            citedBatch={citedBatch}
            parentVersion={parentVersion}
            showingChanges={showingChanges}
            openPen={openPen}
            canSaveOver={canSaveOver}
            saveAction={versionSaveAction}
            formStatus={formStatus}
            onStartDeveloping={handleStartDeveloping}
            onCancelDeveloping={handleCancelDeveloping}
            onChangePenField={handleChangePenField}
            onSaveAsNewVersion={handleSaveAsNewVersion}
            onSaveOverVersion={handleSaveOverVersion}
            onToggleShowChanges={handleToggleShowChanges}
            focusVersionOnMount={focusVersionOnMount}
            versionLineBlockedAttempt={blockedTarget?.kind === 'versionLine' ? blockedTarget.attempt : null}
            versionLineError={blockedTarget?.kind === 'versionLine' ? blockedMessage : null}
            foldsOpen={!belowDesktop}
            below724={below724}
            onStartRecording={handleStartRecording}
            onStartTasting={handleStartTasting}
            amendOpener={amendOpener}
            draft={openPen === null ? waitingPlanDraft : null}
          />

          <GoToBatch batches={batches} onGo={handleGoToBatch} />
        </div>

        <RecipeHistory
          versions={versions}
          recipeId={version.recipeId}
          currentVersionId={version.id}
          allBatches={allBatches}
          openPen={openPen}
          draft={
            mode === 'developing' && penDraft
              ? { label: penDraft.versionLabel, createdAt: penOpenedAtRef.current }
              : null
          }
          waitingDraft={
            waitingPlanDraft
              ? { label: waitingPlanDraft.payload?.versionLabel ?? '', createdAt: waitingPlanDraft.penOpenedAt }
              : null
          }
          belowDesktop={belowDesktop}
        />
      </header>

      <div className="notebook-body">
        <div className="notebook-body__sheet">
          <article className={sheetClassName} aria-busy={versionSaveAction || batchSaveAction ? 'true' : undefined}>
            <div className="recipe-band">
              <Headnote
                version={version}
                mode={mode}
                penDraft={penDraft}
                onChangePenField={handleChangePenField}
                isSaving={versionSaveAction !== null}
              />
            </div>

            {/* Before you start, its own section above the Ingredients: the
                order of the cook's day, and the order the screen reader, the
                Tab key and the printer meet (sketch 011 decision 36). */}
            {beforeRegionShown && (
              <section className="before-region" aria-label="Before you start">
                <h2 className="region-name">Before you start</h2>
                {beforeNotes.length > 0 && (
                  <NoteList
                    listKey="beforeYouStart"
                    notes={beforeNotes}
                    mode={mode}
                    onChangeNoteText={handleChangePenNoteText}
                    onRemoveNote={handleRemovePenNote}
                  />
                )}
              </section>
            )}

            <section className="ingredient-table-region" aria-label="Ingredients">
              <IngredientsHead
                parentVersion={parentVersion}
                openPen={openPen}
                below724={below724}
                showingChanges={showingChanges}
                onToggleShowChanges={handleToggleShowChanges}
              />
              {hasRows ? (
                <IngredientTable
                  rows={version.rows}
                  draftVersion={draftVersion}
                  diff={changeDiff}
                  showingChanges={showingChanges}
                  // The parent: what Show changes compares against, and, while the pen is open, what a line already
                  // out at open reads (Mark's List row per-step-open-pen-with-line-out, D-A).
                  baselineVersion={mode === 'developing' || (showingChanges && changeDiff) ? parentVersion : null}
                  blockedRowId={blockedTarget?.kind === 'row' ? blockedTarget.rowId : null}
                  blockedRowAttempt={blockedTarget?.kind === 'row' ? blockedTarget.attempt : null}
                  blockedLineIndex={blockedTarget?.kind === 'row' ? blockedTarget.index : null}
                  blockedRowMessage={blockedTarget?.kind === 'row' ? blockedMessage : null}
                  markedRowIds={markedRowIds}
                  markedFigureLabel={markedFigureLabel}
                  mode={mode}
                  draft={draft}
                  penDraft={penDraft}
                  openBatch={evidenceBatch}
                  comparisonBatchLabel={comparisonBatchLabel}
                  steps={version.method}
                  currentStepNumbers={currentStepNumbers}
                  onChangeAsMade={handleChangeAsMade}
                  onChangePenGrams={handleChangePenGrams}
                  onTogglePenRowRemoved={handleTogglePenRowRemoved}
                  onTogglePenLineRemoved={handleTogglePenLineRemoved}
                />
              ) : (
                <p>This version has no ingredient rows.</p>
              )}
            </section>

            {/* No Instructions section when there is no step to show (261003-9bz;
                decision 36, Mark's answer 5). */}
            {methodRegionShown && (
              <section className="method-region" aria-label="Instructions">
                <Method
                  steps={methodSteps}
                  stepChanges={mode === 'recording' ? draft.stepChanges : evidenceBatch ? evidenceBatch.churn.stepChanges : {}}
                  mode={mode}
                  onChangeStepChange={handleChangeStepChange}
                  rows={version.rows}
                  draftVersion={draftVersion}
                  baselineVersion={version}
                  penDiff={penDiff}
                  penStaleSteps={penStaleSteps}
                  showingChanges={showingChanges}
                  changeDiff={changeDiff}
                  staleSteps={changeStaleSteps}
                  staleFlagVisible={mode === 'developing' || showingChanges}
                  currentStepNumbers={currentStepNumbers}
                  baselineStepNumbers={baselineStepNumbers}
                  onChangePenStepField={handleChangePenStepField}
                  onChangePenStepTarget={handleChangePenStepTarget}
                  onTogglePenStepUses={handleTogglePenStepUses}
                  onTogglePenStepRemoved={handleTogglePenStepRemoved}
                  onRestorePenStep={handleRestorePenStep}
                />
              </section>
            )}

            {/* Column two, what the sheet does not print: the formulation
                note beside the table, then the margin beneath it. One
                flow, so the method's height never separates the two. */}
            <div className="side-region">
              {/* Balance and Watch for fold apart, each through its own
                  full-row control inside its own h2 (decision 18): this
                  region's own control lives here, since the region itself
                  renders here; Watch for's own control lives inside
                  DerivedAdvisories, reading the same sheetTwoColumns. One
                  branch at every width — the fold wrapper and its hidden
                  attribute always exist; they simply never hide anything from
                  984 up, where both panels are open by default (decision 33,
                  useFold's own default). */}
              <section className="formulation-note-region" aria-label="Balance">
                <h2 className="region-name">
                  <FoldRow label="Balance" open={balanceOpen} onToggle={toggleBalance} controls="fold-balance" />
                </h2>
                <div id="fold-balance" hidden={!balanceOpen}>
                  <FormulationNote
                    version={liveVersion}
                    mode={mode}
                    diff={mode === 'developing' ? penDiff : changeDiff}
                    onFocusFigure={setFocusedFigureKey}
                    onBlurFigure={() => setFocusedFigureKey(null)}
                    showHeading={false}
                  />
                  <BasisNote version={liveVersion} />
                </div>
                <p className="visually-hidden" role="status" aria-live="polite">
                  {markedAnnouncement}
                </p>
              </section>

              <div className="margin-region">
                <DerivedAdvisories version={liveVersion} foldsOpen={sheetTwoColumns} />
              </div>
            </div>

            <PenFoot
              openPen={openPen}
              batchSaveAction={batchSaveAction}
              tastingOpen={draft?.tastingOpen ?? false}
              pendingUndo={pendingUndo}
              onCancelRecording={handleCancelRecording}
              onSaveBatch={handleSaveBatch}
              onAddTasting={handleAddTasting}
            />
          </article>
        </div>

        <aside className="notebook-log" aria-label="Batch">
          <BatchRow
            version={version}
            batches={batches}
            openBatch={openBatch}
            mode={mode}
            draft={draft}
            fieldErrors={fieldErrors}
            invalidFieldTarget={invalidFieldTarget}
            blockedDateMessage={blockedDateMessage}
            blockedDateAttempt={blockedDateAttempt}
            addTastingAttempt={addTastingAttempt}
            amendOpener={amendOpener}
            formStatus={formStatus}
            tastingStatus={tastingStatus}
            recordStatus={recordStatus}
            pendingUndo={pendingUndo}
            restoreAttempt={restoreAttempt}
            removeTastingAttempt={removeTastingAttempt}
            batchSaveAction={batchSaveAction}
            focusBatchOnMount={focusBatchOnMount}
            focusBatchAttempt={focusBatchAttempt}
            onChangeRecordField={handleChangeRecordField}
            onChangeSegment={handleChangeSegment}
            onClearSegment={handleClearSegment}
            onChangeMarkOne={handleChangeMarkOne}
            onClearMarkOne={handleClearMarkOne}
            onChangeRecordMark={handleChangeRecordMark}
            onClearAxisMark={handleClearAxisMark}
            onChangeDefect={handleChangeDefect}
            onToggleDeclaredDefect={handleToggleDeclaredDefect}
            onRemoveTasting={handleRemoveTasting}
            onUndoRemove={handleUndoRemove}
            onAddTasting={handleAddTasting}
            openPen={openPen}
            penReason={penReason}
            onStartAmending={handleStartAmending}
            onCancelRecording={handleCancelRecording}
            onSaveBatch={handleSaveBatch}
            onStartRecording={handleStartRecording}
            foldsOpen={!belowDesktop}
            batchOpen={batchOpen}
            onToggleBatch={toggleBatch}
          />
        </aside>
      </div>
    </div>
  );
}
