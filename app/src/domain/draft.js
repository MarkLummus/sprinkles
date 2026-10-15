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
import { AXES, STOPS, axesForVersion } from './axes.js';
import { SEGMENT_OPTIONS, MARK_ONE_OPTIONS, DEFECTS } from './battery.js';

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

const KINDS = ['plan', 'record', 'amend'];
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
// gives it, and its keyed maps name only rows and axes this version has.
function fitsRecordShape(candidate, version) {
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
  const axisKeys = AXES.map((axis) => axis.key);
  for (const axisKey of ownKeys(candidate.marks)) {
    if (!axisKeys.includes(axisKey) || !STOPS.includes(candidate.marks[axisKey])) return false;
  }
  return ownKeys(candidate.stepChanges).every((stepKey) => isPlainObject(candidate.stepChanges[stepKey]));
}

// The values Save would write must be ones the pen offers and the import
// check (validateTasting, validateBatch in store/transfer.js) accepts: the
// choice words, the defect chips, declared problems the recipe declares (each
// once), and marks only on axes the pen shows. A blank string fits every
// choice field. `declared` is { flaws, axisKeys }.
function fitsRecordValues(candidate, declared) {
  for (const [field, options] of Object.entries(SEGMENT_OPTIONS)) {
    if (candidate[field] !== '' && !options.includes(candidate[field])) return false;
  }
  for (const field of ['atDraw', 'fromFreezer']) {
    if (candidate[field] !== '' && !MARK_ONE_OPTIONS.includes(candidate[field])) return false;
  }
  if (!candidate.defects.every((chip) => DEFECTS.includes(chip))) return false;
  if (!candidate.declaredDefects.every((word) => declared.flaws.includes(word))) return false;
  if (new Set(candidate.declaredDefects).size !== candidate.declaredDefects.length) return false;
  return ownKeys(candidate.marks).every((axisKey) => declared.axisKeys.includes(axisKey));
}

// The declared problems and axis keys of `source`, a version or a batch's
// snapshot, read without throwing when either list is absent or not a list.
function declaredOf(source) {
  const flaws = Array.isArray(source?.declaredFlaws) ? source.declaredFlaws : [];
  const declaredAxes = Array.isArray(source?.declaredAxes) ? source.declaredAxes : [];
  return { flaws, axisKeys: axesForVersion({ declaredAxes }).map((axis) => axis.key) };
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
 * draftMatchesVersion(record, version, batches) -> whether a stored draft can
 * be restored onto `version` (`batches` are that version's own). False unless
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
 * (WR-04): a record payload is read against the version's declared problems
 * and axes, a Correct payload against the corrected batch's own snapshot.
 * A draft saved before an import replaced its version fails here, and the page
 * deletes it quietly instead of throwing in isPenDraftDirty.
 */
export function draftMatchesVersion(record, version, batches) {
  if (!isPlainObject(record) || !isPlainObject(version)) return false;
  if (record.shapeVersion !== DRAFT_SHAPE_VERSION) return false;
  if (!KINDS.includes(record.kind)) return false;
  if (record.versionId !== version.id) return false;
  if (carriesUnsafeKey(record)) return false;
  if (record.penOpenedAt !== null && typeof record.penOpenedAt !== 'string') return false;
  if (typeof record.updatedAt !== 'string') return false;

  if (record.kind === 'plan') return fitsPlanShape(record.payload, version);

  if (!fitsRecordShape(record.payload, version)) return false;
  if (record.kind === 'record') {
    if (record.amendingBatchId !== null || record.amendBaseline !== null) return false;
    return fitsRecordValues(record.payload, declaredOf(version));
  }

  if (!AMEND_OPENERS.includes(record.amendOpener)) return false;
  if (typeof record.amendingBatchId !== 'string') return false;
  const amended = batches.find((batch) => batch.id === record.amendingBatchId);
  if (!amended) return false;
  // The baseline keeps the shape-only check: it is the comparison the dirty
  // check reads and is never written, while WR-04 is about what Save writes.
  if (!fitsRecordShape(record.amendBaseline, version)) return false;
  return fitsRecordValues(record.payload, declaredOf(amended.snapshot));
}
