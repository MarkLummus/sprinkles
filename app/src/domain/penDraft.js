// Pure. No framework, no DOM, no store import.
// The version pen's draft, read and changed by pure functions, which
// RecipePage drives through usePenDraft (Phase 5, D-01).
import { isLineRemoved } from './rows.js';

// A draft row, found by its row id (D-03; closes T-03.6-02). Row ids come
// from stored versions, and an imported file can carry any string, so the
// lookup answers only for an own key of penDraft.rows: an id such as
// '__proto__', 'constructor' or 'toString' is never resolved against
// Object.prototype. Callers add no guard for undefined: penDraft.rows is
// built by Object.fromEntries over the same version.rows every caller
// iterates, and a restored draft must pass draftMatchesVersion, which
// requires an own key for every version row, so an undefined result is
// unreachable through the app.
export function penDraftRow(penDraft, rowId) {
  return Object.prototype.hasOwnProperty.call(penDraft.rows, rowId) ? penDraft.rows[rowId] : undefined;
}

// An absent optional field and an empty-string one are the same fact —
// nothing written — normalised on both sides before comparing, exactly as
// diff.js's buildStepDiff does for the same two fields (03-09, T-03-54): a
// first keystroke into an empty purpose/aside, deleted again, must not
// read as ink.
function normalizedText(value) {
  return value ?? '';
}

// A uses list compared as a set — order is not a fact the maker authored
// (route-recipe-version.md § 3). Reused by isDraftDirty for the record
// pen's own defects list (03.3.1-03 Task 3): picking chips in a different
// order than they were unpicked is the same set, not a difference — the
// same discipline this function already applies to a step's uses.
export function usesListsDiffer(a = [], b = []) {
  if (a.length !== b.length) return true;
  const bSet = new Set(b);
  return a.some((rowId) => !bSet.has(rowId));
}

// Targets compared by position, on both label and value — matching
// handleChangePenStepTarget's own matching rule (by index, not by label).
function targetsDiffer(a = [], b = []) {
  if (a.length !== b.length) return true;
  return a.some((target, index) => target.label !== b[index].label || target.value !== b[index].value);
}

// A step is ink the instant any of its seven writers has moved it: the
// four text fields, its removed flag, its uses list, or a target.
function isStepDirty(draftStep, baseStep) {
  return (
    draftStep.leadIn !== baseStep.leadIn ||
    draftStep.instruction !== baseStep.instruction ||
    normalizedText(draftStep.purpose) !== normalizedText(baseStep.purpose) ||
    normalizedText(draftStep.aside) !== normalizedText(baseStep.aside) ||
    (draftStep.removed ?? false) !== (baseStep.removed ?? false) ||
    usesListsDiffer(draftStep.uses, baseStep.uses) ||
    targetsDiffer(draftStep.targets, baseStep.targets)
  );
}

// An authored list is ink when its length differs or any note's text
// differs at the same index — inheritedFrom is not compared: the page
// derives it from the text (handleChangePenNoteText), so text equality
// already decides it.
function isAuthoredListDirty(draftList, baseList) {
  if (draftList.length !== baseList.length) return true;
  return draftList.some((note, index) => note.text !== baseList[index].text);
}

