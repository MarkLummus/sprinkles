import { useState } from 'react';
import { markedFigure } from './sheetView.js';
import { IngredientTable, IngredientsHead } from './IngredientTable.jsx';
import { Method, showsMethodRegion } from './Method.jsx';
import { NoteList } from './Authored.jsx';
import { FormulationNote } from './FormulationNote.jsx';
import { BasisNote } from './BasisNote.jsx';
import { Headnote } from './Headnote.jsx';
import { DerivedAdvisories } from './DerivedAdvisories.jsx';
import { FoldRow } from './FoldRow.jsx';
import { useFold, useSheetTwoColumns } from './useBelowDesktop.js';

// The Sheet's article (Phase 8, EDIT-05, cut 4, D-03, D-09): the one component
// the editing page mounts now and Phase 10's creation editor mounts later. It
// holds the headnote, Before you start, the Ingredients, the Instructions, the
// Balance fold and Watch for. It does not hold the band, the Batch aside or the
// pen foot, which arrives as `foot`. Every diff prop is nullable: a caller with
// no stored version and no baseline passes `baseline: null` to sheetView and
// gets no pen diff here. It owns its focus trace, its two-column read and the
// Balance fold, and it imports no store module.
export function RecipeSheet({
  view,
  version,
  mode,
  penDraft,
  draft = null,
  parentVersion = null,
  showingChanges = false,
  openPen = null,
  below724 = false,
  blockedTarget = null,
  blockedMessage = null,
  versionSaveAction = null,
  batchSaveAction = null,
  foot = null,
  beforeFoot = null,
  onChangePenField,
  onChangePenNoteText,
  onRemovePenNote,
  onToggleShowChanges,
  onChangeAsMade,
  onChangePenGrams,
  onTogglePenRowRemoved,
  onTogglePenLineRemoved,
  onChangeStepChange,
  onChangePenStepField,
  onChangePenStepTarget,
  onTogglePenStepUses,
  onTogglePenStepRemoved,
  onRestorePenStep,
}) {
  // The signature trace (route-recipe.md § 3, § 5): focusing a balance
  // figure marks the ingredient rows it rests on. This component is the shared
  // parent of the figures and the table, so it is the one place the
  // focused figure's key can live.
  const [focusedFigureKey, setFocusedFigureKey] = useState(null);
  // Balance and Watch for read sheetTwoColumns (SHEET_TWO_COLUMNS_QUERY, 984):
  // open by default wherever the Sheet is two columns (decision 33, brief task
  // 4). Balance's own fold state is local to this component, since its region
  // renders here; Watch for's lives inside DerivedAdvisories.
  const sheetTwoColumns = useSheetTwoColumns();
  const [balanceOpen, toggleBalance] = useFold(sheetTwoColumns);

  const {
    baseline,
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
    evidenceBatch,
    comparisonBatchLabel,
  } = view;
  const { markedRowIds, markedFigureLabel, markedAnnouncement } = markedFigure(view, focusedFigureKey);

  // The values the two sections read, held once so each guard and its section
  // never read different ones (261003-9bz). Before you start is a section of its
  // own above the Ingredients, drawn when it has notes, and in the pen always,
  // with no notes as its heading alone (pen E2); the Instructions are drawn when
  // the version shows a step, or in the pen (sketch 011 decision 36, Mark's
  // answers 1, 3 and 5, 2026-10-04).
  const methodSteps = mode === 'developing' || showingChanges ? version.method : readingVersion.method;
  const beforeNotes = mode === 'developing' && penDraft ? penDraft.authored.beforeYouStart : version.authored.beforeYouStart;
  const beforeRegionShown = mode === 'developing' || mode === 'creating' || beforeNotes.length > 0;
  const methodRegionShown = showsMethodRegion({ mode, steps: methodSteps });
  // An explicit grid row with no item keeps its gutters, so each absent section
  // drops its row through a modifier (app.css).
  const sheetClassName =
    'recipe-page' + (beforeRegionShown ? '' : ' recipe-page--no-before') + (methodRegionShown ? '' : ' recipe-page--no-method');

  return (
    <article className={sheetClassName} aria-busy={versionSaveAction || batchSaveAction ? 'true' : undefined}>
      <div className="recipe-band">
        <Headnote
          version={version}
          mode={mode}
          penDraft={penDraft}
          onChangePenField={onChangePenField}
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
              onChangeNoteText={onChangePenNoteText}
              onRemoveNote={onRemovePenNote}
            />
          )}
          {beforeFoot}
        </section>
      )}

      <section className="ingredient-table-region" aria-label="Ingredients">
        <IngredientsHead
          parentVersion={parentVersion}
          openPen={openPen}
          below724={below724}
          showingChanges={showingChanges}
          onToggleShowChanges={onToggleShowChanges}
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
            onChangeAsMade={onChangeAsMade}
            onChangePenGrams={onChangePenGrams}
            onTogglePenRowRemoved={onTogglePenRowRemoved}
            onTogglePenLineRemoved={onTogglePenLineRemoved}
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
            stepChanges={mode === 'recording' ? (draft?.stepChanges ?? {}) : evidenceBatch ? evidenceBatch.churn.stepChanges : {}}
            mode={mode}
            onChangeStepChange={onChangeStepChange}
            rows={version.rows}
            draftVersion={draftVersion}
            baselineVersion={baseline}
            penDiff={penDiff}
            penStaleSteps={penStaleSteps}
            showingChanges={showingChanges}
            changeDiff={changeDiff}
            staleSteps={changeStaleSteps}
            staleFlagVisible={mode === 'developing' || showingChanges}
            currentStepNumbers={currentStepNumbers}
            baselineStepNumbers={baselineStepNumbers}
            onChangePenStepField={onChangePenStepField}
            onChangePenStepTarget={onChangePenStepTarget}
            onTogglePenStepUses={onTogglePenStepUses}
            onTogglePenStepRemoved={onTogglePenStepRemoved}
            onRestorePenStep={onRestorePenStep}
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

      {foot}
    </article>
  );
}
