// Pure. No framework, no DOM, no store import. The uses cross-flags and the
// stale-amount flag — see 03-CONTEXT.md D-08 (the seed's authored uses
// lists) and D-10 (removal never cascades). Removal never cascades: every
// function here reports; none of them writes a `removed` flag, and no
// caller may set one on the maker's behalf. A maker may keep step 1 and
// put something else in the oil, so the second removal is always the
// maker's own tap.
//
// Every look-up here is an array scan or a Map/Set built from one, never a
// bare bracket read against a maker-influenced key (the discipline T-02-32
// named).
import { buildDiff } from './diff.js';

// A step with no `uses` key reads as [] — absence is a fact, not an error,
// the doctrine domain/batch.js already applies to a step's `stepChanges`.
function usesOf(step) {
  return step.uses ?? [];
}

/**
 * stepsUsingRow(version, rowId) -> the non-removed steps whose `uses`
 * includes rowId, in the version's method order.
 */
export function stepsUsingRow(version, rowId) {
  return version.method.filter((step) => !step.removed && usesOf(step).includes(rowId));
}

/**
 * removedRowsUsedBy(version, step) -> the rows named in step's `uses` that
 * are removed, in the version's row order. This is what raises the flag
 * beneath a step ("uses soy lecithin, which is removed"). Returns []
 * for a step that is itself removed — a removed step is not asking the
 * question any more; its own removal is what its "removed" label carries.
 */
export function removedRowsUsedBy(version, step) {
  if (step.removed) return [];
  const uses = usesOf(step);
  return version.rows.filter((row) => row.removed && uses.includes(row.id));
}

/**
 * coveredRowsFor(version, step) -> for a removed `step`, the rows it used
 * that at least one other non-removed step still uses, as
 * { id, ingredientName, coveringSteps }, in the version's own row order,
 * each entry's `coveringSteps` in the version's own method order. This is
 * `orphanedRows`' complement: that function names the rows a removal
 * orphaned, this names the rows it did not — together they account for
 * every row the removed step used (D-UAT-3). A row that is itself removed
 * is covered by nothing and is not returned. Returns [] for a step that
 * is not removed; the question only means something once a step is gone.
 */
export function coveredRowsFor(version, step) {
  if (!step.removed) return [];
  const uses = usesOf(step);
  const entries = [];
  for (const row of version.rows) {
    if (row.removed || !uses.includes(row.id)) continue;
    const coveringSteps = stepsUsingRow(version, row.id);
    if (coveringSteps.length > 0) {
      entries.push({ id: row.id, ingredientName: row.ingredientName, coveringSteps });
    }
  }
  return entries;
}

/**
 * orphanedRows(version) -> the non-removed rows that appear in at least one
 * removed step's `uses` and in no non-removed step's `uses`. This is what
 * raises the mirror flag beside a row's name. Never returns a row that is
 * itself already removed. Returns rows in the version's authored order,
 * never sorted.
 */
export function orphanedRows(version) {
  const usedByActiveStep = new Set();
  const usedByRemovedStep = new Set();
  for (const step of version.method) {
    const target = step.removed ? usedByRemovedStep : usedByActiveStep;
    for (const rowId of usesOf(step)) target.add(rowId);
  }
  return version.rows.filter(
    (row) => !row.removed && usedByRemovedStep.has(row.id) && !usedByActiveStep.has(row.id),
  );
}

/**
 * stepsWithStaleAmounts(version, baseline) -> one entry per non-removed
 * step whose own text is unchanged from `baseline` and whose `uses` names
 * at least one non-removed row whose grams changed, as
 * { n, changes: [{ rowId, ingredientName, from, to }] }, in the step's own
 * `uses` order. Reads buildDiff's row and step descriptors rather than
 * recomputing a delta of its own, so this flag can never disagree with the
 * comparison a reader sees elsewhere on the page.
 */
export function stepsWithStaleAmounts(version, baseline) {
  const diff = buildDiff(version, baseline);
  const rowDiffById = new Map(diff.rows.map((row) => [row.id, row]));
  const stepDiffByN = new Map(diff.steps.map((step) => [step.n, step]));

  const entries = [];
  for (const step of version.method) {
    if (step.removed) continue;
    const stepDiff = stepDiffByN.get(step.n);
    if (stepDiff && stepDiff.textChanged) continue;

    const changes = [];
    for (const rowId of usesOf(step)) {
      const rowDiff = rowDiffById.get(rowId);
      if (rowDiff && !rowDiff.removed && rowDiff.gramsChanged) {
        changes.push({ rowId, ingredientName: rowDiff.ingredientName, from: rowDiff.gramsFrom, to: rowDiff.gramsTo });
      }
    }
    if (changes.length > 0) entries.push({ n: step.n, changes });
  }
  return entries;
}
