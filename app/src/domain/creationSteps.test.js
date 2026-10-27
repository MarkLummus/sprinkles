// The create draft's step, row and allocation ops (Phase 11, MAKE-07,
// STRUCT-01 to STRUCT-03). Runs in the node environment: the module imports no
// framework, DOM or store.
import { describe, it, expect } from 'vitest';
import {
  UNPLACED_STEP,
  liveSteps,
  placementOf,
  groupRows,
  rowLines,
  addStep,
  removeStep,
  moveStep,
  setStepField,
  addTarget,
  setTarget,
  removeTarget,
  toggleStepUses,
  placeRow,
  moveRow,
  setLineGrams,
  addGrams,
  checkAllocation,
  normalizeAllocation,
} from './creationSteps.js';
import { addRow, setRowGrams, removeRow, creationSheetVersion } from './creation.js';
import { blankCreateDraft, draftMatchesCreate, buildDraftRecord } from './draft.js';
import { nextStepKey } from './stepKeys.js';
import { library } from '../data/library.js';

const records = new Map(Object.entries(library).map(([id, entry]) => [id, { id, entry }]));

// A Phase 10 draft: two rows at the placeholder, no method.
function phaseTenDraft() {
  let draft = blankCreateDraft({ recipeId: 'r1', versionId: 'v1', name: 'Vanilla' });
  draft = addRow(draft, { rowId: 'rowA', libraryId: 'wholeMilk' });
  draft = addRow(draft, { rowId: 'rowB', libraryId: 'sucrose' });
  draft = setRowGrams(draft, 'rowA', '600');
  return setRowGrams(draft, 'rowB', '150');
}

describe('tracer: a step added to a Phase 10 draft and a row ticked into it', () => {
  it('addStep gives the first step key 1 and leaves both rows unplaced with their grams', () => {
    const draft = phaseTenDraft();
    const before = structuredClone(draft);
    const next = addStep(draft);
    expect(draft).toEqual(before);
    expect(next.method).toEqual([{ n: 1, leadIn: '', instruction: '', uses: [], targets: [] }]);
    expect(next.rows).toEqual(draft.rows);
    expect(placementOf(next, 'rowA')).toEqual([]);
    expect(checkAllocation(next)).toBeNull();
    expect(UNPLACED_STEP).toBe(0);
  });

  it('projects the first step with both rows unplaced at step 0', () => {
    const version = creationSheetVersion(addStep(phaseTenDraft()), records);
    expect(version.method).toEqual([{ n: 1, leadIn: '', instruction: '', uses: [], targets: [] }]);
    expect(version.rows.map((row) => row.portions)).toEqual([
      [{ step: UNPLACED_STEP, grams: 600 }],
      [{ step: UNPLACED_STEP, grams: 150 }],
    ]);
  });

  it('ticking an unplaced row into step 1 moves its grams there and lists it in uses', () => {
    const next = toggleStepUses(addStep(phaseTenDraft()), 1, 'rowA');
    expect(next.rows[0].portions).toEqual([{ step: 1, grams: '600' }]);
    expect(next.rows[1].portions).toEqual([{ step: 1, grams: '150' }]);
    expect(next.method[0].uses).toEqual(['rowA']);
    expect(placementOf(next, 'rowA')).toEqual([1]);
    expect(placementOf(next, 'rowB')).toEqual([]);
    expect(checkAllocation(next)).toBeNull();
    const version = creationSheetVersion(next, records);
    expect(version.rows.map((row) => row.portions)).toEqual([
      [{ step: 1, grams: 600 }],
      [{ step: UNPLACED_STEP, grams: 150 }],
    ]);
    expect(version.method[0].uses).toEqual(['rowA']);
  });

  it('unticking a row whose only step is that one returns it to the placeholder with its grams', () => {
    const ticked = toggleStepUses(addStep(phaseTenDraft()), 1, 'rowA');
    const back = toggleStepUses(ticked, 1, 'rowA');
    expect(back.rows[0].portions).toEqual([{ step: 1, grams: '600' }]);
    expect(back.method[0].uses).toEqual([]);
    expect(placementOf(back, 'rowA')).toEqual([]);
    expect(rowLines(back, 'rowA')).toEqual([{ step: UNPLACED_STEP, grams: '600' }]);
    expect(checkAllocation(back)).toBeNull();
  });

  it('reads a placed row at its step key and an unplaced row at the placeholder in rowLines', () => {
    const ticked = toggleStepUses(addStep(phaseTenDraft()), 1, 'rowA');
    expect(rowLines(ticked, 'rowA')).toEqual([{ step: 1, grams: '600' }]);
    expect(rowLines(ticked, 'rowB')).toEqual([{ step: UNPLACED_STEP, grams: '150' }]);
  });

  it('each step orders its own rows: ticking B then A reads B, A while draft.rows reads A, B', () => {
    let draft = addStep(phaseTenDraft());
    draft = toggleStepUses(draft, 1, 'rowB');
    draft = toggleStepUses(draft, 1, 'rowA');
    expect(draft.method[0].uses).toEqual(['rowB', 'rowA']);
    expect(groupRows(draft, 1)).toEqual(['rowB', 'rowA']);
    expect(draft.rows.map((row) => row.id)).toEqual(['rowA', 'rowB']);
    expect(creationSheetVersion(draft, records).method[0].uses).toEqual(['rowB', 'rowA']);
    expect(groupRows(draft, UNPLACED_STEP)).toEqual([]);
  });

  it('groupRows reads the unplaced rows in draft.rows order', () => {
    const draft = toggleStepUses(addStep(phaseTenDraft()), 1, 'rowA');
    expect(groupRows(draft, UNPLACED_STEP)).toEqual(['rowB']);
  });

  it('liveSteps leaves out a removed step', () => {
    const draft = addStep(addStep(phaseTenDraft()));
    draft.method = [draft.method[0], { ...draft.method[1], removed: true }];
    expect(liveSteps(draft).map((step) => step.n)).toEqual([draft.method[0].n]);
  });

  it('a step added with no afterN goes to the beginning, and afterN puts it right after that step', () => {
    let draft = addStep(phaseTenDraft());
    draft = addStep(draft);
    expect(draft.method.map((step) => step.n)).toEqual([2, 1]);
    draft = addStep(draft, { afterN: 2 });
    expect(draft.method.map((step) => step.n)).toEqual([2, 3, 1]);
    expect(() => addStep(draft, { afterN: 99 })).toThrow(RangeError);
  });
});

