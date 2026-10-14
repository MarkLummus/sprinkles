// Pure. No framework, no DOM, no store import.
// The record pen's draft (recording, correcting and tasting a batch), read and
// checked by pure functions, which RecipePage drives through useRecordDraft
// (Phase 5, D-01).
import { BATTERY_FIELDS, parseMeasuredDraft } from './battery.js';
import { usesListsDiffer } from './penDraft.js';

// The record pen's blocked-date sentence (D-05) — one constant, read from
// both handleSaveBatch (via validateRecordDraft) and the ceremony's own
// hint prop, so the "one state, two renderings" grep (03.3.1-02 Task 2
// acceptance) can never find it typed out a second time.
export const CHURN_DATE_BLOCKED_MESSAGE = 'Enter the date you churned.';

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
  'fromFreezer',
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
      draft.outOfMachineTempC !== '' ||
      draft.churnDurationMinutes !== '' ||
      draft.exitConsistency !== '' ||
      draft.airiness !== '' ||
      draft.atDraw !== '' ||
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
      draft.declaredDefects.length > 0 ||
      draft.fromFreezer !== '' ||
      draft.meltTestG !== '' ||
      draft.meltStyle !== ''
    );
  }
  return (
    draft.churnDate !== baseline.churnDate ||
    draft.outOfMachineTempC !== baseline.outOfMachineTempC ||
    draft.churnDurationMinutes !== baseline.churnDurationMinutes ||
    draft.exitConsistency !== baseline.exitConsistency ||
    draft.airiness !== baseline.airiness ||
    draft.atDraw !== baseline.atDraw ||
    draft.atTheMachine !== baseline.atTheMachine ||
    draft.ingredientNotes !== baseline.ingredientNotes ||
    draft.nextTimeNote !== baseline.nextTimeNote ||
    draft.tastingOpen !== baseline.tastingOpen ||
    draft.tastedDate !== baseline.tastedDate ||
    draft.temperingMinutes !== baseline.temperingMinutes ||
    draft.tastingTempC !== baseline.tastingTempC ||
    draft.note !== baseline.note ||
    usesListsDiffer(draft.declaredDefects, baseline.declaredDefects) ||
    draft.fromFreezer !== baseline.fromFreezer ||
    draft.meltTestG !== baseline.meltTestG ||
    draft.meltStyle !== baseline.meltStyle ||
    marksDiffer(draft.marks, baseline.marks) ||
    usesListsDiffer(draft.defects, baseline.defects) ||
    asMadeMapsDiffer(draft.asMade, baseline.asMade) ||
    stepChangesDiffer(draft.stepChanges, baseline.stepChanges)
  );
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
    declaredDefects: [],
    fromFreezer: '',
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
export function blankRecordDraft() {
  return {
    churnDate: '',
    asMade: {},
    stepChanges: {},
    outOfMachineTempC: '',
    churnDurationMinutes: '',
    exitConsistency: '',
    airiness: '',
    atDraw: '',
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
    outOfMachineTempC: toDraftString(churn.outOfMachineTempC),
    churnDurationMinutes: toDraftString(churn.churnDurationMinutes),
    exitConsistency: churn.exitConsistency ?? '',
    airiness: churn.airiness ?? '',
    atDraw: churn.atDraw ?? '',
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
    declaredDefects: tasting && tasting.declaredDefects ? [...tasting.declaredDefects] : [],
    fromFreezer: tasting ? (tasting.fromFreezer ?? '') : '',
    meltTestG: tasting ? toDraftString(tasting.meltTestG) : '',
    meltStyle: tasting ? (tasting.meltStyle ?? '') : '',
  };
}

// tastingHasInk(draft) -> whether the tasting side of the draft holds
// anything the maker wrote (D-02: "what a save persists is everything the
// record currently holds" — a tasting section open but empty persists no
// tasting at all). Any own-key mark, any picked chip, any ticked declared problem,
// or any non-empty tasting field counts.
export function tastingHasInk(draft) {
  return (
    Object.keys(draft.marks).length > 0 ||
    draft.defects.length > 0 ||
    draft.declaredDefects.length > 0 ||
    draft.fromFreezer !== '' ||
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
    declaredDefects: [...draft.declaredDefects],
    fromFreezer: draft.fromFreezer,
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
    declaredDefects: [...pendingUndo.declaredDefects],
    fromFreezer: pendingUndo.fromFreezer,
    meltTestG: pendingUndo.meltTestG,
    meltStyle: pendingUndo.meltStyle,
  };
}

// removeTastingSection(draft) -> the draft with the tasting section closed and
// every tasting-body field blanked (handleRemoveTasting's state update). The
// churn fields stay. blankTastingFields is private to this module, so the page
// calls this op instead.
export function removeTastingSection(draft) {
  return { ...draft, tastingOpen: false, ...blankTastingFields() };
}
