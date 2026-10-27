import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './Button.jsx';
import { FieldFeedback } from './FieldFeedback.jsx';
import { RecipeSheet } from './RecipeSheet.jsx';
import { sheetView } from './sheetView.js';
import { DRAFT_KEPT_STATUS, useDraftWriter, useKeptDraft } from './useKeptDraft.js';
import { PageNotice, usePageNotice } from './PageNotice.jsx';
import { PAGE_LOAD_ERROR } from './RecipePage.jsx';
import { IngredientPicker } from './IngredientPicker.jsx';
import { CreationSetup } from './CreationSetup.jsx';
import { CreationSteps } from './CreationSteps.jsx';
import { repository } from '../store/repository.js';
import { draftMatchesCreate } from '../domain/draft.js';
import { NOTEBOOK_PLACE_PATH } from './notebookPaths.js';
import { freshId } from '../domain/id.js';
import {
  addStep,
  addTarget,
  groupRows,
  liveSteps,
  moveRow,
  moveStep,
  normalizeAllocation,
  placeRow,
  removeStep,
  removeTarget,
  rowLines,
  setLineGrams,
  setStepField,
  setTarget,
  toggleStepUses,
  UNPLACED_STEP,
} from '../domain/creationSteps.js';
import { displayNumbers } from '../domain/stepNumbers.js';
import {
  addNote,
  addRow,
  creationSheetVersion,
  creationTitle,
  normalizeCreateDraft,
  removeNote,
  removeRow,
  updateNote,
} from '../domain/creation.js';

function doNothing() {}