describe('checkAllocation names the first violation', () => {
  it('names the row when a step uses it but the row holds no portion at that step', () => {
    const draft = addStep(addStep(phaseTenDraft()));
    draft.method[1].uses = [];
    draft.method[0].uses = ['rowA']; // step 2, while rowA's only portion sits at the placeholder 1
    expect(draft.method[0].n).toBe(2);
    expect(checkAllocation(draft)).toContain('rowA');
  });

  it('names the row when it holds two portions while one step uses it', () => {
    const ticked = toggleStepUses(addStep(phaseTenDraft()), 1, 'rowA');
    ticked.rows[0].portions = [
      { step: 1, grams: '300' },
      { step: 2, grams: '300' },
    ];
    expect(checkAllocation(ticked)).toContain('rowA');
  });

  it('names a uses id that is not a row, a repeated id and a removed step that still lists a row', () => {
    const none = addStep(phaseTenDraft());
    none.method[0].uses = ['ghost'];
    expect(checkAllocation(none)).toContain('ghost');
    const twice = toggleStepUses(addStep(phaseTenDraft()), 1, 'rowA');
    twice.method[0].uses = ['rowA', 'rowA'];
    expect(checkAllocation(twice)).toContain('rowA');
    const removed = toggleStepUses(addStep(phaseTenDraft()), 1, 'rowA');
    removed.method[0].removed = true;
    expect(checkAllocation(removed)).not.toBeNull();
  });

  it('names an unplaced row that holds a portion other than the one placeholder, and duplicate portion steps', () => {
    const odd = addStep(phaseTenDraft());
    odd.rows[1].portions = [{ step: 2, grams: '150' }];
    expect(checkAllocation(odd)).toContain('rowB');
    const dup = addStep(phaseTenDraft());
    dup.rows[1].portions = [
      { step: 1, grams: '1' },
      { step: 1, grams: '2' },
    ];
    expect(checkAllocation(dup)).toContain('rowB');
  });
});

// ---------------------------------------------------------------------------
// Task 2: remove, move, place, split lines, targets and grams.
// ---------------------------------------------------------------------------

const blank = () => blankCreateDraft({ recipeId: 'r1', versionId: 'v1', name: 'Vanilla' });
const rowIdsOf = (draft) => draft.rows.map((row) => row.id);

// Whole milk, 400 g in step 1 and 200 g in step 2.
function milkInTwoSteps() {
  let draft = addRow(blank(), { rowId: 'milk', libraryId: 'wholeMilk' });
  draft = addStep(draft);
  draft = addStep(draft, { afterN: 1 });
  draft = toggleStepUses(toggleStepUses(draft, 1, 'milk'), 2, 'milk');
  return setLineGrams(setLineGrams(draft, 'milk', 1, '400'), 'milk', 2, '200');
}

function deepFreeze(value) {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) deepFreeze(inner);
  }
  return value;
}

