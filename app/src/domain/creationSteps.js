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

import { parseGramsDraft } from './lineage.js';
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

function assertDirection(direction) {
  if (direction !== 'up' && direction !== 'down') throw new TypeError("direction must be 'up' or 'down'");
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

function withRow(draft, rowId, change) {
  return { ...draft, rows: draft.rows.map((row) => (row.id === rowId ? change(row) : row)) };
}

function withStep(draft, n, change) {
  return { ...draft, method: draft.method.map((step) => (step.n === n ? change(step) : step)) };
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

// The hundredths a decimal amount holds, read from its digits as an integer
// (never through Number, which turns '35184372088832.02' into 3518437208883203
// hundredths): the digits before the point and the one or two after it,
// padded to two, as one BigInt.
function hundredthsOf(text) {
  const [whole, fraction = ''] = text.split('.');
  return BigInt(whole + fraction.padEnd(2, '0'));
}

const MAX_HUNDREDTHS = BigInt(Number.MAX_SAFE_INTEGER);

function printHundredths(total) {
  const whole = total / 100n;
  const rest = total % 100n;
  if (rest === 0n) return String(whole);
  return `${whole}.${String(rest).padStart(2, '0').replace(/0$/, '')}`;
}

/**
 * addGrams(kept, folded) -> the text a fold leaves in the kept line, and it
 * never loses typed text. A blank side adds nothing: the other side comes back
 * as typed. Two sides that both read through parseGramsDraft sum exactly, in
 * hundredths read from the digits, when each side and the sum stay within
 * Number.MAX_SAFE_INTEGER hundredths: '400' + '200' is '600', '0.1' + '0.2'
 * is '0.3'. In every other case (a side that does not read, such as '4.', or a
 * sum past the limit) the result is both texts joined by ' + ', which reads as
 * not a number, so the line shows its own message and Save refuses it until
 * the maker types one amount.
 */
export function addGrams(kept, folded) {
  if (folded.trim() === '') return kept;
  if (kept.trim() === '') return folded;
  if (parseGramsDraft(kept) !== null && parseGramsDraft(folded) !== null) {
    const left = hundredthsOf(kept);
    const right = hundredthsOf(folded);
    const total = left + right;
    if (left <= MAX_HUNDREDTHS && right <= MAX_HUNDREDTHS && total <= MAX_HUNDREDTHS) return printHundredths(total);
  }
  return `${kept} + ${folded}`;
}

// One line of a placed row leaves it: the row's grams there fold into its
// first remaining line in method order (found through placementOf, never
// through the order of row.portions, which carries no meaning), or go back to
// the placeholder when it was the only line. The row's total stands (roadmap
// decisions 10 and 24). The step's uses loses the row; the step itself stays.
function dropLine(draft, rowId, n) {
  const row = findRow(draft, rowId);
  const remaining = placementOf(draft, rowId).filter((key) => key !== n);
  const folded = portionGrams(row, n);
  const portions =
    remaining.length === 0
      ? [{ step: PLACEHOLDER_STEP, grams: folded }]
      : row.portions
          .filter((portion) => portion.step !== n)
          .map((portion) => (portion.step === remaining[0] ? { ...portion, grams: addGrams(portion.grams, folded) } : portion));
  return withStep(
    withRow(draft, rowId, (current) => ({ ...current, portions })),
    n,
    (step) => ({ ...step, uses: usesOf(step).filter((id) => id !== rowId) }),
  );
}

/**
 * toggleStepUses(draft, n, rowId) -> a new draft with the row ticked into, or
 * unticked from, step n. A step's uses is its row order: a tick appends the
 * row id to the end of step n's uses and an untick removes it, leaving the
 * others in their order. Ticking an unplaced row moves its grams from the
 * placeholder to a portion at n; ticking a placed row into another step adds
 * a line with blank grams (the maker types the split, roadmap decision 23).
 * Unticking one of several lines folds its grams into the first remaining
 * line in method order; unticking the only line returns the row to the
 * placeholder with its grams.
 */
export function toggleStepUses(draft, n, rowId) {
  assertLiveStep(draft, n);
  const row = assertRow(draft, rowId);
  const placement = placementOf(draft, rowId);
  if (placement.includes(n)) return dropLine(draft, rowId, n);
  const portions = placement.length === 0 ? [{ step: n, grams: placeholderGrams(row) }] : [...row.portions, { step: n, grams: '' }];
  return withStep(
    withRow(draft, rowId, (current) => ({ ...current, portions })),
    n,
    (step) => ({ ...step, uses: [...usesOf(step), rowId] }),
  );
}

/**
 * placeRow(draft, rowId, n) -> a new draft with an unplaced row ticked into
 * step n (decision 014 1): its id joins the end of that step's uses, so it
 * reads as that step's last row, and draft.rows is left as it was. A placed
 * row, or a step that is not live, throws a RangeError.
 */
export function placeRow(draft, rowId, n) {
  assertRow(draft, rowId);
  assertLiveStep(draft, n);
  if (placementOf(draft, rowId).length !== 0) throw new RangeError(`row ${rowId} is already in a step`);
  return toggleStepUses(draft, n, rowId);
}

/**
 * removeStep(draft, n) -> a new draft without step n as far as the editor
 * shows: the step becomes a blanked tombstone { n, leadIn: '', instruction: '',
 * uses: [], targets: [], removed: true } that keeps its key out of
 * nextStepKey for as long as the draft lives (RESEARCH G-3) and that Save
 * drops. Each row it used loses that line and folds its grams as dropLine
 * says. A key that is not a live step throws a RangeError, so a double press
 * changes nothing a second time.
 */
export function removeStep(draft, n) {
  assertLiveStep(draft, n);
  const step = draft.method.find((candidate) => candidate.n === n);
  let next = draft;
  for (const rowId of usesOf(step)) {
    if (findRow(next, rowId)) next = dropLine(next, rowId, n);
  }
  return withStep(next, n, () => ({ n, leadIn: '', instruction: '', uses: [], targets: [], removed: true }));
}

/**
 * moveStep(draft, n, direction) -> a new draft with live step n one place
 * earlier ('up') or later ('down') among the live steps; tombstones are
 * stepped over. Every n is unchanged: display numbers follow array order. A
 * move past either end, or a step that is not live, throws a RangeError.
 */
export function moveStep(draft, n, direction) {
  assertDirection(direction);
  assertLiveStep(draft, n);
  const at = draft.method.findIndex((step) => step.n === n);
  let to = at;
  if (direction === 'up') {
    for (let i = at - 1; i >= 0 && to === at; i -= 1) if (!draft.method[i].removed) to = i;
  } else {
    for (let i = at + 1; i < draft.method.length && to === at; i += 1) if (!draft.method[i].removed) to = i;
  }
  if (to === at) throw new RangeError(`step ${n} cannot move ${direction}`);
  const method = [...draft.method];
  const [moved] = method.splice(at, 1);
  method.splice(to, 0, moved);
  return { ...draft, method };
}

const STEP_FIELDS = ['leadIn', 'instruction', 'purpose', 'aside'];

/**
 * setStepField(draft, n, field, value) -> a new draft with that live step's
 * leadIn, instruction, purpose or aside set as typed. Any other field is a
 * TypeError; a step that is not live is a RangeError.
 */
export function setStepField(draft, n, field, value) {
  if (!STEP_FIELDS.includes(field)) throw new TypeError(`a step has no field ${String(field)} to change`);
  assertLiveStep(draft, n);
  return withStep(draft, n, (step) => ({ ...step, [field]: value }));
}

function liveStep(draft, n) {
  assertLiveStep(draft, n);
  return draft.method.find((step) => step.n === n);
}

function assertTargetIndex(step, index) {
  const targets = step.targets ?? [];
  if (!Number.isInteger(index) || index < 0 || index >= targets.length) throw new RangeError(`no target at index ${index}`);
}

/** addTarget(draft, n) -> a new draft whose step n ends with an empty target. */
export function addTarget(draft, n) {
  liveStep(draft, n);
  return withStep(draft, n, (step) => ({ ...step, targets: [...(step.targets ?? []), { label: '', value: '' }] }));
}

/**
 * setTarget(draft, n, index, side, value) -> a new draft with one side
 * ('label' or 'value') of one of step n's targets set as typed, matched by
 * index so two chips can read alike while a label is mid-edit. Another side is
 * a TypeError; an index outside the targets is a RangeError.
 */
export function setTarget(draft, n, index, side, value) {
  if (side !== 'label' && side !== 'value') throw new TypeError(`a target has no side ${String(side)}`);
  assertTargetIndex(liveStep(draft, n), index);
  return withStep(draft, n, (step) => ({
    ...step,
    targets: step.targets.map((target, at) => (at === index ? { ...target, [side]: value } : target)),
  }));
}

/** removeTarget(draft, n, index) -> a new draft without that target (D-22). */
export function removeTarget(draft, n, index) {
  assertTargetIndex(liveStep(draft, n), index);
  return withStep(draft, n, (step) => ({ ...step, targets: step.targets.filter((_target, at) => at !== index) }));
}

/**
 * moveRow(draft, rowId, group, direction) -> a new draft with the row one
 * place earlier or later within its own group only (roadmap decision 9).
 * group is a live step key, where the row swaps with its neighbour in that
 * step's uses and nothing else changes (each step orders its own rows), or
 * UNPLACED_STEP, where it swaps in draft.rows with its neighbour among the
 * unplaced rows. A row not in the group, or a move past either end, throws a
 * RangeError.
 */
export function moveRow(draft, rowId, group, direction) {
  assertDirection(direction);
  const ids = groupRows(draft, group);
  const at = ids.indexOf(rowId);
  if (at === -1) throw new RangeError(`row ${String(rowId)} is not in group ${String(group)}`);
  const neighbour = ids[direction === 'up' ? at - 1 : at + 1];
  if (neighbour === undefined) throw new RangeError(`row ${rowId} cannot move ${direction}`);
  if (group === UNPLACED_STEP) {
    const mover = findRow(draft, rowId);
    const other = findRow(draft, neighbour);
    return { ...draft, rows: draft.rows.map((row) => (row.id === rowId ? other : row.id === neighbour ? mover : row)) };
  }
  return withStep(draft, group, (step) => ({
    ...step,
    uses: usesOf(step).map((id) => (id === rowId ? neighbour : id === neighbour ? rowId : id)),
  }));
}

/**
 * setLineGrams(draft, rowId, step, grams) -> a new draft with one line of the
 * row set as typed: step is a live key the row sits in, or UNPLACED_STEP for
 * an unplaced row's placeholder. Anything else throws a RangeError.
 */
export function setLineGrams(draft, rowId, step, grams) {
  assertRow(draft, rowId);
  const placement = placementOf(draft, rowId);
  if (step === UNPLACED_STEP) {
    if (placement.length !== 0) throw new RangeError(`row ${rowId} sits in a step, so it has no unplaced line`);
    return withRow(draft, rowId, (row) => ({ ...row, portions: [{ step: PLACEHOLDER_STEP, grams }] }));
  }
  if (!placement.includes(step)) throw new RangeError(`row ${rowId} is not in step ${String(step)}`);
  return withRow(draft, rowId, (row) => ({
    ...row,
    portions: row.portions.some((portion) => portion.step === step)
      ? row.portions.map((portion) => (portion.step === step ? { ...portion, grams } : portion))
      : [...row.portions, { step, grams }],
  }));
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

/**
 * normalizeAllocation(draft) -> a draft checkAllocation accepts, repaired
 * without losing a typed amount: the draft a restored kept draft goes through
 * before the editor shows it. A removed step's uses is emptied; a live step's
 * uses loses an id with no row and a repeated id past its first mention; each
 * row then keeps exactly one portion per live step that uses it, a missing
 * one blank, a repeated one folded in, and a portion at a key the row is not
 * placed in folded (addGrams) into its first placed line in method order, or
 * into the one placeholder when the row is unplaced. Returns its argument
 * unchanged when checkAllocation already returns null.
 */
export function normalizeAllocation(draft) {
  if (checkAllocation(draft) === null) return draft;
  const rowIds = new Set(draft.rows.map((row) => row.id));
  const method = draft.method.map((step) => {
    if (step.removed) return usesOf(step).length === 0 ? step : { ...step, uses: [] };
    const uses = [];
    for (const id of usesOf(step)) if (rowIds.has(id) && !uses.includes(id)) uses.push(id);
    return { ...step, uses };
  });
  const repaired = { ...draft, method };
  const rows = draft.rows.map((row) => {
    const placement = placementOf(repaired, row.id);
    const foldedByStep = new Map();
    for (const portion of row.portions) {
      foldedByStep.set(portion.step, foldedByStep.has(portion.step) ? addGrams(foldedByStep.get(portion.step), portion.grams) : portion.grams);
    }
    if (placement.length === 0) {
      let grams = '';
      for (const text of foldedByStep.values()) grams = addGrams(grams, text);
      return { ...row, portions: [{ step: PLACEHOLDER_STEP, grams }] };
    }
    const lines = placement.map((n) => ({ step: n, grams: foldedByStep.get(n) ?? '' }));
    for (const [step, text] of foldedByStep) {
      if (!placement.includes(step)) lines[0] = { ...lines[0], grams: addGrams(lines[0].grams, text) };
    }
    return { ...row, portions: lines };
  });
  return { ...repaired, rows };
}
