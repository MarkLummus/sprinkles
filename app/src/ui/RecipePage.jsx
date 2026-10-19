import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { repository } from '../store/repository.js';
import { versionsForRecipe } from '../domain/lineage.js';
import { draftMatchesVersion, newestDraft } from '../domain/draft.js';
import { derivePenState, isPenDraftDirty } from '../domain/penDraft.js';
import { isDraftDirty } from '../domain/recordDraft.js';
import { BatchRow } from './BatchRow.jsx';
import { RecipeBand } from './RecipeBand.jsx';
import { VersionRow } from './VersionRow.jsx';
import { GoToBatch } from './GoToBatch.jsx';
import { RecipeHistory } from './RecipeHistory.jsx';
import { PenFoot } from './PenFoot.jsx';
import { RecipeSheet } from './RecipeSheet.jsx';
import { useBelow724, useBelowDesktop, useFold } from './useBelowDesktop.js';
import { useVersionPen } from './useVersionPen.js';
import { useDraftWriter, useKeptDraft } from './useKeptDraft.js';
import { useBatchRecording } from './useBatchRecording.js';
import { useRouteIntents } from './useRouteIntents.js';
import { useAnnouncer } from './useAnnouncer.js';
import { useRecipeData } from './useRecipeData.js';
import { sheetView } from './sheetView.js';
import { useCatalog } from './CatalogContext.jsx';

export { VERSION_SAVED_STATUS, VERSION_SAVE_ERROR, VERSION_BLOCKED_STATUS } from './useVersionPen.js';

export { DRAFT_KEPT_STATUS } from './useKeptDraft.js';

export {
  MEASURED_INVALID_STATUS,
  CHURN_DATE_BLOCKED_STATUS,
  BATCH_SAVE_ERROR,
  TASTING_REMOVED_EMPTY_STATUS,
  TASTING_REMOVED_DATA_STATUS,
  TASTING_RESTORED_STATUS,
} from './useBatchRecording.js';