describe('removeStep (roadmap decisions 10 and 24)', () => {
  it('folds a row split across two steps into its remaining line and leaves a blanked tombstone', () => {
    const draft = milkInTwoSteps();
    const next = removeStep(draft, 2);
    expect(next.rows[0].portions).toEqual([{ step: 1, grams: '600' }]);
    expect(next.method[1]).toEqual({ n: 2, leadIn: '', instruction: '', uses: [], targets: [], removed: true });
    expect(liveSteps(next)).toHaveLength(1);
    expect(next.method[0].uses).toEqual(['milk']);
    expect(checkAllocation(next)).toBeNull();
  });

  it('returns a row whose only step it was to the placeholder with its grams', () => {
    let draft = addStep(addRow(blank(), { rowId: 'oil', libraryId: 'sucrose' }));
    draft = setLineGrams(toggleStepUses(draft, 1, 'oil'), 'oil', 1, '250');
    const next = removeStep(draft, 1);
    expect(next.rows[0].portions).toEqual([{ step: 1, grams: '250' }]);
    expect(rowLines(next, 'oil')).toEqual([{ step: UNPLACED_STEP, grams: '250' }]);
    expect(checkAllocation(next)).toBeNull();
  });

  it('folds a row in three steps into its first remaining line in method order only', () => {
    let draft = addRow(blank(), { rowId: 'milk', libraryId: 'wholeMilk' });
    draft = addStep(draft);
    draft = addStep(draft, { afterN: 1 });
    draft = addStep(draft, { afterN: 2 });
    // Tick in the order 3, 2, 1 so row.portions[0] is step 3, not the first step in method order.
    for (const n of [3, 2, 1]) draft = toggleStepUses(draft, n, 'milk');
    draft = setLineGrams(setLineGrams(setLineGrams(draft, 'milk', 3, '7'), 'milk', 2, '20'), 'milk', 1, '10');
    expect(draft.rows[0].portions[0].step).toBe(3);
    const next = removeStep(draft, 2);
    expect(rowLines(next, 'milk')).toEqual([
      { step: 1, grams: '30' },
      { step: 3, grams: '7' },
    ]);
    expect(checkAllocation(next)).toBeNull();
  });

  it('folds into the step now first in method order after steps were moved, never into the first portion', () => {
    let draft = addRow(blank(), { rowId: 'milk', libraryId: 'wholeMilk' });
    draft = addStep(draft);
    draft = addStep(draft, { afterN: 1 });
    draft = addStep(draft, { afterN: 2 }); // method [1, 2, 3]
    for (const n of [1, 3, 2]) draft = toggleStepUses(draft, n, 'milk'); // portions [1, 3, 2]
    draft = setLineGrams(setLineGrams(setLineGrams(draft, 'milk', 1, '9'), 'milk', 3, '1'), 'milk', 2, '5');
    draft = moveStep(moveStep(draft, 3, 'up'), 3, 'up'); // method [3, 1, 2]
    expect(draft.method.map((step) => step.n)).toEqual([3, 1, 2]);
    const next = removeStep(draft, 2); // remaining in method order: 3, 1
    expect(rowLines(next, 'milk')).toEqual([
      { step: 3, grams: '6' },
      { step: 1, grams: '9' },
    ]);
    expect(checkAllocation(next)).toBeNull();
  });

  it('never hands out a removed key again, and removing it twice throws', () => {
    const draft = removeStep(addStep(addStep(blank()), { afterN: 1 }), 2);
    expect(addStep(draft).method[0].n).toBe(3);
    expect(() => removeStep(draft, 2)).toThrow(RangeError);
    expect(() => removeStep(draft, 99)).toThrow(RangeError);
  });

  it('keeps no typed text when a line holds an unreadable amount: both texts stay', () => {
    let draft = milkInTwoSteps();
    draft = setLineGrams(draft, 'milk', 1, '4.');
    const next = removeStep(draft, 2);
    expect(next.rows[0].portions).toEqual([{ step: 1, grams: '4. + 200' }]);
    expect(checkAllocation(next)).toBeNull();
  });
});

describe('moveStep (STRUCT-03)', () => {
  const threeSteps = () => addStep(addStep(addStep(blank()), { afterN: 1 }), { afterN: 2 });

  it('swaps neighbouring live steps and changes no key', () => {
    const draft = threeSteps();
    expect(draft.method.map((step) => step.n)).toEqual([1, 2, 3]);
    expect(moveStep(draft, 1, 'down').method.map((step) => step.n)).toEqual([2, 1, 3]);
    expect(moveStep(draft, 3, 'up').method.map((step) => step.n)).toEqual([1, 3, 2]);
  });

  it('throws at either end and for a step that is not live', () => {
    const draft = threeSteps();
    expect(() => moveStep(draft, 1, 'up')).toThrow(RangeError);
    expect(() => moveStep(draft, 3, 'down')).toThrow(RangeError);
    expect(() => moveStep(draft, 99, 'up')).toThrow(RangeError);
    expect(() => moveStep(draft, 1, 'sideways')).toThrow(TypeError);
  });

  it('steps over a tombstone when finding the neighbour', () => {
    const draft = removeStep(threeSteps(), 2);
    expect(liveSteps(moveStep(draft, 3, 'up')).map((step) => step.n)).toEqual([3, 1]);
    expect(liveSteps(moveStep(draft, 1, 'down')).map((step) => step.n)).toEqual([3, 1]);
    expect(moveStep(draft, 3, 'up').method.some((step) => step.n === 2 && step.removed)).toBe(true);
    expect(() => moveStep(draft, 2, 'up')).toThrow(RangeError);
  });
});

