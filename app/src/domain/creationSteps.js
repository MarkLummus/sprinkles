// Pure. No framework, DOM, or store import. The create draft's Instructions
// steps and the rows placed in them (Phase 11, MAKE-07, STRUCT-01 to
// STRUCT-03): every function takes a draft and returns a new one, and none
// changes a step's key (n) or a row's id.
//
// Placement lives in one place: a live step's uses list. A step's uses is also
// that step's row order (each step orders its own rows). A draft row's
// portions are only the grams lines stored under the step keys the row sits in,
// plus, for a row no step uses, one placeholder portion { step: 1, grams }
// that is never read for placement: the first step added gets key 1, which
// equals the placeholder, so reading placement from portions would attach
// every unplaced row to it (RESEARCH G-2). checkAllocation is the invariant
// that goes red if an op ever does that.

import { nextStepKey } from './stepKeys.js';

/**
 * The step value an unplaced row's single portion carries in the Sheet
 * projection and in a saved version. transfer.js accepts any finite step and
 * displayNumberOf(map, 0) is null, so the reading table already groups it
 * under its unplaced group.
 */
export const UNPLACED_STEP = 0;

// The key an unplaced row's one placeholder portion is stored under in the
// draft; draft.js refuses a portion step of 0.
const PLACEHOLDER_STEP = 1;

/** liveSteps(draft) -> the method without its removed steps (tombstones). */
export function liveSteps(draft) {
  return draft.method.filter((step) => !step.removed);
}

function findRow(draft, rowId) {
  return draft.rows.find((row) => row.id === rowId);
}

function assertRow(draft, rowId) {
  const row = findRow(draft, rowId);
  if (!row) throw new RangeError(`no row ${String(rowId)} on the draft`);
  return row;
}

function assertLiveStep(draft, n) {
  if (!liveSteps(draft).some((step) => step.n === n)) throw new RangeError(`no step ${String(n)} on the draft`);
}

function usesOf(step) {
  return step.uses ?? [];
}

function portionGrams(row, step) {
  const portion = row.portions.find((candidate) => candidate.step === step);
  return portion ? portion.grams : '';
}

// The grams an unplaced row holds: its placeholder portion, or the only one
// there is.
function placeholderGrams(row) {
  const portion = row.portions.find((candidate) => candidate.step === PLACEHOLDER_STEP) ?? row.portions[0];
  return portion ? portion.grams : '';
}

/**
 * placementOf(draft, rowId) -> the n of every live step whose uses includes
 * rowId, in method order. A row no live step uses reads [].
 */
export function placementOf(draft, rowId) {
  return liveSteps(draft)
    .filter((step) => usesOf(step).includes(rowId))
    .map((step) => step.n);
}

/**
 * groupRows(draft, group) -> the row ids of one group in that group's own
 * order: a live step key gives that step's uses in order, keeping only ids of
 * rows on the draft; UNPLACED_STEP gives the rows no live step uses, in
 * draft.rows order. Any other group is a caller bug and throws a RangeError.
 */
export function groupRows(draft, group) {
  if (group === UNPLACED_STEP) {
    const used = new Set(liveSteps(draft).flatMap(usesOf));
    return draft.rows.filter((row) => !used.has(row.id)).map((row) => row.id);
  }
  const step = liveSteps(draft).find((candidate) => candidate.n === group);
  if (!step) throw new RangeError(`no step ${String(group)} on the draft`);
  return usesOf(step).filter((id) => findRow(draft, id) !== undefined);
}

/**
 * rowLines(draft, rowId) -> [{ step, grams }] in method order: one per live
 * step the row sits in, each the row's portion at that key ('' when missing);
 * for an unplaced row, one line { step: UNPLACED_STEP, grams } holding the
 * placeholder portion's grams.
 */
export function rowLines(draft, rowId) {
  const row = assertRow(draft, rowId);
  const placement = placementOf(draft, rowId);
  if (placement.length === 0) return [{ step: UNPLACED_STEP, grams: placeholderGrams(row) }];
  return placement.map((n) => ({ step: n, grams: portionGrams(row, n) }));
}

