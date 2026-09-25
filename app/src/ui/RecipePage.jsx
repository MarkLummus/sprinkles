import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { repository } from '../store/repository.js';
import { buildFigures, figureLabelText } from '../domain/figures.js';
import { createBatch, completeRecord, formatRecordDate, sortedBatches } from '../domain/batch.js';
import { BATTERY_FIELDS, parseMeasuredDraft } from '../domain/battery.js';
import { setMark } from '../domain/axes.js';
import { activeRows, activeSteps } from '../domain/rows.js';
import { freshId } from '../domain/id.js';
import {
  createChildVersion,
  saveOverVersion,
  versionsForRecipe,
  blockedSaveMessage,
  blockedSaveRowId,
  parseGramsDraft,
} from '../domain/lineage.js';
import { buildDiff } from '../domain/diff.js';
import { stepsWithStaleAmounts } from '../domain/uses.js';
import { displayNumbers } from '../domain/stepNumbers.js';
import { notebookPath } from './notebookPaths.js';
import { IngredientTable } from './IngredientTable.jsx';
import { Method } from './Method.jsx';
import { FormulationNote } from './FormulationNote.jsx';
import { BasisNote } from './BasisNote.jsx';
import { BatchRow } from './BatchRow.jsx';
import { RecipeBand } from './RecipeBand.jsx';
import { Headnote } from './Headnote.jsx';
import { VersionRow } from './VersionRow.jsx';
import { RecipeHistory } from './RecipeHistory.jsx';
import { PenFoot } from './PenFoot.jsx';
import { DerivedAdvisories } from './DerivedAdvisories.jsx';

// The record pen's blocked-date sentence (D-05) — one constant, read from
// both handleSaveBatch (via validateRecordDraft) and the ceremony's own
// hint prop, so the "one state, two renderings" grep (03.3.1-02 Task 2
// acceptance) can never find it typed out a second time.
export const CHURN_DATE_BLOCKED_MESSAGE = 'Enter the date you churned.';

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

// TASTING_BODY_FIELD_KEYS / isTastingBodyField(field) — the retirement
// scope's own boundary (contract "Feedback and undo lifecycle": "any edit
// inside the tasting body retires a pending undo... never a churn-section
// edit or a Next-time edit"). handleChangeRecordField and
// handleChangeSegment both share one generic setter across the churn/
// tasting line, so this is the one dictionary either reads to decide
// whether the field it was just given retires a pending undo — marks,
// defects, and the declared toggle route through their own dedicated
// handlers and retire unconditionally, so they need no entry here.
const TASTING_BODY_FIELD_KEYS = new Set([
  'tastedDate',
  'temperingMinutes',
  'tastingTempC',
  'note',
  'meltTestG',
  'meltStyle',
]);

export function isTastingBodyField(field) {
  return TASTING_BODY_FIELD_KEYS.has(field);
}

// Two as-made maps compared by key set and, for a shared key, by their
// arrays element-wise (D-10) — the same presence-over-truthiness
// discipline the rest of this file applies: a row present in one draft
// and absent in the other is a difference, and a portion differing at
// any index is a difference, even when the two arrays share the same
// length (Pitfall 5, every value the raw string the maker typed).
function asMadeMapsDiffer(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return true;
  return aKeys.some((key) => {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return true;
    const aValues = a[key];
    const bValues = b[key];
    if (aValues.length !== bValues.length) return true;
    return aValues.some((value, i) => value !== bValues[i]);
  });
}

// The marks map compared by key set and, for a shared key, by its own
// value (03.3.1-03 Task 2 — a Rule 1 fix to the key-count-only check
// 03.3.1-02 shipped, back when no interactive path could ever change a
// mark's value without also changing the key count): once the axes are
// interactive, re-marking Hardness from 2 to 3 must read as ink even
// though the marks object still holds exactly one key.
function marksDiffer(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return true;
  return aKeys.some((key) => !Object.prototype.hasOwnProperty.call(b, key) || a[key] !== b[key]);
}

// The step-changes map compared by key set and by both fields of each
// entry — an untouched step never rests at a key at all (D-13/BATCH1-01),
// so a key-set difference alone is already a real change.
function stepChangesDiffer(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return true;
  return aKeys.some((key) => {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return true;
    return a[key].struck !== b[key].struck || a[key].line !== b[key].line;
  });
}

