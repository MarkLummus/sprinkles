// Pure. No framework, DOM, or store import. Save for the creation editor
// (Phase 11, MAKE-10): buildCreation turns a create draft into the recipe and
// its first version, the two records one transaction writes. The gate that
// decides whether a draft may be saved at all lives beside it (creationSaveBlock).
//
// Everything the store file check (transfer.js) would refuse is refused before
// a record is built, so a saved recipe always exports and re-imports. This
// module therefore assumes the gate passed: a draft it cannot build is a
// caller bug and throws a TypeError, which the page shows as a save error with
// the draft kept (never as a stored version).

import { creationTargets } from './creation.js';
import { addGrams, checkAllocation, groupRows, liveSteps, rowLines, UNPLACED_STEP } from './creationSteps.js';
import { CREATE_DRAFT_KEYS } from './draft.js';
import { FIGURE_SPECS } from './figures.js';
import { sameRecord } from './firstVersion.js';
import { gramsDraftMessage, parseGramsDraft } from './lineage.js';
import { createRecipe } from './newRecipe.js';
import { recipeNameMessage } from './recipe.js';
import { activeRows, activeSteps } from './rows.js';
import { rowFromLibraryRecord } from './versionRow.js';

// The sentences this gate adds to the existing ones (recipe.js, lineage.js, the
// field's own Required). Claude's wording within their shape, for Mark in chat.
export const NO_ROWS_MESSAGE = 'Add at least one ingredient.';
export const PROBLEM_REPEATED = 'This problem is already listed.';
// Unreachable in v2.0 (the library never deletes an entry and Import is refused
// while a draft is kept): a row whose entry is gone is refused, never dropped.
export const LIBRARY_ENTRY_GONE = 'An ingredient on this recipe is no longer in the library.';

const REQUIRED = 'Required';

function hasWords(value) {
  return typeof value === 'string' && value.trim() !== '';
}

// A typed amount as a number. The gate refuses an amount that does not read,
// so one that reaches here is a caller bug.
function gramsOf(raw) {
  const parsed = parseGramsDraft(raw);
  if (!Number.isFinite(parsed)) throw new TypeError(`an amount that does not read cannot be saved: ${JSON.stringify(raw)}`);
  return parsed;
}