/**
 * addStep(draft, { afterN = null }) -> a new draft with a new empty step. Its
 * key is nextStepKey over the whole method, removed steps included, so no
 * removed key is handed out again while the draft lives. With afterN null the
 * step goes first (the heading's Add step); otherwise right after the live
 * step whose n is afterN (a RangeError when there is none).
 */
export function addStep(draft, { afterN = null } = {}) {
  const step = { n: nextStepKey(draft.method), leadIn: '', instruction: '', uses: [], targets: [] };
  if (afterN === null) return { ...draft, method: [step, ...draft.method] };
  assertLiveStep(draft, afterN);
  const at = draft.method.findIndex((candidate) => candidate.n === afterN);
  return { ...draft, method: [...draft.method.slice(0, at + 1), step, ...draft.method.slice(at + 1)] };
}

function withRow(draft, rowId, change) {
  return { ...draft, rows: draft.rows.map((row) => (row.id === rowId ? change(row) : row)) };
}

function withStep(draft, n, change) {
  return { ...draft, method: draft.method.map((step) => (step.n === n ? change(step) : step)) };
}

/**
 * toggleStepUses(draft, n, rowId) -> a new draft with the row ticked into, or
 * unticked from, step n. Ticking an unplaced row moves its grams from the
 * placeholder to a portion at n; unticking a row whose only step is n returns
 * it to the placeholder with its grams. A tick appends the row id to the end of
 * step n's uses, an untick removes it and leaves the others in their order.
 */
export function toggleStepUses(draft, n, rowId) {
  assertLiveStep(draft, n);
  const row = assertRow(draft, rowId);
  const placement = placementOf(draft, rowId);
  if (placement.includes(n)) {
    if (placement.length !== 1) throw new RangeError('unticking one of several lines is not supported yet');
    return withStep(
      withRow(draft, rowId, (current) => ({ ...current, portions: [{ step: PLACEHOLDER_STEP, grams: portionGrams(current, n) }] })),
      n,
      (step) => ({ ...step, uses: usesOf(step).filter((id) => id !== rowId) }),
    );
  }
  if (placement.length !== 0) throw new RangeError('ticking a placed row into another step is not supported yet');
  return withStep(
    withRow(draft, rowId, (current) => ({ ...current, portions: [{ step: n, grams: placeholderGrams(row) }] })),
    n,
    (step) => ({ ...step, uses: [...usesOf(step), rowId] }),
  );
}

function sameSteps(left, right) {
  return left.length === right.length && left.every((step) => right.includes(step));
}

/**
 * checkAllocation(draft) -> null, or one English sentence naming the first
 * violation: a removed step that still lists a row; a uses id with no row; a
 * live step listing a row twice; a live step's row with no portion at that
 * key; a row whose portion steps repeat; a row whose portion steps are not
 * exactly the live steps that use it (or exactly the one placeholder when
 * unplaced).
 */
export function checkAllocation(draft) {
  for (const step of draft.method) {
    const uses = usesOf(step);
    if (step.removed) {
      if (uses.length !== 0) return `Removed step ${step.n} still lists row ${uses[0]}`;
      continue;
    }
    const seen = new Set();
    for (const id of uses) {
      const row = findRow(draft, id);
      if (!row) return `Step ${step.n} lists ${id}, which is not a row on the draft`;
      if (seen.has(id)) return `Step ${step.n} lists row ${id} twice`;
      seen.add(id);
      if (!row.portions.some((portion) => portion.step === step.n)) return `Row ${id} has no amount for step ${step.n}`;
    }
  }
  for (const row of draft.rows) {
    const steps = row.portions.map((portion) => portion.step);
    if (new Set(steps).size !== steps.length) return `Row ${row.id} has two amounts for one step`;
    const placement = placementOf(draft, row.id);
    const expected = placement.length === 0 ? [PLACEHOLDER_STEP] : placement;
    if (!sameSteps(steps, expected)) {
      return placement.length === 0
        ? `Row ${row.id} sits in no step but holds amounts at other steps`
        : `Row ${row.id} holds amounts that do not match the steps it sits in`;
    }
  }
  return null;
}
