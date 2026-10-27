// Pure. No framework, no DOM, no store import. The unsaved pen's draft as it
// is kept between visits (04-09, D-14 to D-16): the record's shape, the one
// builder that makes it, and the check that decides whether a stored draft
// still fits the version it was kept on. RecipePage reads and writes the
// record through the repository seam; nothing here knows the store exists.
//
// A draft is keyed by its version id (one open pen per version) and holds one
// of the page's three pens: `plan` (the Next version pen's penDraft), `record`
// (a new batch's record draft) or `amend` (Correct: a stored batch's draft
// plus the baseline it was filled from). Tasting is a section of the record
// draft, not a pen of its own (03.3.1-02).
//
// A fourth kind, `create`, is the half-made first version of a new recipe
// (Phase 9, D-18). It belongs to no stored version, so it has its own fit
// check, draftMatchesCreate, which takes neither a version nor batches.
//
// A fifth kind, `edit`, is the create payload of an already saved first version
// (Phase 11, D-02), kept under that version's id. It is a sibling of `create`:
// the same payload, its own fit check, draftMatchesEdit, and no creation rule
// ever matches it. draftFamily names whose a version's one draft key is.
import { STOPS } from './axes.js';
import { SEGMENT_OPTIONS, MARK_ONE_OPTIONS } from './battery.js';
import { SCALE_KINDS, MAX_RECIPE_SCALES, MAX_RECIPE_PROBLEMS, coreScaleDefinitions, problemNames } from './catalog.js';
import { RESERVED_ROW_IDS } from './versionRow.js';

export const DRAFT_SHAPE_VERSION = 1;

// The record draft's field names and the kind of value each holds, in the
// order blankRecordDraft (RecipePage.jsx) builds them. RecipePage.drafts.test
// pins the two lists equal, so a field added to one cannot be forgotten here.
const RECORD_DRAFT_FIELD_TYPES = {
  churnDate: 'string',
  asMade: 'object',
  stepChanges: 'object',
  outOfMachineTempC: 'string',
  churnDurationMinutes: 'string',
  exitConsistency: 'string',
  airiness: 'string',
  atDraw: 'string',
  atTheMachine: 'string',
  ingredientNotes: 'string',
  nextTimeNote: 'string',
  tastingOpen: 'boolean',
  tastedDate: 'string',
  temperingMinutes: 'string',
  tastingTempC: 'string',
  marks: 'object',
  note: 'string',
  defects: 'array',
  declaredDefects: 'array',
  fromFreezer: 'string',
  meltTestG: 'string',
  meltStyle: 'string',
};

export const RECORD_DRAFT_KEYS = Object.keys(RECORD_DRAFT_FIELD_TYPES);

const KINDS = ['plan', 'record', 'amend', 'create', 'edit'];
const AMEND_OPENERS = ['correct', 'record-a-tasting'];

// The keys that change an object's prototype or reach its constructor when a
// stored object is later merged or written by key (T-03-10, T-04-23).
const UNSAFE_KEYS = ['__proto__', 'constructor', 'prototype'];

/**
 * buildDraftRecord({ versionId, kind, payload, amendingBatchId, amendBaseline,
 * amendOpener, penOpenedAt, now }) -> the record the drafts store keeps.
 * payload and the baseline are structuredCloned, so a later edit to the live
 * draft can never reach back into a record already handed to the store.
 * `now` is the caller's instant (this module stays deterministic).
 */
export function buildDraftRecord({
  versionId,
  kind,
  payload,
  amendingBatchId = null,
  amendBaseline = null,
  amendOpener = 'correct',
  penOpenedAt = null,
  now,
}) {
  return {
    shapeVersion: DRAFT_SHAPE_VERSION,
    versionId,
    kind,
    payload: structuredClone(payload),
    amendingBatchId,
    amendBaseline: amendBaseline === null ? null : structuredClone(amendBaseline),
    amendOpener,
    penOpenedAt,
    updatedAt: now,
  };
}