// The one line the page shows when a store read fails (WR-05). Word for word
// the boot failure line in main.jsx, so it adds no new words.
export const PAGE_LOAD_ERROR = 'Could not open the local store. Try reloading.';

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
  // The catalog (the core scales and problems the tables hold) is read here,
  // at the route level, and handed down to the record pen (D-02).
  const { catalog } = useCatalog();
  // The fork's landing focus signal: read once here so the saved child
  // can identify itself before offering another Next version action.
  const location = useLocation();
  const focusVersionOnMount = Boolean(location.state?.focusVersion);
  const focusBatchOnMount = Boolean(location.state?.focusBatch);
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
  // The pen layer's state (route-recipe-batch.md § 3): a mode, one of
  // 'reading' | 'recording' | 'developing', and the draft form state it is
  // recorded into. mode is never derived from the URL — only the margin's
  // own control, and now the headnote's, ask for it (D-19).
  const [mode, setMode] = useState('reading');
  // The kept draft's writer (refs, flush and discard; no effect), then the
  // record pen and the version pen, which take discardDraft from it (D-08).
  // useKeptDraft, below, takes the writer and both pens' restores.
  const draftWriter = useDraftWriter(versionId);
  const { discardDraft } = draftWriter;
  // The record pen's draft, its amend target, baseline and opener, its
  // blocked-save state, the pending undo, the attempt counters the Batch aside's
  // focus landings read, the batch save and the nineteen batch handlers
  // (useBatchRecording owns all of them).
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
    addTastingAttempt,
    removeTastingAttempt,
    restoreAttempt,
    batchSaveAction,
    focusBatchAttempt,
    focusBatch,
    restoreRecord,
    handleStartRecording,
    handleChangeRecordField,
    handleChangeSegment,
    handleChangeRecordMark,
    handleClearAxisMark,
    handleClearSegment,
    handleChangeMarkOne,
    handleClearMarkOne,
    handleChangeDefect,
    handleToggleDeclaredDefect,
    handleChangeStepChange,
    handleChangeAsMade,
    handleStartAmending,
    handleStartTasting,
    handleAddTasting,
    handleRemoveTasting,
    handleUndoRemove,
    handleSaveBatch,
    handleCancelRecording,
  } = useBatchRecording({ version, batches, batchId, setBatches, setMode, announce, setFormStatus, setTastingStatus, setRecordStatus, onPageStatus, discardDraft, navigate });
  const {
    penDraft,
    blockedMessage,
    blockedTarget,
    versionSaveAction,
    penOpenedAtRef,
    restorePlan,
    handleStartDeveloping,
    handleCancelDeveloping,
    handleChangePenField,
    handleChangePenGrams,
    handleTogglePenRowRemoved,
    handleTogglePenLineRemoved,
    handleChangePenStepField,
    handleChangePenStepTarget,
    handleTogglePenStepUses,
    handleTogglePenStepRemoved,
    handleRestorePenStep,
    handleChangePenNoteText,
    handleRemovePenNote,
    handleSaveAsNewVersion,
    handleSaveOverVersion,
  } = useVersionPen({ version, versions, batches, setMode, setVersion, setVersions, announce, onPageStatus, discardDraft, navigate });

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

  // Kept drafts (04-09, D-14 to D-17): the restore, persist and pagehide
  // effects live in useKeptDraft, called after the version pen so it can take
  // the pen's restorePlan (D-08). draftRestoreDone gates the route intents below.
  const { draftRestoreDone } = useKeptDraft({
    writer: draftWriter,
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
    onRestorePlan: restorePlan,
    onRestoreRecord: restoreRecord,
    onPageStatus,
    navigate,
  });

  // The route intents (useRouteIntents): the band's Record a tasting and Home's
  // Next version ask for a pen through route state, each consumed once after the
  // draft restore. The openers are the record pen's handleStartAmending and
  // the version pen's handleStartDeveloping.
  useRouteIntents({ location, navigate, mode, batchId, batches, draftRestoreDone, versionsLoaded, draftsLoaded, versions, drafts, version, onStartAmending: handleStartAmending, onStartDeveloping: handleStartDeveloping });

  // Escape (D-27): closes only an untouched pen, and does nothing at all
  // once the pen holds ink — Cancel is the one exit, so a stray key can
  // never discard a sheet of transcription. Registered on `document`, not
  // the article, so an Escape pressed while focus rests on `body` (the
  // state the critique found batch Cancel leaving behind) still closes
  // the pen. Reads the same two dirty checks the draft persistence in
  // useKeptDraft.js reads — introducing no third notion of dirtiness. An open but
  // empty tasting section (tastingOpen true, nothing else touched) counts
  // as no ink under isDraftDirty's own baseline/blank comparisons,
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
  // two media reads, two cuts. Version details, History, Tasting and the batch
  // list read belowDesktop (BELOW_DESKTOP_QUERY, 1366), passed down as each
  // region's own foldsOpen prop (its negation): open by default from 1366,
  // closed below (decision 18, unchanged). Each fold returns to its own width's
  // default on every visit or crossing of its own cut (useFold,
  // decisions_recorded 2). Balance and Watch for read the other cut (984) and
  // live in RecipeSheet; Tasting's fold lives inside TastingReading. Both hooks
  // below must sit above the early returns.
  const belowDesktop = useBelowDesktop();
  // The recipe band's record act (sketch 011 decision 30): below 724 its
  // first control is the filled record act. Above the early returns, like
  // every hook here.
  const below724 = useBelow724();
  // The Batch fold (sketch 011 decision 50 C1, Mark 2026-10-05) is open on
  // first load at every width. Its default never changes, so no width
  // crossing resets it, and nothing is stored. It lives here so Go to batch can
  // open it in the same update that fires the landing.
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
  const { openBatch } = view;

  // The band's Go to batch row (sketch 011 decision 30). It opens the Batch
  // fold if the maker closed it (decision 50, Mark 2026-10-05), then runs the
  // same two lines an amendment save runs, so the body is shown before
  // BatchRow's landing focuses its Batch heading and draws the ring. The URL
  // and history are not touched.
  function handleGoToBatch() {
    if (!batchOpen) toggleBatch();
    focusBatch();
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

  // Rename's own write (03.5-04 Task 1, D-12): writes the recipe record
  // through the seam at once — no version, no Why, no fork, and no saved
  // Sheet is touched. RecipeBand owns its own error/saving state; this
  // handler's only job is the seam call and the local state update, the
  // same shape every other save in this file follows (Promise -> then
  // setState).
  function handleSaveRecipe(next) {
    return repository.saveRecipe(next).then(() => setRecipe(next));
  }

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
          <RecipeSheet
            view={view}
            version={version}
            mode={mode}
            penDraft={penDraft}
            draft={draft}
            parentVersion={parentVersion}
            showingChanges={showingChanges}
            openPen={openPen}
            below724={below724}
            blockedTarget={blockedTarget}
            blockedMessage={blockedMessage}
            versionSaveAction={versionSaveAction}
            batchSaveAction={batchSaveAction}
            foot={
              <PenFoot
                openPen={openPen}
                batchSaveAction={batchSaveAction}
                tastingOpen={draft?.tastingOpen ?? false}
                pendingUndo={pendingUndo}
                onCancelRecording={handleCancelRecording}
                onSaveBatch={handleSaveBatch}
                onAddTasting={handleAddTasting}
              />
            }
            onChangePenField={handleChangePenField}
            onChangePenNoteText={handleChangePenNoteText}
            onRemovePenNote={handleRemovePenNote}
            onToggleShowChanges={handleToggleShowChanges}
            onChangeAsMade={handleChangeAsMade}
            onChangePenGrams={handleChangePenGrams}
            onTogglePenRowRemoved={handleTogglePenRowRemoved}
            onTogglePenLineRemoved={handleTogglePenLineRemoved}
            onChangeStepChange={handleChangeStepChange}
            onChangePenStepField={handleChangePenStepField}
            onChangePenStepTarget={handleChangePenStepTarget}
            onTogglePenStepUses={handleTogglePenStepUses}
            onTogglePenStepRemoved={handleTogglePenStepRemoved}
            onRestorePenStep={handleRestorePenStep}
          />
        </div>

        <aside className="notebook-log" aria-label="Batch">
          <BatchRow
            version={version}
            catalog={catalog}
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
