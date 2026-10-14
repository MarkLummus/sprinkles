import { useState } from 'react';

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

  // Raw setters stay on the return until the other pen handlers have moved
  // onto edit().
  return { penDraft, blockedMessage, blockedTarget, edit, setPenDraft, setBlockedMessage, setBlockedTarget };
}
