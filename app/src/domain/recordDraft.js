// Pure. No framework, no DOM, no store import.
// The record pen's draft (recording, correcting and tasting a batch), read and
// checked by pure functions, which RecipePage drives through useRecordDraft
// (Phase 5, D-01).
import { BATTERY_FIELDS, parseMeasuredDraft } from './battery.js';
import { setMark } from './axes.js';
import { formatRecordDate } from './batch.js';
import { parseGramsDraft } from './lineage.js';
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
// objects. The asMade copy below is built with Object.fromEntries over the
// batch's own entries, so a stored row id such as __proto__ becomes an own
// key and never reaches the prototype (T-03-10, WR-01); it mirrors
// buildChurn's own shallow-copy-by-own-keys pattern (domain/batch.js). Exported so 03.3.1-02's Task 3 acceptance
// criteria (the seeded batch's exact pre-filled values) can be asserted
// directly, the same way this file's other pure helpers already are.
export function draftFromBatch(batch) {
  const churn = batch.churn;
  const tasting = batch.tasting;
  const asMade = Object.fromEntries(
    Object.entries(churn.asMade).map(([rowId, values]) => [
      rowId,
      values.map((value) => (value === null ? '' : String(value))),
    ]),
  );
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
// its key entirely. The map is built with Object.fromEntries so a row id
// such as __proto__ stays an own key (WR-01).
export function buildChurnFieldsFromDraft(draft, parsed) {
  const asMade = Object.fromEntries(
    Object.entries(draft.asMade)
      .map(([rowId, rawValues]) => [rowId, rawValues.map((rawValue) => parseGramsDraft(rawValue))])
      .filter(([, parsedValues]) => parsedValues.some((value) => value !== null)),
  );
  return {
    churnDate: draft.churnDate === '' ? null : draft.churnDate,
    asMade,
    stepChanges: draft.stepChanges,
    outOfMachineTempC: parsed.outOfMachineTempC.value,
    churnDurationMinutes: parsed.churnDurationMinutes.value,
    exitConsistency: draft.exitConsistency === '' ? null : draft.exitConsistency,
    airiness: draft.airiness === '' ? null : draft.airiness,
    atDraw: draft.atDraw === '' ? null : draft.atDraw,
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
    declaredDefects: draft.declaredDefects.length > 0 ? draft.declaredDefects : null,
    fromFreezer: draft.fromFreezer === '' ? null : draft.fromFreezer,
    meltTestG: parsed.meltTestG.value,
    meltStyle: draft.meltStyle === '' ? null : draft.meltStyle,
  };
}

// An amendment (completeRecord stamps `changed`; createBatch writes null)
// announces its own date in the read view's Changed vocabulary, not the
// original recording date. The page already shows the version (Mark,
// 2026-10-04), so neither sentence repeats it.
export function batchSavedStatus(record) {
  return record.changed
    ? `changed ${formatRecordDate(record.changed)}`
    : `recorded ${formatRecordDate(record.recordedAt)}`;
}

// The record pen's edits, each a pure (draft, ...args) => draft the hook's
// edit() applies through a functional update (Phase 5, D-06, EDIT-03).

// The one generic setter for every raw-text/date/tasting field the record pen
// holds (03.3.1-02 artifacts: handleChangeRecordField): stores the raw string
// the maker typed, exactly as the as-made column already does, so typed
// precision is never lost to an early Number() coercion — the conversion
// happens once, at save time (buildChurnFieldsFromDraft/
// buildTastingFieldsFromDraft).
export function setRecordField(draft, field, value) {
  return { ...draft, [field]: value };
}

// An axis stop click or a Clear (contract "Axes spec"; 007 line 362): a joined
// group is a radio — a stop always stores the clicked stop, and null clears the
// axis. Every axis lives inside the tasting body.
export function setRecordMark(draft, axisKey, stop) {
  return { ...draft, marks: setMark(draft.marks, axisKey, stop) };
}

// A defect chip's own toggle (contract "Controls spec"): a picked chip
// joins the draft's defects list, an unpicked one leaves it — no
// default ever; a defect is an independent on/off (007 line 428), so a
// second click on the same chip clears it, unlike a stop or segmented
// option.
export function toggleDefect(draft, defect) {
  return {
    ...draft,
    defects: draft.defects.includes(defect)
      ? draft.defects.filter((candidate) => candidate !== defect)
      : [...draft.defects, defect],
  };
}

// A declared problem's toggle (contract "Controls spec"; sketch 010 D26):
// a recipe's own problem word is a presence toggle, not a goldilocks
// axis — membership in the draft's declaredDefects list, flipped the way
// toggleDefect flips a defect chip.
export function toggleDeclaredDefect(draft, word) {
  return {
    ...draft,
    declaredDefects: draft.declaredDefects.includes(word)
      ? draft.declaredDefects.filter((candidate) => candidate !== word)
      : [...draft.declaredDefects, word],
  };
}

// Clearing both the strike and the line for a step removes that step's
// key from the draft entirely (D-13/BATCH1-01): an untouched step must
// never rest at { struck: false, line: null }, which would be
// indistinguishable from a step the maker deliberately marked as
// unchanged — a fact this record never states.
export function setStepChange(draft, stepNumber, patch) {
  const stepChanges = { ...draft.stepChanges };
  const key = String(stepNumber);
  if (!patch.struck && !patch.line) {
    delete stepChanges[key];
  } else {
    stepChanges[key] = { struck: patch.struck, line: patch.line };
  }
  return { ...draft, stepChanges };
}

// Writes one portion's raw string (D-10). A row with no key yet is
// seeded with an array of empty strings the length of that row's own
// portions first, so the array is always aligned with row.portions —
// the same alignment contract asMadeForPortion reads. Once every
// portion of a row is back to an empty string, the row's key is deleted
// entirely — the existing "an empty field means nothing was written"
// rule (D-13/BATCH1-01), applied at the row level as it is today. The map
// is rebuilt with Object.fromEntries rather than written through a stored
// row id, so an id such as __proto__ stays an own key (WR-01, the
// record-side twin of penDraftRow, T-05-04); key order is kept: a rewritten
// row keeps its place and a new row goes last.
export function setAsMadePortion(draft, version, rowId, portionIndex, rawValue) {
  const row = version.rows.find((candidate) => candidate.id === rowId);
  const hadKey = Object.prototype.hasOwnProperty.call(draft.asMade, rowId);
  const existing = hadKey ? draft.asMade[rowId] : null;
  const next = existing ? [...existing] : new Array(row.portions.length).fill('');
  next[portionIndex] = rawValue;
  const cleared = next.every((value) => value === '');
  const entries = [];
  for (const [key, values] of Object.entries(draft.asMade)) {
    if (key !== rowId) entries.push([key, values]);
    else if (!cleared) entries.push([rowId, next]);
  }
  if (!hadKey && !cleared) entries.push([rowId, next]);
  return { ...draft, asMade: Object.fromEntries(entries) };
}

// Add tasting's effect on the draft: the tasting section opens.
export function openTastingSection(draft) {
  return { ...draft, tastingOpen: true };
}

// amendDraftFromBatch(batch, opener) -> the draft handleStartAmending fills
// from the batch. The band's Record a tasting (below 724) opens the same pen
// through the 'record-a-tasting' opener (sketch 011 decision 30, Mark
// 2026-10-02, answer 1; route-recipe-batch.md sections 1 and 6): the Tasting
// section is already open, as if Add tasting had just been pressed. The
// pre-filled draft and its baseline both carry tastingOpen true, so an
// untouched pen is clean until the maker types.
export function amendDraftFromBatch(batch, opener) {
  return opener === 'record-a-tasting'
    ? { ...draftFromBatch(batch), tastingOpen: true }
    : draftFromBatch(batch);
}

// recordFieldsFromDraft(draft, parsed) -> { churnFields, tasting }, the two
// objects createBatch and completeRecord take. A tasting object is assembled
// only when the section is open and holds ink (D-02); a null tasting on
// completeRecord removes a stored one (RESEARCH.md Assumption A3).
export function recordFieldsFromDraft(draft, parsed) {
  return {
    churnFields: buildChurnFieldsFromDraft(draft, parsed),
    tasting: draft.tastingOpen && tastingHasInk(draft) ? buildTastingFieldsFromDraft(draft, parsed) : null,
  };
}