describe('moveRow (STRUCT-02, roadmap decision 9; each step orders its own rows)', () => {
  function three() {
    let draft = ['A', 'B', 'C'].reduce((acc, id) => addRow(acc, { rowId: id, libraryId: 'sucrose' }), blank());
    draft = addStep(draft);
    for (const id of ['A', 'B', 'C']) draft = toggleStepUses(draft, 1, id);
    return draft;
  }

  it('swaps with the neighbour in the step uses and leaves draft.rows alone', () => {
    const draft = three();
    const next = moveRow(draft, 'B', 1, 'up');
    expect(next.method[0].uses).toEqual(['B', 'A', 'C']);
    expect(next.rows).toEqual(draft.rows);
    expect(moveRow(draft, 'B', 1, 'down').method[0].uses).toEqual(['A', 'C', 'B']);
  });

  it('throws at the ends of the group and for a row that is not in it', () => {
    const draft = three();
    expect(() => moveRow(draft, 'A', 1, 'up')).toThrow(RangeError);
    expect(() => moveRow(draft, 'C', 1, 'down')).toThrow(RangeError);
    expect(() => moveRow(draft, 'A', UNPLACED_STEP, 'down')).toThrow(RangeError);
    expect(() => moveRow(draft, 'A', 99, 'down')).toThrow(RangeError);
    expect(() => moveRow(draft, 'ghost', 1, 'down')).toThrow(RangeError);
  });

  it('moves two rows split across the same two steps independently in each step', () => {
    let draft = ['A', 'B'].reduce((acc, id) => addRow(acc, { rowId: id, libraryId: 'sucrose' }), blank());
    draft = addStep(addStep(draft), { afterN: 1 });
    for (const n of [1, 2]) for (const id of ['A', 'B']) draft = toggleStepUses(draft, n, id);
    const next = moveRow(draft, 'B', 1, 'up');
    expect(groupRows(next, 1)).toEqual(['B', 'A']);
    expect(groupRows(next, 2)).toEqual(['A', 'B']);
    expect(rowIdsOf(next)).toEqual(['A', 'B']);
    expect(next.method[1]).toEqual(draft.method[1]);
    expect(next.rows[0].portions).toHaveLength(2);
    expect(checkAllocation(next)).toBeNull();
  });

  it('swaps within the unplaced rows of draft.rows, stepping over the placed ones', () => {
    let draft = ['A', 'B', 'C'].reduce((acc, id) => addRow(acc, { rowId: id, libraryId: 'sucrose' }), blank());
    draft = toggleStepUses(addStep(draft), 1, 'B');
    expect(groupRows(draft, UNPLACED_STEP)).toEqual(['A', 'C']);
    const next = moveRow(draft, 'C', UNPLACED_STEP, 'up');
    expect(rowIdsOf(next)).toEqual(['C', 'B', 'A']);
    expect(groupRows(next, UNPLACED_STEP)).toEqual(['C', 'A']);
    expect(() => moveRow(draft, 'A', UNPLACED_STEP, 'up')).toThrow(RangeError);
  });
});

describe('placeRow (decision 014 1)', () => {
  it('ticks an unplaced row into a step as its last row with its grams, leaving draft.rows as it was', () => {
    let draft = ['A', 'B'].reduce((acc, id) => addRow(acc, { rowId: id, libraryId: 'sucrose' }), blank());
    draft = setRowGrams(draft, 'B', '30');
    draft = toggleStepUses(addStep(addStep(draft), { afterN: 1 }), 2, 'A');
    const next = placeRow(draft, 'B', 2);
    expect(next.method[1].uses).toEqual(['A', 'B']);
    expect(next.rows.map((row) => row.portions)).toEqual([[{ step: 2, grams: '' }], [{ step: 2, grams: '30' }]]);
    expect(rowIdsOf(next)).toEqual(['A', 'B']);
    expect(checkAllocation(next)).toBeNull();
  });

  it('throws for a placed row, an unknown row and a step that is not live', () => {
    const draft = toggleStepUses(addStep(addRow(blank(), { rowId: 'A', libraryId: 'sucrose' })), 1, 'A');
    expect(() => placeRow(draft, 'A', 1)).toThrow(RangeError);
    expect(() => placeRow(draft, 'ghost', 1)).toThrow(RangeError);
    const loose = addStep(addRow(blank(), { rowId: 'A', libraryId: 'sucrose' }));
    expect(() => placeRow(loose, 'A', 9)).toThrow(RangeError);
  });
});

