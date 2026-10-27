import { useRef, useState } from 'react';
import { repository } from '../store/repository.js';
import { freshId } from '../domain/id.js';
import { createChildVersion, saveOverVersion, versionsForRecipe } from '../domain/lineage.js';
import { VersionChangedError } from '../domain/firstVersion.js';
import {
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
import { notebookPath } from './notebookPaths.js';
import { usePenDraft } from './usePenDraft.js';

export const VERSION_SAVED_STATUS = 'Version saved.';
export const VERSION_SAVE_ERROR = 'Couldn’t save the version. Try again.';
export const VERSION_BLOCKED_STATUS = 'Check the version. Your changes have been kept.';
// The store's refusals of Save over this version (T-11-63): another tab saved over the
// version, or recorded a batch on it, since this page read it.
export const VERSION_CHANGED_STATUS = 'This version changed in another tab. Cancel, then reload the page.';
export const VERSION_HAS_BATCH_STATUS = 'This version has a batch now. Save as a new version instead.';

// The version-pen job (Phase 8 cut 5, EDIT-05, D-08): the plan's pen state
// (usePenDraft), the save lock, the day the pen opened, start and cancel, the
// eleven edit handlers, both saves, and restorePlan, the pen-side half of a
// kept draft's restore. It does no draft IO: it receives discardDraft from
// useDraftWriter. announce and onPageStatus keep those names on purpose, so
// RecipePage.test.jsx can still find which channel each status constant goes
// through by the name of the function it is passed to.
export function useVersionPen({ version, versions, batches, setMode, setVersion, setVersions, announce, onPageStatus, discardDraft, navigate }) {
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
  // parent is never written (D04, T-03-03). The child is stored through
  // repository.createVersion, which refuses a Sheet code another version holds
  // and writes nothing (CODE-01, D-04); the catch below then announces the
  // failed save and keeps the pen, with no re-drawn code.
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
    Promise.resolve().then(() => repository.createVersion(child)).then(() => {
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
  // even if this handler were somehow reached with the control hidden. The
  // store repeats the check, and one more, inside its own transaction: the
  // record this page read must still be the stored one (T-11-63).
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
    Promise.resolve().then(() => repository.saveVersion(updated, { expected: version })).then(() => {
      discardDraft();
      setVersion(updated);
      setVersions((prev) => prev.map((existing) => (existing.id === updated.id ? updated : existing)));
      setMode('reading');
      versionPen.close();
      penOpenedAtRef.current = null;
      versionSaveLockRef.current = false;
      setVersionSaveAction(null);
      onPageStatus(VERSION_SAVED_STATUS);
    }).catch((error) => {
      versionSaveLockRef.current = false;
      setVersionSaveAction(null);
      // The store refuses a version another tab changed, or that gained a batch, since
      // this page read it: the pen stays open with what was typed, and says why.
      if (error instanceof VersionChangedError) {
        announce(error.reason === 'has-batch' ? VERSION_HAS_BATCH_STATUS : VERSION_CHANGED_STATUS);
      } else {
        announce(VERSION_SAVE_ERROR);
      }
    });
  }

  // The pen-side half of a kept draft's restore, handed to useKeptDraft as
  // onRestorePlan: the payload it read and the day the pen opened. It runs
  // only after the restore guard has seen the version and its batches.
  function restorePlan(payload, penOpenedAt) {
    versionPen.restore(payload);
    penOpenedAtRef.current = penOpenedAt;
    setVersionSaveAction(null);
    versionSaveLockRef.current = false;
    setMode('developing');
  }

  return {
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
  };
}
