import { useRef, useState } from 'react';
import { penDraftFromVersion, penFieldsFromDraft, penSaveBlock } from '../domain/penDraft.js';

// The version pen's draft (Phase 5, EDIT-02).
//
// D-04: plain useState, no useReducer. The blocked-save reset is written
// once, in clearBlock, and every way the pen's draft changes reaches it.
// D-07: the hook stops at the draft. RecipePage keeps the save locks, the
// page status, the announcer and the repository calls; a creation editor can
// drive this same hook with its own create-and-save.
export function usePenDraft() {
  // The plan's own pen draft (03-CONTEXT.md D-01 to D-10): version line,
  // reason and citation start blank/null — never defaulted from the
  // parent — while sheetTitle/sheetDescription copy the parent's own
  // (03.5-CONTEXT.md decision "Next version copies Sheet title and Sheet
  // description"), and rows is a map keyed by row id holding the raw
  // string the maker typed for grams, the draft.asMade precedent (never
  // Number() on keystroke, so a value typed finer than the display
  // survives, RESEARCH.md Pitfall 5).
  const [penDraft, setPenDraft] = useState(null);
  const [blockedMessage, setBlockedMessage] = useState(null);
  // The offending field a blocked save names (critique P1 #3, D-21): the
  // version-line field, or a row's grams field by id — read by
  // IngredientTable and Versions to mark and focus exactly the field
  // blockedSaveMessage's own sentence names, and cleared everywhere
  // blockedMessage is cleared so the two can never point at different
  // fields.
  const [blockedTarget, setBlockedTarget] = useState(null);
  // WR-01's fix (03.1 REVIEW.md, Versions.jsx's half): an incrementing
  // counter, stamped onto blockedTarget on every blocked checkSave call, so a
  // second consecutive blocked save on the same field re-fires Headnote's
  // field-focus effect — a value-equal boolean cannot. It belongs to the
  // block it accompanies, so it lives here (D-09).
  const blockedAttemptRef = useRef(0);

  function clearBlock() {
    setBlockedMessage(null);
    setBlockedTarget(null);
  }

  // Clears the block, then applies a pure (draft, ...args) => draft op
  // through a functional update, so two edits in one batch both land.
  function edit(op, ...args) {
    clearBlock();
    setPenDraft((prev) => op(prev, ...args));
  }

  // Seeds the draft from the version the pen opened on. Never touches the
  // record draft or the mode; the caller does that (D-12).
  function open(version) {
    setPenDraft(penDraftFromVersion(version));
    clearBlock();
  }

  // Cancel and both saves: the draft goes, and so does any block.
  function close() {
    setPenDraft(null);
    clearBlock();
  }

  // A kept draft read back from the drafts store. The caller has already
  // checked it against the version (draftMatchesVersion, T-05-05).
  function restore(payload) {
    setPenDraft(payload);
    clearBlock();
  }

  // Shared by both save paths. Blocked: sets the message and the target the
  // block names, stamping an attempt that grows on every blocked press, and
  // returns which kind of field it names so the caller can announce a
  // version-line block. Clear: returns the fields the domain constructors
  // take. scopedVersions is the recipe's versions already scoped by the
  // caller (null excludeId for a fresh child, the version's own id for a
  // save-over).
  function checkSave(version, scopedVersions) {
    const block = penSaveBlock(penDraft, version, scopedVersions);
    if (!block) return { blockedKind: null, fields: penFieldsFromDraft(penDraft, version) };
    setBlockedMessage(block.message);
    blockedAttemptRef.current += 1;
    setBlockedTarget({ ...block.target, attempt: blockedAttemptRef.current });
    return { blockedKind: block.target.kind, fields: null };
  }

  return {
    penDraft,
    blockedMessage,
    blockedTarget,
    edit,
    open,
    close,
    restore,
    checkSave,
  };
}
