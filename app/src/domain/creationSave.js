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
import { checkAllocation, liveSteps, rowLines } from './creationSteps.js';
import { parseGramsDraft } from './lineage.js';
import { createRecipe } from './newRecipe.js';
import { rowFromLibraryRecord } from './versionRow.js';

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