// The serving temperature in degrees C as typed. Empty, or an entry that does
// not read as a finite number, saves null (research open question 7): nothing
// is invented.
function servingTemperature(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  const parsed = Number(raw.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * buildCreation(draft, { libraryById, styles, now }) -> { recipe, version }:
 * the records Save writes. Rows are fresh copies of their library entries
 * (rowFromLibraryRecord, LIB-08) with one portion per line, an unplaced row's
 * at step 0 (D-09). The method is the live steps only (a removed step is a
 * tombstone the draft keeps for its key and Save drops, RESEARCH G-3), each
 * saved removed false with its uses in the step's own order, its complete
 * targets only, and a purpose or aside only when it holds words (D-10, D-22).
 * Before you start notes with words save with inheritedFrom null; the recipe's
 * own scales save as declared definitions and its problems as declared flaws;
 * targets are the bands that read (creationTargets). iceEd names the style row
 * picked (null for none) beside the serving temperature, which saves a number
 * or null. Every saved string is trimmed except the description, which is
 * prose and saves as typed. Throws a TypeError for a row whose library entry is
 * missing, for a draft checkAllocation does not accept and for an amount that
 * does not read: the gate refuses each first. Reads, never changes, the draft.
 */
export function buildCreation(draft, { libraryById, styles, now }) {
  const allocation = checkAllocation(draft);
  if (allocation !== null) throw new TypeError(`the draft cannot be saved: ${allocation}`);

  const rows = draft.rows.map((row) => {
    const record = libraryById.get(row.libraryId);
    if (!record) throw new TypeError(`row ${row.id} has no library entry ${String(row.libraryId)}`);
    const lines = rowLines(draft, row.id);
    const built = rowFromLibraryRecord(record, { id: row.id, grams: gramsOf(lines[0].grams), step: lines[0].step });
    return { ...built, portions: lines.map(({ step, grams }) => ({ step, grams: gramsOf(grams) })) };
  });

  const method = liveSteps(draft).map((step) => {
    const saved = {
      n: step.n,
      leadIn: step.leadIn.trim(),
      instruction: step.instruction.trim(),
      uses: [...(step.uses ?? [])],
      targets: (step.targets ?? [])
        .filter((target) => hasWords(target.label) && hasWords(target.value))
        .map((target) => ({ label: target.label.trim(), value: target.value.trim() })),
      removed: false,
    };
    if (hasWords(step.purpose)) saved.purpose = step.purpose.trim();
    if (hasWords(step.aside)) saved.aside = step.aside.trim();
    return saved;
  });

  const authored = {
    beforeYouStart: draft.beforeYouStart
      .filter((note) => hasWords(note.text))
      .map((note) => ({ text: note.text.trim(), inheritedFrom: null })),
  };

  const declaredAxes = draft.scales.map((scale) => ({
    key: scale.key,
    name: scale.name.trim(),
    low: scale.low.trim(),
    high: scale.high.trim(),
    kind: scale.kind,
    group: 'declared',
  }));

  const serveTempC = servingTemperature(draft.serveTempC);
  const style = styles.find((candidate) => candidate.id === draft.style);

  return createRecipe(
    {
      name: draft.name,
      versionLabel: draft.versionLabel,
      description: draft.description,
      rows,
      method,
      authored,
      declaredAxes,
      declaredFlaws: draft.problems.map((problem) => problem.trim()),
      targets: creationTargets(draft),
      iceEd: { style: style ? style.name : null, servingTemperatureC: serveTempC, hardness: null, overrunPercent: null },
      serveTempC,
    },
    { recipeId: draft.recipeId, versionId: draft.versionId, now },
  );
}

// gramsDraftMessage's one source for the not-a-number sentence: any text
// parseGramsDraft rejects earns it, so a row whose lines add up past what a
// number holds says exactly what a single unreadable line says.
const NOT_A_NUMBER_PROBE = 'not a number';

/**
 * creationSaveBlock(draft, { libraryById }) -> [{ id, message, target }]: every
 * refusal that stands, at once, in page order (D-11): the recipe name, the
 * Version name, the Ingredients (no rows, then each line's grams, then a row's
 * total), the Instructions, the Setup column (scales, then problems), then the
 * form-level blocks. An empty list means the draft can be saved. The gate
 * mirrors transfer.js, so a saved recipe always exports and re-imports, and
 * reads every text trimmed, so a field of spaces is blank. Empty notes, empty
 * purposes and asides and both-blank targets are dropped at Save, not refused.
 *
 * target says which field the block belongs to: { kind: 'recipeName' },
 * { kind: 'versionName' }, { kind: 'ingredients' }, { kind: 'line', rowId, step },
 * { kind: 'stepLeadIn', n }, { kind: 'stepInstruction', n }, { kind: 'stepTarget',
 * n, index, side }, { kind: 'scaleField', key, field }, { kind: 'problem', index }
 * or { kind: 'form' }. The grams blocks, `grams:${rowId}:${step}` and
 * `grams-total:${rowId}` alike, all target the line they are shown under: the
 * total's is the row's last line, in rowLines order. A row holds one kind or
 * the other, never both (the total is checked only when every line reads).
 *
 * Lines are walked in the order the table draws them: each live step in method
 * order, its rows in that step's own order (groupRows), then the rows no step
 * uses in draft.rows order (decide-p11-row-order-across-steps).
 */
export function creationSaveBlock(draft, { libraryById }) {
  const blocks = [];
  const add = (id, message, target) => blocks.push({ id, message, target });

  const nameMessage = recipeNameMessage(draft.name);
  if (nameMessage !== null) add('recipe-name', nameMessage, { kind: 'recipeName' });
  if (!hasWords(draft.versionLabel)) add('version-name', REQUIRED, { kind: 'versionName' });

  // Ingredients.
  if (draft.rows.length === 0) add('no-rows', NO_ROWS_MESSAGE, { kind: 'ingredients' });
  const rowById = new Map(draft.rows.map((row) => [row.id, row]));
  const lineOrder = [];
  for (const step of liveSteps(draft)) for (const rowId of groupRows(draft, step.n)) lineOrder.push([rowId, step.n]);
  for (const rowId of groupRows(draft, UNPLACED_STEP)) lineOrder.push([rowId, UNPLACED_STEP]);
  const refusedRows = new Set();
  for (const [rowId, step] of lineOrder) {
    const record = libraryById.get(rowById.get(rowId).libraryId);
    if (!record) continue;
    const name = record.entry.name;
    const lines = rowLines(draft, rowId);
    const message = gramsDraftMessage(name, lines.find((line) => line.step === step).grams);
    if (message !== null) {
      refusedRows.add(rowId);
      add(`grams:${rowId}:${step}`, message, { kind: 'line', rowId, step });
    } else if (step === lines[lines.length - 1].step && !refusedRows.has(rowId)) {
      const total = lines.reduce((sum, line) => sum + parseGramsDraft(line.grams), 0);
      if (!Number.isFinite(total)) {
        add(`grams-total:${rowId}`, gramsDraftMessage(name, NOT_A_NUMBER_PROBE), { kind: 'line', rowId, step });
      }
    }
  }

  // Instructions.
  for (const step of liveSteps(draft)) {
    const { n } = step;
    if (!hasWords(step.leadIn)) add(`lead:${n}`, REQUIRED, { kind: 'stepLeadIn', n });
    if (!hasWords(step.instruction)) add(`instruction:${n}`, REQUIRED, { kind: 'stepInstruction', n });
    (step.targets ?? []).forEach((target, index) => {
      const labelBlank = !hasWords(target.label);
      const valueBlank = !hasWords(target.value);
      if (labelBlank === valueBlank) return;
      const side = labelBlank ? 'label' : 'value';
      add(`target:${n}:${index}:${side}`, REQUIRED, { kind: 'stepTarget', n, index, side });
    });
  }

  // The recipe's own scales and problems.
  for (const scale of draft.scales) {
    for (const field of ['name', 'low', 'high', 'kind']) {
      if (!hasWords(scale[field])) add(`scale:${scale.key}:${field}`, REQUIRED, { kind: 'scaleField', key: scale.key, field });
    }
  }
  const seen = new Set();
  draft.problems.forEach((problem, index) => {
    if (!hasWords(problem)) {
      add(`problem:${index}`, REQUIRED, { kind: 'problem', index });
      return;
    }
    const words = problem.trim();
    if (seen.has(words)) add(`problem-repeat:${index}`, PROBLEM_REPEATED, { kind: 'problem', index });
    seen.add(words);
  });

  // Form-level.
  for (const row of draft.rows) {
    if (!libraryById.get(row.libraryId)) add(`gone:${row.id}`, LIBRARY_ENTRY_GONE, { kind: 'form' });
  }
  return blocks;
}

/**
 * lineSaveMessages(blocks) -> a Map from `${rowId}:${step}` to the first message
 * whose target is that line: the one projection the table reads for a line's
 * refusal. A total refusal shows under its row's last line exactly as a
 * per-line one does, and no reader recognises a block by its id prefix.
 */
export function lineSaveMessages(blocks) {
  const messages = new Map();
  for (const block of blocks) {
    if (block.target.kind !== 'line') continue;
    const key = `${block.target.rowId}:${block.target.step}`;
    if (!messages.has(key)) messages.set(key, block.message);
  }
  return messages;
}

// ---------------------------------------------------------------------------
// Edit (Phase 11, STRUCT-04, D-01 to D-03): a saved first version becomes a
// create-shaped draft, and the draft is written back over the same version.

const BAND_KEYS = FIGURE_SPECS.map((spec) => spec.targetKey);

/**
 * draftFromVersion(version, recipe, styles) -> the create-shaped payload of
 * what the saved version MEANS, not of everything it stores (D-03): the rows
 * are activeRows and the steps activeSteps, so a row, a line or a step the
 * version pen struck and saved over a zero-batch root is not brought back, and
 * Save-over then stores none of them.
 *
 * Placement is derived once from the active lines (RESEARCH G-2): a line whose
 * step is a live stored step is placed there; two lines on one step fold into
 * one (addGrams: the draft wants unique steps); a line whose step does not
 * resolve (a step the version does not hold, or step 0) folds into the row's
 * first placed line in method order, else the row stays unplaced with one
 * placeholder line holding the sum. A step's uses keeps the stored step's own
 * order: the ids its stored uses names that are placed in it, in that order,
 * then any other row placed in it, in row order (decide-p11-row-order-across-
 * steps). Every stored removed step becomes a blank tombstone in its place, so
 * nextStepKey never reissues a key the pen struck (decide-p11-step-key-reuse:
 * a key removed while creating, before the first Save, is gone and may be
 * issued again; one the pen struck is kept). Reads, never changes, its
 * arguments.
 */
export function draftFromVersion(version, recipe, styles) {
  const liveKeys = activeSteps(version).map((step) => step.n);
  const liveKeySet = new Set(liveKeys);

  // Where each row is placed, derived once from its active lines. A placeholder
  // portion (an unplaced row's { step: 1 }) is never read for placement.
  const placedKeys = new Map();
  const rows = activeRows(version).map((row) => {
    const byStep = new Map();
    let unresolved = '';
    for (const portion of row.portions) {
      const text = String(portion.grams);
      if (liveKeySet.has(portion.step)) {
        byStep.set(portion.step, byStep.has(portion.step) ? addGrams(byStep.get(portion.step), text) : text);
      } else {
        unresolved = addGrams(unresolved, text);
      }
    }
    const placed = liveKeys.filter((n) => byStep.has(n));
    placedKeys.set(row.id, placed);
    if (placed.length === 0) {
      return { id: row.id, libraryId: row.libraryId, portions: [{ step: 1, grams: unresolved }] };
    }
    const portions = placed.map((n) => ({ step: n, grams: byStep.get(n) }));
    portions[0] = { ...portions[0], grams: addGrams(portions[0].grams, unresolved) };
    return { id: row.id, libraryId: row.libraryId, portions };
  });

  const method = version.method.map((stored) => {
    if (stored.removed === true) return { n: stored.n, leadIn: '', instruction: '', uses: [], targets: [], removed: true };
    const placedHere = new Set(rows.filter((row) => placedKeys.get(row.id).includes(stored.n)).map((row) => row.id));
    const named = (stored.uses ?? []).filter((id) => placedHere.has(id));
    const uses = [...new Set([...named, ...rows.map((row) => row.id).filter((id) => placedHere.has(id))])];
    const step = {
      n: stored.n,
      leadIn: stored.leadIn ?? '',
      instruction: stored.instruction ?? '',
      uses,
      targets: structuredClone(stored.targets ?? []),
    };
    if (typeof stored.purpose === 'string') step.purpose = stored.purpose;
    if (typeof stored.aside === 'string') step.aside = stored.aside;
    return step;
  });

  const targets = {};
  for (const key of BAND_KEYS) {
    const band = version.targets?.[key];
    if (Array.isArray(band) && band.length === 2) targets[key] = [String(band[0]), String(band[1])];
  }

  const style = (styles ?? []).find((candidate) => candidate.name === version.iceEd?.style);

  return {
    recipeId: version.recipeId,
    versionId: version.id,
    name: recipe.name,
    description: typeof recipe.description === 'string' ? recipe.description : (version.sheetDescription ?? ''),
    versionLabel: version.versionLabel,
    beforeYouStart: (version.authored?.beforeYouStart ?? []).map((note) => ({ text: note.text })),
    rows,
    method,
    scales: (version.declaredAxes ?? []).map((scale) => ({
      key: scale.key,
      name: scale.name,
      low: scale.low,
      high: scale.high,
      kind: scale.kind,
      group: 'declared',
    })),
    problems: [...(version.declaredFlaws ?? [])],
    style: style ? style.id : null,
    targets,
    serveTempC: version.serveTempC === null || version.serveTempC === undefined ? '' : String(version.serveTempC),
  };
}

/**
 * sameCreateDraft(a, b) -> true when every CREATE_DRAFT_KEYS field of the two
 * payloads is equal by every leaf, whatever the order of an object's keys.
 */
export function sameCreateDraft(a, b) {
  return CREATE_DRAFT_KEYS.every((key) => sameRecord(a[key] ?? null, b[key] ?? null));
}

/**
 * applyEditToVersion({ version, recipe, draft, libraryById, styles }) ->
 * { recipe, version }: the records a Save-over writes. The draft is built as a
 * creation is (buildCreation) and its content laid over the stored records:
 * the version name, the Sheet title and description, rows (fresh copies of
 * their library entries, D-03), method, notes, scales, problems, targets, the
 * style's name and the serving temperature. Everything else stays as stored:
 * the id, the Sheet code, createdAt (the Written date), the reason, the
 * equipment and process, the coefficient set and the iceEd figures the editor
 * does not author. The recipe keeps its stored fields under the new name and
 * description. Nothing is added to the version beyond what a creation writes.
 */
export function applyEditToVersion({ version, recipe, draft, libraryById, styles }) {
  const { version: built, recipe: builtRecipe } = buildCreation(draft, { libraryById, styles, now: version.createdAt });
  return {
    recipe: { ...recipe, name: builtRecipe.name, description: builtRecipe.description },
    version: {
      ...version,
      sheetTitle: built.sheetTitle,
      sheetDescription: built.sheetDescription,
      versionLabel: built.versionLabel,
      rows: built.rows,
      method: built.method,
      authored: built.authored,
      declaredAxes: built.declaredAxes,
      declaredFlaws: built.declaredFlaws,
      targets: built.targets,
      iceEd: { ...(version.iceEd ?? {}), style: built.iceEd.style, servingTemperatureC: built.iceEd.servingTemperatureC },
      serveTempC: built.serveTempC,
    },
  };
}