// The pen's own dirty check (route-recipe-version.md § 6, D-24's
// "unsaved ink" principle carried to the plan's pen): every field tested
// against '' / null / the version's own values, never truthiness, so a
// grams field typed back to the version's own value counts as clean again.
// A row's draft entry is { portions: [{ step, grams, removed }] } (D-01,
// D-02; removal rides on the lines alone, sketch 011 decision 51) — dirty
// if any portion's raw string, step or removed flag differs from that
// portion's own value, in order. A stored older whole-row flag reads as
// every line out (isLineRemoved), the same rule the draft is seeded by.
//
// Extended (03-07, T-03-42) to the three fields the pen spends most of its
// time editing — method, the Sheet title/description, authored — which
// this check omitted entirely: a maker who rewrote a step's prose or an
// authored note and then reloaded lost it with no warning of any kind.
export function isPenDraftDirty(mode, penDraft, version) {
  if (mode !== 'developing' || !penDraft || !version) return false;
  if (penDraft.versionLabel !== '') return true;
  if (penDraft.reason !== '') return true;
  if (penDraft.citedBatchId !== null) return true;
  if (penDraft.sheetTitle !== version.sheetTitle) return true;
  if (penDraft.sheetDescription !== version.sheetDescription) return true;
  const rowsDirty = version.rows.some((row) => {
    const draftRow = penDraftRow(penDraft, row.id);
    return row.portions.some((portion, i) => {
      const draftPortion = draftRow.portions[i];
      return (
        draftPortion.grams !== String(portion.grams) ||
        draftPortion.step !== portion.step ||
        Boolean(draftPortion.removed) !== isLineRemoved(row, portion)
      );
    });
  });
  if (rowsDirty) return true;
  const methodDirty = version.method.some((step) => {
    const draftStep = penDraft.method.find((candidate) => candidate.n === step.n);
    return isStepDirty(draftStep, step);
  });
  if (methodDirty) return true;
  if (isAuthoredListDirty(penDraft.authored.beforeYouStart, version.authored.beforeYouStart)) return true;
  return false;
}

// The orphaned-row flag's "remove this row" acts on every line of the
// row (plan 03.6-02 decision 4): if every line is out it puts every line
// back in, otherwise it takes every line out. Pure — returns a new draft
// row and touches nothing but the lines' removed flags.
export function toggleDraftRowLines(draftRow) {
  const everyOut = draftRow.portions.every((portion) => portion.removed === true);
  return {
    ...draftRow,
    portions: draftRow.portions.map((portion) => ({ ...portion, removed: !everyOut })),
  };
}

// "A pen is open" used to live in two unrelated states — `mode`
// ('reading'|'recording'|'developing') and `tastingDraft` (null|object) —
// and every disabled condition in Headnote and BatchMargin hand-rolled its
// own subset of those two. The tasting pen retires with 03.3.1-02 (D-01,
// D-03): the tasting section folds into the one record draft behind a
// `tastingOpen` flag, so the pens this derivation reports are now exactly
// three — `plan`, `record`, `amend` — never a fourth. `reason` is the
// words-form counterpart D-10 requires beside every control that pen
// disables ("never just visually implied"). An if-chain, not a lookup
// table (T-02-32's discipline against a bare bracket read against a key),
// so the three reason strings stay visible at the site that decides them.
export function derivePenState({ mode, amendingBatchId }) {
  if (mode === 'developing') {
    return { openPen: 'plan', reason: 'the plan is being developed' };
  }
  if (mode === 'recording') {
    if (amendingBatchId) {
      return { openPen: 'amend', reason: 'a batch is being amended' };
    }
    return { openPen: 'record', reason: 'a batch is being recorded' };
  }
  return { openPen: null, reason: null };
}

// Cancel on an open step (sketch 011 decisions_recorded 5, decision 1;
// Task 3, T-03.5-19): the version the pen opened on is the draft's own
// parent, so restoring is a structuredClone of that ONE step, replacing
// the draft's own copy of it — every other step and every other penDraft
// key stay exactly as they were. Pure, so its own immutability is
// unit-tested directly.
export function restoreStepFromVersion(penDraft, version, stepN) {
  const parentStep = version.method.find((step) => step.n === stepN);
  return {
    ...penDraft,
    method: penDraft.method.map((step) => (step.n === stepN ? structuredClone(parentStep) : step)),
  };
}

// A version-line or headnote field, written (handleChangePenField's
// updater). `field` is always a literal name passed by the pen's own
// components (VersionRow and Headnote), never a key the maker types; an
// object-literal computed key creates an own property and never reaches the
// __proto__ setter (T-05-04).
export function setPenField(draft, field, value) {
  return { ...draft, [field]: value };
}