describe('toggleStepUses beyond the tracer', () => {
  it('ticking a placed row into a second step adds a blank line and puts the row last in that step', () => {
    let draft = ['A', 'B'].reduce((acc, id) => addRow(acc, { rowId: id, libraryId: 'sucrose' }), blank());
    draft = addStep(addStep(draft), { afterN: 1 });
    draft = toggleStepUses(draft, 2, 'B');
    draft = setLineGrams(toggleStepUses(draft, 1, 'A'), 'A', 1, '80');
    const next = toggleStepUses(draft, 2, 'A');
    expect(next.method[1].uses).toEqual(['B', 'A']);
    expect(rowLines(next, 'A')).toEqual([
      { step: 1, grams: '80' },
      { step: 2, grams: '' },
    ]);
    expect(checkAllocation(next)).toBeNull();
  });

  it('unticking one of two lines folds its grams into the remaining line', () => {
    const next = toggleStepUses(milkInTwoSteps(), 1, 'milk');
    expect(next.rows[0].portions).toEqual([{ step: 2, grams: '600' }]);
    expect(next.method[0].uses).toEqual([]);
    expect(placementOf(next, 'milk')).toEqual([2]);
    expect(checkAllocation(next)).toBeNull();
  });

  it('throws for a step that is not live and for an unknown row', () => {
    const draft = milkInTwoSteps();
    expect(() => toggleStepUses(draft, 99, 'milk')).toThrow(RangeError);
    expect(() => toggleStepUses(draft, 1, 'ghost')).toThrow(RangeError);
    expect(() => toggleStepUses(removeStep(draft, 2), 2, 'milk')).toThrow(RangeError);
  });
});

describe('setLineGrams', () => {
  it('sets one line of a split row and the placeholder of an unplaced row', () => {
    const draft = milkInTwoSteps();
    expect(rowLines(setLineGrams(draft, 'milk', 2, '120'), 'milk')).toEqual([
      { step: 1, grams: '400' },
      { step: 2, grams: '120' },
    ]);
    const loose = addRow(blank(), { rowId: 'A', libraryId: 'sucrose' });
    expect(rowLines(setLineGrams(loose, 'A', UNPLACED_STEP, '5'), 'A')).toEqual([{ step: UNPLACED_STEP, grams: '5' }]);
  });

  it('throws for a line the row does not have', () => {
    const draft = milkInTwoSteps();
    expect(() => setLineGrams(draft, 'milk', 3, '1')).toThrow(RangeError);
    expect(() => setLineGrams(draft, 'milk', UNPLACED_STEP, '1')).toThrow(RangeError);
    expect(() => setLineGrams(draft, 'ghost', 1, '1')).toThrow(RangeError);
  });
});

describe('addGrams: the one fold policy', () => {
  it.each([
    ['400', '200', '600'],
    ['0.1', '0.2', '0.3'],
    ['4.5', '0.25', '4.75'],
    ['', '200', '200'],
    ['400', '', '400'],
    ['', '', ''],
    ['4.', '200', '4. + 200'],
    ['200', '4.', '200 + 4.'],
    ['200', 'abc', '200 + abc'],
    ['007', '1', '8'],
    ['0.50', '0.50', '1'],
    ['35184372088832.02', '0.01', '35184372088832.03'],
    ['0.01', '35184372088832.02', '35184372088832.03'],
    ['90071992547409.90', '0.01', '90071992547409.91'],
    ['90071992547409.91', '0.01', '90071992547409.91 + 0.01'],
    ['0.01', '90071992547409.91', '0.01 + 90071992547409.91'],
  ])('addGrams(%j, %j) is %j', (kept, folded, expected) => {
    expect(addGrams(kept, folded)).toBe(expected);
  });

  it('keeps both texts for two 309-digit amounts, which read as Infinity', () => {
    const huge = '9'.repeat(309);
    expect(addGrams(huge, huge)).toBe(`${huge} + ${huge}`);
  });
});

describe('targets and fields', () => {
  const stepped = () => addStep(blank());

  it('adds, edits by side and removes a target by index', () => {
    let draft = addTarget(addTarget(stepped(), 1), 1);
    draft = setTarget(setTarget(draft, 1, 0, 'label', 'temp'), 1, 0, 'value', '4');
    expect(draft.method[0].targets).toEqual([
      { label: 'temp', value: '4' },
      { label: '', value: '' },
    ]);
    expect(removeTarget(draft, 1, 0).method[0].targets).toEqual([{ label: '', value: '' }]);
    expect(() => setTarget(draft, 1, 5, 'label', 'x')).toThrow(RangeError);
    expect(() => setTarget(draft, 1, 0, 'colour', 'x')).toThrow(TypeError);
    expect(() => removeTarget(draft, 1, -1)).toThrow(RangeError);
    expect(() => addTarget(draft, 9)).toThrow(RangeError);
  });

  it('sets leadIn, instruction, purpose and aside and refuses any other field', () => {
    let draft = stepped();
    for (const field of ['leadIn', 'instruction', 'purpose', 'aside']) draft = setStepField(draft, 1, field, `${field} text`);
    expect(draft.method[0]).toMatchObject({ leadIn: 'leadIn text', instruction: 'instruction text', purpose: 'purpose text', aside: 'aside text' });
    expect(() => setStepField(draft, 1, 'n', 5)).toThrow(TypeError);
    expect(() => setStepField(draft, 1, 'uses', [])).toThrow(TypeError);
    expect(() => setStepField(draft, 9, 'leadIn', 'x')).toThrow(RangeError);
  });
});