// The creation editor (Phase 10, MAKE-05, sketch 013 creation-editor.html
// panel eA1): the band holds Recipe name and Recipe description in Rename's
// open form, and the ceremony form 'New recipe' holds the Version name and
// Cancel. There is no Save here (Phase 11 adds it). The kept draft is the
// create record the Notebook's Start wrote; useKeptDraft keeps it as typed.
// `record` is the stored create draft CreationRoute found; `justStarted` is
// true when the maker has just pressed Start, so 'Draft kept' is not announced.
export function CreationPage({ record, justStarted = false }) {
  // Hooks first, in this order, above any early return.
  const navigate = useNavigate();
  const [notice, announce] = usePageNotice();
  const writer = useDraftWriter(record.versionId);
  // The editor never holds a payload as it was stored: a stored create draft
  // may hold only recipeId, versionId and name, so the first state and every
  // restore lay the payload over the blank one, then repair a draft whose uses
  // and portions disagree without losing a typed amount (normalizeAllocation).
  const [createDraft, setCreateDraft] = useState(() => normalizeAllocation(normalizeCreateDraft(record.payload)));
  const penOpenedAtRef = useRef(null);
  // Focus follows an add or a remove (MAKE-08): a handler leaves a request, and
  // the effect below acts on it after the render that drew its target, so focus
  // never goes to a control that is not there yet.
  const pageRef = useRef(null);
  const focusRequestRef = useRef(null);
  // The polite word for every structure change (D-14 to D-16): the region's
  // text is the latest sentence, form-scoped.
  const [structureWord, setStructureWord] = useState('');
  const structureFrameRef = useRef(0);
  // The library is read once and shared by the picker and the Sheet's
  // projection (D-07). null until loaded; libraryFailed when the read rejects.
  const [library, setLibrary] = useState(null);
  const [libraryFailed, setLibraryFailed] = useState(false);
  // The picker is open in the place of Add ingredient, and the row just added
  // holds focus in its grams field until it is left.
  const [picking, setPicking] = useState(false);
  const [focusRowId, setFocusRowId] = useState(null);
  const { draftRestoreDone } = useKeptDraft({
    writer,
    versionId: record.versionId,
    recipeId: record.payload.recipeId,
    batchId: undefined,
    version: null,
    batches: [],
    catalog: null,
    batchesLoaded: false,
    loadFailed: false,
    mode: 'creating',
    amendingBatchId: null,
    penDraft: null,
    draft: null,
    amendBaseline: null,
    amendOpener: null,
    penOpenedAtRef,
    onRestorePlan: doNothing,
    onRestoreRecord: doNothing,
    creating: true,
    createDraft,
    onRestoreCreate: (payload) => setCreateDraft(normalizeAllocation(normalizeCreateDraft(payload))),
    // Right after Start the draft is kept but the maker knows it: say nothing.
    onPageStatus: (message, options) => {
      if (justStarted && message === DRAFT_KEPT_STATUS) return;
      announce(message, options);
    },
    navigate,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => repository.listLibrary())
      .then(
        (records) => {
          if (!cancelled) setLibrary(records);
        },
        () => {
          if (!cancelled) setLibraryFailed(true);
        },
      );
    return () => {
      cancelled = true;
    };
  }, []);

  const libraryById = useMemo(() => new Map((library ?? []).map((record) => [record.id, record])), [library]);
  // The Sheet reads the creation as a version (no baseline: nothing to compare
  // with), rebuilt only when the draft or the library changes.
  const version = useMemo(() => creationSheetVersion(createDraft, libraryById), [createDraft, libraryById]);
  const view = useMemo(
    () =>
      sheetView({
        version,
        baseline: null,
        mode: 'creating',
        penDraft: null,
        parentVersion: null,
        showingChanges: false,
        batches: [],
        batchId: undefined,
      }),
    [version],
  );

  // The tab title leads with the recipe name, or Untitled while it is blank
  // (D-08c), the way RecipePage's does.
  const title = creationTitle(createDraft.name);
  useEffect(() => {
    document.title = `${title} · Sprinkles`;
    return () => {
      document.title = 'Sprinkles';
    };
  }, [title]);

  // A pending announcement frame goes with the page.
  useEffect(() => () => cancelAnimationFrame(structureFrameRef.current), []);

  useEffect(() => {
    const request = focusRequestRef.current;
    const page = pageRef.current;
    if (!request || !page) return;
    focusRequestRef.current = null;
    let target;
    if (typeof request === 'object' && request.kind === 'lead-in') {
      target = page.querySelector(`input[aria-label="Step ${request.position}, lead-in"]`);
    } else if (typeof request === 'object' && request.kind === 'step-act') {
      // After a move: the same Move button of the moved step, or its other Move
      // button when that one is now off (D-16). Found after the render that
      // reordered the steps, never trusted to a DOM node a keyed reorder moved.
      const step = page.querySelector(`li.mk-step[data-step="${request.n}"]`);
      target = step?.querySelector(`:scope > .method-step__body > .method-step__acts [data-act="${request.act}"]`);
      if (target?.getAttribute('aria-disabled') === 'true') {
        const other = request.act === 'move-up' ? 'move-down' : 'move-up';
        target = step.querySelector(`:scope > .method-step__body > .method-step__acts [data-act="${other}"]`);
      }
    } else if (typeof request === 'object' && request.kind === 'step-field') {
      target = page.querySelector(`li.mk-step[data-step="${request.n}"] [data-field="${request.field}"]`);
    } else if (typeof request === 'object' && request.kind === 'add-step-head') {
      target = page.querySelector('.method-region .mk-head-act');
    } else if (typeof request === 'object' && request.kind === 'row-act') {
      // A row's act, found by its line (`${rowId}:${group}`). After a move the
      // other Move button stands in when the pressed one is now off (D-16).
      const line = page.querySelector(`tr[data-line="${CSS.escape(request.line)}"]`);
      target = line?.querySelector(`[data-act="${request.act}"]`);
      if (target?.getAttribute('aria-disabled') === 'true') {
        const other = request.act === 'move-up' ? 'move-down' : 'move-up';
        target = line.querySelector(`[data-act="${other}"]`);
      }
    } else if (typeof request === 'object') {
      // A target added or removed: the step's targets line holds its chips, then
      // its own Add target (the line's first direct control).
      const line = page.querySelector(`li.mk-step[data-step="${request.n}"] > .method-step__body > .method-step__targets`);
      const chips = line ? [...line.querySelectorAll(':scope > .target-chip')] : [];
      const chip = request.kind === 'target-label' ? chips[request.index] : (chips[request.index] ?? chips[request.index - 1]);
      target = chip ? chip.querySelector('.target-chip__label-field') : line?.querySelector(':scope > .text-control');
    } else if (request === 'new-note') {
      target = page.querySelector(`textarea[aria-label="beforeYouStart note ${createDraft.beforeYouStart.length}"]`);
    } else if (request === 'add-note') {
      target = page.querySelector('.before-region .mk-head-act');
    } else {
      // The table region's add control: Add ingredient, or, while the picker is
      // open in its place, the picker's Cancel.
      target =
        page.querySelector('.ingredient-table-region .mk-head-act') ??
        page.querySelector('.ingredient-table-region .pick__head button');
    }
    target?.focus();
  });

  // Nothing is drawn until the kept-draft hook's own restore read has settled,
  // so nothing can be typed into a read still out and no keystroke is lost to a
  // page left before it resolves. The read is one IndexedDB get.
  if (!draftRestoreDone || (library === null && !libraryFailed)) return <PageNotice message={notice} />;

  // A functional update: two edits in one React batch both land, and the
  // payload is never rebuilt during render (useKeptDraft's identity rule).
  function setField(field, value) {
    setCreateDraft((prev) => ({ ...prev, [field]: value }));
  }

  // Before you start (MAKE-08). The Sheet's NoteList calls a change as
  // (listKey, index, text) and a remove as (listKey, index); every change is a
  // functional update over the previous draft.
  const handleChangeNote = (_listKey, index, text) => {
    setCreateDraft((prev) => updateNote(prev, index, text));
  };

  const handleRemoveNote = (_listKey, index) => {
    setCreateDraft((prev) => removeNote(prev, index));
    focusRequestRef.current = 'add-note';
  };

  const handleAddNote = () => {
    setCreateDraft((prev) => addNote(prev));
    focusRequestRef.current = 'new-note';
  };

  // Ingredient rows (MAKE-06). A pick mints the row id here, never in render;
  // every change is a functional update, and the draft keeps the link and the
  // typed grams only (D-07).
  const handlePick = (record) => {
    const rowId = freshId();
    setCreateDraft((prev) => addRow(prev, { rowId, libraryId: record.id }));
    setPicking(false);
    setFocusRowId(rowId);
  };

  const handleCancelPicker = () => {
    setPicking(false);
    focusRequestRef.current = 'ingredient-target';
  };

  const rowName = (rowId) => version.rows.find((row) => row.id === rowId)?.ingredientName ?? '';

  // Remove deletes the row outright (decision 5, STRUCT-01, D-15), whole, from
  // every step it is in: its control goes with it, so a row is never removed
  // twice. Focus goes, after the render, to the next row's remove in the group
  // the press was in, else the previous row's, else the table region's add
  // control: Add ingredient, or the picker's Cancel while the picker is open in
  // its place.
  const handleRemoveRow = (rowId, group = UNPLACED_STEP) => {
    const name = rowName(rowId);
    const ids = groupRows(createDraft, group);
    const at = ids.indexOf(rowId);
    const neighbour = at === -1 ? undefined : (ids[at + 1] ?? ids[at - 1]);
    setCreateDraft((prev) => removeRow(prev, rowId));
    setFocusRowId((prev) => (prev === rowId ? null : prev));
    focusRequestRef.current = neighbour ? { kind: 'row-act', line: `${neighbour}:${group}`, act: 'remove' } : 'ingredient-target';
    announceStructure(`${name} removed`);
  };

  // Move a row within its own group only (STRUCT-02, D-16): one step's rows, or
  // the rows under Not in a step yet. Another step's order is as it was. Focus
  // stays on the same Move button of the row (the other one when it turned
  // off), and the word says where the row went.
  const handleMoveRow = (rowId, group, direction) => {
    const ids = groupRows(createDraft, group);
    const at = ids.indexOf(rowId);
    const to = at + (direction === 'up' ? -1 : 1);
    if (at === -1 || to < 0 || to >= ids.length) return;
    const position = `row ${to + 1} of ${ids.length}`;
    let where = '';
    if (group !== UNPLACED_STEP) where = ` in step ${displayNumbers(createDraft.method).get(group)}`;
    else if (liveSteps(createDraft).length > 0) where = ', not in a step yet';
    setCreateDraft((prev) => moveRow(prev, rowId, group, direction));
    focusRequestRef.current = { kind: 'row-act', line: `${rowId}:${group}`, act: direction === 'up' ? 'move-up' : 'move-down' };
    announceStructure(`${rowName(rowId)}, ${position}${where}`);
  };

  // Add to step (decision 014 1, D-17): the row joins the end of that step's
  // uses, so it reads as that step's last row, and focus goes to its remove.
  const handlePlaceRow = (rowId, n) => {
    const number = displayNumbers(createDraft.method).get(n);
    setCreateDraft((prev) => placeRow(prev, rowId, n));
    focusRequestRef.current = { kind: 'row-act', line: `${rowId}:${n}`, act: 'remove' };
    announceStructure(`${rowName(rowId)} added to step ${number}`);
  };

  // One grams field per line of a row (MAKE-07): a line is named by its row and
  // the step it sits in, UNPLACED_STEP for a row no step uses.
  const handleChangeGrams = (rowId, step, value) => {
    setCreateDraft((prev) => setLineGrams(prev, rowId, step, value));
  };

  const handleBlurGrams = (rowId) => {
    setFocusRowId((prev) => (prev === rowId ? null : prev));
  };

  // Instructions (MAKE-07). Add step on the heading adds a step at the
  // beginning; a step added after step afterN goes one place past it. Focus goes
  // to the new step's lead-in, found by the display number it will carry.
  const handleAddStep = (afterN = null) => {
    const position = afterN === null ? 1 : (displayNumbers(createDraft.method).get(afterN) ?? 0) + 1;
    setCreateDraft((prev) => addStep(prev, { afterN }));
    focusRequestRef.current = { kind: 'lead-in', position };
  };

  // Every structure change is heard, a repeat included: the region is emptied
  // and the sentence written on the next frame (SheetCodeSearch's pattern), so
  // two moves that both end at "Step 2 of 3" are two changes to a polite region.
  const announceStructure = (sentence) => {
    cancelAnimationFrame(structureFrameRef.current);
    setStructureWord('');
    structureFrameRef.current = requestAnimationFrame(() => setStructureWord(sentence));
  };

  // Move a step (STRUCT-02): the stored keys stay as they are and the numbers on
  // screen follow the order. Focus stays on the same Move button of the moved
  // step (D-16). An off button never gets here; the guard is for a stale press.
  const handleMoveStep = (n, direction) => {
    const live = liveSteps(createDraft);
    const target = live.findIndex((step) => step.n === n) + (direction === 'up' ? -1 : 1);
    if (target < 0 || target >= live.length) return;
    setCreateDraft((prev) => moveStep(prev, n, direction));
    focusRequestRef.current = { kind: 'step-act', n, act: direction === 'up' ? 'move-up' : 'move-down' };
    announceStructure(`Step ${target + 1} of ${live.length}`);
  };

  // Remove a step outright, no strike and no restore (STRUCT-01, D-14): its rows
  // go back under Not in a step yet, and a split row folds its grams into the
  // line left. Focus goes to the next step's lead-in, else the previous one's,
  // else the heading's Add step.
  const handleRemoveStep = (n) => {
    const live = liveSteps(createDraft);
    const at = live.findIndex((step) => step.n === n);
    if (at === -1) return;
    const neighbour = live[at + 1] ?? live[at - 1];
    const leadIn = live[at].leadIn.trim();
    setCreateDraft((prev) => removeStep(prev, n));
    focusRequestRef.current = neighbour ? { kind: 'step-field', n: neighbour.n, field: 'lead-in' } : { kind: 'add-step-head' };
    announceStructure(leadIn === '' ? `Step ${at + 1} removed` : `Step ${at + 1}, ${leadIn}, removed`);
  };

  const handleChangeStepField = (n, field, value) => {
    setCreateDraft((prev) => setStepField(prev, n, field, value));
  };

  // Targets (D-22). Add target puts focus in the new target's label field; a
  // remove puts it, after the render, in the next target's label field, else the
  // previous one's, else the step's Add target.
  const handleAddTarget = (n) => {
    const index = (createDraft.method.find((step) => step.n === n)?.targets ?? []).length;
    setCreateDraft((prev) => addTarget(prev, n));
    focusRequestRef.current = { kind: 'target-label', n, index };
  };

  const handleChangeTarget = (n, index, side, value) => {
    setCreateDraft((prev) => setTarget(prev, n, index, side, value));
  };

  const handleRemoveTarget = (n, index) => {
    setCreateDraft((prev) => removeTarget(prev, n, index));
    focusRequestRef.current = { kind: 'target-after-remove', n, index };
  };

  // The Uses checklist (MAKE-07): ticking a row makes the step use it, and the
  // draft keeps the row's grams lines as the domain op moves them.
  const handleToggleUses = (n, rowId) => {
    setCreateDraft((prev) => toggleStepUses(prev, n, rowId));
  };

  const gramsByLine = new Map(
    createDraft.rows.flatMap((row) => rowLines(createDraft, row.id).map((line) => [`${row.id}:${line.step}`, line.grams])),
  );
  const addedIds = new Set(createDraft.rows.map((row) => row.libraryId));

  // Cancel ends the creation for good, and only once the delete has succeeded
  // (RESEARCH Pitfall 6): the Notebook must not read 'discarded' over a draft
  // still kept. While the delete is out the hook holds every write; when it
  // fails the hook gives persistence back and the page stays where it is and
  // says so, so a failed Cancel loses nothing. There is no dialog and no Undo
  // (D-03). After a successful delete the drafts are read once more so the
  // Notebook's route state says whether another creation remains (createKept,
  // a boolean computed here, left out when that read fails).
  async function handleCancel() {
    try {
      await writer.discardDraft({ final: true });
    } catch {
      announce(PAGE_LOAD_ERROR);
      return;
    }
    let state = { discarded: true };
    try {
      const records = await Promise.resolve().then(() => repository.listDrafts());
      state = { discarded: true, createKept: records.some(draftMatchesCreate) };
    } catch {
      // Nothing is known about other drafts; the flag is left out.
    }
    navigate(NOTEBOOK_PLACE_PATH, { replace: true, state });
  }

  return (
    <>
      <PageNotice message={notice} />
      <div className="notebook mk-page" ref={pageRef}>
        <p className="visually-hidden" role="status" aria-live="polite">
          {structureWord}
        </p>
        <header className="notebook-band">
          <div className="notebook-band__grid">
            <section className="notebook-recipe" aria-label="Recipe">
              <div className="notebook-recipe__form">
                <label className="notebook-field">
                  <span className="notebook-caption">Recipe name</span>
                  <input
                    type="text"
                    className="ink-field"
                    value={createDraft.name}
                    aria-label="Recipe name"
                    onChange={(event) => setField('name', event.target.value)}
                  />
                </label>
                <label className="notebook-field">
                  <span className="notebook-caption">Recipe description</span>
                  <textarea
                    className="prose-field"
                    rows="3"
                    value={createDraft.description}
                    aria-label="Recipe description"
                    onChange={(event) => setField('description', event.target.value)}
                  />
                </label>
              </div>
            </section>
            <form className="notebook-ceremony" aria-label="New recipe" onSubmit={(event) => event.preventDefault()}>
              <span className="notebook-caption">New recipe · draft</span>
              <label className="notebook-field">
                <span className="notebook-caption">Version name</span>
                <input
                  type="text"
                  className="ink-field"
                  required
                  value={createDraft.versionLabel}
                  aria-label="Version name"
                  onChange={(event) => setField('versionLabel', event.target.value)}
                />
                <FieldFeedback required />
              </label>
              <div className="notebook-ceremony__actions">
                <Button className="notebook-action--outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </header>
        {libraryFailed ? (
          <div className="not-found">
            <p>{PAGE_LOAD_ERROR}</p>
          </div>
        ) : (
          <div className="notebook-body">
            <div className="notebook-body__sheet">
              <RecipeSheet
                view={view}
                version={version}
                mode="creating"
                penDraft={null}
                creationRows={{
                  gramsByLine,
                  // The row just added from the picker is unplaced, so its one line is at step 0.
                  focusLine: focusRowId ? `${focusRowId}:0` : null,
                  onChangeGrams: handleChangeGrams,
                  onBlurGrams: handleBlurGrams,
                  onRemoveRow: handleRemoveRow,
                  onMoveRow: handleMoveRow,
                  onPlaceRow: handlePlaceRow,
                }}
                onChangePenNoteText={handleChangeNote}
                onRemovePenNote={handleRemoveNote}
                beforeAct={
                  <Button className="text-control mk-head-act" onClick={handleAddNote}>
                    Add note
                  </Button>
                }
                ingredientsAct={
                  picking ? null : (
                    <Button className="text-control mk-head-act" onClick={() => setPicking(true)}>
                      Add ingredient
                    </Button>
                  )
                }
                ingredientsFoot={
                  picking ? (
                    <IngredientPicker
                      records={library}
                      addedIds={addedIds}
                      onPick={handlePick}
                      onCancel={handleCancelPicker}
                    />
                  ) : null
                }
                creationMethod={
                  <CreationSteps
                    draft={createDraft}
                    version={version}
                    onAddStep={handleAddStep}
                    onRemoveStep={handleRemoveStep}
                    onMoveStep={handleMoveStep}
                    onChangeStepField={handleChangeStepField}
                    onAddTarget={handleAddTarget}
                    onChangeTarget={handleChangeTarget}
                    onRemoveTarget={handleRemoveTarget}
                    onToggleUses={handleToggleUses}
                  />
                }
              />
            </div>
            <aside className="notebook-log" aria-label="Setup">
              <CreationSetup createDraft={createDraft} onChange={setCreateDraft} />
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