/**
 * newestDraft(records) -> the record with the greatest updatedAt (a plain ISO
 * string comparison, the way lastEvent.js compares), or null for none. Home's
 * lead is the recipe holding this one.
 */
export function newestDraft(records) {
  let newest = null;
  for (const record of records) {
    if (newest === null || record.updatedAt > newest.updatedAt) newest = record;
  }
  return newest;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function ownKeys(value) {
  return Object.keys(value);
}

function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

// True when any object anywhere inside `value` has an own key that could
// reach a prototype. Walks arrays and objects; a visited set keeps a cyclic
// stored value (structured clone permits one) from looping.
function carriesUnsafeKey(value, seen = new Set()) {
  if (value === null || typeof value !== 'object') return false;
  if (seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) return value.some((item) => carriesUnsafeKey(item, seen));
  return ownKeys(value).some((key) => UNSAFE_KEYS.includes(key) || carriesUnsafeKey(value[key], seen));
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

// A record draft (or an amend baseline, which has the same shape) fits when
// it has exactly the record draft's fields, each of the kind blankRecordDraft
// gives it, and its keyed maps name only rows this version has and the mark
// keys in `markKeys`.
function fitsRecordShape(candidate, version, markKeys) {
  if (!isPlainObject(candidate)) return false;
  const keys = ownKeys(candidate);
  if (keys.length !== RECORD_DRAFT_KEYS.length) return false;
  for (const key of RECORD_DRAFT_KEYS) {
    if (!has(candidate, key)) return false;
    const value = candidate[key];
    const kind = RECORD_DRAFT_FIELD_TYPES[key];
    if (kind === 'string' && typeof value !== 'string') return false;
    if (kind === 'boolean' && typeof value !== 'boolean') return false;
    if (kind === 'object' && !isPlainObject(value)) return false;
    if (kind === 'array' && !isStringArray(value)) return false;
  }
  const rowsById = new Map(version.rows.map((row) => [row.id, row]));
  for (const rowId of ownKeys(candidate.asMade)) {
    const row = rowsById.get(rowId);
    const values = candidate.asMade[rowId];
    if (!row || !isStringArray(values) || values.length > row.portions.length) return false;
  }
  for (const axisKey of ownKeys(candidate.marks)) {
    if (!markKeys.includes(axisKey) || !STOPS.includes(candidate.marks[axisKey])) return false;
  }
  return ownKeys(candidate.stepChanges).every((stepKey) => isPlainObject(candidate.stepChanges[stepKey]));
}

// The values Save would write must be ones the pen offers and the import
// check (validateTasting, validateBatch in store/transfer.js) accepts: the
// choice words, the defect chips, declared problems the recipe declares (each
// once), and marks only on axes the pen shows. A blank string fits every
// choice field. `allowed` is { flaws, markKeys, defects }: the declared
// problems, every mark key the pen shows and the core problem words, which the
// caller reads from the catalog (a record draft) or the batch's own snapshot
// (a Correct draft).
function fitsRecordValues(candidate, allowed) {
  for (const [field, options] of Object.entries(SEGMENT_OPTIONS)) {
    if (candidate[field] !== '' && !options.includes(candidate[field])) return false;
  }
  for (const field of ['atDraw', 'fromFreezer']) {
    if (candidate[field] !== '' && !MARK_ONE_OPTIONS.includes(candidate[field])) return false;
  }
  if (!candidate.defects.every((chip) => allowed.defects.includes(chip))) return false;
  if (!candidate.declaredDefects.every((word) => allowed.flaws.includes(word))) return false;
  if (new Set(candidate.declaredDefects).size !== candidate.declaredDefects.length) return false;
  return ownKeys(candidate.marks).every((axisKey) => allowed.markKeys.includes(axisKey));
}

// The declared problems and declared scale keys of `source`, a version or a
// batch's snapshot, read without throwing when either list is absent or not a
// list.
function declaredOf(source) {
  const flaws = Array.isArray(source?.declaredFlaws) ? source.declaredFlaws : [];
  const declaredAxes = Array.isArray(source?.declaredAxes) ? source.declaredAxes : [];
  return { flaws, declaredKeys: declaredAxes.map((scale) => scale?.key) };
}

// What a record draft may name: the catalog's core scale keys and problem words
// plus the version's declared scales and problems (D-02). A record draft is the
// one kind that reads the catalog, so a missing one is a caller bug.
function allowedFromCatalog(version, catalog) {
  if (!catalog || !Array.isArray(catalog.scales) || !Array.isArray(catalog.problems)) {
    throw new TypeError('draftMatchesVersion needs the catalog (its scales and problems) to check a record draft');
  }
  const { flaws, declaredKeys } = declaredOf(version);
  const coreKeys = coreScaleDefinitions(catalog.scales).map((scale) => scale.key);
  return { flaws, markKeys: [...coreKeys, ...declaredKeys], defects: problemNames(catalog.problems) };
}

// What a Correct draft may name: only what the corrected batch's own snapshot
// holds (D-03a), so a later change to the tables never makes a draft of that
// batch stop fitting.
function allowedFromSnapshot(snapshot) {
  const { flaws, declaredKeys } = declaredOf(snapshot);
  const coreScales = Array.isArray(snapshot?.coreScales) ? snapshot.coreScales : [];
  const defects = Array.isArray(snapshot?.coreProblems) ? snapshot.coreProblems : [];
  return { flaws, markKeys: [...coreScales.map((scale) => scale?.key), ...declaredKeys], defects };
}

function fitsMethodStep(step) {
  if (!isPlainObject(step)) return false;
  if (typeof step.leadIn !== 'string' || typeof step.instruction !== 'string') return false;
  if (step.uses !== undefined && !isStringArray(step.uses)) return false;
  if (step.targets !== undefined && !(Array.isArray(step.targets) && step.targets.every(isPlainObject))) return false;
  return true;
}

// noteOrigins is written only by removePenNote: per list, one integer per
// surviving note, each pointing at a note in the version's own list. Absent is
// fine (no removal yet, or a draft kept before noteOrigins). Anything else must
// name only lists the version holds and give one in-range origin per draft
// note, or setPenNoteText reads past the version's list. Positions are walked
// by index, never with every/some, because those skip the holes of a sparse
// array. Mark's List bug-kept-draft-note-origins-unchecked.
function fitsNoteOrigins(payload, version) {
  if (payload.noteOrigins === undefined) return true;
  if (!isPlainObject(payload.noteOrigins)) return false;
  for (const listKey of ownKeys(payload.noteOrigins)) {
    if (!has(version.authored, listKey) || !Array.isArray(version.authored[listKey])) return false;
    if (!has(payload.authored, listKey) || !Array.isArray(payload.authored[listKey])) return false;
    const origins = payload.noteOrigins[listKey];
    if (!Array.isArray(origins) || origins.length !== payload.authored[listKey].length) return false;
    for (let i = 0; i < origins.length; i += 1) {
      const origin = origins[i];
      if (!Number.isInteger(origin) || origin < 0 || origin >= version.authored[listKey].length) return false;
    }
  }
  return true;
}

// A plan draft (the Next version pen's penDraft) fits when its text fields
// are strings, it holds exactly this version's rows (each with this many
// lines), exactly this version's steps, a note list the pen can read, and,
// when it carries noteOrigins, origins the pen can follow (fitsNoteOrigins).
function fitsPlanShape(payload, version) {
  if (!isPlainObject(payload)) return false;
  for (const field of ['versionLabel', 'reason', 'sheetTitle', 'sheetDescription']) {
    if (typeof payload[field] !== 'string') return false;
  }
  if (payload.citedBatchId !== null && typeof payload.citedBatchId !== 'string') return false;

  if (!isPlainObject(payload.rows)) return false;
  const rowIds = ownKeys(payload.rows);
  if (rowIds.length !== version.rows.length) return false;
  for (const row of version.rows) {
    if (!has(payload.rows, row.id)) return false;
    const draftRow = payload.rows[row.id];
    if (!isPlainObject(draftRow) || !Array.isArray(draftRow.portions)) return false;
    if (draftRow.portions.length !== row.portions.length) return false;
    const portionsFit = draftRow.portions.every(
      (portion) => isPlainObject(portion) && typeof portion.grams === 'string' && typeof portion.removed === 'boolean',
    );
    if (!portionsFit) return false;
  }

  if (!Array.isArray(payload.method) || payload.method.length !== version.method.length) return false;
  if (!payload.method.every(fitsMethodStep)) return false;
  const draftSteps = payload.method.map((step) => step.n);
  if (new Set(draftSteps).size !== draftSteps.length) return false;
  if (!version.method.every((step) => draftSteps.includes(step.n))) return false;

  const notes = isPlainObject(payload.authored) ? payload.authored.beforeYouStart : undefined;
  if (!(Array.isArray(notes) && notes.every((note) => isPlainObject(note) && typeof note.text === 'string'))) return false;
  return fitsNoteOrigins(payload, version);
}

/**
 * draftMatchesVersion(record, version, batches, catalog) -> whether a stored
 * draft can be restored onto `version` (`batches` are that version's own;
 * `catalog` is the { scales, problems } the app read at boot). False unless
 * the shape version matches, the kind is plan, record or amend, no object
 * anywhere in the record has an own `__proto__`, `constructor` or `prototype`
 * key, and the payload fits the version: a plan payload holds exactly the
 * version's rows and steps, and its noteOrigins, when present, names only
 * lists the version holds and gives one in-range origin per draft note (else
 * the pen's next note edit would read past the version's list); a record or
 * amend payload holds exactly the record draft's fields and keys only the
 * version's rows and axes; an amend draft also names one of `batches` and
 * carries a baseline of the same shape.
 * The payload's values must also be ones the pen offers and Save could store
 * (WR-04): a record payload is read against the catalog's core scales and
 * problems plus the version's declared ones, a Correct payload against the
 * corrected batch's own snapshot (its core scales, declared scales and core
 * problems), never the catalog. A plan draft reads neither, so the catalog may
 * be left out for a plan or Correct draft; a record draft with none throws a
 * TypeError (a caller bug, not a draft that does not fit, so the restore's
 * catch ends the restore and keeps the draft).
 * A draft saved before an import replaced its version fails here, and the page
 * deletes it quietly instead of throwing in isPenDraftDirty.
 */
export function draftMatchesVersion(record, version, batches, catalog) {
  if (!isPlainObject(record) || !isPlainObject(version)) return false;
  if (record.shapeVersion !== DRAFT_SHAPE_VERSION) return false;
  // A create draft belongs to no stored version: its own check is
  // draftMatchesCreate. Refused here by name, so the recipe page's restore and
  // Home's draft filter can never act on one, even when its versionId happens
  // to equal a stored version's id.
  // An edit draft is refused the same way, by name: it is a creation payload kept
  // under a version's id.
  if (record.kind === 'create' || record.kind === 'edit') return false;
  if (!KINDS.includes(record.kind)) return false;
  if (record.versionId !== version.id) return false;
  if (carriesUnsafeKey(record)) return false;
  if (record.penOpenedAt !== null && typeof record.penOpenedAt !== 'string') return false;
  if (typeof record.updatedAt !== 'string') return false;

  if (record.kind === 'plan') return fitsPlanShape(record.payload, version);

  if (record.kind === 'record') {
    const allowed = allowedFromCatalog(version, catalog);
    if (!fitsRecordShape(record.payload, version, allowed.markKeys)) return false;
    if (record.amendingBatchId !== null || record.amendBaseline !== null) return false;
    return fitsRecordValues(record.payload, allowed);
  }

  if (!AMEND_OPENERS.includes(record.amendOpener)) return false;
  if (typeof record.amendingBatchId !== 'string') return false;
  const amended = batches.find((batch) => batch.id === record.amendingBatchId);
  if (!amended) return false;
  const allowed = allowedFromSnapshot(amended.snapshot);
  if (!fitsRecordShape(record.payload, version, allowed.markKeys)) return false;
  // The baseline keeps the shape-only check: it is the comparison the dirty
  // check reads and is never written, while WR-04 is about what Save writes.
  if (!fitsRecordShape(record.amendBaseline, version, allowed.markKeys)) return false;
  return fitsRecordValues(record.payload, allowed);
}

// ---------------------------------------------------------------------------
// The create kind (Phase 9, D-18).
//
// A create draft is the whole first version of a new recipe as typed, kept
// before any version exists. Steps are in it because Phase 11 adds them before
// the first Save while MAKE-11 keeps a half-made recipe across a closed tab in
// both phases; settling the keys now means Phase 10 and Phase 11 fill fields
// that exist and add none (criterion 2: nothing creation stores changes shape
// after Phase 9). Machine and process are left out because the creation editor
// offers neither (Mark, 2026-10-18: MAKE-09, decide-p9-pasteurise-fields;
// equipment belongs to churning a batch). The version's equipment and process
// slots stay stored; a later phase that wants them in creation adds an
// optional key.
//
// The check accepts any half-made state. Saved-record validity (isScaleDefinition,
// unique problem words, parsed grams, a scale key that is no core key, a
// portion's step and a step's uses that resolve) is Save's job in Phase 11,
// because a failed restore deletes the whole draft and a maker must never lose
// one for being incomplete.
//
// A row keeps its library link and its grams as typed, never the copied
// figures: the version copies the figures when it is stored (LIB-08).
//
// The method is the creation's own issued-key ledger, as a version's is
// (stepKeys.js header): nextStepKey reads the highest n left, so a step
// spliced out and then a step added would reissue its key. A step removed
// while creating therefore stays in the method with removed: true and the
// editor never shows it, unless Phase 11's discussion with Mark chooses a
// watermark, which it adds as an optional key.
//
// The cost of a later change: draftMatchesCreate refuses an unknown key and a
// value that fails its field's check, and the hook's restore deletes a draft
// that does not fit. A new optional key leaves every kept create draft fitting
// (an absent optional field reads as its blank value). A renamed, removed or
// newly required key, or a narrowed check, makes every create draft kept
// before the change fail at its next restore, and the restore deletes it. What
// is lost is at most a half-made creation kept on that device, never a saved
// recipe, version or batch. CREATE_DRAFT_KEYS is pinned by draft.test.js, so
// a payload change is Mark's decision.

function isNonEmptyString(value) {
  return typeof value === 'string' && value !== '';
}

function isString(value) {
  return typeof value === 'string';
}

function isSafeName(value) {
  return isNonEmptyString(value) && !UNSAFE_KEYS.includes(value);
}

// The bands a version's targets can hold (the olive oil version's own keys,
// plus sugar, which a sheet may leave without a band, D-10).
const CREATE_BAND_KEYS = ['pac', 'pod', 'fat', 'msnf', 'sugar', 'solids'];

function isUniqueBy(items, pick) {
  const seen = new Set();
  for (const item of items) {
    const key = pick(item);
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}

function hasExactKeys(value, keys) {
  const own = ownKeys(value);
  return own.length === keys.length && keys.every((key) => has(value, key));
}

function fitsCreateNotes(value) {
  return Array.isArray(value) && value.every((note) => isPlainObject(note) && typeof note.text === 'string');
}

function fitsCreatePortion(portion) {
  return (
    isPlainObject(portion) &&
    hasExactKeys(portion, ['step', 'grams']) &&
    Number.isSafeInteger(portion.step) &&
    portion.step > 0 &&
    typeof portion.grams === 'string'
  );
}

function fitsCreateRow(row) {
  if (!isPlainObject(row) || !hasExactKeys(row, ['id', 'libraryId', 'portions'])) return false;
  if (!isNonEmptyString(row.id) || RESERVED_ROW_IDS.has(row.id)) return false;
  if (!isSafeName(row.libraryId)) return false;
  return Array.isArray(row.portions) && row.portions.every(fitsCreatePortion) && isUniqueBy(row.portions, (portion) => portion.step);
}

function fitsCreateRows(value) {
  return Array.isArray(value) && value.every(fitsCreateRow) && isUniqueBy(value, (row) => row.id);
}

function fitsCreateStep(step) {
  if (!fitsMethodStep(step)) return false;
  if (!Number.isSafeInteger(step.n) || step.n <= 0) return false;
  return step.removed === undefined || typeof step.removed === 'boolean';
}

function fitsCreateMethod(value) {
  return Array.isArray(value) && value.every(fitsCreateStep) && isUniqueBy(value, (step) => step.n);
}

// A scale draft has the definition's six keys, but its words may be blank and
// its kind may be unchosen: isScaleDefinition is the saved record's check.
function fitsCreateScale(scale) {
  if (!isPlainObject(scale) || !hasExactKeys(scale, ['key', 'name', 'low', 'high', 'kind', 'group'])) return false;
  if (!isSafeName(scale.key)) return false;
  if (![scale.name, scale.low, scale.high].every(isString)) return false;
  if (scale.kind !== '' && !SCALE_KINDS.includes(scale.kind)) return false;
  return scale.group === 'declared';
}

function fitsCreateScales(value) {
  return (
    Array.isArray(value) && value.length <= MAX_RECIPE_SCALES && value.every(fitsCreateScale) && isUniqueBy(value, (scale) => scale.key)
  );
}

function fitsCreateProblems(value) {
  return Array.isArray(value) && value.length <= MAX_RECIPE_PROBLEMS && value.every(isString);
}

function fitsCreateStyle(value) {
  return value === null || isNonEmptyString(value);
}

function fitsCreateTargets(value) {
  if (!isPlainObject(value)) return false;
  return ownKeys(value).every((band) => {
    const range = value[band];
    return CREATE_BAND_KEYS.includes(band) && Array.isArray(range) && range.length === 2 && range.every(isString);
  });
}

// The create payload's field table: one check per field, in the order
// blankCreateDraft builds them. draft.test.js pins CREATE_DRAFT_KEYS,
// blankCreateDraft's keys and the payload contract's thirteen names equal.
const CREATE_DRAFT_FIELD_CHECKS = {
  recipeId: isNonEmptyString,
  versionId: isNonEmptyString,
  name: isString,
  description: isString,
  versionLabel: isString,
  beforeYouStart: fitsCreateNotes,
  rows: fitsCreateRows,
  method: fitsCreateMethod,
  scales: fitsCreateScales,
  problems: fitsCreateProblems,
  style: fitsCreateStyle,
  targets: fitsCreateTargets,
  // The target serving temperature in degrees C as typed, '' when empty. The
  // picked style fills it and Clear empties it (D-19); Phase 11's Save parses
  // it into the version's serveTempC.
  serveTempC: isString,
};

export const CREATE_DRAFT_KEYS = Object.keys(CREATE_DRAFT_FIELD_CHECKS);

const CREATE_REQUIRED_KEYS = ['recipeId', 'versionId', 'name'];

// The one fit check the create and the edit kinds share: the create payload, held
// to the record's kind.
function fitsCreationRecord(record, kind) {
  if (!isPlainObject(record)) return false;
  if (record.shapeVersion !== DRAFT_SHAPE_VERSION) return false;
  if (record.kind !== kind) return false;
  if (!isNonEmptyString(record.versionId)) return false;
  if (typeof record.updatedAt !== 'string') return false;
  if (carriesUnsafeKey(record)) return false;
  const { payload } = record;
  if (!isPlainObject(payload)) return false;
  if (!CREATE_REQUIRED_KEYS.every((key) => has(payload, key))) return false;
  for (const key of ownKeys(payload)) {
    if (!has(CREATE_DRAFT_FIELD_CHECKS, key) || !CREATE_DRAFT_FIELD_CHECKS[key](payload[key])) return false;
  }
  return payload.versionId === record.versionId;
}

/**
 * draftMatchesCreate(record) -> whether a stored draft is a create draft the
 * creation editor can restore. False unless the shape version matches, the
 * kind is create, versionId is a non-empty string, updatedAt is a string, no
 * object anywhere in the record has an own `__proto__`, `constructor` or
 * `prototype` key, and the payload holds only CREATE_DRAFT_KEYS, each passing
 * its check, with payload.versionId equal to the record's. A name alone fits.
 * It needs no version and no batches.
 */
export function draftMatchesCreate(record) {
  return fitsCreationRecord(record, 'create');
}

/**
 * draftMatchesEdit(record) -> whether a stored draft is an edit draft: the
 * create payload of a saved first version, kept under that version's id
 * (Phase 11, D-02). The same checks as draftMatchesCreate with the kind
 * 'edit'; a create record does not fit it and an edit record does not fit
 * draftMatchesCreate or draftMatchesVersion, so every one-creation rule and
 * every pen restore ignores it.
 */
export function draftMatchesEdit(record) {
  return fitsCreationRecord(record, 'edit');
}

/**
 * draftFamily(kindOrFamily) -> 'pen' for plan, record, amend (and 'pen'
 * itself), 'edit' for edit and 'create' for create; any other value throws a
 * TypeError. A version's one draft key is shared by the pens and the edit,
 * and the store lets neither family write over or delete the other's.
 */
export function draftFamily(kindOrFamily) {
  if (kindOrFamily === 'plan' || kindOrFamily === 'record' || kindOrFamily === 'amend' || kindOrFamily === 'pen') return 'pen';
  if (kindOrFamily === 'edit') return 'edit';
  if (kindOrFamily === 'create') return 'create';
  throw new TypeError(`${JSON.stringify(kindOrFamily)} is not a draft kind`);
}

/**
 * blankCreateDraft({ recipeId, versionId, name }) -> the creation's starting
 * payload: Version name 'Version 1' (MAKE-05), every list empty, no style, no
 * targets and no serve temperature.
 */
export function blankCreateDraft({ recipeId, versionId, name }) {
  return {
    recipeId,
    versionId,
    name,
    description: '',
    versionLabel: 'Version 1',
    beforeYouStart: [],
    rows: [],
    method: [],
    scales: [],
    problems: [],
    style: null,
    targets: {},
    serveTempC: '',
  };
}

function hasInk(text) {
  return typeof text === 'string' && text.trim() !== '';
}

function hasEntries(list) {
  return Array.isArray(list) && list.length > 0;
}

/**
 * isCreateDraftDirty(payload) -> whether the payload departs from
 * blankCreateDraft: a non-blank name or description, a Version name other than
 * 'Version 1' once trimmed (an emptied one included), any list entry, a style,
 * a non-blank targets value or a non-blank serve temperature. An absent
 * optional field reads as its blank default. A blank draft is not kept.
 */
export function isCreateDraftDirty(payload) {
  if (hasInk(payload.name) || hasInk(payload.description)) return true;
  if (payload.versionLabel !== undefined && !(typeof payload.versionLabel === 'string' && payload.versionLabel.trim() === 'Version 1')) {
    return true;
  }
  if ([payload.beforeYouStart, payload.rows, payload.method, payload.scales, payload.problems].some(hasEntries)) return true;
  if (payload.style !== null && payload.style !== undefined) return true;
  if (isPlainObject(payload.targets) && Object.values(payload.targets).some((range) => Array.isArray(range) && range.some(hasInk))) {
    return true;
  }
  return hasInk(payload.serveTempC);
}