describe('normalizeAllocation (a restored kept draft is repaired, never projected away)', () => {
  const oneRowTwoSteps = () =>
    toggleStepUses(addStep(addStep(addRow(blank(), { rowId: 'A', libraryId: 'sucrose' })), { afterN: 1 }), 1, 'A');

  it('folds a portion at a step the row is not in into its first placed line with addGrams', () => {
    let draft = oneRowTwoSteps();
    draft = { ...draft, rows: [{ ...draft.rows[0], portions: [{ step: 1, grams: '400' }, { step: 2, grams: '200' }] }] };
    expect(checkAllocation(draft)).not.toBeNull();
    const fixed = normalizeAllocation(draft);
    expect(fixed.rows[0].portions).toEqual([{ step: 1, grams: '600' }]);
    expect(checkAllocation(fixed)).toBeNull();
  });

  it('prunes a uses id with no row, cuts a repeated id to its first mention and empties a removed step', () => {
    const draft = oneRowTwoSteps();
    draft.method[0].uses = ['ghost', 'A', 'A'];
    draft.method[1] = { ...draft.method[1], uses: ['A'], removed: true };
    const fixed = normalizeAllocation(draft);
    expect(fixed.method[0].uses).toEqual(['A']);
    expect(fixed.method[1].uses).toEqual([]);
    expect(checkAllocation(fixed)).toBeNull();
  });

  it('gives a placed row with no portion at its step a blank line', () => {
    const draft = addStep(addStep(addRow(blank(), { rowId: 'A', libraryId: 'sucrose' })), { afterN: 1 });
    draft.method[1].uses = ['A'];
    const fixed = normalizeAllocation(draft);
    expect(rowLines(fixed, 'A')).toEqual([{ step: 2, grams: '' }]);
    expect(fixed.rows[0].portions).toEqual([{ step: 2, grams: '' }]);
    expect(checkAllocation(fixed)).toBeNull();
  });

  it('folds an unplaced row with two portions into one placeholder, and duplicate portion steps together', () => {
    let draft = addRow(blank(), { rowId: 'A', libraryId: 'sucrose' });
    draft = { ...draft, rows: [{ ...draft.rows[0], portions: [{ step: 1, grams: '5' }, { step: 3, grams: '6' }] }] };
    expect(normalizeAllocation(draft).rows[0].portions).toEqual([{ step: 1, grams: '11' }]);
    const placed = toggleStepUses(addStep(addRow(blank(), { rowId: 'A', libraryId: 'sucrose' })), 1, 'A');
    placed.rows[0] = { ...placed.rows[0], portions: [{ step: 1, grams: '2' }, { step: 1, grams: '3' }] };
    expect(normalizeAllocation(placed).rows[0].portions).toEqual([{ step: 1, grams: '5' }]);
  });

  it('comes back as the same object when checkAllocation already accepts the draft', () => {
    const draft = milkInTwoSteps();
    expect(checkAllocation(draft)).toBeNull();
    expect(normalizeAllocation(draft)).toBe(draft);
  });

  it('gives a draft draftMatchesCreate still accepts', () => {
    const fixed = normalizeAllocation(removeStep(milkInTwoSteps(), 2));
    const record = buildDraftRecord({ versionId: 'v1', kind: 'create', payload: fixed, now: '2026-10-26T08:00:00.000Z' });
    expect(draftMatchesCreate(record)).toBe(true);
  });
});

describe('removeRow with steps (STRUCT-01)', () => {
  it('leaves checkAllocation null and no dangling reference', () => {
    const next = removeRow(milkInTwoSteps(), 'milk');
    expect(next.rows).toEqual([]);
    expect(next.method.map((step) => step.uses)).toEqual([[], []]);
    expect(checkAllocation(next)).toBeNull();
  });
});

describe('step keys within one editing session (decide-p11-step-key-reuse)', () => {
  it('remove then add never repeats a key within one draft', () => {
    let draft = removeStep(addStep(addStep(blank()), { afterN: 1 }), 2);
    const issued = [];
    for (let i = 0; i < 4; i += 1) {
      draft = addStep(draft);
      issued.push(draft.method[0].n);
      draft = removeStep(draft, draft.method[0].n);
    }
    expect(issued).toEqual([3, 4, 5, 6]);
  });

  it('a saved method without its tombstones can issue a key removed before that Save, which nothing references', () => {
    const draft = removeStep(addStep(addStep(blank()), { afterN: 1 }), 2);
    expect(nextStepKey(draft.method)).toBe(3);
    expect(nextStepKey(liveSteps(draft))).toBe(2);
  });
});

