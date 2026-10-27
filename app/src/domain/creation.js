// Pure. No framework, DOM, or store import. The creation editor's helpers
// (Phase 10, MAKE-05): the title a nameless creation wears, a stored create
// payload laid over the blank one, and the version-shaped view of a draft the
// shared Sheet reads. The draft is never changed here: every function returns
// new values and copies what it takes from its arguments.

import { stopWordsFor } from './axes.js';
import { MAX_RECIPE_PROBLEMS, MAX_RECIPE_SCALES, SCALE_KINDS } from './catalog.js';
import { blankCreateDraft } from './draft.js';
import { FIGURE_SPECS } from './figures.js';
import { parseGramsDraft } from './lineage.js';
import { liveSteps, rowLines } from './creationSteps.js';
import { rowFromLibraryRecord } from './versionRow.js';

export const UNTITLED = 'Untitled';

/**
 * creationTitle(name) -> UNTITLED when the trimmed name is empty, otherwise
 * the name exactly as typed (D-08c): the Sheet heading, the tab title and the
 * Notebook's draft row all read it.
 */
export function creationTitle(name) {
  return name.trim() === '' ? UNTITLED : name;
}

/**
 * normalizeCreateDraft(payload) -> a new payload: blankCreateDraft's fields
 * with the stored ones laid over them. A stored create draft need only hold
 * recipeId, versionId and name (draftMatchesCreate accepts it), so the editor
 * never reads a payload as it was stored. A row with an empty portions array
 * gets one portion, { step: 1, grams: '' }, the shape the editor writes; every
 * other field and row stays as stored.
 */
export function normalizeCreateDraft(payload) {
  const merged = {
    ...blankCreateDraft({ recipeId: payload.recipeId, versionId: payload.versionId, name: payload.name }),
    ...payload,
  };
  return {
    ...merged,
    rows: merged.rows.map((row) =>
      row.portions.length === 0 ? { ...row, portions: [{ step: 1, grams: '' }] } : { ...row },
    ),
  };
}

function hasWords(value) {
  return typeof value === 'string' && value.trim() !== '';
}