// D-24's dirty check: true only while the record pen holds ink the maker
// has actually typed. Every field is tested against '' / {} / [] / false
// rather than truthiness (03.3.1-02 Task 1), so a written 0 (a battery
// field read as the string '0') still counts as dirty — matching the
// presence-over-truthiness discipline domain/batch.js already applies to
// the stored record. marks is compared by its own-key count and defects
// by its length (03.3.1-02-PLAN.md Task 1) — no interactive path in this
// plan edits either one, so a key-count/length check is the whole
// discipline this plan exercises; a deep comparison is plan 03/04's to add
// once the tasting section is actually writable.
//
// `baseline` is the draft-shaped object handleStartAmending pre-filled the
// draft from (draftFromBatch below), or null for a fresh recording
// (03-07, T-03-43): comparing an amend draft against blank made it read
// dirty the instant Amend opened, training the maker to dismiss a warning
// that fires on nothing. With a baseline, every field is compared against
// it instead of against blank — the same presence-over-truthiness
// discipline, applied to the record the draft actually started from.
export function isDraftDirty(mode, draft, baseline = null) {
  if (mode !== 'recording' || !draft) return false;
  if (!baseline) {
    return (
      draft.churnDate !== '' ||
      Object.keys(draft.asMade).length > 0 ||
      Object.keys(draft.stepChanges).length > 0 ||
      draft.timeToDrawTempMinutes !== '' ||
      draft.outOfMachineTempC !== '' ||
      draft.churnDurationMinutes !== '' ||
      draft.exitConsistency !== '' ||
      draft.airiness !== '' ||
      draft.atTheMachine !== '' ||
      draft.ingredientNotes !== '' ||
      draft.nextTimeNote !== '' ||
      draft.tastingOpen !== false ||
      draft.tastedDate !== '' ||
      draft.temperingMinutes !== '' ||
      draft.tastingTempC !== '' ||
      Object.keys(draft.marks).length > 0 ||
      draft.note !== '' ||
      draft.defects.length > 0 ||
      draft.bitterDeclared !== false ||
      draft.meltTestG !== '' ||
      draft.meltStyle !== ''
    );
  }
  return (
    draft.churnDate !== baseline.churnDate ||
    draft.timeToDrawTempMinutes !== baseline.timeToDrawTempMinutes ||
    draft.outOfMachineTempC !== baseline.outOfMachineTempC ||
    draft.churnDurationMinutes !== baseline.churnDurationMinutes ||
    draft.exitConsistency !== baseline.exitConsistency ||
    draft.airiness !== baseline.airiness ||
    draft.atTheMachine !== baseline.atTheMachine ||
    draft.ingredientNotes !== baseline.ingredientNotes ||
    draft.nextTimeNote !== baseline.nextTimeNote ||
    draft.tastingOpen !== baseline.tastingOpen ||
    draft.tastedDate !== baseline.tastedDate ||
    draft.temperingMinutes !== baseline.temperingMinutes ||
    draft.tastingTempC !== baseline.tastingTempC ||
    draft.note !== baseline.note ||
    draft.bitterDeclared !== baseline.bitterDeclared ||
    draft.meltTestG !== baseline.meltTestG ||
    draft.meltStyle !== baseline.meltStyle ||
    marksDiffer(draft.marks, baseline.marks) ||
    usesListsDiffer(draft.defects, baseline.defects) ||
    asMadeMapsDiffer(draft.asMade, baseline.asMade) ||
    stepChangesDiffer(draft.stepChanges, baseline.stepChanges)
  );
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
function usesListsDiffer(a = [], b = []) {
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
// A row's draft entry is { portions: [{ step, grams }], removed } (D-01,
// D-02) — dirty if the removed flag differs, or if any portion's raw
// string or step differs from that portion's own value, in order.
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
    const draftRow = penDraft.rows[row.id];
    if (draftRow.removed !== (row.removed ?? false)) return true;
    return row.portions.some((portion, i) => {
      const draftPortion = draftRow.portions[i];
      return draftPortion.grams !== String(portion.grams) || draftPortion.step !== portion.step;
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

// blankTastingFields() -> the tasting side's own blank shape: every
// tasting-body field reset to its own blank/false/empty value. Shared by
// blankRecordDraft below (a fresh record's tasting side) and
// handleRemoveTasting (Remove tasting's own effect on the draft) — one
// dictionary of the tasting body's field names, never duplicated.
function blankTastingFields() {
  return {
    tastedDate: '',
    temperingMinutes: '',
    tastingTempC: '',
    marks: {},
    note: '',
    defects: [],
    bitterDeclared: false,
    meltTestG: '',
    meltStyle: '',
  };
}

// blankRecordDraft() -> the one record draft's fresh shape (03.3.1-02
// artifacts list): every churn and tasting field blank, tastingOpen false.
// The tasting fields ride along even though this plan renders no control
// for them yet (plan 03 opens the tasting section) — so the draft's shape
// never has to change again when that section arrives, and the dirty
// check and the save assembly below already know every field's name.
function blankRecordDraft() {
  return {
    churnDate: '',
    asMade: {},
    stepChanges: {},
    timeToDrawTempMinutes: '',
    outOfMachineTempC: '',
    churnDurationMinutes: '',
    exitConsistency: '',
    airiness: '',
    atTheMachine: '',
    ingredientNotes: '',
    nextTimeNote: '',
    tastingOpen: false,
    ...blankTastingFields(),
  };
}

// draftFromBatch(batch) -> the record draft handleStartAmending pre-fills
// from ("Correct reopens the same pen with everything editable", D-03).
// Every read is an own-property read off the batch's own churn/tasting
// objects — never a computed-key write against a stored key (the T-03-10
// adjacency rule this plan's threat model names) — the asMade copy below
// mirrors buildChurn's own already-reviewed shallow-copy-by-own-keys
// pattern (domain/batch.js). Exported so 03.3.1-02's Task 3 acceptance
// criteria (the seeded batch's exact pre-filled values) can be asserted
// directly, the same way this file's other pure helpers already are.
export function draftFromBatch(batch) {
  const churn = batch.churn;
  const tasting = batch.tasting;
  const asMade = {};
  for (const [rowId, values] of Object.entries(churn.asMade)) {
    asMade[rowId] = values.map((value) => (value === null ? '' : String(value)));
  }
  const toDraftString = (value) => (value == null ? '' : String(value));
  return {
    churnDate: churn.churnDate ?? '',
    asMade,
    stepChanges: structuredClone(churn.stepChanges),
    timeToDrawTempMinutes: toDraftString(churn.timeToDrawTempMinutes),
    outOfMachineTempC: toDraftString(churn.outOfMachineTempC),
    churnDurationMinutes: toDraftString(churn.churnDurationMinutes),
    exitConsistency: churn.exitConsistency ?? '',
    airiness: churn.airiness ?? '',
    atTheMachine: churn.atTheMachine ?? '',
    ingredientNotes: churn.ingredientNotes ?? '',
    nextTimeNote: churn.nextTimeNote ?? '',
    tastingOpen: tasting != null,
    tastedDate: tasting ? (tasting.tastedDate ?? '') : '',
    temperingMinutes: tasting ? toDraftString(tasting.temperingMinutes) : '',
    tastingTempC: tasting ? toDraftString(tasting.tastingTempC) : '',
    marks: tasting ? { ...tasting.marks } : {},
    note: tasting ? (tasting.note ?? '') : '',
    defects: tasting && tasting.defects ? [...tasting.defects] : [],
    bitterDeclared: tasting ? tasting.bitterDeclared === true : false,
    meltTestG: tasting ? toDraftString(tasting.meltTestG) : '',
    meltStyle: tasting ? (tasting.meltStyle ?? '') : '',
  };
}

// tastingHasInk(draft) -> whether the tasting side of the draft holds
// anything the maker wrote (D-02: "what a save persists is everything the
// record currently holds" — a tasting section open but empty persists no
// tasting at all). Any own-key mark, any picked chip, the declared toggle,
// or any non-empty tasting field counts.
export function tastingHasInk(draft) {
  return (
    Object.keys(draft.marks).length > 0 ||
    draft.defects.length > 0 ||
    draft.bitterDeclared === true ||
    draft.tastedDate !== '' ||
    draft.temperingMinutes !== '' ||
    draft.tastingTempC !== '' ||
    draft.note !== '' ||
    draft.meltTestG !== '' ||
    draft.meltStyle !== ''
  );
}

// tastingPayloadFromDraft(draft) -> a plain-object copy of the tasting
// side's own current values (contract "Feedback and undo lifecycle";
// RESEARCH.md A4, "React realization of the carried edges") — never a
// captured DOM reference, so the payload survives the per-arrangement
// axes re-render a breakpoint crossing triggers (the carried
// undo-retired-on-resize edge this plan closes). The threat model's own
// mitigation (T-03.3.1-10): this is the pen's own draft copy, never a
// stored record's raw object.
export function tastingPayloadFromDraft(draft) {
  return {
    tastedDate: draft.tastedDate,
    temperingMinutes: draft.temperingMinutes,
    tastingTempC: draft.tastingTempC,
    marks: { ...draft.marks },
    note: draft.note,
    defects: [...draft.defects],
    bitterDeclared: draft.bitterDeclared,
    meltTestG: draft.meltTestG,
    meltStyle: draft.meltStyle,
  };
}

// restoreDraftFromUndo(draft, pendingUndo) -> the draft with the tasting
// side written back from the undo payload and the section reopened
// (contract's own restore sequence). Pure — the two impure bits of the
// restore (the focus move, the announcement) stay in handleUndoRemove.
// Field-by-field, never a computed key (T-03.3.1-10: the payload is the
// pen's own draft copy, never a stored record's raw object); marks and
// defects are copied again here rather than assigned by reference, so a
// later edit to the restored draft can never reach back into pendingUndo.
export function restoreDraftFromUndo(draft, pendingUndo) {
  return {
    ...draft,
    tastingOpen: true,
    tastedDate: pendingUndo.tastedDate,
    temperingMinutes: pendingUndo.temperingMinutes,
    tastingTempC: pendingUndo.tastingTempC,
    marks: { ...pendingUndo.marks },
    note: pendingUndo.note,
    defects: [...pendingUndo.defects],
    bitterDeclared: pendingUndo.bitterDeclared,
    meltTestG: pendingUndo.meltTestG,
    meltStyle: pendingUndo.meltStyle,
  };
}

// parseAllMeasuredFields(draft) -> { fieldErrors, hasErrors, parsed }.
// Pure: walks BATTERY_FIELDS, parsing each field through
// parseMeasuredDraft. A malformed value's own contract sentence
// (BATTERY_FIELDS' own `error` string, verbatim) lands in fieldErrors;
// `parsed` is every field's own { ok, value }, reused by the save
// assembly below so a field is never parsed twice. 03.3.1-02 Task 1's own
// scope: "if any field is malformed, record per-field errors and abort —
// storing the errors and aborting is enough." The full field-level UI
// wiring (aria-invalid/describedby, the field-error line, focus-on-first-
// invalid) and the churn-date press-to-block (D-05) are Task 2's build.
export function parseAllMeasuredFields(draft) {
  const fieldErrors = {};
  const parsed = {};
  let hasErrors = false;
  for (const field of BATTERY_FIELDS) {
    const result = parseMeasuredDraft(draft[field.key], { signed: field.signed });
    parsed[field.key] = result;
    if (!result.ok) {
      fieldErrors[field.key] = field.error;
      hasErrors = true;
    }
  }
  return { fieldErrors, hasErrors, parsed };
}

// validateRecordDraft(draft) -> { fieldErrors, invalidFieldKey,
// blockedDateMessage, parsed }. Pure (03.3.1-02 Task 2): the record pen's
// one save gate. Every measurement validates first (RESEARCH.md Open
// Question 3), via parseAllMeasuredFields above; only once every
// measurement is clean does the churn date get its own press-to-block
// check (D-05) — the two blocks never fire together, so a sentence and
// its target can never disagree (one traversal). invalidFieldKey names
// the first invalid field in BATTERY_FIELDS order — Object.keys on a
// plain object preserves string-key insertion order, and fieldErrors is
// built by iterating BATTERY_FIELDS in that same order, so the first key
// is the first field the traversal found invalid.
export function validateRecordDraft(draft) {
  const { fieldErrors, hasErrors, parsed } = parseAllMeasuredFields(draft);
  if (hasErrors) {
    return { fieldErrors, invalidFieldKey: Object.keys(fieldErrors)[0], blockedDateMessage: null, parsed };
  }
  const blockedDateMessage = draft.churnDate === '' ? CHURN_DATE_BLOCKED_MESSAGE : null;
  return { fieldErrors: {}, invalidFieldKey: null, blockedDateMessage, parsed };
}

function toTextOrNull(raw) {
  return raw === '' ? null : raw;
}

// buildChurnFieldsFromDraft(draft, parsed) -> the churnFields object
// createBatch/completeRecord both take. `parsed` is
// parseAllMeasuredFields' own per-field result — reused here so a save
// never re-parses a field it has already validated. asMade parses through
// parseGramsDraft exactly as
// the plan pen's own as-made column already does (D-10): a value that
// rule rejects, or a blank portion, becomes null, the same fact as a
// portion never touched; a row whose every portion resolves to null drops
// its key entirely.
export function buildChurnFieldsFromDraft(draft, parsed) {
  const asMade = {};
  for (const [rowId, rawValues] of Object.entries(draft.asMade)) {
    const parsedValues = rawValues.map((rawValue) => parseGramsDraft(rawValue));
    if (parsedValues.some((value) => value !== null)) asMade[rowId] = parsedValues;
  }
  return {
    churnDate: draft.churnDate === '' ? null : draft.churnDate,
    asMade,
    stepChanges: draft.stepChanges,
    timeToDrawTempMinutes: parsed.timeToDrawTempMinutes.value,
    outOfMachineTempC: parsed.outOfMachineTempC.value,
    churnDurationMinutes: parsed.churnDurationMinutes.value,
    exitConsistency: draft.exitConsistency === '' ? null : draft.exitConsistency,
    airiness: draft.airiness === '' ? null : draft.airiness,
    atTheMachine: toTextOrNull(draft.atTheMachine),
    ingredientNotes: toTextOrNull(draft.ingredientNotes),
    nextTimeNote: toTextOrNull(draft.nextTimeNote),
  };
}

// buildTastingFieldsFromDraft(draft, parsed) -> the tastingFields object
// createBatch/completeRecord take when the tasting side holds ink
// (tastingHasInk above decides whether this is even called).
export function buildTastingFieldsFromDraft(draft, parsed) {
  return {
    tastedDate: draft.tastedDate === '' ? null : draft.tastedDate,
    temperingMinutes: parsed.temperingMinutes.value,
    tastingTempC: parsed.tastingTempC.value,
    marks: draft.marks,
    note: toTextOrNull(draft.note),
    defects: draft.defects.length > 0 ? draft.defects : null,
    bitterDeclared: draft.bitterDeclared === true ? true : null,
    meltTestG: parsed.meltTestG.value,
    meltStyle: draft.meltStyle === '' ? null : draft.meltStyle,
  };
}

export function batchSavedStatus(record) {
  return `recorded ${formatRecordDate(record.recordedAt)} against ${record.snapshot.versionLabel}`;
}

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

// The brief's book spread, in semantic regions, each wearing its
// plain-language name. The margin's derived-advisories block (FORM2-02)
// renders nothing visible when the version has none — no placeholder text.
export function RecipePage({ onPageStatus = () => {} }) {
  const { recipeId, versionId, batchId } = useParams();
  const navigate = useNavigate();
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
  const [version, setVersion] = useState(undefined);
  const [versions, setVersions] = useState([]);
  const [batches, setBatches] = useState([]);
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
  const [draft, setDraft] = useState(null);
  // Non-null while `mode === 'recording'` means the pen layer is amending
  // this existing batch's record, rather than recording a new one
  // (task 3, D-06). Amending pre-fills the fields from the batch, never
  // from the version, and saving calls completeRecord, never createBatch.
  const [amendingBatchId, setAmendingBatchId] = useState(null);
  // The draft-shaped object handleStartAmending pre-filled `draft` from
  // (03-07, T-03-43) — the baseline isDraftDirty compares an amend draft
  // against, instead of blank. Cleared everywhere amendingBatchId is
  // cleared, for the same class of reason (T-02-24): a stale baseline left
  // over from a prior amendment would make a fresh recording's own dirty
  // check compare against the wrong record.
  const [amendBaseline, setAmendBaseline] = useState(null);
  // The record pen's own blocked-save state (D-05, contract "Controls
  // spec"): fieldErrors keys a battery field to its own contract sentence;
  // invalidFieldTarget names the first invalid field in BATTERY_FIELDS
  // order plus an attempt counter (WR-01's pattern) so a second
  // consecutive block on the same field still moves focus; blockedDate*
  // are the churn-date press-to-block's own message and attempt counter,
  // read by BOTH ceremonies (D-05: "a sentence beside both save sets");
  // formStatus is the open pen's own form-status live region text,
  // whichever pen is open.
  const [fieldErrors, setFieldErrors] = useState({});
  const [invalidFieldTarget, setInvalidFieldTarget] = useState(null);
  const invalidFieldAttemptRef = useRef(0);
  const [blockedDateMessage, setBlockedDateMessage] = useState(null);
  const [blockedDateAttempt, setBlockedDateAttempt] = useState(null);
  const dateBlockedAttemptRef = useRef(0);
  // Add tasting's own attempt counter (D-01, contract "Focus landings"):
  // the same WR-01 pattern as blockedDateAttempt above, so BatchRow's own
  // focus effect re-fires even on a second press.
  const [addTastingAttempt, setAddTastingAttempt] = useState(null);
  const addTastingAttemptRef = useRef(0);
  const [formStatus, setFormStatus] = useState('');
  const formStatusTimerRef = useRef(null);
  // The tasting-status channel (contract "Feedback and undo lifecycle"):
  // in this build the only announcement it ever carries is "Tasting
  // restored." (Task 2's handleUndoRemove) — the always-visible mode's own
  // two tasting-status strings are never built (Pitfall 6). pendingUndo
  // holds the removed tasting's own values as a plain object (Task 2's
  // restore reads it), or null while no removal is pending — "an undo
  // exists" is exactly pendingUndo !== null.
  const [tastingStatus, setTastingStatus] = useState('');
  const tastingStatusTimerRef = useRef(null);
  // The end-of-record ceremony's own live region (007 @ 109733d line 303;
  // the ninth round, Pattern 5) — the removal toasts' channel, since the
  // toast lives where the action was: TASTING_REMOVED_EMPTY_STATUS and
  // TASTING_REMOVED_DATA_STATUS both write here now, never to formStatus.
  // formStatus stays the open pen's own save/validation channel (line
  // 309), whichever pen is open.
  const [recordStatus, setRecordStatus] = useState('');
  const recordStatusTimerRef = useRef(null);
  const [pendingUndo, setPendingUndo] = useState(null);
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
  const [versionSaveAction, setVersionSaveAction] = useState(null);
  const versionSaveLockRef = useRef(false);
  // The History rail's draft node (03.5-05 Task 2, D-13): the day the
  // pen opened, held in memory only — never stored, cleared wherever the
  // pen closes.
  const penOpenedAtRef = useRef(null);
  // The offending field a blocked save names (critique P1 #3, D-21): the
  // version-line field, or a row's grams field by id — read by
  // IngredientTable and Versions to mark and focus exactly the field
  // blockedSaveMessage's own sentence names, and cleared everywhere
  // blockedMessage is cleared so the two can never point at different
  // fields.
  const [blockedTarget, setBlockedTarget] = useState(null);
  // WR-01's fix (03.1 REVIEW.md, Versions.jsx's half): an incrementing
  // counter, stamped onto blockedTarget on every blocked buildPenFields
  // call, so a second consecutive blocked save on the same field re-fires
  // Headnote's field-focus effect — a value-equal boolean cannot.
  const blockedAttemptRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    repository.getVersion(versionId).then((result) => {
      if (!cancelled) setVersion(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [versionId]);

  useEffect(() => {
    let cancelled = false;
    repository.listBatchesForVersion(versionId).then((result) => {
      if (!cancelled) setBatches(result);
    });
    return () => {
      cancelled = true;
    };
  }, [versionId]);

  // Every stored version, loaded once beside the two effects above — the
  // strip (03-03) and the version-line uniqueness check (D-04) both read
  // this list.
  useEffect(() => {
    let cancelled = false;
    repository.listVersions().then((result) => {
      if (!cancelled) setVersions(result);
    });
    return () => {
      cancelled = true;
    };
  }, [versionId]);

  // The recipe record (03.5-04 Task 1, D-11): the band's own RecipeBand
  // reads name/description from here, not from the version — Rename edits
  // only this record. Keyed on the loaded version's own recipeId (not the
  // route's, though the not-found guard above already proves the two
  // agree by the time this fires) — the same house cancelled-flag pattern
  // citedBatch/parentVersion below already use, so a stale response from
  // an abandoned fetch can never land on the wrong version.
  const [recipe, setRecipe] = useState(undefined);
  useEffect(() => {
    let cancelled = false;
    if (!version) {
      setRecipe(undefined);
      return undefined;
    }
    repository.getRecipe(version.recipeId).then((result) => {
      if (!cancelled) setRecipe(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  // The cited batch this version's lineage line names (route-recipe-version.md
  // § 3): citedBatchId is an id only — the batch itself lives on the
  // parent, never copied onto the child — so its churn date is read once
  // per version here, purely to render the lineage line's date-linked
  // clause.
  const [citedBatch, setCitedBatch] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (!version || !version.citedBatchId) {
      setCitedBatch(null);
      return undefined;
    }
    repository.getBatch(version.citedBatchId).then((result) => {
      if (!cancelled) setCitedBatch(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  // The live parent read (T-03-23, T-03-24): show-changes reads the parent
  // record through the repository at render time, never a copy stored on
  // the child, so a parent saved over afterwards is reflected rather than
  // frozen. Held as null when the version has no parent, or when the read
  // comes back with nothing — either way the toggle is absent and the
  // lineage line still names the parent from the child's own
  // parentVersionLabel snapshot (D-10).
  const [parentVersion, setParentVersion] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (!version || !version.parentVersionId) {
      setParentVersion(null);
      return undefined;
    }
    repository.getVersion(version.parentVersionId).then((result) => {
      if (!cancelled) setParentVersion(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  // Every batch in the store, for the recipe History outline
  // (03.3-06 checkpoint feedback, G-03.3-4): each descendant's "churned"
  // date and its cited batch's date both come out of this one read — one
  // repository.getAllBatches() read, not a query per version, since the
  // realistic range is 1–6 versions per recipe this milestone.
  const [allBatches, setAllBatches] = useState([]);
  useEffect(() => {
    let cancelled = false;
    repository.getAllBatches().then((result) => {
      if (!cancelled) setAllBatches(result);
    });
    return () => {
      cancelled = true;
    };
  }, [versionId]);

  // D-24: leaving the page with unsaved ink uses the browser's own leave
  // warning only, registered while recording or the plan's pen holds a
  // dirty draft, and removed as soon as neither does — no invented dialog,
  // no draft persistence across a reload (that is UX1-02, Phase 4). The
  // tasting pen's own dirty check folded into isDraftDirty above with the
  // tasting pen's retirement (03.3.1-02).
  useEffect(() => {
    if (!isDraftDirty(mode, draft, amendBaseline) && !isPenDraftDirty(mode, penDraft, version)) {
      return undefined;
    }
    const handleBeforeUnload = (event) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [mode, draft, amendBaseline, penDraft, version]);

  // Escape (D-27): closes only an untouched pen, and does nothing at all
  // once the pen holds ink — Cancel is the one exit, so a stray key can
  // never discard a sheet of transcription. Registered on `document`, not
  // the article, so an Escape pressed while focus rests on `body` (the
  // state the critique found batch Cancel leaving behind) still closes
  // the pen. Reads the same two dirty checks the beforeunload guard above
  // already reads — introducing no third notion of dirtiness. An open but
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

  const hasRows = version.rows.length > 0;
  // The clean reading: every reader that is not the pen's own table takes
  // this, with every removed row and step already absent (RESEARCH.md
  // Pattern 2) — a removed row must never reach buildFigures/computeBalance.
  const readingVersion = { ...version, rows: activeRows(version), method: activeSteps(version) };

  // The draft version (route-recipe-version.md § 3, 03-02): built once,
  // from the version the pen opened on with the draft's values applied, so
  // the pen's own table, the cross-flags (uses.js) and buildDiff all read
  // the same object rather than each reassembling it. A row's portions
  // become the draft's portions with each `grams` parsed through
  // parseGramsDraft, falling back to that portion's own stored amount when
  // the string is blank or does not parse — never 0 or NaN, applied per
  // portion. Unfiltered — a removed row or step still appears here,
  // struck, for the pen's own table; readers that want the clean figures
  // filter through activeRows/activeSteps first.
  const draftVersion =
    mode === 'developing' && penDraft
      ? {
          ...version,
          rows: version.rows.map((row) => {
            const draftRow = penDraft.rows[row.id];
            return {
              ...row,
              portions: row.portions.map((portion, i) => {
                const draftPortion = draftRow.portions[i];
                return { step: draftPortion.step, grams: parseGramsDraft(draftPortion.grams) ?? portion.grams };
              }),
              removed: draftRow.removed,
            };
          }),
          method: penDraft.method,
          sheetTitle: penDraft.sheetTitle,
          sheetDescription: penDraft.sheetDescription,
          authored: penDraft.authored,
        }
      : null;

  // While developing, the six rules and the basis note answer live against
  // the maker's typed grams and removed rows (route-recipe-version.md § 3).
  const liveVersion =
    mode === 'developing' && draftVersion
      ? { ...draftVersion, rows: activeRows(draftVersion), method: activeSteps(draftVersion) }
      : readingVersion;

  const figures = buildFigures(liveVersion);
  const focusedFigure = figures.find((figure) => figure.key === focusedFigureKey) ?? null;
  const markedRowIds = focusedFigure?.contributorRowIds ?? [];
  const markedFigureLabel = focusedFigure ? figureLabelText(focusedFigure.label) : '';

  // The show-changes diff (route-recipe-version.md § 3, § 6; D-02, T-03-23):
  // one buildDiff of the version against its live parent — the same
  // function the pen uses against its own baseline — computed once here and
  // threaded into every region (the table, the six rules, the method).
  // Absent whenever the toggle itself would be absent: no parent, the
  // parent record unread, or the parameter not present.
  const changeDiff =
    showingChanges && version.parentVersionId && parentVersion ? buildDiff(version, parentVersion) : null;
  const changeStaleSteps = changeDiff ? stepsWithStaleAmounts(version, parentVersion) : [];

  // The pen's own live diff (critique P1 #2, build gap 1): the draft
  // against the version the plan's pen opened on, computed once here —
  // never in Method, never in FormulationNote — from the same buildDiff
  // the show-changes comparison above already uses. This is what lets the
  // rule heads strike the parent figure and draw the hollow tick while the
  // maker is still typing, and what Method reads instead of computing its
  // own comparison a second time per keystroke (RESEARCH.md Don't
  // Hand-Roll).
  const penDiff = mode === 'developing' && draftVersion ? buildDiff(draftVersion, version) : null;
  const penStaleSteps = penDiff ? stepsWithStaleAmounts(draftVersion, version) : [];

  // The two step-position maps (domain/stepNumbers.js, 03-10), computed
  // once here and threaded to every region that names a step, the same
  // shape changeDiff already follows: one comparison, computed once, so no
  // two regions can derive a different answer. `current` is built from the
  // method the page is showing — the draft's while the pen is open, the
  // version's own otherwise; a removed step is absent from it by
  // construction, so the same call serves the reading state (where the
  // method handed down is already filtered) and the pen/show-changes
  // (where it is not). `baseline` is what a struck or removed step's
  // number comes from: the record the pen opened on (D-03) while
  // developing, or the live parent while showing changes — null wherever
  // neither state applies, and null in show-changes when the parent could
  // not be read, the same condition that already makes the toggle absent.
  const currentStepNumbers = displayNumbers(mode === 'developing' && draftVersion ? draftVersion.method : version.method);
  const baselineStepNumbers = mode === 'developing' ? displayNumbers(version.method) : changeDiff ? displayNumbers(parentVersion.method) : null;

  // The batch this page shows: the one the URL names, or — with no batch
  // named in the URL — the version's most recent batch by churn date,
  // undated last, or null when the version has no batch yet.
  let openBatch = null;
  if (batchId) {
    openBatch = batches.find((batch) => batch.id === batchId) ?? null;
  } else if (batches.length > 0) {
    openBatch = sortedBatches(batches)[0];
  }

  // A plan pen shows batch evidence only after the maker explicitly cites
  // it. The route's open/latest batch remains the reading-state record;
  // it must not masquerade as the draft's provenance while From batch is
  // still "no batch cited".
  const comparisonBatch =
    mode === 'developing' && penDraft?.citedBatchId
      ? batches.find((batch) => batch.id === penDraft.citedBatchId) ?? null
      : null;
  const evidenceBatch = mode === 'developing' ? comparisonBatch : openBatch;
  const comparisonBatchLabel = comparisonBatch
    ? `Compared with batch · ${comparisonBatch.churn.churnDate ? formatRecordDate(comparisonBatch.churn.churnDate) : 'date unknown'}`
    : null;

  // announce(message, { selfClear, target }) -> writes one of the three
  // live regions' text (contract "Feedback and undo lifecycle"): form
  // (the default), tasting — the channel handleUndoRemove's own restore
  // announcement writes to — or record — the end-of-record ceremony's own
  // region, the removal toasts' channel (the ninth round, Pattern 5).
  // Validation and block statuses never self-clear; the tasting/record
  // removal/undo toasts pass selfClear: true and get the guarded
  // five-second clear — it clears only if the text on screen is still the
  // message it wrote, so a newer message is never wiped (RESEARCH.md Code
  // Example 5). All three channels share the one guard shape, each
  // against its own timer ref.
  function announce(message, { selfClear = false, target = 'form' } = {}) {
    if (target === 'tasting') {
      setTastingStatus(message);
      if (tastingStatusTimerRef.current) clearTimeout(tastingStatusTimerRef.current);
      if (selfClear) {
        tastingStatusTimerRef.current = setTimeout(() => {
          setTastingStatus((current) => (current === message ? '' : current));
        }, 5000);
      }
      return;
    }
    if (target === 'record') {
      setRecordStatus(message);
      if (recordStatusTimerRef.current) clearTimeout(recordStatusTimerRef.current);
      if (selfClear) {
        recordStatusTimerRef.current = setTimeout(() => {
          setRecordStatus((current) => (current === message ? '' : current));
        }, 5000);
      }
      return;
    }
    setFormStatus(message);
    if (formStatusTimerRef.current) clearTimeout(formStatusTimerRef.current);
    if (selfClear) {
      formStatusTimerRef.current = setTimeout(() => {
        setFormStatus((current) => (current === message ? '' : current));
      }, 5000);
    }
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
    setAmendingBatchId(null);
    setAmendBaseline(null);
    setDraft(blankRecordDraft());
    setFieldErrors({});
    setInvalidFieldTarget(null);
    setBlockedDateMessage(null);
    setBlockedDateAttempt(null);
    setAddTastingAttempt(null);
    setPendingUndo(null);
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
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setBlockedDateMessage(null);
    setFormStatus('');
    // The retirement scope (contract "Feedback and undo lifecycle"): this
    // generic setter serves both churn fields and tasting-body fields, so
    // it only retires a pending undo when the field it was just given is
    // one of the tasting-body's own (isTastingBodyField, Task 2).
    if (isTastingBodyField(field)) setPendingUndo(null);
    setDraft((prev) => ({ ...prev, [field]: value }));
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
    setBlockedDateMessage(null);
    setFormStatus('');
    // Same retirement boundary as handleChangeRecordField above: only
    // Melt style is a tasting-body field among the three this handler
    // shares (Exit consistency and Airiness are churn-section fields).
    if (isTastingBodyField(field)) setPendingUndo(null);
    setDraft((prev) => ({ ...prev, [field]: value }));
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
    setBlockedDateMessage(null);
    setFormStatus('');
    setPendingUndo(null);
    setDraft((prev) => ({ ...prev, marks: setMark(prev.marks, axisKey, stop) }));
  }

  // The per-axis Clear control (contract "Axes spec", "Feedback and undo
  // lifecycle"): clears the mark and announces "{Axis name} cleared." to
  // form-status — the one path that writes this specific announcement.
  // Focus return to the axis's first stop is AxisMark's own concern (it
  // holds the DOM ref and gates the move on a keyboard activation); this
  // handler owns only state and the announcement. Retires a pending undo
  // unconditionally, same as every other tasting-body edit (Task 2).
  function handleClearAxisMark(axisKey, axisName) {
    setBlockedDateMessage(null);
    setPendingUndo(null);
    setDraft((prev) => ({ ...prev, marks: setMark(prev.marks, axisKey, null) }));
    announce(`${axisName} cleared.`);
  }

  // The per-segment Clear control (007 lines 220, 228, 289, 375-381; Plan
  // 04 wires it): the same shape as handleClearAxisMark above — clears
  // the field and announces "{caption} cleared." to form-status. Same
  // retirement boundary as handleChangeSegment (only Melt style is a
  // tasting-body field among the three).
  function handleClearSegment(field, label) {
    setBlockedDateMessage(null);
    if (isTastingBodyField(field)) setPendingUndo(null);
    setDraft((prev) => ({ ...prev, [field]: '' }));
    announce(`${label} cleared.`);
  }

  // A defect chip's own toggle (contract "Controls spec"): a picked chip
  // joins the draft's defects list, an unpicked one leaves it — no
  // default ever; a defect is an independent on/off (007 line 428), so a
  // second click on the same chip clears it, unlike a stop or segmented
  // option. The defects row is inside the tasting body, so a toggle
  // always retires a pending undo (Task 2).
  function handleChangeDefect(defect) {
    setBlockedDateMessage(null);
    setFormStatus('');
    setPendingUndo(null);
    setDraft((prev) => ({
      ...prev,
      defects: prev.defects.includes(defect)
        ? prev.defects.filter((candidate) => candidate !== defect)
        : [...prev.defects, defect],
    }));
  }

  // The declared-flaw toggle (contract "Controls spec"): Bitter is a
  // presence/severity toggle, not a goldilocks axis — a plain boolean
  // flip, same as every other declared control. Inside the tasting body,
  // so it always retires a pending undo (Task 2).
  function handleToggleBitter() {
    setBlockedDateMessage(null);
    setFormStatus('');
    setPendingUndo(null);
    setDraft((prev) => ({ ...prev, bitterDeclared: !prev.bitterDeclared }));
  }

  // Clearing both the strike and the line for a step removes that step's
  // key from the draft entirely (D-13/BATCH1-01): an untouched step must
  // never rest at { struck: false, line: null }, which would be
  // indistinguishable from a step the maker deliberately marked as
  // unchanged — a fact this record never states.
  function handleChangeStepChange(stepNumber, patch) {
    // A step-change key is never a BATTERY_FIELDS key (WR-03) — nothing
    // of this field's own to clear.
    setBlockedDateMessage(null);
    setFormStatus('');
    setDraft((prev) => {
      const stepChanges = { ...prev.stepChanges };
      const key = String(stepNumber);
      if (!patch.struck && !patch.line) {
        delete stepChanges[key];
      } else {
        stepChanges[key] = { struck: patch.struck, line: patch.line };
      }
      return { ...prev, stepChanges };
    });
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
    setBlockedDateMessage(null);
    setFormStatus('');
    setDraft((prev) => {
      const asMade = { ...prev.asMade };
      const row = version.rows.find((candidate) => candidate.id === rowId);
      const existing = Object.prototype.hasOwnProperty.call(asMade, rowId) ? asMade[rowId] : null;
      const next = existing ? [...existing] : new Array(row.portions.length).fill('');
      next[portionIndex] = rawValue;
      if (next.every((value) => value === '')) {
        delete asMade[rowId];
      } else {
        asMade[rowId] = next;
      }
      return { ...prev, asMade };
    });
  }

  // "Correct" reopens the record pen with everything the record holds in
  // the fields — the churn side and, when the batch carries one, the
  // tasting side too (D-03) — pre-filled from the batch, never from the
  // version (task 3, draftFromBatch above).
  function handleStartAmending(batch) {
    batchSaveLockRef.current = false;
    setBatchSaveAction(null);
    setFocusBatchAttempt(null);
    onPageStatus('');
    const filledDraft = draftFromBatch(batch);
    setDraft(filledDraft);
    // The baseline isDraftDirty compares against (03-07, T-03-43) — a
    // separate clone, not the same object setDraft was just given, so a
    // later edit to draft (always a new object via setDraft's own spread)
    // can never be mistaken for a mutation of the baseline itself.
    setAmendBaseline(structuredClone(filledDraft));
    setAmendingBatchId(batch.id);
    setFieldErrors({});
    setInvalidFieldTarget(null);
    setBlockedDateMessage(null);
    setBlockedDateAttempt(null);
    setAddTastingAttempt(null);
    setPendingUndo(null);
    setTastingStatus('');
    setRecordStatus('');
    setRemoveTastingAttempt(null);
    setRestoreAttempt(null);
    setFormStatus('');
    setMode('recording');
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
    setDraft((prev) => ({ ...prev, tastingOpen: true }));
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
    const hasInk = tastingHasInk(draft);
    setPendingUndo(hasInk ? tastingPayloadFromDraft(draft) : null);
    setDraft((prev) => ({ ...prev, tastingOpen: false, ...blankTastingFields() }));
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
    setDraft((prev) => restoreDraftFromUndo(prev, pendingUndo));
    setPendingUndo(null);
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
    const { fieldErrors: errors, invalidFieldKey, blockedDateMessage: dateMessage, parsed } = validateRecordDraft(draft);

    if (invalidFieldKey !== null) {
      setFieldErrors(errors);
      invalidFieldAttemptRef.current += 1;
      setInvalidFieldTarget({ key: invalidFieldKey, attempt: invalidFieldAttemptRef.current });
      setBlockedDateMessage(null);
      announce(MEASURED_INVALID_STATUS);
      return;
    }
    setFieldErrors({});
    setInvalidFieldTarget(null);

    if (dateMessage) {
      dateBlockedAttemptRef.current += 1;
      setBlockedDateMessage(dateMessage);
      setBlockedDateAttempt(dateBlockedAttemptRef.current);
      announce(CHURN_DATE_BLOCKED_STATUS);
      return;
    }
    setBlockedDateMessage(null);

    batchSaveLockRef.current = true;
    const saveAction = amendingBatchId ? 'amend' : 'new';
    setBatchSaveAction(saveAction);
    announce('');

    let now;
    let churnFields;
    let tasting;
    try {
      now = new Date().toISOString();
      churnFields = buildChurnFieldsFromDraft(draft, parsed);
      tasting = draft.tastingOpen && tastingHasInk(draft) ? buildTastingFieldsFromDraft(draft, parsed) : null;
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
        setBatches((prev) => prev.map((batch) => (batch.id === record.id ? record : batch)));
        setMode('reading');
        setDraft(null);
        setAmendingBatchId(null);
        setAmendBaseline(null);
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
      setBatches((prev) => [...prev, record]);
      setMode('reading');
      setDraft(null);
      setAmendBaseline(null);
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
  // state, writing nothing. This is distinct from D-24's beforeunload
  // warning, which only guards accidental loss on document unload — the
  // brief conflated the two, but they are different requirements (see
  // pen-layer-no-cancel-save-hard-to-find.md). Nothing needs to navigate:
  // the batch on screen is derived from the URL and the loaded batch list,
  // never from the draft, so the page already shows the right thing once
  // mode returns to reading.
  function handleCancelRecording() {
    batchSaveLockRef.current = false;
    setBatchSaveAction(null);
    setFocusBatchAttempt(null);
    onPageStatus('');
    setMode('reading');
    setDraft(null);
    setAmendingBatchId(null);
    setAmendBaseline(null);
    setFieldErrors({});
    setInvalidFieldTarget(null);
    setBlockedDateMessage(null);
    setBlockedDateAttempt(null);
    setAddTastingAttempt(null);
    setPendingUndo(null);
    setTastingStatus('');
    setRecordStatus('');
    setRemoveTastingAttempt(null);
    setRestoreAttempt(null);
    setFormStatus('');
  }

  // Seeds penDraft from the version the pen opened on — a row's own
  // portions mapped to { step, grams }, each grams a string (Pitfall 5),
  // everything else the maker's own to write, never defaulted from the
  // parent (D-10: no default reason, citation, or version line). Never
  // touches draft or amendingBatchId — mode alone still decides which of
  // developing/recording is live; derivePenState above is what now
  // decides availability everywhere else (RESEARCH.md Pattern 4).
  function handleStartDeveloping() {
    const rows = {};
    for (const row of version.rows) {
      rows[row.id] = {
        portions: row.portions.map((portion) => ({ step: portion.step, grams: String(portion.grams) })),
        removed: row.removed ?? false,
      };
    }
    setPenDraft({
      versionLabel: '',
      reason: '',
      citedBatchId: null,
      sheetTitle: version.sheetTitle,
      sheetDescription: version.sheetDescription,
      rows,
      method: structuredClone(version.method),
      authored: structuredClone(version.authored),
    });
    setBlockedMessage(null);
    setBlockedTarget(null);
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
    setMode('reading');
    setPenDraft(null);
    setBlockedMessage(null);
    setBlockedTarget(null);
    setVersionSaveAction(null);
    versionSaveLockRef.current = false;
    penOpenedAtRef.current = null;
    onPageStatus('');
    announce('');
  }

  function handleChangePenField(field, value) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    onPageStatus('');
    announce('');
    setPenDraft((prev) => ({ ...prev, [field]: value }));
  }

  // Writes exactly one portion's raw typed string, leaving every other
  // portion and the removed flag untouched — the pen's amounts edit, the
  // split does not (CONTEXT.md phase boundary).
  function handleChangePenGrams(rowId, portionIndex, value) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      rows: {
        ...prev.rows,
        [rowId]: {
          ...prev.rows[rowId],
          portions: prev.rows[rowId].portions.map((portion, i) =>
            i === portionIndex ? { ...portion, grams: value } : portion,
          ),
        },
      },
    }));
  }

  // Removing sets only the draft row's removed flag — it does not clear
  // the grams and does not touch any step (route-recipe-version.md § 3).
  // The same handler restores: removal never cascades, so this is always
  // the maker's own tap, whether flipping a row's own control or the
  // orphaned-row flag's "remove this row" control.
  function handleTogglePenRowRemoved(rowId) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      rows: { ...prev.rows, [rowId]: { ...prev.rows[rowId], removed: !prev.rows[rowId].removed } },
    }));
  }

  // A step field setter for leadIn/instruction/purpose/aside (03-02):
  // `field` is always one of these four literal strings supplied by this
  // file's own call sites, never a maker-influenced key, so a computed
  // property name here carries no T-02-32 risk.
  function handleChangePenStepField(stepN, field, value) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => (step.n === stepN ? { ...step, [field]: value } : step)),
    }));
  }

  // A target chip's label or value, matched by its index within the
  // step's own targets array rather than by label — a label can itself be
  // mid-edit, so matching by index avoids two chips momentarily colliding
  // on the same label while the maker types.
  function handleChangePenStepTarget(stepN, targetIndex, field, value) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => {
        if (step.n !== stepN) return step;
        const targets = step.targets.map((target, index) => (index === targetIndex ? { ...target, [field]: value } : target));
        return { ...step, targets };
      }),
    }));
  }

  // The step's uses list, written through a filter and a concat
  // (route-recipe-version.md § 3), never a bare bracket write — a
  // different fact from the row's own step allocation, and both are kept.
  function handleTogglePenStepUses(stepN, rowId) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => {
        if (step.n !== stepN) return step;
        const uses = step.uses ?? [];
        const nextUses = uses.includes(rowId) ? uses.filter((id) => id !== rowId) : uses.concat(rowId);
        return { ...step, uses: nextUses };
      }),
    }));
  }

  // Removing sets only the draft step's removed flag — removal never
  // cascades, so this is always the maker's own tap, whether flipping a
  // step's own control or the removed-row cross-flag's "remove this step"
  // control.
  function handleTogglePenStepRemoved(stepN) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => (step.n === stepN ? { ...step, removed: !step.removed } : step)),
    }));
  }

  // An authored note's text, and the inherited-from marker it carries
  // (route-recipe-version.md, "Inherited notes"): the marker persists when
  // the edited text still equals the text this version inherited it with,
  // and clears the instant it differs — computed once, here, so every
  // reader (Authored.jsx included) can read `note.inheritedFrom` directly
  // rather than re-deriving it.
  function handleChangePenNoteText(listKey, index, value) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => {
      const originalNote = version.authored[listKey][index];
      const notes = prev.authored[listKey].map((note, i) =>
        i === index
          ? { ...note, text: value, inheritedFrom: value === originalNote.text ? originalNote.inheritedFrom : null }
          : note,
      );
      return { ...prev, authored: { ...prev.authored, [listKey]: notes } };
    });
  }

  // A note can be removed per note (route-recipe-version.md § 3) — an
  // outright removal from the list, not a struck-in-place flag: an
  // authored note carries no cross-flag concern the way a row or step does.
  function handleRemovePenNote(listKey, index) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      authored: { ...prev.authored, [listKey]: prev.authored[listKey].filter((_, i) => i !== index) },
    }));
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
    const message = blockedSaveMessage(penDraft, version, scopedVersions);
    if (message) {
      setBlockedMessage(message);
      // D-21: the same traversal that named the message also names the
      // row it blocked on, so the two can never disagree (T-03.1-21) — a
      // row id marks and focuses that row's grams field; no row id means
      // the block is the version line's own. blockedAttemptRef increments
      // on every blocked press (WR-01) so a second consecutive block on
      // the same field still moves focus.
      const rowId = blockedSaveRowId(penDraft, version, scopedVersions);
      if (!rowId) announce(VERSION_BLOCKED_STATUS);
      blockedAttemptRef.current += 1;
      setBlockedTarget(
        rowId ? { kind: 'row', rowId, attempt: blockedAttemptRef.current } : { kind: 'versionLine', attempt: blockedAttemptRef.current },
      );
      return null;
    }
    const rows = version.rows.map((row) => {
      const draftRow = penDraft.rows[row.id];
      return {
        ...row,
        portions: row.portions.map((portion, i) => {
          const draftPortion = draftRow.portions[i];
          return { step: draftPortion.step, grams: parseGramsDraft(draftPortion.grams) ?? portion.grams };
        }),
        removed: draftRow.removed,
      };
    });
    return {
      versionLabel: penDraft.versionLabel,
      reason: penDraft.reason.trim() === '' ? null : penDraft.reason,
      citedBatchId: penDraft.citedBatchId,
      rows,
      method: penDraft.method,
      sheetTitle: penDraft.sheetTitle,
      sheetDescription: penDraft.sheetDescription,
      authored: penDraft.authored,
    };
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
      setVersions((prev) => [...prev, child]);
      setMode('reading');
      setPenDraft(null);
      setBlockedMessage(null);
      setBlockedTarget(null);
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
      setVersion(updated);
      setVersions((prev) => prev.map((existing) => (existing.id === updated.id ? updated : existing)));
      setMode('reading');
      setPenDraft(null);
      setBlockedMessage(null);
      setBlockedTarget(null);
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
            openBatch={openBatch}
            onStartRecording={handleStartRecording}
            focusVersionOnMount={focusVersionOnMount}
            versionLineBlockedAttempt={blockedTarget?.kind === 'versionLine' ? blockedTarget.attempt : null}
            versionLineError={blockedTarget?.kind === 'versionLine' ? blockedMessage : null}
          />
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
        />
      </header>

      <div className="notebook-body">
        <div className="notebook-body__sheet">
          <article className="recipe-page" aria-busy={versionSaveAction || batchSaveAction ? 'true' : undefined}>
            <div className="recipe-band">
              <Headnote
                version={version}
                mode={mode}
                penDraft={penDraft}
                onChangePenField={handleChangePenField}
                isSaving={versionSaveAction !== null}
              />
            </div>

            <section className="ingredient-table-region" aria-label="Ingredients">
              <h2 className="region-name">Ingredients</h2>
              {hasRows ? (
                <IngredientTable
                  rows={mode === 'developing' || showingChanges ? version.rows : readingVersion.rows}
                  draftVersion={draftVersion}
                  diff={changeDiff}
                  showingChanges={showingChanges}
                  blockedRowId={blockedTarget?.kind === 'row' ? blockedTarget.rowId : null}
                  blockedRowAttempt={blockedTarget?.kind === 'row' ? blockedTarget.attempt : null}
                  markedRowIds={markedRowIds}
                  markedFigureLabel={markedFigureLabel}
                  mode={mode}
                  draft={draft}
                  penDraft={penDraft}
                  openBatch={evidenceBatch}
                  comparisonBatchLabel={comparisonBatchLabel}
                  steps={mode === 'developing' || showingChanges ? version.method : readingVersion.method}
                  currentStepNumbers={currentStepNumbers}
                  onChangeAsMade={handleChangeAsMade}
                  onChangePenGrams={handleChangePenGrams}
                  onTogglePenRowRemoved={handleTogglePenRowRemoved}
                />
              ) : (
                <p>This version has no ingredient rows.</p>
              )}
            </section>

            <section className="method-region" aria-label="Instructions">
              <Method
                steps={mode === 'developing' || showingChanges ? version.method : readingVersion.method}
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
                beforeYouStart={mode === 'developing' && penDraft ? penDraft.authored.beforeYouStart : version.authored.beforeYouStart}
                onChangeNoteText={handleChangePenNoteText}
                onRemoveNote={handleRemovePenNote}
              />
            </section>

            {/* Column two, what the sheet does not print: the formulation
                note beside the table, then the margin beneath it. One
                flow, so the method's height never separates the two. */}
            <div className="side-region">
              <section className="formulation-note-region" aria-label="Balance">
                <FormulationNote
                  version={liveVersion}
                  mode={mode}
                  diff={mode === 'developing' ? penDiff : changeDiff}
                  onFocusFigure={setFocusedFigureKey}
                  onBlurFigure={() => setFocusedFigureKey(null)}
                />
                <BasisNote version={liveVersion} />
              </section>

              <div className="margin-region">
                <DerivedAdvisories version={liveVersion} />
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
          {mode !== 'developing' && (
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
            onChangeRecordMark={handleChangeRecordMark}
            onClearAxisMark={handleClearAxisMark}
            onChangeDefect={handleChangeDefect}
            onToggleBitter={handleToggleBitter}
            onRemoveTasting={handleRemoveTasting}
            onUndoRemove={handleUndoRemove}
            onAddTasting={handleAddTasting}
            openPen={openPen}
            penReason={penReason}
            onStartAmending={handleStartAmending}
            onCancelRecording={handleCancelRecording}
            onSaveBatch={handleSaveBatch}
          />
          )}
        </aside>
      </div>
    </div>
  );
}