describe('ops never mutate their argument', () => {
  it('runs a chain of ops over a deep-frozen draft without throwing and leaves it equal to its clone', () => {
    const draft = milkInTwoSteps();
    const before = structuredClone(draft);
    deepFreeze(draft);
    let next = addTarget(draft, 1);
    next = setTarget(next, 1, 0, 'label', 'x');
    next = setStepField(next, 1, 'purpose', 'why');
    next = moveStep(next, 1, 'down');
    next = removeStep(next, 2);
    next = normalizeAllocation(next);
    expect(draft).toEqual(before);
    expect(checkAllocation(next)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// The invariant and conservation property over seeded random ops.
// ---------------------------------------------------------------------------

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickFrom(rand, list) {
  return list[Math.floor(rand() * list.length)];
}

// The oracle: column addition over decimal digit strings in hundredths. It uses
// no Number and no BigInt, so it never shares addGrams' arithmetic.
const READABLE = /^\d+(\.\d{1,2})?$/;
const SAFE_HUNDREDTHS = '9007199254740991';

function hundredthDigits(text) {
  const [whole, fraction = ''] = text.split('.');
  return (whole + fraction.padEnd(2, '0')).replace(/^0+/, '') || '0';
}

function addDigitStrings(a, b) {
  let i = a.length - 1;
  let j = b.length - 1;
  let carry = 0;
  let out = '';
  while (i >= 0 || j >= 0 || carry > 0) {
    const column = (i >= 0 ? a.charCodeAt(i) - 48 : 0) + (j >= 0 ? b.charCodeAt(j) - 48 : 0) + carry;
    out = String(column % 10) + out;
    carry = column >= 10 ? 1 : 0;
    i -= 1;
    j -= 1;
  }
  return out.replace(/^0+/, '') || '0';
}

function decimalSum(texts) {
  return texts.filter((text) => READABLE.test(text)).map(hundredthDigits).reduce(addDigitStrings, '0');
}

function exceedsSafe(digitString) {
  return (
    digitString.length > SAFE_HUNDREDTHS.length ||
    (digitString.length === SAFE_HUNDREDTHS.length && digitString > SAFE_HUNDREDTHS)
  );
}

// What a row holds, as text: every non-blank token of every line, a joined line
// split on ' + '. The conserved quantity is the readable tokens' sum plus the
// multiset of the unreadable ones.
function summaryOf(texts) {
  const tokens = texts.flatMap((text) => text.split(' + ')).filter((token) => token.trim() !== '');
  return { sum: decimalSum(tokens), unreadable: tokens.filter((token) => !READABLE.test(token)).sort() };
}

const lineSummary = (draft, rowId) => summaryOf(rowLines(draft, rowId).map((line) => line.grams));
const portionSummary = (row) => summaryOf(row.portions.map((portion) => portion.grams));

function digits(rand, count) {
  let out = String(1 + Math.floor(rand() * 9));
  for (let i = 1; i < count; i += 1) out += String(Math.floor(rand() * 10));
  return out;
}

const SMALL_AMOUNTS = ['', '0', '5', '12.5', '0.25', '400', '007', '4.', 'abc', '1.234', '0.1', '0.2', '33.33'];

function smallAmount(rand) {
  return pickFrom(rand, SMALL_AMOUNTS);
}

function nearLimitAmount(rand) {
  if (rand() < 0.15) return smallAmount(rand);
  const whole = digits(rand, rand() < 0.5 ? 13 : 14);
  return rand() < 0.7 ? `${whole}.${digits(rand, 2)}` : whole;
}

function corrupt(rand, draft, amount) {
  const bad = structuredClone(draft);
  const live = liveSteps(bad);
  const row = pickFrom(rand, bad.rows);
  const roll = Math.floor(rand() * 6);
  if (roll === 0) row.portions.push({ step: 90 + Math.floor(rand() * 5), grams: amount });
  else if (roll === 1 && row.portions.length > 0) row.portions.splice(Math.floor(rand() * row.portions.length), 1);
  else if (roll === 2 && live.length > 0) {
    const step = pickFrom(rand, live);
    step.uses = [...(step.uses ?? []), 'ghost'];
  } else if (roll === 3 && live.length > 0) {
    const step = pickFrom(rand, live);
    step.uses = [...(step.uses ?? []), ...(step.uses ?? []).slice(0, 1)];
  } else if (roll === 4 && row.portions.length > 0) row.portions.push({ step: row.portions[0].step, grams: amount });
  else if (live.length > 0) {
    const step = pickFrom(rand, live);
    step.uses = [...(step.uses ?? []), row.id];
  }
  return bad;
}

function runRandomOps(seed, nextAmount) {
  const rand = mulberry32(seed);
  const pick = (list) => pickFrom(rand, list);
  let nextRow = 5;
  let draft = blank();
  for (let i = 1; i <= 4; i += 1) draft = setRowGrams(addRow(draft, { rowId: `r${i}`, libraryId: 'sucrose' }), `r${i}`, nextAmount(rand));
  const issued = new Set();
  const kinds = ['addStep', 'removeStep', 'moveStep', 'toggle', 'toggle', 'toggle', 'place', 'moveRow', 'setLine', 'setLine', 'removeRow', 'addRow'];
  let applied = 0;

  for (let turn = 0; turn < 500; turn += 1) {
    const live = liveSteps(draft);
    const ids = rowIdsOf(draft);
    const before = draft;
    let next = null;
    let skipRow = null;
    let movedIn = null;
    let addedKey = null;

    switch (pick(kinds)) {
      case 'addStep':
        next = addStep(draft, { afterN: live.length === 0 || rand() < 0.4 ? null : pick(live).n });
        addedKey = next.method.map((s) => s.n).find((n) => !before.method.some((s) => s.n === n));
        break;
      case 'removeStep':
        if (live.length > 0) next = removeStep(draft, pick(live).n);
        break;
      case 'moveStep': {
        if (live.length < 2) break;
        const target = pick(live);
        const at = live.indexOf(target);
        const direction = at === 0 ? 'down' : at === live.length - 1 ? 'up' : pick(['up', 'down']);
        next = moveStep(draft, target.n, direction);
        break;
      }
      case 'toggle':
        if (live.length > 0 && ids.length > 0) next = toggleStepUses(draft, pick(live).n, pick(ids));
        break;
      case 'place': {
        const loose = groupRows(draft, UNPLACED_STEP);
        if (live.length > 0 && loose.length > 0) next = placeRow(draft, pick(loose), pick(live).n);
        break;
      }
      case 'moveRow': {
        const groups = [UNPLACED_STEP, ...live.map((s) => s.n)].filter((group) => groupRows(draft, group).length >= 2);
        if (groups.length === 0) break;
        const group = pick(groups);
        const members = groupRows(draft, group);
        const at = Math.floor(rand() * members.length);
        const direction = at === 0 ? 'down' : at === members.length - 1 ? 'up' : pick(['up', 'down']);
        next = moveRow(draft, members[at], group, direction);
        movedIn = group;
        break;
      }
      case 'setLine': {
        if (ids.length === 0) break;
        const rowId = pick(ids);
        const line = pick(rowLines(draft, rowId));
        next = setLineGrams(draft, rowId, line.step, nextAmount(rand));
        skipRow = rowId;
        break;
      }
      case 'removeRow':
        if (ids.length > 2) {
          skipRow = pick(ids);
          next = removeRow(draft, skipRow);
        }
        break;
      case 'addRow':
        if (ids.length < 6) {
          next = setRowGrams(addRow(draft, { rowId: `r${nextRow}`, libraryId: 'sucrose' }), `r${nextRow}`, nextAmount(rand));
          nextRow += 1;
        }
        break;
      default:
    }
    if (next === null) continue;
    applied += 1;
    draft = next;

    expect(checkAllocation(draft)).toBeNull();
    expect(normalizeAllocation(draft)).toBe(draft);

    // Keys: never changed, never handed out twice, never dropped.
    const keysBefore = before.method.map((s) => s.n);
    const keysAfter = draft.method.map((s) => s.n);
    for (const n of keysBefore) issued.add(n);
    if (addedKey !== null && addedKey !== undefined) {
      expect(issued.has(addedKey)).toBe(false);
      issued.add(addedKey);
    }
    expect(new Set(keysAfter).size).toBe(keysAfter.length);
    for (const n of issued) expect(keysAfter).toContain(n);

    // Grams: every surviving row keeps what it held, except the row the op rewrote or removed.
    for (const id of rowIdsOf(before)) {
      if (id === skipRow || !rowIdsOf(draft).includes(id)) continue;
      expect(lineSummary(draft, id)).toEqual(lineSummary(before, id));
    }

    // moveRow in a step touches that step's uses and nothing else; draft.rows is unchanged.
    if (movedIn !== null && movedIn !== UNPLACED_STEP) {
      expect(draft.rows).toEqual(before.rows);
      for (const s of draft.method) {
        if (s.n !== movedIn) expect(s).toEqual(before.method.find((old) => old.n === s.n));
      }
    }

    // A joined line of readable tokens is only ever the safe-integer limit's doing.
    for (const id of rowIdsOf(draft)) {
      for (const line of rowLines(draft, id)) {
        const tokens = line.grams.split(' + ');
        if (tokens.length > 1 && tokens.every((token) => READABLE.test(token))) {
          expect(exceedsSafe(decimalSum(tokens))).toBe(true);
        }
      }
    }

    // Every 25th op, corrupt a copy: normalizeAllocation repairs it and loses no typed text.
    if (applied % 25 === 0 && draft.rows.length > 0) {
      const bad = corrupt(rand, draft, nextAmount(rand));
      const fixed = normalizeAllocation(bad);
      expect(checkAllocation(fixed)).toBeNull();
      for (const row of bad.rows) {
        expect(portionSummary(fixed.rows.find((candidate) => candidate.id === row.id))).toEqual(portionSummary(row));
      }
    }
  }
  expect(applied).toBeGreaterThan(250);
}

describe('seeded random ops keep every invariant (T-11-06, T-11-44)', () => {
  it.each([1, 2, 3, 4, 5, 6])('500 ops from seed %i with small, unreadable and blank amounts', (seed) => {
    runRandomOps(seed, smallAmount);
  });

  it.each([11, 12, 13, 14])('500 ops from seed %i with amounts near the safe-integer limit', (seed) => {
    runRandomOps(seed, nearLimitAmount);
  });
});