// A typed amount reaches the projection only as a finite number: the parser's
// pattern admits a 309-digit amount that Number reads as Infinity, and
// rowFromLibraryRecord throws on one (D-08). Anything else reads as 0 g.
function finiteGrams(raw) {
  const parsed = parseGramsDraft(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * creationSheetVersion(draft, libraryById = new Map()) -> the version-shaped
 * object the Sheet reads. One description box fills both descriptions (the
 * Sheet's prose and the recipe's), and its targets are the bands both of whose
 * ends read (creationTargets, D-08b). A row is projected through
 * rowFromLibraryRecord with one portion per line it sits on (rowLines): an
 * unplaced row's single portion is written at UNPLACED_STEP, a placed row's at
 * the live steps' keys in method order (D-09, D-12). Each line's grams are
 * parsed with parseGramsDraft and read as 0 g when they do not parse or are
 * not finite (D-08), so a row the maker is still typing stays on the Sheet. A
 * row whose library entry is gone is left out rather than thrown over (the map
 * holds { id, entry } records). The method is the live steps in order: their
 * uses keep only rows that were projected, in the step's own order; a target
 * stays only when its label and value both hold words, and a purpose or aside
 * only when it does (D-10, D-22). A removed step is left out.
 */
export function creationSheetVersion(draft, libraryById = new Map()) {
  const rows = [];
  for (const row of draft.rows) {
    const record = libraryById.get(row.libraryId);
    if (!record) continue;
    const lines = rowLines(draft, row.id);
    const projected = rowFromLibraryRecord(record, {
      id: row.id,
      grams: finiteGrams(lines[0].grams),
      step: lines[0].step,
    });
    rows.push({ ...projected, portions: lines.map(({ step, grams }) => ({ step, grams: finiteGrams(grams) })) });
  }
  const projectedIds = new Set(rows.map((row) => row.id));
  const method = liveSteps(draft).map((step) => {
    const projectedStep = {
      n: step.n,
      leadIn: step.leadIn,
      instruction: step.instruction,
      uses: (step.uses ?? []).filter((id) => projectedIds.has(id)),
      targets: (step.targets ?? [])
        .filter((target) => hasWords(target.label) && hasWords(target.value))
        .map((target) => ({ label: target.label, value: target.value })),
    };
    if (hasWords(step.purpose)) projectedStep.purpose = step.purpose;
    if (hasWords(step.aside)) projectedStep.aside = step.aside;
    return projectedStep;
  });
  return {
    id: draft.versionId,
    recipeId: draft.recipeId,
    sheetTitle: creationTitle(draft.name),
    sheetDescription: draft.description,
    rows,
    method,
    authored: { beforeYouStart: draft.beforeYouStart },
    targets: creationTargets(draft),
  };
}

function assertNoteIndex(draft, index) {
  if (!Number.isInteger(index) || index < 0 || index >= draft.beforeYouStart.length) {
    throw new RangeError(`no Before you start note at index ${index}`);
  }
}

/**
 * addNote(draft) -> a new draft whose Before you start list ends with an empty
 * note (MAKE-08). An empty note stays in the draft; Save's check is Phase 11's.
 */
export function addNote(draft) {
  return { ...draft, beforeYouStart: [...draft.beforeYouStart, { text: '' }] };
}

/**
 * updateNote(draft, index, text) -> a new draft with note `index` reading
 * `text`; every other note is untouched. An index outside the list is a
 * caller bug and throws a RangeError.
 */
export function updateNote(draft, index, text) {
  assertNoteIndex(draft, index);
  return {
    ...draft,
    beforeYouStart: draft.beforeYouStart.map((note, at) => (at === index ? { ...note, text } : note)),
  };
}

/**
 * removeNote(draft, index) -> a new draft without note `index`; the others
 * keep their order. An index outside the list is a caller bug and throws a
 * RangeError.
 */
export function removeNote(draft, index) {
  assertNoteIndex(draft, index);
  return { ...draft, beforeYouStart: draft.beforeYouStart.filter((_note, at) => at !== index) };
}

/**
 * addRow(draft, { rowId, libraryId }) -> a new draft whose rows end with a row
 * linked to that library entry, its one portion's grams empty (MAKE-06, D-05).
 * A row holds its link and its typed grams only, never the entry's figures
 * (D-07). An empty id, or a row id already on the draft, is a caller bug.
 */
export function addRow(draft, { rowId, libraryId }) {
  if (typeof rowId !== 'string' || rowId === '') throw new TypeError('row id must be a non-empty string');
  if (typeof libraryId !== 'string' || libraryId === '') throw new TypeError('library id must be a non-empty string');
  if (draft.rows.some((row) => row.id === rowId)) throw new RangeError(`row ${rowId} is already on the draft`);
  return { ...draft, rows: [...draft.rows, { id: rowId, libraryId, portions: [{ step: 1, grams: '' }] }] };
}

function assertRowId(draft, rowId) {
  if (!draft.rows.some((row) => row.id === rowId)) throw new RangeError(`no row ${rowId} on the draft`);
}

/**
 * setRowGrams(draft, rowId, grams) -> a new draft with that row's grams kept
 * as typed; every other row is untouched. An unknown row id throws a
 * RangeError.
 */
export function setRowGrams(draft, rowId, grams) {
  assertRowId(draft, rowId);
  return {
    ...draft,
    rows: draft.rows.map((row) =>
      row.id === rowId ? { ...row, portions: [{ ...(row.portions[0] ?? { step: 1 }), grams }] } : row,
    ),
  };
}

/**
 * removeRow(draft, rowId) -> a new draft without that row; the others keep
 * their order, and the id is pruned from every step's uses so no dangling
 * reference is left (STRUCT-01). An unknown row id throws a RangeError.
 */
export function removeRow(draft, rowId) {
  assertRowId(draft, rowId);
  return {
    ...draft,
    rows: draft.rows.filter((row) => row.id !== rowId),
    method: draft.method.map((step) =>
      step.uses?.includes(rowId) ? { ...step, uses: step.uses.filter((id) => id !== rowId) } : step,
    ),
  };
}

// The six band keys, in the Balance's order. A typed band key is only ever a
// value: setBandEnd accepts these and nothing else (T-10-21).
const BAND_KEYS = FIGURE_SPECS.map((spec) => spec.targetKey);

/**
 * creationTargets(draft) -> the targets the Balance reads: a band whose two
 * typed ends both parse through parseGramsDraft to finite numbers with low at
 * or below high, as [lowNumber, highNumber]. Any other band is left out, so its
 * figure reads 'no target set' (D-08b). The finite check is needed: a
 * 309-digit end parses to Infinity, and two Infinity ends satisfy low <= high.
 */
export function creationTargets(draft) {
  const targets = {};
  for (const key of BAND_KEYS) {
    const ends = draft.targets[key];
    if (!ends) continue;
    const low = parseGramsDraft(ends[0]);
    const high = parseGramsDraft(ends[1]);
    if (low === null || high === null) continue;
    if (!Number.isFinite(low) || !Number.isFinite(high) || low > high) continue;
    targets[key] = [low, high];
  }
  return targets;
}

/**
 * applyStyle(draft, style) -> a new draft holding the style row's id, exactly
 * the style's own bands (a band the style leaves out is gone) as the strings
 * the fields show, and the style's default serving temperature as a string,
 * '' when that is not a finite number (decisions 6, 9, 14).
 */
export function applyStyle(draft, style) {
  const targets = {};
  for (const key of BAND_KEYS) {
    const band = style.bands[key];
    if (band) targets[key] = [String(band[0]), String(band[1])];
  }
  const temperature = style.serveTempC?.default;
  return {
    ...draft,
    style: style.id,
    targets,
    serveTempC: Number.isFinite(temperature) ? String(temperature) : '',
  };
}

/**
 * clearStyle(draft) -> a new draft with no style and no serving temperature;
 * the bands stay as they stand (decisions 14 and 17).
 */
export function clearStyle(draft) {
  return { ...draft, style: null, serveTempC: '' };
}

/**
 * setBandEnd(draft, bandKey, endIndex, raw) -> a new draft with one end of one
 * band kept as typed. A band left with two blank ends is removed. The style
 * stays picked. A key outside the six bands, or an end other than 0 or 1, is a
 * caller bug and throws a RangeError.
 */
export function setBandEnd(draft, bandKey, endIndex, raw) {
  if (!BAND_KEYS.includes(bandKey)) throw new RangeError(`no band ${String(bandKey)}`);
  if (endIndex !== 0 && endIndex !== 1) throw new RangeError(`no band end ${endIndex}`);
  const ends = [...(draft.targets[bandKey] ?? ['', ''])];
  ends[endIndex] = raw;
  const targets = { ...draft.targets };
  if (ends[0] === '' && ends[1] === '') delete targets[bandKey];
  else targets[bandKey] = ends;
  return { ...draft, targets };
}

const SCALE_FIELDS = ['name', 'low', 'high', 'kind'];

function assertScaleKey(draft, key) {
  if (!draft.scales.some((scale) => scale.key === key)) throw new RangeError(`no scale ${String(key)} on the draft`);
}

/**
 * addScale(draft, key) -> a new draft whose scales end with an empty declared
 * scale of that key (TASTE-01, decision 12): blank words and no kind, nothing
 * pre-picked. The caller mints the key (mintScaleKey(freshId()) in the click
 * handler, D-03b). An empty key is a TypeError; a third scale, or a key
 * already on the draft, is a RangeError. Two scales may share a name: refusing
 * that is Phase 11's Save.
 */
export function addScale(draft, key) {
  if (typeof key !== 'string' || key === '') throw new TypeError('scale key must be a non-empty string');
  if (draft.scales.length >= MAX_RECIPE_SCALES) throw new RangeError(`a recipe holds at most ${MAX_RECIPE_SCALES} scales`);
  if (draft.scales.some((scale) => scale.key === key)) throw new RangeError(`scale ${key} is already on the draft`);
  return { ...draft, scales: [...draft.scales, { key, name: '', low: '', high: '', kind: '', group: 'declared' }] };
}

/**
 * updateScale(draft, key, field, value) -> a new draft with that scale's
 * name, low, high or kind set as given; the key never changes. A field
 * outside those four, a kind outside '' and SCALE_KINDS, or an unknown key is
 * a caller bug and throws a RangeError.
 */
export function updateScale(draft, key, field, value) {
  assertScaleKey(draft, key);
  if (!SCALE_FIELDS.includes(field)) throw new RangeError(`a scale has no field ${String(field)} to change`);
  if (field === 'kind' && value !== '' && !SCALE_KINDS.includes(value)) throw new RangeError(`no scale kind ${String(value)}`);
  return { ...draft, scales: draft.scales.map((scale) => (scale.key === key ? { ...scale, [field]: value } : scale)) };
}

/**
 * removeScale(draft, key) -> a new draft without that scale; the other keeps
 * its key and its place. An unknown key throws a RangeError.
 */
export function removeScale(draft, key) {
  assertScaleKey(draft, key);
  return { ...draft, scales: draft.scales.filter((scale) => scale.key !== key) };
}

/**
 * scaleStopsLine(scale) -> the line under a scale's Kind: the five stop words
 * joined by ' · ' for a goldilocks scale, 'low to high' for a magnitude one,
 * the typed words verbatim. null until both ends (trimmed) and the kind are
 * set.
 */
export function scaleStopsLine(scale) {
  if (scale.low.trim() === '' || scale.high.trim() === '') return null;
  if (scale.kind === 'goldilocks') return stopWordsFor(scale).join(' · ');
  if (scale.kind === 'magnitude') return `${scale.low} to ${scale.high}`;
  return null;
}

function assertProblemIndex(draft, index) {
  if (!Number.isInteger(index) || index < 0 || index >= draft.problems.length) {
    throw new RangeError(`no problem at index ${index}`);
  }
}

/**
 * addProblem(draft) -> a new draft whose problems end with an empty one
 * (TASTE-02). A third problem is a caller bug and throws a RangeError. Two
 * problems may hold the same words: refusing that is Phase 11's Save.
 */
export function addProblem(draft) {
  if (draft.problems.length >= MAX_RECIPE_PROBLEMS) {
    throw new RangeError(`a recipe holds at most ${MAX_RECIPE_PROBLEMS} problems`);
  }
  return { ...draft, problems: [...draft.problems, ''] };
}

/**
 * updateProblem(draft, index, text) -> a new draft with problem `index`
 * reading `text` as typed; the other is untouched. An index outside the list
 * throws a RangeError.
 */
export function updateProblem(draft, index, text) {
  assertProblemIndex(draft, index);
  return { ...draft, problems: draft.problems.map((problem, at) => (at === index ? text : problem)) };
}

/**
 * removeProblem(draft, index) -> a new draft without problem `index`. An index
 * outside the list throws a RangeError.
 */
export function removeProblem(draft, index) {
  assertProblemIndex(draft, index);
  return { ...draft, problems: draft.problems.filter((_problem, at) => at !== index) };
}
